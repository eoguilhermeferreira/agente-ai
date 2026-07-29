const crypto = require('crypto');

const generateApiKey = (companyId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const hmac = crypto.createHmac('sha256', secret).update(companyId).digest('hex').slice(0, 24);
  return `cn_${companyId.replace(/-/g, '').slice(0, 8)}_${hmac}`;
};

const verifyApiKey = (apiKey) => {
  if (!apiKey || !apiKey.startsWith('cn_')) return null;
  const parts = apiKey.split('_');
  if (parts.length !== 3) return null;
  const companyIdFragment = parts[1];
  return { companyIdFragment };
};

module.exports = { generateApiKey, verifyApiKey };
