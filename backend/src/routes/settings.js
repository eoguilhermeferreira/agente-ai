const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../config/prisma');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    if (!settings) {
      return res.json({ settings: null });
    }

    const safeSettings = {
      ...settings,
      openaiKey: settings.openaiKey ? '***' + settings.openaiKey.slice(-4) : null,
      evolutionApiKey: settings.evolutionApiKey
        ? '***' + settings.evolutionApiKey.slice(-4)
        : null,
    };

    res.json({ settings: safeSettings });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

router.put('/', async (req, res) => {
  try {
    const {
      openaiKey,
      openaiModel,
      aiEnabled,
      autoReply,
      responseDelay,
      businessName,
      businessHours,
      businessAddress,
      businessPhone,
      systemPrompt,
      products,
      faq,
      aiRules,
      evolutionApiUrl,
      evolutionApiKey,
    } = req.body;

    const existing = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const data = {
      openaiModel,
      aiEnabled,
      autoReply,
      responseDelay,
      businessName,
      businessHours,
      businessAddress,
      businessPhone,
      systemPrompt,
      products,
      faq,
      aiRules,
      evolutionApiUrl,
    };

    if (openaiKey && !openaiKey.startsWith('***')) {
      data.openaiKey = openaiKey;
    }

    if (evolutionApiKey && !evolutionApiKey.startsWith('***')) {
      data.evolutionApiKey = evolutionApiKey;
    }

    const settings = existing
      ? await prisma.settings.update({
          where: { companyId: req.companyId },
          data,
        })
      : await prisma.settings.create({
          data: { ...data, companyId: req.companyId },
        });

    res.json({ settings: { ...settings, openaiKey: settings.openaiKey ? '***' + settings.openaiKey.slice(-4) : null } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

module.exports = router;
