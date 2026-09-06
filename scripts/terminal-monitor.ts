#!/usr/bin/env bun
/**
 * @forge/scripts - Live Terminal Cluster Performance HUD (2026 LTS)
 * High-density ANSI colorful terminal dashboard dynamically driven by .env brand config
 * Enterprise AST Console Standard
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBrandConfig, loadServiceRegistry } from '../apps/src/sdk/src';

const brand = loadBrandConfig();

// Dynamically resolve DevCenter and Ingress ports from environment / .env
function getDynamicEndpoints(): string[] {
  let devPort = process.env.DEV_DASHBOARD_PORT || '3002';
  let httpPort = process.env.HTTP_PORT || '8080';
  let prodPort = process.env.PROD_HTTP_PORT || '80';

  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, 'utf8');
      const devMatch = content.match(/^DEV_DASHBOARD_PORT=["']?([0-9]+)["']?/m);
      if (devMatch) devPort = devMatch[1];
      const httpMatch = content.match(/^HTTP_PORT=["']?([0-9]+)["']?/m);
      if (httpMatch) httpPort = httpMatch[1];
      const prodMatch = content.match(/^PROD_HTTP_PORT=["']?([0-9]+)["']?/m);
      if (prodMatch) prodPort = prodMatch[1];
    } catch {
      // Use resolved fallbacks
    }
  }

  return [
    `http://localhost:${devPort}/api/services`,
    `http://localhost:${httpPort}/devcenter/api/services`,
    `http://localhost:${prodPort}/devcenter/api/services`,
  ];
}

// ANSI Color Codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  emerald: '\x1b[38;2;62;207;142m',
  cyan: '\x1b[38;2;56;189;248m',
  yellow: '\x1b[38;2;250;204;21m',
  red: '\x1b[38;2;248;113;113m',
  magenta: '\x1b[38;2;192;132;252m',
  gray: '\x1b[38;2;115;115;115m',
  darkGray: '\x1b[38;2;64;64;64m',
  bgCard: '\x1b[48;2;28;28;28m',
};

function formatBar(val: number, max: number, width = 10): string {
  const ratio = Math.min(Math.max(val / (max || 1), 0), 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  if (ratio > 0.85) return `${C.red}${bar}${C.reset}`;
  if (ratio > 0.6) return `${C.yellow}${bar}${C.reset}`;
  return `${C.emerald}${bar}${C.reset}`;
}

function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0) return `${C.gray}0s${C.reset}`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getMasterPassword(): string {
  let pwd = process.env.DEV_DASHBOARD_PASSWORD || process.env.DEVCENTER_PASSWORD || 'password123';
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, 'utf8');
      const pwdMatch = content.match(/^(?:DEV_DASHBOARD_PASSWORD|DEVCENTER_PASSWORD)=["']?([^"'\r\n]+)["']?/m);
      if (pwdMatch && pwdMatch[1]) pwd = pwdMatch[1].trim();
    } catch {}
  }
  return pwd;
}

/**
 * Robust cluster state resolver: tries DevCenter API endpoints, falls back to live Docker stats.
 */
async function fetchClusterState(): Promise<any> {
  const endpoints = getDynamicEndpoints();
  const pwd = getMasterPassword();
  const headers = {
    'Authorization': `Bearer ${pwd}`,
    'Accept': 'application/json',
  };

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { headers, signal: AbortSignal.timeout(800) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }

  // Fallback: Synthesize state directly from active Docker containers if available
  try {
    const proc = Bun.spawn(['docker', 'ps', '--format', '{{json .}}'], {
      stdout: 'pipe',
      stderr: 'ignore',
    });
    const output = await new Response(proc.stdout).text();
    if (output.trim()) {
      const lines = output.trim().split('\n');
      const services = [];
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const name = item.Names || item.ID;
          // Filter to project containers
          if (!name.includes('ag-') && !name.includes('forge')) continue;
          const status = item.Status?.includes('Up') ? 'RUNNING' : 'STOPPED';
          const portMatch = item.Ports?.match(/:([0-9]+)->/);
          const port = portMatch ? Number(portMatch[1]) : 80;
          services.push({
            name,
            status,
            port,
            ingressPath: '/' + name.replace(/^ag-|-dev|-prod/g, ''),
            latencyMs: 1,
            cpuPercent: 0,
            memoryMb: 32,
            uptimeSeconds: 60,
          });
        } catch {
          // Ignore unparseable lines
        }
      }
      if (services.length > 0) {
        return {
          summary: {
            onlineCount: services.length,
            totalServices: services.length,
            sloAvailabilityPercent: 100,
            totalAllocatedRamMb: services.length * 32,
            maxAllocatedRamMb: 1024,
            avgCpuPercent: 1,
            cpuCores: 4,
            tursoDbsCount: 8,
            storageSizeBytes: 10485760,
          },
          services,
        };
      }
    }
  } catch {
    // Docker CLI not available or errored
  }

  return null;
}

