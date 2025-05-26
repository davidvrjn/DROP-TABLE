/**
 * Settings Script
 * Handles account settings UI display for both admin and user roles
 * Note: Update and delete functionality requires new API endpoints
 */

export function initSettings() {
    const successAlert = document.getElementById('settingsSuccessAlert');
    const currentEmailInput = document.getElementById('currentEmail');
    const roleMessage = document.getElementById('roleMessage');

    // Populate current email and role from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // Display email
        currentEmailInput.value = user.email || 'user@example.com';
        
        // Display role message
        if (roleMessage) {
            if (user.role === 'admin') {
                roleMessage.textContent = 'Logged in as: Admin (Admin Privileges Active)';
            } else {
                roleMessage.textContent = 'Logged in as: User';
            }
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

    // Email Form (disabled, no API call)
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showError('Email updates are not yet supported by the API. Contact support for assistance.');
        });
    }

    // Password Form (disabled, no API call)
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showError('Password updates are not yet supported by the API. Contact support for assistance.');
        });
    }

    // Delete Account Functionality
    const deleteAccountForm = document.getElementById('deleteAccountForm');
    const confirmDeleteCheckbox = document.getElementById('confirmDelete');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const passwordForDelete = document.getElementById('passwordForDelete');
    const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');

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
        confirmDeleteAccountBtn.addEventListener('click', function() {
            showError('Account deletion is not yet supported by the API. Contact support for assistance.');
        });
    }

    // Handle tab changes to hide success message
    const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            if (successAlert) {
                successAlert.classList.add('d-none');
            }
        });
    });

    function showSuccess(message) {
        if (successAlert) {
            successAlert.textContent = message;
            successAlert.classList.remove('d-none');
            setTimeout(() => {
                successAlert.classList.add('d-none');
            }, 5000);
        }
    }

    function showError(message) {
        if (successAlert) {
            successAlert.classList.remove('alert-success');
            successAlert.classList.add('alert-danger');
            successAlert.textContent = message;
            successAlert.classList.remove('d-none');
            setTimeout(() => {
                successAlert.classList.add('d-none');
                successAlert.classList.remove('alert-danger');
                successAlert.classList.add('alert-success');
            }, 5000);
        }
    }
}