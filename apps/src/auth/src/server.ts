#!/usr/bin/env bun
/**
 * @forge/auth - Central Identity & Auth Service (2026 LTS)
 * Serves on Port 3004 (Ingress /auth via Reverse Proxy)
 * Manages ASVS 5.0 Authentication, GCP-Style IAM, Org Trees & 4-Pillar Observability.
 */

import { createLogger, createSafeHandler, handleBrandAssetRequest } from '@forge/sdk';
import { seedAuthDatabase } from './db/seed';
import { closeAuthDb } from './db/db';
import {
  handleBrowserLog,
  handleDirectory,
  handleGetMySessions,
  handleGetTelemetryLogs,
  handleJwks,
  handleLogin,
  handleLogout,
  handleRefresh,
  handleRevokeOtherSessions,
  handleScopedHierarchy,
  handleSetPassword,
} from './backend/api-handlers';
import {
  handleGetOrgTree,
  handleListEmployees,
  handleGetEmployee,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleRevokeEmployee,
  handleBatchImport,
  handleBulkAction,
  handleExportEmployees,
} from './backend/api-org-handlers';
import { handleGetAuditLogs } from './backend/audit-session-controller';

import { authTelemetry } from './backend/telemetry';
import { applySecurityHeaders } from './backend/security-headers';
import { renderLoginHtml } from './frontend/login-view';
import { renderSetPasswordHtml } from './frontend/set-password-view';
import { renderAstryxErrorHtml } from '@forge/ui';

const logger = createLogger('auth-service');
const PORT = Number(process.env.AUTH_PORT || process.env.PORT || 3004);

/**
 * startAuthServer
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [SR-AUTH-001]
 */
