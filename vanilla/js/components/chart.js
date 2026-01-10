/**
 * Brand UI - Chart Component
 * Vanilla JS implementation for chart container, tooltip, and legend management
 */

(function () {
  'use strict';

  const { $, $$, on, emit, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Chart Component
   * Provides container styling, tooltip management, and legend interaction
   */
  class Chart {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        colors: options.colors || {},
        tooltipEnabled: options.tooltipEnabled !== false,
        legendInteractive: options.legendInteractive !== false,
        ...options,
      };

      this.tooltip = null;
      this.legend = null;
      this.legendItems = [];
      this.activeDatasets = new Set();

      this._init();
    }

    _init() {
      // Generate unique chart ID
      this._chartId = this.element.dataset.chart || `chart-${Date.now()}`;
      this.element.dataset.chart = this._chartId;

      // Apply color configuration as CSS variables
      this._applyColors();

      // Initialize tooltip
      this.tooltip = $('.chart-tooltip', this.element);
      if (this.tooltip) {
        this._initTooltip();
      }

      // Initialize legend
      this.legend = $('.chart-legend', this.element);
      if (this.legend) {
        this._initLegend();
      }

      // Bind events for data elements
      this._bindDataEvents();

      // Store instance
      setInstance(this.element, 'chart', this);
    }

    _applyColors() {
      const { colors } = this.options;

      // Apply color variables from config
      Object.entries(colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          this.element.style.setProperty(`--color-${key}`, value);
        } else if (value && typeof value === 'object') {
          // Handle theme-based colors
          const isDark = document.documentElement.classList.contains('dark');
          const color = isDark ? value.dark : value.light;
          if (color) {
            this.element.style.setProperty(`--color-${key}`, color);
          }
        }
      });
    }

    _initTooltip() {
      // Tooltip is managed externally or via showTooltip/hideTooltip
      this.tooltip.setAttribute('data-visible', 'false');
    }

    _initLegend() {
      this.legendItems = $$('.chart-legend-item', this.legend);

      // Initialize all datasets as active
      this.legendItems.forEach((item, index) => {
        const dataKey = item.dataset.key || `data-${index}`;
        this.activeDatasets.add(dataKey);
        item.setAttribute('data-active', 'true');
      });

      // Bind click events for legend interaction
      if (this.options.legendInteractive) {
        this.legendItems.forEach((item) => {
          on(item, 'click', () => this._handleLegendClick(item));
        });
      }
    }

    _handleLegendClick(item) {
      const dataKey = item.dataset.key;
      if (!dataKey) return;

      const isActive = item.getAttribute('data-active') === 'true';

      if (isActive) {
        this.activeDatasets.delete(dataKey);
        item.setAttribute('data-active', 'false');
      } else {
        this.activeDatasets.add(dataKey);
        item.setAttribute('data-active', 'true');
      }

      // Emit event for external handling
      emit(this.element, 'chart:legendToggle', {
        key: dataKey,
        active: !isActive,
        activeDatasets: Array.from(this.activeDatasets),
      });
    }

    _bindDataEvents() {
      // Bind hover events to data elements for tooltip
      const dataElements = $$('[data-chart-value]', this.element);

      dataElements.forEach((el) => {
        on(el, 'mouseenter', (e) => this._handleDataHover(e, el));
        on(el, 'mouseleave', () => this.hideTooltip());
        on(el, 'mousemove', (e) => this._updateTooltipPosition(e));
      });
    }

    _handleDataHover(event, element) {
      if (!this.tooltip || !this.options.tooltipEnabled) return;

      const data = {
        label: element.dataset.chartLabel,
        value: element.dataset.chartValue,
        name: element.dataset.chartName,
        color: element.dataset.chartColor || getComputedStyle(element).fill,
      };

      this.showTooltip(data, event);
    }

    _updateTooltipPosition(event) {
      if (!this.tooltip) return;

      const rect = this.element.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();

      let x = event.clientX - rect.left + 10;
      let y = event.clientY - rect.top + 10;

      // Keep tooltip within bounds
      if (x + tooltipRect.width > rect.width) {
        x = event.clientX - rect.left - tooltipRect.width - 10;
      }
      if (y + tooltipRect.height > rect.height) {
        y = event.clientY - rect.top - tooltipRect.height - 10;
      }

      this.tooltip.style.left = `${x}px`;
      this.tooltip.style.top = `${y}px`;
    }

    // Public API

    /**
     * Show tooltip with data
     */
    showTooltip(data, event) {
      if (!this.tooltip) return;

      // Update tooltip content
      const content = this.tooltip.querySelector('.chart-tooltip-content');
      if (content) {
        this._renderTooltipContent(content, data);
      }

      // Position tooltip
      if (event) {
        this._updateTooltipPosition(event);
      }

      // Show tooltip
      this.tooltip.setAttribute('data-visible', 'true');

      emit(this.element, 'chart:tooltipShow', { data });
    }

    _renderTooltipContent(container, data) {
      // Clear existing content
      container.innerHTML = '';

      // Create label
      if (data.label) {
        const label = document.createElement('div');
        label.className = 'chart-tooltip-label';
        label.textContent = data.label;
        container.appendChild(label);
      }

      // Create items container
      const items = document.createElement('div');
      items.className = 'chart-tooltip-items';

      // Handle single item or array
      const dataItems = Array.isArray(data.items) ? data.items : [data];

      dataItems.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'chart-tooltip-item';

        // Indicator
        if (item.color) {
          const indicator = document.createElement('div');
          indicator.className = 'chart-tooltip-indicator chart-tooltip-indicator-dot';
          indicator.style.setProperty('--color-bg', item.color);
          indicator.style.setProperty('--color-border', item.color);
          itemEl.appendChild(indicator);
        }

        // Content
        const contentEl = document.createElement('div');
        contentEl.className = 'chart-tooltip-item-content';

        if (item.name) {
          const nameEl = document.createElement('span');
          nameEl.className = 'chart-tooltip-item-name';
          nameEl.textContent = item.name;
          contentEl.appendChild(nameEl);
        }

        if (item.value !== undefined) {
          const valueEl = document.createElement('span');
          valueEl.className = 'chart-tooltip-item-value';
          valueEl.textContent = typeof item.value === 'number'
            ? item.value.toLocaleString()
            : item.value;
          contentEl.appendChild(valueEl);
        }

        itemEl.appendChild(contentEl);
        items.appendChild(itemEl);
      });

      container.appendChild(items);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
      if (!this.tooltip) return;
      this.tooltip.setAttribute('data-visible', 'false');
      emit(this.element, 'chart:tooltipHide');
    }

    /**
     * Toggle legend item
     */
    toggleLegendItem(key, active) {
      const item = this.legendItems.find((i) => i.dataset.key === key);
      if (!item) return;

      if (active) {
        this.activeDatasets.add(key);
      } else {
        this.activeDatasets.delete(key);
      }

      item.setAttribute('data-active', active ? 'true' : 'false');

      emit(this.element, 'chart:legendToggle', {
        key,
        active,
        activeDatasets: Array.from(this.activeDatasets),
      });
    }

    /**
     * Get active datasets
     */
    getActiveDatasets() {
      return Array.from(this.activeDatasets);
    }

    /**
     * Set chart colors dynamically
     */
    setColors(colors) {
      this.options.colors = { ...this.options.colors, ...colors };
      this._applyColors();
    }

    /**
     * Update chart configuration
     */
    update(options) {
      Object.assign(this.options, options);
      if (options.colors) {
        this._applyColors();
      }
    }

    /**
     * Destroy the component
     */
    destroy() {
      setInstance(this.element, 'chart', null);
    }
  }

  // Factory function
  function createChart(element, options) {
    const existing = getInstance(element, 'chart');
    if (existing) return existing;
    return new Chart(element, options);
  }

  // Register for auto-init
  registerComponent('chart', (element) => {
    createChart(element);
  });

  // Export
  BrandUI.components.Chart = Chart;
  BrandUI.createChart = createChart;
})();
