import { Injectable } from "@nestjs/common";

type CodeRecord = {
    code: string;
    expiresAt: number;
    attempts: number;
};

@Injectable()
export class PasswordResetCodeService {
    private codes = new Map<string, CodeRecord>();
    private readonly ttlMs = 60 * 60 * 1000; // 1 hour
    private readonly maxAttempts = 5;

    generateAndStore(email: string): string {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + this.ttlMs;
        this.codes.set(email, { code, expiresAt, attempts: 0 });
        return code;
    }

    validate(email: string, code: string): boolean {
        const record = this.codes.get(email);
        if (!record) return false;
        if (record.expiresAt < Date.now()) {
            this.codes.delete(email);
            return false;
        }
        if (record.attempts >= this.maxAttempts) {
            this.codes.delete(email);
            return false;
        }
        const isMatch = record.code === code;
        record.attempts += 1;
        if (isMatch) {
            this.codes.delete(email);
        } else {
            this.codes.set(email, record);
        }
        return isMatch;
    }

    hasActiveCode(email: string): boolean {
        const record = this.codes.get(email);
        if (!record) return false;
        if (record.expiresAt < Date.now()) {
            this.codes.delete(email);
            return false;
        }
        return true;
    }
}
