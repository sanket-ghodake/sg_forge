/**
 * @forge/auth/test/contracts - RFC 7517 Public JWKS Contract (Tier 4)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { handleJwks } from '../../src/backend/api-handlers';

describe('Tier 4 Contract: RFC 7517 JWKS Public Key Specification', () => {
  it('should return valid RFC 7517 JSON Web Key Set matching OKP / Ed25519 specification', async () => {
    // 1. Arrange & Act
    const res = handleJwks();
    const data = await res.json();

    // 2. Assert JWKS Top-Level
    expect(res.status).toBe(200);
    expect(Array.isArray(data.keys)).toBe(true);
    expect(data.keys.length).toBeGreaterThanOrEqual(1);

    // 3. Assert Key Format
    const key = data.keys[0];
    expect(key.kty).toBe('OKP');
    expect(key.crv).toBe('Ed25519');
    expect(key.use).toBe('sig');
    expect(key.alg).toBe('EdDSA');
    expect(typeof key.kid).toBe('string');
    expect(typeof key.x).toBe('string');
    expect(key.x.length).toBeGreaterThan(20);
    expect((key as any).d).toBeUndefined(); // Crucial: Private key must NEVER be leaked in public JWKS!
  });
});
