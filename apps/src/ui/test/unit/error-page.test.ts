/**
 * @forge/ui - Astryx Universal Error Page Unit Tests (Tier 1)
 * Enterprise SRE & AppSec Zero-Leak Error Standards
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { renderAstryxErrorHtml, renderAstryxSystemDownPage } from '../../src/error-page';

describe('Tier 1 Unit: Astryx Universal Error Page Engine [LLR-UI-008]', () => {
  it('should render standard 400 Bad Request page with Lucide SVG', () => {
    const html = renderAstryxErrorHtml({ statusCode: 400 });
    expect(html).toContain('400');
    expect(html).toContain('Invalid Request');
    expect(html).toContain('<svg viewBox="0 0 24 24"');
    expect(html).toContain('robots');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 401 Unauthorized page with sign-in action', () => {
    const html = renderAstryxErrorHtml({ statusCode: 401 });
    expect(html).toContain('401');
    expect(html).toContain('Authentication Required');
    expect(html).toContain('/auth/login');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 403 Access Restricted page without leaking internal role identifiers', () => {
    const html = renderAstryxErrorHtml({
      statusCode: 403,
      appName: 'Invoicing & Billing Service',
      userEmail: 'alice.eng@forge.internal',
    });
    expect(html).toContain('403');
    expect(html).toContain('Access Restricted');
    expect(html).toContain('Invoicing & Billing Service');
    expect(html).toContain('alice.eng@forge.internal');
    expect(html).not.toContain('roles/billing.admin');
    expect(html).not.toContain('roles/super_admin');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 404 Not Found page with vector SVG search icon', () => {
    const html = renderAstryxErrorHtml({ statusCode: 404 });
    expect(html).toContain('404');
    expect(html).toContain('Page Not Found');
    expect(html).toContain('<svg viewBox="0 0 24 24"');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 405 Method Not Allowed page', () => {
    const html = renderAstryxErrorHtml({ statusCode: 405 });
    expect(html).toContain('405');
    expect(html).toContain('Method Not Permitted');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 429 Rate Limited page', () => {
    const html = renderAstryxErrorHtml({ statusCode: 429 });
    expect(html).toContain('429');
    expect(html).toContain('Too Many Requests');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 500 Internal Error page with incident trace correlation', () => {
    const traceId = 'tr-sre-998877';
    const html = renderAstryxErrorHtml({ statusCode: 500, traceId });
    expect(html).toContain('500');
    expect(html).toContain('Internal Server Error');
    expect(html).toContain('Incident Trace:');
    expect(html).toContain('tr-sre-998877');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 502 Bad Gateway and 503 Maintenance pages', () => {
    const html502 = renderAstryxErrorHtml({ statusCode: 502 });
    expect(html502).toContain('502');
    expect(html502).toContain('Service Upstream Unavailable');
    expect(html502).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);

    const html503 = renderAstryxErrorHtml({ statusCode: 503 });
    expect(html503).toContain('503');
    expect(html503).toContain('Service Under Maintenance');
    expect(html503).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render 504 Gateway Timeout page', () => {
    const html504 = renderAstryxErrorHtml({ statusCode: 504 });
    expect(html504).toContain('504');
    expect(html504).toContain('Gateway Timeout');
    expect(html504).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('should render system down page via helper', () => {
    const html = renderAstryxSystemDownPage({ brandName: 'Test Platform' });
    expect(html).toContain('503');
    expect(html).toContain('System Under Maintenance');
    expect(html).toContain('Test Platform');
  });
});

