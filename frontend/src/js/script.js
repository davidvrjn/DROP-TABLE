// This is mainly used for page rendering
// Import Bootstrap's bundled JavaScript (includes Popper.js)
import * as bootstrap from 'bootstrap';

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
        changeFilterBarTheme(isDarkMode); // Add filter bar theme change
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

    // New function to handle filter bar theme changes
    function changeFilterBarTheme(isDarkMode) {
        const filtersContainer = document.querySelector('.filters-container');
        const offcanvasFilters = document.querySelector('.offcanvas-body .filters-container');
        const filterSections = document.querySelectorAll('.filter-section');
        
        // Apply theme to main filter container
        if (filtersContainer) {
            if (isDarkMode) {
                filtersContainer.classList.remove('bg-light');
                filtersContainer.classList.add('bg-dark', 'text-light');
            } else {
                filtersContainer.classList.remove('bg-dark', 'text-light');
                filtersContainer.classList.add('bg-light');
            }
        }
        
        // Apply theme to offcanvas filter container (mobile view)
        if (offcanvasFilters) {
            if (isDarkMode) {
                offcanvasFilters.classList.remove('bg-light');
                offcanvasFilters.classList.add('bg-dark', 'text-light');
            } else {
                offcanvasFilters.classList.remove('bg-dark', 'text-light');
                offcanvasFilters.classList.add('bg-light');
            }
        }
        
        // Apply theme to filter section borders
        filterSections.forEach(section => {
            if (isDarkMode) {
                section.style.borderBottomColor = '#495057'; // Darker border for dark mode
            } else {
                section.style.borderBottomColor = '#e9ecef'; // Light border for light mode
            }
        });
        
        // Apply theme to stars in rating filter
        const stars = document.querySelectorAll('.stars');
        stars.forEach(star => {
            // Stars remain gold in both themes, no changes needed
        });
        
        // Apply theme to form controls in filter
        const formControls = document.querySelectorAll('.filters-container .form-control');
        formControls.forEach(control => {
            if (isDarkMode) {
                control.classList.add('bg-dark', 'text-light', 'border-secondary');
            } else {
                control.classList.remove('bg-dark', 'text-light', 'border-secondary');
            }
        });
        
        // Apply theme to checkboxes and their labels
        const checkLabels = document.querySelectorAll('.filters-container .form-check-label');
        checkLabels.forEach(label => {
            if (isDarkMode) {
                label.classList.add('text-light');
            } else {
                label.classList.remove('text-light');
            }
        });
        
        // Apply theme to filter headings
        const filterHeadings = document.querySelectorAll('.filter-heading');
        filterHeadings.forEach(heading => {
            if (isDarkMode) {
                heading.classList.add('text-light');
            } else {
                heading.classList.remove('text-light');
            }
        });
        
        // Apply theme to rating counts
        const ratingCounts = document.querySelectorAll('.rating-count');
        ratingCounts.forEach(count => {
            if (isDarkMode) {
                count.classList.remove('text-muted');
                count.classList.add('text-light', 'opacity-75');
            } else {
                count.classList.remove('text-light', 'opacity-75');
                count.classList.add('text-muted');
            }
        });
    }

    // Initialize filter functionality
    initializeFilters();
});

