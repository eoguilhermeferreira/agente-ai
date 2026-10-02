const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const auth = require('../middleware/auth');
const prisma = require('../config/prisma');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@chatnex.com.br',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const companyId = req.user?.companyId;
    if (!subscription?.endpoint || !companyId) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO push_subscriptions (id, company_id, endpoint, subscription, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3::jsonb, NOW())
       ON CONFLICT (endpoint) DO UPDATE SET company_id = $1, subscription = $3::jsonb`,
      companyId,
      subscription.endpoint,
      JSON.stringify(subscription)
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    res.status(500).json({ error: 'Falha ao salvar subscription' });
  }
});

router.delete('/subscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM push_subscriptions WHERE endpoint = $1`,
        endpoint
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao remover subscription' });
  }
});

module.exports = router;

async function sendPushToCompany(companyId, payload) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT endpoint, subscription FROM push_subscriptions WHERE company_id = $1`,
      companyId
    );
    await Promise.allSettled(
      rows.map(async (row) => {
        try {
          const sub = typeof row.subscription === 'string'
            ? JSON.parse(row.subscription)
            : row.subscription;
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.$executeRawUnsafe(
              `DELETE FROM push_subscriptions WHERE endpoint = $1`,
              row.endpoint
            );
          }
        }
      })
    );
  } catch (err) {
    console.error('Push send error:', err);
  }
}

module.exports.sendPushToCompany = sendPushToCompany;
