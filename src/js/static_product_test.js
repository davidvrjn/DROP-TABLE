// This file is used to test the rendering of product cards on a webpage.
// It imports a function to create product card HTML and uses static data for testing.
// The static data includes product details such as ID, image URL, title, final price, initial price, and discount percentage.
// The rendered product cards are inserted into a container with the ID 'product-list'.
// This file is not intended for production use and is meant for testing purposes only.


// Import the function to generate product card HTML
import { createProductCardHTML } from '../partials/_product-card.js';

/**
 * Static data for testing product card rendering.
 * This array contains 5 product objects.
 */
const staticProductData = [
    {
        id: 'prod-001',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg', // Placeholder image
        title: 'Wireless Mouse but this is a longer name to test wrapping, some product titles go on forever',
        final_price: 299.99,
        retailer_name: 'Amazon',
        rating: 4.5, // Average rating
    },
    {
        id: 'prod-002',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Mechanical Keyboard',
        final_price: 750.00,
        retailer_name: 'Checkers',
        initial_price: 1000.00, // Initial price for discount
        discount: 25, // Discount percentage
    },
    {
        id: 'prod-003',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'USB-C Hub',
        final_price: 100000.50,
        retailer_name: 'Pick n Pay',
        rating: 2.0,
    },
    {
        id: 'prod-004',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Webcam 1080p',
        final_price: 1000000.00,
        retailer_name: 'Takealot',
        initial_price: 1000001.00,
        discount: 20,
    },
     {
        id: 'prod-005',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Monitor Stand',
        final_price: 350.00,
        retailer_name: 'AReallyLongCompanyNameThatIsLongEnough',
    },
];

// Function to render products to the page
function renderProducts(productsToRender) {
    const productListContainer = document.getElementById('product-list'); 

    if (!productListContainer) {
        console.error("Product list container not found!");
        return;
    }

    // Clear existing content
    productListContainer.innerHTML = '';

    // Loop through the products and generate/insert HTML
    productsToRender.forEach(product => {
        // Create the HTML string for a single product card using the imported function
        const productCardHTML = createProductCardHTML(product);

        productListContainer.innerHTML += productCardHTML; 
    });
}

