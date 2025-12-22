/**
 * Script để tạo ENCRYPTION_MASTER_KEY
 *
 * Usage:
 *   node scripts/generate-master-key.js
 *
 * Hoặc chạy trực tiếp:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const crypto = require("crypto");

function generateMasterKey() {
  // Tạo random 32 bytes (256 bits) và convert sang base64
  const masterKey = crypto.randomBytes(32).toString("base64");
  return masterKey;
}

// Main
if (require.main === module) {
  const masterKey = generateMasterKey();

  // Copy to clipboard hint (Windows)
  if (process.platform === "win32") {
  }
}

module.exports = { generateMasterKey };
