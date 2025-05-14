// Import Bootstrap's bundled JavaScript (includes Popper.js)
import 'bootstrap';

console.log('Frontend development script loaded!');

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        themeToggle.checked = true;
        updateNavbar(true);
    }
    
    // Toggle theme when switch is clicked
    themeToggle.addEventListener('change', () => {
        const isDarkMode = themeToggle.checked;
        document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateNavbar(isDarkMode);
    });
    
    // Update navbar classes based on theme
    function updateNavbar(isDarkMode) {
        const navbar = document.querySelector('.navbar');
        if (isDarkMode) {
            navbar.classList.remove('navbar-light', 'bg-light');
            navbar.classList.add('navbar-dark', 'bg-dark');
        } else {
            navbar.classList.remove('navbar-dark', 'bg-dark');
            navbar.classList.add('navbar-light', 'bg-light');
        }
    }
});

// Example: If you use Bootstrap's tooltips, you might initialize them here
// var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
//   return new bootstrap.Tooltip(tooltipTriggerEl)
// })