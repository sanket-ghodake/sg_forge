/**
 * @forge/auth - Tier 3 Security: Service Identity Registration Gate
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]
 */

import { describe, expect, it } from 'bun:test';
import { verifyJwt } from '../../src/backend/crypto';
import { createInternalServiceToken } from '@forge/sdk';

describe('Tier 3 Security: Service Identity Registration Gate [HLR-AUTH-101] [LLR-AUTH-001]', () => {
  it('Arrange, Act, Assert: permits service tokens from active registered micro-apps', () => {
    // Arrange: Create service token for registered app 'telemetry'
    const token = createInternalServiceToken(['roles/employee'], 'internal-service-telemetry');

    // Act: Verify token
    const result = verifyJwt(token);

    // Assert: Must be valid
    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe('internal-service-telemetry');
  });

  it('Arrange, Act, Assert: permits infrastructure service worker tokens', () => {
    // Arrange: Standard internal background worker
    const token = createInternalServiceToken(['roles/super_admin'], 'internal-service-worker');

    // Act: Verify token
    const result = verifyJwt(token);

    // Assert: Worker must be accepted
    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe('internal-service-worker');
  });

  it('Arrange, Act, Assert: rejects service tokens from unregistered or rogue micro-apps', () => {
    // Arrange: Fake or decommissioned app not registered in .env
    const token = createInternalServiceToken(['roles/employee'], 'internal-service-rogue-unregistered-app');

    // Act: Verify token
    const result = verifyJwt(token);

    // Assert: Must be rejected with clean error message
    expect(result.valid).toBe(false);
    expect(result.error).toContain('is not registered in .env or is disabled');
  });
});
