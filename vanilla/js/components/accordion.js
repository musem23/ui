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
