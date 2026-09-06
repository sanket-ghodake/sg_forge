/**
 * @forge/dev-dashboard - Astryx Single-Session Login UI Renderer (2026 LTS)
 * Renders glassmorphic authentication view for master password verification.
 * Astryx Design System Baseline (v2.0.0 LTS)
 */

import { loadBrandConfig } from '@forge/sdk';
import { getHeadStateScript } from '@forge/ui';
import { getDashboardStyles } from './ui-styles';

/**
 * renderDevLoginHtml
 * @requirements [HLR-SDK-303] [LLR-SUB-004]
 */
export function renderDevLoginHtml(errorMessage: string = ''): string {
  const brand = loadBrandConfig();

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - Developer Dashboard Sign In</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getDashboardStyles()}

    .login-viewport {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
      background-color: var(--forge-bg-root);
      background-image: 
        radial-gradient(circle at 50% 12%, var(--forge-primary-glow, rgba(36, 180, 126, 0.14)) 0%, transparent 55%),
        radial-gradient(var(--forge-border) 1px, transparent 1px);
      background-size: 100% 100%, 24px 24px;
      padding: 1.5rem;
      box-sizing: border-box;
      font-family: var(--forge-font-sans, system-ui, -apple-system, sans-serif);
      color: var(--forge-text-main);
      position: relative;
      overflow: hidden;
    }

    .login-viewport::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: var(--forge-primary-glow, rgba(36, 180, 126, 0.08));
      filter: blur(100px);
      border-radius: 50%;
      top: -150px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: var(--forge-bg-surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-lg, 18px);
      box-shadow: var(--forge-shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.6)), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
      z-index: 1;
      animation: loginFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes loginFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .login-brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.4rem;
    }

    .login-logo-frame {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 22px;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-md, 12px);
      box-shadow: var(--forge-shadow-card, 0 4px 12px rgba(0, 0, 0, 0.2));
      margin-bottom: 0.5rem;
    }

    .login-logo-img {
      height: 40px;
      width: auto;
      max-width: 180px;
      object-fit: contain;
      transition: transform 0.2s ease;
    }

    .login-logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--forge-radius-md, 10px);
      background: var(--forge-primary-gradient);
      color: var(--forge-text-inverse, var(--forge-bg-root));
      font-weight: 800;
      font-size: 1.2rem;
      box-shadow: 0 6px 16px var(--forge-primary-glow, rgba(36, 180, 126, 0.4));
    }

    .login-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
      color: var(--forge-text-main);
      letter-spacing: -0.03em;
    }

    .login-subtitle {
      font-size: 0.8rem;
      color: var(--forge-text-muted);
      margin: 0;
      line-height: 1.3;
    }

    .login-session-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: 9999px;
      padding: 0.3rem 0.85rem;
      font-size: 0.72rem;
      color: var(--forge-primary);
      font-weight: 500;
      margin-top: 0.35rem;
    }

    .login-pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--forge-primary);
      box-shadow: 0 0 8px var(--forge-primary);
      animation: pulseGlow 2s infinite ease-in-out;
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      margin-top: 0.25rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .input-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--forge-text-main);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pwd-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .pwd-input-icon {
      position: absolute;
      left: 0.85rem;
      width: 15px;
      height: 15px;
      color: var(--forge-text-muted);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pwd-input {
      width: 100%;
      padding: 0.7rem 2.6rem 0.7rem 2.4rem;
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm, 10px);
      color: var(--forge-text-main);
      font-size: 0.88rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      outline: none;
    }

    .pwd-input::placeholder {
      color: var(--forge-text-muted);
      opacity: 0.7;
    }

    .pwd-input:focus {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 3px var(--forge-focus-ring, rgba(36, 180, 126, 0.25)), 0 0 12px var(--forge-primary-glow, rgba(36, 180, 126, 0.15));
    }

    .pwd-toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--forge-text-muted);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .pwd-toggle-btn:hover {
      color: var(--forge-text-main);
    }

    .login-submit-btn {
      width: 100%;
      height: 42px;
      padding: 0 1rem;
      background: var(--forge-primary-gradient);
      color: var(--forge-text-inverse, var(--forge-bg-root));
      border: none;
      border-radius: var(--forge-radius-sm, 10px);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px var(--forge-primary-glow, rgba(36, 180, 126, 0.35));
    }

    .login-submit-btn:hover {
      filter: brightness(1.08);
      box-shadow: 0 6px 18px var(--forge-primary-glow, rgba(36, 180, 126, 0.45));
    }

    .login-submit-btn:active {
      filter: brightness(0.96);
    }

    .login-error-box {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-accent);
      color: var(--forge-accent);
      padding: 0.65rem 0.85rem;
      border-radius: var(--forge-radius-sm, 10px);
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      animation: alertPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes alertPop {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-footer-hint {
      text-align: center;
      font-size: 0.73rem;
      color: var(--forge-text-muted);
      line-height: 1.4;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
  </style>
</head>
<body>
  <!-- Chrome/Edge Credential Autofill De-Coupler Trap -->
  <div style="position:absolute; top:-9999px; left:-9999px; width:1px; height:1px; opacity:0; pointer-events:none;" aria-hidden="true">
    <input type="text" name="chrome_autofill_user_trap" tabindex="-1" autocomplete="username">
    <input type="password" name="chrome_autofill_pwd_trap" tabindex="-1" autocomplete="current-password">
  </div>

  <main class="login-viewport">
    <div class="login-card">
      <div class="login-brand-header">
        ${
          brand.logoUrl
            ? `<div class="login-logo-frame">
                 <img src="${brand.logoUrl}" alt="${brand.name}" class="login-logo-img" onerror="this.style.display='none'; document.getElementById('fb-logo').style.display='inline-flex';" />
                 <div id="fb-logo" class="login-logo-badge" style="display:none;">${brand.short}</div>
               </div>`
            : `<div class="login-logo-badge">${brand.short}</div>`
        }
        <h1 class="login-title">${brand.name}</h1>
        <p class="login-subtitle">Developer Dashboard & Live Telemetry Gateway</p>
        <div class="login-session-pill">
          <span class="login-pulse-dot"></span>
          <span>Single-Operator Session Enforced</span>
        </div>
      </div>

      ${
        errorMessage
          ? `<div class="login-error-box" id="server-error-box">
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 2;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>${errorMessage}</span>
             </div>`
          : ''
      }

      <div id="client-error-box" class="login-error-box" style="display: none;">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 2;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span id="client-error-text"></span>
      </div>

      <form class="login-form" id="dev-login-form" onsubmit="handleDevLogin(event)">
        <div class="input-group">
          <label class="input-label" for="dev-password-input">
            <span>Master Dashboard Password</span>
            <span style="font-size: 0.7rem; color: var(--forge-text-muted); font-weight: normal;">Press Enter ↵</span>
          </label>
          <div class="pwd-input-wrap">
            <span class="pwd-input-icon">
              <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input 
              type="password" 
              class="pwd-input" 
              id="dev-password-input" 
              name="password" 
              placeholder="Enter master password..." 
              autocomplete="current-password"
              required 
              autofocus
            />
            <button type="button" class="pwd-toggle-btn" id="toggle-pwd-btn" onclick="togglePasswordVisibility()" aria-label="Toggle password visibility">
              <svg id="eye-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="login-submit-btn" id="login-btn">
          <span>Sign In to Dev Dashboard</span>
          <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </form>

      <div class="login-footer-hint">
        <span>🔒 Logging in starts a new exclusive session and supersedes prior logins.</span>
      </div>
    </div>
  </main>

  <script>
    function togglePasswordVisibility() {
      var input = document.getElementById('dev-password-input');
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = 'password';
      }
    }

    async function handleDevLogin(e) {
      e.preventDefault();
      var input = document.getElementById('dev-password-input');
      var btn = document.getElementById('login-btn');
      var errBox = document.getElementById('client-error-box');
      var errText = document.getElementById('client-error-text');
      var srvBox = document.getElementById('server-error-box');

      if (srvBox) srvBox.style.display = 'none';
      errBox.style.display = 'none';

      var pwd = input ? input.value.trim() : '';
      if (!pwd) return;

      btn.disabled = true;
      btn.innerHTML = '<span>Verifying...</span>';

      try {
        var apiBase = window.location.pathname.startsWith('/devcenter') ? '/devcenter' : '';
        var res = await fetch(apiBase + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });

        var data = await res.json().catch(function() { return {}; });

        if (res.ok && data.status === 'ok') {
          if (data.sessionToken) {
            try { sessionStorage.setItem('forge:devcenter:token', data.sessionToken); } catch(err) {}
          }
          window.location.reload();
        } else {
          errText.textContent = data.error || 'Invalid master password. Please try again.';
          errBox.style.display = 'flex';
          btn.disabled = false;
          btn.innerHTML = '<span>Sign In to Dev Dashboard</span><svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
          if (input) {
            input.value = '';
            input.focus();
          }
        }
      } catch (err) {
        errText.textContent = 'Connection error. Please ensure the server is reachable.';
        errBox.style.display = 'flex';
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In to Dev Dashboard</span><svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      }
    }
  </script>
</body>
</html>`;
}
