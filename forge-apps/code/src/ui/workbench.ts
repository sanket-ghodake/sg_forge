/**
 * @forge-apps/code - VS Code Workbench & Active Session Shell (2026 LTS)
 * High-Performance Fullscreen Shell with Heartbeat & Takeover Interceptor
 */

import { loadBrandConfig } from '../lib/sdk';
import { getAstryxStyles, getAstryxToastScript, getHeadStateScript } from '../lib/ui';
import type { AuthUser } from '../lib/types';
import type { ProjectRecord } from '../db/schema';

/**
 * renderWorkbenchHtml
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function renderWorkbenchHtml(
  user: AuthUser,
  project: ProjectRecord,
  vsCodeUrl: string
): string {
  const brand = loadBrandConfig();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - VS Code [${brand.name}]</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--forge-bg-root);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #topBar {
      height: 40px;
      background: var(--forge-bg-surface);
      border-bottom: 1px solid var(--forge-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      color: var(--forge-text-muted);
      font-size: 0.82rem;
      user-select: none;
      z-index: 100;
    }
    #topBar a, #topBar button {
      background: transparent;
      border: 1px solid var(--forge-border);
      color: var(--forge-text-main);
      padding: 0.25rem 0.65rem;
      border-radius: var(--forge-radius);
      cursor: pointer;
      font-size: 0.78rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    #topBar button:hover, #topBar a:hover {
      background: var(--forge-bg-card);
      border-color: var(--forge-primary);
    }
    #btnLeave {
      border-color: var(--forge-accent) !important;
      color: var(--forge-accent) !important;
    }
    #btnLeave:hover {
      background: var(--forge-accent-bg, rgba(239, 68, 68, 0.15)) !important;
    }
    #vscodeFrame {
      width: 100%;
      height: calc(100% - 40px);
      border: none;
      display: block;
    }
    #takeoverModal, #leaveModal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(6px);
      z-index: 99999;
      align-items: center;
      justify-content: center;
    }
    .takeover-box {
      background: var(--forge-bg-surface);
      border: 2px solid var(--forge-warning);
      border-radius: var(--forge-radius);
      padding: 2rem;
      max-width: 460px;
      text-align: center;
      color: var(--forge-text-main);
      box-shadow: 0 15px 50px rgba(0,0,0,0.8);
    }
    .countdown-circle {
      font-size: 3rem;
      font-weight: 700;
      color: var(--forge-warning);
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <div id="topBar">
    <div style="display: flex; align-items: center; gap: 0.85rem;">
      <a href="/apps/code">&larr; Repositories</a>
      <span style="font-weight: 600; color: var(--forge-text-main);">📦 ${project.name}</span>
      <span style="color: var(--forge-border);">|</span>
      <span style="color: var(--forge-text-muted);">Branch: <strong style="color: var(--forge-primary);">${project.default_branch}</strong></span>
    </div>

    <div style="display: flex; align-items: center; gap: 1rem;">
      <span style="color: var(--forge-warning); font-size: 0.75rem;">⚠️ Ephemeral: Changes discarded on exit</span>
      <button id="btnLeave" onclick="openLeaveModal()">🚪 Exit & Discard</button>
    </div>
  </div>

  <iframe id="vscodeFrame" src="${vsCodeUrl}" allow="clipboard-read; clipboard-write"></iframe>

  <!-- 60s Takeover Alert Modal -->
  <div id="takeoverModal">
    <div class="takeover-box">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
      <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--forge-text-main);">Incoming Takeover Request</h2>
      <p style="font-size: 0.88rem; color: var(--forge-text-muted);" id="takeoverMsg">
        Another developer wants to connect to this repository.
      </p>
      <div class="countdown-circle" id="countdownSec">60</div>
      <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin-bottom: 1.5rem;">
        If you don't respond, this session will disconnect and all uncommitted changes will be discarded.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button class="astryx-btn btn-danger" onclick="respondTakeover('DENY')">
          🚫 Deny (Keep Working)
        </button>
        <button class="astryx-btn btn-success" onclick="respondTakeover('ALLOW')">
          ✅ Hand Over Now
        </button>
      </div>
    </div>
  </div>

  <!-- Astryx Leave Confirmation Modal -->
  <div id="leaveModal">
    <div class="takeover-box" style="border-color: var(--forge-accent);">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🚪</div>
      <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--forge-text-main);">Exit Session & Discard Changes?</h2>
      <p style="font-size: 0.88rem; color: var(--forge-text-muted); margin-bottom: 1.5rem;">
        All uncommitted edits, temporary builds, and scratch files will be permanently erased. The server repository will return to its pristine commit state.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button class="astryx-btn btn-outline" onclick="closeLeaveModal()">
          Cancel
        </button>
        <button class="astryx-btn btn-danger" onclick="confirmLeave()">
          Discard & Exit
        </button>
      </div>
    </div>
  </div>

  <script>
    ${getAstryxToastScript()}
    const PROJECT_ID = '${project.id}';
    let countdownInterval = null;
    let secondsLeft = 60;

    // 1. Heartbeat every 5s
    setInterval(async () => {
      try {
        const res = await fetch('/apps/code/api/session/heartbeat?projectId=' + PROJECT_ID);
        const data = await res.json();

        if (data.kicked) {
          window.astryxToast.error('Session disconnected: ' + (data.reason || 'Takeover expired.'));
          setTimeout(() => { window.location.href = '/apps/code'; }, 1200);
          return;
        }

        if (data.takeoverPending) {
          showTakeover(data.requesterEmail, data.secondsLeft);
        } else {
          hideTakeover();
        }
      } catch (err) {
        // network glitch
      }
    }, 5000);

    function showTakeover(email, sec) {
      document.getElementById('takeoverMsg').textContent = (email || 'Another developer') + ' is requesting to connect to this project.';
      document.getElementById('takeoverModal').style.display = 'flex';
      secondsLeft = sec || 60;
      document.getElementById('countdownSec').textContent = secondsLeft;

      if (!countdownInterval) {
        countdownInterval = setInterval(() => {
          secondsLeft--;
          document.getElementById('countdownSec').textContent = Math.max(0, secondsLeft);
          if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
        }, 1000);
      }
    }

    function hideTakeover() {
      document.getElementById('takeoverModal').style.display = 'none';
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }

    async function respondTakeover(decision) {
      hideTakeover();
      const res = await fetch('/apps/code/api/session/respond-takeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: PROJECT_ID, decision })
      });
      const data = await res.json();
      if (decision === 'ALLOW') {
        window.location.href = '/apps/code';
      }
    }

    function openLeaveModal() {
      document.getElementById('leaveModal').style.display = 'flex';
    }

    function closeLeaveModal() {
      document.getElementById('leaveModal').style.display = 'none';
    }

    async function confirmLeave() {
      closeLeaveModal();
      await fetch('/apps/code/api/session/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: PROJECT_ID })
      });
      window.location.href = '/apps/code';
    }

    // Disconnect beacon when closing tab
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/apps/code/api/session/leave', JSON.stringify({ projectId: PROJECT_ID }));
    });

    // 📡 Outbound Network Telemetry Interceptor & Resource Observer
    (function initNetworkAuditor() {
      const pendingEvents = [];
      function flushEvents() {
        if (pendingEvents.length === 0) return;
        const batch = pendingEvents.splice(0, 50);
        const payload = JSON.stringify({ userId: '${user.id}', events: batch });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/apps/code/api/telemetry/network', payload);
        } else {
          fetch('/apps/code/api/telemetry/network', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      }

      if (window.PerformanceObserver) {
        try {
          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'resource' && (entry.name.startsWith('http://') || entry.name.startsWith('https://'))) {
                pendingEvents.push({
                  url: entry.name,
                  method: 'GET',
                  durationMs: Math.round(entry.duration),
                  initiatorType: entry.initiatorType,
                  metadata: { transferSize: entry.transferSize }
                });
              }
            }
            if (pendingEvents.length >= 10) flushEvents();
          });
          obs.observe({ entryTypes: ['resource'] });
        } catch (e) {}
      }

      setInterval(flushEvents, 5000);
      window.addEventListener('beforeunload', flushEvents);
    })();
  </script>
</body>
</html>`;
}
