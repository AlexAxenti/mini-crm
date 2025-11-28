// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import request from 'supertest';
// import { AppModule } from '../src/app.module';
// import { PrismaService } from '../src/prisma.service';
// import {
//   setupMockGuards,
//   createMockAuthHeaders,
//   TEST_CONFIG,
// } from './setup/test-helpers';

// describe('NotesController Integration', () => {
//   let app: INestApplication;
//   let prisma: PrismaService;
//   let testUserId: string;
//   let testContactId: string;
//   let testNoteId: string;
//   let mockAuthHeaders: Record<string, string>;

//   beforeAll(async () => {
//     const moduleBuilder = Test.createTestingModule({
//       imports: [AppModule],
//     });

//     const moduleFixture: TestingModule =
//       await setupMockGuards(moduleBuilder).compile();

//     app = moduleFixture.createNestApplication();

//     // Add test middleware to set userId from headers
//     app.use((req: any, res: any, next: () => void) => {
//       if (req.headers && req.headers['x-user-id']) {
//         req.userId = req.headers['x-user-id'];
//       }
//       next();
//     });

//     app.useGlobalPipes(new ValidationPipe({ transform: true }));
//     await app.init();

//     prisma = moduleFixture.get<PrismaService>(PrismaService);
//     testUserId = TEST_CONFIG.TEST_USER_ID;
//     mockAuthHeaders = createMockAuthHeaders(testUserId);

