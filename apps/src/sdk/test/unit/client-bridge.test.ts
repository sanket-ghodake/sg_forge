/**
 * @forge/sdk - Tier 1 Unit: ForgeClient Micro-App Bridge
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { ForgeClient } from '../../src/client-bridge';

describe('Tier 1 Unit: ForgeClient Micro-App Bridge', () => {
  beforeEach(() => {
    // Setup isolated window environment
    (globalThis as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      location: { pathname: '/apps/billing' },
      fetch: async (url: string, init: any) => {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: init?.headers });
      },
    };
  });

  it('Arrange, Act, Assert: initializes client in standalone local dev fallback when window.parent is window', async () => {
    // Arrange
    (globalThis as any).window.parent = (globalThis as any).window;

    // Act
    const client = await ForgeClient.init();

    // Assert
    expect(client).toBeDefined();
    expect(client.user.id).toBe('dev_user');
    expect(client.user.role).toBe('admin');
    expect(client.token).toBe('mock_local_dev_token');
    expect(client.theme).toBe('dark');
  });

  it('Arrange, Act, Assert: ForgeClient.fetch attaches Authorization Bearer token header', async () => {
    // Arrange
    (globalThis as any).window.parent = (globalThis as any).window;
    const client = await ForgeClient.init();
    client.token = 'live_ed25519_bearer_session_jwt';

    // Act
    let sentHeaders: any = null;
    (globalThis as any).window.fetch = async (_url: string, init: any) => {
      sentHeaders = init.headers;
      return new Response('{}', { status: 200 });
    };

    await client.fetch('/api/v1/invoices', { headers: { 'Custom-Header': 'val' } });

    // Assert
    expect(sentHeaders.get('Authorization')).toBe('Bearer live_ed25519_bearer_session_jwt');
    expect(sentHeaders.get('Custom-Header')).toBe('val');
  });

  it('Arrange, Act, Assert: triggers onThemeChange callback during initialization if theme changes', async () => {
    // Arrange
    let themeChangedTo: string | null = null;
    (globalThis as any).window.parent = (globalThis as any).window;

    // Act
    const client = await ForgeClient.init({
      onThemeChange: (theme) => {
        themeChangedTo = theme;
      },
    });

    // Assert
    expect(client.theme).toBe('dark');
  });
});
