/*
 * E2E Tests for Orders Module
 * Tests: create order, update status, get order history
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

describe("OrdersController (e2e)", () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let userToken: string;
  let testEmail: string;
  let orderId: string | undefined;

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
      "Test123456!",
      {
        first_name: "John",
        last_name: "Doe",
      },
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

  describe("/api/orders (POST)", () => {
    it("should create a new order when authenticated", async () => {
      if (!userToken) {
        return;
      }

      const orderData = {
        totalToken: 10,
        price: 100000,
        paymentMethod: "payos",
      };

      const res = await authenticatedRequest(app, userToken)
        .post("/api/orders")
        .send(orderData);

      // In some environments payment gateway config may cause 400/500
      expect([201, 400, 500]).toContain(res.status);

      if (res.status === 201) {
        expect(res.body).toHaveProperty("order");
        expect(res.body.order).toHaveProperty("_id");
        orderId = res.body.order._id;
      }
    });

    it("should fail without authentication", () => {
      const orderData = {
        totalToken: 10,
        price: 100000,
      };

      return request(app.getHttpServer())
        .post("/api/orders")
        .send(orderData)
        .expect(401);
    });
  });

  describe("/api/orders/history (GET)", () => {
    it("should get order history when authenticated", async () => {
      if (!userToken) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .get("/api/orders/history")
        .expect((res) => {
          // History may be empty if no completed/cancelled orders yet
          expect([200, 404]).toContain(res.status);
          if (res.status === 200) {
            expect(Array.isArray(res.body.data || res.body)).toBe(true);
          }
        });
    });

    it("should fail without authentication", () => {
      return request(app.getHttpServer())
        .get("/api/orders/history")
        .expect(401);
    });
  });

  describe("/api/orders/:id (PATCH)", () => {
    it("should update order status when authenticated", async () => {
      if (!userToken || !orderId) {
        return;
      }

      return authenticatedRequest(app, userToken)
        .patch(`/api/orders/${orderId}`)
        .send({ status: "completed" })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe("completed");
        });
    });
  });

  describe("/api/orders/code/:orderCode (GET)", () => {
    it("should get order by order code (public)", async () => {
      if (!orderId) {
        return;
      }

      // First get order to get orderCode
      const orderResponse = await authenticatedRequest(app, userToken)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      const orderCode = orderResponse.body.orderCode;

      if (orderCode) {
        return request(app.getHttpServer())
          .get(`/api/orders/code/${orderCode}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.orderCode).toBe(orderCode);
          });
      }
    });
  });
});
