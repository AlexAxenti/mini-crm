import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const demoUserId = '00000000-0000-0000-0000-000000000001';

  const user = await prisma.user.upsert({
    where: { id: demoUserId },
    update: { email: 'demo@mini-crm.local' },
    create: { id: demoUserId, email: 'demo@mini-crm.local' },
  });

  await prisma.contact.createMany({
    data: [
      {
        name: 'Alice Johnson',
        email: 'alice@startup.com',
        phone: '555-1234',
        company: 'Startup Inc',
        title: 'CTO',
        userId: user.id,
      },
      {
        name: 'Bob Lee',
        email: 'bob@finflow.com',
        phone: '555-5678',
        company: 'FinFlow',
        title: 'Engineer',
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  const allContacts = await prisma.contact.findMany({
    where: { userId: user.id },
  });

  for (const contact of allContacts) {
    await prisma.note.createMany({
      data: [
        {
          title: `Intro call with ${contact.name}`,
          body: `Had an introductory call with ${contact.name} at ${contact.company}.`,
          contactId: contact.id,
        },
        {
          title: 'Follow-up reminder',
          body: `Send a follow-up email to ${contact.name} next week.`,
          contactId: contact.id,
        },
      ],
      skipDuplicates: true,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