// Function to initialize filter functionality
function initializeFilters() {
    
    // Price range slider functionality
    const minSlider = document.getElementById('priceRangeMin');
    const maxSlider = document.getElementById('priceRangeMax');
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');
    
    if (minSlider && maxSlider && minInput && maxInput) {
        // Update input when sliders change
        minSlider.addEventListener('input', function() {
            minInput.value = this.value;
            // Ensure min doesn't exceed max
            if (parseInt(minSlider.value) >= (parseInt(maxSlider.value))) {
                minSlider.value = maxSlider.value - 1000;
                minInput.value = maxSlider.value - 1000;
            }
        });
        
        maxSlider.addEventListener('input', function() {
            maxInput.value = this.value;
            // Ensure max doesn't go below min
            if (parseInt(maxSlider.value) <= (parseInt(minSlider.value)) ) {
                maxSlider.value = (minSlider.value);
                maxInput.value = (minSlider.value);
            }
        });
        
        // Update sliders when inputs change
        minInput.addEventListener('change', function() {
            // Prevent negative values
            if (this.value < 0) {
                this.value = 0;
            }
            
            // If input is blank, set slider to minimum (0)
            if (this.value === '') {
                minSlider.value = 0;
            } else {
                minSlider.value = this.value;
            }
        });
        
        maxInput.addEventListener('change', function() {
            // Prevent negative values
            if (this.value < 0) {
                this.value = 0;
            }
            
            // If input is blank, set slider to maximum (10000)
            if (this.value === '') {
                maxSlider.value = 10000;
            } else {
                maxSlider.value = this.value;
            }
        });
    }
    
    // Ensure offcanvas filters are properly initialized
    const offcanvasElement = document.getElementById('filtersOffcanvas');
    if (offcanvasElement) {
        // Make sure Bootstrap initializes the offcanvas component
        new bootstrap.Offcanvas(offcanvasElement);
        
        // Apply current theme to offcanvas filters if needed
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const offcanvasFilters = offcanvasElement.querySelector('.filters-container');
        if (offcanvasFilters && isDarkMode) {
            offcanvasFilters.classList.remove('bg-light');
            offcanvasFilters.classList.add('bg-dark', 'text-light');
        }
        
        // Initialize mobile sliders when offcanvas is shown
        offcanvasElement.addEventListener('shown.bs.offcanvas', function() {
            // Get the mobile view sliders and inputs
            const mobileMinSlider = offcanvasElement.querySelector('#priceRangeMin');
            const mobileMaxSlider = offcanvasElement.querySelector('#priceRangeMax');
            const mobileMinInput = offcanvasElement.querySelector('#minPrice');
            const mobileMaxInput = offcanvasElement.querySelector('#maxPrice');
            
            if (mobileMinSlider && mobileMaxSlider && mobileMinInput && mobileMaxInput) {
                // Sync values with desktop view if it exists
                if (minSlider && maxSlider) {
                    mobileMinSlider.value = minSlider.value;
                    mobileMaxSlider.value = maxSlider.value;
                    mobileMinInput.value = minInput.value;
                    mobileMaxInput.value = maxInput.value;
                }
                
                // Add event listeners for mobile sliders
                mobileMinSlider.addEventListener('input', function() {
                    mobileMinInput.value = this.value;
                    // Ensure min doesn't exceed max
                    if (parseInt(mobileMinSlider.value) > parseInt(mobileMaxSlider.value)) {
                        mobileMinSlider.value = mobileMaxSlider.value - 1000;
                        mobileMinInput.value = mobileMaxSlider.value - 1000;
                    }
                    // Sync with desktop view if it exists
                    if (minSlider && minInput) {
                        minSlider.value = this.value;
                        minInput.value = this.value;
                    }
                });
                
                mobileMaxSlider.addEventListener('input', function() {
                    mobileMaxInput.value = this.value;
                    // Ensure max doesn't go below min
                    if (parseInt(mobileMaxSlider.value) < parseInt(mobileMinSlider.value)) {
                        mobileMaxSlider.value = mobileMinSlider.value;
                        mobileMaxInput.value = mobileMinSlider.value;
                    }
                    // Sync with desktop view if it exists
                    if (maxSlider && maxInput) {
                        maxSlider.value = this.value;
                        maxInput.value = this.value;
                    }
                });
                
                // Update sliders when inputs change
                mobileMinInput.addEventListener('change', function() {
                    // Prevent negative values
                    if (this.value < 0) {
                        this.value = 0;
                    }
                    
                    // If input is blank, set slider to minimum (0)
                    if (this.value === '') {
                        mobileMinSlider.value = 0;
                    } else {
                        mobileMinSlider.value = this.value;
                    }
                    
                    // Sync with desktop view if it exists
                    if (minSlider && minInput) {
                        minSlider.value = mobileMinSlider.value;
                        minInput.value = this.value;
                    }
                });
                
                mobileMaxInput.addEventListener('change', function() {
                    // Prevent negative values
                    if (this.value < 0) {
                        this.value = 0;
                    }
                    
                    // If input is blank, set slider to maximum (10000)
                    if (this.value === '') {
                        mobileMaxSlider.value = 10000;
                    } else {
                        mobileMaxSlider.value = this.value;
                    }
                    
                    // Sync with desktop view if it exists
                    if (maxSlider && maxInput) {
                        maxSlider.value = mobileMaxSlider.value;
                        maxInput.value = this.value;
                    }
                });
            }
        });
        
        // Add event listener to handle backdrop removal when offcanvas is hidden
        offcanvasElement.addEventListener('hidden.bs.offcanvas', function() {
            // Remove any lingering backdrop
            const backdrop = document.querySelector('.offcanvas-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            // Ensure body doesn't have the modal-open class which can prevent scrolling
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }
    
    const filterToggleButtons = document.querySelectorAll('[data-bs-toggle="offcanvas"]');
    filterToggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            const offcanvasElement = document.querySelector(targetId);
            if (offcanvasElement) {
                const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
                offcanvasInstance.show();
            }
        });
    });
}

