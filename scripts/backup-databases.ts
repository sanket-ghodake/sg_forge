#!/usr/bin/env bun
/**
 * @forge/scripts/backup-databases - Enterprise Production Database Backup & Integrity Engine (2026 LTS)
 *
 * Capabilities:
 * 1. Guaranteed Live Copy: Uses SQLite's atomic VACUUM INTO (zero locks, zero corrupted WAL frames)
 * 2. Automated Post-Backup Verification: Runs PRAGMA integrity_check & foreign_key_check on all copies
 * 3. Continuous OS Daemon: Can run continuously as a background daemon with hourly timer loops
 * 4. Automatic Pruning: Retains rolling backup window (default: 7 days / 168 hours) to prevent disk fill
 * 5. Optional AES-256-GCM Encryption: Secures raw database dumps against unauthorized exfiltration
 * 6. Hybrid Storage: Backs up from host apps/data or live running production Docker containers
 */

import { Database } from 'bun:sqlite';
import {
  encryptBuffer,
  pruneExpiredBackups,
  vacuumSnapshotHost,
  verifySnapshotIntegrity,
} from '@forge/sdk';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';

// --- Configuration & Defaults ---
const REPO_ROOT = process.cwd();
const DEFAULT_BACKUP_DIR = join(REPO_ROOT, 'backups', 'db');

function resolveBackupDir(): string {
  const envDir = process.env.DB_BACKUP_DIR?.trim();
  if (envDir && envDir.length > 0) {
    return resolve(REPO_ROOT, envDir);
  }
  return DEFAULT_BACKUP_DIR;
}

const BACKUP_DIR = resolveBackupDir();
const RETENTION_HOURS = Math.max(1, Number(process.env.DB_BACKUP_RETENTION_HOURS) || 168); // 7 days
const INTERVAL_MINUTES = Math.max(1, Number(process.env.DB_BACKUP_INTERVAL_MINUTES) || 60); // Hourly
const ENCRYPT_BACKUP = process.env.DB_BACKUP_ENCRYPT === 'true';
const ENCRYPTION_KEY = process.env.DB_BACKUP_ENCRYPTION_KEY || '';

// Known Core Platform Microservice DB Names across SG Forge (Core Services Only)
// Independent Forge Apps manage their own backups inside forge-apps/<app>/backups/db
const CORE_DATABASES = [
  'auth.db',
  'portal.db',
  'platform_core.db',
  'dev_hub.db',
];

/**
 * BackupFileResult
 * @requirements [HLR-SDK-302] [LLR-DB-004]
 */
export interface BackupFileResult {
  dbName: string;
  sourceType: 'host' | 'docker';
  sizeBytes: number;
  sha256: string;
  integrityOk: boolean;
  foreignKeyOk: boolean;
  isEncrypted: boolean;
  error?: string;
}

/**
 * BackupRunManifest
 * @requirements [HLR-SDK-302] [LLR-DB-004]
 */
export interface BackupRunManifest {
  timestamp: number;
  dateIso: string;
  backupDirectory: string;
  durationMs: number;
  totalDatabases: number;
  successfulCount: number;
  failedCount: number;
  encryptionEnabled: boolean;
  databases: BackupFileResult[];
}

