/**
 * Generates the HTML string for a single product card.
 * @param {object} product - The product data object from the API.
 * @param {string} product.id - The product ID.
 * @param {string} product.image_url - The URL of the product image.
 * @param {string} product.title - The product title.
 * @param {number} product.final_price - The product final price.
 * @param {string} product.retailer_name - The product retailer name.
 * @param {number} [product.rating] - The product average rating (optional).
 * @param {number} [product.initial_price] - The initial product price (optional).
 * @param {number} [product.discount] - The product discount percentage (optional).
 * @returns {string} The HTML string for the product card.
 */
export function createProductCardHTML(product) {
    return `
      <div class="col-md-4 mb-3">
          <div class="card h-100">
              <a href="view.html?id=${product.id}&retailerId=${
        product.retailer_id}">
                  <img src="${
                      product.image_url
                  }" class="card-img-top product-thumbnail" alt="${
        product.title
    }">
              </a>
              <div class="card-body d-flex flex-column"> 
                  <a href="view.html?id=${product.id}&retailerId=${
        product.retailer_id}
                  " class="text-decoration-none product-title-link">
                      <h5 class="card-title">${product.title}</h5>  
                  </a>
                  <div class="mt-auto"> 
                      <div class="product-price-container">
                          <span class="h5 mb-0">R${product.final_price.toFixed(
                              2
                          )}</span>
                          ${
                              product.discount &&
                              product.discount > 0 &&
                              product.initial_price
                                  ? `<span class="text-decoration-line-through ms-1 text-muted small">R${product.initial_price.toFixed(
                                        2
                                    )}</span>`
                                  : ""
                          }
                          <span class="text-muted small ms-1 retailertext">From ${
                              product.retailer_name
                          }</span>  
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-2">
                          <a href="view.html?id=${product.id}&retailerId=${
        product.retailer_id}
        " class="btn btn-primary btn-sm text-nowrap">View Product</a>
                          ${
                              product.rating
                                  ? `
                          <div class="product-rating mx-2">
                            <span class="star">★</span>
                            <span class="rating-value">${product.rating.toFixed(
                                1
                            )}</span>
                          </div>
                          `
                                  : ""
                          }
                      </div>
                  </div>
              </div>
              ${
                  product.discount && product.discount > 0
                      ? `
              <div class="badge bg-danger position-absolute top-0 end-0 m-2">
                  ${product.discount}% OFF
              </div>
              `
                      : ""
              }
              <button type="button" class="watchlist-icon" title="Add to Watchlist" data-product-id="${
                  product.id
              }">
                &hearts; 
              </button>
          </div>
      </div>
    `;
}
