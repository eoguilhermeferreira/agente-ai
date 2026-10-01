const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const prisma = require('../config/prisma');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// TEMPORARY — remove after use
router.get('/sync-status', async (req, res) => {
  if (req.query.token !== 'nodex2026fix') return res.status(403).json({ error: 'Não autorizado' });
  const email = 'estatineto@icloud.com';
  const user = await prisma.user.findUnique({ where: { email }, include: { company: { include: { settings: true, whatsappInstances: true } } } });
  if (!user?.company) return res.json({ error: 'Empresa não encontrada' });
  const companyId = user.company.id;
  const s = user.company.settings;

  // 1. Garantir que AI está ativa nas settings
  await prisma.settings.update({ where: { companyId }, data: { aiEnabled: true, autoReply: true } });

  // 2. Reativar AI em todas as conversas bloqueadas
  const updated = await prisma.conversation.updateMany({
    where: { companyId, aiEnabled: false },
    data: { aiEnabled: true, status: 'OPEN' },
  });

  res.json({
    ok: true,
    company: user.company.name,
    settingsAiEnabled: s?.aiEnabled,
    settingsAutoReply: s?.autoReply,
    hasOpenaiKey: !!s?.openaiKey,
    hasEvolutionUrl: !!s?.evolutionApiUrl,
    instance: user.company.whatsappInstances?.[0]?.status,
    conversationsReactivated: updated.count,
  });
});

module.exports = router;
