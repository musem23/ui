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
