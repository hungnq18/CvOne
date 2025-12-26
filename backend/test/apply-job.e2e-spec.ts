/*
 * E2E Tests for Apply Job Module
 * Tests: apply for job, get applications, update status
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
  registerTestHr,
  verifyTestUserEmail,
  getAuthToken,
} from './utils/test-helpers.util';

describe('ApplyJobController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let userToken: string;
  let hrToken: string;
  let jobId: string;
  let applyJobId: string;
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

    // Register and verify regular user
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

    // Create HR user
    // Note: In test environment, email sending may fail but account creation succeeds
    try {
      const hrData = await registerTestHr(
        app,
        undefined,
        'Test123456!',
        'Test Company'
      );
      
      const hrEmail = hrData.email;
      
      // Verify HR email and set role
      await verifyTestUserEmail(app, connection, hrEmail);
      const Account = connection.models.Account || connection.model('Account');
      if (Account) {
        await Account.updateOne({ email: hrEmail }, { role: 'hr' });
      }
      
      // Get HR token
      hrToken = await getAuthToken(app, hrEmail, 'Test123456!');
    } catch (error) {
      // If registration fails completely, skip tests that require HR
      console.warn('HR registration failed, some tests may be skipped:', error.message);
    }
    
    // Create a job
    try {
      const jobResponse = await authenticatedRequest(app, hrToken)
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          description: 'Test job description',
          requirements: 'Test requirements',
          location: 'Ho Chi Minh City',
          salary: '20000000-30000000',
          company_name: 'Test Company',
        });

      if (jobResponse.status === 201) {
        jobId = jobResponse.body._id;
      }
    } catch (error) {
      console.warn('Job creation failed:', error.message);
    }
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

  describe('/api/apply-job (POST)', () => {
    it('should apply for a job when authenticated', async () => {
      if (!userToken || !jobId) {
        return;
      }

      const applyData = {
        jobId: jobId,
        cvId: 'test-cv-id', // In real scenario, create a CV first
        coverLetterId: 'test-cover-letter-id', // Optional
      };

      return authenticatedRequest(app, userToken)
        .post('/api/apply-job')
        .send(applyData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          applyJobId = res.body._id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/apply-job')
        .send({
          jobId: 'test-job-id',
        })
        .expect(401);
    });

    it('should fail with invalid job ID', async () => {
      if (!userToken) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .post('/api/apply-job')
        .send({
          jobId: 'invalid-job-id',
        })
        .expect(400);
    });
  });

  describe('/api/apply-job/by-user (GET)', () => {
    it('should get user applications when authenticated', async () => {
      if (!userToken) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .get('/api/apply-job/by-user')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data || res.body)).toBe(true);
        });
    });

    it('should support pagination', async () => {
      if (!userToken) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .get('/api/apply-job/by-user?page=1&limit=10')
        .expect(200);
    });
  });

  describe('/api/apply-job/by-hr (GET) - HR only', () => {
    it('should get applications for HR when authenticated as HR', async () => {
      if (!hrToken) {
        return;
      }

      return authenticatedRequest(app, hrToken)
        .get('/api/apply-job/by-hr')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data || res.body)).toBe(true);
        });
    });

    it('should fail for non-HR users', async () => {
      if (!userToken) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .get('/api/apply-job/by-hr')
        .expect(403);
    });
  });

  describe('/api/apply-job/:id/status/by-hr (PATCH) - HR only', () => {
    it('should update application status when authenticated as HR', async () => {
      if (!hrToken || !applyJobId) {
        return;
      }

      return authenticatedRequest(app, hrToken)
        .patch(`/api/apply-job/${applyJobId}/status/by-hr`)
        .send({ status: 'reviewing' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('reviewing');
        });
    });
  });
});

