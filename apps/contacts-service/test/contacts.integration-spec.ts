import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import {
  setupMockGuards,
  createMockAuthHeaders,
  TEST_CONFIG,
} from './setup/test-helpers';

describe('ContactsController Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;
  let testContactId: string;
  let mockAuthHeaders: Record<string, string>;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    const moduleFixture: TestingModule =
      await setupMockGuards(moduleBuilder).compile();

    app = moduleFixture.createNestApplication();

    // Add test middleware to set userId from headers
    app.use((req: any, res: any, next: () => void) => {
      if (req.headers && req.headers['x-user-id']) {
        req.userId = req.headers['x-user-id'];
      }
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testUserId = TEST_CONFIG.TEST_USER_ID;
    mockAuthHeaders = createMockAuthHeaders(testUserId);

    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: { id: testUserId, email: 'test@example.com' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up contacts before each test
    await prisma.note.deleteMany({
      where: { contact: { userId: testUserId } },
    });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
  });

  // describe('POST /contacts', () => {
  //   it('should create a contact with all fields', async () => {
  //     const createContactDto = {
  //       name: 'John Doe',
  //       email: 'john@example.com',
  //       phone: '+1234567890',
  //       company: 'Test Corp',
  //       title: 'CEO',
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send(createContactDto)
  //       .expect(201);

  //     expect(response.body).toMatchObject({
  //       id: expect.any(String),
  //       name: 'John Doe',
  //       email: 'john@example.com',
  //       phone: '+1234567890',
  //       company: 'Test Corp',
  //       title: 'CEO',
  //       userId: testUserId,
  //       createdAt: expect.any(String),
  //       updatedAt: expect.any(String),
  //     });

  //     testContactId = response.body.id;
  //   });

  //   it('should create a contact with only required fields', async () => {
  //     const createContactDto = {
  //       name: 'Jane Smith',
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send(createContactDto)
  //       .expect(201);

  //     expect(response.body).toMatchObject({
  //       id: expect.any(String),
  //       name: 'Jane Smith',
  //       email: null,
  //       phone: null,
  //       company: null,
  //       title: null,
  //       userId: testUserId,
  //     });
  //   });

  //   it('should create multiple contacts with different optional field combinations', async () => {
  //     const contacts = [
  //       { name: 'Contact 1', email: 'contact1@test.com' },
  //       { name: 'Contact 2', phone: '+1111111111' },
  //       { name: 'Contact 3', company: 'Test Company' },
  //       { name: 'Contact 4', title: 'Developer' },
  //       {
  //         name: 'Contact 5',
  //         email: 'contact5@test.com',
  //         company: 'Another Corp',
  //       },
  //     ];

  //     for (const contact of contacts) {
  //       const response = await request(app.getHttpServer())
  //         .post('/contacts')
  //         .set(mockAuthHeaders)
  //         .send(contact)
  //         .expect(201);

  //       expect(response.body.name).toBe(contact.name);
  //       if (contact.email) expect(response.body.email).toBe(contact.email);
  //       if (contact.phone) expect(response.body.phone).toBe(contact.phone);
  //       if (contact.company)
  //         expect(response.body.company).toBe(contact.company);
  //       if (contact.title) expect(response.body.title).toBe(contact.title);
  //     }
  //   });

  //   it('should return 400 when name is missing', async () => {
  //     const createContactDto = {
  //       email: 'test@example.com',
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send(createContactDto)
  //       .expect(400);

  //     expect(response.body.message).toContain('name');
  //   });

  //   it('should return 400 when name is empty string', async () => {
  //     const createContactDto = {
  //       name: '',
  //     };

  //     await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send(createContactDto)
  //       .expect(400);
  //   });

  //   it('should return 400 when email format is invalid', async () => {
  //     const createContactDto = {
  //       name: 'Test User',
  //       email: 'invalid-email',
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send(createContactDto)
  //       .expect(400);

  //     expect(response.body.message).toContain('email');
  //   });

  //   it('should return 409 when email already exists for the user', async () => {
  //     const email = 'duplicate@example.com';

  //     // Create first contact
  //     await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send({ name: 'First Contact', email })
  //       .expect(201);

  //     // Try to create second contact with same email
  //     const response = await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set(mockAuthHeaders)
  //       .send({ name: 'Second Contact', email })
  //       .expect(409);

  //     expect(response.body.message).toContain('email already exists');
  //   });

  //   it('should return 401 when no auth headers provided', async () => {
  //     await request(app.getHttpServer())
  //       .post('/contacts')
  //       .send({ name: 'Test User' })
  //       .expect(401);
  //   });

  //   it('should return 401 when invalid API key provided', async () => {
  //     await request(app.getHttpServer())
  //       .post('/contacts')
  //       .set({ ...mockAuthHeaders, 'api-key': 'invalid-key' })
  //       .send({ name: 'Test User' })
  //       .expect(401);
  //   });
  // });

  describe('GET /contacts', () => {
    beforeEach(async () => {
      // Create test contacts
      const contacts = [
        {
          name: 'Alice Johnson',
          email: 'alice@startup.com',
          company: 'Startup Inc',
          title: 'CTO',
        },
        {
          name: 'Bob Lee',
          email: 'bob@finflow.com',
          company: 'FinFlow',
          title: 'Engineer',
        },
        // {
        //   name: 'Charlie Brown',
        //   phone: '+1234567890',
        //   company: 'ACME Corp',
        //   title: 'Manager',
        // },
        // { name: 'Diana Prince', email: 'diana@wonder.com', title: 'Hero' },
      ];

      for (const contact of contacts) {
        await prisma.contact.create({
          data: { ...contact, userId: testUserId },
        });
      }
    });

    it('should return all contacts for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        userId: testUserId,
      });
    });

    // it('should filter contacts by name', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?name=Alice')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   expect(response.body).toHaveLength(1);
    //   expect(response.body[0].name).toBe('Alice Johnson');
    // });

    // it('should filter contacts by email', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?email=bob@finflow.com')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   expect(response.body).toHaveLength(1);
    //   expect(response.body[0].email).toBe('bob@finflow.com');
    // });

    // it('should filter contacts by company (case insensitive)', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?company=acme')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   expect(response.body).toHaveLength(1);
    //   expect(response.body[0].company).toBe('ACME Corp');
    // });

    // it('should sort contacts by name ascending', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?sortBy=name&order=asc')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   const names = response.body.map((contact: any) => contact.name);
    //   expect(names).toEqual([
    //     'Alice Johnson',
    //     'Bob Lee',
    //     'Charlie Brown',
    //     'Diana Prince',
    //   ]);
    // });

    // it('should sort contacts by name descending', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?sortBy=name&order=desc')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   const names = response.body.map((contact: any) => contact.name);
    //   expect(names).toEqual([
    //     'Diana Prince',
    //     'Charlie Brown',
    //     'Bob Lee',
    //     'Alice Johnson',
    //   ]);
    // });

    // it('should return empty array when no contacts match filter', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/contacts?name=NonExistent')
    //     .set(mockAuthHeaders)
    //     .expect(200);

    //   expect(response.body).toHaveLength(0);
    // });

    // it('should return 401 when no auth provided', async () => {
    //   await request(app.getHttpServer()).get('/contacts').expect(401);
    // });
  });

  //   describe('GET /contacts/:id', () => {
  //     let contactId: string;

  //     beforeEach(async () => {
  //       const contact = await prisma.contact.create({
  //         data: {
  //           name: 'Test Contact',
  //           email: 'test@example.com',
  //           userId: testUserId,
  //         },
  //       });
  //       contactId = contact.id;
  //     });

  //     it('should return contact by id', async () => {
  //       const response = await request(app.getHttpServer())
  //         .get(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .expect(200);

  //       expect(response.body).toMatchObject({
  //         id: contactId,
  //         name: 'Test Contact',
  //         email: 'test@example.com',
  //         userId: testUserId,
  //       });
  //     });

  //     it('should return 404 when contact not found', async () => {
  //       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

  //       const response = await request(app.getHttpServer())
  //         .get(`/contacts/${nonExistentId}`)
  //         .set(mockAuthHeaders)
  //         .expect(404);

  //       expect(response.body.message).toContain('not found');
  //     });

  //     it('should return 400 when id is not a valid UUID', async () => {
  //       await request(app.getHttpServer())
  //         .get('/contacts/invalid-uuid')
  //         .set(mockAuthHeaders)
  //         .expect(400);
  //     });

  //     it("should return 404 when trying to access another user's contact", async () => {
  //       // Create contact for different user
  //       const otherUserId = '11111111-1111-1111-1111-111111111111';
  //       await prisma.user.upsert({
  //         where: { id: otherUserId },
  //         update: {},
  //         create: { id: otherUserId, email: 'other@example.com' },
  //       });

  //       const otherContact = await prisma.contact.create({
  //         data: {
  //           name: 'Other User Contact',
  //           userId: otherUserId,
  //         },
  //       });

  //       await request(app.getHttpServer())
  //         .get(`/contacts/${otherContact.id}`)
  //         .set(mockAuthHeaders)
  //         .expect(404);
  //     });
  //   });

  //   describe('PATCH /contacts/:id', () => {
  //     let contactId: string;

  //     beforeEach(async () => {
  //       const contact = await prisma.contact.create({
  //         data: {
  //           name: 'Original Name',
  //           email: 'original@example.com',
  //           phone: '+1111111111',
  //           company: 'Original Corp',
  //           title: 'Original Title',
  //           userId: testUserId,
  //         },
  //       });
  //       contactId = contact.id;
  //     });

  //     it('should update all fields', async () => {
  //       const updateDto = {
  //         name: 'Updated Name',
  //         email: 'updated@example.com',
  //         phone: '+2222222222',
  //         company: 'Updated Corp',
  //         title: 'Updated Title',
  //       };

  //       const response = await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send(updateDto)
  //         .expect(200);

  //       expect(response.body).toMatchObject({
  //         id: contactId,
  //         ...updateDto,
  //         userId: testUserId,
  //       });
  //     });

  //     it('should update partial fields', async () => {
  //       const updateDto = {
  //         name: 'Partially Updated',
  //         email: 'partial@example.com',
  //       };

  //       const response = await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send(updateDto)
  //         .expect(200);

  //       expect(response.body).toMatchObject({
  //         id: contactId,
  //         name: 'Partially Updated',
  //         email: 'partial@example.com',
  //         phone: '+1111111111', // unchanged
  //         company: 'Original Corp', // unchanged
  //         title: 'Original Title', // unchanged
  //       });
  //     });

  //     it('should update single field', async () => {
  //       const updateDto = { name: 'Only Name Changed' };

  //       const response = await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send(updateDto)
  //         .expect(200);

  //       expect(response.body.name).toBe('Only Name Changed');
  //       expect(response.body.email).toBe('original@example.com');
  //     });

  //     it('should clear optional fields when set to null', async () => {
  //       const updateDto = {
  //         email: null,
  //         phone: null,
  //         company: null,
  //         title: null,
  //       };

  //       const response = await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send(updateDto)
  //         .expect(200);

  //       expect(response.body).toMatchObject({
  //         id: contactId,
  //         name: 'Original Name',
  //         email: null,
  //         phone: null,
  //         company: null,
  //         title: null,
  //       });
  //     });

  //     it('should return 404 when contact not found', async () => {
  //       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

  //       await request(app.getHttpServer())
  //         .patch(`/contacts/${nonExistentId}`)
  //         .set(mockAuthHeaders)
  //         .send({ name: 'Updated Name' })
  //         .expect(404);
  //     });

  //     it('should return 400 when email format is invalid', async () => {
  //       await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send({ email: 'invalid-email' })
  //         .expect(400);
  //     });

  //     it('should return 409 when email conflicts with existing contact', async () => {
  //       // Create another contact with different email
  //       await prisma.contact.create({
  //         data: {
  //           name: 'Another Contact',
  //           email: 'conflict@example.com',
  //           userId: testUserId,
  //         },
  //       });

  //       // Try to update original contact to use conflicting email
  //       await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send({ email: 'conflict@example.com' })
  //         .expect(409);
  //     });

  //     it('should allow updating to same email (no conflict)', async () => {
  //       const response = await request(app.getHttpServer())
  //         .patch(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .send({ email: 'original@example.com' })
  //         .expect(200);

  //       expect(response.body.email).toBe('original@example.com');
  //     });
  //   });

  //   describe('DELETE /contacts/:id', () => {
  //     let contactId: string;

  //     beforeEach(async () => {
  //       const contact = await prisma.contact.create({
  //         data: {
  //           name: 'To Be Deleted',
  //           email: 'delete@example.com',
  //           userId: testUserId,
  //         },
  //       });
  //       contactId = contact.id;
  //     });

  //     it('should delete contact', async () => {
  //       const response = await request(app.getHttpServer())
  //         .delete(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .expect(200);

  //       expect(response.body).toMatchObject({
  //         id: contactId,
  //         name: 'To Be Deleted',
  //         email: 'delete@example.com',
  //       });

  //       // Verify contact is actually deleted
  //       const deletedContact = await prisma.contact.findUnique({
  //         where: { id: contactId },
  //       });
  //       expect(deletedContact).toBeNull();
  //     });

  //     it('should return 404 when contact not found', async () => {
  //       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

  //       await request(app.getHttpServer())
  //         .delete(`/contacts/${nonExistentId}`)
  //         .set(mockAuthHeaders)
  //         .expect(404);
  //     });

  //     it('should delete contact and associated notes', async () => {
  //       // Add notes to the contact
  //       await prisma.note.createMany({
  //         data: [
  //           {
  //             title: 'Note 1',
  //             body: 'Content 1',
  //             contactId: contactId,
  //           },
  //           {
  //             title: 'Note 2',
  //             body: 'Content 2',
  //             contactId: contactId,
  //           },
  //         ],
  //       });

  //       // Delete contact
  //       await request(app.getHttpServer())
  //         .delete(`/contacts/${contactId}`)
  //         .set(mockAuthHeaders)
  //         .expect(200);

  //       // Verify notes are also deleted (cascade)
  //       const notes = await prisma.note.findMany({
  //         where: { contactId: contactId },
  //       });
  //       expect(notes).toHaveLength(0);
  //     });

  //     it('should return 400 when id is not a valid UUID', async () => {
  //       await request(app.getHttpServer())
  //         .delete('/contacts/invalid-uuid')
  //         .set(mockAuthHeaders)
  //         .expect(400);
  //     });
  //   });
});
