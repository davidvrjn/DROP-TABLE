import { createWatchlistCardHTML } from "../partials/_watchlist-card.js";

async function fetchWatchlistData(userId) {
    try {
        const response = await fetch("http://localhost:3000/Get/Watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userid: userId }),
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
                            userid: userId,
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
    const buttons = document.querySelectorAll(".view-price-history");

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const productId = this.getAttribute("data-product-id");
            const product = data.find(
                (item) => String(item.id) === String(productId)
            );
            if (!product) return;

            try {
                const res = await fetch(
                    "http://localhost:3000/Get/RetailPrices",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_id: product.id }),
                    }
                );

                const result = await res.json();
                if (result.status !== "success" || !result.data) return;

                const current = result.data.reduce((lowest, item) => {
                    return parseFloat(item.final_price) <
                        parseFloat(lowest.final_price)
                        ? item
                        : lowest;
                }, result.data[0]);
                const modalTitle = document.getElementById(
                    "priceHistoryModalLabel"
                );
                const chartContainer =
                    document.getElementById("priceHistoryChart");

                if (modalTitle) {
                    modalTitle.textContent = `Price Information:`;
                }

                if (chartContainer) {
                    let html =
                        '<div class="table-responsive"><table class="table">';
                    html +=
                        "<thead><tr><th>Price Type</th><th>Price</th><th>Retailer</th></tr></thead><tbody>";

                    html += `<tr>
                        <td><strong>Current Lowest Price</strong></td>
                        <td>R${Number(current.final_price).toFixed(2)}</td>
                        <td>${current.retailer_name}</td>
                    </tr>`;

                    if (product.final_price && product.retailer_name) {
                        html += `<tr>
                            <td><strong>Last Saved Price</strong></td>
                            <td>R${Number(product.final_price).toFixed(2)}</td>
                            <td>${product.retailer_name}</td>
                        </tr>`;

                        const diff = product.final_price - current.final_price;
                        const pct = (diff / product.final_price) * 100;

                        html += `<tr class="${
                            diff > 0
                                ? "table-success"
                                : diff < 0
                                ? "table-danger"
                                : ""
                        }">
                            <td><strong>Price Difference</strong></td>
                            <td>R${Math.abs(diff).toFixed(2)} ${
                            diff > 0
                                ? "cheaper"
                                : diff < 0
                                ? "more expensive"
                                : "(no change)"
                        }</td>
                            <td>${pct.toFixed(0)}%</td>
                        </tr>`;
                    }

                    html += "</tbody></table></div>";
                    chartContainer.innerHTML = html;
                }
            } catch (err) {
                console.error("Failed to fetch retailer prices:", err);
            }
        });
    });
}

function setupSaveCurrentPriceButtons(data) {
    const buttons = document.querySelectorAll(".save-current-price");

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const productId = this.getAttribute("data-product-id");
            const product = data.find(
                (item) => String(item.id) === String(productId)
            );
            if (!product) return;

            const user =
                localStorage.getItem("user") || sessionStorage.getItem("user");
            const userId = JSON.parse(user || "{}").id;
            if (!userId) return;

            try {
                const res = await fetch(
                    "http://localhost:3000/Get/RetailPrices",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_id: product.id }),
                    }
                );

                const result = await res.json();
                if (result.status !== "success" || !result.data) return;

                const current = result.data.reduce((lowest, item) => {
                    return parseFloat(item.final_price) <
                        parseFloat(lowest.final_price)
                        ? item
                        : lowest;
                }, result.data[0]);

                console.log(current);

                const updateRes = await fetch(
                    "http://localhost:3000/Update/Watchlist",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userid: userId,
                            product_id: product.id,
                            initial_price: current.initial_price,
                            final_price: current.final_price,
                            retailer_name: current.retailer_name,
                        }),
                    }
                );

                const updateResult = await updateRes.json();
                if (updateResult.status === "success") {
                    alert("Current price saved to your watchlist.");
                    renderWatchlistItems();
                } else {
                    alert("Failed to save: " + updateResult.message);
                }
            } catch (err) {
                console.error("Error updating watchlist:", err);
                alert("Failed to update.");
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderWatchlistItems();
});

export { renderWatchlistItems, saveCurrentPrice };
