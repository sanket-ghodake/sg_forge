import { describe, expect, it } from 'bun:test';
import { themeTokens, ASTRYX_VERSION } from '@forge/ui';
import { createLogger, createSafeHandler, loadServiceRegistry } from '@forge/sdk';

describe('SG Forge Base Sanity', () => {
  it('loads UI theme tokens accurately across dark and light modes', () => {
    expect(ASTRYX_VERSION).toBe('2.0.0');
    expect(themeTokens.dark.primary).toBeDefined();
    expect(themeTokens.dark.bgRoot).toBeDefined();
    expect(themeTokens.light.primary).toBeDefined();
    expect(themeTokens.light.bgRoot).toBeDefined();
  });

  it('initializes centralized structured logger without errors', () => {
    const logger = createLogger('test-service');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('safely wraps handlers and catches errors with RFC 7807 problem responses', async () => {
    const brokenHandler = createSafeHandler('test-service', async () => {
      throw new Error('Test explosion');
    });

    const response = await brokenHandler(new Request('http://localhost/test'));
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');

    const body = await response.json();
    expect(body.title).toBe('Internal Server Error');
    expect(body.service).toBe('test-service');
    expect(body.traceId).toBeDefined();
    expect(response.headers.get('x-trace-id')).toBeDefined();
  });

  it('redacts sensitive credentials and PII keys recursively', async () => {
    const { redactSensitiveData } = await import('@forge/sdk');
    const dirty = {
      user: 'alice',
      password: 'SuperSecretPassword123!',
      token: 'jwt.token.here',
      nested: {
        apiKey: 'secret_api_key',
        authorization: 'Bearer secret_token_xyz',
      },
    };
    const cleaned = redactSensitiveData(dirty) as any;
    expect(cleaned.user).toBe('alice');
    expect(cleaned.password).toBe('[REDACTED]');
    expect(cleaned.token).toBe('[REDACTED]');
    expect(cleaned.nested.apiKey).toBe('[REDACTED]');
    expect(cleaned.nested.authorization).toBe('[REDACTED]');
  });

  it('propagates caller trace ID through createSafeHandler', async () => {
    const handler = createSafeHandler('test-service', async (req, ctx) => {
      return Response.json({ ok: true, trace: ctx?.traceId });
    });

    const customTraceId = 'trace-custom-uuid-12345';
    const req = new Request('http://localhost/test', {
      headers: { 'x-trace-id': customTraceId },
    });
    const res = await handler(req);
    expect(res.headers.get('x-trace-id')).toBe(customTraceId);
    const data = await res.json();
    expect(data.trace).toBe(customTraceId);
  });

  it('dynamically parses service registry from environment variables', () => {
    const services = loadServiceRegistry();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThanOrEqual(5);

    const portal = services.find((s) => s.id === 'portal');
    expect(portal).toBeDefined();
    expect(portal?.port).toBe(3001);
    expect(portal?.path).toBe('/portal');

    const telemetry = services.find((s) => s.id === 'telemetry');
    expect(telemetry).toBeDefined();
    expect(telemetry?.port).toBe(8087);
    expect(telemetry?.path).toBe('/apps/telemetry');
  });
});
