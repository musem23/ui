/**
 * Brand UI - Checkbox Component
 * Accessible checkbox with keyboard support and indeterminate state.
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'checkbox';

  /**
   * Checkbox Icons (inline SVG)
   */
  const ICONS = {
    check: `<svg class="checkbox-icon-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    minus: `<svg class="checkbox-icon-minus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  };

  /**
   * Initialize a checkbox element
   */
  function initCheckbox(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const config = BrandUI.getData(element);
    const initialChecked = config.checked === 'true' || config.checked === true;
    const initialIndeterminate = config.indeterminate === 'true' || config.indeterminate === true;

    // Set initial state
    if (initialIndeterminate) {
      element.setAttribute('aria-checked', 'mixed');
    } else {
      element.setAttribute('aria-checked', initialChecked ? 'true' : 'false');
    }

    // Ensure proper role
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'checkbox');
    }

    // Make focusable
    if (!element.hasAttribute('tabindex') && !element.disabled) {
      element.setAttribute('tabindex', '0');
    }

    // Add indicator if not present
    let indicator = element.querySelector('.checkbox-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'checkbox-indicator';
      indicator.innerHTML = ICONS.check + ICONS.minus;
      element.appendChild(indicator);
    }

    /**
     * Get current state
     */
    function getState() {
      const ariaChecked = element.getAttribute('aria-checked');
      return {
        checked: ariaChecked === 'true',
        indeterminate: ariaChecked === 'mixed',
      };
    }

    /**
     * Set checkbox state
     */
    function setState(checked, indeterminate = false) {
      if (element.disabled) return;

      const previousState = getState();

      if (indeterminate) {
        element.setAttribute('aria-checked', 'mixed');
      } else {
        element.setAttribute('aria-checked', checked ? 'true' : 'false');
      }

      const newState = getState();

      // Emit change event
      if (previousState.checked !== newState.checked || previousState.indeterminate !== newState.indeterminate) {
        BrandUI.emit(element, 'checkbox:change', newState);
      }
    }

    /**
     * Toggle checkbox
     */
    function toggle() {
      if (element.disabled) return;

      const state = getState();

      // If indeterminate, go to checked
      // Otherwise toggle checked state
      if (state.indeterminate) {
        setState(true, false);
      } else {
        setState(!state.checked, false);
      }
    }

    /**
     * Handle click
     */
    function handleClick(e) {
      e.preventDefault();
      toggle();
    }

    /**
     * Handle keyboard
     */
    function handleKeydown(e) {
      if (e.key === BrandUI.Keys.SPACE) {
        e.preventDefault();
        toggle();
      }
    }

    // Bind events
    const removeClick = BrandUI.on(element, 'click', handleClick);
    const removeKeydown = BrandUI.on(element, 'keydown', handleKeydown);

    // Handle associated label clicks
    const id = element.id;
    if (id) {
      const labels = document.querySelectorAll(`label[for="${id}"]`);
      labels.forEach((label) => {
        BrandUI.on(label, 'click', (e) => {
          e.preventDefault();
          element.focus();
          toggle();
        });
      });
    }

    // API
    const api = {
      element,

      getState,

      check() {
        setState(true, false);
      },

      uncheck() {
        setState(false, false);
      },

      toggle,

      setIndeterminate(value = true) {
        setState(false, value);
      },

      destroy() {
        removeClick();
        removeKeydown();
        BrandUI.removeInstance(element, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, api);

    return api;
  }

  /**
   * Create a new checkbox element
   */
  function createCheckbox(options = {}) {
    const {
      id,
      name,
      checked = false,
      indeterminate = false,
      disabled = false,
      invalid = false,
      className = '',
    } = options;

    const checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = `checkbox ${className}`.trim();
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('data-checkbox', '');

    if (id) checkbox.id = id;
    if (name) checkbox.setAttribute('data-name', name);
    if (disabled) checkbox.disabled = true;
    if (invalid) checkbox.setAttribute('aria-invalid', 'true');

    // Set initial state
    if (indeterminate) {
      checkbox.setAttribute('data-indeterminate', 'true');
    } else if (checked) {
      checkbox.setAttribute('data-checked', 'true');
    }

    // Initialize
    return initCheckbox(checkbox);
  }

  // Register component for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, initCheckbox);

  // Expose to BrandUI namespace
  BrandUI.components.Checkbox = {
    init: initCheckbox,
    create: createCheckbox,
  };
})();
