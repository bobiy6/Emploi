import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hostdash.com' },
    update: {
      password: adminPassword, // Force password update during seed
      role: 'ADMIN'
    },
    create: {
      email: 'admin@hostdash.com',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      balance: 1000.0,
    },
  });

  const catVPS = await prisma.category.create({
    data: {
      name: 'Cloud VPS',
      description: 'High performance Virtual Private Servers',
    }
  });

  const catGame = await prisma.category.create({
    data: {
      name: 'Game Servers',
      description: 'Lag-free gaming experience',
    }
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'VPS Start',
        description: 'Perfect for small projects',
        price: 5.0,
        type: 'VPS',
        config: { cpu: 1, ram: '2GB', disk: '20GB' },
        categoryId: catVPS.id
      },
      {
        name: 'VPS Pro',
        description: 'For growing businesses',
        price: 15.0,
        type: 'VPS',
        config: { cpu: 4, ram: '8GB', disk: '80GB' },
        categoryId: catVPS.id
      },
      {
        name: 'Minecraft Basic',
        description: 'Up to 20 players',
        price: 4.0,
        type: 'GAME',
        config: { slots: 20, ram: '4GB' },
        categoryId: catGame.id
      }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
