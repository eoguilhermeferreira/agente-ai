const axios = require('axios');
const prisma = require('../config/prisma');

const getEvolutionClient = (settings) => {
  const baseURL = settings.evolutionApiUrl || process.env.EVOLUTION_API_URL;
  const apiKey = settings.evolutionApiKey || process.env.EVOLUTION_API_KEY;

  return axios.create({
    baseURL,
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

const getInstance = async (req, res) => {
  try {
    const instance = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    if (!instance) {
      return res.json({ instance: null });
    }

    res.json({ instance });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instância' });
  }
};

const createInstance = async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
    });

    const instanceName = `chatnex-${company.slug}`;
    const evolutionClient = getEvolutionClient(settings || {});
    const webhookUrl = `${process.env.BACKEND_URL}/api/webhook/evolution`;

    let evolutionResponse;
    try {
      evolutionResponse = await evolutionClient.post('/instance/create', {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhook: {
          url: webhookUrl,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        },
      });
    } catch (apiError) {
      console.error('Evolution API error:', apiError.response?.data || apiError.message);
    }

    const existing = await prisma.whatsappInstance.findFirst({
      where: { companyId: req.companyId },
    });

    let instance;
    if (existing) {
      instance = await prisma.whatsappInstance.update({
        where: { id: existing.id },
        data: {
          instanceName,
          status: 'QR_CODE',
          qrCode: evolutionResponse?.data?.qrcode?.base64 || null,
          instanceKey: evolutionResponse?.data?.hash?.apikey || null,
          webhookUrl,
        },
      });
    } else {
      instance = await prisma.whatsappInstance.create({
        data: {
          instanceName,
          companyId: req.companyId,
          status: 'QR_CODE',
          qrCode: evolutionResponse?.data?.qrcode?.base64 || null,
          instanceKey: evolutionResponse?.data?.hash?.apikey || null,
          webhookUrl,
        },
      });
    }

    if (global.io) {
      global.io.to(`company-${req.companyId}`).emit('instance-update', {
        status: instance.status,
        qrCode: instance.qrCode,
      });
    }

    res.json({ instance });
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

    const evolutionClient = getEvolutionClient(settings || {});

    try {
      const response = await evolutionClient.get(
        `/instance/connect/${instance.instanceName}`
      );

      const qrCode = response.data?.base64 || response.data?.qrcode?.base64;

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
    } catch (apiError) {
      console.error('Evolution connect error:', apiError.response?.data || apiError.message);
    }

    res.json({ qrCode: instance.qrCode, status: instance.status });
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
      global.io.to(`company-${req.companyId}`).emit('instance-update', {
        status: 'DISCONNECTED',
      });
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
      const response = await evolutionClient.get(
        `/instance/connectionState/${instance.instanceName}`
      );

      const state = response.data?.instance?.state;
      let status = 'DISCONNECTED';

      if (state === 'open') status = 'CONNECTED';
      else if (state === 'connecting') status = 'CONNECTING';
      else if (state === 'close') status = 'DISCONNECTED';

      if (status !== instance.status) {
        await prisma.whatsappInstance.update({
          where: { id: instance.id },
          data: { status },
        });
      }

      return res.json({ status, connected: status === 'CONNECTED' });
    } catch (apiError) {
      return res.json({ status: instance.status, connected: instance.status === 'CONNECTED' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

module.exports = { getInstance, createInstance, getQrCode, disconnectInstance, getStatus };
