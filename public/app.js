// Main application logic

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    initMap();
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show the selected tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // If switching to AR view, initialize it
            if (tabId === 'ar-view') {
                enterARView();
            }
        });
    });
    
    // Model selection
    document.getElementById('model-select').addEventListener('change', (e) => {
        selectedModel = e.target.value;
    });
    
    // Place button
    document.getElementById('place-btn').addEventListener('click', () => {
        isPlacingMode = true;
        document.getElementById('instructions').textContent = 'Click on the map to place the item';
    });
    
    // Back to map button
    document.getElementById('back-to-map').addEventListener('click', () => {
        document.querySelector('[data-tab="map-view"]').click();
    });
}); 