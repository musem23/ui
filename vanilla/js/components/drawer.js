/**
 * Brand UI - Drawer Component
 * A mobile-friendly panel that slides in from edge of screen with drag-to-dismiss
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'drawer';
  const DISMISS_THRESHOLD = 0.4; // 40% of drawer height/width to dismiss
  const VELOCITY_THRESHOLD = 0.5; // pixels per ms

  /**
   * Drawer component class
   */
  class Drawer {
    constructor(element, options = {}) {
      this.trigger = element;
      this.options = {
        direction: options.direction || 'bottom',
        dismissible: options.dismissible !== false,
        closeOnOverlay: options.closeOnOverlay !== false,
        closeOnEscape: options.closeOnEscape !== false,
        ...options,
      };

      this.targetId = this.trigger.getAttribute('data-drawer-target') ||
                      this.trigger.getAttribute('aria-controls');
      this.content = document.getElementById(this.targetId);

      if (!this.content) {
        console.warn(`Drawer: Target element #${this.targetId} not found`);
        return;
      }

      this.overlay = this.content.previousElementSibling;
      if (!this.overlay || !this.overlay.classList.contains('drawer-overlay')) {
        this.overlay = null;
      }

      this.isOpen = false;
      this.focusTrap = null;
      this.previousActiveElement = null;

      // Drag state
      this.isDragging = false;
      this.dragStart = 0;
      this.dragCurrent = 0;
      this.dragStartTime = 0;

      this._init();
    }

    _init() {
      // Set direction
      this.content.setAttribute('data-direction', this.options.direction);

      // Create focus trap
      this.focusTrap = BrandUI.createFocusTrap(this.content);

      // Bind events
      this._bindEvents();

      // Store instance
      BrandUI.setInstance(this.trigger, COMPONENT_NAME, this);
    }

    _bindEvents() {
      // Trigger click
      this._onTriggerClick = this._handleTriggerClick.bind(this);
      this.trigger.addEventListener('click', this._onTriggerClick);

      // Close buttons
      this._onCloseClick = this._handleClose.bind(this);
      const closeButtons = this.content.querySelectorAll('[data-drawer-close]');
      closeButtons.forEach(btn => btn.addEventListener('click', this._onCloseClick));

      // Overlay click
      if (this.overlay && this.options.closeOnOverlay) {
        this._onOverlayClick = this._handleOverlayClick.bind(this);
        this.overlay.addEventListener('click', this._onOverlayClick);
      }

      // Escape key
      if (this.options.closeOnEscape) {
        this._onKeydown = this._handleKeydown.bind(this);
        document.addEventListener('keydown', this._onKeydown);
      }

      // Drag events for dismissible drawers
      if (this.options.dismissible) {
        this._bindDragEvents();
      }
    }

    _bindDragEvents() {
      const handle = this.content.querySelector('.drawer-handle');
      const dragTarget = handle || this.content;

      // Mouse events
      this._onMouseDown = this._handleDragStart.bind(this);
      this._onMouseMove = this._handleDragMove.bind(this);
      this._onMouseUp = this._handleDragEnd.bind(this);

      dragTarget.addEventListener('mousedown', this._onMouseDown);
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);

      // Touch events
      this._onTouchStart = this._handleTouchStart.bind(this);
      this._onTouchMove = this._handleTouchMove.bind(this);
      this._onTouchEnd = this._handleDragEnd.bind(this);

      dragTarget.addEventListener('touchstart', this._onTouchStart, { passive: true });
      document.addEventListener('touchmove', this._onTouchMove, { passive: false });
      document.addEventListener('touchend', this._onTouchEnd);
    }

    _handleTriggerClick(e) {
      e.preventDefault();
      this.open();
    }

    _handleClose() {
      this.close();
    }

    _handleOverlayClick() {
      this.close();
    }

    _handleKeydown(e) {
      if (e.key === BrandUI.Keys.ESCAPE && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    }

    _handleDragStart(e) {
      if (!this.isOpen) return;

      this.isDragging = true;
      this.dragStartTime = Date.now();
      this.content.setAttribute('data-dragging', 'true');

      const pos = this._getPosition(e);
      this.dragStart = this._isHorizontal() ? pos.x : pos.y;
      this.dragCurrent = this.dragStart;
    }

    _handleTouchStart(e) {
      if (!this.isOpen) return;

      this.isDragging = true;
      this.dragStartTime = Date.now();
      this.content.setAttribute('data-dragging', 'true');

      const touch = e.touches[0];
      this.dragStart = this._isHorizontal() ? touch.clientX : touch.clientY;
      this.dragCurrent = this.dragStart;
    }

    _handleDragMove(e) {
      if (!this.isDragging) return;

      const pos = this._getPosition(e);
      this.dragCurrent = this._isHorizontal() ? pos.x : pos.y;
      this._updateDragPosition();
    }

    _handleTouchMove(e) {
      if (!this.isDragging) return;

      const touch = e.touches[0];
      this.dragCurrent = this._isHorizontal() ? touch.clientX : touch.clientY;

      // Prevent scroll during drag
      const delta = this.dragCurrent - this.dragStart;
      if (this._shouldPreventScroll(delta)) {
        e.preventDefault();
      }

      this._updateDragPosition();
    }

    _handleDragEnd() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.content.removeAttribute('data-dragging');

      const delta = this.dragCurrent - this.dragStart;
      const elapsed = Date.now() - this.dragStartTime;
      const velocity = Math.abs(delta) / elapsed;

      const shouldDismiss = this._shouldDismiss(delta, velocity);

      if (shouldDismiss) {
        this.close();
      } else {
        // Reset position
        this._resetDragPosition();
      }
    }

    _getPosition(e) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }

    _isHorizontal() {
      return this.options.direction === 'left' || this.options.direction === 'right';
    }

    _updateDragPosition() {
      const delta = this.dragCurrent - this.dragStart;
      let transform = '';

      switch (this.options.direction) {
        case 'bottom':
          // Only allow dragging down
          if (delta > 0) {
            transform = `translateY(${delta}px)`;
          }
          break;
        case 'top':
          // Only allow dragging up
          if (delta < 0) {
            transform = `translateY(${delta}px)`;
          }
          break;
        case 'right':
          // Only allow dragging right
          if (delta > 0) {
            transform = `translateX(${delta}px)`;
          }
          break;
        case 'left':
          // Only allow dragging left
          if (delta < 0) {
            transform = `translateX(${delta}px)`;
          }
          break;
      }

      if (transform) {
        this.content.style.transform = transform;
        // Update overlay opacity based on drag distance
        if (this.overlay) {
          const size = this._isHorizontal() ? this.content.offsetWidth : this.content.offsetHeight;
          const progress = 1 - Math.abs(delta) / size;
          this.overlay.style.opacity = Math.max(0, progress);
        }
      }
    }

    _shouldPreventScroll(delta) {
      switch (this.options.direction) {
        case 'bottom':
          return delta > 0;
        case 'top':
          return delta < 0;
        case 'right':
          return delta > 0;
        case 'left':
          return delta < 0;
        default:
          return false;
      }
    }

    _shouldDismiss(delta, velocity) {
      const size = this._isHorizontal() ? this.content.offsetWidth : this.content.offsetHeight;
      const threshold = size * DISMISS_THRESHOLD;
      const absDelta = Math.abs(delta);

      // Check velocity first
      if (velocity > VELOCITY_THRESHOLD && this._isDismissDirection(delta)) {
        return true;
      }

      // Check threshold
      if (absDelta > threshold && this._isDismissDirection(delta)) {
        return true;
      }

      return false;
    }

    _isDismissDirection(delta) {
      switch (this.options.direction) {
        case 'bottom':
          return delta > 0;
        case 'top':
          return delta < 0;
        case 'right':
          return delta > 0;
        case 'left':
          return delta < 0;
        default:
          return false;
      }
    }

    _resetDragPosition() {
      this.content.style.transform = '';
      if (this.overlay) {
        this.overlay.style.opacity = '';
      }
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.previousActiveElement = document.activeElement;

      // Lock scroll
      BrandUI.lockScroll();

      // Update states
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.setAttribute('data-state', 'open');
      if (this.overlay) {
        this.overlay.setAttribute('data-state', 'open');
      }

      // Activate focus trap
      requestAnimationFrame(() => {
        this.focusTrap.activate();
      });

      // Emit event
      BrandUI.emit(this.content, 'drawer:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;

      // Reset any drag state
      this._resetDragPosition();

      // Update states
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.setAttribute('data-state', 'closed');
      if (this.overlay) {
        this.overlay.setAttribute('data-state', 'closed');
      }

      // Deactivate focus trap
      this.focusTrap.deactivate();

      // Restore focus
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }

      // Unlock scroll after transition
      BrandUI.afterTransition(this.content, () => {
        if (!this.isOpen) {
          BrandUI.unlockScroll();
        }
      });

      // Emit event
      BrandUI.emit(this.content, 'drawer:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      // Remove event listeners
      this.trigger.removeEventListener('click', this._onTriggerClick);

      const closeButtons = this.content.querySelectorAll('[data-drawer-close]');
      closeButtons.forEach(btn => btn.removeEventListener('click', this._onCloseClick));

      if (this.overlay && this._onOverlayClick) {
        this.overlay.removeEventListener('click', this._onOverlayClick);
      }

      if (this._onKeydown) {
        document.removeEventListener('keydown', this._onKeydown);
      }

      // Remove drag events
      if (this.options.dismissible) {
        const handle = this.content.querySelector('.drawer-handle');
        const dragTarget = handle || this.content;

        dragTarget.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);

        dragTarget.removeEventListener('touchstart', this._onTouchStart);
        document.removeEventListener('touchmove', this._onTouchMove);
        document.removeEventListener('touchend', this._onTouchEnd);
      }

      // Cleanup
      if (this.isOpen) {
        this.close();
      }

      this.focusTrap.deactivate();
      BrandUI.removeInstance(this.trigger, COMPONENT_NAME);
    }
  }

  /**
   * Initialize drawer from element
   */
  function initDrawer(element) {
    const options = BrandUI.getData(element, 'drawer');
    return new Drawer(element, options);
  }

  // Register component
  BrandUI.registerComponent(COMPONENT_NAME, initDrawer);

  // Expose to BrandUI
  BrandUI.components.Drawer = Drawer;

  // Factory function
  BrandUI.Drawer = function (element, options) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) return null;

    let instance = BrandUI.getInstance(element, COMPONENT_NAME);
    if (!instance) {
      instance = new Drawer(element, options);
    }
    return instance;
  };
})();
