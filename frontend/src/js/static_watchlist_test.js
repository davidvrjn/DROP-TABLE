// This file contains static data for testing the watchlist functionality
// It imports the watchlist card component and renders sample watchlist items

import { createWatchlistCardHTML } from "../partials/_watchlist-card.js";

/**
 * Static data for testing watchlist card rendering.
 * This array contains sample products that would be in a user's watchlist.
 */

/**
 * Function to render watchlist items to the page
 */

async function fetchWatchlistData(userId) {
    try {
        const response = await fetch("http://localhost:3000/Get/Watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watchlist_id: userId }),
        });

        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
            return result.data;
        } else {
            console.error("Unexpected watchlist response:", result);
            return [];
        }
    } catch (err) {
        console.error("Error fetching watchlist:", err);
        return [];
    }
}

async function renderWatchlistItems() {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;
    const watchlistContainer = document.getElementById("watchlist-items");
    const emptyWatchlistElement = document.getElementById("empty-watchlist");

    if (!watchlistContainer) {
        console.error("Watchlist container not found!");
        return;
    }

    const watchlistData = await fetchWatchlistData(userId);
    watchlistContainer.innerHTML = "";

    if (watchlistData.length === 0) {
        if (emptyWatchlistElement)
            emptyWatchlistElement.style.display = "block";
        watchlistContainer.style.display = "none";
        return;
    }

    if (emptyWatchlistElement) emptyWatchlistElement.style.display = "none";
    watchlistContainer.style.display = "flex";

    watchlistData.forEach((product) => {
        const watchlistCardHTML = createWatchlistCardHTML(product);
        watchlistContainer.innerHTML += watchlistCardHTML;
    });

    setupRemoveButtons(watchlistData);
    setupPriceHistoryButtons(watchlistData);
}

/**
 * Setup event listeners for remove buttons
 */
function setupRemoveButtons(watchlistData) {
    const buttons = document.querySelectorAll(".remove-from-watchlist");
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const productId = this.getAttribute("data-product-id");

            try {
                const res = await fetch(
                    "http://localhost:3000/Remove/Watchlist",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            watchlist_id: userId,
                            product_id: productId,
                        }),
                    }
                );

                const result = await res.json();
                if (result.status === "success") {
                    renderWatchlistItems();
                } else {
                    console.error(
                        "Failed to remove from watchlist:",
                        result.message
                    );
                }
            } catch (err) {
                console.error("Error removing from watchlist:", err);
            }
        });
    });
}

/**
 * Remove an item from the watchlist
 * @param {string} productId - The ID of the product to remove
 */
function removeFromWatchlist(productId) {
    const index = staticWatchlistData.findIndex(
        (item) => item.id === productId
    );

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
