/**
 * @forge/dev-dashboard - Contract Tests: Organization Setup RFC 7807 Parity (3A Pattern)
 * Validates that all error responses conform to application/problem+json standard.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { describe, expect, it } from 'bun:test';
import {
  handleUpdateOrgProfile,
  handleUpsertNodeType,
  handleUpsertNode,
} from '@forge/auth/backend/api-org-setup-handlers';

describe('Tier 4 Contract: Organization Setup RFC 7807 Problem Details Parity', () => {
  it('Arrange, Act, Assert: Profile update error returns valid RFC 7807 payload and header', async () => {
    // Act: Send invalid empty payload
    const res = await handleUpdateOrgProfile(
      new Request('http://localhost/api/v1/auth/org/setup/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    // Assert: Content-Type is application/problem+json
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toContain('application/problem+json');

    const json: any = await res.json();
    expect(json.type).toBe('https://tools.ietf.org/html/rfc7807');
    expect(json.title).toBe('Bad Request');
    expect(json.status).toBe(400);
    expect(typeof json.detail).toBe('string');
  });

  it('Arrange, Act, Assert: Hierarchy Level Type validation error conforms to RFC 7807', async () => {
    // Act: Send missing level_order
    const res = await handleUpsertNodeType(
      new Request('http://localhost/api/v1/auth/org/setup/node-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Incomplete Tier' }),
      })
    );

    // Assert
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toContain('application/problem+json');

    const json: any = await res.json();
    expect(json.status).toBe(400);
    expect(json.title).toBe('Bad Request');
  });

  it('Arrange, Act, Assert: Department Node validation error conforms to RFC 7807', async () => {
    // Act: Send missing type_id
    const res = await handleUpsertNode(
      new Request('http://localhost/api/v1/auth/org/setup/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Squad Without Type' }),
      })
    );

    // Assert
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toContain('application/problem+json');

    const json: any = await res.json();
    expect(json.status).toBe(400);
    expect(json.detail).toContain('required');
  });
});
