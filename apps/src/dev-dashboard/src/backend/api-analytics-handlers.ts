/**
 * @forge/dev-dashboard - Analytics & True Telemetry REST API Handlers (2026 LTS)
 * Serves Vercel-style telemetry endpoints, beacon collection, and historical rollups.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

import { analyticsController } from './analytics-controller';

export async function handleAnalyticsApi(path: string, req: Request, url: URL): Promise<Response | null> {
  const range = (url.searchParams.get('range') || '24h') as any;
  const appId = url.searchParams.get('appId') || 'all';
  const category = url.searchParams.get('category') || 'user';

  // 1. Telemetry Overview & Golden Signals
  if (path === '/api/analytics/overview' && req.method === 'GET') {
    const data = analyticsController.getOverview(range, appId, category);
    return Response.json({ status: 'ok', data });
  }

  // 2. Interactive Time-Series Graph Buckets
  if (path === '/api/analytics/timeseries' && req.method === 'GET') {
    const buckets = analyticsController.getTimeSeries(range, appId, category);
    return Response.json({ status: 'ok', buckets });
  }

  // 3. Dimensional Breakdowns (Routes, Countries, OS, Browsers, Devices)
  if (path === '/api/analytics/breakdowns' && req.method === 'GET') {
    const breakdowns = analyticsController.getBreakdowns(range, appId, category);
    return Response.json({ status: 'ok', breakdowns });
  }

  // 4. Live Machine & IP Inspector Table
  if (path === '/api/analytics/inspector' && req.method === 'GET') {
    const limit = Number(url.searchParams.get('limit')) || 50;
    const search = url.searchParams.get('search') || '';
    const masked = url.searchParams.get('masked') === 'true';
    const inspCategory = url.searchParams.get('category') || 'all';
    const events = analyticsController.getInspector(limit, search, masked, inspCategory);
    return Response.json({ status: 'ok', events });
  }

  // 5. Universal Telemetry Beacon Collector (Client Web Vitals & Machine Specs)
  if (path === '/api/analytics/collect' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    const clientIp =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Check if this is a server request telemetry forward or a client browser beacon
    if (body.method && body.statusCode !== undefined) {
      analyticsController.recordLiveRequest({
        appId: body.service || 'portal',
        path: body.path || '/',
        method: body.method || 'GET',
        statusCode: body.statusCode || 200,
        durationMs: body.durationMs || 1.0,
        clientIp: body.clientIp || clientIp,
        userAgent: body.userAgent || userAgent,
        referer: body.referer || '',
        traceId: body.traceId || undefined,
      });
    } else {
      analyticsController.ingestBeacon(body, clientIp, userAgent);
    }

    return Response.json({ status: 'ok', ingested: true });
  }

  // 6. Seed 1-Year Historical Dataset
  if (path === '/api/analytics/seed-historical' && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    const days = Number(body.days) || 365;
    const result = analyticsController.seedHistoricalData(days);
    return Response.json({ status: 'ok', ...result });
  }

  // 7. Full Telemetry CSV Export
  if (path === '/api/analytics/export' && req.method === 'GET') {
    const exportCategory = url.searchParams.get('category') || 'all';
    const events = analyticsController.getInspector(500, '', false, exportCategory);
    const csvContent =
      'Timestamp,Service,Method,Path,StatusCode,DurationMs,ClientIP,Country,City,Device,OS,Browser,TraceID\n' +
      events
        .map(
          (e) =>
            `${new Date(e.timestamp * 1000).toISOString()},${e.appId},${e.method},"${e.path}",${e.statusCode},${e.durationMs},"${e.clientIp}","${e.countryName}","${e.city}","${e.deviceCategory}","${e.os}","${e.browser}","${e.traceId || ''}"`
        )
        .join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="forge_telemetry_${Date.now()}.csv"`,
      },
    });
  }

  return null;
}
