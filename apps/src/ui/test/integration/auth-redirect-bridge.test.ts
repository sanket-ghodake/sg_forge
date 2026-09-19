/**
 * @forge/ui - Tier 2 Integration: Central Auth Redirect Bridge Exclusion
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 * @requirements [LLR-AUTH-011] [LLR-UI-007]
 */

import { describe, expect, it } from 'bun:test';
import { getHeadStateScript } from '../../src/state/head-script';

describe('Tier 2 Integration: Central Auth Redirect Bridge Exclusion [LLR-AUTH-011]', () => {
  it('Arrange, Act, Assert: excludes central auth redirect bridge and fetch interceptor when enableAuthRedirectBridge is false', () => {
    // Arrange
    const options = { defaultTheme: 'dark' as const, enableAuthRedirectBridge: false };

    // Act
    const script = getHeadStateScript(options);

    // Assert
    expect(script).not.toContain('forge_auth_channel');
    expect(script).not.toContain('forge_logout_event');
    expect(script).not.toContain('/auth/login?return_url=');
    expect(script).not.toContain('auth-bridge-excluded');
    // Ensure core theme & state initialization remains intact
    expect(script).toContain('data-theme');
    expect(script).toContain('forge:v1:platform:theme');
  });

  it('Arrange, Act, Assert: includes central auth redirect bridge when enableAuthRedirectBridge is true', () => {
    // Arrange
    const options = { defaultTheme: 'dark' as const, enableAuthRedirectBridge: true };

    // Act
    const script = getHeadStateScript(options);

    // Assert
    expect(script).toContain('forge_auth_channel');
    expect(script).toContain('forge_logout_event');
    expect(script).toContain('/auth/login?return_url=');
  });

  it('Arrange, Act, Assert: defaults to including central auth redirect bridge for backward compatibility', () => {
    // Arrange & Act
    const scriptDefault = getHeadStateScript();
    const scriptEmptyOpts = getHeadStateScript({});

    // Assert
    expect(scriptDefault).toContain('forge_auth_channel');
    expect(scriptDefault).toContain('/auth/login?return_url=');
    expect(scriptEmptyOpts).toContain('forge_auth_channel');
    expect(scriptEmptyOpts).toContain('/auth/login?return_url=');
  });

  it('Arrange, Act, Assert: includes path exclusion guards for independent services when bridge is active', () => {
    // Arrange
    const options = { enableAuthRedirectBridge: true };

    // Act
    const script = getHeadStateScript(options);

    // Assert: Fetch interceptor guards check against unauthenticated / independent services
    expect(script).toContain("window.location.pathname.startsWith('/devcenter')");
    expect(script).toContain("window.location.pathname.startsWith('/gateway')");
    expect(script).toContain("window.location.pathname.startsWith('/docs')");
  });
});
