// This file contains static data for testing the watchlist functionality
// It imports the watchlist card component and renders sample watchlist items

import { createWatchlistCardHTML } from '../partials/_watchlist-card.js';

/**
 * Static data for testing watchlist card rendering.
 * This array contains sample products that would be in a user's watchlist.
 */
const staticWatchlistData = [
  {
    id: 'prod-001',
    image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
    title: 'Wireless Mouse',
    final_price: 499.99,
    retailer_name: 'Amazon',
    rating: 4.5,
    price_change: {
      last_price: 329.99,
      last_retailer: 'Takealot',
      lowest_price: 499.99,
      lowest_retailer: 'Amazon'
    }
  },
  {
    id: 'prod-002',
    image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
    title: 'Mechanical Keyboard',
    final_price: 750.00,
    retailer_name: 'Checkers',
    initial_price: 1000.00,
    discount: 25,
    price_change: {
      last_price: 900.00,
      last_retailer: 'Game',
      lowest_price: 750.00,
      lowest_retailer: 'Checkers'
    }
  },
  {
    id: 'prod-003',
    image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
    title: 'USB-C Hub',
    final_price: 450.50,
    retailer_name: 'Pick n Pay',
    rating: 3.8,
    price_change: {
      last_price: 475.00,
      last_retailer: 'Takealot',
      lowest_price: 450.50,
      lowest_retailer: 'Pick n Pay'
    }
  }
];

/**
 * Function to render watchlist items to the page
 */
function renderWatchlistItems() {
  const watchlistContainer = document.getElementById('watchlist-items');
  const emptyWatchlistElement = document.getElementById('empty-watchlist');
  
  if (!watchlistContainer) {
    console.error("Watchlist container not found!");
    return;
  }
  
  // Clear existing content
  watchlistContainer.innerHTML = '';
  
  // Check if watchlist has items
  if (staticWatchlistData.length === 0) {
    // Show empty state
    if (emptyWatchlistElement) {
      emptyWatchlistElement.style.display = 'block';
    }
    watchlistContainer.style.display = 'none';
    return;
  }
  
  // Hide empty state and show watchlist items
  if (emptyWatchlistElement) {
    emptyWatchlistElement.style.display = 'none';
  }
  watchlistContainer.style.display = 'flex';
  
  // Loop through the watchlist items and generate/insert HTML
  staticWatchlistData.forEach(product => {
    const watchlistCardHTML = createWatchlistCardHTML(product);
    watchlistContainer.innerHTML += watchlistCardHTML;
  });
  
  // Add event listeners for remove buttons
  setupRemoveButtons();
  
  // Add event listeners for price history buttons
  setupPriceHistoryButtons();
  
  // Add event listeners for save current price buttons
  setupSaveCurrentPriceButtons();
}

/**
 * Setup event listeners for remove buttons
 */
function setupRemoveButtons() {
  const removeButtons = document.querySelectorAll('.remove-from-watchlist');
  
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      removeFromWatchlist(productId);
    });
  });
}

/**
 * Remove an item from the watchlist
 * @param {string} productId - The ID of the product to remove
 */
function removeFromWatchlist(productId) {
  const index = staticWatchlistData.findIndex(item => item.id === productId);
  
  if (index !== -1) {
    staticWatchlistData.splice(index, 1);
    renderWatchlistItems();
  }
}

/**
 * Setup event listeners for price history buttons
 */
function setupPriceHistoryButtons() {
  const priceHistoryButtons = document.querySelectorAll('.view-price-history');
  const priceHistoryModal = document.getElementById('priceHistoryModal');
  
  if (priceHistoryModal) {
    priceHistoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        showPriceChange(productId);
      });
    });
  }
}

/**
 * Setup event listeners for save current price buttons
 */
function setupSaveCurrentPriceButtons() {
  const saveCurrentPriceButtons = document.querySelectorAll('.save-current-price');
  
  saveCurrentPriceButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      saveCurrentPrice(productId);
    });
  });
}

/**
 * Save the current price for a product
 * Add in the API keys etc for updating on the wishlist
 * @param {string} productId - The ID of the product to save price for
 */
