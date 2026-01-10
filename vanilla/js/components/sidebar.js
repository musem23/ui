/**
 * Brand UI - Sidebar Component
 * A responsive collapsible sidebar with mobile sheet support
 */

(function () {
  'use strict';

  const {
    $,
    $$,
    on,
    emit,
    setInstance,
    getInstance,
    removeInstance,
    registerComponent,
    lockScroll,
    unlockScroll,
    createFocusTrap,
    Keys,
  } = BrandUI;

  // Constants
  const SIDEBAR_COOKIE_NAME = 'sidebar_state';
  const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
  const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
  const MOBILE_BREAKPOINT = 768;

  /**
   * Check if viewport is mobile
   */
  function isMobileViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  /**
   * Set cookie
   */
  function setCookie(name, value, maxAge) {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }

  /**
   * Get cookie
   */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }

  /**
   * Sidebar Component
   */
  function Sidebar(wrapper) {
    // Prevent double initialization
    if (getInstance(wrapper, 'sidebar')) {
      return getInstance(wrapper, 'sidebar');
    }

    // Elements
    const sidebar = $('.sidebar', wrapper);
    const overlay = $('.sidebar-overlay', wrapper);
    const mobileSheet = $('.sidebar-mobile', wrapper);
    const triggers = $$('[data-sidebar-trigger]', wrapper);
    const rails = $$('.sidebar-rail', wrapper);

    if (!sidebar) {
      console.error('Sidebar: Missing .sidebar element');
      return null;
    }

    // Configuration
    const config = {
      side: sidebar.dataset.side || 'left',
      variant: sidebar.dataset.variant || 'sidebar',
      collapsible: sidebar.dataset.collapsible || 'offcanvas',
      defaultOpen: sidebar.dataset.defaultOpen !== 'false',
    };

    // State
    let isOpen = getCookie(SIDEBAR_COOKIE_NAME) === 'true' || config.defaultOpen;
    let isMobileOpen = false;
    let isMobile = isMobileViewport();
    let focusTrap = mobileSheet ? createFocusTrap(mobileSheet) : null;
    let cleanupFns = [];

    // Initialize
    init();

    function init() {
      // Set initial state
      updateState();

      // Set wrapper attributes
      wrapper.setAttribute('data-variant', config.variant);

      // Bind events
      bindEvents();

      // Handle initial mobile state
      handleResize();
    }

    function bindEvents() {
      // Trigger buttons
      triggers.forEach((trigger) => {
        cleanupFns.push(on(trigger, 'click', handleTriggerClick));
      });

      // Rails
      rails.forEach((rail) => {
        cleanupFns.push(on(rail, 'click', handleRailClick));
      });

      // Overlay click
      if (overlay) {
        cleanupFns.push(on(overlay, 'click', closeMobile));
      }

      // Keyboard shortcut
      cleanupFns.push(on(document, 'keydown', handleKeydown));

      // Resize handler
      cleanupFns.push(on(window, 'resize', handleResize));

      // Escape key for mobile
      cleanupFns.push(on(document, 'keydown', handleEscape));
    }

    function handleTriggerClick(e) {
      e.preventDefault();
      toggle();
    }

    function handleRailClick(e) {
      e.preventDefault();
      toggle();
    }

    function handleKeydown(e) {
      if (
        e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        toggle();
      }
    }

    function handleEscape(e) {
      if (e.key === Keys.ESCAPE && isMobileOpen) {
        e.preventDefault();
        closeMobile();
      }
    }

    function handleResize() {
      const wasMobile = isMobile;
      isMobile = isMobileViewport();

      // Close mobile sheet when switching to desktop
      if (wasMobile && !isMobile && isMobileOpen) {
        closeMobile();
      }
    }

    function toggle() {
      if (isMobile) {
        if (isMobileOpen) {
          closeMobile();
        } else {
          openMobile();
        }
      } else {
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }

    function open() {
      if (config.collapsible === 'none') return;

      isOpen = true;
      updateState();
      saveToCookie();

      emit(wrapper, 'sidebar:open', { state: 'expanded' });
    }

    function close() {
      if (config.collapsible === 'none') return;

      isOpen = false;
      updateState();
      saveToCookie();

      emit(wrapper, 'sidebar:close', { state: 'collapsed' });
    }

    function openMobile() {
      isMobileOpen = true;

      if (overlay) {
        overlay.setAttribute('data-open', 'true');
      }

      if (mobileSheet) {
        mobileSheet.setAttribute('data-open', 'true');
      }

      lockScroll();

      if (focusTrap) {
        focusTrap.activate();
      }

      emit(wrapper, 'sidebar:open-mobile', { state: 'open' });
    }

    function closeMobile() {
      isMobileOpen = false;

      if (overlay) {
        overlay.setAttribute('data-open', 'false');
      }

      if (mobileSheet) {
        mobileSheet.setAttribute('data-open', 'false');
      }

      unlockScroll();

      if (focusTrap) {
        focusTrap.deactivate();
      }

      emit(wrapper, 'sidebar:close-mobile', { state: 'closed' });
    }

    function updateState() {
      const state = isOpen ? 'expanded' : 'collapsed';
      const collapsibleAttr = isOpen ? '' : config.collapsible;

      sidebar.setAttribute('data-state', state);
      sidebar.setAttribute('data-collapsible', collapsibleAttr);
      wrapper.setAttribute('data-state', state);

      emit(wrapper, 'sidebar:change', {
        state,
        open: isOpen,
        isMobile,
        openMobile: isMobileOpen,
      });
    }

    function saveToCookie() {
      setCookie(SIDEBAR_COOKIE_NAME, isOpen, SIDEBAR_COOKIE_MAX_AGE);
    }

    function setOpen(value) {
      if (isMobile) {
        if (value) {
          openMobile();
        } else {
          closeMobile();
        }
      } else {
        if (value) {
          open();
        } else {
          close();
        }
      }
    }

    function getState() {
      return {
        state: isOpen ? 'expanded' : 'collapsed',
        open: isOpen,
        openMobile: isMobileOpen,
        isMobile,
      };
    }

    function destroy() {
      // Cleanup event listeners
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];

      // Deactivate focus trap
      if (focusTrap) {
        focusTrap.deactivate();
      }

      // Unlock scroll if mobile was open
      if (isMobileOpen) {
        unlockScroll();
      }

      removeInstance(wrapper, 'sidebar');
    }

    // Public API
    const api = {
      element: wrapper,
      toggle,
      open,
      close,
      openMobile,
      closeMobile,
      setOpen,
      getState,
      destroy,
      get isOpen() {
        return isOpen;
      },
      get isMobileOpen() {
        return isMobileOpen;
      },
      get isMobile() {
        return isMobile;
      },
      get state() {
        return isOpen ? 'expanded' : 'collapsed';
      },
    };

    setInstance(wrapper, 'sidebar', api);
    return api;
  }

  /**
   * Sidebar Tooltip - Shows tooltip on collapsed menu buttons
   */
  function SidebarTooltip(button) {
    if (getInstance(button, 'sidebar-tooltip')) {
      return getInstance(button, 'sidebar-tooltip');
    }

    const tooltipText = button.dataset.tooltip;
    if (!tooltipText) return null;

    let tooltip = null;
    let cleanupFns = [];

    init();

    function init() {
      // Create tooltip element
      tooltip = document.createElement('div');
      tooltip.className = 'sidebar-tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);

      // Bind events
      cleanupFns.push(on(button, 'mouseenter', show));
      cleanupFns.push(on(button, 'mouseleave', hide));
      cleanupFns.push(on(button, 'focus', show));
      cleanupFns.push(on(button, 'blur', hide));
    }

    function show() {
      // Only show in collapsed state
      const sidebar = button.closest('.sidebar');
      if (!sidebar || sidebar.dataset.state !== 'collapsed') {
        return;
      }

      const rect = button.getBoundingClientRect();
      const side = sidebar.dataset.side || 'left';

      // Position tooltip
      if (side === 'left') {
        tooltip.style.left = `${rect.right + 8}px`;
      } else {
        tooltip.style.left = `${rect.left - tooltip.offsetWidth - 8}px`;
      }
      tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;

      tooltip.setAttribute('data-visible', 'true');
    }

    function hide() {
      tooltip.setAttribute('data-visible', 'false');
    }

    function destroy() {
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];

      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }

      removeInstance(button, 'sidebar-tooltip');
    }

    const api = {
      element: button,
      show,
      hide,
      destroy,
    };

    setInstance(button, 'sidebar-tooltip', api);
    return api;
  }

  /**
   * Initialize sidebar tooltips
   */
  function initTooltips(context = document) {
    $$('.sidebar-menu-button[data-tooltip]', context).forEach((button) => {
      SidebarTooltip(button);
    });
  }

  /**
   * Auto-initialize sidebars on DOM ready
   */
  function initSidebars(root = document) {
    $$('.sidebar-wrapper[data-sidebar]', root).forEach((wrapper) => {
      if (!getInstance(wrapper, 'sidebar')) {
        Sidebar(wrapper);
      }
    });

    // Also initialize tooltips
    initTooltips(root);
  }

  // Register for auto-initialization
  registerComponent('sidebar', (element) => {
    // If element is the wrapper
    if (element.classList.contains('sidebar-wrapper')) {
      return Sidebar(element);
    }
    // If element is inside a wrapper
    const wrapper = element.closest('.sidebar-wrapper');
    if (wrapper) {
      return Sidebar(wrapper);
    }
    return null;
  });

  // Also init on ready for manual data-sidebar attributes
  BrandUI.ready(() => {
    initSidebars();
  });

  // Export to BrandUI namespace
  BrandUI.components.Sidebar = Sidebar;
  BrandUI.components.SidebarTooltip = SidebarTooltip;
  BrandUI.initSidebars = initSidebars;
  BrandUI.initSidebarTooltips = initTooltips;
})();
