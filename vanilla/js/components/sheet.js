/**
 * Brand UI - Sheet Component
 * Slide-in panel with focus trap, scroll lock, ESC and click outside to close
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'sheet';

  /**
   * Sheet component
   */
  function Sheet(triggerElement) {
    const targetId = triggerElement.getAttribute('data-sheet');
    const overlay = document.getElementById(targetId);

    if (!overlay) {
      console.warn(`Sheet: No overlay found with id "${targetId}"`);
      return null;
    }

    const content = overlay.nextElementSibling;
    if (!content || !content.classList.contains('sheet-content')) {
      console.warn(`Sheet: No content found after overlay "${targetId}"`);
      return null;
    }

    const closeButtons = content.querySelectorAll('.sheet-close, [data-sheet-close]');
    const side = content.getAttribute('data-side') || 'right';

    let isOpen = false;
    let focusTrap = null;
    let previousActiveElement = null;
    let cleanupClickOutside = null;

    // Ensure side attribute is set
    content.setAttribute('data-side', side);

    // Initialize focus trap
    if (BrandUI.createFocusTrap) {
      focusTrap = BrandUI.createFocusTrap(content);
    }

    /**
     * Open the sheet
     */
    function open() {
      if (isOpen) return;

      previousActiveElement = document.activeElement;
      isOpen = true;

      // Lock scroll
      BrandUI.lockScroll();

      // Update state
      overlay.setAttribute('data-state', 'open');
      content.setAttribute('data-state', 'open');
      triggerElement.setAttribute('aria-expanded', 'true');

      // Activate focus trap
      if (focusTrap) {
        focusTrap.activate();
      }

      // Setup click outside handler
      cleanupClickOutside = BrandUI.onClickOutside(content, (e) => {
        // Only close if clicking on overlay
        if (e.target === overlay) {
          close();
        }
      });

      // Emit open event
      BrandUI.emit(content, 'sheet:open');
    }

    /**
     * Close the sheet
     */
    function close() {
      if (!isOpen) return;

      isOpen = false;

      // Update state
      overlay.setAttribute('data-state', 'closed');
      content.setAttribute('data-state', 'closed');
      triggerElement.setAttribute('aria-expanded', 'false');

      // Deactivate focus trap
      if (focusTrap) {
        focusTrap.deactivate();
      }

      // Cleanup click outside
      if (cleanupClickOutside) {
        cleanupClickOutside();
        cleanupClickOutside = null;
      }

      // Unlock scroll
      BrandUI.unlockScroll();

      // Restore focus
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }

      // Emit close event
      BrandUI.emit(content, 'sheet:close');
    }

    /**
     * Toggle the sheet
     */
    function toggle() {
      if (isOpen) {
        close();
      } else {
        open();
      }
    }

    /**
     * Handle keydown events
     */
    function handleKeydown(e) {
      if (e.key === BrandUI.Keys.ESCAPE && isOpen) {
        e.preventDefault();
        close();
      }
    }

    // Event listeners
    triggerElement.addEventListener('click', toggle);
    document.addEventListener('keydown', handleKeydown);

    // Close button listeners
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', close);
    });

    // Click on overlay to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Set initial state
    overlay.setAttribute('data-state', 'closed');
    content.setAttribute('data-state', 'closed');
    triggerElement.setAttribute('aria-expanded', 'false');
    triggerElement.setAttribute('aria-haspopup', 'dialog');

    // Add ARIA attributes
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'true');

    // API
    const api = {
      open,
      close,
      toggle,
      isOpen: () => isOpen,
      destroy() {
        triggerElement.removeEventListener('click', toggle);
        document.removeEventListener('keydown', handleKeydown);
        closeButtons.forEach((btn) => {
          btn.removeEventListener('click', close);
        });
        if (cleanupClickOutside) {
          cleanupClickOutside();
        }
        if (focusTrap) {
          focusTrap.deactivate();
        }
        BrandUI.removeInstance(triggerElement, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(triggerElement, COMPONENT_NAME, api);
    return api;
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, Sheet);

  // Add to components namespace
  BrandUI.components.Sheet = Sheet;

  // Static methods
  BrandUI.components.Sheet.open = function (id) {
    const trigger = document.querySelector(`[data-sheet="${id}"]`);
    if (trigger) {
      const instance = BrandUI.getInstance(trigger, COMPONENT_NAME);
      if (instance) instance.open();
    }
  };

  BrandUI.components.Sheet.close = function (id) {
    const trigger = document.querySelector(`[data-sheet="${id}"]`);
    if (trigger) {
      const instance = BrandUI.getInstance(trigger, COMPONENT_NAME);
      if (instance) instance.close();
    }
  };
})();
