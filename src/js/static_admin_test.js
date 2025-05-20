/**
 * Static Admin Test Script
 * This script provides test functionality for the admin dashboard
 * It loads sample data and sets up event handlers for admin operations
 * BASIC TEST, COULD NOT ALL WORK
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeAdminDashboard();
});

/**
 * Sets up the admin dashboard with test data and wires up event handlers
 */
function initializeAdminDashboard() {
    // Populate tables with mock data
    loadProducts();
    loadCategories();
    loadRetailers();
    loadBrands();
    
    // Wire up search and filter functionality
    setupProductFilters();
    
    // Set up modal and form handlers
    setupModalHandlers();
}

// ===== MOCK DATA =====

/**
 * Mock product data
 * Each product has retailers, price ranges, and category info
 */
const sampleProducts = [
    {
        id: 'prod-001',
        name: 'Wireless Mouse',
        image: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        category: 'Computer Accessories',
        minPrice: 299.99,
        maxPrice: 399.99,
        retailers: ['Amazon', 'Takealot', 'Incredible Connection', 'Game', 'Checkers', 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest111'],
        brand: 'Logitech'
    },
    {
        id: 'prod-002',
        name: 'Mechanical Keyboard',
        image: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        category: 'Computer Accessories',
        minPrice: 750.00,
        maxPrice: 1000.00,
        retailers: ['Checkers', 'Game', 'Takealot'],
        brand: 'Corsair'
    },
    {
        id: 'prod-003',
        name: 'USB-C Hub',
        image: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        category: 'Computer Accessories',
        minPrice: 450.50,
        maxPrice: 500.00,
        retailers: ['Pick n Pay', 'Takealot'],
        brand: 'Anker'
    },
    {
        id: 'prod-004',
        name: 'Smartphone',
        image: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        category: 'Electronics',
        minPrice: 8999.99,
        maxPrice: 12999.99,
        retailers: ['Vodacom', 'MTN', 'Takealot'],
        brand: 'Samsung'
    },
    {
        id: 'prod-005',
        name: 'Headphones',
        image: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        category: 'Audio',
        minPrice: 1499.99,
        maxPrice: 2499.99,
        retailers: ['Incredible Connection', 'Takealot', 'Game'],
        brand: 'Sony'
    }
];

/**
 * Mock category data
 * Includes product counts for display in the UI
 */
const sampleCategories = [
    { id: 'cat-001', name: 'Computer Accessories', productCount: 3 },
    { id: 'cat-002', name: 'Electronics', productCount: 1 },
    { id: 'cat-003', name: 'Audio', productCount: 1 },
    { id: 'cat-004', name: 'Home Appliances', productCount: 0 },
    { id: 'cat-005', name: 'Gaming', productCount: 0 }
];

/**
 * Mock retailer data
 * Includes website URLs and product counts
 */
const sampleRetailers = [
    { id: 'ret-001', name: 'Takealot', website: 'https://www.takealot.com', productCount: 5 },
    { id: 'ret-002', name: 'Amazon', website: 'https://www.amazon.com', productCount: 1 },
    { id: 'ret-003', name: 'Incredible Connection', website: 'https://www.incredible.co.za', productCount: 2 },
    { id: 'ret-004', name: 'Game', website: 'https://www.game.co.za', productCount: 2 },
    { id: 'ret-005', name: 'Checkers', website: 'https://www.checkers.co.za', productCount: 1 },
    { id: 'ret-006', name: 'Pick n Pay', website: 'https://www.pnp.co.za', productCount: 1 },
    { id: 'ret-007', name: 'Vodacom', website: 'https://www.vodacom.co.za', productCount: 1 },
    { id: 'ret-008', name: 'MTN', website: 'https://www.mtn.co.za', productCount: 1 }
];

/**
 * Mock brand data
 * Includes product counts for each brand
 */
const sampleBrands = [
    { id: 'brand-001', name: 'Logitech', productCount: 1 },
    { id: 'brand-002', name: 'Corsair', productCount: 1 },
    { id: 'brand-003', name: 'Anker', productCount: 1 },
    { id: 'brand-004', name: 'Samsung', productCount: 1 },
    { id: 'brand-005', name: 'Sony', productCount: 1 },
    { id: 'brand-006', name: 'Apple', productCount: 0 },
    { id: 'brand-007', name: 'LG', productCount: 0 }
];

// ===== TABLE POPULATION FUNCTIONS =====

/**
 * Renders products table with mock data
 * Also updates filter dropdowns with available options
 */
function loadProducts() {
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;
    
    const tbody = productsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (sampleProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }
    
    sampleProducts.forEach(product => {
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
}

/**
 * Renders categories table with mock data
 * Also populates category dropdowns in the product form
 */
function loadCategories() {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    const tbody = categoriesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (sampleCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found</td></tr>';
        return;
    }
    
    sampleCategories.forEach(category => {
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
}

/**
 * Renders retailers table with mock data
 * Also populates retailer dropdowns in the product form
 */
function loadRetailers() {
    const retailersTable = document.getElementById('retailersTable');
    if (!retailersTable) return;
    
    const tbody = retailersTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (sampleRetailers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No retailers found</td></tr>';
        return;
    }
    
    sampleRetailers.forEach(retailer => {
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
}

/**
 * Renders brands table with mock data
 * Also populates brand dropdowns in the product form
 */
function loadBrands() {
    const brandsTable = document.getElementById('brandsTable');
    if (!brandsTable) return;
    
    const tbody = brandsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (sampleBrands.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No brands found</td></tr>';
        return;
    }
    
    sampleBrands.forEach(brand => {
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
        // Keep the first option (All Categories)
        const firstOption = categoryFilter.options[0];
        categoryFilter.innerHTML = '';
        categoryFilter.appendChild(firstOption);
        
        // Add unique categories from products
        const uniqueCategories = [...new Set(sampleProducts.map(product => product.category))];
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
        // Keep the first option (All Retailers)
        const firstOption = retailerFilter.options[0];
        retailerFilter.innerHTML = '';
        retailerFilter.appendChild(firstOption);
        
        // Add unique retailers from all products
        const uniqueRetailers = [...new Set(sampleProducts.flatMap(product => product.retailers))];
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
 * Gets values from the sampleCategories array
 */
function populateCategoryDropdown() {
    const productCategory = document.getElementById('productCategory');
    if (productCategory) {
        // Keep the first option (Select Category)
        const firstOption = productCategory.options[0];
        productCategory.innerHTML = '';
        productCategory.appendChild(firstOption);
        
        // Add categories
        sampleCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            productCategory.appendChild(option);
        });
    }
}

/**
 * Populates brand dropdown in the add product form
 * Gets values from the sampleBrands array
 */
function populateBrandDropdown() {
    const productBrand = document.getElementById('productBrand');
    if (productBrand) {
        // Keep the first option (Select Brand)
        const firstOption = productBrand.options[0];
        productBrand.innerHTML = '';
        productBrand.appendChild(firstOption);
        
        // Add brands
        sampleBrands.forEach(brand => {
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
        // Keep the first option (Select Retailer)
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        // Add retailers
        sampleRetailers.forEach(retailer => {
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
    
    // Filter products based on criteria
    const filteredProducts = sampleProducts.filter(product => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.brand.toLowerCase().includes(searchTerm);
        
        // Filter by category
        const matchesCategory = categoryValue === '' || product.category === categoryValue;
        
        // Filter by retailer
        const matchesRetailer = retailerValue === '' || product.retailers.includes(retailerValue);
        
        return matchesSearch && matchesCategory && matchesRetailer;
    });
    
    // Update the products table with filtered results
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;
    
    const tbody = productsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
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
function setupModalHandlers() {
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
                            <!-- Retailers will be populated by JS -->
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
                
                // Populate the new retailer select
                const newSelect = newRow.querySelector('.retailer-select');
                populateRetailerDropdown();
                
                // Add event listener to remove button
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
                
                // Add event listener to remove button
                const removeBtn = newRow.querySelector('.remove-spec');
                removeBtn.addEventListener('click', function() {
                    newRow.remove();
                });
            }
        });
    }
    
    // Save buttons for each modal
    const saveButtons = {
        'saveProductBtn': 'Product',
        'saveCategoryBtn': 'Category',
        'saveRetailerBtn': 'Retailer',
        'saveBrandBtn': 'Brand'
    };
    
    Object.entries(saveButtons).forEach(([btnId, entityName]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function() {
                alert(`${entityName} saved successfully!`);
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById(`add${entityName}Modal`));
                if (modal) {
                    modal.hide();
                }
                
                // Reload the corresponding data
                switch (entityName) {
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
            });
        }
    });
    
    // Setup delete buttons (delegated event handling)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-product')) {
            const productId = e.target.closest('.delete-product').getAttribute('data-product-id');
            if (confirm('Are you sure you want to delete this product?')) {
                // In a real app, you would make an API call here
                alert(`Product ${productId} deleted successfully!`);
                // Reload products
                loadProducts();
            }
        } else if (e.target.closest('.delete-category')) {
            const categoryId = e.target.closest('.delete-category').getAttribute('data-category-id');
            if (confirm('Are you sure you want to delete this category?')) {
                alert(`Category ${categoryId} deleted successfully!`);
                loadCategories();
            }
        } else if (e.target.closest('.delete-retailer')) {
            const retailerId = e.target.closest('.delete-retailer').getAttribute('data-retailer-id');
            if (confirm('Are you sure you want to delete this retailer?')) {
                alert(`Retailer ${retailerId} deleted successfully!`);
                loadRetailers();
            }
        } else if (e.target.closest('.delete-brand')) {
            const brandId = e.target.closest('.delete-brand').getAttribute('data-brand-id');
            if (confirm('Are you sure you want to delete this brand?')) {
                alert(`Brand ${brandId} deleted successfully!`);
                loadBrands();
            }
        }
    });
}