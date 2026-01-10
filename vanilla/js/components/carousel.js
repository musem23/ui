/**
 * Brand UI - Carousel Component
 * Slide carousel with navigation, dots, touch/swipe, and keyboard support
 */

(function () {
  'use strict';

  const { $, $$, on, emit, getData, setInstance, getInstance, registerComponent } = BrandUI;

  /**
   * Default options
   */
  const DEFAULTS = {
    loop: false,
    autoplay: false,
    autoplayInterval: 5000,
    orientation: 'horizontal',
    showDots: false,
    swipeThreshold: 50,
  };

  /**
   * Arrow SVG icons
   */
  const ARROW_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
  const ARROW_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></svg>`;

  /**
   * Carousel class
   */
  class Carousel {
    constructor(element, options = {}) {
      this.element = element;
      this.options = { ...DEFAULTS, ...getData(element, 'carousel'), ...options };
      this.currentIndex = 0;
      this.autoplayTimer = null;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.currentX = 0;
      this.currentY = 0;

      this._init();
    }

    _init() {
      // Get elements
      this.content = $('.carousel-content', this.element);
      this.track = $('.carousel-track', this.element);
      this.items = $$('.carousel-item', this.element);
      this.prevBtn = $('.carousel-previous', this.element);
      this.nextBtn = $('.carousel-next', this.element);
      this.dotsContainer = $('.carousel-dots', this.element);
      this.dots = [];

      if (!this.track || this.items.length === 0) {
        console.warn('Carousel: Missing track or items');
        return;
      }

      // Set orientation attribute
      this.element.setAttribute('data-orientation', this.options.orientation);

      // Create navigation if not present
      if (!this.prevBtn) {
        this._createNavigation();
      }

      // Create dots if enabled and not present
      if (this.options.showDots && !this.dotsContainer) {
        this._createDots();
      } else if (this.dotsContainer) {
        this.dots = $$('.carousel-dot', this.dotsContainer);
      }

      // Set ARIA attributes
      this.element.setAttribute('role', 'region');
      this.element.setAttribute('aria-roledescription', 'carousel');
      this.element.setAttribute('tabindex', '0');

      this.items.forEach((item, index) => {
        item.setAttribute('role', 'group');
        item.setAttribute('aria-roledescription', 'slide');
        item.setAttribute('aria-label', `Slide ${index + 1} of ${this.items.length}`);
      });

      // Bind events
      this._bindEvents();

      // Initial state
      this._updateState();

      // Start autoplay if enabled
      if (this.options.autoplay) {
        this._startAutoplay();
      }

      // Store instance
      setInstance(this.element, 'carousel', this);
    }

    _createNavigation() {
      // Previous button
      this.prevBtn = document.createElement('button');
      this.prevBtn.type = 'button';
      this.prevBtn.className = 'carousel-previous';
      this.prevBtn.innerHTML = `${ARROW_LEFT}<span class="sr-only">Previous slide</span>`;
      this.element.appendChild(this.prevBtn);

      // Next button
      this.nextBtn = document.createElement('button');
      this.nextBtn.type = 'button';
      this.nextBtn.className = 'carousel-next';
      this.nextBtn.innerHTML = `${ARROW_RIGHT}<span class="sr-only">Next slide</span>`;
      this.element.appendChild(this.nextBtn);
    }

    _createDots() {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'carousel-dots';
      this.dotsContainer.setAttribute('role', 'tablist');
      this.dotsContainer.setAttribute('aria-label', 'Carousel navigation');

      this.items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      this.element.appendChild(this.dotsContainer);
    }

    _bindEvents() {
      // Navigation buttons
      if (this.prevBtn) {
        on(this.prevBtn, 'click', () => this.prev());
      }
      if (this.nextBtn) {
        on(this.nextBtn, 'click', () => this.next());
      }

      // Dots
      this.dots.forEach((dot, index) => {
        on(dot, 'click', () => this.goTo(index));
      });

      // Keyboard navigation
      on(this.element, 'keydown', (e) => this._handleKeydown(e));

      // Touch/swipe support
      on(this.content, 'touchstart', (e) => this._handleTouchStart(e), { passive: true });
      on(this.content, 'touchmove', (e) => this._handleTouchMove(e), { passive: false });
      on(this.content, 'touchend', (e) => this._handleTouchEnd(e));

      // Mouse drag support
      on(this.content, 'mousedown', (e) => this._handleMouseDown(e));
      on(document, 'mousemove', (e) => this._handleMouseMove(e));
      on(document, 'mouseup', (e) => this._handleMouseUp(e));

      // Pause autoplay on hover/focus
      if (this.options.autoplay) {
        on(this.element, 'mouseenter', () => this._stopAutoplay());
        on(this.element, 'mouseleave', () => this._startAutoplay());
        on(this.element, 'focusin', () => this._stopAutoplay());
        on(this.element, 'focusout', () => this._startAutoplay());
      }
    }

    _handleKeydown(e) {
      const isHorizontal = this.options.orientation === 'horizontal';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

      switch (e.key) {
        case prevKey:
          e.preventDefault();
          this.prev();
          break;
        case nextKey:
          e.preventDefault();
          this.next();
          break;
        case 'Home':
          e.preventDefault();
          this.goTo(0);
          break;
        case 'End':
          e.preventDefault();
          this.goTo(this.items.length - 1);
          break;
      }
    }

    _handleTouchStart(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.element.classList.add('is-dragging');
    }

    _handleTouchMove(e) {
      if (!this.isDragging) return;

      this.currentX = e.touches[0].clientX;
      this.currentY = e.touches[0].clientY;

      const diffX = this.startX - this.currentX;
      const diffY = this.startY - this.currentY;
      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal ? diffX : diffY;

      // Prevent vertical scroll when swiping horizontally
      if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
      }
    }

    _handleTouchEnd() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.element.classList.remove('is-dragging');

      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal
        ? this.startX - this.currentX
        : this.startY - this.currentY;

      if (Math.abs(diff) > this.options.swipeThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    _handleMouseDown(e) {
      // Only handle left mouse button
      if (e.button !== 0) return;

      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.element.classList.add('is-dragging');
      e.preventDefault(); // Prevent text selection
    }

    _handleMouseMove(e) {
      if (!this.isDragging) return;

      this.currentX = e.clientX;
      this.currentY = e.clientY;
    }

    _handleMouseUp() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.element.classList.remove('is-dragging');

      const isHorizontal = this.options.orientation === 'horizontal';
      const diff = isHorizontal
        ? this.startX - this.currentX
        : this.startY - this.currentY;

      if (Math.abs(diff) > this.options.swipeThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    _startAutoplay() {
      if (this.autoplayTimer) return;

      this.autoplayTimer = setInterval(() => {
        if (this.options.loop || this.currentIndex < this.items.length - 1) {
          this.next();
        } else {
          this.goTo(0);
        }
      }, this.options.autoplayInterval);
    }

    _stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    _updateState() {
      // Update track position
      const offset = this.currentIndex * 100;
      if (this.options.orientation === 'horizontal') {
        this.track.style.transform = `translateX(-${offset}%)`;
      } else {
        this.track.style.transform = `translateY(-${offset}%)`;
      }

      // Update button states
      const canPrev = this.options.loop || this.currentIndex > 0;
      const canNext = this.options.loop || this.currentIndex < this.items.length - 1;

      if (this.prevBtn) {
        this.prevBtn.disabled = !canPrev;
        this.prevBtn.setAttribute('aria-disabled', !canPrev);
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = !canNext;
        this.nextBtn.setAttribute('aria-disabled', !canNext);
      }

      // Update dots
      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive);
      });

      // Update live region for screen readers
      this.element.setAttribute('aria-live', 'polite');
    }

    /**
     * Go to previous slide
     */
    prev() {
      let newIndex = this.currentIndex - 1;

      if (newIndex < 0) {
        newIndex = this.options.loop ? this.items.length - 1 : 0;
      }

      this.goTo(newIndex);
    }

    /**
     * Go to next slide
     */
    next() {
      let newIndex = this.currentIndex + 1;

      if (newIndex >= this.items.length) {
        newIndex = this.options.loop ? 0 : this.items.length - 1;
      }

      this.goTo(newIndex);
    }

    /**
     * Go to specific slide
     */
    goTo(index) {
      if (index < 0 || index >= this.items.length) return;
      if (index === this.currentIndex) return;

      const prevIndex = this.currentIndex;
      this.currentIndex = index;

      this._updateState();

      emit(this.element, 'carousel:change', {
        currentIndex: this.currentIndex,
        previousIndex: prevIndex,
      });
    }

    /**
     * Get current slide index
     */
    getCurrentIndex() {
      return this.currentIndex;
    }

    /**
     * Get total number of slides
     */
    getCount() {
      return this.items.length;
    }

    /**
     * Destroy instance
     */
    destroy() {
      this._stopAutoplay();
      this.element.removeAttribute('role');
      this.element.removeAttribute('aria-roledescription');
      this.element.removeAttribute('tabindex');
      this.element.removeAttribute('aria-live');
      this.track.style.transform = '';
    }
  }

  /**
   * Initialize carousel
   */
  function initCarousel(element, options) {
    const existing = getInstance(element, 'carousel');
    if (existing) return existing;

    return new Carousel(element, options);
  }

  // Register for auto-initialization
  registerComponent('carousel', initCarousel);

  // Export
  BrandUI.components.Carousel = Carousel;
  BrandUI.Carousel = initCarousel;
})();
