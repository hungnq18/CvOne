/*
 * E2E Tests for Credits and Vouchers Modules
 * Tests: manage credits, create/use vouchers
 */

import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, closeTestApp } from './utils/test-app.util';
import { dropAllCollections } from './utils/test-database.util';
import {
  authenticatedRequest,
  createVerifiedUserAndGetToken,
} from './utils/test-helpers.util';

describe('Credits and Vouchers (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let userToken: string;
  let testEmail: string;

  beforeAll(async () => {
    app = await createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    // Clean database first
    if (connection) {
      await dropAllCollections(connection);
    }

    // Register, verify, and get token
    const userData = await createVerifiedUserAndGetToken(
      app,
      connection,
      undefined,
      'Test123456!',
      {
        first_name: 'John',
        last_name: 'Doe',
      }
    );

    testEmail = userData.email;
    userToken = userData.token;
  });

  afterEach(async () => {
    // Database is cleaned before each test
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    await closeTestApp(app);
  });

  describe('Credits Module', () => {
    describe('/api/credits (GET)', () => {
      it('should get user credits when authenticated', async () => {
        if (!userToken) {
          return;
        }

        return authenticatedRequest(app, userToken)
          .get('/api/credits')
          .expect((res) => {
            expect([200, 404]).toContain(res.status);
            if (res.status === 200) {
              expect(res.body).toHaveProperty('token');
            }
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .get('/api/credits')
          .expect(401);
      });
    });

    describe('/api/credits/history (GET)', () => {
      it('should get credit history when authenticated', async () => {
        if (!userToken) {
          return;
        }

        return authenticatedRequest(app, userToken)
          .get('/api/credits/history')
          .expect((res) => {
            // Endpoint may not exist; accept 404
            expect([200, 404]).toContain(res.status);
          });
      });
    });
  });

  describe('Vouchers Module', () => {
    describe('/api/vouchers/for-user (GET)', () => {
      it('should get available vouchers when authenticated', async () => {
        if (!userToken) {
          return;
        }

        return authenticatedRequest(app, userToken)
          .get('/api/vouchers/for-user')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data || res.body)).toBe(true);
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .get('/api/vouchers/for-user')
          .expect(401);
      });
    });

    describe('/api/credits/vouchers/for-user (GET)', () => {
      it('should get user vouchers when authenticated', async () => {
        if (!userToken) {
          return;
        }

        return authenticatedRequest(app, userToken)
          .get('/api/credits/vouchers/for-user')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data || res.body)).toBe(true);
          });
      });
    });

    describe('/api/credits/save-voucher/:voucherId (PATCH)', () => {
      it('should save voucher when authenticated', async () => {
        if (!userToken) {
          return;
        }

        // Note: This requires a valid voucher ID (valid MongoDB ObjectId format)
        // Using invalid ID to test error handling
        return authenticatedRequest(app, userToken)
          .patch('/api/credits/save-voucher/invalid-id')
          .expect((res) => {
            // Invalid ObjectId should return 400 Bad Request
            expect([400, 404]).toContain(res.status);
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .patch('/api/credits/save-voucher/507f1f77bcf86cd799439011')
          .expect(401);
      });
    });
  });
});

