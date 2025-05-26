/**
 * Static Admin Test Script
 * This script provides functionality for the admin dashboard
 * It loads data from the API and sets up event handlers for admin operations
 * Includes robust error handling, debugging, and support for add/edit/delete
 * Fixes:
 * - TypeError: product.images is not iterable
 * - 400 Bad Request for Update/Product
 * - ReferenceError: bootstrap is not defined
 * - Category validation error despite selection
 * - Category displayed as "Unknown" for all products
 * - Simplified category handling to match reference code
 * - Fixed "Unknown" category by fetching products per category using filters.departments
 * Last updated: 12:19 AM SAST on Tuesday, May 27, 2025
 */

document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in and is an admin before initializing
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const userType = user.type;
    const isAdmin = userType === 'admin' || (Array.isArray(userType) && userType.includes('admin'));
    if (!user || !isAdmin || !(user.id || user.user_id)) {
        console.error("User not logged in or not an admin:", user);
        window.location.href = "/login";
        return;
    }
    // Initialize admin dashboard
    initializeAdminDashboard();
});

/**
 * Sets up the admin dashboard with API data and wires up event handlers
 */
async function initializeAdminDashboard() {
    // Load categories first to ensure availability for product mapping
    await loadCategories();
    await Promise.all([
        loadProducts(),
        loadRetailers(),
        loadBrands()
    ]);

    // Wire up search and filter functionality
    setupProductFilters();

    // Set up modal and form handlers
    setupModalHandlers();
}

// ===== DATA STORAGE =====
let products = [];
let categories = [];
let retailers = [];
let brands = [];

// ===== TABLE POPULATION FUNCTIONS =====

/**
 * Renders products table with API data
 * Also updates filter dropdowns with available options
 */
