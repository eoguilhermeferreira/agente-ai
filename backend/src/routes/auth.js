const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const prisma = require('../config/prisma');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// TEMPORARY — remove after use
router.get('/delete-test-company', async (req, res) => {
  if (req.query.token !== 'nodex2026clean') return res.status(403).json({ error: 'Não autorizado' });
  try {
    const emails = ['guilhermee.ferreiraa501@gmail.com', 'guilhermeee.hferreiraa@gmail.com'];
    const deleted = [];
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.companyId) continue;
      const companyId = user.companyId;
      // Delete em ordem para respeitar FK sem depender de cascade
      await prisma.$executeRawUnsafe(`DELETE FROM "messages" WHERE "conversationId" IN (SELECT id FROM "conversations" WHERE "companyId" = '${companyId}')`);
      await prisma.$executeRawUnsafe(`DELETE FROM "conversations" WHERE "companyId" = '${companyId}'`);
      await prisma.$executeRawUnsafe(`DELETE FROM "messages" WHERE "conversationId" IN (SELECT id FROM "conversations" WHERE "instanceId" IN (SELECT id FROM "whatsapp_instances" WHERE "companyId" = '${companyId}'))`);
      await prisma.$executeRawUnsafe(`DELETE FROM "whatsapp_instances" WHERE "companyId" = '${companyId}'`);
      await prisma.$executeRawUnsafe(`DELETE FROM "settings" WHERE "companyId" = '${companyId}'`);
      await prisma.$executeRawUnsafe(`DELETE FROM "users" WHERE "companyId" = '${companyId}'`);
      await prisma.$executeRawUnsafe(`DELETE FROM "companies" WHERE "id" = '${companyId}'`);
      deleted.push(email);
    }
    res.json({ ok: true, deleted: deleted.length ? deleted : ['nada encontrado'] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