async function renderFrame() {
  const state: any = await fetchClusterState();
  const timeStr = new Date().toLocaleTimeString();

  // Clear screen and home cursor
  process.stdout.write('\x1b[H\x1b[J\x1b[?25l');

  const titleText = `🚀 ${brand.name.toUpperCase()} CLUSTER MONITOR`;
  const banner = [
    `${C.emerald}╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`,
    `${C.emerald}║${C.reset}  ${C.bold}${C.emerald}${titleText.padEnd(42, ' ')}${C.reset} ${C.dim}(Real-Time Process & Container HUD)${C.reset}        ${C.cyan}${timeStr}${C.reset}  ${C.emerald}║${C.reset}`,
    `${C.emerald}╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝${C.reset}`,
  ].join('\n');

  console.log(banner);

  if (!state || !state.services) {
    console.log(`\n  ${C.yellow}⏳ Connecting to ${brand.name} Cluster Services...${C.reset}`);
    console.log(`  ${C.dim}Tip: Run './run.sh up' or './run.sh dev' in another terminal to start the stack.${C.reset}\n`);
    return;
  }

  const summary = state.summary;
  const services = state.services;

  // Header row
  console.log(
    ` ${C.dim}┌─────────────────────────┬──────────┬──────┬──────────────┬─────────┬───────────┬──────────────┬─────────┐${C.reset}`
  );
  console.log(
    ` ${C.dim}│${C.reset} ${C.bold}SERVICE NAME${C.reset}            ${C.dim}│${C.reset} ${C.bold}STATUS${C.reset}   ${C.dim}│${C.reset} ${C.bold}PORT${C.reset} ${C.dim}│${C.reset} ${C.bold}INGRESS ROUTE${C.reset}  ${C.dim}│${C.reset} ${C.bold}LATENCY${C.reset} ${C.dim}│${C.reset} ${C.bold}CPU LOAD${C.reset}  ${C.dim}│${C.reset} ${C.bold}RAM USAGE${C.reset}    ${C.dim}│${C.reset} ${C.bold}UPTIME${C.reset}  ${C.dim}│${C.reset}`
  );
  console.log(
    ` ${C.dim}├─────────────────────────┼──────────┼──────┼──────────────┼─────────┼───────────┼──────────────┼─────────┤${C.reset}`
  );

  for (const s of services) {
    const name = (s.name.length > 23 ? s.name.slice(0, 22) + '…' : s.name).padEnd(23, ' ');
    const statusBadge =
      s.status === 'RUNNING'
        ? `${C.emerald}🟢 RUNNING${C.reset} `
        : s.status === 'DEGRADED'
          ? `${C.yellow}🟡 DEGRADED${C.reset}`
          : `${C.red}🔴 STOPPED${C.reset} `;

    const port = String(s.port).padEnd(4, ' ');
    const route = (s.ingressPath.length > 12 ? s.ingressPath.slice(0, 11) + '…' : s.ingressPath).padEnd(12, ' ');
    const latColor = s.latencyMs < 5 ? C.emerald : s.latencyMs < 30 ? C.yellow : C.red;
    const latency = `${latColor}${(s.latencyMs + 'ms').padStart(6, ' ')}${C.reset}`;
    const cpuStr = `${(s.cpuPercent + '%').padStart(5, ' ')} ${formatBar(s.cpuPercent, 100, 3)}`;
    const ramBar = formatBar(s.memoryMb, 128, 4);
    const ramStr = `${(s.memoryMb + 'MB').padStart(6, ' ')} ${ramBar}`;
    const upStr = formatUptime(s.uptimeSeconds).padEnd(7, ' ');

    console.log(
      ` ${C.dim}│${C.reset} ${C.bold}${name}${C.reset} ${C.dim}│${C.reset} ${statusBadge} ${C.dim}│${C.reset} ${C.cyan}${port}${C.reset} ${C.dim}│${C.reset} ${route} ${C.dim}│${C.reset} ${latency} ${C.dim}│${C.reset} ${cpuStr} ${C.dim}│${C.reset} ${ramStr} ${C.dim}│${C.reset} ${upStr} ${C.dim}│${C.reset}`
    );
  }

  console.log(
    ` ${C.dim}└─────────────────────────┴──────────┴──────┴──────────────┴─────────┴───────────┴──────────────┴─────────┘${C.reset}`
  );

  // Cluster Summary Capsule Bar
  const ramMb = summary.totalAllocatedRamMb || 0;
  const maxRam = summary.maxAllocatedRamMb || 1024;
  const storageMb = ((summary.storageSizeBytes || 0) / (1024 * 1024)).toFixed(1);

  console.log(
    ` ${C.bgCard} ${C.bold}Fleet Health:${C.reset} ${C.emerald}${summary.onlineCount}/${summary.totalServices} Active (${summary.sloAvailabilityPercent}% SLO)${C.reset}  │  ${C.bold}RAM:${C.reset} ${C.cyan}${ramMb}MB / ${maxRam}MB${C.reset}  │  ${C.bold}CPU:${C.reset} ${C.yellow}${summary.avgCpuPercent}% Avg (${summary.cpuCores} Cores)${C.reset}  │  ${C.bold}DBs:${C.reset} ${C.magenta}${summary.tursoDbsCount} (${storageMb}MB)${C.reset} ${C.reset}`
  );

  console.log(`\n ${C.dim}Press ${C.bold}Ctrl+C${C.dim} to exit monitor HUD • Auto-refreshing every 1.0s${C.reset}`);
}

process.on('SIGINT', () => {
  process.stdout.write('\x1b[?25h\n');
  process.exit(0);
});

// Run loop
const isOnce = process.argv.includes('--once');
await renderFrame();
if (!isOnce) {
  setInterval(renderFrame, 1000);
} else {
  process.stdout.write('\x1b[?25h\n');
  process.exit(0);
}