// Make sure both theme toggles stay in sync
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    
    if (themeToggle && themeToggleMobile) {
        // Sync initial state
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        themeToggle.checked = isDarkMode;
        themeToggleMobile.checked = isDarkMode;
        
        // Sync desktop to mobile
        themeToggle.addEventListener('change', function() {
            themeToggleMobile.checked = this.checked;
        });
        
        // Sync mobile to desktop
        themeToggleMobile.addEventListener('change', function() {
            themeToggle.checked = this.checked;
            // Trigger the theme change
            themeToggle.dispatchEvent(new Event('change'));
        });
    }
});

// Function to show login notification modal
function showLoginNotification(message = "Please log in to add items to your watchlist.") {
    // Remove existing modal if present
    const existing = document.getElementById("loginNotificationModal");
    if (existing) existing.remove();

    // Get current theme
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "loginNotificationModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1000";

    // Create modal container
    const modal = document.createElement("div");
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.maxWidth = "400px";
    modal.style.width = "90%";
    modal.style.textAlign = "center";
    modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    
    // Set theme-specific styles
    if (isDarkMode) {
        modal.style.backgroundColor = "#212529";
        modal.style.color = "#fff";
        modal.style.border = "1px solid rgba(206, 147, 216, 0.15)";
    } else {
        modal.style.backgroundColor = "#fff";
        modal.style.color = "#212529";
        modal.style.border = "1px solid rgba(106, 27, 154, 0.15)";
    }

    // Modal content
    modal.innerHTML = `
        <div style="margin-bottom: 15px;">
            <i class="bi bi-exclamation-circle" style="font-size: 2rem; color: ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'}"></i>
        </div>
        <p style="margin-bottom: 20px;">${message}</p>
        <div>
            <button id="closeLoginModal" style="padding: 8px 16px; border: none; background: ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'}; color: ${isDarkMode ? '#212529' : 'white'}; border-radius: 20px; cursor: pointer; transition: all 0.3s; margin-right: 10px;">OK</button>
            <a href="login.html" style="padding: 8px 16px; border: 1px solid ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'}; background: transparent; color: ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'}; border-radius: 20px; cursor: pointer; transition: all 0.3s; text-decoration: none;">Login</a>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add hover effects to buttons
    const closeButton = document.getElementById("closeLoginModal");
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = isDarkMode ? 'rgba(206, 147, 216, 1)' : 'rgba(106, 27, 154, 1)';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)';
    });

    // Close modal when clicking the close button or outside the modal
    closeButton.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// Make the function globally available
window.showLoginNotification = showLoginNotification;
