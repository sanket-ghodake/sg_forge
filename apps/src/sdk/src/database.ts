/**
 * @forge/sdk - Canonical Database Client & Lifecycle Manager (2026 LTS)
 * Enterprise Cloud & Turso Architectural Baseline:
 * - Deterministic Data Directory Resolution across Host, Docker, & Subdirectories
 * - Automatic Test Isolation: Zero Mutation of Live Development/Production DBs during Tests
 * - High-Performance WAL Mode with Automatic Pragmas & TRUNCATE Checkpointing
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createLogger } from './logger';

const logger = createLogger('sdk-database');

/**
 * Determines whether the current process is running in an automated test environment.
 * Multi-signal detection: checks environment variables, global test runner symbols (describe/it/test),
 * and CLI arguments to ensure automated tests NEVER mutate live development or production databases.
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export function isTestEnvironment(): boolean {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.BUN_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    process.env.TEST === 'true' ||
    Boolean(process.env.FORGE_TEST_MODE)
  ) {
    return true;
  }

  // Runtime symbol detection (Bun test runner, Vitest, Jest globals)
  const g = globalThis as any;
  if (typeof g.describe === 'function' && (typeof g.it === 'function' || typeof g.test === 'function')) {
    return true;
  }

  // Process argument inspection (bun test, vitest, jest)
  if (Array.isArray(process.argv)) {
    const isTestArg = process.argv.some(
      (arg) =>
        arg === 'test' ||
        arg.endsWith('/bun:test') ||
        arg.includes('bun:test') ||
        arg.includes('.test.ts') ||
        arg.includes('.test.js') ||
        arg.includes('.spec.ts') ||
        arg.includes('.spec.js')
    );
    if (isTestArg) return true;
  }

  return false;
}


/**
 * Resolves the canonical data directory across diverse runtime contexts:
 * - Explicit Environment Override (FORGE_DATA_DIR, AG_DATA_DIR, DATA_DIR)
 * - Container-native standard mount (/app/data)
 * - Repository root execution (./apps/data)
 * - Subdirectory execution
 * @requirements [LLR-TURSO-001]
 */
export function resolveCanonicalDataDir(): string {
  // 1. Explicit Environment Override
  const customDataDir = process.env.FORGE_DATA_DIR || process.env.AG_DATA_DIR || process.env.DATA_DIR;
  if (customDataDir && existsSync(customDataDir)) {
    return customDataDir;
  }

  // 2. Container Standard Mount (/app/data)
  if (existsSync('/app/data')) {
    return '/app/data';
  }

  // 3. Anchor via module location (find root containing package.json and apps/src)
  try {
    let moduleCursor = import.meta.dir;
    for (let i = 0; i < 6; i++) {
      const candidateAppsData = join(moduleCursor, 'apps', 'data');
      if (existsSync(candidateAppsData)) {
        return candidateAppsData;
      }
      const candidateData = join(moduleCursor, 'data');
      if (existsSync(candidateData)) {
        return candidateData;
      }
      if (existsSync(join(moduleCursor, 'package.json')) && existsSync(join(moduleCursor, 'apps', 'src'))) {
        const target = join(moduleCursor, 'apps', 'data');
        if (!existsSync(target)) mkdirSync(target, { recursive: true });
        return target;
      }
      const parent = dirname(moduleCursor);
      if (parent === moduleCursor) break;
      moduleCursor = parent;
    }
  } catch {}

  // 4. Search relative to current working directory or upwards
  let currentDir = process.cwd();
  for (let i = 0; i < 4; i++) {
    const candidateAppsData = join(currentDir, 'apps', 'data');
    if (existsSync(candidateAppsData)) {
      return candidateAppsData;
    }
    const candidateData = join(currentDir, 'data');
    if (existsSync(candidateData)) {
      return candidateData;
    }
    const parent = dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }

  // 5. Local Workspace Development Fallback (data/)
  return join(process.cwd(), 'data');
}

/**
 * Resolves the full path to a SQLite database file, applying strict test isolation when applicable.
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export function resolveCanonicalDbPath(dbFileName: string, forceLive: boolean = false): string {
  const baseName = dbFileName.endsWith('.db') ? dbFileName : `${dbFileName}.db`;

  // Isolate automated tests from mutating live development or production databases
  if (isTestEnvironment()) {
    if (forceLive && process.env.ALLOW_LIVE_DB_IN_TEST !== 'true') {
      logger.warn(`Blocked attempt to access live database '${baseName}' during automated test execution! Set ALLOW_LIVE_DB_IN_TEST=true to override.`);
      forceLive = false;
    }

    if (!forceLive) {
      const testDir = process.env.FORGE_TEST_DATA_DIR || join(resolveCanonicalDataDir(), 'test-isolated');
      if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
      }
      const testDbName = baseName.startsWith('test-') ? baseName : `test-${baseName}`;
      return join(testDir, testDbName);
    }
  }

  const dataDir = resolveCanonicalDataDir();
  return join(dataDir, baseName);
}

/**
 * Options for configuring SQLite database client instantiation.
 * @requirements [HLR-SDK-302] [LLR-DB-002]
 */
export interface DatabaseClientOptions {
  readonly?: boolean;
  create?: boolean;
  forceLive?: boolean;
  busyTimeout?: number;
}

/**
 * Creates or retrieves a properly configured SQLite Database instance with WAL mode.
 * @requirements [HLR-SDK-302] [LLR-DB-002]
 */
export function getDatabaseClient(dbFileName: string, options: DatabaseClientOptions = {}): Database {
  const dbPath = resolveCanonicalDbPath(dbFileName, options.forceLive);
  const parentDir = dirname(dbPath);

  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  const db = new Database(dbPath, {
    readonly: options.readonly ?? false,
    create: options.create ?? true,
  });

  if (!options.readonly) {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA synchronous = NORMAL;');
      db.exec('PRAGMA foreign_keys = ON;');
      db.exec(`PRAGMA busy_timeout = ${options.busyTimeout ?? 5000};`);
    } catch (err) {
      logger.warn(`Failed to configure WAL pragmas on ${dbFileName}:`, { error: String(err) });
    }
  }

  return db;
}

/**
 * Cleanly flushes uncheckpointed WAL transactions and closes database instance.
 * @requirements [HLR-SDK-302] [LLR-DB-002]
 */
export function closeDatabaseClient(db: Database | null | undefined): void {
  if (!db) return;
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}
  try {
    db.close();
  } catch {}
}
