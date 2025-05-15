/**
 * Generates the HTML string for a single product card.
 * @param {object} product - The product data object from the API.
 * @param {string} product.id - The product ID.
 * @param {string} product.image_url - The URL of the product image.
 * @param {string} product.title - The product title.
 * @param {number} product.final_price - The product final price.
 * @param {number} [product.initial_price] - The initial product price (optional).
 * @param {number} [product.discount] - The product discount percentage (optional).
 * @returns {string} The HTML string for the product card.
 */
export function createProductCardHTML(product) {
    return `
      <div class="col-md-4 mb-4">
          <div class="card h-100">
              <img src="${product.image_url}" class="card-img-top" alt="${product.title}">
              <div class="card-body">
                  <h5 class="card-title">${product.title}</h5>
                  <div class="d-flex justify-content-between align-items-center">
                      <span class="h5 mb-0">
                          R${product.final_price.toFixed(2)}
                          ${product.discount && product.discount > 0 && product.initial_price ?
                              `<span class="text-decoration-line-through me-2 text-muted">R${product.initial_price.toFixed(2)}</span>`
                              : ''}
                      </span>
                      <a href="view.html?id=${product.id}" class="btn btn-primary">View Product</a>
                  </div>
              </div>
              ${product.discount && product.discount > 0 ? `
              <div class="badge bg-danger position-absolute top-0 end-0 m-2">
                  ${product.discount}% OFF
              </div>
              ` : ''}
          </div>
      </div>
    `;
  }
