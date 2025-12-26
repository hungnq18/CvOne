/*
 * General test helpers
 * Utility functions for common test operations
 */

import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

/**
 * Register a test user and return account info
 */
export async function registerTestUser(
    app: INestApplication,
    email: string,
    password: string = "Test123456!",
    options: {
        first_name?: string;
        last_name?: string;
        role?: string;
        company_name?: string;
    } = {},
): Promise<any> {
    const registerData = {
        email,
        first_name: options.first_name || "Test",
        last_name: options.last_name || "User",
        password,
        ...options,
    };

    const response = await request(app.getHttpServer())
        .post("/api/accounts/register")
        .send(registerData);

    if (response.status === 201) {
        return response.body;
    }

    throw new Error(
        `Failed to register user: ${response.status} - ${JSON.stringify(response.body)}`,
    );
}

/**
 * Register HR user
 * Note: CreateAccountHRDto requires: company_name, company_country, company_city, company_district, vatRegistrationNumber
 */
export async function registerTestHr(
    app: INestApplication,
    email?: string,
    password: string = "Test123456!",
    company_name: string = "Test Company",
    company_country: string = "Vietnam",
    company_city: string = "Ho Chi Minh City",
    company_district: string = "District 1",
    vatRegistrationNumber: string = "1234567890",
): Promise<any> {
    const hrEmail = email || generateTestEmail();
    const response = await request(app.getHttpServer())
        .post("/api/accounts/register-hr")
        .send({
            email: hrEmail,
            first_name: "HR",
            last_name: "Manager",
            password,
            company_name,
            company_country,
            company_city,
            company_district,
            vatRegistrationNumber,
        });

    // Accept 201 (success)
    // Note: If email sending fails, the account is rolled back (deleted)
    // So we need to handle this case differently
    if (response.status === 201) {
        return { ...response.body, email: hrEmail };
    }

    // If status is 500, account was likely rolled back
    // We need to check if account exists in database
    if (response.status === 500) {
        // Try to check if account exists (it shouldn't if rollback worked)
        // But in some edge cases, it might exist
        try {
            const { getConnectionToken } = require("@nestjs/mongoose");
            const connection = app.get(getConnectionToken());
            const Account = connection.models.Account || connection.model("Account");
            if (Account) {
                const existingAccount = await Account.findOne({
                    email: hrEmail,
                }).exec();
                if (existingAccount) {
                    // Account exists despite error - return it
                    return { ...existingAccount.toObject(), email: hrEmail };
                }
            }
        } catch (dbError) {
            // Ignore database check errors
        }
        // Account was rolled back, throw error
        throw new Error(
            `Failed to register HR: ${response.status} - ${JSON.stringify(response.body)}`,
        );
    }

    throw new Error(
        `Failed to register HR: ${response.status} - ${JSON.stringify(response.body)}`,
    );
}

/**
 * Verify email for test user (bypass email verification)
 */
export async function verifyTestUserEmail(
    app: INestApplication,
    connection: any,
    email: string,
): Promise<void> {
    const Account = connection.models.Account || connection.model("Account");
    if (Account) {
        await Account.updateOne(
            { email },
            { isEmailVerified: true, isActive: true },
        );
    }
}

/**
 * Get authentication token for testing
 * Note: User must be registered and email verified first
 */
export async function getAuthToken(
    app: INestApplication,
    email: string,
    password: string,
): Promise<string> {
    const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email, password });

    if (
        (response.status === 200 || response.status === 201) &&
        response.body.access_token
    ) {
        return response.body.access_token;
    }

    throw new Error(
        `Failed to get auth token: ${response.status} - ${JSON.stringify(response.body)}`,
    );
}

/**
 * Register, verify email, and get token in one step
 */
export async function createVerifiedUserAndGetToken(
    app: INestApplication,
    connection: any,
    email?: string,
    password: string = "Test123456!",
    options: {
        first_name?: string;
        last_name?: string;
        role?: string;
    } = {},
): Promise<{
    email: string;
    token: string;
    accountId?: string;
    userId?: string;
}> {
    const testEmail = email || generateTestEmail();

    // Register user - returns Account object with _id
    const account = await registerTestUser(app, testEmail, password, options);
    const accountId = account._id?.toString() || account.id;

    // Verify email
    await verifyTestUserEmail(app, connection, testEmail);

    // Get token
    const token = await getAuthToken(app, testEmail, password);

    // Get userId from User model
    let userId: string | undefined;
    try {
        const User = connection.models.User || connection.model("User");
        if (User && accountId) {
            const user = await User.findOne({ account_id: accountId }).exec();
            if (user) {
                userId = user._id?.toString() || user.id;
            }
        }
    } catch (error) {
        // Ignore if can't get userId
    }

    return { email: testEmail, token, accountId, userId };
}

/**
 * Create authenticated request
 * Returns a supertest Test object with Authorization header set
 */
export function authenticatedRequest(app: INestApplication, token: string) {
    const server = app.getHttpServer();

    return {
        get: (url: string) =>
            request(server).get(url).set("Authorization", `Bearer ${token}`),
        post: (url: string) =>
            request(server).post(url).set("Authorization", `Bearer ${token}`),
        put: (url: string) =>
            request(server).put(url).set("Authorization", `Bearer ${token}`),
        patch: (url: string) =>
            request(server).patch(url).set("Authorization", `Bearer ${token}`),
        delete: (url: string) =>
            request(server).delete(url).set("Authorization", `Bearer ${token}`),
    };
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
}

/**
 * Generate random string for testing
 */
export function generateRandomString(length: number = 10): string {
    return Math.random()
        .toString(36)
        .substring(2, length + 2);
}
