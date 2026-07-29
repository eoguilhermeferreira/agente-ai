require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const whatsappRoutes = require('./routes/whatsapp');
const conversationRoutes = require('./routes/conversations');
const settingsRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const dashboardRoutes = require('./routes/dashboard');
const integrationsRoutes = require('./routes/integrations');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

global.io = io;

app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn('CORS bloqueado para origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  skip: (req) => req.path.startsWith('/webhook'),
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/integrations', integrationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ChatNex API', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

io.on('connection', (socket) => {
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
  });

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conv-${conversationId}`);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3001;

// Start server then run DB patches using the main prisma pool (no extra connections)
server.listen(PORT, async () => {
  console.log(`🚀 ChatNex API rodando na porta ${PORT}`);

  const prisma = require('./config/prisma');
  const runEvolutionMigration = require('./evolutionMigration');

  const patches = [
    `ALTER TABLE "IsOnWhatsapp" ADD COLUMN IF NOT EXISTS "lid" VARCHAR(100)`,
    `ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "businessId" VARCHAR(100)`,
    `ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "clientName" VARCHAR(100)`,
  ];

  // Retry patches until DB connections are available (Evolution API may hold many on startup)
  const applyPatches = async (attempt = 1) => {
    let allOk = true;
    for (const sql of patches) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('does not exist')) continue;
        if (e.message.includes('too many') && attempt <= 6) {
          allOk = false;
          break;
        }
        console.warn('⚠️ Patch:', e.message.slice(0, 100));
      }
    }
    if (!allOk) {
      console.log(`⏳ Aguardando conexões disponíveis (tentativa ${attempt}/6)...`);
      await new Promise(r => setTimeout(r, 5000));
      return applyPatches(attempt + 1);
    }
    console.log('✅ Patches aplicados');
  };

  // Wait 3s for Evolution API connections to settle, then apply patches
  await new Promise(r => setTimeout(r, 3000));
  await applyPatches();
  await runEvolutionMigration();
});

module.exports = { app, io };
