/**
 * Brand UI v1.0.0
 * Vanilla JavaScript Component Library
 * https://github.com/your-repo/brand-ui
 */

/* === js/core.js === */
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
        const cleanKey = prefix ? key.slice(prefix.length).toLowerCase() : key;
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


