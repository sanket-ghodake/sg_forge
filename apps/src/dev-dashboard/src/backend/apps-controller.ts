/**
 * @forge/dev-dashboard - Forge Apps Lifecycle & Dynamic Registry Controller (2026 LTS)
 * Manages micro-app registrations, dedicated Turso DB provisioning, .env syncing, and scaffolding.
 * Enterprise Micro-App Architectural Baseline
 */

import { Database } from 'bun:sqlite';
import { cpSync, existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createLogger } from '@forge/sdk';
import { type AppRegistryRecord, platformDb, resolveDataDir } from '../db';
import { servicesController } from './services-controller';
import { telemetryEngine } from './telemetry';

const logger = createLogger('apps-controller');

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export interface AppRegistrationPayload {
  id: string;
  name: string;
  port: number;
  ingress_path: string;
  category: string;
  access_role: string;
  container_name?: string;
  runtime_type?: string;
  remote_url?: string;
  storage_quota_mb?: number;
  autoProvisionDb?: boolean;
  persistToEnv?: boolean;
  scaffoldTemplate?: boolean;
}

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export interface AppDetailedInspect {
  app: AppRegistryRecord;
  health: {
    status: string;
    livez: boolean;
    readyz: boolean;
    latencyMs: number;
    memoryMb: number;
    cpuPercent: number;
    uptimeSeconds: number;
  };
  database: {
    exists: boolean;
    path: string;
    sizeBytes: number;
    walSizeBytes: number;
  };
  openIssuesCount: number;
  trafficEventsCount: number;
}

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export interface AppsFleetOverview {
  totalApps: number;
  runningApps: number;
  stoppedApps: number;
  degradedApps: number;
  disabledApps: number;
  totalDbStorageBytes: number;
  categories: Record<string, number>;
  roleBreakdown: Record<string, number>;
}

class AppsController {
  /**
   * Calculate next available non-conflicting port starting from 8088
   */
  public getNextAvailablePort(): number {
    const apps = platformDb.getAppsRegistry();
    const usedPorts = new Set<number>([3000, 3001, 3002, 3003, 3004, 8085, 8086, 8087]);
    for (const app of apps) {
      if (app.port) usedPorts.add(Number(app.port));
    }
    let candidate = 8088;
    while (usedPorts.has(candidate)) {
      candidate++;
    }
    return candidate;
  }

  /**
   * Get all registered Forge apps enriched with live health and DB info
   */
  public getEnrichedAppsList(): Array<AppRegistryRecord & { healthStatus: string; latencyMs: number; dbSizeBytes: number; openIssuesCount: number }> {
    const apps = platformDb.getAppsRegistry();
    const dataDir = resolveDataDir();
    const healthMap = new Map(servicesController.getAllHealthStatuses().map((s) => [s.id, s]));
    const issues = platformDb.getIssues(200);

    return apps.map((app) => {
      const health = healthMap.get(app.id);
      const dbPath = app.db_file_path || join(dataDir, `${app.id}.db`);
      let dbSizeBytes = 0;
      if (existsSync(dbPath)) {
        try {
          dbSizeBytes = statSync(dbPath).size;
        } catch {}
      }

      const openIssuesCount = issues.filter((i) => i.app_id === app.id && i.status !== 'resolved').length;

      return {
        ...app,
        healthStatus: health?.status || 'STOPPED',
        latencyMs: health?.latencyMs || 0,
        dbSizeBytes,
        openIssuesCount,
      };
    });
  }

