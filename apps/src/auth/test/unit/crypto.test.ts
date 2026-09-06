/**
 * @forge/auth/test/unit - Cryptographic Subsystem Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  signJwt,
  verifyJwt,
  getPublicJwks,
} from '../../src/backend/crypto';

describe('Tier 1 Unit: Cryptographic Subsystem [LLR-AUTH-001] [LLR-AUTH-006]', () => {
  it('should hash and verify passwords using memory-hard Scrypt & constant-time comparison', () => {
    // Arrange
    const password = 'CorrectHorseBatteryStaple123!';

    // Act
    const { hash, salt } = hashPassword(password);
    const isValid = verifyPassword(password, hash, salt);
    const isInvalid = verifyPassword('WrongPassword123!', hash, salt);

    // Assert
    expect(hash.length).toBe(128); // 64 bytes hex
    expect(salt.length).toBe(32); // 16 bytes hex
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('should generate cryptographically secure random hex tokens', () => {
    // Arrange & Act
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    // Assert
    expect(token1.length).toBe(64);
    expect(token2.length).toBe(64);
    expect(token1).not.toBe(token2);
  });

  it('should sign and verify asymmetric Ed25519 JWT tokens', () => {
    // Arrange
    const payload = {
      sub: 'usr-eng-alice',
      email: 'alice.eng@forge.internal',
      org_id: 'org-sg-forge-global',
      principal_type: 'EMPLOYEE',
      roles: ['viewer', 'employee'],
    };

    // Act
    const jwt = signJwt(payload, 900);
    const { valid, payload: verified } = verifyJwt(jwt);

    // Assert
    expect(valid).toBe(true);
    expect(verified?.sub).toBe(payload.sub);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.org_id).toBe(payload.org_id);
  });

  it('should detect and reject tampered JWT tokens', () => {
    // Arrange
    const jwt = signJwt({ sub: 'usr-tamper-target', email: 'test@forge.internal' });
    const parts = jwt.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'usr-admin-hacked', email: 'hacker@forge.internal' })).toString('base64url');
    const tamperedJwt = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    // Act
    const result = verifyJwt(tamperedJwt);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
