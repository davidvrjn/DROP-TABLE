import { createRetailerAnimationHTML } from "../partials/_retailer-animation.js";

document.addEventListener("DOMContentLoaded", async function () {
    const retailersContainer = document.getElementById("retailers-container");
    if (!retailersContainer) return;

    const retailers = await fetchRetailers();
    if (retailers.length > 0) {
        retailersContainer.innerHTML = createRetailerAnimationHTML(retailers);
    }
});

async function fetchRetailers() {
    try {
        const response = await fetch("http://localhost:3000/Get/Retailers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: "" }),
        });

        const result = await response.json();
        return result.data.map((ret) => ret.retailer_name);
    } catch (err) {
        console.error("Failed to load retailers:", err);
        return [];
    }
}
