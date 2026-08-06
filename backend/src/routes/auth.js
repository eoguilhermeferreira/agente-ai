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
router.get('/setup-admin', async (req, res) => {
  if (req.query.token !== 'nodex2026setup') return res.status(403).json({ error: 'Não autorizado' });
  try {
    await prisma.user.deleteMany({ where: { email: 'guilhermeee.hferreiraa@gmail.com' } });
    const companies = await prisma.company.findMany({ where: { isActive: true } });
    if (!companies.length) return res.status(404).json({ error: 'Nenhuma empresa encontrada' });
    const company = companies[0];
    const hash = await bcrypt.hash('Chatnex@2026', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Guilherme',
        email: 'guilhermeee.hferreiraa@gmail.com',
        password: hash,
        role: 'ADMIN',
        companyId: company.id,
      },
    });
    res.json({ ok: true, email: user.email, senha: 'Chatnex@2026', empresa: company.name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
