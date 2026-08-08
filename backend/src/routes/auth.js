const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// TEMPORARY — remove after use
router.get('/delete-account', async (req, res) => {
  if (req.query.token !== 'nodex2026del') return res.status(403).json({ error: 'Não autorizado' });
  const email = 'guilhermee.ferreiraa501@gmail.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true, message: 'Conta não encontrada (já deletada ou email diferente)' });
    // Se a empresa só tem esse usuário, deleta a empresa também (cascata)
    const companyId = user.companyId;
    await prisma.user.delete({ where: { email } });
    if (companyId) {
      const remaining = await prisma.user.count({ where: { companyId } });
      if (remaining === 0) {
        await prisma.company.delete({ where: { id: companyId } });
      }
    }
    res.json({ ok: true, message: `Conta ${email} deletada com sucesso` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
