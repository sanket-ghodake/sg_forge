#!/usr/bin/env bun
/**
 * @forge/scripts - Dynamic Docker Lifecycle & Endpoint Banner Resolver (2026 LTS)
 * Reads .env declarations via @forge/sdk to compute active containers, protocol bindings, and accurate ingress URLs.
 * Eliminates hardcoded ports, dead routes, and unauthorized container startups.
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadBrandConfig, loadServiceRegistry, isBuiltinLandingActive, type ServiceEntry } from '../apps/src/sdk/src';

const REPO_ROOT = process.cwd();

/**
 * Gateway endpoint URLs and protocol flags.
 * @requirements [HLR-SDK-301] [LLR-SDK-005] [HLR-NET-001]
 */
export interface GatewayConfig {
  primary: string;
  http?: string;
  https?: string;
  enableHttp: boolean;
  enableHttps: boolean;
  httpPort: string;
  httpsPort: string;
}

/**
 * Target validation result.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export interface TargetValidation {
  valid: boolean;
  type: 'core' | 'forge' | 'unknown';
  name: string;
  composeService?: string;
  service?: ServiceEntry;
  message?: string;
}

/**
 * Resolves gateway URLs and enabled protocols from environment variables.
 * @requirements [HLR-SDK-301] [LLR-SDK-005] [HLR-NET-001]
 */
export function getGatewayConfig(envMode: 'dev' | 'prod'): GatewayConfig {
  const isProd = envMode === 'prod';
  const httpPort = isProd ? (process.env.PROD_HTTP_PORT || '80') : (process.env.HTTP_PORT || '8080');
  const httpsPort = isProd ? (process.env.PROD_HTTPS_PORT || '443') : (process.env.HTTPS_PORT || '8443');

  const rawEnableHttp = process.env.ENABLE_HTTP !== 'false';
  const rawEnableHttps = process.env.ENABLE_HTTPS === 'true';

  let enableHttp = rawEnableHttp;
  let enableHttps = rawEnableHttps;

  // Fallback: If both protocols are disabled, default to HTTP
  if (!enableHttp && !enableHttps) {
    enableHttp = true;
  }

  const httpUrl = enableHttp ? `http://localhost${httpPort === '80' ? '' : `:${httpPort}`}` : undefined;
  const httpsUrl = enableHttps ? `https://localhost${httpsPort === '443' ? '' : `:${httpsPort}`}` : undefined;
  const primary = (enableHttp ? httpUrl : httpsUrl) || 'http://localhost';

  return {
    primary,
    http: httpUrl,
    https: httpsUrl,
    enableHttp,
    enableHttps,
    httpPort,
    httpsPort,
  };
}

/**
 * Maps known core service IDs to docker-compose service names.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
const CORE_ID_TO_COMPOSE: Record<string, string> = {
  landing: 'landing',
  portal: 'portal',
  devcenter: 'dev-dashboard',
  gateway: 'dev-hub',
  auth: 'auth',
  docs: 'docs',
};

const ALL_CORE_COMPOSE_SERVICES = ['landing', 'portal', 'dev-dashboard', 'dev-hub', 'auth', 'docs'];

/**
 * Resolves which core docker-compose services should run or stop based on .env.
 * @requirements [HLR-SDK-301] [LLR-SDK-001] [LLR-SDK-005]
 */
export function resolveCoreServices(envMode: 'dev' | 'prod', profile = 'all'): { active: string[]; inactive: string[] } {
  const services = loadServiceRegistry({ includeDisabled: false });
  const activeSet = new Set<string>(['proxy']);

  const wantsAll = profile === 'all';
  const wantsCore = profile === 'core' || wantsAll;
  const wantsLanding = profile === 'landing' || wantsAll;
  const wantsMonitoring = profile === 'monitoring' || wantsAll;

  // 1. Landing service check
  if (wantsLanding && isBuiltinLandingActive()) {
    activeSet.add('landing');
  }

  // 2. Core platform apps registered in .env
  if (wantsCore) {
    for (const [id, composeName] of Object.entries(CORE_ID_TO_COMPOSE)) {
      if (id === 'landing') continue; // handled by isBuiltinLandingActive
      if (services.some((s) => s.id === id)) {
        activeSet.add(composeName);
      }
    }
  }

  // 3. Operational services
  if (wantsMonitoring) {
    activeSet.add('autoheal');
  }
  if (envMode === 'prod' && wantsAll) {
    activeSet.add('db-backup');
  }

  const active = Array.from(activeSet);
  const inactive = ALL_CORE_COMPOSE_SERVICES.filter((name) => !activeSet.has(name));

  return { active, inactive };
}

