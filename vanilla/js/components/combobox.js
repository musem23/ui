/**
 * Brand UI - Combobox Component
 * Searchable select with filtering and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance } = BrandUI;

  /**
   * Combobox component
   */
  class Combobox {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        placeholder: 'Search...',
        emptyText: 'No results found.',
        ...options,
      };

      this.trigger = $('.combobox-trigger', this.root);
      this.input = $('.combobox-input', this.root);
      this.content = $('.combobox-content', this.root);
      this.list = $('.combobox-list', this.root);
      this.emptyEl = $('.combobox-empty', this.root);

      this.isOpen = false;
      this.highlightedIndex = -1;
      this.selectedValue = null;
      this.items = [];
      this.visibleItems = [];

      this._cleanupClickOutside = null;

      this._init();
    }

    _init() {
      this._cacheItems();
      this._setupIds();
      this._setupAria();
      this._bindEvents();
      this._restoreSelection();
    }

    _cacheItems() {
      this.items = $$('.combobox-item', this.list);
    }

    _setupIds() {
      this.listId = this.list.id || uid('combobox-list');
      this.list.id = this.listId;

      this.items.forEach((item, i) => {
        if (!item.id) {
          item.id = uid('combobox-item');
        }
      });
    }

    _setupAria() {
      this.input.setAttribute('role', 'combobox');
      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.setAttribute('aria-controls', this.listId);
      this.input.setAttribute('aria-haspopup', 'listbox');

      this.list.setAttribute('role', 'listbox');

      this.items.forEach((item) => {
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
      });
    }

    _bindEvents() {
      // Input events
      on(this.input, 'focus', () => this.open());
      on(this.input, 'input', (e) => this._onInput(e));
      on(this.input, 'keydown', (e) => this._onKeydown(e));

      // Trigger icon click
      const triggerIcon = $('.combobox-trigger-icon', this.trigger);
      if (triggerIcon) {
        on(triggerIcon.parentElement || this.trigger, 'click', (e) => {
          if (e.target === this.input) return;
          this.toggle();
          this.input.focus();
        });
      }

      // Clear button
      const clearBtn = $('.combobox-clear', this.root);
      if (clearBtn) {
        on(clearBtn, 'click', (e) => {
          e.stopPropagation();
          this.clear();
          this.input.focus();
        });
      }

      // Item selection
      on(this.list, 'click', '.combobox-item', (e, item) => {
        if (item.dataset.disabled === 'true') return;
        this._selectItem(item);
      });

      // Mouse hover on items
      on(this.list, 'mousemove', '.combobox-item', (e, item) => {
        if (item.dataset.disabled === 'true') return;
        const index = this.visibleItems.indexOf(item);
        if (index !== -1) {
          this._highlightItem(index);
        }
      });
    }

    _restoreSelection() {
      const selectedItem = this.items.find(
        (item) => item.dataset.selected === 'true'
      );
      if (selectedItem) {
        this.selectedValue = selectedItem.dataset.value;
        this.input.value = selectedItem.textContent.trim();
      }
    }

    _onInput(e) {
      const query = e.target.value.toLowerCase().trim();
      this._filter(query);

      if (!this.isOpen) {
        this.open();
      }
    }

    _filter(query) {
      let hasVisible = false;

      this.items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        item.dataset.hidden = matches ? 'false' : 'true';
        if (matches) hasVisible = true;
      });

      this.root.dataset.empty = !hasVisible;
      this._cacheVisibleItems();

      // Reset highlight
      this.highlightedIndex = -1;
      if (this.visibleItems.length > 0) {
        this._highlightItem(0);
      }
    }

    _cacheVisibleItems() {
      this.visibleItems = this.items.filter(
        (item) => item.dataset.hidden !== 'true' && item.dataset.disabled !== 'true'
      );
    }

    _onKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          if (!this.isOpen) {
            this.open();
          } else {
            this._navigateItems(1);
          }
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          if (this.isOpen) {
            this._navigateItems(-1);
          }
          break;

        case Keys.ENTER:
          e.preventDefault();
          if (this.isOpen && this.highlightedIndex >= 0) {
            const item = this.visibleItems[this.highlightedIndex];
            if (item) {
              this._selectItem(item);
            }
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          break;

        case Keys.TAB:
          this.close();
          break;

        case Keys.HOME:
          if (this.isOpen) {
            e.preventDefault();
            this._highlightItem(0);
          }
          break;

        case Keys.END:
          if (this.isOpen) {
            e.preventDefault();
            this._highlightItem(this.visibleItems.length - 1);
          }
          break;
      }
    }

    _navigateItems(direction) {
      if (this.visibleItems.length === 0) return;

      let newIndex = this.highlightedIndex + direction;

      if (newIndex < 0) {
        newIndex = this.visibleItems.length - 1;
      } else if (newIndex >= this.visibleItems.length) {
        newIndex = 0;
      }

      this._highlightItem(newIndex);
    }

    _highlightItem(index) {
      // Remove previous highlight
      this.visibleItems.forEach((item) => {
        item.dataset.highlighted = 'false';
      });

      this.highlightedIndex = index;

      if (index >= 0 && index < this.visibleItems.length) {
        const item = this.visibleItems[index];
        item.dataset.highlighted = 'true';
        this.input.setAttribute('aria-activedescendant', item.id);

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });
      } else {
        this.input.removeAttribute('aria-activedescendant');
      }
    }

    _selectItem(item) {
      const value = item.dataset.value;
      const text = item.textContent.trim();

      // Update selection state
      this.items.forEach((i) => {
        i.dataset.selected = 'false';
        i.setAttribute('aria-selected', 'false');
      });

      item.dataset.selected = 'true';
      item.setAttribute('aria-selected', 'true');

      this.selectedValue = value;
      this.input.value = text;

      this.close();

      emit(this.root, 'combobox:change', { value, text, item });
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.root.dataset.open = 'true';
      this.input.setAttribute('aria-expanded', 'true');

      // Reset filter to show all
      this._filter('');

      // Highlight selected or first item
      const selectedIndex = this.visibleItems.findIndex(
        (item) => item.dataset.selected === 'true'
      );
      this._highlightItem(selectedIndex >= 0 ? selectedIndex : 0);

      // Click outside to close
      this._cleanupClickOutside = onClickOutside(this.root, () => this.close());

      emit(this.root, 'combobox:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.root.dataset.open = 'false';
      this.input.setAttribute('aria-expanded', 'false');
      this.input.removeAttribute('aria-activedescendant');

      // Clear highlight
      this.visibleItems.forEach((item) => {
        item.dataset.highlighted = 'false';
      });
      this.highlightedIndex = -1;

      // Cleanup click outside listener
      if (this._cleanupClickOutside) {
        this._cleanupClickOutside();
        this._cleanupClickOutside = null;
      }

      emit(this.root, 'combobox:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    clear() {
      this.items.forEach((item) => {
        item.dataset.selected = 'false';
        item.setAttribute('aria-selected', 'false');
      });

      this.selectedValue = null;
      this.input.value = '';

      this._filter('');

      emit(this.root, 'combobox:clear');
      emit(this.root, 'combobox:change', { value: null, text: '', item: null });
    }

    getValue() {
      return this.selectedValue;
    }

    setValue(value) {
      const item = this.items.find((i) => i.dataset.value === value);
      if (item) {
        this._selectItem(item);
      }
    }

    destroy() {
      if (this._cleanupClickOutside) {
        this._cleanupClickOutside();
      }
    }
  }

  /**
   * Initialize combobox
   */
  function initCombobox(element) {
    if (getInstance(element, 'combobox')) return getInstance(element, 'combobox');

    const options = {
      placeholder: element.dataset.placeholder,
      emptyText: element.dataset.emptyText,
    };

    const instance = new Combobox(element, options);
    setInstance(element, 'combobox', instance);
    return instance;
  }

  // Register for auto-init
  BrandUI.registerComponent('combobox', initCombobox);

  // Export
  BrandUI.components.Combobox = Combobox;
  BrandUI.Combobox = initCombobox;
})();
