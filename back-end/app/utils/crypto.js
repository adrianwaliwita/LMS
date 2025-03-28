import crypto from 'crypto';
import logger from './logger.js';
import config from './config.js';

// AES configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256 bits
const ENCODING = 'hex';

// Validate encryption key on module load
if (!config.crypto?.masterKey) {
  logger.error('[crypto] ENCRYPTION_MASTER_KEY not found in environment variables');
  throw new Error('Encryption master key is not configured');
}

/**
 * Derives an encryption key from the master key and salt
 * @param {Buffer} salt - The salt for key derivation
 * @returns {Buffer} Derived key
 */
const deriveKey = (salt) => {
  try {
    return crypto.pbkdf2Sync(
      config.crypto.masterKey,
      salt,
      100000, // Number of iterations
      KEY_LENGTH,
      'sha512'
    );
  } catch (error) {
    logger.error('[crypto.deriveKey] Error deriving encryption key', error);
    throw error;
  }
};

/**
 * Encrypts data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data in format: salt:iv:authTag:encryptedData
 */
export const encrypt = (data) => {
  try {
    // Generate salt and derive key
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(salt);

    // Generate initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    // Get the auth tag
    const authTag = cipher.getAuthTag();

    // Combine all components
    const result = [
      salt.toString(ENCODING),
      iv.toString(ENCODING),
      authTag.toString(ENCODING),
      encrypted
    ].join(':');

    return result;
  } catch (error) {
    logger.error('[crypto.encrypt] Error encrypting data', error);
    throw error;
  }
};

/**
 * Decrypts data using AES-256-GCM
 * @param {string} encryptedData - Data to decrypt (format: salt:iv:authTag:encryptedData)
 * @returns {string} Decrypted data
 */
export const decrypt = (encryptedData) => {
  try {
    // Split the encrypted data into components
    const [saltHex, ivHex, authTagHex, encryptedHex] = encryptedData.split(':');

    // Convert components from hex to buffers
    const salt = Buffer.from(saltHex, ENCODING);
    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);
    const encrypted = Buffer.from(encryptedHex, ENCODING);

    // Derive the key using the same salt
    const key = deriveKey(salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('[crypto.decrypt] Error decrypting data', error);
    throw error;
  }
}; 