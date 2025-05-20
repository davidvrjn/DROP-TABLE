import { createRetailerAnimationHTML } from '../partials/_retailer-animation.js';

document.addEventListener('DOMContentLoaded', function() {
  // This is sample data - should come from api
  const retailers = [
    'Takealot', 'Makro', 'Game', 'Checkers', 'Pick n Pay', 'Woolworths',
    'Incredible Connection', 'Clicks', 'Dis-Chem', 'Shoprite', 'Hirsch\'s'
  ];
  
  const retailersContainer = document.getElementById('retailers-container');
  if (retailersContainer) {
    retailersContainer.innerHTML = createRetailerAnimationHTML(retailers);
  }
});