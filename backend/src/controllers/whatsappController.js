const axios = require('axios');
const prisma = require('../config/prisma');

const getEvolutionConfig = (settings) => {
  const url = settings?.evolutionApiUrl || process.env.EVOLUTION_API_URL;
  const key = settings?.evolutionApiKey || process.env.EVOLUTION_API_KEY;
  return { url, key };
};

const getEvolutionClient = (settings) => {
  const { url, key } = getEvolutionConfig(settings);
  return axios.create({
    baseURL: url,
    headers: { apikey: key, 'Content-Type': 'application/json' },
    timeout: 30000,
  });
};

const getInstance = async (req, res) => {
  try {
    const instance = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });
    res.json({ instance: instance || null });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instância' });
  }
};

const createInstance = async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const { url, key } = getEvolutionConfig(settings);

    if (!url || !key) {
      return res.status(400).json({
        error: 'Evolution API não configurada. Vá em Configurações → Integrações e preencha a URL e chave da Evolution API.',
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
    });

    const instanceName = `chatnex-${company.slug}`;
    const evolutionClient = getEvolutionClient(settings);
    const webhookUrl = `${process.env.BACKEND_URL}/api/webhook/evolution`;

    let qrCode = null;
    let instanceKey = null;
    let evolutionError = null;

    try {
      // Tenta deletar instância antiga se existir
      try {
        await evolutionClient.delete(`/instance/delete/${instanceName}`);
        await new Promise(r => setTimeout(r, 1000));
      } catch (_) {}

      const evolutionResponse = await evolutionClient.post('/instance/create', {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhook: {
          url: webhookUrl,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        },
      });

      qrCode = evolutionResponse.data?.qrcode?.base64 || null;
      instanceKey = evolutionResponse.data?.hash?.apikey || null;

      // Se não veio QR na criação, tenta buscar
      if (!qrCode) {
        try {
          const connectRes = await evolutionClient.get(`/instance/connect/${instanceName}`);
          qrCode = connectRes.data?.base64 || connectRes.data?.qrcode?.base64 || null;
        } catch (e) {
          console.error('Erro ao buscar QR após criação:', e.message);
        }
      }
    } catch (apiError) {
      evolutionError = apiError.response?.data?.message || apiError.message;
      console.error('Evolution API error:', evolutionError);
    }

    const existing = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    const instanceData = {
      instanceName,
      status: 'QR_CODE',
      qrCode,
      instanceKey,
      webhookUrl,
    };

    const instance = existing
      ? await prisma.whatsappInstance.update({ where: { id: existing.id }, data: instanceData })
      : await prisma.whatsappInstance.create({ data: { ...instanceData, companyId: req.companyId } });

    if (global.io) {
      global.io.to(`company-${req.companyId}`).emit('instance-update', {
        status: instance.status,
        qrCode: instance.qrCode,
      });
    }

    res.json({
      instance,
      evolutionError: evolutionError || null,
    });
  } catch (error) {
    console.error('Erro ao criar instância:', error);
    res.status(500).json({ error: 'Erro ao criar instância WhatsApp' });
  }
};

const getQrCode = async (req, res) => {
  try {
    const instance = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const { url, key } = getEvolutionConfig(settings);

    if (!url || !key) {
      return res.status(400).json({
        error: 'Evolution API não configurada. Vá em Configurações → Integrações.',
      });
    }

    const evolutionClient = getEvolutionClient(settings);

    try {
      const response = await evolutionClient.get(`/instance/connect/${instance.instanceName}`);
      console.log('Evolution connect response:', JSON.stringify(response.data).slice(0, 200));

      const qrCode =
        response.data?.base64 ||
        response.data?.qrcode?.base64 ||
        response.data?.code ||
        null;

      if (qrCode) {
        await prisma.whatsappInstance.update({
          where: { id: instance.id },
          data: { qrCode, status: 'QR_CODE' },
        });

        if (global.io) {
          global.io.to(`company-${req.companyId}`).emit('qr-updated', { qrCode });
        }

        return res.json({ qrCode });
      }

      return res.json({ qrCode: instance.qrCode || null });
    } catch (apiError) {
      const errData = apiError.response?.data;
      const errMsg = errData?.message || errData?.error || apiError.message;
      console.error('Evolution connect error:', errMsg, '| Full:', JSON.stringify(errData));
      return res.status(502).json({
        error: `Erro ao conectar na Evolution API: ${errMsg}`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar QR Code' });
  }
};

const disconnectInstance = async (req, res) => {
  try {
    const instance = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const evolutionClient = getEvolutionClient(settings || {});

    try {
      await evolutionClient.delete(`/instance/logout/${instance.instanceName}`);
    } catch (apiError) {
      console.error('Evolution disconnect error:', apiError.message);
    }

    await prisma.whatsappInstance.update({
      where: { id: instance.id },
      data: { status: 'DISCONNECTED', qrCode: null },
    });

    if (global.io) {
      global.io.to(`company-${req.companyId}`).emit('instance-update', { status: 'DISCONNECTED' });
    }

    res.json({ message: 'WhatsApp desconectado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desconectar WhatsApp' });
  }
};

const getStatus = async (req, res) => {
  try {
    const instance = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    if (!instance) {
      return res.json({ status: 'DISCONNECTED', connected: false });
    }

    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const evolutionClient = getEvolutionClient(settings || {});

    try {
      const response = await evolutionClient.get(`/instance/connectionState/${instance.instanceName}`);
      const state = response.data?.instance?.state;
      let status = 'DISCONNECTED';
      if (state === 'open') status = 'CONNECTED';
      else if (state === 'connecting') status = 'CONNECTING';

      if (status !== instance.status) {
        await prisma.whatsappInstance.update({ where: { id: instance.id }, data: { status } });
      }

      return res.json({ status, connected: status === 'CONNECTED' });
    } catch {
      return res.json({ status: instance.status, connected: instance.status === 'CONNECTED' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

module.exports = { getInstance, createInstance, getQrCode, disconnectInstance, getStatus };
