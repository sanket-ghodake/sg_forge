/**
 * @forge/dev-hub - Tier 1 Unit: Section HTML Renderers & Tokens (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { renderGatewaySection } from '../../src/frontend/sections/gateway-section';
import { renderHealthMeshSection } from '../../src/frontend/sections/health-mesh-section';
import { renderOverviewSection } from '../../src/frontend/sections/overview-section';
import { renderRegistryMatrixSection } from '../../src/frontend/sections/registry-matrix-section';
import { renderSandboxSection } from '../../src/frontend/sections/sandbox-section';
import { renderScaffoldingSection } from '../../src/frontend/sections/scaffolding-section';
import { renderSdkSection } from '../../src/frontend/sections/sdk-section';
import { renderSecurityMatrixSection } from '../../src/frontend/sections/security-matrix-section';
import { renderTestingSection } from '../../src/frontend/sections/testing-section';
import { renderTokenMintSection } from '../../src/frontend/sections/token-mint-section';
import { renderUiSection } from '../../src/frontend/sections/ui-section';

describe('Tier 1 Unit: Modular Section HTML Renderers', () => {
  it('renders overview section with invariants and topology', () => {
    // 1. Arrange & 2. Act
    const html = renderOverviewSection();

    // 3. Assert
    expect(html).toContain('The 10 Non-Negotiable Engineering Invariants');
    expect(html).toContain('Platform Architecture & Gateway Ingress Topology');
    expect(html).toContain('500-Line Soft File Cap');
  });

  it('renders health mesh section with ping all button and service endpoints', () => {
    // 1. Arrange & 2. Act
    const html = renderHealthMeshSection();

    // 3. Assert
    expect(html).toContain('Live Cluster Health & Dual-Probe Latency Mesh');
    expect(html).toContain('pingAllServices()');
    expect(html).toContain('/auth/health');
    expect(html).toContain('/portal/health');
  });

  it('renders token mint section with 1-click presets and JWT claims view', () => {
    // 1. Arrange & 2. Act
    const html = renderTokenMintSection();

    // 3. Assert
    expect(html).toContain('Test Token Mint & JWT Inspector');
    expect(html).toContain('mintTestToken');
    expect(html).toContain('active-jwt-token');
    expect(html).toContain('jwt-decoded-payload');
  });

  it('renders registry matrix section with route mappings', () => {
    // 1. Arrange & 2. Act
    const html = renderRegistryMatrixSection();

    // 3. Assert
    expect(html).toContain('Dynamic Ingress Route Matrix & Service Registry');
    expect(html).toContain('/apps/billing');
    expect(html).toContain('/apps/telemetry');
  });

  it('renders SDK reference section with all core modules', () => {
    // 1. Arrange & 2. Act
    const html = renderSdkSection();

    // 3. Assert
    expect(html).toContain('@forge/sdk');
    expect(html).toContain('authGuard(req, options)');
    expect(html).toContain('createLogger(serviceName)');
    expect(html).toContain('createSafeHandler(serviceName, handler)');
    expect(html).toContain('getScopedHierarchy(id)');
    expect(html).toContain('ForgeClient.init(options)');
  });

  it('renders UI tokens section with Astryx variables and zero defaults', () => {
    // 1. Arrange & 2. Act
    const html = renderUiSection();

    // 3. Assert
    expect(html).toContain('--forge-bg-root');
    expect(html).toContain('--forge-primary');
    expect(html).toContain('Zero Browser Defaults Policy');
    expect(html).toContain('Slim Scrollbars');
  });

  it('renders gateway ingress section with injected headers specification', () => {
    // 1. Arrange & 2. Act
    const html = renderGatewaySection();

    // 3. Assert
    expect(html).toContain('X-Forwarded-User');
    expect(html).toContain('X-Forwarded-User-Id');
    expect(html).toContain('X-Forwarded-Role');
    expect(html).toContain('APP_&lt;ID&gt;=');
  });

  it('renders scaffolding section with multi-language code tabs', () => {
    // 1. Arrange & 2. Act
    const html = renderScaffoldingSection();

    // 3. Assert
    expect(html).toContain('./run.sh create-app');
    expect(html).toContain('FastAPI');
    expect(html).toContain('Fiber');
  });

  it('renders interactive sandbox with polyglot generator and simulator', () => {
    // 1. Arrange & 2. Act
    const html = renderSandboxSection();

    // 3. Assert
    expect(html).toContain('sandbox-endpoint-select');
    expect(html).toContain('Injected Header Simulator');
    expect(html).toContain('code-curl-snippet');
    expect(html).toContain('switchSandboxLang');
  });

  it('renders security and RFC 7807 problem details matrix', () => {
    // 1. Arrange & 2. Act
    const html = renderSecurityMatrixSection();

    // 3. Assert
    expect(html).toContain('RFC 7807 Problem Matrix');
    expect(html).toContain('401 Unauthorized');
    expect(html).toContain('403 Forbidden');
    expect(html).toContain('429 Rate Limited');
    expect(html).toContain('502 Bad Gateway');
  });

  it('renders 5-tier testing section with 3A pattern rules', () => {
    // 1. Arrange & 2. Act
    const html = renderTestingSection();

    // 3. Assert
    expect(html).toContain('Tier 1: Unit');
    expect(html).toContain('Tier 5: E2E');
    expect(html).toContain('3A Pattern (Arrange, Act, Assert)');
  });
});
