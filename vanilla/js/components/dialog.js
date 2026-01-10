/**
 * Brand UI - Dialog Component
 * Modal dialog with focus trap, scroll lock, and keyboard support
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, createFocusTrap, lockScroll, unlockScroll, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  const TRANSITION_DURATION = 200;

  /**
   * Dialog Component
   */
  class Dialog {
    constructor(element, options = {}) {
      this.dialog = element;
      this.id = this.dialog.id || uid('dialog');
      this.dialog.id = this.id;

      this.options = {
        closeOnOverlay: options.closeOnOverlay !== false,
        closeOnEscape: options.closeOnEscape !== false,
        ...options
      };

      this.overlay = null;
      this.content = null;
      this.triggers = [];
      this.focusTrap = null;
      this.previousActiveElement = null;
      this.isOpen = false;
      this.isClosing = false;

      this._init();
      setInstance(element, 'dialog', this);
    }

    _init() {
      this.overlay = $('.dialog-overlay', this.dialog);
      this.content = $('.dialog-content', this.dialog);

      if (!this.overlay || !this.content) {
        console.warn('Dialog: Missing required elements (.dialog-overlay, .dialog-content)');
        return;
      }

      // Set ARIA attributes
      this.content.setAttribute('role', 'dialog');
      this.content.setAttribute('aria-modal', 'true');

      // Link title and description
      const title = $('.dialog-title', this.content);
      const description = $('.dialog-description', this.content);

      if (title) {
        const titleId = title.id || uid('dialog-title');
        title.id = titleId;
        this.content.setAttribute('aria-labelledby', titleId);
      }

      if (description) {
        const descId = description.id || uid('dialog-description');
        description.id = descId;
        this.content.setAttribute('aria-describedby', descId);
      }

      // Create focus trap
      this.focusTrap = createFocusTrap(this.content);

      // Find and bind triggers
      this.triggers = $$(`[data-dialog-trigger="${this.id}"]`);
      this.triggers.forEach(trigger => {
        on(trigger, 'click', () => this.open());
      });

      // Bind close buttons
      $$('[data-dialog-close]', this.dialog).forEach(closeBtn => {
        on(closeBtn, 'click', () => this.close());
      });

      // Overlay click
      if (this.options.closeOnOverlay) {
        on(this.overlay, 'click', () => this.close());
      }

      // Keyboard handling
      on(this.dialog, 'keydown', (e) => this._handleKeydown(e));
    }

    _handleKeydown(e) {
      if (e.key === Keys.ESCAPE && this.options.closeOnEscape && this.isOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    }

    open() {
      if (this.isOpen || this.isClosing) return;

      this.isOpen = true;
      this.previousActiveElement = document.activeElement;

      // Update state
      this.overlay.setAttribute('data-state', 'open');
      this.content.setAttribute('data-state', 'open');

      // Lock scroll and activate focus trap
      lockScroll();

      // Focus first focusable element after transition
      setTimeout(() => {
        this.focusTrap.activate();
      }, TRANSITION_DURATION);

      // Emit event
      emit(this.dialog, 'dialog:open', { dialog: this });
    }

    close() {
      if (!this.isOpen || this.isClosing) return;

      this.isClosing = true;

      // Start closing animation
      this.overlay.setAttribute('data-state', 'closing');
      this.content.setAttribute('data-state', 'closing');

      // Deactivate focus trap
      this.focusTrap.deactivate();

      // Wait for animation to complete
      setTimeout(() => {
        this.isOpen = false;
        this.isClosing = false;

        // Remove state
        this.overlay.removeAttribute('data-state');
        this.content.removeAttribute('data-state');

        // Unlock scroll
        unlockScroll();

        // Restore focus
        if (this.previousActiveElement && this.previousActiveElement.focus) {
          this.previousActiveElement.focus();
        }

        // Emit event
        emit(this.dialog, 'dialog:close', { dialog: this });
      }, TRANSITION_DURATION);
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      this.close();
      this.focusTrap.deactivate();
      removeInstance(this.dialog, 'dialog');
    }
  }

  /**
   * Initialize dialog
   */
  function initDialog(element) {
    const options = {};

    if (element.dataset.closeOnOverlay === 'false') {
      options.closeOnOverlay = false;
    }
    if (element.dataset.closeOnEscape === 'false') {
      options.closeOnEscape = false;
    }

    return new Dialog(element, options);
  }

  // Register for auto-init
  registerComponent('dialog', initDialog);

  // Expose to BrandUI namespace
  BrandUI.components.Dialog = Dialog;
  BrandUI.components.initDialog = initDialog;

})();
