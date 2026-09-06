/**
 * @forge/dev-dashboard - Tier 4 Contract: RFC 7807 Problem Details & API Schema
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startDevDashboardServer } from '../../src';

describe('Tier 4 Contract: RFC 7807 Problem Details & API Schema', () => {
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

  it('returns valid JSON schema contracts for /api/services and /api/apps', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act: /api/services
      const resServices = await fetch(`http://localhost:${server.port}/api/services`, {
        headers: AUTH_HEADERS,
      });
      const jsonServices: any = await resServices.json();

      // Assert Services contract
      expect(resServices.status).toBe(200);
      expect(jsonServices.status).toBe('ok');
      expect(Array.isArray(jsonServices.services)).toBe(true);
      expect(jsonServices.summary).toBeDefined();
      expect(typeof jsonServices.summary.sloAvailabilityPercent).toBe('number');

      // Act: /api/apps
      const resApps = await fetch(`http://localhost:${server.port}/api/apps`, {
        headers: AUTH_HEADERS,
      });
      const jsonApps: any = await resApps.json();

      // Assert Apps contract
      expect(resApps.status).toBe(200);
      expect(jsonApps.status).toBe('ok');
      expect(Array.isArray(jsonApps.apps)).toBe(true);
      expect(jsonApps.apps[0]).toHaveProperty('ingress_path');
      expect(jsonApps.apps[0]).toHaveProperty('port');
    } finally {
      server.stop();
    }
  });

  it('enforces required parameters contract on service control actions', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act: Missing serviceId on restart
      const resRestart = await fetch(`http://localhost:${server.port}/api/services/restart`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({}),
      });
      const jsonRestart: any = await resRestart.json();

      // Assert
      expect(resRestart.status).toBe(400);
      expect(jsonRestart.error).toBe('Missing serviceId');
    } finally {
      server.stop();
    }
  });

  it('returns RFC 7807 404 Problem Details JSON for unmatched API endpoints', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act: Unmatched API route with authenticated operator session
      const res = await fetch(`http://localhost:${server.port}/api/non-existent-diagnostic-route`, {
        headers: AUTH_HEADERS,
      });
      const contentType = res.headers.get('content-type') || '';
      const json: any = await res.json();

      // Assert: Must return 404 Problem Details JSON, NOT HTML <!DOCTYPE html>
      expect(res.status).toBe(404);
      expect(contentType).toContain('application/problem+json');
      expect(json.status).toBe(404);
      expect(json.title).toBe('API Endpoint Not Found');
      expect(json.type).toContain('not-found');
    } finally {
      server.stop();
    }
  });
});
