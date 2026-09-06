/**
 * @forge/auth/frontend - Login View (2026 LTS)
 * White-Labeled Astryx Clean Enterprise Login Page with Browser Telemetry Bridge.
 */

import { getAstryxHeaderHtml, getAstryxStyles, getHeadStateScript, escapeHtml, sanitizeLocalUrl } from '@forge/ui';
import { getAuthViewStyles } from './auth-styles';
import { resolveBrandConfig } from './branding';

/**
 * renderLoginHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderLoginHtml(returnUrl: string = '/portal'): string {
  const brand = resolveBrandConfig();
  const safeReturnUrl = sanitizeLocalUrl(returnUrl, '/portal');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - ${brand.name}</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    ${getAuthViewStyles()}
  </style>
</head>
<body>
  ${getAstryxHeaderHtml('AUTH', 'CENTRAL IDENTITY')}

  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header" style="text-align: center;">
        ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${brand.name}" style="height: 48px; max-height: 48px; width: auto; max-width: 180px; object-fit: contain; margin-bottom: 0.85rem; border-radius: 6px;" onerror="this.style.display='none';" />` : ''}
        <h1 class="auth-title">${brand.name}</h1>
        <p class="auth-subtitle">${brand.tagline}</p>
      </div>

      <div id="auth-alert" class="auth-alert"></div>

      <form id="login-form">
        <input type="hidden" id="return-url" value="${escapeHtml(safeReturnUrl)}">

        <div class="auth-form-group">
          <label class="auth-label" for="email">Work Email</label>
          <input type="email" id="email" class="auth-input" placeholder="user@${brand.domain || 'forge.internal'}" required autocomplete="username">
        </div>

        <div class="auth-form-group">
          <label class="auth-label" for="password">Password</label>
          <input type="password" id="password" class="auth-input" placeholder="••••••••••••" required autocomplete="current-password">
        </div>

        <button type="submit" id="submit-btn" class="auth-submit-btn">
          <span>Sign In to Workspace</span> &rarr;
        </button>
      </form>
    </div>
  </div>

  <script>
    function getApiUrl(path) {
      var isProxied = window.location.pathname.startsWith('/auth');
      if (isProxied && !path.startsWith('/auth')) {
        return '/auth' + path;
      }
      return path;
    }

    function reportBrowserLog(level, message, metadata) {
      try {
        fetch(getApiUrl('/api/logs/browser'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: level, message: message, metadata: metadata || {} })
        }).catch(function() {});
      } catch(e) {}
    }

    var isNoise = function(m, s, stk) {
      var str = ((m || '') + ' ' + (s || '') + ' ' + (stk || '')).toLowerCase();
      return (
        str.indexOf("reading 'starttime'") !== -1 ||
        str.indexOf("reportallchanges") !== -1 ||
        str.indexOf("chrome-extension:") !== -1 ||
        str.indexOf("moz-extension:") !== -1 ||
        str.indexOf("safari-extension:") !== -1 ||
        str.indexOf("edge-extension:") !== -1 ||
        str.indexOf("extensions::") !== -1 ||
        (str.indexOf("starttime") !== -1 && (str.indexOf("vm") !== -1 || str.indexOf("<anonymous>") !== -1))
      );
    };

    var prevOnError = window.onerror;
    window.onerror = function(msg, url, line, col, err) {
      if (isNoise(msg, url, err && err.stack)) {
        return true;
      }
      reportBrowserLog('ERROR', 'Unhandled browser error: ' + msg, {
        url: url, line: line, col: col, stack: err ? err.stack : undefined
      });
      if (typeof prevOnError === 'function') {
        return prevOnError.apply(this, arguments);
      }
      return false;
    };

    var form = document.getElementById('login-form');
    var alertBox = document.getElementById('auth-alert');
    var submitBtn = document.getElementById('submit-btn');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var returnUrlInput = document.getElementById('return-url');
    var rawReturnUrl = (returnUrlInput.value || '').trim();
    var returnUrl = (rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//') && rawReturnUrl.indexOf('://') === -1)
      ? (rawReturnUrl === '/' ? '/portal' : rawReturnUrl)
      : '/portal';

    function showAlert(msg, isError) {
      if (isError === undefined) isError = true;
      alertBox.textContent = msg;
      alertBox.className = 'auth-alert ' + (isError ? 'auth-alert-error' : 'auth-alert-info');
      alertBox.style.display = 'block';
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      alertBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verifying credentials...</span>';

      var emailVal = emailInput.value.trim();
      var passwordVal = passwordInput.value;

      try {
        var targetEndpoint = getApiUrl('/api/v1/auth/login');
        var res = await fetch(targetEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailVal,
            password: passwordVal
          })
        });

        var data = await res.json();

        if (!res.ok) {
          showAlert(data.detail || data.title || 'Login failed. Please verify credentials.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Sign In to Workspace</span> &rarr;';
          return;
        }

        // Intercept first-time login
        if (data.status === 'MUST_CHANGE_PASSWORD') {
          sessionStorage.setItem('forge_reset_token', data.tempToken);
          sessionStorage.setItem('forge_reset_email', data.email);
          sessionStorage.setItem('forge_return_url', returnUrl);
          window.location.href = getApiUrl('/set-password?email=' + encodeURIComponent(data.email) + '&return_url=' + encodeURIComponent(returnUrl));
          return;
        }

        if (data.status === 'SUCCESS') {
          showAlert('Authentication successful. Redirecting...', false);
          setTimeout(function() {
            window.location.href = returnUrl;
          }, 300);
        }
      } catch (err) {
        reportBrowserLog('ERROR', 'Login network request failed', { error: String(err) });
        showAlert('Network or connection error. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Workspace</span> &rarr;';
      }
    });
  </script>
</body>
</html>`;
}
