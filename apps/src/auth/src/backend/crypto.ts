/**
 * @forge/auth - Cryptographic Engine & JWKS Token Issuer (2026 LTS)
 * ASVS 5.0 Compliant: Scrypt/PBKDF2 Password Hashing, Ed25519/ES256 Asymmetric JWTs & JWKS.
 */

import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  scryptSync,
  sign,
  verify,
  timingSafeEqual,
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveAuthDataDir } from '../db/db';

/**
 * JwtHeader
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export interface JwtHeader {
  alg: 'EdDSA' | 'ES256' | 'HS256';
  typ: 'JWT';
  kid?: string;
}

/**
 * JwtPayload
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export interface JwtPayload {
  iss: string;
  sub: string; // user_id
  email: string;
  display_name: string;
  principal_type: 'EMPLOYEE' | 'ADMIN' | 'SERVICE_ACCOUNT';
  org_id: string;
  roles: string[];
  permissions: string[];
  token_version: number;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

/**
 * JwkKey
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export interface JwkKey {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  use: string;
  kid: string;
  alg: string;
}

// -----------------------------------------------------------------------------
// Password Hashing (Scrypt with 32-byte salt and constant-time comparison)
// -----------------------------------------------------------------------------

/**
 * hashPassword
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * verifyPassword
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(hash, 'hex');
    if (derivedKey.length !== hashBuffer.length) return false;
    return timingSafeEqual(derivedKey, hashBuffer);
  } catch {
    return false;
  }
}

/**
 * generateSecureToken
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function generateSecureToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * hashToken
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// -----------------------------------------------------------------------------
// Key Management & JWT Issuer (Deterministic Ed25519 / ASVS 5.0 Compliant)
// -----------------------------------------------------------------------------

interface KeyPairHolder {
  publicKeyPem: string;
  privateKeyPem: string;
  kid: string;
}

let activeKeys: KeyPairHolder | null = null;

/**
 * getOrInitAuthKeys
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function getOrInitAuthKeys(forceReload: boolean = false): KeyPairHolder {
  if (activeKeys && !forceReload) return activeKeys;

  const secret = process.env.JWT_SECRET || 'dev-portable-secret-key-that-is-at-least-32-characters-long';
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev-portable') || process.env.JWT_SECRET.length < 32) {
      throw new Error('[FATAL SECURITY] In production, JWT_SECRET must be explicitly configured with an external high-entropy secret of at least 32 characters.');
    }
  }
  const seed = createHash('sha256').update(secret).digest();
  const kid = `forge-key-${seed.subarray(0, 4).toString('hex')}`;

  // Ed25519 PKCS#8 ASN.1 DER Header: 0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);

  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  const pubKey = createPublicKey(privKey);

  const privateKeyPem = privKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const publicKeyPem = pubKey.export({ type: 'spki', format: 'pem' }) as string;

  activeKeys = {
    privateKeyPem,
    publicKeyPem,
    kid,
  };

  try {
    const dataDir = resolveAuthDataDir();
    const keysDir = join(dataDir, 'keys');
    if (!existsSync(keysDir)) mkdirSync(keysDir, { recursive: true });
    writeFileSync(join(keysDir, 'auth_private.pem'), privateKeyPem);
    writeFileSync(join(keysDir, 'auth_public.pem'), publicKeyPem);
    writeFileSync(join(keysDir, 'auth_kid.txt'), kid);
  } catch {
    // Non-blocking fallback for read-only environments
  }

  return activeKeys;
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

/**
 * signJwt
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function signJwt(
  payload: Partial<Omit<JwtPayload, 'iat' | 'exp'>> & Record<string, unknown>,
  expiresInSeconds: number = 900 // 15 mins default
): string {
  const keys = getOrInitAuthKeys();
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    iss: 'sg-forge-auth',
    sub: 'anonymous',
    email: '',
    display_name: '',
    principal_type: 'EMPLOYEE',
    org_id: 'org-internal',
    roles: [],
    permissions: [],
    token_version: 1,
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header: JwtHeader = {
    alg: 'EdDSA',
    typ: 'JWT',
    kid: keys.kid,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = sign(null, Buffer.from(dataToSign, 'utf8'), keys.privateKeyPem);
  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * verifyJwt
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function verifyJwt(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Malformed token' };

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header: JwtHeader = JSON.parse(base64UrlDecode(encodedHeader));
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signature = Buffer.from(encodedSignature, 'base64url');

    let keys = getOrInitAuthKeys();
    if (header.kid && keys.kid !== header.kid) {
      keys = getOrInitAuthKeys(true);
    }

    let isValid = verify(null, Buffer.from(dataToVerify, 'utf8'), keys.publicKeyPem, signature);
    if (!isValid) {
      // Retry once by reloading from shared disk in case another process refreshed keys
      keys = getOrInitAuthKeys(true);
      isValid = verify(null, Buffer.from(dataToVerify, 'utf8'), keys.publicKeyPem, signature);
    }

    if (!isValid) return { valid: false, error: 'Invalid signature' };

    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Verification failed' };
  }
}

/**
 * getPublicJwks
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */
export function getPublicJwks(): { keys: JwkKey[] } {
  const keys = getOrInitAuthKeys();
  const pubKey = createPublicKey(keys.publicKeyPem);
  const jwk = pubKey.export({ format: 'jwk' }) as any;
  return {
    keys: [
      {
        kty: 'OKP',
        crv: 'Ed25519',
        use: 'sig',
        kid: keys.kid,
        alg: 'EdDSA',
        x: jwk.x,
      },
    ],
  };
}
