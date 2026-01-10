/**
 * Brand UI - Context Menu
 * Right-click triggered dropdown menu with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, handleArrowNavigation, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  /**
   * Context Menu Component
   */
  class ContextMenu {
    constructor(trigger, options = {}) {
      this.trigger = trigger;
      this.options = {
        onOpen: options.onOpen || null,
        onClose: options.onClose || null,
        onSelect: options.onSelect || null,
      };

      this.id = trigger.id || uid('context-menu');
      this.content = null;
      this.isOpen = false;
      this.focusedIndex = -1;
      this.activeSubMenu = null;
      this.cleanupClickOutside = null;

      this.init();
    }

    init() {
      // Find associated content
      const contentId = this.trigger.getAttribute('data-context-menu-content');
      this.content = contentId ? document.getElementById(contentId) : this.trigger.querySelector('.context-menu-content');

      if (!this.content) {
        console.warn('ContextMenu: No content found for trigger', this.trigger);
        return;
      }

      // Set initial state
      this.content.setAttribute('data-state', 'closed');
      this.content.setAttribute('role', 'menu');
      this.content.setAttribute('tabindex', '-1');

      // Setup items
      this.setupItems();

      // Bind events
      this.bindEvents();

      // Store instance
      setInstance(this.trigger, 'context-menu', this);
    }

    setupItems() {
      const items = this.getItems();
      items.forEach((item, index) => {
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');

        // Setup checkbox items
        if (item.classList.contains('context-menu-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
          item.setAttribute('aria-checked', item.dataset.checked === 'true');
        }

        // Setup radio items
        if (item.classList.contains('context-menu-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
          item.setAttribute('aria-checked', item.dataset.checked === 'true');
        }

        // Setup sub triggers
        if (item.classList.contains('context-menu-sub-trigger')) {
          item.setAttribute('aria-haspopup', 'menu');
          item.setAttribute('aria-expanded', 'false');
        }
      });
    }

    getItems(container = this.content) {
      return $$(
        '.context-menu-item:not([data-disabled]), .context-menu-checkbox-item:not([data-disabled]), .context-menu-radio-item:not([data-disabled]), .context-menu-sub-trigger:not([data-disabled])',
        container
      );
    }

    bindEvents() {
      // Right-click to open
      on(this.trigger, 'contextmenu', (e) => {
        e.preventDefault();
        this.open(e.clientX, e.clientY);
      });

      // Keyboard navigation within menu
      on(this.content, 'keydown', (e) => this.handleKeydown(e));

      // Item click
      on(this.content, 'click', (e) => {
        const item = e.target.closest('.context-menu-item, .context-menu-checkbox-item, .context-menu-radio-item');
        if (item && !item.hasAttribute('data-disabled')) {
          this.handleItemClick(item, e);
        }

        const subTrigger = e.target.closest('.context-menu-sub-trigger');
        if (subTrigger && !subTrigger.hasAttribute('data-disabled')) {
          this.handleSubTriggerClick(subTrigger, e);
        }
      });

      // Mouse enter for focus
      on(this.content, 'mouseenter', '.context-menu-item, .context-menu-checkbox-item, .context-menu-radio-item, .context-menu-sub-trigger', (e, target) => {
        if (!target.hasAttribute('data-disabled')) {
          this.focusItem(target);
        }
      });

      // Sub menu trigger hover
      on(this.content, 'mouseenter', '.context-menu-sub-trigger', (e, target) => {
        if (!target.hasAttribute('data-disabled')) {
          this.openSubMenu(target);
        }
      });
    }

    open(x, y) {
      if (this.isOpen) {
        this.close();
      }

      this.isOpen = true;
      this.content.setAttribute('data-state', 'open');

      // Position at mouse cursor
      this.position(x, y);

      // Focus first item
      requestAnimationFrame(() => {
        const items = this.getItems();
        if (items.length > 0) {
          this.focusItem(items[0]);
        }
      });

      // Click outside to close
      this.cleanupClickOutside = this.setupClickOutside();

      // Escape to close
      this.escapeHandler = (e) => {
        if (e.key === Keys.ESCAPE) {
          e.preventDefault();
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);

      // Emit event
      emit(this.trigger, 'context-menu:open', { menu: this });

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.content.setAttribute('data-state', 'closed');
      this.focusedIndex = -1;

      // Close any open submenus
      this.closeAllSubMenus();

      // Cleanup
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
        this.escapeHandler = null;
      }

      // Emit event
      emit(this.trigger, 'context-menu:close', { menu: this });

      if (this.options.onClose) {
        this.options.onClose(this);
      }
    }

    position(x, y) {
      const rect = this.content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate position, flipping if necessary
      let left = x;
      let top = y;

      // Flip horizontally if would overflow
      if (x + rect.width > viewportWidth) {
        left = Math.max(0, x - rect.width);
      }

      // Flip vertically if would overflow
      if (y + rect.height > viewportHeight) {
        top = Math.max(0, y - rect.height);
      }

      this.content.style.left = `${left}px`;
      this.content.style.top = `${top}px`;
    }

    setupClickOutside() {
      const handler = (e) => {
        if (!this.content.contains(e.target) && !this.trigger.contains(e.target)) {
          // Check if clicking in a submenu
          const subContents = $$('.context-menu-sub-content[data-state="open"]');
          const clickedInSub = subContents.some(sub => sub.contains(e.target));
          if (!clickedInSub) {
            this.close();
          }
        }
      };

      // Delay to prevent immediate trigger
      setTimeout(() => {
        document.addEventListener('click', handler, true);
        document.addEventListener('contextmenu', handler, true);
      }, 0);

      return () => {
        document.removeEventListener('click', handler, true);
        document.removeEventListener('contextmenu', handler, true);
      };
    }

    handleKeydown(e) {
      const items = this.getItems();
      const currentIndex = items.indexOf(document.activeElement);

      switch (e.key) {
        case Keys.ARROW_DOWN:
        case Keys.ARROW_UP:
          e.preventDefault();
          this.focusedIndex = handleArrowNavigation(e, items, currentIndex, {
            loop: true,
            orientation: 'vertical',
          });
          break;

        case Keys.HOME:
          e.preventDefault();
          if (items.length > 0) {
            this.focusItem(items[0]);
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (items.length > 0) {
            this.focusItem(items[items.length - 1]);
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          const focused = document.activeElement;
          if (focused.classList.contains('context-menu-sub-trigger')) {
            this.openSubMenu(focused);
          } else if (items.includes(focused)) {
            this.handleItemClick(focused, e);
          }
          break;

        case Keys.ARROW_RIGHT:
          e.preventDefault();
          const subTrigger = document.activeElement;
          if (subTrigger.classList.contains('context-menu-sub-trigger')) {
            this.openSubMenu(subTrigger);
          }
          break;

        case Keys.ARROW_LEFT:
          e.preventDefault();
          if (this.activeSubMenu) {
            this.closeSubMenu(this.activeSubMenu);
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          if (this.activeSubMenu) {
            this.closeSubMenu(this.activeSubMenu);
          } else {
            this.close();
          }
          break;
      }
    }

    handleItemClick(item, e) {
      // Handle checkbox
      if (item.classList.contains('context-menu-checkbox-item')) {
        const isChecked = item.dataset.checked !== 'true';
        item.dataset.checked = isChecked;
        item.setAttribute('aria-checked', isChecked);
        emit(item, 'context-menu:check', { checked: isChecked, item });
      }

      // Handle radio
      if (item.classList.contains('context-menu-radio-item')) {
        const group = item.closest('.context-menu-radio-group');
        if (group) {
          $$('.context-menu-radio-item', group).forEach(radio => {
            radio.dataset.checked = 'false';
            radio.setAttribute('aria-checked', 'false');
          });
        }
        item.dataset.checked = 'true';
        item.setAttribute('aria-checked', 'true');
        emit(item, 'context-menu:radio-change', { value: item.dataset.value, item });
      }

      // Emit select event
      emit(item, 'context-menu:select', { item, value: item.dataset.value });

      if (this.options.onSelect) {
        this.options.onSelect(item, item.dataset.value);
      }

      // Close menu (unless it's a checkbox or has submenu)
      if (!item.classList.contains('context-menu-checkbox-item') && !item.classList.contains('context-menu-sub-trigger')) {
        this.close();
      }
    }

    handleSubTriggerClick(trigger, e) {
      e.stopPropagation();
      this.openSubMenu(trigger);
    }

    focusItem(item) {
      const items = this.getItems();
      items.forEach(i => i.classList.remove('focused'));
      item.classList.add('focused');
      item.focus();
      this.focusedIndex = items.indexOf(item);
    }

    openSubMenu(trigger) {
      // Close other submenus first
      this.closeAllSubMenus();

      const subContentId = trigger.dataset.submenu;
      const subContent = subContentId ? document.getElementById(subContentId) : trigger.nextElementSibling;

      if (!subContent || !subContent.classList.contains('context-menu-sub-content')) {
        return;
      }

      trigger.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');
      subContent.setAttribute('data-state', 'open');

      // Position submenu
      this.positionSubMenu(trigger, subContent);

      this.activeSubMenu = { trigger, content: subContent };

      // Setup submenu keyboard navigation
      this.setupSubMenuNavigation(subContent);

      // Focus first item in submenu
      requestAnimationFrame(() => {
        const items = this.getItems(subContent);
        if (items.length > 0) {
          this.focusItem(items[0]);
        }
      });
    }

    closeSubMenu(subMenu) {
      if (!subMenu) return;

      subMenu.trigger.setAttribute('data-state', 'closed');
      subMenu.trigger.setAttribute('aria-expanded', 'false');
      subMenu.content.setAttribute('data-state', 'closed');

      // Focus back to trigger
      subMenu.trigger.focus();

      this.activeSubMenu = null;
    }

    closeAllSubMenus() {
      $$('.context-menu-sub-trigger[data-state="open"]', this.content).forEach(trigger => {
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      });

      $$('.context-menu-sub-content[data-state="open"]', this.content).forEach(content => {
        content.setAttribute('data-state', 'closed');
      });

      this.activeSubMenu = null;
    }

    positionSubMenu(trigger, content) {
      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Position to the right of trigger by default
      let left = triggerRect.right + 4;
      let top = triggerRect.top;

      // Flip horizontally if would overflow
      if (left + contentRect.width > viewportWidth) {
        left = triggerRect.left - contentRect.width - 4;
      }

      // Adjust vertically if would overflow
      if (top + contentRect.height > viewportHeight) {
        top = Math.max(8, viewportHeight - contentRect.height - 8);
      }

      content.style.left = `${left}px`;
      content.style.top = `${top}px`;
    }

    setupSubMenuNavigation(subContent) {
      const handler = (e) => {
        const items = this.getItems(subContent);
        const currentIndex = items.indexOf(document.activeElement);

        switch (e.key) {
          case Keys.ARROW_DOWN:
          case Keys.ARROW_UP:
            e.preventDefault();
            e.stopPropagation();
            handleArrowNavigation(e, items, currentIndex, {
              loop: true,
              orientation: 'vertical',
            });
            break;

          case Keys.ARROW_LEFT:
          case Keys.ESCAPE:
            e.preventDefault();
            e.stopPropagation();
            this.closeSubMenu(this.activeSubMenu);
            break;

          case Keys.ENTER:
          case Keys.SPACE:
            e.preventDefault();
            e.stopPropagation();
            const focused = document.activeElement;
            if (items.includes(focused)) {
              this.handleItemClick(focused, e);
            }
            break;
        }
      };

      subContent.addEventListener('keydown', handler);

      // Cleanup when submenu closes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-state') {
            if (subContent.getAttribute('data-state') === 'closed') {
              subContent.removeEventListener('keydown', handler);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(subContent, { attributes: true });
    }

    destroy() {
      this.close();
      removeInstance(this.trigger, 'context-menu');
    }
  }

  /**
   * Initialize context menu from HTML
   */
  function initContextMenu(element) {
    if (getInstance(element, 'context-menu')) return;
    return new ContextMenu(element);
  }

  // Register for auto-init
  registerComponent('context-menu', initContextMenu);

  // Add to BrandUI namespace
  BrandUI.components.ContextMenu = ContextMenu;
  BrandUI.components.initContextMenu = initContextMenu;
})();
