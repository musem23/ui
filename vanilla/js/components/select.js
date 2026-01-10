/**
 * Brand UI - Select Component
 * Custom styled dropdown select with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  // SVG Icons
  const CHEVRON_DOWN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

  const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

  /**
   * Select Component
   */
  class Select {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        placeholder: 'Select an option',
        defaultValue: null,
        disabled: false,
        required: false,
        name: null,
        ...options,
      };

      this.isOpen = false;
      this.selectedValue = null;
      this.selectedLabel = null;
      this.highlightedIndex = -1;
      this.items = [];
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      // Parse options from data attributes
      const data = this.element.dataset;
      if (data.placeholder) this.options.placeholder = data.placeholder;
      if (data.value) this.options.defaultValue = data.value;
      if (data.disabled !== undefined) this.options.disabled = true;
      if (data.required !== undefined) this.options.required = true;
      if (data.name) this.options.name = data.name;

      // Build the select structure
      this._buildSelect();
      this._bindEvents();

      // Set initial value
      if (this.options.defaultValue) {
        this.setValue(this.options.defaultValue, { silent: true });
      }

      setInstance(this.element, 'select', this);
    }

    _buildSelect() {
      // Check if content already has structure or needs to be parsed
      const existingTrigger = $('.select-trigger', this.element);
      const existingContent = $('.select-content', this.element);

      if (existingTrigger && existingContent) {
        // Already structured, just enhance
        this.trigger = existingTrigger;
        this.content = existingContent;
        this.valueEl = $('.select-value', this.trigger);

        // Add icon if missing
        if (!$('.select-icon', this.trigger)) {
          const icon = document.createElement('span');
          icon.className = 'select-icon';
          icon.innerHTML = CHEVRON_DOWN_ICON;
          this.trigger.appendChild(icon);
        }

        // Add indicators to items
        $$('.select-item', this.content).forEach((item) => {
          if (!$('.select-item-indicator', item)) {
            const indicator = document.createElement('span');
            indicator.className = 'select-item-indicator';
            indicator.innerHTML = CHECK_ICON;
            item.appendChild(indicator);
          }
        });
      } else {
        // Parse from native select or build from scratch
        this._buildFromNative();
      }

      // Gather items
      this._updateItems();

      // Set ARIA attributes
      const triggerId = this.trigger.id || uid('select-trigger');
      const contentId = this.content.id || uid('select-content');

      this.trigger.id = triggerId;
      this.content.id = contentId;

      this.trigger.setAttribute('role', 'combobox');
      this.trigger.setAttribute('aria-haspopup', 'listbox');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-controls', contentId);
      this.trigger.setAttribute('tabindex', '0');

      if (this.options.disabled) {
        this.trigger.setAttribute('aria-disabled', 'true');
        this.trigger.setAttribute('tabindex', '-1');
      }

      this.content.setAttribute('role', 'listbox');
      this.content.setAttribute('aria-labelledby', triggerId);
      this.content.setAttribute('tabindex', '-1');

      // Set items roles
      this.items.forEach((item, index) => {
        item.setAttribute('role', 'option');
        item.id = item.id || uid('select-item');
        item.setAttribute('aria-selected', 'false');
      });

      // Add hidden input for form submission
      if (this.options.name && !$('input[type="hidden"]', this.element)) {
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'hidden';
        this.hiddenInput.name = this.options.name;
        if (this.options.required) {
          this.hiddenInput.required = true;
        }
        this.element.appendChild(this.hiddenInput);
      } else {
        this.hiddenInput = $('input[type="hidden"]', this.element);
      }

      // Set placeholder
      if (!this.selectedValue && this.valueEl) {
        this.valueEl.textContent = this.options.placeholder;
        this.trigger.setAttribute('data-placeholder', 'true');
      }
    }

    _buildFromNative() {
      const nativeSelect = $('select', this.element);

      if (nativeSelect) {
        // Hide native select
        nativeSelect.style.display = 'none';
        nativeSelect.setAttribute('tabindex', '-1');
        nativeSelect.setAttribute('aria-hidden', 'true');

        // Create custom structure
        this.trigger = document.createElement('button');
        this.trigger.type = 'button';
        this.trigger.className = 'select-trigger';

        this.valueEl = document.createElement('span');
        this.valueEl.className = 'select-value';
        this.trigger.appendChild(this.valueEl);

        const icon = document.createElement('span');
        icon.className = 'select-icon';
        icon.innerHTML = CHEVRON_DOWN_ICON;
        this.trigger.appendChild(icon);

        this.content = document.createElement('div');
        this.content.className = 'select-content';

        // Parse options
        const groups = $$('optgroup', nativeSelect);

        if (groups.length > 0) {
          groups.forEach((group) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'select-group';

            const labelEl = document.createElement('div');
            labelEl.className = 'select-label';
            labelEl.textContent = group.label;
            groupEl.appendChild(labelEl);

            $$('option', group).forEach((option) => {
              const itemEl = this._createItem(option);
              groupEl.appendChild(itemEl);
            });

            this.content.appendChild(groupEl);
          });
        }

        // Parse ungrouped options
        $$(':scope > option', nativeSelect).forEach((option) => {
          const itemEl = this._createItem(option);
          this.content.appendChild(itemEl);
        });

        this.element.appendChild(this.trigger);
        this.element.appendChild(this.content);

        // Sync hidden input
        this.hiddenInput = nativeSelect;
      }
    }

    _createItem(option) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'select-item';
      item.setAttribute('data-value', option.value);
      item.textContent = option.textContent;

      if (option.disabled) {
        item.setAttribute('aria-disabled', 'true');
        item.disabled = true;
      }

      const indicator = document.createElement('span');
      indicator.className = 'select-item-indicator';
      indicator.innerHTML = CHECK_ICON;
      item.appendChild(indicator);

      return item;
    }

    _updateItems() {
      this.items = $$('.select-item:not([aria-disabled="true"]):not([disabled])', this.content);
    }

    _bindEvents() {
      // Trigger click
      on(this.trigger, 'click', (e) => {
        e.preventDefault();
        if (this.options.disabled) return;
        this.toggle();
      });

      // Trigger keyboard
      on(this.trigger, 'keydown', (e) => {
        if (this.options.disabled) return;
        this._handleTriggerKeydown(e);
      });

      // Content keyboard
      on(this.content, 'keydown', (e) => {
        this._handleContentKeydown(e);
      });

      // Item click
      on(this.content, 'click', '.select-item', (e, item) => {
        if (item.hasAttribute('aria-disabled') || item.disabled) return;
        this._selectItem(item);
      });

      // Item hover
      on(this.content, 'mouseover', '.select-item', (e, item) => {
        if (item.hasAttribute('aria-disabled') || item.disabled) return;
        const index = this.items.indexOf(item);
        if (index !== -1) {
          this._highlightItem(index);
        }
      });
    }

    _handleTriggerKeydown(e) {
      switch (e.key) {
        case Keys.ENTER:
        case Keys.SPACE:
        case Keys.ARROW_DOWN:
        case Keys.ARROW_UP:
          e.preventDefault();
          this.open();
          break;
      }
    }

    _handleContentKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._highlightNext();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._highlightPrev();
          break;

        case Keys.HOME:
          e.preventDefault();
          this._highlightItem(0);
          break;

        case Keys.END:
          e.preventDefault();
          this._highlightItem(this.items.length - 1);
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (this.highlightedIndex >= 0 && this.items[this.highlightedIndex]) {
            this._selectItem(this.items[this.highlightedIndex]);
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          this.trigger.focus();
          break;

        case Keys.TAB:
          this.close();
          break;

        default:
          // Type-ahead search
          if (e.key.length === 1) {
            this._typeAhead(e.key);
          }
          break;
      }
    }

    _typeAhead(char) {
      const searchChar = char.toLowerCase();
      const startIndex = this.highlightedIndex + 1;

      // Search from current position
      for (let i = startIndex; i < this.items.length; i++) {
        if (this.items[i].textContent.trim().toLowerCase().startsWith(searchChar)) {
          this._highlightItem(i);
          return;
        }
      }

      // Wrap around
      for (let i = 0; i < startIndex; i++) {
        if (this.items[i].textContent.trim().toLowerCase().startsWith(searchChar)) {
          this._highlightItem(i);
          return;
        }
      }
    }

    _highlightItem(index) {
      // Remove previous highlight
      this.items.forEach((item) => {
        item.classList.remove('select-item--highlighted');
      });

      this.highlightedIndex = index;

      if (index >= 0 && this.items[index]) {
        const item = this.items[index];
        item.classList.add('select-item--highlighted');
        item.focus();

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });
      }
    }

    _highlightNext() {
      let next = this.highlightedIndex + 1;
      if (next >= this.items.length) {
        next = 0;
      }
      this._highlightItem(next);
    }

    _highlightPrev() {
      let prev = this.highlightedIndex - 1;
      if (prev < 0) {
        prev = this.items.length - 1;
      }
      this._highlightItem(prev);
    }

    _selectItem(item) {
      const value = item.getAttribute('data-value');
      const label = item.textContent.replace(/\s*$/, '').trim();

      // Update selection state
      this.items.forEach((i) => {
        i.setAttribute('aria-selected', 'false');
      });
      item.setAttribute('aria-selected', 'true');

      this.selectedValue = value;
      this.selectedLabel = label;

      // Update trigger
      if (this.valueEl) {
        this.valueEl.textContent = label;
        this.trigger.removeAttribute('data-placeholder');
      }

      // Update hidden input
      if (this.hiddenInput) {
        this.hiddenInput.value = value;
      }

      // Update activedescendant
      this.trigger.setAttribute('aria-activedescendant', item.id);

      this.close();
      this.trigger.focus();

      emit(this.element, 'change', { value, label });
      emit(this.element, 'select:change', { value, label });
    }

    open() {
      if (this.isOpen || this.options.disabled) return;

      this.isOpen = true;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.classList.add('select-content--open');

      // Highlight selected or first item
      const selectedItem = $('.select-item[aria-selected="true"]', this.content);
      if (selectedItem) {
        const index = this.items.indexOf(selectedItem);
        this._highlightItem(index);
      } else if (this.items.length > 0) {
        this._highlightItem(0);
      }

      // Click outside to close
      this.cleanupClickOutside = onClickOutside(this.element, () => {
        this.close();
      });

      emit(this.element, 'select:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.classList.remove('select-content--open');
      this.highlightedIndex = -1;

      // Remove highlights
      this.items.forEach((item) => {
        item.classList.remove('select-item--highlighted');
      });

      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.element, 'select:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    getValue() {
      return this.selectedValue;
    }

    setValue(value, options = {}) {
      const item = $(`.select-item[data-value="${value}"]`, this.content);
      if (item) {
        const label = item.textContent.replace(/\s*$/, '').trim();

        this.items.forEach((i) => {
          i.setAttribute('aria-selected', 'false');
        });
        item.setAttribute('aria-selected', 'true');

        this.selectedValue = value;
        this.selectedLabel = label;

        if (this.valueEl) {
          this.valueEl.textContent = label;
          this.trigger.removeAttribute('data-placeholder');
        }

        if (this.hiddenInput) {
          this.hiddenInput.value = value;
        }

        this.trigger.setAttribute('aria-activedescendant', item.id);

        if (!options.silent) {
          emit(this.element, 'change', { value, label });
          emit(this.element, 'select:change', { value, label });
        }
      }
    }

    clear() {
      this.items.forEach((i) => {
        i.setAttribute('aria-selected', 'false');
      });

      this.selectedValue = null;
      this.selectedLabel = null;

      if (this.valueEl) {
        this.valueEl.textContent = this.options.placeholder;
        this.trigger.setAttribute('data-placeholder', 'true');
      }

      if (this.hiddenInput) {
        this.hiddenInput.value = '';
      }

      this.trigger.removeAttribute('aria-activedescendant');

      emit(this.element, 'change', { value: null, label: null });
      emit(this.element, 'select:change', { value: null, label: null });
    }

    enable() {
      this.options.disabled = false;
      this.trigger.removeAttribute('aria-disabled');
      this.trigger.setAttribute('tabindex', '0');
      this.trigger.disabled = false;
    }

    disable() {
      this.options.disabled = true;
      this.trigger.setAttribute('aria-disabled', 'true');
      this.trigger.setAttribute('tabindex', '-1');
      this.trigger.disabled = true;
      this.close();
    }

    destroy() {
      this.close();
      removeInstance(this.element, 'select');
    }
  }

  /**
   * Initialize select component
   */
  function initSelect(element) {
    if (getInstance(element, 'select')) {
      return getInstance(element, 'select');
    }
    return new Select(element);
  }

  // Register for auto-init
  registerComponent('select', initSelect);

  // Export to BrandUI
  BrandUI.components.Select = Select;
  BrandUI.components.initSelect = initSelect;
})();
