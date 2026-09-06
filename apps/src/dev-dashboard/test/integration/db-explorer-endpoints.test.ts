/**
 * @forge/dev-dashboard - Integration Tests: Database Explorer & Tools Endpoints (3A Pattern)
 * Enterprise SRE & Astryx Enterprise Standard
 */

import { describe, expect, it } from 'bun:test';
import { handleApiRequest } from '../../src/backend/api-handlers';

describe('Tier 2 Integration: Database Explorer & Diagnostics Endpoints', () => {
  it('Arrange, Act, Assert: GET /api/db/schema returns schema and DDL', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/schema?db=platform_core.db&table=apps_registry');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.schema)).toBe(true);
    expect(data.ddl).toContain('CREATE TABLE');
  });

  it('Arrange, Act, Assert: GET /api/db/rows returns paginated table rows', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/rows?db=platform_core.db&table=apps_registry&page=1&limit=10');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(data.page).toBe(1);
    expect(Array.isArray(data.rows)).toBe(true);
  });

  it('Arrange, Act, Assert: POST /api/db/integrity returns integrity diagnostics', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/integrity');
    const req = new Request(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbName: 'platform_core.db' }),
    });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(data.success).toBe(true);
  });

  it('Arrange, Act, Assert: GET /api/routes/registry returns microservice endpoints', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/routes/registry');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.endpoints)).toBe(true);
    expect(data.endpoints.length).toBeGreaterThan(0);
  });

  it('Arrange, Act, Assert: GET /api/export/csv streams CSV content with headers', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/export/csv?type=traffic');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.headers.get('Content-Type')).toContain('text/csv');
    const text = await res!.text();
    expect(text).toContain('Timestamp,App,Path,Method,StatusCode,DurationMs');
  });

  it('Arrange, Act, Assert: POST /api/db/connect registers a new remote microservice DB', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/connect');
    const req = new Request(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Remote DB',
        url: 'https://auth-prod.turso.io',
        type: 'turso',
        authToken: 'secret_jwt_token',
        readOnly: true,
      }),
    });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.success).toBe(true);
    expect(data.connectionId).toBeDefined();

    // Verify /api/db/list includes the new remote DB
    const listUrl = new URL('http://localhost:3002/api/db/list');
    const listReq = new Request(listUrl.toString(), { method: 'GET' });
    const listRes = await handleApiRequest(listReq, listUrl);
    const listData: any = await listRes!.json();
    expect(listData.remoteDatabases.some((r: any) => r.name === data.connectionId)).toBe(true);
  });

  it('Arrange, Act, Assert: POST /api/db/test-connect validates reachability format', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/test-connect');
    const req = new Request(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'postgres://user:pass@localhost:5432/testdb',
        type: 'postgres',
      }),
    });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.success).toBe(true);
    expect(data.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('Arrange, Act, Assert: GET /api/db/stats returns real-time telemetry metrics', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/stats?db=platform_core.db');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(data.fileSizeBytes).toBeGreaterThan(0);
    expect(data.tableCount).toBeGreaterThan(0);
    expect(data.journalMode).toBeDefined();
  });

  it('Arrange, Act, Assert: GET /api/db/graph returns ER schema graph', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/graph?db=platform_core.db');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(data.nodes.length).toBeGreaterThan(0);
    expect(Array.isArray(data.edges)).toBe(true);
  });
});
