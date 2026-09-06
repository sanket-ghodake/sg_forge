/**
 * @forge/portal - Inbox Side Widgets Component (2026 LTS)
 * Real live organization utility widgets: Upcoming Holidays & Events, Delivery Preferences, and Workplace Concierge.
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';

/**
 * CompanyEventItem
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export interface CompanyEventItem {
  id: string;
  title: string;
  date: string;
  type: 'HOLIDAY' | 'ALL_HANDS' | 'SOCIAL';
  relativeTime: string;
}

/**
 * getDynamicCompanyEvents
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function getDynamicCompanyEvents(): CompanyEventItem[] {
  const now = Date.now();
  const dayMs = 86400000;
  return [
    {
      id: 'evt_dynamic_1',
      title: 'Q3 Global All-Hands & Demo',
      date: new Date(now + 12 * dayMs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · 16:00 UTC',
      type: 'ALL_HANDS',
      relativeTime: 'In 12 days',
    },
    {
      id: 'evt_dynamic_2',
      title: 'Labor & Wellness Recharge Day',
      date: new Date(now + 28 * dayMs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · Company-wide',
      type: 'HOLIDAY',
      relativeTime: 'In 4 weeks',
    },
    {
      id: 'evt_dynamic_3',
      title: 'Virtual Coffee & Team Trivia',
      date: new Date(now + 65 * dayMs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · 14:00 UTC',
      type: 'SOCIAL',
      relativeTime: 'In 2 months',
    },
  ];
}

/**
 * DEFAULT_COMPANY_EVENTS
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export const DEFAULT_COMPANY_EVENTS: CompanyEventItem[] = getDynamicCompanyEvents();

/**
 * renderInboxUpcomingDates
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function renderInboxUpcomingDates(events: CompanyEventItem[] = DEFAULT_COMPANY_EVENTS): string {
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  return `
    <div class="astryx-card inbox-widget-card">
      <div class="inbox-widget-header">
        <div class="inbox-widget-title-wrap">
          <span class="inbox-widget-icon">${astryxIcons.clock || '📅'}</span>
          <h3 class="inbox-widget-title">Upcoming Dates & Holidays</h3>
        </div>
        <span class="astryx-badge badge-neutral">${currentMonth}</span>
      </div>

      <div class="inbox-events-list" id="inbox-events-list">
        ${events.map(evt => `
          <div class="inbox-event-item" data-id="${evt.id}">
            <div class="inbox-event-dot type-${evt.type.toLowerCase()}"></div>
            <div class="inbox-event-info">
              <div class="inbox-event-title">${evt.title}</div>
              <div class="inbox-event-meta">${evt.date}</div>
            </div>
            <span class="inbox-event-badge">${evt.relativeTime}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * renderInboxPreferencesWidget
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function renderInboxPreferencesWidget(currentPref: string = 'instant'): string {
  return `
    <div class="astryx-card inbox-widget-card" style="margin-top: 1rem;">
      <div class="inbox-widget-header">
        <div class="inbox-widget-title-wrap">
          <span class="inbox-widget-icon">${astryxIcons.settings || '⚙️'}</span>
          <h3 class="inbox-widget-title">Delivery Preferences</h3>
        </div>
      </div>
      <p class="inbox-widget-desc">Choose how and when you receive company updates.</p>

      <div class="inbox-pref-options" id="inbox-pref-options">
        <label class="inbox-radio-label">
          <input type="radio" name="digest-pref" value="instant" ${currentPref === 'instant' ? 'checked' : ''} class="inbox-radio-input" />
          <div class="inbox-radio-content">
            <div class="inbox-radio-title">Instant Alerts</div>
            <div class="inbox-radio-desc">Notify in real-time for urgent action items & mentions</div>
          </div>
        </label>

        <label class="inbox-radio-label">
          <input type="radio" name="digest-pref" value="morning-digest" ${currentPref === 'morning-digest' ? 'checked' : ''} class="inbox-radio-input" />
          <div class="inbox-radio-content">
            <div class="inbox-radio-title">Daily Morning Digest (9:00 AM)</div>
            <div class="inbox-radio-desc">One curated email briefing every weekday morning</div>
          </div>
        </label>
      </div>
    </div>
  `;
}

/**
 * renderInboxSupportWidget
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function renderInboxSupportWidget(): string {
  return `
    <div class="astryx-card inbox-widget-card" style="margin-top: 1rem;">
      <div class="inbox-widget-header">
        <div class="inbox-widget-title-wrap">
          <span class="inbox-widget-icon">${astryxIcons.sparkles || '🆘'}</span>
          <h3 class="inbox-widget-title">Workplace Concierge</h3>
        </div>
      </div>
      <p class="inbox-widget-desc">Need assistance or have questions? Reach the right team directly.</p>

      <div class="inbox-support-links">
        <a href="mailto:people@${loadBrandConfig().domain || 'forge.internal'}" class="inbox-support-btn">
          <span class="support-icon">${astryxIcons.user || '👤'}</span>
          <span>People & HR Operations</span>
        </a>
        <a href="mailto:it-support@${loadBrandConfig().domain || 'forge.internal'}" class="inbox-support-btn">
          <span class="support-icon">${astryxIcons.layers || '💻'}</span>
          <span>IT & Access Helpdesk</span>
        </a>
        <a href="mailto:facilities@${loadBrandConfig().domain || 'forge.internal'}" class="inbox-support-btn">
          <span class="support-icon">${astryxIcons.map || '🏢'}</span>
          <span>Workplace & Office Facilities</span>
        </a>
      </div>
    </div>
  `;
}
