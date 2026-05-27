const OpenAI = require('openai');

const generateResponse = async ({ settings, messages, clientName }) => {
  try {
    const apiKey = settings.openaiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key não configurada');
      return null;
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = buildSystemPrompt(settings, clientName);

    // Use the last 15 messages as conversation history — the last message IS the user's
    // current message, so no need to add it again separately
    const conversationHistory = messages.slice(-15).map((msg) => ({
      role: msg.fromMe ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: settings.openaiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
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
  const hasCustomPrompt = settings.systemPrompt && settings.systemPrompt.trim().length > 0;

  if (hasCustomPrompt) {
    // Custom prompt configured — use it exactly as written
    const clientInfo = clientName ? `\nO cliente se chama ${clientName}.` : '';
    return `${settings.systemPrompt.trim()}${clientInfo}

REGRA ABSOLUTA: Você deve atuar EXCLUSIVAMENTE conforme as instruções acima. Se o cliente perguntar qualquer coisa que não esteja relacionada ao seu papel definido acima, responda educadamente que só pode ajudar com assuntos da empresa e redirecione a conversa. Nunca responda perguntas fora do escopo definido no seu papel.`;
  }

  // No custom prompt — build from individual fields with default guardrails
  const parts = [
    `Você é um atendente virtual profissional e educado da empresa ${settings.businessName || 'nossa empresa'}.`,
  ];

  if (settings.businessName) parts.push(`\nEmpresa: ${settings.businessName}`);
  if (settings.businessHours) parts.push(`\nHorário de funcionamento: ${settings.businessHours}`);
  if (settings.businessAddress) parts.push(`\nEndereço: ${settings.businessAddress}`);
  if (settings.businessPhone) parts.push(`\nTelefone: ${settings.businessPhone}`);
  if (settings.products) parts.push(`\n\nProdutos/Serviços disponíveis:\n${settings.products}`);
  if (settings.faq) parts.push(`\n\nPerguntas frequentes:\n${settings.faq}`);
  if (settings.aiRules) parts.push(`\n\nRegras importantes:\n${settings.aiRules}`);
  if (clientName) parts.push(`\n\nO cliente se chama ${clientName}.`);

  parts.push(
    '\n\nInstruções de comportamento:',
    '\n- Responda sempre em português brasileiro',
    '\n- Seja natural, como um atendente humano',
    '\n- Respostas curtas e diretas — sem informações extras não solicitadas',
    '\n- Nunca invente informações',
    '\n- Ao receber uma saudação, responda apenas com uma saudação e pergunte como pode ajudar',
    '\n- Se não souber algo, diga que vai verificar ou chamar um atendente'
  );

  return parts.join('');
};

module.exports = { generateResponse };
