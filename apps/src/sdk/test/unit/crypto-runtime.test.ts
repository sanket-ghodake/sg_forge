/**
 * @forge/sdk - Tier 1 Unit Test: Runtime Field Encryption & Cryptographic Engine (2026 LTS)
 * Conforms strictly to 3A Pattern (Arrange, Act, Assert) & Zero-Mock Verification
 */

import { describe, expect, it } from 'bun:test';
import {
  createBlindIndex,
  decryptField,
  decryptObject,
  encryptField,
  encryptObject,
  generateCryptographicKey,
} from '@forge/sdk';

describe('Tier 1 Unit: Runtime Field Encryption & Cryptographic Security Engine', () => {
  const testKey = 'test-master-runtime-encryption-key-32chars!';

  it('Arrange, Act, Assert: verifies string encryption and decryption roundtrip', () => {
    // Arrange
    const originalSecret = 'Corporate Invoicing Ledger Record #99401';

    // Act
    const ciphertext = encryptField(originalSecret, testKey);
    const decrypted = decryptField(ciphertext, testKey);

    // Assert
    expect(ciphertext).toStartWith('enc:v1:');
    expect(ciphertext).not.toBe(originalSecret);
    expect(decrypted).toBe(originalSecret);
  });

  it('Arrange, Act, Assert: verifies numeric value encryption and decryption', () => {
    // Arrange
    const numericAmount = 49900.55;

    // Act
    const ciphertext = encryptField(numericAmount, testKey);
    const decrypted = decryptField(ciphertext, testKey);

    // Assert
    expect(ciphertext).toStartWith('enc:v1:');
    expect(Number(decrypted)).toBe(numericAmount);
  });

  it('Arrange, Act, Assert: verifies structured JSON object encryption and decryption', () => {
    // Arrange
    const sensitivePayload = {
      invoiceId: 'inv_101',
      client: 'Acme Cloud Infrastructure',
      amountUsd: 14500.0,
      taxId: 'US-99-448102',
      metadata: { department: 'eng-core', approved: true },
    };

    // Act
    const ciphertext = encryptObject(sensitivePayload, testKey);
    const decryptedObject = decryptObject<typeof sensitivePayload>(ciphertext, testKey);

    // Assert
    expect(ciphertext).toStartWith('enc:v1:');
    expect(decryptedObject.invoiceId).toBe('inv_101');
    expect(decryptedObject.client).toBe('Acme Cloud Infrastructure');
    expect(decryptedObject.amountUsd).toBe(14500.0);
    expect(decryptedObject.metadata.approved).toBe(true);
  });

  it('Arrange, Act, Assert: verifies tamper detection and authentication tag rejection', () => {
    // Arrange: Create valid ciphertext
    const validCiphertext = encryptField('Confidential Employee Salary', testKey);
    const parts = validCiphertext.split(':');

    // Act: Tamper with 1 byte of the ciphertext payload
    const tamperedPayload = `${parts[4].slice(0, -2)}ff`;
    const tamperedCiphertext = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${tamperedPayload}`;

    // Assert: Decryption MUST throw an authentication tag mismatch error
    expect(() => {
      decryptField(tamperedCiphertext, testKey);
    }).toThrow('Tamper Detection Alert');
  });

  it('Arrange, Act, Assert: verifies HMAC blind index for encrypted searchability', () => {
    // Arrange
    const emailA = 'John.Doe@Forge.Internal ';
    const emailB = 'john.doe@forge.internal';
    const emailC = 'other.user@forge.internal';
    const salt = 'blind-index-test-salt-secret-key';

    // Act
    const indexA = createBlindIndex(emailA, salt);
    const indexB = createBlindIndex(emailB, salt);
    const indexC = createBlindIndex(emailC, salt);

    // Assert
    expect(indexA).toBe(indexB); // Case & whitespace insensitive
    expect(indexA).not.toBe(indexC);
    expect(indexA.length).toBe(32);
  });

  it('Arrange, Act, Assert: verifies cryptographic key generation entropy', () => {
    // Act
    const key1 = generateCryptographicKey();
    const key2 = generateCryptographicKey();

    // Assert
    expect(key1).toHaveLength(64); // 256 bits = 32 bytes = 64 hex chars
    expect(key2).toHaveLength(64);
    expect(key1).not.toBe(key2);
  });
});
