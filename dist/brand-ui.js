/**
 * Brand UI v1.0.0
 * Vanilla JavaScript Component Library
 * https://github.com/your-repo/brand-ui
 */

/* === vanilla/js/core.js === */
/**
 * Brand UI - Core JavaScript
 * Shared utilities and helpers for all components
 */

const BrandUI = (function () {
  'use strict';

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Generate unique ID
   */
  function uid(prefix = 'brand') {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Query selector shorthand
   */
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * Query selector all shorthand
   */
  function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  /**
   * Add event listener with delegation support
   */
  function on(element, event, selectorOrHandler, handler) {
    if (typeof selectorOrHandler === 'function') {
      element.addEventListener(event, selectorOrHandler);
      return () => element.removeEventListener(event, selectorOrHandler);
    }

    // Event delegation
    const delegatedHandler = (e) => {
      const target = e.target.closest(selectorOrHandler);
      if (target && element.contains(target)) {
        handler.call(target, e, target);
      }
    };
    element.addEventListener(event, delegatedHandler);
    return () => element.removeEventListener(event, delegatedHandler);
  }

  /**
   * Dispatch custom event
   */
  function emit(element, eventName, detail = {}) {
    element.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        cancelable: true,
        detail,
      })
    );
  }

  /**
   * Get data attributes as object
   */
  function getData(element, prefix = '') {
    const data = {};
    for (const [key, value] of Object.entries(element.dataset)) {
      if (!prefix || key.startsWith(prefix)) {
        // Convert to camelCase: DefaultValue -> defaultValue
        const sliced = key.slice(prefix.length);
        const cleanKey = prefix ? sliced.charAt(0).toLowerCase() + sliced.slice(1) : key;
        data[cleanKey] = value === '' ? true : value;
      }
    }
    return data;
  }

  /**
   * Toggle class helper
   */
  function toggleClass(element, className, force) {
    if (force === undefined) {
      return element.classList.toggle(className);
    }
    if (force) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
    return force;
  }

  // ============================================
  // FOCUS MANAGEMENT
  // ============================================

  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /**
   * Get all focusable elements within container
   */
  function getFocusableElements(container) {
    return $$(FOCUSABLE_SELECTORS, container).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    );
  }

  /**
   * Create focus trap within container
   */
  function createFocusTrap(container) {
    let active = false;

    const handleKeydown = (e) => {
      if (e.key !== 'Tab' || !active) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    return {
      activate() {
        if (active) return;
        active = true;
        document.addEventListener('keydown', handleKeydown);
        const focusable = getFocusableElements(container);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      },
      deactivate() {
        active = false;
        document.removeEventListener('keydown', handleKeydown);
      },
      isActive() {
        return active;
      },
    };
  }

  // ============================================
  // SCROLL LOCK
  // ============================================

  let scrollLockCount = 0;
  let originalStyles = {};

  function lockScroll() {
    if (scrollLockCount === 0) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      originalStyles = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    scrollLockCount++;
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalStyles.overflow || '';
      document.body.style.paddingRight = originalStyles.paddingRight || '';
    }
  }

  // ============================================
  // KEYBOARD HELPERS
  // ============================================

  const Keys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  };

  /**
   * Handle arrow key navigation in a list
   */
  function handleArrowNavigation(e, items, currentIndex, options = {}) {
    const { loop = true, orientation = 'vertical' } = options;
    const isVertical = orientation === 'vertical';
    const prevKey = isVertical ? Keys.ARROW_UP : Keys.ARROW_LEFT;
    const nextKey = isVertical ? Keys.ARROW_DOWN : Keys.ARROW_RIGHT;

    let newIndex = currentIndex;

    switch (e.key) {
      case prevKey:
        e.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;

      case nextKey:
        e.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;

      case Keys.HOME:
        e.preventDefault();
        newIndex = 0;
        break;

      case Keys.END:
        e.preventDefault();
        newIndex = items.length - 1;
        break;

      default:
        return currentIndex;
    }

    if (items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  }

  // ============================================
  // CLICK OUTSIDE
  // ============================================

  /**
   * Detect clicks outside an element
   */
  function onClickOutside(element, callback) {
    const handler = (e) => {
      if (!element.contains(e.target)) {
        callback(e);
      }
    };

    // Delay to prevent immediate trigger
    setTimeout(() => {
      document.addEventListener('click', handler);
      document.addEventListener('touchstart', handler);
    }, 0);

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };
  }

  // ============================================
  // ANIMATION HELPERS
  // ============================================

  /**
   * Wait for CSS transition to end
   */
  function afterTransition(element, callback) {
    const handler = (e) => {
      if (e.target === element) {
        element.removeEventListener('transitionend', handler);
        callback();
      }
    };
    element.addEventListener('transitionend', handler);

    // Fallback timeout
    const duration = parseFloat(getComputedStyle(element).transitionDuration) * 1000;
    setTimeout(() => {
      element.removeEventListener('transitionend', handler);
      callback();
    }, duration + 50);
  }

  /**
   * Animate element with classes
   */
  function animate(element, animationClass) {
    return new Promise((resolve) => {
      element.classList.add(animationClass);
      afterTransition(element, () => {
        element.classList.remove(animationClass);
        resolve();
      });
    });
  }

  // ============================================
  // COMPONENT REGISTRY
  // ============================================

  const instances = new WeakMap();

  /**
   * Store component instance
   */
  function setInstance(element, name, instance) {
    if (!instances.has(element)) {
      instances.set(element, {});
    }
    instances.get(element)[name] = instance;
  }

  /**
   * Get component instance
   */
  function getInstance(element, name) {
    return instances.get(element)?.[name];
  }

  /**
   * Remove component instance
   */
  function removeInstance(element, name) {
    const elementInstances = instances.get(element);
    if (elementInstances) {
      delete elementInstances[name];
    }
  }

  // ============================================
  // AUTO-INIT
  // ============================================

  const componentInitializers = {};

  /**
   * Register component for auto-initialization
   */
  function registerComponent(name, initializer) {
    componentInitializers[name] = initializer;
  }

  /**
   * Initialize all registered components
   */
  function init(root = document) {
    for (const [name, initializer] of Object.entries(componentInitializers)) {
      const selector = `[data-${name}]`;
      $$(selector, root).forEach((element) => {
        if (!getInstance(element, name)) {
          initializer(element);
        }
      });
    }
  }

  /**
   * Initialize on DOM ready
   */
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  // Auto-init on DOM ready
  ready(() => init());

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Utilities
    uid,
    $,
    $$,
    on,
    emit,
    getData,
    toggleClass,

    // Focus
    getFocusableElements,
    createFocusTrap,

    // Scroll
    lockScroll,
    unlockScroll,

    // Keyboard
    Keys,
    handleArrowNavigation,

    // Click outside
    onClickOutside,

    // Animation
    afterTransition,
    animate,

    // Registry
    setInstance,
    getInstance,
    removeInstance,
    registerComponent,

    // Init
    init,
    ready,

    // Components namespace (will be populated by component files)
    components: {},
  };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrandUI;
}


/* === vanilla/js/components/accordion.js === */
/**
 * Brand UI - Accordion Component
 * Expand/collapse sections with keyboard support
 */

(function () {
  'use strict';

  const { $, $$, on, emit, getData, setInstance, getInstance, removeInstance, registerComponent, Keys } = BrandUI;

  const COMPONENT_NAME = 'accordion';

  /**
   * Accordion Component
   */
  class Accordion {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        type: 'single', // 'single' or 'multiple'
        collapsible: true, // Allow closing all items (only for single mode)
        defaultValue: null, // Initially open item(s)
        ...getData(element, 'accordion'),
        ...options,
      };

      this.items = [];
      this.init();
    }

    init() {
      // Find all accordion items
      const itemElements = $$('.accordion-item', this.root);

      itemElements.forEach((itemEl, index) => {
        const trigger = $('.accordion-trigger', itemEl);
        const content = $('.accordion-content', itemEl);

        if (!trigger || !content) return;

        // Generate IDs for accessibility
        const itemId = itemEl.dataset.value || `accordion-item-${index}`;
        const triggerId = trigger.id || `${itemId}-trigger`;
        const contentId = content.id || `${itemId}-content`;

        trigger.id = triggerId;
        content.id = contentId;

        // Set ARIA attributes
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', contentId);
        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', triggerId);

        // Store item reference
        const item = {
          element: itemEl,
          trigger,
          content,
          value: itemId,
          isOpen: false,
        };
        this.items.push(item);

        // Set initial state
        const isDefaultOpen = this.isDefaultOpen(itemId);
        if (isDefaultOpen) {
          this.openItem(item, false);
        } else {
          this.closeItem(item, false);
        }

        // Bind events
        this.bindEvents(item);
      });

      // Set role on root
      this.root.setAttribute('data-accordion-type', this.options.type);

      // Store instance
      setInstance(this.root, COMPONENT_NAME, this);
    }

    isDefaultOpen(itemId) {
      const defaultValue = this.options.defaultValue;
      if (!defaultValue) return false;

      if (Array.isArray(defaultValue)) {
        return defaultValue.includes(itemId);
      }
      return defaultValue === itemId;
    }

    bindEvents(item) {
      // Click handler
      on(item.trigger, 'click', (e) => {
        e.preventDefault();
        this.toggle(item);
      });

      // Keyboard handler
      on(item.trigger, 'keydown', (e) => {
        this.handleKeydown(e, item);
      });
    }

    handleKeydown(e, item) {
      switch (e.key) {
        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          this.toggle(item);
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          this.focusNextTrigger(item);
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this.focusPrevTrigger(item);
          break;

        case Keys.HOME:
          e.preventDefault();
          this.focusFirstTrigger();
          break;

        case Keys.END:
          e.preventDefault();
          this.focusLastTrigger();
          break;
      }
    }

    focusNextTrigger(currentItem) {
      const currentIndex = this.items.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % this.items.length;
      this.items[nextIndex].trigger.focus();
    }

    focusPrevTrigger(currentItem) {
      const currentIndex = this.items.indexOf(currentItem);
      const prevIndex = (currentIndex - 1 + this.items.length) % this.items.length;
      this.items[prevIndex].trigger.focus();
    }

    focusFirstTrigger() {
      this.items[0]?.trigger.focus();
    }

    focusLastTrigger() {
      this.items[this.items.length - 1]?.trigger.focus();
    }

    toggle(item) {
      if (item.isOpen) {
        this.close(item.value);
      } else {
        this.open(item.value);
      }
    }

    open(value) {
      const item = this.items.find((i) => i.value === value);
      if (!item || item.isOpen) return;

      // In single mode, close other items first
      if (this.options.type === 'single') {
        this.items.forEach((i) => {
          if (i !== item && i.isOpen) {
            this.closeItem(i, true);
          }
        });
      }

      this.openItem(item, true);
    }

    close(value) {
      const item = this.items.find((i) => i.value === value);
      if (!item || !item.isOpen) return;

      // In single mode, check if collapsible
      if (this.options.type === 'single' && !this.options.collapsible) {
        return;
      }

      this.closeItem(item, true);
    }

    openItem(item, animate = true) {
      item.isOpen = true;
      item.element.setAttribute('data-state', 'open');
      item.trigger.setAttribute('aria-expanded', 'true');
      item.content.setAttribute('data-state', 'open');

      if (animate) {
        // Animate open
        item.content.style.height = '0';
        item.content.style.height = `${item.content.scrollHeight}px`;

        // Remove fixed height after animation
        const onTransitionEnd = () => {
          item.content.style.height = '';
          item.content.removeEventListener('transitionend', onTransitionEnd);
        };
        item.content.addEventListener('transitionend', onTransitionEnd);
      } else {
        item.content.style.height = '';
      }

      emit(this.root, 'accordion:open', { value: item.value, item: item.element });
    }

    closeItem(item, animate = true) {
      item.isOpen = false;
      item.trigger.setAttribute('aria-expanded', 'false');

      if (animate) {
        // Set current height for animation
        item.content.style.height = `${item.content.scrollHeight}px`;

        // Force reflow
        item.content.offsetHeight;

        // Animate closed
        item.content.style.height = '0';

        const onTransitionEnd = () => {
          item.element.setAttribute('data-state', 'closed');
          item.content.setAttribute('data-state', 'closed');
          item.content.removeEventListener('transitionend', onTransitionEnd);
        };
        item.content.addEventListener('transitionend', onTransitionEnd);
      } else {
        item.element.setAttribute('data-state', 'closed');
        item.content.setAttribute('data-state', 'closed');
        item.content.style.height = '0';
      }

      emit(this.root, 'accordion:close', { value: item.value, item: item.element });
    }

    openAll() {
      if (this.options.type !== 'multiple') return;
      this.items.forEach((item) => {
        if (!item.isOpen) {
          this.openItem(item, true);
        }
      });
    }

    closeAll() {
      this.items.forEach((item) => {
        if (item.isOpen) {
          this.closeItem(item, true);
        }
      });
    }

    getOpenItems() {
      return this.items.filter((i) => i.isOpen).map((i) => i.value);
    }

    destroy() {
      // Reset ARIA attributes
      this.items.forEach((item) => {
        item.trigger.removeAttribute('aria-expanded');
        item.trigger.removeAttribute('aria-controls');
        item.content.removeAttribute('role');
        item.content.removeAttribute('aria-labelledby');
        item.element.removeAttribute('data-state');
        item.content.removeAttribute('data-state');
        item.content.style.height = '';
      });

      this.root.removeAttribute('data-accordion-type');
      removeInstance(this.root, COMPONENT_NAME);
    }
  }

  // Auto-initialize
  function initAccordion(element) {
    return new Accordion(element);
  }

  registerComponent(COMPONENT_NAME, initAccordion);

  // Public API
  BrandUI.components.Accordion = Accordion;

  BrandUI.accordion = {
    create: (element, options) => new Accordion(element, options),
    get: (element) => getInstance(element, COMPONENT_NAME),
    open: (element, value) => getInstance(element, COMPONENT_NAME)?.open(value),
    close: (element, value) => getInstance(element, COMPONENT_NAME)?.close(value),
    toggle: (element, value) => {
      const instance = getInstance(element, COMPONENT_NAME);
      const item = instance?.items.find((i) => i.value === value);
      if (item) instance.toggle(item);
    },
  };
})();


/* === vanilla/js/components/alert-dialog.js === */
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


/* === vanilla/js/components/calendar.js === */
/**
 * Brand UI - Calendar Component
 * Date picker calendar with month/year navigation and keyboard support
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, setInstance, getInstance, registerComponent, Keys } = BrandUI;

  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Calendar Component
   */
  class Calendar {
    constructor(element, options = {}) {
      this.element = element;
      this.id = element.id || uid('calendar');
      element.id = this.id;

      // Options
      this.options = {
        selected: options.selected || null,
        minDate: options.minDate || null,
        maxDate: options.maxDate || null,
        disabledDates: options.disabledDates || [],
        showOutsideDays: options.showOutsideDays !== false,
        weekStartsOn: options.weekStartsOn || 0, // 0 = Sunday
        ...options
      };

      // State
      this.selectedDate = this.options.selected ? new Date(this.options.selected) : null;
      this.focusedDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
      this.viewDate = new Date(this.focusedDate);

      // Normalize view date to first of month
      this.viewDate.setDate(1);

      this.init();
    }

    init() {
      this.render();
      this.bindEvents();
      setInstance(this.element, 'calendar', this);
    }

    render() {
      this.element.innerHTML = '';
      this.element.classList.add('calendar');
      this.element.setAttribute('role', 'application');
      this.element.setAttribute('aria-label', 'Calendar');

      // Header
      const header = document.createElement('div');
      header.className = 'calendar-header';

      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'calendar-nav calendar-nav-prev';
      prevBtn.setAttribute('aria-label', 'Previous month');
      prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      this.prevBtn = prevBtn;

      // Title
      const title = document.createElement('div');
      title.className = 'calendar-title';
      title.id = `${this.id}-title`;
      this.titleEl = title;

      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'calendar-nav calendar-nav-next';
      nextBtn.setAttribute('aria-label', 'Next month');
      nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      this.nextBtn = nextBtn;

      header.appendChild(prevBtn);
      header.appendChild(title);
      header.appendChild(nextBtn);
      this.element.appendChild(header);

      // Weekdays header
      const weekdays = document.createElement('div');
      weekdays.className = 'calendar-weekdays';
      weekdays.setAttribute('role', 'row');

      for (let i = 0; i < 7; i++) {
        const dayIndex = (i + this.options.weekStartsOn) % 7;
        const weekday = document.createElement('div');
        weekday.className = 'calendar-weekday';
        weekday.setAttribute('role', 'columnheader');
        weekday.textContent = WEEKDAYS[dayIndex];
        weekdays.appendChild(weekday);
      }
      this.element.appendChild(weekdays);

      // Days grid
      const grid = document.createElement('div');
      grid.className = 'calendar-grid';
      grid.setAttribute('role', 'grid');
      grid.setAttribute('aria-labelledby', `${this.id}-title`);
      this.gridEl = grid;
      this.element.appendChild(grid);

      this.updateView();
    }

    updateView() {
      const year = this.viewDate.getFullYear();
      const month = this.viewDate.getMonth();

      // Update title
      this.titleEl.textContent = `${MONTHS[month]} ${year}`;

      // Update nav button states
      this.updateNavButtons();

      // Clear grid
      this.gridEl.innerHTML = '';

      // Get first day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Calculate start date (may be in previous month)
      const startOffset = (firstDay.getDay() - this.options.weekStartsOn + 7) % 7;
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startOffset);

      // Generate 6 weeks of days (42 days)
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const isOutside = date.getMonth() !== month;
        const isToday = this.isSameDay(date, new Date());
        const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
        const isDisabled = this.isDateDisabled(date);
        const isFocused = this.isSameDay(date, this.focusedDate);

        // Skip outside days if not showing them
        if (isOutside && !this.options.showOutsideDays) {
          const placeholder = document.createElement('div');
          placeholder.className = 'calendar-day';
          placeholder.style.visibility = 'hidden';
          this.gridEl.appendChild(placeholder);
          continue;
        }

        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'calendar-day';
        dayBtn.textContent = date.getDate();
        dayBtn.setAttribute('role', 'gridcell');
        dayBtn.setAttribute('data-date', this.formatDateISO(date));
        dayBtn.setAttribute('aria-label', this.formatDateLong(date));
        dayBtn.tabIndex = isFocused ? 0 : -1;

        if (isOutside) {
          dayBtn.classList.add('calendar-day-outside');
          dayBtn.setAttribute('aria-disabled', 'true');
        }

        if (isToday) {
          dayBtn.classList.add('calendar-day-today');
          dayBtn.setAttribute('aria-current', 'date');
        }

        if (isSelected) {
          dayBtn.classList.add('calendar-day-selected');
          dayBtn.setAttribute('aria-selected', 'true');
        }

        if (isDisabled) {
          dayBtn.classList.add('calendar-day-disabled');
          dayBtn.disabled = true;
          dayBtn.setAttribute('aria-disabled', 'true');
        }

        this.gridEl.appendChild(dayBtn);
      }
    }

    updateNavButtons() {
      const { minDate, maxDate } = this.options;
      const year = this.viewDate.getFullYear();
      const month = this.viewDate.getMonth();

      // Check if previous month is allowed
      if (minDate) {
        const prevMonth = new Date(year, month - 1, 1);
        const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        this.prevBtn.disabled = prevMonth < minMonth;
        this.prevBtn.setAttribute('aria-disabled', prevMonth < minMonth ? 'true' : 'false');
      }

      // Check if next month is allowed
      if (maxDate) {
        const nextMonth = new Date(year, month + 1, 1);
        const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        this.nextBtn.disabled = nextMonth > maxMonth;
        this.nextBtn.setAttribute('aria-disabled', nextMonth > maxMonth ? 'true' : 'false');
      }
    }

    bindEvents() {
      // Previous month
      on(this.prevBtn, 'click', () => this.prevMonth());

      // Next month
      on(this.nextBtn, 'click', () => this.nextMonth());

      // Day selection
      on(this.gridEl, 'click', '.calendar-day', (e, target) => {
        const dateStr = target.getAttribute('data-date');
        if (dateStr && !target.disabled && !target.classList.contains('calendar-day-disabled')) {
          this.selectDate(this.parseDateISO(dateStr));
        }
      });

      // Keyboard navigation
      on(this.element, 'keydown', (e) => this.handleKeydown(e));
    }

    handleKeydown(e) {
      const activeEl = document.activeElement;
      if (!activeEl || !activeEl.classList.contains('calendar-day')) {
        return;
      }

      const dateStr = activeEl.getAttribute('data-date');
      if (!dateStr) return;

      const currentDate = this.parseDateISO(dateStr);
      let newDate = new Date(currentDate);
      let handled = false;

      switch (e.key) {
        case Keys.ARROW_LEFT:
          newDate.setDate(newDate.getDate() - 1);
          handled = true;
          break;

        case Keys.ARROW_RIGHT:
          newDate.setDate(newDate.getDate() + 1);
          handled = true;
          break;

        case Keys.ARROW_UP:
          newDate.setDate(newDate.getDate() - 7);
          handled = true;
          break;

        case Keys.ARROW_DOWN:
          newDate.setDate(newDate.getDate() + 7);
          handled = true;
          break;

        case Keys.HOME:
          // Go to start of week
          const dayOfWeek = (newDate.getDay() - this.options.weekStartsOn + 7) % 7;
          newDate.setDate(newDate.getDate() - dayOfWeek);
          handled = true;
          break;

        case Keys.END:
          // Go to end of week
          const daysToEnd = 6 - ((newDate.getDay() - this.options.weekStartsOn + 7) % 7);
          newDate.setDate(newDate.getDate() + daysToEnd);
          handled = true;
          break;

        case 'PageUp':
          if (e.shiftKey) {
            // Previous year
            newDate.setFullYear(newDate.getFullYear() - 1);
          } else {
            // Previous month
            newDate.setMonth(newDate.getMonth() - 1);
          }
          handled = true;
          break;

        case 'PageDown':
          if (e.shiftKey) {
            // Next year
            newDate.setFullYear(newDate.getFullYear() + 1);
          } else {
            // Next month
            newDate.setMonth(newDate.getMonth() + 1);
          }
          handled = true;
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (!this.isDateDisabled(currentDate)) {
            this.selectDate(currentDate);
          }
          return;

        default:
          return;
      }

      if (handled) {
        e.preventDefault();
        this.focusDate(newDate);
      }
    }

    focusDate(date) {
      // Check bounds
      if (this.options.minDate && date < this.options.minDate) {
        date = new Date(this.options.minDate);
      }
      if (this.options.maxDate && date > this.options.maxDate) {
        date = new Date(this.options.maxDate);
      }

      this.focusedDate = date;

      // Check if we need to change the view month
      if (date.getMonth() !== this.viewDate.getMonth() ||
          date.getFullYear() !== this.viewDate.getFullYear()) {
        this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
        this.updateView();
      }

      // Focus the day button
      const dateStr = this.formatDateISO(date);
      const dayBtn = $(`[data-date="${dateStr}"]`, this.gridEl);
      if (dayBtn) {
        // Update tabindex
        $$('.calendar-day', this.gridEl).forEach(btn => {
          btn.tabIndex = -1;
        });
        dayBtn.tabIndex = 0;
        dayBtn.focus();
      }
    }

    selectDate(date) {
      if (this.isDateDisabled(date)) return;

      const previousDate = this.selectedDate;
      this.selectedDate = date;
      this.focusedDate = date;

      // Update UI
      $$('.calendar-day-selected', this.gridEl).forEach(btn => {
        btn.classList.remove('calendar-day-selected');
        btn.removeAttribute('aria-selected');
      });

      const dateStr = this.formatDateISO(date);
      const dayBtn = $(`[data-date="${dateStr}"]`, this.gridEl);
      if (dayBtn) {
        dayBtn.classList.add('calendar-day-selected');
        dayBtn.setAttribute('aria-selected', 'true');
      }

      emit(this.element, 'calendar:select', {
        date: date,
        previousDate: previousDate,
        dateString: dateStr
      });
    }

    prevMonth() {
      this.viewDate.setMonth(this.viewDate.getMonth() - 1);
      this.updateView();
      emit(this.element, 'calendar:navigate', {
        year: this.viewDate.getFullYear(),
        month: this.viewDate.getMonth()
      });
    }

    nextMonth() {
      this.viewDate.setMonth(this.viewDate.getMonth() + 1);
      this.updateView();
      emit(this.element, 'calendar:navigate', {
        year: this.viewDate.getFullYear(),
        month: this.viewDate.getMonth()
      });
    }

    goToDate(date) {
      this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.focusedDate = new Date(date);
      this.updateView();
    }

    isDateDisabled(date) {
      const { minDate, maxDate, disabledDates } = this.options;

      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      // Check disabled dates array
      for (const disabled of disabledDates) {
        if (typeof disabled === 'function') {
          if (disabled(date)) return true;
        } else if (disabled instanceof Date) {
          if (this.isSameDay(date, disabled)) return true;
        }
      }

      return false;
    }

    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    }

    formatDateISO(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    parseDateISO(dateStr) {
      // Parse ISO date string (YYYY-MM-DD) as local date, not UTC
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    formatDateLong(date) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Public API
    getSelectedDate() {
      return this.selectedDate;
    }

    setSelectedDate(date) {
      if (date) {
        this.selectDate(new Date(date));
        this.goToDate(this.selectedDate);
      } else {
        this.selectedDate = null;
        $$('.calendar-day-selected', this.gridEl).forEach(btn => {
          btn.classList.remove('calendar-day-selected');
          btn.removeAttribute('aria-selected');
        });
      }
    }

    setMinDate(date) {
      this.options.minDate = date ? new Date(date) : null;
      this.updateView();
    }

    setMaxDate(date) {
      this.options.maxDate = date ? new Date(date) : null;
      this.updateView();
    }

    destroy() {
      this.element.innerHTML = '';
      this.element.classList.remove('calendar');
      this.element.removeAttribute('role');
      this.element.removeAttribute('aria-label');
      BrandUI.removeInstance(this.element, 'calendar');
    }
  }

  // Auto-initialize from data attributes
  function initCalendar(element) {
    const data = BrandUI.getData(element);

    const options = {
      selected: data.selected ? new Date(data.selected) : null,
      minDate: data.mindate ? new Date(data.mindate) : null,
      maxDate: data.maxdate ? new Date(data.maxdate) : null,
      showOutsideDays: data.showoutsidedays !== 'false',
      weekStartsOn: parseInt(data.weekstartson, 10) || 0
    };

    return new Calendar(element, options);
  }

  // Register for auto-init
  registerComponent('calendar', initCalendar);

  // Export
  BrandUI.components.Calendar = Calendar;
  BrandUI.Calendar = function(element, options) {
    return new Calendar(element, options);
  };

})();


/* === vanilla/js/components/carousel.js === */
/**
 * Brand UI - Carousel Component
 * Slide carousel with navigation, dots, touch/swipe, and keyboard support
 */

