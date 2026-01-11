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
