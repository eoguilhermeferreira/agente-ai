const prisma = require('../config/prisma');
const aiService = require('../services/aiService');
const evolutionService = require('../services/evolutionService');

// Debounce map: remoteJid -> { timer, contents, conversationId, instanceName, settings, clientName, companyId }
const pendingAI = new Map();

const handleEvolutionWebhook = async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const payload = req.body;
    const event = payload.event;

    console.log(`[Webhook] event="${event}" instance="${payload.instance}"`);

    if (event === 'messages.upsert') {
      await handleNewMessage(payload);
    } else if (event === 'connection.update') {
      await handleConnectionUpdate(payload);
    } else if (event === 'qrcode.updated') {
      await handleQrCodeUpdate(payload);
    }
  } catch (error) {
    console.error('Erro no webhook:', error);
  }
};

const sendAIResponse = async ({ conversationId, instanceName, settings, remoteJid, clientName, companyId }) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const lastUserMessages = messages
      .filter(m => !m.fromMe)
      .slice(-5)
      .map(m => m.content)
      .join('\n');

    const aiResponse = await aiService.generateResponse({
      settings,
      messages,
      newMessage: lastUserMessages,
      clientName,
    });

    if (!aiResponse) return;

    // Split response into short paragraphs and send each with delay
    const chunks = aiResponse
      .split(/\n\n+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    let lastSavedContent = null;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      if (i === 0) {
        const delay = (settings.responseDelay || 2) * 1000;
        await new Promise(r => setTimeout(r, delay));
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }

      const sent = await evolutionService.sendMessage({
        instanceName,
        settings,
        remoteJid,
        message: chunk,
      });

      await prisma.message.create({
        data: {
          content: chunk,
          fromMe: true,
          conversationId,
          type: 'TEXT',
          status: sent ? 'SENT' : 'FAILED',
        },
      });

      if (sent) {
        lastSavedContent = chunk;

        if (global.io) {
          global.io.to(`company-${companyId}`).emit('new-message', {
            conversationId,
            message: chunk,
            fromMe: true,
          });
          global.io.to(`conv-${conversationId}`).emit('message', {
            content: chunk,
            fromMe: true,
            createdAt: new Date(),
          });
        }
      }
    }

    if (lastSavedContent) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessage: lastSavedContent, lastMessageAt: new Date() },
      });
    }
  } catch (error) {
    console.error('Erro ao gerar/enviar resposta IA:', error);
  }
};

const handleNewMessage = async (payload) => {
  try {
    const data = payload.data;
    const instanceName = payload.instance;

    if (!data || !data.key) return;
    if (data.key.fromMe) return;

    const instance = await prisma.whatsappInstance.findFirst({
      where: { instanceName },
      include: { company: { include: { settings: true } } },
    });

    if (!instance || !instance.company) return;

    const { company } = instance;
    const settings = company.settings;

    const remoteJid = data.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) return;

    const messageContent =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      data.message?.imageMessage?.caption ||
      '[Mensagem de mídia]';

    const clientPhone = remoteJid.replace('@s.whatsapp.net', '');
    const clientName = data.pushName || clientPhone;

    let conversation = await prisma.conversation.findUnique({
      where: { remoteJid_instanceId: { remoteJid, instanceId: instance.id } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          remoteJid,
          clientName,
          clientPhone,
          companyId: company.id,
          instanceId: instance.id,
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: 1,
        },
      });
    } else {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          clientName,
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });
    }

    await prisma.message.create({
      data: {
        content: messageContent,
        fromMe: false,
        messageId: data.key.id,
        conversationId: conversation.id,
        type: 'TEXT',
        status: 'DELIVERED',
      },
    });

    if (global.io) {
      global.io.to(`company-${company.id}`).emit('new-message', {
        conversationId: conversation.id,
        message: messageContent,
        fromMe: false,
        clientName,
        clientPhone,
      });

      global.io.to(`conv-${conversation.id}`).emit('message', {
        content: messageContent,
        fromMe: false,
        createdAt: new Date(),
      });
    }

    if (settings?.aiEnabled && settings?.autoReply && conversation.aiEnabled) {
      const debounceMs = (settings.responseDelay || 5) * 1000;

      // Cancel existing timer for this contact and reset
      const existing = pendingAI.get(remoteJid);
      if (existing?.timer) clearTimeout(existing.timer);

      const timer = setTimeout(() => {
        pendingAI.delete(remoteJid);
        sendAIResponse({
          conversationId: conversation.id,
          instanceName,
          settings,
          remoteJid,
          clientName,
          companyId: company.id,
        });
      }, debounceMs);

      pendingAI.set(remoteJid, { timer, conversationId: conversation.id });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
};

const handleConnectionUpdate = async (payload) => {
  try {
    const instanceName = payload.instance;
    const state = payload.data?.instance?.state;

    if (!state) return;

    let status = 'DISCONNECTED';
    if (state === 'open') status = 'CONNECTED';
    else if (state === 'connecting') status = 'CONNECTING';

    const instance = await prisma.whatsappInstance.findFirst({
      where: { instanceName },
    });

    if (!instance) return;

    await prisma.whatsappInstance.update({
      where: { id: instance.id },
      data: { status, ...(status === 'CONNECTED' ? { qrCode: null } : {}) },
    });

    if (global.io) {
      global.io.to(`company-${instance.companyId}`).emit('instance-update', { status });
    }
  } catch (error) {
    console.error('Erro no connection update:', error);
  }
};

const handleQrCodeUpdate = async (payload) => {
  try {
    const instanceName = payload.instance;
    const qrCode = payload.data?.qrcode?.base64;

    if (!qrCode) return;

    const instance = await prisma.whatsappInstance.findFirst({
      where: { instanceName },
    });

    if (!instance) return;

    await prisma.whatsappInstance.update({
      where: { id: instance.id },
      data: { qrCode, status: 'QR_CODE' },
    });

    if (global.io) {
      global.io.to(`company-${instance.companyId}`).emit('qr-updated', { qrCode });
    }
  } catch (error) {
    console.error('Erro no QR update:', error);
  }
};

module.exports = { handleEvolutionWebhook };