(function () {
  'use strict';

  const { $, $$, on, emit, getData, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Default options
   */
  const DEFAULTS = {
    loop: false,
    autoplay: false,
    autoplayInterval: 5000,
    orientation: 'horizontal',
    showDots: false,
    swipeThreshold: 50,
  };

  /**
   * Arrow SVG icons
   */
  const ARROW_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
  const ARROW_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></svg>`;

  /**
   * Carousel class
   */
  class Carousel {
    constructor(element, options = {}) {
      this.element = element;
      this.options = { ...DEFAULTS, ...getData(element, 'carousel'), ...options };
      this.currentIndex = 0;
      this.autoplayTimer = null;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.currentX = 0;
      this.currentY = 0;

      this._init();
    }

    _init() {
      // Get elements
      this.content = $('.carousel-content', this.element);
      this.track = $('.carousel-track', this.element);
      this.items = $$('.carousel-item', this.element);
      this.prevBtn = $('.carousel-previous', this.element);
      this.nextBtn = $('.carousel-next', this.element);
      this.dotsContainer = $('.carousel-dots', this.element);
      this.dots = [];

      if (!this.track || this.items.length === 0) {
        console.warn('Carousel: Missing track or items');
        return;
      }

      // Set orientation attribute
      this.element.setAttribute('data-orientation', this.options.orientation);

      // Create navigation if not present
      if (!this.prevBtn) {
        this._createNavigation();
      }

      // Create dots if enabled and not present
      if (this.options.showDots && !this.dotsContainer) {
        this._createDots();
      } else if (this.dotsContainer) {
        this.dots = $$('.carousel-dot', this.dotsContainer);
      }

      // Set ARIA attributes
      this.element.setAttribute('role', 'region');
      this.element.setAttribute('aria-roledescription', 'carousel');
      this.element.setAttribute('tabindex', '0');

      this.items.forEach((item, index) => {
        item.setAttribute('role', 'group');
        item.setAttribute('aria-roledescription', 'slide');
        item.setAttribute('aria-label', `Slide ${index + 1} of ${this.items.length}`);
      });

      // Bind events
      this._bindEvents();

      // Initial state
      this._updateState();

      // Start autoplay if enabled
      if (this.options.autoplay) {
        this._startAutoplay();
      }

      // Store instance
      setInstance(this.element, 'carousel', this);
    }

    _createNavigation() {
      // Previous button
      this.prevBtn = document.createElement('button');
      this.prevBtn.type = 'button';
      this.prevBtn.className = 'carousel-previous';
      this.prevBtn.innerHTML = `${ARROW_LEFT}<span class="sr-only">Previous slide</span>`;
      this.element.appendChild(this.prevBtn);

      // Next button
      this.nextBtn = document.createElement('button');
      this.nextBtn.type = 'button';
      this.nextBtn.className = 'carousel-next';
      this.nextBtn.innerHTML = `${ARROW_RIGHT}<span class="sr-only">Next slide</span>`;
      this.element.appendChild(this.nextBtn);
    }

    _createDots() {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'carousel-dots';
      this.dotsContainer.setAttribute('role', 'tablist');
      this.dotsContainer.setAttribute('aria-label', 'Carousel navigation');

      this.items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      this.element.appendChild(this.dotsContainer);
    }

    _bindEvents() {
      // Navigation buttons
      if (this.prevBtn) {
        on(this.prevBtn, 'click', () => this.prev());
      }
      if (this.nextBtn) {
        on(this.nextBtn, 'click', () => this.next());
      }

      // Dots
      this.dots.forEach((dot, index) => {
        on(dot, 'click', () => this.goTo(index));
      });

      // Keyboard navigation
      on(this.element, 'keydown', (e) => this._handleKeydown(e));

      // Touch/swipe support
      on(this.content, 'touchstart', (e) => this._handleTouchStart(e), { passive: true });
      on(this.content, 'touchmove', (e) => this._handleTouchMove(e), { passive: false });
      on(this.content, 'touchend', (e) => this._handleTouchEnd(e));

      // Mouse drag support
      on(this.content, 'mousedown', (e) => this._handleMouseDown(e));
      on(document, 'mousemove', (e) => this._handleMouseMove(e));
      on(document, 'mouseup', (e) => this._handleMouseUp(e));

      // Pause autoplay on hover/focus
      if (this.options.autoplay) {
        on(this.element, 'mouseenter', () => this._stopAutoplay());
        on(this.element, 'mouseleave', () => this._startAutoplay());
        on(this.element, 'focusin', () => this._stopAutoplay());
        on(this.element, 'focusout', () => this._startAutoplay());
      }
    }

    _handleKeydown(e) {
      const isHorizontal = this.options.orientation === 'horizontal';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

      switch (e.key) {
        case prevKey:
          e.preventDefault();
          this.prev();
          break;
        case nextKey:
          e.preventDefault();
          this.next();
          break;
        case 'Home':
          e.preventDefault();
          this.goTo(0);
          break;
        case 'End':
          e.preventDefault();
          this.goTo(this.items.length - 1);
          break;
      }
    }

    _handleTouchStart(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.element.classList.add('is-dragging');
    }

    _handleTouchMove(e) {
      if (!this.isDragging) return;

      this.currentX = e.touches[0].clientX;
      this.currentY = e.touches[0].clientY;

      const diffX = this.startX - this.currentX;
      const diffY = this.startY - this.currentY;
      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal ? diffX : diffY;

      // Prevent vertical scroll when swiping horizontally
      if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
      }
    }

    _handleTouchEnd() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.element.classList.remove('is-dragging');

      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal
        ? this.startX - this.currentX
        : this.startY - this.currentY;

      if (Math.abs(diff) > this.options.swipeThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    _handleMouseDown(e) {
      // Only handle left mouse button
      if (e.button !== 0) return;

      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.element.classList.add('is-dragging');
      e.preventDefault(); // Prevent text selection
    }

    _handleMouseMove(e) {
      if (!this.isDragging) return;

      this.currentX = e.clientX;
      this.currentY = e.clientY;
    }

    _handleMouseUp() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.element.classList.remove('is-dragging');

      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal
        ? this.startX - this.currentX
        : this.startY - this.currentY;

      if (Math.abs(diff) > this.options.swipeThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    _startAutoplay() {
      if (this.autoplayTimer) return;

      this.autoplayTimer = setInterval(() => {
        if (this.options.loop || this.currentIndex < this.items.length - 1) {
          this.next();
        } else {
          this.goTo(0);
        }
      }, this.options.autoplayInterval);
    }

    _stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    _updateState() {
      // Update track position
      const offset = this.currentIndex * 100;
      if (this.options.orientation === 'horizontal') {
        this.track.style.transform = `translateX(-${offset}%)`;
      } else {
        this.track.style.transform = `translateY(-${offset}%)`;
      }

      // Update button states
      const canPrev = this.options.loop || this.currentIndex > 0;
      const canNext = this.options.loop || this.currentIndex < this.items.length - 1;

      if (this.prevBtn) {
        this.prevBtn.disabled = !canPrev;
        this.prevBtn.setAttribute('aria-disabled', !canPrev);
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = !canNext;
        this.nextBtn.setAttribute('aria-disabled', !canNext);
      }

      // Update dots
      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive);
      });

      // Update live region for screen readers
      this.element.setAttribute('aria-live', 'polite');
    }

    /**
     * Go to previous slide
     */
    prev() {
      let newIndex = this.currentIndex - 1;

      if (newIndex < 0) {
        newIndex = this.options.loop ? this.items.length - 1 : 0;
      }

      this.goTo(newIndex);
    }

    /**
     * Go to next slide
     */
    next() {
      let newIndex = this.currentIndex + 1;

      if (newIndex >= this.items.length) {
        newIndex = this.options.loop ? 0 : this.items.length - 1;
      }

      this.goTo(newIndex);
    }

    /**
     * Go to specific slide
     */
    goTo(index) {
      if (index < 0 || index >= this.items.length) return;
      if (index === this.currentIndex) return;

      const prevIndex = this.currentIndex;
      this.currentIndex = index;

      this._updateState();

      emit(this.element, 'carousel:change', {
        currentIndex: this.currentIndex,
        previousIndex: prevIndex,
      });
    }

    /**
     * Get current slide index
     */
    getCurrentIndex() {
      return this.currentIndex;
    }

    /**
     * Get total number of slides
     */
    getCount() {
      return this.items.length;
    }

    /**
     * Destroy instance
     */
    destroy() {
      this._stopAutoplay();
      this.element.removeAttribute('role');
      this.element.removeAttribute('aria-roledescription');
      this.element.removeAttribute('tabindex');
      this.element.removeAttribute('aria-live');
      this.track.style.transform = '';
    }
  }

  /**
   * Initialize carousel
   */
  function initCarousel(element, options) {
    const existing = getInstance(element, 'carousel');
    if (existing) return existing;

    return new Carousel(element, options);
  }

  // Register for auto-initialization
  registerComponent('carousel', initCarousel);

  // Export
  BrandUI.components.Carousel = Carousel;
  BrandUI.Carousel = initCarousel;
})();


/* === vanilla/js/components/chart.js === */
/**
 * Brand UI - Chart Component
 * Vanilla JS implementation for SVG chart rendering
 */

(function () {
  'use strict';

  const { on, emit, setInstance, getInstance, registerComponent } = BrandUI;

  // Default chart configuration
  const DEFAULTS = {
    width: 400,
    height: 250,
    padding: { top: 30, right: 20, bottom: 40, left: 50 },
    colors: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
    showGrid: true,
    showAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
  };

  /**
   * Chart Component
   * Renders SVG charts from data
   */
  class Chart {
    constructor(element, options = {}) {
      this.element = element;
      this.options = { ...DEFAULTS, ...options };
      this.data = options.data || [];
      this.type = options.type || 'bar';

      this.svg = null;
      this.tooltip = null;
      this.legend = null;

      this._init();
    }

    _init() {
      this._chartId = this.element.dataset.chart || `chart-${Date.now()}`;
      this.element.dataset.chart = this._chartId;
      this.element.classList.add('chart');

      this._createStructure();

      if (this.data.length > 0) {
        this.render();
      }

      setInstance(this.element, 'chart', this);
    }

    _createStructure() {
      // Clear existing content
      this.element.innerHTML = '';

      // Create container
      const container = document.createElement('div');
      container.className = 'chart-container';
      container.style.height = `${this.options.height + 50}px`;

      // Create SVG
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('class', 'chart-area');
      this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
      this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      container.appendChild(this.svg);

      // Create tooltip
      if (this.options.showTooltip) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'chart-tooltip';
        this.tooltip.innerHTML = '<div class="chart-tooltip-content"></div>';
        this.tooltip.setAttribute('data-visible', 'false');
        container.appendChild(this.tooltip);
      }

      this.element.appendChild(container);

      // Create legend
      if (this.options.showLegend) {
        this.legend = document.createElement('div');
        this.legend.className = `chart-legend chart-legend-${this.options.legendPosition}`;
        this.element.appendChild(this.legend);
      }
    }

    // Render chart based on type
    render() {
      this.svg.innerHTML = '';

      switch (this.type) {
        case 'bar':
          this._renderBarChart();
          break;
        case 'line':
          this._renderLineChart();
          break;
        case 'pie':
          this._renderPieChart();
          break;
        case 'area':
          this._renderLineChart(true);
          break;
        default:
          this._renderBarChart();
      }

      this._renderLegend();
      this._bindEvents();
    }

    // Bar Chart
    _renderBarChart() {
      const { width, height, padding, colors, showGrid, showAxis } = this.options;
      const data = this.data;

      if (!data.length) return;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Calculate scales
      const maxValue = Math.max(...data.map(d =>
        typeof d.value === 'number' ? d.value : Math.max(...Object.values(d.values || {}))
      ));
      const yScale = chartHeight / (maxValue * 1.1);

      const isGrouped = data[0].values !== undefined;
      const seriesKeys = isGrouped ? Object.keys(data[0].values) : ['value'];
      const barGroupWidth = chartWidth / data.length;
      const barWidth = isGrouped
        ? (barGroupWidth - 10) / seriesKeys.length
        : barGroupWidth - 20;

      // Grid lines
      if (showGrid) {
        const gridGroup = this._createSVGElement('g', { class: 'chart-grid-lines' });
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const y = padding.top + (chartHeight / gridLines) * i;
          gridGroup.appendChild(this._createSVGElement('line', {
            class: 'chart-grid',
            x1: padding.left,
            y1: y,
            x2: width - padding.right,
            y2: y,
          }));
        }
        this.svg.appendChild(gridGroup);
      }

      // Axes
      if (showAxis) {
        // Y Axis
        const yAxisGroup = this._createSVGElement('g', { class: 'chart-y-axis' });
        yAxisGroup.appendChild(this._createSVGElement('line', {
          class: 'chart-axis',
          x1: padding.left,
          y1: padding.top,
          x2: padding.left,
          y2: height - padding.bottom,
        }));

        // Y axis ticks
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const value = maxValue * 1.1 * (1 - i / gridLines);
          const y = padding.top + (chartHeight / gridLines) * i;
          const text = this._createSVGElement('text', {
            class: 'chart-axis-tick',
            x: padding.left - 5,
            y: y + 4,
            'text-anchor': 'end',
          });
          text.textContent = this._formatValue(value);
          yAxisGroup.appendChild(text);
        }
        this.svg.appendChild(yAxisGroup);

        // X Axis
        const xAxisGroup = this._createSVGElement('g', { class: 'chart-x-axis' });
        xAxisGroup.appendChild(this._createSVGElement('line', {
          class: 'chart-axis',
          x1: padding.left,
          y1: height - padding.bottom,
          x2: width - padding.right,
          y2: height - padding.bottom,
        }));

        // X axis labels
        data.forEach((d, i) => {
          const x = padding.left + barGroupWidth * i + barGroupWidth / 2;
          const text = this._createSVGElement('text', {
            class: 'chart-axis-tick',
            x: x,
            y: height - padding.bottom + 18,
            'text-anchor': 'middle',
          });
          text.textContent = d.label;
          xAxisGroup.appendChild(text);
        });
        this.svg.appendChild(xAxisGroup);
      }

      // Bars
      const barsGroup = this._createSVGElement('g', { class: 'chart-bars' });

      data.forEach((d, i) => {
        if (isGrouped) {
          seriesKeys.forEach((key, j) => {
            const value = d.values[key];
            const barHeight = value * yScale;
            const x = padding.left + barGroupWidth * i + 5 + barWidth * j;
            const y = height - padding.bottom - barHeight;

            const rect = this._createSVGElement('rect', {
              class: 'chart-bar',
              x: x,
              y: y,
              width: barWidth,
              height: barHeight,
              fill: colors[j % colors.length],
              rx: 4,
              'data-chart-label': d.label,
              'data-chart-value': value,
              'data-chart-name': key,
            });
            barsGroup.appendChild(rect);
          });
        } else {
          const value = d.value;
          const barHeight = value * yScale;
          const x = padding.left + barGroupWidth * i + 10;
          const y = height - padding.bottom - barHeight;

          const rect = this._createSVGElement('rect', {
            class: 'chart-bar',
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            fill: d.color || colors[0],
            rx: 4,
            'data-chart-label': d.label,
            'data-chart-value': value,
            'data-chart-name': d.name || 'Value',
          });
          barsGroup.appendChild(rect);
        }
      });

      this.svg.appendChild(barsGroup);
    }

    // Line Chart
    _renderLineChart(showArea = false) {
      const { width, height, padding, colors, showGrid, showAxis } = this.options;
      const data = this.data;

      if (!data.length) return;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Calculate scales
      const maxValue = Math.max(...data.map(d =>
        typeof d.value === 'number' ? d.value : Math.max(...Object.values(d.values || {}))
      ));
      const yScale = chartHeight / (maxValue * 1.1);
      const xStep = chartWidth / (data.length - 1);

      const isMultiSeries = data[0].values !== undefined;
      const seriesKeys = isMultiSeries ? Object.keys(data[0].values) : ['value'];

      // Grid lines
      if (showGrid) {
        const gridGroup = this._createSVGElement('g', { class: 'chart-grid-lines' });
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const y = padding.top + (chartHeight / gridLines) * i;
          gridGroup.appendChild(this._createSVGElement('line', {
            class: 'chart-grid',
            x1: padding.left,
            y1: y,
            x2: width - padding.right,
            y2: y,
          }));
        }
        this.svg.appendChild(gridGroup);
      }

      // Axes
      if (showAxis) {
        // Y Axis
        const yAxisGroup = this._createSVGElement('g', { class: 'chart-y-axis' });
        yAxisGroup.appendChild(this._createSVGElement('line', {
          class: 'chart-axis',
          x1: padding.left,
          y1: padding.top,
          x2: padding.left,
          y2: height - padding.bottom,
        }));

        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const value = maxValue * 1.1 * (1 - i / gridLines);
          const y = padding.top + (chartHeight / gridLines) * i;
          const text = this._createSVGElement('text', {
            class: 'chart-axis-tick',
            x: padding.left - 5,
            y: y + 4,
            'text-anchor': 'end',
          });
          text.textContent = this._formatValue(value);
          yAxisGroup.appendChild(text);
        }
        this.svg.appendChild(yAxisGroup);

        // X Axis
        const xAxisGroup = this._createSVGElement('g', { class: 'chart-x-axis' });
        xAxisGroup.appendChild(this._createSVGElement('line', {
          class: 'chart-axis',
          x1: padding.left,
          y1: height - padding.bottom,
          x2: width - padding.right,
          y2: height - padding.bottom,
        }));

        data.forEach((d, i) => {
          const x = padding.left + xStep * i;
          const text = this._createSVGElement('text', {
            class: 'chart-axis-tick',
            x: x,
            y: height - padding.bottom + 18,
            'text-anchor': 'middle',
          });
          text.textContent = d.label;
          xAxisGroup.appendChild(text);
        });
        this.svg.appendChild(xAxisGroup);
      }

      // Lines and dots for each series
      seriesKeys.forEach((key, seriesIndex) => {
        const points = data.map((d, i) => {
          const value = isMultiSeries ? d.values[key] : d.value;
          const x = padding.left + xStep * i;
          const y = height - padding.bottom - value * yScale;
          return { x, y, value, label: d.label };
        });

        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        const color = colors[seriesIndex % colors.length];

        // Area fill
        if (showArea) {
          const areaData = pathData +
            ` L${points[points.length - 1].x},${height - padding.bottom}` +
            ` L${points[0].x},${height - padding.bottom} Z`;
          const area = this._createSVGElement('path', {
            class: 'chart-area-fill',
            d: areaData,
            fill: color,
          });
          this.svg.appendChild(area);
        }

        // Line
        const line = this._createSVGElement('path', {
          class: 'chart-line',
          d: pathData,
          stroke: color,
        });
        this.svg.appendChild(line);

        // Dots
        const dotsGroup = this._createSVGElement('g', { class: 'chart-dots' });
        points.forEach((p) => {
          const dot = this._createSVGElement('circle', {
            class: 'chart-dot',
            cx: p.x,
            cy: p.y,
            r: 4,
            fill: color,
            'data-chart-label': p.label,
            'data-chart-value': p.value,
            'data-chart-name': isMultiSeries ? key : (this.options.seriesName || 'Value'),
          });
          dotsGroup.appendChild(dot);
        });
        this.svg.appendChild(dotsGroup);
      });
    }

    // Pie Chart
    _renderPieChart() {
      const { width, height, colors } = this.options;
      const data = this.data;

      if (!data.length) return;

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      const total = data.reduce((sum, d) => sum + d.value, 0);
      let currentAngle = -Math.PI / 2; // Start from top

      const pieGroup = this._createSVGElement('g', { transform: `translate(${centerX}, ${centerY})` });

      data.forEach((d, i) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;

        const x1 = Math.cos(currentAngle) * radius;
        const y1 = Math.sin(currentAngle) * radius;
        const x2 = Math.cos(endAngle) * radius;
        const y2 = Math.sin(endAngle) * radius;

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const pathData = [
          `M 0,0`,
          `L ${x1},${y1}`,
          `A ${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`,
          `Z`
        ].join(' ');

        const color = d.color || colors[i % colors.length];
        const percentage = ((d.value / total) * 100).toFixed(1);

        const path = this._createSVGElement('path', {
          class: 'chart-sector',
          d: pathData,
          fill: color,
          'data-chart-label': d.label,
          'data-chart-value': percentage,
          'data-chart-name': 'Percentage',
        });

        pieGroup.appendChild(path);
        currentAngle = endAngle;
      });

      this.svg.appendChild(pieGroup);
    }

    // Render legend
    _renderLegend() {
      if (!this.legend) return;

      this.legend.innerHTML = '';

      const isGrouped = this.data[0]?.values !== undefined;
      let items = [];

      if (this.type === 'pie') {
        items = this.data.map((d, i) => ({
          key: d.label.toLowerCase().replace(/\s+/g, '-'),
          label: d.label,
          color: d.color || this.options.colors[i % this.options.colors.length],
        }));
      } else if (isGrouped) {
        const keys = Object.keys(this.data[0].values);
        items = keys.map((key, i) => ({
          key: key.toLowerCase().replace(/\s+/g, '-'),
          label: key,
          color: this.options.colors[i % this.options.colors.length],
        }));
      } else {
        items = [{
          key: 'value',
          label: this.options.seriesName || 'Value',
          color: this.options.colors[0],
        }];
      }

      items.forEach((item) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'chart-legend-item';
        legendItem.dataset.key = item.key;
        legendItem.setAttribute('data-active', 'true');
        legendItem.innerHTML = `
          <div class="chart-legend-item-icon" style="background-color: ${item.color};"></div>
          <span class="chart-legend-item-label">${item.label}</span>
        `;
        this.legend.appendChild(legendItem);
      });
    }

    // Bind tooltip and legend events
    _bindEvents() {
      // Tooltip events
      if (this.tooltip) {
        const dataElements = this.svg.querySelectorAll('[data-chart-value]');
        dataElements.forEach((el) => {
          on(el, 'mouseenter', (e) => this._showTooltip(e, el));
          on(el, 'mouseleave', () => this._hideTooltip());
          on(el, 'mousemove', (e) => this._moveTooltip(e));
        });
      }

      // Legend events
      if (this.legend) {
        const legendItems = this.legend.querySelectorAll('.chart-legend-item');
        legendItems.forEach((item) => {
          on(item, 'click', () => this._toggleLegend(item));
        });
      }
    }

    _showTooltip(event, element) {
      const label = element.dataset.chartLabel;
      const value = element.dataset.chartValue;
      const name = element.dataset.chartName;
      const color = getComputedStyle(element).fill || getComputedStyle(element).backgroundColor;

      const content = this.tooltip.querySelector('.chart-tooltip-content');
      content.innerHTML = `
        <div class="chart-tooltip-label">${label}</div>
        <div class="chart-tooltip-items">
          <div class="chart-tooltip-item">
            <div class="chart-tooltip-indicator chart-tooltip-indicator-dot"
                 style="--color-bg: ${color}; --color-border: ${color};"></div>
            <div class="chart-tooltip-item-content">
              <span class="chart-tooltip-item-name">${name}</span>
              <span class="chart-tooltip-item-value">${this._formatValue(value)}</span>
            </div>
          </div>
        </div>
      `;

      this._moveTooltip(event);
      this.tooltip.setAttribute('data-visible', 'true');
    }

    _hideTooltip() {
      if (this.tooltip) {
        this.tooltip.setAttribute('data-visible', 'false');
      }
    }

    _moveTooltip(event) {
      if (!this.tooltip) return;

      const rect = this.element.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();

      let x = event.clientX - rect.left + 15;
      let y = event.clientY - rect.top + 15;

      if (x + tooltipRect.width > rect.width) {
        x = event.clientX - rect.left - tooltipRect.width - 15;
      }
      if (y + tooltipRect.height > rect.height) {
        y = event.clientY - rect.top - tooltipRect.height - 15;
      }

      this.tooltip.style.left = `${x}px`;
      this.tooltip.style.top = `${y}px`;
    }

    _toggleLegend(item) {
      const isActive = item.getAttribute('data-active') === 'true';
      item.setAttribute('data-active', !isActive);

      emit(this.element, 'chart:legendToggle', {
        key: item.dataset.key,
        active: !isActive,
      });
    }

    // Helpers
    _createSVGElement(tag, attrs = {}) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
      });
      return el;
    }

    _formatValue(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toLocaleString();
    }

    // Public API

    /**
     * Set chart data and re-render
     */
    setData(data) {
      this.data = data;
      this.render();
    }

    /**
     * Set chart type and re-render
     */
    setType(type) {
      this.type = type;
      this.render();
    }

    /**
     * Update options and re-render
     */
    update(options) {
      Object.assign(this.options, options);
      if (options.data) this.data = options.data;
      if (options.type) this.type = options.type;
      this.render();
    }

    /**
     * Destroy the chart
     */
    destroy() {
      this.element.innerHTML = '';
      setInstance(this.element, 'chart', null);
    }
  }

  // Factory function
  function createChart(element, options) {
    const existing = getInstance(element, 'chart');
    if (existing) {
      if (options) existing.update(options);
      return existing;
    }
    return new Chart(element, options);
  }

  // Register for auto-init
  registerComponent('chart', (element) => {
    // Only auto-init if data is provided via data attributes
    const type = element.dataset.chartType;
    if (type) {
      createChart(element, { type });
    }
  });

  // Export
  BrandUI.components.Chart = Chart;
  BrandUI.createChart = createChart;
})();


/* === vanilla/js/components/checkbox.js === */
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


/* === vanilla/js/components/collapsible.js === */
/**
 * Brand UI - Collapsible Component
 * Accessible collapsible panel with keyboard support and animations.
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'collapsible';

  /**
   * Initialize a collapsible element
   */
  function initCollapsible(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const config = BrandUI.getData(element);
    const initialOpen = config.open === 'true' || config.open === true;

    // Find trigger and content elements
    const trigger = element.querySelector('.collapsible-trigger');
    const content = element.querySelector('.collapsible-content');

    if (!trigger || !content) {
      console.warn('Collapsible: Missing trigger or content element');
      return null;
    }

    // Generate unique IDs for accessibility
    const triggerId = trigger.id || BrandUI.uid('collapsible-trigger');
    const contentId = content.id || BrandUI.uid('collapsible-content');

    trigger.id = triggerId;
    content.id = contentId;

    // Set up ARIA attributes
    trigger.setAttribute('aria-expanded', initialOpen ? 'true' : 'false');
    trigger.setAttribute('aria-controls', contentId);
    content.setAttribute('aria-labelledby', triggerId);

    // Set initial state
    element.setAttribute('data-state', initialOpen ? 'open' : 'closed');

    // Store content height for animation
    let contentHeight = 0;

    /**
     * Measure content height
     */
    function measureHeight() {
      // Temporarily show content to measure
      const wasHidden = element.getAttribute('data-state') === 'closed';
      if (wasHidden) {
        content.style.visibility = 'hidden';
        content.style.height = 'auto';
        content.style.display = 'block';
      }

      contentHeight = content.scrollHeight;

      if (wasHidden) {
        content.style.visibility = '';
        content.style.height = '';
        content.style.display = '';
      }

      return contentHeight;
    }

    /**
     * Check if collapsible is open
     */
    function isOpen() {
      return element.getAttribute('data-state') === 'open';
    }

    /**
     * Open the collapsible with animation
     */
    function open() {
      if (isOpen() || trigger.disabled) return;

      measureHeight();

      // Start animation
      content.setAttribute('data-animating', 'true');
      content.style.height = '0px';

      // Force reflow
      content.offsetHeight;

      // Animate to full height
      content.style.height = contentHeight + 'px';

      // Update state
      element.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');

      // Clean up after animation
      BrandUI.afterTransition(content, () => {
        content.removeAttribute('data-animating');
        content.style.height = '';
      });

      // Emit event
      BrandUI.emit(element, 'collapsible:open');
      BrandUI.emit(element, 'collapsible:change', { open: true });
    }

    /**
     * Close the collapsible with animation
     */
    function close() {
      if (!isOpen() || trigger.disabled) return;

      // Get current height and set it explicitly
      contentHeight = content.scrollHeight;
      content.style.height = contentHeight + 'px';

      // Force reflow
      content.offsetHeight;

      // Start animation
      content.setAttribute('data-animating', 'true');
      content.style.height = '0px';

      // Update state
      element.setAttribute('data-state', 'closed');
      trigger.setAttribute('aria-expanded', 'false');

      // Clean up after animation
      BrandUI.afterTransition(content, () => {
        content.removeAttribute('data-animating');
        content.style.height = '';
      });

      // Emit event
      BrandUI.emit(element, 'collapsible:close');
      BrandUI.emit(element, 'collapsible:change', { open: false });
    }

    /**
     * Toggle the collapsible
     */
    function toggle() {
      if (isOpen()) {
        close();
      } else {
        open();
      }
    }

    /**
     * Handle trigger click
     */
    function handleClick(e) {
      e.preventDefault();
      toggle();
    }

    /**
     * Handle keyboard events
     */
    function handleKeydown(e) {
      if (e.key === BrandUI.Keys.ENTER || e.key === BrandUI.Keys.SPACE) {
        e.preventDefault();
        toggle();
      }
    }

    // Bind events
    const removeClick = BrandUI.on(trigger, 'click', handleClick);
    const removeKeydown = BrandUI.on(trigger, 'keydown', handleKeydown);

    // Set initial height if open
    if (initialOpen) {
      measureHeight();
    }

    // API
    const api = {
      element,
      trigger,
      content,

      isOpen,
      open,
      close,
      toggle,

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
   * Create a new collapsible element
   */
  function createCollapsible(options = {}) {
    const {
      id,
      open = false,
      disabled = false,
      triggerContent = 'Toggle',
      contentHtml = '',
      className = '',
    } = options;

    const collapsible = document.createElement('div');
    collapsible.className = `collapsible ${className}`.trim();
    collapsible.setAttribute('data-collapsible', '');
    if (id) collapsible.id = id;
    if (open) collapsible.setAttribute('data-open', 'true');

    // Create trigger
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'collapsible-trigger';
    if (disabled) trigger.disabled = true;

    // Add trigger content
    const triggerText = document.createElement('span');
    triggerText.textContent = triggerContent;
    trigger.appendChild(triggerText);

    // Add chevron icon
    const icon = document.createElement('svg');
    icon.className = 'collapsible-trigger-icon';
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
    trigger.appendChild(icon);

    // Create content
    const content = document.createElement('div');
    content.className = 'collapsible-content';

    const contentInner = document.createElement('div');
    contentInner.className = 'collapsible-content-inner';
    contentInner.innerHTML = contentHtml;
    content.appendChild(contentInner);

    // Assemble
    collapsible.appendChild(trigger);
    collapsible.appendChild(content);

    // Initialize
    return initCollapsible(collapsible);
  }

  // Register component for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, initCollapsible);

  // Expose to BrandUI namespace
  BrandUI.components.Collapsible = {
    init: initCollapsible,
    create: createCollapsible,
  };
})();


/* === vanilla/js/components/combobox.js === */
/**
 * Brand UI - Combobox Component
 * Searchable select with filtering and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance } = BrandUI;

  /**
   * Combobox component
   */
  class Combobox {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        placeholder: 'Search...',
        emptyText: 'No results found.',
        ...options,
      };

      this.trigger = $('.combobox-trigger', this.root);
      this.input = $('.combobox-input', this.root);
      this.content = $('.combobox-content', this.root);
      this.list = $('.combobox-list', this.root);
      this.emptyEl = $('.combobox-empty', this.root);

      this.isOpen = false;
      this.highlightedIndex = -1;
      this.selectedValue = null;
      this.items = [];
      this.visibleItems = [];

      this._cleanupClickOutside = null;

      this._init();
    }

    _init() {
      this._cacheItems();
      this._setupIds();
      this._setupAria();
      this._bindEvents();
      this._restoreSelection();
    }

    _cacheItems() {
      this.items = $$('.combobox-item', this.list);
    }

    _setupIds() {
      this.listId = this.list.id || uid('combobox-list');
      this.list.id = this.listId;

      this.items.forEach((item, i) => {
        if (!item.id) {
          item.id = uid('combobox-item');
        }
      });
    }

    _setupAria() {
      this.input.setAttribute('role', 'combobox');
      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.setAttribute('aria-controls', this.listId);
      this.input.setAttribute('aria-haspopup', 'listbox');

      this.list.setAttribute('role', 'listbox');

      this.items.forEach((item) => {
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
      });
    }

    _bindEvents() {
      // Input events
      on(this.input, 'focus', () => this.open());
      on(this.input, 'input', (e) => this._onInput(e));
      on(this.input, 'keydown', (e) => this._onKeydown(e));

      // Trigger icon click
      const triggerIcon = $('.combobox-trigger-icon', this.trigger);
      if (triggerIcon) {
        on(triggerIcon.parentElement || this.trigger, 'click', (e) => {
          if (e.target === this.input) return;
          this.toggle();
          this.input.focus();
        });
      }

      // Clear button
      const clearBtn = $('.combobox-clear', this.root);
      if (clearBtn) {
        on(clearBtn, 'click', (e) => {
          e.stopPropagation();
          this.clear();
          this.input.focus();
        });
      }

      // Item selection
      on(this.list, 'click', '.combobox-item', (e, item) => {
        if (item.dataset.disabled === 'true') return;
        this._selectItem(item);
      });

      // Mouse hover on items
      on(this.list, 'mousemove', '.combobox-item', (e, item) => {
        if (item.dataset.disabled === 'true') return;
        const index = this.visibleItems.indexOf(item);
        if (index !== -1) {
          this._highlightItem(index);
        }
      });
    }

    _restoreSelection() {
      const selectedItem = this.items.find(
        (item) => item.dataset.selected === 'true'
      );
      if (selectedItem) {
        this.selectedValue = selectedItem.dataset.value;
        this.input.value = selectedItem.textContent.trim();
      }
    }

    _onInput(e) {
      const query = e.target.value.toLowerCase().trim();
      this._filter(query);

      if (!this.isOpen) {
        this.open();
      }
    }

    _filter(query) {
      let hasVisible = false;

      this.items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        item.dataset.hidden = matches ? 'false' : 'true';
        if (matches) hasVisible = true;
      });

      this.root.dataset.empty = !hasVisible;
      this._cacheVisibleItems();

      // Reset highlight
      this.highlightedIndex = -1;
      if (this.visibleItems.length > 0) {
        this._highlightItem(0);
      }
    }

    _cacheVisibleItems() {
      this.visibleItems = this.items.filter(
        (item) => item.dataset.hidden !== 'true' && item.dataset.disabled !== 'true'
      );
    }

    _onKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          if (!this.isOpen) {
            this.open();
          } else {
            this._navigateItems(1);
          }
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          if (this.isOpen) {
            this._navigateItems(-1);
          }
          break;

        case Keys.ENTER:
          e.preventDefault();
          if (this.isOpen && this.highlightedIndex >= 0) {
            const item = this.visibleItems[this.highlightedIndex];
            if (item) {
              this._selectItem(item);
            }
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          break;

        case Keys.TAB:
          this.close();
          break;

        case Keys.HOME:
          if (this.isOpen) {
            e.preventDefault();
            this._highlightItem(0);
          }
          break;

        case Keys.END:
          if (this.isOpen) {
            e.preventDefault();
            this._highlightItem(this.visibleItems.length - 1);
          }
          break;
      }
    }

    _navigateItems(direction) {
      if (this.visibleItems.length === 0) return;

      let newIndex = this.highlightedIndex + direction;

      if (newIndex < 0) {
        newIndex = this.visibleItems.length - 1;
      } else if (newIndex >= this.visibleItems.length) {
        newIndex = 0;
      }

      this._highlightItem(newIndex);
    }

    _highlightItem(index) {
      // Remove previous highlight
      this.visibleItems.forEach((item) => {
        item.dataset.highlighted = 'false';
      });

      this.highlightedIndex = index;

      if (index >= 0 && index < this.visibleItems.length) {
        const item = this.visibleItems[index];
        item.dataset.highlighted = 'true';
        this.input.setAttribute('aria-activedescendant', item.id);

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });
      } else {
        this.input.removeAttribute('aria-activedescendant');
      }
    }

    _selectItem(item) {
      const value = item.dataset.value;
      const text = item.textContent.trim();

      // Update selection state
      this.items.forEach((i) => {
        i.dataset.selected = 'false';
        i.setAttribute('aria-selected', 'false');
      });

      item.dataset.selected = 'true';
      item.setAttribute('aria-selected', 'true');

      this.selectedValue = value;
      this.input.value = text;

      this.close();

      emit(this.root, 'combobox:change', { value, text, item });
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.root.dataset.open = 'true';
      this.input.setAttribute('aria-expanded', 'true');

      // Reset filter to show all
      this._filter('');

      // Highlight selected or first item
      const selectedIndex = this.visibleItems.findIndex(
        (item) => item.dataset.selected === 'true'
      );
      this._highlightItem(selectedIndex >= 0 ? selectedIndex : 0);

      // Click outside to close
      this._cleanupClickOutside = onClickOutside(this.root, () => this.close());

      emit(this.root, 'combobox:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.root.dataset.open = 'false';
      this.input.setAttribute('aria-expanded', 'false');
      this.input.removeAttribute('aria-activedescendant');

      // Clear highlight
      this.visibleItems.forEach((item) => {
        item.dataset.highlighted = 'false';
      });
      this.highlightedIndex = -1;

      // Cleanup click outside listener
      if (this._cleanupClickOutside) {
        this._cleanupClickOutside();
        this._cleanupClickOutside = null;
      }

      emit(this.root, 'combobox:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    clear() {
      this.items.forEach((item) => {
        item.dataset.selected = 'false';
        item.setAttribute('aria-selected', 'false');
      });

      this.selectedValue = null;
      this.input.value = '';

      this._filter('');

      emit(this.root, 'combobox:clear');
      emit(this.root, 'combobox:change', { value: null, text: '', item: null });
    }

    getValue() {
      return this.selectedValue;
    }

    setValue(value) {
      const item = this.items.find((i) => i.dataset.value === value);
      if (item) {
        this._selectItem(item);
      }
    }

    destroy() {
      if (this._cleanupClickOutside) {
        this._cleanupClickOutside();
      }
    }
  }

  /**
   * Initialize combobox
   */
  function initCombobox(element) {
    if (getInstance(element, 'combobox')) return getInstance(element, 'combobox');

    const options = {
      placeholder: element.dataset.placeholder,
      emptyText: element.dataset.emptyText,
    };

    const instance = new Combobox(element, options);
    setInstance(element, 'combobox', instance);
    return instance;
  }

  // Register for auto-init
  BrandUI.registerComponent('combobox', initCombobox);

  // Export
  BrandUI.components.Combobox = Combobox;
  BrandUI.Combobox = initCombobox;
})();


/* === vanilla/js/components/command.js === */
/**
 * Brand UI - Command Component
 * Command palette with search and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Command Component
   */
  class Command {
    constructor(element, options = {}) {
      this.element = element;
      this.id = element.id || uid('command');
      element.id = this.id;

      this.options = {
        filter: true,
        loop: true,
        placeholder: 'Type a command or search...',
        emptyText: 'No results found.',
        ...options,
      };

      this.input = null;
      this.list = null;
      this.emptyEl = null;
      this.items = [];
      this.groups = [];
      this.selectedIndex = -1;
      this.isDialog = element.classList.contains('command-dialog');
      this.cleanupFns = [];

      this._init();
      setInstance(element, 'command', this);
    }

    _init() {
      this._cacheElements();
      this._bindEvents();
      this._updateItems();

      if (this.items.length > 0) {
        this._selectItem(0);
      }
    }

    _cacheElements() {
      this.input = $('.command-input', this.element);
      this.list = $('.command-list', this.element);
      this.emptyEl = $('.command-empty', this.element);
      this.groups = $$('.command-group', this.element);
    }

    _updateItems() {
      this.items = $$('.command-item:not([hidden]):not(.disabled):not([data-disabled="true"])', this.element);
    }

    _bindEvents() {
      // Input filtering
      if (this.input) {
        const inputHandler = on(this.input, 'input', () => this._handleFilter());
        this.cleanupFns.push(inputHandler);
      }

      // Keyboard navigation
      const keydownHandler = on(this.element, 'keydown', (e) => this._handleKeydown(e));
      this.cleanupFns.push(keydownHandler);

      // Item click
      const clickHandler = on(this.element, 'click', '.command-item', (e, target) => {
        if (!target.hasAttribute('data-disabled') && !target.classList.contains('disabled')) {
          this._handleSelect(target);
        }
      });
      this.cleanupFns.push(clickHandler);

      // Item hover
      const mouseenterHandler = on(this.element, 'mouseenter', '.command-item', (e, target) => {
        if (!target.hasAttribute('data-disabled') && !target.classList.contains('disabled')) {
          const index = this.items.indexOf(target);
          if (index !== -1) {
            this._selectItem(index);
          }
        }
      });
      this.cleanupFns.push(mouseenterHandler);

      // Dialog mode
      if (this.isDialog) {
        const backdropHandler = on(this.element, 'click', (e) => {
          if (e.target === this.element) {
            this.close();
          }
        });
        this.cleanupFns.push(backdropHandler);

        const escapeHandler = on(document, 'keydown', (e) => {
          if (e.key === Keys.ESCAPE && this.isOpen()) {
            e.preventDefault();
            this.close();
          }
        });
        this.cleanupFns.push(escapeHandler);
      }
    }

    _handleFilter() {
      if (!this.options.filter || !this.input) return;

      const query = this.input.value.toLowerCase().trim();
      let visibleCount = 0;

      // Filter items
      $$('.command-item', this.element).forEach((item) => {
        const text = item.textContent.toLowerCase();
        const value = item.dataset.value?.toLowerCase() || '';
        const keywords = item.dataset.keywords?.toLowerCase() || '';
        const matches = text.includes(query) || value.includes(query) || keywords.includes(query);

        item.hidden = !matches;
        if (matches) visibleCount++;
      });

      // Show/hide groups based on visible items
      this.groups.forEach((group) => {
        const visibleItems = $$('.command-item:not([hidden])', group);
        group.hidden = visibleItems.length === 0;
      });

      // Show empty state
      if (this.emptyEl) {
        this.emptyEl.classList.toggle('visible', visibleCount === 0);
      }

      // Update items list and selection
      this._updateItems();
      if (this.items.length > 0) {
        this._selectItem(0);
      } else {
        this.selectedIndex = -1;
      }

      emit(this.element, 'command:filter', { query, count: visibleCount });
    }

    _handleKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._navigateDown();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._navigateUp();
          break;

        case Keys.ENTER:
          e.preventDefault();
          if (this.selectedIndex >= 0 && this.items[this.selectedIndex]) {
            this._handleSelect(this.items[this.selectedIndex]);
          }
          break;

        case Keys.HOME:
          e.preventDefault();
          if (this.items.length > 0) {
            this._selectItem(0);
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (this.items.length > 0) {
            this._selectItem(this.items.length - 1);
          }
          break;
      }
    }

    _navigateDown() {
      if (this.items.length === 0) return;

      let newIndex = this.selectedIndex + 1;
      if (newIndex >= this.items.length) {
        newIndex = this.options.loop ? 0 : this.items.length - 1;
      }
      this._selectItem(newIndex);
    }

    _navigateUp() {
      if (this.items.length === 0) return;

      let newIndex = this.selectedIndex - 1;
      if (newIndex < 0) {
        newIndex = this.options.loop ? this.items.length - 1 : 0;
      }
      this._selectItem(newIndex);
    }

    _selectItem(index) {
      // Clear previous selection
      this.items.forEach((item) => {
        item.removeAttribute('data-selected');
        item.classList.remove('selected');
      });

      // Set new selection
      if (index >= 0 && index < this.items.length) {
        this.selectedIndex = index;
        const item = this.items[index];
        item.setAttribute('data-selected', 'true');
        item.classList.add('selected');

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });

        emit(this.element, 'command:select', { item, index });
      }
    }

    _handleSelect(item) {
      const value = item.dataset.value || item.textContent.trim();
      emit(this.element, 'command:execute', { item, value });

      if (this.isDialog) {
        this.close();
      }
    }

    // Public API

    /**
     * Open command dialog
     */
    open() {
      if (!this.isDialog) return;

      this.element.classList.add('open');
      BrandUI.lockScroll();

      // Focus input
      if (this.input) {
        setTimeout(() => this.input.focus(), 50);
      }

      // Reset filter
      if (this.input) {
        this.input.value = '';
        this._handleFilter();
      }

      emit(this.element, 'command:open');
    }

    /**
     * Close command dialog
     */
    close() {
      if (!this.isDialog) return;

      this.element.classList.remove('open');
      BrandUI.unlockScroll();

      emit(this.element, 'command:close');
    }

    /**
     * Toggle command dialog
     */
    toggle() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Check if dialog is open
     */
    isOpen() {
      return this.element.classList.contains('open');
    }

    /**
     * Set filter value
     */
    setFilter(value) {
      if (this.input) {
        this.input.value = value;
        this._handleFilter();
      }
    }

    /**
     * Clear filter
     */
    clearFilter() {
      this.setFilter('');
    }

    /**
     * Get selected item
     */
    getSelectedItem() {
      return this.items[this.selectedIndex] || null;
    }

    /**
     * Refresh items list
     */
    refresh() {
      this._updateItems();
      if (this.items.length > 0 && this.selectedIndex === -1) {
        this._selectItem(0);
      }
    }

    /**
     * Destroy instance
     */
    destroy() {
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];
      BrandUI.removeInstance(this.element, 'command');
    }
  }

  /**
   * Initialize command component
   */
  function initCommand(element) {
    if (getInstance(element, 'command')) return getInstance(element, 'command');
    return new Command(element);
  }

  // Register for auto-init
  registerComponent('command', initCommand);

  // Export
  BrandUI.components.Command = Command;
  BrandUI.components.initCommand = initCommand;
})();


/* === vanilla/js/components/context-menu.js === */
/**
 * Brand UI - Context Menu
 * Right-click triggered dropdown menu with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, handleArrowNavigation, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  /**
   * Context Menu Component
   */
  class ContextMenu {
    constructor(trigger, options = {}) {
      this.trigger = trigger;
      this.options = {
        onOpen: options.onOpen || null,
        onClose: options.onClose || null,
        onSelect: options.onSelect || null,
      };

      this.id = trigger.id || uid('context-menu');
      this.content = null;
      this.isOpen = false;
      this.focusedIndex = -1;
      this.activeSubMenu = null;
      this.cleanupClickOutside = null;

      this.init();
    }

    init() {
      // Find associated content
      const contentId = this.trigger.getAttribute('data-context-menu-content');
      this.content = contentId ? document.getElementById(contentId) : this.trigger.querySelector('.context-menu-content');

      if (!this.content) {
        console.warn('ContextMenu: No content found for trigger', this.trigger);
        return;
      }

      // Set initial state
      this.content.setAttribute('data-state', 'closed');
      this.content.setAttribute('role', 'menu');
      this.content.setAttribute('tabindex', '-1');

      // Setup items
      this.setupItems();

      // Bind events
      this.bindEvents();

      // Store instance
      setInstance(this.trigger, 'context-menu', this);
    }

    setupItems() {
      const items = this.getItems();
      items.forEach((item, index) => {
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');

        // Setup checkbox items
        if (item.classList.contains('context-menu-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
          item.setAttribute('aria-checked', item.dataset.checked === 'true');
        }

        // Setup radio items
        if (item.classList.contains('context-menu-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
          item.setAttribute('aria-checked', item.dataset.checked === 'true');
        }

        // Setup sub triggers
        if (item.classList.contains('context-menu-sub-trigger')) {
          item.setAttribute('aria-haspopup', 'menu');
          item.setAttribute('aria-expanded', 'false');
        }
      });
    }

    getItems(container = this.content) {
      return $$(
        '.context-menu-item:not([data-disabled]), .context-menu-checkbox-item:not([data-disabled]), .context-menu-radio-item:not([data-disabled]), .context-menu-sub-trigger:not([data-disabled])',
        container
      );
    }

    bindEvents() {
      // Right-click to open
      on(this.trigger, 'contextmenu', (e) => {
        e.preventDefault();
        this.open(e.clientX, e.clientY);
      });

      // Keyboard navigation within menu
      on(this.content, 'keydown', (e) => this.handleKeydown(e));

      // Item click
      on(this.content, 'click', (e) => {
        const item = e.target.closest('.context-menu-item, .context-menu-checkbox-item, .context-menu-radio-item');
        if (item && !item.hasAttribute('data-disabled')) {
          this.handleItemClick(item, e);
        }

        const subTrigger = e.target.closest('.context-menu-sub-trigger');
        if (subTrigger && !subTrigger.hasAttribute('data-disabled')) {
          this.handleSubTriggerClick(subTrigger, e);
        }
      });

      // Mouse enter for focus
      on(this.content, 'mouseenter', '.context-menu-item, .context-menu-checkbox-item, .context-menu-radio-item, .context-menu-sub-trigger', (e, target) => {
        if (!target.hasAttribute('data-disabled')) {
          this.focusItem(target);
        }
      });

      // Sub menu trigger hover
      on(this.content, 'mouseenter', '.context-menu-sub-trigger', (e, target) => {
        if (!target.hasAttribute('data-disabled')) {
          this.openSubMenu(target);
        }
      });
    }

    open(x, y) {
      if (this.isOpen) {
        this.close();
      }

      this.isOpen = true;
      this.content.setAttribute('data-state', 'open');

      // Position at mouse cursor
      this.position(x, y);

      // Focus first item
      requestAnimationFrame(() => {
        const items = this.getItems();
        if (items.length > 0) {
          this.focusItem(items[0]);
        }
      });

      // Click outside to close
      this.cleanupClickOutside = this.setupClickOutside();

      // Escape to close
      this.escapeHandler = (e) => {
        if (e.key === Keys.ESCAPE) {
          e.preventDefault();
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);

      // Emit event
      emit(this.trigger, 'context-menu:open', { menu: this });

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.content.setAttribute('data-state', 'closed');
      this.focusedIndex = -1;

      // Close any open submenus
      this.closeAllSubMenus();

      // Cleanup
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
        this.escapeHandler = null;
      }

      // Emit event
      emit(this.trigger, 'context-menu:close', { menu: this });

      if (this.options.onClose) {
        this.options.onClose(this);
      }
    }

    position(x, y) {
      const rect = this.content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate position, flipping if necessary
      let left = x;
      let top = y;

      // Flip horizontally if would overflow
      if (x + rect.width > viewportWidth) {
        left = Math.max(0, x - rect.width);
      }

      // Flip vertically if would overflow
      if (y + rect.height > viewportHeight) {
        top = Math.max(0, y - rect.height);
      }

      this.content.style.left = `${left}px`;
      this.content.style.top = `${top}px`;
    }

    setupClickOutside() {
      const handler = (e) => {
        if (!this.content.contains(e.target) && !this.trigger.contains(e.target)) {
          // Check if clicking in a submenu
          const subContents = $$('.context-menu-sub-content[data-state="open"]');
          const clickedInSub = subContents.some(sub => sub.contains(e.target));
          if (!clickedInSub) {
            this.close();
          }
        }
      };

      // Delay to prevent immediate trigger
      setTimeout(() => {
        document.addEventListener('click', handler, true);
        document.addEventListener('contextmenu', handler, true);
      }, 0);

      return () => {
        document.removeEventListener('click', handler, true);
        document.removeEventListener('contextmenu', handler, true);
      };
    }

    handleKeydown(e) {
      const items = this.getItems();
      const currentIndex = items.indexOf(document.activeElement);

      switch (e.key) {
        case Keys.ARROW_DOWN:
        case Keys.ARROW_UP:
          e.preventDefault();
          this.focusedIndex = handleArrowNavigation(e, items, currentIndex, {
            loop: true,
            orientation: 'vertical',
          });
          break;

        case Keys.HOME:
          e.preventDefault();
          if (items.length > 0) {
            this.focusItem(items[0]);
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (items.length > 0) {
            this.focusItem(items[items.length - 1]);
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          const focused = document.activeElement;
          if (focused.classList.contains('context-menu-sub-trigger')) {
            this.openSubMenu(focused);
          } else if (items.includes(focused)) {
            this.handleItemClick(focused, e);
          }
          break;

        case Keys.ARROW_RIGHT:
          e.preventDefault();
          const subTrigger = document.activeElement;
          if (subTrigger.classList.contains('context-menu-sub-trigger')) {
            this.openSubMenu(subTrigger);
          }
          break;

        case Keys.ARROW_LEFT:
          e.preventDefault();
          if (this.activeSubMenu) {
            this.closeSubMenu(this.activeSubMenu);
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          if (this.activeSubMenu) {
            this.closeSubMenu(this.activeSubMenu);
          } else {
            this.close();
          }
          break;
      }
    }

    handleItemClick(item, e) {
      // Handle checkbox
      if (item.classList.contains('context-menu-checkbox-item')) {
        const isChecked = item.dataset.checked !== 'true';
        item.dataset.checked = isChecked;
        item.setAttribute('aria-checked', isChecked);
        emit(item, 'context-menu:check', { checked: isChecked, item });
      }

      // Handle radio
      if (item.classList.contains('context-menu-radio-item')) {
        const group = item.closest('.context-menu-radio-group');
        if (group) {
          $$('.context-menu-radio-item', group).forEach(radio => {
            radio.dataset.checked = 'false';
            radio.setAttribute('aria-checked', 'false');
          });
        }
        item.dataset.checked = 'true';
        item.setAttribute('aria-checked', 'true');
        emit(item, 'context-menu:radio-change', { value: item.dataset.value, item });
      }

      // Emit select event
      emit(item, 'context-menu:select', { item, value: item.dataset.value });

      if (this.options.onSelect) {
        this.options.onSelect(item, item.dataset.value);
      }

      // Close menu (unless it's a checkbox or has submenu)
      if (!item.classList.contains('context-menu-checkbox-item') && !item.classList.contains('context-menu-sub-trigger')) {
        this.close();
      }
    }

    handleSubTriggerClick(trigger, e) {
      e.stopPropagation();
      this.openSubMenu(trigger);
    }

    focusItem(item) {
      const items = this.getItems();
      items.forEach(i => i.classList.remove('focused'));
      item.classList.add('focused');
      item.focus();
      this.focusedIndex = items.indexOf(item);
    }

    openSubMenu(trigger) {
      // Close other submenus first
      this.closeAllSubMenus();

      const subContentId = trigger.dataset.submenu;
      const subContent = subContentId ? document.getElementById(subContentId) : trigger.nextElementSibling;

      if (!subContent || !subContent.classList.contains('context-menu-sub-content')) {
        return;
      }

      trigger.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');
      subContent.setAttribute('data-state', 'open');

      // Position submenu
      this.positionSubMenu(trigger, subContent);

      this.activeSubMenu = { trigger, content: subContent };

      // Setup submenu keyboard navigation
      this.setupSubMenuNavigation(subContent);

      // Focus first item in submenu
      requestAnimationFrame(() => {
        const items = this.getItems(subContent);
        if (items.length > 0) {
          this.focusItem(items[0]);
        }
      });
    }

    closeSubMenu(subMenu) {
      if (!subMenu) return;

      subMenu.trigger.setAttribute('data-state', 'closed');
      subMenu.trigger.setAttribute('aria-expanded', 'false');
      subMenu.content.setAttribute('data-state', 'closed');

      // Focus back to trigger
      subMenu.trigger.focus();

      this.activeSubMenu = null;
    }

    closeAllSubMenus() {
      $$('.context-menu-sub-trigger[data-state="open"]', this.content).forEach(trigger => {
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      });

      $$('.context-menu-sub-content[data-state="open"]', this.content).forEach(content => {
        content.setAttribute('data-state', 'closed');
      });

      this.activeSubMenu = null;
    }

    positionSubMenu(trigger, content) {
      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Position to the right of trigger by default
      let left = triggerRect.right + 4;
      let top = triggerRect.top;

      // Flip horizontally if would overflow
      if (left + contentRect.width > viewportWidth) {
        left = triggerRect.left - contentRect.width - 4;
      }

      // Adjust vertically if would overflow
      if (top + contentRect.height > viewportHeight) {
        top = Math.max(8, viewportHeight - contentRect.height - 8);
      }

      content.style.left = `${left}px`;
      content.style.top = `${top}px`;
    }

    setupSubMenuNavigation(subContent) {
      const handler = (e) => {
        const items = this.getItems(subContent);
        const currentIndex = items.indexOf(document.activeElement);

        switch (e.key) {
          case Keys.ARROW_DOWN:
          case Keys.ARROW_UP:
            e.preventDefault();
            e.stopPropagation();
            handleArrowNavigation(e, items, currentIndex, {
              loop: true,
              orientation: 'vertical',
            });
            break;

          case Keys.ARROW_LEFT:
          case Keys.ESCAPE:
            e.preventDefault();
            e.stopPropagation();
            this.closeSubMenu(this.activeSubMenu);
            break;

          case Keys.ENTER:
          case Keys.SPACE:
            e.preventDefault();
            e.stopPropagation();
            const focused = document.activeElement;
            if (items.includes(focused)) {
              this.handleItemClick(focused, e);
            }
            break;
        }
      };

      subContent.addEventListener('keydown', handler);

      // Cleanup when submenu closes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-state') {
            if (subContent.getAttribute('data-state') === 'closed') {
              subContent.removeEventListener('keydown', handler);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(subContent, { attributes: true });
    }

    destroy() {
      this.close();
      removeInstance(this.trigger, 'context-menu');
    }
  }

  /**
   * Initialize context menu from HTML
   */
  function initContextMenu(element) {
    if (getInstance(element, 'context-menu')) return;
    return new ContextMenu(element);
  }

  // Register for auto-init
  registerComponent('context-menu', initContextMenu);

  // Add to BrandUI namespace
  BrandUI.components.ContextMenu = ContextMenu;
  BrandUI.components.initContextMenu = initContextMenu;
})();


/* === vanilla/js/components/dialog.js === */
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


/* === vanilla/js/components/drawer.js === */
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
      const dismissible = options.dismissible !== false && options.dismissible !== 'false';
      // If not dismissible, also disable overlay click and escape by default
      const closeOnOverlay = dismissible && (options.closeOnOverlay !== false && options.closeOnOverlay !== 'false');
      const closeOnEscape = dismissible && (options.closeOnEscape !== false && options.closeOnEscape !== 'false');

      this.options = {
        ...options,
        direction: options.direction || 'bottom',
        dismissible,
        closeOnOverlay,
        closeOnEscape,
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


/* === vanilla/js/components/dropdown-menu.js === */
/**
 * Brand UI - Dropdown Menu Component
 * Vanilla JavaScript for accessible dropdown menus
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  // ============================================
  // DROPDOWN MENU CLASS
  // ============================================

  class DropdownMenu {
    constructor(element, options = {}) {
      this.root = element;
      this.options = {
        closeOnSelect: true,
        closeOnClickOutside: true,
        loop: true,
        ...options,
      };

      this.trigger = null;
      this.content = null;
      this.items = [];
      this.focusedIndex = -1;
      this.isOpen = false;
      this.subMenus = new Map();
      this.activeSubMenu = null;
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      this.trigger = $('.dropdown-menu-trigger', this.root);
      this.content = $('.dropdown-menu-content', this.root);

      if (!this.trigger || !this.content) {
        console.warn('DropdownMenu: Missing trigger or content element');
        return;
      }

      // Generate IDs for accessibility
      const id = uid('dropdown');
      this.trigger.id = this.trigger.id || `${id}-trigger`;
      this.content.id = this.content.id || `${id}-content`;

      // Set ARIA attributes
      this.trigger.setAttribute('aria-haspopup', 'menu');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-controls', this.content.id);
      this.content.setAttribute('role', 'menu');
      this.content.setAttribute('aria-labelledby', this.trigger.id);
      this.content.setAttribute('tabindex', '-1');

      // Initialize items
      this._initItems();

      // Initialize submenus
      this._initSubMenus();

      // Bind events
      this._bindEvents();

      // Set initial state
      this.content.setAttribute('data-state', 'closed');

      setInstance(this.root, 'dropdown-menu', this);
    }

    _initItems() {
      this.items = $$('[role="menuitem"], .dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item, .dropdown-menu-sub-trigger', this.content)
        .filter(item => !item.closest('.dropdown-menu-sub-content'));

      this.items.forEach((item, index) => {
        if (!item.hasAttribute('role')) {
          if (item.classList.contains('dropdown-menu-checkbox-item')) {
            item.setAttribute('role', 'menuitemcheckbox');
          } else if (item.classList.contains('dropdown-menu-radio-item')) {
            item.setAttribute('role', 'menuitemradio');
          } else {
            item.setAttribute('role', 'menuitem');
          }
        }
        item.setAttribute('tabindex', '-1');
        item.dataset.index = index;
      });
    }

    _initSubMenus() {
      const subTriggers = $$('.dropdown-menu-sub-trigger', this.content);

      subTriggers.forEach(trigger => {
        const sub = trigger.closest('.dropdown-menu-sub');
        const subContent = $('.dropdown-menu-sub-content', sub);

        if (!sub || !subContent) return;

        const subId = uid('submenu');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', subContent.id || subId);
        subContent.id = subContent.id || subId;
        subContent.setAttribute('role', 'menu');
        subContent.setAttribute('data-state', 'closed');

        // Initialize sub-items
        const subItems = $$('.dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item', subContent);
        subItems.forEach(item => {
          if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'menuitem');
          }
          item.setAttribute('tabindex', '-1');
        });

        this.subMenus.set(trigger, {
          trigger,
          content: subContent,
          items: subItems,
          focusedIndex: -1,
        });
      });
    }

    _bindEvents() {
      // Trigger click
      on(this.trigger, 'click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Trigger keyboard
      on(this.trigger, 'keydown', (e) => {
        switch (e.key) {
          case Keys.ENTER:
          case Keys.SPACE:
          case Keys.ARROW_DOWN:
            e.preventDefault();
            this.open();
            this._focusItem(0);
            break;
          case Keys.ARROW_UP:
            e.preventDefault();
            this.open();
            this._focusItem(this.items.length - 1);
            break;
        }
      });

      // Content keyboard navigation
      on(this.content, 'keydown', (e) => {
        this._handleContentKeydown(e);
      });

      // Item click handling
      on(this.content, 'click', (e) => {
        const item = e.target.closest('.dropdown-menu-item, .dropdown-menu-checkbox-item, .dropdown-menu-radio-item');
        if (!item) return;

        if (item.hasAttribute('data-disabled') || item.classList.contains('is-disabled')) {
          e.preventDefault();
          return;
        }

        // Handle checkbox toggle
        if (item.classList.contains('dropdown-menu-checkbox-item')) {
          const isChecked = item.getAttribute('aria-checked') === 'true';
          item.setAttribute('aria-checked', String(!isChecked));
          emit(item, 'dropdown-menu:change', { checked: !isChecked });
        }

        // Handle radio selection
        if (item.classList.contains('dropdown-menu-radio-item')) {
          const group = item.closest('.dropdown-menu-radio-group, [role="group"]');
          if (group) {
            $$('.dropdown-menu-radio-item', group).forEach(radio => {
              radio.setAttribute('aria-checked', 'false');
            });
          }
          item.setAttribute('aria-checked', 'true');
          emit(item, 'dropdown-menu:change', { value: item.dataset.value });
        }

        // Emit select event
        emit(item, 'dropdown-menu:select', { item });

        // Close if not a sub-trigger and closeOnSelect is true
        if (!item.classList.contains('dropdown-menu-sub-trigger') && this.options.closeOnSelect) {
          this.close();
        }
      });

      // Sub-menu triggers
      this.subMenus.forEach((subMenu, trigger) => {
        on(trigger, 'mouseenter', () => {
          this._openSubMenu(subMenu);
        });

        on(trigger, 'mouseleave', (e) => {
          // Check if moving to sub-content
          const related = e.relatedTarget;
          if (related && subMenu.content.contains(related)) return;
          this._closeSubMenu(subMenu);
        });

        on(subMenu.content, 'mouseleave', (e) => {
          const related = e.relatedTarget;
          if (related && (trigger.contains(related) || subMenu.content.contains(related))) return;
          this._closeSubMenu(subMenu);
        });

        on(trigger, 'keydown', (e) => {
          if (e.key === Keys.ARROW_RIGHT || e.key === Keys.ENTER) {
            e.preventDefault();
            e.stopPropagation();
            this._openSubMenu(subMenu);
            if (subMenu.items.length > 0) {
              subMenu.focusedIndex = 0;
              subMenu.items[0].focus();
            }
          }
        });

        on(subMenu.content, 'keydown', (e) => {
          this._handleSubMenuKeydown(e, subMenu);
        });
      });
    }

    _handleContentKeydown(e) {
      // Skip if in submenu
      if (e.target.closest('.dropdown-menu-sub-content')) return;

      switch (e.key) {
        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          this.trigger.focus();
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._focusNextItem();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._focusPrevItem();
          break;

        case Keys.HOME:
          e.preventDefault();
          this._focusItem(0);
          break;

        case Keys.END:
          e.preventDefault();
          this._focusItem(this.items.length - 1);
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (this.focusedIndex >= 0 && this.items[this.focusedIndex]) {
            this.items[this.focusedIndex].click();
          }
          break;

        case Keys.TAB:
          this.close();
          break;

        default:
          // Type-ahead: focus item starting with typed character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            this._focusItemByChar(e.key);
          }
      }
    }

    _handleSubMenuKeydown(e, subMenu) {
      switch (e.key) {
        case Keys.ESCAPE:
        case Keys.ARROW_LEFT:
          e.preventDefault();
          e.stopPropagation();
          this._closeSubMenu(subMenu);
          subMenu.trigger.focus();
          break;

        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._focusSubMenuItem(subMenu, 'next');
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._focusSubMenuItem(subMenu, 'prev');
          break;

        case Keys.HOME:
          e.preventDefault();
          if (subMenu.items.length > 0) {
            subMenu.focusedIndex = 0;
            subMenu.items[0].focus();
          }
          break;

        case Keys.END:
          e.preventDefault();
          if (subMenu.items.length > 0) {
            subMenu.focusedIndex = subMenu.items.length - 1;
            subMenu.items[subMenu.items.length - 1].focus();
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (subMenu.focusedIndex >= 0 && subMenu.items[subMenu.focusedIndex]) {
            subMenu.items[subMenu.focusedIndex].click();
          }
          break;
      }
    }

    _focusItem(index) {
      if (index < 0 || index >= this.items.length) return;

      // Skip disabled items
      let targetIndex = index;
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[targetIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        targetIndex = (targetIndex + 1) % this.items.length;
        attempts++;
      }

      if (attempts >= this.items.length) return;

      this.focusedIndex = targetIndex;
      this.items[targetIndex].focus();
    }

    _focusNextItem() {
      let nextIndex = this.focusedIndex + 1;
      if (nextIndex >= this.items.length) {
        nextIndex = this.options.loop ? 0 : this.items.length - 1;
      }

      // Skip disabled items
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[nextIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        nextIndex = (nextIndex + 1) % this.items.length;
        attempts++;
      }

      this._focusItem(nextIndex);
    }

    _focusPrevItem() {
      let prevIndex = this.focusedIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.options.loop ? this.items.length - 1 : 0;
      }

      // Skip disabled items
      let attempts = 0;
      while (attempts < this.items.length) {
        const item = this.items[prevIndex];
        if (!item.hasAttribute('data-disabled') && !item.classList.contains('is-disabled')) {
          break;
        }
        prevIndex = prevIndex - 1;
        if (prevIndex < 0) prevIndex = this.items.length - 1;
        attempts++;
      }

      this._focusItem(prevIndex);
    }

    _focusItemByChar(char) {
      const lowerChar = char.toLowerCase();
      const startIndex = this.focusedIndex + 1;

      // Search from current position to end, then from start to current
      for (let i = 0; i < this.items.length; i++) {
        const index = (startIndex + i) % this.items.length;
        const item = this.items[index];
        const text = item.textContent?.trim().toLowerCase() || '';

        if (text.startsWith(lowerChar) && !item.hasAttribute('data-disabled')) {
          this._focusItem(index);
          return;
        }
      }
    }

    _focusSubMenuItem(subMenu, direction) {
      const { items } = subMenu;
      if (items.length === 0) return;

      let nextIndex;
      if (direction === 'next') {
        nextIndex = subMenu.focusedIndex + 1;
        if (nextIndex >= items.length) {
          nextIndex = this.options.loop ? 0 : items.length - 1;
        }
      } else {
        nextIndex = subMenu.focusedIndex - 1;
        if (nextIndex < 0) {
          nextIndex = this.options.loop ? items.length - 1 : 0;
        }
      }

      subMenu.focusedIndex = nextIndex;
      items[nextIndex].focus();
    }

    _openSubMenu(subMenu) {
      // Close other open submenus
      if (this.activeSubMenu && this.activeSubMenu !== subMenu) {
        this._closeSubMenu(this.activeSubMenu);
      }

      subMenu.trigger.setAttribute('aria-expanded', 'true');
      subMenu.trigger.setAttribute('data-state', 'open');
      subMenu.content.setAttribute('data-state', 'open');
      subMenu.content.classList.add('is-open');
      this.activeSubMenu = subMenu;

      emit(subMenu.trigger, 'dropdown-menu:submenu-open', { subMenu });
    }

    _closeSubMenu(subMenu) {
      subMenu.trigger.setAttribute('aria-expanded', 'false');
      subMenu.trigger.setAttribute('data-state', 'closed');
      subMenu.content.setAttribute('data-state', 'closed');
      subMenu.content.classList.remove('is-open');
      subMenu.focusedIndex = -1;

      if (this.activeSubMenu === subMenu) {
        this.activeSubMenu = null;
      }

      emit(subMenu.trigger, 'dropdown-menu:submenu-close', { subMenu });
    }

    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.setAttribute('data-state', 'open');
      this.content.classList.add('is-open');

      // Click outside handler
      if (this.options.closeOnClickOutside) {
        this.cleanupClickOutside = onClickOutside(this.root, () => {
          this.close();
        });
      }

      emit(this.root, 'dropdown-menu:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.focusedIndex = -1;
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.setAttribute('data-state', 'closed');
      this.content.classList.remove('is-open');

      // Close all submenus
      this.subMenus.forEach(subMenu => {
        this._closeSubMenu(subMenu);
      });

      // Cleanup click outside
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.root, 'dropdown-menu:close');
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
      removeInstance(this.root, 'dropdown-menu');
    }
  }

  // ============================================
  // AUTO INITIALIZATION
  // ============================================

  function initDropdownMenu(element) {
    const options = {};

    if (element.dataset.closeOnSelect === 'false') {
      options.closeOnSelect = false;
    }
    if (element.dataset.closeOnClickOutside === 'false') {
      options.closeOnClickOutside = false;
    }
    if (element.dataset.loop === 'false') {
      options.loop = false;
    }

    return new DropdownMenu(element, options);
  }

  // Register for auto-init
  registerComponent('dropdown-menu', initDropdownMenu);

  // ============================================
  // PUBLIC API
  // ============================================

  BrandUI.components.DropdownMenu = DropdownMenu;

  // Manual initialization helper
  BrandUI.components.initDropdownMenu = (selector = '[data-dropdown-menu]') => {
    $$(selector).forEach(element => {
      if (!getInstance(element, 'dropdown-menu')) {
        initDropdownMenu(element);
      }
    });
  };

})();


/* === vanilla/js/components/form.js === */
/**
 * Brand UI - Form Component
 * Form field wrapper with validation support, error messaging, and accessibility.
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'form';

  /**
   * Initialize a form item element
   */
  function initFormItem(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const itemId = BrandUI.uid('form-item');

    // Find child elements
    const label = element.querySelector('.form-label');
    const control = element.querySelector('.form-control');
    const description = element.querySelector('.form-description');
    const message = element.querySelector('.form-message');

    // Generate IDs for ARIA relationships
    const controlId = control?.querySelector('input, textarea, select')?.id || `${itemId}-control`;
    const descriptionId = description ? `${itemId}-description` : null;
    const messageId = message ? `${itemId}-message` : null;

    // Set up label association
    if (label) {
      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement && !inputElement.id) {
        inputElement.id = controlId;
      }
      if (!label.hasAttribute('for') && inputElement) {
        label.setAttribute('for', inputElement.id);
      }
    }

    // Set up description ID
    if (description && !description.id) {
      description.id = descriptionId;
    }

    // Set up message ID
    if (message && !message.id) {
      message.id = messageId;
    }

    // Set up ARIA describedby
    function updateAriaDescribedBy() {
      const inputElement = control?.querySelector('input, textarea, select');
      if (!inputElement) return;

      const ids = [];
      if (descriptionId && description) {
        ids.push(descriptionId);
      }
      if (messageId && message && message.getAttribute('aria-hidden') !== 'true') {
        ids.push(messageId);
      }

      if (ids.length > 0) {
        inputElement.setAttribute('aria-describedby', ids.join(' '));
      } else {
        inputElement.removeAttribute('aria-describedby');
      }
    }

    updateAriaDescribedBy();

    /**
     * Set error state
     */
    function setError(errorMessage) {
      element.setAttribute('data-error', 'true');

      if (label) {
        label.setAttribute('data-error', 'true');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.setAttribute('aria-invalid', 'true');
      }

      if (message) {
        message.textContent = errorMessage;
        message.setAttribute('data-type', 'error');
        message.removeAttribute('aria-hidden');
      }

      updateAriaDescribedBy();
      BrandUI.emit(element, 'form-item:error', { message: errorMessage });
    }

    /**
     * Set success state
     */
    function setSuccess(successMessage) {
      clearError();

      if (message && successMessage) {
        message.textContent = successMessage;
        message.setAttribute('data-type', 'success');
        message.removeAttribute('aria-hidden');
        updateAriaDescribedBy();
      }

      BrandUI.emit(element, 'form-item:success', { message: successMessage });
    }

    /**
     * Set warning state
     */
    function setWarning(warningMessage) {
      clearError();

      if (message && warningMessage) {
        message.textContent = warningMessage;
        message.setAttribute('data-type', 'warning');
        message.removeAttribute('aria-hidden');
        updateAriaDescribedBy();
      }

      BrandUI.emit(element, 'form-item:warning', { message: warningMessage });
    }

    /**
     * Clear error state
     */
    function clearError() {
      element.removeAttribute('data-error');

      if (label) {
        label.removeAttribute('data-error');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.removeAttribute('aria-invalid');
      }

      if (message) {
        message.textContent = '';
        message.setAttribute('aria-hidden', 'true');
        message.removeAttribute('data-type');
      }

      updateAriaDescribedBy();
      BrandUI.emit(element, 'form-item:clear');
    }

    /**
     * Get current state
     */
    function getState() {
      const inputElement = control?.querySelector('input, textarea, select');
      return {
        hasError: element.hasAttribute('data-error'),
        isDisabled: element.hasAttribute('data-disabled'),
        value: inputElement?.value || '',
        inputElement,
      };
    }

    /**
     * Set disabled state
     */
    function setDisabled(disabled) {
      if (disabled) {
        element.setAttribute('data-disabled', 'true');
      } else {
        element.removeAttribute('data-disabled');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.disabled = disabled;
      }
    }

    /**
     * Set required indicator
     */
    function setRequired(required) {
      if (label) {
        if (required) {
          label.setAttribute('data-required', 'true');
        } else {
          label.removeAttribute('data-required');
        }
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.required = required;
      }
    }

    // Initialize from data attributes
    const config = BrandUI.getData(element);

    if (config.error) {
      setError(config.error);
    }

    if (config.disabled === 'true' || config.disabled === true) {
      setDisabled(true);
    }

    if (config.required === 'true' || config.required === true) {
      setRequired(true);
    }

    // API
    const api = {
      element,

      setError,
      setSuccess,
      setWarning,
      clearError,
      getState,
      setDisabled,
      setRequired,

      destroy() {
        BrandUI.removeInstance(element, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, api);

    return api;
  }

  /**
   * Initialize form validation on a form element
   */
  function initForm(formElement) {
    const formId = BrandUI.uid('form');

    // Find all form items
    function getFormItems() {
      return BrandUI.$$('.form-item[data-form-item]', formElement).map((el) => {
        return BrandUI.getInstance(el, COMPONENT_NAME) || initFormItem(el);
      });
    }

    /**
     * Validate all form items
     */
    function validate(validators = {}) {
      const items = getFormItems();
      let isValid = true;
      const errors = {};

      items.forEach((item) => {
        const state = item.getState();
        const inputElement = state.inputElement;
        if (!inputElement) return;

        const name = inputElement.name || inputElement.id;
        const value = state.value;

        // Custom validator
        if (validators[name]) {
          const errorMessage = validators[name](value, inputElement);
          if (errorMessage) {
            item.setError(errorMessage);
            errors[name] = errorMessage;
            isValid = false;
            return;
          }
        }

        // Built-in required validation
        if (inputElement.required && !value.trim()) {
          const labelText = formElement.querySelector(`label[for="${inputElement.id}"]`)?.textContent || name;
          item.setError(`${labelText} is required`);
          errors[name] = `${labelText} is required`;
          isValid = false;
          return;
        }

        // Built-in email validation
        if (inputElement.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            item.setError('Please enter a valid email address');
            errors[name] = 'Please enter a valid email address';
            isValid = false;
            return;
          }
        }

        // Built-in minlength validation
        if (inputElement.minLength > 0 && value.length < inputElement.minLength) {
          item.setError(`Must be at least ${inputElement.minLength} characters`);
          errors[name] = `Must be at least ${inputElement.minLength} characters`;
          isValid = false;
          return;
        }

        // Built-in pattern validation
        if (inputElement.pattern && value) {
          const regex = new RegExp(inputElement.pattern);
          if (!regex.test(value)) {
            const title = inputElement.title || 'Please match the requested format';
            item.setError(title);
            errors[name] = title;
            isValid = false;
            return;
          }
        }

        // Clear error if valid
        item.clearError();
      });

      BrandUI.emit(formElement, 'form:validate', { isValid, errors });

      return { isValid, errors };
    }

    /**
     * Clear all form errors
     */
    function clearErrors() {
      getFormItems().forEach((item) => item.clearError());
      BrandUI.emit(formElement, 'form:clear');
    }

    /**
     * Get form data as object
     */
    function getData() {
      const data = {};
      const items = getFormItems();

      items.forEach((item) => {
        const state = item.getState();
        const inputElement = state.inputElement;
        if (inputElement) {
          const name = inputElement.name || inputElement.id;
          data[name] = state.value;
        }
      });

      return data;
    }

    /**
     * Reset form
     */
    function reset() {
      clearErrors();
      formElement.reset();
      BrandUI.emit(formElement, 'form:reset');
    }

    // Handle form submit with validation
    const handleSubmit = (e) => {
      const validators = formElement._validators || {};
      const result = validate(validators);

      if (!result.isValid) {
        e.preventDefault();

        // Focus first error field
        const firstErrorItem = formElement.querySelector('.form-item[data-error="true"]');
        if (firstErrorItem) {
          const input = firstErrorItem.querySelector('input, textarea, select');
          if (input) input.focus();
        }
      }
    };

    // Bind submit handler
    const removeSubmit = BrandUI.on(formElement, 'submit', handleSubmit);

    // API
    const api = {
      element: formElement,

      validate,
      clearErrors,
      getData,
      reset,

      setValidators(validators) {
        formElement._validators = validators;
      },

      destroy() {
        removeSubmit();
        BrandUI.removeInstance(formElement, 'form-validator');
      },
    };

    BrandUI.setInstance(formElement, 'form-validator', api);

    return api;
  }

  /**
   * Create a form item element
   */
  function createFormItem(options = {}) {
    const {
      label,
      description,
      required = false,
      disabled = false,
      error,
      inputType = 'text',
      inputId,
      inputName,
      inputPlaceholder,
      className = '',
    } = options;

    const item = document.createElement('div');
    item.className = `form-item ${className}`.trim();
    item.setAttribute('data-form-item', '');

    const id = inputId || BrandUI.uid('input');

    // Label
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'form-label';
      labelEl.setAttribute('for', id);
      labelEl.textContent = label;
      if (required) {
        labelEl.setAttribute('data-required', 'true');
      }
      item.appendChild(labelEl);
    }

    // Control wrapper
    const controlEl = document.createElement('div');
    controlEl.className = 'form-control';

    // Input
    const inputEl = document.createElement('input');
    inputEl.type = inputType;
    inputEl.id = id;
    if (inputName) inputEl.name = inputName;
    if (inputPlaceholder) inputEl.placeholder = inputPlaceholder;
    if (required) inputEl.required = true;
    if (disabled) inputEl.disabled = true;

    controlEl.appendChild(inputEl);
    item.appendChild(controlEl);

    // Description
    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'form-description';
      descEl.textContent = description;
      item.appendChild(descEl);
    }

    // Message placeholder
    const messageEl = document.createElement('p');
    messageEl.className = 'form-message';
    messageEl.setAttribute('aria-hidden', 'true');
    item.appendChild(messageEl);

    // Set initial state
    if (disabled) {
      item.setAttribute('data-disabled', 'true');
    }
    if (error) {
      item.setAttribute('data-error', error);
    }

    return initFormItem(item);
  }

  // Register component for auto-init
  BrandUI.registerComponent('form-item', initFormItem);

  // Expose to BrandUI namespace
  BrandUI.components.Form = {
    initItem: initFormItem,
    initForm: initForm,
    createItem: createFormItem,
  };
})();


/* === vanilla/js/components/hover-card.js === */
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


/* === vanilla/js/components/input-group.js === */
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


/* === vanilla/js/components/input-otp.js === */
/**
 * Brand UI - Input OTP Component
 * One-time password input with auto-advance, backspace handling, and paste support
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'input-otp';

  /**
   * Initialize an OTP input component
   */
  function init(container) {
    if (BrandUI.getInstance(container, COMPONENT_NAME)) {
      return BrandUI.getInstance(container, COMPONENT_NAME);
    }

    const slots = BrandUI.$$('.input-otp-slot', container);
    if (slots.length === 0) return null;

    const config = {
      length: slots.length,
      disabled: container.dataset.disabled === 'true',
      pattern: container.dataset.pattern || '[0-9]',
      mask: container.dataset.mask === 'true',
    };

    const regex = new RegExp(`^${config.pattern}$`);

    // Hidden input for form submission
    let hiddenInput = BrandUI.$('input[type="hidden"]', container);
    if (!hiddenInput) {
      hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = container.dataset.name || 'otp';
      container.appendChild(hiddenInput);
    }

    /**
     * Get current OTP value
     */
    function getValue() {
      return slots.map(slot => slot.textContent || '').join('');
    }

    /**
     * Set OTP value
     */
    function setValue(value) {
      const chars = value.split('').slice(0, config.length);
      slots.forEach((slot, i) => {
        const char = chars[i] || '';
        slot.textContent = config.mask && char ? '*' : char;
        slot.dataset.value = char;
        slot.dataset.filled = char ? 'true' : 'false';
        updateCaret(slot, false);
      });
      hiddenInput.value = chars.join('');
      emitChange();
    }

    /**
     * Clear all slots
     */
    function clear() {
      slots.forEach(slot => {
        slot.textContent = '';
        slot.dataset.value = '';
        slot.dataset.filled = 'false';
        updateCaret(slot, false);
      });
      hiddenInput.value = '';
      slots[0]?.focus();
      emitChange();
    }

    /**
     * Update caret visibility
     */
    function updateCaret(slot, show) {
      let caret = BrandUI.$('.input-otp-caret', slot);
      if (show && !slot.dataset.value) {
        if (!caret) {
          caret = document.createElement('div');
          caret.className = 'input-otp-caret';
          slot.appendChild(caret);
        }
      } else if (caret) {
        caret.remove();
      }
    }

    /**
     * Emit change event
     */
    function emitChange() {
      const value = getValue();
      BrandUI.emit(container, 'otp-change', { value, complete: value.length === config.length });
    }

    /**
     * Emit complete event
     */
    function emitComplete() {
      BrandUI.emit(container, 'otp-complete', { value: getValue() });
    }

    /**
     * Focus a specific slot
     */
    function focusSlot(index) {
      const targetIndex = Math.max(0, Math.min(index, slots.length - 1));
      slots[targetIndex]?.focus();
    }

    /**
     * Get next empty slot index
     */
    function getNextEmptyIndex() {
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i].dataset.value) return i;
      }
      return slots.length - 1;
    }

    /**
     * Handle slot focus
     */
    function handleFocus(e) {
      const slot = e.target;
      slot.dataset.active = 'true';
      updateCaret(slot, true);
    }

    /**
     * Handle slot blur
     */
    function handleBlur(e) {
      const slot = e.target;
      slot.dataset.active = 'false';
      updateCaret(slot, false);
    }

    /**
     * Handle keydown events
     */
    function handleKeydown(e) {
      const slot = e.target;
      const index = slots.indexOf(slot);

      switch (e.key) {
        case 'Backspace':
          e.preventDefault();
          if (slot.dataset.value) {
            // Clear current slot
            slot.textContent = '';
            slot.dataset.value = '';
            slot.dataset.filled = 'false';
            hiddenInput.value = getValue();
            emitChange();
            updateCaret(slot, true);
          } else if (index > 0) {
            // Move to previous slot and clear it
            const prevSlot = slots[index - 1];
            prevSlot.textContent = '';
            prevSlot.dataset.value = '';
            prevSlot.dataset.filled = 'false';
            hiddenInput.value = getValue();
            emitChange();
            prevSlot.focus();
          }
          break;

        case 'Delete':
          e.preventDefault();
          slot.textContent = '';
          slot.dataset.value = '';
          slot.dataset.filled = 'false';
          hiddenInput.value = getValue();
          emitChange();
          updateCaret(slot, true);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) {
            focusSlot(index - 1);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (index < slots.length - 1) {
            focusSlot(index + 1);
          }
          break;

        case 'Home':
          e.preventDefault();
          focusSlot(0);
          break;

        case 'End':
          e.preventDefault();
          focusSlot(slots.length - 1);
          break;

        case 'Tab':
          // Allow default tab behavior
          break;

        default:
          // Check if it's a valid character
          if (e.key.length === 1 && regex.test(e.key)) {
            e.preventDefault();
            slot.textContent = config.mask ? '*' : e.key;
            slot.dataset.value = e.key;
            slot.dataset.filled = 'true';
            hiddenInput.value = getValue();
            updateCaret(slot, false);
            emitChange();

            // Auto-advance to next slot
            if (index < slots.length - 1) {
              focusSlot(index + 1);
            } else {
              // All slots filled
              const value = getValue();
              if (value.length === config.length) {
                emitComplete();
              }
            }
          } else if (e.key.length === 1) {
            // Invalid character
            e.preventDefault();
          }
          break;
      }
    }

    /**
     * Handle paste events
     */
    function handlePaste(e) {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData)
        .getData('text')
        .trim();

      // Filter valid characters
      const validChars = pastedData.split('').filter(char => regex.test(char));

      if (validChars.length === 0) return;

      // Distribute characters across slots starting from current position
      const currentIndex = slots.indexOf(e.target);
      let filledCount = 0;

      for (let i = 0; i < validChars.length && currentIndex + i < slots.length; i++) {
        const slot = slots[currentIndex + i];
        const char = validChars[i];
        slot.textContent = config.mask ? '*' : char;
        slot.dataset.value = char;
        slot.dataset.filled = 'true';
        updateCaret(slot, false);
        filledCount++;
      }

      hiddenInput.value = getValue();
      emitChange();

      // Focus the next empty slot or last filled
      const nextEmptyIndex = getNextEmptyIndex();
      if (nextEmptyIndex < slots.length) {
        focusSlot(nextEmptyIndex);
      } else {
        focusSlot(slots.length - 1);
        const value = getValue();
        if (value.length === config.length) {
          emitComplete();
        }
      }
    }

    /**
     * Handle click to focus
     */
    function handleClick(e) {
      // Allow clicking on specific slot
      if (slots.includes(e.target)) {
        return;
      }
      // Click on container focuses first empty slot
      focusSlot(getNextEmptyIndex());
    }

    // Setup slots
    slots.forEach((slot, index) => {
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('role', 'textbox');
      slot.setAttribute('aria-label', `Digit ${index + 1} of ${config.length}`);
      slot.dataset.value = '';
      slot.dataset.filled = 'false';

      BrandUI.on(slot, 'focus', handleFocus);
      BrandUI.on(slot, 'blur', handleBlur);
      BrandUI.on(slot, 'keydown', handleKeydown);
      BrandUI.on(slot, 'paste', handlePaste);
    });

    BrandUI.on(container, 'click', handleClick);

    // Public API
    const api = {
      getValue,
      setValue,
      clear,
      focus: () => focusSlot(getNextEmptyIndex()),
      destroy() {
        slots.forEach(slot => {
          slot.removeAttribute('tabindex');
          slot.removeAttribute('role');
          slot.removeAttribute('aria-label');
          delete slot.dataset.value;
          delete slot.dataset.filled;
          delete slot.dataset.active;
          const caret = BrandUI.$('.input-otp-caret', slot);
          if (caret) caret.remove();
        });
        BrandUI.removeInstance(container, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(container, COMPONENT_NAME, api);
    return api;
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, init);

  // Expose to BrandUI
  BrandUI.components.InputOTP = { init };

})();


/* === vanilla/js/components/menubar.js === */
/**
 * Brand UI - Menubar Component
 * Application menubar with dropdown menus and keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, Keys, onClickOutside, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Menubar Component
   */
  class Menubar {
    constructor(element) {
      this.root = element;
      this.menus = $$('.menubar-menu', element);
      this.triggers = $$('.menubar-trigger', element);
      this.openMenuIndex = -1;
      this.isMenubarActive = false;
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      // Set ARIA attributes
      this.root.setAttribute('role', 'menubar');

      this.menus.forEach((menu, index) => {
        const trigger = $('.menubar-trigger', menu);
        const content = $('.menubar-content', menu);

        if (trigger && content) {
          const triggerId = trigger.id || uid('menubar-trigger');
          const contentId = content.id || uid('menubar-content');

          trigger.id = triggerId;
          content.id = contentId;

          trigger.setAttribute('role', 'menuitem');
          trigger.setAttribute('aria-haspopup', 'menu');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.setAttribute('aria-controls', contentId);
          trigger.setAttribute('tabindex', index === 0 ? '0' : '-1');

          content.setAttribute('role', 'menu');
          content.setAttribute('aria-labelledby', triggerId);
          content.setAttribute('data-state', 'closed');

          // Set up menu items
          this._initMenuItems(content);

          // Set up submenus
          this._initSubmenus(content);
        }
      });

      this._bindEvents();
    }

    _initMenuItems(container) {
      const items = $$(
        '.menubar-item, .menubar-checkbox-item, .menubar-radio-item, .menubar-sub-trigger',
        container
      );

      items.forEach((item) => {
        if (item.classList.contains('menubar-sub-trigger')) {
          item.setAttribute('role', 'menuitem');
          item.setAttribute('aria-haspopup', 'menu');
          item.setAttribute('aria-expanded', 'false');
        } else if (item.classList.contains('menubar-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
          const checked = item.getAttribute('data-checked') === 'true';
          item.setAttribute('aria-checked', checked);
        } else if (item.classList.contains('menubar-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
          const checked = item.getAttribute('data-checked') === 'true';
          item.setAttribute('aria-checked', checked);
        } else {
          item.setAttribute('role', 'menuitem');
        }

        if (item.getAttribute('data-disabled') === 'true') {
          item.setAttribute('aria-disabled', 'true');
        }

        item.setAttribute('tabindex', '-1');
      });
    }

    _initSubmenus(container) {
      const subs = $$('.menubar-sub', container);

      subs.forEach((sub) => {
        const trigger = $('.menubar-sub-trigger', sub);
        const content = $('.menubar-sub-content', sub);

        if (trigger && content) {
          const triggerId = trigger.id || uid('menubar-sub-trigger');
          const contentId = content.id || uid('menubar-sub-content');

          trigger.id = triggerId;
          content.id = contentId;

          trigger.setAttribute('aria-controls', contentId);
          content.setAttribute('role', 'menu');
          content.setAttribute('aria-labelledby', triggerId);
          content.setAttribute('data-state', 'closed');

          // Set up nested menu items
          this._initMenuItems(content);

          // Recursive for nested submenus
          this._initSubmenus(content);
        }
      });
    }

    _bindEvents() {
      // Trigger click handlers
      this.triggers.forEach((trigger, index) => {
        on(trigger, 'click', () => {
          this._toggleMenu(index);
        });

        on(trigger, 'mouseenter', () => {
          if (this.isMenubarActive && this.openMenuIndex !== index) {
            this._openMenu(index);
          }
        });
      });

      // Keyboard navigation on root
      on(this.root, 'keydown', (e) => this._handleMenubarKeydown(e));

      // Menu content events (delegated)
      this.menus.forEach((menu) => {
        const content = $('.menubar-content', menu);
        if (content) {
          on(content, 'keydown', (e) => this._handleMenuKeydown(e, content));

          // Item click handlers
          on(content, 'click', '.menubar-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._selectItem(item);
            }
          });

          on(content, 'click', '.menubar-checkbox-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._toggleCheckboxItem(item);
            }
          });

          on(content, 'click', '.menubar-radio-item', (e, item) => {
            if (item.getAttribute('data-disabled') !== 'true') {
              this._selectRadioItem(item);
            }
          });

          // Hover highlighting
          on(content, 'mouseenter', '.menubar-item, .menubar-checkbox-item, .menubar-radio-item, .menubar-sub-trigger', (e, item) => {
            this._highlightItem(content, item);
          });

          // Submenu handling
          on(content, 'mouseenter', '.menubar-sub-trigger', (e, trigger) => {
            this._openSubmenu(trigger);
          });

          on(content, 'mouseleave', '.menubar-sub', (e, sub) => {
            // Delay to allow moving to submenu
            setTimeout(() => {
              const subContent = $('.menubar-sub-content', sub);
              if (subContent && !sub.matches(':hover') && !subContent.matches(':hover')) {
                this._closeSubmenu(sub);
              }
            }, 100);
          });
        }
      });
    }

    _handleMenubarKeydown(e) {
      const currentTrigger = document.activeElement;
      const triggerIndex = this.triggers.indexOf(currentTrigger);

      if (triggerIndex === -1 && !this.isMenubarActive) return;

      switch (e.key) {
        case Keys.ARROW_RIGHT:
          e.preventDefault();
          if (this.isMenubarActive) {
            const nextIndex = (this.openMenuIndex + 1) % this.menus.length;
            this._openMenu(nextIndex);
          } else if (triggerIndex !== -1) {
            const nextIndex = (triggerIndex + 1) % this.triggers.length;
            this._focusTrigger(nextIndex);
          }
          break;

        case Keys.ARROW_LEFT:
          e.preventDefault();
          if (this.isMenubarActive) {
            const prevIndex = (this.openMenuIndex - 1 + this.menus.length) % this.menus.length;
            this._openMenu(prevIndex);
          } else if (triggerIndex !== -1) {
            const prevIndex = (triggerIndex - 1 + this.triggers.length) % this.triggers.length;
            this._focusTrigger(prevIndex);
          }
          break;

        case Keys.ARROW_DOWN:
        case Keys.ENTER:
        case Keys.SPACE:
          if (triggerIndex !== -1 && !this.isMenubarActive) {
            e.preventDefault();
            this._openMenu(triggerIndex);
          }
          break;

        case Keys.ESCAPE:
          if (this.isMenubarActive) {
            e.preventDefault();
            this._closeAllMenus();
            this._focusTrigger(this.openMenuIndex >= 0 ? this.openMenuIndex : 0);
          }
          break;

        case Keys.HOME:
          if (triggerIndex !== -1) {
            e.preventDefault();
            this._focusTrigger(0);
          }
          break;

        case Keys.END:
          if (triggerIndex !== -1) {
            e.preventDefault();
            this._focusTrigger(this.triggers.length - 1);
          }
          break;
      }
    }

    _handleMenuKeydown(e, container) {
      const items = this._getMenuItems(container);
      const currentItem = document.activeElement;
      const currentIndex = items.indexOf(currentItem);

      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          e.stopPropagation();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          this._focusItem(items, nextIndex);
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          e.stopPropagation();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          this._focusItem(items, prevIndex);
          break;

        case Keys.ARROW_RIGHT:
          // Open submenu if on sub-trigger
          if (currentItem && currentItem.classList.contains('menubar-sub-trigger')) {
            e.preventDefault();
            e.stopPropagation();
            this._openSubmenu(currentItem);
            const subContent = $('.menubar-sub-content', currentItem.closest('.menubar-sub'));
            if (subContent) {
              const subItems = this._getMenuItems(subContent);
              if (subItems.length > 0) {
                this._focusItem(subItems, 0);
              }
            }
          } else {
            // Move to next menu
            e.preventDefault();
            const nextMenuIndex = (this.openMenuIndex + 1) % this.menus.length;
            this._openMenu(nextMenuIndex);
          }
          break;

        case Keys.ARROW_LEFT:
          // Check if in submenu
          const subContent = currentItem?.closest('.menubar-sub-content');
          if (subContent) {
            e.preventDefault();
            e.stopPropagation();
            const sub = subContent.closest('.menubar-sub');
            const trigger = $('.menubar-sub-trigger', sub);
            this._closeSubmenu(sub);
            if (trigger) trigger.focus();
          } else {
            // Move to previous menu
            e.preventDefault();
            const prevMenuIndex = (this.openMenuIndex - 1 + this.menus.length) % this.menus.length;
            this._openMenu(prevMenuIndex);
          }
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          if (currentItem) {
            e.preventDefault();
            e.stopPropagation();

            if (currentItem.classList.contains('menubar-sub-trigger')) {
              this._openSubmenu(currentItem);
              const subContent = $('.menubar-sub-content', currentItem.closest('.menubar-sub'));
              if (subContent) {
                const subItems = this._getMenuItems(subContent);
                if (subItems.length > 0) {
                  this._focusItem(subItems, 0);
                }
              }
            } else if (currentItem.classList.contains('menubar-checkbox-item')) {
              this._toggleCheckboxItem(currentItem);
            } else if (currentItem.classList.contains('menubar-radio-item')) {
              this._selectRadioItem(currentItem);
            } else if (currentItem.classList.contains('menubar-item')) {
              this._selectItem(currentItem);
            }
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          e.stopPropagation();
          // Check if in submenu first
          const currentSubContent = currentItem?.closest('.menubar-sub-content');
          if (currentSubContent) {
            const sub = currentSubContent.closest('.menubar-sub');
            const trigger = $('.menubar-sub-trigger', sub);
            this._closeSubmenu(sub);
            if (trigger) trigger.focus();
          } else {
            this._closeAllMenus();
            this._focusTrigger(this.openMenuIndex);
          }
          break;

        case Keys.HOME:
          e.preventDefault();
          e.stopPropagation();
          this._focusItem(items, 0);
          break;

        case Keys.END:
          e.preventDefault();
          e.stopPropagation();
          this._focusItem(items, items.length - 1);
          break;

        case Keys.TAB:
          this._closeAllMenus();
          break;
      }
    }

    _getMenuItems(container) {
      return $$(
        '.menubar-item:not([data-disabled="true"]), ' +
        '.menubar-checkbox-item:not([data-disabled="true"]), ' +
        '.menubar-radio-item:not([data-disabled="true"]), ' +
        '.menubar-sub-trigger:not([data-disabled="true"])',
        container
      ).filter((item) => {
        // Only include direct children items (not nested submenu items)
        const parentMenu = item.closest('.menubar-content, .menubar-sub-content');
        return parentMenu === container;
      });
    }

    _toggleMenu(index) {
      if (this.openMenuIndex === index && this.isMenubarActive) {
        this._closeAllMenus();
      } else {
        this._openMenu(index);
      }
    }

    _openMenu(index) {
      // Close all menus first
      this._closeAllMenus(false);

      const menu = this.menus[index];
      const trigger = this.triggers[index];
      const content = $('.menubar-content', menu);

      if (!content) return;

      this.openMenuIndex = index;
      this.isMenubarActive = true;

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('data-state', 'open');

      // Focus first item
      const items = this._getMenuItems(content);
      if (items.length > 0) {
        this._focusItem(items, 0);
      }

      // Update trigger tabindex
      this.triggers.forEach((t, i) => {
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });

      // Set up click outside handler
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
      }
      this.cleanupClickOutside = onClickOutside(this.root, () => {
        this._closeAllMenus();
      });

      emit(this.root, 'menubar:open', { index, menu, trigger, content });
    }

    _closeAllMenus(resetFocus = true) {
      this.menus.forEach((menu, index) => {
        const trigger = this.triggers[index];
        const content = $('.menubar-content', menu);

        if (content) {
          trigger.setAttribute('aria-expanded', 'false');
          content.setAttribute('data-state', 'closed');

          // Close all submenus
          $$('.menubar-sub', content).forEach((sub) => {
            this._closeSubmenu(sub);
          });

          // Clear highlights
          this._clearHighlights(content);
        }
      });

      const wasOpen = this.openMenuIndex;
      this.openMenuIndex = -1;
      this.isMenubarActive = false;

      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.root, 'menubar:close', { previousIndex: wasOpen });
    }

    _openSubmenu(trigger) {
      const sub = trigger.closest('.menubar-sub');
      const content = $('.menubar-sub-content', sub);

      if (!content) return;

      // Close sibling submenus
      const parentMenu = sub.parentElement;
      $$('.menubar-sub', parentMenu).forEach((sibling) => {
        if (sibling !== sub) {
          this._closeSubmenu(sibling);
        }
      });

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('data-state', 'open');

      emit(this.root, 'menubar:submenu-open', { trigger, content });
    }

    _closeSubmenu(sub) {
      const trigger = $('.menubar-sub-trigger', sub);
      const content = $('.menubar-sub-content', sub);

      if (trigger && content) {
        trigger.setAttribute('aria-expanded', 'false');
        content.setAttribute('data-state', 'closed');

        // Close nested submenus
        $$('.menubar-sub', content).forEach((nestedSub) => {
          this._closeSubmenu(nestedSub);
        });

        this._clearHighlights(content);
      }
    }

    _focusTrigger(index) {
      this.triggers.forEach((t, i) => {
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      this.triggers[index]?.focus();
    }

    _focusItem(items, index) {
      if (items[index]) {
        items[index].focus();
        this._highlightItem(items[index].closest('.menubar-content, .menubar-sub-content'), items[index]);
      }
    }

    _highlightItem(container, item) {
      this._clearHighlights(container);
      item.setAttribute('data-highlighted', 'true');
    }

    _clearHighlights(container) {
      $$('[data-highlighted="true"]', container).forEach((el) => {
        el.removeAttribute('data-highlighted');
      });
    }

    _selectItem(item) {
      emit(this.root, 'menubar:select', { item, value: item.getAttribute('data-value') });
      this._closeAllMenus();
      this._focusTrigger(this.openMenuIndex >= 0 ? this.openMenuIndex : 0);
    }

    _toggleCheckboxItem(item) {
      const checked = item.getAttribute('data-checked') !== 'true';
      item.setAttribute('data-checked', checked);
      item.setAttribute('aria-checked', checked);

      emit(this.root, 'menubar:checkbox-change', {
        item,
        checked,
        value: item.getAttribute('data-value')
      });
    }

    _selectRadioItem(item) {
      const group = item.closest('.menubar-radio-group');
      if (group) {
        $$('.menubar-radio-item', group).forEach((radio) => {
          radio.setAttribute('data-checked', 'false');
          radio.setAttribute('aria-checked', 'false');
        });
      }

      item.setAttribute('data-checked', 'true');
      item.setAttribute('aria-checked', 'true');

      emit(this.root, 'menubar:radio-change', {
        item,
        value: item.getAttribute('data-value'),
        group: group?.getAttribute('data-value')
      });
    }

    // Public API
    open(index) {
      if (index >= 0 && index < this.menus.length) {
        this._openMenu(index);
      }
    }

    close() {
      this._closeAllMenus();
    }

    destroy() {
      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
      }
      this.root.removeAttribute('role');
    }
  }

  /**
   * Initialize menubar
   */
  function initMenubar(element) {
    if (getInstance(element, 'menubar')) return getInstance(element, 'menubar');
    const instance = new Menubar(element);
    setInstance(element, 'menubar', instance);
    return instance;
  }

  // Register for auto-init
  registerComponent('menubar', initMenubar);

  // Export
  BrandUI.components.Menubar = Menubar;
  BrandUI.components.initMenubar = initMenubar;
})();


/* === vanilla/js/components/navigation-menu.js === */
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


/* === vanilla/js/components/popover.js === */
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


/* === vanilla/js/components/radio-group.js === */
/**
 * Brand UI - Radio Group Component
 * Accessible radio group with keyboard navigation support.
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'radio-group';

  /**
   * Initialize a radio group element
   */
  function initRadioGroup(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const config = BrandUI.getData(element);
    const orientation = config.orientation || 'vertical';
    const loop = config.loop !== 'false';
    const name = config.name || BrandUI.uid('radio');

    // Set orientation attribute
    element.setAttribute('data-orientation', orientation);

    // Ensure proper role
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'radiogroup');
    }

    // Get all radio items
    function getItems() {
      return BrandUI.$$('.radio-group-item', element).filter(
        (item) => !item.disabled
      );
    }

    /**
     * Initialize each radio item
     */
    function initItems() {
      const items = BrandUI.$$('.radio-group-item', element);
      items.forEach((item, index) => {
        // Ensure proper role
        if (!item.hasAttribute('role')) {
          item.setAttribute('role', 'radio');
        }

        // Set name for form submission
        if (!item.hasAttribute('data-name')) {
          item.setAttribute('data-name', name);
        }

        // Initialize aria-checked if not set
        if (!item.hasAttribute('aria-checked')) {
          item.setAttribute('aria-checked', 'false');
        }

        // Add indicator if not present
        let indicator = item.querySelector('.radio-group-indicator');
        if (!indicator) {
          indicator = document.createElement('span');
          indicator.className = 'radio-group-indicator';
          item.appendChild(indicator);
        }

        // Set tabindex - only first enabled or checked item is focusable
        const enabledItems = getItems();
        const checkedItem = enabledItems.find(
          (i) => i.getAttribute('aria-checked') === 'true'
        );

        if (checkedItem) {
          item.setAttribute(
            'tabindex',
            item === checkedItem ? '0' : '-1'
          );
        } else if (enabledItems.length > 0) {
          item.setAttribute(
            'tabindex',
            item === enabledItems[0] ? '0' : '-1'
          );
        }
      });
    }

    initItems();

    /**
     * Get current value
     */
    function getValue() {
      const checkedItem = BrandUI.$('.radio-group-item[aria-checked="true"]', element);
      return checkedItem ? checkedItem.getAttribute('data-value') || checkedItem.value : null;
    }

    /**
     * Set value by selecting the matching radio
     */
    function setValue(value) {
      const items = BrandUI.$$('.radio-group-item', element);
      items.forEach((item) => {
        const itemValue = item.getAttribute('data-value') || item.value;
        const isMatch = itemValue === value;

        item.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        item.setAttribute('tabindex', isMatch ? '0' : '-1');
      });

      BrandUI.emit(element, 'radio-group:change', { value });
    }

    /**
     * Select a specific item
     */
    function selectItem(item) {
      if (item.disabled) return;

      const items = BrandUI.$$('.radio-group-item', element);
      items.forEach((i) => {
        i.setAttribute('aria-checked', 'false');
        i.setAttribute('tabindex', '-1');
      });

      item.setAttribute('aria-checked', 'true');
      item.setAttribute('tabindex', '0');
      item.focus();

      const value = item.getAttribute('data-value') || item.value;
      BrandUI.emit(element, 'radio-group:change', { value, item });
    }

    /**
     * Handle click on radio item
     */
    function handleClick(e, item) {
      e.preventDefault();
      selectItem(item);
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(e) {
      const items = getItems();
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      const isHorizontal = orientation === 'horizontal';
      const prevKey = isHorizontal ? BrandUI.Keys.ARROW_LEFT : BrandUI.Keys.ARROW_UP;
      const nextKey = isHorizontal ? BrandUI.Keys.ARROW_RIGHT : BrandUI.Keys.ARROW_DOWN;

      let newIndex = currentIndex;

      switch (e.key) {
        case prevKey:
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0;
          }
          break;

        case nextKey:
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1;
          }
          break;

        case BrandUI.Keys.HOME:
          e.preventDefault();
          newIndex = 0;
          break;

        case BrandUI.Keys.END:
          e.preventDefault();
          newIndex = items.length - 1;
          break;

        case BrandUI.Keys.SPACE:
        case BrandUI.Keys.ENTER:
          e.preventDefault();
          selectItem(items[currentIndex]);
          return;

        default:
          return;
      }

      // Select and focus the new item (radio groups select on arrow key navigation)
      if (items[newIndex]) {
        selectItem(items[newIndex]);
      }
    }

    // Bind events using delegation
    const removeClick = BrandUI.on(element, 'click', '.radio-group-item', handleClick);
    const removeKeydown = BrandUI.on(element, 'keydown', handleKeydown);

    // Handle associated label clicks
    BrandUI.$$('.radio-group-item[id]', element).forEach((item) => {
      const id = item.id;
      const labels = document.querySelectorAll(`label[for="${id}"]`);
      labels.forEach((label) => {
        BrandUI.on(label, 'click', (e) => {
          e.preventDefault();
          selectItem(item);
        });
      });
    });

    // API
    const api = {
      element,

      getValue,
      setValue,

      getItems,

      selectItem,

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
   * Create a new radio group element
   */
  function createRadioGroup(options = {}) {
    const {
      id,
      name,
      orientation = 'vertical',
      loop = true,
      defaultValue,
      disabled = false,
      className = '',
      items = [],
    } = options;

    const group = document.createElement('div');
    group.className = `radio-group ${className}`.trim();
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('data-radio-group', '');

    if (id) group.id = id;
    if (name) group.setAttribute('data-name', name);
    if (orientation !== 'vertical') {
      group.setAttribute('data-orientation', orientation);
    }
    if (!loop) group.setAttribute('data-loop', 'false');

    // Create items
    items.forEach((itemConfig, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'radio-group-wrapper';

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'radio-group-item';
      item.setAttribute('role', 'radio');
      item.setAttribute('data-value', itemConfig.value);

      const isChecked = defaultValue === itemConfig.value;
      item.setAttribute('aria-checked', isChecked ? 'true' : 'false');

      if (itemConfig.id) item.id = itemConfig.id;
      if (disabled || itemConfig.disabled) item.disabled = true;

      const indicator = document.createElement('span');
      indicator.className = 'radio-group-indicator';
      item.appendChild(indicator);

      wrapper.appendChild(item);

      if (itemConfig.label) {
        const label = document.createElement('label');
        if (itemConfig.id) label.setAttribute('for', itemConfig.id);
        label.textContent = itemConfig.label;
        wrapper.appendChild(label);
      }

      group.appendChild(wrapper);
    });

    // Initialize
    return initRadioGroup(group);
  }

  // Register component for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, initRadioGroup);

  // Expose to BrandUI namespace
  BrandUI.components.RadioGroup = {
    init: initRadioGroup,
    create: createRadioGroup,
  };
})();


/* === vanilla/js/components/resizable.js === */
/**
 * Brand UI - Resizable Component
 * Resizable panel groups with draggable handles
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'resizable';

  /**
   * Resizable Panel Group
   */
  class Resizable {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        direction: element.dataset.direction || 'horizontal',
        disabled: element.dataset.disabled !== undefined,
        onResize: options.onResize || null,
        ...options,
      };

      this.panels = [];
      this.handles = [];
      this.isResizing = false;
      this.currentHandle = null;
      this.startPosition = 0;
      this.startSizes = [];

      this.init();
    }

    init() {
      this.panels = Array.from(this.element.querySelectorAll(':scope > .resizable-panel'));
      this.handles = Array.from(this.element.querySelectorAll(':scope > .resizable-handle'));

      // Set initial sizes from data attributes or distribute evenly
      this.initializeSizes();

      // Bind handle events
      this.handles.forEach((handle, index) => {
        this.bindHandleEvents(handle, index);
      });

      // Store instance
      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    initializeSizes() {
      const isVertical = this.options.direction === 'vertical';
      const containerSize = isVertical ? this.element.offsetHeight : this.element.offsetWidth;
      const handleSize = this.handles.reduce((sum, h) => sum + (isVertical ? h.offsetHeight : h.offsetWidth), 0);
      const availableSize = containerSize - handleSize;

      let totalDefined = 0;
      let undefinedCount = 0;

      // First pass: calculate defined sizes and count undefined
      this.panels.forEach((panel) => {
        const defaultSize = panel.dataset.defaultSize;
        if (defaultSize) {
          totalDefined += parseFloat(defaultSize);
        } else {
          undefinedCount++;
        }
      });

      // Calculate remaining percentage for undefined panels
      const remainingPercent = 100 - totalDefined;
      const defaultPercent = undefinedCount > 0 ? remainingPercent / undefinedCount : 0;

      // Second pass: apply sizes
      this.panels.forEach((panel) => {
        const defaultSize = panel.dataset.defaultSize;
        const minSize = panel.dataset.minSize ? parseFloat(panel.dataset.minSize) : 0;
        const maxSize = panel.dataset.maxSize ? parseFloat(panel.dataset.maxSize) : 100;

        let size = defaultSize ? parseFloat(defaultSize) : defaultPercent;
        size = Math.max(minSize, Math.min(maxSize, size));

        const pixelSize = (size / 100) * availableSize;
        panel.style.flex = `0 0 ${pixelSize}px`;

        // Store size info
        panel._resizableSize = {
          percent: size,
          pixels: pixelSize,
          min: minSize,
          max: maxSize,
          minPixels: (minSize / 100) * availableSize,
          maxPixels: (maxSize / 100) * availableSize,
        };
      });
    }

    bindHandleEvents(handle, index) {
      // Mouse events
      handle.addEventListener('mousedown', (e) => this.startResize(e, handle, index));

      // Touch events
      handle.addEventListener('touchstart', (e) => this.startResize(e, handle, index), { passive: false });

      // Keyboard events
      handle.setAttribute('tabindex', '0');
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', this.options.direction === 'vertical' ? 'horizontal' : 'vertical');

      handle.addEventListener('keydown', (e) => this.handleKeydown(e, handle, index));
    }

    startResize(e, handle, index) {
      if (this.options.disabled || handle.dataset.disabled !== undefined) return;

      e.preventDefault();
      this.isResizing = true;
      this.currentHandle = handle;
      this.currentIndex = index;

      // Get start position
      const isVertical = this.options.direction === 'vertical';
      const point = e.touches ? e.touches[0] : e;
      this.startPosition = isVertical ? point.clientY : point.clientX;

      // Store starting sizes
      this.startSizes = this.panels.map((panel) => ({
        pixels: isVertical ? panel.offsetHeight : panel.offsetWidth,
        ...panel._resizableSize,
      }));

      // Add classes
      this.element.classList.add('resizing');
      handle.classList.add('dragging');

      // Bind move and end events
      this.boundMove = (e) => this.resize(e);
      this.boundEnd = () => this.endResize();

      document.addEventListener('mousemove', this.boundMove);
      document.addEventListener('mouseup', this.boundEnd);
      document.addEventListener('touchmove', this.boundMove, { passive: false });
      document.addEventListener('touchend', this.boundEnd);
    }

    resize(e) {
      if (!this.isResizing) return;

      const isVertical = this.options.direction === 'vertical';
      const point = e.touches ? e.touches[0] : e;
      const currentPosition = isVertical ? point.clientY : point.clientX;
      const delta = currentPosition - this.startPosition;

      // Get the two panels adjacent to this handle
      const panelBefore = this.panels[this.currentIndex];
      const panelAfter = this.panels[this.currentIndex + 1];

      if (!panelBefore || !panelAfter) return;

      const beforeStart = this.startSizes[this.currentIndex];
      const afterStart = this.startSizes[this.currentIndex + 1];

      // Calculate new sizes
      let beforeNew = beforeStart.pixels + delta;
      let afterNew = afterStart.pixels - delta;

      // Apply constraints
      const beforeMin = beforeStart.minPixels || 0;
      const beforeMax = beforeStart.maxPixels || Infinity;
      const afterMin = afterStart.minPixels || 0;
      const afterMax = afterStart.maxPixels || Infinity;

      // Constrain beforeNew
      if (beforeNew < beforeMin) {
        const overflow = beforeMin - beforeNew;
        beforeNew = beforeMin;
        afterNew += overflow;
      } else if (beforeNew > beforeMax) {
        const overflow = beforeNew - beforeMax;
        beforeNew = beforeMax;
        afterNew -= overflow;
      }

      // Constrain afterNew
      if (afterNew < afterMin) {
        const overflow = afterMin - afterNew;
        afterNew = afterMin;
        beforeNew -= overflow;
      } else if (afterNew > afterMax) {
        const overflow = afterNew - afterMax;
        afterNew = afterMax;
        beforeNew += overflow;
      }

      // Final clamp
      beforeNew = Math.max(beforeMin, Math.min(beforeMax, beforeNew));
      afterNew = Math.max(afterMin, Math.min(afterMax, afterNew));

      // Apply sizes
      panelBefore.style.flex = `0 0 ${beforeNew}px`;
      panelAfter.style.flex = `0 0 ${afterNew}px`;

      // Update stored sizes
      const containerSize = isVertical ? this.element.offsetHeight : this.element.offsetWidth;
      const handleSize = this.handles.reduce((sum, h) => sum + (isVertical ? h.offsetHeight : h.offsetWidth), 0);
      const availableSize = containerSize - handleSize;

      panelBefore._resizableSize = {
        ...panelBefore._resizableSize,
        pixels: beforeNew,
        percent: (beforeNew / availableSize) * 100,
      };

      panelAfter._resizableSize = {
        ...panelAfter._resizableSize,
        pixels: afterNew,
        percent: (afterNew / availableSize) * 100,
      };

      // Emit resize event
      this.emitResize();
    }

    endResize() {
      if (!this.isResizing) return;

      this.isResizing = false;
      this.element.classList.remove('resizing');

      if (this.currentHandle) {
        this.currentHandle.classList.remove('dragging');
      }

      // Remove event listeners
      document.removeEventListener('mousemove', this.boundMove);
      document.removeEventListener('mouseup', this.boundEnd);
      document.removeEventListener('touchmove', this.boundMove);
      document.removeEventListener('touchend', this.boundEnd);

      // Emit final resize event
      BrandUI.emit(this.element, 'resizable:resizeend', {
        sizes: this.getSizes(),
      });
    }

    handleKeydown(e, handle, index) {
      if (this.options.disabled || handle.dataset.disabled !== undefined) return;

      const isVertical = this.options.direction === 'vertical';
      const step = e.shiftKey ? 50 : 10;
      let delta = 0;

      switch (e.key) {
        case 'ArrowLeft':
          if (!isVertical) delta = -step;
          break;
        case 'ArrowRight':
          if (!isVertical) delta = step;
          break;
        case 'ArrowUp':
          if (isVertical) delta = -step;
          break;
        case 'ArrowDown':
          if (isVertical) delta = step;
          break;
        case 'Home':
          // Collapse panel before
          this.collapsePanel(index);
          e.preventDefault();
          return;
        case 'End':
          // Expand panel before to max
          this.expandPanel(index);
          e.preventDefault();
          return;
        case 'Enter':
        case ' ':
          // Toggle collapse
          this.toggleCollapse(index);
          e.preventDefault();
          return;
        default:
          return;
      }

      if (delta !== 0) {
        e.preventDefault();
        this.resizeByDelta(index, delta);
      }
    }

    resizeByDelta(handleIndex, delta) {
      const isVertical = this.options.direction === 'vertical';
      const panelBefore = this.panels[handleIndex];
      const panelAfter = this.panels[handleIndex + 1];

      if (!panelBefore || !panelAfter) return;

      const beforeSize = isVertical ? panelBefore.offsetHeight : panelBefore.offsetWidth;
      const afterSize = isVertical ? panelAfter.offsetHeight : panelAfter.offsetWidth;

      let beforeNew = beforeSize + delta;
      let afterNew = afterSize - delta;

      // Apply constraints
      const beforeMin = panelBefore._resizableSize?.minPixels || 0;
      const beforeMax = panelBefore._resizableSize?.maxPixels || Infinity;
      const afterMin = panelAfter._resizableSize?.minPixels || 0;
      const afterMax = panelAfter._resizableSize?.maxPixels || Infinity;

      beforeNew = Math.max(beforeMin, Math.min(beforeMax, beforeNew));
      afterNew = Math.max(afterMin, Math.min(afterMax, afterNew));

      panelBefore.style.flex = `0 0 ${beforeNew}px`;
      panelAfter.style.flex = `0 0 ${afterNew}px`;

      // Update stored sizes
      const containerSize = isVertical ? this.element.offsetHeight : this.element.offsetWidth;
      const handleSize = this.handles.reduce((sum, h) => sum + (isVertical ? h.offsetHeight : h.offsetWidth), 0);
      const availableSize = containerSize - handleSize;

      panelBefore._resizableSize = {
        ...panelBefore._resizableSize,
        pixels: beforeNew,
        percent: (beforeNew / availableSize) * 100,
      };

      panelAfter._resizableSize = {
        ...panelAfter._resizableSize,
        pixels: afterNew,
        percent: (afterNew / availableSize) * 100,
      };

      this.emitResize();
    }

    collapsePanel(handleIndex) {
      const panel = this.panels[handleIndex];
      if (!panel) return;

      panel.dataset.collapsed = 'true';
      panel._resizableSize.preCollapseSize = panel._resizableSize.pixels;
      this.emitResize();
    }

    expandPanel(handleIndex) {
      const panel = this.panels[handleIndex];
      if (!panel) return;

      delete panel.dataset.collapsed;
      if (panel._resizableSize.preCollapseSize) {
        panel.style.flex = `0 0 ${panel._resizableSize.preCollapseSize}px`;
        panel._resizableSize.pixels = panel._resizableSize.preCollapseSize;
      }
      this.emitResize();
    }

    toggleCollapse(handleIndex) {
      const panel = this.panels[handleIndex];
      if (!panel) return;

      if (panel.dataset.collapsed === 'true') {
        this.expandPanel(handleIndex);
      } else {
        this.collapsePanel(handleIndex);
      }
    }

    emitResize() {
      const sizes = this.getSizes();

      BrandUI.emit(this.element, 'resizable:resize', { sizes });

      if (this.options.onResize) {
        this.options.onResize(sizes);
      }
    }

    // Public API

    getSizes() {
      return this.panels.map((panel) => ({
        percent: panel._resizableSize?.percent || 0,
        pixels: panel._resizableSize?.pixels || 0,
      }));
    }

    setSizes(sizes) {
      const isVertical = this.options.direction === 'vertical';
      const containerSize = isVertical ? this.element.offsetHeight : this.element.offsetWidth;
      const handleSize = this.handles.reduce((sum, h) => sum + (isVertical ? h.offsetHeight : h.offsetWidth), 0);
      const availableSize = containerSize - handleSize;

      sizes.forEach((size, index) => {
        const panel = this.panels[index];
        if (!panel) return;

        const pixels = typeof size === 'number' ? (size / 100) * availableSize : size.pixels || (size.percent / 100) * availableSize;

        panel.style.flex = `0 0 ${pixels}px`;
        panel._resizableSize = {
          ...panel._resizableSize,
          pixels,
          percent: (pixels / availableSize) * 100,
        };
      });

      this.emitResize();
    }

    getPanel(index) {
      return this.panels[index];
    }

    setDisabled(disabled) {
      this.options.disabled = disabled;
      if (disabled) {
        this.element.dataset.disabled = '';
      } else {
        delete this.element.dataset.disabled;
      }
    }

    refresh() {
      this.initializeSizes();
    }

    destroy() {
      this.handles.forEach((handle) => {
        handle.removeAttribute('tabindex');
        handle.removeAttribute('role');
        handle.removeAttribute('aria-orientation');
      });

      this.element.classList.remove('resizing');
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  // Factory function
  function createResizable(element, options) {
    const existing = BrandUI.getInstance(element, COMPONENT_NAME);
    if (existing) return existing;
    return new Resizable(element, options);
  }

  // Auto-initialize
  function initResizable(element) {
    return createResizable(element);
  }

  // Register component
  BrandUI.registerComponent(COMPONENT_NAME, initResizable);

  // Export
  BrandUI.components.Resizable = Resizable;
  BrandUI.createResizable = createResizable;
})();


/* === vanilla/js/components/scroll-area.js === */
/**
 * Brand UI - Scroll Area Component
 * Custom scrollbar with support for vertical and horizontal scrolling
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'scroll-area';

  /**
   * Initialize a scroll area component
   */
  function initScrollArea(element) {
    // Prevent double initialization
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const viewport = BrandUI.$('.scroll-area-viewport', element);
    if (!viewport) {
      console.warn('ScrollArea: viewport element not found');
      return null;
    }

    const options = BrandUI.getData(element, 'scrollArea');
    const orientation = options.orientation || 'vertical'; // 'vertical', 'horizontal', 'both'

    const state = {
      isDragging: false,
      dragAxis: null,
      startPosition: 0,
      startScroll: 0,
      scrollTimeout: null,
    };

    // Create scrollbars based on orientation
    const scrollbars = {};

    if (orientation === 'vertical' || orientation === 'both') {
      scrollbars.vertical = createScrollbar('vertical');
      element.appendChild(scrollbars.vertical.track);
    }

    if (orientation === 'horizontal' || orientation === 'both') {
      scrollbars.horizontal = createScrollbar('horizontal');
      element.appendChild(scrollbars.horizontal.track);
    }

    // Add corner if both scrollbars are present
    if (scrollbars.vertical && scrollbars.horizontal) {
      const corner = document.createElement('div');
      corner.className = 'scroll-area-corner';
      element.appendChild(corner);
    }

    /**
     * Create a scrollbar element
     */
    function createScrollbar(axis) {
      const track = document.createElement('div');
      track.className = 'scroll-area-scrollbar';
      track.setAttribute('data-orientation', axis);

      const thumb = document.createElement('div');
      thumb.className = 'scroll-area-thumb';
      track.appendChild(thumb);

      return { track, thumb };
    }

    /**
     * Update scrollbar thumb size and position
     */
    function updateScrollbar(axis) {
      const scrollbar = scrollbars[axis];
      if (!scrollbar) return;

      const { track, thumb } = scrollbar;
      const isVertical = axis === 'vertical';

      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;
      const scrollPosition = isVertical ? viewport.scrollTop : viewport.scrollLeft;

      // Calculate thumb size (minimum 20px)
      const ratio = viewportSize / contentSize;
      const trackSize = isVertical ? track.clientHeight : track.clientWidth;
      const thumbSize = Math.max(ratio * trackSize, 20);

      // Calculate thumb position
      const scrollRatio = scrollPosition / (contentSize - viewportSize);
      const maxThumbPosition = trackSize - thumbSize;
      const thumbPosition = scrollRatio * maxThumbPosition;

      // Apply styles
      if (isVertical) {
        thumb.style.height = `${thumbSize}px`;
        thumb.style.width = '';
        thumb.style.transform = `translateY(${thumbPosition}px)`;
      } else {
        thumb.style.width = `${thumbSize}px`;
        thumb.style.height = '';
        thumb.style.transform = `translateX(${thumbPosition}px)`;
      }

      // Hide scrollbar if content fits
      track.style.display = ratio >= 1 ? 'none' : 'flex';
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
      if (scrollbars.vertical) {
        updateScrollbar('vertical');
        scrollbars.vertical.track.setAttribute('data-scrolling', 'true');
      }
      if (scrollbars.horizontal) {
        updateScrollbar('horizontal');
        scrollbars.horizontal.track.setAttribute('data-scrolling', 'true');
      }

      // Remove scrolling indicator after delay
      clearTimeout(state.scrollTimeout);
      state.scrollTimeout = setTimeout(() => {
        if (scrollbars.vertical) {
          scrollbars.vertical.track.setAttribute('data-scrolling', 'false');
        }
        if (scrollbars.horizontal) {
          scrollbars.horizontal.track.setAttribute('data-scrolling', 'false');
        }
      }, 1000);

      BrandUI.emit(element, 'scroll-area:scroll', {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
      });
    }

    /**
     * Handle thumb drag start
     */
    function handleDragStart(e, axis) {
      e.preventDefault();
      state.isDragging = true;
      state.dragAxis = axis;

      const scrollbar = scrollbars[axis];
      scrollbar.thumb.setAttribute('data-dragging', 'true');

      const isVertical = axis === 'vertical';
      state.startPosition = isVertical ? e.clientY : e.clientX;
      state.startScroll = isVertical ? viewport.scrollTop : viewport.scrollLeft;

      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    /**
     * Handle thumb drag movement
     */
    function handleDragMove(e) {
      if (!state.isDragging) return;

      const axis = state.dragAxis;
      const scrollbar = scrollbars[axis];
      const isVertical = axis === 'vertical';

      const currentPosition = isVertical ? e.clientY : e.clientX;
      const delta = currentPosition - state.startPosition;

      const trackSize = isVertical
        ? scrollbar.track.clientHeight
        : scrollbar.track.clientWidth;
      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;

      const scrollRatio = delta / trackSize;
      const scrollDelta = scrollRatio * contentSize;

      if (isVertical) {
        viewport.scrollTop = state.startScroll + scrollDelta;
      } else {
        viewport.scrollLeft = state.startScroll + scrollDelta;
      }
    }

    /**
     * Handle thumb drag end
     */
    function handleDragEnd() {
      if (!state.isDragging) return;

      const scrollbar = scrollbars[state.dragAxis];
      scrollbar.thumb.setAttribute('data-dragging', 'false');

      state.isDragging = false;
      state.dragAxis = null;

      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    }

    /**
     * Handle track click (jump to position)
     */
    function handleTrackClick(e, axis) {
      const scrollbar = scrollbars[axis];
      if (e.target === scrollbar.thumb) return;

      const isVertical = axis === 'vertical';
      const rect = scrollbar.track.getBoundingClientRect();
      const clickPosition = isVertical
        ? e.clientY - rect.top
        : e.clientX - rect.left;
      const trackSize = isVertical ? rect.height : rect.width;
      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;

      const scrollRatio = clickPosition / trackSize;
      const targetScroll = scrollRatio * contentSize - viewportSize / 2;

      viewport.scrollTo({
        [isVertical ? 'top' : 'left']: targetScroll,
        behavior: 'smooth',
      });
    }

    // Set up event listeners
    viewport.addEventListener('scroll', handleScroll);

    if (scrollbars.vertical) {
      scrollbars.vertical.thumb.addEventListener('mousedown', (e) =>
        handleDragStart(e, 'vertical')
      );
      scrollbars.vertical.track.addEventListener('click', (e) =>
        handleTrackClick(e, 'vertical')
      );
    }

    if (scrollbars.horizontal) {
      scrollbars.horizontal.thumb.addEventListener('mousedown', (e) =>
        handleDragStart(e, 'horizontal')
      );
      scrollbars.horizontal.track.addEventListener('click', (e) =>
        handleTrackClick(e, 'horizontal')
      );
    }

    // Initial update
    requestAnimationFrame(() => {
      if (scrollbars.vertical) updateScrollbar('vertical');
      if (scrollbars.horizontal) updateScrollbar('horizontal');
    });

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      if (scrollbars.vertical) updateScrollbar('vertical');
      if (scrollbars.horizontal) updateScrollbar('horizontal');
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(element);

    // Public API
    const instance = {
      element,
      viewport,

      /**
       * Scroll to a specific position
       */
      scrollTo(options) {
        viewport.scrollTo(options);
      },

      /**
       * Scroll to top
       */
      scrollToTop(behavior = 'smooth') {
        viewport.scrollTo({ top: 0, behavior });
      },

      /**
       * Scroll to bottom
       */
      scrollToBottom(behavior = 'smooth') {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      },

      /**
       * Refresh scrollbar calculations
       */
      refresh() {
        if (scrollbars.vertical) updateScrollbar('vertical');
        if (scrollbars.horizontal) updateScrollbar('horizontal');
      },

      /**
       * Destroy the component
       */
      destroy() {
        viewport.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();

        if (scrollbars.vertical) {
          scrollbars.vertical.track.remove();
        }
        if (scrollbars.horizontal) {
          scrollbars.horizontal.track.remove();
        }

        BrandUI.removeInstance(element, COMPONENT_NAME);
        BrandUI.emit(element, 'scroll-area:destroyed');
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, instance);
    BrandUI.emit(element, 'scroll-area:init');

    return instance;
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initScrollArea);

  // Add to components namespace
  BrandUI.components.ScrollArea = {
    init: initScrollArea,
    getInstance: (element) => BrandUI.getInstance(element, COMPONENT_NAME),
  };
})();


/* === vanilla/js/components/select.js === */
/**
 * Brand UI - Select Component
 * Custom styled dropdown select with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, uid, onClickOutside, Keys, setInstance, getInstance, removeInstance, registerComponent } = BrandUI;

  // SVG Icons
  const CHEVRON_DOWN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

  const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

  /**
   * Select Component
   */
  class Select {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        placeholder: 'Select an option',
        defaultValue: null,
        disabled: false,
        required: false,
        name: null,
        ...options,
      };

      this.isOpen = false;
      this.selectedValue = null;
      this.selectedLabel = null;
      this.highlightedIndex = -1;
      this.items = [];
      this.cleanupClickOutside = null;

      this._init();
    }

    _init() {
      // Parse options from data attributes
      const data = this.element.dataset;
      if (data.placeholder) this.options.placeholder = data.placeholder;
      if (data.value) this.options.defaultValue = data.value;
      if (data.disabled !== undefined) this.options.disabled = true;
      if (data.required !== undefined) this.options.required = true;
      if (data.name) this.options.name = data.name;

      // Build the select structure
      this._buildSelect();
      this._bindEvents();

      // Set initial value
      if (this.options.defaultValue) {
        this.setValue(this.options.defaultValue, { silent: true });
      }

      setInstance(this.element, 'select', this);
    }

    _buildSelect() {
      // Check if content already has structure or needs to be parsed
      const existingTrigger = $('.select-trigger', this.element);
      const existingContent = $('.select-content', this.element);

      if (existingTrigger && existingContent) {
        // Already structured, just enhance
        this.trigger = existingTrigger;
        this.content = existingContent;
        this.valueEl = $('.select-value', this.trigger);

        // Add icon if missing
        if (!$('.select-icon', this.trigger)) {
          const icon = document.createElement('span');
          icon.className = 'select-icon';
          icon.innerHTML = CHEVRON_DOWN_ICON;
          this.trigger.appendChild(icon);
        }

        // Add indicators to items
        $$('.select-item', this.content).forEach((item) => {
          if (!$('.select-item-indicator', item)) {
            const indicator = document.createElement('span');
            indicator.className = 'select-item-indicator';
            indicator.innerHTML = CHECK_ICON;
            item.appendChild(indicator);
          }
        });
      } else {
        // Parse from native select or build from scratch
        this._buildFromNative();
      }

      // Gather items
      this._updateItems();

      // Set ARIA attributes
      const triggerId = this.trigger.id || uid('select-trigger');
      const contentId = this.content.id || uid('select-content');

      this.trigger.id = triggerId;
      this.content.id = contentId;

      this.trigger.setAttribute('role', 'combobox');
      this.trigger.setAttribute('aria-haspopup', 'listbox');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-controls', contentId);
      this.trigger.setAttribute('tabindex', '0');

      if (this.options.disabled) {
        this.trigger.setAttribute('aria-disabled', 'true');
        this.trigger.setAttribute('tabindex', '-1');
      }

      this.content.setAttribute('role', 'listbox');
      this.content.setAttribute('aria-labelledby', triggerId);
      this.content.setAttribute('tabindex', '-1');

      // Set items roles
      this.items.forEach((item, index) => {
        item.setAttribute('role', 'option');
        item.id = item.id || uid('select-item');
        item.setAttribute('aria-selected', 'false');
      });

      // Add hidden input for form submission
      if (this.options.name && !$('input[type="hidden"]', this.element)) {
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'hidden';
        this.hiddenInput.name = this.options.name;
        if (this.options.required) {
          this.hiddenInput.required = true;
        }
        this.element.appendChild(this.hiddenInput);
      } else {
        this.hiddenInput = $('input[type="hidden"]', this.element);
      }

      // Set placeholder
      if (!this.selectedValue && this.valueEl) {
        this.valueEl.textContent = this.options.placeholder;
        this.trigger.setAttribute('data-placeholder', 'true');
      }
    }

    _buildFromNative() {
      const nativeSelect = $('select', this.element);

      if (nativeSelect) {
        // Hide native select
        nativeSelect.style.display = 'none';
        nativeSelect.setAttribute('tabindex', '-1');
        nativeSelect.setAttribute('aria-hidden', 'true');

        // Create custom structure
        this.trigger = document.createElement('button');
        this.trigger.type = 'button';
        this.trigger.className = 'select-trigger';

        this.valueEl = document.createElement('span');
        this.valueEl.className = 'select-value';
        this.trigger.appendChild(this.valueEl);

        const icon = document.createElement('span');
        icon.className = 'select-icon';
        icon.innerHTML = CHEVRON_DOWN_ICON;
        this.trigger.appendChild(icon);

        this.content = document.createElement('div');
        this.content.className = 'select-content';

        // Parse options
        const groups = $$('optgroup', nativeSelect);

        if (groups.length > 0) {
          groups.forEach((group) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'select-group';

            const labelEl = document.createElement('div');
            labelEl.className = 'select-label';
            labelEl.textContent = group.label;
            groupEl.appendChild(labelEl);

            $$('option', group).forEach((option) => {
              const itemEl = this._createItem(option);
              groupEl.appendChild(itemEl);
            });

            this.content.appendChild(groupEl);
          });
        }

        // Parse ungrouped options
        $$(':scope > option', nativeSelect).forEach((option) => {
          const itemEl = this._createItem(option);
          this.content.appendChild(itemEl);
        });

        this.element.appendChild(this.trigger);
        this.element.appendChild(this.content);

        // Sync hidden input
        this.hiddenInput = nativeSelect;
      }
    }

    _createItem(option) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'select-item';
      item.setAttribute('data-value', option.value);
      item.textContent = option.textContent;

      if (option.disabled) {
        item.setAttribute('aria-disabled', 'true');
        item.disabled = true;
      }

      const indicator = document.createElement('span');
      indicator.className = 'select-item-indicator';
      indicator.innerHTML = CHECK_ICON;
      item.appendChild(indicator);

      return item;
    }

    _updateItems() {
      this.items = $$('.select-item:not([aria-disabled="true"]):not([disabled])', this.content);
    }

    _bindEvents() {
      // Trigger click
      on(this.trigger, 'click', (e) => {
        e.preventDefault();
        if (this.options.disabled) return;
        this.toggle();
      });

      // Trigger keyboard
      on(this.trigger, 'keydown', (e) => {
        if (this.options.disabled) return;
        this._handleTriggerKeydown(e);
      });

      // Content keyboard
      on(this.content, 'keydown', (e) => {
        this._handleContentKeydown(e);
      });

      // Item click
      on(this.content, 'click', '.select-item', (e, item) => {
        if (item.hasAttribute('aria-disabled') || item.disabled) return;
        this._selectItem(item);
      });

      // Item hover
      on(this.content, 'mouseover', '.select-item', (e, item) => {
        if (item.hasAttribute('aria-disabled') || item.disabled) return;
        const index = this.items.indexOf(item);
        if (index !== -1) {
          this._highlightItem(index);
        }
      });
    }

    _handleTriggerKeydown(e) {
      switch (e.key) {
        case Keys.ENTER:
        case Keys.SPACE:
        case Keys.ARROW_DOWN:
        case Keys.ARROW_UP:
          e.preventDefault();
          this.open();
          break;
      }
    }

    _handleContentKeydown(e) {
      switch (e.key) {
        case Keys.ARROW_DOWN:
          e.preventDefault();
          this._highlightNext();
          break;

        case Keys.ARROW_UP:
          e.preventDefault();
          this._highlightPrev();
          break;

        case Keys.HOME:
          e.preventDefault();
          this._highlightItem(0);
          break;

        case Keys.END:
          e.preventDefault();
          this._highlightItem(this.items.length - 1);
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          if (this.highlightedIndex >= 0 && this.items[this.highlightedIndex]) {
            this._selectItem(this.items[this.highlightedIndex]);
          }
          break;

        case Keys.ESCAPE:
          e.preventDefault();
          this.close();
          this.trigger.focus();
          break;

        case Keys.TAB:
          this.close();
          break;

        default:
          // Type-ahead search
          if (e.key.length === 1) {
            this._typeAhead(e.key);
          }
          break;
      }
    }

    _typeAhead(char) {
      const searchChar = char.toLowerCase();
      const startIndex = this.highlightedIndex + 1;

      // Search from current position
      for (let i = startIndex; i < this.items.length; i++) {
        if (this.items[i].textContent.trim().toLowerCase().startsWith(searchChar)) {
          this._highlightItem(i);
          return;
        }
      }

      // Wrap around
      for (let i = 0; i < startIndex; i++) {
        if (this.items[i].textContent.trim().toLowerCase().startsWith(searchChar)) {
          this._highlightItem(i);
          return;
        }
      }
    }

    _highlightItem(index) {
      // Remove previous highlight
      this.items.forEach((item) => {
        item.classList.remove('select-item--highlighted');
      });

      this.highlightedIndex = index;

      if (index >= 0 && this.items[index]) {
        const item = this.items[index];
        item.classList.add('select-item--highlighted');
        item.focus();

        // Scroll into view
        item.scrollIntoView({ block: 'nearest' });
      }
    }

    _highlightNext() {
      let next = this.highlightedIndex + 1;
      if (next >= this.items.length) {
        next = 0;
      }
      this._highlightItem(next);
    }

    _highlightPrev() {
      let prev = this.highlightedIndex - 1;
      if (prev < 0) {
        prev = this.items.length - 1;
      }
      this._highlightItem(prev);
    }

    _selectItem(item) {
      const value = item.getAttribute('data-value');
      const label = item.textContent.replace(/\s*$/, '').trim();

      // Update selection state
      this.items.forEach((i) => {
        i.setAttribute('aria-selected', 'false');
      });
      item.setAttribute('aria-selected', 'true');

      this.selectedValue = value;
      this.selectedLabel = label;

      // Update trigger
      if (this.valueEl) {
        this.valueEl.textContent = label;
        this.trigger.removeAttribute('data-placeholder');
      }

      // Update hidden input
      if (this.hiddenInput) {
        this.hiddenInput.value = value;
      }

      // Update activedescendant
      this.trigger.setAttribute('aria-activedescendant', item.id);

      this.close();
      this.trigger.focus();

      emit(this.element, 'change', { value, label });
      emit(this.element, 'select:change', { value, label });
    }

    open() {
      if (this.isOpen || this.options.disabled) return;

      this.isOpen = true;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.classList.add('select-content--open');

      // Highlight selected or first item
      const selectedItem = $('.select-item[aria-selected="true"]', this.content);
      if (selectedItem) {
        const index = this.items.indexOf(selectedItem);
        this._highlightItem(index);
      } else if (this.items.length > 0) {
        this._highlightItem(0);
      }

      // Click outside to close
      this.cleanupClickOutside = onClickOutside(this.element, () => {
        this.close();
      });

      emit(this.element, 'select:open');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.classList.remove('select-content--open');
      this.highlightedIndex = -1;

      // Remove highlights
      this.items.forEach((item) => {
        item.classList.remove('select-item--highlighted');
      });

      if (this.cleanupClickOutside) {
        this.cleanupClickOutside();
        this.cleanupClickOutside = null;
      }

      emit(this.element, 'select:close');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    getValue() {
      return this.selectedValue;
    }

    setValue(value, options = {}) {
      const item = $(`.select-item[data-value="${value}"]`, this.content);
      if (item) {
        const label = item.textContent.replace(/\s*$/, '').trim();

        this.items.forEach((i) => {
          i.setAttribute('aria-selected', 'false');
        });
        item.setAttribute('aria-selected', 'true');

        this.selectedValue = value;
        this.selectedLabel = label;

        if (this.valueEl) {
          this.valueEl.textContent = label;
          this.trigger.removeAttribute('data-placeholder');
        }

        if (this.hiddenInput) {
          this.hiddenInput.value = value;
        }

        this.trigger.setAttribute('aria-activedescendant', item.id);

        if (!options.silent) {
          emit(this.element, 'change', { value, label });
          emit(this.element, 'select:change', { value, label });
        }
      }
    }

    clear() {
      this.items.forEach((i) => {
        i.setAttribute('aria-selected', 'false');
      });

      this.selectedValue = null;
      this.selectedLabel = null;

      if (this.valueEl) {
        this.valueEl.textContent = this.options.placeholder;
        this.trigger.setAttribute('data-placeholder', 'true');
      }

      if (this.hiddenInput) {
        this.hiddenInput.value = '';
      }

      this.trigger.removeAttribute('aria-activedescendant');

      emit(this.element, 'change', { value: null, label: null });
      emit(this.element, 'select:change', { value: null, label: null });
    }

    enable() {
      this.options.disabled = false;
      this.trigger.removeAttribute('aria-disabled');
      this.trigger.setAttribute('tabindex', '0');
      this.trigger.disabled = false;
    }

    disable() {
      this.options.disabled = true;
      this.trigger.setAttribute('aria-disabled', 'true');
      this.trigger.setAttribute('tabindex', '-1');
      this.trigger.disabled = true;
      this.close();
    }

    destroy() {
      this.close();
      removeInstance(this.element, 'select');
    }
  }

  /**
   * Initialize select component
   */
  function initSelect(element) {
    if (getInstance(element, 'select')) {
      return getInstance(element, 'select');
    }
    return new Select(element);
  }

  // Register for auto-init
  registerComponent('select', initSelect);

  // Export to BrandUI
  BrandUI.components.Select = Select;
  BrandUI.components.initSelect = initSelect;
})();


/* === vanilla/js/components/sheet.js === */
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


/* === vanilla/js/components/sidebar.js === */
/**
 * Brand UI - Sidebar Component
 * A responsive collapsible sidebar with mobile sheet support
 */

(function () {
  'use strict';

  const {
    $,
    $$,
    on,
    emit,
    setInstance,
    getInstance,
    removeInstance,
    registerComponent,
    lockScroll,
    unlockScroll,
    createFocusTrap,
    Keys,
  } = BrandUI;

  // Constants
  const SIDEBAR_COOKIE_NAME = 'sidebar_state';
  const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
  const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
  const MOBILE_BREAKPOINT = 768;

  /**
   * Check if viewport is mobile
   */
  function isMobileViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  /**
   * Set cookie
   */
  function setCookie(name, value, maxAge) {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }

  /**
   * Get cookie
   */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }

  /**
   * Sidebar Component
   */
  function Sidebar(wrapper) {
    // Prevent double initialization
    if (getInstance(wrapper, 'sidebar')) {
      return getInstance(wrapper, 'sidebar');
    }

    // Elements
    const sidebar = $('.sidebar', wrapper);
    const overlay = $('.sidebar-overlay', wrapper);
    const mobileSheet = $('.sidebar-mobile', wrapper);
    const triggers = $$('[data-sidebar-trigger]', wrapper);
    const rails = $$('.sidebar-rail', wrapper);

    if (!sidebar) {
      console.error('Sidebar: Missing .sidebar element');
      return null;
    }

    // Configuration
    const config = {
      side: sidebar.dataset.side || 'left',
      variant: sidebar.dataset.variant || 'sidebar',
      collapsible: sidebar.dataset.collapsible || 'offcanvas',
      defaultOpen: sidebar.dataset.defaultOpen !== 'false',
    };

    // State
    let isOpen = getCookie(SIDEBAR_COOKIE_NAME) === 'true' || config.defaultOpen;
    let isMobileOpen = false;
    let isMobile = isMobileViewport();
    let focusTrap = mobileSheet ? createFocusTrap(mobileSheet) : null;
    let cleanupFns = [];

    // Initialize
    init();

    function init() {
      // Set initial state
      updateState();

      // Set wrapper attributes
      wrapper.setAttribute('data-variant', config.variant);

      // Bind events
      bindEvents();

      // Handle initial mobile state
      handleResize();
    }

    function bindEvents() {
      // Trigger buttons
      triggers.forEach((trigger) => {
        cleanupFns.push(on(trigger, 'click', handleTriggerClick));
      });

      // Rails
      rails.forEach((rail) => {
        cleanupFns.push(on(rail, 'click', handleRailClick));
      });

      // Overlay click
      if (overlay) {
        cleanupFns.push(on(overlay, 'click', closeMobile));
      }

      // Keyboard shortcut
      cleanupFns.push(on(document, 'keydown', handleKeydown));

      // Resize handler
      cleanupFns.push(on(window, 'resize', handleResize));

      // Escape key for mobile
      cleanupFns.push(on(document, 'keydown', handleEscape));
    }

    function handleTriggerClick(e) {
      e.preventDefault();
      toggle();
    }

    function handleRailClick(e) {
      e.preventDefault();
      toggle();
    }

    function handleKeydown(e) {
      if (
        e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        toggle();
      }
    }

    function handleEscape(e) {
      if (e.key === Keys.ESCAPE && isMobileOpen) {
        e.preventDefault();
        closeMobile();
      }
    }

    function handleResize() {
      const wasMobile = isMobile;
      isMobile = isMobileViewport();

      // Close mobile sheet when switching to desktop
      if (wasMobile && !isMobile && isMobileOpen) {
        closeMobile();
      }
    }

    function toggle() {
      if (isMobile) {
        if (isMobileOpen) {
          closeMobile();
        } else {
          openMobile();
        }
      } else {
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }

    function open() {
      if (config.collapsible === 'none') return;

      isOpen = true;
      updateState();
      saveToCookie();

      emit(wrapper, 'sidebar:open', { state: 'expanded' });
    }

    function close() {
      if (config.collapsible === 'none') return;

      isOpen = false;
      updateState();
      saveToCookie();

      emit(wrapper, 'sidebar:close', { state: 'collapsed' });
    }

    function openMobile() {
      isMobileOpen = true;

      if (overlay) {
        overlay.setAttribute('data-open', 'true');
      }

      if (mobileSheet) {
        mobileSheet.setAttribute('data-open', 'true');
      }

      lockScroll();

      if (focusTrap) {
        focusTrap.activate();
      }

      emit(wrapper, 'sidebar:open-mobile', { state: 'open' });
    }

    function closeMobile() {
      isMobileOpen = false;

      if (overlay) {
        overlay.setAttribute('data-open', 'false');
      }

      if (mobileSheet) {
        mobileSheet.setAttribute('data-open', 'false');
      }

      unlockScroll();

      if (focusTrap) {
        focusTrap.deactivate();
      }

      emit(wrapper, 'sidebar:close-mobile', { state: 'closed' });
    }

    function updateState() {
      const state = isOpen ? 'expanded' : 'collapsed';
      const collapsibleAttr = isOpen ? '' : config.collapsible;

      sidebar.setAttribute('data-state', state);
      sidebar.setAttribute('data-collapsible', collapsibleAttr);
      wrapper.setAttribute('data-state', state);

      emit(wrapper, 'sidebar:change', {
        state,
        open: isOpen,
        isMobile,
        openMobile: isMobileOpen,
      });
    }

    function saveToCookie() {
      setCookie(SIDEBAR_COOKIE_NAME, isOpen, SIDEBAR_COOKIE_MAX_AGE);
    }

    function setOpen(value) {
      if (isMobile) {
        if (value) {
          openMobile();
        } else {
          closeMobile();
        }
      } else {
        if (value) {
          open();
        } else {
          close();
        }
      }
    }

    function getState() {
      return {
        state: isOpen ? 'expanded' : 'collapsed',
        open: isOpen,
        openMobile: isMobileOpen,
        isMobile,
      };
    }

    function destroy() {
      // Cleanup event listeners
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];

      // Deactivate focus trap
      if (focusTrap) {
        focusTrap.deactivate();
      }

      // Unlock scroll if mobile was open
      if (isMobileOpen) {
        unlockScroll();
      }

      removeInstance(wrapper, 'sidebar');
    }

    // Public API
    const api = {
      element: wrapper,
      toggle,
      open,
      close,
      openMobile,
      closeMobile,
      setOpen,
      getState,
      destroy,
      get isOpen() {
        return isOpen;
      },
      get isMobileOpen() {
        return isMobileOpen;
      },
      get isMobile() {
        return isMobile;
      },
      get state() {
        return isOpen ? 'expanded' : 'collapsed';
      },
    };

    setInstance(wrapper, 'sidebar', api);
    return api;
  }

  /**
   * Sidebar Tooltip - Shows tooltip on collapsed menu buttons
   */
  function SidebarTooltip(button) {
    if (getInstance(button, 'sidebar-tooltip')) {
      return getInstance(button, 'sidebar-tooltip');
    }

    const tooltipText = button.dataset.tooltip;
    if (!tooltipText) return null;

    let tooltip = null;
    let cleanupFns = [];

    init();

    function init() {
      // Create tooltip element
      tooltip = document.createElement('div');
      tooltip.className = 'sidebar-tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);

      // Bind events
      cleanupFns.push(on(button, 'mouseenter', show));
      cleanupFns.push(on(button, 'mouseleave', hide));
      cleanupFns.push(on(button, 'focus', show));
      cleanupFns.push(on(button, 'blur', hide));
    }

    function show() {
      // Only show in collapsed state
      const sidebar = button.closest('.sidebar');
      if (!sidebar || sidebar.dataset.state !== 'collapsed') {
        return;
      }

      const rect = button.getBoundingClientRect();
      const side = sidebar.dataset.side || 'left';

      // Position tooltip
      if (side === 'left') {
        tooltip.style.left = `${rect.right + 8}px`;
      } else {
        tooltip.style.left = `${rect.left - tooltip.offsetWidth - 8}px`;
      }
      tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;

      tooltip.setAttribute('data-visible', 'true');
    }

    function hide() {
      tooltip.setAttribute('data-visible', 'false');
    }

    function destroy() {
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];

      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }

      removeInstance(button, 'sidebar-tooltip');
    }

    const api = {
      element: button,
      show,
      hide,
      destroy,
    };

    setInstance(button, 'sidebar-tooltip', api);
    return api;
  }

  /**
   * Initialize sidebar tooltips
   */
  function initTooltips(context = document) {
    $$('.sidebar-menu-button[data-tooltip]', context).forEach((button) => {
      SidebarTooltip(button);
    });
  }

  /**
   * Auto-initialize sidebars on DOM ready
   */
  function initSidebars(root = document) {
    $$('.sidebar-wrapper[data-sidebar]', root).forEach((wrapper) => {
      if (!getInstance(wrapper, 'sidebar')) {
        Sidebar(wrapper);
      }
    });

    // Also initialize tooltips
    initTooltips(root);
  }

  // Register for auto-initialization
  registerComponent('sidebar', (element) => {
    // If element is the wrapper
    if (element.classList.contains('sidebar-wrapper')) {
      return Sidebar(element);
    }
    // If element is inside a wrapper
    const wrapper = element.closest('.sidebar-wrapper');
    if (wrapper) {
      return Sidebar(wrapper);
    }
    return null;
  });

  // Also init on ready for manual data-sidebar attributes
  BrandUI.ready(() => {
    initSidebars();
  });

  // Export to BrandUI namespace
  BrandUI.components.Sidebar = Sidebar;
  BrandUI.components.SidebarTooltip = SidebarTooltip;
  BrandUI.initSidebars = initSidebars;
  BrandUI.initSidebarTooltips = initTooltips;
})();


/* === vanilla/js/components/slider.js === */
/**
 * Brand UI - Slider Component
 * A draggable slider for selecting numeric values
 */

(function () {
  'use strict';

  const { $, on, emit, getData, setInstance, getInstance, registerComponent, Keys } = BrandUI;

  /**
   * Slider Component
   */
  function Slider(element) {
    // Prevent double initialization
    if (getInstance(element, 'slider')) {
      return getInstance(element, 'slider');
    }

    // Configuration from data attributes
    const config = {
      min: parseFloat(element.dataset.min) || 0,
      max: parseFloat(element.dataset.max) || 100,
      step: parseFloat(element.dataset.step) || 1,
      value: parseFloat(element.dataset.value) || 0,
      disabled: element.dataset.disabled === 'true',
      orientation: element.dataset.orientation || 'horizontal',
    };

    // Internal state
    let currentValue = clamp(config.value, config.min, config.max);
    let isDragging = false;

    // Elements
    const track = element.querySelector('.slider-track');
    const range = element.querySelector('.slider-range');
    const thumb = element.querySelector('.slider-thumb');

    if (!track || !range || !thumb) {
      console.error('Slider: Missing required elements (.slider-track, .slider-range, .slider-thumb)');
      return null;
    }

    // Initialize
    init();

    function init() {
      // Set initial ARIA attributes
      thumb.setAttribute('role', 'slider');
      thumb.setAttribute('tabindex', config.disabled ? '-1' : '0');
      thumb.setAttribute('aria-valuemin', config.min);
      thumb.setAttribute('aria-valuemax', config.max);
      thumb.setAttribute('aria-valuenow', currentValue);
      thumb.setAttribute('aria-orientation', config.orientation);

      if (config.disabled) {
        thumb.setAttribute('aria-disabled', 'true');
      }

      // Set initial position
      updatePosition();

      // Bind events
      bindEvents();
    }

    function bindEvents() {
      // Mouse events on thumb
      on(thumb, 'mousedown', handleDragStart);
      on(thumb, 'touchstart', handleDragStart, { passive: false });

      // Click on track to jump to position
      on(track, 'mousedown', handleTrackClick);
      on(track, 'touchstart', handleTrackClick, { passive: false });

      // Keyboard navigation
      on(thumb, 'keydown', handleKeydown);

      // Document-level events for dragging
      on(document, 'mousemove', handleDragMove);
      on(document, 'touchmove', handleDragMove, { passive: false });
      on(document, 'mouseup', handleDragEnd);
      on(document, 'touchend', handleDragEnd);
    }

    function handleDragStart(e) {
      if (config.disabled) return;

      e.preventDefault();
      isDragging = true;
      thumb.focus();
      element.setAttribute('data-dragging', 'true');
    }

    function handleDragMove(e) {
      if (!isDragging || config.disabled) return;

      e.preventDefault();
      const position = getPositionFromEvent(e);
      const newValue = getValueFromPosition(position);
      setValue(newValue);
    }

    function handleDragEnd() {
      if (!isDragging) return;

      isDragging = false;
      element.removeAttribute('data-dragging');
    }

    function handleTrackClick(e) {
      if (config.disabled) return;
      if (e.target === thumb) return;

      e.preventDefault();
      const position = getPositionFromEvent(e);
      const newValue = getValueFromPosition(position);
      setValue(newValue);
      thumb.focus();
    }

    function handleKeydown(e) {
      if (config.disabled) return;

      const isHorizontal = config.orientation === 'horizontal';
      const stepMultiplier = e.shiftKey ? 10 : 1;
      const step = config.step * stepMultiplier;
      const bigStep = (config.max - config.min) / 10;

      let newValue = currentValue;

      switch (e.key) {
        case Keys.ARROW_RIGHT:
        case Keys.ARROW_UP:
          e.preventDefault();
          newValue = isHorizontal
            ? (e.key === Keys.ARROW_RIGHT ? currentValue + step : currentValue + step)
            : currentValue + step;
          break;

        case Keys.ARROW_LEFT:
        case Keys.ARROW_DOWN:
          e.preventDefault();
          newValue = isHorizontal
            ? (e.key === Keys.ARROW_LEFT ? currentValue - step : currentValue - step)
            : currentValue - step;
          break;

        case Keys.HOME:
          e.preventDefault();
          newValue = config.min;
          break;

        case Keys.END:
          e.preventDefault();
          newValue = config.max;
          break;

        case 'PageUp':
          e.preventDefault();
          newValue = currentValue + bigStep;
          break;

        case 'PageDown':
          e.preventDefault();
          newValue = currentValue - bigStep;
          break;

        default:
          return;
      }

      setValue(newValue);
    }

    function getPositionFromEvent(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = track.getBoundingClientRect();

      if (config.orientation === 'vertical') {
        return 1 - (clientY - rect.top) / rect.height;
      }
      return (clientX - rect.left) / rect.width;
    }

    function getValueFromPosition(position) {
      const range = config.max - config.min;
      const rawValue = position * range + config.min;
      const steppedValue = Math.round(rawValue / config.step) * config.step;
      return clamp(steppedValue, config.min, config.max);
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function updatePosition() {
      const percentage = ((currentValue - config.min) / (config.max - config.min)) * 100;

      if (config.orientation === 'vertical') {
        range.style.height = `${percentage}%`;
        thumb.style.bottom = `${percentage}%`;
        thumb.style.left = '';
        range.style.width = '';
      } else {
        range.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
        thumb.style.bottom = '';
        range.style.height = '';
      }
    }

    function setValue(value) {
      const newValue = clamp(
        Math.round(value / config.step) * config.step,
        config.min,
        config.max
      );

      // Round to handle floating point precision
      const roundedValue = Math.round(newValue * 1000) / 1000;

      if (roundedValue === currentValue) return;

      currentValue = roundedValue;
      element.dataset.value = currentValue;
      thumb.setAttribute('aria-valuenow', currentValue);
      updatePosition();

      // Emit change event
      emit(element, 'slider:change', {
        value: currentValue,
        min: config.min,
        max: config.max,
      });
    }

    function getValue() {
      return currentValue;
    }

    function setDisabled(disabled) {
      config.disabled = disabled;
      element.dataset.disabled = disabled;
      thumb.setAttribute('tabindex', disabled ? '-1' : '0');

      if (disabled) {
        thumb.setAttribute('aria-disabled', 'true');
      } else {
        thumb.removeAttribute('aria-disabled');
      }
    }

    function destroy() {
      element.removeAttribute('data-dragging');
      BrandUI.removeInstance(element, 'slider');
    }

    // Public API
    const api = {
      element,
      getValue,
      setValue,
      setDisabled,
      destroy,
      get value() {
        return currentValue;
      },
      set value(val) {
        setValue(val);
      },
      get min() {
        return config.min;
      },
      get max() {
        return config.max;
      },
      get step() {
        return config.step;
      },
    };

    setInstance(element, 'slider', api);
    return api;
  }

  // Register for auto-initialization
  registerComponent('slider', Slider);

  // Export to BrandUI namespace
  BrandUI.components.Slider = Slider;
})();


/* === vanilla/js/components/switch.js === */
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


/* === vanilla/js/components/tabs.js === */
/**
 * Brand UI - Tabs Component
 * Vanilla JS implementation with keyboard navigation
 */

(function () {
  'use strict';

  const { $, $$, on, emit, setInstance, getInstance, registerComponent, Keys } = BrandUI;

  /**
   * Tabs Component
   */
  class Tabs {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        defaultValue: options.defaultValue || null,
        ...options,
      };

      this.list = null;
      this.triggers = [];
      this.panels = [];
      this.activeIndex = 0;

      this._init();
    }

    _init() {
      this.list = $('.tabs-list', this.element);
      this.triggers = $$('.tabs-trigger', this.element);
      this.panels = $$('.tabs-content', this.element);

      if (this.triggers.length === 0 || this.panels.length === 0) {
        return;
      }

      // Setup ARIA attributes
      this._setupAccessibility();

      // Determine initial active tab
      this._setInitialTab();

      // Bind events
      this._bindEvents();

      // Store instance
      setInstance(this.element, 'tabs', this);
    }

    _setupAccessibility() {
      // Set role on list
      if (this.list) {
        this.list.setAttribute('role', 'tablist');
      }

      this.triggers.forEach((trigger, index) => {
        const panelId = trigger.getAttribute('data-target') ||
                        trigger.getAttribute('aria-controls') ||
                        `tabs-panel-${index}`;
        const triggerId = trigger.id || `tabs-trigger-${index}`;

        trigger.setAttribute('role', 'tab');
        trigger.setAttribute('id', triggerId);
        trigger.setAttribute('aria-controls', panelId);
        trigger.setAttribute('tabindex', '-1');

        // Find corresponding panel
        const panel = this.panels[index] || $(`#${panelId}`, this.element);
        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('id', panelId);
          panel.setAttribute('aria-labelledby', triggerId);
          panel.setAttribute('tabindex', '0');
          panel.hidden = true;
        }
      });
    }

    _setInitialTab() {
      // Check for default value from data attribute or options
      const defaultValue = this.element.dataset.defaultValue || this.options.defaultValue;

      let initialIndex = 0;

      if (defaultValue) {
        // Find trigger with matching value
        const index = this.triggers.findIndex(
          (t) => t.dataset.value === defaultValue
        );
        if (index !== -1) {
          initialIndex = index;
        }
      } else {
        // Check for pre-selected trigger
        const preselectedIndex = this.triggers.findIndex(
          (t) => t.getAttribute('aria-selected') === 'true'
        );
        if (preselectedIndex !== -1) {
          initialIndex = preselectedIndex;
        }
      }

      this._activateTab(initialIndex, false);
    }

    _bindEvents() {
      // Click events on triggers
      this.triggers.forEach((trigger, index) => {
        on(trigger, 'click', (e) => {
          e.preventDefault();
          this._activateTab(index);
        });
      });

      // Keyboard navigation on list
      if (this.list) {
        on(this.list, 'keydown', (e) => this._handleKeydown(e));
      }
    }

    _handleKeydown(e) {
      const currentIndex = this.triggers.findIndex(
        (t) => t === document.activeElement
      );

      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case Keys.ARROW_LEFT:
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = this.triggers.length - 1;
          }
          handled = true;
          break;

        case Keys.ARROW_RIGHT:
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= this.triggers.length) {
            newIndex = 0;
          }
          handled = true;
          break;

        case Keys.HOME:
          e.preventDefault();
          newIndex = 0;
          handled = true;
          break;

        case Keys.END:
          e.preventDefault();
          newIndex = this.triggers.length - 1;
          handled = true;
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          e.preventDefault();
          this._activateTab(currentIndex);
          return;
      }

      if (handled && newIndex !== currentIndex) {
        this.triggers[newIndex].focus();
        this._activateTab(newIndex);
      }
    }

    _activateTab(index, emitEvent = true) {
      if (index < 0 || index >= this.triggers.length) return;

      const prevIndex = this.activeIndex;
      this.activeIndex = index;

      // Update triggers
      this.triggers.forEach((trigger, i) => {
        const isActive = i === index;
        trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
        trigger.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Update panels
      this.panels.forEach((panel, i) => {
        panel.hidden = i !== index;
      });

      // Emit change event
      if (emitEvent && prevIndex !== index) {
        const value = this.triggers[index].dataset.value || index;
        emit(this.element, 'tabs:change', {
          index,
          value,
          trigger: this.triggers[index],
          panel: this.panels[index],
        });
      }
    }

    // Public API

    /**
     * Activate a tab by index
     */
    select(index) {
      this._activateTab(index);
    }

    /**
     * Activate a tab by value
     */
    selectByValue(value) {
      const index = this.triggers.findIndex((t) => t.dataset.value === value);
      if (index !== -1) {
        this._activateTab(index);
      }
    }

    /**
     * Get current active index
     */
    getActiveIndex() {
      return this.activeIndex;
    }

    /**
     * Get current active value
     */
    getActiveValue() {
      return this.triggers[this.activeIndex]?.dataset.value || this.activeIndex;
    }

    /**
     * Destroy the component
     */
    destroy() {
      setInstance(this.element, 'tabs', null);
    }
  }

  // Factory function
  function createTabs(element, options) {
    const existing = getInstance(element, 'tabs');
    if (existing) return existing;
    return new Tabs(element, options);
  }

  // Register for auto-init
  registerComponent('tabs', (element) => {
    createTabs(element);
  });

  // Export
  BrandUI.components.Tabs = Tabs;
  BrandUI.createTabs = createTabs;
})();


