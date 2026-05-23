const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + uuidv4().slice(0, 6);
};

const register = async (req, res) => {
  try {
    const { name, email, password, companyName, companyPhone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const slug = generateSlug(companyName);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug,
        email,
        phone: companyPhone,
        plan: 'STARTER',
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    await prisma.settings.create({
      data: {
        companyId: company.id,
        businessName: companyName,
        aiEnabled: true,
        autoReply: true,
        responseDelay: 2,
        openaiModel: 'gpt-4o-mini',
        systemPrompt: `Você é um atendente virtual da empresa ${companyName}. Responda sempre de forma educada, profissional e clara. Ajude os clientes com suas dúvidas e necessidades.`,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        plan: company.plan,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    if (user.company && !user.company.isActive) {
      return res.status(403).json({ error: 'Conta suspensa. Entre em contato com o suporte.' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            slug: user.company.slug,
            plan: user.company.plan,
          }
        : null,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const me = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      company: req.user.company
        ? {
            id: req.user.company.id,
            name: req.user.company.name,
            slug: req.user.company.slug,
            plan: req.user.company.plan,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};

module.exports = { register, login, me };
