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
