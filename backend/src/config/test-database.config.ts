/*
 * Test database configuration
 * Used specifically for e2e tests
 */

import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions } from "@nestjs/mongoose";

/**
 * Get test database configuration
 * Prioritizes MONGODB_URI_TEST, falls back to modified production URI
 */
export const getTestMongoConfig = (
    configService: ConfigService,
): MongooseModuleOptions => {
    const testUri = configService.get<string>("MONGODB_URI_TEST");

    if (testUri) {
        return { uri: testUri };
    }

    // Fallback: modify production URI to use test database
    const prodUri =
        configService.get<string>("MONGODB_URI") ||
        "mongodb://localhost:27017/cvone";
    const uri = prodUri.replace(/\/([^/]+)$/, "/cvone_test");

    return { uri };
};
