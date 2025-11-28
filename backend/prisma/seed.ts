import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stemverse.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';

  const passwordHash = await bcrypt.hash(adminPassword, await bcrypt.genSalt());

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        firstName,
        lastName,
        roles: ['ADMIN'],
        passwordHash,
        level: existing.level ?? 1,
        xp: existing.xp ?? 0,
        stars: existing.stars ?? 0,
        badges: existing.badges ?? [],
      },
    });
    console.log(`Updated existing admin: ${adminEmail}`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName,
        lastName,
        roles: ['ADMIN'],
        avatarConfig: {},
        level: 1,
        xp: 0,
        stars: 0,
        badges: [],
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

