const axios = require('axios');

const getClient = (settings) => {
  const baseURL = settings.evolutionApiUrl || process.env.EVOLUTION_API_URL;
  const apiKey = settings.evolutionApiKey || process.env.EVOLUTION_API_KEY;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.apikey = apiKey;

  return axios.create({ baseURL, headers, timeout: 15000 });
};

const sendMessage = async ({ instanceName, settings, remoteJid, message }) => {
  try {
    const client = getClient(settings);

    await client.post(`/message/sendText/${instanceName}`, {
      number: remoteJid,
      text: message,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem Evolution:', error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendMessage };
