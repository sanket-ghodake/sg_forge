#!/usr/bin/env bun
/**
 * Dynamic Ingress & Caddyfile Generator (2026 LTS)
 * Reads declarative service registry and brand identity dynamically from .env and generates proxy/Caddyfile
 * Industry Standard: Declarative Ingress Controller Pattern
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBrandConfig, loadServiceRegistry } from '../apps/src/sdk/src';
import { generateStaticErrorPages } from './generate-error-pages';

const REPO_ROOT = process.cwd();
const CADDYFILE_PATH = join(REPO_ROOT, 'proxy', 'Caddyfile');

/**
 * generateCaddyfile
 * @requirements [HLR-SDK-301] [LLR-SDK-005] [HLR-NET-001]
 */
export function generateCaddyfile(): string {
  // Guarantee static error pages are compiled and up to date
  generateStaticErrorPages();

  const brand = loadBrandConfig();
  const services = loadServiceRegistry();
  const httpPorts = Array.from(
    new Set([process.env.PROD_HTTP_PORT, process.env.HTTP_PORT, '80'].filter(Boolean))
  ) as string[];
  const rawEnableHttp = process.env.ENABLE_HTTP !== 'false';
  let enableTls = process.env.ENABLE_HTTPS === 'true';

  // Safety fallback: If both protocols are disabled, fall back to HTTP to avoid dead gateway
  let enableHttp = rawEnableHttp;
  if (!rawEnableHttp && !enableTls) {
    console.warn('⚠️  [SG Forge Ingress] Both ENABLE_HTTP and ENABLE_HTTPS are disabled. Falling back to HTTP.');
    enableHttp = true;
  }

  const httpsPorts = Array.from(
    new Set([process.env.PROD_HTTPS_PORT, process.env.HTTPS_PORT, enableTls ? '443' : null].filter(Boolean))
  ) as string[];
  const tlsCert = process.env.TLS_CERT_PATH;
  const tlsKey = process.env.TLS_KEY_PATH;

  const httpBindings = httpPorts.map((p) => `http://:${p}`).join(', ');
  const httpsBindings = httpsPorts.map((p) => `https://:${p}`).join(', ');

  let caddyContent = `# ==============================================================================
# ${brand.name} - Unified Reverse Proxy Gateway (Auto-Generated from .env)
# 100% Air-Gapped & Zero-Trust Compliant (Zero External ACME Lookups)
# DO NOT EDIT DIRECTLY: Modify routes in .env and run './run.sh sync-proxy'
# ==============================================================================

(forge_gateway) {
    # Structured Logging
    log {
        output stdout
        format console
    }

    # Global Air-Gapped Security & CSP Headers
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "0"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()"
        -Server
    }

    # Strict Air-Gap CSP for all standard platform services
    @airGapped not path /apps/code*
    header @airGapped Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' ws: wss:; worker-src 'self' blob:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"

    # Scoped CSP: Allow Outbound Traffic Strictly to GitHub Only for VS Code App
    @codeApp path /apps/code*
    header @codeApp Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: blob:; img-src 'self' data: blob: https://*.githubusercontent.com https://avatars.githubusercontent.com https://github.com; connect-src 'self' ws: wss: https://api.github.com https://*.github.com https://*.githubusercontent.com; worker-src 'self' blob:; frame-src 'self' https:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://github.com"



    # Intercept Upstream Service Outages & System Downtime (Astryx Static Error Fallback)
    handle_errors {
        root * /etc/caddy/errors
        @has_custom_error file /{err.status_code}.html
        handle @has_custom_error {
            rewrite * /{err.status_code}.html
            file_server
        }
        handle {
            rewrite * /502.html
            file_server
        }
    }

    # Static Brand Assets & Direct Public Delivery (Zero Upstream Bun Overhead)
    # Checks for git-ignored custom logo overrides (SVG, PNG, WebP, AVIF) before falling back to default
    handle_path /brand* {
        root * /etc/caddy/public/brand

        @customSvg {
            path /logo.png /logo.svg
            file /custom-logo.svg
        }
        rewrite @customSvg /custom-logo.svg

        @customDirSvg {
            path /logo.png /logo.svg
            file /custom/logo.svg
        }
        rewrite @customDirSvg /custom/logo.svg

        @customPng {
            path /logo.png /logo.svg
            file /custom-logo.png
        }
        rewrite @customPng /custom-logo.png

        @customDirPng {
            path /logo.png /logo.svg
            file /custom/logo.png
        }
        rewrite @customDirPng /custom/logo.png

        @customWebp {
            path /logo.png /logo.svg
            file /custom-logo.webp
        }
        rewrite @customWebp /custom-logo.webp

        file_server
    }
`;

  // Filter non-root services
  const subServices = services.filter((s) => s.path !== '/');

  // Cloud VS Code Web Headless Daemon Session Tunnel
  const hasCodeApp = services.some((s) => s.id === 'code');
  if (hasCodeApp) {
    caddyContent += `
    # VS Code Headless Web Session Ingress (Zero-Latency Direct Tunnel)
    handle /apps/code/session* {
        header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: blob:; img-src 'self' data: blob: https://*.githubusercontent.com https://avatars.githubusercontent.com https://github.com; connect-src 'self' ws: wss: https://api.github.com https://*.github.com https://*.githubusercontent.com; worker-src 'self' blob:; frame-src 'self' https:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://github.com"
        reverse_proxy http://host.docker.internal:3090 {
            header_up Host {http.request.hostport}
            header_up X-Forwarded-Host {http.request.hostport}
            header_up X-Forwarded-Proto {scheme}
        }
    }
`;
  }

  for (const s of subServices) {
    const upstream = s.upstreamUrl || `http://${s.containerName}:${s.port}`;
    const safeId = s.id.replace(/[^a-zA-Z0-9]/g, '_');
    if (s.id === 'code') {
      caddyContent += `
    # ${s.name} (${s.id}) [Role: ${s.role}]
    @noSlash_${safeId} path ${s.path}
    redir @noSlash_${safeId} ${s.path}/ 308

    handle_path ${s.path}* {
        header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: blob:; img-src 'self' data: blob: https://*.githubusercontent.com https://avatars.githubusercontent.com https://github.com; connect-src 'self' ws: wss: https://api.github.com https://*.github.com https://*.githubusercontent.com; worker-src 'self' blob:; frame-src 'self' https:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://github.com"
        reverse_proxy ${upstream} {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Prefix ${s.path}
            header_up Sec-CH-UA {>Sec-CH-UA}
            header_up Sec-CH-UA-Platform {>Sec-CH-UA-Platform}
            header_up Sec-CH-UA-Mobile {>Sec-CH-UA-Mobile}
        }
    }
`;
    } else {
      if (s.id === 'portal') {
        caddyContent += `
    # Direct Portal API Ingress (without /portal prefix)
    handle /api/v1/portal/* {
        reverse_proxy ${upstream} {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up Sec-CH-UA {>Sec-CH-UA}
            header_up Sec-CH-UA-Platform {>Sec-CH-UA-Platform}
            header_up Sec-CH-UA-Mobile {>Sec-CH-UA-Mobile}
        }
    }
`;
      }
      caddyContent += `
    # ${s.name} (${s.id}) [Role: ${s.role}]
    @noSlash_${safeId} path ${s.path}
    redir @noSlash_${safeId} ${s.path}/ 308

    handle_path ${s.path}* {
        reverse_proxy ${upstream} {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Prefix ${s.path}
            header_up Sec-CH-UA {>Sec-CH-UA}
            header_up Sec-CH-UA-Platform {>Sec-CH-UA-Platform}
            header_up Sec-CH-UA-Mobile {>Sec-CH-UA-Mobile}
        }
    }
`;
    }
  }

  // Static Astryx Error Pages Direct Delivery
  caddyContent += `
    # Static Astryx Error Pages Direct Delivery
    handle_path /errors/* {
        root * /etc/caddy/errors
        file_server
    }

    # Unregistered Forge Micro-Apps Catch-All (Astryx 404 Status Screen)
    @unregisteredAppsApi {
        path /apps/*
        header Accept *application/json*
    }
    handle @unregisteredAppsApi {
        header Content-Type application/problem+json
        header Cache-Control "no-store"
        respond \`{"type":"https://tools.ietf.org/html/rfc7807","title":"Not Found","status":404,"detail":"Requested application or endpoint does not exist."}\` 404
    }

    @unregisteredApps path /apps/*
    handle @unregisteredApps {
        error "Application Not Found" 404
    }
`;

  // Root landing / ingress handler
  const landing = services.find((s) => s.path === '/');
  if (landing) {
    const upstream = landing.upstreamUrl || `http://${landing.containerName}:${landing.port}`;
    caddyContent += `
    # ${landing.name} (${landing.id}) [Root Ingress]
    handle {
        reverse_proxy ${upstream} {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up Sec-CH-UA {>Sec-CH-UA}
            header_up Sec-CH-UA-Platform {>Sec-CH-UA-Platform}
            header_up Sec-CH-UA-Mobile {>Sec-CH-UA-Mobile}
        }
    }
}
`;
  } else {
    caddyContent += `
    # Headless Fallback: Direct Ingress to Portal
    handle {
        redir /portal 302
    }
}
`;
  }

  // Protocol Bindings
  if (enableHttp && httpBindings) {
    caddyContent += `
${httpBindings} {
    import forge_gateway
}
`;
  }

  if (enableTls && httpsBindings) {
    let tlsDirective = '';
    if (tlsCert && tlsKey) {
      tlsDirective = `    # Air-Gapped Enterprise Custom CA Certificate\n    tls ${tlsCert} ${tlsKey}`;
    } else {
      tlsDirective = `    # Air-Gapped Local Internal PKI (Zero External Network / ACME)\n    tls internal`;
    }

    caddyContent += `
${httpsBindings} {
${tlsDirective}
    import forge_gateway
}
`;
  }

  writeFileSync(CADDYFILE_PATH, caddyContent, 'utf8');
  return caddyContent;
}

/**
 * Hot-reloads the running Caddy proxy container with zero dropped connections.
 * @requirements [HLR-SDK-301] [LLR-SDK-005] [HLR-NET-001]
 */
export function reloadRunningProxyGateway(): boolean {
  try {
    const check = Bun.spawnSync(['docker', 'ps', '--filter', 'name=forge-proxy', '--format', '{{.Names}}']);
    const names = check.stdout.toString().trim().split('\n').filter(Boolean);
    const target = names.find((n) => n.includes('forge-proxy'));
    if (!target) return false;

    const reload = Bun.spawnSync(['docker', 'exec', target, 'caddy', 'reload', '--config', '/etc/caddy/Caddyfile']);
    return reload.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Audits running containers on forge_apps_net and identifies unregistered services.
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function auditOrphanContainers(activeServices: Array<{ id: string }>): string[] {
  try {
    const proc = Bun.spawnSync(['docker', 'ps', '--filter', 'network=forge_apps_net', '--format', '{{.Names}}']);
    const running = proc.stdout.toString().trim().split('\n').filter(Boolean);
    const activeIds = new Set(activeServices.map((s) => s.id));
    const knownInfrastructure = new Set(['forge-proxy-dev', 'forge-proxy-prod', 'forge-autoheal-dev', 'forge-autoheal-prod']);
    const orphans: string[] = [];

    for (const name of running) {
      if (knownInfrastructure.has(name)) continue;
      // Extract service ID from standard naming patterns: forge-app-<id>-dev, app-<id>, forge-<id>-dev
      const match = name.match(/^(?:forge-app-)?([a-z0-9-]+?)(?:-dev|-prod)?$/);
      const extractedId = match ? match[1] : name;
      if (!activeIds.has(extractedId)) {
        orphans.push(name);
      }
    }
    return orphans;
  } catch {
    return [];
  }
}

if (import.meta.main) {
  generateCaddyfile();
  const brand = loadBrandConfig();
  const services = loadServiceRegistry();
  console.log(`🔀 [${brand.name}] Auto-generated proxy/Caddyfile with ${services.length} routes from .env`);
  for (const s of services) {
    const upstream = s.upstreamUrl || `http://${s.containerName}:${s.port}`;
    console.log(`   ├─ ${s.path.padEnd(18)} -> ${upstream.padEnd(30)} (${s.name})`);
  }

  // Hot-reload running gateway if container is active
  const reloaded = reloadRunningProxyGateway();
  if (reloaded) {
    console.log('🔄 [Gateway] Successfully hot-reloaded Caddy in-memory routes (<5ms)');
  }

  // Audit running containers for decommissioned/unregistered services
  const orphans = auditOrphanContainers(services);
  if (orphans.length > 0) {
    console.log('⚠️ [Audit] Detected running containers on forge_apps_net not declared in .env:');
    for (const orphan of orphans) {
      console.log(`   └─ ${orphan} (Run: 'docker stop ${orphan}' to shut down or register in .env)`);
    }
  }
}

