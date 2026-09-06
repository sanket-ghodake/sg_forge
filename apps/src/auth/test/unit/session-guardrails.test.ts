/**
 * @forge/auth/test/unit - Session Lifetime Guardrails & Clamping Engine (Tier 1)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite.
 */

import { describe, expect, it } from 'bun:test';
import {
  AUTH_SECURITY_BOUNDS,
  resolveSessionLifetimes,
} from '../../src/backend/session-manager';

describe('Tier 1 Unit: Session Lifetime Guardrails & Ceilings [LLR-AUTH-002]', () => {
  it('Arrange, Act, Assert: uses standard defaults when env values are empty', () => {
    // Arrange
    const customEnv = {
      JWT_ACCESS_TOKEN_EXPIRY_SECONDS: undefined,
      JWT_REFRESH_TOKEN_EXPIRY_SECONDS: undefined,
      AUTH_ABSOLUTE_SESSION_MAX_SECONDS: undefined,
    };

    // Act
    const resolved = resolveSessionLifetimes(customEnv);

    // Assert
    expect(resolved.accessTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_DEFAULT_SECONDS);
    expect(resolved.refreshTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_DEFAULT_SECONDS);
    expect(resolved.absoluteSessionMaxSeconds).toBe(AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_DEFAULT_SECONDS);
  });

  it('Arrange, Act, Assert: accepts valid in-range developer configurations', () => {
    // Arrange
    const customEnv = {
      JWT_ACCESS_TOKEN_EXPIRY_SECONDS: '600', // 10 mins (between 60s and 1800s)
      JWT_REFRESH_TOKEN_EXPIRY_SECONDS: '86400', // 24 hours (between 300s and 604800s)
      AUTH_ABSOLUTE_SESSION_MAX_SECONDS: '43200', // 12 hours (between 3600s and 604800s)
    };

    // Act
    const resolved = resolveSessionLifetimes(customEnv);

    // Assert
    expect(resolved.accessTokenExpirySeconds).toBe(600);
    expect(resolved.refreshTokenExpirySeconds).toBe(86400);
    expect(resolved.absoluteSessionMaxSeconds).toBe(43200);
  });

  it('Arrange, Act, Assert: strictly clamps values exceeding organizational ceilings', () => {
    // Arrange: Developer sets excessive lifetimes (e.g. 100 days or 99999999s)
    const customEnv = {
      JWT_ACCESS_TOKEN_EXPIRY_SECONDS: '99999999',
      JWT_REFRESH_TOKEN_EXPIRY_SECONDS: '50000000',
      AUTH_ABSOLUTE_SESSION_MAX_SECONDS: '80000000',
    };

    // Act
    const resolved = resolveSessionLifetimes(customEnv);

    // Assert: Clamped to hard security ceilings
    expect(resolved.accessTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_MAX_CEILING_SECONDS);
    expect(resolved.refreshTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_MAX_CEILING_SECONDS);
    expect(resolved.absoluteSessionMaxSeconds).toBe(AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_MAX_CEILING_SECONDS);
  });

  it('Arrange, Act, Assert: strictly clamps values below safe minimum floors', () => {
    // Arrange: Developer sets dangerously low lifetimes (causing server hammering)
    const customEnv = {
      JWT_ACCESS_TOKEN_EXPIRY_SECONDS: '5', // 5s < 60s floor
      JWT_REFRESH_TOKEN_EXPIRY_SECONDS: '30', // 30s < 300s floor
      AUTH_ABSOLUTE_SESSION_MAX_SECONDS: '60', // 1m < 3600s floor
    };

    // Act
    const resolved = resolveSessionLifetimes(customEnv);

    // Assert: Clamped to safe minimum floors
    expect(resolved.accessTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_MIN_SECONDS);
    expect(resolved.refreshTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_MIN_SECONDS);
    expect(resolved.absoluteSessionMaxSeconds).toBe(AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_MIN_SECONDS);
  });

  it('Arrange, Act, Assert: falls back to safe defaults when values are non-numeric strings', () => {
    // Arrange
    const customEnv = {
      JWT_ACCESS_TOKEN_EXPIRY_SECONDS: 'invalid-string',
      JWT_REFRESH_TOKEN_EXPIRY_SECONDS: 'not-a-number',
      AUTH_ABSOLUTE_SESSION_MAX_SECONDS: 'abc',
    };

    // Act
    const resolved = resolveSessionLifetimes(customEnv);

    // Assert
    expect(resolved.accessTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_DEFAULT_SECONDS);
    expect(resolved.refreshTokenExpirySeconds).toBe(AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_DEFAULT_SECONDS);
    expect(resolved.absoluteSessionMaxSeconds).toBe(AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_DEFAULT_SECONDS);
  });
});
