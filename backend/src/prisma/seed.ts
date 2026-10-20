import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@scrapehub.dev';
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`[Seed] Admin user seeded: ${user.email} (id: ${user.id}, role: ${user.role})`);
  return user;
}

seedAdmin()
  .catch((e) => {
    console.error('[Seed] Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
