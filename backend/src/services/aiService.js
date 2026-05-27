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

  const hasCustomPrompt = settings.systemPrompt && settings.systemPrompt.trim().length > 0;

  if (hasCustomPrompt) {
    // User wrote a custom prompt — use it as-is, only add client name context
    parts.push(settings.systemPrompt.trim());
    if (clientName) {
      parts.push(`\nO cliente se chama ${clientName}.`);
    }
  } else {
    // No custom prompt — build the default prompt from individual fields
    parts.push(
      `Você é um atendente virtual profissional e educado da empresa ${settings.businessName || 'nossa empresa'}.`
    );

    if (settings.businessName) parts.push(`\nEmpresa: ${settings.businessName}`);
    if (settings.businessHours) parts.push(`Horário de funcionamento: ${settings.businessHours}`);
    if (settings.businessAddress) parts.push(`Endereço: ${settings.businessAddress}`);
    if (settings.businessPhone) parts.push(`Telefone: ${settings.businessPhone}`);
    if (settings.products) parts.push(`\nProdutos/Serviços disponíveis:\n${settings.products}`);
    if (settings.faq) parts.push(`\nPerguntas frequentes:\n${settings.faq}`);
    if (settings.aiRules) parts.push(`\nRegras importantes:\n${settings.aiRules}`);
    if (clientName) parts.push(`\nO cliente se chama ${clientName}.`);
  }

  parts.push(
    '\nInstruções obrigatórias (nunca ignore):',
    '- Responda sempre em português brasileiro',
    '- Seja natural como um atendente humano — nunca robótico',
    '- Mantenha respostas objetivas e claras, sem rodeios',
    '- Nunca invente informações que não foram fornecidas',
    '- Se não souber algo, diga que irá verificar ou chamar um atendente',
    '- NUNCA use saudações ("Olá", "Boa noite", "Oi", "Bom dia") no meio de uma conversa já iniciada — apenas responda o que foi perguntado',
    '- NUNCA diga "como mencionei antes", "já falei sobre isso", "como expliquei anteriormente"',
    '- Não traga assuntos que o cliente não perguntou — responda somente o que foi perguntado'
  );

  return parts.join('\n');
};

module.exports = { generateResponse };
