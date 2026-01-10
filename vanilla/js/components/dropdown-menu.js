/**
 * Brand UI - Dropdown Menu Component
 * Vanilla JavaScript for accessible dropdown menus
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  // ============================================
  // DROPDOWN MENU CLASS
  // ============================================

  class DropdownMenu {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        closeOnSelect: true,
        closeOnClickOutside: true,
        loop: true,
        ...options,
      };

      this.trigger = null;
      this.content = null;
      this.items = [];
      this.focusedIndex = -1;
      this.isOpen = false;
      this.subMenus = new Map();
      this.activeSubMenu = null;
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      this.trigger = $('.dropdown-menu-trigger', this.root);
      this.content = $('.dropdown-menu-content', this.root);

      if (!this.trigger || !this.content) {
        console.warn('DropdownMenu: Missing trigger or content element');
        return;
      }

      // Generate IDs for accessibility
      const id = uid('dropdown');
      this.trigger.id = this.trigger.id || `${id}-trigger`;
      this.content.id = this.content.id || `${id}-content`;

      // Set ARIA attributes
      this.trigger.setAttribute('aria-haspopup', 'menu');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-controls', this.content.id);
      this.content.setAttribute('role', 'menu');
      this.content.setAttribute('aria-labelledby', this.trigger.id);
      this.content.setAttribute('tabindex', '-1');

      // Initialize items
      this._initItems();

      // Initialize submenus
      this._initSubMenus();

      // Bind events
      this._bindEvents();

      // Set initial state
      this.content.setAttribute('data-state', 'closed');

      setInstance(this.root, 'dropdown-menu', this);
    }

    _initItems() {
      this.items = $$('[role="menuitem"], .dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item, .dropdown-menu-sub-trigger', this.content)
        .filter(item => !item.closest('.dropdown-menu-sub-content'));

      this.items.forEach((item, index) => {
        if (!item.hasAttribute('role')) {
          if (item.classList.contains('dropdown-menu-checkbox-item')) {
            item.setAttribute('role', 'menuitemcheckbox');
          } else if (item.classList.contains('dropdown-menu-radio-item')) {
            item.setAttribute('role', 'menuitemradio');
          } else {
            item.setAttribute('role', 'menuitem');
          }
        }
        item.setAttribute('tabindex', '-1');
        item.dataset.index = index;
      });
    }

    _initSubMenus() {
      const subTriggers = $$('.dropdown-menu-sub-trigger', this.content);

      subTriggers.forEach(trigger => {
        const sub = trigger.closest('.dropdown-menu-sub');
        const subContent = $('.dropdown-menu-sub-content', sub);

        if (!sub || !subContent) return;

        const subId = uid('submenu');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', subContent.id || subId);
        subContent.id = subContent.id || subId;
        subContent.setAttribute('role', 'menu');
        subContent.setAttribute('data-state', 'closed');

        // Initialize sub-items
        const subItems = $$('.dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item', subContent);
        subItems.forEach(item => {
          if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'menuitem');
          }
          item.setAttribute('tabindex', '-1');
        });

        this.subMenus.set(trigger, {
          trigger,
          content: subContent,
          items: subItems,
          focusedIndex: -1,
        });
      });
    }

    _bindEvents() {
      // Trigger click
      on(this.trigger, 'click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Trigger keyboard
      on(this.trigger, 'keydown', (e) => {
        switch (e.key) {
          case Keys.ENTER:
          case Keys.SPACE:
          case Keys.ARROW_DOWN:
            e.preventDefault();
            this.open();
            this._focusItem(0);
            break;
          case Keys.ARROW_UP:
            e.preventDefault();
            this.open();
            this._focusItem(this.items.length - 1);
            break;
        }
      });

      // Content keyboard navigation
      on(this.content, 'keydown', (e) => {
        this._handleContentKeydown(e);
      });

      // Item click handling
      on(this.content, 'click', (e) => {
        const item = e.target.closest('.dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item');
        if (!item) return;

        if (item.hasAttribute('data-disabled') || item.classList.contains('is-disabled')) {
          e.preventDefault();
          return;
        }

        // Handle checkbox toggle
        if (item.classList.contains('dropdown-menu-checkbox-item')) {
          const isChecked = item.getAttribute('aria-checked') === 'true';
          item.setAttribute('aria-checked', String(!isChecked));
          emit(item, 'dropdown-menu:change', { checked: !isChecked });
        }

        // Handle radio selection
        if (item.classList.contains('dropdown-menu-radio-item')) {
          const group = item.closest('.dropdown-menu-radio-group, [role="group"]');
          if (group) {
            $$('.dropdown-menu-radio-item', group).forEach(radio => {
              radio.setAttribute('aria-checked', 'false');
            });
          }
          item.setAttribute('aria-checked', 'true');
          emit(item, 'dropdown-menu:change', { value: item.dataset.value });
        }

        // Emit select event
        emit(item, 'dropdown-menu:select', { item });

        // Close if not a sub-trigger and closeOnSelect is true
        if (!item.classList.contains('dropdown-menu-sub-trigger') && this.options.closeOnSelect) {
          this.close();
        }
      });

      // Sub-menu triggers
      this.subMenus.forEach((subMenu, trigger) => {
        on(trigger, 'mouseenter', () => {
          this._openSubMenu(subMenu);
        });

        on(trigger, 'mouseleave', (e) => {
          // Check if moving to sub-content
          const related = e.relatedTarget;
          if (related && subMenu.content.contains(related)) return;
          this._closeSubMenu(subMenu);
        });

        on(subMenu.content, 'mouseleave', (e) => {
          const related = e.relatedTarget;
          if (related && (trigger.contains(related) || subMenu.content.contains(related))) return;
          this._closeSubMenu(subMenu);
        });

        on(trigger, 'keydown', (e) => {
          if (e.key === Keys.ARROW_RIGHT || e.key === Keys.ENTER) {
            e.preventDefault();
            e.stopPropagation();
            this._openSubMenu(subMenu);
            if (subMenu.items.length > 0) {
              subMenu.focusedIndex = 0;
              subMenu.items[0].focus();
            }
          }
        });

        on(subMenu.content, 'keydown', (e) => {
          this._handleSubMenuKeydown(e, subMenu);
        });
      });
    }

    _handleContentKeydown(e) {
      // Skip if in submenu
      if (e.target.closest('.dropdown-menu-sub-content')) return;

      switch (e.key) {
        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          this.trigger.focus();
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._focusNextItem();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._focusPrevItem();
          break;

        case Keys.HOME:
          e.preventDefault();
          this._focusItem(0);
          break;

        case Keys.END:
          e.preventDefault();
          this._focusItem(this.items.length - 1);
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (this.focusedIndex >= 0 && this.items[this.focusedIndex]) {
            this.items[this.focusedIndex].click();
          }
          break;

        case Keys.TAB:
          this.close();
          break;

        default:
          // Type-ahead: focus item starting with typed character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            this._focusItemByChar(e.key);
          }
      }
    }

    _handleSubMenuKeydown(e, subMenu) {
      switch (e.key) {
        case Keys.ESCAPE:
        case Keys.ARROW_LEFT:
          e.preventDefault();
          e.stopPropagation();
          this._closeSubMenu(subMenu);
          subMenu.trigger.focus();
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._focusSubMenuItem(subMenu, 'next');
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._focusSubMenuItem(subMenu, 'prev');
          break;

        case Keys.HOME:
          e.preventDefault();
          if (subMenu.items.length > 0) {
            subMenu.focusedIndex = 0;
            subMenu.items[0].focus();
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (subMenu.items.length > 0) {
            subMenu.focusedIndex = subMenu.items.length - 1;
            subMenu.items[subMenu.items.length - 1].focus();
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (subMenu.focusedIndex >= 0 && subMenu.items[subMenu.focusedIndex]) {
            subMenu.items[subMenu.focusedIndex].click();
          }
          break;
      }
    }

    _focusItem(index) {
      if (index < 0 || index >= this.items.length) return;

      // Skip disabled items
      let targetIndex = index;
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[targetIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        targetIndex = (targetIndex + 1) % this.items.length;
        attempts++;
      }

      if (attempts >= this.items.length) return;

      this.focusedIndex = targetIndex;
      this.items[targetIndex].focus();
    }

    _focusNextItem() {
      let nextIndex = this.focusedIndex + 1;
      if (nextIndex >= this.items.length) {
        nextIndex = this.options.loop ? 0 : this.items.length - 1;
      }

      // Skip disabled items
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[nextIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        nextIndex = (nextIndex + 1) % this.items.length;
        attempts++;
      }

      this._focusItem(nextIndex);
    }

    _focusPrevItem() {
      let prevIndex = this.focusedIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.options.loop ? this.items.length - 1 : 0;
      }

      // Skip disabled items
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[prevIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        prevIndex = prevIndex - 1;
        if (prevIndex < 0) prevIndex = this.items.length - 1;
        attempts++;
      }

      this._focusItem(prevIndex);
    }

    _focusItemByChar(char) {
      const lowerChar = char.toLowerCase();
      const startIndex = this.focusedIndex + 1;

      // Search from current position to end, then from start to current
      for (let i = 0; i < this.items.length; i++) {
        const index = (startIndex + i) % this.items.length;
        const item = this.items[index];
        const text = item.textContent?.trim().toLowerCase() || '';

        if (text.startsWith(lowerChar) && !item.hasAttribute('data-disabled')) {
          this._focusItem(index);
          return;
        }
      }
    }

    _focusSubMenuItem(subMenu, direction) {
      const { items } = subMenu;
      if (items.length === 0) return;

      let nextIndex;
      if (direction === 'next') {
        nextIndex = subMenu.focusedIndex + 1;
        if (nextIndex >= items.length) {
          nextIndex = this.options.loop ? 0 : items.length - 1;
        }
      } else {
        nextIndex = subMenu.focusedIndex - 1;
        if (nextIndex < 0) {
          nextIndex = this.options.loop ? items.length - 1 : 0;
        }
      }

      subMenu.focusedIndex = nextIndex;
      items[nextIndex].focus();
    }

    _openSubMenu(subMenu) {
      // Close other open submenus
      if (this.activeSubMenu && this.activeSubMenu !== subMenu) {
        this._closeSubMenu(this.activeSubMenu);
      }

      subMenu.trigger.setAttribute('aria-expanded', 'true');
      subMenu.trigger.setAttribute('data-state', 'open');
      subMenu.content.setAttribute('data-state', 'open');
      subMenu.content.classList.add('is-open');
      this.activeSubMenu = subMenu;

      emit(subMenu.trigger, 'dropdown-menu:submenu-open', { subMenu });
    }

    _closeSubMenu(subMenu) {
      subMenu.trigger.setAttribute('aria-expanded', 'false');
      subMenu.trigger.setAttribute('data-state', 'closed');
      subMenu.content.setAttribute('data-state', 'closed');
      subMenu.content.classList.remove('is-open');
      subMenu.focusedIndex = -1;

      if (this.activeSubMenu === subMenu) {
        this.activeSubMenu = null;
      }

      emit(subMenu.trigger, 'dropdown-menu:submenu-close', { subMenu });
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.setAttribute('data-state', 'open');
      this.content.classList.add('is-open');

      // Click outside handler
      if (this.options.closeOnClickOutside) {
        this.cleanupClickOutside = onClickOutside(this.root, () => {
          this.close();
        });
      }

      emit(this.root, 'dropdown-menu:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.focusedIndex = -1;
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.setAttribute('data-state', 'closed');
      this.content.classList.remove('is-open');

      // Close all submenus
      this.subMenus.forEach(subMenu => {
        this._closeSubMenu(subMenu);
      });

      // Cleanup click outside
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.root, 'dropdown-menu:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      this.close();
      removeInstance(this.root, 'dropdown-menu');
    }
  }

  // ============================================
  // AUTO INITIALIZATION
  // ============================================

  function initDropdownMenu(element) {
    const options = {};

    if (element.dataset.closeOnSelect === 'false') {
      options.closeOnSelect = false;
    }
    if (element.dataset.closeOnClickOutside === 'false') {
      options.closeOnClickOutside = false;
    }
    if (element.dataset.loop === 'false') {
      options.loop = false;
    }

    return new DropdownMenu(element, options);
  }

  // Register for auto-init
  registerComponent('dropdown-menu', initDropdownMenu);

  // ============================================
  // PUBLIC API
  // ============================================

  BrandUI.components.DropdownMenu = DropdownMenu;

  // Manual initialization helper
  BrandUI.components.initDropdownMenu = (selector = '[data-dropdown-menu]') => {
    $$(selector).forEach(element => {
      if (!getInstance(element, 'dropdown-menu')) {
        initDropdownMenu(element);
      }
    });
  };

})();
