// This file is used to test the rendering of product cards on a webpage.
// It imports a function to create product card HTML and uses static data for testing.
// The static data includes product details such as ID, image URL, title, final price, initial price, and discount percentage.
// The rendered product cards are inserted into a container with the ID 'product-list'.
// This file is not intended for production use and is meant for testing purposes only.


// Import the function to generate product card HTML
import { createProductCardHTML } from '../partials/_product-card.js';

/**
 * Static data for testing product card rendering.
 * This array contains 5 product objects.
 */
const staticProductData = [
    {
        id: 'prod-001',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg', // Placeholder image
        title: 'Wireless Mouse',
        final_price: 299.99,
        initial_price: undefined, // No initial price for non-discounted
        discount: 0,
    },
    {
        id: 'prod-002',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Mechanical Keyboard',
        final_price: 750.00,
        initial_price: 1000.00, // Initial price for discount
        discount: 25, // Discount percentage
    },
    {
        id: 'prod-003',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'USB-C Hub',
        final_price: 450.50,
        initial_price: undefined,
        discount: 0,
    },
    {
        id: 'prod-004',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Webcam 1080p',
        final_price: 600.00,
        initial_price: 750.00,
        discount: 20,
    },
     {
        id: 'prod-005',
        image_url: 'https://m.media-amazon.com/images/I/71geIOeuw-L._AC_SY450_.jpg',
        title: 'Monitor Stand',
        final_price: 350.00,
        initial_price: undefined,
        discount: 0,
    },
];

// Function to render products to the page
function renderProducts(productsToRender) {
    const productListContainer = document.getElementById('product-list'); 

    if (!productListContainer) {
        console.error("Product list container not found!");
        return;
    }

    // Clear existing content
    productListContainer.innerHTML = '';

    // Loop through the products and generate/insert HTML
    productsToRender.forEach(product => {
        // Create the HTML string for a single product card using the imported function
        const productCardHTML = createProductCardHTML(product);

        productListContainer.innerHTML += productCardHTML; 
    });
}

// Run the rendering function when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(staticProductData);
});
