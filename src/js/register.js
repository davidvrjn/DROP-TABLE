/**
 * Register Script
 * Handles registration functionality for the register page
 * Sends a request to /User/Register with user data
 * Redirects to login page on success
 */

export function initRegister() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Client-side validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match!';
                errorMessage.style.display = 'block';
                return;
            }
            if (!passwordRegex.test(password)) {
                errorMessage.textContent = 'Password does not meet security requirements!';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/User/Register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`, // Generate username from name
                        password,
                        role: 'user' // Default role, adjust if selectable
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.status === 'success') {
                        alert('Registration successful!');
                        window.location.href = 'login.ejs';
                    } else {
                        errorMessage.textContent = data.message || 'Registration failed';
                        errorMessage.style.display = 'block';
                    }
                } else {
                    let errorMsg = data.message || `Error: ${response.status}`;
                    switch (response.status) {
                        case 400:
                            errorMsg = 'Bad request: Invalid input';
                            break;
                        case 409:
                            errorMsg = 'Email already exists';
                            break;
                        case 415:
                            errorMsg = 'Unsupported media type';
                            break;
                        case 422:
                            errorMsg = 'Unprocessable entity: Validation failed';
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
}