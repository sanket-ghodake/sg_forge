/**
 * @forge/dev-dashboard - Telemetry Domain Models & Types (2026 LTS)
 * Data contracts for 1-year historical telemetry, rollup buckets, and client breakdowns.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

export type TrafficCategory = 'user' | 'mesh' | 'probe';

export interface TelemetryEventInput {
  app_id: string;
  path: string;
  method: string;
  status_code: number;
  duration_ms: number;
  traffic_category?: TrafficCategory;
  client_ip?: string;
  ip_hash?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  device_category?: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot';
  os_name?: string;
  os_version?: string;
  browser_name?: string;
  browser_version?: string;
  screen_res?: string;
  visitor_id?: string;
  bytes_transferred?: number;
  referer?: string;
  trace_id?: string;
  timestamp?: number;
}

export interface TelemetrySummary {
  timeRange: string;
  appId: string;
  category: string;
  totalRequests: number;
  uniqueVisitors: number;
  totalBytes: number;
  throughputRps: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  avgLatencyMs: number;
  categoryCounts?: {
    user: number;
    mesh: number;
    probe: number;
  };
  statusBreakdown: {
    s2xx: number;
    s3xx: number;
    s4xx: number;
    s5xx: number;
    successRatePct: number;
    errorRatePct: number;
  };
}

export interface TimeSeriesBucket {
  timestamp: number;
  timeLabel: string;
  count2xx: number;
  count3xx: number;
  count4xx: number;
  count5xx: number;
  totalRequests: number;
  uniqueVisitors: number;
  bytesTransferred: number;
  p50LatencyMs: number;
}

export interface BreakdownItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  extra?: string;
}

export interface TelemetryBreakdowns {
  topRoutes: BreakdownItem[];
  countries: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  browsers: BreakdownItem[];
  devices: BreakdownItem[];
  referrers: BreakdownItem[];
}
