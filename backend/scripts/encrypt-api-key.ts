/**
 * Script helper để mã hóa API key
 * 
 * Usage:
 *   ts-node scripts/encrypt-api-key.ts "your-api-key-here"
 * 
 * Hoặc set ENCRYPTION_MASTER_KEY và OPENAI_API_KEY trong env
 */

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Load .env file từ thư mục backend
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env file');
} else {
  console.log('⚠️  .env file not found, using environment variables only');
}

const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const tagLength = 16;

function generateEncryptionKey(masterKey: string): Buffer {
  return crypto.scryptSync(masterKey, 'cvone-salt', keyLength);
}

function encrypt(plaintext: string, masterKey: string): string {
  const encryptionKey = generateEncryptionKey(masterKey);
  const iv = crypto.randomBytes(ivLength);
  
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const tag = cipher.getAuthTag();
  
  const combined = Buffer.concat([
    iv,
    tag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return combined.toString('base64');
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    // Lấy master key từ env hoặc hỏi user
    let masterKey = process.env.ENCRYPTION_MASTER_KEY;
    
    // Remove quotes nếu có (từ .env file)
    if (masterKey) {
      masterKey = masterKey.trim().replace(/^["']|["']$/g, '');
    }
    
    if (!masterKey) {
      console.log('⚠️  ENCRYPTION_MASTER_KEY not found in environment or .env file');
      masterKey = await question('Enter ENCRYPTION_MASTER_KEY (or press Enter to use default): ');
      if (!masterKey) {
        console.log('⚠️  Using default key (NOT SECURE for production!)');
        masterKey = 'default-key-change-in-production';
      } else {
        // Remove quotes nếu user nhập có quotes
        masterKey = masterKey.trim().replace(/^["']|["']$/g, '');
      }
    } else {
      console.log('✅ Found ENCRYPTION_MASTER_KEY from .env file');
    }

    // Lấy API key từ command line argument hoặc hỏi user
    let apiKey = process.argv[2];
    
    if (!apiKey) {
      apiKey = await question('Enter API key to encrypt: ');
    }

    if (!apiKey) {
      console.error('❌ API key is required');
      process.exit(1);
    }

    // Mã hóa
    const encrypted = encrypt(apiKey, masterKey);
    
    console.log('\n✅ Encryption successful!\n');
    console.log('Add this to your .env file:');
    console.log(`OPENAI_API_KEY="${encrypted}"`);
    console.log(`ENCRYPTION_MASTER_KEY="${masterKey}"`);
    console.log('\n⚠️  Keep ENCRYPTION_MASTER_KEY secret and secure!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

