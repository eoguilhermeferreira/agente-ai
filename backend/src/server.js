require('dotenv').config();
const { execSync } = require('child_process');

try {
  console.log('🔄 Sincronizando banco de dados...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Banco de dados sincronizado!');
} catch (e) {
  console.error('⚠️ Erro ao sincronizar banco:', e.message);
}

const runEvolutionMigration = require('./evolutionMigration');
runEvolutionMigration();

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
server.listen(PORT, () => {
  console.log(`🚀 ChatNex API rodando na porta ${PORT}`);
});

module.exports = { app, io };
