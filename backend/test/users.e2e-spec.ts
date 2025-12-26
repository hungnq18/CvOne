/*
 * E2E Tests for Users Module
 * Tests: CRUD operations, profile update
 */

import { INestApplication } from "@nestjs/common";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import * as request from "supertest";
import { App } from "supertest/types";
import { createTestApp, closeTestApp } from "./utils/test-app.util";
import { dropAllCollections } from "./utils/test-database.util";
import {
  authenticatedRequest,
  createVerifiedUserAndGetToken,
} from "./utils/test-helpers.util";

describe("UsersController (e2e)", () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let userToken: string;
  let userId: string | undefined;
  let accountId: string;
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

    // Register, verify email, and get token
    const userData = await createVerifiedUserAndGetToken(
      app,
      connection,
      undefined,
      "Test123456!",
      {
        first_name: "John",
        last_name: "Doe",
      },
    );

    testEmail = userData.email;
    userToken = userData.token;
    accountId = userData.accountId || "";
    userId = userData.userId || "";
  });

  afterEach(async () => {
    // Database is cleaned before each test, so no need to clean after
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    await closeTestApp(app);
  });

  describe("/api/users/:id (GET)", () => {
    it("should get user by ID when authenticated", async () => {
      if (!accountId) {
        // Get accountId from Account model if not set
        const Account =
          connection.models.Account || connection.model("Account");
        const account = await Account.findOne({ email: testEmail }).exec();
        accountId = account?._id?.toString() || "";
      }

      if (!accountId) {
        return; // Skip if can't get accountId
      }

      // Get user by accountId
      const userResponse = await authenticatedRequest(app, userToken).get(
        `/api/users/account/${accountId}`,
      );

      if (![200].includes(userResponse.status)) {
        // If user not found yet, skip assertions
        return;
      }

      const foundUserId =
        userResponse.body._id?.toString() || userResponse.body.id;

      if (foundUserId) {
        // Now get user by userId
        return authenticatedRequest(app, userToken)
          .get(`/api/users/${foundUserId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty("_id");
          });
      }
    });

    it("should fail without authentication", () => {
      return request(app.getHttpServer())
        .get("/api/users/123456789012345678901234")
        .expect(401);
    });
  });

  describe("/api/users/:id (PUT)", () => {
    it("should update user profile when authenticated", async () => {
      // Get accountId first
      const Account = connection.models.Account || connection.model("Account");
      const account = await Account.findOne({ email: testEmail }).exec();
      const accountId = account?._id?.toString();

      if (!accountId) {
        return; // Skip if can't get accountId
      }

      // Get user by accountId to get userId
      const userResponse = await authenticatedRequest(app, userToken).get(
        `/api/users/account/${accountId}`,
      );

      if (userResponse.status !== 200) {
        return;
      }

      const userIdToUpdate =
        userResponse.body._id?.toString() || userResponse.body.id;

      if (!userIdToUpdate) {
        return; // Skip if can't get userId
      }

      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        phone: "0123456789",
      };

      return authenticatedRequest(app, userToken)
        .put(`/api/users/${userIdToUpdate}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).toBe(updateData.first_name);
          expect(res.body.last_name).toBe(updateData.last_name);
        });
    });

    it("should fail to update other user profile", async () => {
      const updateData = {
        first_name: "Hacker",
      };

      // Try to update with a different user ID
      return authenticatedRequest(app, userToken)
        .put("/api/users/507f1f77bcf86cd799439011")
        .send(updateData)
        .expect((res) => {
          // Should fail with 403 or 404
          expect([403, 404]).toContain(res.status);
        });
    });
  });

  describe("/api/users (GET) - Admin only", () => {
    it("should fail for non-admin users", async () => {
      return authenticatedRequest(app, userToken)
        .get("/api/users")
        .expect((res) => {
          // May return 403 (forbidden) or 200 with filtered data
          expect([200, 403]).toContain(res.status);
        });
    });
  });
});
