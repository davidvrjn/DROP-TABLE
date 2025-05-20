/**
 * Static Reviews Test Script
 * This script loads and displays sample review data for product pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'sample-product';
    
    // Load reviews for the product
    loadProductReviews(productId);
});

/**
 * Load product reviews
 * @param {string} productId - The ID of the product
 */
function loadProductReviews(productId) {
    // this would be an API call
    const reviewsData = getSampleReviewsData(productId);
    
    // Render reviews data
    renderReviews(reviewsData);
}

/**
 * Get sample reviews data
 * @param {string} productId - The ID of the product
 * @returns {object} Sample reviews data
 */
function getSampleReviewsData(productId) {
    // Sample reviews data
    return {
        productId: productId,
        averageRating: 4.3,
        totalReviews: 5,
        reviews: [
            {
                id: 'rev1',
                userName: 'John Smith',
                rating: 5,
                date: '2025-10-15',
                text: 'These headphones are amazing! The noise cancellation is top-notch and the sound quality is incredible. Battery life is as advertised, and they\'re very comfortable for long listening sessions.'
            },
            {
                id: 'rev2',
                userName: 'Sarah Johnson',
                rating: 4,
                date: '2025-09-28',
                text: 'Great headphones overall. The sound quality is excellent and the noise cancellation works well. My only complaint is that they get a bit uncomfortable after wearing them for several hours.'
            },
            {
                id: 'rev3',
                userName: 'Michael Brown',
                rating: 5,
                date: '2025-09-10',
                text: 'Best headphones I\'ve ever owned! The sound is crystal clear, and the noise cancellation is perfect for my daily commute. The battery life is impressive too.'
            },
            {
                id: 'rev4',
                userName: 'Emily Davis',
                rating: 3,
                date: '2025-08-22',
                text: 'Decent headphones but not worth the price in my opinion. The sound quality is good, but I\'ve had issues with the Bluetooth connection dropping occasionally.'
            },
            {
                id: 'rev5',
                userName: 'David Wilson',
                rating: 5,
                date: '2025-08-05',
                text: 'Absolutely love these headphones! The sound quality is superb, and the noise cancellation is a game-changer for working in noisy environments. Highly recommend!'
            }
        ]
    };
    
    // For testing empty reviews scenario, uncomment the following:
    /*
    return {
        productId: productId,
        averageRating: 0,
        totalReviews: 0,
        reviews: []
    };
    */
}

/**
 * Render reviews to the page
 * @param {object} reviewsData - The reviews data to render
 */
function renderReviews(reviewsData) {
    // Update overall rating
    const overallRatingValue = document.getElementById('overall-rating-value');
    const overallRatingCount = document.getElementById('overall-rating-count');
    
    if (overallRatingValue && overallRatingCount) {
        overallRatingValue.textContent = reviewsData.averageRating.toFixed(1);
        overallRatingCount.textContent = `(${reviewsData.totalReviews} reviews)`;
        
        // Update star rating visualization
        updateStarRating(document.querySelector('.overall-rating .rating-stars'), reviewsData.averageRating);
    }
    
    // Get reviews container
    const reviewsContainer = document.getElementById('reviews-container');
    const noReviewsMessage = document.getElementById('no-reviews-message');
    
    if (reviewsContainer) {
        // Clear existing content except the no-reviews message
        const existingReviews = reviewsContainer.querySelectorAll('.review-item');
        existingReviews.forEach(review => review.remove());
        
        // Show or hide no reviews message
        if (reviewsData.reviews.length === 0) {
            if (noReviewsMessage) noReviewsMessage.style.display = 'block';
        } else {
            if (noReviewsMessage) noReviewsMessage.style.display = 'none';
            
            // Add reviews to container
            reviewsData.reviews.forEach(review => {
                const reviewElement = createReviewElement(review);
                reviewsContainer.appendChild(reviewElement);
            });
        }
    }
}

/**
 * Create a review element
 * @param {object} review - The review data
 * @returns {HTMLElement} The review element
 */
function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item';
    
    // Format date
    const reviewDate = new Date(review.date);
    const formattedDate = reviewDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create review HTML
    reviewElement.innerHTML = `
        <div class="review-header">
            <div class="reviewer-name">${review.userName}</div>
            <div class="review-date">${formattedDate}</div>
        </div>
        <div class="review-rating">
            ${getStarRatingHTML(review.rating)}
        </div>
        <div class="review-text">${review.text}</div>
    `;
    
    return reviewElement;
}

/**
 * Get star rating HTML
 * @param {number} rating - The rating value
 * @returns {string} Star rating HTML
 */
function getStarRatingHTML(rating) {
    let starsHTML = '';
    
    // Add filled stars
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(rating)) {
            starsHTML += '<i class="bi bi-star-fill"></i>';
        } else if (i < rating && rating % 1 !== 0) {
            starsHTML += '<i class="bi bi-star-half"></i>';
        } else {
            starsHTML += '<i class="bi bi-star"></i>';
        }
    }
    
    return starsHTML;
}

/**
 * Update star rating visualization
 * @param {HTMLElement} starsContainer - The container for stars
 * @param {number} rating - The rating value
 */
function updateStarRating(starsContainer, rating) {
    if (!starsContainer) return;
    
    // Clear existing stars
    starsContainer.innerHTML = '';
    
    // Add new stars based on rating
    starsContainer.innerHTML = getStarRatingHTML(rating);
}