/**
 * Resolves active and inactive standalone Forge Apps from forge-apps/*.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export function resolveForgeApps(target?: string): { active: string[]; inactive: string[] } {
  const forgeAppsDir = join(REPO_ROOT, 'forge-apps');
  if (!existsSync(forgeAppsDir)) {
    return { active: [], inactive: [] };
  }

  const services = loadServiceRegistry({ includeDisabled: false });
  const entries = readdirSync(forgeAppsDir, { withFileTypes: true });

  const active: string[] = [];
  const inactive: string[] = [];

  const cleanTarget = target ? target.replace(/^app-/, '').toLowerCase() : undefined;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const appName = entry.name;
    if (appName === 'app-template' && cleanTarget !== 'app-template') continue;

    const composePath = join(forgeAppsDir, appName, 'docker-compose.yml');
    if (!existsSync(composePath)) continue;

    if (cleanTarget && appName !== cleanTarget) {
      continue;
    }

    // Check if app is enabled in service registry (.env)
    const isDeclared = services.some(
      (s) => s.id === appName || s.containerName === `app-${appName}` || s.containerName === appName
    );

    if (isDeclared) {
      active.push(appName);
    } else {
      inactive.push(appName);
    }
  }

  return { active, inactive };
}

/**
 * Validates whether a specific service or forge-app target is declared in .env.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export function validateTarget(rawTarget: string): TargetValidation {
  const target = rawTarget.trim();
  const cleanTarget = target.replace(/^app-/, '').toLowerCase();
  const services = loadServiceRegistry({ includeDisabled: false });

  // 1. Check if it matches a standalone forge-app directory
  const forgeDirCandidate = [cleanTarget, target, `app-${cleanTarget}`].find((cand) => {
    const p = join(REPO_ROOT, 'forge-apps', cand);
    return existsSync(p) && existsSync(join(p, 'docker-compose.yml'));
  });
  const forgePath = forgeDirCandidate ? join(REPO_ROOT, 'forge-apps', forgeDirCandidate) : null;
  const isForgeDir = Boolean(forgePath);
  const forgeName = forgeDirCandidate || cleanTarget;

  // 2. Check if declared in registry (.env)
  const registeredService = services.find(
    (s) =>
      s.id.toLowerCase() === cleanTarget ||
      s.id.toLowerCase() === forgeName ||
      s.containerName.toLowerCase() === cleanTarget ||
      s.containerName.toLowerCase() === forgeName ||
      s.containerName.toLowerCase() === `app-${cleanTarget}` ||
      s.containerName.toLowerCase() === `app-${forgeName}` ||
      (CORE_ID_TO_COMPOSE[s.id] && CORE_ID_TO_COMPOSE[s.id].toLowerCase() === cleanTarget)
  );

  if (isForgeDir) {
    if (!registeredService) {
      const envKey = `APP_${forgeName.toUpperCase().replace(/-/g, '_')}`;
      return {
        valid: false,
        type: 'forge',
        name: forgeName,
        message: `Standalone Forge App '${forgeName}' exists but is not declared or active in .env (${envKey} is missing).`,
      };
    }
    return {
      valid: true,
      type: 'forge',
      name: forgeName,
      service: registeredService,
    };
  }

  // 3. Check core services
  if (registeredService) {
    const composeName = CORE_ID_TO_COMPOSE[registeredService.id] || registeredService.containerName;
    return {
      valid: true,
      type: 'core',
      name: registeredService.id,
      composeService: composeName,
      service: registeredService,
    };
  }

  // 4. Check core services by compose service name (e.g. 'dev-dashboard')
  for (const [id, compose] of Object.entries(CORE_ID_TO_COMPOSE)) {
    if (compose === cleanTarget || compose === target) {
      const s = services.find((entry) => entry.id === id);
      if (s) {
        return { valid: true, type: 'core', name: id, composeService: compose, service: s };
      }
      return {
        valid: false,
        type: 'core',
        name: target,
        message: `Core service '${target}' is not active or declared in .env (APP_${id.toUpperCase().replace(/-/g, '_')} is missing).`,
      };
    }
  }

  return {
    valid: false,
    type: 'unknown',
    name: target,
    message: `Unknown service or app '${target}'. Not found in .env registry or forge-apps.`,
  };
}

/**
 * Prints an ergonomic and accurate terminal status banner reflecting active .env configuration.
 * @requirements [HLR-SDK-301] [LLR-SDK-001] [LLR-SDK-005] [HLR-NET-001]
 */
