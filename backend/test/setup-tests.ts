/*
 * Global test setup file
 * This file runs before all e2e tests
 */

import * as dotenv from "dotenv";
import { join } from "path";
import { clearLogFile, logInfo } from "./utils/test-logger.util";

// Load test environment variables
const envPath =
    process.env.NODE_ENV === "test"
        ? join(__dirname, "..", ".env.test")
        : join(__dirname, "..", ".env");

dotenv.config({ path: envPath });

// Set test environment
process.env.NODE_ENV = "test";

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test configuration
beforeAll(async () => {
    // Clear log file at the start of test suite
    clearLogFile();
    logInfo("Test suite started", {
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

afterAll(async () => {
    // Any global cleanup after all tests
    logInfo("Test suite completed", {
        timestamp: new Date().toISOString(),
    });
});
