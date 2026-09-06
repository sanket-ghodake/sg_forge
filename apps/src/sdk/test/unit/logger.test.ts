/**
 * @forge/sdk - Tier 1 Unit: Structured Logger & PII Redaction Engine
 */

import { describe, expect, it } from 'bun:test';
import { createLogger, explainLog, redactSensitiveData, type LogEntry } from '../../src/logger';

describe('Tier 1 Unit: Structured Logger & Redaction Engine [LLR-SDK-002] [HLR-SDK-303] [SR-LOG-001]', () => {
  it('should recursively redact sensitive fields and bearer tokens', () => {
    const raw = {
      password: 'super-secret-password-123',
      token: 'jwt.token.here',
      auth: 'secret-auth-key',
      user: {
        email: 'dev@forge.internal',
        apiKey: 'sk-1234567890',
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig',
          note: 'Call with Bearer my_secret_token_val here',
        },
      },
      tags: ['normal', 'Bearer abc123def456'],
    };

    const redacted = redactSensitiveData(raw) as any;

    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.auth).toBe('[REDACTED]');
    expect(redacted.user.apiKey).toBe('[REDACTED]');
    expect(redacted.user.email).toBe('dev@forge.internal');
    expect(redacted.user.headers.authorization).toBe('[REDACTED]');
    expect(redacted.user.headers.note).toContain('Bearer [REDACTED]');
    expect(redacted.tags[1]).toBe('Bearer [REDACTED]');
  });

  it('should generate plain-English summaries for common operational logs', () => {
    const entry1: LogEntry = {
      severity: 'WARN',
      service: 'portal',
      message: 'Database is locked during write',
      timestamp: new Date().toISOString(),
    };
    expect(explainLog(entry1)).toContain('Database is busy');

    const entry2: LogEntry = {
      severity: 'ERROR',
      service: 'auth',
      message: 'econnrefused on upstream connection',
      timestamp: new Date().toISOString(),
    };
    expect(explainLog(entry2)).toContain('Cannot connect to auth');

    const entry3: LogEntry = {
      severity: 'INFO',
      service: 'billing',
      message: 'System_boot completed and service is online',
      timestamp: new Date().toISOString(),
    };
    expect(explainLog(entry3)).toContain('started successfully and is healthy');
  });

  it('should instantiate ForgeLogger and log without throwing', () => {
    const logger = createLogger('unit-test-service');
    expect(logger).toBeDefined();

    expect(() => {
      logger.info('Test information log', { sampleKey: 'sampleVal' });
      logger.warn('Test warning log');
      logger.error('Test error log', new Error('Test Error Object'));
      logger.logDbQuery('SELECT 1 FROM dual', 2.5);
      logger.logBrowserEvent('WARN', 'Test client event');
    }).not.toThrow();
  });
});
