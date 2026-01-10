/**
 * Brand UI - Hover Card Component
 * A popover that appears on hover with configurable delay
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'hover-card';
  const OPEN_DELAY = 700;
  const CLOSE_DELAY = 300;

  /**
   * HoverCard class
   */
  class HoverCard {
    constructor(element, options = {}) {
      this.root = element;
      this.trigger = element.querySelector('.hover-card-trigger');
      this.content = element.querySelector('.hover-card-content');

      if (!this.trigger || !this.content) {
        console.warn('HoverCard: Missing trigger or content element');
        return;
      }

      this.options = {
        openDelay: parseInt(element.dataset.openDelay) || options.openDelay || OPEN_DELAY,
        closeDelay: parseInt(element.dataset.closeDelay) || options.closeDelay || CLOSE_DELAY,
        side: element.dataset.side || options.side || 'bottom',
        align: element.dataset.align || options.align || 'center',
      };

      this.isOpen = false;
      this.openTimeout = null;
      this.closeTimeout = null;

      this._init();
      BrandUI.setInstance(element, COMPONENT_NAME, this);
    }

    _init() {
      // Set initial positioning attributes
      this.content.setAttribute('data-side', this.options.side);
      this.content.setAttribute('data-align', this.options.align);
      this.content.setAttribute('data-state', 'closed');

      // Set ARIA attributes
      const triggerId = this.trigger.id || BrandUI.uid('hover-card-trigger');
      const contentId = this.content.id || BrandUI.uid('hover-card-content');

      this.trigger.id = triggerId;
      this.content.id = contentId;
      this.trigger.setAttribute('aria-haspopup', 'true');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-controls', contentId);
      this.content.setAttribute('role', 'tooltip');
      this.content.setAttribute('aria-labelledby', triggerId);

      // Bind events
      this._bindEvents();
    }

    _bindEvents() {
      // Mouse events on trigger
      this.trigger.addEventListener('mouseenter', () => this._handleTriggerEnter());
      this.trigger.addEventListener('mouseleave', () => this._handleTriggerLeave());
      this.trigger.addEventListener('focus', () => this._handleTriggerEnter());
      this.trigger.addEventListener('blur', () => this._handleTriggerLeave());

      // Mouse events on content
      this.content.addEventListener('mouseenter', () => this._handleContentEnter());
      this.content.addEventListener('mouseleave', () => this._handleContentLeave());

      // Keyboard events
      this.trigger.addEventListener('keydown', (e) => this._handleKeydown(e));
    }

    _handleTriggerEnter() {
      this._clearCloseTimeout();
      this.openTimeout = setTimeout(() => {
        this.open();
      }, this.options.openDelay);
    }

    _handleTriggerLeave() {
      this._clearOpenTimeout();
      this.closeTimeout = setTimeout(() => {
        this.close();
      }, this.options.closeDelay);
    }

    _handleContentEnter() {
      this._clearCloseTimeout();
    }

    _handleContentLeave() {
      this.closeTimeout = setTimeout(() => {
        this.close();
      }, this.options.closeDelay);
    }

    _handleKeydown(e) {
      if (e.key === BrandUI.Keys.ESCAPE && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    }

    _clearOpenTimeout() {
      if (this.openTimeout) {
        clearTimeout(this.openTimeout);
        this.openTimeout = null;
      }
    }

    _clearCloseTimeout() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.content.setAttribute('data-state', 'open');
      this.trigger.setAttribute('aria-expanded', 'true');

      BrandUI.emit(this.root, 'hover-card:open', { hoverCard: this });
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.content.setAttribute('data-state', 'closed');
      this.trigger.setAttribute('aria-expanded', 'false');

      BrandUI.emit(this.root, 'hover-card:close', { hoverCard: this });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      this._clearOpenTimeout();
      this._clearCloseTimeout();
      BrandUI.removeInstance(this.root, COMPONENT_NAME);
    }
  }

  /**
   * Initialize hover card
   */
  function initHoverCard(element, options) {
    const existing = BrandUI.getInstance(element, COMPONENT_NAME);
    if (existing) return existing;

    return new HoverCard(element, options);
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, initHoverCard);

  // Add to BrandUI namespace
  BrandUI.components.HoverCard = HoverCard;
  BrandUI.components.initHoverCard = initHoverCard;
})();
