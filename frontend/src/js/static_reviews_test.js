/**
 * Static Reviews Test Script
 * This script loads and displays sample review data for product pages
 */

// Pagination state for reviews
let currentReviewsPage = 1;
const reviewsPerPage = 2; // Show 2 reviews per page
let currentReviewsData = null; // Track the current reviews dataset

document.addEventListener("DOMContentLoaded", function () {
    // Get the product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "sample-product";

    // Load reviews for the product
    loadProductReviews(productId);

    // Initialize review form
    initReviewForm();
});

/**
 * Load product reviews
 * @param {string} productId - The ID of the product
 */
async function loadProductReviews(productId) {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;
    const urlParams = new URLSearchParams(window.location.search);
    const retailerId = urlParams.get("retailerId") || 1;

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
            const reviews = result.data.reviews ?? [];
            const averageRating = result.data.rating ?? 0;
            const reviewData = {
                productId,
                averageRating,
                totalReviews: reviews.length,
                reviews: reviews.map((r) => ({
                    id: r.r_Id,
                    userName: r.r_Username,
                    rating: r.r_Rating,
                    text: r.r_Text,
                })),
            };

            currentReviewsData = reviewData;
            renderReviewsWithPagination(reviewData);
            setupLoadMoreReviewsButton(reviewData);
        } else {
            console.error("API error:", result.message);
        }
    } catch (err) {
        console.error("Review fetch error:", err);
    }
}

/**
 * Get sample reviews data
 * @param {string} productId - The ID of the product
 * @returns {object} Sample reviews data
 */

/**
 * Render reviews with pagination
 * @param {object} reviewsData - The reviews data to render
 */
function renderReviewsWithPagination(reviewsData = currentReviewsData) {
    // Update overall rating
    const overallRatingValue = document.getElementById("overall-rating-value");
    const overallRatingCount = document.getElementById("overall-rating-count");

    if (overallRatingValue && overallRatingCount) {
        overallRatingValue.textContent = reviewsData.averageRating.toFixed(1);
        overallRatingCount.textContent = `(${reviewsData.totalReviews} reviews)`;

        // Update star rating visualization
        updateStarRating(
            document.querySelector(".overall-rating .rating-stars"),
            reviewsData.averageRating
        );
    }

    // Get reviews container
    const reviewsContainer = document.getElementById("reviews-container");
    const noReviewsMessage = document.getElementById("no-reviews-message");
    if (!reviewsContainer) return;

    // Clear existing reviews
    const existingReviews = reviewsContainer.querySelectorAll(".review-item");
    existingReviews.forEach((review) => review.remove());

    // Show or hide no reviews message
    if (reviewsData.reviews.length === 0) {
        if (noReviewsMessage) noReviewsMessage.style.display = "block";
        const loadMoreButton = document.getElementById("load-more-reviews");
        if (loadMoreButton) loadMoreButton.style.display = "none";
        return;
    } else {
        if (noReviewsMessage) noReviewsMessage.style.display = "none";
    }

    // Calculate reviews to display
    const start = (currentReviewsPage - 1) * reviewsPerPage;
    const end = start + reviewsPerPage;
    const reviewsToRender = reviewsData.reviews.slice(0, end);

    // Add reviews to container
    const reviewsHTML = reviewsToRender
        .map((review) => {
            const reviewElement = createReviewElement(review);
            return reviewElement.outerHTML;
        })
        .join("");
    reviewsContainer.innerHTML += reviewsHTML;

    // Hide "Load More" button if all reviews are displayed
    const loadMoreButton = document.getElementById("load-more-reviews");
    if (loadMoreButton) {
        loadMoreButton.style.display =
            end >= reviewsData.reviews.length ? "none" : "block";
    }
}

/**
 * Setup the "Load More" button for reviews
 * @param {object} reviewsData - The reviews data
 */
function setupLoadMoreReviewsButton(reviewsData) {
    const loadMoreButton = document.getElementById("load-more-reviews");
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            currentReviewsPage++;
            renderReviewsWithPagination(reviewsData);
        });
    }
}

/**
 * Create a review element
 * @param {object} review - The review data
 * @returns {HTMLElement} The review element
 */
