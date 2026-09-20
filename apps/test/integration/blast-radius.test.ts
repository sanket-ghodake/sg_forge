/**
 * @forge/telemetry - Integration Test: Multi-Tenant Blast Radius Accounting (Tier 2)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [HLR-TEL-801] [LLR-OBS-003]
 */

import { describe, expect, it } from 'bun:test';
import { telemetryDb, calculateBlastRadius } from '../../../forge-apps/telemetry/src/db';

describe('Tier 2 Integration: Multi-Tenant Blast Radius Accounting Engine', () => {
  it('Arrange, Act, Assert: accurately computes blast radius percentage across distinct organizations', () => {
    // 1. Arrange: Clean table and seed known traffic pattern
    telemetryDb.run('DELETE FROM request_events');
    const now = Math.floor(Date.now() / 1000);

    // Seed 10 distinct organizations with 200 OK requests
    for (let i = 1; i <= 10; i++) {
      telemetryDb.run(
        `INSERT INTO request_events (id, trace_id, incident_token, service, route, method, status_code, duration_ms, org_id, user_id, tier, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          crypto.randomUUID(),
          `ERR-GOALS-${i}`,
          'goals',
          '/api/goals',
          'GET',
          200,
          15.2,
          `org_client_${i}`,
          `usr_${i}`,
          'standard',
          now - 30, // 30s ago (inside 5m window)
        ]
      );
    }

    // 2. Act - Step 1: Query baseline with zero errors
    const baseline = calculateBlastRadius(300);

    // 3. Assert - Step 1: Normal severity with 0% blast radius
    expect(baseline.totalActiveOrgs).toBe(10);
    expect(baseline.impactedOrgs).toBe(0);
    expect(baseline.blastRadiusPct).toBe(0);
    expect(baseline.severity).toBe('NORMAL');

    // 4. Act - Step 2: Inject errors for 1 organization (1 out of 10 orgs impacted = 10%)
    telemetryDb.run(
      `INSERT INTO request_events (id, trace_id, incident_token, service, route, method, status_code, duration_ms, org_id, user_id, tier, error_type, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        crypto.randomUUID(),
        'ERR-GOALS-FAIL',
        'goals',
        '/api/goals/batch',
        'POST',
        500,
        45.0,
        'org_client_1',
        'usr_1',
        'standard',
        'DatabaseConnectionTimeout',
        now - 10,
      ]
    );

    const postErrorResult = calculateBlastRadius(300);

    // 5. Assert - Step 2: 1 out of 10 orgs impacted = 10% blast radius -> P0_CRITICAL
    expect(postErrorResult.totalActiveOrgs).toBe(10);
    expect(postErrorResult.impactedOrgs).toBe(1);
    expect(postErrorResult.blastRadiusPct).toBe(10.0);
    expect(postErrorResult.severity).toBe('P0_CRITICAL');

    // 6. Act - Step 3: Verify sliding window exclusion (events older than window are omitted)
    telemetryDb.run(
      `INSERT INTO request_events (id, trace_id, incident_token, service, route, method, status_code, duration_ms, org_id, user_id, tier, error_type, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        crypto.randomUUID(),
        'ERR-OLD',
        'goals',
        '/api/goals/old',
        'GET',
        500,
        10.0,
        'org_client_99',
        'usr_99',
        'standard',
        'OldError',
        now - 600, // 10 minutes ago (outside 300s window)
      ]
    );

    const windowedResult = calculateBlastRadius(300);
    expect(windowedResult.totalActiveOrgs).toBe(10); // org_client_99 excluded
  });
});
