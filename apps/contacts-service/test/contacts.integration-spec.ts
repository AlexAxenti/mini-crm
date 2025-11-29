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

describe('ContactsController Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;
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
    testUserId = TEST_CONFIG.TEST_CONTACTS_USER_ID;
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
    // Clean up notes and contacts in proper order (notes first due to foreign key)
    await prisma.note.deleteMany({
      where: { contact: { userId: testUserId } },
    });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
  });

  describe('GET /contacts', () => {
    beforeEach(async () => {
      // Create test contacts for query tests
      await prisma.contact.createMany({
        data: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Alice Johnson',
            email: 'alice@company.com',
            company: 'TechCorp',
            title: 'Developer',
            userId: testUserId,
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Bob Smith',
            email: 'bob@startup.com',
            company: 'StartupInc',
            title: 'Manager',
            userId: testUserId,
          },
        ],
      });
    });

    it('should return all contacts without filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Alice Johnson',
            email: 'alice@company.com',
            company: 'TechCorp',
          }),
          expect.objectContaining({
            name: 'Bob Smith',
            email: 'bob@startup.com',
            company: 'StartupInc',
          }),
        ]),
      );
    });

    it('should filter contacts by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .query({ name: 'Alice' })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Alice Johnson',
        email: 'alice@company.com',
      });
    });

    it('should filter contacts by company', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .query({ company: 'TechCorp' })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Alice Johnson',
        company: 'TechCorp',
      });
    });

    it('should sort contacts by name descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .query({ sortBy: 'name', order: 'desc' })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Bob Smith');
      expect(response.body[1].name).toBe('Alice Johnson');
    });

    it('should return empty array when no contacts match filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .query({ name: 'NonexistentName' })
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /contacts/:id', () => {
    it('should return contact by id', async () => {
      // Create a test contact
      const contact = await prisma.contact.create({
        data: {
          name: 'Test Contact',
          email: 'test@example.com',
          userId: testUserId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/contacts/${contact.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        id: contact.id,
        name: 'Test Contact',
        email: 'test@example.com',
        userId: testUserId,
      });
    });

    it('should return 404 for non-existent contact', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      const response = await request(app.getHttpServer())
        .get(`/contacts/${nonExistentId}`)
        .set(mockAuthHeaders)
        .expect(404);

      expect(response.body.message).toContain(
        `Contact with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('POST /contacts', () => {
    it('should create contact when none exists, then find it', async () => {
      // First verify no contacts exist
      const emptyResponse = await request(app.getHttpServer())
        .get('/contacts')
        .set(mockAuthHeaders)
        .expect(200);

      expect(emptyResponse.body).toHaveLength(0);

      // Create a contact
      const createContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Corp',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/contacts')
        .set(mockAuthHeaders)
        .send(createContactDto)
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Corp',
        userId: testUserId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      testContactId = createResponse.body.id;

      // Now verify we can find it
      const findResponse = await request(app.getHttpServer())
        .get('/contacts')
        .set(mockAuthHeaders)
        .expect(200);

      expect(findResponse.body).toHaveLength(1);
      expect(findResponse.body[0]).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('PATCH /contacts/:id', () => {
    it('should return 404 for non-existent contact', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const updateData = { name: 'Updated Name' };

      const response = await request(app.getHttpServer())
        .patch(`/contacts/${nonExistentId}`)
        .set(mockAuthHeaders)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain(
        `Contact with ID ${nonExistentId} not found`,
      );
    });

    it('should update contact and persist changes', async () => {
      // Create a contact
      const contact = await prisma.contact.create({
        data: {
          name: 'Original Name',
          email: 'original@example.com',
          userId: testUserId,
        },
      });

      // Update it
      const updateData = {
        name: 'Updated Name',
        company: 'New Company',
      };

      const patchResponse = await request(app.getHttpServer())
        .patch(`/contacts/${contact.id}`)
        .set(mockAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(patchResponse.body).toMatchObject({
        id: contact.id,
        name: 'Updated Name',
        email: 'original@example.com', // unchanged
        company: 'New Company',
        userId: testUserId,
      });

      // Verify changes persisted by getting the contact
      const getResponse = await request(app.getHttpServer())
        .get(`/contacts/${contact.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        name: 'Updated Name',
        company: 'New Company',
      });
    });
  });

  describe('DELETE /contacts/:id', () => {
    it('should return 404 for non-existent contact', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      const response = await request(app.getHttpServer())
        .delete(`/contacts/${nonExistentId}`)
        .set(mockAuthHeaders)
        .expect(404);

      expect(response.body.message).toContain(
        `Contact with ID ${nonExistentId} not found`,
      );
    });

    it('should delete contact and confirm removal', async () => {
      // Create a contact
      const contact = await prisma.contact.create({
        data: {
          name: 'To Be Deleted',
          email: 'delete@example.com',
          userId: testUserId,
        },
      });

      // Delete it
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/contacts/${contact.id}`)
        .set(mockAuthHeaders)
        .expect(200);

      expect(deleteResponse.body).toMatchObject({
        id: contact.id,
        name: 'To Be Deleted',
        email: 'delete@example.com',
        userId: testUserId,
      });

      // Verify it's gone by trying to get it
      await request(app.getHttpServer())
        .get(`/contacts/${contact.id}`)
        .set(mockAuthHeaders)
        .expect(404);
    });
  });
});
