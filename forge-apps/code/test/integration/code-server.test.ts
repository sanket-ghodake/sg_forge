/**
 * @forge-apps/code - HTTP Routes & Auth Integration Tests (Tier 2)
 * Real Network Sockets & Session Guard Verification
 */

import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { createInternalServiceToken } from '../../src/lib/sdk';
import { startCodeServer } from '../../src/server';

describe('Tier 2 Integration: Code Microservice Server Endpoints [LLR-SUB-005] [HLR-CODE-002] [LLR-CODE-001.2] [LLR-CODE-002.1]', () => {
  const testPort = 8188;
  let server: ReturnType<typeof Bun.serve>;

  beforeAll(() => {
    server = startCodeServer(testPort);
  });

  afterAll(() => {
    server.stop(true);
  });

  it('Dual-Probe Health: returns 200 OK with system telemetry', async () => {
    const res = await fetch(`http://localhost:${testPort}/health`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.app).toBe('code');
    expect(json.livez).toBe(true);
    expect(json.readyz).toBe(true);
  });

  it('Zero-Trust Auth Guard: redirects unauthenticated requests to login', async () => {
    const res = await fetch(`http://localhost:${testPort}/`, {
      redirect: 'manual',
    });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/auth/login');
  });

  it('Authenticated Catalog: returns 200 HTML with Astryx layout for valid session', async () => {
    const token = createInternalServiceToken(['roles/super_admin'], 'admin-tester');
    const res = await fetch(`http://localhost:${testPort}/`, {
      headers: {
        Cookie: `forge_session=${token}`,
      },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('VS Code Cloud Workspaces');
    expect(html).toContain('astryx-container');
  });
});
