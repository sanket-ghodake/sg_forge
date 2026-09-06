/**
 * @forge/ui - Astryx Dropdown & Select Engine (2026 LTS)
 * Lightweight client script providing smart collision detection, auto-flip, and glassmorphic dropdowns.
 */

/**
 * Generates client-side dropdown positioning and auto-flip collision detection script.
 * @requirements [HLR-UI-402] [LLR-UI-002] [LLR-UI-004]
 */
export function getAstryxDropdownScript(): string {
  return `
    (function() {
      if (typeof window === 'undefined') return;

      var CHEVRON_SVG = '<svg class="astryx-custom-select-arrow" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      function positionDropdown(trigger, menu) {
        if (!trigger || !menu) return;

        // Reset classes
        menu.classList.remove('drop-up', 'align-right');

        var rect = trigger.getBoundingClientRect();
        var menuHeight = menu.offsetHeight || 200;
        var menuWidth = menu.offsetWidth || 220;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        // 1. Vertical Collision (Flip Upwards if not enough space below and more space above)
        var spaceBelow = viewportHeight - rect.bottom;
        var spaceAbove = rect.top;

        if (spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow) {
          menu.classList.add('drop-up');
        }

        // 2. Horizontal Collision (Align to right edge if overflowing viewport right)
        if (rect.left + menuWidth > viewportWidth - 16) {
          menu.classList.add('align-right');
        }

        // 3. Dynamic max-height clamping
        var maxAllowedHeight = Math.min(280, Math.max(120, viewportHeight - 60));
        menu.style.maxHeight = maxAllowedHeight + 'px';
      }

      function enhanceSelect(selectEl) {
        if (!selectEl || selectEl.dataset.astryxEnhanced === 'true') {
          if (selectEl && selectEl._astryxSync) selectEl._astryxSync();
          return;
        }

        selectEl.dataset.astryxEnhanced = 'true';
        selectEl.style.display = 'none';

        var wrapper = document.createElement('div');
        wrapper.className = 'astryx-custom-select-wrap';
        if (selectEl.id) wrapper.dataset.forSelect = selectEl.id;
        if (selectEl.style.maxWidth) wrapper.style.maxWidth = selectEl.style.maxWidth;
        if (selectEl.style.width) wrapper.style.width = selectEl.style.width;

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'astryx-custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        var labelSpan = document.createElement('span');
        labelSpan.className = 'astryx-custom-select-label';

        trigger.appendChild(labelSpan);
        trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

        var menu = document.createElement('div');
        menu.className = 'astryx-custom-select-menu';
        menu.setAttribute('role', 'listbox');

        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);

        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

        function syncFromSelect() {
          menu.innerHTML = '';
          var options = Array.from(selectEl.options);
          var selectedOption = selectEl.options[selectEl.selectedIndex] || options[0];
          labelSpan.textContent = selectedOption ? selectedOption.text : 'Select...';

          options.forEach(function(opt) {
            var item = document.createElement('div');
            item.className = 'astryx-custom-select-item' + (opt.selected ? ' selected' : '');
            item.dataset.value = opt.value;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');

            var textSpan = document.createElement('span');
            textSpan.textContent = opt.text;
            item.appendChild(textSpan);

            var checkSpan = document.createElement('span');
            checkSpan.className = 'astryx-custom-select-check';
            checkSpan.textContent = '✓';
            item.appendChild(checkSpan);

            item.addEventListener('click', function(e) {
              e.stopPropagation();
              selectEl.value = opt.value;
              labelSpan.textContent = opt.text;
              wrapper.classList.remove('open');
              trigger.setAttribute('aria-expanded', 'false');

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

        trigger.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasOpen = wrapper.classList.contains('open');
          closeAllAstryxDropdowns();
          if (!wasOpen) {
            syncFromSelect();
            wrapper.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            positionDropdown(trigger, menu);
          }
        });

        var observer = new MutationObserver(function() {
          syncFromSelect();
        });
        observer.observe(selectEl, { childList: true, subtree: true, attributes: true });
      }

      function closeAllAstryxDropdowns() {
        document.querySelectorAll('.astryx-custom-select-wrap.open').forEach(function(el) {
          el.classList.remove('open');
          var tr = el.querySelector('.astryx-custom-select-trigger');
          if (tr) tr.setAttribute('aria-expanded', 'false');
        });
      }

      window.astryxPositionDropdown = positionDropdown;
      window.closeAllAstryxDropdowns = closeAllAstryxDropdowns;
      window.enhanceSelect = enhanceSelect;
      window.syncAstryxSelects = function() {
        document.querySelectorAll('select').forEach(enhanceSelect);
      };

      document.addEventListener('click', function(e) {
        if (!e.target.closest('.astryx-custom-select-wrap')) {
          closeAllAstryxDropdowns();
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeAllAstryxDropdowns();
        }
      });

      window.addEventListener('resize', function() {
        var openMenu = document.querySelector('.astryx-custom-select-wrap.open');
        if (openMenu) {
          var tr = openMenu.querySelector('.astryx-custom-select-trigger');
          var me = openMenu.querySelector('.astryx-custom-select-menu');
          positionDropdown(tr, me);
        }
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.syncAstryxSelects);
      } else {
        setTimeout(window.syncAstryxSelects, 50);
      }
    })();
  `;
}
