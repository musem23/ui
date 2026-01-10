/**
 * Brand UI - Tabs Component
 * Vanilla JS implementation with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, setInstance, getInstance, registerComponent, Keys } = BrandUI;

  /**
   * Tabs Component
   */
  class Tabs {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        defaultValue: options.defaultValue || null,
        ...options,
      };

      this.list = null;
      this.triggers = [];
      this.panels = [];
      this.activeIndex = 0;

      this._init();
    }

    _init() {
      this.list = $('.tabs-list', this.element);
      this.triggers = $$('.tabs-trigger', this.element);
      this.panels = $$('.tabs-content', this.element);

      if (this.triggers.length === 0 || this.panels.length === 0) {
        return;
      }

      // Setup ARIA attributes
      this._setupAccessibility();

      // Determine initial active tab
      this._setInitialTab();

      // Bind events
      this._bindEvents();

      // Store instance
      setInstance(this.element, 'tabs', this);
    }

    _setupAccessibility() {
      // Set role on list
      if (this.list) {
        this.list.setAttribute('role', 'tablist');
      }

      this.triggers.forEach((trigger, index) => {
        const panelId = trigger.getAttribute('data-target') ||
                        trigger.getAttribute('aria-controls') ||
                        `tabs-panel-${index}`;
        const triggerId = trigger.id || `tabs-trigger-${index}`;

        trigger.setAttribute('role', 'tab');
        trigger.setAttribute('id', triggerId);
        trigger.setAttribute('aria-controls', panelId);
        trigger.setAttribute('tabindex', '-1');

        // Find corresponding panel
        const panel = this.panels[index] || $(`#${panelId}`, this.element);
        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('id', panelId);
          panel.setAttribute('aria-labelledby', triggerId);
          panel.setAttribute('tabindex', '0');
          panel.hidden = true;
        }
      });
    }

    _setInitialTab() {
      // Check for default value from data attribute or options
      const defaultValue = this.element.dataset.defaultValue || this.options.defaultValue;

      let initialIndex = 0;

      if (defaultValue) {
        // Find trigger with matching value
        const index = this.triggers.findIndex(
          (t) => t.dataset.value === defaultValue
        );
        if (index !== -1) {
          initialIndex = index;
        }
      } else {
        // Check for pre-selected trigger
        const preselectedIndex = this.triggers.findIndex(
          (t) => t.getAttribute('aria-selected') === 'true'
        );
        if (preselectedIndex !== -1) {
          initialIndex = preselectedIndex;
        }
      }

      this._activateTab(initialIndex, false);
    }

    _bindEvents() {
      // Click events on triggers
      this.triggers.forEach((trigger, index) => {
        on(trigger, 'click', (e) => {
          e.preventDefault();
          this._activateTab(index);
        });
      });

      // Keyboard navigation on list
      if (this.list) {
        on(this.list, 'keydown', (e) => this._handleKeydown(e));
      }
    }

    _handleKeydown(e) {
      const currentIndex = this.triggers.findIndex(
        (t) => t === document.activeElement
      );

      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case Keys.ARROW_LEFT:
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = this.triggers.length - 1;
          }
          handled = true;
          break;

        case Keys.ARROW_RIGHT:
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= this.triggers.length) {
            newIndex = 0;
          }
          handled = true;
          break;

        case Keys.HOME:
          e.preventDefault();
          newIndex = 0;
          handled = true;
          break;

        case Keys.END:
          e.preventDefault();
          newIndex = this.triggers.length - 1;
          handled = true;
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          this._activateTab(currentIndex);
          return;
      }

      if (handled && newIndex !== currentIndex) {
        this.triggers[newIndex].focus();
        this._activateTab(newIndex);
      }
    }

    _activateTab(index, emitEvent = true) {
      if (index < 0 || index >= this.triggers.length) return;

      const prevIndex = this.activeIndex;
      this.activeIndex = index;

      // Update triggers
      this.triggers.forEach((trigger, i) => {
        const isActive = i === index;
        trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
        trigger.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Update panels
      this.panels.forEach((panel, i) => {
        panel.hidden = i !== index;
      });

      // Emit change event
      if (emitEvent && prevIndex !== index) {
        const value = this.triggers[index].dataset.value || index;
        emit(this.element, 'tabs:change', {
          index,
          value,
          trigger: this.triggers[index],
          panel: this.panels[index],
        });
      }
    }

    // Public API

    /**
     * Activate a tab by index
     */
    select(index) {
      this._activateTab(index);
    }

    /**
     * Activate a tab by value
     */
    selectByValue(value) {
      const index = this.triggers.findIndex((t) => t.dataset.value === value);
      if (index !== -1) {
        this._activateTab(index);
      }
    }

    /**
     * Get current active index
     */
    getActiveIndex() {
      return this.activeIndex;
    }

    /**
     * Get current active value
     */
    getActiveValue() {
      return this.triggers[this.activeIndex]?.dataset.value || this.activeIndex;
    }

    /**
     * Destroy the component
     */
    destroy() {
      setInstance(this.element, 'tabs', null);
    }
  }

  // Factory function
  function createTabs(element, options) {
    const existing = getInstance(element, 'tabs');
    if (existing) return existing;
    return new Tabs(element, options);
  }

  // Register for auto-init
  registerComponent('tabs', (element) => {
    createTabs(element);
  });

  // Export
  BrandUI.components.Tabs = Tabs;
  BrandUI.createTabs = createTabs;
})();
