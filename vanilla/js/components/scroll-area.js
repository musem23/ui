/**
 * Brand UI - Scroll Area Component
 * Custom scrollbar with support for vertical and horizontal scrolling
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'scroll-area';

  /**
   * Initialize a scroll area component
   */
  function initScrollArea(element) {
    // Prevent double initialization
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const viewport = BrandUI.$('.scroll-area-viewport', element);
    if (!viewport) {
      console.warn('ScrollArea: viewport element not found');
      return null;
    }

    const options = BrandUI.getData(element, 'scrollArea');
    const orientation = options.orientation || 'vertical'; // 'vertical', 'horizontal', 'both'

    const state = {
      isDragging: false,
      dragAxis: null,
      startPosition: 0,
      startScroll: 0,
      scrollTimeout: null,
    };

    // Create scrollbars based on orientation
    const scrollbars = {};

    if (orientation === 'vertical' || orientation === 'both') {
      scrollbars.vertical = createScrollbar('vertical');
      element.appendChild(scrollbars.vertical.track);
    }

    if (orientation === 'horizontal' || orientation === 'both') {
      scrollbars.horizontal = createScrollbar('horizontal');
      element.appendChild(scrollbars.horizontal.track);
    }

    // Add corner if both scrollbars are present
    if (scrollbars.vertical && scrollbars.horizontal) {
      const corner = document.createElement('div');
      corner.className = 'scroll-area-corner';
      element.appendChild(corner);
    }

    /**
     * Create a scrollbar element
     */
    function createScrollbar(axis) {
      const track = document.createElement('div');
      track.className = 'scroll-area-scrollbar';
      track.setAttribute('data-orientation', axis);

      const thumb = document.createElement('div');
      thumb.className = 'scroll-area-thumb';
      track.appendChild(thumb);

      return { track, thumb };
    }

    /**
     * Update scrollbar thumb size and position
     */
    function updateScrollbar(axis) {
      const scrollbar = scrollbars[axis];
      if (!scrollbar) return;

      const { track, thumb } = scrollbar;
      const isVertical = axis === 'vertical';

      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;
      const scrollPosition = isVertical ? viewport.scrollTop : viewport.scrollLeft;

      // Calculate thumb size (minimum 20px)
      const ratio = viewportSize / contentSize;
      const trackSize = isVertical ? track.clientHeight : track.clientWidth;
      const thumbSize = Math.max(ratio * trackSize, 20);

      // Calculate thumb position
      const scrollRatio = scrollPosition / (contentSize - viewportSize);
      const maxThumbPosition = trackSize - thumbSize;
      const thumbPosition = scrollRatio * maxThumbPosition;

      // Apply styles
      if (isVertical) {
        thumb.style.height = `${thumbSize}px`;
        thumb.style.width = '';
        thumb.style.transform = `translateY(${thumbPosition}px)`;
      } else {
        thumb.style.width = `${thumbSize}px`;
        thumb.style.height = '';
        thumb.style.transform = `translateX(${thumbPosition}px)`;
      }

      // Hide scrollbar if content fits
      track.style.display = ratio >= 1 ? 'none' : 'flex';
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
      if (scrollbars.vertical) {
        updateScrollbar('vertical');
        scrollbars.vertical.track.setAttribute('data-scrolling', 'true');
      }
      if (scrollbars.horizontal) {
        updateScrollbar('horizontal');
        scrollbars.horizontal.track.setAttribute('data-scrolling', 'true');
      }

      // Remove scrolling indicator after delay
      clearTimeout(state.scrollTimeout);
      state.scrollTimeout = setTimeout(() => {
        if (scrollbars.vertical) {
          scrollbars.vertical.track.setAttribute('data-scrolling', 'false');
        }
        if (scrollbars.horizontal) {
          scrollbars.horizontal.track.setAttribute('data-scrolling', 'false');
        }
      }, 1000);

      BrandUI.emit(element, 'scroll-area:scroll', {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
      });
    }

    /**
     * Handle thumb drag start
     */
    function handleDragStart(e, axis) {
      e.preventDefault();
      state.isDragging = true;
      state.dragAxis = axis;

      const scrollbar = scrollbars[axis];
      scrollbar.thumb.setAttribute('data-dragging', 'true');

      const isVertical = axis === 'vertical';
      state.startPosition = isVertical ? e.clientY : e.clientX;
      state.startScroll = isVertical ? viewport.scrollTop : viewport.scrollLeft;

      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    /**
     * Handle thumb drag movement
     */
    function handleDragMove(e) {
      if (!state.isDragging) return;

      const axis = state.dragAxis;
      const scrollbar = scrollbars[axis];
      const isVertical = axis === 'vertical';

      const currentPosition = isVertical ? e.clientY : e.clientX;
      const delta = currentPosition - state.startPosition;

      const trackSize = isVertical
        ? scrollbar.track.clientHeight
        : scrollbar.track.clientWidth;
      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;

      const scrollRatio = delta / trackSize;
      const scrollDelta = scrollRatio * contentSize;

      if (isVertical) {
        viewport.scrollTop = state.startScroll + scrollDelta;
      } else {
        viewport.scrollLeft = state.startScroll + scrollDelta;
      }
    }

    /**
     * Handle thumb drag end
     */
    function handleDragEnd() {
      if (!state.isDragging) return;

      const scrollbar = scrollbars[state.dragAxis];
      scrollbar.thumb.setAttribute('data-dragging', 'false');

      state.isDragging = false;
      state.dragAxis = null;

      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    }

    /**
     * Handle track click (jump to position)
     */
    function handleTrackClick(e, axis) {
      const scrollbar = scrollbars[axis];
      if (e.target === scrollbar.thumb) return;

      const isVertical = axis === 'vertical';
      const rect = scrollbar.track.getBoundingClientRect();
      const clickPosition = isVertical
        ? e.clientY - rect.top
        : e.clientX - rect.left;
      const trackSize = isVertical ? rect.height : rect.width;
      const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
      const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;

      const scrollRatio = clickPosition / trackSize;
      const targetScroll = scrollRatio * contentSize - viewportSize / 2;

      viewport.scrollTo({
        [isVertical ? 'top' : 'left']: targetScroll,
        behavior: 'smooth',
      });
    }

    // Set up event listeners
    viewport.addEventListener('scroll', handleScroll);

    if (scrollbars.vertical) {
      scrollbars.vertical.thumb.addEventListener('mousedown', (e) =>
        handleDragStart(e, 'vertical')
      );
      scrollbars.vertical.track.addEventListener('click', (e) =>
        handleTrackClick(e, 'vertical')
      );
    }

    if (scrollbars.horizontal) {
      scrollbars.horizontal.thumb.addEventListener('mousedown', (e) =>
        handleDragStart(e, 'horizontal')
      );
      scrollbars.horizontal.track.addEventListener('click', (e) =>
        handleTrackClick(e, 'horizontal')
      );
    }

    // Initial update
    requestAnimationFrame(() => {
      if (scrollbars.vertical) updateScrollbar('vertical');
      if (scrollbars.horizontal) updateScrollbar('horizontal');
    });

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      if (scrollbars.vertical) updateScrollbar('vertical');
      if (scrollbars.horizontal) updateScrollbar('horizontal');
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(element);

    // Public API
    const instance = {
      element,
      viewport,

      /**
       * Scroll to a specific position
       */
      scrollTo(options) {
        viewport.scrollTo(options);
      },

      /**
       * Scroll to top
       */
      scrollToTop(behavior = 'smooth') {
        viewport.scrollTo({ top: 0, behavior });
      },

      /**
       * Scroll to bottom
       */
      scrollToBottom(behavior = 'smooth') {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      },

      /**
       * Refresh scrollbar calculations
       */
      refresh() {
        if (scrollbars.vertical) updateScrollbar('vertical');
        if (scrollbars.horizontal) updateScrollbar('horizontal');
      },

      /**
       * Destroy the component
       */
      destroy() {
        viewport.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();

        if (scrollbars.vertical) {
          scrollbars.vertical.track.remove();
        }
        if (scrollbars.horizontal) {
          scrollbars.horizontal.track.remove();
        }

        BrandUI.removeInstance(element, COMPONENT_NAME);
        BrandUI.emit(element, 'scroll-area:destroyed');
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, instance);
    BrandUI.emit(element, 'scroll-area:init');

    return instance;
  }

  // Register for auto-initialization
  BrandUI.registerComponent(COMPONENT_NAME, initScrollArea);

  // Add to components namespace
  BrandUI.components.ScrollArea = {
    init: initScrollArea,
    getInstance: (element) => BrandUI.getInstance(element, COMPONENT_NAME),
  };
})();
