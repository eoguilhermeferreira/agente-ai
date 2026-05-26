const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const prisma = require('../config/prisma');
const {
  getInstance,
  createInstance,
  getQrCode,
  disconnectInstance,
  getStatus,
} = require('../controllers/whatsappController');

// Rota de diagnóstico temporária (sem auth)
router.get('/debug', async (req, res) => {
  const url = process.env.EVOLUTION_API_URL || 'NAO_CONFIGURADO';
  const keyInEnv = process.env.EVOLUTION_API_KEY || null;

  const results = {};

  try {
    const r = await axios.get(`${url}/instance/fetchInstances`, { timeout: 10000 });
    results.noKey = { status: r.status, data: JSON.stringify(r.data).slice(0, 300) };
  } catch (e) {
    results.noKey = { status: e.response?.status, error: e.response?.data || e.message };
  }

  if (keyInEnv) {
    try {
      const r = await axios.get(`${url}/instance/fetchInstances`, { headers: { apikey: keyInEnv }, timeout: 10000 });
      results.withEnvKey = { status: r.status, data: JSON.stringify(r.data).slice(0, 300) };
    } catch (e) {
      results.withEnvKey = { status: e.response?.status, error: e.response?.data || e.message };
    }
  }

  res.json({ url, keyInEnv: keyInEnv ? `***${keyInEnv.slice(-4)}` : null, results });
});

router.use(auth);
router.get('/instance', getInstance);
router.post('/instance', createInstance);
router.get('/qrcode', getQrCode);
router.delete('/instance', disconnectInstance);
router.get('/status', getStatus);

// Rota de diagnóstico temporária
router.get('/debug', async (req, res) => {
  const settings = await prisma.settings.findUnique({ where: { companyId: req.companyId } });
  const url = settings?.evolutionApiUrl || process.env.EVOLUTION_API_URL;
  const keyInDb = settings?.evolutionApiKey || null;
  const keyInEnv = process.env.EVOLUTION_API_KEY || null;

  const results = {};

  // Testa SEM chave
  try {
    const r = await axios.get(`${url}/instance/fetchInstances`, { timeout: 10000 });
    results.noKey = { status: r.status, data: JSON.stringify(r.data).slice(0, 300) };
  } catch (e) {
    results.noKey = { status: e.response?.status, error: e.response?.data || e.message };
  }

  // Testa COM chave do banco
  if (keyInDb) {
    try {
      const r = await axios.get(`${url}/instance/fetchInstances`, { headers: { apikey: keyInDb }, timeout: 10000 });
      results.withDbKey = { status: r.status, data: JSON.stringify(r.data).slice(0, 300) };
    } catch (e) {
      results.withDbKey = { status: e.response?.status, error: e.response?.data || e.message };
    }
  }

  // Testa COM chave do env
  if (keyInEnv) {
    try {
      const r = await axios.get(`${url}/instance/fetchInstances`, { headers: { apikey: keyInEnv }, timeout: 10000 });
      results.withEnvKey = { status: r.status, data: JSON.stringify(r.data).slice(0, 300) };
    } catch (e) {
      results.withEnvKey = { status: e.response?.status, error: e.response?.data || e.message };
    }
  }

  res.json({ url, keyInDb: keyInDb ? `***${keyInDb.slice(-4)}` : null, keyInEnv: keyInEnv ? `***${keyInEnv.slice(-4)}` : null, results });
});

module.exports = router;
