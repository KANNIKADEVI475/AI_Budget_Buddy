import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives a 32-byte Buffer from the environment variable CREDENTIAL_ENCRYPTION_KEY.
 * Accepts 64-char hex, 44-char base64, or fallback sha256 hash of a passphrase.
 */
function getEncryptionKey() {
  const rawKey = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error(
      'CREDENTIAL_ENCRYPTION_KEY environment variable is missing. ' +
      'Please generate a 32-byte hex key (e.g. crypto.randomBytes(32).toString("hex")) and set it in your backend .env file.'
    );
  }

  // If 64 hex chars
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // If base64
  try {
    const buf = Buffer.from(rawKey, 'base64');
    if (buf.length === 32) return buf;
  } catch (e) {
    // continue
  }

  // If utf8 32 bytes
  if (Buffer.byteLength(rawKey, 'utf8') === 32) {
    return Buffer.from(rawKey, 'utf8');
  }

  // Fallback: derive 32-byte key via SHA-256 hash of the provided passphrase
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts plain text using AES-256-GCM authenticated encryption.
 *
 * @param {string} plainText - Text to encrypt (e.g. clientSecret)
 * @returns {string} Encrypted string in format: iv:authTag:cipherHex
 */
export function encryptCredential(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('plainText must be a non-empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 *
 * @param {string} encryptedString - String in format: iv:authTag:cipherHex
 * @returns {string} Original plain text
 */
export function decryptCredential(encryptedString) {
  if (!encryptedString || typeof encryptedString !== 'string') {
    throw new Error('encryptedString must be a non-empty string');
  }

  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format. Expected iv:authTag:cipherHex');
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export default {
  encryptCredential,
  decryptCredential,
};
