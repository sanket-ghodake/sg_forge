/**
 * @forge/auth/frontend - Set Password View (2026 LTS)
 * Mandatory First-Login Password Setup with Live Entropy Validation & Browser Telemetry Bridge.
 */

import { getAstryxHeaderHtml, getAstryxStyles, getHeadStateScript, escapeHtml } from '@forge/ui';
import { getAuthViewStyles } from './auth-styles';
import { resolveBrandConfig } from './branding';

/**
 * renderSetPasswordHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderSetPasswordHtml(emailParam: string = ''): string {
  const brand = resolveBrandConfig();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Set Secure Password - ${brand.name}</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    ${getAuthViewStyles()}

    .req-item {
      font-size: 0.78rem;
      color: var(--forge-text-muted);
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .req-item.valid {
      color: var(--forge-primary);
      font-weight: 500;
    }
  </style>
</head>
<body>
  ${getAstryxHeaderHtml('AUTH', 'SECURITY SETUP')}

  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Set Your Password</h1>
        <p class="auth-subtitle">
          First-time access detected for <strong id="user-email-display" style="color: var(--forge-text-main);">${escapeHtml(emailParam || 'your account')}</strong>. Please configure a permanent password.
        </p>
      </div>

      <div id="auth-alert" class="auth-alert"></div>

      <form id="set-password-form">
        <div class="auth-form-group">
          <label class="auth-label" for="new-password">New Password</label>
          <input type="password" id="new-password" class="auth-input" placeholder="Enter new password" required autocomplete="new-password">
          <div class="password-strength-bar">
            <div id="strength-fill" class="password-strength-fill"></div>
          </div>
        </div>

        <div class="auth-form-group" style="margin-bottom: 1.5rem;">
          <label class="auth-label" for="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" class="auth-input" placeholder="Repeat new password" required autocomplete="new-password">
        </div>

        <div style="background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.85rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--forge-text-main); margin-bottom: 0.4rem;">Security Requirements:</div>
          <div id="req-len" class="req-item"><span>&bull;</span> At least 8 characters</div>
          <div id="req-num" class="req-item"><span>&bull;</span> Contains a number or special symbol</div>
          <div id="req-match" class="req-item"><span>&bull;</span> Passwords match</div>
        </div>

        <button type="submit" id="submit-btn" class="auth-submit-btn">
          <span>Save Password & Continue</span> &rarr;
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

    var form = document.getElementById('set-password-form');
    var alertBox = document.getElementById('auth-alert');
    var submitBtn = document.getElementById('submit-btn');
    var newPwdInput = document.getElementById('new-password');
    var confirmPwdInput = document.getElementById('confirm-password');
    var strengthFill = document.getElementById('strength-fill');

    var reqLen = document.getElementById('req-len');
    var reqNum = document.getElementById('req-num');
    var reqMatch = document.getElementById('req-match');

    var tempToken = sessionStorage.getItem('forge_reset_token');
    var resetEmail = sessionStorage.getItem('forge_reset_email');
    var urlParams = new URLSearchParams(window.location.search);
    var returnUrl = urlParams.get('return_url') || sessionStorage.getItem('forge_return_url') || '/portal';
    if (!returnUrl || returnUrl === '/') returnUrl = '/portal';

    if (resetEmail) {
      document.getElementById('user-email-display').textContent = resetEmail;
    }

    if (!tempToken) {
      showAlert('No active password reset session found. Redirecting to login...');
      setTimeout(function() { window.location.href = getApiUrl('/login'); }, 1500);
    }

    function showAlert(msg, isError) {
      if (isError === undefined) isError = true;
      alertBox.textContent = msg;
      alertBox.className = 'auth-alert ' + (isError ? 'auth-alert-error' : 'auth-alert-info');
      alertBox.style.display = 'block';
    }

    function validateRequirements() {
      var pwd = newPwdInput.value;
      var conf = confirmPwdInput.value;

      var hasLen = pwd.length >= 8;
      var hasNum = /[0-9!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(pwd);
      var isMatch = pwd.length > 0 && pwd === conf;

      reqLen.className = 'req-item ' + (hasLen ? 'valid' : '');
      reqLen.querySelector('span').textContent = hasLen ? '✓' : '•';

      reqNum.className = 'req-item ' + (hasNum ? 'valid' : '');
      reqNum.querySelector('span').textContent = hasNum ? '✓' : '•';

      reqMatch.className = 'req-item ' + (isMatch ? 'valid' : '');
      reqMatch.querySelector('span').textContent = isMatch ? '✓' : '•';

      if (pwd.length === 0) {
        strengthFill.className = 'password-strength-fill';
      } else if (hasLen && hasNum && pwd.length >= 12) {
        strengthFill.className = 'password-strength-fill strength-strong';
      } else if (hasLen && (hasNum || pwd.length >= 10)) {
        strengthFill.className = 'password-strength-fill strength-medium';
      } else {
        strengthFill.className = 'password-strength-fill strength-weak';
      }

      return hasLen && hasNum && isMatch;
    }

    newPwdInput.addEventListener('input', validateRequirements);
    confirmPwdInput.addEventListener('input', validateRequirements);

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      alertBox.style.display = 'none';

      if (!validateRequirements()) {
        showAlert('Please satisfy all password security requirements.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Updating password & establishing session...</span>';

      try {
        var targetEndpoint = getApiUrl('/api/v1/auth/set-password');
        var res = await fetch(targetEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tempToken: tempToken,
            newPassword: newPwdInput.value
          })
        });

        var data = await res.json();

        if (!res.ok) {
          showAlert(data.detail || data.title || 'Failed to update password.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Save Password & Continue</span> &rarr;';
          return;
        }

        sessionStorage.removeItem('forge_reset_token');
        sessionStorage.removeItem('forge_reset_email');
        sessionStorage.removeItem('forge_return_url');

        if (data.accessToken) {
          document.cookie = 'forge_session=' + encodeURIComponent(data.accessToken) + '; path=/; max-age=604800; SameSite=Lax';
        }

        showAlert('Password successfully configured! Redirecting to workspace...', false);
        setTimeout(function() {
          window.location.href = returnUrl;
        }, 300);
      } catch (err) {
        reportBrowserLog('ERROR', 'Set password request failed', { error: String(err) });
        showAlert('Network or connection error.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Save Password & Continue</span> &rarr;';
      }
    });
  </script>
</body>
</html>`;
}