function createReviewElement(review) {
    const reviewElement = document.createElement("div");
    reviewElement.className = "review-item";

    // Create review HTML
    reviewElement.innerHTML = `
        <div class="review-header">
            <div class="reviewer-name">${review.userName}</div>
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
    let starsHTML = "";

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
    starsContainer.innerHTML = "";

    // Add new stars based on rating
    starsContainer.innerHTML = getStarRatingHTML(rating);
}

/**
 * Initialize the review form functionality
 */
function initReviewForm() {
    // Get the leave review button and modal elements
    const leaveReviewBtn = document.querySelector(".leave-review-btn");
    const reviewModal = document.getElementById("reviewModal");

    if (!leaveReviewBtn || !reviewModal) return;

    // Initialize Bootstrap modal
    const modal = new bootstrap.Modal(reviewModal);

    // Show modal when leave review button is clicked
    leaveReviewBtn.addEventListener("click", function () {
        // Reset form
        resetReviewForm();
        // Show modal
        modal.show();
    });

    // Handle star rating selection
    const ratingStars = document.querySelectorAll(".rating-star");
    const ratingInput = document.getElementById("ratingValue");

    ratingStars.forEach((star) => {
        star.addEventListener("click", function () {
            const rating = parseInt(this.getAttribute("data-rating"));
            ratingInput.value = rating;
            updateStarSelection(rating);
        });

        // Add hover effect
        star.addEventListener("mouseenter", function () {
            const rating = parseInt(this.getAttribute("data-rating"));
            highlightStars(rating);
        });
    });

    // Reset stars when mouse leaves the container
    const starContainer = document.querySelector(".star-rating-select");
    if (starContainer) {
        starContainer.addEventListener("mouseleave", function () {
            const currentRating = parseInt(ratingInput.value);
            updateStarSelection(currentRating);
        });
    }

    // Handle review submission
    const submitReviewBtn = document.getElementById("submitReviewBtn");
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener("click", function () {
            submitReview();
        });
    }
}

/**
 * Update star selection based on rating
 * @param {number} rating - The selected rating
 */
function updateStarSelection(rating) {
    const stars = document.querySelectorAll(".rating-star");

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove("bi-star");
            star.classList.add("bi-star-fill");
        } else {
            star.classList.remove("bi-star-fill");
            star.classList.add("bi-star");
        }
    });
}

/**
 * Highlight stars on hover
 * @param {number} rating - The rating to highlight
 */
function highlightStars(rating) {
    const stars = document.querySelectorAll(".rating-star");

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove("bi-star");
            star.classList.add("bi-star-fill");
        } else {
            star.classList.remove("bi-star-fill");
            star.classList.add("bi-star");
        }
    });
}

/**
 * Reset the review form
 */
function resetReviewForm() {
    const reviewForm = document.getElementById("reviewForm");
    const ratingInput = document.getElementById("ratingValue");
    const reviewSubmitSuccess = document.getElementById("reviewSubmitSuccess");

    if (reviewForm) reviewForm.reset();
    if (ratingInput) ratingInput.value = 0;
    if (reviewSubmitSuccess) reviewSubmitSuccess.classList.add("d-none");

    // Reset stars
    updateStarSelection(0);

    // Show form elements
    const formElements = document.querySelectorAll("#reviewForm .mb-3");
    formElements.forEach((el) => el.classList.remove("d-none"));

    // Show submit button
    const submitBtn = document.getElementById("submitReviewBtn");
    if (submitBtn) submitBtn.classList.remove("d-none");
}

/**
 * Submit the review
 */
async function submitReview() {
    const rating = parseInt(
        document.getElementById("ratingValue").value || "0"
    );
    const reviewText = document.getElementById("reviewText")?.value.trim();
    const reviewSubmitSuccess = document.getElementById("reviewSubmitSuccess");

    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = JSON.parse(user)?.id;
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!userId || !productId || !reviewText) {
        alert("Please log in and fill in all fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/Add/Review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userid: userId,
                product_id: productId,
                score: rating,
                message: reviewText,
            }),
        });

        const result = await response.json();
        if (result.status === "success") {
            // Show success message
            if (reviewSubmitSuccess) {
                reviewSubmitSuccess.classList.remove("d-none");
            }

            // Hide form elements
            const formElements = document.querySelectorAll("#reviewForm .mb-3");
            formElements.forEach((el) => el.classList.add("d-none"));

            // Hide submit button   //change cancel to done
            const submitBtn = document.getElementById("submitReviewBtn");
            const cancelBtn = document.getElementById("cancelReviewBtn");
            if (submitBtn) {
                submitBtn.classList.add("d-none");
                cancelBtn.innerHTML = "Done";
            }

            // Reload reviews
            loadProductReviews(productId);
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Failed to submit review:", err);
        alert("Failed to submit review. Please try again.");
    }
}
