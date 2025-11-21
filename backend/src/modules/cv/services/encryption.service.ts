import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Service để mã hóa và giải mã API keys
 * Sử dụng AES-256-GCM để mã hóa an toàn
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 64; // 512 bits
  private readonly tagLength = 16; // 128 bits
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    // Lấy encryption key từ env hoặc tạo từ master key
    const masterKey = this.configService.get<string>('ENCRYPTION_MASTER_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    const isProduction = nodeEnv === 'production';
    
    if (!masterKey) {
      if (isProduction) {
        // Production: Bắt buộc phải có master key
        this.logger.error(
          '🚨 SECURITY ERROR: ENCRYPTION_MASTER_KEY is required in production!'
        );
        throw new Error(
          'ENCRYPTION_MASTER_KEY is required in production environment. ' +
          'Please set ENCRYPTION_MASTER_KEY in your environment variables.'
        );
      } else {
        // Development: Warning nhưng vẫn cho phép
        this.logger.warn(
          '⚠️  ENCRYPTION_MASTER_KEY not found. Encryption will not work properly. ' +
          'Using default key (NOT SECURE for production!).'
        );
        // Fallback: tạo key từ một giá trị mặc định (KHÔNG AN TOÀN cho production)
        this.encryptionKey = crypto.scryptSync('default-key-change-in-production', 'salt', this.keyLength);
      }
    } else {
      // Tạo encryption key từ master key
      this.encryptionKey = crypto.scryptSync(masterKey, 'cvone-salt', this.keyLength);
      if (isProduction) {
        this.logger.log('✅ Encryption service initialized with master key (production mode)');
      }
    }
  }

  /**
   * Mã hóa một string (ví dụ: API key)
   * @param plaintext - Text cần mã hóa
   * @returns Encrypted string dạng base64
   */
  encrypt(plaintext: string): string {
    try {
      if (!plaintext) {
        return plaintext;
      }

      // Tạo IV (Initialization Vector) ngẫu nhiên
      const iv = crypto.randomBytes(this.ivLength);
      
      // Tạo cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Mã hóa
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Lấy authentication tag
      const tag = cipher.getAuthTag();
      
      // Kết hợp: iv + tag + encrypted data
      const combined = Buffer.concat([
        iv,
        tag,
        Buffer.from(encrypted, 'base64')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      this.logger.error(`Encryption error: ${error.message}`, error.stack);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Giải mã một string đã được mã hóa
   * @param ciphertext - Encrypted string dạng base64
   * @returns Decrypted plaintext
   */
  decrypt(ciphertext: string): string {
    try {
      if (!ciphertext) {
        return ciphertext;
      }

      // Kiểm tra xem có phải là encrypted string không (có format đúng)
      // Nếu không phải, trả về nguyên bản (có thể là plain text)
      try {
        const combined = Buffer.from(ciphertext, 'base64');
        
        // Kiểm tra độ dài tối thiểu
        if (combined.length < this.ivLength + this.tagLength) {
          // Không phải encrypted string, trả về nguyên bản
          return ciphertext;
        }
        
        // Tách các phần
        const iv = combined.subarray(0, this.ivLength);
        const tag = combined.subarray(this.ivLength, this.ivLength + this.tagLength);
        const encrypted = combined.subarray(this.ivLength + this.tagLength);
        
        // Tạo decipher
        const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        
        // Giải mã
        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
      } catch (error) {
        // Nếu không thể giải mã, có thể là plain text
        this.logger.debug(`Decryption failed, assuming plain text: ${error.message}`);
        return ciphertext;
      }
    } catch (error) {
      this.logger.error(`Decryption error: ${error.message}`, error.stack);
      // Trả về nguyên bản nếu không thể giải mã
      return ciphertext;
    }
  }

  /**
   * Kiểm tra xem một string có phải là encrypted không
   * @param text - String cần kiểm tra
   * @returns true nếu có vẻ là encrypted string
   */
  isEncrypted(text: string): boolean {
    if (!text) {
      return false;
    }

    try {
      const buffer = Buffer.from(text, 'base64');
      // Encrypted string phải có độ dài tối thiểu
      return buffer.length >= this.ivLength + this.tagLength;
    } catch {
      return false;
    }
  }

  /**
   * Tự động giải mã nếu cần (smart decrypt)
   * Nếu string đã được mã hóa thì giải mã, nếu không thì trả về nguyên bản
   * @param text - String có thể là encrypted hoặc plain text
   * @returns Decrypted text hoặc original text
   */
  decryptIfNeeded(text: string): string {
    if (!text) {
      return text;
    }

    // Nếu có vẻ là encrypted, thử giải mã
    if (this.isEncrypted(text)) {
      try {
        const decrypted = this.decrypt(text);
        // Nếu giải mã thành công và khác với original, thì đã giải mã
        if (decrypted !== text) {
          this.logger.debug(`Successfully decrypted string (length: ${decrypted.length})`);
          return decrypted;
        } else {
          // Giải mã nhưng kết quả giống original - có thể master key sai
          this.logger.warn(
            `Decryption returned same value - possible wrong master key or invalid encrypted string`
          );
          return text;
        }
      } catch (error) {
        // Nếu lỗi, có thể master key sai hoặc format sai
        this.logger.error(
          `Failed to decrypt: ${error.message}. ` +
          `This might indicate wrong ENCRYPTION_MASTER_KEY or invalid encrypted format.`
        );
        // Trả về nguyên bản để tránh crash, nhưng log warning
        return text;
      }
    }

    // Trả về nguyên bản nếu không phải encrypted
    return text;
  }
}

