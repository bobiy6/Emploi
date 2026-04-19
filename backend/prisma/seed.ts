import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminEmail = 'admin@infralyonix.com'.toLowerCase().trim();

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword, // Force password update during seed
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
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

  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'WELCOME_VERIFICATION',
        subject: 'Bienvenue chez Infralyonix !',
        content: '<h1>Bonjour {{name}}</h1><p>Merci de vous être inscrit. Veuillez vérifier votre email en cliquant ici : <a href="{{verificationUrl}}">{{verificationUrl}}</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'SERVICE_READY',
        subject: 'Votre service {{productName}} est prêt',
        content: '<h1>Bonne nouvelle !</h1><p>Votre service {{productName}} a été provisionné avec succès.</p><p>ID externe : {{externalId}}</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'NEW_INVOICE',
        subject: 'Nouvelle facture #{{invoiceId}}',
        content: '<h1>Nouvelle facture</h1><p>Une nouvelle facture de {{amount}}€ a été générée. Date limite : {{dueDate}}</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'INVOICE_PAID',
        subject: 'Facture #{{invoiceId}} payée',
        content: '<h1>Merci !</h1><p>Votre paiement de {{amount}}€ pour la facture #{{invoiceId}} a bien été reçu.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'INVOICE_REMINDER',
        subject: 'Rappel : Facture #{{invoiceId}} impayée',
        content: '<h1>Rappel</h1><p>Votre facture #{{invoiceId}} est toujours en attente de paiement ({{amount}}€).</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'SERVICE_SUSPENDED',
        subject: 'Service suspendu : {{productName}}',
        content: '<h1>Service suspendu</h1><p>Votre service {{productName}} a été suspendu faute de paiement.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'SERVICE_TERMINATED',
        subject: 'Service supprimé : {{productName}}',
        content: '<h1>Service supprimé</h1><p>Votre service {{productName}} a été définitivement supprimé.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'TICKET_CREATED',
        subject: 'Ticket reçu : {{subject}}',
        content: '<h1>Ticket ouvert</h1><p>Nous avons bien reçu votre ticket #{{ticketId}} : {{subject}}</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'TICKET_REPLY',
        subject: 'Réponse à votre ticket : {{subject}}',
        content: '<h1>Nouvelle réponse</h1><p>Un agent a répondu à votre ticket #{{ticketId}}.</p><hr><p>{{message}}</p>',
        type: 'TRANSACTIONAL'
      }
    ],
    skipDuplicates: true
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
