/**
 * @forge/portal - Notifications & Company Bulletin Hub Styles (2026 LTS)
 * 100% Astryx Design Token Compliant: 2-column layout, spotlight cards, category badges, widgets & responsive rules.
  * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */

export function getInboxStyles(): string {
  return `
    /* ── Notifications & Inbox Hub Layout ── */
    .inbox-hero-banner {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; gap: 1.5rem; flex-wrap: wrap;
    }
    .inbox-hero-left { flex: 1; min-width: 280px; }
    .inbox-badge-row { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.35rem; }
    .inbox-badge-row .portal-view-badge {
      display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.68rem; font-weight: 600;
      padding: 0.15rem 0.48rem; border-radius: var(--forge-radius-full);
      background: var(--forge-bg-card); border: 1px solid var(--forge-border); color: var(--forge-text-main);
    }
    .inbox-badge-row .portal-view-audience {
      font-size: 0.68rem; color: var(--forge-text-subtle); letter-spacing: 0.01em;
    }
    .inbox-badge-row .portal-view-audience strong {
      color: var(--forge-text-muted); font-weight: 500;
    }
    .inbox-hero-title { margin: 0.25rem 0 0.4rem; font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); letter-spacing: -0.01em; }
    .inbox-hero-subtitle { margin: 0; font-size: 0.84rem; color: var(--forge-text-muted); max-width: 680px; line-height: 1.45; }
    
    .inbox-pulse-chips { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.85rem; flex-wrap: wrap; }
    .inbox-pulse-badge {
      display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.74rem; font-weight: 600;
      padding: 0.25rem 0.65rem; border-radius: var(--forge-radius-full); border: 1px solid var(--forge-border);
      background: var(--forge-bg-card); color: var(--forge-text-main);
    }
    .inbox-pulse-badge.badge-primary { background: var(--forge-primary-bg); border-color: var(--forge-border-medium); color: var(--forge-primary); }
    .inbox-pulse-badge.badge-warning { background: var(--forge-warning-bg); border-color: var(--forge-border-medium); color: var(--forge-warning); }
    .inbox-pulse-badge.badge-celebrate { background: var(--forge-primary-bg); border-color: var(--forge-border-medium); color: var(--forge-accent); }
    .inbox-pulse-badge.badge-neutral { background: var(--forge-bg-card); color: var(--forge-text-muted); }

    .inbox-layout-grid {
      display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(280px, 1fr);
      gap: 1.5rem; align-items: start;
    }
    .inbox-main-col { display: flex; flex-direction: column; gap: 1.25rem; }
    .inbox-widgets-col { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem; }

    /* ── Featured Leadership Spotlight Banner ── */
    .inbox-spotlight-card {
      position: relative; background: var(--forge-bg-card);
      border: 1px solid var(--forge-border-medium); border-left: 4px solid var(--forge-primary);
      border-radius: var(--forge-radius); padding: 1.25rem 1.35rem; box-shadow: var(--forge-shadow-card);
      transition: var(--forge-transition);
    }
    .inbox-spotlight-card:hover { border-color: var(--forge-primary); box-shadow: var(--forge-shadow-hover); }
    .spotlight-badge {
      display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em; color: var(--forge-primary);
      background: var(--forge-bg-surface); padding: 0.18rem 0.55rem; border-radius: var(--forge-radius-full);
      border: 1px solid var(--forge-border); margin-bottom: 0.65rem;
    }
    .spotlight-title { margin: 0 0 0.4rem; font-size: 1.08rem; font-weight: 700; color: var(--forge-text-main); line-height: 1.35; }
    .spotlight-desc { margin: 0 0 0.85rem; font-size: 0.82rem; color: var(--forge-text-muted); line-height: 1.45; }
    .spotlight-meta-row { display: flex; align-items: center; gap: 1rem; font-size: 0.76rem; color: var(--forge-text-subtle); margin-bottom: 1rem; flex-wrap: wrap; }
    .spotlight-actions { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }

    /* ── Controls Bar: Tabs, Search & Unread Toggle ── */
    .inbox-controls-bar {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem;
      flex-wrap: wrap; padding-bottom: 0.35rem; border-bottom: 1px solid var(--forge-border);
    }
    .inbox-filter-tabs { display: flex; align-items: center; gap: 0.35rem; overflow-x: auto; max-width: 100%; }
    .inbox-filter-tab {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem;
      background: transparent; border: 1px solid transparent; border-radius: var(--forge-radius-sm);
      color: var(--forge-text-muted); font-size: 0.78rem; font-weight: 600; cursor: pointer;
      white-space: nowrap; transition: var(--forge-transition);
    }
    .inbox-filter-tab:hover { color: var(--forge-text-main); background: var(--forge-bg-card); }
    .inbox-filter-tab.active { background: var(--forge-bg-card); color: var(--forge-primary); border-color: var(--forge-border-medium); }
    .tab-count {
      font-size: 0.68rem; padding: 0.05rem 0.38rem; border-radius: var(--forge-radius-full);
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border); color: var(--forge-text-subtle);
    }
    .tab-count.tag-action { background: var(--forge-warning-bg); color: var(--forge-warning); border-color: var(--forge-border); }
    .tab-count.tag-celebrate { background: var(--forge-primary-bg); color: var(--forge-accent); border-color: var(--forge-border); }

    .inbox-controls-right { display: flex; align-items: center; gap: 0.75rem; }
    .inbox-search-wrap {
      display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-card);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      padding: 0 0.65rem; height: 32px; min-width: 220px;
    }
    .inbox-search-input {
      background: transparent; border: none; outline: none; color: var(--forge-text-main);
      font-size: 0.78rem; width: 100%;
    }
    .inbox-toggle-wrap {
      display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;
      user-select: none; font-size: 0.76rem; color: var(--forge-text-muted);
    }
    .inbox-toggle-input { cursor: pointer; accent-color: var(--forge-primary); }

    /* ── Notifications Feed List & Cards ── */
    .notifications-feed-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .inbox-feed-card {
      position: relative; display: flex; gap: 1rem; padding: 1.15rem 1.25rem;
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius); box-shadow: var(--forge-shadow-card);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }
    .inbox-feed-card:hover { border-color: var(--forge-border-medium); box-shadow: var(--forge-shadow-hover); }
    .inbox-feed-card.is-unread { border-left: 3px solid var(--forge-primary); background: var(--forge-bg-card); }
    .inbox-feed-card.is-unread.type-action { border-left-color: var(--forge-warning); }
    .inbox-feed-card.is-unread.type-celebration { border-left-color: var(--forge-accent); }

    .unread-indicator-dot {
      position: absolute; top: 12px; right: 12px; width: 8px; height: 8px;
      border-radius: 50%; background: var(--forge-primary); box-shadow: 0 0 6px var(--forge-primary);
    }
    .inbox-feed-card.type-action .unread-indicator-dot { background: var(--forge-warning); box-shadow: 0 0 6px var(--forge-warning); }
    .inbox-feed-card.type-celebration .unread-indicator-dot { background: var(--forge-accent); box-shadow: 0 0 6px var(--forge-accent); }

    .inbox-card-avatar {
      width: 40px; height: 40px; border-radius: var(--forge-radius-sm);
      display: flex; align-items: center; justify-content: center; font-size: 1.15rem;
      flex-shrink: 0; background: var(--forge-bg-card); border: 1px solid var(--forge-border);
    }
    .inbox-card-avatar.type-action { background: var(--forge-warning-bg); border-color: var(--forge-border); }
    .inbox-card-avatar.type-broadcast { background: var(--forge-primary-bg); border-color: var(--forge-border); }
    .inbox-card-avatar.type-celebration { background: var(--forge-primary-bg); border-color: var(--forge-border); }
    .inbox-card-avatar.type-mention { background: var(--forge-primary-bg); border-color: var(--forge-border); }
    .inbox-card-avatar.type-security { background: var(--forge-bg-card-hover); border-color: var(--forge-border); }

    .inbox-card-body { flex: 1; min-width: 0; }
    .inbox-card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
    .inbox-card-tags { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
    .inbox-category-pill {
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      padding: 0.12rem 0.48rem; border-radius: var(--forge-radius-full); border: 1px solid var(--forge-border);
      background: var(--forge-bg-card); color: var(--forge-text-muted);
    }
    .inbox-category-pill.pill-action { color: var(--forge-warning); border-color: var(--forge-border); background: var(--forge-warning-bg); }
    .inbox-category-pill.pill-broadcast { color: var(--forge-primary); border-color: var(--forge-border); background: var(--forge-primary-bg); }
    .inbox-category-pill.pill-celebration { color: var(--forge-accent); border-color: var(--forge-border); background: var(--forge-primary-bg); }
    .inbox-category-pill.pill-mention { color: var(--forge-text-main); border-color: var(--forge-border); background: var(--forge-bg-card); }

    .inbox-card-time { font-size: 0.72rem; color: var(--forge-text-subtle); }
    .inbox-card-title { margin: 0 0 0.35rem; font-size: 0.96rem; font-weight: 700; color: var(--forge-text-main); line-height: 1.35; }
    .inbox-card-message { margin: 0 0 0.85rem; font-size: 0.82rem; color: var(--forge-text-muted); line-height: 1.45; }

    .inbox-card-footer-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .inbox-card-sender-info { display: flex; align-items: center; gap: 0.45rem; }
    .sender-mini-avatar {
      width: 22px; height: 22px; border-radius: 50%; background: var(--forge-primary);
      color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center;
      font-size: 0.68rem; font-weight: 700; flex-shrink: 0;
    }
    .inbox-card-sender { font-size: 0.76rem; font-weight: 600; color: var(--forge-text-main); }
    .sender-role { font-size: 0.72rem; color: var(--forge-text-subtle); }
    .inbox-card-actions { display: flex; align-items: center; gap: 0.45rem; }

    .inbox-celebrate-btn.celebrated { background: var(--forge-primary-bg); border-color: var(--forge-accent); color: var(--forge-accent); }

    /* ── Empty State ── */
    .inbox-empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem 1.5rem; text-align: center; background: var(--forge-bg-card);
      border: 1px dashed var(--forge-border-medium); border-radius: var(--forge-radius);
    }
    .empty-state-icon { font-size: 2.2rem; margin-bottom: 0.6rem; }
    .empty-state-title { margin: 0 0 0.35rem; font-size: 1.1rem; font-weight: 700; color: var(--forge-text-main); }
    .empty-state-desc { margin: 0; font-size: 0.82rem; color: var(--forge-text-muted); max-width: 400px; }

    /* ── Right Side Widgets ── */
    .inbox-widget-card { padding: 1.15rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); }
    .inbox-widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .inbox-widget-title-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .inbox-widget-title { margin: 0; font-size: 0.88rem; font-weight: 700; color: var(--forge-text-main); }
    .inbox-widget-desc { margin: 0 0 0.85rem; font-size: 0.76rem; color: var(--forge-text-muted); line-height: 1.4; }

    .inbox-events-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .inbox-event-item {
      display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.65rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
    }
    .inbox-event-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .inbox-event-dot.type-all_hands { background: var(--forge-primary); }
    .inbox-event-dot.type-holiday { background: var(--forge-accent); }
    .inbox-event-dot.type-social { background: var(--forge-primary); }
    .inbox-event-info { flex: 1; min-width: 0; }
    .inbox-event-title { font-size: 0.78rem; font-weight: 600; color: var(--forge-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .inbox-event-meta { font-size: 0.7rem; color: var(--forge-text-subtle); }
    .inbox-event-badge { font-size: 0.66rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: var(--forge-radius-full); background: var(--forge-bg-surface); border: 1px solid var(--forge-border); color: var(--forge-text-muted); white-space: nowrap; }

    .inbox-pref-options { display: flex; flex-direction: column; gap: 0.5rem; }
    .inbox-radio-label {
      display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.55rem 0.65rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm); cursor: pointer; transition: var(--forge-transition);
    }
    .inbox-radio-label:hover { border-color: var(--forge-border-medium); }
    .inbox-radio-input { margin-top: 0.15rem; cursor: pointer; accent-color: var(--forge-primary); }
    .inbox-radio-title { font-size: 0.78rem; font-weight: 600; color: var(--forge-text-main); }
    .inbox-radio-desc { font-size: 0.7rem; color: var(--forge-text-muted); margin-top: 0.1rem; }

    .inbox-support-links { display: flex; flex-direction: column; gap: 0.45rem; }
    .inbox-support-btn {
      display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.75rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm); color: var(--forge-text-main);
      text-decoration: none; font-size: 0.78rem; font-weight: 500; transition: var(--forge-transition);
    }
    .inbox-support-btn:hover { background: var(--forge-bg-card-hover); color: var(--forge-primary); border-color: var(--forge-primary); }

    /* Responsive Adaptations */
    @media (max-width: 992px) {
      .inbox-layout-grid { grid-template-columns: 1fr; }
      .inbox-widgets-col { position: static; }
    }
    @media (max-width: 640px) {
      .inbox-controls-bar { flex-direction: column; align-items: stretch; }
      .inbox-controls-right { flex-direction: column; align-items: stretch; }
      .inbox-search-wrap { min-width: unset; width: 100%; }
      .inbox-card-footer-row { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
      .inbox-card-actions { width: 100%; justify-content: space-between; }
    }
  `;
}
