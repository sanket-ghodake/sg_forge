/**
 * @forge/dev-dashboard - Telemetry & In-Memory Ring Buffer Streamer (2026 LTS)
 * High-Throughput Zero-Disk-Churn SSE Realtime Log & Metrics Streamer
 */

import { existsSync, readFileSync } from 'node:fs';
import { cpus, freemem, loadavg, platform, release, totalmem, uptime } from 'node:os';
import { execSync } from 'node:child_process';
import { createLogger, explainLog } from '@forge/sdk';

const logger = createLogger('telemetry-engine');
const MAX_APP_BUFFER_SIZE = 1000;
const MAX_GLOBAL_BUFFER_SIZE = 2000;

let cachedPhysicalHostTotalBytes: number | null = null;
let cachedVirtualizationType: 'native' | 'wsl2' | 'docker' | 'cgroup' = 'native';
let cachedVirtualizationNote = 'Native Host Environment';
let hasCheckedVirtualization = false;

/**
 * detectHostMemoryAndVirtualization
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export function detectHostMemoryAndVirtualization(): {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  memPercent: number;
  physicalHostTotalBytes: number;
  virtualizationType: 'native' | 'wsl2' | 'docker' | 'cgroup';
  virtualizationNote: string;
} {
  const envTotal = totalmem();
  const envFree = freemem();
  const envUsed = envTotal - envFree;
  const memPercent = envTotal > 0 ? Number(((envUsed / envTotal) * 100).toFixed(1)) : 0;

  if (!hasCheckedVirtualization) {
    hasCheckedVirtualization = true;
    const rawPlatform = platform();
    const rawRelease = release().toLowerCase();
    const isDocker = existsSync('/.dockerenv') || !!process.env.DOCKER_CONTAINER;
    const isWSL = rawPlatform === 'linux' && (rawRelease.includes('microsoft') || rawRelease.includes('wsl'));

    cachedPhysicalHostTotalBytes = envTotal;

    if (isDocker) {
      cachedVirtualizationType = 'docker';
      cachedVirtualizationNote = 'Docker Container Isolation';
      // Check cgroup v2 / v1 memory limits
      try {
        if (existsSync('/sys/fs/cgroup/memory.max')) {
          const maxStr = readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim();
          if (maxStr && maxStr !== 'max' && !isNaN(Number(maxStr))) {
            const cgroupBytes = Number(maxStr);
            if (cgroupBytes > 0 && cgroupBytes < envTotal) {
              cachedVirtualizationNote = `Docker Container (Cgroup limit: ${(cgroupBytes / (1024 * 1024 * 1024)).toFixed(1)} GB)`;
            }
          }
        }
      } catch {}
    } else if (isWSL) {
      cachedVirtualizationType = 'wsl2';
      cachedVirtualizationNote = 'WSL2 Virtual Machine';
      // Query Windows physical host memory via PowerShell interop if available
      try {
        const psPaths = [
          '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
          '/mnt/c/Windows/system32/cmd.exe',
          'powershell.exe',
        ];
        let foundPs = '';
        for (const p of psPaths) {
          if (existsSync(p)) {
            foundPs = p;
            break;
          }
        }
        if (foundPs) {
          const stdout = execSync(`"${foundPs}" -NoProfile -Command "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"`, {
            timeout: 800,
            stdio: ['ignore', 'pipe', 'ignore'],
            encoding: 'utf8',
          }).trim();
          const parsed = Number(stdout.replace(/[^0-9]/g, ''));
          if (parsed && parsed > envTotal) {
            cachedPhysicalHostTotalBytes = parsed;
            cachedVirtualizationNote = `WSL2 VM allocated ${(envTotal / (1024 * 1024 * 1024)).toFixed(1)} GB of ${(parsed / (1024 * 1024 * 1024)).toFixed(1)} GB Host Physical RAM`;
          }
        }
      } catch {
        // Fallback gracefully without throwing
      }
    } else {
      cachedVirtualizationType = 'native';
      cachedVirtualizationNote = 'Native Bare-Metal OS';
    }
  }

  return {
    totalBytes: envTotal,
    freeBytes: envFree,
    usedBytes: envUsed,
    memPercent,
    physicalHostTotalBytes: cachedPhysicalHostTotalBytes || envTotal,
    virtualizationType: cachedVirtualizationType,
    virtualizationNote: cachedVirtualizationNote,
  };
}

/**
 * LogEntry
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  source: 'app' | 'browser' | 'docker' | 'db';
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  traceId?: string;
  plainEnglishSummary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * SystemVitals
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface SystemVitals {
  totalMemBytes: number;
  freeMemBytes: number;
  usedMemBytes: number;
  memPercent: number;
  physicalHostTotalBytes?: number;
  virtualizationType?: 'native' | 'wsl2' | 'docker' | 'cgroup';
  virtualizationNote?: string;
  cpuLoad: number[];
  cpuCount: number;
  hostUptimeSeconds: number;
  platformName: string;
  timestamp: number;
}

class TelemetryEngine {
  private globalBuffer: LogEntry[] = [];
  private appBuffers: Map<string, LogEntry[]> = new Map();
  private sseControllers: Set<ReadableStreamDefaultController> = new Set();

  constructor() {
    this.pushLog('dev-dashboard', 'INFO', 'Developer Dashboard telemetry engine online.', 'app');
    setInterval(() => this.broadcastPing(), 15000);
  }

  public pushLog(
    service: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    message: string,
    source: 'app' | 'browser' | 'docker' | 'db' = 'app',
    traceId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const sName = (service || 'system').toLowerCase();
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      service: sName,
      source,
      level,
      message,
      traceId,
      metadata,
    };
    entry.plainEnglishSummary = explainLog({
      severity: level,
      service: sName,
      message,
      timestamp: entry.timestamp,
    });

    // 1. App-specific isolated buffer
    let appBuf = this.appBuffers.get(sName);
    if (!appBuf) {
      appBuf = [];
      this.appBuffers.set(sName, appBuf);
    }
    if (appBuf.length >= MAX_APP_BUFFER_SIZE) {
      appBuf.shift();
    }
    appBuf.push(entry);

    // 2. Global ring buffer
    if (this.globalBuffer.length >= MAX_GLOBAL_BUFFER_SIZE) {
      this.globalBuffer.shift();
    }
    this.globalBuffer.push(entry);

    // 3. Broadcast SSE
    this.broadcastSSE('log', entry);
  }

  public getRecentLogs(limit = 100, service?: string, source?: string, level?: string): LogEntry[] {
    let list: LogEntry[] = [];
    if (service && service !== 'all') {
      list = this.appBuffers.get(service.toLowerCase()) || [];
    } else {
      list = this.globalBuffer;
    }

    if (source && source !== 'all') {
      list = list.filter((l) => l.source === source);
    }
    if (level && level !== 'ALL') {
      list = list.filter((l) => l.level === level);
    }
    return list.slice(-limit);
  }

  public clearLogs(service?: string): void {
    if (service && service !== 'all') {
      this.appBuffers.set(service.toLowerCase(), []);
    } else {
      this.globalBuffer = [];
      this.appBuffers.clear();
    }
  }

  public getSystemVitals(): SystemVitals {
    const memInfo = detectHostMemoryAndVirtualization();

    return {
      totalMemBytes: memInfo.totalBytes,
      freeMemBytes: memInfo.freeBytes,
      usedMemBytes: memInfo.usedBytes,
      memPercent: memInfo.memPercent,
      physicalHostTotalBytes: memInfo.physicalHostTotalBytes,
      virtualizationType: memInfo.virtualizationType,
      virtualizationNote: memInfo.virtualizationNote,
      cpuLoad: loadavg().map((l) => Number(l.toFixed(2))),
      cpuCount: cpus().length,
      hostUptimeSeconds: Math.floor(uptime()),
      platformName: platform(),
      timestamp: Date.now(),
    };
  }

  public registerSSEClient(controller: ReadableStreamDefaultController): void {
    this.sseControllers.add(controller);
    try {
      const initData = JSON.stringify({
        type: 'init',
        vitals: this.getSystemVitals(),
        recentLogs: this.getRecentLogs(50),
      });
      controller.enqueue(new TextEncoder().encode(`event: init\ndata: ${initData}\n\n`));
    } catch {
      this.sseControllers.delete(controller);
    }
  }

  public removeSSEClient(controller: ReadableStreamDefaultController): void {
    this.sseControllers.delete(controller);
  }

  public broadcastPing(): void {
    const now = Date.now();
    const commentPayload = new TextEncoder().encode(`: ping ${now}\n\n`);
    const eventPayload = new TextEncoder().encode(`event: ping\ndata: {"timestamp":${now}}\n\n`);
    for (const controller of this.sseControllers) {
      try {
        controller.enqueue(commentPayload);
        controller.enqueue(eventPayload);
      } catch {
        this.sseControllers.delete(controller);
      }
    }
  }

  private broadcastSSE(eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(payload);

    for (const controller of this.sseControllers) {
      try {
        controller.enqueue(encoded);
      } catch {
        this.sseControllers.delete(controller);
      }
    }
  }

  public broadcastVitalsTick(): void {
    this.broadcastSSE('vitals', this.getSystemVitals());
  }
}

/**
 * telemetryEngine
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export const telemetryEngine = new TelemetryEngine();

setInterval(() => {
  telemetryEngine.broadcastVitalsTick();
  telemetryEngine.broadcastPing();
}, 2500);

