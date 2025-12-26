/*
 * Test Logger Utility
 * Helper functions for logging test information to files
 */

import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, `test-${new Date().toISOString().split("T")[0]}.log`);

/**
 * Ensure log directory exists
 */
function ensureLogDir(): void {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

/**
 * Write log to file
 */
function writeLog(level: string, message: string, data?: any): void {
    try {
        ensureLogDir();

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...(data && { data }),
        };

        const logLine = JSON.stringify(logEntry) + "\n";
        fs.appendFileSync(LOG_FILE, logLine, "utf8");
    } catch (error) {
        console.error("Failed to write log:", error);
    }
}

/**
 * Log test start
 */
export function logTestStart(testName: string, suiteName?: string): void {
    writeLog("TEST_START", `Starting test: ${testName}`, { suiteName, testName });
}

/**
 * Log test end
 */
export function logTestEnd(
    testName: string,
    status: "PASSED" | "FAILED" | "SKIPPED",
    duration?: number,
    error?: any,
): void {
    writeLog("TEST_END", `Test ${status}: ${testName}`, {
        testName,
        status,
        duration,
        ...(error && { error: error.message || String(error) }),
    });
}

/**
 * Log test step
 */
export function logTestStep(step: string, data?: any): void {
    writeLog("TEST_STEP", step, data);
}

/**
 * Log API request
 */
export function logApiRequest(
    method: string,
    url: string,
    statusCode?: number,
    requestBody?: any,
    responseBody?: any,
    duration?: number,
): void {
    writeLog("API_REQUEST", `${method} ${url}`, {
        method,
        url,
        statusCode,
        requestBody: requestBody ? JSON.stringify(requestBody) : undefined,
        responseBody: responseBody ? JSON.stringify(responseBody) : undefined,
        duration,
    });
}

/**
 * Log error
 */
export function logError(error: Error | string, context?: any): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    writeLog("ERROR", errorMessage, {
        error: errorMessage,
        stack: errorStack,
        context,
    });
}

/**
 * Log info
 */
export function logInfo(message: string, data?: any): void {
    writeLog("INFO", message, data);
}

/**
 * Log debug
 */
export function logDebug(message: string, data?: any): void {
    writeLog("DEBUG", message, data);
}

/**
 * Clear log file
 */
export function clearLogFile(): void {
    try {
        ensureLogDir();
        if (fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, "", "utf8");
        }
    } catch (error) {
        console.error("Failed to clear log file:", error);
    }
}

/**
 * Get log file path
 */
export function getLogFilePath(): string {
    return LOG_FILE;
}

/**
 * Read log file content
 */
export function readLogFile(): string {
    try {
        if (fs.existsSync(LOG_FILE)) {
            return fs.readFileSync(LOG_FILE, "utf8");
        }
        return "";
    } catch (error) {
        console.error("Failed to read log file:", error);
        return "";
    }
}

/**
 * Get log file path for a specific date
 */
export function getLogFilePathForDate(date: Date): string {
    const dateStr = date.toISOString().split("T")[0];
    return path.join(LOG_DIR, `test-${dateStr}.log`);
}

