import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { EncryptionService } from "./encryption.service";

@Injectable()
export class OpenaiApiService {
  private readonly logger = new Logger(OpenaiApiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private encryptionService: EncryptionService
  ) {
    const encryptedApiKey = this.configService.get<string>("OPENAI_API_KEY");
    const nodeEnv = this.configService.get<string>("NODE_ENV") || "development";
    const isProduction = nodeEnv === "production";

    if (!encryptedApiKey) {
      this.logger.warn("OPENAI_API_KEY not found in environment variables");
    }

    // Production: Bắt buộc phải dùng encrypted API key
    if (isProduction && encryptedApiKey) {
      const isEncrypted = this.encryptionService.isEncrypted(encryptedApiKey);
      if (!isEncrypted) {
        const errorMsg = 
          "🚨 SECURITY ERROR: Production environment requires encrypted API key!\n" +
          "Please encrypt your OPENAI_API_KEY using the encryption service.\n" +
          "See docs/API_KEY_ENCRYPTION.md for instructions.";
        this.logger.error(errorMsg);
        throw new Error(
          "Production environment requires encrypted OPENAI_API_KEY. " +
          "Plain text API keys are not allowed in production for security reasons."
        );
      }
    }

    // Tự động giải mã API key nếu nó đã được mã hóa
    const apiKey = encryptedApiKey 
      ? this.encryptionService.decryptIfNeeded(encryptedApiKey)
      : undefined;
    
    if (apiKey && encryptedApiKey && this.encryptionService.isEncrypted(encryptedApiKey)) {
      this.logger.log("✅ Successfully decrypted OpenAI API key");
    } else if (isProduction && encryptedApiKey) {
      // Double check: nếu production mà không decrypt được thì có vấn đề
      const masterKey = this.configService.get<string>("ENCRYPTION_MASTER_KEY");
      if (!masterKey) {
        const errorMsg = 
          "🚨 SECURITY ERROR: ENCRYPTION_MASTER_KEY is required in production!\n" +
          "Please set ENCRYPTION_MASTER_KEY in your environment variables.";
        this.logger.error(errorMsg);
        throw new Error(
          "ENCRYPTION_MASTER_KEY is required in production to decrypt API keys."
        );
      }
    } else if (!isProduction && encryptedApiKey && !this.encryptionService.isEncrypted(encryptedApiKey)) {
      // Development: Warning nếu dùng plain text (nhưng vẫn cho phép)
      this.logger.warn(
        "⚠️  Using plain text API key in development. " +
        "Consider encrypting it for better security. " +
        "See docs/API_KEY_ENCRYPTION.md"
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Check OpenAI API status
   */
  async checkApiStatus(): Promise<{
    success: boolean;
    status: string;
    message: string;
    error?: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,
      });

      return {
        success: true,
        status: "available",
        message: "OpenAI API is working correctly",
      };
    } catch (error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        return {
          success: false,
          status: "quota_exceeded",
          message:
            "OpenAI quota exceeded. Please check your billing and add credits to your account.",
          error: error.message,
        };
      } else if (
        error.message.includes("401") ||
        error.message.includes("invalid")
      ) {
        return {
          success: false,
          status: "invalid_key",
          message: "Invalid OpenAI API key. Please check your configuration.",
          error: error.message,
        };
      } else {
        return {
          success: false,
          status: "error",
          message: "OpenAI API is not available",
          error: error.message,
        };
      }
    }
  }

  public getOpenAI() {
    return this.openai;
  }
}