function saveCurrentPrice(productId) {

  //rember to ask use to confirm
  const product = staticWatchlistData.find(item => item.id === productId);
  
  if (!product) {
    console.error("Product not found");
    return;
  }
  
  // Update the last saved price with the current price
  if (!product.price_change) {
    product.price_change = {};
  }
  
  product.price_change.last_price = product.final_price;
  product.price_change.last_retailer = product.retailer_name;
  
  // Re-render the watchlist to reflect changes
  renderWatchlistItems();
}

/**
 * Show price change information for a product
 * @param {string} productId - The ID of the product to show price change for
 */
function showPriceChange(productId) {
  const product = staticWatchlistData.find(item => item.id === productId);
  
  if (!product || !product.price_change) {
    console.error("Product or price change information not found");
    return;
  }
  
  const modalTitle = document.getElementById('priceHistoryModalLabel');
  if (modalTitle) {
    modalTitle.textContent = `Price Information: ${product.title}`;
  }
  
  const chartContainer = document.getElementById('priceHistoryChart');
  
  if (chartContainer) {
    let priceChangeHTML = '<div class="table-responsive"><table class="table">';
    priceChangeHTML += '<thead><tr><th>Price Type</th><th>Price</th><th>Retailer</th></tr></thead><tbody>';
    
    // Add current lowest price row
    priceChangeHTML += `<tr>
      <td><strong>Current Lowest Price</strong></td>
      <td>R${product.price_change.lowest_price.toFixed(2)}</td>
      <td>${product.price_change.lowest_retailer}</td>
    </tr>`;
    
    // Add last saved price row
    priceChangeHTML += `<tr>
      <td><strong>Last Saved Price</strong></td>
      <td>R${product.price_change.last_price.toFixed(2)}</td>
      <td>${product.price_change.last_retailer}</td>
    </tr>`;
    
    // Calculate price difference and percentage
    const priceDifference = product.price_change.last_price - product.price_change.lowest_price;
    const percentageDifference = (priceDifference / product.price_change.last_price) * 100;
    
    // Add price difference row
    priceChangeHTML += `<tr class="${priceDifference > 0 ? 'table-success' : priceDifference < 0 ? 'table-danger' : ''}">
      <td><strong>Price Difference</strong></td>
      <td>R${Math.abs(priceDifference).toFixed(2)} ${priceDifference > 0 ? 'cheaper' : priceDifference < 0 ? 'more expensive' : '(no change)'}</td>
      <td>${-1 * (percentageDifference).toFixed(2)}%</td>
    </tr>`;
    
    priceChangeHTML += '</tbody></table></div>';
    chartContainer.innerHTML = priceChangeHTML;
  }
}

// Initialize the watchlist when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  renderWatchlistItems();
});

/**
 * Function to render watchlist items to the page
 */
function renderWatchlistItems() {
  const watchlistContainer = document.getElementById('watchlist-items');
  const emptyWatchlistElement = document.getElementById('empty-watchlist');
  
  if (!watchlistContainer) {
    console.error("Watchlist container not found!");
    return;
  }
  
  // Clear existing content
  watchlistContainer.innerHTML = '';
  
  // Check if watchlist has items
  if (staticWatchlistData.length === 0) {
    // Show empty state
    if (emptyWatchlistElement) {
      emptyWatchlistElement.style.display = 'block';
    }
    watchlistContainer.style.display = 'none';
    return;
  }
  
  // Hide empty state and show watchlist items
  if (emptyWatchlistElement) {
    emptyWatchlistElement.style.display = 'none';
  }
  watchlistContainer.style.display = 'flex';
  
  // Loop through the watchlist items and generate/insert HTML
  staticWatchlistData.forEach(product => {
    const watchlistCardHTML = createWatchlistCardHTML(product);
    watchlistContainer.innerHTML += watchlistCardHTML;
  });
  
  // Add event listeners for remove buttons
  setupRemoveButtons();
  
  // Add event listeners for price history buttons
  setupPriceHistoryButtons();
  
  // Add event listeners for save current price buttons
  setupSaveCurrentPriceButtons();
}

// Export functions for potential use in other modules
export { renderWatchlistItems, removeFromWatchlist, saveCurrentPrice };