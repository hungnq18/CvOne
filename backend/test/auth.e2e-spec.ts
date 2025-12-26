/*
 * Example E2E Test for Auth Module
 * This file demonstrates how to write e2e tests for your modules
 */

import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, closeTestApp } from './utils/test-app.util';
import { dropAllCollections } from './utils/test-database.util';
import { 
  generateTestEmail,
  createVerifiedUserAndGetToken,
} from './utils/test-helpers.util';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeAll(async () => {
    app = await createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    // Clean up database before each test
    if (connection) {
      await dropAllCollections(connection);
      // Small delay to ensure DB is fully cleaned
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  afterEach(async () => {
    // Clean up database after each test
    if (connection) {
      await dropAllCollections(connection);
    }
  });

  afterAll(async () => {
    // Close app and database connections
    if (connection) {
      await connection.close();
    }
    await closeTestApp(app);
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const testEmail = generateTestEmail();
      const registerData = {
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        password: 'Test123456!',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(testEmail);
        });
    });

    it('should fail with invalid email format', () => {
      const registerData = {
        email: 'invalid-email',
        first_name: 'Test',
        last_name: 'User',
        password: 'Test123456!',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should fail with weak password (less than 6 characters)', () => {
      const testEmail = generateTestEmail();
      const registerData = {
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      const registerData = {
        email: generateTestEmail(),
        // Missing first_name, last_name, password
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    let testEmail: string;
    const testPassword = 'Test123456!';

    beforeEach(async () => {
      // Clean database first
      if (connection) {
        await dropAllCollections(connection);
      }

      // Register and verify user
      const userData = await createVerifiedUserAndGetToken(
        app,
        connection,
        undefined,
        testPassword,
        {
          first_name: 'Test',
          last_name: 'User',
        }
      );
      
      testEmail = userData.email;
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'wrong@email.com',
          password: testPassword,
        })
        .expect(401);
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });
});

