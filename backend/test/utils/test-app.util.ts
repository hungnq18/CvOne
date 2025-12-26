/*
 * Test application utilities
 * Helper functions for creating and configuring test application
 */

import { ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as bodyParser from "body-parser";
import { TestAppModule, MockMailService } from "./test-module.util";
import { MailService } from "../../src/modules/mail/mail.service";

/**
 * Create a test application with all configurations
 */
export async function createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestAppModule],
    })
        .overrideProvider(MailService)
        .useClass(MockMailService)
        .compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Apply same configurations as main.ts
    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

    app.enableCors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.setGlobalPrefix("api");

    await app.init();
    return app;
}

/**
 * Close test application
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
    if (app) {
        await app.close();
    }
}
