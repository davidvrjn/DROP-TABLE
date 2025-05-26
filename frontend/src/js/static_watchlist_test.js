import { createWatchlistCardHTML } from "../partials/_watchlist-card.js";

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

    setupRemoveButtons(userId);
    setupPriceHistoryButtons(watchlistData);
    setupSaveCurrentPriceButtons(watchlistData);
}

function setupRemoveButtons(userId) {
    const buttons = document.querySelectorAll(".remove-from-watchlist");

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

function setupPriceHistoryButtons(data) {
    const priceHistoryButtons = document.querySelectorAll(
        ".view-price-history"
    );
    const priceHistoryModal = document.getElementById("priceHistoryModal");

    priceHistoryButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            const product = data.find((item) => item.id === productId);
            showPriceChange(product);
        });
    });
}

function setupSaveCurrentPriceButtons(data) {
    const saveCurrentPriceButtons = document.querySelectorAll(
        ".save-current-price"
    );

    saveCurrentPriceButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            const product = data.find((item) => item.id === productId);
            saveCurrentPrice(product);
        });
    });
}

function saveCurrentPrice(product) {
    if (!product) {
        console.error("Product not found");
        return;
    }

    if (!product.price_change) {
        product.price_change = {};
    }

    product.price_change.last_price = product.final_price;
    product.price_change.last_retailer = product.retailer_name;

    renderWatchlistItems();
}

function showPriceChange(product) {
    if (!product || !product.price_change) {
        console.error("Product or price change information not found");
        return;
    }

    const modalTitle = document.getElementById("priceHistoryModalLabel");
    const chartContainer = document.getElementById("priceHistoryChart");

    if (modalTitle) {
        modalTitle.textContent = `Price Information: ${product.title}`;
    }

    if (chartContainer) {
        let priceChangeHTML =
            '<div class="table-responsive"><table class="table">';
        priceChangeHTML +=
            "<thead><tr><th>Price Type</th><th>Price</th><th>Retailer</th></tr></thead><tbody>";

        priceChangeHTML += `<tr>
            <td><strong>Current Lowest Price</strong></td>
            <td>R${product.price_change.lowest_price.toFixed(2)}</td>
            <td>${product.price_change.lowest_retailer}</td>
        </tr>`;

        priceChangeHTML += `<tr>
            <td><strong>Last Saved Price</strong></td>
            <td>R${product.price_change.last_price.toFixed(2)}</td>
            <td>${product.price_change.last_retailer}</td>
        </tr>`;

        const priceDifference =
            product.price_change.last_price - product.price_change.lowest_price;
        const percentageDifference =
            (priceDifference / product.price_change.last_price) * 100;

        priceChangeHTML += `<tr class="${
            priceDifference > 0
                ? "table-success"
                : priceDifference < 0
                ? "table-danger"
                : ""
        }">
            <td><strong>Price Difference</strong></td>
            <td>R${Math.abs(priceDifference).toFixed(2)} ${
            priceDifference > 0
                ? "cheaper"
                : priceDifference < 0
                ? "more expensive"
                : "(no change)"
        }</td>
            <td>${(-1 * percentageDifference).toFixed(2)}%</td>
        </tr>`;

        priceChangeHTML += "</tbody></table></div>";
        chartContainer.innerHTML = priceChangeHTML;
    }
}

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", function () {
    renderWatchlistItems();
});

export { renderWatchlistItems, saveCurrentPrice };
