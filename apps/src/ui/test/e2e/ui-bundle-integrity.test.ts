/**
 * @forge/ui - Tier 5 E2E: Shell Assembly & Universal Component Integration
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import {
  getAstryxHeaderHtml,
  getAstryxStyles,
  getAstryxTooltipScript,
  getHeadStateScript,
  renderAstryxErrorHtml,
} from '../../src';

describe('Tier 5 E2E: Astryx Shell Assembly & Execution Readiness [HLR-UI-401] [SR-UI-001]', () => {
  it('Arrange, Act, Assert: builds complete Astryx HTML page shell with zero missing scripts or styles', () => {
    // Arrange & Act
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shell Test</title>
  ${getHeadStateScript()}
  <style>${getAstryxStyles()}</style>
</head>
<body>
  ${getAstryxHeaderHtml('TEST APP', 'INTEGRITY TEST')}
  <main class="astryx-container">
    <div class="astryx-card">
      <button class="astryx-btn btn-primary" data-astryx-tooltip="Click me">Action</button>
    </div>
  </main>
  <script>${getAstryxTooltipScript()}</script>
</body>
</html>`;

    // Assert: Document structure integrity
    expect(fullHtml).toContain('<!DOCTYPE html>');
    expect(fullHtml).toContain('class="astryx-header"');
    expect(fullHtml).toContain('--forge-primary');
    expect(fullHtml).toContain('initAstryxUniversalTooltips');
    expect(fullHtml).toContain('data-astryx-tooltip="Click me"');
  });

  it('Arrange, Act, Assert: renders compliant error shell for RFC 7807 problem incidents', () => {
    // Act
    const errorHtml = renderAstryxErrorHtml({
      statusCode: 500,
      appName: 'Checkout Service',
      title: 'Database Cluster Timeout',
      message: 'Replication latency exceeded allowable failover timeout.',
      traceId: 'trace-test-uuid-999',
    });

    // Assert
    expect(errorHtml).toContain('500');
    expect(errorHtml).toContain('Database Cluster Timeout');
    expect(errorHtml).toContain('trace-test-uuid-999');
    expect(errorHtml).toContain('astryx-card');
  });
});