async function loadProducts() {
    const productsTable = document.getElementById("productsTable");
    if (!productsTable) {
        console.error("Products table not found");
        return;
    }

    const tbody = productsTable.querySelector("tbody");
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading products...</td></tr>';

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        let allProducts = [];

        // Fetch products for each category to ensure category_id association
        for (const category of categories) {
            const response = await fetch("http://localhost:3000/Get/Products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userid: user.id || user.user_id,
                    filters: { departments: [category.name] },
                    ordering: {},
                    limit: 10000
                }),
            });
            const result = await response.json();
            console.log(`Products API response for category ${category.name}:`, result);

            if (result.status === "success" && Array.isArray(result.data)) {
                const productsWithCategory = result.data.map(product => ({
                    ...product,
                    category_id: category.id
                }));
                allProducts.push(...productsWithCategory);
            } else {
                console.warn(`No products found for category ${category.name}:`, result.message);
            }
        }

        // Fetch products without category filter to catch any uncategorized products
        const response = await fetch("http://localhost:3000/Get/Products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userid: user.id || user.user_id,
                filters: {},
                ordering: {},
                limit: 10000
            }),
        });
        const result = await response.json();
        console.log("Products API response (no category filter):", result);

        if (result.status === "success" && Array.isArray(result.data)) {
            // Add uncategorized products, excluding those already fetched
            const existingIds = new Set(allProducts.map(p => p.id));
            const uncategorizedProducts = result.data
                .filter(product => !existingIds.has(product.id))
                .map(product => ({
                    ...product,
                    category_id: "" // Mark as uncategorized
                }));
            allProducts.push(...uncategorizedProducts);
        }

        // Remove duplicates by id (in case of overlaps)
        allProducts = Array.from(
            new Map(allProducts.map(p => [p.id, p])).values()
        );

        products = allProducts.map((product) => {
            console.log("Mapping product:", product);
            const categoryId = product.category_id?.toString() || "";
            const category = categories.find(cat => cat.id === categoryId);
            const categoryName = category ? category.name : "Unknown";

            if (categoryName === "Unknown" && categoryId) {
                console.warn(`No category matched for product ID ${product.id}, title: ${product.title}, category_id: ${categoryId}`);
            }

            return {
                id: product.id?.toString() || "",
                name: product.title || "Unknown",
                image: product.image_url || "",
                category: categoryName,
                category_id: categoryId,
                brand: product.brand_name || "Unknown",
                brand_id: product.brand_id?.toString() || "",
                minPrice: parseFloat(product.final_price) || 0,
                maxPrice: parseFloat(product.initial_price) || 0,
                retailers: Array.isArray(product.retailer_name)
                    ? product.retailer_name
                    : [product.retailer_name || "Unknown"],
                retailer_id: product.retailer_id?.toString() || "",
                description: product.description || "",
                features: Array.isArray(product.features) ? product.features : [],
                specifications: typeof product.specifications === 'object' && product.specifications
                    ? product.specifications
                    : {},
                images: Array.isArray(product.images) ? product.images : [],
                retail_details: Array.isArray(product.retail_details) ? product.retail_details : [],
            };
        });

        console.log("Mapped products:", products);

        tbody.innerHTML = "";
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
            return;
        }

        products.forEach((product) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <img src="${product.image || '/placeholder-image.jpg'}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R${product.minPrice.toFixed(2)} - R${product.maxPrice.toFixed(2)}</td>
                <td>${product.retailers.join(", ")}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary edit-product" data-product-id="${product.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-product" data-product-id="${product.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        populateFilterDropdowns();
    } catch (error) {
        console.error("Products fetch error:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error loading products: ${error.message}</td></tr>`;
    }
}

/**
 * Renders categories table with API data
 * Also populates category dropdowns in the product form
 */
async function loadCategories() {
    const categoriesTable = document.getElementById("categoriesTable");
    if (!categoriesTable) {
        console.error("Categories table not found");
        return;
    }

    const tbody = categoriesTable.querySelector("tbody");
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Loading categories...</td></tr>';

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        console.log("Categories API response:", result);

        if (result.status === "success" && Array.isArray(result.data)) {
            categories = result.data.map((category) => ({
                id: category.id?.toString() || category.cat_id?.toString() || "",
                name: category.cat_name || "Unknown",
                productCount: category.product_count || 0,
            }));

            tbody.innerHTML = "";
            if (categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found</td></tr>';
                return;
            }

            categories.forEach((category) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${category.name}</td>
                    <td>${category.productCount}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary edit-category" data-category-id="${category.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger delete-category" data-category-id="${category.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            populateCategoryDropdown();
        } else {
            console.error("Categories API error:", result.message);
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Error loading categories: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Categories fetch error:", error);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Error loading categories: ${error.message}</td></tr>`;
    }
}

/**
 * Renders retailers table with API data
 * Also populates retailer dropdowns in the product form
 */
async function loadRetailers() {
    const retailersTable = document.getElementById("retailersTable");
    if (!retailersTable) {
        console.error("Retailers table not found");
        return;
    }

    const tbody = retailersTable.querySelector("tbody");
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading retailers...</td></tr>';

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Retailers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        console.log("Retailers API response:", result);

        if (result.status === "success" && Array.isArray(result.data)) {
            retailers = result.data.map((retailer) => ({
                id: retailer.retailer_id?.toString() || "",
                name: retailer.retailer_name || "Unknown",
                website: retailer.website || "#",
                productCount: retailer.product_count || 0,
            }));

            tbody.innerHTML = "";
            if (retailers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No retailers found</td></tr>';
                return;
            }

            retailers.forEach((retailer) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${retailer.name}</td>
                    <td><a href="${retailer.website}" target="_blank">${retailer.website}</a></td>
                    <td>${retailer.productCount}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary edit-retailer" data-retailer-id="${retailer.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger delete-retailer" data-retailer-id="${retailer.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            populateRetailerDropdown();
        } else {
            console.error("Retailers API error:", result.message);
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Error loading retailers: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Retailers fetch error:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Error loading retailers: ${error.message}</td></tr>`;
    }
}

/**
 * Renders brands table with API data
 * Also populates brand dropdowns in the product form
 */
async function loadBrands() {
    const brandsTable = document.getElementById("brandsTable");
    if (!brandsTable) {
        console.error("Brands table not found");
        return;
    }

    const tbody = brandsTable.querySelector("tbody");
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Loading brands...</td></tr>';

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        console.log("Brands API response:", result);

        if (result.status === "success" && Array.isArray(result.data)) {
            brands = result.data.map((brand) => ({
                id: brand.brand_id?.toString() || "",
                name: brand.brand_name || "Unknown",
                productCount: brand.product_count || 0,
            }));

            tbody.innerHTML = "";
            if (brands.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">No brands found</td></tr>';
                return;
            }

            brands.forEach((brand) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${brand.name}</td>
                    <td>${brand.productCount}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary edit-brand" data-brand-id="${brand.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger delete-brand" data-brand-id="${brand.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            populateBrandDropdown();
        } else {
            console.error("Brands API error:", result.message);
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Error loading brands: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Brands fetch error:", error);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Error loading brands: ${error.message}</td></tr>`;
    }
}

// ===== DROPDOWN POPULATION FUNCTIONS =====

/**
 * Populates filter dropdowns with unique values from product data
 */
function populateFilterDropdowns() {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        const firstOption = categoryFilter.options[0] || new Option("All Categories", "");
        categoryFilter.innerHTML = "";
        categoryFilter.appendChild(firstOption);

        const uniqueCategories = [...new Set(products.map((product) => product.category))].sort();
        uniqueCategories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    const retailerFilter = document.getElementById("retailerFilter");
    if (retailerFilter) {
        const firstOption = retailerFilter.options[0] || new Option("All Retailers", "");
        retailerFilter.innerHTML = "";
        retailerFilter.appendChild(firstOption);

        const uniqueRetailers = [...new Set(products.flatMap((product) => product.retailers))].sort();
        uniqueRetailers.forEach((retailer) => {
            const option = document.createElement("option");
            option.value = retailer;
            option.textContent = retailer;
            retailerFilter.appendChild(option);
        });
    }
}

/**
 * Populates category dropdown in the add product form
 */
function populateCategoryDropdown() {
    const productCategory = document.getElementById("productCategory");
    if (productCategory) {
        const firstOption = productCategory.options[0] || new Option("Select Category", "");
        productCategory.innerHTML = "";
        productCategory.appendChild(firstOption);

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            productCategory.appendChild(option);
        });
    } else {
        console.error("Product category dropdown not found");
    }
}

/**
 * Populates brand dropdown in the add product form
 */
function populateBrandDropdown() {
    const productBrand = document.getElementById("productBrand");
    if (productBrand) {
        const firstOption = productBrand.options[0] || new Option("Select Brand", "");
        productBrand.innerHTML = "";
        productBrand.appendChild(firstOption);

        brands.forEach((brand) => {
            const option = document.createElement("option");
            option.value = brand.id;
            option.textContent = brand.name;
            productBrand.appendChild(option);
        });
    }
}

/**
 * Populates retailer dropdowns in the add product form
 */
function populateRetailerDropdown() {
    const retailerSelects = document.querySelectorAll(".retailer-select");
    console.log("Populating retailer dropdowns, retailers:", retailers);
    retailerSelects.forEach((select) => {
        const firstOption = select.options[0] || new Option("Select Retailer", "");
        select.innerHTML = "";
        select.appendChild(firstOption);

        retailers.forEach((retailer) => {
            const option = document.createElement("option");
            option.value = retailer.id;
            option.textContent = retailer.name;
            select.appendChild(option);
        });
    });
}

// ===== EVENT HANDLERS =====

/**
 * Sets up event listeners for the product filtering UI
 */
function setupProductFilters() {
    const productSearch = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const retailerFilter = document.getElementById("retailerFilter");
    const resetFilters = document.getElementById("resetFilters");

    if (productSearch) {
        productSearch.addEventListener("input", filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterProducts);
    }

    if (retailerFilter) {
        retailerFilter.addEventListener("change", filterProducts);
    }

    if (resetFilters) {
        resetFilters.addEventListener("click", function () {
            if (productSearch) productSearch.value = "";
            if (categoryFilter) categoryFilter.value = "";
            if (retailerFilter) retailerFilter.value = "";
            filterProducts();
        });
    }
}

/**
 * Filters the products table based on search term and dropdown selections
 */
function filterProducts() {
    const productSearch = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const retailerFilter = document.getElementById("retailerFilter");

    const searchTerm = productSearch ? productSearch.value.toLowerCase() : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "";
    const retailerValue = retailerFilter ? retailerFilter.value : "";

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);

        const matchesCategory =
            categoryValue === "" || product.category === categoryValue;

        const matchesRetailer =
            retailerValue === "" || product.retailers.includes(retailerValue);

        return matchesSearch && matchesCategory && matchesRetailer;
    });

    const productsTable = document.getElementById("productsTable");
    if (!productsTable) return;

    const tbody = productsTable.querySelector("tbody");
    tbody.innerHTML = "";

    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }

    filteredProducts.forEach((product) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <img src="${product.image || '/placeholder-image.jpg'}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>R${product.minPrice.toFixed(2)} - R${product.maxPrice.toFixed(2)}</td>
            <td>${product.retailers.join(", ")}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-product" data-product-id="${product.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-product" data-product-id="${product.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Sets up event handlers for all modals and forms
 */
function setupModalHandlers() {
    // Wire up the "Add Retailer" button in product form
    const addRetailerBtn = document.getElementById("addRetailerBtn");
    if (addRetailerBtn) {
        addRetailerBtn.addEventListener("click", function () {
            const retailerPricesContainer = document.getElementById("retailerPricesContainer");
            if (retailerPricesContainer) {
                const newRow = document.createElement("div");
                newRow.className = "row mb-2 retailer-price-row";
                newRow.innerHTML = `
                    <div class="col-md-5 col-5">
                        <select class="form-select retailer-select" name="retailerId[]">
                            <option value="">Select Retailer</option>
                        </select>
                    </div>
                    <div class="col-md-4 col-4">
                        <div class="input-group">
                            <span class="input-group-text">R</span>
                            <input type="number" class="form-control retailer-price" name="retailerPrice[]" step="0.01" min="0" placeholder="Price">
                        </div>
                    </div>
                    <div class="col-md-2 col-2">
                        <input type="number" class="form-control retailer-discount" name="retailerDiscount[]" min="0" max="100" placeholder="Discount %">
                    </div>
                    <div class="col-md-1 col-1">
                        <button type="button" class="btn btn-outline-danger remove-retailer"><i class="bi bi-trash"></i></button>
                    </div>
                `;
                retailerPricesContainer.appendChild(newRow);

                populateRetailerDropdown();

                const removeBtn = newRow.querySelector(".remove-retailer");
                removeBtn.addEventListener("click", function () {
                    newRow.remove();
                });
            } else {
                console.error("Retailer prices container not found");
            }
        });
    } else {
        console.error("Add retailer button not found");
    }

    // Wire up the "Add Specification" button in product form
    const addSpecBtn = document.getElementById("addSpecBtn");
    if (addSpecBtn) {
        addSpecBtn.addEventListener("click", function () {
            const specificationsContainer = document.getElementById("specificationsContainer");
            if (specificationsContainer) {
                const newRow = document.createElement("div");
                newRow.className = "row mb-2 spec-row";
                newRow.innerHTML = `
                    <div class="col-5">
                        <input type="text" class="form-control" placeholder="Name" name="specName[]">
                    </div>
                    <div class="col-6">
                        <input type="text" class="form-control" placeholder="Value" name="specValue[]">
                    </div>
                    <div class="col-1">
                        <button type="button" class="btn btn-outline-danger remove-spec"><i class="bi bi-trash"></i></button>
                    </div>
                `;
                specificationsContainer.appendChild(newRow);

                const removeBtn = newRow.querySelector(".remove-spec");
                removeBtn.addEventListener("click", function () {
                    newRow.remove();
                });
            } else {
                console.error("Specifications container not found");
            }
        });
    } else {
        console.error("Add specification button not found");
    }

    // Save buttons for each modal
    const saveButtons = {
        saveProductBtn: {
            entity: "Product",
            formId: "addProductForm",
            modalId: "addProductModal",
            endpoint: "Add/Product",
        },
        saveCategoryBtn: {
            entity: "Category",
            formId: "addCategoryForm",
            modalId: "addCategoryModal",
            endpoint: "Add/Category",
        },
        saveRetailerBtn: {
            entity: "Retailer",
            formId: "addRetailerForm",
            modalId: "addRetailerModal",
            endpoint: "Add/Retailer",
        },
        saveBrandBtn: {
            entity: "Brand",
            formId: "addBrandForm",
            modalId: "addBrandModal",
            endpoint: "Add/Brand",
        },
    };

    Object.entries(saveButtons).forEach(([btnId, { entity, formId, modalId, endpoint }]) => {
        const btn = document.getElementById(btnId);
        const form = document.getElementById(formId);
        if (btn && form) {
            let idField = form.querySelector(`input[name="${entity.toLowerCase()}Id"]`);
            if (!idField) {
                idField = document.createElement("input");
                idField.type = "hidden";
                idField.name = `${entity.toLowerCase()}Id`;
                form.appendChild(idField);
            }

            btn.addEventListener("click", async function () {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const formData = new FormData(form);
                const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
                let data = { userid: user.id || user.user_id };

                if (entity === "Product") {
                    const specifications = [];
                    const specNames = formData.getAll("specName[]");
                    const specValues = formData.getAll("specValue[]");
                    for (let i = 0; i < Math.min(specNames.length, specValues.length); i++) {
                        if (specNames[i] && specValues[i]) {
                            specifications.push({ name: specNames[i], value: specValues[i] });
                        }
                    }
                    const retailDetails = [];
                    const retailerIds = formData.getAll("retailerId[]");
                    const retailerPrices = formData.getAll("retailerPrice[]");
                    const retailerDiscounts = formData.getAll("retailerDiscount[]");
                    for (let i = 0; i < Math.min(retailerIds.length, retailerPrices.length); i++) {
                        if (retailerIds[i] && retailerPrices[i]) {
                            const initialPrice = parseFloat(retailerPrices[i]);
                            const discount = parseFloat(retailerDiscounts[i]) || 0;
                            const finalPrice = initialPrice * (1 - discount / 100);
                            retailDetails.push({
                                retailer_id: retailerIds[i],
                                initial_price: initialPrice,
                                final_price: Number.isFinite(finalPrice) ? finalPrice : initialPrice,
                            });
                        }
                    }
                    const imageUrls = formData.get("productImageUrl")
                        ?.split("\n")
                        .map(url => url.trim())
                        .filter(url => url && /^https?:\/\/.+/.test(url)) || [];
                    const categoryId = formData.get("productCategory");
                    const brandId = formData.get("productBrand");
                    const title = formData.get("productName");

                    if (!categoryId) {
                        alert("Please select a category.");
                        form.querySelector('#productCategory').focus();
                        return;
                    }
                    if (!brandId) {
                        alert("Please select a brand.");
                        form.querySelector('#productBrand').focus();
                        return;
                    }
                    if (!title) {
                        alert("Please enter a product title.");
                        form.querySelector('#productName').focus();
                        return;
                    }
                    if (!imageUrls.length) {
                        alert("Please provide at least one valid image URL.");
                        form.querySelector('#productImageUrl').focus();
                        return;
                    }
                    if (!retailDetails.length) {
                        alert("Please add at least one retailer with a price.");
                        form.querySelector('.retailer-select')?.focus();
                        return;
                    }

                    data = {
                        ...data,
                        product_id: formData.get("productId") || undefined, // Changed from productid to product_id
                        category_id: categoryId,
                        brand_id: brandId,
                        title: title,
                        description: formData.get("productDescription") || "",
                        specifications: specifications.length ? specifications.reduce((obj, spec) => {
                            obj[spec.name] = spec.value;
                            return obj;
                        }, {}) : undefined,
                        features: formData.get("productKeyFeatures")
                            ?.split("\n")
                            .map(feature => feature.trim())
                            .filter(feature => feature) || [],
                        image_url: imageUrls[0] || "",
                        images: imageUrls.slice(1),
                        retail_details: retailDetails.length ? retailDetails : undefined,
                    };
                    endpoint = data.product_id ? "Update/Product" : "Add/Product";
                } else {
                    data = {
                        ...data,
                        id: formData.get(`${entity.toLowerCase()}Id`) || undefined,
                        [`${entity.toLowerCase()}_name`]: formData.get(`${entity.toLowerCase()}Name`) || "",
                        ...(entity === "Retailer" && {
                            website: formData.get("retailerWebsite") || "",
                        }),
                    };
                    endpoint = data.id ? `Update/${entity}` : `Add/${entity}`;
                }

                console.log(`Saving ${entity}, endpoint: ${endpoint}, data:`, data);

                try {
                    const response = await fetch(`http://localhost:3000/${endpoint}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    console.log(`${entity} API response:`, result);

                    if (response.status === 200 && result.status === "success") {
                        alert(`${entity} ${data.id || data.product_id ? "updated" : "saved"} successfully! Message: ${result.message}`);
                        const modalElement = document.getElementById(modalId);
                        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modal = bootstrap.Modal.getInstance(modalElement);
                            if (modal) {
                                modal.hide();
                            }
                        } else if (modalElement) {
                            modalElement.classList.remove('show');
                            modalElement.style.display = 'none';
                            modalElement.setAttribute('aria-hidden', 'true');
                            document.body.classList.remove('modal-open');
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                        }
                        form.reset();
                        idField.value = "";

                        switch (entity) {
                            case "Product":
                                loadProducts();
                                break;
                            case "Category":
                                loadCategories();
                                break;
                            case "Retailer":
                                loadRetailers();
                                break;
                            case "Brand":
                                loadBrands();
                                break;
                        }
                    } else {
                        console.error(`${entity} save error:`, result.message);
                        alert(`Error ${data.id || data.product_id ? "updating" : "saving"} ${entity}: ${result.message}`);
                    }
                } catch (error) {
                    console.error(`${entity} save error:`, error);
                    alert(`Error ${data.id || data.product_id ? "updating" : "saving"} ${entity}: ${error.message}`);
                }
            });
        } else {
            console.error(`Save button or form not found for ${entity}:`, { btnId, formId });
        }
    });

    // Setup edit and delete buttons (delegated event handling)
    document.addEventListener("click", async function (e) {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        if (!user || !(user.id || user.user_id)) {
            console.error("User not found for operation");
            alert("User ID not found. Please log in again.");
            return;
        }

        if (e.target.closest(".edit-product")) {
            const productId = e.target.closest(".edit-product").getAttribute("data-product-id");
            console.log("Edit product clicked, ID:", productId);
            const product = products.find((p) => p.id.toString() === productId);
            if (product) {
                console.log("Product found:", product);
                const form = document.getElementById("addProductForm");
                const modalTitle = document.getElementById("addProductModalLabel");
                if (!form || !modalTitle) {
                    console.error("Product form or modal title not found");
                    alert("Error: Product form not found");
                    return;
                }
                modalTitle.textContent = "Edit Product";
                form.querySelector('[name="productId"]').value = product.id;
                form.querySelector('#productName').value = product.name || "";
                form.querySelector('#productCategory').value = product.category_id || "";
                form.querySelector('#productBrand').value = product.brand_id || "";
                const imageUrls = [
                    product.image || "",
                    ...(Array.isArray(product.images) ? product.images : [])
                ].filter(url => url);
                form.querySelector('#productImageUrl').value = imageUrls.join("\n");
                form.querySelector('#productDescription').value = product.description || "";
                form.querySelector('#productKeyFeatures').value = (Array.isArray(product.features) ? product.features : []).join("\n");

                const retailerPricesContainer = document.getElementById("retailerPricesContainer");
                if (retailerPricesContainer) {
                    retailerPricesContainer.innerHTML = "";
                    (Array.isArray(product.retail_details) ? product.retail_details : []).forEach(retail => {
                        const newRow = document.createElement("div");
                        newRow.className = "row mb-2 retailer-price-row";
                        const discount = retail.initial_price && retail.final_price && retail.initial_price > 0
                            ? ((1 - retail.final_price / retail.initial_price) * 100).toFixed(2)
                            : 0;
                        newRow.innerHTML = `
                            <div class="col-md-5 col-5">
                                <select class="form-select retailer-select" name="retailerId[]">
                                    <option value="">Select Retailer</option>
                                </select>
                            </div>
                            <div class="col-md-4 col-4">
                                <div class="input-group">
                                    <span class="input-group-text">R</span>
                                    <input type="number" class="form-control retailer-price" name="retailerPrice[]" step="0.01" min="0" value="${retail.initial_price || 0}">
                                </div>
                            </div>
                            <div class="col-md-2 col-2">
                                <input type="number" class="form-control retailer-discount" name="retailerDiscount[]" min="0" max="100" value="${discount}">
                            </div>
                            <div class="col-md-1 col-1">
                                <button type="button" class="btn btn-outline-danger remove-retailer"><i class="bi bi-trash"></i></button>
                            </div>
                        `;
                        retailerPricesContainer.appendChild(newRow);
                        const select = newRow.querySelector(".retailer-select");
                        populateRetailerDropdown();
                        if (select && retail.retailer_id) {
                            select.value = retail.retailer_id;
                        }
                        newRow.querySelector(".remove-retailer").addEventListener("click", function() {
                            newRow.remove();
                        });
                    });
                } else {
                    console.error("Retailer prices container not found");
                }

                const specificationsContainer = document.getElementById("specificationsContainer");
                if (specificationsContainer) {
                    specificationsContainer.innerHTML = "";
                    const specs = typeof product.specifications === 'object' && product.specifications
                        ? Object.entries(product.specifications)
                        : [];
                    specs.forEach(([name, value]) => {
                        const newRow = document.createElement("div");
                        newRow.className = "row mb-2 spec-row";
                        newRow.innerHTML = `
                            <div class="col-5">
                                <input type="text" class="form-control" placeholder="Name" name="specName[]" value="${name}">
                            </div>
                            <div class="col-6">
                                <input type="text" class="form-control" placeholder="Value" name="specValue[]" value="${value}">
                            </div>
                            <div class="col-1">
                                <button type="button" class="btn btn-outline-danger remove-spec"><i class="bi bi-trash"></i></button>
                            </div>
                        `;
                        specificationsContainer.appendChild(newRow);
                        newRow.querySelector(".remove-spec").addEventListener("click", function () {
                            newRow.remove();
                        });
                    });
                } else {
                    console.error("Specifications container not found");
                }

                const modalElement = document.getElementById("addProductModal");
                if (!modalElement) {
                    console.error("Modal element not found: addProductModal");
                    alert("Error: Product modal not found");
                    return;
                }
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    try {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    } catch (modalError) {
                        console.error("Error initializing Bootstrap Modal:", modalError);
                        alert("Error: Unable to open product modal. Please try again.");
                    }
                } else {
                    console.error("Bootstrap is not defined. Ensure Bootstrap JS is loaded.");
                    alert("Error: Unable to open product modal. Please ensure Bootstrap is loaded.");
                    modalElement.classList.add('show');
                    modalElement.style.display = 'block';
                    modalElement.setAttribute('aria-hidden', 'false');
                    document.body.classList.add('modal-open');
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }
            } else {
                console.error("Product not found for ID:", productId);
                alert("Product not found!");
            }
        } else if (e.target.closest(".delete-product")) {
            const productId = e.target.closest(".delete-product").getAttribute("data-product-id");
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    const response = await fetch("http://localhost:3000/Remove/Product", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            product_id: parseInt(productId),
                            userid: user.id || user.user_id,
                        }),
                    });
                    const result = await response.json();
                    console.log("Delete product response:", result);
                    if (response.status === 200 && result.status === "success") {
                        alert(`Product ${productId} deleted successfully! Message: ${result.message}`);
                        loadProducts();
                    } else {
                        console.error("Delete product error:", result.message);
                        alert(`Error deleting product: ${result.message}`);
                    }
                } catch (error) {
                    console.error("Delete product error:", error);
                    alert(`Error deleting product: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-category")) {
            const categoryId = e.target.closest(".edit-category").getAttribute("data-category-id");
            const category = categories.find((c) => c.id === categoryId);
            if(category) {
                const form = document.getElementById("addCategoryForm");
                const modalTitle = document.getElementById("addCategoryModalLabel");
                if(form && modalTitle) {
                    modalTitle.textContent = "Edit Category";
                    form.querySelector('[name="categoryId"]').value = category.id;
                    form.querySelector('#categoryName').value = category.name;
                    const modalEl = document.getElementById("addCategoryModal");
                    if(modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = new bootstrap.Modal(modalEl);
                        modal.show();
                    } else {
                        console.error("Bootstrap is not defined or modal not found.");
                        alert("Error: Unable to open category modal.");
                        modalEl.classList.add('show');
                        modalEl.style.display = 'block';
                        modalEl.setAttribute('aria-hidden', 'false');
                        document.body.classList.add('modal-open');
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                } else {
                    console.error("Category form or modal title not found");
                }
            } else {
                console.error("Category not found for ID:", categoryId);
                alert("Category not found!");
            }
        } else if (e.target.closest(".delete-category")) {
            const categoryId = e.target.closest(".delete-category").getAttribute("data-category-id");
            if(confirm("Are you sure you want to delete this category?")) {
                try {
                    const response = await fetch("http://localhost:3000/Remove/Category", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: categoryId,
                            userid: user.id || user.user_id,
                        }),
                    });
                    const result = await response.json();
                    console.log("Delete category response:", result);
                    if(response.status === 200 && result.status === "success") {
                        alert(`Category ${categoryId} deleted successfully! Message: ${result.message}`);
                        loadCategories();
                    } else {
                        console.error("Delete category error:", result.message);
                        alert(`Error deleting category: ${result.message}`);
                    }
                } catch (error) {
                    console.error("Delete category error:", error);
                    alert(`Error deleting category: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-retailer")) {
            const retailerId = e.target.closest(".edit-retailer").getAttribute("data-retailer-id");
            const retailer = retailers.find((r) => r.id === retailerId);
            if (retailer) {
                const form = document.getElementById("addRetailerForm");
                const modalTitle = document.getElementById("addRetailerModalLabel");
                if(form && modalTitle) {
                    modalTitle.textContent = "Edit Retailer";
                    form.querySelector('[name="retailerId"]').value = retailer.id;
                    form.querySelector('#retailerName').value = retailer.name;
                    form.querySelector('#retailerWebsite').value = retailer.website;
                    const modalElement = document.getElementById("addRetailerModal");
                    if(modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    } else {
                        console.error("Bootstrap is not defined or modal not found for retailer.");
                        alert("Error: Unable to open retailer modal.");
                        modalElement.classList.add('show');
                        modalElement.style.display = 'block';
                        modalElement.setAttribute('aria-hidden', 'true');
                        document.body.classList.add('modal-open');
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                } else {
                    console.error("Retailer form or modal title not found");
                }
            } else {
                console.error("Retailer not found for ID:", retailerId);
                alert("Retailer not found!");
            }
        } else if (e.target.closest(".delete-retailer")) {
            const retailerId = e.target.closest(".delete-retailer").getAttribute("data-retailer-id");
            if(confirm("Are you sure you want to delete this retailer?")) {
                try {
                    const response = await fetch("http://localhost:3000/Remove/Retailer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: retailerId,
                            userid: user.id || user.user_id,
                        }),
                    });
                    const result = await response.json();
                    console.log("Delete retailer response:", result);
                    if(response.status === 200 && result.status === "success") {
                        alert(`Retailer ${retailerId} deleted successfully! Message ${result.message}`);
                        loadRetailers();
                    } else {
                        console.error("Delete retailer error:", result.message);
                        alert(`Error deleting retailer: ${result.message}`);
                    }
                } catch(error) {
                    console.error("Delete retailer error:", error);
                    alert(`Error deleting retailer: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-brand")) {
            const brandId = e.target.closest(".edit-brand").getAttribute("data-brand-id");
            const brand = brands.find((b) => b.id === brandId);
            if(brand) {
                const form = document.getElementById("addBrandForm");
                const modalTitle = document.getElementById("addBrandModalLabel");
                if(form && modalTitle) {
                    modalTitle.textContent = "Edit Brand";
                    form.querySelector('[name="brandId"]').value = brand.id;
                    form.querySelector('#brandName').value = brand.name;
                    const modalElement = document.getElementById("addBrandModal");
                    if(modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    } else {
                        console.error("Bootstrap is not defined or modal not found for brand.");
                        alert("Error: Unable to open brand modal.");
                        modalElement.classList.add('show');
                        modalElement.style.display = 'block';
                        modalElement.setAttribute('aria-hidden', 'false');
                        document.body.classList.add('modal-open');
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                } else {
                    console.error("Brand form or modal title not found");
                }
            } else {
                console.error("Brand not found for ID:", brandId);
                alert("Brand not found!");
            }
        } else if (e.target.closest(".delete-brand")) {
            const brandId = e.target.closest(".delete-brand").getAttribute("data-brand-id");
            if(confirm("Are you sure you want to delete this brand?")) {
                try {
                    const response = await fetch("http://localhost:3000/Remove/Brand", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: brandId,
                            userid: user.id || user.user_id,
                        }),
                    });
                    const result = await response.json();
                    console.log("Delete brand response:", result);
                    if (response.status === 200 && result.status === "success") {
                        alert(`Brand ${brandId} deleted successfully! Message ${result.message}`);
                        loadBrands();
                    } else {
                        console.error("Delete brand error:", result.message);
                        alert(`Error deleting brand: ${result.message}`);
                    }
                } catch (error) {
                    console.error("Delete brand error:", error);
                    alert("Error deleting brand: ${error.message}");
                }
            }
        }
    });

    // Reset modal fields when modals are hidden
    const modals = [
        { id: "addProductModal", labelId: "addProductModalLabel", title: "Add New Product", formId: "addProductForm" },
        { id: "addCategoryModal", labelId: "addCategoryModalLabel", title: "Add New Category", formId: "addCategoryForm" },
        { id: "addRetailerModal", labelId: "addRetailerModalLabel", title: "Add New Retailer", formId: "addRetailerForm" },
        { id: "addBrandModal", labelId: "addBrandModalLabel", title: "Add New Brand", formId: "addBrandForm" },
    ];

    modals.forEach(({ id, labelId, title, formId }) => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            modalEl.addEventListener("hidden.bs.modal", function () {
                const modalTitle = document.getElementById(labelId);
                const form = document.getElementById(formId);
                if (modalTitle) {
                    modalTitle.textContent = title;
                }
                if (form) {
                    form.reset();
                    const idField = form.querySelector(`input[name="${formId.replace('add', '').toLowerCase()}Id"]`);
                    if (idField) idField.value = "";
                    if (formId === "addProductForm") {
                        const retailerPricesContainer = document.getElementById("retailerPricesContainer");
                        const specificationsContainer = document.getElementById("specificationsContainer");
                        if (retailerPricesContainer) retailerPricesContainer.innerHTML = "";
                        if (specificationsContainer) specificationsContainer.innerHTML = "";
                    }
                }
            });
        }
    });
}