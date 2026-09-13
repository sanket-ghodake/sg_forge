/**
 * @forge/dev-dashboard - Vercel-Style Analytics & Observability Controller (2026 LTS)
 * Aggregates KPIs, 1-Year Rollup Time Series, and Dimensional Breakdowns.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

import { createLogger } from '@forge/sdk';
import { telemetryDb, type TelemetrySummary, type TimeSeriesBucket, type TelemetryBreakdowns } from '../db/telemetry-db';
import { seedHistoricalTelemetry } from '../db/telemetry-seeder';
import { parseUserAgent, resolveIpLocation, createVisitorFingerprint, maskIpAddress, countryCodeToFlag, classifyTrafficCategory } from './telemetry-parser';

const logger = createLogger('analytics-controller');

export interface LiveInspectorRecord {
  id: string;
  timestamp: number;
  timeStr: string;
  appId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  category: string;
  clientIp: string;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  city: string;
  deviceCategory: string;
  os: string;
  browser: string;
  screenRes: string;
  traceId: string | null;
  bytes: number;
}

export class AnalyticsController {
  public getOverview(range = '24h', appId = 'all', category = 'user'): TelemetrySummary {
    return telemetryDb.getMetricsSummary(range, appId, category);
  }

  public getTimeSeries(range = '24h', appId = 'all', category = 'user'): TimeSeriesBucket[] {
    return telemetryDb.getTimeSeriesBuckets(range, appId, category);
  }

  public getBreakdowns(range = '24h', appId = 'all', category = 'user'): TelemetryBreakdowns {
    const data = telemetryDb.getBreakdowns(range, appId, category);
    // Add flag emojis to countries
    data.countries = data.countries.map(c => ({
      ...c,
      extra: countryCodeToFlag(c.key),
    }));
    return data;
  }

  public getInspector(limit = 50, search = '', masked = false, category = 'all'): LiveInspectorRecord[] {
    const rawEvents = telemetryDb.getInspectorEvents(limit, search, category);
    return rawEvents.map((e: any) => {
      const ip = masked ? maskIpAddress(e.client_ip || '127.0.0.1') : (e.client_ip || '127.0.0.1');
      const flag = countryCodeToFlag(e.country_code || 'US');
      const timeStr = new Date(e.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return {
        id: e.id,
        timestamp: e.timestamp,
        timeStr,
        appId: e.app_id,
        method: e.method,
        path: e.path,
        statusCode: e.status_code,
        durationMs: Number(Number(e.duration_ms || 0).toFixed(2)),
        category: e.traffic_category || 'user',
        clientIp: ip,
        countryCode: e.country_code || 'US',
        countryName: e.country_name || 'United States',
        flagEmoji: flag,
        city: e.city || 'Localhost',
        deviceCategory: e.device_category || 'Desktop',
        os: e.os_name ? `${e.os_name} ${e.os_version || ''}`.trim() : 'macOS 15',
        browser: e.browser_name ? `${e.browser_name} ${e.browser_version || ''}`.trim() : 'Chrome 128',
        screenRes: e.screen_res || '1920x1080',
        traceId: e.trace_id || null,
        bytes: e.bytes_transferred || 512,
      };
    });
  }

  public recordLiveRequest(input: {
    appId: string;
    path: string;
    method: string;
    statusCode: number;
    durationMs: number;
    clientIp?: string;
    userAgent?: string;
    referer?: string;
    traceId?: string;
    screenRes?: string;
  }): string {
    const clientIp = input.clientIp || '127.0.0.1';
    const ua = input.userAgent || '';
    const parsedUa = parseUserAgent(ua);
    const geo = resolveIpLocation(clientIp);
    const visitorId = createVisitorFingerprint(clientIp, ua);
    const category = classifyTrafficCategory(input.path, ua, clientIp);

    return telemetryDb.recordTrafficEvent({
      app_id: input.appId,
      path: input.path,
      method: input.method,
      status_code: input.statusCode,
      duration_ms: input.durationMs,
      traffic_category: category,
      client_ip: clientIp,
      country_code: geo.countryCode,
      country_name: geo.countryName,
      city: geo.city,
      device_category: parsedUa.deviceCategory,
      os_name: parsedUa.osName,
      os_version: parsedUa.osVersion,
      browser_name: parsedUa.browserName,
      browser_version: parsedUa.browserVersion,
      screen_res: input.screenRes || '1920x1080',
      visitor_id: visitorId,
      referer: input.referer || undefined,
      trace_id: input.traceId || undefined,
    });
  }

  public ingestBeacon(beacon: any, clientIp: string, userAgent: string): boolean {
    try {
      const appId = beacon.service || 'portal';
      const path = beacon.path || '/';
      const parsedUa = parseUserAgent(userAgent);
      const geo = resolveIpLocation(clientIp);
      const visitorId = createVisitorFingerprint(clientIp, userAgent);
      const category = classifyTrafficCategory(path, userAgent, clientIp);

      const screenRes = beacon.machine
        ? `${beacon.machine.screenWidth}x${beacon.machine.screenHeight}`
        : '1920x1080';

      const durationMs = beacon.vitals?.ttfbMs || 1.5;

      telemetryDb.recordTrafficEvent({
        app_id: appId,
        path,
        method: 'PAGEVIEW',
        status_code: 200,
        duration_ms: durationMs,
        traffic_category: category,
        client_ip: clientIp,
        country_code: geo.countryCode,
        country_name: geo.countryName,
        city: geo.city,
        device_category: parsedUa.deviceCategory,
        os_name: parsedUa.osName,
        os_version: parsedUa.osVersion,
        browser_name: parsedUa.browserName,
        browser_version: parsedUa.browserVersion,
        screen_res: screenRes,
        visitor_id: visitorId,
        referer: beacon.referrer || null,
        bytes_transferred: 1024,
      });

      return true;
    } catch (err) {
      logger.error('Failed to ingest telemetry beacon', { error: String(err) });
      return false;
    }
  }

  public seedHistoricalData(days = 365) {
    return seedHistoricalTelemetry(days);
  }
}

export const analyticsController = new AnalyticsController();
