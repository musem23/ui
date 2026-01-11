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
