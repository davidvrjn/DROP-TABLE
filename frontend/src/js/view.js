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

    // Check if product is in watchlist and update button
    const wishlistBtn = document.querySelector(".wishlist-btn");
    if (product.watchlist === 1 && wishlistBtn) {
        wishlistBtn.classList.add("btn-success");
        wishlistBtn.innerHTML = `<i class="bi bi-heart-fill"></i> Added to Watchlist`;
    }

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
        const user =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        const userId = JSON.parse(user || "{}").id;

        if (!userId) {
            // Replace alert with modal notification
            if (window.showLoginNotification) {
                window.showLoginNotification();
            } else {
                // Fallback if the function isn't available
                alert("Please log in to add items to your watchlist.");
            }
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:3000/Add/Watchlist",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        retailer_id: retailerId,
                        userid: userId,
                    }),
                }
            );

            const result = await response.json();
            if (result.status === "success") {
                wishlistBtn.classList.add("btn-success");
                wishlistBtn.innerHTML = `<i class="bi bi-heart-fill"></i> Added to Watchlist`;
                showCustomNotification("Successfully added to your Watchlist!", "success");
            } else {
                console.error("Failed to add:", result.message);
                showCustomNotification(result.message || "Already in your Watchlist!", "error");
            }
        } catch (error) {
            console.error("Network error:", error);
            showCustomNotification("Could not connect to the server. Please try again later.", "error");
        }
    });
});

document
    .querySelector(".view-retailers-btn")
    ?.addEventListener("click", async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");

        try {
            const res = await fetch("http://localhost:3000/Get/RetailPrices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId }),
            });

            const result = await res.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                showRetailerPricesModal(result.data);
            } else {
                alert("No retailer prices found.");
            }
        } catch (err) {
            console.error("Failed to fetch retailer prices:", err);
            alert("Something went wrong.");
        }
    });

function showRetailerPricesModal(retailers) {
    // Remove existing modal if present
    const existing = document.getElementById("retailerPricesModal");
    if (existing) existing.remove();

    // Get current theme
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "retailerPricesModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1000";

    // Create modal container
    const modal = document.createElement("div");
    modal.className = isDarkMode ? "modal-dark" : "modal-light";
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.maxWidth = "500px";
    modal.style.width = "90%";
    modal.style.maxHeight = "80vh";
    modal.style.overflowY = "auto";
    modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    
    // Set theme-specific styles
    if (isDarkMode) {
        modal.style.backgroundColor = "#212529";
        modal.style.color = "#fff";
        modal.style.border = "1px solid rgba(206, 147, 216, 0.15)";
    } else {
        modal.style.backgroundColor = "#fff";
        modal.style.color = "#212529";
        modal.style.border = "1px solid rgba(106, 27, 154, 0.15)";
    }

    // Modal content
    modal.innerHTML = `
        <h4 class="mb-3" style="color: ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'};">All Retailer Prices</h4>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid ${isDarkMode ? 'rgba(206, 147, 216, 0.15)' : 'rgba(106, 27, 154, 0.15)'}; padding-bottom: 8px;">
                    <th style="text-align: left; padding: 8px; color: ${isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};">Retailer</th>
                    <th style="text-align: left; padding: 8px; color: ${isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};">Price</th>
                    <th style="text-align: left; padding: 8px; color: ${isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};">Discount</th>
                </tr>
            </thead>
            <tbody>
                ${retailers
                    .map(
                        (r) => `
                    <tr style="border-bottom: 1px solid ${isDarkMode ? 'rgba(206, 147, 216, 0.05)' : 'rgba(106, 27, 154, 0.05)'}; transition: background-color 0.2s;">
                        <td style="padding: 12px 8px;">${r.retailer_name}</td>
                        <td style="padding: 12px 8px;">R${parseFloat(r.final_price).toFixed(2)}</td>
                        <td style="padding: 12px 8px;"><span style="background-color: ${parseFloat(((r.initial_price - r.final_price) / r.initial_price) * 100) > 0 ? (isDarkMode ? 'rgba(206, 147, 216, 0.1)' : 'rgba(106, 27, 154, 0.1)') : 'transparent'}; padding: 2px 6px; border-radius: 4px;">${parseFloat(
                            ((r.initial_price - r.final_price) /
                                r.initial_price) *
                                100
                        ).toFixed(0)}%</span></td>
                    </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px;">
            <button id="closeRetailerModal" style="padding: 8px 16px; border: 1px solid ${isDarkMode ? 'rgba(206, 147, 216, 0.5)' : 'rgba(106, 27, 154, 0.5)'}; background: ${isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)'}; color: ${isDarkMode ? '#212529' : 'white'}; border-radius: 20px; cursor: pointer; transition: all 0.3s;">Close</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add hover effect to rows
    const rows = modal.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.addEventListener('mouseover', () => {
            row.style.backgroundColor = isDarkMode ? 'rgba(206, 147, 216, 0.05)' : 'rgba(106, 27, 154, 0.05)';
        });
        row.addEventListener('mouseout', () => {
            row.style.backgroundColor = 'transparent';
        });
    });

    // Add hover effect to close button
    const closeButton = document.getElementById("closeRetailerModal");
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = isDarkMode ? 'rgba(206, 147, 216, 1)' : 'rgba(106, 27, 154, 1)';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)';
    });

    closeButton.addEventListener("click", () => overlay.remove());
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

