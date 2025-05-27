// This file is used to test the rendering of product cards on a webpage.
// It imports a function to create product card HTML and uses static data for testing.
// The static data includes product details such as ID, image URL, title, final price, initial price, and discount percentage.
// The rendered product cards are inserted into a container with the ID 'product-list'.
// This file is not intended for production use and is meant for testing purposes only.

// Import the function to generate product card HTML
import { createProductCardHTML } from "../partials/_product-card.js";

const user = localStorage.getItem("user") || sessionStorage.getItem("user");
const userId = JSON.parse(user)?.id;

async function fetchProducts({
    filters = {},
    ordering = {},
    limit = 100,
    userid = userId,
} = {}) {
    try {
        const response = await fetch("http://localhost:3000/Get/Products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userid,
                filters,
                ordering,
                limit,
            }),
        });

        const result = await response.json();
        if (result.status === "success") {
            return result.data;
        } else {
            console.error("API error:", result.message);
            return [];
        }
    } catch (err) {
        console.error("Network error:", err);
        return [];
    }
}

window.handleImageError = function (img) {
    // Hide the spinner
    const spinner = img.parentNode.querySelector(".image-loading-spinner");
    if (spinner) spinner.style.display = "none";

    // Show the alt text after 5 seconds if image fails to load
    const altTextElement = img.parentNode.querySelector(".image-alt-text");
    if (altTextElement) {
        altTextElement.textContent = img.alt;
        altTextElement.classList.add("visible");
    }

    // Hide the broken image
    img.style.display = "none";
};

// Add this to initialize a timeout for all product images
document.addEventListener("DOMContentLoaded", function () {
    const productImages = document.querySelectorAll(".product-thumbnail");

    productImages.forEach((img) => {
        // Set a timeout to check if image loaded after 5 seconds
        setTimeout(() => {
            // If image hasn't loaded yet (doesn't have 'loaded' class)
            if (!img.classList.contains("loaded")) {
                handleImageError(img);
            }
        }, 5000);
    });
});

let activeFilters = {
    categories: [],
    brands: [],
    retailers: [],
    ratings: [],
    minPrice: 0,
    maxPrice: Infinity,
};

// Pagination state
let currentPage = 1;
const itemsPerPage = 9;
let currentProducts = [];
const isDealsPage = window.location.pathname.includes("/deals");

function sanitizeProduct(product) {
    return {
        ...product,
        final_price: Number(product.final_price ?? 0),
        initial_price:
            product.initial_price != null
                ? Number(product.initial_price)
                : undefined,
        rating: product.rating != null ? Number(product.rating) : undefined,
    };
}

function renderProductsWithPagination(products = currentProducts) {
    const productListContainer = document.getElementById("product-list");
    if (!productListContainer) {
        console.error("Product list container not found!");
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToRender = products.slice(0, end);

    if (productsToRender.length === 0) {
        productListContainer.innerHTML =
            '<p class="text-center text-muted">No products found.</p>';
        return;
    }

    // Optimize rendering by building HTML string once
    const productCardsHTML = productsToRender
        .map((product) => createProductCardHTML(sanitizeProduct(product)))
        .join("");
    productListContainer.innerHTML = productCardsHTML;

    const loadMoreButton = document.getElementById("load-more-products");
    if (loadMoreButton) {
        loadMoreButton.style.display =
            end >= products.length ? "none" : "block";
    }

    setupWatchlistButtons();
}

function setupWatchlistButtons() {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;
    const buttons = document.querySelectorAll(".watchlist-icon");

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const productId = this.getAttribute("data-product-id");
            const retailerId = this.getAttribute("data-retailer-id") || 1;

            if (!userId) {
                if (window.showLoginNotification) {
                    window.showLoginNotification();
                } else {
                    // Fallback if the function isn't available
                    showCustomNotification("Please log in to add items to your watchlist.", "error"); // MODIFIED
                }
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:3000/Add/Watchlist",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            product_id: productId,
                            retailer_id: retailerId,
                            userid: userId,
                        }),
                    }
                );

                const result = await response.json();
                if (result.status === "success") {
                    this.classList.add("added");
                    showCustomNotification("Added to WatchList!", "success");
                } else {
                    console.error(
                        "Failed to add to watchlist:",
                        result.message
                    );
                    showCustomNotification(result.message || "Already added to WatchList!", "error");
                }
            } catch (err) {
                console.error("Error adding to watchlist:", err);
                showCustomNotification("Error adding to watchlist. Please try again.", "error");
            }
        });
    });
}

