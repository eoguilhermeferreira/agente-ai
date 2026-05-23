const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../config/prisma');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        logo: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const company = await prisma.company.update({
      where: { id: req.companyId },
      data: { name, phone, address },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        plan: true,
      },
    });

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

module.exports = router;
