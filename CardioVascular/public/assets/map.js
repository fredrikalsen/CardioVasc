    // Function to initialize map interactions
    function initMapInteractions() {
    const paths = document.querySelectorAll("svg path"); // Select all path elements within the SVG
    const tooltip = document.createElement("div");
    const details = document.createElement("div");
    const card = document.createElement("div");

    // Tooltip setup
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.display = "none";
    tooltip.style.background = "#fff";
    tooltip.style.padding = "5px";
    tooltip.style.border = "1px solid #ccc";
    document.body.appendChild(tooltip);

    // Card setup
    card.id = "card";
    card.style.position = "fixed"; // Use 'fixed' to keep it centered in the viewport
    card.style.display = "none";
    card.style.background = "var(--lightestgray)";
    card.style.border = "3px solid var(--lightgray)"
    card.style.borderRadius = "10px"
    card.style.height = "150px";
    card.style.width = "300px";
    card.style.boxShadow = "0px 0px 10px 0px rgba(0, 0, 0, 0.1)";
    document.body.appendChild(card);

    paths.forEach(path => {
        // Show country name on hover
        path.addEventListener("mousemove", (e) => {
            const countryName = path.getAttribute("title");
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
            tooltip.style.display = "block";
            tooltip.innerText = countryName;
        });

        // Hide tooltip when not hovering
        path.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
        });

        // Display card on click
        path.addEventListener("click", (e) => {
            const countryName = path.getAttribute("title");
            const countryId = path.getAttribute("id");
            const countryDetails = path.getAttribute("data-details") || "No details available"; // Fetch details or use default

            // Position the card in the center of the screen
            card.style.left = `65%`;
            card.style.top = `50%`;
            card.style.transform = `translate(-50%, -50%)`; // Center card

            card.style.display = "block";

            // Populate card content
            card.innerHTML = `
                <div>
                    <div class="close_card">
                    <i class="fa-solid fa-xmark" id="close-btn" style="cursor: pointer;"></i>
                    </div>
                    <h3>${countryName} (${countryId})</h3>
                    <p>${countryDetails}</p>
                </div>
            `;

            // Close button event listener
            document.getElementById("close-btn").addEventListener("click", () => {
                card.style.display = "none";
            });
        });
    });
}

// Initialize the interactions when the document is ready
document.addEventListener("DOMContentLoaded", initMapInteractions);