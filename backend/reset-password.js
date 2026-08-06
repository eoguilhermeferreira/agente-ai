require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'guilhermeee.hferreiraa@gmail.com';
  const newPassword = 'Chatnex@2026';

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log('✅ Senha resetada com sucesso!');
  console.log(`📧 Email: ${user.email}`);
  console.log(`🔑 Nova senha: ${newPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