/* === vanilla/js/components/toast.js === */
/**
 * Brand UI - Toast Component
 * Notification toasts with stacking, types, and positions
 */

(function () {
  'use strict';

  // ============================================
  // ICONS
  // ============================================

  const ICONS = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    loading: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
  };

  // ============================================
  // DEFAULTS
  // ============================================

  const DEFAULTS = {
    duration: 5000,
    position: 'bottom-right',
    maxToasts: 5,
    closable: true,
    showProgress: false,
  };

  // ============================================
  // TOAST MANAGER
  // ============================================

  class ToastManager {
    constructor() {
      this.containers = {};
      this.toasts = new Map();
      this.config = { ...DEFAULTS };
    }

    /**
     * Configure global defaults
     */
    configure(options) {
      Object.assign(this.config, options);
    }

    /**
     * Get or create container for position
     */
    getContainer(position) {
      if (!this.containers[position]) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('data-position', position);
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(container);
        this.containers[position] = container;
      }
      return this.containers[position];
    }

    /**
     * Show a toast notification
     */
    show(options) {
      const config = {
        ...this.config,
        ...options,
        id: options.id || BrandUI.uid('toast'),
      };

      const container = this.getContainer(config.position);

      // Limit max toasts
      this.enforceMaxToasts(container, config.maxToasts);

      // Create toast element
      const toast = this.createToastElement(config);

      // Add to container
      if (config.position.startsWith('bottom')) {
        container.insertBefore(toast, container.firstChild);
      } else {
        container.appendChild(toast);
      }

      // Store reference
      this.toasts.set(config.id, {
        element: toast,
        config,
        timeoutId: null,
      });

      // Trigger entrance animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.classList.add('toast-visible');
        });
      });

      // Set auto-dismiss timer
      if (config.duration > 0 && config.type !== 'loading') {
        this.startDismissTimer(config.id, config.duration);

        // Show progress bar
        if (config.showProgress) {
          this.startProgressBar(toast, config.duration);
        }
      }

      // Emit event
      BrandUI.emit(toast, 'toast:show', { id: config.id, config });

      return config.id;
    }

    /**
     * Create toast DOM element
     */
    createToastElement(config) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = config.id;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');

      if (config.type) {
        toast.setAttribute('data-type', config.type);
      }

      if (config.showProgress && config.duration > 0) {
        toast.classList.add('has-progress');
      }

      // Build content
      let html = '';

      // Icon
      if (config.type && ICONS[config.type]) {
        html += `<div class="toast-icon">${ICONS[config.type]}</div>`;
      }

      // Content
      html += '<div class="toast-content">';
      if (config.title) {
        html += `<div class="toast-title">${this.escapeHtml(config.title)}</div>`;
      }
      if (config.description) {
        html += `<div class="toast-description">${this.escapeHtml(config.description)}</div>`;
      }
      html += '</div>';

      // Action button
      if (config.action) {
        html += `<button type="button" class="btn btn-outline btn-sm toast-action" data-action="action">${this.escapeHtml(config.action.label)}</button>`;
      }

      // Close button
      if (config.closable) {
        html += `<button type="button" class="btn btn-ghost btn-icon-sm toast-close" data-action="close" aria-label="Close notification">${ICONS.close}</button>`;
      }

      // Progress bar
      if (config.showProgress && config.duration > 0) {
        html += '<div class="toast-progress"></div>';
      }

      toast.innerHTML = html;

      // Bind events
      this.bindToastEvents(toast, config);

      return toast;
    }

    /**
     * Bind toast events
     */
    bindToastEvents(toast, config) {
      // Close button
      const closeBtn = toast.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.dismiss(config.id);
        });
      }

      // Action button
      const actionBtn = toast.querySelector('[data-action="action"]');
      if (actionBtn && config.action && config.action.onClick) {
        actionBtn.addEventListener('click', () => {
          config.action.onClick();
          if (config.action.dismissOnClick !== false) {
            this.dismiss(config.id);
          }
        });
      }

      // Pause on hover
      if (config.duration > 0 && config.type !== 'loading') {
        toast.addEventListener('mouseenter', () => {
          this.pauseDismissTimer(config.id);
        });

        toast.addEventListener('mouseleave', () => {
          this.resumeDismissTimer(config.id);
        });
      }
    }

    /**
     * Dismiss a toast
     */
    dismiss(id) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      const { element, config } = toastData;

      // Clear timer
      this.clearDismissTimer(id);

      // Trigger exit animation
      element.classList.remove('toast-visible');
      element.classList.add('toast-exiting');

      // Emit event
      BrandUI.emit(element, 'toast:dismiss', { id, config });

      // Remove after animation
      BrandUI.afterTransition(element, () => {
        element.remove();
        this.toasts.delete(id);

        // Clean up empty containers
        const container = this.containers[config.position];
        if (container && container.children.length === 0) {
          container.remove();
          delete this.containers[config.position];
        }
      });
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
      for (const id of this.toasts.keys()) {
        this.dismiss(id);
      }
    }

    /**
     * Update a toast
     */
    update(id, options) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      const { element, config } = toastData;

      // Update config
      Object.assign(config, options);

      // Update type
      if (options.type !== undefined) {
        element.setAttribute('data-type', options.type);
        const iconEl = element.querySelector('.toast-icon');
        if (iconEl && ICONS[options.type]) {
          iconEl.innerHTML = ICONS[options.type];
        }
      }

      // Update title
      if (options.title !== undefined) {
        const titleEl = element.querySelector('.toast-title');
        if (titleEl) {
          titleEl.textContent = options.title;
        }
      }

      // Update description
      if (options.description !== undefined) {
        const descEl = element.querySelector('.toast-description');
        if (descEl) {
          descEl.textContent = options.description;
        }
      }

      // Update duration (restart timer)
      if (options.duration !== undefined && options.duration > 0) {
        this.clearDismissTimer(id);
        this.startDismissTimer(id, options.duration);
      }
    }

    /**
     * Promise-based toast for async operations
     */
    promise(promise, options) {
      const id = this.show({
        ...options.loading,
        type: 'loading',
        duration: 0,
        closable: false,
      });

      promise
        .then((result) => {
          const successOptions = typeof options.success === 'function'
            ? options.success(result)
            : options.success;
          this.update(id, {
            ...successOptions,
            type: 'success',
            duration: this.config.duration,
            closable: true,
          });
          this.startDismissTimer(id, this.config.duration);
        })
        .catch((error) => {
          const errorOptions = typeof options.error === 'function'
            ? options.error(error)
            : options.error;
          this.update(id, {
            ...errorOptions,
            type: 'error',
            duration: this.config.duration,
            closable: true,
          });
          this.startDismissTimer(id, this.config.duration);
        });

      return id;
    }

    /**
     * Start dismiss timer
     */
    startDismissTimer(id, duration) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      toastData.duration = duration;
      toastData.remainingTime = duration;
      toastData.startTime = Date.now();

      toastData.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    /**
     * Pause dismiss timer
     */
    pauseDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || !toastData.timeoutId) return;

      clearTimeout(toastData.timeoutId);
      toastData.timeoutId = null;
      toastData.remainingTime = toastData.remainingTime - (Date.now() - toastData.startTime);

      // Pause progress bar
      const progress = toastData.element.querySelector('.toast-progress');
      if (progress) {
        const computedWidth = getComputedStyle(progress).width;
        progress.style.transition = 'none';
        progress.style.width = computedWidth;
      }
    }

    /**
     * Resume dismiss timer
     */
    resumeDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || toastData.remainingTime <= 0) return;

      toastData.startTime = Date.now();
      toastData.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, toastData.remainingTime);

      // Resume progress bar
      const progress = toastData.element.querySelector('.toast-progress');
      if (progress) {
        requestAnimationFrame(() => {
          progress.style.transition = `width ${toastData.remainingTime}ms linear`;
          progress.style.width = '0%';
        });
      }
    }

    /**
     * Clear dismiss timer
     */
    clearDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || !toastData.timeoutId) return;

      clearTimeout(toastData.timeoutId);
      toastData.timeoutId = null;
    }

    /**
     * Start progress bar animation
     */
    startProgressBar(toast, duration) {
      const progress = toast.querySelector('.toast-progress');
      if (!progress) return;

      progress.style.width = '100%';
      requestAnimationFrame(() => {
        progress.style.transition = `width ${duration}ms linear`;
        progress.style.width = '0%';
      });
    }

    /**
     * Enforce max toasts limit
     */
    enforceMaxToasts(container, max) {
      const toasts = container.querySelectorAll('.toast');
      if (toasts.length >= max) {
        // Remove oldest toasts
        const toRemove = toasts.length - max + 1;
        for (let i = 0; i < toRemove; i++) {
          const oldToast = toasts[i];
          if (oldToast && oldToast.id) {
            this.dismiss(oldToast.id);
          }
        }
      }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
      if (typeof str !== 'string') return str;
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    success(title, description, options = {}) {
      return this.show({ title, description, type: 'success', ...options });
    }

    error(title, description, options = {}) {
      return this.show({ title, description, type: 'error', ...options });
    }

    warning(title, description, options = {}) {
      return this.show({ title, description, type: 'warning', ...options });
    }

    info(title, description, options = {}) {
      return this.show({ title, description, type: 'info', ...options });
    }

    loading(title, description, options = {}) {
      return this.show({ title, description, type: 'loading', duration: 0, closable: false, ...options });
    }
  }

  // ============================================
  // INITIALIZE
  // ============================================

  const toast = new ToastManager();

  // Expose to BrandUI
  if (typeof BrandUI !== 'undefined') {
    BrandUI.toast = toast;
    BrandUI.components.toast = ToastManager;
  }

  // Export for ES modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toast };
  }
})();


