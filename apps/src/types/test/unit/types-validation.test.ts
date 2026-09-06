/**
 * @forge/types - Tier 1 Unit: Domain Model & Type Conformance Suite
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import type {
  AuthUser,
  BrandConfig,
  ForgeAppManifest,
  PostMessageEvent,
  ScopedHierarchyResponse,
  UserContext,
} from '../../src';

describe('Tier 1 Unit: SG Forge Domain Types Conformance', () => {
  it('Arrange, Act, Assert: conforms to valid AuthUser model structure', () => {
    // Arrange
    const user: AuthUser = {
      id: 'usr_emp_001',
      email: 'alice.eng@forge.internal',
      displayName: 'Alice Sharma',
      principalType: 'EMPLOYEE',
      orgId: 'org-sg-forge-global',
      roles: ['roles/employee', 'roles/developer'],
      permissions: ['portal.access', 'apps.launch'],
      tokenVersion: 1,
    };

    // Act & Assert
    expect(user.id.startsWith('usr_')).toBe(true);
    expect(user.email).toContain('@');
    expect(user.roles).toContain('roles/employee');
    expect(user.principalType).toBe('EMPLOYEE');
  });

  it('Arrange, Act, Assert: conforms to valid ForgeAppManifest interface', () => {
    // Arrange
    const manifest: ForgeAppManifest = {
      id: 'billing',
      slug: 'billing',
      name: 'Invoicing & Billing Service',
      description: 'Corporate ledger and billing',
      category: 'Finance',
      entryUrl: '/apps/billing',
      port: 8086,
      runtime: 'node',
      requiredRole: 'admin',
      isIsolated: true,
    };

    // Act & Assert
    expect(manifest.port).toBeGreaterThan(1024);
    expect(manifest.entryUrl.startsWith('/')).toBe(true);
    expect(manifest.runtime).toBe('node');
  });

  it('Arrange, Act, Assert: validates PostMessageEvent discriminated union variants', () => {
    // Arrange
    const initEvt: PostMessageEvent = {
      type: 'FORGE_APP_INIT',
      payload: { appId: '/apps/expenses' },
    };

    const userCtx: UserContext = {
      id: 'usr_002',
      email: 'bob@forge.internal',
      name: 'Bob Miller',
      role: 'manager',
    };

    const contextEvt: PostMessageEvent = {
      type: 'FORGE_APP_CONTEXT',
      payload: {
        user: userCtx,
        token: 'signed_jwt_token_sample',
        theme: 'dark',
      },
    };

    // Act & Assert
    expect(initEvt.type).toBe('FORGE_APP_INIT');
    expect(initEvt.payload.appId).toBe('/apps/expenses');
    expect(contextEvt.type).toBe('FORGE_APP_CONTEXT');
    expect(contextEvt.payload.theme).toBe('dark');
  });

  it('Arrange, Act, Assert: validates ScopedHierarchyResponse data contract', () => {
    // Arrange
    const hierarchy: ScopedHierarchyResponse = {
      status: 'SUCCESS',
      employee: {
        id: 'usr_003',
        displayName: 'Kavita Reddy',
        email: 'kavita@forge.internal',
        departmentName: 'Finance',
      },
      managementChain: [
        {
          level: 1,
          relationship: 'LINE_MANAGER',
          id: 'usr_mgr_001',
          displayName: 'Vikramaditya Patel',
          email: 'vikram@forge.internal',
        },
      ],
      directReports: [],
      summary: {
        totalManagersAbove: 1,
        totalDirectReports: 0,
        isTopLevel: false,
      },
    };

    // Act & Assert
    expect(hierarchy.status).toBe('SUCCESS');
    expect(hierarchy.managementChain.length).toBe(1);
    expect(hierarchy.summary.isTopLevel).toBe(false);
  });
});
