/**
 * Brand UI - Tooltip Component
 * Vanilla JS tooltip with hover/focus, delay, and positioning
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'tooltip';
  const DEFAULT_DELAY = 200;
  const DEFAULT_POSITION = 'top';

  /**
   * Tooltip class
   */
  class Tooltip {
    constructor(element, options = {}) {
      this.element = element;
      this.trigger = element.querySelector('.tooltip-trigger');
      this.content = element.querySelector('.tooltip-content');

      if (!this.trigger || !this.content) {
        console.warn('Tooltip: Missing .tooltip-trigger or .tooltip-content');
        return;
      }

      // Options from data attributes or passed options
      const data = BrandUI.getData(element, 'tooltip');
      this.options = {
        delay: parseInt(data.delay ?? options.delay ?? DEFAULT_DELAY, 10),
        position: data.position ?? options.position ?? DEFAULT_POSITION,
      };

      this.showTimeout = null;
      this.hideTimeout = null;
      this.isVisible = false;

      this._init();
      BrandUI.setInstance(element, COMPONENT_NAME, this);
    }

    _init() {
      // Set position data attribute
      this.content.setAttribute('data-position', this.options.position);

      // Generate IDs for accessibility
      const id = BrandUI.uid('tooltip');
      this.content.id = id;
      this.trigger.setAttribute('aria-describedby', id);

      // Bind events
      this._bindEvents();
    }

    _bindEvents() {
      // Mouse events
      this.trigger.addEventListener('mouseenter', () => this._scheduleShow());
      this.trigger.addEventListener('mouseleave', () => this._scheduleHide());

      // Focus events
      this.trigger.addEventListener('focus', () => this._scheduleShow());
      this.trigger.addEventListener('blur', () => this._scheduleHide());

      // Escape to hide
      this.trigger.addEventListener('keydown', (e) => {
        if (e.key === BrandUI.Keys.ESCAPE && this.isVisible) {
          this.hide();
        }
      });
    }

    _scheduleShow() {
      clearTimeout(this.hideTimeout);
      this.showTimeout = setTimeout(() => this.show(), this.options.delay);
    }

    _scheduleHide() {
      clearTimeout(this.showTimeout);
      this.hideTimeout = setTimeout(() => this.hide(), 100);
    }

    show() {
      if (this.isVisible) return;

      this.isVisible = true;
      this.element.classList.add('is-visible');
      BrandUI.emit(this.element, 'tooltip:show');
    }

    hide() {
      if (!this.isVisible) return;

      this.isVisible = false;
      this.element.classList.remove('is-visible');
      BrandUI.emit(this.element, 'tooltip:hide');
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    setPosition(position) {
      this.options.position = position;
      this.content.setAttribute('data-position', position);
    }

    destroy() {
      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
      this.element.classList.remove('is-visible');
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  /**
   * Factory function
   */
  function createTooltip(element, options) {
    const existing = BrandUI.getInstance(element, COMPONENT_NAME);
    if (existing) return existing;
    return new Tooltip(element, options);
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, createTooltip);

  // Add to components namespace
  BrandUI.components.Tooltip = Tooltip;
  BrandUI.components.createTooltip = createTooltip;
})();
