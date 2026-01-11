/**
 * Brand UI - Toast Component
 * Notification toasts with stacking, types, and positions
 */

(function () {
  'use strict';

  // ============================================
  // ICONS
  // ============================================

  const ICONS = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    loading: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
  };

  // ============================================
  // DEFAULTS
  // ============================================

  const DEFAULTS = {
    duration: 5000,
    position: 'bottom-right',
    maxToasts: 5,
    closable: true,
    showProgress: false,
  };

  // ============================================
  // TOAST MANAGER
  // ============================================

  class ToastManager {
    constructor() {
      this.containers = {};
      this.toasts = new Map();
      this.config = { ...DEFAULTS };
    }

    /**
     * Configure global defaults
     */
    configure(options) {
      Object.assign(this.config, options);
    }

    /**
     * Get or create container for position
     */
    getContainer(position) {
      if (!this.containers[position]) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('data-position', position);
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(container);
        this.containers[position] = container;
      }
      return this.containers[position];
    }

    /**
     * Show a toast notification
     */
    show(options) {
      const config = {
        ...this.config,
        ...options,
        id: options.id || BrandUI.uid('toast'),
      };

      const container = this.getContainer(config.position);

      // Limit max toasts
      this.enforceMaxToasts(container, config.maxToasts);

      // Create toast element
      const toast = this.createToastElement(config);

      // Add to container
      if (config.position.startsWith('bottom')) {
        container.insertBefore(toast, container.firstChild);
      } else {
        container.appendChild(toast);
      }

      // Store reference
      this.toasts.set(config.id, {
        element: toast,
        config,
        timeoutId: null,
      });

      // Trigger entrance animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.classList.add('toast-visible');
        });
      });

      // Set auto-dismiss timer
      if (config.duration > 0 && config.type !== 'loading') {
        this.startDismissTimer(config.id, config.duration);

        // Show progress bar
        if (config.showProgress) {
          this.startProgressBar(toast, config.duration);
        }
      }

      // Emit event
      BrandUI.emit(toast, 'toast:show', { id: config.id, config });

      return config.id;
    }

    /**
     * Create toast DOM element
     */
    createToastElement(config) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = config.id;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');

      if (config.type) {
        toast.setAttribute('data-type', config.type);
      }

      if (config.showProgress && config.duration > 0) {
        toast.classList.add('has-progress');
      }

      // Build content
      let html = '';

      // Icon
      if (config.type && ICONS[config.type]) {
        html += `<div class="toast-icon">${ICONS[config.type]}</div>`;
      }

      // Content
      html += '<div class="toast-content">';
      if (config.title) {
        html += `<div class="toast-title">${this.escapeHtml(config.title)}</div>`;
      }
      if (config.description) {
        html += `<div class="toast-description">${this.escapeHtml(config.description)}</div>`;
      }
      html += '</div>';

      // Action button
      if (config.action) {
        html += `<button type="button" class="btn btn-outline btn-sm toast-action" data-action="action">${this.escapeHtml(config.action.label)}</button>`;
      }

      // Close button
      if (config.closable) {
        html += `<button type="button" class="btn btn-ghost btn-icon-sm toast-close" data-action="close" aria-label="Close notification">${ICONS.close}</button>`;
      }

      // Progress bar
      if (config.showProgress && config.duration > 0) {
        html += '<div class="toast-progress"></div>';
      }

      toast.innerHTML = html;

      // Bind events
      this.bindToastEvents(toast, config);

      return toast;
    }

    /**
     * Bind toast events
     */
    bindToastEvents(toast, config) {
      // Close button
      const closeBtn = toast.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.dismiss(config.id);
        });
      }

      // Action button
      const actionBtn = toast.querySelector('[data-action="action"]');
      if (actionBtn && config.action && config.action.onClick) {
        actionBtn.addEventListener('click', () => {
          config.action.onClick();
          if (config.action.dismissOnClick !== false) {
            this.dismiss(config.id);
          }
        });
      }

      // Pause on hover
      if (config.duration > 0 && config.type !== 'loading') {
        toast.addEventListener('mouseenter', () => {
          this.pauseDismissTimer(config.id);
        });

        toast.addEventListener('mouseleave', () => {
          this.resumeDismissTimer(config.id);
        });
      }
    }

    /**
     * Dismiss a toast
     */
    dismiss(id) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      const { element, config } = toastData;

      // Clear timer
      this.clearDismissTimer(id);

      // Trigger exit animation
      element.classList.remove('toast-visible');
      element.classList.add('toast-exiting');

      // Emit event
      BrandUI.emit(element, 'toast:dismiss', { id, config });

      // Remove after animation
      BrandUI.afterTransition(element, () => {
        element.remove();
        this.toasts.delete(id);

        // Clean up empty containers
        const container = this.containers[config.position];
        if (container && container.children.length === 0) {
          container.remove();
          delete this.containers[config.position];
        }
      });
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
      for (const id of this.toasts.keys()) {
        this.dismiss(id);
      }
    }

    /**
     * Update a toast
     */
    update(id, options) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      const { element, config } = toastData;

      // Update config
      Object.assign(config, options);

      // Update type
      if (options.type !== undefined) {
        element.setAttribute('data-type', options.type);
        const iconEl = element.querySelector('.toast-icon');
        if (iconEl && ICONS[options.type]) {
          iconEl.innerHTML = ICONS[options.type];
        }
      }

      // Update title
      if (options.title !== undefined) {
        const titleEl = element.querySelector('.toast-title');
        if (titleEl) {
          titleEl.textContent = options.title;
        }
      }

      // Update description
      if (options.description !== undefined) {
        const descEl = element.querySelector('.toast-description');
        if (descEl) {
          descEl.textContent = options.description;
        }
      }

      // Update duration (restart timer)
      if (options.duration !== undefined && options.duration > 0) {
        this.clearDismissTimer(id);
        this.startDismissTimer(id, options.duration);
      }
    }

    /**
     * Promise-based toast for async operations
     */
    promise(promise, options) {
      const id = this.show({
        ...options.loading,
        type: 'loading',
        duration: 0,
        closable: false,
      });

      promise
        .then((result) => {
          const successOptions = typeof options.success === 'function'
            ? options.success(result)
            : options.success;
          this.update(id, {
            ...successOptions,
            type: 'success',
            duration: this.config.duration,
            closable: true,
          });
          this.startDismissTimer(id, this.config.duration);
        })
        .catch((error) => {
          const errorOptions = typeof options.error === 'function'
            ? options.error(error)
            : options.error;
          this.update(id, {
            ...errorOptions,
            type: 'error',
            duration: this.config.duration,
            closable: true,
          });
          this.startDismissTimer(id, this.config.duration);
        });

      return id;
    }

    /**
     * Start dismiss timer
     */
    startDismissTimer(id, duration) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      toastData.duration = duration;
      toastData.remainingTime = duration;
      toastData.startTime = Date.now();

      toastData.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    /**
     * Pause dismiss timer
     */
    pauseDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || !toastData.timeoutId) return;

      clearTimeout(toastData.timeoutId);
      toastData.timeoutId = null;
      toastData.remainingTime = toastData.remainingTime - (Date.now() - toastData.startTime);

      // Pause progress bar
      const progress = toastData.element.querySelector('.toast-progress');
      if (progress) {
        const computedWidth = getComputedStyle(progress).width;
        progress.style.transition = 'none';
        progress.style.width = computedWidth;
      }
    }

    /**
     * Resume dismiss timer
     */
    resumeDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || toastData.remainingTime <= 0) return;

      toastData.startTime = Date.now();
      toastData.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, toastData.remainingTime);

      // Resume progress bar
      const progress = toastData.element.querySelector('.toast-progress');
      if (progress) {
        requestAnimationFrame(() => {
          progress.style.transition = `width ${toastData.remainingTime}ms linear`;
          progress.style.width = '0%';
        });
      }
    }

    /**
     * Clear dismiss timer
     */
    clearDismissTimer(id) {
      const toastData = this.toasts.get(id);
      if (!toastData || !toastData.timeoutId) return;

      clearTimeout(toastData.timeoutId);
      toastData.timeoutId = null;
    }

    /**
     * Start progress bar animation
     */
    startProgressBar(toast, duration) {
      const progress = toast.querySelector('.toast-progress');
      if (!progress) return;

      progress.style.width = '100%';
      requestAnimationFrame(() => {
        progress.style.transition = `width ${duration}ms linear`;
        progress.style.width = '0%';
      });
    }

    /**
     * Enforce max toasts limit
     */
    enforceMaxToasts(container, max) {
      const toasts = container.querySelectorAll('.toast');
      if (toasts.length >= max) {
        // Remove oldest toasts
        const toRemove = toasts.length - max + 1;
        for (let i = 0; i < toRemove; i++) {
          const oldToast = toasts[i];
          if (oldToast && oldToast.id) {
            this.dismiss(oldToast.id);
          }
        }
      }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
      if (typeof str !== 'string') return str;
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    success(title, description, options = {}) {
      return this.show({ title, description, type: 'success', ...options });
    }

    error(title, description, options = {}) {
      return this.show({ title, description, type: 'error', ...options });
    }

    warning(title, description, options = {}) {
      return this.show({ title, description, type: 'warning', ...options });
    }

    info(title, description, options = {}) {
      return this.show({ title, description, type: 'info', ...options });
    }

    loading(title, description, options = {}) {
      return this.show({ title, description, type: 'loading', duration: 0, closable: false, ...options });
    }
  }

  // ============================================
  // INITIALIZE
  // ============================================

  const toast = new ToastManager();

  // Expose to BrandUI
  if (typeof BrandUI !== 'undefined') {
    BrandUI.toast = toast;
    BrandUI.components.toast = ToastManager;
  }

  // Export for ES modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toast };
  }
})();
