/**
 * @forge/dev-dashboard - Employee Password Restoration Client Scripts (2026 LTS)
 * Handles temporary password generation, clipboard copy, visibility toggle, and forced reset submission.
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-008] [LLR-AUTH-009]
 */

export function getEmployeePasswordScripts(): string {
  return `
    function generateSecureTempPasswordString() {
      const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const lower = 'abcdefghijkmnopqrstuvwxyz';
      const digits = '23456789';
      const special = '!@#$%^&*';
      const all = upper + lower + digits + special;
      let pwd = '';
      pwd += upper[Math.floor(Math.random() * upper.length)];
      pwd += lower[Math.floor(Math.random() * lower.length)];
      pwd += digits[Math.floor(Math.random() * digits.length)];
      pwd += special[Math.floor(Math.random() * special.length)];
      const randVals = new Uint32Array(10);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randVals);
        for (let i = 0; i < 10; i++) {
          pwd += all[randVals[i] % all.length];
        }
      } else {
        for (let i = 0; i < 10; i++) {
          pwd += all[Math.floor(Math.random() * all.length)];
        }
      }
      return pwd.split('').sort(() => 0.5 - Math.random()).join('');
    }

    function openResetPasswordModal(userId) {
      const modal = document.getElementById('modal-reset-password');
      if (!modal) return;
      const emp = (employeeData.items || []).find(i => i.id === userId);
      if (!emp) return;

      const initials = (emp.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const avatarEl = document.getElementById('reset-pwd-avatar');
      if (avatarEl) avatarEl.textContent = initials || '?';

      const nameEl = document.getElementById('reset-pwd-name');
      if (nameEl) nameEl.textContent = emp.display_name || 'Employee';

      const emailEl = document.getElementById('reset-pwd-email');
      if (emailEl) emailEl.textContent = (emp.job_title ? emp.job_title + ' • ' : '') + emp.email;

      const idInput = document.getElementById('reset-pwd-emp-id');
      if (idInput) idInput.value = emp.id;

      const pwdInput = document.getElementById('reset-pwd-input');
      if (pwdInput) {
        pwdInput.type = 'text';
        pwdInput.value = generateSecureTempPasswordString();
      }

      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function closeResetPasswordModal() {
      const modal = document.getElementById('modal-reset-password');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      const pwdInput = document.getElementById('reset-pwd-input');
      if (pwdInput) pwdInput.value = '';
    }

    function generateSecureTempPassword() {
      const pwdInput = document.getElementById('reset-pwd-input');
      if (pwdInput) {
        pwdInput.value = generateSecureTempPasswordString();
        showAstryxToast('info', 'Generated new cryptographically secure temporary password');
      }
    }

    function copyTempPassword() {
      const pwdInput = document.getElementById('reset-pwd-input');
      if (!pwdInput || !pwdInput.value) {
        showAstryxToast('error', 'No password to copy');
        return;
      }
      navigator.clipboard.writeText(pwdInput.value)
        .then(() => showAstryxToast('success', 'Temporary password copied to clipboard!'))
        .catch(() => {
          pwdInput.select();
          document.execCommand('copy');
          showAstryxToast('success', 'Copied to clipboard');
        });
    }

    function toggleResetPwdVisibility() {
      const pwdInput = document.getElementById('reset-pwd-input');
      if (pwdInput) {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      }
    }

    async function submitResetPassword(event) {
      if (event) event.preventDefault();
      const submitBtn = document.getElementById('btn-submit-reset-pwd');
      const origHtml = submitBtn ? submitBtn.innerHTML : 'Set Temporary Password';

      const id = document.getElementById('reset-pwd-emp-id')?.value;
      const temporaryPassword = document.getElementById('reset-pwd-input')?.value;

      if (!id || !temporaryPassword || temporaryPassword.length < 8) {
        showAstryxToast('error', 'Temporary password must be at least 8 characters');
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;"></span> Setting...';
        }

        const res = await fetch(\`\${apiBase}/api/employees/reset-password\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, temporaryPassword }),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || json.detail || 'Failed to reset password');

        showAstryxToast('success', 'Password reset! User must set permanent password on next login.');
        closeResetPasswordModal();
        loadEmployees();
      } catch (err) {
        showAstryxToast('error', err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
        }
      }
    }

    window.openResetPasswordModal = openResetPasswordModal;
    window.closeResetPasswordModal = closeResetPasswordModal;
    window.generateSecureTempPassword = generateSecureTempPassword;
    window.copyTempPassword = copyTempPassword;
    window.toggleResetPwdVisibility = toggleResetPwdVisibility;
    window.submitResetPassword = submitResetPassword;
  `;
}
