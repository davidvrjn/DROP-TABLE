// This file is used to test the rendering of product cards on a webpage.
// It imports a function to create product card HTML and uses static data for testing.
// The static data includes product details such as ID, image URL, title, final price, initial price, and discount percentage.
// The rendered product cards are inserted into a container with the ID 'product-list'.
// This file is not intended for production use and is meant for testing purposes only.

// Import the function to generate product card HTML
import { createProductCardHTML } from "../partials/_product-card.js";

// Static data for testing product card rendering.
// This array contains 5 product objects.
const staticProductData = [
    {
        id: "prod-001",
        image_url:
            "https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg", // Placeholder image
        title: "Wireless Mouse but this is a longer name to test wrapping, some product titles go on forever",
        final_price: 299.99,
        retailer_name: "Amazon",
        rating: 4.5, // Average rating
        brand: "Apple",
        category: "Audio",
    },
    {
        id: "prod-002",
        image_url:
            "https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg",
        title: "Mechanical Keyboard",
        final_price: 750.0,
        retailer_name: "Checkers",
        initial_price: 1000.0, // Initial price for discount
        discount: 25, // Discount percentage
        brand: "Samsung",
        category: "Audio",
    },
    {
        id: "prod-003",
        image_url:
            "https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg",
        title: "USB-C Hub",
        final_price: 100000.5,
        retailer_name: "Pick n Pay",
        rating: 2.0,
        brand: "Sony",
        category: "Audio",
    },
    {
        id: "prod-004",
        image_url:
            "https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg",
        title: "Webcam 1080p",
        final_price: 1000000.0,
        retailer_name: "Takealot",
        initial_price: 1000001.0,
        discount: 20,
        brand: "LG",
        category: "Accesories",
    },
    {
        id: "prod-005",
        image_url:
            "https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg",
        title: "Monitor Stand",
        final_price: 350.0,
        retailer_name: "AReallyLongCompanyNameThatIsLongEnough",
        brand: "Google",
        category: "Wearables",
    },
];

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
const itemsPerPage = 3; // Show 3 products per page
let currentProducts = staticProductData; // Track the current dataset (for search/filter)

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
        .map((product) => createProductCardHTML(product))
        .join("");
    productListContainer.innerHTML = productCardsHTML;

    const loadMoreButton = document.getElementById("load-more-products");
    if (loadMoreButton) {
        loadMoreButton.style.display =
            end >= products.length ? "none" : "block";
    }

    // Future API implementation:
    /*
    fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}`)
        .then(response => response.json())
        .then(data => {
            data.products.forEach(product => {
                const productCardHTML = createProductCardHTML(product);
                productListContainer.innerHTML += productCardHTML;
            });
            loadMoreButton.style.display = data.hasMore ? 'block' : 'none';
        })
        .catch(error => console.error('Error loading products:', error));
    */
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

// Example usage with sample categories
const categories = [
    "Electronics",
    "Computers",
    "Smartphones",
    "Audio",
    "Gaming",
    "Accessories",
    "Home Appliances",
    "Wearables",
];

// Example usage with brands
const brands = [
    "Apple",
    "Samsung",
    "Sony",
    "LG",
    "Huawei",
    "Xiaomi",
    "Google",
    "OnePlus",
];

// Example usage with retailers
const retailers = [
    "Amazon",
    "Takealot",
    "Checkers",
    "Pick n Pay",
    "Game",
    "Makro",
    "Incredible Connection",
];

function populateFilters() {
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

function performSearch(query) {
    // For now, filter static data; later, this will call an API
    const filteredProducts = staticProductData.filter((product) =>
        product.title.toLowerCase().includes(query)
    );

    renderProducts(filteredProducts);

    // Future API implementation:
    /*
    fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(products => renderProducts(products))
        .catch(error => console.error('Search error:', error));
    */
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
                sortedProducts.sort((a, b) => b.id.localeCompare(a.id));
                break;
            default:
                //(reset to original)
                sortedProducts = [...staticProductData];
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

            renderProducts(staticProductData); // Show all products again
        });

    let filtered = staticProductData.filter((product) => {
        // Category filter (if product has category)
        if (
            activeFilters.categories.length > 0 &&
            product.category &&
            !activeFilters.categories.includes(product.category)
        ) {
            return false;
        }

        // Brand filter
        if (
            activeFilters.brands.length > 0 &&
            product.brand &&
            !activeFilters.brands.includes(product.brand)
        ) {
            return false;
        }

        // Retailer filter
        if (
            activeFilters.retailers.length > 0 &&
            !activeFilters.retailers.includes(product.retailer_name)
        ) {
            return false;
        }

        // Price range
        if (
            product.final_price < activeFilters.minPrice ||
            product.final_price > activeFilters.maxPrice
        ) {
            return false;
        }

        // Ratings
        const rating = product.rating || 0;
        if (
            activeFilters.ratings.length > 0 &&
            !activeFilters.ratings.some((min) => rating >= min)
        ) {
            return false;
        }

        return true;
    });

    renderProducts(filtered); // Show filtered products
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

            renderProducts(staticProductData);
        });
    }
}

// Initialize everything when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    renderProductsWithPagination();
    setupLoadMoreButton();
    populateFilters();
    setupHeroSearch();
    setupSortDropdown();
    setupFilterButtons();
});
