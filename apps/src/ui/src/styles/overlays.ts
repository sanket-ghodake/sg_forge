/**
 * @forge/ui - Dropdowns, Modals, Dialogs & Toast Notifications (2026 LTS)
 */

/**
 * Returns Astryx overlay styles for custom select dropdowns, modals, and toasts.
 * @requirements [HLR-UI-401] [LLR-UI-002] [LLR-UI-003]
 */
export function getOverlayStyles(): string {
  return `
    /* ── Astryx Modern Select & Custom Dropdowns (Anti-Browser OS Menus) ── */
    select, .astryx-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-color: var(--forge-bg-card);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 14px 14px;
      padding: 0.45rem 2.2rem 0.45rem 0.75rem;
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main);
      font-size: 0.84rem;
      font-family: inherit;
      outline: none;
      cursor: pointer;
      transition: var(--forge-transition);
    }

    select:hover, .astryx-select:hover {
      border-color: var(--forge-border-medium);
      background-color: var(--forge-bg-card-hover);
    }

    select:focus, select:focus-visible, .astryx-select:focus, .astryx-select:focus-visible {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.25);
    }

    select option {
      background-color: var(--forge-bg-surface);
      color: var(--forge-text-main);
      padding: 0.5rem;
    }

    select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Astryx Custom Select & Floating Dropdown Engine ── */
    .astryx-custom-select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      user-select: none;
      font-family: inherit;
      vertical-align: middle;
    }

    .astryx-custom-select-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.4rem 0.85rem;
      color: var(--forge-text-main);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--forge-transition);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
      min-height: 32px;
      width: 100%;
      box-sizing: border-box;
      outline: none;
    }

    .astryx-custom-select-trigger:hover, .astryx-custom-select-wrap.open .astryx-custom-select-trigger {
      border-color: var(--forge-primary);
      background: var(--forge-bg-card-hover);
      box-shadow: 0 0 10px -2px rgba(62, 207, 142, 0.25);
    }

    .astryx-custom-select-trigger:focus-visible {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.3);
    }

    .astryx-custom-select-arrow {
      width: 13px;
      height: 13px;
      color: var(--forge-primary);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .astryx-custom-select-wrap.open .astryx-custom-select-arrow {
      transform: rotate(180deg);
    }

    .astryx-custom-select-menu {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      min-width: 100%;
      width: max-content;
      max-width: min(340px, calc(100vw - 24px));
      max-height: 280px;
      overflow-y: auto;
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-sm);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      padding: 0.35rem;
      z-index: 1200;
      display: none;
      flex-direction: column;
      gap: 0.15rem;
      box-sizing: border-box;
      animation: selectDropIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }

    .astryx-custom-select-wrap.open .astryx-custom-select-menu {
      display: flex;
    }

    /* Smart Viewport Collision Classes */
    .astryx-custom-select-menu.drop-up {
      top: auto;
      bottom: calc(100% + 5px);
      animation: selectDropUp 0.16s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .astryx-custom-select-menu.align-right {
      left: auto;
      right: 0;
    }

    .astryx-custom-select-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.42rem 0.65rem;
      border-radius: 4px;
      font-size: 0.79rem;
      color: var(--forge-text-main);
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
      white-space: nowrap;
      gap: 0.75rem;
      user-select: none;
    }

    .astryx-custom-select-item:hover {
      background: rgba(62, 207, 142, 0.12);
      color: var(--forge-primary);
    }

    .astryx-custom-select-item.selected {
      background: rgba(62, 207, 142, 0.18);
      color: var(--forge-primary);
      font-weight: 600;
    }

    .astryx-custom-select-check {
      font-size: 0.75rem;
      color: var(--forge-primary);
      font-weight: 700;
      opacity: 0;
    }

    .astryx-custom-select-item.selected .astryx-custom-select-check {
      opacity: 1;
    }

    @keyframes selectDropIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes selectDropUp {
      from { opacity: 0; transform: translateY(4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Astryx Universal Modals & Dialogs (Anti-Native Dialogs) ── */
    .astryx-modal-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 3000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .astryx-modal-backdrop.open {
      display: flex;
      opacity: 1;
    }

    .astryx-modal {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
      width: 100%;
      max-width: min(640px, 92vw);
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.96) translateY(8px);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }

    .astryx-modal-backdrop.open .astryx-modal {
      transform: scale(1) translateY(0);
    }

    .astryx-modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--forge-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--forge-bg-card);
      flex-shrink: 0;
    }

    .astryx-modal-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--forge-text-main);
      margin: 0;
    }

    .astryx-modal-close {
      background: transparent;
      border: none;
      color: var(--forge-text-muted);
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: var(--forge-radius-sm);
      transition: var(--forge-transition);
    }

    .astryx-modal-close:hover {
      background: var(--forge-bg-card-hover);
      color: var(--forge-text-main);
    }

    .astryx-modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      font-size: 0.88rem;
      color: var(--forge-text-main);
      line-height: 1.6;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }

    .astryx-modal-footer {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--forge-border);
      background: var(--forge-bg-card);
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    /* ── Astryx Slideover Drawers ── */
    .astryx-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2000;
      display: none;
      opacity: 0;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .astryx-drawer-backdrop.open {
      display: block;
      opacity: 1;
    }

    .astryx-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: min(520px, 94vw);
      height: 100vh;
      background: var(--forge-bg-surface);
      border-left: 1px solid var(--forge-border-medium);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
      z-index: 2001;
      transform: translateX(100%);
      transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }

    .astryx-drawer.open {
      transform: translateX(0);
    }

    /* ── Astryx Modern Toast Notification System (Anti-Browser alert()) ── */
    .astryx-toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-width: 420px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .astryx-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: var(--forge-text-main);
      font-size: 0.84rem;
      line-height: 1.45;
      animation: astryxToastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: opacity 0.2s ease, transform 0.2s ease;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }

    @keyframes astryxToastSlideIn {
      from { transform: translateY(16px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .astryx-toast-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      line-height: 1;
      margin-top: 1px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .astryx-toast-content {
      flex: 1;
      word-break: break-word;
    }

    .astryx-toast-close {
      background: transparent;
      border: none;
      color: var(--forge-text-muted);
      cursor: pointer;
      font-size: 1.15rem;
      line-height: 1;
      padding: 0 0.2rem;
      margin-left: auto;
      border-radius: 3px;
      transition: var(--forge-transition);
    }

    .astryx-toast-close:hover {
      color: var(--forge-text-main);
    }

    .astryx-toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: var(--forge-primary);
      width: 100%;
      transform-origin: left;
      animation: toastProgress linear forwards;
    }

    .astryx-toast-success { border-left: 4px solid var(--forge-success); }
    .astryx-toast-success .astryx-toast-progress { background: var(--forge-success); }
    .astryx-toast-error { border-left: 4px solid var(--forge-accent); }
    .astryx-toast-error .astryx-toast-progress { background: var(--forge-accent); }
    .astryx-toast-warning { border-left: 4px solid var(--forge-warning); }
    .astryx-toast-warning .astryx-toast-progress { background: var(--forge-warning); }
    .astryx-toast-info { border-left: 4px solid var(--forge-primary); }
    .astryx-toast-info .astryx-toast-progress { background: var(--forge-primary); }

    @media (max-width: 640px) {
      .astryx-toast-container {
        right: 0.75rem;
        left: 0.75rem;
        bottom: 1rem;
        width: calc(100vw - 1.5rem);
        max-width: unset;
      }
    }

    /* ── Astryx Modern Floating Tooltips & Popovers (Anti-Browser Defaults) ── */
    [data-astryx-tooltip], [data-tooltip] {
      cursor: inherit;
    }
    .astryx-floating-tooltip {
      position: fixed;
      z-index: 100000;
      pointer-events: none;
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      color: var(--forge-text-main);
      padding: 0.5rem 0.75rem;
      border-radius: var(--forge-radius-sm);
      font-size: 0.74rem;
      font-weight: 500;
      line-height: 1.4;
      max-width: 290px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 12px rgba(59, 130, 246, 0.15);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      opacity: 0;
      transition: opacity 0.12s ease;
      display: none;
    }
    .astryx-floating-tooltip.visible {
      display: block;
      opacity: 1;
    }
    .astryx-tooltip-title {
      font-weight: 700;
      font-size: 0.75rem;
      color: var(--forge-primary);
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  `;
}
