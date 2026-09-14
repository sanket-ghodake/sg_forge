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

        // Escapes all outer overflow clipping (modals, cards, tables) by portaling to body
        if (menu.parentNode !== document.body) {
          document.body.appendChild(menu);
        }

        menu.style.position = 'fixed';
        menu.style.zIndex = '999999';
        menu.style.display = 'flex';
        menu.classList.remove('drop-up', 'align-right');

        var rect = trigger.getBoundingClientRect();
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        var menuHeight = menu.offsetHeight || 220;
        var menuWidth = Math.max(rect.width, Math.min(360, menu.offsetWidth || rect.width));

        // Vertical collision check: Flip upwards if opening down would clip bottom edge
        var spaceBelow = viewportHeight - rect.bottom;
        var spaceAbove = rect.top;
        var shouldDropUp = spaceBelow < (menuHeight + 12) && spaceAbove > spaceBelow;

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

        var wrapper = document.createElement('div');
        wrapper.className = 'astryx-custom-select-wrap';
        if (selectEl.id) wrapper.dataset.forSelect = selectEl.id;
        if (selectEl.style.maxWidth) wrapper.style.maxWidth = selectEl.style.maxWidth;
        if (selectEl.style.width) wrapper.style.width = selectEl.style.width;
        if (selectEl.style.flex) wrapper.style.flex = selectEl.style.flex;

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'astryx-custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        var labelSpan = document.createElement('span');
        labelSpan.className = 'astryx-custom-select-label';
        labelSpan.style.whiteSpace = 'nowrap';
        labelSpan.style.overflow = 'hidden';
        labelSpan.style.textOverflow = 'ellipsis';
        labelSpan.style.minWidth = '0';

        trigger.appendChild(labelSpan);
        trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

        var menu = document.createElement('div');
        menu.className = 'astryx-custom-select-menu';
        menu.setAttribute('role', 'listbox');

        wrapper.appendChild(trigger);
        wrapper._astryxMenu = menu;
        menu._astryxWrapper = wrapper;

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
            textSpan.style.whiteSpace = 'nowrap';
            textSpan.style.overflow = 'hidden';
            textSpan.style.textOverflow = 'ellipsis';
            textSpan.style.minWidth = '0';
            item.appendChild(textSpan);

            var checkSpan = document.createElement('span');
            checkSpan.className = 'astryx-custom-select-check';
            checkSpan.textContent = '✓';
            item.appendChild(checkSpan);

            item.addEventListener('click', function(e) {
              e.stopPropagation();
              selectEl.value = opt.value;
              labelSpan.textContent = opt.text;
              closeAllAstryxDropdowns();

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
        document.querySelectorAll('.astryx-custom-select-menu').forEach(function(m) {
          m.style.display = 'none';
        });
      }

      window.astryxPositionDropdown = positionDropdown;
      window.closeAllAstryxDropdowns = closeAllAstryxDropdowns;
      window.enhanceSelect = enhanceSelect;
      window.syncAstryxSelects = function() {
        document.querySelectorAll('select').forEach(enhanceSelect);
      };

      document.addEventListener('click', function(e) {
        if (!e.target.closest('.astryx-custom-select-wrap') && !e.target.closest('.astryx-custom-select-menu')) {
          closeAllAstryxDropdowns();
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeAllAstryxDropdowns();
        }
      });

      window.addEventListener('scroll', function() {
        var openWrap = document.querySelector('.astryx-custom-select-wrap.open');
        if (openWrap) {
          var tr = openWrap.querySelector('.astryx-custom-select-trigger');
          var me = openWrap._astryxMenu;
          if (tr && me && me.style.display !== 'none') {
            var rect = tr.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > (window.innerHeight || document.documentElement.clientHeight)) {
              closeAllAstryxDropdowns();
            } else {
              positionDropdown(tr, me);
            }
          }
        }
      }, true);

      window.addEventListener('resize', function() {
        var openWrap = document.querySelector('.astryx-custom-select-wrap.open');
        if (openWrap) {
          var tr = openWrap.querySelector('.astryx-custom-select-trigger');
          var me = openWrap._astryxMenu;
          if (tr && me && me.style.display !== 'none') {
            positionDropdown(tr, me);
          }
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