// Function to populate brand checkboxes
function populateBrandFilters(brands) {
    const brandContainer = document.querySelector('.brand-options');
    const mobileBrandContainer = document.querySelector('.offcanvas-body .brand-options');
    
    if (!brandContainer && !mobileBrandContainer) return;
    
    // Function to populate a specific container
    const populateContainer = (container) => {
      if (!container) return;
      
      // Clear existing content
      container.innerHTML = '';
      
      // Add checkboxes for each brand
      brands.forEach((brand, index) => {
        const brandCheckbox = document.createElement('div');
        brandCheckbox.className = 'form-check';
        brandCheckbox.innerHTML = `
          <input class="form-check-input" type="checkbox" id="brand${index}_${container === mobileBrandContainer ? 'mobile' : 'desktop'}" value="${brand}">
          <label class="form-check-label" for="brand${index}_${container === mobileBrandContainer ? 'mobile' : 'desktop'}">
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
    const brandSearch = document.querySelector('.filter-section:nth-child(2) .filter-search input');
    if (brandSearch) {
      brandSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const brandCheckboxes = brandContainer?.querySelectorAll('.form-check') || [];
        
        brandCheckboxes.forEach(checkbox => {
          const brandName = checkbox.querySelector('label').textContent.toLowerCase();
          if (brandName.includes(searchTerm)) {
            checkbox.style.display = '';
          } else {
            checkbox.style.display = 'none';
          }
        });
      });
    }
    
    // Implement brand search functionality for mobile
    // Use a more specific selector for mobile brand search
    const mobileBrandSearch = document.querySelector('.offcanvas-body .filter-section:nth-child(2) .filter-search input');
    if (mobileBrandSearch) {
      mobileBrandSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const mobileBrandCheckboxes = mobileBrandContainer?.querySelectorAll('.form-check') || [];
        
        mobileBrandCheckboxes.forEach(checkbox => {
          const brandName = checkbox.querySelector('label').textContent.toLowerCase();
          if (brandName.includes(searchTerm)) {
            checkbox.style.display = '';
          } else {
            checkbox.style.display = 'none';
          }
        });
      });
    }
}

// Function to populate category checkboxes
function populateCategoryFilters(categories) {
  const categoryContainer = document.querySelector('.category-options');
  const mobileCategoryContainer = document.querySelector('.offcanvas-body .category-options');
  
  if (!categoryContainer && !mobileCategoryContainer) return;
  
  // Function to populate a specific container
  const populateContainer = (container) => {
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add checkboxes for each category
    categories.forEach((category, index) => {
      const categoryCheckbox = document.createElement('div');
      categoryCheckbox.className = 'form-check';
      categoryCheckbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="category${index}_${container === mobileCategoryContainer ? 'mobile' : 'desktop'}" value="${category}">
        <label class="form-check-label" for="category${index}_${container === mobileCategoryContainer ? 'mobile' : 'desktop'}">
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
  const categorySearch = document.querySelector('.filter-section:first-child .filter-search input');
  if (categorySearch) {
    categorySearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const categoryCheckboxes = categoryContainer?.querySelectorAll('.form-check') || [];
      
      categoryCheckboxes.forEach(checkbox => {
        const categoryName = checkbox.querySelector('label').textContent.toLowerCase();
        if (categoryName.includes(searchTerm)) {
          checkbox.style.display = '';
        } else {
          checkbox.style.display = 'none';
        }
      });
    });
  }
  
  // Implement category search functionality for mobile
  const mobileCategorySearch = document.querySelector('.offcanvas-body .filter-section:first-child .filter-search input');
  if (mobileCategorySearch) {
    mobileCategorySearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const mobileCategoryCheckboxes = mobileCategoryContainer?.querySelectorAll('.form-check') || [];
      
      mobileCategoryCheckboxes.forEach(checkbox => {
        const categoryName = checkbox.querySelector('label').textContent.toLowerCase();
        if (categoryName.includes(searchTerm)) {
          checkbox.style.display = '';
        } else {
          checkbox.style.display = 'none';
        }
      });
    });
  }
}

// Function to populate retailer checkboxes
function populateRetailerFilters(retailers) {
  const retailerContainer = document.querySelector('.retailer-options');
  const mobileRetailerContainer = document.querySelector('.offcanvas-body .retailer-options');
  
  if (!retailerContainer && !mobileRetailerContainer) return;
  
  // Function to populate a specific container
  const populateContainer = (container) => {
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add checkboxes for each retailer
    retailers.forEach((retailer, index) => {
      const retailerCheckbox = document.createElement('div');
      retailerCheckbox.className = 'form-check';
      retailerCheckbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="retailer${index}_${container === mobileRetailerContainer ? 'mobile' : 'desktop'}" value="${retailer}">
        <label class="form-check-label" for="retailer${index}_${container === mobileRetailerContainer ? 'mobile' : 'desktop'}">
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
  const retailerSearch = document.querySelector('.filter-section:nth-child(5) .filter-search input');
  if (retailerSearch) {
    retailerSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const retailerCheckboxes = retailerContainer?.querySelectorAll('.form-check') || [];
      
      retailerCheckboxes.forEach(checkbox => {
        const retailerName = checkbox.querySelector('label').textContent.toLowerCase();
        if (retailerName.includes(searchTerm)) {
          checkbox.style.display = '';
        } else {
          checkbox.style.display = 'none';
        }
      });
    });
  }
  
  // Implement retailer search functionality for mobile
  const mobileRetailerSearch = document.querySelector('.offcanvas-body .filter-section:nth-child(5) .filter-search input');
  if (mobileRetailerSearch) {
    mobileRetailerSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const mobileRetailerCheckboxes = mobileRetailerContainer?.querySelectorAll('.form-check') || [];
      
      mobileRetailerCheckboxes.forEach(checkbox => {
        const retailerName = checkbox.querySelector('label').textContent.toLowerCase();
        if (retailerName.includes(searchTerm)) {
          checkbox.style.display = '';
        } else {
          checkbox.style.display = 'none';
        }
      });
    });
  }
}

// Example usage with sample categories
const categories = ['Electronics', 'Computers', 'Smartphones', 'Audio', 'Gaming', 'Accessories', 'Home Appliances', 'Wearables'];
populateCategoryFilters(categories);

// Example usage with brands
const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'Google', 'OnePlus'];
populateBrandFilters(brands);

// Example usage with retailers
const retailers = ['Amazon', 'Takealot', 'Checkers', 'Pick n Pay', 'Game', 'Makro', 'Incredible Connection'];
populateRetailerFilters(retailers);

// Add search functionality for the hero search bar
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.hero-section .search-input');
    const searchButton = document.querySelector('.hero-section .search-btn');

    if(searchInput && searchButton)
    {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim().toLowerCase();
            performSearch(query);
        });

        // Allow search on Enter key press
        searchInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter')
            {
                const query = searchInput.value.trim().toLowerCase();
                performSearch(query);
            }
        });
    }
});

function performSearch(query)
{
    // For now, filter static data; later, this will call an API
    const filteredProducts = staticProductData.filter(product => 
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

// Run the rendering function when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(staticProductData);
});