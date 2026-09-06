/**
 * @forge/dev-dashboard - Tier 3 Security: SQL Sandbox Injection Defense & Access Control
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { platformDb, dbDiagnostics, startDevDashboardServer } from '../../src';

describe('Tier 3 Security: SQL Sandbox Defense & Input Hardening', () => {
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

  it('strictly rejects data-modifying mutations in read-only sandbox mode', () => {
    // Arrange: Attack payloads attempting data destruction and schema tampering
    const forbiddenQueries = [
      'DROP TABLE apps_registry',
      'DELETE FROM apps_registry WHERE 1=1',
      'UPDATE apps_registry SET port = 9999',
      'INSERT INTO apps_registry (id) VALUES ("hacked")',
      'ATTACH DATABASE "/tmp/evil.db" AS evil',
      'ALTER TABLE apps_registry ADD COLUMN exploit TEXT',
    ];

    // Act & Assert
    for (const sql of forbiddenQueries) {
      const result = platformDb.executeQuery('platform_core.db', sql, true);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('READ_ONLY sandbox mode');
      expect(result.rows).toHaveLength(0);
    }
  });

  it('strictly blocks path traversal attempts in database diagnostics and execution', () => {
    // Arrange: Path traversal attack payloads
    const traversalPayloads = [
      ['..', '..', 'etc', 'passwd'].join('/'),
      ['..', '..', '..', 'etc', 'shadow'].join('/'),
      ['..', '..', 'windows', 'system32'].join('\\'),
      ['subdir', '..', '..', 'escaped.db'].join('/'),
    ];

    // Act & Assert
    for (const badPath of traversalPayloads) {
      const execResult = platformDb.executeQuery(badPath, 'SELECT 1;', true);
      expect(execResult.error).toContain('not found or invalid name');

      const telemResult = dbDiagnostics.getDatabaseTelemetry(badPath);
      expect('error' in telemResult).toBe(true);
      if ('error' in telemResult) {
        expect(telemResult.error).toContain('not found or invalid name');
      }

      const graphResult = dbDiagnostics.getDatabaseSchemaGraph(badPath);
      expect('error' in graphResult).toBe(true);
      if ('error' in graphResult) {
        expect(graphResult.error).toContain('not found or invalid name');
      }
    }
  });

  it('rejects malformed log ingest payloads with HTTP 400', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act: Invalid log payload without service or message
      const res = await fetch(`http://localhost:${server.port}/api/logs/ingest`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ invalidField: true }),
      });
      const json: any = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid log payload');
    } finally {
      server.stop();
    }
  });
});
