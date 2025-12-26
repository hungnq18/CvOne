import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, closeTestApp } from './utils/test-app.util';
import { dropAllCollections } from './utils/test-database.util';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeAll(async () => {
    app = await createTestApp();
    connection = app.get<Connection>(getConnectionToken());
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

  it('/api (GET) - should return hello message', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('Hello World!');
      });
  });
});
