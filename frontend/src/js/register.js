/**
 * Register Script
 * Handles registration functionality for the register page
 * Hashes password with SHA-256 client-side, sends to /User/Register
 * Redirects to login page on success
 */

export function initRegister(hashSHA256) {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const fade = document.getElementById('fade');

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            try {
                // Reset UI elements
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
                fade.classList.add('hidden');

                // Client-side validation
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (password !== confirmPassword) {
                    errorMessage.textContent = 'Passwords do not match!';
                    errorMessage.style.display = 'block';
                    fade.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                        fade.classList.add('hidden');
                    }, 3000);
                    return;
                }
                if (!passwordRegex.test(password)) {
                    errorMessage.textContent = 'Password does not meet security requirements!';
                    errorMessage.style.display = 'block';
                    fade.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                        fade.classList.add('hidden');
                    }, 3000);
                    return;
                }

                // Hash password with SHA-256 client-side
                const hashedPassword = await hashSHA256(password);

                // Send registration request to API
                const response = await fetch('http://localhost:3000/User/Register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        password: hashedPassword
                    }),
                });

                // Check if response is OK before parsing JSON
                if (!response.ok) {
                    const data = await response.json();
                    let userMessage;
                    switch (response.status) {
                        case 400:
                            userMessage = 'Invalid input. Please check your details.';
                            break;
                        case 409:
                            userMessage = 'User already exists with this email.';
                            break;
                        case 415:
                            userMessage = 'Unsupported media type. Contact support.';
                            break;
                        case 422:
                            userMessage = 'Invalid email or password format.';
                            break;
                        case 500:
                            userMessage = 'Server error. Please try again later.';
                            break;
                        default:
                            userMessage = data.message || 'Registration failed. Please try again.';
                    }
                    throw new Error(userMessage);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    successMessage.textContent = 'Registration successful! Redirecting to login...';
                    successMessage.style.display = 'block';
                    fade.classList.remove('hidden');

                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    errorMessage.textContent = data.message || 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                    fade.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                        fade.classList.add('hidden');
                    }, 3000);
                }
            } catch (error) {
                errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again.';
                errorMessage.style.display = 'block';
                fade.classList.remove('hidden');
                console.error('Registration error:', error); // Log to browser console for debugging
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                    fade.classList.add('hidden');
                }, 3000);
            }
        });

        // Add click event to dismiss the fade overlay
        if (fade) {
            fade.addEventListener('click', () => {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
                fade.classList.add('hidden');
            });
        }
    }
}