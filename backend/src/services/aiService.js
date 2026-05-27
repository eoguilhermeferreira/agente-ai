const OpenAI = require('openai');

const generateResponse = async ({ settings, messages, newMessage, clientName }) => {
  try {
    const apiKey = settings.openaiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key não configurada');
      return null;
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = buildSystemPrompt(settings, clientName);

    const conversationHistory = messages.slice(-15).map((msg) => ({
      role: msg.fromMe ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: settings.openaiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: newMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Erro na OpenAI:', error.message);
    return null;
  }
};

const buildSystemPrompt = (settings, clientName) => {
  const parts = [];

  const basePrompt =
    settings.systemPrompt ||
    `Você é um atendente virtual profissional e educado da empresa ${settings.businessName || 'nossa empresa'}.`;

  parts.push(basePrompt);

  if (settings.businessName) {
    parts.push(`\nEmpresa: ${settings.businessName}`);
  }

  if (settings.businessHours) {
    parts.push(`Horário de funcionamento: ${settings.businessHours}`);
  }

  if (settings.businessAddress) {
    parts.push(`Endereço: ${settings.businessAddress}`);
  }

  if (settings.businessPhone) {
    parts.push(`Telefone: ${settings.businessPhone}`);
  }

  if (settings.products) {
    parts.push(`\nProdutos/Serviços disponíveis:\n${settings.products}`);
  }

  if (settings.faq) {
    parts.push(`\nPerguntas frequentes:\n${settings.faq}`);
  }

  if (settings.aiRules) {
    parts.push(`\nRegras importantes:\n${settings.aiRules}`);
  }

  if (clientName) {
    parts.push(`\nO cliente se chama ${clientName}.`);
  }

  parts.push(
    '\nInstruções gerais:',
    '- Responda sempre em português brasileiro',
    '- Seja cordial, empático e profissional, mas natural — como um atendente humano real',
    '- Mantenha respostas objetivas e claras, sem rodeios',
    '- Nunca invente informações que não foram fornecidas',
    '- Se não souber algo, diga que irá verificar ou transferir para um atendente humano',
    '- Use linguagem adequada ao contexto',
    '- NUNCA use saudações como "Olá", "Boa noite", "Bom dia", "Oi" no meio ou continuação de uma conversa já iniciada — só responda ao que foi perguntado',
    '- NUNCA diga frases como "como mencionei antes", "já falei sobre isso", "como expliquei anteriormente" — apenas responda a pergunta atual diretamente',
    '- Não repita informações que já foram ditas na conversa a não ser que o cliente peça explicitamente',
    '- Se o cliente mudar de assunto, responda o novo assunto sem comentar a mudança'
  );

  return parts.join('\n');
};

module.exports = { generateResponse };
