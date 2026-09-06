/**
 * @forge/sdk - Tier 1 Unit Test: Production Database Backup Engine (2026 LTS)
 * Conforms strictly to 3A Pattern (Arrange, Act, Assert) & Zero-Mock Verification
 */

import { describe, expect, it } from 'bun:test';
import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decryptBuffer, pruneExpiredBackups } from '@forge/sdk';

describe('Tier 1 Unit: Production Database Backup & Encryption Engine [LLR-DB-001] [LLR-DB-004]', () => {
  const scratchDir = join(process.cwd(), 'scratch', 'test-backups');

  it('Arrange, Act, Assert: verifies AES-256-GCM encrypt and decrypt roundtrip', () => {
    // Arrange
    const secretKey = 'test-audit-master-vault-encryption-key-32!';
    const originalText = 'CONFIDENTIAL_FINANCIAL_INVOICE_DATA_2026';
    const originalBuffer = Buffer.from(originalText, 'utf8');

    // Act
    const { createCipheriv, createHash, randomBytes } = require('node:crypto');
    const key = createHash('sha256').update(secretKey).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(originalBuffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, tag, encrypted]);

    const decryptedBuffer = decryptBuffer(payload, secretKey);

    // Assert
    expect(decryptedBuffer.toString('utf8')).toBe(originalText);
  });

  it('Arrange, Act, Assert: verifies atomic VACUUM INTO live snapshot and integrity check', () => {
    // Arrange
    mkdirSync(scratchDir, { recursive: true });
    const sourceDbPath = join(scratchDir, 'test_source.db');
    const targetDbPath = join(scratchDir, 'test_target.db');
    if (existsSync(sourceDbPath)) rmSync(sourceDbPath);
    if (existsSync(targetDbPath)) rmSync(targetDbPath);

    const sourceDb = new Database(sourceDbPath, { create: true });
    sourceDb.run('PRAGMA journal_mode = WAL;');
    sourceDb.run('CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL);');
    sourceDb.run("INSERT INTO users (id, email) VALUES ('u_1', 'admin@forge.internal');");

    // Act: Atomic snapshot using VACUUM INTO
    sourceDb.run(`VACUUM INTO '${targetDbPath}';`);
    sourceDb.close();

    // Assert: Verify snapshot exists and passes integrity_check
    expect(existsSync(targetDbPath)).toBe(true);
    const targetDb = new Database(targetDbPath, { readonly: true });
    const integrity = targetDb.query('PRAGMA integrity_check;').all() as any[];
    const rows = targetDb.query('SELECT * FROM users;').all() as any[];
    targetDb.close();

    expect(integrity[0]?.integrity_check).toBe('ok');
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe('admin@forge.internal');

    // Cleanup
    rmSync(scratchDir, { recursive: true, force: true });
  });

  it('Arrange, Act, Assert: verifies pruneExpiredBackups removes old snapshots while keeping active window', () => {
    // Arrange
    mkdirSync(scratchDir, { recursive: true });
    const oldSnapshot = join(scratchDir, 'snapshot_2020-01-01T00-00-00-000Z');
    const newSnapshot = join(scratchDir, 'snapshot_2099-01-01T00-00-00-000Z');
    mkdirSync(oldSnapshot, { recursive: true });
    mkdirSync(newSnapshot, { recursive: true });
    writeFileSync(join(oldSnapshot, 'dummy.txt'), 'old');
    writeFileSync(join(newSnapshot, 'dummy.txt'), 'new');

    // Simulate old modification time
    const utimesSync = require('node:fs').utimesSync;
    const pastTime = new Date('2020-01-01T00:00:00Z');
    utimesSync(oldSnapshot, pastTime, pastTime);

    // Act: Prune older than 24 hours
    const pruned = pruneExpiredBackups(scratchDir, 24);

    // Assert
    expect(pruned).toBe(1);
    expect(existsSync(oldSnapshot)).toBe(false);
    expect(existsSync(newSnapshot)).toBe(true);

    // Cleanup
    rmSync(scratchDir, { recursive: true, force: true });
  });
});
