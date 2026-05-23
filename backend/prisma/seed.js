const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const company = await prisma.company.upsert({
    where: { slug: 'nodex-demo' },
    update: {},
    create: {
      name: 'Nodex Demo',
      slug: 'nodex-demo',
      email: 'demo@nodex.com.br',
      phone: '+5511999999999',
      plan: 'PROFESSIONAL',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@nodex.com.br' },
    update: {},
    create: {
      name: 'Admin Nodex',
      email: 'admin@nodex.com.br',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  await prisma.settings.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      businessName: 'Nodex Demo',
      aiEnabled: true,
      autoReply: true,
      responseDelay: 2,
      openaiModel: 'gpt-4o-mini',
      systemPrompt:
        'Você é um atendente virtual educado e profissional. Responda sempre de forma clara, objetiva e amigável.',
    },
  });

  console.log('✅ Seed executado com sucesso!');
  console.log('📧 Email: admin@nodex.com.br');
  console.log('🔑 Senha: Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
