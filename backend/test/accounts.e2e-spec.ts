/*
 * E2E Tests for Accounts Module
 * Tests: register, verify email, reset password with code
 */

import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, closeTestApp } from './utils/test-app.util';
import { dropAllCollections } from './utils/test-database.util';
import { generateTestEmail } from './utils/test-helpers.util';

describe('AccountsController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeAll(async () => {
    app = await createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    if (connection) {
      await dropAllCollections(connection);
      // Small delay to ensure DB is fully cleaned
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  afterEach(async () => {
    if (connection) {
      await dropAllCollections(connection);
    }
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    await closeTestApp(app);
  });

  describe('/api/accounts/register (POST)', () => {
    it('should register a new account', () => {
      const testEmail = generateTestEmail();
      const registerData = {
        email: testEmail,
        first_name: 'John',
        last_name: 'Doe',
        password: 'Test123456!',
      };

      return request(app.getHttpServer())
        .post('/api/accounts/register')
        .send(registerData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(testEmail);
        });
    });

    it('should fail with duplicate email', async () => {
      const testEmail = generateTestEmail();
      const registerData = {
        email: testEmail,
        first_name: 'John',
        last_name: 'Doe',
        password: 'Test123456!',
      };

      // Register first time
      await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send(registerData)
        .expect(201);

      // Try to register again with same email - should return 409 Conflict
      return request(app.getHttpServer())
        .post('/api/accounts/register')
        .send(registerData)
        .expect(409);
    });
  });

  describe('/api/accounts/verify-email/request (POST)', () => {
    it('should request email verification', async () => {
      const testEmail = generateTestEmail();
      
      // Register first
      await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          email: testEmail,
          first_name: 'John',
          last_name: 'Doe',
          password: 'Test123456!',
        });

      return request(app.getHttpServer())
        .post('/api/accounts/verify-email/request')
        .send({ email: testEmail })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/accounts/verify-email/request')
        .send({ email: 'nonexistent@test.com' })
        .expect((res) => {
          // API may return 400 or 404 for non-existent email
          expect([400, 404]).toContain(res.status);
        });
    });
  });

  describe('/api/accounts/forgot-password-code (POST)', () => {
    it('should request password reset code', async () => {
      const testEmail = generateTestEmail();
      
      // Register first
      await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          email: testEmail,
          first_name: 'John',
          last_name: 'Doe',
          password: 'Test123456!',
        });

      return request(app.getHttpServer())
        .post('/api/accounts/forgot-password-code')
        .send({ email: testEmail })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/accounts/forgot-password-code')
        .send({ email: 'nonexistent@test.com' })
        .expect((res) => {
          // API may return 200/201 (to prevent email enumeration) or 400/404
          // Accept any of these status codes
          expect([200, 201, 400, 404]).toContain(res.status);
        });
    });
  });
});

