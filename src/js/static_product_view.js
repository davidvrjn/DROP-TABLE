/**
 * Static Product View JavaScript
 * This file provides static data for the product view page
 * and handles the rendering of product details.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get product ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'sample-product';

  // Load product
  loadProductData(productId);
});

/**
 * Load product data based on ID
 * @param {string} productId - The ID of the product to load
 */
function loadProductData(productId) {
  const productData = getSampleProductData(productId);

  // Render product data to the page
  renderProductData(productData);
}

/**
 * Get sample product data
 * @param {string} productId - The ID of the product
 * @returns {object} Sample product data
 */
function getSampleProductData(productId) {
  // Sample product data
  return {
    id: productId,
    title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback). Touch Sensor controls to pause/play/skip tracks, control volume, activate your voice assistant, and answer phone calls. Speak-to-chat technology automatically reduces volume during conversations.",
    price: 4999.99,
    discount: 15,
    originalPrice: 5999.99,
    rating: 4.8,
    reviewCount: 1245,
    retailer: "Takealot",
    inStock: true,
    images: [
      "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81d0PKhH7FL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Zg1CXSOFL._AC_SL1500_.jpg"
    ],
    features: [
      "Industry-leading noise cancellation",
      "30-hour battery life",
      "Speak-to-chat technology",
      "Touch sensor controls",
      "Wearing detection with smart playback",
      "Seamless multiple-device pairing"
    ],
    specifications: {
      "Brand": "Sony",
      "Model": "WH-1000XM4",
      "Color": "Black",
      "Connectivity": "Bluetooth 5.0",
      "Battery Life": "30 hours",
      "Charging Time": "3 hours",
      "Weight": "254g",
      "Noise Cancellation": "Yes",
      "Microphone": "Built-in",
      "Warranty": "1 Year"
    },
  };
}

/**
 * Render product data to the page
 * @param {object} product - The product data to render
 */
function renderProductData(product) {
  // Set product title
  document.getElementById('product-title').textContent = product.title;

  // Set product price
  const priceElement = document.getElementById('product-price');
  if (product.discount && product.discount > 0) {
    priceElement.innerHTML = `
      <span class="h3 mb-0">R${product.price.toFixed(2)}</span>
      <span class="text-decoration-line-through ms-2 text-muted">R${product.originalPrice.toFixed(2)}</span>
      <span class="badge bg-danger ms-2">${product.discount}% OFF</span>
    `;
  } else {
    priceElement.innerHTML = `<span class="h3 mb-0">R${product.price.toFixed(2)}</span>`;
  }

  // Add retailer info
  priceElement.innerHTML += `<div class="text-muted mt-1">From ${product.retailer}</div>`;

  // Set product description
  document.getElementById('product-description').textContent = product.description;

  // Set product features
  const featuresElement = document.getElementById('product-features');
  featuresElement.innerHTML = '';
  product.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    featuresElement.appendChild(li);
  });

  // Set product specifications
  const specsElement = document.getElementById('product-specs');
  specsElement.innerHTML = '';
  for (const [key, value] of Object.entries(product.specifications)) {
    const specItem = document.createElement('div');
    specItem.className = 'spec-item';
    specItem.innerHTML = `
      <strong>${key}:</strong>
      <span>${value}</span>
    `;
    specsElement.appendChild(specItem);
  }

  // Set product images in carousel
  const carouselInner = document.querySelector('.carousel-inner');
  carouselInner.innerHTML = '';

  // Create carousel indicators
  const carouselIndicators = document.getElementById('carousel-indicators');
  carouselIndicators.innerHTML = '';

  product.images.forEach((image, index) => {
    // Create carousel item
    const carouselItem = document.createElement('div');
    carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    carouselItem.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 300px; background-color: rgba(0,0,0,0.02);">
        <img src="${image}" class="d-block" alt="${product.title} image ${index + 1}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
      </div>
    `;
    carouselInner.appendChild(carouselItem);

    // Create indicator button
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.bsTarget = '#productCarousel';
    indicator.dataset.bsSlideTo = index;
    indicator.setAttribute('aria-label', `Slide ${index + 1}`);

    if (index === 0) {
      indicator.classList.add('active');
      indicator.setAttribute('aria-current', 'true');
    }

    carouselIndicators.appendChild(indicator);
  });
}