export function printBanner(envMode: 'dev' | 'prod', target?: string): void {
  const brand = loadBrandConfig();
  const gateway = getGatewayConfig(envMode);
  const services = loadServiceRegistry({ includeDisabled: false });

  if (target) {
    const val = validateTarget(target);
    if (!val.valid) {
      console.error(`\n❌ [${brand.name}] Target Validation Error:`);
      console.error(`   ${val.message}\n`);
      return;
    }

    const appPath = val.service ? val.service.path : (val.type === 'forge' ? `/apps/${val.name}` : `/${val.name}`);
    const appName = val.service ? val.service.name : val.name;
    const publicUrl = `${gateway.primary}${appPath}`;

    console.log(`\n✨ [${brand.name}] Service '${val.name}' is up and verified!`);
    console.log(`   ├─ Name:    ${appName}`);
    console.log(`   ├─ Ingress: ${publicUrl}`);
    console.log(`   └─ Gateway: ${gateway.primary}\n`);
    console.log(`✨ Service '${val.name}' active at ${publicUrl}`);
    return;
  }

  const landing = services.find((s) => s.path === '/');
  const subServices = services.filter((s) => s.path !== '/');

  console.log(`\n✨ [${brand.name}] Stack running in ${envMode.toUpperCase()} mode!`);
  console.log(`   Gateway: ${gateway.primary}${gateway.https && gateway.http ? ` (HTTPS: ${gateway.https})` : ''}`);
  console.log(`   Active Registered Services (${services.length}):`);

  if (landing) {
    const desc = landing.isExternal ? `Proxy -> ${landing.upstreamUrl}` : landing.name;
    console.log(`   ├─ ${'/'.padEnd(18)} -> ${gateway.primary}/ (${desc})`);
  } else {
    console.log(`   ├─ ${'/'.padEnd(18)} -> ${gateway.primary}/portal (Direct Portal Ingress)`);
  }

  for (let i = 0; i < subServices.length; i++) {
    const s = subServices[i];
    const isLast = i === subServices.length - 1;
    const branch = isLast ? '└─' : '├─';
    console.log(`   ${branch} ${s.path.padEnd(18)} -> ${gateway.primary}${s.path} (${s.name})`);
  }

  console.log('');
  if (landing && !landing.isExternal) {
    console.log(`✨ Stack running! Access Platform Hub at ${gateway.primary}/`);
  } else if (landing?.isExternal) {
    console.log(`✨ Stack running! Access Gateway at ${gateway.primary}/`);
  } else {
    console.log(`✨ Stack running! Access Portal at ${gateway.primary}/portal`);
  }
}

// -----------------------------------------------------------------------------
// CLI Dispatcher
// -----------------------------------------------------------------------------
if (import.meta.main) {
  const action = process.argv[2];
  const arg1 = process.argv[3] || 'dev';
  const arg2 = process.argv[4];

  switch (action) {
    case 'get-core-active': {
      const mode = (arg1 === 'prod' ? 'prod' : 'dev') as 'dev' | 'prod';
      const profile = arg2 || 'all';
      const { active } = resolveCoreServices(mode, profile);
      console.log(active.join(' '));
      break;
    }
    case 'get-core-inactive': {
      const mode = (arg1 === 'prod' ? 'prod' : 'dev') as 'dev' | 'prod';
      const profile = arg2 || 'all';
      const { inactive } = resolveCoreServices(mode, profile);
      console.log(inactive.join(' '));
      break;
    }
    case 'get-forge-active': {
      const target = arg1 && arg1 !== 'dev' && arg1 !== 'prod' ? arg1 : arg2;
      const { active } = resolveForgeApps(target);
      console.log(active.join(' '));
      break;
    }
    case 'get-forge-inactive': {
      const target = arg1 && arg1 !== 'dev' && arg1 !== 'prod' ? arg1 : arg2;
      const { inactive } = resolveForgeApps(target);
      console.log(inactive.join(' '));
      break;
    }
    case 'validate-target': {
      if (!arg1) {
        console.error('Target parameter required.');
        process.exit(1);
      }
      const val = validateTarget(arg1);
      if (!val.valid) {
        console.error(val.message);
        process.exit(1);
      }
      console.log(JSON.stringify(val));
      break;
    }
    case 'banner': {
      const mode = (arg1 === 'prod' ? 'prod' : 'dev') as 'dev' | 'prod';
      const target = arg2 && arg2 !== 'all' ? arg2 : undefined;
      printBanner(mode, target);
      break;
    }
    default:
      console.log('Usage: bun scripts/docker-resolver.ts [get-core-active|get-core-inactive|get-forge-active|get-forge-inactive|validate-target|banner]');
      process.exit(1);
  }
}
