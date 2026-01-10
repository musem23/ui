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