export function startAuthServer(port: number = PORT) {
  // Ensure database is initialized and seeded
  seedAuthDatabase();

  // Pillar 3: Emit Crash-Resilient [SYSTEM_BOOT] marker
  authTelemetry.recordLog('docker', 'INFO', `[SYSTEM_BOOT] Central Auth Service initialized on port :${port}`);
  authTelemetry.recordLog('app', 'INFO', `[SYSTEM_BOOT] Auth service router online with 4-pillar observability`);

  const handler = createSafeHandler('auth-service', async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method.toUpperCase();

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    let response: Response;

    // 1. Pillar 1: Dual-Probe Health Checks (livez + readyz)
    if (path === '/health' || path === '/auth/health') {
      const healthData = authTelemetry.getHealthStatus(port);
      response = Response.json(healthData, {
        status: healthData.status === 'ok' ? 200 : 503,
      });
      return applySecurityHeaders(response);
    }

    // 2. Public JWKS Endpoint (Decentralized Verification for other microservices)
    if (
      (path === '/.well-known/jwks.json' || path === '/auth/.well-known/jwks.json') &&
      method === 'GET'
    ) {
      response = handleJwks();
      return applySecurityHeaders(response);
    }

    // 3. Pillar 2: Browser Telemetry Log Bridge
    if (path === '/api/logs/browser' || path === '/auth/api/logs/browser') {
      if (method === 'POST') response = await handleBrowserLog(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    // 4. REST API Endpoints
    if (path === '/api/v1/auth/login' || path === '/auth/api/v1/auth/login') {
      if (method === 'POST') response = await handleLogin(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/set-password' || path === '/auth/api/v1/auth/set-password') {
      if (method === 'POST') response = await handleSetPassword(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/refresh' || path === '/auth/api/v1/auth/refresh') {
      if (method === 'POST') response = await handleRefresh(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/logout' || path === '/auth/api/v1/auth/logout') {
      if (method === 'POST') response = await handleLogout(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/directory' || path === '/auth/api/v1/auth/directory') {
      if (method === 'GET') response = handleDirectory(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    // ── Organization Tree & Hierarchy Engine ──
    if (path === '/api/v1/auth/org/tree' || path === '/auth/api/v1/auth/org/tree') {
      if (method === 'GET') response = handleGetOrgTree(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    // ── Employee Directory CRUD, Search & Management ──
    if (path === '/api/v1/auth/org/employees' || path === '/auth/api/v1/auth/org/employees') {
      if (method === 'GET') response = handleListEmployees(req);
      else if (method === 'POST') response = await handleCreateEmployee(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/org/employees/update' || path === '/auth/api/v1/auth/org/employees/update') {
      if (method === 'POST' || method === 'PATCH') response = await handleUpdateEmployee(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/org/employees/revoke' || path === '/auth/api/v1/auth/org/employees/revoke') {
      if (method === 'POST') response = await handleRevokeEmployee(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/org/employees/import' || path === '/auth/api/v1/auth/org/employees/import') {
      if (method === 'POST') response = await handleBatchImport(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/org/employees/bulk-action' || path === '/auth/api/v1/auth/org/employees/bulk-action') {
      if (method === 'POST') response = await handleBulkAction(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/org/employees/export' || path === '/auth/api/v1/auth/org/employees/export') {
      if (method === 'GET') response = handleExportEmployees(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (
      path.startsWith('/api/v1/auth/org/employees/') ||
      path.startsWith('/auth/api/v1/auth/org/employees/')
    ) {
      const prefix = path.startsWith('/auth/api/v1/auth/org/employees/')
        ? '/auth/api/v1/auth/org/employees/'
        : '/api/v1/auth/org/employees/';
      const subPath = path.slice(prefix.length);
      const parts = subPath.split('/');
      const empId = parts[0];

      if (parts[1] === 'revoke' && method === 'POST') {
        response = await handleRevokeEmployee(req, empId);
      } else if (method === 'PATCH' || method === 'POST') {
        response = await handleUpdateEmployee(req, empId);
      } else if (method === 'GET') {
        response = handleGetEmployee(req, empId);
      } else {
        response = new Response('Method Not Allowed', { status: 405 });
      }
      return applySecurityHeaders(response);
    }

    if (
      path.startsWith('/api/v1/auth/hierarchy') ||
      path.startsWith('/auth/api/v1/auth/hierarchy')
    ) {
      if (method === 'GET') {
        const prefix = path.startsWith('/auth/api/v1/auth/hierarchy')
          ? '/auth/api/v1/auth/hierarchy'
          : '/api/v1/auth/hierarchy';
        const targetId = path.slice(prefix.length).replace(/^\//, '') || undefined;
        response = await handleScopedHierarchy(req, targetId);
      } else {
        response = new Response('Method Not Allowed', { status: 405 });
      }
      return applySecurityHeaders(response);
    }


    if (path === '/api/v1/auth/sessions/me' || path === '/auth/api/v1/auth/sessions/me') {
      if (method === 'GET') response = await handleGetMySessions(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (
      path === '/api/v1/auth/sessions/revoke-others' ||
      path === '/auth/api/v1/auth/sessions/revoke-others'
    ) {
      if (method === 'POST') response = await handleRevokeOtherSessions(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/v1/auth/audit' || path === '/auth/api/v1/auth/audit') {
      if (method === 'GET') response = handleGetAuditLogs(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    if (path === '/api/logs/telemetry' || path === '/auth/api/logs/telemetry') {
      if (method === 'GET') response = handleGetTelemetryLogs(req);
      else response = new Response('Method Not Allowed', { status: 405 });
      return applySecurityHeaders(response);
    }

    // 5. HTML Frontend Views
    if (path === '/auth/set-password' || path === '/set-password') {
      const email = url.searchParams.get('email') || '';
      response = new Response(renderSetPasswordHtml(email), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
      return applySecurityHeaders(response);
    }

    if (
      path === '/' ||
      path === '/auth' ||
      path === '/auth/' ||
      path === '/login' ||
      path === '/auth/login'
    ) {
      let returnUrl = url.searchParams.get('return_url') || url.searchParams.get('return_to') || '/portal';
      if (returnUrl === '/' || returnUrl === '') returnUrl = '/portal';
      response = new Response(renderLoginHtml(returnUrl), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
      return applySecurityHeaders(response);
    }

    // 404 Fallback
    const acceptHeader = req.headers.get('accept') || '';
    if (acceptHeader.includes('text/html') && !path.startsWith('/api/')) {
      response = new Response(
        renderAstryxErrorHtml({
          statusCode: 404,
          title: 'Page Not Found',
          appName: 'Identity & Auth Gateway',
          message: `The requested path ${path} does not exist on the auth service.`,
          primaryActionText: '&larr; Sign In',
          primaryActionHref: '/auth/login',
          secondaryActionText: 'Platform Hub &rarr;',
          secondaryActionHref: '/',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
      return applySecurityHeaders(response);
    }

    response = new Response(
      JSON.stringify({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Not Found',
        status: 404,
        detail: `The requested path ${path} does not exist on the auth service.`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
    );
    return applySecurityHeaders(response);
  });

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Auth Service...');
    server.stop(true);
    closeAuthDb();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startAuthServer();
  logger.info(`🔒 Central Auth Service running on http://localhost:${PORT}`);
}
