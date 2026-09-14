/**
 * @forge/dev-dashboard - Astryx Custom Select Dropdown Engine (2026 LTS)
 * Fully customizable glassmorphic popup dropdowns with smart collision detection and zero OS/browser defaults.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getDropdownScripts(): string {
  return `
    /* Astryx Custom Select Engine */
    (function initAstryxDropdownEngine() {
      const CHEVRON_SVG = '<svg class="astryx-custom-select-arrow" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      function positionDropdown(trigger, menu) {
        if (!trigger || !menu) return;

        // Escapes all outer overflow clipping (modals, cards, tables) by portaling to body
        if (menu.parentNode !== document.body) {
          document.body.appendChild(menu);
        }

        menu.style.position = 'fixed';
        menu.style.zIndex = '999999';
        menu.style.display = 'flex';
        menu.classList.remove('drop-up', 'align-right');

        const rect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        const menuHeight = menu.offsetHeight || 220;
        const menuWidth = Math.max(rect.width, Math.min(360, menu.offsetWidth || rect.width));

        // Vertical collision check: Flip upwards if opening down would clip bottom edge
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldDropUp = spaceBelow < (menuHeight + 12) && spaceAbove > spaceBelow;

        if (shouldDropUp) {
          menu.classList.add('drop-up');
          menu.style.top = 'auto';
          menu.style.bottom = Math.max(8, viewportHeight - rect.top + 4) + 'px';
          menu.style.maxHeight = Math.min(280, Math.max(100, spaceAbove - 16)) + 'px';
        } else {
          menu.style.top = Math.max(8, rect.bottom + 4) + 'px';
          menu.style.bottom = 'auto';
          menu.style.maxHeight = Math.min(280, Math.max(100, spaceBelow - 16)) + 'px';
        }

        // Horizontal collision check: Align to right if overflowing right edge
        if (rect.left + menuWidth > viewportWidth - 16) {
          menu.classList.add('align-right');
          menu.style.left = 'auto';
          menu.style.right = Math.max(8, viewportWidth - rect.right) + 'px';
        } else {
          menu.style.left = Math.max(8, rect.left) + 'px';
          menu.style.right = 'auto';
        }

        menu.style.minWidth = Math.min(rect.width, viewportWidth - 24) + 'px';
        menu.style.maxWidth = Math.min(380, viewportWidth - 24) + 'px';
      }

      function enhanceSelect(selectEl) {
        if (!selectEl || selectEl.dataset.astryxEnhanced === 'true') {
          if (selectEl && selectEl._astryxSync) selectEl._astryxSync();
          return;
        }

        selectEl.dataset.astryxEnhanced = 'true';
        selectEl.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'astryx-custom-select-wrap';
        if (selectEl.id) wrapper.dataset.forSelect = selectEl.id;

        // Copy layout attributes
        if (selectEl.style.maxWidth) wrapper.style.maxWidth = selectEl.style.maxWidth;
        if (selectEl.style.width) wrapper.style.width = selectEl.style.width;
        if (selectEl.style.flex) wrapper.style.flex = selectEl.style.flex;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'astryx-custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'astryx-custom-select-label';
        labelSpan.style.whiteSpace = 'nowrap';
        labelSpan.style.overflow = 'hidden';
        labelSpan.style.textOverflow = 'ellipsis';
        labelSpan.style.minWidth = '0';

        trigger.appendChild(labelSpan);
        trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

        const menu = document.createElement('div');
        menu.className = 'astryx-custom-select-menu';
        menu.setAttribute('role', 'listbox');

        wrapper.appendChild(trigger);
        wrapper._astryxMenu = menu;
        menu._astryxWrapper = wrapper;

        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

        function syncFromSelect() {
          menu.innerHTML = '';
          const options = Array.from(selectEl.options);
          const selectedOption = selectEl.options[selectEl.selectedIndex] || options[0];
          labelSpan.textContent = selectedOption ? selectedOption.text : 'Select...';

          options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'astryx-custom-select-item' + (opt.selected ? ' selected' : '');
            item.dataset.value = opt.value;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');

            const textSpan = document.createElement('span');
            textSpan.textContent = opt.text;
            textSpan.style.whiteSpace = 'nowrap';
            textSpan.style.overflow = 'hidden';
            textSpan.style.textOverflow = 'ellipsis';
            textSpan.style.minWidth = '0';
            item.appendChild(textSpan);

            const checkSpan = document.createElement('span');
            checkSpan.className = 'astryx-custom-select-check';
            checkSpan.textContent = '✓';
            item.appendChild(checkSpan);

            item.addEventListener('click', (e) => {
              e.stopPropagation();
              selectEl.value = opt.value;
              labelSpan.textContent = opt.text;
              closeAllAstryxDropdowns();

              // Dispatch change event to trigger existing app handlers
              selectEl.dispatchEvent(new Event('change', { bubbles: true }));
              if (typeof selectEl.onchange === 'function') {
                selectEl.onchange();
              }
              syncFromSelect();
            });

            menu.appendChild(item);
          });
        }

        selectEl._astryxSync = syncFromSelect;
        syncFromSelect();

        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasOpen = wrapper.classList.contains('open');
          closeAllAstryxDropdowns();
          if (!wasOpen) {
            syncFromSelect();
            wrapper.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            positionDropdown(trigger, menu);
          }
        });

        // Observe option mutations dynamically
        const observer = new MutationObserver(() => {
          syncFromSelect();
        });
        observer.observe(selectEl, { childList: true, subtree: true, attributes: true });
      }

      function closeAllAstryxDropdowns() {
        document.querySelectorAll('.astryx-custom-select-wrap.open').forEach(el => {
          el.classList.remove('open');
          const tr = el.querySelector('.astryx-custom-select-trigger');
          if (tr) tr.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.astryx-custom-select-menu').forEach(m => {
          m.style.display = 'none';
        });
      }

      window.astryxPositionDropdown = positionDropdown;
      window.closeAllAstryxDropdowns = closeAllAstryxDropdowns;
      window.enhanceSelect = enhanceSelect;
      window.syncAstryxSelects = function() {
        document.querySelectorAll('select').forEach(enhanceSelect);
      };

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.astryx-custom-select-wrap') && !e.target.closest('.astryx-custom-select-menu')) {
          closeAllAstryxDropdowns();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllAstryxDropdowns();
        }
      });

      // Recalculate on scroll across containers (modals, drawers, tables)
      window.addEventListener('scroll', () => {
        const openWrap = document.querySelector('.astryx-custom-select-wrap.open');
        if (openWrap) {
          const tr = openWrap.querySelector('.astryx-custom-select-trigger');
          const me = openWrap._astryxMenu;
          if (tr && me && me.style.display !== 'none') {
            const rect = tr.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > (window.innerHeight || document.documentElement.clientHeight)) {
              closeAllAstryxDropdowns();
            } else {
              positionDropdown(tr, me);
            }
          }
        }
      }, true);

      window.addEventListener('resize', () => {
        const openWrap = document.querySelector('.astryx-custom-select-wrap.open');
        if (openWrap) {
          const tr = openWrap.querySelector('.astryx-custom-select-trigger');
          const me = openWrap._astryxMenu;
          if (tr && me && me.style.display !== 'none') {
            positionDropdown(tr, me);
          }
        }
      });

      // Auto-enhance after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.syncAstryxSelects);
      } else {
        setTimeout(window.syncAstryxSelects, 50);
      }
    })();
  `;
}