// --- Discover Host Data Directory ---
function getHostDataDir(): string | null {
  const custom = process.env.FORGE_DATA_DIR || process.env.DATA_DIR;
  if (custom && existsSync(custom)) return custom;

  const candidates = [
    join(REPO_ROOT, 'apps', 'data'),
    join(REPO_ROOT, 'data'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

function discoverDatabaseSources(): Map<string, { path: string; type: 'host' | 'docker' }> {
  const sources = new Map<string, { path: string; type: 'host' | 'docker' }>();

  // 1. Check Docker production multi-volume mount (/app/data_sources/*)
  const dockerSourcesDir = '/app/data_sources';
  if (existsSync(dockerSourcesDir)) {
    try {
      for (const sub of readdirSync(dockerSourcesDir)) {
        const subPath = join(dockerSourcesDir, sub);
        try {
          if (statSync(subPath).isDirectory()) {
            for (const file of readdirSync(subPath)) {
              if (file.endsWith('.db') && !file.startsWith('test-') && !file.includes('-wal') && !file.includes('-shm')) {
                sources.set(file, { path: join(subPath, file), type: 'docker' });
              }
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 2. Check Host data directories (apps/data, data, FORGE_DATA_DIR)
  const hostDataDir = getHostDataDir();
  if (hostDataDir && existsSync(hostDataDir)) {
    try {
      for (const file of readdirSync(hostDataDir)) {
        if (file.endsWith('.db') && !file.startsWith('test-') && !file.includes('-wal') && !file.includes('-shm') && CORE_DATABASES.includes(file)) {
          if (!sources.has(file)) {
            sources.set(file, { path: join(hostDataDir, file), type: 'host' });
          }
        }
      }
    } catch {}
  }

  return sources;
}

// --- Execute Full Platform Backup ---
/**
 * executeBackup
 * @requirements [HLR-SDK-302] [LLR-DB-004]
 */
export async function executeBackup(): Promise<BackupRunManifest> {
  const startTime = Date.now();
  const dateStr = new Date(startTime).toISOString().replace(/[:.]/g, '-');
  const snapshotFolderName = `snapshot_${dateStr}`;
  const targetFolder = join(BACKUP_DIR, snapshotFolderName);

  mkdirSync(targetFolder, { recursive: true });

  const results: BackupFileResult[] = [];
  const discovered = discoverDatabaseSources();

  for (const [dbName, sourceInfo] of discovered.entries()) {
    const destDbPath = join(targetFolder, dbName);

    try {
      vacuumSnapshotHost(sourceInfo.path, destDbPath);

        const verification = verifySnapshotIntegrity(destDbPath);
        let finalSizeBytes = statSync(destDbPath).size;
        let finalSha256 = createHash('sha256').update(readFileSync(destDbPath)).digest('hex');
        let isEncrypted = false;

        // Apply AES-256-GCM if enabled
        if (ENCRYPT_BACKUP && ENCRYPTION_KEY) {
          const rawBuffer = readFileSync(destDbPath);
          const encryptedBuffer = encryptBuffer(rawBuffer, ENCRYPTION_KEY);
          const encPath = `${destDbPath}.enc`;
          writeFileSync(encPath, encryptedBuffer);
          rmSync(destDbPath, { force: true });
          finalSizeBytes = encryptedBuffer.length;
          finalSha256 = createHash('sha256').update(encryptedBuffer).digest('hex');
          isEncrypted = true;
        }

        results.push({
          dbName,
          sourceType: sourceInfo.type,
          sizeBytes: finalSizeBytes,
          sha256: finalSha256,
          integrityOk: verification.integrityOk,
          foreignKeyOk: verification.foreignKeyOk,
          isEncrypted,
        });
      } catch (err: any) {
        results.push({
          dbName,
          sourceType: sourceInfo.type,
          sizeBytes: 0,
          sha256: '',
          integrityOk: false,
          foreignKeyOk: false,
          isEncrypted: false,
          error: err?.message || String(err),
        });
      }
    }

  const durationMs = Date.now() - startTime;
  const manifest: BackupRunManifest = {
    timestamp: startTime,
    dateIso: new Date(startTime).toISOString(),
    backupDirectory: targetFolder,
    durationMs,
    totalDatabases: results.length,
    successfulCount: results.filter((r) => r.integrityOk).length,
    failedCount: results.filter((r) => !r.integrityOk).length,
    encryptionEnabled: ENCRYPT_BACKUP,
    databases: results,
  };

  // Write manifest
  writeFileSync(join(targetFolder, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // Prune expired backups
  pruneExpiredBackups(BACKUP_DIR, RETENTION_HOURS);

  return manifest;
}

// --- CLI Runner & Daemon Loop ---
async function runCli(): Promise<void> {
  const args = process.argv.slice(2);
  const isDaemon = args.includes('--daemon');
  const isVerify = args.includes('--verify');

  if (isVerify) {
    console.log(`🔍 Inspecting backups in: ${BACKUP_DIR}`);
    if (!existsSync(BACKUP_DIR)) {
      console.log('❌ No backup directory found.');
      process.exit(1);
    }
    const snapshots = readdirSync(BACKUP_DIR).filter((d) => d.startsWith('snapshot_')).sort().reverse();
    if (snapshots.length === 0) {
      console.log('ℹ️ No snapshots found to verify.');
      process.exit(0);
    }
    const latest = snapshots[0];
    const manifestPath = join(BACKUP_DIR, latest, 'manifest.json');
    if (existsSync(manifestPath)) {
      console.log(`📄 Latest Snapshot (${latest}):`);
      console.log(readFileSync(manifestPath, 'utf8'));
    } else {
      console.log(`⚠️ Snapshot ${latest} exists but has no manifest.json`);
    }
    process.exit(0);
  }

  console.log('======================================================================');
  console.log('🛡️ SG Forge - Production Database Backup Engine (2026 LTS)');
  console.log(`📁 Destination:   ${BACKUP_DIR}`);
  console.log(`⏱️ Retention:     ${RETENTION_HOURS} hours (${(RETENTION_HOURS / 24).toFixed(1)} days)`);
  console.log(`🔒 Encryption:    ${ENCRYPT_BACKUP ? 'AES-256-GCM (Enabled)' : 'Disabled (Plaintext Snapshot)'}`);
  console.log('======================================================================');

  if (isDaemon) {
    console.log(`🚀 Daemon mode active! Running backup every ${INTERVAL_MINUTES} minute(s)...`);

    // Initial backup run
    try {
      const firstManifest = await executeBackup();
      console.log(`✅ [${firstManifest.dateIso}] Initial backup completed in ${firstManifest.durationMs}ms (${firstManifest.successfulCount}/${firstManifest.totalDatabases} DBs verified OK)`);
    } catch (err) {
      console.error('❌ Initial backup failed:', err);
    }

    // Continuous interval loop
    const intervalMs = INTERVAL_MINUTES * 60 * 1000;
    const intervalId = setInterval(async () => {
      try {
        const manifest = await executeBackup();
        console.log(`✅ [${manifest.dateIso}] Hourly backup completed in ${manifest.durationMs}ms (${manifest.successfulCount}/${manifest.totalDatabases} DBs verified OK)`);
      } catch (err) {
        console.error('❌ Scheduled backup failed:', err);
      }
    }, intervalMs);

    // Graceful termination
    const shutdown = () => {
      console.log('\n🛑 Stopping database backup daemon gracefully...');
      clearInterval(intervalId);
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } else {
    // One-shot execution
    try {
      const manifest = await executeBackup();
      console.log(`\n🎉 Backup Snapshot Created Successfully!`);
      console.log(`   Folder:     ${manifest.backupDirectory}`);
      console.log(`   Duration:   ${manifest.durationMs}ms`);
      console.log(`   Databases:  ${manifest.successfulCount} passed, ${manifest.failedCount} failed`);

      for (const db of manifest.databases) {
        const status = db.integrityOk ? '✅' : '❌';
        const encLabel = db.isEncrypted ? ' [AES-256-GCM]' : '';
        console.log(`   ${status} ${db.dbName.padEnd(20)} | ${(db.sizeBytes / 1024).toFixed(1)} KB | SHA: ${db.sha256.slice(0, 8)}...${encLabel}`);
      }

      if (manifest.failedCount > 0) {
        process.exit(1);
      }
    } catch (err) {
      console.error('❌ Backup execution failed:', err);
      process.exit(1);
    }
  }
}

if (import.meta.main) {
  runCli();
}
