const axios = require('axios');
const { generateApiKey } = require('./apiKeyService');

const callExternalWebhook = async ({
  settings,
  companyId,
  remoteJid,
  clientName,
  remetente,
  mensagem,
  aguardandoHumano = false,
}) => {
  if (!settings?.externalWebhookUrl) return;

  const chaveApi = generateApiKey(companyId);

  const headers = { 'Content-Type': 'application/json' };
  if (settings.externalWebhookKey) {
    headers['apikey'] = settings.externalWebhookKey;
  }

  const body = {
    p_chave_api: chaveApi,
    p_remote_jid: remoteJid,
    p_remetente: remetente,
    p_aguardando_humano: aguardandoHumano,
  };

  if (clientName) body.p_hospede_nome = clientName;
  if (mensagem) body.p_mensagem = mensagem;

  try {
    await axios.post(settings.externalWebhookUrl, body, { headers, timeout: 10000 });
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data ? JSON.stringify(err.response.data).slice(0, 200) : err.message;
    console.warn(`[ExternalWebhook] ${status ?? 'ERR'}: ${detail}`);
  }
};

module.exports = { callExternalWebhook };
