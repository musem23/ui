/**
 * Navigation Menu Component
 * Mega menu / navigation menu with keyboard navigation and viewport-based positioning
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, onClickOutside, setInstance, getInstance } = BrandUI;

  const COMPONENT_NAME = 'nav-menu';

  /**
   * NavigationMenu class
   */
  class NavigationMenu {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        useViewport: element.dataset.viewport !== 'false',
        delayDuration: parseInt(element.dataset.delay, 10) || 200,
        skipDelayDuration: parseInt(element.dataset.skipDelay, 10) || 300,
        ...options,
      };

      this.list = null;
      this.items = [];
      this.triggers = [];
      this.contents = [];
      this.viewport = null;
      this.viewportWrapper = null;
      this.indicator = null;

      this.activeValue = null;
      this.previousValue = null;
      this.isOpen = false;
      this.openTimer = null;
      this.closeTimer = null;
      this.skipDelayTimer = null;
      this.isDelaySkipped = false;
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      // Set viewport attribute
      this.root.dataset.viewport = this.options.useViewport ? 'true' : 'false';

      // Find elements
      this.list = $(`.${COMPONENT_NAME}-list`, this.root);
      this.items = $$(`.${COMPONENT_NAME}-item`, this.root);
      this.triggers = $$(`.${COMPONENT_NAME}-trigger`, this.root);
      this.contents = $$(`.${COMPONENT_NAME}-content`, this.root);

      // Setup viewport if enabled
      if (this.options.useViewport) {
        this._setupViewport();
      }

      // Setup indicator
      this._setupIndicator();

      // Set ARIA attributes
      this._setupAccessibility();

      // Bind events
      this._bindEvents();

      // Initial state
      this._closeAll();
    }

    _setupViewport() {
      this.viewportWrapper = $(`.${COMPONENT_NAME}-viewport-wrapper`, this.root);
      this.viewport = $(`.${COMPONENT_NAME}-viewport`, this.root);

      if (!this.viewportWrapper) {
        // Create viewport wrapper
        this.viewportWrapper = document.createElement('div');
        this.viewportWrapper.className = `${COMPONENT_NAME}-viewport-wrapper`;

        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.className = `${COMPONENT_NAME}-viewport`;
        this.viewport.setAttribute('data-state', 'closed');
        this.viewport.setAttribute('role', 'presentation');

        this.viewportWrapper.appendChild(this.viewport);
        this.root.appendChild(this.viewportWrapper);
      }
    }

    _setupIndicator() {
      this.indicator = $(`.${COMPONENT_NAME}-indicator`, this.root);

      if (!this.indicator && this.list) {
        // Create indicator
        this.indicator = document.createElement('div');
        this.indicator.className = `${COMPONENT_NAME}-indicator`;
        this.indicator.setAttribute('data-state', 'hidden');
        this.indicator.setAttribute('aria-hidden', 'true');

        const arrow = document.createElement('div');
        arrow.className = `${COMPONENT_NAME}-indicator-arrow`;
        this.indicator.appendChild(arrow);

        this.list.appendChild(this.indicator);
      }
    }

    _setupAccessibility() {
      // Set role on root
      if (!this.root.hasAttribute('role')) {
        this.root.setAttribute('role', 'navigation');
      }

      // Set role on list
      if (this.list && !this.list.hasAttribute('role')) {
        this.list.setAttribute('role', 'menubar');
      }

      // Setup each trigger-content pair
      this.triggers.forEach((trigger, index) => {
        const content = this._getContentForTrigger(trigger);
        const triggerId = trigger.id || uid(`${COMPONENT_NAME}-trigger`);
        const contentId = content?.id || uid(`${COMPONENT_NAME}-content`);

        trigger.id = triggerId;
        trigger.setAttribute('role', 'menuitem');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');

        if (content) {
          content.id = contentId;
          trigger.setAttribute('aria-controls', contentId);
          content.setAttribute('role', 'menu');
          content.setAttribute('aria-labelledby', triggerId);
        }

        // Store value for identification
        if (!trigger.dataset.value) {
          trigger.dataset.value = `item-${index}`;
        }
      });

      // Setup standalone links
      $$(`.${COMPONENT_NAME}-link`, this.root).forEach((link) => {
        if (!link.closest(`.${COMPONENT_NAME}-content`)) {
          link.setAttribute('role', 'menuitem');
        }
      });
    }

    _bindEvents() {
      // Trigger interactions
      this.triggers.forEach((trigger) => {
        on(trigger, 'click', (e) => this._handleTriggerClick(e, trigger));
        on(trigger, 'mouseenter', () => this._handleTriggerEnter(trigger));
        on(trigger, 'mouseleave', () => this._handleTriggerLeave(trigger));
        on(trigger, 'keydown', (e) => this._handleTriggerKeydown(e, trigger));
        on(trigger, 'focus', () => this._handleTriggerFocus(trigger));
      });

      // Content interactions
      this.contents.forEach((content) => {
        on(content, 'mouseenter', () => this._handleContentEnter(content));
        on(content, 'mouseleave', () => this._handleContentLeave(content));
        on(content, 'keydown', (e) => this._handleContentKeydown(e, content));
      });

      // Viewport interactions
      if (this.viewport) {
        on(this.viewport, 'mouseenter', () => this._cancelClose());
        on(this.viewport, 'mouseleave', () => this._scheduleClose());
      }

      // Click outside
      on(document, 'click', (e) => {
        if (!this.root.contains(e.target)) {
          this._closeAll();
        }
      });

      // Escape key
      on(document, 'keydown', (e) => {
        if (e.key === Keys.ESCAPE && this.isOpen) {
          this._closeAll();
          // Focus the active trigger
          const activeTrigger = this.triggers.find(
            (t) => t.dataset.value === this.previousValue
          );
          if (activeTrigger) {
            activeTrigger.focus();
          }
        }
      });
    }

    _getContentForTrigger(trigger) {
      const item = trigger.closest(`.${COMPONENT_NAME}-item`);
      return item ? $(`.${COMPONENT_NAME}-content`, item) : null;
    }

    _getTriggerForContent(content) {
      const item = content.closest(`.${COMPONENT_NAME}-item`);
      return item ? $(`.${COMPONENT_NAME}-trigger`, item) : null;
    }

    _handleTriggerClick(e, trigger) {
      e.preventDefault();
      const value = trigger.dataset.value;

      if (this.activeValue === value) {
        this._closeAll();
      } else {
        this._open(value);
      }
    }

    _handleTriggerEnter(trigger) {
      this._cancelClose();
      const value = trigger.dataset.value;

      if (this.isOpen || this.isDelaySkipped) {
        // Immediate open if already in navigation mode
        this._open(value);
      } else {
        // Delay open
        this._scheduleOpen(value);
      }
    }

    _handleTriggerLeave(trigger) {
      this._cancelOpen();
      this._scheduleClose();
    }

    _handleTriggerFocus(trigger) {
      // Open on focus for keyboard users who tab into the menu
      const value = trigger.dataset.value;
      if (this.isOpen && this.activeValue !== value) {
        this._open(value);
      }
    }

    _handleTriggerKeydown(e, trigger) {
      const value = trigger.dataset.value;
      const currentIndex = this.triggers.indexOf(trigger);

      switch (e.key) {
        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (this.activeValue === value) {
            this._closeAll();
          } else {
            this._open(value);
            // Focus first focusable in content
            const content = this._getContentForTrigger(trigger);
            if (content) {
              const firstFocusable = BrandUI.getFocusableElements(content)[0];
              if (firstFocusable) {
                firstFocusable.focus();
              }
            }
          }
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          if (this.activeValue === value) {
            // Focus first item in content
            const content = this._getContentForTrigger(trigger);
            if (content) {
              const firstFocusable = BrandUI.getFocusableElements(content)[0];
              if (firstFocusable) {
                firstFocusable.focus();
              }
            }
          } else {
            this._open(value);
          }
          break;

        case Keys.ARROW_LEFT:
          e.preventDefault();
          if (currentIndex > 0) {
            this.triggers[currentIndex - 1].focus();
            if (this.isOpen) {
              this._open(this.triggers[currentIndex - 1].dataset.value);
            }
          }
          break;

        case Keys.ARROW_RIGHT:
          e.preventDefault();
          if (currentIndex < this.triggers.length - 1) {
            this.triggers[currentIndex + 1].focus();
            if (this.isOpen) {
              this._open(this.triggers[currentIndex + 1].dataset.value);
            }
          }
          break;

        case Keys.HOME:
          e.preventDefault();
          this.triggers[0].focus();
          if (this.isOpen) {
            this._open(this.triggers[0].dataset.value);
          }
          break;

        case Keys.END:
          e.preventDefault();
          this.triggers[this.triggers.length - 1].focus();
          if (this.isOpen) {
            this._open(this.triggers[this.triggers.length - 1].dataset.value);
          }
          break;
      }
    }

    _handleContentEnter(content) {
      this._cancelClose();
    }

    _handleContentLeave(content) {
      this._scheduleClose();
    }

    _handleContentKeydown(e, content) {
      const focusable = BrandUI.getFocusableElements(content);
      const currentIndex = focusable.indexOf(document.activeElement);

      switch (e.key) {
        case Keys.ARROW_UP:
          e.preventDefault();
          if (currentIndex > 0) {
            focusable[currentIndex - 1].focus();
          } else {
            // Go back to trigger
            const trigger = this._getTriggerForContent(content);
            if (trigger) {
              trigger.focus();
            }
          }
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          if (currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1].focus();
          }
          break;

        case Keys.TAB:
          // Allow default tab, but close menu if tabbing out
          setTimeout(() => {
            if (!this.root.contains(document.activeElement)) {
              this._closeAll();
            }
          }, 0);
          break;
      }
    }

    _scheduleOpen(value) {
      this._cancelOpen();
      this.openTimer = setTimeout(() => {
        this._open(value);
      }, this.options.delayDuration);
    }

    _cancelOpen() {
      if (this.openTimer) {
        clearTimeout(this.openTimer);
        this.openTimer = null;
      }
    }

    _scheduleClose() {
      this._cancelClose();
      this.closeTimer = setTimeout(() => {
        this._closeAll();
      }, this.options.delayDuration);
    }

    _cancelClose() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
    }

    _open(value) {
      this._cancelOpen();
      this._cancelClose();

      // Store previous for animation direction
      const previousIndex = this.triggers.findIndex(
        (t) => t.dataset.value === this.activeValue
      );
      const newIndex = this.triggers.findIndex((t) => t.dataset.value === value);

      this.previousValue = this.activeValue;
      this.activeValue = value;
      this.isOpen = true;

      // Start skip delay timer
      this._startSkipDelay();

      // Update triggers
      this.triggers.forEach((trigger) => {
        const isActive = trigger.dataset.value === value;
        trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      });

      // Determine motion direction
      const motion = previousIndex < newIndex ? 'from-end' : 'from-start';

      // Update contents
      this.contents.forEach((content) => {
        const trigger = this._getTriggerForContent(content);
        const isActive = trigger?.dataset.value === value;

        if (isActive) {
          content.setAttribute('data-state', 'open');
          content.setAttribute('data-motion', motion);
          content.removeAttribute('hidden');
        } else if (content.dataset.state === 'open') {
          // Closing this one
          const outMotion = previousIndex < newIndex ? 'to-start' : 'to-end';
          content.setAttribute('data-motion', outMotion);
          content.setAttribute('data-state', 'closed');
          content.setAttribute('hidden', '');
        }
      });

      // Update viewport
      if (this.options.useViewport && this.viewport) {
        const activeContent = this.contents.find((c) => c.dataset.state === 'open');
        if (activeContent) {
          this.viewport.setAttribute('data-state', 'open');
          // Set viewport dimensions
          const rect = activeContent.getBoundingClientRect();
          this.viewport.style.setProperty('--nav-menu-viewport-width', `${rect.width}px`);
          this.viewport.style.setProperty('--nav-menu-viewport-height', `${rect.height}px`);
          this.viewport.style.width = `${rect.width}px`;
          this.viewport.style.height = `${rect.height}px`;

          // Move content into viewport if not already there
          if (activeContent.parentElement !== this.viewport) {
            this.viewport.appendChild(activeContent);
          }
        }
      }

      // Update indicator
      this._updateIndicator();

      // Emit event
      emit(this.root, 'nav-menu:open', { value });
    }

    _closeAll() {
      this._cancelOpen();
      this._cancelClose();

      this.previousValue = this.activeValue;
      this.activeValue = null;
      this.isOpen = false;

      // Update triggers
      this.triggers.forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
      });

      // Update contents
      this.contents.forEach((content) => {
        content.setAttribute('data-state', 'closed');
        content.setAttribute('hidden', '');
      });

      // Update viewport
      if (this.viewport) {
        this.viewport.setAttribute('data-state', 'closed');
      }

      // Hide indicator
      if (this.indicator) {
        this.indicator.setAttribute('data-state', 'hidden');
      }

      // Emit event
      emit(this.root, 'nav-menu:close');
    }

    _startSkipDelay() {
      this.isDelaySkipped = true;
      if (this.skipDelayTimer) {
        clearTimeout(this.skipDelayTimer);
      }
      this.skipDelayTimer = setTimeout(() => {
        this.isDelaySkipped = false;
      }, this.options.skipDelayDuration);
    }

    _updateIndicator() {
      if (!this.indicator || !this.list) return;

      const activeTrigger = this.triggers.find(
        (t) => t.dataset.value === this.activeValue
      );

      if (activeTrigger) {
        const listRect = this.list.getBoundingClientRect();
        const triggerRect = activeTrigger.getBoundingClientRect();

        const left = triggerRect.left - listRect.left;
        const width = triggerRect.width;

        this.indicator.style.transform = `translateX(${left}px)`;
        this.indicator.style.width = `${width}px`;
        this.indicator.setAttribute('data-state', 'visible');
      } else {
        this.indicator.setAttribute('data-state', 'hidden');
      }
    }

    // Public API
    open(value) {
      this._open(value);
    }

    close() {
      this._closeAll();
    }

    destroy() {
      this._closeAll();
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
      }
    }
  }

  /**
   * Initialize navigation menu
   */
  function initNavigationMenu(element) {
    if (getInstance(element, COMPONENT_NAME)) {
      return getInstance(element, COMPONENT_NAME);
    }

    const instance = new NavigationMenu(element);
    setInstance(element, COMPONENT_NAME, instance);
    return instance;
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, initNavigationMenu);

  // Expose to BrandUI
  BrandUI.components.NavigationMenu = NavigationMenu;
  BrandUI.initNavigationMenu = initNavigationMenu;
})();
