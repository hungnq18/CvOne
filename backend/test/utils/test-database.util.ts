/*
 * Test database utilities
 * Helper functions for managing test database
 */

import { MongooseModule } from "@nestjs/mongoose";
import { MongooseModuleOptions } from "@nestjs/mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";

/**
 * Get test database configuration
 * Uses MONGODB_URI_TEST if available, otherwise appends '_test' to database name
 */
export function getTestDatabaseConfig(): MongooseModuleOptions {
    const testUri = process.env.MONGODB_URI_TEST;

    if (testUri) {
        return { uri: testUri };
    }

    // If no test URI, modify the production URI to use test database
    const prodUri = process.env.MONGODB_URI || "mongodb://localhost:27017/cvone";
    const uri = prodUri.replace(/\/([^\/]+)$/, "/cvone_test");

    return { uri };
}

/**
 * Drop all collections in test database
 * This deletes all documents from all collections
 */
export async function dropAllCollections(
    connection: Connection,
): Promise<void> {
    try {
        const collections = connection.collections;

        for (const key in collections) {
            try {
                await collections[key].deleteMany({});
            } catch (error) {
                // Ignore errors for collections that don't exist
                console.warn(`Failed to clean collection ${key}:`, error.message);
            }
        }
    } catch (error) {
        console.warn("Error cleaning database:", error.message);
    }
}

/**
 * Drop all collections completely (removes collections)
 * Use with caution - this removes indexes too
 */
export async function dropAllCollectionsCompletely(
    connection: Connection,
): Promise<void> {
    try {
        const collections = connection.collections;

        for (const key in collections) {
            try {
                await collections[key].drop();
            } catch (error) {
                // Ignore errors for collections that don't exist
                console.warn(`Failed to drop collection ${key}:`, error.message);
            }
        }
    } catch (error) {
        console.warn("Error dropping collections:", error.message);
    }
}

/**
 * Close all database connections
 */
export async function closeDatabaseConnections(
    connection: Connection,
): Promise<void> {
    await connection.close();
}

/**
 * Create MongooseModule for testing with test database
 */
export function getTestMongooseModule() {
    return MongooseModule.forRootAsync({
        useFactory: () => getTestDatabaseConfig(),
    });
}
