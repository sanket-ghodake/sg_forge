/**
 * @forge/portal - Astryx Modal & Dialog Styles (2026 LTS)
 * 100% Theme Parity, Custom Glassmorphic Modals, Form Elements, and Premium Textareas.
 */

/**
 * getModalCustomStyles
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getModalCustomStyles(): string {
  return `
    /* ── Modals & Backdrop Dialogs (Astryx Standard) ── */
    .astryx-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 2500;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .astryx-modal-backdrop.active,
    .astryx-modal-backdrop.open {
      display: flex !important;
      opacity: 1 !important;
      animation: modalBackdropFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalBackdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .astryx-modal {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.07);
      width: 100%;
      max-width: min(560px, 92vw);
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.96) translateY(8px);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    [data-theme="light"] .astryx-modal {
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.16), 0 0 0 1px var(--forge-border);
    }
    [data-theme="light"] .astryx-modal-backdrop {
      background: rgba(15, 23, 42, 0.45);
    }
    [data-theme="light"] .astryx-modal-footer {
      background: var(--forge-bg-elevated);
      border-top-color: var(--forge-border);
    }

    .astryx-modal-backdrop.active .astryx-modal,
    .astryx-modal-backdrop.open .astryx-modal {
      transform: scale(1) translateY(0) !important;
    }

    .astryx-modal-header {
      padding: 1rem 1.35rem;
      border-bottom: 1px solid var(--forge-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--forge-bg-surface);
      flex-shrink: 0;
    }
    .astryx-modal-header h3 {
      font-size: 1.02rem;
      font-weight: 700;
      color: var(--forge-text-main);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .astryx-modal-close {
      background: transparent;
      border: 1px solid transparent;
      color: var(--forge-text-muted);
      cursor: pointer;
      padding: 0.3rem;
      width: 28px;
      height: 28px;
      border-radius: var(--forge-radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: var(--forge-transition);
      outline: none;
      line-height: 1;
    }
    .astryx-modal-close:hover {
      background: var(--forge-bg-card-hover);
      color: var(--forge-text-main);
      border-color: var(--forge-border);
    }

    .astryx-modal-body {
      padding: 1.35rem;
      overflow-y: auto;
      font-size: 0.86rem;
      color: var(--forge-text-main);
      line-height: 1.55;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }

    .astryx-modal-footer {
      padding: 0.85rem 1.35rem;
      border-top: 1px solid var(--forge-border);
      background: var(--forge-bg-surface);
      display: flex;
      justify-content: flex-end;
      gap: 0.65rem;
      flex-shrink: 0;
      align-items: center;
    }

    /* ── Request Access Modal Specialized Components ── */
    .req-access-target-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.7rem 0.9rem;
      margin-bottom: 1.15rem;
    }
    .req-access-target-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--forge-primary-bg, rgba(62, 207, 142, 0.12));
      color: var(--forge-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .req-access-target-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .req-access-target-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--forge-text-subtle);
      font-weight: 600;
    }
    .req-access-target-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--forge-text-main);
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .req-access-tag {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--forge-primary);
      background: var(--forge-success-bg);
      padding: 0.15rem 0.5rem;
      border-radius: var(--forge-radius-full);
      border: 1px solid var(--forge-border);
      white-space: nowrap;
    }

    /* ── Premium Textarea & Input Experience ── */
    .astryx-textarea-wrap {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      overflow: hidden;
      transition: var(--forge-transition);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    .astryx-textarea-wrap:focus-within {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 2px var(--forge-primary-bg, rgba(62, 207, 142, 0.18)), inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .astryx-textarea {
      width: 100%;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      color: var(--forge-text-main);
      font-family: var(--forge-font-sans, inherit);
      font-size: 0.84rem;
      padding: 0.75rem 0.85rem;
      line-height: 1.5;
      resize: vertical;
      min-height: 76px;
      box-sizing: border-box;
      display: block;
      margin: 0;
    }
    .astryx-textarea::placeholder {
      color: var(--forge-text-subtle);
      opacity: 0.85;
      font-size: 0.82rem;
    }

    .textarea-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.45rem 0.85rem;
      background: var(--forge-bg-surface);
      border-top: 1px solid var(--forge-border);
      font-size: 0.7rem;
      user-select: none;
    }
    .textarea-hint-text {
      color: var(--forge-text-subtle);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .char-count-indicator {
      font-family: var(--forge-font-mono, monospace);
      font-size: 0.68rem;
      color: var(--forge-text-subtle);
      font-weight: 500;
    }

    /* ── Quick Context Preset Chips ── */
    .quick-chips-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .quick-chip-label {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--forge-text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-right: 0.2rem;
    }
    .quick-chip-btn {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-full);
      padding: 0.2rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--forge-text-muted);
      cursor: pointer;
      transition: var(--forge-transition);
      outline: none;
      user-select: none;
    }
    .quick-chip-btn:hover {
      background: var(--forge-bg-card-hover);
      color: var(--forge-primary);
      border-color: var(--forge-primary);
      transform: translateY(-1px);
    }

    /* ── Routing Banner (Automated IT Compliance) ── */
    .req-access-routing-banner {
      margin-top: 1.15rem;
      padding: 0.75rem 0.95rem;
      background: var(--forge-primary-bg, rgba(62, 207, 142, 0.08));
      border: 1px solid rgba(62, 207, 142, 0.22);
      border-radius: var(--forge-radius-sm);
      font-size: 0.76rem;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      box-sizing: border-box;
    }
    [data-theme="light"] .req-access-routing-banner {
      background: rgba(36, 180, 126, 0.07);
      border-color: rgba(36, 180, 126, 0.25);
    }
    .routing-icon-box {
      color: var(--forge-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* ── App Administrators & Approvers List ── */
    .app-admin-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.55rem 0.8rem;
      transition: var(--forge-transition);
      box-sizing: border-box;
    }
    .app-admin-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .app-admin-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--forge-primary);
      color: var(--forge-bg-root);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.74rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .app-admin-meta {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .app-admin-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--forge-text-main);
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .app-admin-title {
      font-size: 0.7rem;
      color: var(--forge-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .app-admin-badge {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--forge-primary);
      background: var(--forge-success-bg);
      border: 1px solid var(--forge-border);
      padding: 0.12rem 0.48rem;
      border-radius: var(--forge-radius-full);
      white-space: nowrap;
    }
    .app-admin-email-link {
      font-size: 0.68rem;
      color: var(--forge-text-subtle);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .app-admin-email-link:hover {
      color: var(--forge-primary);
    }

    /* App Governance Modal Specific Styles */
    .app-gov-tabs-bar {
      display: flex; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card);
      padding: 0 1.25rem; gap: 0.5rem; overflow-x: auto;
    }
    [data-theme="light"] .app-gov-tabs-bar { background: var(--forge-bg-surface); border-bottom-color: var(--forge-border); }
    .gov-tab-btn {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.85rem 0.9rem; font-size: 0.82rem;
      font-weight: 500; border: none; background: transparent; color: var(--forge-text-muted);
      border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; transition: var(--forge-transition);
    }
    .gov-tab-btn:hover { color: var(--forge-text-main); }
    .gov-tab-btn.active { color: var(--forge-primary); border-bottom-color: var(--forge-primary); font-weight: 600; }
    .app-gov-section-card {
      background: var(--forge-bg-card); border: 1px dashed var(--forge-border); border-radius: 8px; padding: 1.15rem;
    }
    [data-theme="light"] .app-gov-section-card { background: var(--forge-bg-elevated); border-color: var(--forge-border-medium); }
    .gov-metric-card {
      padding: 1rem; border-radius: 8px; background: var(--forge-bg-card); border: 1px solid var(--forge-border);
    }
    [data-theme="light"] .gov-metric-card { background: var(--forge-bg-elevated); border-color: var(--forge-border); }
    .gov-radio-card {
      display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.85rem; border: 1px solid var(--forge-border);
      border-radius: 8px; background: var(--forge-bg-card); cursor: pointer; transition: all 0.15s ease;
    }
    .gov-radio-card:hover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); }
    [data-theme="light"] .gov-radio-card { background: var(--forge-bg-elevated); border-color: var(--forge-border); }
    [data-theme="light"] .gov-radio-card:hover { background: var(--forge-bg-card-hover); border-color: var(--forge-primary); }
    .gov-radio-card input[type="radio"] { margin-top: 0.2rem; accent-color: var(--forge-primary); }
    .gov-autocomplete-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 100; margin-top: 4px;
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: 6px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); max-height: 220px; overflow-y: auto;
    }
    [data-theme="light"] .gov-autocomplete-dropdown {
      background: var(--forge-bg-surface); border-color: var(--forge-border-medium);
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12);
    }
    .gov-search-item {
      padding: 0.65rem 0.85rem; cursor: pointer; border-bottom: 1px solid var(--forge-border);
      transition: var(--forge-transition); color: var(--forge-text-main);
    }
    .gov-search-item:hover { background: var(--forge-bg-card-hover); }
    [data-theme="light"] .gov-search-item:hover { background: var(--forge-bg-elevated); }
    [data-theme="light"] .app-admin-card { background: var(--forge-bg-surface); border-color: var(--forge-border); }
    [data-theme="light"] .app-admin-card:hover { background: var(--forge-bg-elevated); border-color: var(--forge-border-medium); }
  `;
}