//     // Ensure test user exists
//     await prisma.user.upsert({
//       where: { id: testUserId },
//       update: {},
//       create: { id: testUserId, email: 'test@example.com' },
//     });
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   beforeEach(async () => {
//     // Clean up notes and contacts before each test
//     await prisma.note.deleteMany({
//       where: { contact: { userId: testUserId } },
//     });
//     await prisma.contact.deleteMany({ where: { userId: testUserId } });

//     // Create a test contact for notes
//     const contact = await prisma.contact.create({
//       data: {
//         name: 'Test Contact',
//         email: 'contact@example.com',
//         userId: testUserId,
//       },
//     });
//     testContactId = contact.id;
//   });

//   describe('POST /notes/:contactId', () => {
//     it('should create a note with all fields', async () => {
//       const createNoteDto = {
//         title: 'Meeting Notes',
//         body: 'Discussed project requirements and timeline.',
//       };

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .set(mockAuthHeaders)
//         .send(createNoteDto)
//         .expect(201);

//       expect(response.body).toMatchObject({
//         id: expect.any(String),
//         title: 'Meeting Notes',
//         body: 'Discussed project requirements and timeline.',
//         contactId: testContactId,
//         createdAt: expect.any(String),
//         updatedAt: expect.any(String),
//       });

//       testNoteId = response.body.id;
//     });

//     it('should create a note with only required fields', async () => {
//       const createNoteDto = {
//         title: 'Quick Note',
//       };

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .set(mockAuthHeaders)
//         .send(createNoteDto)
//         .expect(201);

//       expect(response.body).toMatchObject({
//         id: expect.any(String),
//         title: 'Quick Note',
//         body: null,
//         contactId: testContactId,
//       });
//     });

//     it('should create note with long body text', async () => {
//       const longBody = 'Lorem ipsum '.repeat(100);
//       const createNoteDto = {
//         title: 'Long Note',
//         body: longBody,
//       };

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .set(mockAuthHeaders)
//         .send(createNoteDto)
//         .expect(201);

//       expect(response.body.body).toBe(longBody);
//     });

//     it('should create multiple notes for the same contact', async () => {
//       const notes = [
//         { title: 'Note 1', body: 'First note content' },
//         { title: 'Note 2', body: 'Second note content' },
//         { title: 'Note 3' },
//       ];

//       for (const note of notes) {
//         const response = await request(app.getHttpServer())
//           .post(`/notes/${testContactId}`)
//           .set(mockAuthHeaders)
//           .send(note)
//           .expect(201);

//         expect(response.body.title).toBe(note.title);
//         expect(response.body.contactId).toBe(testContactId);
//         if (note.body) expect(response.body.body).toBe(note.body);
//       }
//     });

//     it('should return 400 when title is missing', async () => {
//       const createNoteDto = {
//         body: 'Note without title',
//       };

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .set(mockAuthHeaders)
//         .send(createNoteDto)
//         .expect(400);

//       expect(response.body.message).toContain('title');
//     });

//     it('should return 400 when title is empty string', async () => {
//       const createNoteDto = {
//         title: '',
//       };

//       await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .set(mockAuthHeaders)
//         .send(createNoteDto)
//         .expect(400);
//     });

//     it('should return 404 when contact does not exist', async () => {
//       const nonExistentContactId = '123e4567-e89b-12d3-a456-426614174000';

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${nonExistentContactId}`)
//         .set(mockAuthHeaders)
//         .send({ title: 'Note for non-existent contact' })
//         .expect(404);

//       expect(response.body.message).toContain('Contact');
//       expect(response.body.message).toContain('not found');
//     });

//     it('should return 400 when contact ID is invalid UUID', async () => {
//       await request(app.getHttpServer())
//         .post('/notes/invalid-uuid')
//         .set(mockAuthHeaders)
//         .send({ title: 'Test Note' })
//         .expect(400);
//     });

//     it("should return 404 when trying to create note for another user's contact", async () => {
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

//       const response = await request(app.getHttpServer())
//         .post(`/notes/${otherContact.id}`)
//         .set(mockAuthHeaders)
//         .send({ title: 'Unauthorized Note' })
//         .expect(404);

//       expect(response.body.message).toContain('Contact');
//       expect(response.body.message).toContain('not found');
//     });

//     it('should return 401 when no auth headers provided', async () => {
//       await request(app.getHttpServer())
//         .post(`/notes/${testContactId}`)
//         .send({ title: 'Unauthorized Note' })
//         .expect(401);
//     });
//   });

//   describe('GET /notes', () => {
//     beforeEach(async () => {
//       // Create multiple contacts and notes for testing
//       const contacts = [
//         { name: 'Contact 1', email: 'contact1@example.com' },
//         { name: 'Contact 2', email: 'contact2@example.com' },
//       ];

//       for (const contactData of contacts) {
//         const contact = await prisma.contact.create({
//           data: { ...contactData, userId: testUserId },
//         });

//         // Create notes for each contact
//         await prisma.note.createMany({
//           data: [
//             {
//               title: `${contactData.name} - Meeting`,
//               body: `Meeting notes with ${contactData.name}`,
//               contactId: contact.id,
//             },
//             {
//               title: `${contactData.name} - Follow-up`,
//               body: `Follow-up task for ${contactData.name}`,
//               contactId: contact.id,
//             },
//           ],
//         });
//       }
//     });

//     it('should return all notes for user', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes')
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toHaveLength(4);
//       response.body.forEach((note: any) => {
//         expect(note).toMatchObject({
//           id: expect.any(String),
//           title: expect.any(String),
//           contactId: expect.any(String),
//         });
//       });
//     });

//     it('should filter notes by contact ID', async () => {
//       const response = await request(app.getHttpServer())
//         .get(`/notes?contactId=${testContactId}`)
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toHaveLength(0); // testContact has no notes in this scenario
//     });

//     it('should filter notes by title', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes?title=Meeting')
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toHaveLength(2);
//       response.body.forEach((note: any) => {
//         expect(note.title.toLowerCase()).toContain('meeting');
//       });
//     });

//     it('should filter notes by body content', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes?body=Follow-up')
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toHaveLength(2);
//       response.body.forEach((note: any) => {
//         expect(note.body.toLowerCase()).toContain('follow-up');
//       });
//     });

//     it('should sort notes by title ascending', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes?sortBy=title&order=asc')
//         .set(mockAuthHeaders)
//         .expect(200);

//       const titles = response.body.map((note: any) => note.title);
//       const sortedTitles = [...titles].sort();
//       expect(titles).toEqual(sortedTitles);
//     });

//     it('should sort notes by created date descending', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes?sortBy=createdAt&order=desc')
//         .set(mockAuthHeaders)
//         .expect(200);

//       const dates = response.body.map((note: any) => new Date(note.createdAt));
//       for (let i = 1; i < dates.length; i++) {
//         expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(
//           dates[i].getTime(),
//         );
//       }
//     });

//     it('should return empty array when no notes match filter', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/notes?title=NonExistentNote')
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toHaveLength(0);
//     });

//     it('should return 401 when no auth provided', async () => {
//       await request(app.getHttpServer()).get('/notes').expect(401);
//     });
//   });

//   describe('GET /notes/:id', () => {
//     let noteId: string;

//     beforeEach(async () => {
//       const note = await prisma.note.create({
//         data: {
//           title: 'Test Note',
//           body: 'Test note content',
//           contactId: testContactId,
//         },
//       });
//       noteId = note.id;
//     });

//     it('should return note by id', async () => {
//       const response = await request(app.getHttpServer())
//         .get(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         id: noteId,
//         title: 'Test Note',
//         body: 'Test note content',
//         contactId: testContactId,
//       });
//     });

//     it('should return 404 when note not found', async () => {
//       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

//       const response = await request(app.getHttpServer())
//         .get(`/notes/${nonExistentId}`)
//         .set(mockAuthHeaders)
//         .expect(404);

//       expect(response.body.message).toContain('not found');
//     });

//     it('should return 400 when id is not a valid UUID', async () => {
//       await request(app.getHttpServer())
//         .get('/notes/invalid-uuid')
//         .set(mockAuthHeaders)
//         .expect(400);
//     });

//     it("should return 404 when trying to access note from another user's contact", async () => {
//       // Create contact and note for different user
//       const otherUserId = '22222222-2222-2222-2222-222222222222';
//       await prisma.user.upsert({
//         where: { id: otherUserId },
//         update: {},
//         create: { id: otherUserId, email: 'other2@example.com' },
//       });

//       const otherContact = await prisma.contact.create({
//         data: {
//           name: 'Other Contact',
//           userId: otherUserId,
//         },
//       });

//       const otherNote = await prisma.note.create({
//         data: {
//           title: 'Other Note',
//           contactId: otherContact.id,
//         },
//       });

//       await request(app.getHttpServer())
//         .get(`/notes/${otherNote.id}`)
//         .set(mockAuthHeaders)
//         .expect(404);
//     });
//   });

//   describe('PATCH /notes/:id', () => {
//     let noteId: string;

//     beforeEach(async () => {
//       const note = await prisma.note.create({
//         data: {
//           title: 'Original Title',
//           body: 'Original content body',
//           contactId: testContactId,
//         },
//       });
//       noteId = note.id;
//     });

//     it('should update both title and body', async () => {
//       const updateDto = {
//         title: 'Updated Title',
//         body: 'Updated content body',
//       };

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         id: noteId,
//         title: 'Updated Title',
//         body: 'Updated content body',
//         contactId: testContactId,
//       });
//     });

//     it('should update only title', async () => {
//       const updateDto = { title: 'Only Title Updated' };

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         title: 'Only Title Updated',
//         body: 'Original content body', // unchanged
//       });
//     });

//     it('should update only body', async () => {
//       const updateDto = { body: 'Only body updated' };

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         title: 'Original Title', // unchanged
//         body: 'Only body updated',
//       });
//     });

//     it('should clear body when set to null', async () => {
//       const updateDto = { body: null };

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         title: 'Original Title',
//         body: null,
//       });
//     });

//     it('should handle empty update (no fields changed)', async () => {
//       const updateDto = {};

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         title: 'Original Title',
//         body: 'Original content body',
//       });
//     });

//     it('should return 404 when note not found', async () => {
//       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

//       await request(app.getHttpServer())
//         .patch(`/notes/${nonExistentId}`)
//         .set(mockAuthHeaders)
//         .send({ title: 'Updated Title' })
//         .expect(404);
//     });

//     it('should return 400 when title is empty string', async () => {
//       await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send({ title: '' })
//         .expect(400);
//     });

//     it('should return 400 when id is not a valid UUID', async () => {
//       await request(app.getHttpServer())
//         .patch('/notes/invalid-uuid')
//         .set(mockAuthHeaders)
//         .send({ title: 'Updated Title' })
//         .expect(400);
//     });

//     it('should update note with very long content', async () => {
//       const longContent = 'Very long content. '.repeat(200);
//       const updateDto = {
//         title: 'Long Content Note',
//         body: longContent,
//       };

//       const response = await request(app.getHttpServer())
//         .patch(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .send(updateDto)
//         .expect(200);

//       expect(response.body.body).toBe(longContent);
//     });
//   });

//   describe('DELETE /notes/:id', () => {
//     let noteId: string;

//     beforeEach(async () => {
//       const note = await prisma.note.create({
//         data: {
//           title: 'To Be Deleted',
//           body: 'This note will be deleted',
//           contactId: testContactId,
//         },
//       });
//       noteId = note.id;
//     });

//     it('should delete note', async () => {
//       const response = await request(app.getHttpServer())
//         .delete(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .expect(200);

//       expect(response.body).toMatchObject({
//         id: noteId,
//         title: 'To Be Deleted',
//         body: 'This note will be deleted',
//       });

//       // Verify note is actually deleted
//       const deletedNote = await prisma.note.findUnique({
//         where: { id: noteId },
//       });
//       expect(deletedNote).toBeNull();
//     });

//     it('should return 404 when note not found', async () => {
//       const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

//       await request(app.getHttpServer())
//         .delete(`/notes/${nonExistentId}`)
//         .set(mockAuthHeaders)
//         .expect(404);
//     });

//     it('should return 400 when id is not a valid UUID', async () => {
//       await request(app.getHttpServer())
//         .delete('/notes/invalid-uuid')
//         .set(mockAuthHeaders)
//         .expect(400);
//     });

//     it("should return 404 when trying to delete note from another user's contact", async () => {
//       // Create contact and note for different user
//       const otherUserId = '33333333-3333-3333-3333-333333333333';
//       await prisma.user.upsert({
//         where: { id: otherUserId },
//         update: {},
//         create: { id: otherUserId, email: 'other3@example.com' },
//       });

//       const otherContact = await prisma.contact.create({
//         data: {
//           name: 'Other Contact for Delete',
//           userId: otherUserId,
//         },
//       });

//       const otherNote = await prisma.note.create({
//         data: {
//           title: 'Other Note to Delete',
//           contactId: otherContact.id,
//         },
//       });

//       await request(app.getHttpServer())
//         .delete(`/notes/${otherNote.id}`)
//         .set(mockAuthHeaders)
//         .expect(404);

//       // Verify note still exists (wasn't deleted)
//       const stillExists = await prisma.note.findUnique({
//         where: { id: otherNote.id },
//       });
//       expect(stillExists).not.toBeNull();
//     });

//     it('should delete note and preserve contact', async () => {
//       // Create additional note for same contact
//       const anotherNote = await prisma.note.create({
//         data: {
//           title: 'Another Note',
//           contactId: testContactId,
//         },
//       });

//       // Delete first note
//       await request(app.getHttpServer())
//         .delete(`/notes/${noteId}`)
//         .set(mockAuthHeaders)
//         .expect(200);

//       // Verify contact still exists
//       const contact = await prisma.contact.findUnique({
//         where: { id: testContactId },
//       });
//       expect(contact).not.toBeNull();

//       // Verify other note still exists
//       const otherNote = await prisma.note.findUnique({
//         where: { id: anotherNote.id },
//       });
//       expect(otherNote).not.toBeNull();
//     });
//   });
// });
