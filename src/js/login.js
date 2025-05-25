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

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            try {
                // Reset error message
                errorMessage.style.display = 'none';

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
                    throw new Error(errorMsg);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    const { user } = data.data;
                    // Store user data
                    if (rememberMe) {
                        localStorage.setItem('user', JSON.stringify(user));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }

                    // Redirect based on user type
                    if (user.type === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/'; // Root route serves index.ejs
                    }
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            } catch (error) {
                errorMessage.textContent = 'Error: ' + error.message;
                errorMessage.style.display = 'block';
                console.error('Login error:', error);
            }
        });
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function() {
            alert('Forgot password functionality will be implemented by the JS team');
        });
    }
}