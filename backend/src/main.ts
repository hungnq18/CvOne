/*
author: HungNQ
date: 2025-03-06
  The main entry point for the NestJS application.
  It initializes the application, sets up CORS, validation pipes, and starts the server.
  This file is responsible for bootstrapping the application and configuring global settings.
*/

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS
  app.enableCors({
    origin: ["http://localhost:3000"], // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: false, // Don't throw errors for non-whitelisted properties
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix for all routes
  app.setGlobalPrefix("api");
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useStaticAssets(join(__dirname, "uploads"), {
    prefix: "/uploads/",
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
