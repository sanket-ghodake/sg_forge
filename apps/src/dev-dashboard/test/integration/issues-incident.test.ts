/**
 * @forge/dev-dashboard - Issues & Incident Triage Integration Test (3A Pattern)
 * Enterprise SRE Standard: Validates RFC 7807 issue tracking, deduplication, and triage transitions.
 */

import { describe, expect, it } from 'bun:test';
import { issuesController } from '../../src/backend/issues-controller';
import { handleApiRequest } from '../../src/backend/api-handlers';
import { platformDb } from '../../src/db';
import { renderIssuesTab } from '../../src/frontend/ui-renderer-issues';
import { getIssuesStyles } from '../../src/frontend/ui-issues-styles';
import { getIssuesDashboardScripts } from '../../src/frontend/ui-issues-scripts';

describe('Tier 2 Integration: Sentry-Style Issue Incident Center', () => {
  it('Arrange, Act, Assert: Ingests, deduplicates, and counts occurrences of RFC 7807 problem details', () => {
    // Arrange
    const appId = 'portal';
    const errType = 'DatabaseConnectionTimeout';
    const msg = 'Connection pool exhausted on query /api/v1/users';

    // Act - First occurrence
    const id1 = platformDb.recordIssue(appId, errType, msg, 'Error at pool.ts:40', '{"route":"/users"}', 'trace-001');
    // Act - Second occurrence (deduplication)
    const id2 = platformDb.recordIssue(appId, errType, msg, 'Error at pool.ts:40', '{"route":"/users"}', 'trace-002');

    // Assert
    expect(id1).toBe(id2);
    const { issues, vitals } = issuesController.listIssues({ appId, status: 'open' });
    const target = issues.find(i => i.id === id1);
    expect(target).toBeDefined();
    expect(target?.occurrence_count).toBeGreaterThanOrEqual(2);
    expect(vitals.totalIssues).toBeGreaterThanOrEqual(1);
    expect(vitals.openCount).toBeGreaterThanOrEqual(1);
  });

  it('Arrange, Act, Assert: Updates triage status transition (open -> investigating -> resolved)', () => {
    // Arrange
    const id = platformDb.recordIssue('auth', 'TokenExpiredError', 'JWT signature expired', undefined, undefined, 'trace-003');

    // Act 1: Transition to investigating
    const res1 = issuesController.triageIssue(id, 'investigating');
    expect(res1.success).toBe(true);
    expect(res1.status).toBe('investigating');

    // Act 2: Transition to resolved
    const res2 = issuesController.triageIssue(id, 'resolved');
    expect(res2.success).toBe(true);
    expect(res2.status).toBe('resolved');

    // Assert
    const { issues } = issuesController.listIssues({ status: 'resolved' });
    expect(issues.some(i => i.id === id)).toBe(true);
  });

  it('Arrange, Act, Assert: Handles /api/issues/triage HTTP endpoint returning standard status: ok and success: true', async () => {
    // Arrange
    const id = platformDb.recordIssue('portal', 'HttpTimeout', 'Endpoint timed out', undefined, undefined, 'trace-004');
    const req = new Request('http://localhost:3099/api/issues/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: id, status: 'investigating' }),
    });

    // Act
    const res = await handleApiRequest(req, new URL(req.url));

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('investigating');
    expect(data.issueId).toBe(id);
  });

  it('Arrange, Act, Assert: Simulates test diagnostic exception', () => {
    // Arrange & Act
    const issue = issuesController.simulateTestIssue('billing', 'WebhookDeliveryFailed');

    // Assert
    expect(issue.app_id).toBe('billing');
    expect(issue.error_type).toBe('WebhookDeliveryFailed');
    expect(issue.status).toBe('open');
    expect(issue.stack_trace).toBeDefined();
  });

  it('Arrange, Act, Assert: Issues HTML, Astryx styles, and client scripts pass syntax integrity', () => {
    // Arrange & Act
    const html = renderIssuesTab();
    const styles = getIssuesStyles();
    const scripts = getIssuesDashboardScripts();

    // Assert HTML
    expect(html).toContain('id="tab-issues"');
    expect(html).toContain('issues-vitals-grid');
    expect(html).toContain('issues-filter-bar');
    expect(html).toContain('issue-detail-modal');

    // Assert Styles
    expect(styles).toContain('var(--forge-accent)');
    expect(styles).toContain('.stack-trace-box');

    // Assert Script Syntax
    let parseErr: Error | null = null;
    try {
      new Function(scripts);
    } catch (err: any) {
      parseErr = err;
    }
    expect(parseErr).toBeNull();
  });
});