  /**
   * Get fleet-wide summary metrics
   */
  public getFleetOverview(): AppsFleetOverview {
    const apps = this.getEnrichedAppsList();
    let totalDbStorageBytes = 0;
    const categories: Record<string, number> = {};
    const roleBreakdown: Record<string, number> = {};
    let runningApps = 0;
    let stoppedApps = 0;
    let degradedApps = 0;
    let disabledApps = 0;

    for (const app of apps) {
      totalDbStorageBytes += app.dbSizeBytes;
      categories[app.category] = (categories[app.category] || 0) + 1;
      roleBreakdown[app.access_role] = (roleBreakdown[app.access_role] || 0) + 1;

      if (app.status === 'disabled') disabledApps++;
      if (app.healthStatus === 'RUNNING') runningApps++;
      else if (app.healthStatus === 'DEGRADED') degradedApps++;
      else stoppedApps++;
    }

    return {
      totalApps: apps.length,
      runningApps,
      stoppedApps,
      degradedApps,
      disabledApps,
      totalDbStorageBytes,
      categories,
      roleBreakdown,
    };
  }

  /**
   * Deep diagnostic inspection of a single app
   */
  public inspectApp(id: string): AppDetailedInspect | null {
    const app = platformDb.getAppById(id);
    if (!app) return null;

    const healthList = servicesController.getAllHealthStatuses();
    const health = healthList.find((s) => s.id === id) || {
      status: 'STOPPED',
      livez: false,
      readyz: false,
      latencyMs: 0,
      memoryMb: 0,
      cpuPercent: 0,
      uptimeSeconds: 0,
    };

    const dataDir = resolveDataDir();
    const dbPath = app.db_file_path || join(dataDir, `${app.id}.db`);
    const walPath = `${dbPath}-wal`;

    let dbExists = false;
    let sizeBytes = 0;
    let walSizeBytes = 0;

    if (existsSync(dbPath)) {
      dbExists = true;
      try {
        sizeBytes = statSync(dbPath).size;
      } catch {}
    }
    if (existsSync(walPath)) {
      try {
        walSizeBytes = statSync(walPath).size;
      } catch {}
    }

    const issues = platformDb.getIssues(200).filter((i) => i.app_id === id && i.status !== 'resolved');
    const traffic = platformDb.getTrafficSummary(200).filter((t) => t.app_id === id);

    return {
      app,
      health: {
        status: health.status,
        livez: health.livez,
        readyz: health.readyz,
        latencyMs: health.latencyMs,
        memoryMb: health.memoryMb,
        cpuPercent: health.cpuPercent,
        uptimeSeconds: health.uptimeSeconds,
      },
      database: {
        exists: dbExists,
        path: dbPath,
        sizeBytes,
        walSizeBytes,
      },
      openIssuesCount: issues.length,
      trafficEventsCount: traffic.length,
    };
  }

  /**
   * Register a new Forge App with validation, optional DB provisioning, and .env sync
   */
  public registerApp(payload: AppRegistrationPayload): { success: boolean; id: string; message: string; warnings?: string[] } {
    const warnings: string[] = [];
    const id = payload.id.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');

    if (!id || id.length < 2) {
      throw new Error('App ID must be at least 2 alphanumeric characters.');
    }
    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('App Display Name is required.');
    }
    if (!payload.port || payload.port < 1024 || payload.port > 65535) {
      throw new Error('Port must be between 1024 and 65535.');
    }

    // Check duplicate ID
    const existing = platformDb.getAppById(id);
    if (existing) {
      throw new Error(`An app with ID "${id}" is already registered.`);
    }

    const dataDir = resolveDataDir();
    const dbPath = join(dataDir, `${id}.db`);

    // 1. Auto-provision dedicated Turso SQLite DB if requested
    if (payload.autoProvisionDb) {
      try {
        if (!existsSync(dbPath)) {
          const dbInstance = new Database(dbPath, { create: true });
          dbInstance.run('PRAGMA journal_mode = WAL;');
          dbInstance.run('PRAGMA auto_vacuum = INCREMENTAL;');
          dbInstance.run(`CREATE TABLE IF NOT EXISTS _forge_metadata (
            key TEXT PRIMARY KEY,
            value TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );`);
          dbInstance.run(
            `INSERT OR IGNORE INTO _forge_metadata (key, value) VALUES ('app_id', ?), ('initialized_by', 'dev-dashboard');`,
            [id]
          );
          dbInstance.close();
          logger.info(`✨ Auto-provisioned dedicated Turso DB for ${id} at ${dbPath}`);
        }
      } catch (err: any) {
        warnings.push(`DB auto-provisioning notice: ${err.message || err}`);
      }
    }

