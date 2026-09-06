/**
 * @forge/portal - Universal Command Palette (⌘K) Component (2026 LTS)
 * Fast keyboard-driven quick switcher across views, colleagues, tools, and actions.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export function renderCommandPalette(): string {
  return `
    <div class="portal-search-modal" id="portal-search-modal" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="portal-search-box">
        <div class="command-palette-header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--forge-primary)" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="portal-search-input" id="portal-search-input" placeholder="Type a command, page name, or search colleague... (Esc to close)" autocomplete="off" />
          <kbd class="portal-kbd">Esc</kbd>
        </div>

        <div id="portal-search-results" class="command-results-list">
          <div class="command-group-label">Quick Navigation</div>
          <div class="command-item" data-action="nav" data-target="canvas">
            <span class="cmd-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg></span>
            <span class="cmd-text">Company Map & Org Canvas</span>
            <span class="cmd-shortcut">Jump</span>
          </div>
          <div class="command-item" data-action="nav" data-target="apps">
            <span class="cmd-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></span>
            <span class="cmd-text">Apps & Tools Hub</span>
            <span class="cmd-shortcut">Jump</span>
          </div>
          <div class="command-item" data-action="nav" data-target="notifications">
            <span class="cmd-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></span>
            <span class="cmd-text">Announcements & Inbox</span>
            <span class="cmd-shortcut">Jump</span>
          </div>
          <div class="command-item" data-action="nav" data-target="profile">
            <span class="cmd-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
            <span class="cmd-text">My Profile & Security</span>
            <span class="cmd-shortcut">Jump</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
