// backend/utils/encryption.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Constants for encryption/decryption
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_LENGTH = 32; // 256 bits

// Path for storing the encryption key
const KEY_PATH = path.join(__dirname, '../data/encryption_key');

/**
 * Get or generate the encryption key
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  try {
    // Try to read existing key
    if (fs.existsSync(KEY_PATH)) {
      return Buffer.from(fs.readFileSync(KEY_PATH, 'utf8'), 'hex');
    }
    
    // Generate a new key
    const key = crypto.randomBytes(KEY_LENGTH);
    
    // Ensure directory exists
    const dir = path.dirname(KEY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save the key
    fs.writeFileSync(KEY_PATH, key.toString('hex'));
    return key;
  } catch (error) {
    console.error('Error handling encryption key:', error);
    throw new Error('Failed to get or generate encryption key');
  }
}

/**
 * Encrypt a text string
 * @param {string} text Text to encrypt
 * @returns {string} Encrypted text (format: iv:encryptedData)
 */
function encrypt(text) {
  try {
    if (!text) {
      return '';
    }
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data as one string
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
}

/**
 * Decrypt an encrypted string
 * @param {string} encryptedText Encrypted text (format: iv:encryptedData)
 * @returns {string} Decrypted text
 */
function decrypt(encryptedText) {
  try {
    if (!encryptedText) {
      return '';
    }
    
    // Split the encrypted text into IV and data
    const parts = encryptedText.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error; // Re-throw to let the caller handle it
  }
}

module.exports = {
  encrypt,
  decrypt
};