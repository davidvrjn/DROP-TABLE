/**
 * Password Eye Toggle Component
 * 
 * This script adds a toggle button to password fields that allows users to show/hide their password.
 * Usage: Call initPasswordEye() after the DOM is loaded to enable the functionality on all password fields.
 */

export function initPasswordEye() {
  // Find all password input fields
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  // Add eye toggle to each password field
  passwordFields.forEach(field => {
    // Create the container to wrap the input
    const parentElement = field.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'password-field-wrapper position-relative';
    
    // Move the field into the wrapper
    parentElement.insertBefore(wrapper, field);
    wrapper.appendChild(field);
    
    // Create the eye toggle button
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'password-toggle-btn btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted';
    toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
    toggleButton.setAttribute('aria-label', 'Show password');
    toggleButton.style.zIndex = '5';
    
    // Add the toggle button to the wrapper
    wrapper.appendChild(toggleButton);
    
    // Add event listener to toggle password visibility
    toggleButton.addEventListener('click', () => {
      if (field.type === 'password') {
        field.type = 'text';
        toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
        toggleButton.setAttribute('aria-label', 'Hide password');
      } else {
        field.type = 'password';
        toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
        toggleButton.setAttribute('aria-label', 'Show password');
      }
    });
  });
  
  // Add some basic styling
  const style = document.createElement('style');
  style.textContent = `
    .password-field-wrapper {
      display: flex;
      align-items: center;
    }
    .password-toggle-btn {
      background: none;
      border: none;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
    }
    .password-toggle-btn:focus {
      outline: none;
      box-shadow: none;
    }
  `;
  document.head.appendChild(style);
}