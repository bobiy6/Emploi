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
        content: '<h1>Bonjour {{name}},</h1><p>Merci d\'avoir rejoint Infralyonix. Nous sommes ravis de vous compter parmi nos clients.</p><p>Pour commencer à utiliser nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p><p style="text-align: center;"><a href="{{verificationUrl}}" class="button">Vérifier mon compte</a></p><p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>{{verificationUrl}}</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'SERVICE_READY',
        subject: 'Votre service {{productName}} est prêt',
        content: '<h1>Votre service est actif !</h1><p>Bonne nouvelle ! Votre service <strong>{{productName}}</strong> a été provisionné avec succès et est maintenant prêt à l\'emploi.</p><p>Vous pouvez gérer votre service directement depuis votre espace client.</p><p style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Accéder à mon service</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'NEW_INVOICE',
        subject: 'Nouvelle facture #{{invoiceId}}',
        content: '<h1>Nouvelle facture disponible</h1><p>Une nouvelle facture d\'un montant de <strong>{{amount}}€</strong> vient d\'être générée pour votre compte.</p><p>Échéance : {{dueDate}}</p><p style="text-align: center;"><a href="{{invoiceUrl}}" class="button">Consulter la facture</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'INVOICE_PAID',
        subject: 'Paiement reçu - Facture #{{invoiceId}}',
        content: '<h1>Merci pour votre paiement !</h1><p>Nous vous confirmons la réception de votre paiement de <strong>{{amount}}€</strong> pour la facture #{{invoiceId}}.</p><p>Votre facture acquittée est disponible en pièce jointe de cet email.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'INVOICE_REMINDER',
        subject: 'Rappel : Facture #{{invoiceId}} en attente',
        content: '<h1>Rappel de paiement</h1><p>Sauf erreur de notre part, votre facture #{{invoiceId}} d\'un montant de <strong>{{amount}}€</strong> est toujours en attente de règlement.</p><p>Nous vous invitons à régulariser votre situation au plus vite pour éviter toute interruption de service.</p><p style="text-align: center;"><a href="{{invoiceUrl}}" class="button">Régler ma facture</a></p>',
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
        subject: 'Ticket ouvert - #{{ticketId}}',
        content: '<h1>Confirmation d\'ouverture de ticket</h1><p>Nous avons bien reçu votre demande concernant : <strong>{{subject}}</strong>.</p><p>Un membre de notre équipe technique va l\'étudier et vous répondra dans les plus brefs délais. Votre numéro de ticket est le <strong>#{{ticketId}}</strong>.</p><p style="text-align: center;"><a href="{{ticketUrl}}" class="button">Voir mon ticket</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'TICKET_REPLY',
        subject: 'Nouvelle réponse - Ticket #{{ticketId}}',
        content: '<h1>Nouvelle réponse de notre support</h1><p>Un agent a apporte une réponse à votre ticket #{{ticketId}} ({{subject}}).</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0050d7;">{{message}}</div><p style="text-align: center;"><a href="{{ticketUrl}}" class="button">Répondre au ticket</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'CREDIT_REFILL_CONFIRMATION',
        subject: 'Confirmation de rechargement - {{amount}}€',
        content: '<h1>Rechargement réussi !</h1><p>Bonjour {{name}},</p><p>Nous vous confirmons que votre compte a été crédité de <strong>{{amount}}€</strong>.</p><p>Votre nouveau solde est de <strong>{{balance}}€</strong>.</p><p>Merci de votre confiance.</p><p style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Voir mon compte</a></p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'PASSWORD_RESET',
        subject: 'Réinitialisation de votre mot de passe',
        content: '<h1>Réinitialisation de mot de passe</h1><p>Bonjour {{name}},</p><p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Infralyonix.</p><p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p><p style="text-align: center;"><a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a></p><p>Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'PASSWORD_CHANGED',
        subject: 'Votre mot de passe a été modifié',
        content: '<h1>Sécurité de votre compte</h1><p>Bonjour {{name}},</p><p>Nous vous informons que le mot de passe de votre compte Infralyonix a été modifié avec succès.</p><p><strong>Détails de l\'action :</strong></p><ul><li>Date : {{date}}</li><li>Adresse IP : {{ip}}</li></ul><p>Si vous n\'êtes pas à l\'origine de cette modification, nous vous recommandons de réinitialiser votre mot de passe immédiatement et de contacter notre support.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: 'NEW_DEVICE_LOGIN',
        subject: 'Nouvelle connexion détectée',
        content: '<h1>Alerte de sécurité</h1><p>Bonjour {{name}},</p><p>Une nouvelle connexion à votre compte Infralyonix a été détectée depuis une adresse IP inhabituelle.</p><p><strong>Détails de la connexion :</strong></p><ul><li>Date : {{date}}</li><li>Adresse IP : {{ip}}</li></ul><p>S\'il s\'agit de vous, vous pouvez ignorer cet email. Si ce n\'est pas le cas, sécurisez votre compte en changeant votre mot de passe sans tarder.</p>',
        type: 'TRANSACTIONAL'
      },
      {
        name: '2FA_CODE',
        subject: 'Votre code de vérification',
        content: '<h1>Vérification de sécurité</h1><p>Bonjour {{name}},</p><p>Pour finaliser votre connexion, veuillez utiliser le code de vérification suivant :</p><div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;"><span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #001747;">{{code}}</span></div><p>Ce code est valable pendant 10 minutes. Ne le partagez jamais.</p>',
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
