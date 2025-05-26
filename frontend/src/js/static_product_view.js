document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const retailerId = urlParams.get("retailerId") || 1;

    if (productId) {
        loadProductData(productId, retailerId);
    }
});

async function loadProductData(productId, retailerId) {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user || "{}").id || 0;

    try {
        const response = await fetch(
            `http://localhost:3000/Get/Product/${productId}/${retailerId}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid: userId }),
            }
        );

        const result = await response.json();

        if (result.status === "success") {
            const product = sanitizeProduct(result.data);
            renderProductData(product);
        } else {
            showProductError("Product not found.");
        }
    } catch (err) {
        console.error("Error:", err);
        showProductError("Failed to load product.");
    }
}

function sanitizeProduct(product) {
    return {
        ...product,
        final_price: parseFloat(product.final_price),
        initial_price: parseFloat(product.initial_price),
        images: safeParseArray(product.images, product.image_url),
        features: safeParseArray(product.features),
        specifications: safeParseObject(product.specifications),
        reviewCount: Array.isArray(product.reviews)
            ? product.reviews.length
            : 0,
        description: product.description || "No description available.",
    };
}

function safeParseArray(value, fallback = []) {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [fallback];
    } catch {
        return fallback ? [fallback] : [];
    }
}

function safeParseObject(value) {
    try {
        return typeof value === "object" ? value : JSON.parse(value);
    } catch {
        return {};
    }
}

function renderProductData(product) {
    document.getElementById("product-title").textContent = product.title;

    const priceElement = document.getElementById("product-price");
    if (product.discount > 0) {
        priceElement.innerHTML = `
            <span class="h3 mb-0">R${product.final_price.toFixed(2)}</span>
            <span class="text-decoration-line-through ms-2 text-muted">R${product.initial_price.toFixed(
                2
            )}</span>
            <span class="badge bg-danger ms-2">${product.discount}% OFF</span>
        `;
    } else {
        priceElement.innerHTML = `<span class="h3 mb-0">R${product.final_price.toFixed(
            2
        )}</span>`;
    }

    document.getElementById(
        "retailer-name"
    ).innerHTML = `From <span class="retailer-name">${product.retailer_name}</span>`;
    document.getElementById("product-description").textContent =
        product.description;

    const ratingElement = document.getElementById("product-rating");
    if (product.rating) {
        ratingElement.querySelector(".rating-value").textContent =
            product.rating.toFixed(1);
        ratingElement.querySelector(
            ".rating-count"
        ).textContent = `(${product.reviewCount})`;
    } else {
        ratingElement.style.display = "none";
    }

    const featuresList = document.getElementById("product-features");
    featuresList.innerHTML = "";
    product.features.forEach((f) => {
        const li = document.createElement("li");
        li.textContent = f;
        featuresList.appendChild(li);
    });

    const specsContainer = document.getElementById("product-specs");
    specsContainer.innerHTML = "";
    for (const [key, value] of Object.entries(product.specifications)) {
        const div = document.createElement("div");
        div.className = "spec-item";
        div.innerHTML = `<strong>${key}:</strong> <span>${value}</span>`;
        specsContainer.appendChild(div);
    }

    const carouselInner = document.querySelector(".carousel-inner");
    const carouselIndicators = document.getElementById("carousel-indicators");
    carouselInner.innerHTML = "";
    carouselIndicators.innerHTML = "";

    product.images.forEach((img, index) => {
        const item = document.createElement("div");
        item.className = `carousel-item ${index === 0 ? "active" : ""}`;
        item.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
                <img src="${img}" class="d-block" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
            </div>
        `;
        carouselInner.appendChild(item);

        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.dataset.bsTarget = "#productCarousel";
        indicator.dataset.bsSlideTo = index;
        indicator.setAttribute("aria-label", `Slide ${index + 1}`);
        if (index === 0) {
            indicator.classList.add("active");
            indicator.setAttribute("aria-current", "true");
        }
        carouselIndicators.appendChild(indicator);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const wishlistBtn = document.querySelector(".wishlist-btn");
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const retailerId = urlParams.get("retailerId") || 1;

    wishlistBtn?.addEventListener("click", async () => {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        const userId = JSON.parse(user || "{}").id;

        if (!userId) {
            alert("Please log in to add items to your watchlist.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/Add/Watchlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: productId,
                    retailer_id: retailerId,
                    userid: userId,
                }),
            });

            const result = await response.json();
            if (result.status === "success") {
                wishlistBtn.classList.add("btn-success");
                wishlistBtn.innerHTML = `<i class="bi bi-heart-fill"></i> Added to Watchlist`;
            } else {
                console.error("Failed to add:", result.message);
                alert("Failed to add to watchlist.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Could not connect to the server.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const viewRetailersBtn = document.querySelector(".view-retailers-btn");
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    viewRetailersBtn?.addEventListener("click", async () => {
        if (!productId) return;

        try {
            const res = await fetch("http://localhost:3000/Get/RetailPrices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId }),
            });

            const result = await res.json();
            if (result.status === "success" && Array.isArray(result.data)) {
                showRetailPrices(result.data);
            } else {
                alert("No retailer prices found.");
            }
        } catch (error) {
            console.error("Error fetching retailer prices:", error);
            alert("Failed to load retailer prices.");
        }
    });
});

function showRetailPrices(data) {
    // You can customize this rendering location
    const container = document.getElementById("retailer-prices-content") || document.body;

    const html = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Retailer</th>
                    <th>Initial Price</th>
                    <th>Final Price</th>
                    <th>Discount</th>
                </tr>
            </thead>
            <tbody>
                ${data
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.retailer_name}</td>
                        <td>R${Number(item.initial_price).toFixed(2)}</td>
                        <td>R${Number(item.final_price).toFixed(2)}</td>
                        <td>${item.discount}%</td>
                    </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // If using Bootstrap modal and modal is hidden, open it
    const modalEl = document.getElementById("retailerPricesModal");
    if (modalEl && typeof bootstrap !== "undefined") {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function showProductError(message) {
    document.getElementById("product-title").textContent = message;
    document.getElementById("product-price").textContent = "";
    document.getElementById("product-description").textContent = "";
    document.getElementById("product-rating").style.display = "none";
    document.getElementById("product-features").innerHTML = "";
    document.getElementById("product-specs").innerHTML = "";
    document.querySelector(".carousel-inner").innerHTML = "";
    document.getElementById("carousel-indicators").innerHTML = "";
}
