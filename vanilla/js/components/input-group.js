/**
 * Brand UI - Input Group Component
 * Handles focus management and click-to-focus behavior for input groups
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'input-group';

  /**
   * Initialize an input group element
   */
  function initInputGroup(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return;
    }

    const input = element.querySelector('.input-group-input, .input-group-textarea');
    const addons = element.querySelectorAll('.input-group-addon');

    /**
     * Handle addon click to focus input
     */
    function handleAddonClick(e) {
      // Don't focus if clicking a button or interactive element within addon
      if (e.target.closest('button, a, input, select')) {
        return;
      }

      if (input) {
        input.focus();
      }
    }

    // Attach click handlers to addons
    addons.forEach((addon) => {
      addon.addEventListener('click', handleAddonClick);
    });

    // Store instance
    const instance = {
      element,
      input,
      addons,

      /**
       * Focus the input
       */
      focus() {
        if (input) {
          input.focus();
        }
      },

      /**
       * Blur the input
       */
      blur() {
        if (input) {
          input.blur();
        }
      },

      /**
       * Set disabled state
       */
      setDisabled(disabled) {
        element.dataset.disabled = disabled ? 'true' : 'false';
        if (input) {
          input.disabled = disabled;
        }
      },

      /**
       * Set error state
       */
      setError(hasError) {
        if (input) {
          input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
        }
      },

      /**
       * Get the input value
       */
      getValue() {
        return input ? input.value : '';
      },

      /**
       * Set the input value
       */
      setValue(value) {
        if (input) {
          input.value = value;
          BrandUI.emit(input, 'input', { value });
        }
      },

      /**
       * Destroy the instance
       */
      destroy() {
        addons.forEach((addon) => {
          addon.removeEventListener('click', handleAddonClick);
        });
        BrandUI.removeInstance(element, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, instance);

    return instance;
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initInputGroup);

  // Add to components namespace
  BrandUI.components.InputGroup = {
    init: initInputGroup,

    /**
     * Get instance from element
     */
    getInstance(element) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    },

    /**
     * Initialize all input groups in a container
     */
    initAll(root = document) {
      BrandUI.$$('.input-group', root).forEach(initInputGroup);
    },
  };
})();
