/**
 * @forge/test/unit/certs-setup.test.ts
 * Tier 1 Unit Test: Local & Intranet TLS Certificate Engine
 *
 * Verifies IP detection, OpenSSL binary check, and generated certificate SAN integrity.
 * Follows 3A Pattern (Arrange, Act, Assert).
 */

import { describe, expect, it } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkOpenSsl, getLocalIpAddresses } from '../../../scripts/setup-certs';

describe('Tier 1 Unit: TLS Certificate & Intranet PKI Engine', () => {
  it('Arrange, Act, Assert: verifies openssl binary is available', () => {
    // Arrange & Act
    const hasOpenSsl = checkOpenSsl();

    // Assert
    expect(hasOpenSsl).toBe(true);
  });

  it('Arrange, Act, Assert: discovers local network IP addresses for SAN configuration', () => {
    // Arrange & Act
    const ips = getLocalIpAddresses();

    // Assert
    expect(Array.isArray(ips)).toBe(true);
    for (const ip of ips) {
      expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    }
  });

  it('Arrange, Act, Assert: verifies generated server cert has SAN extensions for localhost and intranet IPs', () => {
    // Arrange
    const certPath = join(process.cwd(), 'proxy', 'certs', 'cert.pem');
    if (!existsSync(certPath)) return;

    // Act
    const certText = execSync(`openssl x509 -in "${certPath}" -text -noout`, { encoding: 'utf-8' });

    // Assert
    expect(certText).toContain('DNS:localhost');
    expect(certText).toContain('IP Address:127.0.0.1');
    expect(certText).toContain('Subject Alternative Name');
  });
});