/* === vanilla/js/components/toggle-group.js === */
/**
 * Toggle Group Component
 * A group of toggle buttons supporting single or multiple selection
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'toggle-group';

  /**
   * ToggleGroup class
   */
  class ToggleGroup {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        type: element.dataset.type || options.type || 'single', // 'single' or 'multiple'
        loop: element.dataset.loop !== 'false',
        orientation: element.dataset.orientation || options.orientation || 'horizontal',
        ...options,
      };

      this.items = [];
      this.selectedValues = new Set();
      this.focusedIndex = 0;

      this._init();
    }

    _init() {
      // Get all toggle items
      this.items = BrandUI.$$('.toggle-group-item', this.element);

      // Set orientation for keyboard navigation
      this.element.setAttribute('data-orientation', this.options.orientation);

      // Initialize items
      this.items.forEach((item, index) => {
        // Set initial state
        const isPressed = item.getAttribute('aria-pressed') === 'true';
        if (isPressed) {
          this.selectedValues.add(this._getItemValue(item, index));
        }

        // Ensure proper attributes
        if (!item.hasAttribute('aria-pressed')) {
          item.setAttribute('aria-pressed', 'false');
        }
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');

        // Inherit variant and size from group if not set on item
        if (!item.dataset.variant && this.element.dataset.variant) {
          item.dataset.variant = this.element.dataset.variant;
        }
        if (!item.dataset.size && this.element.dataset.size) {
          item.dataset.size = this.element.dataset.size;
        }
      });

      this._bindEvents();

      // Store instance
      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    _bindEvents() {
      // Click handling
      BrandUI.on(this.element, 'click', '.toggle-group-item', (e, item) => {
        if (item.disabled || item.hasAttribute('disabled')) return;
        this._handleItemClick(item);
      });

      // Keyboard handling
      this.element.addEventListener('keydown', (e) => this._handleKeydown(e));
    }

    _handleItemClick(item) {
      const index = this.items.indexOf(item);
      const value = this._getItemValue(item, index);
      const isPressed = item.getAttribute('aria-pressed') === 'true';

      if (this.options.type === 'single') {
        // Single selection: deselect others, toggle this one
        if (isPressed) {
          // In single mode, clicking selected item deselects it
          this._setItemPressed(item, false);
          this.selectedValues.delete(value);
        } else {
          // Deselect all others first
          this.items.forEach((i, idx) => {
            const v = this._getItemValue(i, idx);
            if (i !== item && i.getAttribute('aria-pressed') === 'true') {
              this._setItemPressed(i, false);
              this.selectedValues.delete(v);
            }
          });
          // Select this one
          this._setItemPressed(item, true);
          this.selectedValues.add(value);
        }
      } else {
        // Multiple selection: toggle this item
        if (isPressed) {
          this._setItemPressed(item, false);
          this.selectedValues.delete(value);
        } else {
          this._setItemPressed(item, true);
          this.selectedValues.add(value);
        }
      }

      // Update focus management
      this._setFocusedIndex(index);

      // Emit change event
      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? this.getValue() : this.getValues(),
        item,
        pressed: item.getAttribute('aria-pressed') === 'true',
      });
    }

    _handleKeydown(e) {
      const currentIndex = this.items.findIndex(
        (item) => item === document.activeElement
      );
      if (currentIndex === -1) return;

      const isHorizontal = this.options.orientation === 'horizontal';

      switch (e.key) {
        case BrandUI.Keys.ARROW_LEFT:
        case BrandUI.Keys.ARROW_UP:
          if (
            (isHorizontal && e.key === BrandUI.Keys.ARROW_LEFT) ||
            (!isHorizontal && e.key === BrandUI.Keys.ARROW_UP)
          ) {
            e.preventDefault();
            this._moveFocus(currentIndex, -1);
          }
          break;

        case BrandUI.Keys.ARROW_RIGHT:
        case BrandUI.Keys.ARROW_DOWN:
          if (
            (isHorizontal && e.key === BrandUI.Keys.ARROW_RIGHT) ||
            (!isHorizontal && e.key === BrandUI.Keys.ARROW_DOWN)
          ) {
            e.preventDefault();
            this._moveFocus(currentIndex, 1);
          }
          break;

        case BrandUI.Keys.HOME:
          e.preventDefault();
          this._focusItem(0);
          break;

        case BrandUI.Keys.END:
          e.preventDefault();
          this._focusItem(this.items.length - 1);
          break;

        case BrandUI.Keys.ENTER:
        case BrandUI.Keys.SPACE:
          e.preventDefault();
          this._handleItemClick(this.items[currentIndex]);
          break;
      }
    }

    _moveFocus(currentIndex, direction) {
      const enabledItems = this.items.filter(
        (item) => !item.disabled && !item.hasAttribute('disabled')
      );
      const currentEnabledIndex = enabledItems.indexOf(this.items[currentIndex]);

      let newEnabledIndex = currentEnabledIndex + direction;

      if (this.options.loop) {
        if (newEnabledIndex < 0) {
          newEnabledIndex = enabledItems.length - 1;
        } else if (newEnabledIndex >= enabledItems.length) {
          newEnabledIndex = 0;
        }
      } else {
        newEnabledIndex = Math.max(0, Math.min(enabledItems.length - 1, newEnabledIndex));
      }

      const newItem = enabledItems[newEnabledIndex];
      if (newItem) {
        const newIndex = this.items.indexOf(newItem);
        this._focusItem(newIndex);
      }
    }

    _focusItem(index) {
      if (index < 0 || index >= this.items.length) return;

      const item = this.items[index];
      if (item.disabled || item.hasAttribute('disabled')) return;

      this._setFocusedIndex(index);
      item.focus();
    }

    _setFocusedIndex(index) {
      this.focusedIndex = index;
      this.items.forEach((item, i) => {
        item.setAttribute('tabindex', i === index ? '0' : '-1');
      });
    }

    _setItemPressed(item, pressed) {
      item.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    }

    _getItemValue(item, index) {
      return item.dataset.value || item.value || String(index);
    }

    // Public API

    /**
     * Get the selected value (for single type)
     */
    getValue() {
      const values = Array.from(this.selectedValues);
      return values.length > 0 ? values[0] : null;
    }

    /**
     * Get all selected values (for multiple type)
     */
    getValues() {
      return Array.from(this.selectedValues);
    }

    /**
     * Set the selected value(s)
     */
    setValue(value) {
      if (this.options.type === 'single') {
        // Deselect all
        this.items.forEach((item, index) => {
          const v = this._getItemValue(item, index);
          const shouldSelect = v === value;
          this._setItemPressed(item, shouldSelect);
          if (shouldSelect) {
            this.selectedValues.clear();
            this.selectedValues.add(v);
          }
        });
      } else {
        // For multiple, value should be an array
        const values = Array.isArray(value) ? value : [value];
        this.selectedValues.clear();

        this.items.forEach((item, index) => {
          const v = this._getItemValue(item, index);
          const shouldSelect = values.includes(v);
          this._setItemPressed(item, shouldSelect);
          if (shouldSelect) {
            this.selectedValues.add(v);
          }
        });
      }

      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? this.getValue() : this.getValues(),
      });
    }

    /**
     * Clear all selections
     */
    clear() {
      this.selectedValues.clear();
      this.items.forEach((item) => {
        this._setItemPressed(item, false);
      });

      BrandUI.emit(this.element, 'toggle-group:change', {
        value: this.options.type === 'single' ? null : [],
      });
    }

    /**
     * Destroy the component
     */
    destroy() {
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  /**
   * Initialize toggle group
   */
  function initToggleGroup(element) {
    if (BrandUI.getInstance(element, COMPONENT_NAME)) return;
    return new ToggleGroup(element);
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initToggleGroup);

  // Add to BrandUI namespace
  BrandUI.components.ToggleGroup = ToggleGroup;
  BrandUI.components.initToggleGroup = initToggleGroup;

})();


