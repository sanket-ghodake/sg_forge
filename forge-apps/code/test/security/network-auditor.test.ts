/**
 * @forge-apps/code - Tier 3 Security: Network Auditor & Telemetry Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  recordNetworkEvent,
  sanitizeUrl,
  ingestBrowserTelemetry,
} from '../../src/network-auditor';
import { startCodeServer } from '../../src/server';

const LOG_FILE = join(import.meta.dir, '..', '..', 'logs', 'network.log');

describe('Tier 3 Security: Network Auditor & Telemetry Invariants', () => {
  it('Arrange, Act, Assert: redacts sensitive query parameters in URLs', () => {
    // Arrange
    const dangerousUrl = 'https://api.github.com/user?token=ghp_secret12345&state=ok&password=supersecret';

    // Act
    const sanitized = sanitizeUrl(dangerousUrl);

    // Assert
    expect(sanitized).not.toContain('ghp_secret12345');
    expect(sanitized).not.toContain('supersecret');
    expect(sanitized).toContain('token=%5BREDACTED%5D');
    expect(sanitized).toContain('password=%5BREDACTED%5D');
    expect(sanitized).toContain('state=ok');
  });

  it('Arrange, Act, Assert: writes structured JSONL network events into network.log', () => {
    // Arrange
    const testId = `test-${Date.now()}`;

    // Act
    const record = recordNetworkEvent({
      direction: 'INGRESS',
      method: 'GET',
      url: `/apps/code/test/${testId}`,
      status: 200,
      durationMs: 42,
      userId: 'usr-test-auditor',
      clientIp: '127.0.0.1',
    });

    // Assert
    expect(record.service).toBe('code-app');
    expect(record.category).toBe('NETWORK_AUDIT');
    expect(record.direction).toBe('INGRESS');
    expect(record.status).toBe(200);

    expect(existsSync(LOG_FILE)).toBe(true);
    const content = readFileSync(LOG_FILE, 'utf8');
    expect(content).toContain(testId);
  });

  it('Arrange, Act, Assert: ingests batches of browser network telemetry', () => {
    // Arrange
    const browserEvents = [
      { url: 'https://api.github.com/copilot_internal/user', method: 'GET', status: 200, durationMs: 85 },
      { url: 'https://github.com/login/oauth', method: 'POST', status: 302, durationMs: 120 },
    ];

    // Act
    const count = ingestBrowserTelemetry(
      browserEvents,
      'usr-browser-tester',
      '10.0.0.1',
      'Mozilla/5.0 TestBrowser'
    );

    // Assert
    expect(count).toBe(2);
    const content = readFileSync(LOG_FILE, 'utf8');
    expect(content).toContain('https://api.github.com/copilot_internal/user');
    expect(content).toContain('usr-browser-tester');
  });

  it('Arrange, Act, Assert: accepts telemetry via /api/telemetry/network endpoint', async () => {
    // Arrange
    const server = startCodeServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/api/telemetry/network`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-telemetry-endpoint-tester',
          events: [
            { url: 'https://api.github.com/user', method: 'GET', status: 200, durationMs: 30 },
          ],
        }),
      });

      // Assert
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.ingested).toBe(1);
    } finally {
      server.stop();
    }
  });
});
