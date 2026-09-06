/**
 * @forge/types - Tier 2 Integration: Cross-Service Serialization & Wire Compatibility
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import type { AuthUser, PostMessageEvent, ScopedHierarchyResponse } from '../../src';

describe('Tier 2 Integration: Type Serialization & Parsing Parity', () => {
  it('Arrange, Act, Assert: safely serializes and restores PostMessageEvent payload over JSON wire', () => {
    // Arrange
    const originalEvent: PostMessageEvent = {
      type: 'FORGE_APP_CONTEXT',
      payload: {
        user: {
          id: 'usr_int_10',
          email: 'integration@forge.internal',
          name: 'Integration Test User',
          role: 'user',
          department: 'Platform Engineering',
        },
        token: 'eyJhbGciOiJFZERTQTE5In0.test_payload.signature',
        theme: 'light',
      },
    };

    // Act
    const jsonStr = JSON.stringify(originalEvent);
    const restored = JSON.parse(jsonStr) as PostMessageEvent;

    // Assert
    expect(restored.type).toBe('FORGE_APP_CONTEXT');
    if (restored.type === 'FORGE_APP_CONTEXT') {
      expect(restored.payload.user.email).toBe('integration@forge.internal');
      expect(restored.payload.theme).toBe('light');
    }
  });

  it('Arrange, Act, Assert: round-trips AuthUser context across boundary', () => {
    // Arrange
    const authUser: AuthUser = {
      id: 'usr_wire_01',
      email: 'wire@forge.internal',
      displayName: 'Wire Test',
      principalType: 'ADMIN',
      orgId: 'org-wire',
      roles: ['roles/super_admin'],
      permissions: ['*'],
      tokenVersion: 2,
    };

    // Act
    const wireStr = JSON.stringify(authUser);
    const parsed = JSON.parse(wireStr) as AuthUser;

    // Assert
    expect(parsed.roles).toEqual(['roles/super_admin']);
    expect(parsed.permissions).toEqual(['*']);
    expect(parsed.tokenVersion).toBe(2);
  });
});