function setupLoadMoreButton() {
    const loadMoreButton = document.getElementById("load-more-products");
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            currentPage++;
            renderProductsWithPagination();
        });
    }
}

// Function to render products to the page (used for search/filter)
function renderProducts(productsToRender) {
    currentProducts = productsToRender; // Update the current dataset
    currentPage = 1; // Reset pagination
    renderProductsWithPagination(productsToRender);
}

// Function to populate brand checkboxes
function populateBrandFilters(brands) {
    const brandContainer = document.querySelector(".brand-options");
    const mobileBrandContainer = document.querySelector(
        ".offcanvas-body .brand-options"
    );

    if (!brandContainer && !mobileBrandContainer) return;

    // Function to populate a specific container
    const populateContainer = (container) => {
        if (!container) return;

        // Clear existing content
        container.innerHTML = "";

        // Add checkboxes for each brand
        brands.forEach((brand, index) => {
            const brandCheckbox = document.createElement("div");
            brandCheckbox.className = "form-check";
            brandCheckbox.innerHTML = `
          <input class="form-check-input" type="checkbox" id="brand${index}_${
                container === mobileBrandContainer ? "mobile" : "desktop"
            }" value="${brand}">
          <label class="form-check-label" for="brand${index}_${
                container === mobileBrandContainer ? "mobile" : "desktop"
            }">
            ${brand}
          </label>
        `;
            container.appendChild(brandCheckbox);
        });
    };

    // Populate both desktop and mobile containers
    populateContainer(brandContainer);
    populateContainer(mobileBrandContainer);

    // Implement brand search functionality for desktop
    // Use a more specific selector to target only the brand search input
    const brandSearch = document.querySelector(
        ".filter-section:nth-child(2) .filter-search input"
    );
    if (brandSearch) {
        brandSearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const brandCheckboxes =
                brandContainer?.querySelectorAll(".form-check") || [];

            brandCheckboxes.forEach((checkbox) => {
                const brandName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (brandName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }

    // Implement brand search functionality for mobile
    // Use a more specific selector for mobile brand search
    const mobileBrandSearch = document.querySelector(
        ".offcanvas-body .filter-section:nth-child(2) .filter-search input"
    );
    if (mobileBrandSearch) {
        mobileBrandSearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const mobileBrandCheckboxes =
                mobileBrandContainer?.querySelectorAll(".form-check") || [];

            mobileBrandCheckboxes.forEach((checkbox) => {
                const brandName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (brandName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }
}

// Function to populate category checkboxes
function populateCategoryFilters(categories) {
    const categoryContainer = document.querySelector(".category-options");
    const mobileCategoryContainer = document.querySelector(
        ".offcanvas-body .category-options"
    );

    if (!categoryContainer && !mobileCategoryContainer) return;

    // Function to populate a specific container
    const populateContainer = (container) => {
        if (!container) return;

        // Clear existing content
        container.innerHTML = "";

        // Add checkboxes for each category
        categories.forEach((category, index) => {
            const categoryCheckbox = document.createElement("div");
            categoryCheckbox.className = "form-check";
            categoryCheckbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="category${index}_${
                container === mobileCategoryContainer ? "mobile" : "desktop"
            }" value="${category}">
        <label class="form-check-label" for="category${index}_${
                container === mobileCategoryContainer ? "mobile" : "desktop"
            }">
          ${category}
        </label>
      `;
            container.appendChild(categoryCheckbox);
        });
    };

    // Populate both desktop and mobile containers
    populateContainer(categoryContainer);
    populateContainer(mobileCategoryContainer);

    // Implement category search functionality for desktop
    const categorySearch = document.querySelector(
        ".filter-section:first-child .filter-search input"
    );
    if (categorySearch) {
        categorySearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const categoryCheckboxes =
                categoryContainer?.querySelectorAll(".form-check") || [];

            categoryCheckboxes.forEach((checkbox) => {
                const categoryName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (categoryName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }

    // Implement category search functionality for mobile
    const mobileCategorySearch = document.querySelector(
        ".offcanvas-body .filter-section:first-child .filter-search input"
    );
    if (mobileCategorySearch) {
        mobileCategorySearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const mobileCategoryCheckboxes =
                mobileCategoryContainer?.querySelectorAll(".form-check") || [];

            mobileCategoryCheckboxes.forEach((checkbox) => {
                const categoryName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (categoryName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }
}

// Function to populate retailer checkboxes
function populateRetailerFilters(retailers) {
    const retailerContainer = document.querySelector(".retailer-options");
    const mobileRetailerContainer = document.querySelector(
        ".offcanvas-body .retailer-options"
    );

    if (!retailerContainer && !mobileRetailerContainer) return;

    // Function to populate a specific container
    const populateContainer = (container) => {
        if (!container) return;

        // Clear existing content
        container.innerHTML = "";

        // Add checkboxes for each retailer
        retailers.forEach((retailer, index) => {
            const retailerCheckbox = document.createElement("div");
            retailerCheckbox.className = "form-check";
            retailerCheckbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="retailer${index}_${
                container === mobileRetailerContainer ? "mobile" : "desktop"
            }" value="${retailer}">
        <label class="form-check-label" for="retailer${index}_${
                container === mobileRetailerContainer ? "mobile" : "desktop"
            }">
          ${retailer}
        </label>
      `;
            container.appendChild(retailerCheckbox);
        });
    };

    // Populate both desktop and mobile containers
    populateContainer(retailerContainer);
    populateContainer(mobileRetailerContainer);

    // Implement retailer search functionality for desktop
    const retailerSearch = document.querySelector(
        ".filter-section:nth-child(5) .filter-search input"
    );
    if (retailerSearch) {
        retailerSearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const retailerCheckboxes =
                retailerContainer?.querySelectorAll(".form-check") || [];

            retailerCheckboxes.forEach((checkbox) => {
                const retailerName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (retailerName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }

    // Implement retailer search functionality for mobile
    const mobileRetailerSearch = document.querySelector(
        ".offcanvas-body .filter-section:nth-child(5) .filter-search input"
    );
    if (mobileRetailerSearch) {
        mobileRetailerSearch.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const mobileRetailerCheckboxes =
                mobileRetailerContainer?.querySelectorAll(".form-check") || [];

            mobileRetailerCheckboxes.forEach((checkbox) => {
                const retailerName = checkbox
                    .querySelector("label")
                    .textContent.toLowerCase();
                if (retailerName.includes(searchTerm)) {
                    checkbox.style.display = "";
                } else {
                    checkbox.style.display = "none";
                }
            });
        });
    }
}

//get brands, categories etc...
async function fetchDistinctValues(endpoint) {
    try {
        const res = await fetch(`http://localhost:3000/Get/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search: "" }),
        });

        const result = await res.json();

        if (!result.data || !Array.isArray(result.data)) return [];

        return result.data.map((item) => {
            if (endpoint === "Categories") return item.cat_name;
            if (endpoint === "Retailers") return item.retailer_name;
            if (endpoint === "Brands") return item.brand_name;
            return item.name; // Fallback if needed
        });
    } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
        return [];
    }
}

async function populateFilters() {
    const categories = await fetchDistinctValues("Categories");
    const brands = await fetchDistinctValues("Brands");
    const retailers = await fetchDistinctValues("Retailers");

    populateCategoryFilters(categories);
    populateBrandFilters(brands);
    populateRetailerFilters(retailers);
}

// Add search functionality for the hero search bar
function setupHeroSearch() {
    const searchInput = document.querySelector(".hero-section .search-input");
    const searchButton = document.querySelector(".hero-section .search-btn");

    if (searchInput && searchButton) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.trim().toLowerCase();
            performSearch(query);
        });

        // Allow search on Enter key press
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim().toLowerCase();
                performSearch(query);
            }
        });
    }
}

async function performSearch(query) {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;
    const products = await fetchProducts({
        filters: {
            search: query,
        },
    });
    renderProducts(products);
}

function setupSortDropdown() {
    const sortDropdown = document.getElementById("sortOptions");
    if (!sortDropdown) return;

    sortDropdown.addEventListener("change", function () {
        const selected = this.value;
        let sortedProducts = [...currentProducts]; // clone to avoid modifying original

        switch (selected) {
            case "price_low":
                sortedProducts.sort((a, b) => a.final_price - b.final_price);
                break;
            case "price_high":
                sortedProducts.sort((a, b) => b.final_price - a.final_price);
                break;
            case "rating":
                sortedProducts.sort(
                    (a, b) => (b.rating || 0) - (a.rating || 0)
                );
                break;
            case "newest":
                //sort by ID (assuming newer IDs are later)
                sortedProducts.sort((a, b) =>
                    String(b.id).localeCompare(String(a.id))
                );
                break;
            default:
                //(reset to original)
                fetchProducts().then(renderProducts);
                break;
        }

        renderProducts(sortedProducts);
    });
}

function applyFilters() {
    document
        .querySelector(".filter-actions .btn-primary")
        .addEventListener("click", () => {
            updateActiveFilters();
            applyFilters();
        });

    document
        .querySelector(".filter-actions .btn-outline-secondary")
        .addEventListener("click", () => {
            document
                .querySelectorAll(".filters-container input")
                .forEach((input) => {
                    if (
                        input.type === "checkbox" ||
                        input.type === "range" ||
                        input.type === "number"
                    ) {
                        input.checked = false;
                        input.value = input.defaultValue || "";
                    }
                });

            // Reset filter state
            activeFilters = {
                categories: [],
                brands: [],
                retailers: [],
                ratings: [],
                minPrice: 0,
                maxPrice: Infinity,
            };

            fetchProducts().then(renderProducts); // Show all products again
        });

    (async () => {
        updateActiveFilters();
        if (activeFilters.ratings.length === 0) {
            activeFilters.ratings = [0];
        }

        const products = await fetchProducts({
            filters: {
                brands: activeFilters.brands,
                departments: activeFilters.categories,
                retailers: activeFilters.retailers,
                prices: [activeFilters.minPrice, activeFilters.maxPrice],
                rating: Math.min(...activeFilters.ratings),
            },
        });

        renderProducts(products);
    })();
}

function updateActiveFilters() {
    activeFilters.categories = Array.from(
        document.querySelectorAll(".category-options input:checked")
    ).map((cb) => cb.value);
    activeFilters.brands = Array.from(
        document.querySelectorAll(".brand-options input:checked")
    ).map((cb) => cb.value);
    activeFilters.retailers = Array.from(
        document.querySelectorAll(".retailer-options input:checked")
    ).map((cb) => cb.value);

    // Ratings: get selected checkboxes like rating4, rating3, etc.
    activeFilters.ratings = Array.from(
        document.querySelectorAll('input[id^="rating"]:checked')
    ).map((cb) => parseInt(cb.id.replace("rating", "")));

    // Price range from sliders or inputs
    const rangeMin = parseFloat(
        document.getElementById("priceRangeMin")?.value || 0
    );
    const rangeMax = parseFloat(
        document.getElementById("priceRangeMax")?.value || 10000
    );
    const inputMin = parseFloat(
        document.getElementById("minPrice")?.value || rangeMin
    );
    const inputMax = parseFloat(
        document.getElementById("maxPrice")?.value || rangeMax
    );

    activeFilters.minPrice = Math.min(rangeMin, inputMin || 0);
    activeFilters.maxPrice = Math.max(rangeMax, inputMax || Infinity);
}

function setupFilterButtons() {
    // "Apply Filters" button
    const applyBtn = document.querySelector(".filter-actions .btn-primary");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            updateActiveFilters();
            applyFilters();
        });
    }

    // "Clear All" button
    const clearBtn = document.querySelector(
        ".filter-actions .btn-outline-secondary"
    );
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            document
                .querySelectorAll(".filters-container input")
                .forEach((input) => {
                    if (
                        input.type === "checkbox" ||
                        input.type === "range" ||
                        input.type === "number"
                    ) {
                        input.checked = false;
                        input.value = input.defaultValue || "";
                    }
                });

            activeFilters = {
                categories: [],
                brands: [],
                retailers: [],
                ratings: [],
                minPrice: 0,
                maxPrice: Infinity,
            };

            fetchProducts().then(renderProducts);
        });
    }
}

// Initialize everything when the DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    let products = await fetchProducts();

    if (isDealsPage) {
        products = products.filter((product) => {
            const initial = parseFloat(product.initial_price) || 0;
            const final = parseFloat(product.final_price) || 0;
            const discount =
                initial > 0 ? ((initial - final) / initial) * 100 : 0;
            return discount >= 25;
        });
    }

    currentProducts = products;
    renderProductsWithPagination(currentProducts);
    setupLoadMoreButton();
    populateFilters();
    setupHeroSearch();
    setupSortDropdown();
    setupFilterButtons();
});

function showCustomNotification(message, type = 'info') {
    // Remove existing notification if present
    const existingNotification = document.getElementById("customNotificationModal");
    if (existingNotification) existingNotification.remove();

    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    const overlay = document.createElement("div");
    overlay.id = "customNotificationModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.4)"; // Slightly less dark overlay
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1050"; // Ensure it's above other modals if any

    const modal = document.createElement("div");
    modal.style.padding = "25px 30px";
    modal.style.borderRadius = "12px";
    modal.style.maxWidth = "400px";
    modal.style.width = "90%";
    modal.style.textAlign = "center";
    modal.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";

    if (isDarkMode) {
        modal.style.backgroundColor = "#2c3034"; // Darker background for dark mode
        modal.style.color = "#e9ecef";
        modal.style.border = "1px solid rgba(206, 147, 216, 0.2)";
    } else {
        modal.style.backgroundColor = "#ffffff";
        modal.style.color = "#212529";
        modal.style.border = "1px solid rgba(106, 27, 154, 0.2)";
    }

    let titleColor = isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)';
    let iconHtml = '';

    // Optional: Add icons based on type
    if (type === 'success') {
        titleColor = isDarkMode ? '#28a745' : '#198754'; // Green for success
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="color:${titleColor}; margin-bottom:10px;"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg><br/>`;
    } else if (type === 'error') {
        titleColor = isDarkMode ? '#dc3545' : '#dc3545'; // Red for error
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16" style="color:${titleColor}; margin-bottom:10px;"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><br/>`;
    }

    modal.innerHTML = `
        ${iconHtml}
        <p style="font-size: 1.1rem; margin-bottom: 20px; line-height: 1.6;">${message}</p>
        <button id="closeCustomNotification" style="padding: 10px 25px; border: none; background: ${titleColor}; color: ${isDarkMode && (type ==='success' || type ==='error') ? '#212529' : 'white'}; border-radius: 25px; cursor: pointer; font-weight: 500; transition: background-color 0.3s;">OK</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeButton = document.getElementById("closeCustomNotification");
    const defaultButtonBg = closeButton.style.backgroundColor;

    closeButton.addEventListener('mouseover', () => {
        // Basic hover: darken or lighten based on theme and type
        // This can be made more sophisticated with tinycolor.js or similar if needed
        closeButton.style.backgroundColor = isDarkMode ? (type === 'success' || type === 'error' ? lightenDarkenColor(defaultButtonBg, -10) : lightenDarkenColor(defaultButtonBg, 10)) : lightenDarkenColor(defaultButtonBg, -20) ;
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = defaultButtonBg;
    });

    closeButton.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Helper function for hover effect (optional, can be expanded)
function lightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    else if (col.startsWith('rgb')) { // Handle rgb/rgba
        let parts = col.match(/[\d\.]+/g);
        if (!parts || parts.length < 3) return col; // Invalid rgb
        let r = parseInt(parts[0]), g = parseInt(parts[1]), b = parseInt(parts[2]);
        r = Math.max(0, Math.min(255, r + amt));
        g = Math.max(0, Math.min(255, g + amt));
        b = Math.max(0, Math.min(255, b + amt));
        return `rgb(${r}, ${g}, ${b}${parts.length === 4 ? `, ${parts[3]}` : ''})`;
    }

    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}