/* === vanilla/js/components/toggle.js === */
/**
 * Brand UI - Toggle Component
 * Vanilla JS implementation
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'toggle';

  /**
   * Toggle component
   */
  class Toggle {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        pressed: element.getAttribute('aria-pressed') === 'true',
        disabled: element.hasAttribute('disabled'),
        onChange: options.onChange || null,
        ...options,
      };

      this._init();
    }

    _init() {
      // Set initial ARIA state
      this.element.setAttribute('aria-pressed', String(this.options.pressed));

      // Bind event handlers
      this._handleClick = this._handleClick.bind(this);
      this._handleKeydown = this._handleKeydown.bind(this);

      // Attach event listeners
      this.element.addEventListener('click', this._handleClick);
      this.element.addEventListener('keydown', this._handleKeydown);

      // Store instance
      BrandUI.setInstance(this.element, COMPONENT_NAME, this);
    }

    _handleClick(e) {
      if (this.options.disabled) {
        e.preventDefault();
        return;
      }

      this.toggle();
    }

    _handleKeydown(e) {
      if (this.options.disabled) return;

      // Toggle on Enter or Space
      if (e.key === BrandUI.Keys.ENTER || e.key === BrandUI.Keys.SPACE) {
        e.preventDefault();
        this.toggle();
      }
    }

    /**
     * Toggle the pressed state
     */
    toggle() {
      this.setPressed(!this.options.pressed);
    }

    /**
     * Set the pressed state
     */
    setPressed(pressed) {
      const wasPressed = this.options.pressed;
      this.options.pressed = pressed;

      // Update ARIA attribute
      this.element.setAttribute('aria-pressed', String(pressed));

      // Emit change event
      if (wasPressed !== pressed) {
        BrandUI.emit(this.element, 'toggle:change', {
          pressed: pressed,
        });

        // Call onChange callback if provided
        if (typeof this.options.onChange === 'function') {
          this.options.onChange(pressed);
        }
      }
    }

    /**
     * Get current pressed state
     */
    isPressed() {
      return this.options.pressed;
    }

    /**
     * Enable the toggle
     */
    enable() {
      this.options.disabled = false;
      this.element.removeAttribute('disabled');
    }

    /**
     * Disable the toggle
     */
    disable() {
      this.options.disabled = true;
      this.element.setAttribute('disabled', '');
    }

    /**
     * Destroy the component
     */
    destroy() {
      this.element.removeEventListener('click', this._handleClick);
      this.element.removeEventListener('keydown', this._handleKeydown);
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }

    /**
     * Static: Get instance from element
     */
    static getInstance(element) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    /**
     * Static: Create or get instance
     */
    static getOrCreateInstance(element, options) {
      return Toggle.getInstance(element) || new Toggle(element, options);
    }
  }

  /**
   * Initialize toggle from element
   */
  function initToggle(element) {
    const data = BrandUI.getData(element);
    return new Toggle(element, {
      pressed: data.pressed === 'true' || data.pressed === true,
    });
  }

  // Register component for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initToggle);

  // Add to BrandUI namespace
  BrandUI.components.Toggle = Toggle;

  // Export for ES modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toggle;
  }
})();


