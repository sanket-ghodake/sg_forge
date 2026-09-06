/**
 * @forge/dev-dashboard - Host & Cloud Infrastructure Diagnostics Controller (2026 LTS)
 * Enterprise SRE Host Telemetry Standards: Multi-core CPU, RAM, Disk Volume (statfs), Network Interfaces.
 */

import { cpus, freemem, loadavg, networkInterfaces, platform, release, totalmem, uptime, hostname, arch } from 'node:os';
import { statfsSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveDataDir } from '../db';
import { detectHostMemoryAndVirtualization } from './telemetry';

/**
 * DiskVolumeStats
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface DiskVolumeStats {
  path: string;
  totalBytes: number;
  freeBytes: number;
  availableBytes: number;
  usedBytes: number;
  usedPercent: number;
}

/**
 * NetworkInterfaceInfo
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface NetworkInterfaceInfo {
  name: string;
  family: string;
  address: string;
  netmask: string;
  mac: string;
  internal: boolean;
}

/**
 * HostDiagnosticsReport
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface HostDiagnosticsReport {
  timestamp: number;
  system: {
    hostname: string;
    platform: string;
    release: string;
    architecture: string;
    hostUptimeSeconds: number;
    nodeVersion: string;
    bunVersion: string;
    pid: number;
    processUptimeSeconds: number;
  };
  cpu: {
    model: string;
    coreCount: number;
    loadAvg: number[];
    cores: Array<{ coreIndex: number; speedMhz: number; usagePercent: number }>;
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usedPercent: number;
    physicalHostTotalBytes: number;
    virtualizationType: 'native' | 'wsl2' | 'docker' | 'cgroup';
    virtualizationNote: string;
    processRssBytes: number;
    processHeapTotalBytes: number;
    processHeapUsedBytes: number;
    processExternalBytes: number;
    processArrayBuffersBytes: number;
  };
  storage: {
    rootVolume: DiskVolumeStats;
    dataVolume: DiskVolumeStats;
  };
  network: {
    interfaces: NetworkInterfaceInfo[];
  };
}

/**
 * HighAvailabilityReport
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface HighAvailabilityReport {
  timestamp: number;
  environment: {
    osType: 'wsl' | 'linux' | 'darwin' | 'win32';
    osName: string;
    isDocker: boolean;
    isWSL: boolean;
    hostname: string;
    architecture: string;
    hostUptimeSeconds: number;
    processUptimeSeconds: number;
  };
  repoInvariants: {
    restartPolicy: string;
    restartPolicyStatus: 'active' | 'degraded';
    persistenceStatus: 'active' | 'transient';
    dataDirectory: string;
    dataDirExists: boolean;
    freeSpaceMb: number;
    healthProbesStatus: 'active' | 'missing';
    autohealStatus: 'configured' | 'disabled';
  };
  hostRequirements: {
    dockerLiveRestoreStatus: 'recommended' | 'verified';
    systemdServiceAvailable: boolean;
    sleepPreventionStatus: 'recommended';
    platformGuideKey: 'ubuntu' | 'wsl' | 'macos' | 'windows';
  };
}

class HostController {
  private prevCpuTimes: Array<{ idle: number; total: number }> = [];

  private getDiskVolumeStats(targetPath: string): DiskVolumeStats {
    try {
      const stats = statfsSync(targetPath);
      const totalBytes = stats.blocks * stats.bsize;
      const freeBytes = stats.bfree * stats.bsize;
      const availableBytes = stats.bavail * stats.bsize;
      const usedBytes = totalBytes - freeBytes;
      const usedPercent = totalBytes > 0 ? Number(((usedBytes / totalBytes) * 100).toFixed(1)) : 0;

      return {
        path: targetPath,
        totalBytes,
        freeBytes,
        availableBytes,
        usedBytes,
        usedPercent,
      };
    } catch {
      return {
        path: targetPath,
        totalBytes: 0,
        freeBytes: 0,
        availableBytes: 0,
        usedBytes: 0,
        usedPercent: 0,
      };
    }
  }

  public getHostDiagnostics(): HostDiagnosticsReport {
    const rawCpus = cpus();
    const memInfo = detectHostMemoryAndVirtualization();
    const procMem = process.memoryUsage();
    const dataDir = resolveDataDir();

    const cores = rawCpus.map((c, i) => {
      const totalTick = Object.values(c.times).reduce((a, b) => a + b, 0);
      const idleTick = c.times.idle;
      const prev = this.prevCpuTimes[i];

      let usagePercent = 0;
      if (prev && totalTick > prev.total) {
        const deltaTotal = totalTick - prev.total;
        const deltaIdle = idleTick - prev.idle;
        usagePercent = deltaTotal > 0 ? Number((((deltaTotal - deltaIdle) / deltaTotal) * 100).toFixed(1)) : 0;
      } else {
        usagePercent = totalTick > 0 ? Number((((totalTick - idleTick) / totalTick) * 100).toFixed(1)) : 0;
      }
      this.prevCpuTimes[i] = { idle: idleTick, total: totalTick };

      return {
        coreIndex: i,
        speedMhz: c.speed,
        usagePercent: Math.max(0, Math.min(100, usagePercent)),
      };
    });

    const netIfaces = networkInterfaces();
    const formattedInterfaces: NetworkInterfaceInfo[] = [];
    for (const [name, ifaceList] of Object.entries(netIfaces)) {
      if (ifaceList) {
        for (const iface of ifaceList) {
          formattedInterfaces.push({
            name,
            family: iface.family,
            address: iface.address,
            netmask: iface.netmask,
            mac: iface.mac,
            internal: iface.internal,
          });
        }
      }
    }

    return {
      timestamp: Date.now(),
      system: {
        hostname: hostname(),
        platform: platform(),
        release: release(),
        architecture: arch(),
        hostUptimeSeconds: Math.floor(uptime()),
        nodeVersion: process.version,
        bunVersion: (process.versions as any)?.bun || '1.3.14',
        pid: process.pid,
        processUptimeSeconds: Math.floor(process.uptime()),
      },
      cpu: {
        model: rawCpus[0]?.model || 'Generic x86_64 Processor',
        coreCount: rawCpus.length,
        loadAvg: loadavg().map((l) => Number(l.toFixed(2))),
        cores,
      },
      memory: {
        totalBytes: memInfo.totalBytes,
        freeBytes: memInfo.freeBytes,
        usedBytes: memInfo.usedBytes,
        usedPercent: memInfo.memPercent,
        physicalHostTotalBytes: memInfo.physicalHostTotalBytes,
        virtualizationType: memInfo.virtualizationType,
        virtualizationNote: memInfo.virtualizationNote,
        processRssBytes: procMem.rss,
        processHeapTotalBytes: procMem.heapTotal,
        processHeapUsedBytes: procMem.heapUsed,
        processExternalBytes: procMem.external,
        processArrayBuffersBytes: procMem.arrayBuffers,
      },
      storage: {
        rootVolume: this.getDiskVolumeStats('/'),
        dataVolume: this.getDiskVolumeStats(existsSync(dataDir) ? dataDir : process.cwd()),
      },
      network: {
        interfaces: formattedInterfaces,
      },
    };
  }

  public getHighAvailabilityReport(): HighAvailabilityReport {
    const rawPlatform = platform();
    const rawRelease = release().toLowerCase();
    const isDocker = existsSync('/.dockerenv') || !!process.env.DOCKER_CONTAINER;
    const isWSL = rawPlatform === 'linux' && (rawRelease.includes('microsoft') || rawRelease.includes('wsl'));
    
    let osType: 'wsl' | 'linux' | 'darwin' | 'win32' = 'linux';
    let osName = 'Linux (Native Server)';
    let platformGuideKey: 'ubuntu' | 'wsl' | 'macos' | 'windows' = 'ubuntu';

    if (isWSL) {
      osType = 'wsl';
      osName = 'WSL2 (Windows Subsystem for Linux)';
      platformGuideKey = 'wsl';
    } else if (rawPlatform === 'darwin') {
      osType = 'darwin';
      osName = 'macOS (Darwin)';
      platformGuideKey = 'macos';
    } else if (rawPlatform === 'win32') {
      osType = 'win32';
      osName = 'Windows Native (Win32)';
      platformGuideKey = 'windows';
    }

    const dataDir = resolveDataDir();
    const dataDirExists = existsSync(dataDir);
    const storageStats = this.getDiskVolumeStats(dataDirExists ? dataDir : process.cwd());
    const freeSpaceMb = Math.round(storageStats.availableBytes / (1024 * 1024));

    const systemdServicePath = join(process.cwd(), 'scripts', 'systemd', 'sg-forge.service');
    const systemdServiceAvailable = existsSync(systemdServicePath);

    return {
      timestamp: Date.now(),
      environment: {
        osType,
        osName,
        isDocker,
        isWSL,
        hostname: hostname(),
        architecture: arch(),
        hostUptimeSeconds: Math.floor(uptime()),
        processUptimeSeconds: Math.floor(process.uptime()),
      },
      repoInvariants: {
        restartPolicy: 'unless-stopped / always',
        restartPolicyStatus: 'active',
        persistenceStatus: dataDirExists ? 'active' : 'transient',
        dataDirectory: dataDir,
        dataDirExists,
        freeSpaceMb,
        healthProbesStatus: 'active',
        autohealStatus: 'configured',
      },
      hostRequirements: {
        dockerLiveRestoreStatus: 'recommended',
        systemdServiceAvailable,
        sleepPreventionStatus: 'recommended',
        platformGuideKey,
      },
    };
  }
}

/**
 * hostController
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export const hostController = new HostController();

