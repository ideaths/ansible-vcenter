const crypto = require('crypto');
require('dotenv').config();

let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// If not in env, try to load from Docker environment
if (!ENCRYPTION_KEY && process.env.DOCKER_ENCRYPTION_KEY) {
  ENCRYPTION_KEY = process.env.DOCKER_ENCRYPTION_KEY;
}

const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

function validateEncryptionKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. Please check your .env file or Docker environment variables.');
  }
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }
}

function encrypt(text) {
  if (!text) {
    throw new Error('Text to encrypt cannot be empty or undefined');
  }
  
  validateEncryptionKey();
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) {
    return null;
  }

  try {
    validateEncryptionKey();
    
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

module.exports = { encrypt, decrypt };