//
function showCustomNotification(message, type = 'info') {
    // Remove existing notification if present
    const existingNotification = document.getElementById("customNotificationModal");
    if (existingNotification) existingNotification.remove();

    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    const overlay = document.createElement("div");
    overlay.id = "customNotificationModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.4)"; // Slightly less dark overlay
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1050"; // Ensure it's above other modals if any

    const modal = document.createElement("div");
    modal.style.padding = "25px 30px";
    modal.style.borderRadius = "12px";
    modal.style.maxWidth = "400px";
    modal.style.width = "90%";
    modal.style.textAlign = "center";
    modal.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";

    if (isDarkMode) {
        modal.style.backgroundColor = "#2c3034"; // Darker background for dark mode
        modal.style.color = "#e9ecef";
        modal.style.border = "1px solid rgba(206, 147, 216, 0.2)";
    } else {
        modal.style.backgroundColor = "#ffffff";
        modal.style.color = "#212529";
        modal.style.border = "1px solid rgba(106, 27, 154, 0.2)";
    }

    let titleColor = isDarkMode ? 'rgba(206, 147, 216, 0.9)' : 'rgba(106, 27, 154, 0.9)';
    let iconHtml = '';

    // Optional: Add icons based on type
    if (type === 'success') {
        titleColor = isDarkMode ? '#28a745' : '#198754'; // Green for success
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="color:${titleColor}; margin-bottom:10px;"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg><br/>`;
    } else if (type === 'error') {
        titleColor = isDarkMode ? '#dc3545' : '#dc3545'; // Red for error
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16" style="color:${titleColor}; margin-bottom:10px;"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><br/>`;
    }

    modal.innerHTML = `
        ${iconHtml}
        <p style="font-size: 1.1rem; margin-bottom: 20px; line-height: 1.6;">${message}</p>
        <button id="closeCustomNotification" style="padding: 10px 25px; border: none; background: ${titleColor}; color: ${isDarkMode && (type ==='success' || type ==='error') ? '#212529' : 'white'}; border-radius: 25px; cursor: pointer; font-weight: 500; transition: background-color 0.3s;">OK</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeButton = document.getElementById("closeCustomNotification");
    const defaultButtonBg = closeButton.style.backgroundColor;

    closeButton.addEventListener('mouseover', () => {
        // Basic hover: darken or lighten based on theme and type
        // This can be made more sophisticated with tinycolor.js or similar if needed
        closeButton.style.backgroundColor = isDarkMode ? (type === 'success' || type === 'error' ? lightenDarkenColor(defaultButtonBg, -10) : lightenDarkenColor(defaultButtonBg, 10)) : lightenDarkenColor(defaultButtonBg, -20) ;
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = defaultButtonBg;
    });

    closeButton.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Helper function for hover effect (optional, can be expanded)
function lightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    else if (col.startsWith('rgb')) { // Handle rgb/rgba
        let parts = col.match(/[\d\.]+/g);
        if (!parts || parts.length < 3) return col; // Invalid rgb
        let r = parseInt(parts[0]), g = parseInt(parts[1]), b = parseInt(parts[2]);
        r = Math.max(0, Math.min(255, r + amt));
        g = Math.max(0, Math.min(255, g + amt));
        b = Math.max(0, Math.min(255, b + amt));
        return `rgb(${r}, ${g}, ${b}${parts.length === 4 ? `, ${parts[3]}` : ''})`;
    }

    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
