/**
 * Generates the HTML string for a single watchlist card.
 * @param {object} product - The product data object from the API.
 * @param {string} product.id - The product ID.
 * @param {string} product.image_url - The URL of the product image.
 * @param {string} product.title - The product title.
 * @param {number} product.final_price - The product final price.
 * @param {string} product.retailer_name - The product retailer name.
 * @param {number} [product.rating] - The product average rating (optional).
 * @param {number} [product.initial_price] - The initial product price (optional).
 * @param {number} [product.discount] - The product discount percentage (optional).
 * @param {Array} [product.price_history] - Array of price history data points (optional).
 * @returns {string} The HTML string for the watchlist card.
 */
export function createWatchlistCardHTML(product) {
  return `
    <div class="col-md-4 mb-3">
      <div class="card h-100 watchlist-card">
        <a href="view.html?id=${product.id}" class="text-decoration-none">
          <img src="${product.image_url}" class="card-img-top product-thumbnail" alt="${product.title}">
        </a>
        <div class="card-body d-flex flex-column">
          <a href="view.html?id=${product.id}" class="text-decoration-none product-title-link">
            <h5 class="card-title">${product.title}</h5>
          </a>
          <div class="mt-auto">
            <div class="product-price-container">
              <span class="h5 mb-0">R${Number(product.final_price).toFixed(2)}</span>
              ${product.discount && product.discount > 0 && product.initial_price ?
                `<span class="text-decoration-line-through ms-1 text-muted small">R${product.initial_price.toFixed(2)}</span>`
                : ''}
              <span class="text-muted small ms-1 retailertext">From ${product.retailer_name}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <a href="view.html?id=${product.id}" class="btn btn-primary btn-sm text-nowrap">View Product</a>
              ${product.rating ? `
              <div class="product-rating mx-2">
                <span class="star">★</span>
                <span class="rating-value">${product.rating.toFixed(1)}</span>
              </div>
              ` : ''}
            </div>
            <div class="mt-2 d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary btn-sm view-price-history flex-grow-1" 
                data-bs-toggle="modal" data-bs-target="#priceHistoryModal" 
                data-product-id="${product.id}">
                <i class="bi bi-graph-up"></i> Check Price Change
              </button>
              <button type="button" class="btn btn-outline-success btn-sm save-current-price flex-grow-1"
                data-product-id="${product.id}">
                <i class="bi bi-bookmark-plus"></i> Save Current Price
              </button>
            </div>
          </div>
        </div>
        ${product.discount && product.discount > 0 ? `
        <div class="badge bg-danger position-absolute top-0 end-0 m-2">
          ${product.discount}% OFF
        </div>
        ` : ''}
        <button type="button" class="remove-from-watchlist" title="Remove from Watchlist" data-product-id="${product.id}">
          <i class="bi bi-x-circle"></i>
        </button>
      </div>
    </div>
  `;
}