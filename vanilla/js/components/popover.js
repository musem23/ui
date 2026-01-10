/**
 * Brand UI - Popover Component
 * Positioned floating content that appears on click
 */

(function () {
  'use strict';

  const { $, $$, on, emit, getData, onClickOutside, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  /**
   * Popover Component
   */
  function Popover(element) {
    // Prevent double initialization
    if (getInstance(element, 'popover')) {
      return getInstance(element, 'popover');
    }

    // Elements
    const trigger = element.querySelector('[data-popover-trigger]');
    const content = element.querySelector('[data-popover-content]');

    if (!trigger || !content) {
      console.warn('Popover: Missing trigger or content element', element);
      return null;
    }

    // State
    let isOpen = false;
    let removeClickOutside = null;

    // Get options from data attributes
    const options = {
      side: content.dataset.side || 'bottom',
      align: content.dataset.align || 'center',
    };

    // Set initial ARIA attributes
    const triggerId = trigger.id || BrandUI.uid('popover-trigger');
    const contentId = content.id || BrandUI.uid('popover-content');

    trigger.id = triggerId;
    content.id = contentId;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', contentId);
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-labelledby', triggerId);
    content.setAttribute('data-state', 'closed');

    /**
     * Open popover
     */
    function open() {
      if (isOpen) return;

      isOpen = true;
      content.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');

      // Setup click outside handler
      removeClickOutside = onClickOutside(element, () => {
        close();
      });

      // Emit event
      emit(element, 'popover:open', { popover: api });
    }

    /**
     * Close popover
     */
    function close() {
      if (!isOpen) return;

      isOpen = false;
      content.setAttribute('data-state', 'closed');
      trigger.setAttribute('aria-expanded', 'false');

      // Remove click outside handler
      if (removeClickOutside) {
        removeClickOutside();
        removeClickOutside = null;
      }

      // Return focus to trigger
      trigger.focus();

      // Emit event
      emit(element, 'popover:close', { popover: api });
    }

    /**
     * Toggle popover
     */
    function toggle() {
      if (isOpen) {
        close();
      } else {
        open();
      }
    }

    /**
     * Handle trigger click
     */
    function handleTriggerClick(e) {
      e.preventDefault();
      toggle();
    }

    /**
     * Handle keydown
     */
    function handleKeydown(e) {
      if (e.key === Keys.ESCAPE && isOpen) {
        e.preventDefault();
        close();
      }
    }

    // Bind events
    const unbindTrigger = on(trigger, 'click', handleTriggerClick);
    const unbindKeydown = on(element, 'keydown', handleKeydown);

    /**
     * Destroy popover
     */
    function destroy() {
      unbindTrigger();
      unbindKeydown();

      if (removeClickOutside) {
        removeClickOutside();
      }

      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
      content.removeAttribute('role');
      content.removeAttribute('aria-labelledby');
      content.removeAttribute('data-state');

      removeInstance(element, 'popover');

      emit(element, 'popover:destroy', { popover: api });
    }

    // Public API
    const api = {
      element,
      trigger,
      content,
      open,
      close,
      toggle,
      isOpen: () => isOpen,
      destroy,
    };

    // Store instance
    setInstance(element, 'popover', api);

    return api;
  }

  // Register for auto-initialization
  registerComponent('popover', Popover);

  // Add to BrandUI namespace
  BrandUI.components.Popover = Popover;

  /**
   * Create popover programmatically
   */
  BrandUI.createPopover = function (element, options = {}) {
    return new Popover(element, options);
  };
})();
