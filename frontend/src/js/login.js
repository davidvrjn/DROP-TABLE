/**
 * Login Script
 * Handles login functionality for the login page
 * Hashes password with SHA-256 client-side, sends to /User/Login
 * Stores user data, redirects based on role
 */

export function initLogin(hashSHA256) {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const fade = document.getElementById('fade');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            try {
                // Reset UI elements
                errorMessage.style.display = 'none';
                if (successMessage) successMessage.style.display = 'none';
                if (fade) fade.classList.add('hidden');

                // Basic validation
                if (!email || !password) {
                    throw new Error('Email and password are required');
                }

                // Hash password with SHA-256 client-side
                const hashedPassword = await hashSHA256(password);

                // Send login request to API
                const response = await fetch('http://localhost:3000/User/Login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password: hashedPassword }),
                });

                // Check if response is OK before parsing JSON
                if (!response.ok) {
                    const data = await response.json();
                    let userMessage;
                    switch (response.status) {
                        case 400:
                            userMessage = 'Invalid input. Please check your details.';
                            break;
                        case 401:
                            userMessage = 'Invalid credentials. Please try again.';
                            break;
                        case 404:
                            userMessage = 'User not found.';
                            break;
                        case 415:
                            userMessage = 'Unsupported media type. Contact support.';
                            break;
                        case 500:
                            userMessage = 'Server error. Please try again later.';
                            break;
                        default:
                            userMessage = data.message || 'Login failed. Please try again.';
                    }
                    throw new Error(userMessage);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    const { user } = data.data;
                    console.log('User object from server:', user); // Debug log
                    // Store user data
                    if (rememberMe) {
                        localStorage.setItem('user', JSON.stringify(user));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }

                    // Show success message before redirecting
                    if (successMessage && fade) {
                        successMessage.textContent = `Login successful! Redirecting${user.type && (user.type === 'admin' || (Array.isArray(user.type) && user.type.includes('admin'))) ? ' to admin page' : ''}...`;
                        successMessage.style.display = 'block';
                        fade.classList.remove('hidden');

                        setTimeout(() => {
                            // Redirect based on user type
                            if (user.type && (user.type === 'admin' || (Array.isArray(user.type) && user.type.includes('admin')))) {
                                window.location.href = '/admin';
                            } else {
                                window.location.href = '/';
                            }
                        }, 1500);
                    } else {
                        // If success message elements are missing, redirect immediately
                        if (user.type && (user.type === 'admin' || (Array.isArray(user.type) && user.type.includes('admin')))) {
                            window.location.href = '/admin';
                        } else {
                            window.location.href = '/';
                        }
                    }
                } else {
                    throw new Error(data.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again.';
                errorMessage.style.display = 'block';
                if (fade) {
                    fade.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                        fade.classList.add('hidden');
                    }, 3000);
                }
                console.error('Login error:', error);
            }
        });

        // Add click event to dismiss the fade overlay
        if (fade) {
            fade.addEventListener('click', () => {
                errorMessage.style.display = 'none';
                if (successMessage) successMessage.style.display = 'none';
                fade.classList.add('hidden');
            });
        }
    }

    if (forgotPasswordBtn) {
        const modal = document.getElementById('forgot-password-modal');
        const emailInput = document.getElementById('forgot-password-email');
        const emailSection = document.getElementById('email-input-section');
        const confirmationSection = document.getElementById('confirmation-section');

        forgotPasswordBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            emailSection.style.display = 'block';
            confirmationSection.style.display = 'none';
            emailInput.value = '';
        });

        document.getElementById('submit-forgot-password').addEventListener('click', function(e) {
            e.preventDefault();
            if (emailInput.value.trim() === '') {
                return;
            }
            emailSection.style.display = 'none';
            confirmationSection.style.display = 'block';
        });

        document.getElementById('cancel-forgot-password').addEventListener('click', () => modal.style.display = 'none');
        document.getElementById('close-forgot-password').addEventListener('click', () => modal.style.display = 'none');

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}