/**
 * Brand UI - Layout JavaScript
 * Shared layout functionality for example pages
 */

// Apply saved theme immediately to prevent flash (runs before DOMContentLoaded)
(function() {
  var theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.add('light');
  }
})();

(function () {
  'use strict';

  // All components for sidebar menu
  const components = [
    "Accordion", "Alert", "Alert Dialog", "Aspect Ratio", "Avatar",
    "Badge", "Breadcrumb", "Button", "Button Group", "Calendar",
    "Card", "Carousel", "Chart", "Checkbox", "Collapsible",
    "Combobox", "Command", "Context Menu", "Dialog", "Drawer",
    "Dropdown Menu", "Empty", "Field", "Form", "Hover Card",
    "Input", "Input Group", "Input OTP", "Item", "Kbd",
    "Label", "Menubar", "Native Select", "Navigation Menu", "Pagination",
    "Popover", "Progress", "Radio Group", "Resizable", "Scroll Area",
    "Select", "Separator", "Sheet", "Sidebar", "Skeleton",
    "Slider", "Spinner", "Switch", "Table",
    "Tabs", "Textarea", "Toast", "Toggle", "Toggle Group", "Tooltip"
  ];

  // Convert component name to slug
  function toSlug(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  // Get current page name from URL
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');

    if (filename === 'index' || filename === '') {
      return null; // Overview page
    }

    // Convert slug back to name
    return components.find(c => toSlug(c) === filename) || null;
  }

  // Determine if we're in the components subdirectory
  function isComponentPage() {
    return window.location.pathname.includes('/components/');
  }

  // Build sidebar menu
  function buildSidebarMenu() {
    const menu = document.getElementById('sidebar-menu');
    if (!menu) return;

    // Ensure menu has proper sidebar component class
    menu.classList.add('sidebar-menu');

    const currentPage = getCurrentPage();
    const basePath = isComponentPage() ? '' : './components/';

    components.forEach(name => {
      const slug = toSlug(name);
      const li = document.createElement('li');
      li.className = 'sidebar-menu-item';
      const isActive = name === currentPage;
      li.innerHTML = `<a href="${basePath}${slug}.html" class="sidebar-menu-button"${isActive ? ' data-active="true"' : ''}><span>${name}</span></a>`;
      menu.appendChild(li);
    });
  }

  // Theme management
  function initTheme() {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (saved === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    // If no saved preference, let the CSS media query handle it
    updateThemeButton();
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark') ||
      (!document.documentElement.classList.contains('light') &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      // Switch to light
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeButton();
  }

  function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const isDark = document.documentElement.classList.contains('dark') ||
        (!document.documentElement.classList.contains('light') &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);
      btn.textContent = isDark ? 'Light' : 'Dark';
    }
  }

  // Toggle sidebar visibility
  function toggleSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    const main = document.querySelector('.app-main');

    if (sidebar && main) {
      sidebar.classList.toggle('is-hidden');
      main.classList.toggle('sidebar-hidden');
    }
  }

  // Keyboard shortcuts
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  // Code tab switching
  function showTab(btn, panelId) {
    const container = btn.closest('.section');
    if (!container) return;

    container.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    const panel = document.getElementById(panelId);
    if (panel) {
      panel.classList.add('active');
    }
  }

  // Initialize on DOM ready
  function init() {
    buildSidebarMenu();
    initTheme();
    initKeyboardShortcuts();

    // Attach theme toggle to button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Attach sidebar toggle to button
    const sidebarBtn = document.getElementById('sidebar-toggle');
    if (sidebarBtn) {
      sidebarBtn.addEventListener('click', toggleSidebar);
    }

    // Enable transitions after initial render to prevent page load animations
    requestAnimationFrame(function() {
      const main = document.querySelector('.app-main');
      if (main) {
        main.classList.add('transitions-enabled');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global scope
  window.BrandUILayout = {
    toggleTheme,
    toggleSidebar,
    showTab,
    components,
    toSlug
  };
})();
