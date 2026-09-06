/**
 * @forge/sdk - Dynamic Service Registry Engine (2026 LTS)
 * Parses declarative app registrations from environment (.env)
 * Industry Standard: Spotify Backstage & Traefik Declarative Ingress Model
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Validated service metadata entry loaded from environment registry.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export interface ServiceEntry {
  id: string;
  name: string;
  port: number;
  path: string;
  category: string;
  role: string;
  containerName: string;
  upstreamUrl: string;
  isExternal: boolean;
  isPublic: boolean;
  healthUrl: string;
  status?: string;
}

/**
 * Options for configuring environment service registry loader.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export interface LoadRegistryOptions {
  envPath?: string;
  includeDisabled?: boolean;
}

import { Database } from 'bun:sqlite';
import { resolveCanonicalDbPath } from './database';

/**
 * Retrieves the active lifecycle status of a registered application.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export function getAppStatus(appId: string): string {
  try {
    const dbPath = resolveCanonicalDbPath('platform_core.db');
    if (!existsSync(dbPath)) return 'active';
    const db = new Database(dbPath, { readonly: true });
    const row = db.query('SELECT status FROM apps_registry WHERE id = ?').get(appId.toLowerCase()) as { status?: string } | null;
    db.close();
    return row?.status || 'active';
  } catch {
    return 'active';
  }
}

/**
 * Evaluates whether an application has been administratively disabled.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export function isAppDisabled(appId: string): boolean {
  return getAppStatus(appId) === 'disabled';
}

function isRegularFile(pathStr: string): boolean {
  try {
    return existsSync(pathStr) && statSync(pathStr).isFile();
  } catch {
    return false;
  }
}

function findEnvPath(explicitPath?: string): string | null {
  if (explicitPath && isRegularFile(explicitPath)) return explicitPath;
  let curr = process.cwd();
  let exampleFallback: string | null = null;
  for (let i = 0; i < 4; i++) {
    const candidate = join(curr, '.env');
    if (isRegularFile(candidate)) return candidate;
    if (!exampleFallback) {
      const example = join(curr, '.env.example');
      if (isRegularFile(example)) exampleFallback = example;
    }
    const parent = join(curr, '..');
    if (parent === curr) break;
    curr = parent;
  }
  return exampleFallback;
}

/**
 * Parses declarative app registrations from environment (.env) into validated service entries.
 * @requirements [HLR-SDK-301] [LLR-SDK-001] [LLR-SDK-005]
 */
export function loadServiceRegistry(options?: string | LoadRegistryOptions): ServiceEntry[] {
  const envPath = typeof options === 'string' ? options : options?.envPath;
  const includeDisabled = typeof options === 'object' ? options.includeDisabled ?? true : true;
  const resolvedEnvPath = findEnvPath(envPath);
  const envMap: Record<string, string> = { ...(process.env as Record<string, string>) };

  if (resolvedEnvPath && isRegularFile(resolvedEnvPath)) {
    const rawContent = readFileSync(resolvedEnvPath, 'utf8');
    for (const line of rawContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        envMap[key] = val;
      }
    }
  }

  const services: ServiceEntry[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    if (key.startsWith('APP_') && typeof value === 'string' && value.includes('|')) {
      const appId = key.replace('APP_', '').toLowerCase().replace(/_/g, '-');
      const parts = value.split('|').map((p) => p.trim());

      if (parts.length >= 3) {
        const name = parts[0];
        const port = Number(parts[1]) || 80;
        const path = parts[2];
        const category = parts[3] || 'Micro-Apps';
        const role = parts[4] || 'General';
        const isPublic = role.toLowerCase().includes('public');
        const status = getAppStatus(appId);

        if (!includeDisabled && status === 'disabled') {
          continue;
        }

        // Dynamically derive container name and upstream URL
        let containerName = parts[5] || appId;
        if (!parts[5]) {
          if (existsSync(join(process.cwd(), 'forge-apps', appId))) {
            containerName = `app-${appId}`;
          } else if (appId === 'devcenter') {
            containerName = 'dev-dashboard';
          } else if (appId === 'gateway') {
            containerName = 'dev-hub';
          }
        }

        // Derive clean upstream URL (supports remote domains, host.docker.internal, or docker network)
        let upstreamUrl: string;
        if (containerName.startsWith('http://') || containerName.startsWith('https://')) {
          upstreamUrl = containerName;
        } else if (port === 443) {
          upstreamUrl = `https://${containerName}`;
        } else {
          upstreamUrl = `http://${containerName}:${port}`;
        }

        const isRoot = path === '/';
        const isInternalLanding = isRoot && (containerName === 'landing' || containerName === 'ag-landing');
        const isExternal = isRoot ? !isInternalLanding : path !== '/';
        const healthUrl = isRoot ? '/health' : `${path}/health`;

        services.push({
          id: appId,
          name,
          port,
          path,
          category,
          role,
          containerName,
          upstreamUrl,
          isExternal,
          isPublic,
          healthUrl,
          status,
        });
      }
    }
  }

  // Backward compatibility: If no root path '/' service was explicitly declared in envMap,
  // register the default Platform Hub landing service unless explicitly disabled.
  const hasRootService = services.some((s) => s.path === '/');
  if (!hasRootService && envMap.DISABLE_LANDING !== 'true') {
    const landingPort = Number(envMap.LANDING_PORT || 3000);
    services.unshift({
      id: 'landing',
      name: 'Platform Hub (Landing)',
      port: landingPort,
      path: '/',
      category: 'Core Workspaces',
      role: 'Public Ingress',
      containerName: 'landing',
      upstreamUrl: `http://landing:${landingPort}`,
      isExternal: false,
      isPublic: true,
      healthUrl: '/health',
      status: 'active',
    });
  }

  return services;
}
