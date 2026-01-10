/**
 * Brand UI - Menubar Component
 * Application menubar with dropdown menus and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, onClickOutside, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Menubar Component
   */
  class Menubar {
    constructor(element) {
      this.root = element;
      this.menus = $$('.menubar-menu', element);
      this.triggers = $$('.menubar-trigger', element);
      this.openMenuIndex = -1;
      this.isMenubarActive = false;
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      // Set ARIA attributes
      this.root.setAttribute('role', 'menubar');

      this.menus.forEach((menu, index) => {
        const trigger = $('.menubar-trigger', menu);
        const content = $('.menubar-content', menu);

        if (trigger && content) {
          const triggerId = trigger.id || uid('menubar-trigger');
          const contentId = content.id || uid('menubar-content');

          trigger.id = triggerId;
          content.id = contentId;

          trigger.setAttribute('role', 'menuitem');
          trigger.setAttribute('aria-haspopup', 'menu');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.setAttribute('aria-controls', contentId);
          trigger.setAttribute('tabindex', index === 0 ? '0' : '-1');

          content.setAttribute('role', 'menu');
          content.setAttribute('aria-labelledby', triggerId);
          content.setAttribute('data-state', 'closed');

          // Set up menu items
          this._initMenuItems(content);

          // Set up submenus
          this._initSubmenus(content);
        }
      });

      this._bindEvents();
    }

    _initMenuItems(container) {
      const items = $$(
        '.menubar-item, .menubar-checkbox-item, .menubar-radio-item, .menubar-sub-trigger',
        container
      );

      items.forEach((item) => {
        if (item.classList.contains('menubar-sub-trigger')) {
          item.setAttribute('role', 'menuitem');
          item.setAttribute('aria-haspopup', 'menu');
          item.setAttribute('aria-expanded', 'false');
        } else if (item.classList.contains('menubar-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
          const checked = item.getAttribute('data-checked') === 'true';
          item.setAttribute('aria-checked', checked);
        } else if (item.classList.contains('menubar-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
          const checked = item.getAttribute('data-checked') === 'true';
          item.setAttribute('aria-checked', checked);
        } else {
          item.setAttribute('role', 'menuitem');
        }

        if (item.getAttribute('data-disabled') === 'true') {
          item.setAttribute('aria-disabled', 'true');
        }

        item.setAttribute('tabindex', '-1');
      });
    }

    _initSubmenus(container) {
      const subs = $$('.menubar-sub', container);

      subs.forEach((sub) => {
        const trigger = $('.menubar-sub-trigger', sub);
        const content = $('.menubar-sub-content', sub);

        if (trigger && content) {
          const triggerId = trigger.id || uid('menubar-sub-trigger');
          const contentId = content.id || uid('menubar-sub-content');

          trigger.id = triggerId;
          content.id = contentId;

          trigger.setAttribute('aria-controls', contentId);
          content.setAttribute('role', 'menu');
          content.setAttribute('aria-labelledby', triggerId);
          content.setAttribute('data-state', 'closed');

          // Set up nested menu items
          this._initMenuItems(content);

          // Recursive for nested submenus
          this._initSubmenus(content);
        }
      });
    }

    _bindEvents() {
      // Trigger click handlers
      this.triggers.forEach((trigger, index) => {
        on(trigger, 'click', () => {
          this._toggleMenu(index);
        });

        on(trigger, 'mouseenter', () => {
          if (this.isMenubarActive && this.openMenuIndex !== index) {
            this._openMenu(index);
          }
        });
      });

      // Keyboard navigation on root
      on(this.root, 'keydown', (e) => this._handleMenubarKeydown(e));

      // Menu content events (delegated)
      this.menus.forEach((menu) => {
        const content = $('.menubar-content', menu);
        if (content) {
          on(content, 'keydown', (e) => this._handleMenuKeydown(e, content));

          // Item click handlers
          on(content, 'click', '.menubar-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._selectItem(item);
            }
          });

          on(content, 'click', '.menubar-checkbox-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._toggleCheckboxItem(item);
            }
          });

          on(content, 'click', '.menubar-radio-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._selectRadioItem(item);
            }
          });

          // Hover highlighting
          on(content, 'mouseenter', '.menubar-item, .menubar-checkbox-item, .menubar-radio-item, .menubar-sub-trigger', (e, item) => {
            this._highlightItem(content, item);
          });

          // Submenu handling
          on(content, 'mouseenter', '.menubar-sub-trigger', (e, trigger) => {
            this._openSubmenu(trigger);
          });

          on(content, 'mouseleave', '.menubar-sub', (e, sub) => {
            // Delay to allow moving to submenu
            setTimeout(() => {
              const subContent = $('.menubar-sub-content', sub);
              if (subContent && !sub.matches(':hover') && !subContent.matches(':hover')) {
                this._closeSubmenu(sub);
              }
            }, 100);
          });
        }
      });
    }

    _handleMenubarKeydown(e) {
      const currentTrigger = document.activeElement;
      const triggerIndex = this.triggers.indexOf(currentTrigger);

      if (triggerIndex === -1 && !this.isMenubarActive) return;

      switch (e.key) {
        case Keys.ARROW_RIGHT:
          e.preventDefault();
          if (this.isMenubarActive) {
            const nextIndex = (this.openMenuIndex + 1) % this.menus.length;
            this._openMenu(nextIndex);
          } else if (triggerIndex !== -1) {
            const nextIndex = (triggerIndex + 1) % this.triggers.length;
            this._focusTrigger(nextIndex);
          }
          break;

        case Keys.ARROW_LEFT:
          e.preventDefault();
          if (this.isMenubarActive) {
            const prevIndex = (this.openMenuIndex - 1 + this.menus.length) % this.menus.length;
            this._openMenu(prevIndex);
          } else if (triggerIndex !== -1) {
            const prevIndex = (triggerIndex - 1 + this.triggers.length) % this.triggers.length;
            this._focusTrigger(prevIndex);
          }
          break;

        case Keys.ARROW_DOWN:
        case Keys.ENTER:
        case Keys.SPACE:
          if (triggerIndex !== -1 && !this.isMenubarActive) {
            e.preventDefault();
            this._openMenu(triggerIndex);
          }
          break;

        case Keys.ESCAPE:
          if (this.isMenubarActive) {
            e.preventDefault();
            this._closeAllMenus();
            this._focusTrigger(this.openMenuIndex >= 0 ? this.openMenuIndex : 0);
          }
          break;

        case Keys.HOME:
          if (triggerIndex !== -1) {
            e.preventDefault();
            this._focusTrigger(0);
          }
          break;

        case Keys.END:
          if (triggerIndex !== -1) {
            e.preventDefault();
            this._focusTrigger(this.triggers.length - 1);
          }
          break;
      }
    }

    _handleMenuKeydown(e, container) {
      const items = this._getMenuItems(container);
      const currentItem = document.activeElement;
      const currentIndex = items.indexOf(currentItem);

      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          e.stopPropagation();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          this._focusItem(items, nextIndex);
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          e.stopPropagation();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          this._focusItem(items, prevIndex);
          break;

        case Keys.ARROW_RIGHT:
          // Open submenu if on sub-trigger
          if (currentItem && currentItem.classList.contains('menubar-sub-trigger')) {
            e.preventDefault();
            e.stopPropagation();
            this._openSubmenu(currentItem);
            const subContent = $('.menubar-sub-content', currentItem.closest('.menubar-sub'));
            if (subContent) {
              const subItems = this._getMenuItems(subContent);
              if (subItems.length > 0) {
                this._focusItem(subItems, 0);
              }
            }
          } else {
            // Move to next menu
            e.preventDefault();
            const nextMenuIndex = (this.openMenuIndex + 1) % this.menus.length;
            this._openMenu(nextMenuIndex);
          }
          break;

        case Keys.ARROW_LEFT:
          // Check if in submenu
          const subContent = currentItem?.closest('.menubar-sub-content');
          if (subContent) {
            e.preventDefault();
            e.stopPropagation();
            const sub = subContent.closest('.menubar-sub');
            const trigger = $('.menubar-sub-trigger', sub);
            this._closeSubmenu(sub);
            if (trigger) trigger.focus();
          } else {
            // Move to previous menu
            e.preventDefault();
            const prevMenuIndex = (this.openMenuIndex - 1 + this.menus.length) % this.menus.length;
            this._openMenu(prevMenuIndex);
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          if (currentItem) {
            e.preventDefault();
            e.stopPropagation();

            if (currentItem.classList.contains('menubar-sub-trigger')) {
              this._openSubmenu(currentItem);
              const subContent = $('.menubar-sub-content', currentItem.closest('.menubar-sub'));
              if (subContent) {
                const subItems = this._getMenuItems(subContent);
                if (subItems.length > 0) {
                  this._focusItem(subItems, 0);
                }
              }
            } else if (currentItem.classList.contains('menubar-checkbox-item')) {
              this._toggleCheckboxItem(currentItem);
            } else if (currentItem.classList.contains('menubar-radio-item')) {
              this._selectRadioItem(currentItem);
            } else if (currentItem.classList.contains('menubar-item')) {
              this._selectItem(currentItem);
            }
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          e.stopPropagation();
          // Check if in submenu first
          const currentSubContent = currentItem?.closest('.menubar-sub-content');
          if (currentSubContent) {
            const sub = currentSubContent.closest('.menubar-sub');
            const trigger = $('.menubar-sub-trigger', sub);
            this._closeSubmenu(sub);
            if (trigger) trigger.focus();
          } else {
            this._closeAllMenus();
            this._focusTrigger(this.openMenuIndex);
          }
          break;

        case Keys.HOME:
          e.preventDefault();
          e.stopPropagation();
          this._focusItem(items, 0);
          break;

        case Keys.END:
          e.preventDefault();
          e.stopPropagation();
          this._focusItem(items, items.length - 1);
          break;

        case Keys.TAB:
          this._closeAllMenus();
          break;
      }
    }

    _getMenuItems(container) {
      return $$(
        '.menubar-item:not([data-disabled="true"]), ' +
        '.menubar-checkbox-item:not([data-disabled="true"]), ' +
        '.menubar-radio-item:not([data-disabled="true"]), ' +
        '.menubar-sub-trigger:not([data-disabled="true"])',
        container
      ).filter((item) => {
        // Only include direct children items (not nested submenu items)
        const parentMenu = item.closest('.menubar-content, .menubar-sub-content');
        return parentMenu === container;
      });
    }

    _toggleMenu(index) {
      if (this.openMenuIndex === index && this.isMenubarActive) {
        this._closeAllMenus();
      } else {
        this._openMenu(index);
      }
    }

    _openMenu(index) {
      // Close all menus first
      this._closeAllMenus(false);

      const menu = this.menus[index];
      const trigger = this.triggers[index];
      const content = $('.menubar-content', menu);

      if (!content) return;

      this.openMenuIndex = index;
      this.isMenubarActive = true;

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('data-state', 'open');

      // Focus first item
      const items = this._getMenuItems(content);
      if (items.length > 0) {
        this._focusItem(items, 0);
      }

      // Update trigger tabindex
      this.triggers.forEach((t, i) => {
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });

      // Set up click outside handler
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
      }
      this.cleanupClickOutside = onClickOutside(this.root, () => {
        this._closeAllMenus();
      });

      emit(this.root, 'menubar:open', { index, menu, trigger, content });
    }

    _closeAllMenus(resetFocus = true) {
      this.menus.forEach((menu, index) => {
        const trigger = this.triggers[index];
        const content = $('.menubar-content', menu);

        if (content) {
          trigger.setAttribute('aria-expanded', 'false');
          content.setAttribute('data-state', 'closed');

          // Close all submenus
          $$('.menubar-sub', content).forEach((sub) => {
            this._closeSubmenu(sub);
          });

          // Clear highlights
          this._clearHighlights(content);
        }
      });

      const wasOpen = this.openMenuIndex;
      this.openMenuIndex = -1;
      this.isMenubarActive = false;

      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.root, 'menubar:close', { previousIndex: wasOpen });
    }

    _openSubmenu(trigger) {
      const sub = trigger.closest('.menubar-sub');
      const content = $('.menubar-sub-content', sub);

      if (!content) return;

      // Close sibling submenus
      const parentMenu = sub.parentElement;
      $$('.menubar-sub', parentMenu).forEach((sibling) => {
        if (sibling !== sub) {
          this._closeSubmenu(sibling);
        }
      });

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('data-state', 'open');

      emit(this.root, 'menubar:submenu-open', { trigger, content });
    }

    _closeSubmenu(sub) {
      const trigger = $('.menubar-sub-trigger', sub);
      const content = $('.menubar-sub-content', sub);

      if (trigger && content) {
        trigger.setAttribute('aria-expanded', 'false');
        content.setAttribute('data-state', 'closed');

        // Close nested submenus
        $$('.menubar-sub', content).forEach((nestedSub) => {
          this._closeSubmenu(nestedSub);
        });

        this._clearHighlights(content);
      }
    }

    _focusTrigger(index) {
      this.triggers.forEach((t, i) => {
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      this.triggers[index]?.focus();
    }

    _focusItem(items, index) {
      if (items[index]) {
        items[index].focus();
        this._highlightItem(items[index].closest('.menubar-content, .menubar-sub-content'), items[index]);
      }
    }

    _highlightItem(container, item) {
      this._clearHighlights(container);
      item.setAttribute('data-highlighted', 'true');
    }

    _clearHighlights(container) {
      $$('[data-highlighted="true"]', container).forEach((el) => {
        el.removeAttribute('data-highlighted');
      });
    }

    _selectItem(item) {
      emit(this.root, 'menubar:select', { item, value: item.getAttribute('data-value') });
      this._closeAllMenus();
      this._focusTrigger(this.openMenuIndex >= 0 ? this.openMenuIndex : 0);
    }

    _toggleCheckboxItem(item) {
      const checked = item.getAttribute('data-checked') !== 'true';
      item.setAttribute('data-checked', checked);
      item.setAttribute('aria-checked', checked);

      emit(this.root, 'menubar:checkbox-change', {
        item,
        checked,
        value: item.getAttribute('data-value')
      });
    }

    _selectRadioItem(item) {
      const group = item.closest('.menubar-radio-group');
      if (group) {
        $$('.menubar-radio-item', group).forEach((radio) => {
          radio.setAttribute('data-checked', 'false');
          radio.setAttribute('aria-checked', 'false');
        });
      }

      item.setAttribute('data-checked', 'true');
      item.setAttribute('aria-checked', 'true');

      emit(this.root, 'menubar:radio-change', {
        item,
        value: item.getAttribute('data-value'),
        group: group?.getAttribute('data-value')
      });
    }

    // Public API
    open(index) {
      if (index >= 0 && index < this.menus.length) {
        this._openMenu(index);
      }
    }

    close() {
      this._closeAllMenus();
    }

    destroy() {
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
      }
      this.root.removeAttribute('role');
    }
  }

  /**
   * Initialize menubar
   */
  function initMenubar(element) {
    if (getInstance(element, 'menubar')) return getInstance(element, 'menubar');
    const instance = new Menubar(element);
    setInstance(element, 'menubar', instance);
    return instance;
  }

  // Register for auto-init
  registerComponent('menubar', initMenubar);

  // Export
  BrandUI.components.Menubar = Menubar;
  BrandUI.components.initMenubar = initMenubar;
})();
