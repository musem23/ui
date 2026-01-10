/**
 * Brand UI - Toggle Component
 * Vanilla JS implementation
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'toggle';

  /**
   * Toggle component
   */
  class Toggle {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        pressed: element.getAttribute('aria-pressed') === 'true',
        disabled: element.hasAttribute('disabled'),
        onChange: options.onChange || null,
        ...options,
      };

      this._init();
    }

    _init() {
      // Set initial ARIA state
      this.element.setAttribute('aria-pressed', String(this.options.pressed));

      // Bind event handlers
      this._handleClick = this._handleClick.bind(this);
      this._handleKeydown = this._handleKeydown.bind(this);

      // Attach event listeners
      this.element.addEventListener('click', this._handleClick);
      this.element.addEventListener('keydown', this._handleKeydown);

      // Store instance
      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    _handleClick(e) {
      if (this.options.disabled) {
        e.preventDefault();
        return;
      }

      this.toggle();
    }

    _handleKeydown(e) {
      if (this.options.disabled) return;

      // Toggle on Enter or Space
      if (e.key === BrandUI.Keys.ENTER || e.key === BrandUI.Keys.SPACE) {
        e.preventDefault();
        this.toggle();
      }
    }

    /**
     * Toggle the pressed state
     */
    toggle() {
      this.setPressed(!this.options.pressed);
    }

    /**
     * Set the pressed state
     */
    setPressed(pressed) {
      const wasPressed = this.options.pressed;
      this.options.pressed = pressed;

      // Update ARIA attribute
      this.element.setAttribute('aria-pressed', String(pressed));

      // Emit change event
      if (wasPressed !== pressed) {
        BrandUI.emit(this.element, 'toggle:change', {
          pressed: pressed,
        });

        // Call onChange callback if provided
        if (typeof this.options.onChange === 'function') {
          this.options.onChange(pressed);
        }
      }
    }

    /**
     * Get current pressed state
     */
    isPressed() {
      return this.options.pressed;
    }

    /**
     * Enable the toggle
     */
    enable() {
      this.options.disabled = false;
      this.element.removeAttribute('disabled');
    }

    /**
     * Disable the toggle
     */
    disable() {
      this.options.disabled = true;
      this.element.setAttribute('disabled', '');
    }

    /**
     * Destroy the component
     */
    destroy() {
      this.element.removeEventListener('click', this._handleClick);
      this.element.removeEventListener('keydown', this._handleKeydown);
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }

    /**
     * Static: Get instance from element
     */
    static getInstance(element) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    /**
     * Static: Create or get instance
     */
    static getOrCreateInstance(element, options) {
      return Toggle.getInstance(element) || new Toggle(element, options);
    }
  }

  /**
   * Initialize toggle from element
   */
  function initToggle(element) {
    const data = BrandUI.getData(element);
    return new Toggle(element, {
      pressed: data.pressed === 'true' || data.pressed === true,
    });
  }

  // Register component for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initToggle);

  // Add to BrandUI namespace
  BrandUI.components.Toggle = Toggle;

  // Export for ES modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toggle;
  }
})();
