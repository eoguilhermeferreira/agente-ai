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
router.get('/emergency-reset', async (req, res) => {
  if (req.query.token !== 'nodex2026reset') return res.status(403).json({ error: 'Não autorizado' });
  const hash = await bcrypt.hash('Chatnex@2026', 12);
  await prisma.user.update({ where: { email: 'guilhermeee.hferreiraa@gmail.com' }, data: { password: hash } });
  res.json({ ok: true, message: 'Senha resetada. Login: guilhermeee.hferreiraa@gmail.com / Chatnex@2026' });
});

module.exports = router;