/* === vanilla/js/components/tooltip.js === */
/**
 * Brand UI - Tooltip Component
 * Vanilla JS tooltip with hover/focus, delay, and positioning
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'tooltip';
  const DEFAULT_DELAY = 200;
  const DEFAULT_POSITION = 'top';

  /**
   * Tooltip class
   */
  class Tooltip {
    constructor(element, options = {}) {
      this.element = element;
      this.trigger = element.querySelector('.tooltip-trigger');
      this.content = element.querySelector('.tooltip-content');

      if (!this.trigger || !this.content) {
        console.warn('Tooltip: Missing .tooltip-trigger or .tooltip-content');
        return;
      }

      // Options from data attributes or passed options
      const data = BrandUI.getData(element, 'tooltip');
      this.options = {
        delay: parseInt(data.delay ?? options.delay ?? DEFAULT_DELAY, 10),
        position: data.position ?? options.position ?? DEFAULT_POSITION,
      };

      this.showTimeout = null;
      this.hideTimeout = null;
      this.isVisible = false;

      this._init();
      BrandUI.setInstance(element, COMPONENT_NAME, this);
    }

    _init() {
      // Set position data attribute
      this.content.setAttribute('data-position', this.options.position);

      // Generate IDs for accessibility
      const id = BrandUI.uid('tooltip');
      this.content.id = id;
      this.trigger.setAttribute('aria-describedby', id);

      // Bind events
      this._bindEvents();
    }

    _bindEvents() {
      // Mouse events
      this.trigger.addEventListener('mouseenter', () => this._scheduleShow());
      this.trigger.addEventListener('mouseleave', () => this._scheduleHide());

      // Focus events
      this.trigger.addEventListener('focus', () => this._scheduleShow());
      this.trigger.addEventListener('blur', () => this._scheduleHide());

      // Escape to hide
      this.trigger.addEventListener('keydown', (e) => {
        if (e.key === BrandUI.Keys.ESCAPE && this.isVisible) {
          this.hide();
        }
      });
    }

    _scheduleShow() {
      clearTimeout(this.hideTimeout);
      this.showTimeout = setTimeout(() => this.show(), this.options.delay);
    }

    _scheduleHide() {
      clearTimeout(this.showTimeout);
      this.hideTimeout = setTimeout(() => this.hide(), 100);
    }

    show() {
      if (this.isVisible) return;

      this.isVisible = true;
      this.element.classList.add('is-visible');
      BrandUI.emit(this.element, 'tooltip:show');
    }

    hide() {
      if (!this.isVisible) return;

      this.isVisible = false;
      this.element.classList.remove('is-visible');
      BrandUI.emit(this.element, 'tooltip:hide');
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    setPosition(position) {
      this.options.position = position;
      this.content.setAttribute('data-position', position);
    }

    destroy() {
      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
      this.element.classList.remove('is-visible');
      BrandUI.removeInstance(this.element, COMPONENT_NAME);
    }
  }

  /**
   * Factory function
   */
  function createTooltip(element, options) {
    const existing = BrandUI.getInstance(element, COMPONENT_NAME);
    if (existing) return existing;
    return new Tooltip(element, options);
  }

  // Register for auto-init
  BrandUI.registerComponent(COMPONENT_NAME, createTooltip);

  // Add to components namespace
  BrandUI.components.Tooltip = Tooltip;
  BrandUI.components.createTooltip = createTooltip;
})();


