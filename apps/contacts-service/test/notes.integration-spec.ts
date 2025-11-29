/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

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

describe('NotesController Integration', () => {
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
    testUserId = TEST_CONFIG.TEST_NOTES_USER_ID;
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
    // Clean up notes and contacts before each test
    await prisma.note.deleteMany({
      where: { contact: { userId: testUserId } },
    });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });

    // Create a test contact for notes
    const contact = await prisma.contact.create({
      data: {
        name: 'Test Contact',
        email: 'contact@example.com',
        userId: testUserId,
      },
    });
    testContactId = contact.id;
  });

  describe('GET /notes', () => {
    beforeEach(async () => {
      // Create first note
      await prisma.note.create({
        data: {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'First Note',
          body: 'Content of first note',
          contactId: testContactId,
        },
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create second note (should be more recent)
      await prisma.note.create({
        data: {
          id: '22222222-2222-2222-2222-222222222222',
          title: 'Second Note',
          body: 'Content of second note',
          contactId: testContactId,
        },
      });
    });

    it('should return all notes for contact', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .query({ contactId: testContactId })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'First Note',
            body: 'Content of first note',
            contactId: testContactId,
          }),
          expect.objectContaining({
            title: 'Second Note',
            body: 'Content of second note',
            contactId: testContactId,
          }),
        ]),
      );
    });

    it('should sort notes by updatedAt descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .query({ contactId: testContactId, sortBy: 'updatedAt', order: 'desc' })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      // Second note should come first (more recent)
      expect(response.body[0].title).toBe('Second Note');
      expect(response.body[1].title).toBe('First Note');
    });

    it('should return empty array for contact with no notes', async () => {
      // Create another contact with no notes
      const emptyContact = await prisma.contact.create({
        data: {
          name: 'Empty Contact',
          email: 'empty@example.com',
          userId: testUserId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/notes')
        .query({ contactId: emptyContact.id })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /notes/:id', () => {
    it('should return note by id', async () => {
      // Create a test note
      const note = await prisma.note.create({
        data: {
          title: 'Test Note',
          body: 'Test note content',
          contactId: testContactId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        id: note.id,
        title: 'Test Note',
        body: 'Test note content',
        contactId: testContactId,
      });
    });

    it('should return 404 for non-existent note', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      const response = await request(app.getHttpServer())
        .get(`/notes/${nonExistentId}`)
        .set(mockAuthHeaders)
        .expect(404);

      expect(response.body.message).toContain(
        `Note with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('POST /notes/:contactId', () => {
    it('should create note for contact, then find it', async () => {
      // First verify no notes exist for this contact
      const emptyResponse = await request(app.getHttpServer())
        .get('/notes')
        .query({ contactId: testContactId })
        .set(mockAuthHeaders)
        .expect(200);

      expect(emptyResponse.body).toHaveLength(0);

      // Create a note
      const createNoteDto = {
        title: 'New Note',
        body: 'This is a new note content',
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/notes/${testContactId}`)
        .set(mockAuthHeaders)
        .send(createNoteDto)
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: expect.any(String),
        title: 'New Note',
        body: 'This is a new note content',
        contactId: testContactId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      testNoteId = createResponse.body.id;

      // Now verify we can find it
      const findResponse = await request(app.getHttpServer())
        .get('/notes')
        .query({ contactId: testContactId })
        .set(mockAuthHeaders)
        .expect(200);

      expect(findResponse.body).toHaveLength(1);
      expect(findResponse.body[0]).toMatchObject({
        title: 'New Note',
        body: 'This is a new note content',
      });
    });
  });

  describe('PATCH /notes/:id', () => {
    it('should return 404 for non-existent note', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const updateData = { title: 'Updated Title' };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${nonExistentId}`)
        .set(mockAuthHeaders)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain(
        `Note with ID ${nonExistentId} not found`,
      );
    });

    it('should update note and persist changes', async () => {
      // Create a note
      const note = await prisma.note.create({
        data: {
          title: 'Original Title',
          body: 'Original content',
          contactId: testContactId,
        },
      });

      // Update it
      const updateData = {
        title: 'Updated Title',
        body: 'Updated content',
      };

      const patchResponse = await request(app.getHttpServer())
        .patch(`/notes/${note.id}`)
        .set(mockAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(patchResponse.body).toMatchObject({
        id: note.id,
        title: 'Updated Title',
        body: 'Updated content',
        contactId: testContactId,
      });

      // Verify changes persisted by getting the note
      const getResponse = await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        title: 'Updated Title',
        body: 'Updated content',
      });
    });
  });

  describe('DELETE /notes/:id', () => {
    it('should return 404 for non-existent note', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      const response = await request(app.getHttpServer())
        .delete(`/notes/${nonExistentId}`)
        .set(mockAuthHeaders)
        .expect(404);

      expect(response.body.message).toContain(
        `Note with ID ${nonExistentId} not found`,
      );
    });

    it('should delete note and confirm removal', async () => {
      // Create a note
      const note = await prisma.note.create({
        data: {
          title: 'To Be Deleted',
          body: 'This will be deleted',
          contactId: testContactId,
        },
      });

      // Delete it
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(deleteResponse.body).toMatchObject({
        id: note.id,
        title: 'To Be Deleted',
        body: 'This will be deleted',
        contactId: testContactId,
      });

      // Verify it's gone by trying to get it
      await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set(mockAuthHeaders)
        .expect(404);
    });
  });
});
