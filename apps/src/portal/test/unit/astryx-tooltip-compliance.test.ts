/**
 * @forge/portal - Tier 1 Unit Test: Astryx Tooltip & Viewport-Safe Compliance
 * Checks that ZERO native browser OS tooltips (title="...") exist in rendered HTML,
 * and that all floating tooltips strictly use Astryx custom standard (data-astryx-tooltip="...").
 */

import { describe, expect, it } from 'bun:test';
import { renderPortalHtml } from '../../src/frontend/ui-renderer';
import { renderCanvasView } from '../../src/frontend/ui-renderer-canvas';
import { renderAppsView } from '../../src/frontend/ui-renderer-apps';
import { renderInboxView } from '../../src/frontend/ui-renderer-inbox';
import { renderAdminAuditView } from '../../src/frontend/ui-admin-audit';

describe('Tier 1 Unit: Astryx Design Token & Custom Tooltip Compliance', () => {
  it('renderPortalHtml has ZERO native title attributes for tooltip descriptions', () => {
    const html = renderPortalHtml({
      id: 'usr_audit',
      email: 'audit@forge.internal',
      displayName: 'Auditor',
      roles: ['roles/super_admin'],
      isAdmin: true,
    });

    // Native browser title attributes (e.g. title="something") are strictly forbidden
    // Check that any title=" does not appear on interactive button / span elements
    const buttonTitleMatches = html.match(/<(button|span|a|div|label)[^>]*\stitle="[^"]*"/gi) || [];
    expect(buttonTitleMatches).toHaveLength(0);

    // Verify presence of Astryx tooltips
    expect(html).toContain('data-astryx-tooltip="Open Quick Finder (⌘K)"');
    expect(html).toContain('data-astryx-tooltip="Account & Preferences (Auditor)"');
  });

  it('renderCanvasView uses data-astryx-tooltip on all hero and zoom controls', () => {
    const html = renderCanvasView();

    expect(html).toContain('data-astryx-tooltip="Fit Visible Map to Window"');
    expect(html).toContain('data-astryx-tooltip="Focus Executive Leadership"');
    expect(html).toContain('data-astryx-tooltip="Focus My Team Hierarchy"');
    expect(html).toContain('data-astryx-tooltip="Zoom Out"');
    expect(html).toContain('data-astryx-tooltip="Zoom In"');
    expect(html).toContain('data-astryx-tooltip="Reset Viewport"');
    expect(html).toContain('data-astryx-tooltip="Organization Minimap (Drag or Click to Pan)"');

    const matches = html.match(/<(button|span|a|div)[^>]*\stitle="[^"]*"/gi) || [];
    expect(matches).toHaveLength(0);
  });

  it('renderAppsView uses data-astryx-tooltip for view toggles and app pins', () => {
    const html = renderAppsView(['roles/employee']);

    expect(html).toContain('data-astryx-tooltip="Grid View"');
    expect(html).toContain('data-astryx-tooltip="Compact List View"');

    const matches = html.match(/<(button|span|a|div)[^>]*\stitle="[^"]*"/gi) || [];
    expect(matches).toHaveLength(0);
  });

  it('renderInboxView uses data-astryx-tooltip for dismiss buttons and unread filter', () => {
    const html = renderInboxView({
      id: 'usr_emp',
      email: 'emp@forge.internal',
      displayName: 'Employee',
      roles: ['roles/employee'],
      isAdmin: false,
    });

    expect(html).toContain('data-astryx-tooltip="Show only unread items"');

    const matches = html.match(/<(button|span|a|div|label)[^>]*\stitle="[^"]*"/gi) || [];
    expect(matches).toHaveLength(0);
  });

  it('renderAdminAuditView provides dynamic loading state without static mock logs', () => {
    const html = renderAdminAuditView();

    expect(html).toContain('Loading security audit stream from central identity...');
    expect(html).toContain('id="audit-events-count">--<');
    expect(html).not.toContain('aud_1');
    expect(html).not.toContain('trc_9f8e7d6c5b');
  });
});
