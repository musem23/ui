/**
 * Brand UI - Command Component
 * Command palette with search and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Command Component
   */
  class Command {
    constructor(element, options = {}) {
      this.element = element;
      this.id = element.id || uid('command');
      element.id = this.id;

      this.options = {
        filter: true,
        loop: true,
        placeholder: 'Type a command or search...',
        emptyText: 'No results found.',
        ...options,
      };

      this.input = null;
      this.list = null;
      this.emptyEl = null;
      this.items = [];
      this.groups = [];
      this.selectedIndex = -1;
      this.isDialog = element.classList.contains('command-dialog');
      this.cleanupFns = [];

      this._init();
      setInstance(element, 'command', this);
    }

    _init() {
      this._cacheElements();
      this._bindEvents();
      this._updateItems();

      if (this.items.length > 0) {
        this._selectItem(0);
      }
    }

    _cacheElements() {
      this.input = $('.command-input', this.element);
      this.list = $('.command-list', this.element);
      this.emptyEl = $('.command-empty', this.element);
      this.groups = $$('.command-group', this.element);
    }

    _updateItems() {
      this.items = $$('.command-item:not([hidden]):not(.disabled):not([data-disabled="true"])', this.element);
    }

    _bindEvents() {
      // Input filtering
      if (this.input) {
        const inputHandler = on(this.input, 'input', () => this._handleFilter());
        this.cleanupFns.push(inputHandler);
      }

      // Keyboard navigation
      const keydownHandler = on(this.element, 'keydown', (e) => this._handleKeydown(e));
      this.cleanupFns.push(keydownHandler);

      // Item click
      const clickHandler = on(this.element, 'click', '.command-item', (e, target) => {
        if (!target.hasAttribute('data-disabled') && !target.classList.contains('disabled')) {
          this._handleSelect(target);
        }
      });
      this.cleanupFns.push(clickHandler);

      // Item hover
      const mouseenterHandler = on(this.element, 'mouseenter', '.command-item', (e, target) => {
        if (!target.hasAttribute('data-disabled') && !target.classList.contains('disabled')) {
          const index = this.items.indexOf(target);
          if (index !== -1) {
            this._selectItem(index);
          }
        }
      });
      this.cleanupFns.push(mouseenterHandler);

      // Dialog mode
      if (this.isDialog) {
        const backdropHandler = on(this.element, 'click', (e) => {
          if (e.target === this.element) {
            this.close();
          }
        });
        this.cleanupFns.push(backdropHandler);

        const escapeHandler = on(document, 'keydown', (e) => {
          if (e.key === Keys.ESCAPE && this.isOpen()) {
            e.preventDefault();
            this.close();
          }
        });
        this.cleanupFns.push(escapeHandler);
      }
    }

    _handleFilter() {
      if (!this.options.filter || !this.input) return;

      const query = this.input.value.toLowerCase().trim();
      let visibleCount = 0;

      // Filter items
      $$('.command-item', this.element).forEach((item) => {
        const text = item.textContent.toLowerCase();
        const value = item.dataset.value?.toLowerCase() || '';
        const keywords = item.dataset.keywords?.toLowerCase() || '';
        const matches = text.includes(query) || value.includes(query) || keywords.includes(query);

        item.hidden = !matches;
        if (matches) visibleCount++;
      });

      // Show/hide groups based on visible items
      this.groups.forEach((group) => {
        const visibleItems = $$('.command-item:not([hidden])', group);
        group.hidden = visibleItems.length === 0;
      });

      // Show empty state
      if (this.emptyEl) {
        this.emptyEl.classList.toggle('visible', visibleCount === 0);
      }

      // Update items list and selection
      this._updateItems();
      if (this.items.length > 0) {
        this._selectItem(0);
      } else {
        this.selectedIndex = -1;
      }

      emit(this.element, 'command:filter', { query, count: visibleCount });
    }

    _handleKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._navigateDown();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._navigateUp();
          break;

        case Keys.ENTER:
          e.preventDefault();
          if (this.selectedIndex >= 0 && this.items[this.selectedIndex]) {
            this._handleSelect(this.items[this.selectedIndex]);
          }
          break;

        case Keys.HOME:
          e.preventDefault();
          if (this.items.length > 0) {
            this._selectItem(0);
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (this.items.length > 0) {
            this._selectItem(this.items.length - 1);
          }
          break;
      }
    }

    _navigateDown() {
      if (this.items.length === 0) return;

      let newIndex = this.selectedIndex + 1;
      if (newIndex >= this.items.length) {
        newIndex = this.options.loop ? 0 : this.items.length - 1;
      }
      this._selectItem(newIndex);
    }

    _navigateUp() {
      if (this.items.length === 0) return;

      let newIndex = this.selectedIndex - 1;
      if (newIndex < 0) {
        newIndex = this.options.loop ? this.items.length - 1 : 0;
      }
      this._selectItem(newIndex);
    }

    _selectItem(index) {
      // Clear previous selection
      this.items.forEach((item) => {
        item.removeAttribute('data-selected');
        item.classList.remove('selected');
      });

      // Set new selection
      if (index >= 0 && index < this.items.length) {
        this.selectedIndex = index;
        const item = this.items[index];
        item.setAttribute('data-selected', 'true');
        item.classList.add('selected');

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });

        emit(this.element, 'command:select', { item, index });
      }
    }

    _handleSelect(item) {
      const value = item.dataset.value || item.textContent.trim();
      emit(this.element, 'command:execute', { item, value });

      if (this.isDialog) {
        this.close();
      }
    }

    // Public API

    /**
     * Open command dialog
     */
    open() {
      if (!this.isDialog) return;

      this.element.classList.add('open');
      BrandUI.lockScroll();

      // Focus input
      if (this.input) {
        setTimeout(() => this.input.focus(), 50);
      }

      // Reset filter
      if (this.input) {
        this.input.value = '';
        this._handleFilter();
      }

      emit(this.element, 'command:open');
    }

    /**
     * Close command dialog
     */
    close() {
      if (!this.isDialog) return;

      this.element.classList.remove('open');
      BrandUI.unlockScroll();

      emit(this.element, 'command:close');
    }

    /**
     * Toggle command dialog
     */
    toggle() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Check if dialog is open
     */
    isOpen() {
      return this.element.classList.contains('open');
    }

    /**
     * Set filter value
     */
    setFilter(value) {
      if (this.input) {
        this.input.value = value;
        this._handleFilter();
      }
    }

    /**
     * Clear filter
     */
    clearFilter() {
      this.setFilter('');
    }

    /**
     * Get selected item
     */
    getSelectedItem() {
      return this.items[this.selectedIndex] || null;
    }

    /**
     * Refresh items list
     */
    refresh() {
      this._updateItems();
      if (this.items.length > 0 && this.selectedIndex === -1) {
        this._selectItem(0);
      }
    }

    /**
     * Destroy instance
     */
    destroy() {
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];
      BrandUI.removeInstance(this.element, 'command');
    }
  }

  /**
   * Initialize command component
   */
  function initCommand(element) {
    if (getInstance(element, 'command')) return getInstance(element, 'command');
    return new Command(element);
  }

  // Register for auto-init
  registerComponent('command', initCommand);

  // Export
  BrandUI.components.Command = Command;
  BrandUI.components.initCommand = initCommand;
})();
