/**
 * @forge/dev-dashboard - 1-Year Historical Telemetry Data Seeder (2026 LTS)
 * Populates 365 days of realistic diurnal traffic curves, global geo origins,
 * diverse machine/OS profiles, and authentic latency percentiles.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

import { createLogger } from '@forge/sdk';
import { telemetryDb } from './telemetry-db';

const logger = createLogger('telemetry-seeder');

const COUNTRIES = [
  { code: 'US', name: 'United States', weight: 38 },
  { code: 'DE', name: 'Germany', weight: 14 },
  { code: 'GB', name: 'United Kingdom', weight: 12 },
  { code: 'JP', name: 'Japan', weight: 9 },
  { code: 'IN', name: 'India', weight: 8 },
  { code: 'FR', name: 'France', weight: 5 },
  { code: 'CA', name: 'Canada', weight: 4 },
  { code: 'AU', name: 'Australia', weight: 3 },
  { code: 'SG', name: 'Singapore', weight: 2 },
  { code: 'BR', name: 'Brazil', weight: 2 },
  { code: 'NL', name: 'Netherlands', weight: 2 },
  { code: 'SE', name: 'Sweden', weight: 1 },
];

const PLATFORMS = [
  { os: 'macOS', version: '15.0 (Sequoia)', browser: 'Chrome', bVer: '128.0', weight: 34, device: 'Desktop' as const },
  { os: 'macOS', version: '14.5 (Sonoma)', browser: 'Safari', bVer: '18.0', weight: 16, device: 'Desktop' as const },
  { os: 'Windows', version: '11', browser: 'Chrome', bVer: '128.0', weight: 22, device: 'Desktop' as const },
  { os: 'Windows', version: '11', browser: 'Edge', bVer: '128.0', weight: 10, device: 'Desktop' as const },
  { os: 'Linux', version: 'Ubuntu 24.04 LTS', browser: 'Firefox', bVer: '130.0', weight: 8, device: 'Desktop' as const },
  { os: 'iOS', version: '18.0', browser: 'Mobile Safari', bVer: '18.0', weight: 6, device: 'Mobile' as const },
  { os: 'Android', version: '15.0', browser: 'Chrome Mobile', bVer: '128.0', weight: 4, device: 'Mobile' as const },
];

const ROUTES = [
  { path: '/', method: 'GET', app: 'landing', weight: 30, baseLat: 1.2 },
  { path: '/portal', method: 'GET', app: 'portal', weight: 25, baseLat: 1.8 },
  { path: '/api/auth/verify', method: 'POST', app: 'auth', weight: 18, baseLat: 2.4 },
  { path: '/devcenter', method: 'GET', app: 'dev-dashboard', weight: 12, baseLat: 2.1 },
  { path: '/apps/code', method: 'GET', app: 'code', weight: 8, baseLat: 3.5 },
  { path: '/docs', method: 'GET', app: 'docs', weight: 7, baseLat: 1.4 },
];

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((acc, it) => acc + it.weight, 0);
  let rand = Math.random() * total;
  for (const it of items) {
    if (rand < it.weight) return it;
    rand -= it.weight;
  }
  return items[0];
}

/**
 * Seeds 365 days of high-fidelity historical telemetry rollups and recent raw event samples.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function seedHistoricalTelemetry(days = 365): { success: boolean; rollupsSeeded: number; rawEventsSeeded: number } {
  const db = telemetryDb.getRawDb();
  const now = Date.now();
  let rollupsSeeded = 0;
  let rawEventsSeeded = 0;

  try {
    const insertRollup = db.prepare(`
      INSERT OR REPLACE INTO telemetry_daily_rollups (
        date, app_id, total_requests, unique_visitors, bytes_transferred,
        p50_latency_ms, p90_latency_ms, p99_latency_ms,
        s2xx_count, s3xx_count, s4xx_count, s5xx_count,
        routes_json, countries_json, os_json, browsers_json, devices_json,
        user_requests, mesh_requests, probe_requests, created_at
      ) VALUES (
        $date, 'all', $total, $visitors, $bytes,
        $p50, $p90, $p99,
        $s2xx, $s3xx, $s4xx, $s5xx,
        '[]', '[]', '[]', '[]', '[]',
        $uReq, $mReq, $pReq, $created_at
      )
    `);

    // 1. Generate 365 days of realistic daily aggregates
    for (let i = days; i >= 0; i--) {
      const d = new Date(now - i * 86400 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Realistic annual adoption curve + weekly cycles
      const dayProgress = (days - i) / days; // 0.0 -> 1.0
      const baselineVolume = 800 + Math.round(dayProgress * 3200); // 800 -> 4000 reqs/day
      const weekendMultiplier = isWeekend ? 0.65 : 1.0;
      const noise = 0.88 + Math.random() * 0.24;

      const totalRequests = Math.round(baselineVolume * weekendMultiplier * noise);
      const uniqueVisitors = Math.round(totalRequests * (0.18 + Math.random() * 0.08));
      const bytesTransferred = totalRequests * Math.round(750 + Math.random() * 400);

      const s2xx = Math.round(totalRequests * 0.965);
      const s3xx = Math.round(totalRequests * 0.022);
      const s4xx = Math.round(totalRequests * 0.011);
      const s5xx = totalRequests - (s2xx + s3xx + s4xx);

      const uReq = Math.round(totalRequests * 0.82);
      const pReq = Math.round(totalRequests * 0.12);
      const mReq = totalRequests - (uReq + pReq);

      const p50 = Number((1.2 + Math.random() * 0.5).toFixed(2));
      const p90 = Number((p50 * 1.9 + Math.random() * 0.4).toFixed(2));
      const p99 = Number((p90 * 2.2 + Math.random() * 0.8).toFixed(2));

      insertRollup.run({
        $date: dateStr,
        $total: totalRequests,
        $visitors: uniqueVisitors,
        $bytes: bytesTransferred,
        $p50: p50,
        $p90: p90,
        $p99: p99,
        $s2xx: s2xx,
        $s3xx: s3xx,
        $s4xx: s4xx,
        $s5xx: s5xx,
        $uReq: uReq,
        $mReq: mReq,
        $pReq: pReq,
        $created_at: Math.floor(d.getTime() / 1000),
      });

      rollupsSeeded++;
    }

    // 2. Generate 120 detailed recent raw events for Live Inspector
    const recentStart = Math.floor(now / 1000) - (24 * 3600);
    for (let j = 0; j < 120; j++) {
      const eventTime = recentStart + Math.floor(Math.random() * 86400);
      const country = pickWeighted(COUNTRIES);
      const platform = pickWeighted(PLATFORMS);
      const route = pickWeighted(ROUTES);

      const isProbe = j % 8 === 0;
      const isMesh = j % 12 === 0;
      const category = isProbe ? 'probe' : (isMesh ? 'mesh' : 'user');
      const eventRoute = isProbe ? { app: 'sys', path: '/health', method: 'GET', baseLat: 0.2 } : route;

      const oct1 = country.code === 'US' ? 140 : (country.code === 'DE' ? 88 : 203);
      const ip = isProbe ? '127.0.0.1' : `${oct1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
      const status = Math.random() > 0.04 ? 200 : (Math.random() > 0.5 ? 404 : 500);
      const duration = Number((eventRoute.baseLat + (Math.random() * 1.5)).toFixed(2));

      telemetryDb.recordTrafficEvent({
        app_id: eventRoute.app,
        path: eventRoute.path,
        method: eventRoute.method,
        status_code: status,
        duration_ms: duration,
        traffic_category: category,
        client_ip: ip,
        country_code: country.code,
        country_name: country.name,
        city: 'Metropolis',
        device_category: platform.device,
        os_name: platform.os,
        os_version: platform.version,
        browser_name: platform.browser,
        browser_version: platform.bVer,
        screen_res: platform.device === 'Mobile' ? '390x844' : '1920x1080',
        visitor_id: `vis_${country.code.toLowerCase()}_${Math.floor(Math.random() * 899 + 100)}`,
        bytes_transferred: Math.floor(400 + Math.random() * 1600),
        referer: Math.random() > 0.4 ? 'https://google.com' : 'direct',
        trace_id: `trc-${Math.random().toString(36).slice(2, 10)}`,
        timestamp: eventTime,
      });

      rawEventsSeeded++;
    }

    logger.info(`⚡ Successfully seeded 1-year telemetry: ${rollupsSeeded} daily rollups & ${rawEventsSeeded} inspector events`);
    return { success: true, rollupsSeeded, rawEventsSeeded };
  } catch (err) {
    logger.error('Failed to seed historical telemetry', { error: String(err) });
    return { success: false, rollupsSeeded, rawEventsSeeded };
  }
}
