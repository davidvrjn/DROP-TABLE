/**
 * Static Admin Test Script
 * This script provides functionality for the admin dashboard
 * It loads data from the API and sets up event handlers for admin operations
 * UPDATED TO CHECK ADMIN LOGIN AND HANDLE AUTHENTICATION FROM USER OBJECT
 */

document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in and is an admin before initializing
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const userType = user.type;
    const isAdmin = userType === 'admin' || (Array.isArray(userType) && userType.includes('admin'));
    if (!user || !isAdmin) {
        window.location.href = "/login";
        return;
    }
    // Initialize admin dashboard
    initializeAdminDashboard();
});

/**
 * Sets up the admin dashboard with API data and wires up event handlers
 */
function initializeAdminDashboard() {
    // Populate tables with API data
    loadProducts();
    loadCategories();
    loadRetailers();
    loadBrands();

    // Wire up search and filter functionality
    setupProductFilters();

    // Set up modal and form handlers
    setupModalHandlers();
}

// ===== DATA STORAGE (REPLACING MOCK DATA) =====

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
    if (!productsTable) return;

    const tbody = productsTable.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userid: user.id || user.user_id, // Use user.id or user.user_id if available
            }),
        });
        const result = await response.json();
        if (result.status === "success") {
            products = result.data.map((product) => ({
                id: product.id,
                name: product.title,
                image: product.image_url,
                category: product.category_name || "Unknown",
                minPrice: parseFloat(product.final_price) || 0,
                maxPrice: parseFloat(product.initial_price) || 0,
                retailers: [product.retailer_name],
                brand: product.brand_name || "Unknown",
            }));

            if (products.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="6" class="text-center">No products found</td></tr>';
                return;
            }

            products.forEach((product) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <img src="${product.image}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
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

            // Populate filter dropdowns with unique categories and retailers
            populateFilterDropdowns();
        } else {
            tbody.innerHTML =
                '<tr><td colspan="6" class="text-center">Error loading products: ' +
                result.message +
                "</td></tr>";
        }
    } catch (error) {
        tbody.innerHTML =
            '<tr><td colspan="6" class="text-center">Error loading products: ' +
            error.message +
            "</td></tr>";
    }
}

/**
 * Renders categories table with API data
 * Also populates category dropdowns in the product form
 */
async function loadCategories() {
    const categoriesTable = document.getElementById("categoriesTable");
    if (!categoriesTable) return;

    const tbody = categoriesTable.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        categories = result.data.map((category) => ({
            id: category.cat_id,
            name: category.cat_name,
            productCount: 0,
        }));

        if (categories.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="3" class="text-center">No categories found</td></tr>';
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

        // Also populate category dropdowns in the add product form
        populateCategoryDropdown();
    } catch (error) {
        tbody.innerHTML =
            '<tr><td colspan="3" class="text-center">Error loading categories: ' +
            error.message +
            "</td></tr>";
    }
}

/**
 * Renders retailers table with API data
 * Also populates retailer dropdowns in the product form
 */
async function loadRetailers() {
    const retailersTable = document.getElementById("retailersTable");
    if (!retailersTable) return;

    const tbody = retailersTable.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Retailers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        retailers = result.data.map((retailer) => ({
            id: retailer.retailer_id,
            name: retailer.retailer_name,
            website: "#",
            productCount: 0,
        }));

        if (retailers.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="4" class="text-center">No retailers found</td></tr>';
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

        // Also populate retailer dropdowns in the add product form
        populateRetailerDropdown();
    } catch (error) {
        tbody.innerHTML =
            '<tr><td colspan="4" class="text-center">Error loading retailers: ' +
            error.message +
            "</td></tr>";
    }
}

/**
 * Renders brands table with API data
 * Also populates brand dropdowns in the product form
 */
async function loadBrands() {
    const brandsTable = document.getElementById("brandsTable");
    if (!brandsTable) return;

    const tbody = brandsTable.querySelector("tbody");
    tbody.innerHTML = "";

    try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const response = await fetch("http://localhost:3000/Get/Brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "", userid: user.id || user.user_id }),
        });
        const result = await response.json();
        brands = result.data.map((brand) => ({
            id: brand.brand_id,
            name: brand.brand_name,
            productCount: 0,
        }));

        if (brands.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="3" class="text-center">No brands found</td></tr>';
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

        // Also populate brand dropdowns in the add product form
        populateBrandDropdown();
    } catch (error) {
        tbody.innerHTML =
            '<tr><td colspan="3" class="text-center">Error loading brands: ' +
            error.message +
            "</td></tr>";
    }
}

