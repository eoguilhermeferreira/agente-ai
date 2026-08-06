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
  const parts = [];

  // 1. Instruções principais (prompt personalizado ou padrão)
  if (settings.systemPrompt?.trim()) {
    parts.push(settings.systemPrompt.trim());
  } else {
    parts.push(
      `Você é um atendente virtual profissional e educado da empresa ${settings.businessName || 'nossa empresa'}.`,
      '\n\nInstruções de comportamento:',
      '\n- Responda sempre em português brasileiro',
      '\n- Seja natural, como um atendente humano',
      '\n- Respostas curtas e diretas',
      '\n- Nunca invente informações',
      '\n- Ao receber uma saudação, responda com uma saudação e pergunte como pode ajudar'
    );
  }

  // 2. Dados da empresa — SEMPRE incluídos, independente do prompt personalizado
  const dataSection = [];

  if (settings.businessName) dataSection.push(`Nome da empresa: ${settings.businessName}`);
  if (settings.businessHours) dataSection.push(`Horário de funcionamento: ${settings.businessHours}`);
  if (settings.businessAddress) dataSection.push(`Endereço: ${settings.businessAddress}`);
  if (settings.businessPhone) dataSection.push(`Telefone: ${settings.businessPhone}`);

  if (dataSection.length > 0) {
    parts.push('\n\n--- DADOS DA EMPRESA ---\n' + dataSection.join('\n'));
  }

  // 3. Produtos/Serviços — SEMPRE incluídos
  if (settings.products?.trim()) {
    parts.push('\n\n--- PRODUTOS E SERVIÇOS ---\n' + settings.products.trim());
  }

  // 4. FAQ — SEMPRE incluído
  if (settings.faq?.trim()) {
    parts.push('\n\n--- PERGUNTAS FREQUENTES ---\n' + settings.faq.trim());
  }

  // 5. Regras da IA — SEMPRE incluídas
  if (settings.aiRules?.trim()) {
    parts.push('\n\n--- REGRAS ---\n' + settings.aiRules.trim());
  }

  // 6. Nome do cliente
  if (clientName) {
    parts.push(`\n\nO cliente se chama ${clientName}.`);
  }

  // 7. Regra de uso dos dados
  parts.push(`\n\n--- INSTRUÇÃO IMPORTANTE ---
Você tem acesso a todos os dados acima. Use-os para responder as perguntas do cliente com precisão.
SOMENTE transfira para um atendente humano quando a pergunta exigir uma ação que depende de um humano (ex: confirmar disponibilidade em tempo real, fazer alterações em reservas, resolver reclamações graves) ou quando o cliente EXPLICITAMENTE pedir para falar com uma pessoa.
Se a informação estiver nos dados acima, responda diretamente — não transfira desnecessariamente.`);

  return parts.join('');
};

module.exports = { generateResponse };
