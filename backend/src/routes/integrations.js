const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const { sendMessage } = require('../services/evolutionService');
const { generateApiKey } = require('../services/apiKeyService');

// GET /api/integrations/api-key — retorna a API key da empresa (requer login)
router.get('/api-key', authMiddleware, async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Empresa não associada à conta' });
    }
    const apiKey = generateApiKey(companyId);
    res.json({ apiKey });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar API key' });
  }
});

// POST /api/integrations/send-message — envia mensagem via WhatsApp (autenticado por API key)
router.post('/send-message', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.body.apiKey;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key não fornecida. Use o header x-api-key.' });
    }

    // Busca empresa pela API key validando contra todas
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      include: { settings: true, whatsappInstances: true },
    });

    const company = companies.find((c) => generateApiKey(c.id) === apiKey);
    if (!company) {
      return res.status(401).json({ error: 'API key inválida' });
    }

    const { to, message, template } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios: to (número) e message (texto)' });
    }

    // Normaliza o número (remove +, espaços, traços)
    const phone = String(to).replace(/[\s\-\(\)\+]/g, '');

    const connectedInstance = company.whatsappInstances.find(
      (i) => i.status === 'CONNECTED'
    );

    if (!connectedInstance) {
      return res.status(503).json({ error: 'Nenhuma instância WhatsApp conectada para esta empresa' });
    }

    const settings = company.settings;
    if (!settings?.evolutionApiUrl) {
      return res.status(503).json({ error: 'Evolution API não configurada para esta empresa' });
    }

    const sent = await sendMessage({
      instanceName: connectedInstance.instanceName,
      settings,
      remoteJid: `${phone}@s.whatsapp.net`,
      message,
    });

    if (!sent) {
      return res.status(502).json({ error: 'Falha ao enviar mensagem via WhatsApp' });
    }

    res.json({
      success: true,
      to: phone,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Integrations] Erro:', err);
    res.status(500).json({ error: 'Erro interno ao enviar mensagem' });
  }
});

module.exports = router;