// ===== DROPDOWN POPULATION FUNCTIONS =====

/**
 * Populates filter dropdowns with unique values from product data
 * Used for the search/filter section above the products table
 */
function populateFilterDropdowns() {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        const firstOption = categoryFilter.options[0];
        categoryFilter.innerHTML = "";
        categoryFilter.appendChild(firstOption);

        const uniqueCategories = [...new Set(products.map((product) => product.category))];
        uniqueCategories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    const retailerFilter = document.getElementById("retailerFilter");
    if (retailerFilter) {
        const firstOption = retailerFilter.options[0];
        retailerFilter.innerHTML = "";
        retailerFilter.appendChild(firstOption);

        const uniqueRetailers = [...new Set(products.flatMap((product) => product.retailers))];
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
 * Gets values from the categories array
 */
function populateCategoryDropdown() {
    const productCategory = document.getElementById("productCategory");
    if (productCategory) {
        const firstOption = productCategory.options[0];
        productCategory.innerHTML = "";
        productCategory.appendChild(firstOption);

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            productCategory.appendChild(option);
        });
    }
}

/**
 * Populates brand dropdown in the add product form
 * Gets values from the brands array
 */
function populateBrandDropdown() {
    const productBrand = document.getElementById("productBrand");
    if (productBrand) {
        const firstOption = productBrand.options[0];
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
 * Populates retailer dropdown in the add product form
 */
function populateRetailerDropdown() {
    const retailerSelects = document.querySelectorAll(".retailer-select");
    retailerSelects.forEach((select) => {
        const firstOption = select.options[0];
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
 * Handles search input, category/retailer filters, and reset button
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
 * Called whenever a filter value changes
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
        tbody.innerHTML =
            '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }

    filteredProducts.forEach((product) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
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
 * Includes add/remove functionality for dynamic form rows
 */
async function setupModalHandlers() {
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
            }
        });
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
            }
        });
    }

    // Save buttons for each modal
    const saveButtons = {
        saveProductBtn: {
            entity: "Product",
            formId: "addProductForm",
            endpoint: "Add/Product",
        },
        saveCategoryBtn: {
            entity: "Category",
            formId: "addCategoryForm",
            endpoint: "Add/Category",
        },
        saveRetailerBtn: {
            entity: "Retailer",
            formId: "addRetailerForm",
            endpoint: "Add/Retailer",
        },
        saveBrandBtn: {
            entity: "Brand",
            formId: "addBrandForm",
            endpoint: "Add/Brand",
        },
    };

    Object.entries(saveButtons).forEach(([btnId, { entity, formId, endpoint }]) => {
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
                const formData = new FormData(form);
                const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
                let data = { userid: user.id || user.user_id };

                if (entity === "Product") {
                    const specifications = [];
                    const specNames = formData.getAll("specName[]");
                    const specValues = formData.getAll("specValue[]");
                    for (let i = 0; i < specNames.length; i++) {
                        if (specNames[i] && specValues[i]) {
                            specifications.push(`${specNames[i]}: ${specValues[i]}`);
                        }
                    }
                    const retailDetails = [];
                    const retailerIds = formData.getAll("retailerId[]");
                    const retailerPrices = formData.getAll("retailerPrice[]");
                    const retailerDiscounts = formData.getAll("retailerDiscount[]");
                    for (let i = 0; i < retailerIds.length; i++) {
                        if (retailerIds[i] && retailerPrices[i]) {
                            const initialPrice = parseFloat(retailerPrices[i]);
                            const discount = parseFloat(retailerDiscounts[i]) || 0;
                            const finalPrice = initialPrice * (1 - discount / 100);
                            retailDetails.push({
                                retailer_id: retailerIds[i],
                                initial_price: initialPrice,
                                final_price: finalPrice,
                            });
                        }
                    }
                    const imageUrls = formData.get("productImageUrl")
                        .split("\n")
                        .map(url => url.trim())
                        .filter(url => url);
                    data = {
                        ...data,
                        productid: formData.get("productId"),
                        category_id: formData.get("productCategory"),
                        brand_id: formData.get("productBrand"),
                        title: formData.get("productName"),
                        description: formData.get("productDescription"),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        specifications: specifications.join("; "),
                        features: formData.get("productKeyFeatures")
                            .split("\n")
                            .map(feature => feature.trim())
                            .filter(feature => feature),
                        image_url: imageUrls[0] || "",
                        images: imageUrls.slice(1),
                        retail_details: retailDetails,
                    };
                    endpoint = data.productid ? "Update/Product" : "Add/Product";
                } else {
                    data = {
                        ...data,
                        id: formData.get(`${entity.toLowerCase()}Id`),
                        [`${entity.toLowerCase()}_name`]: formData.get(`${entity.toLowerCase()}Name`),
                        ...(entity === "Retailer" && {
                            website: formData.get("retailerWebsite"),
                        }),
                    };
                    endpoint = data.id ? `Update/${entity}` : `Add/${entity}`;
                }

                try {
                    const response = await fetch(`http://localhost:3000/${endpoint}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    alert(`${entity} ${data.id ? "updated" : "saved"} successfully! Message: ${result.message}`);

                    const modal = bootstrap.Modal.getInstance(document.getElementById(`add${entity}Modal`));
                    if (modal) {
                        modal.hide();
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
                } catch (error) {
                    alert(`Error ${data.id ? "updating" : "saving"} ${entity}: ${error.message}`);
                }
            });
        }
    });

    // Setup edit and delete buttons (delegated event handling)
    document.addEventListener("click", async function (e) {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        if (e.target.closest(".edit-product")) {
            const productId = e.target.closest(".edit-product").getAttribute("data-product-id");
            try {
                const response = await fetch(`http://localhost:3000/Get/Product/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userid: user.id || user.user_id }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === "success") {
                    const product = result.data;
                    const form = document.getElementById("addProductForm");
                    const modalTitle = document.getElementById("addProductModalLabel");
                    modalTitle.textContent = "Edit Product";
                    form.querySelector('[name="productId"]').value = product.id;
                    form.querySelector('#productName').value = product.title || product.name;
                    form.querySelector('#productCategory').value = product.category_id || categories.find((c) => c.name === product.category)?.id || "";
                    form.querySelector('#productBrand').value = product.brand_id || brands.find((b) => b.name === product.brand)?.id || "";
                    form.querySelector('#productImageUrl').value = product.image_url || product.image || "";
                    form.querySelector('#productDescription').value = product.description || "";
                    form.querySelector('#productKeyFeatures').value = (product.features || []).join("\n");
                    // Clear and repopulate retailer rows
                    const retailerPricesContainer = document.getElementById("retailerPricesContainer");
                    if (retailerPricesContainer) {
                        retailerPricesContainer.innerHTML = "";
                        (product.retail_details || []).forEach(retail => {
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
                                        <input type="number" class="form-control retailer-price" name="retailerPrice[]" step="0.01" min="0" value="${retail.initial_price || 0}">
                                    </div>
                                </div>
                                <div class="col-md-2 col-2">
                                    <input type="number" class="form-control retailer-discount" name="retailerDiscount[]" min="0" max="100" value="${((1 - retail.final_price / retail.initial_price) * 100).toFixed(2) || 0}">
                                </div>
                                <div class="col-md-1 col-1">
                                    <button type="button" class="btn btn-outline-danger remove-retailer"><i class="bi bi-trash"></i></button>
                                </div>
                            `;
                            retailerPricesContainer.appendChild(newRow);
                            populateRetailerDropdown();
                            newRow.querySelector(".remove-retailer").addEventListener("click", function () {
                                newRow.remove();
                            });
                        });
                    }
                    // Clear and repopulate specification rows
                    const specificationsContainer = document.getElementById("specificationsContainer");
                    if (specificationsContainer) {
                        specificationsContainer.innerHTML = "";
                        Object.entries(product.specifications || {}).forEach(([name, value]) => {
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
                    }
                    const modal = new bootstrap.Modal(document.getElementById("addProductModal"));
                    modal.show();
                } else {
                    alert(`Error loading product: ${result.message}`);
                }
            } catch (error) {
                alert(`Error loading product: ${error.message}`);
                console.error("Edit product fetch error:", error); // Debug the error
            }
        } else if (e.target.closest(".delete-product")) {
            const productId = e.target.closest(".delete-product").getAttribute("data-product-id");
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (!user || !user.id && !user.user_id) {
                alert("User ID not found. Please log in again.");
                return;
            }
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    const response = await fetch("http://localhost:3000/Remove/Product", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            product_id: productId,
                            userid: user.id || user.user_id,
                        }),
                    });
                    const result = await response.json();
                    if (response.status === 200) {
                        alert(`Product ${productId} deleted successfully! Message: ${result.message}`);
                        loadProducts();
                    } else {
                        alert(`Error deleting product: ${result.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting product: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-category")) {
            const categoryId = e.target.closest(".edit-category").getAttribute("data-category-id");
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
                const form = document.getElementById("addCategoryForm");
                const modalTitle = document.getElementById("addCategoryModalLabel");
                modalTitle.textContent = "Edit Category";
                form.querySelector('[name="categoryId"]').value = category.id;
                form.querySelector('#categoryName').value = category.name;
                const modal = new bootstrap.Modal(document.getElementById("addCategoryModal"));
                modal.show();
            }
        } else if (e.target.closest(".delete-category")) {
            const categoryId = e.target.closest(".delete-category").getAttribute("data-category-id");
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (confirm("Are you sure you want to delete this category?")) {
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
                    if (response.status === 200) {
                        alert(`Category ${categoryId} deleted successfully! Message: ${result.message}`);
                        loadCategories();
                    } else {
                        alert(`Error deleting category: ${result.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting category: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-retailer")) {
            const retailerId = e.target.closest(".edit-retailer").getAttribute("data-retailer-id");
            const retailer = retailers.find((r) => r.id === retailerId);
            if (retailer) {
                const form = document.getElementById("addRetailerForm");
                const modalTitle = document.getElementById("addRetailerModalLabel");
                modalTitle.textContent = "Edit Retailer";
                form.querySelector('[name="retailerId"]').value = retailer.id;
                form.querySelector('#retailerName').value = retailer.name;
                form.querySelector('#retailerWebsite').value = retailer.website;
                const modal = new bootstrap.Modal(document.getElementById("addRetailerModal"));
                modal.show();
            }
        } else if (e.target.closest(".delete-retailer")) {
            const retailerId = e.target.closest(".delete-retailer").getAttribute("data-retailer-id");
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (confirm("Are you sure you want to delete this retailer?")) {
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
                    if (response.status === 200) {
                        alert(`Retailer ${retailerId} deleted successfully! Message: ${result.message}`);
                        loadRetailers();
                    } else {
                        alert(`Error deleting retailer: ${result.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting retailer: ${error.message}`);
                }
            }
        } else if (e.target.closest(".edit-brand")) {
            const brandId = e.target.closest(".edit-brand").getAttribute("data-brand-id");
            const brand = brands.find((b) => b.id === brandId);
            if (brand) {
                const form = document.getElementById("addBrandForm");
                const modalTitle = document.getElementById("addBrandModalLabel");
                modalTitle.textContent = "Edit Brand";
                form.querySelector('[name="brandId"]').value = brand.id;
                form.querySelector('#brandName').value = brand.name;
                const modal = new bootstrap.Modal(document.getElementById("addBrandModal"));
                modal.show();
            }
        } else if (e.target.closest(".delete-brand")) {
            const brandId = e.target.closest(".delete-brand").getAttribute("data-brand-id");
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (confirm("Are you sure you want to delete this brand?")) {
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
                    if (response.status === 200) {
                        alert(`Brand ${brandId} deleted successfully! Message: ${result.message}`);
                        loadBrands();
                    } else {
                        alert(`Error deleting brand: ${result.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting brand: ${error.message}`);
                }
            }
        }
    });

    // Reset modal titles when modals are hidden
    const modals = [
        { id: "addProductModal", label: "addProductModalLabel", title: "Add New Product" },
        { id: "addCategoryModal", label: "addCategoryModalLabel", title: "Add New Category" },
        { id: "addRetailerModal", label: "addRetailerModalLabel", title: "Add New Retailer" },
        { id: "addBrandModal", label: "addBrandModalLabel", title: "Add New Brand" },
    ];

    modals.forEach(({ id, label, title }) => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            modalEl.addEventListener("hidden.bs.modal", function () {
                const modalTitle = document.getElementById(label);
                if (modalTitle) {
                    modalTitle.textContent = title;
                }
            });
        }
    });
}