/**
 * Brand UI - Switch Component
 * Vanilla JS toggle switch with accessibility support
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'switch';

  /**
   * Switch component class
   */
  class Switch {
    constructor(element) {
      this.element = element;
      this.checked = element.getAttribute('aria-checked') === 'true';

      this._init();
    }

    _init() {
      // Ensure proper ARIA attributes
      if (!this.element.hasAttribute('role')) {
        this.element.setAttribute('role', 'switch');
      }
      if (!this.element.hasAttribute('tabindex') && !this.isDisabled()) {
        this.element.setAttribute('tabindex', '0');
      }
      if (!this.element.hasAttribute('aria-checked')) {
        this.element.setAttribute('aria-checked', 'false');
      }

      // Bind events
      this._onClick = this._onClick.bind(this);
      this._onKeydown = this._onKeydown.bind(this);

      this.element.addEventListener('click', this._onClick);
      this.element.addEventListener('keydown', this._onKeydown);

      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    _onClick(e) {
      if (this.isDisabled()) return;
      this.toggle();
    }

    _onKeydown(e) {
      if (this.isDisabled()) return;

      if (e.key === BrandUI.Keys.SPACE || e.key === BrandUI.Keys.ENTER) {
        e.preventDefault();
        this.toggle();
      }
    }

    /**
     * Check if switch is disabled
     */
    isDisabled() {
      return (
        this.element.hasAttribute('disabled') ||
        this.element.getAttribute('aria-disabled') === 'true'
      );
    }

    /**
     * Toggle the switch state
     */
    toggle() {
      this.setChecked(!this.checked);
    }

    /**
     * Set checked state
     */
    setChecked(checked) {
      if (this.checked === checked) return;

      this.checked = checked;
      this.element.setAttribute('aria-checked', String(checked));

      BrandUI.emit(this.element, 'switch:change', { checked });
    }

    /**
     * Get checked state
     */
    getChecked() {
      return this.checked;
    }

    /**
     * Enable the switch
     */
    enable() {
      this.element.removeAttribute('disabled');
      this.element.removeAttribute('aria-disabled');
      this.element.setAttribute('tabindex', '0');
    }

    /**
     * Disable the switch
     */
    disable() {
      this.element.setAttribute('aria-disabled', 'true');
      this.element.removeAttribute('tabindex');
    }

    /**
     * Destroy the component
     */
    destroy() {
      this.element.removeEventListener('click', this._onClick);
      this.element.removeEventListener('keydown', this._onKeydown);
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  /**
   * Initialize a switch element
   */
  function initSwitch(element) {
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }
    return new Switch(element);
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initSwitch);

  // Add to components namespace
  BrandUI.components.Switch = Switch;
  BrandUI.components.initSwitch = initSwitch;
})();
