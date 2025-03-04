// Main application logic

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', setupApp);

// Expose the setup function globally
window.setupApp = setupApp;

// Main setup function
function setupApp() {
    // Initialize map if not already initialized
    if (!window.mapInitialized && typeof initMap === 'function') {
        initMap();
        window.mapInitialized = true;
    }
    
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
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            selectedModel = e.target.value;
        });
    }
    
    // Place button
    const placeBtn = document.getElementById('place-btn');
    if (placeBtn) {
        placeBtn.addEventListener('click', () => {
            isPlacingMode = true;
            document.getElementById('instructions').textContent = 'Click on the map to place the item';
        });
    }
    
    // Back to map button
    const backToMapBtn = document.getElementById('back-to-map');
    if (backToMapBtn) {
        backToMapBtn.addEventListener('click', () => {
            document.querySelector('[data-tab="map-view"]').click();
        });
    }
} 