/**
 * @forge/dev-dashboard - Tier 1 Unit: Services Probe & Candidate Resolution Engine
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */

import { describe, expect, it } from 'bun:test';
import { handleApiRequest } from '../../src/backend/api-handlers';
import { servicesController } from '../../src/backend/services-controller';
import { platformDb } from '../../src/db';

describe('Tier 1 Unit: Services Probe & Multi-Net Ingress [HLR-DEV-501]', () => {
  it('handles /api/services/probe with valid serviceId', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/services/probe?serviceId=landing');
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(200);
    const data = await res!.json();
    expect(data.status).toBe('ok');
    expect(data.serviceId).toBe('landing');
    expect(['RUNNING', 'STOPPED', 'DEGRADED', 'STARTING']).toContain(data.operationalState);
    expect(typeof data.latencyMs).toBe('number');
    expect(typeof data.livez).toBe('boolean');
  });

  it('rejects /api/services/probe without serviceId parameter with 400', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/services/probe');
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(400);
    const data = await res!.json();
    expect(data.error).toContain('Missing serviceId');
  });

  it('rejects /api/services/probe with non-existent serviceId with 404', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/services/probe?serviceId=non-existent-app-999');
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(404);
    const data = await res!.json();
    expect(data.error).toContain('not found in registry');
  });

  it('generates multi-net candidate URLs including reverse proxy and host bindings', () => {
    // Arrange
    const app = platformDb.getAppById('telemetry');
    expect(app).not.toBeNull();

    // Act
    const urls = (servicesController as any).getCandidateUrls(app!);

    // Assert
    expect(Array.isArray(urls)).toBe(true);
    expect(urls.length).toBeGreaterThanOrEqual(3);
    const hasProxy = urls.some((u: string) => u.includes('/apps/telemetry/health'));
    expect(hasProxy).toBe(true);
    const hasHost = urls.some((u: string) => u.includes(':8087/health'));
    expect(hasHost).toBe(true);
  });

  it('persists and auto-heals canonical db_file_path across registry sync', () => {
    // Arrange & Act
    platformDb.syncWithEnvRegistry();
    const apps = platformDb.getAppsRegistry();

    // Assert
    expect(apps.length).toBeGreaterThan(0);
    for (const app of apps) {
      expect(app.db_file_path).toBeDefined();
      expect(app.db_file_path).not.toContain('/app/data/');
      expect(app.db_file_path!.endsWith('.db')).toBe(true);
    }
  });
});
