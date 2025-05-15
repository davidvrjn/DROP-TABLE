// This is mainly used for page rendering
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
        changeTheme(true);
    }
    
    // Toggle theme when switch is clicked
    themeToggle.addEventListener('change', () => {
        const isDarkMode = themeToggle.checked;
        document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        changeTheme(isDarkMode);
    });
    
    // Main theme change function that calls all component-specific theme functions
    function changeTheme(isDarkMode) {
        changeNavbarTheme(isDarkMode);
        changeFooterTheme(isDarkMode);
        // Add more component theme changes here as needed
    }

    function changeNavbarTheme(isDarkMode) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (isDarkMode) {
                navbar.classList.remove('navbar-light', 'bg-light');
                navbar.classList.add('navbar-dark', 'bg-dark');
            } else {
                navbar.classList.remove('navbar-dark', 'bg-dark');
                navbar.classList.add('navbar-light', 'bg-light');
            }
        }
    }
    
    function changeFooterTheme(isDarkMode) {
        const footer = document.querySelector('.footer');
        if (footer) {
            if (isDarkMode) {
                footer.classList.remove('bg-light');
                footer.classList.add('bg-dark', 'text-light');
                
                // Update text-muted elements within footer for better contrast in dark mode
                const mutedElements = footer.querySelectorAll('.text-muted');
                mutedElements.forEach(el => {
                    el.classList.remove('text-muted');
                    el.classList.add('text-light', 'opacity-75');
                });
            } else {
                footer.classList.remove('bg-dark', 'text-light');
                footer.classList.add('bg-light');
                
                // Restore text-muted elements
                const lightElements = footer.querySelectorAll('.text-light.opacity-75');
                lightElements.forEach(el => {
                    el.classList.remove('text-light', 'opacity-75');
                    el.classList.add('text-muted');
                });
            }
        }
    }
});