import { prisma } from './client.js';

async function main() {
  const adminEmail = 'admin@dudecourse.local';
  const adminPasswordHash = 'bootstrap-seed-password-hash-placeholder';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin Dude Course',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Database seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });