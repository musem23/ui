/**
 * Toggle Group Component
 * A group of toggle buttons supporting single or multiple selection
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'toggle-group';

  /**
   * ToggleGroup class
   */
  class ToggleGroup {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        type: element.dataset.type || options.type || 'single', // 'single' or 'multiple'
        loop: element.dataset.loop !== 'false',
        orientation: element.dataset.orientation || options.orientation || 'horizontal',
        ...options,
      };

      this.items = [];
      this.selectedValues = new Set();
      this.focusedIndex = 0;

      this._init();
    }

    _init() {
      // Get all toggle items
      this.items = BrandUI.$$('.toggle-group-item', this.element);

      // Set orientation for keyboard navigation
      this.element.setAttribute('data-orientation', this.options.orientation);

      // Initialize items
      this.items.forEach((item, index) => {
        // Set initial state
        const isPressed = item.getAttribute('aria-pressed') === 'true';
        if (isPressed) {
          this.selectedValues.add(this._getItemValue(item, index));
        }

        // Ensure proper attributes
        if (!item.hasAttribute('aria-pressed')) {
          item.setAttribute('aria-pressed', 'false');
        }
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');

        // Inherit variant and size from group if not set on item
        if (!item.dataset.variant && this.element.dataset.variant) {
          item.dataset.variant = this.element.dataset.variant;
        }
        if (!item.dataset.size && this.element.dataset.size) {
          item.dataset.size = this.element.dataset.size;
        }
      });

      this._bindEvents();

      // Store instance
      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    _bindEvents() {
      // Click handling
      BrandUI.on(this.element, 'click', '.toggle-group-item', (e, item) => {
        if (item.disabled || item.hasAttribute('disabled')) return;
        this._handleItemClick(item);
      });

      // Keyboard handling
      this.element.addEventListener('keydown', (e) => this._handleKeydown(e));
    }

    _handleItemClick(item) {
      const index = this.items.indexOf(item);
      const value = this._getItemValue(item, index);
      const isPressed = item.getAttribute('aria-pressed') === 'true';

      if (this.options.type === 'single') {
        // Single selection: deselect others, toggle this one
        if (isPressed) {
          // In single mode, clicking selected item deselects it
          this._setItemPressed(item, false);
          this.selectedValues.delete(value);
        } else {
          // Deselect all others first
          this.items.forEach((i, idx) => {
            const v = this._getItemValue(i, idx);
            if (i !== item && i.getAttribute('aria-pressed') === 'true') {
              this._setItemPressed(i, false);
              this.selectedValues.delete(v);
            }
          });
          // Select this one
          this._setItemPressed(item, true);
          this.selectedValues.add(value);
        }
      } else {
        // Multiple selection: toggle this item
        if (isPressed) {
          this._setItemPressed(item, false);
          this.selectedValues.delete(value);
        } else {
          this._setItemPressed(item, true);
          this.selectedValues.add(value);
        }
      }

      // Update focus management
      this._setFocusedIndex(index);

      // Emit change event
      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? this.getValue() : this.getValues(),
        item,
        pressed: item.getAttribute('aria-pressed') === 'true',
      });
    }

    _handleKeydown(e) {
      const currentIndex = this.items.findIndex(
        (item) => item === document.activeElement
      );
      if (currentIndex === -1) return;

      const isHorizontal = this.options.orientation === 'horizontal';

      switch (e.key) {
        case BrandUI.Keys.ARROW_LEFT:
        case BrandUI.Keys.ARROW_UP:
          if (
            (isHorizontal && e.key === BrandUI.Keys.ARROW_LEFT) ||
            (!isHorizontal && e.key === BrandUI.Keys.ARROW_UP)
          ) {
            e.preventDefault();
            this._moveFocus(currentIndex, -1);
          }
          break;

        case BrandUI.Keys.ARROW_RIGHT:
        case BrandUI.Keys.ARROW_DOWN:
          if (
            (isHorizontal && e.key === BrandUI.Keys.ARROW_RIGHT) ||
            (!isHorizontal && e.key === BrandUI.Keys.ARROW_DOWN)
          ) {
            e.preventDefault();
            this._moveFocus(currentIndex, 1);
          }
          break;

        case BrandUI.Keys.HOME:
          e.preventDefault();
          this._focusItem(0);
          break;

        case BrandUI.Keys.END:
          e.preventDefault();
          this._focusItem(this.items.length - 1);
          break;

        case BrandUI.Keys.ENTER:
        case BrandUI.Keys.SPACE:
          e.preventDefault();
          this._handleItemClick(this.items[currentIndex]);
          break;
      }
    }

    _moveFocus(currentIndex, direction) {
      const enabledItems = this.items.filter(
        (item) => !item.disabled && !item.hasAttribute('disabled')
      );
      const currentEnabledIndex = enabledItems.indexOf(this.items[currentIndex]);

      let newEnabledIndex = currentEnabledIndex + direction;

      if (this.options.loop) {
        if (newEnabledIndex < 0) {
          newEnabledIndex = enabledItems.length - 1;
        } else if (newEnabledIndex >= enabledItems.length) {
          newEnabledIndex = 0;
        }
      } else {
        newEnabledIndex = Math.max(0, Math.min(enabledItems.length - 1, newEnabledIndex));
      }

      const newItem = enabledItems[newEnabledIndex];
      if (newItem) {
        const newIndex = this.items.indexOf(newItem);
        this._focusItem(newIndex);
      }
    }

    _focusItem(index) {
      if (index < 0 || index >= this.items.length) return;

      const item = this.items[index];
      if (item.disabled || item.hasAttribute('disabled')) return;

      this._setFocusedIndex(index);
      item.focus();
    }

    _setFocusedIndex(index) {
      this.focusedIndex = index;
      this.items.forEach((item, i) => {
        item.setAttribute('tabindex', i === index ? '0' : '-1');
      });
    }

    _setItemPressed(item, pressed) {
      item.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    }

    _getItemValue(item, index) {
      return item.dataset.value || item.value || String(index);
    }

    // Public API

    /**
     * Get the selected value (for single type)
     */
    getValue() {
      const values = Array.from(this.selectedValues);
      return values.length > 0 ? values[0] : null;
    }

    /**
     * Get all selected values (for multiple type)
     */
    getValues() {
      return Array.from(this.selectedValues);
    }

    /**
     * Set the selected value(s)
     */
    setValue(value) {
      if (this.options.type === 'single') {
        // Deselect all
        this.items.forEach((item, index) => {
          const v = this._getItemValue(item, index);
          const shouldSelect = v === value;
          this._setItemPressed(item, shouldSelect);
          if (shouldSelect) {
            this.selectedValues.clear();
            this.selectedValues.add(v);
          }
        });
      } else {
        // For multiple, value should be an array
        const values = Array.isArray(value) ? value : [value];
        this.selectedValues.clear();

        this.items.forEach((item, index) => {
          const v = this._getItemValue(item, index);
          const shouldSelect = values.includes(v);
          this._setItemPressed(item, shouldSelect);
          if (shouldSelect) {
            this.selectedValues.add(v);
          }
        });
      }

      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? this.getValue() : this.getValues(),
      });
    }

    /**
     * Clear all selections
     */
    clear() {
      this.selectedValues.clear();
      this.items.forEach((item) => {
        this._setItemPressed(item, false);
      });

      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? null : [],
      });
    }

    /**
     * Destroy the component
     */
    destroy() {
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  /**
   * Initialize toggle group
   */
  function initToggleGroup(element) {
    if (BrandUI.getInstance(element, COMPONENT_NAME)) return;
    return new ToggleGroup(element);
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initToggleGroup);

  // Add to BrandUI namespace
  BrandUI.components.ToggleGroup = ToggleGroup;
  BrandUI.components.initToggleGroup = initToggleGroup;

})();
