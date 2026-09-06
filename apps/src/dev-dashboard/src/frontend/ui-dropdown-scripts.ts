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
        menu.classList.remove('drop-up', 'align-right');

        const rect = trigger.getBoundingClientRect();
        const menuHeight = menu.offsetHeight || 220;
        const menuWidth = menu.offsetWidth || 220;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        // Vertical collision check: Flip upwards if opening down would clip bottom edge
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow) {
          menu.classList.add('drop-up');
        }

        // Horizontal collision check: Align to right if overflowing right edge
        if (rect.left + menuWidth > viewportWidth - 16) {
          menu.classList.add('align-right');
        }

        // Clamp max-height to guaranteed visible viewport space
        const maxH = Math.min(280, Math.max(120, viewportHeight - 60));
        menu.style.maxHeight = maxH + 'px';
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

        // Copy style attributes if needed (e.g. max-width)
        if (selectEl.style.maxWidth) wrapper.style.maxWidth = selectEl.style.maxWidth;
        if (selectEl.style.width) wrapper.style.width = selectEl.style.width;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'astryx-custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'astryx-custom-select-label';

        trigger.appendChild(labelSpan);
        trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

        const menu = document.createElement('div');
        menu.className = 'astryx-custom-select-menu';
        menu.setAttribute('role', 'listbox');

        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);

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
            item.appendChild(textSpan);

            const checkSpan = document.createElement('span');
            checkSpan.className = 'astryx-custom-select-check';
            checkSpan.textContent = '✓';
            item.appendChild(checkSpan);

            item.addEventListener('click', (e) => {
              e.stopPropagation();
              selectEl.value = opt.value;
              labelSpan.textContent = opt.text;
              wrapper.classList.remove('open');
              trigger.setAttribute('aria-expanded', 'false');

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
      }

      window.astryxPositionDropdown = positionDropdown;
      window.closeAllAstryxDropdowns = closeAllAstryxDropdowns;
      window.enhanceSelect = enhanceSelect;
      window.syncAstryxSelects = function() {
        document.querySelectorAll('select').forEach(enhanceSelect);
      };

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.astryx-custom-select-wrap')) {
          closeAllAstryxDropdowns();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllAstryxDropdowns();
        }
      });

      window.addEventListener('resize', () => {
        const openWrap = document.querySelector('.astryx-custom-select-wrap.open');
        if (openWrap) {
          const tr = openWrap.querySelector('.astryx-custom-select-trigger');
          const me = openWrap.querySelector('.astryx-custom-select-menu');
          positionDropdown(tr, me);
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

