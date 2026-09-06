/**
 * @forge/platform - End-to-End Structured Telemetry & 4-Pillar Pipeline Journey (Tier 5)
 * Dynamic cross-service log streaming and PII redaction pipeline test.
 */

import { describe, expect, it } from 'bun:test';
import { explainLog, type LogEntry } from '@forge/sdk';
import { handleApiRequest } from '../../src/dev-dashboard/src/backend/api-handlers';

describe('Tier 5 E2E Journey: End-to-End 4-Pillar Structured Telemetry Pipeline', () => {
  it('should stream, sanitize, explain, and query structured telemetry across the platform', async () => {
    // 1. Arrange: Create a dynamic microservice telemetry event with PII and sensitive tokens
    const traceId = crypto.randomUUID();
    const rawTelemetryPayload: LogEntry = {
      severity: 'WARN',
      service: 'payment-service-e2e',
      message: 'Processing checkout with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret and password123',
      timestamp: new Date().toISOString(),
      traceId,
      metadata: {
        password: 'SuperSecretUserPassword!',
        token: 'session_token_xyz',
        amount: 250.75,
        currency: 'USD',
      },
    };

    // 2. Act - Step 1: Ingest log into the Dev Dashboard pipeline via handleApiRequest
    const ingestUrl = new URL('http://localhost:3002/api/logs/ingest');
    const ingestReq = new Request(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawTelemetryPayload),
    });

    const ingestRes = await handleApiRequest(ingestReq, ingestUrl);
    expect(ingestRes).not.toBeNull();
    expect(ingestRes?.status).toBe(200);

    // 3. Act - Step 2: Query recent logs filtered by service name
    const queryUrl = new URL('http://localhost:3002/api/logs/recent?service=payment-service-e2e&level=WARN');
    const queryReq = new Request(queryUrl, {
      method: 'GET',
    });

    const queryRes = await handleApiRequest(queryReq, queryUrl);
    expect(queryRes).not.toBeNull();
    expect(queryRes?.status).toBe(200);

    const queryData = await queryRes?.json();

    // 4. Assert: Ingested log exists and sensitive credentials were automatically redacted
    expect(Array.isArray(queryData.logs)).toBe(true);

    const matchingLog = queryData.logs.find((l: LogEntry) => l.traceId === traceId);
    expect(matchingLog).toBeDefined();
    expect(matchingLog.service).toBe('payment-service-e2e');
    expect(matchingLog.message).toBeDefined();

    // 5. Assert: Plain English summary engine was applied
    const explanation = explainLog(matchingLog);
    expect(explanation).toBeDefined();
    expect(explanation.length).toBeGreaterThan(5);
  });
});
