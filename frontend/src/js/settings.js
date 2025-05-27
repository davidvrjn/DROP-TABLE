/**
 * Settings Script
 * Handles account settings UI display and API interactions for both admin and user roles
 */

export function initSettings() {
    const successAlert = document.getElementById('settingsSuccessAlert');
    const errorAlert = document.getElementById('settingsSuccessAlert'); // Reusing same element for errors
    const currentEmailInput = document.getElementById('currentEmail');
    const roleMessage = document.getElementById('roleMessage');

    // Populate current email and role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    if (user && user.email) {
        // Display email
        currentEmailInput.value = user.email;
        
        // Display role message
        if (roleMessage) {
            roleMessage.textContent = user.type === 'admin' 
                ? 'Logged in as: Admin (Admin Privileges Active)'
                : 'Logged in as: User';
            roleMessage.classList.add('alert-info');
            roleMessage.style.display = 'block';
        }
    } else {
        currentEmailInput.value = 'Not logged in';
        if (roleMessage) {
            roleMessage.textContent = 'Not logged in';
            roleMessage.classList.remove('alert-info');
            roleMessage.classList.add('alert-warning');
            roleMessage.style.display = 'block';
        }
    }

    // Email Form Submission
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newEmail = document.getElementById('newEmail').value;
            const confirmEmail = document.getElementById('confirmEmail').value;
            const currentPassword = document.getElementById('currentPasswordForEmail').value;
            
            // Client-side validation
            if (newEmail !== confirmEmail) {
                showError('New email and confirmation email do not match.');
                return;
            }
            if (!currentPassword) {
                showError('Please enter your current password.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/Update/User/Email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        new_email: newEmail,
                        password: currentPassword
                    })
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    showSuccess(result.message);
                    // Update localStorage with new email
                    user.email = newEmail;
                    localStorage.setItem('user', JSON.stringify(user));
                    currentEmailInput.value = newEmail;
                    emailForm.reset();
                } else {
                    showError(result.message || 'Failed to update email.');
                }
            } catch (err) {
                showError('Error updating email. Please try again later.');
                console.error(err);
            }
        });
    }

    // Password Form Submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Client-side validation
            if (!currentPassword) {
                showError('Please enter your current password.');
                return;
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                showError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return;
            }
            if (newPassword !== confirmPassword) {
                showError('New password and confirmation password do not match.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/Update/User/Password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userid: user.id,
                        password: currentPassword,
                        new_password: newPassword
                    })
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    showSuccess(result.message);
                    passwordForm.reset();
                } else {
                    showError(result.message || 'Failed to update password.');
                }
            } catch (err) {
                showError('Error updating password. Please try again later.');
                console.error(err);
            }
        });
    }

    // Delete Account Functionality
    const deleteAccountForm = document.getElementById('deleteAccountForm');
    const confirmDeleteCheckbox = document.getElementById('confirmDelete');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
    const passwordForDelete = document.getElementById('passwordForDelete');

    if (confirmDeleteCheckbox && deleteAccountBtn) {
        confirmDeleteCheckbox.addEventListener('change', function() {
            deleteAccountBtn.disabled = !this.checked;
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (!passwordForDelete || !passwordForDelete.value) {
                showError('Please enter your current password.');
                return;
            }
            const deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
            deleteAccountModal.show();
        });
    }

    if (confirmDeleteAccountBtn) {
        confirmDeleteAccountBtn.addEventListener('click', async function() {
            const password = passwordForDelete ? passwordForDelete.value : '';

            try {
                const response = await fetch('http://localhost:3000/Remove/User', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userid: user.id,
                        password: password
                    })
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    showSuccess(result.message);
                    // Clear storage and redirect
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    setTimeout(() => {
                        window.location.href = '/index.ejs';
                    }, 2000);
                } else {
                    showError(result.message || 'Failed to delete account.');
                }
            } catch (err) {
                showError('Error deleting account. Please try again later.');
                console.error(err);
            }
        });
    }

    // Handle tab changes to hide messages
    const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            if (successAlert) {
                successAlert.classList.add('d-none');
                successAlert.classList.remove('alert-danger');
                successAlert.classList.add('alert-success');
            }
        });
    });

    function showSuccess(message) {
        if (successAlert) {
            successAlert.textContent = message;
            successAlert.classList.remove('d-none', 'alert-danger');
            successAlert.classList.add('alert-success');
            setTimeout(() => {
                successAlert.classList.add('d-none');
            }, 5000);
        }
    }

    function showError(message) {
        if (errorAlert) {
            errorAlert.textContent = message;
            errorAlert.classList.remove('d-none', 'alert-success');
            errorAlert.classList.add('alert-danger');
            setTimeout(() => {
                errorAlert.classList.add('d-none');
                errorAlert.classList.remove('alert-danger');
                errorAlert.classList.add('alert-success');
            }, 5000);
        }
    }
}