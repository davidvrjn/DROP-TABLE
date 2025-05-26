/**
 * Generates HTML for a continuously scrolling retailer animation.
 * @param {Array<string>} retailers - Array of retailer names to display.
 * @returns {string} HTML string for the retailer animation.
 */
export function createRetailerAnimationHTML(retailers) {
  if (!retailers || retailers.length === 0) {
    return `<div class="retailer-animation-container">
              <div class="retailer-animation-wrapper">
                <div class="retailer-animation-placeholder">Loading retailers...</div>
              </div>
            </div>`;
  }

  // Duplicate the retailers array to create a seamless loop
  const duplicatedRetailers = [...retailers, ...retailers];
  
  // Generate the retailer items
  const retailerItemsHTML = duplicatedRetailers.map(retailer => 
    `<div class="retailer-item">${retailer}</div><div class="retailer-separator">|</div>`
  ).join('');

  return `
    <div class="retailer-animation-container">
      <h2 class="h4 fw-bold mb-4">Supported Retailers</h2>
      <div class="retailer-animation-wrapper">
        <div class="retailer-animation">
          ${retailerItemsHTML}
        </div>
      </div>
    </div>
  `;
}