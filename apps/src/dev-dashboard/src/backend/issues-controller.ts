/**
 * @forge/dev-dashboard - Sentry-Style Issues & Incident Triage Controller (2026 LTS)
 * High-performance RFC 7807 problem details tracking, deduplication, and triage transitions.
 */

import { platformDb, type IssueReportRecord } from '../db';
import { createLogger } from '@forge/sdk';

const logger = createLogger('issues-controller');

/**
 * IssueFilterParams
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface IssueFilterParams {
  status?: string;
  appId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * IssuesVitalsSummary
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface IssuesVitalsSummary {
  totalIssues: number;
  openCount: number;
  investigatingCount: number;
  resolvedCount: number;
  ignoredCount: number;
  last24hOccurrences: number;
  topImpactedService: string;
}

class IssuesController {
  /**
   * Retrieves paginated, filtered issue incidents from SQLite
   */
  public listIssues(params: IssueFilterParams = {}): { issues: IssueReportRecord[]; total: number; vitals: IssuesVitalsSummary } {
    const rawDb = platformDb.getRawDb();
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 100);
    const offset = Math.max(Number(params.offset) || 0, 0);

    let whereClause = '1=1';
    const queryParams: any[] = [];

    if (params.status && params.status !== 'all') {
      whereClause += ' AND status = ?';
      queryParams.push(params.status.toLowerCase());
    }

    if (params.appId && params.appId !== 'all') {
      whereClause += ' AND app_id = ?';
      queryParams.push(params.appId);
    }

    if (params.search && params.search.trim()) {
      whereClause += ' AND (error_type LIKE ? OR message LIKE ? OR stack_trace LIKE ? OR trace_id LIKE ?)';
      const s = `%${params.search.trim()}%`;
      queryParams.push(s, s, s, s);
    }

    const countRow = rawDb.query(`SELECT COUNT(*) as count FROM issue_reports WHERE ${whereClause}`).get(...queryParams) as { count: number };
    const total = countRow ? countRow.count : 0;

    const issues = rawDb.query(`SELECT * FROM issue_reports WHERE ${whereClause} ORDER BY last_seen DESC LIMIT ? OFFSET ?`).all(...queryParams, limit, offset) as IssueReportRecord[];

    const vitals = this.getIssuesVitals();

    return { issues, total, vitals };
  }

  /**
   * Updates an issue's triage status (open | investigating | resolved | ignored)
   */
  public triageIssue(issueId: string, status: string): { success: boolean; issueId: string; status: string } {
    const validStatuses = ['open', 'investigating', 'resolved', 'ignored'];
    const safeStatus = validStatuses.includes(status.toLowerCase()) ? status.toLowerCase() : 'open';

    const success = platformDb.updateIssueStatus(issueId, safeStatus);
    if (success) {
      logger.info(`Triage state updated for ${issueId} -> ${safeStatus}`);
      platformDb.logAudit('developer', 'issue_triage', issueId, JSON.stringify({ status: safeStatus }), 'success');
    }
    return { success, issueId, status: safeStatus };
  }

  /**
   * Bulk updates all open issues to resolved
   */
  public resolveAllIssues(): { success: boolean; resolvedCount: number } {
    const rawDb = platformDb.getRawDb();
    const res = rawDb.run("UPDATE issue_reports SET status = 'resolved' WHERE status != 'resolved'") as any;
    logger.info(`Bulk resolved ${res.changes} issues`);
    platformDb.logAudit('developer', 'issue_resolve_all', 'issues', JSON.stringify({ resolvedCount: res.changes }), 'success');
    return { success: true, resolvedCount: res.changes };
  }

  /**
   * Deletes a single issue record
   */
  public deleteIssue(issueId: string): { success: boolean } {
    const success = platformDb.deleteIssue(issueId);
    return { success };
  }

  /**
   * Simulates a test RFC 7807 issue for diagnostic verification
   */
  public simulateTestIssue(appId = 'portal', errorType = 'UnhandledRejection'): IssueReportRecord {
    const message = `Simulated diagnostic exception: [${errorType}] Database connection pool timed out during health check.`;
    const stackTrace = `Error: ${message}\n    at DatabasePool.acquire (apps/src/portal/src/db.ts:42:15)\n    at HealthProbe.execute (apps/src/portal/src/server.ts:88:24)\n    at BunHandler.fetch (bun:http:124:18)`;
    const contextJson = JSON.stringify({
      route: '/api/v1/health',
      method: 'GET',
      headers: { 'user-agent': 'Mozilla/5.0 (Diagnostic Probe)', host: 'localhost:3000' },
      environment: 'development',
    });
    const traceId = `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const id = platformDb.recordIssue(appId, errorType, message, stackTrace, contextJson, traceId);
    const rawDb = platformDb.getRawDb();
    const issue = rawDb.query('SELECT * FROM issue_reports WHERE id = ?').get(id) as IssueReportRecord;
    logger.info(`⚡ Ingested simulated diagnostic issue: ${id}`);
    return issue;
  }

  /**
   * Calculates overall incident vitals and 24h frequency
   */
  public getIssuesVitals(): IssuesVitalsSummary {
    const rawDb = platformDb.getRawDb();
    const all = rawDb.query('SELECT status, occurrence_count, app_id, last_seen FROM issue_reports').all() as any[];

    let openCount = 0;
    let investigatingCount = 0;
    let resolvedCount = 0;
    let ignoredCount = 0;
    let last24hOccurrences = 0;
    const nowSec = Math.floor(Date.now() / 1000);
    const dayAgoSec = nowSec - 86400;

    const serviceCounts: Record<string, number> = {};

    for (const item of all) {
      if (item.status === 'open') openCount++;
      else if (item.status === 'investigating') investigatingCount++;
      else if (item.status === 'resolved') resolvedCount++;
      else if (item.status === 'ignored') ignoredCount++;

      if (item.last_seen >= dayAgoSec) {
        last24hOccurrences += item.occurrence_count || 1;
      }

      serviceCounts[item.app_id] = (serviceCounts[item.app_id] || 0) + (item.occurrence_count || 1);
    }

    let topImpactedService = 'None';
    let maxServiceErrors = 0;
    for (const [svc, count] of Object.entries(serviceCounts)) {
      if (count > maxServiceErrors) {
        maxServiceErrors = count;
        topImpactedService = svc;
      }
    }

    return {
      totalIssues: all.length,
      openCount,
      investigatingCount,
      resolvedCount,
      ignoredCount,
      last24hOccurrences,
      topImpactedService,
    };
  }
}

/**
 * issuesController
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export const issuesController = new IssuesController();
