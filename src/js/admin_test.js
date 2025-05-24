/**
 * Static Admin Test Script
 * This script provides functionality for the admin dashboard
 * It loads data from the API and sets up event handlers for admin operations
 * UPDATED TO CHECK ADMIN LOGIN AND ADD WISHLIST FUNCTIONALITY WITH DOUBLE HASHING
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is an admin before initializing
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '/login';
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
 * Also updates filter dropdowns with available options and wishlist buttons
 */
async function loadProducts() {
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;
    
    const tbody = productsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    try {
        const response = await fetch('http://localhost:3000/Get/Products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userid: localStorage.getItem('userId'),
                apikey: localStorage.getItem('apikey') // Include apikey for wishlist check
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            products = result.data.map(product => ({
                id: product.id,
                name: product.title,
                image: product.image_url,
                category: product.category_name || 'Unknown', // Adjust based on API response
                minPrice: product.final_price,
                maxPrice: product.initial_price,
                retailers: [product.retailer_name],
                brand: product.brand_name || 'Unknown', // Adjust based on API response
                watchlist: product.watchlist || false
            }));
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
                return;
            }
            
            products.forEach(product => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <img src="${product.image}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>R${product.minPrice.toFixed(2)} - R${product.maxPrice.toFixed(2)}</td>
                    <td>${product.retailers.join(', ')}</td>
                    <td>
                        <button class="btn btn-${product.watchlist ? 'danger' : 'primary'} wishlist-btn" data-product-id="${product.id}">
                            ${product.watchlist ? 'Remove from' : 'Add to'} Wishlist
                        </button>
                    </td>
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
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading products: ' + result.message + '</td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading products: ' + error.message + '</td></tr>';
    }
}

/**
 * Renders categories table with API data
 * Also populates category dropdowns in the product form
 */
async function loadCategories() {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    const tbody = categoriesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    try {
        const response = await fetch('http://localhost:3000/Get/Categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: '' })
        });
        const result = await response.json();
        categories = result.data.map(category => ({
            id: category.cat_id,
            name: category.cat_name,
            productCount: 0 // Adjust based on API response if available
        }));
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found</td></tr>';
            return;
        }
        
        categories.forEach(category => {
            const tr = document.createElement('tr');
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
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Error loading categories: ' + error.message + '</td></tr>';
    }
}

/**
 * Renders retailers table with API data
 * Also populates retailer dropdowns in the product form
 */
async function loadRetailers() {
    const retailersTable = document.getElementById('retailersTable');
    if (!retailersTable) return;
    
    const tbody = retailersTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    try {
        const response = await fetch('http://localhost:3000/Get/Retailers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: '' })
        });
        const result = await response.json();
        retailers = result.data.map(retailer => ({
            id: retailer.retailer_id,
            name: retailer.retailer_name,
            website: '#', // Adjust based on API response if available
            productCount: 0 // Adjust based on API response if available
        }));
        
        if (retailers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No retailers found</td></tr>';
            return;
        }
        
        retailers.forEach(retailer => {
            const tr = document.createElement('tr');
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
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Error loading retailers: ' + error.message + '</td></tr>';
    }
}

/**
 * Renders brands table with API data
 * Also populates brand dropdowns in the product form
 */
async function loadBrands() {
    const brandsTable = document.getElementById('brandsTable');
    if (!brandsTable) return;
    
    const tbody = brandsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    try {
        const response = await fetch('http://localhost:3000/Get/Brands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: '' })
        });
        const result = await response.json();
        brands = result.data.map(brand => ({
            id: brand.brand_id,
            name: brand.brand_name,
            productCount: 0 // Adjust based on API response if available
        }));
        
        if (brands.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No brands found</td></tr>';
            return;
        }
        
        brands.forEach(brand => {
            const tr = document.createElement('tr');
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
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Error loading brands: ' + error.message + '</td></tr>';
    }
}

// ===== DROPDOWN POPULATION FUNCTIONS =====

/**
 * Populates filter dropdowns with unique values from product data
 * Used for the search/filter section above the products table
 */
function populateFilterDropdowns() {
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const firstOption = categoryFilter.options[0];
        categoryFilter.innerHTML = '';
        categoryFilter.appendChild(firstOption);
        
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    // Populate retailer filter
    const retailerFilter = document.getElementById('retailerFilter');
    if (retailerFilter) {
        const firstOption = retailerFilter.options[0];
        retailerFilter.innerHTML = '';
        retailerFilter.appendChild(firstOption);
        
        const uniqueRetailers = [...new Set(products.flatMap(product => product.retailers))];
        uniqueRetailers.forEach(retailer => {
            const option = document.createElement('option');
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
    const productCategory = document.getElementById('productCategory');
    if (productCategory) {
        const firstOption = productCategory.options[0];
        productCategory.innerHTML = '';
        productCategory.appendChild(firstOption);
        
        categories.forEach(category => {
            const option = document.createElement('option');
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
    const productBrand = document.getElementById('productBrand');
    if (productBrand) {
        const firstOption = productBrand.options[0];
        productBrand.innerHTML = '';
        productBrand.appendChild(firstOption);
        
        brands.forEach(brand => {
            const option = document.createElement('option');
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
    const retailerSelects = document.querySelectorAll('.retailer-select');
    retailerSelects.forEach(select => {
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        retailers.forEach(retailer => {
            const option = document.createElement('option');
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
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const retailerFilter = document.getElementById('retailerFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (retailerFilter) {
        retailerFilter.addEventListener('change', filterProducts);
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            if (productSearch) productSearch.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (retailerFilter) retailerFilter.value = '';
            filterProducts();
        });
    }
}

/**
 * Filters the products table based on search term and dropdown selections
 * Called whenever a filter value changes
 */
function filterProducts() {
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const retailerFilter = document.getElementById('retailerFilter');
    
    const searchTerm = productSearch ? productSearch.value.toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const retailerValue = retailerFilter ? retailerFilter.value : '';
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.brand.toLowerCase().includes(searchTerm);
        
        const matchesCategory = categoryValue === '' || product.category === categoryValue;
        
        const matchesRetailer = retailerValue === '' || product.retailers.includes(retailerValue);
        
        return matchesSearch && matchesCategory && matchesRetailer;
    });
    
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;
    
    const tbody = productsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" width="50" height="50" class="img-thumbnail">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>R${product.minPrice.toFixed(2)} - R${product.maxPrice.toFixed(2)}</td>
            <td>${product.retailers.join(', ')}</td>
            <td>
                <button class="btn btn-${product.watchlist ? 'danger' : 'primary'} wishlist-btn" data-product-id="${product.id}">
                    ${product.watchlist ? 'Remove from' : 'Add to'} Wishlist
                </button>
            </td>
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
 * Sets up event handlers for all modals, forms, and wishlist
 * Includes add/remove functionality for dynamic form rows
 */
async function setupModalHandlers() {
    // Wire up the "Add Retailer" button in product form
    const addRetailerBtn = document.getElementById('addRetailerBtn');
    if (addRetailerBtn) {
        addRetailerBtn.addEventListener('click', function() {
            const retailerPricesContainer = document.getElementById('retailerPricesContainer');
            if (retailerPricesContainer) {
                const newRow = document.createElement('div');
                newRow.className = 'row mb-2 retailer-price-row';
                newRow.innerHTML = `
                    <div class="col-5">
                        <select class="form-select retailer-select" name="retailerId[]">
                            <option value="">Select Retailer</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <div class="input-group">
                            <span class="input-group-text">R</span>
                            <input type="number" class="form-control retailer-price" name="retailerPrice[]" step="0.01" min="0" placeholder="Price">
                        </div>
                    </div>
                    <div class="col-2">
                        <input type="number" class="form-control retailer-discount" name="retailerDiscount[]" min="0" max="100" placeholder="Discount %">
                    </div>
                    <div class="col-1">
                        <button type="button" class="btn btn-outline-danger remove-retailer"><i class="bi bi-trash"></i></button>
                    </div>
                `;
                retailerPricesContainer.appendChild(newRow);
                
                populateRetailerDropdown();
                
                const removeBtn = newRow.querySelector('.remove-retailer');
                removeBtn.addEventListener('click', function() {
                    newRow.remove();
                });
            }
        });
    }
    
    // Wire up the "Add Specification" button in product form
    const addSpecBtn = document.getElementById('addSpecBtn');
    if (addSpecBtn) {
        addSpecBtn.addEventListener('click', function() {
            const specificationsContainer = document.getElementById('specificationsContainer');
            if (specificationsContainer) {
                const newRow = document.createElement('div');
                newRow.className = 'row mb-2 spec-row';
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
                
                const removeBtn = newRow.querySelector('.remove-spec');
                removeBtn.addEventListener('click', function() {
                    newRow.remove();
                });
            }
        });
    }
    
    // Save buttons for each modal
    const saveButtons = {
        'saveProductBtn': { entity: 'Product', formId: 'addProductForm', endpoint: 'Add/Product' },
        'saveCategoryBtn': { entity: 'Category', formId: 'addCategoryForm', endpoint: 'Add/Category' },
        'saveRetailerBtn': { entity: 'Retailer', formId: 'addRetailerForm', endpoint: 'Add/Retailer' },
        'saveBrandBtn': { entity: 'Brand', formId: 'addBrandForm', endpoint: 'Add/Brand' }
    };
    
    Object.entries(saveButtons).forEach(([btnId, { entity, formId, endpoint }]) => {
        const btn = document.getElementById(btnId);
        const form = document.getElementById(formId);
        if (btn && form) {
            btn.addEventListener('click', async function() {
                const formData = new FormData(form);
                let data = { userid: localStorage.getItem('userId') };
                
                if (entity === 'Product') {
                    const specifications = [];
                    const specNames = formData.getAll('specName[]');
                    const specValues = formData.getAll('specValue[]');
                    for (let i = 0; i < specNames.length; i++) {
                        if (specNames[i] && specValues[i]) {
                            specifications.push(`${specNames[i]}: ${specValues[i]}`);
                        }
                    }
                    const retailDetails = [];
                    const retailerIds = formData.getAll('retailerId[]');
                    const retailerPrices = formData.getAll('retailerPrice[]');
                    for (let i = 0; i < retailerIds.length; i++) {
                        if (retailerIds[i] && retailerPrices[i]) {
                            retailDetails.push({
                                retailer_id: retailerIds[i],
                                initial_price: parseFloat(retailerPrices[i]),
                                final_price: parseFloat(retailerPrices[i]) // Adjust if discount is used
                            });
                        }
                    }
                    data = {
                        ...data,
                        productid: formData.get('productId'),
                        category_id: formData.get('productCategory'),
                        brand_id: formData.get('productBrand'),
                        title: formData.get('productName'),
                        description: formData.get('productDescription'),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        specifications: specifications.join('; '),
                        features: formData.get('productFeatures'),
                        image_url: formData.get('productImage'),
                        retail_details: retailDetails
                    };
                    endpoint = data.productid ? 'Update/Product' : 'Add/Product';
                } else {
                    data = {
                        ...data,
                        id: formData.get(`${entity.toLowerCase()}Id`),
                        [`${entity.toLowerCase()}_name`]: formData.get(`${entity.toLowerCase()}Name`),
                        ...(entity === 'Retailer' && { website: formData.get('retailerWebsite') })
                    };
                    endpoint = data.id ? `Update/${entity}` : `Add/${entity}`;
                }
                
                try {
                    const response = await fetch(`http://localhost:3000/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    alert(`${entity} ${data.id ? 'updated' : 'saved'} successfully! Message: ${result.message}`);
                    
                    const modal = bootstrap.Modal.getInstance(document.getElementById(`add${entity}Modal`));
                    if (modal) {
                        modal.hide();
                    }
                    
                    form.reset();
                    form.querySelector(`input[name="${entity.toLowerCase()}Id"]`).value = '';
                    
                    switch (entity) {
                        case 'Product':
                            loadProducts();
                            break;
                        case 'Category':
                            loadCategories();
                            break;
                        case 'Retailer':
                            loadRetailers();
                            break;
                        case 'Brand':
                            loadBrands();
                            break;
                    }
                } catch (error) {
                    alert(`Error ${data.id ? 'updating' : 'saving'} ${entity}: ${error.message}`);
                }
            });
        }
    });
    
    // Setup edit, delete, and wishlist buttons (delegated event handling)
    document.addEventListener('click', async function(e) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (e.target.closest('.edit-product')) {
            const productId = e.target.closest('.edit-product').getAttribute('data-product-id');
            const product = products.find(p => p.id === productId);
            if (product) {
                const form = document.getElementById('addProductForm');
                form.querySelector('[name="productId"]').value = product.id;
                form.querySelector('[name="productName"]').value = product.name;
                form.querySelector('[name="productCategory"]').value = categories.find(c => c.name === product.category)?.id || '';
                form.querySelector('[name="productBrand"]').value = brands.find(b => b.name === product.brand)?.id || '';
                form.querySelector('[name="productImage"]').value = product.image;
                const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
                modal.show();
            }
        } else if (e.target.closest('.delete-product')) {
            const productId = e.target.closest('.delete-product').getAttribute('data-product-id');
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    const response = await fetch('http://localhost:3000/Remove/Product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: productId, userid: localStorage.getItem('userId') })
                    });
                    const result = await response.json();
                    alert(`Product ${productId} deleted successfully! Message: ${result.message}`);
                    loadProducts();
                } catch (error) {
                    alert(`Error deleting product: ${error.message}`);
                }
            }
        } else if (e.target.closest('.edit-category')) {
            const categoryId = e.target.closest('.edit-category').getAttribute('data-category-id');
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                const form = document.getElementById('addCategoryForm');
                form.querySelector('[name="categoryId"]').value = category.id;
                form.querySelector('[name="categoryName"]').value = category.name;
                const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
                modal.show();
            }
        } else if (e.target.closest('.delete-category')) {
            const categoryId = e.target.closest('.delete-category').getAttribute('data-category-id');
            if (confirm('Are you sure you want to delete this category?')) {
                try {
                    const response = await fetch('http://localhost:3000/Remove/Category', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: categoryId, userid: localStorage.getItem('userId') })
                    });
                    const result = await response.json();
                    alert(`Category ${categoryId} deleted successfully! Message: ${result.message}`);
                    loadCategories();
                } catch (error) {
                    alert(`Error deleting category: ${error.message}`);
                }
            }
        } else if (e.target.closest('.edit-retailer')) {
            const retailerId = e.target.closest('.edit-retailer').getAttribute('data-retailer-id');
            const retailer = retailers.find(r => r.id === retailerId);
            if (retailer) {
                const form = document.getElementById('addRetailerForm');
                form.querySelector('[name="retailerId"]').value = retailer.id;
                form.querySelector('[name="retailerName"]').value = retailer.name;
                form.querySelector('[name="retailerWebsite"]').value = retailer.website;
                const modal = new bootstrap.Modal(document.getElementById('addRetailerModal'));
                modal.show();
            }
        } else if (e.target.closest('.delete-retailer')) {
            const retailerId = e.target.closest('.delete-retailer').getAttribute('data-retailer-id');
            if (confirm('Are you sure you want to delete this retailer?')) {
                try {
                    const response = await fetch('http://localhost:3000/Remove/Retailer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: retailerId, userid: localStorage.getItem('userId') })
                    });
                    const result = await response.json();
                    alert(`Retailer ${retailerId} deleted successfully! Message: ${result.message}`);
                    loadRetailers();
                } catch (error) {
                    alert(`Error deleting retailer: ${error.message}`);
                }
            }
        } else if (e.target.closest('.edit-brand')) {
            const brandId = e.target.closest('.edit-brand').getAttribute('data-brand-id');
            const brand = brands.find(b => b.id === brandId);
            if (brand) {
                const form = document.getElementById('addBrandForm');
                form.querySelector('[name="brandId"]').value = brand.id;
                form.querySelector('[name="brandName"]').value = brand.name;
                const modal = new bootstrap.Modal(document.getElementById('addBrandModal'));
                modal.show();
            }
        } else if (e.target.closest('.delete-brand')) {
            const brandId = e.target.closest('.delete-brand').getAttribute('data-brand-id');
            if (confirm('Are you sure you want to delete this brand?')) {
                try {
                    const response = await fetch('http://localhost:3000/Remove/Brand', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: brandId, userid: localStorage.getItem('userId') })
                    });
                    const result = await response.json();
                    alert(`Brand ${brandId} deleted successfully! Message: ${result.message}`);
                    loadBrands();
                } catch (error) {
                    alert(`Error deleting brand: ${error.message}`);
                }
            }
        } else if (e.target.closest('.wishlist-btn') && user) {
            const productId = e.target.closest('.wishlist-btn').getAttribute('data-product-id');
            const product = products.find(p => p.id === productId);
            if (product) {
                try {
                    const response = await fetch('http://localhost:3000/Wishlist/Toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userid: localStorage.getItem('userId'),
                            apikey: localStorage.getItem('apikey'),
                            productid: productId,
                            retailerid: product.retailers[0], // Assuming first retailer for simplicity
                            action: product.watchlist ? 'remove' : 'add'
                        })
                    });
                    const result = await response.json();
                    if (result.status === 'success') {
                        product.watchlist = !product.watchlist;
                        loadProducts(); // Reload to update UI
                    } else {
                        alert(`Wishlist action failed: ${result.message}`);
                    }
                } catch (error) {
                    alert(`Error updating wishlist: ${error.message}`);
                }
            }
        }
    });
}

// ===== UTILITY FUNCTIONS =====

/**
 * Double hashes a password using bcrypt (client-side) before sending
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} - The double-hashed password
 */
async function doubleHashPassword(password) {
    if (!password || new TextEncoder().encode(password).length > 72) {
        throw new Error('Password must be present and less than 72 bytes');
    }
    const bcrypt = require('bcryptjs');
    const firstHash = await bcrypt.hash(password, 10);
    return await bcrypt.hash(firstHash, 10);
}