    // 2. Insert into Platform DB
    platformDb.registerApp({
      id,
      name: payload.name.trim(),
      port: Number(payload.port),
      ingress_path: payload.ingress_path || `/apps/${id}`,
      category: payload.category || 'Isolated Polyglot Forge Micro-Apps',
      access_role: payload.access_role || 'General',
      container_name: payload.container_name || `app-${id}`,
      db_file_path: dbPath,
      runtime_type: payload.runtime_type || 'bun-watch',
      remote_url: payload.remote_url || null,
      storage_quota_mb: payload.storage_quota_mb || 50,
    });

    // 3. Persist to .env if requested
    if (payload.persistToEnv) {
      try {
        this.persistAppToEnv(id, payload);
      } catch (err: any) {
        warnings.push(`Failed to persist to .env: ${err.message || err}`);
      }
    }

    // 4. Scaffold template if requested
    if (payload.scaffoldTemplate) {
      try {
        this.scaffoldAppTemplate(id, payload.name);
      } catch (err: any) {
        warnings.push(`Scaffolding notice: ${err.message || err}`);
      }
    }

    telemetryEngine.pushLog(
      id,
      'INFO',
      `🚀 Forge App "${payload.name}" (${id}) registered successfully on port :${payload.port}`,
      'app'
    );

