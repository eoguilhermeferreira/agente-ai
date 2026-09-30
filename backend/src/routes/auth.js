const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const prisma = require('../config/prisma');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// TEMPORARY — remove after use
router.get('/diag', async (req, res) => {
  if (req.query.token !== 'nodex2026diag') return res.status(403).json({ error: 'Não autorizado' });
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Informe ?email=' });
  const user = await prisma.user.findUnique({ where: { email }, include: { company: { include: { settings: true, whatsappInstances: true, conversations: { take: 5, orderBy: { lastMessageAt: 'desc' }, select: { id: true, clientPhone: true, aiEnabled: true, status: true, lastMessageAt: true } } } } } });
  if (!user) return res.json({ error: 'Usuário não encontrado' });
  const s = user.company?.settings;
  res.json({
    company: user.company?.name,
    settings: { aiEnabled: s?.aiEnabled, autoReply: s?.autoReply, hasOpenaiKey: !!s?.openaiKey, hasEvolutionUrl: !!s?.evolutionApiUrl, hasEvolutionKey: !!s?.evolutionApiKey, hasWebhookUrl: !!s?.externalWebhookUrl },
    instance: user.company?.whatsappInstances?.[0] ? { name: user.company.whatsappInstances[0].instanceName, status: user.company.whatsappInstances[0].status, webhookUrl: user.company.whatsappInstances[0].webhookUrl } : null,
    recentConversations: user.company?.conversations,
  });
});

module.exports = router;
