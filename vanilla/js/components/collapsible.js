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
