import { loadServiceRegistry, redactSensitiveData } from '@forge/sdk';
import { dbDiagnostics, platformDb, remoteDbManager } from '../db';
import { servicesController } from './services-controller';
import { telemetryEngine } from './telemetry';
import { trafficController } from './traffic-controller';
import { issuesController } from './issues-controller';
import { hostController } from './host-controller';
import { handleAppsApi } from './apps-controller';
import { handleDevAuthApi } from './auth-session';
import { handleDevEmployeeApi } from './api-employee-handlers';

/**
 * handleApiRequest
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export async function handleApiRequest(req: Request, url: URL): Promise<Response | null> {
  const path = url.pathname.replace(/^\/devcenter/, '');

  // 0. Operator Auth APIs
  if (path.startsWith('/api/auth')) {
    const authRes = await handleDevAuthApi(path, req);
    if (authRes) return authRes;
  }

  // 1. SSE Realtime Log Streamer
  if (path === '/api/logs/stream') {
    const stream = new ReadableStream({
      start(controller) {
        telemetryEngine.registerSSEClient(controller);
      },
      cancel(controller) {
        telemetryEngine.removeSSEClient(controller as any);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  // 1b. Realtime Log Ingest Pipeline
  if (path === '/api/logs/ingest' && req.method === 'POST') {
    const entry: any = await req.json().catch(() => null);
    if (entry && entry.service && entry.message) {
      telemetryEngine.pushLog(
        entry.service,
        entry.severity || entry.level || 'INFO',
        entry.message,
        entry.source || 'app',
        entry.traceId,
        entry.metadata
      );
      return Response.json({ status: 'ok' });
    }
    return Response.json({ error: 'Invalid log payload' }, { status: 400 });
  }

  // 1c. Fetch Recent Logs Filtered by Service / Source / Level / Search
  if (path === '/api/logs/recent' && req.method === 'GET') {
    const service = url.searchParams.get('service') || undefined;
    const source = url.searchParams.get('source') || undefined;
    const level = url.searchParams.get('level') || undefined;
    const limit = Number(url.searchParams.get('limit') || 100);
    const logs = telemetryEngine.getRecentLogs(limit, service, source, level);
    return Response.json({ status: 'ok', logs });
  }

  // 1d. Clear Log Buffer
  if (path === '/api/logs/clear' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    telemetryEngine.clearLogs(body.service);
    return Response.json({ status: 'ok', message: 'Logs cleared successfully' });
  }

  // 2. System Metrics & Telemetry
  if (path === '/api/system/metrics' && req.method === 'GET') {
    const vitals = telemetryEngine.getSystemVitals();
    const services = servicesController.getAllHealthStatuses();
    return Response.json({
      status: 'ok',
      vitals,
      services,
      databases: platformDb.listDatabases(),
      timestamp: Date.now(),
    });
  }

  // 3. Services List & Health
  if (path === '/api/services' && req.method === 'GET') {
    const services = servicesController.getAllHealthStatuses();
    const summary = servicesController.getServicesVitalsSummary();
    return Response.json({ status: 'ok', services, summary });
  }

  // 4. Service Control: Restart
  if (path === '/api/services/restart' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.serviceId) {
      return Response.json({ error: 'Missing serviceId' }, { status: 400 });
    }
    const result = await servicesController.restartService(body.serviceId);
    return Response.json(result);
  }

  // 5. Service Control: Toggle (Start / Stop)
  if (path === '/api/services/toggle' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.serviceId || !body.state) {
      return Response.json({ error: 'Missing serviceId or state' }, { status: 400 });
    }
    const result = await servicesController.toggleService(body.serviceId, body.state);
    return Response.json(result);
  }

  // 6. Forge Apps Dynamic Registry & Developer Operations
  if (path.startsWith('/api/apps')) {
    const appRes = await handleAppsApi(path, req, url);
    if (appRes) return appRes;
  }

  // 7. Database List (Local SQLite + Registered Remote DBs)
  if (path === '/api/db/list' && req.method === 'GET') {
    const dbs = platformDb.listDatabases();
    const remotes = remoteDbManager.listRemoteConnections().map((r) => ({
      name: r.id,
      displayName: `${r.name} (${r.type})`,
      sizeBytes: 0,
      isRemote: true,
      type: r.type,
      readOnly: r.readOnly,
    }));
    return Response.json({ status: 'ok', databases: dbs, remoteDatabases: remotes });
  }

  // 7a. Register Remote Database Connection
  if (path === '/api/db/connect' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.name || !body.url) {
      return Response.json({ error: 'Missing name or url in connection payload' }, { status: 400 });
    }
    const result = remoteDbManager.registerConnection({
      name: String(body.name),
      url: String(body.url),
      type: body.type || 'turso',
      authToken: body.authToken ? String(body.authToken) : undefined,
      readOnly: body.readOnly !== false,
    });
    return Response.json(result, { status: result.success ? 200 : 400 });
  }

  // 7a2. Test Remote Database Connection Ping
  if (path === '/api/db/test-connect' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.url) return Response.json({ error: 'Missing url' }, { status: 400 });
    const result = await remoteDbManager.testConnection({
      url: String(body.url),
      authToken: body.authToken ? String(body.authToken) : undefined,
      type: body.type,
    });
    return Response.json(result);
  }

  // 7b. Table Schema & DDL
  if (path === '/api/db/schema' && req.method === 'GET') {
    const dbName = url.searchParams.get('db');
    const table = url.searchParams.get('table');
    if (!dbName || !table) return Response.json({ error: 'Missing db or table query param' }, { status: 400 });
    const schema = platformDb.getTableSchema(dbName, table);
    const ddl = platformDb.getTableDdl(dbName, table);
    return Response.json({ status: 'ok', schema: schema.columns, ddl: ddl.ddl, indexes: ddl.indexes });
  }

  // 7c. Table Paginated Rows Browser (with Optional Search Filter)
  if (path === '/api/db/rows' && req.method === 'GET') {
    const dbName = url.searchParams.get('db');
    const table = url.searchParams.get('table');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 25);
    const search = url.searchParams.get('search') || undefined;
    if (!dbName || !table) return Response.json({ error: 'Missing db or table query param' }, { status: 400 });
    const result = platformDb.getTableRows(dbName, table, page, limit, search);
    return Response.json({ status: 'ok', ...result });
  }

  // 7d. Database Integrity Diagnostic
  if (path === '/api/db/integrity' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.dbName) return Response.json({ error: 'Missing dbName' }, { status: 400 });
    const result = platformDb.runIntegrityCheck(body.dbName);
    return Response.json({ status: 'ok', ...result });
  }

  // 7e. Real-time Database Telemetry & Storage Stats
  if (path === '/api/db/stats' && req.method === 'GET') {
    const dbName = url.searchParams.get('db');
    if (!dbName) return Response.json({ error: 'Missing db query param' }, { status: 400 });
    const result = dbDiagnostics.getDatabaseTelemetry(dbName);
    return Response.json({ status: 'ok', ...result });
  }

  // 7f. Visual Schema & Relationship Graph (ER Diagram)
  if (path === '/api/db/graph' && req.method === 'GET') {
    const dbName = url.searchParams.get('db');
    if (!dbName) return Response.json({ error: 'Missing db query param' }, { status: 400 });
    const result = dbDiagnostics.getDatabaseSchemaGraph(dbName);
    return Response.json({ status: 'ok', ...result });
  }

  // 8. Execute SQL Query (Routes to Local SQLite or Registered Remote DB)
  if (path === '/api/db/query' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.dbName || !body.sql) {
      return Response.json({ error: 'Missing dbName or sql' }, { status: 400 });
    }
    const readOnly = body.readOnly !== false;
    if (body.dbName.startsWith('remote_')) {
      const result = await remoteDbManager.executeRemoteQuery(body.dbName, body.sql, readOnly);
      return Response.json(result);
    }
    const result = platformDb.executeQuery(body.dbName, body.sql, readOnly);
    return Response.json(result);
  }

  // 9. Optimize Database
  if (path === '/api/db/optimize' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.dbName) return Response.json({ error: 'Missing dbName' }, { status: 400 });
    const result = platformDb.optimizeDatabase(body.dbName);
    return Response.json(result);
  }

  // 10. Snapshot Database
  if (path === '/api/db/backup' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.dbName) return Response.json({ error: 'Missing dbName' }, { status: 400 });
    const result = platformDb.backupDatabase(body.dbName);
    return Response.json(result);
  }

  // 11. Latency Benchmark
  // 11. Multi-Target Active Benchmark & Stress Tester
  if (path === '/api/benchmark' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    const target = body.target || 'dev-dashboard';
    const samples = Number(body.samples) || 15;
    const concurrency = Number(body.concurrency) || 1;
    const result = await trafficController.runTargetBenchmark(target, samples, concurrency);
    return Response.json({ status: 'ok', ...result });
  }

  // 12a. Aggregated Traffic Metrics (Golden Signals & Time Series)
  if (path === '/api/analytics/traffic/metrics' && req.method === 'GET') {
    const metrics = trafficController.getTrafficMetrics();
    return Response.json({ status: 'ok', ...metrics });
  }

  // 12b. Top Endpoint Route Performance Matrix
  if (path === '/api/analytics/traffic/routes' && req.method === 'GET') {
    const routes = trafficController.getTopRoutes();
    return Response.json({ status: 'ok', routes });
  }

  // 12c. Raw Traffic Telemetry Events Stream
  if (path === '/api/analytics/traffic' && req.method === 'GET') {
    const limit = Number(url.searchParams.get('limit')) || 100;
    const events = platformDb.getTrafficSummary(limit);
    return Response.json({ status: 'ok', events });
  }

  // 13a. RFC 7807 Issues List & Filter
  if (path === '/api/issues' && req.method === 'GET') {
    const status = url.searchParams.get('status') || undefined;
    const appId = url.searchParams.get('appId') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const limit = Number(url.searchParams.get('limit')) || 50;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const result = issuesController.listIssues({ status, appId, search, limit, offset });
    return Response.json({ status: 'ok', ...result });
  }

  // 13b. RFC 7807 Issue Triage Transition
  if (path === '/api/issues/triage' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    if (!body.issueId || !body.status) return Response.json({ error: 'Missing issueId or status' }, { status: 400 });
    const result = issuesController.triageIssue(body.issueId, body.status);
    return Response.json(result);
  }

  // 13c. RFC 7807 Bulk Resolve All Issues
  if (path === '/api/issues/resolve-all' && req.method === 'POST') {
    const result = issuesController.resolveAllIssues();
    return Response.json({ status: 'ok', ...result });
  }

  // 13d. RFC 7807 Simulate Diagnostic Exception
  if (path === '/api/issues/simulate' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    const issue = issuesController.simulateTestIssue(body.appId, body.errorType);
    return Response.json({ status: 'ok', issue });
  }

  // 13e. Extended Host Infrastructure & Cloud Vitals
  if (path === '/api/host/vitals' && req.method === 'GET') {
    const report = hostController.getHostDiagnostics();
    return Response.json({ status: 'ok', ...report });
  }

  // 13f. 24/7 High-Availability & Persistence Reliability Probe
  if (path === '/api/host/reliability' && req.method === 'GET') {
    const report = hostController.getHighAvailabilityReport();
    return Response.json({ status: 'ok', ...report });
  }

  // 14. Administrative Audit Logs
  if (path === '/api/audit' && req.method === 'GET') {
    const logs = platformDb.getAuditLogs(50);
    return Response.json({ status: 'ok', logs });
  }

  // 15. Microservice Route & API Registry
  if (path === '/api/routes/registry' && req.method === 'GET') {
    const registry = loadServiceRegistry();
    const endpoints = registry.map((s) => ({
      serviceId: s.id,
      name: s.name,
      port: s.port,
      path: s.path,
      category: s.category,
      healthUrl: `http://localhost:${s.port}/health`,
      sampleRoutes: [
        { method: 'GET', path: `${s.path}` },
        { method: 'GET', path: `http://localhost:${s.port}/health` },
        { method: 'GET', path: `http://localhost:${s.port}/livez` },
        { method: 'GET', path: `http://localhost:${s.port}/readyz` },
      ],
    }));
    return Response.json({ status: 'ok', endpoints });
  }

  // 16. Masked & Safe Environment Config Inspector
  if (path === '/api/env/safe' && req.method === 'GET') {
    const safeEnv: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (!v) continue;
      const lower = k.toLowerCase();
      const isSensitive = ['secret', 'key', 'token', 'pass', 'auth', 'cred'].some((s) => lower.includes(s));
      safeEnv[k] = isSensitive ? '••••••••••••••••' : v;
    }
    return Response.json({ status: 'ok', env: safeEnv });
  }

  // 17. CSV Export Streamer
  if (path === '/api/export/csv' && req.method === 'GET') {
    const type = url.searchParams.get('type') || 'traffic';
    const dbName = url.searchParams.get('db') || 'platform_core.db';
    const table = url.searchParams.get('table') || 'traffic_events';

    let csvContent = '';
    if (type === 'table') {
      const rowsRes = platformDb.getTableRows(dbName, table, 1, 1000);
      if (rowsRes.columns.length) {
        csvContent = rowsRes.columns.join(',') + '\n' + rowsRes.rows.map(r => rowsRes.columns.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n');
      }
    } else if (type === 'traffic') {
      const events = platformDb.getTrafficSummary(500);
      csvContent = 'Timestamp,App,Path,Method,StatusCode,DurationMs\n' +
        events.map(e => `${new Date(e.timestamp*1000).toISOString()},${e.app_id},"${e.path}",${e.method},${e.status_code},${e.duration_ms}`).join('\n');
    } else if (type === 'issues') {
      const { issues } = issuesController.listIssues({ limit: 500 });
      csvContent = 'ID,App,ErrorType,Occurrences,Status,Message,LastSeen\n' +
        issues.map(i => `"${i.id}","${i.app_id}","${i.error_type}",${i.occurrence_count},"${i.status}","${(i.message || '').replace(/"/g, '""')}",${new Date(i.last_seen*1000).toISOString()}`).join('\n');
    } else if (type === 'audit') {
      const logs = platformDb.getAuditLogs(500);
      csvContent = 'Timestamp,Actor,Action,Target,Status\n' +
        logs.map(l => `${new Date(l.timestamp*1000).toISOString()},${l.actor_id},${l.action_type},${l.target_service},${l.result_status}`).join('\n');
    }

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export_${Date.now()}.csv"`,
      },
    });
  }

  // 18. Employee Studio APIs (Delegated to @forge/auth via SDK)
  if (path.startsWith('/api/employees')) {
    const empRes = await handleDevEmployeeApi(path, req, url);
    if (empRes) return empRes;
  }

  return null;
}
