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
    final_price: 299.99,
    retailer_name: 'Amazon',
    rating: 4.5,
    price_history: [
      { date: '2025-01-01', price: 349.99 },
      { date: '2025-02-01', price: 329.99 },
      { date: '2025-03-01', price: 299.99 }
    ]
  },
  {
    id: 'prod-002',
    image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
    title: 'Mechanical Keyboard',
    final_price: 750.00,
    retailer_name: 'Checkers',
    initial_price: 1000.00,
    discount: 25,
    price_history: [
      { date: '2025-01-01', price: 1000.00 },
      { date: '2025-02-01', price: 900.00 },
      { date: '2025-03-01', price: 750.00 }
    ]
  },
  {
    id: 'prod-003',
    image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
    title: 'USB-C Hub',
    final_price: 450.50,
    retailer_name: 'Pick n Pay',
    rating: 3.8,
    price_history: [
      { date: '2025-01-01', price: 500.00 },
      { date: '2025-02-01', price: 475.00 },
      { date: '2025-03-01', price: 450.50 }
    ]
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
        showPriceHistory(productId);
      });
    });
  }
}

/**
 * Show price history for a product
 * @param {string} productId - The ID of the product to show history for
 */
function showPriceHistory(productId) {
  const product = staticWatchlistData.find(item => item.id === productId);
  
  if (!product || !product.price_history) {
    console.error("Product or price history not found");
    return;
  }
  
  const modalTitle = document.getElementById('priceHistoryModalLabel');
  if (modalTitle) {
    modalTitle.textContent = `Price History: ${product.title}`;
  }
  

  const chartContainer = document.getElementById('priceHistoryChart');
  
  if (chartContainer) {
    let historyHTML = '<div class="table-responsive"><table class="table">';
    historyHTML += '<thead><tr><th>Date</th><th>Price</th></tr></thead><tbody>';
    
    product.price_history.forEach(entry => {
      historyHTML += `<tr><td>${entry.date}</td><td>R${entry.price.toFixed(2)}</td></tr>`;
    });
    
    historyHTML += '</tbody></table></div>';
    chartContainer.innerHTML = historyHTML;
  }
}

// Initialize the watchlist when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  renderWatchlistItems();
});

// Export functions for potential use in other modules
export { renderWatchlistItems, removeFromWatchlist };