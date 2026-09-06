/**
 * @forge/dev-dashboard - Employee Controller & Import Unit Tests (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) testing parsing, input sanitization, and password hashing.
 */

import { describe, expect, it } from 'bun:test';
import { hashPassword, sanitizeCsvField } from '@forge/auth';

describe('Unit: Employee Controller & Utilities', () => {
  describe('Password Hashing & Salt Verification', () => {
    it('generates consistent scrypt hash and 32-char hex salt', () => {
      // Arrange
      const password = 'TestSecurePassword2026!';

      // Act
      const res1 = hashPassword(password);
      const res2 = hashPassword(password);

      // Assert
      expect(res1.hash).toBeDefined();
      expect(res1.salt).toBeDefined();
      expect(res1.salt.length).toBe(32);
      expect(res1.hash).not.toBe(password);
      // Different salts mean different hashes
      expect(res1.salt).not.toBe(res2.salt);
      expect(res1.hash).not.toBe(res2.hash);
    });
  });

  describe('CSV Injection Defense (Formula Sanitization)', () => {
    it('escapes dangerous formula prefixes (=, +, -, @, \\t, \\r)', () => {
      // Arrange & Act & Assert
      expect(sanitizeCsvField('=1+1')).toBe("'=1+1");
      expect(sanitizeCsvField('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");
      expect(sanitizeCsvField('-500')).toBe("'-500");
      expect(sanitizeCsvField('@HYPERLINK("http://evil.com")')).toBe("'@HYPERLINK(\"http://evil.com\")");
      expect(sanitizeCsvField('\tCMD|')).toBe("'\tCMD|");
    });

    it('leaves standard text and names unaffected', () => {
      // Arrange & Act & Assert
      expect(sanitizeCsvField('Elena Rostova')).toBe('Elena Rostova');
      expect(sanitizeCsvField('elena@forge.internal')).toBe('elena@forge.internal');
      expect(sanitizeCsvField('ENG-0201')).toBe('ENG-0201');
    });

    it('handles empty and null values gracefully', () => {
      expect(sanitizeCsvField('')).toBe('');
      expect(sanitizeCsvField(null)).toBe('');
      expect(sanitizeCsvField(undefined)).toBe('');
    });
  });
});
