import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoUserId = '00000000-0000-0000-0000-000000000001';

  const exampleContactId1 = 'contact-1';
  const exampleContactId2 = 'contact-2';
  const exampleNoteId1 = 'note-1';
  const exampleNoteId2 = 'note-2';

  const now = Date.now();

  const eventsData = [
    {
      userId: demoUserId,
      type: 'contact_created',
      entityType: 'contact',
      entityId: exampleContactId1,
      meta: {},
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5),
    },
    {
      userId: demoUserId,
      type: 'contact_created',
      entityType: 'contact',
      entityId: exampleContactId2,
      meta: {},
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 4),
    },

    {
      userId: demoUserId,
      type: 'note_created',
      entityType: 'note',
      entityId: exampleNoteId1,
      meta: { contactId: exampleContactId1 },
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3),
    },
    {
      userId: demoUserId,
      type: 'note_updated',
      entityType: 'note',
      entityId: exampleNoteId1,
      meta: { contactId: exampleContactId1, updatedFields: ['body'] },
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2),
    },

    {
      userId: demoUserId,
      type: 'note_created',
      entityType: 'note',
      entityId: exampleNoteId2,
      meta: { contactId: exampleContactId2 },
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 1),
    },
  ];

  await prisma.event.createMany({
    data: eventsData,
  });

  console.log(`Seeded ${eventsData.length} events.`);
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
