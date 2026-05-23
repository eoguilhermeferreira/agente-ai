const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../config/prisma');

router.use(auth);

router.get('/stats', async (req, res) => {
  try {
    const companyId = req.companyId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalConversations,
      openConversations,
      todayMessages,
      totalMessages,
      instance,
      recentConversations,
    ] = await Promise.all([
      prisma.conversation.count({ where: { companyId } }),
      prisma.conversation.count({ where: { companyId, status: 'OPEN' } }),
      prisma.message.count({
        where: {
          conversation: { companyId },
          createdAt: { gte: today },
        },
      }),
      prisma.message.count({
        where: { conversation: { companyId } },
      }),
      prisma.whatsappInstance.findFirst({
        where: { companyId },
        select: { status: true, qrCode: true },
      }),
      prisma.conversation.findMany({
        where: { companyId },
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
        select: {
          id: true,
          clientName: true,
          clientPhone: true,
          lastMessage: true,
          lastMessageAt: true,
          status: true,
          unreadCount: true,
        },
      }),
    ]);

    res.json({
      stats: {
        totalConversations,
        openConversations,
        todayMessages,
        totalMessages,
      },
      whatsapp: {
        status: instance?.status || 'DISCONNECTED',
        connected: instance?.status === 'CONNECTED',
        qrCode: instance?.qrCode || null,
      },
      recentConversations,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

module.exports = router;
