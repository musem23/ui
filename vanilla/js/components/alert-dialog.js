/**
 * Brand UI - Alert Dialog Component
 * Modal dialog for critical actions requiring user confirmation
 * Cannot be dismissed by clicking outside (only via action buttons)
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, createFocusTrap, lockScroll, unlockScroll, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  /**
   * AlertDialog Component
   */
  class AlertDialog {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        closeOnEscape: true,
        ...options,
      };

      this.id = this.root.id || uid('alert-dialog');
      this.root.id = this.id;

      this.isOpen = false;
      this.previousActiveElement = null;
      this.focusTrap = null;

      this._findElements();
      this._bindEvents();

      setInstance(this.root, 'alert-dialog', this);
    }

    _findElements() {
      // Find trigger button (external or internal)
      this.trigger = $(`[data-alert-dialog-trigger="${this.id}"]`) ||
                     $('[data-alert-dialog-trigger]', this.root);

      // Find overlay and content
      this.overlay = $('.alert-dialog-overlay', this.root) ||
                     $(`#${this.id}-overlay`);
      this.content = $('.alert-dialog-content', this.root) ||
                     $(`#${this.id}-content`);

      // Find action buttons
      this.actionButtons = $$('.alert-dialog-action', this.content);
      this.cancelButtons = $$('.alert-dialog-cancel', this.content);

      // Find title and description for ARIA
      this.title = $('.alert-dialog-title', this.content);
      this.description = $('.alert-dialog-description', this.content);

      this._setupAria();
    }

    _setupAria() {
      if (!this.content) return;

      // Set role as alertdialog
      this.content.setAttribute('role', 'alertdialog');
      this.content.setAttribute('aria-modal', 'true');

      // Link title and description
      if (this.title) {
        const titleId = this.title.id || `${this.id}-title`;
        this.title.id = titleId;
        this.content.setAttribute('aria-labelledby', titleId);
      }

      if (this.description) {
        const descId = this.description.id || `${this.id}-description`;
        this.description.id = descId;
        this.content.setAttribute('aria-describedby', descId);
      }
    }

    _bindEvents() {
      // Trigger click
      if (this.trigger) {
        on(this.trigger, 'click', () => this.open());
      }

      // Cancel button clicks
      this.cancelButtons.forEach(btn => {
        on(btn, 'click', () => this.close('cancel'));
      });

      // Action button clicks
      this.actionButtons.forEach(btn => {
        on(btn, 'click', (e) => {
          const actionName = btn.dataset.action || 'confirm';
          this.close(actionName);
        });
      });

      // Escape key (optional - enabled by default but can be disabled)
      on(document, 'keydown', (e) => {
        if (e.key === Keys.ESCAPE && this.isOpen && this.options.closeOnEscape) {
          e.preventDefault();
          this.close('cancel');
        }
      });

      // NOTE: Alert dialogs do NOT close on overlay click
      // This is intentional - users must interact with action buttons
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.previousActiveElement = document.activeElement;

      // Update state
      if (this.overlay) {
        this.overlay.setAttribute('data-state', 'open');
      }
      if (this.content) {
        this.content.setAttribute('data-state', 'open');
      }

      // Lock scroll
      lockScroll();

      // Create and activate focus trap
      if (this.content) {
        this.focusTrap = createFocusTrap(this.content);
        this.focusTrap.activate();
      }

      // Emit event
      emit(this.root, 'alert-dialog:open', { dialog: this });
    }

    close(reason = 'unknown') {
      if (!this.isOpen) return;

      this.isOpen = false;

      // Update state
      if (this.overlay) {
        this.overlay.setAttribute('data-state', 'closed');
      }
      if (this.content) {
        this.content.setAttribute('data-state', 'closed');
      }

      // Deactivate focus trap
      if (this.focusTrap) {
        this.focusTrap.deactivate();
        this.focusTrap = null;
      }

      // Unlock scroll
      unlockScroll();

      // Restore focus
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }

      // Emit event
      emit(this.root, 'alert-dialog:close', { dialog: this, reason });

      // Emit specific events based on reason
      if (reason === 'cancel') {
        emit(this.root, 'alert-dialog:cancel', { dialog: this });
      } else if (reason === 'confirm' || reason !== 'unknown') {
        emit(this.root, 'alert-dialog:action', { dialog: this, action: reason });
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      if (this.isOpen) {
        this.close();
      }
      removeInstance(this.root, 'alert-dialog');
    }
  }

  /**
   * Factory function
   */
  function createAlertDialog(element, options) {
    const existing = getInstance(element, 'alert-dialog');
    if (existing) return existing;
    return new AlertDialog(element, options);
  }

  /**
   * Initialize from data attributes
   */
  function initAlertDialog(element) {
    const options = {};

    if (element.dataset.closeOnEscape === 'false') {
      options.closeOnEscape = false;
    }

    return createAlertDialog(element, options);
  }

  // Register for auto-init
  registerComponent('alert-dialog', initAlertDialog);

  // Export
  BrandUI.components.AlertDialog = AlertDialog;
  BrandUI.AlertDialog = createAlertDialog;

})();
