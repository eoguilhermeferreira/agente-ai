const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// TEMPORARY — remove after use
router.get('/reset-client-password', async (req, res) => {
  if (req.query.token !== 'nodex2026reset') return res.status(403).json({ error: 'Não autorizado' });
  const emails = ['estatineto@icloud.com', 'antonioestatineto@icloud.com'];
  const newPassword = 'Pousadacabana26';
  const hash = await bcrypt.hash(newPassword, 10);
  const results = [];
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { results.push({ email, status: 'não encontrado' }); continue; }
    await prisma.user.update({ where: { email }, data: { password: hash } });
    results.push({ email, status: 'senha resetada' });
  }
  res.json({ ok: true, results });
});

module.exports = router;
