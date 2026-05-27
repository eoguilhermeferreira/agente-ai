const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../config/prisma');
const evolutionService = require('../services/evolutionService');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      companyId: req.companyId,
      ...(status ? { status } : {}),
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({ conversations, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const limit = parseInt(req.query.limit || '50');

    // Fetch the LAST N messages (most recent) by ordering desc, then reverse
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    messages.reverse();

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadCount: 0 },
    });

    res.json({ messages, conversation });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const { message } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { instance: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const settings = await prisma.settings.findUnique({
      where: { companyId: req.companyId },
    });

    const sent = await evolutionService.sendMessage({
      instanceName: conversation.instance.instanceName,
      settings: settings || {},
      remoteJid: conversation.remoteJid,
      message,
    });

    const savedMessage = await prisma.message.create({
      data: {
        content: message,
        fromMe: true,
        conversationId: conversation.id,
        type: 'TEXT',
        status: sent ? 'SENT' : 'FAILED',
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: message, lastMessageAt: new Date() },
    });

    if (global.io) {
      global.io.to(`conv-${conversation.id}`).emit('message', {
        content: message,
        fromMe: true,
        createdAt: new Date(),
      });
    }

    res.json({ message: savedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

router.patch('/:id/toggle-ai', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { aiEnabled: !conversation.aiEnabled },
    });

    res.json({ aiEnabled: updated.aiEnabled });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar IA' });
  }
});

router.patch('/:id/resolve', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'OPEN' },
    });

    if (global.io) {
      global.io.to(`company-${req.companyId}`).emit('human-resolved', {
        conversationId: conversation.id,
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resolver conversa' });
  }
});

module.exports = router;
