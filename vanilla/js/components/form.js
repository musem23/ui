/**
 * Brand UI - Form Component
 * Form field wrapper with validation support, error messaging, and accessibility.
 */

(function () {
  'use strict';

  const COMPONENT_NAME = 'form';

  /**
   * Initialize a form item element
   */
  function initFormItem(element) {
    // Skip if already initialized
    if (BrandUI.getInstance(element, COMPONENT_NAME)) {
      return BrandUI.getInstance(element, COMPONENT_NAME);
    }

    const itemId = BrandUI.uid('form-item');

    // Find child elements
    const label = element.querySelector('.form-label');
    const control = element.querySelector('.form-control');
    const description = element.querySelector('.form-description');
    const message = element.querySelector('.form-message');

    // Generate IDs for ARIA relationships
    const controlId = control?.querySelector('input, textarea, select')?.id || `${itemId}-control`;
    const descriptionId = description ? `${itemId}-description` : null;
    const messageId = message ? `${itemId}-message` : null;

    // Set up label association
    if (label) {
      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement && !inputElement.id) {
        inputElement.id = controlId;
      }
      if (!label.hasAttribute('for') && inputElement) {
        label.setAttribute('for', inputElement.id);
      }
    }

    // Set up description ID
    if (description && !description.id) {
      description.id = descriptionId;
    }

    // Set up message ID
    if (message && !message.id) {
      message.id = messageId;
    }

    // Set up ARIA describedby
    function updateAriaDescribedBy() {
      const inputElement = control?.querySelector('input, textarea, select');
      if (!inputElement) return;

      const ids = [];
      if (descriptionId && description) {
        ids.push(descriptionId);
      }
      if (messageId && message && message.getAttribute('aria-hidden') !== 'true') {
        ids.push(messageId);
      }

      if (ids.length > 0) {
        inputElement.setAttribute('aria-describedby', ids.join(' '));
      } else {
        inputElement.removeAttribute('aria-describedby');
      }
    }

    updateAriaDescribedBy();

    /**
     * Set error state
     */
    function setError(errorMessage) {
      element.setAttribute('data-error', 'true');

      if (label) {
        label.setAttribute('data-error', 'true');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.setAttribute('aria-invalid', 'true');
      }

      if (message) {
        message.textContent = errorMessage;
        message.setAttribute('data-type', 'error');
        message.removeAttribute('aria-hidden');
      }

      updateAriaDescribedBy();
      BrandUI.emit(element, 'form-item:error', { message: errorMessage });
    }

    /**
     * Set success state
     */
    function setSuccess(successMessage) {
      clearError();

      if (message && successMessage) {
        message.textContent = successMessage;
        message.setAttribute('data-type', 'success');
        message.removeAttribute('aria-hidden');
        updateAriaDescribedBy();
      }

      BrandUI.emit(element, 'form-item:success', { message: successMessage });
    }

    /**
     * Set warning state
     */
    function setWarning(warningMessage) {
      clearError();

      if (message && warningMessage) {
        message.textContent = warningMessage;
        message.setAttribute('data-type', 'warning');
        message.removeAttribute('aria-hidden');
        updateAriaDescribedBy();
      }

      BrandUI.emit(element, 'form-item:warning', { message: warningMessage });
    }

    /**
     * Clear error state
     */
    function clearError() {
      element.removeAttribute('data-error');

      if (label) {
        label.removeAttribute('data-error');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.removeAttribute('aria-invalid');
      }

      if (message) {
        message.textContent = '';
        message.setAttribute('aria-hidden', 'true');
        message.removeAttribute('data-type');
      }

      updateAriaDescribedBy();
      BrandUI.emit(element, 'form-item:clear');
    }

    /**
     * Get current state
     */
    function getState() {
      const inputElement = control?.querySelector('input, textarea, select');
      return {
        hasError: element.hasAttribute('data-error'),
        isDisabled: element.hasAttribute('data-disabled'),
        value: inputElement?.value || '',
        inputElement,
      };
    }

    /**
     * Set disabled state
     */
    function setDisabled(disabled) {
      if (disabled) {
        element.setAttribute('data-disabled', 'true');
      } else {
        element.removeAttribute('data-disabled');
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.disabled = disabled;
      }
    }

    /**
     * Set required indicator
     */
    function setRequired(required) {
      if (label) {
        if (required) {
          label.setAttribute('data-required', 'true');
        } else {
          label.removeAttribute('data-required');
        }
      }

      const inputElement = control?.querySelector('input, textarea, select');
      if (inputElement) {
        inputElement.required = required;
      }
    }

    // Initialize from data attributes
    const config = BrandUI.getData(element);

    if (config.error) {
      setError(config.error);
    }

    if (config.disabled === 'true' || config.disabled === true) {
      setDisabled(true);
    }

    if (config.required === 'true' || config.required === true) {
      setRequired(true);
    }

    // API
    const api = {
      element,

      setError,
      setSuccess,
      setWarning,
      clearError,
      getState,
      setDisabled,
      setRequired,

      destroy() {
        BrandUI.removeInstance(element, COMPONENT_NAME);
      },
    };

    BrandUI.setInstance(element, COMPONENT_NAME, api);

    return api;
  }

  /**
   * Initialize form validation on a form element
   */
  function initForm(formElement) {
    const formId = BrandUI.uid('form');

    // Find all form items
    function getFormItems() {
      return BrandUI.$$('.form-item[data-form-item]', formElement).map((el) => {
        return BrandUI.getInstance(el, COMPONENT_NAME) || initFormItem(el);
      });
    }

    /**
     * Validate all form items
     */
    function validate(validators = {}) {
      const items = getFormItems();
      let isValid = true;
      const errors = {};

      items.forEach((item) => {
        const state = item.getState();
        const inputElement = state.inputElement;
        if (!inputElement) return;

        const name = inputElement.name || inputElement.id;
        const value = state.value;

        // Custom validator
        if (validators[name]) {
          const errorMessage = validators[name](value, inputElement);
          if (errorMessage) {
            item.setError(errorMessage);
            errors[name] = errorMessage;
            isValid = false;
            return;
          }
        }

        // Built-in required validation
        if (inputElement.required && !value.trim()) {
          const labelText = formElement.querySelector(`label[for="${inputElement.id}"]`)?.textContent || name;
          item.setError(`${labelText} is required`);
          errors[name] = `${labelText} is required`;
          isValid = false;
          return;
        }

        // Built-in email validation
        if (inputElement.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            item.setError('Please enter a valid email address');
            errors[name] = 'Please enter a valid email address';
            isValid = false;
            return;
          }
        }

        // Built-in minlength validation
        if (inputElement.minLength > 0 && value.length < inputElement.minLength) {
          item.setError(`Must be at least ${inputElement.minLength} characters`);
          errors[name] = `Must be at least ${inputElement.minLength} characters`;
          isValid = false;
          return;
        }

        // Built-in pattern validation
        if (inputElement.pattern && value) {
          const regex = new RegExp(inputElement.pattern);
          if (!regex.test(value)) {
            const title = inputElement.title || 'Please match the requested format';
            item.setError(title);
            errors[name] = title;
            isValid = false;
            return;
          }
        }

        // Clear error if valid
        item.clearError();
      });

      BrandUI.emit(formElement, 'form:validate', { isValid, errors });

      return { isValid, errors };
    }

    /**
     * Clear all form errors
     */
    function clearErrors() {
      getFormItems().forEach((item) => item.clearError());
      BrandUI.emit(formElement, 'form:clear');
    }

    /**
     * Get form data as object
     */
    function getData() {
      const data = {};
      const items = getFormItems();

      items.forEach((item) => {
        const state = item.getState();
        const inputElement = state.inputElement;
        if (inputElement) {
          const name = inputElement.name || inputElement.id;
          data[name] = state.value;
        }
      });

      return data;
    }

    /**
     * Reset form
     */
    function reset() {
      clearErrors();
      formElement.reset();
      BrandUI.emit(formElement, 'form:reset');
    }

    // Handle form submit with validation
    const handleSubmit = (e) => {
      const validators = formElement._validators || {};
      const result = validate(validators);

      if (!result.isValid) {
        e.preventDefault();

        // Focus first error field
        const firstErrorItem = formElement.querySelector('.form-item[data-error="true"]');
        if (firstErrorItem) {
          const input = firstErrorItem.querySelector('input, textarea, select');
          if (input) input.focus();
        }
      }
    };

    // Bind submit handler
    const removeSubmit = BrandUI.on(formElement, 'submit', handleSubmit);

    // API
    const api = {
      element: formElement,

      validate,
      clearErrors,
      getData,
      reset,

      setValidators(validators) {
        formElement._validators = validators;
      },

      destroy() {
        removeSubmit();
        BrandUI.removeInstance(formElement, 'form-validator');
      },
    };

    BrandUI.setInstance(formElement, 'form-validator', api);

    return api;
  }

  /**
   * Create a form item element
   */
  function createFormItem(options = {}) {
    const {
      label,
      description,
      required = false,
      disabled = false,
      error,
      inputType = 'text',
      inputId,
      inputName,
      inputPlaceholder,
      className = '',
    } = options;

    const item = document.createElement('div');
    item.className = `form-item ${className}`.trim();
    item.setAttribute('data-form-item', '');

    const id = inputId || BrandUI.uid('input');

    // Label
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'form-label';
      labelEl.setAttribute('for', id);
      labelEl.textContent = label;
      if (required) {
        labelEl.setAttribute('data-required', 'true');
      }
      item.appendChild(labelEl);
    }

    // Control wrapper
    const controlEl = document.createElement('div');
    controlEl.className = 'form-control';

    // Input
    const inputEl = document.createElement('input');
    inputEl.type = inputType;
    inputEl.id = id;
    if (inputName) inputEl.name = inputName;
    if (inputPlaceholder) inputEl.placeholder = inputPlaceholder;
    if (required) inputEl.required = true;
    if (disabled) inputEl.disabled = true;

    controlEl.appendChild(inputEl);
    item.appendChild(controlEl);

    // Description
    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'form-description';
      descEl.textContent = description;
      item.appendChild(descEl);
    }

    // Message placeholder
    const messageEl = document.createElement('p');
    messageEl.className = 'form-message';
    messageEl.setAttribute('aria-hidden', 'true');
    item.appendChild(messageEl);

    // Set initial state
    if (disabled) {
      item.setAttribute('data-disabled', 'true');
    }
    if (error) {
      item.setAttribute('data-error', error);
    }

    return initFormItem(item);
  }

  // Register component for auto-init
  BrandUI.registerComponent('form-item', initFormItem);

  // Expose to BrandUI namespace
  BrandUI.components.Form = {
    initItem: initFormItem,
    initForm: initForm,
    createItem: createFormItem,
  };
})();
