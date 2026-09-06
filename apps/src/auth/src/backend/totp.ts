/**
 * @forge/auth - RFC 6238 TOTP Engine (2026 LTS)
 * Zero-dependency Time-based One-Time Password Implementation with Native Crypto.
 */

import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { loadBrandConfig } from '@forge/sdk';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * base32Encode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * base32Decode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * generateTotpSecret
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function generateTotpSecret(): string {
  const bytes = randomBytes(20);
  return base32Encode(bytes);
}

/**
 * generateTotpCode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function generateTotpCode(secret: string, timestamp: number = Date.now()): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(timestamp / 1000);
  const timeStep = Math.floor(epoch / 30);

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = createHmac('sha1', key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * verifyTotpCode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function verifyTotpCode(
  secret: string,
  userCode: string,
  windowSteps: number = 1
): boolean {
  if (!userCode || userCode.length !== 6) return false;

  const now = Date.now();
  const stepMs = 30 * 1000;

  for (let i = -windowSteps; i <= windowSteps; i++) {
    const checkTime = now + i * stepMs;
    const expected = generateTotpCode(secret, checkTime);

    const bufUser = Buffer.from(userCode, 'utf8');
    const bufExpected = Buffer.from(expected, 'utf8');

    if (bufUser.length === bufExpected.length && timingSafeEqual(bufUser, bufExpected)) {
      return true;
    }
  }

  return false;
}

/**
 * generateTotpUri
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function generateTotpUri(secret: string, email: string, issuer?: string): string {
  const brandName = loadBrandConfig().name || 'SG Forge';
  const effectiveIssuer = issuer || brandName;
  const encodedIssuer = encodeURIComponent(effectiveIssuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * generateBackupCodes
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  return codes;
}

/**
 * hashBackupCode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function hashBackupCode(code: string): string {
  const clean = code.toUpperCase().trim();
  return createHash('sha256').update(clean).digest('hex');
}

/**
 * verifyBackupCode
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function verifyBackupCode(code: string, expectedHash: string): boolean {
  const actualHash = hashBackupCode(code);
  const bufActual = Buffer.from(actualHash, 'utf8');
  const bufExpected = Buffer.from(expectedHash, 'utf8');
  return bufActual.length === bufExpected.length && timingSafeEqual(bufActual, bufExpected);
}