    return {
      success: true,
      id,
      message: `Forge App "${payload.name}" registered successfully.`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Update existing app configuration
   */
  public updateApp(id: string, updates: Partial<AppRegistryRecord>): { success: boolean; message: string } {
    const existing = platformDb.getAppById(id);
    if (!existing) {
      throw new Error(`App with ID "${id}" not found.`);
    }

    const ok = platformDb.updateApp(id, updates);
    if (!ok) throw new Error('Failed to update app record.');

    telemetryEngine.pushLog(id, 'INFO', `App "${id}" configuration updated.`, 'app');
    return { success: true, message: `App "${id}" updated successfully.` };
  }

  public toggleAppStatus(id: string): { success: boolean; id: string; status: string; message: string } {
    const existing = platformDb.getAppById(id);
    if (!existing) throw new Error(`App with ID "${id}" not found.`);
    const newStatus = existing.status === 'disabled' ? 'active' : 'disabled';
    const ok = platformDb.setAppStatus(id, newStatus);
    if (!ok) throw new Error(`Failed to update status for app "${id}".`);
    telemetryEngine.pushLog(id, newStatus === 'disabled' ? 'WARN' : 'INFO', `Micro-app "${id}" status changed to ${newStatus.toUpperCase()}`, 'app');
    return { success: true, id, status: newStatus, message: `Micro-app "${existing.name}" is now ${newStatus.toUpperCase()}.` };
  }

  /**
   * Delete / Deregister an app
   */
  public deleteApp(id: string, deleteDb = false): { success: boolean; message: string } {
    const existing = platformDb.getAppById(id);
    if (!existing) {
      throw new Error(`App with ID "${id}" not found.`);
    }

    platformDb.deleteApp(id);

    if (deleteDb && existing.db_file_path && existsSync(existing.db_file_path)) {
      try {
        rmSync(existing.db_file_path, { force: true });
        if (existsSync(`${existing.db_file_path}-wal`)) rmSync(`${existing.db_file_path}-wal`, { force: true });
        if (existsSync(`${existing.db_file_path}-shm`)) rmSync(`${existing.db_file_path}-shm`, { force: true });
        logger.info(`🗑️ Deleted dedicated DB for app ${id}`);
      } catch (err) {
        logger.warn(`Could not delete DB file for ${id}: ${err}`);
      }
    }

    telemetryEngine.pushLog(id, 'WARN', `App "${id}" deregistered from Platform Registry.`, 'app');
    return { success: true, message: `App "${id}" deregistered successfully.` };
  }

  /**
   * Scaffold boilerplate from forge-apps/app-template into forge-apps/<id>
   */
  public scaffoldAppTemplate(id: string, name: string): { success: boolean; path: string } {
    const targetDir = join(process.cwd(), 'forge-apps', id);
    const templateDir = join(process.cwd(), 'forge-apps', 'app-template');

    if (existsSync(targetDir)) {
      return { success: true, path: targetDir };
    }

    if (!existsSync(templateDir)) {
      throw new Error('Template directory forge-apps/app-template does not exist.');
    }

    cpSync(templateDir, targetDir, { recursive: true });

    const pkgJsonPath = join(targetDir, 'package.json');
    if (existsSync(pkgJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
        pkg.name = `@forge/app-${id}`;
        pkg.description = `Forge Micro-App: ${name}`;
        writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
      } catch {}
    }

    logger.info(`🏗️ Scaffolded standalone Forge micro-app at forge-apps/${id}`);
    telemetryEngine.pushLog(id, 'INFO', `Scaffolded directory forge-apps/${id}`, 'app');

    return { success: true, path: targetDir };
  }

  /**
   * Append / Update APP_<ID> line in root .env
   */
  private persistAppToEnv(id: string, payload: AppRegistrationPayload): void {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) return;

    const envKey = `APP_${id.toUpperCase().replace(/-/g, '_')}`;
    const envVal = `"${payload.name}|${payload.port}|${payload.ingress_path || `/apps/${id}`}|${payload.category || 'Isolated Polyglot Forge Micro-Apps'}|${payload.access_role || 'General'}|${payload.container_name || `app-${id}`}"`;

    let content = readFileSync(envPath, 'utf8');
    if (content.includes(`${envKey}=`)) {
      content = content.replace(new RegExp(`^${envKey}=.*$`, 'm'), `${envKey}=${envVal}`);
    } else {
      content += `\n# Dynamically provisioned micro-app ${id}\n${envKey}=${envVal}\n`;
    }
    writeFileSync(envPath, content, 'utf8');
    logger.info(`📝 Persisted ${envKey} to .env`);
  }
}

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export const appsController = new AppsController();

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export async function handleAppsApi(path: string, req: Request, url: URL): Promise<Response | null> {
  if (path === '/api/apps' && req.method === 'GET') {
    return Response.json({ status: 'ok', apps: appsController.getEnrichedAppsList(), overview: appsController.getFleetOverview() });
  }

  if (path === '/api/apps/next-port' && req.method === 'GET') {
    return Response.json({ status: 'ok', port: appsController.getNextAvailablePort() });
  }

  if (path === '/api/apps/inspect' && req.method === 'GET') {
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing app id query parameter' }, { status: 400 });
    const details = appsController.inspectApp(id);
    return details ? Response.json({ status: 'ok', ...details }) : Response.json({ error: `App "${id}" not found` }, { status: 404 });
  }

  if (path === '/api/apps/register' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
      return Response.json(appsController.registerApp(body), { status: 201 });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to register app' }, { status: 400 });
    }
  }

  if (path === '/api/apps/update' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing app id' }, { status: 400 });
      return Response.json(appsController.updateApp(body.id, body.updates || body));
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to update app' }, { status: 400 });
    }
  }

  if (path === '/api/apps/toggle-status' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing app id' }, { status: 400 });
      return Response.json(appsController.toggleAppStatus(body.id));
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to toggle app status' }, { status: 400 });
    }
  }

  if (path === '/api/apps/delete' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing app id' }, { status: 400 });
      return Response.json(appsController.deleteApp(body.id, body.deleteDb === true));
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to delete app' }, { status: 400 });
    }
  }

  if (path === '/api/apps/scaffold' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing app id' }, { status: 400 });
      return Response.json(appsController.scaffoldAppTemplate(body.id, body.name || body.id));
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to scaffold template' }, { status: 400 });
    }
  }

  return null;
}
