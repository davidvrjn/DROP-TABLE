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
function setupPriceHistoryButtons(watchlistData) {
    const buttons = document.querySelectorAll(".view-price-history");
    const modal = document.getElementById("priceHistoryModal");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            const product = watchlistData.find((p) => p.id === productId);
            if (product) showPriceHistory(product);
        });
    });
}

/**
 * Show price history for a product
 * @param {string} productId - The ID of the product to show history for
 */
function showPriceHistory(productId) {
    const product = staticWatchlistData.find((item) => item.id === productId);

    if (!product || !product.price_history) {
        console.error("Product or price history not found");
        return;
    }

    const modalTitle = document.getElementById("priceHistoryModalLabel");
    if (modalTitle) {
        modalTitle.textContent = `Price History: ${product.title}`;
    }

    const chartContainer = document.getElementById("priceHistoryChart");

    if (chartContainer) {
        let historyHTML = '<div class="table-responsive"><table class="table">';
        historyHTML +=
            "<thead><tr><th>Date</th><th>Price</th></tr></thead><tbody>";

        product.price_history.forEach((entry) => {
            historyHTML += `<tr><td>${
                entry.date
            }</td><td>R${entry.price.toFixed(2)}</td></tr>`;
        });

        historyHTML += "</tbody></table></div>";
        chartContainer.innerHTML = historyHTML;
    }
}

// Initialize the watchlist when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    renderWatchlistItems();
});

// Export functions for potential use in other modules
export { renderWatchlistItems, removeFromWatchlist };
