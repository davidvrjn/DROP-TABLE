/**
 * Static Product View JavaScript
 * This file provides static data for the product view page
 * and handles the rendering of product details.
 */

document.addEventListener("DOMContentLoaded", function () {
    // Get product ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "sample-product";

    // Load product
    loadProductData(productId);
});

/**
 * Load product data based on ID
 * @param {string} productId - The ID of the product to load
 */
async function loadProductData(productId) {
    const urlParams = new URLSearchParams(window.location.search);
    const retailerId = urlParams.get("retailerId") || 1;
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;

    try {
        const response = await fetch(
            `http://localhost:3000/Get/Product/${productId}/${retailerId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userid: userId }),
            }
        );

        const result = await response.json();
        if (result.status === "success") {
            renderProductData(sanitizeProduct(result.data));
        } else {
            console.error("API error:", result.message);
            showProductError("Product not found.");
        }
    } catch (err) {
        console.error("Network error:", err);
        showProductError("Could not load product details.");
    }
}

function sanitizeProduct(product) {
    return {
        ...product,
        price: Number(product.final_price ?? 0),
        originalPrice:
            product.initial_price != null
                ? Number(product.initial_price)
                : null,
        rating: product.rating != null ? Number(product.rating) : null,
        images: product.images ?? [product.image_url], // fallback if only one image
        description: product.description || "No description available.",
        features: product.features ?? [],
        specifications: product.specifications ?? {},
        reviewCount: product.reviews?.length ?? 0,
    };
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

/**
 * Get sample product data
 * @param {string} productId - The ID of the product
 * @returns {object} Sample product data
 */

/**
 * Render product data to the page
 * @param {object} product - The product data to render
 */
function renderProductData(product) {
    // Set product title
    document.getElementById("product-title").textContent = product.title;

    // Set product price
    const priceElement = document.getElementById("product-price");
    if (product.discount && product.discount > 0) {
        priceElement.innerHTML = `
      <span class="h3 mb-0">R${product.price.toFixed(2)}</span>
      <span class="text-decoration-line-through ms-2 text-muted">R${product.originalPrice.toFixed(
          2
      )}</span>
      <span class="badge bg-danger ms-2">${product.discount}% OFF</span>
    `;
    } else {
        priceElement.innerHTML = `<span class="h3 mb-0">R${product.price.toFixed(
            2
        )}</span>`;
    }

    // Update retailer name in the dedicated element
    const retailerElement = document.getElementById("retailer-name");
    retailerElement.innerHTML = `From <span class="retailer-name">${product.retailer}</span>`;

    // Set product description
    document.getElementById("product-description").textContent =
        product.description;

    // Set product rating
    const ratingElement = document.getElementById("product-rating");
    if (product.rating) {
        const ratingStars = ratingElement.querySelector(".rating-stars");
        const ratingValue = ratingStars.querySelector(".rating-value");
        const ratingCount = ratingStars.querySelector(".rating-count");

        ratingValue.textContent = product.rating.toFixed(1);
        ratingCount.textContent = `(${product.reviewCount})`;
    } else {
        ratingElement.style.display = "none";
    }

    // Set product features
    const featuresElement = document.getElementById("product-features");
    featuresElement.innerHTML = "";
    product.features.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        featuresElement.appendChild(li);
    });

    // Set product specifications
    const specsElement = document.getElementById("product-specs");
    specsElement.innerHTML = "";
    for (const [key, value] of Object.entries(product.specifications)) {
        const specItem = document.createElement("div");
        specItem.className = "spec-item";
        specItem.innerHTML = `
      <strong>${key}:</strong>
      <span>${value}</span>
    `;
        specsElement.appendChild(specItem);
    }

    // Set product images in carousel
    const carouselInner = document.querySelector(".carousel-inner");
    carouselInner.innerHTML = "";

    // Create carousel indicators
    const carouselIndicators = document.getElementById("carousel-indicators");
    carouselIndicators.innerHTML = "";

    product.images.forEach((image, index) => {
        // Create carousel item
        const carouselItem = document.createElement("div");
        carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;
        carouselItem.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 300px; background-color: rgba(0,0,0,0.02);">
        <img src="${image}" class="d-block" alt="${product.title} image ${
            index + 1
        }" style="max-height: 100%; max-width: 100%; object-fit: contain;">
      </div>
    `;
        carouselInner.appendChild(carouselItem);

        // Create indicator button
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
