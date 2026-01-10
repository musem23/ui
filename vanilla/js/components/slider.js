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
