/**
 * @forge/auth/frontend - Auth View Styles (2026 LTS)
 * Astryx Enterprise Theme Tokens & Clean Glassmorphic Auth Card Elements.
 */

import { getAstryxStyles } from '@forge/ui';

/**
 * getAuthViewStyles
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAuthViewStyles(): string {
  return `
    ${getAstryxStyles()}

    .auth-wrapper {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-lg);
      padding: 2.5rem 2rem;
      box-shadow: 0 10px 35px -5px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--forge-text-main);
      margin-bottom: 0.35rem;
    }

    .auth-subtitle {
      font-size: 0.88rem;
      color: var(--forge-text-muted);
    }

    .auth-form-group {
      margin-bottom: 1.25rem;
    }

    .auth-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--forge-text-muted);
      margin-bottom: 0.45rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .auth-input {
      width: 100%;
      padding: 0.8rem 0.9rem;
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main);
      font-size: 0.92rem;
      font-family: inherit;
      outline: none;
      transition: var(--forge-transition);
      box-sizing: border-box;
    }

    .auth-input:focus {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.15);
    }

    .auth-submit-btn {
      width: 100%;
      padding: 0.85rem;
      background: var(--forge-primary);
      color: var(--forge-bg-root);
      border: none;
      border-radius: var(--forge-radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--forge-transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    .auth-submit-btn:hover {
      opacity: 0.92;
    }

    .auth-alert {
      padding: 0.75rem 0.9rem;
      border-radius: var(--forge-radius-sm);
      font-size: 0.85rem;
      margin-bottom: 1.2rem;
      display: none;
    }

    .auth-alert-error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--forge-text-main);
    }

    .auth-alert-info {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: var(--forge-text-main);
    }

    .password-strength-bar {
      height: 4px;
      width: 100%;
      background: var(--forge-border);
      border-radius: 2px;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .password-strength-fill {
      height: 100%;
      width: 0%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-weak { width: 33%; background: var(--forge-text-muted); }
    .strength-medium { width: 66%; background: var(--forge-accent); }
    .strength-strong { width: 100%; background: var(--forge-primary); }
  `;
}
