/**
 * Login Script
 * Handles login functionality for the login page
 * Sends a request to /User/Login with raw password
 * Stores token and user data, redirects based on role
 */

export function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            try {
                // Basic validation
                if (!email || !password) {
                    throw new Error('Email and password are required');
                }

                // Send login request to API
                const response = await fetch('http://localhost:3000/User/Login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.status === 'success') {
                        const { user } = data.data; // No token in the provided API response, adjust if token is added
                        if (rememberMe) {
                            localStorage.setItem('user', JSON.stringify(user));
                        } else {
                            sessionStorage.setItem('user', JSON.stringify(user));
                        }

                        // Redirect based on role
                        if (user.role === 'admin') {
                            window.location.href = '/admin';
                            alert('Redirecting to /admin');
                        } else {
                            window.location.href = '/index';
                            alert('Redirecting to /index');
                        }
                    } else {
                        errorMessage.textContent = data.message || 'Login failed';
                        errorMessage.style.display = 'block';
                    }
                } else {
                    let errorMsg = data.message || `Error: ${response.status}`;
                    switch (response.status) {
                        case 400:
                            errorMsg = 'Bad request: Invalid input';
                            break;
                        case 401:
                            errorMsg = 'Unauthorized: Invalid credentials';
                            break;
                        case 404:
                            errorMsg = 'User not found';
                            break;
                        case 415:
                            errorMsg = 'Unsupported media type';
                            break;
                        case 500:
                            errorMsg = 'Server error';
                            break;
                    }
                    errorMessage.textContent = errorMsg;
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                errorMessage.textContent = 'Error: ' + error.message;
                errorMessage.style.display = 'block';
            }
        });
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function() {
            alert('Forgot password functionality will be implemented by the JS team');
        });
    }
}