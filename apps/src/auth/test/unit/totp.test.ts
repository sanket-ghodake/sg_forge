/**
 * @forge/auth/test/unit - RFC 6238 TOTP Engine Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  generateTotpUri,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '../../src/backend/totp';

describe('Tier 1 Unit: RFC 6238 TOTP Multi-Factor Engine', () => {
  it('should generate valid base32 secrets and accurate 6-digit TOTP codes', () => {
    // Arrange
    const secret = generateTotpSecret();

    // Act
    const code = generateTotpCode(secret);
    const isValid = verifyTotpCode(secret, code);
    const isInvalid = verifyTotpCode(secret, '000000');

    // Assert
    expect(secret.length).toBe(32);
    expect(code.length).toBe(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('should format valid standard otpauth URI scheme for QR code readers', () => {
    // Arrange
    const secret = 'JBSWY3DPEHPK3PXP';
    const email = 'superadmin@forge.internal';
    const issuer = 'SG Forge';

    // Act
    const uri = generateTotpUri(secret, email, issuer);

    // Assert
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
    expect(uri).toContain(encodeURIComponent(issuer));
    expect(uri).toContain(`secret=${secret}`);
  });

  it('should dynamically default issuer from loadBrandConfig when omitted', () => {
    // Arrange
    const secret = 'JBSWY3DPEHPK3PXP';
    const email = 'employee@forge.internal';
    const expectedBrandName = loadBrandConfig().name || 'SG Forge';

    // Act
    const uri = generateTotpUri(secret, email);

    // Assert
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
    expect(uri).toContain(encodeURIComponent(expectedBrandName));
  });

  it('should generate, hash, and verify emergency single-use backup recovery codes', () => {
    // Arrange
    const codes = generateBackupCodes(8);
    const firstCode = codes[0];

    // Act
    const hash = hashBackupCode(firstCode);
    const isValid = verifyBackupCode(firstCode, hash);
    const isInvalid = verifyBackupCode('ABCD-EFGH', hash);

    // Assert
    expect(codes.length).toBe(8);
    expect(firstCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});
