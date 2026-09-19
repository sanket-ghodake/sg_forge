/**
 * @forge/telemetry - Tier 3 Security: Zero-Trust Auth Guard & Cryptographic Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [HLR-TEL-801] [LLR-SUB-004] [SR-SEC-001]
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken, createServiceAccountToken, isSafeEgressUrl, verifySessionToken } from '../../src/lib/sdk';

describe('Tier 3 Security: Telemetry Zero-Trust Auth & Egress Shield', () => {
  it('Arrange, Act, Assert: verifies validly signed Ed25519 session tokens', () => {
    // Arrange
    const token = createInternalServiceToken(['roles/employee'], 'usr_telemetry_agent');

    // Act
    const verification = verifySessionToken(token);

    // Assert
    expect(verification.valid).toBe(true);
    expect(verification.payload.userId).toBe('usr_telemetry_agent');
    expect(verification.payload.roles).toContain('roles/employee');
  });

  it('Arrange, Act, Assert: rejects forged token signatures with cryptographic verification failure', () => {
    // Arrange
    const token = createInternalServiceToken(['roles/employee'], 'usr_telemetry_agent');
    const parts = token.split('.');
    const forgedToken = `${parts[0]}.${parts[1]}.forgedInvalidSigBase64`;

    // Act
    const verification = verifySessionToken(forgedToken);

    // Assert
    expect(verification.valid).toBe(false);
    expect(verification.error).toContain('signature');
  });

  it('Arrange, Act, Assert: rejects tampered claims even when original signature is appended', () => {
    // Arrange
    const token = createInternalServiceToken(['roles/employee'], 'usr_telemetry_agent');
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'usr_hacked', roles: ['roles/super_admin'], exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    // Act
    const verification = verifySessionToken(forgedToken);

    // Assert
    expect(verification.valid).toBe(false);
  });

  it('Arrange, Act, Assert: blocks cloud metadata and SSRF addresses in isSafeEgressUrl', () => {
    // Act & Assert
    expect(isSafeEgressUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafeEgressUrl('http://metadata.google.internal/computeMetadata/v1/')).toBe(false);
    expect(isSafeEgressUrl('http://internal-telemetry.corp.internal/metrics')).toBe(true);
    expect(isSafeEgressUrl('invalid-url-schema')).toBe(false);
  });

  it('Arrange, Act, Assert: generates verifiable M2M service account tokens', () => {
    // Arrange & Act
    const m2mToken = createServiceAccountToken('metric-collector-daemon', ['metrics:write']);
    const verification = verifySessionToken(m2mToken);

    // Assert
    expect(verification.valid).toBe(true);
    expect(verification.payload.sub).toBe('service:metric-collector-daemon');
    expect(verification.payload.principal_type).toBe('SERVICE');
    expect(verification.payload.permissions).toContain('metrics:write');
  });
});
