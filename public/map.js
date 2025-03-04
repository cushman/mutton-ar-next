// Map handling and item placement

// Store placed items
let placedItems = [];
let map;
let selectedModel = 'sheep';
let isPlacingMode = false;
let isMobileDevice = false;

// Check if the device is mobile
function checkMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Is mobile device:", isMobileDevice);
}

// Initialize the map
function initMap() {
    console.log("Initializing map...");
    
    // Check if we're on a mobile device
    checkMobileDevice();
    
    try {
        // Create the map centered on the user's location or a default location
        const defaultLocation = [40.7128, -74.0060]; // New York City as default
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log("Got user location:", latitude, longitude);
                createMap([latitude, longitude]);
            },
            error => {
                console.error('Error getting location:', error);
                // Default to a generic location if geolocation fails
                createMap(defaultLocation);
            },
            { timeout: 5000 } // 5 second timeout
        );
        
        // If geolocation takes too long, initialize with default
        setTimeout(() => {
            if (!map) {
                console.log("Geolocation timeout - using default location");
                createMap(defaultLocation);
            }
        }, 3000);
    } catch (e) {
        console.error("Error in initMap:", e);
        // Fallback to default location
        createMap([40.7128, -74.0060]);
    }
}

function createMap(center) {
    if (map) return; // Prevent duplicate initialization
    
    try {
        console.log("Creating map at:", center);
        
        // Create the map
        map = L.map('map').setView(center, 13);
        
        // Use a reliable tile provider
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add user marker
        L.marker(center, {
            icon: L.divIcon({
                html: '<div class="user-marker"></div>',
                className: 'user-marker-container'
            })
        }).addTo(map);
        
        // Add click listener for placing items
        // Remove standard click if we already have one
        map.off('click', handleMapClick);
        
        // For mobile, use both click and tap events
        map.on('click', handleMapClick);
        
        // When on mobile, also watch for touchend events
        if (isMobileDevice) {
            console.log("Setting up mobile-specific handlers");
            setupMobileHandlers();
        }
        
        // Load any previously saved items
        loadPlacedItems();
        
        // Set up the Place button event handler
        setupPlaceButton();
        
        console.log("Map initialization complete");
    } catch (e) {
        console.error("Error creating map:", e);
    }
}

// Set up mobile-specific handlers
function setupMobileHandlers() {
    // Use alternate tap detection for mobile
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.addEventListener('touchend', function(e) {
            if (!isPlacingMode) return;
            
            // Prevent default to avoid double events
            e.preventDefault();
            
            console.log("Mobile touchend detected");
            
            // Get the touch coordinates
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const containerRect = mapContainer.getBoundingClientRect();
                const touchX = touch.clientX - containerRect.left;
                const touchY = touch.clientY - containerRect.top;
                
                // Convert to map coordinates
                const point = L.point(touchX, touchY);
                const latlng = map.containerPointToLatLng(point);
                
                console.log("Touch coords:", touchX, touchY);
                console.log("Map coords:", latlng);
                
                // Create an event-like object for the handler
                const touchEvent = {
                    latlng: latlng,
                    originalEvent: e
                };
                
                // Call the map click handler
                handleMapClick(touchEvent);
            }
        }, false);
    }
}

// Setup place button event handler
function setupPlaceButton() {
    const placeBtn = document.getElementById('place-btn');
    if (placeBtn) {
        // Remove existing event listeners first
        const newPlaceBtn = placeBtn.cloneNode(true);
        placeBtn.parentNode.replaceChild(newPlaceBtn, placeBtn);
        
        // Add the event listener
        newPlaceBtn.addEventListener('click', function() {
            console.log("Place button clicked, enabling placing mode");
            isPlacingMode = true;
            document.getElementById('instructions').textContent = 'Tap on the map to place the item';
            
            // Add a visual indicator that placement mode is active
            newPlaceBtn.classList.add('active');
            document.body.classList.add('placing-mode');
            
            // Auto-disable after 30 seconds for safety
            setTimeout(() => {
                if (isPlacingMode) {
                    isPlacingMode = false;
                    newPlaceBtn.classList.remove('active');
                    document.body.classList.remove('placing-mode');
                    document.getElementById('instructions').textContent = 'Click "Place on Map" to place an object';
                }
            }, 30000);
        });
    }
}

// Handle map clicks for placing items
function handleMapClick(e) {
    console.log("Map click/tap detected");
    
    if (!isPlacingMode) {
        console.log("Not in placing mode, ignoring");
        return;
    }
    
    const { lat, lng } = e.latlng;
    console.log("Placing item at:", lat, lng);
    
    // Create a new item
    const newItem = {
        id: Date.now().toString(),
        model: selectedModel,
        position: { lat, lng }
    };
    
    // Add to the array of placed items
    placedItems.push(newItem);
    
    // Add marker to the map
    addMarkerToMap(newItem);
    
    // Update UI and save
    updatePlacedItemsList();
    savePlacedItems();
    
    // Exit placing mode
    isPlacingMode = false;
    
    // Remove active indicators
    const placeBtn = document.getElementById('place-btn');
    if (placeBtn) placeBtn.classList.remove('active');
    document.body.classList.remove('placing-mode');
    
    document.getElementById('instructions').textContent = 'Item placed! Click "Place on Map" to place another.';
}

// Add a marker to the map for a placed item
function addMarkerToMap(item) {
    let iconUrl;
    
    if (item.model === 'sheep') {
        iconUrl = createMapMarkerSheep();
    } else {
        // Default cube icon
        iconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" fill="blue" />
            </svg>
        `);
    }
    
    const marker = L.marker([item.position.lat, item.position.lng], {
        icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
    }).addTo(map);
    
    marker.bindPopup(`${item.model} (ID: ${item.id})`);
    
    // Store the marker reference in the item for easy removal
    item.marker = marker;
}

// Update the UI list of placed items
function updatePlacedItemsList() {
    const listEl = document.getElementById('items-list');
    listEl.innerHTML = '';
    
    placedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.model} at ${item.position.lat.toFixed(6)}, ${item.position.lng.toFixed(6)}
            <button class="delete-btn" data-id="${item.id}">Delete</button>
        `;
        listEl.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeItem(id);
        });
    });
}

// Remove an item
function removeItem(id) {
    const itemIndex = placedItems.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        // Remove marker from map
        if (placedItems[itemIndex].marker) {
            map.removeLayer(placedItems[itemIndex].marker);
        }
        
        // Remove from array
        placedItems.splice(itemIndex, 1);
        
        // Update UI and save
        updatePlacedItemsList();
        savePlacedItems();
    }
}

// Save placed items to localStorage
function savePlacedItems() {
    // Convert the items to a format suitable for storage
    // (remove the marker objects which can't be serialized)
    const itemsToSave = placedItems.map(item => ({
        id: item.id,
        model: item.model,
        position: item.position
    }));
    
    localStorage.setItem('arPlacedItems', JSON.stringify(itemsToSave));
}

// Load placed items from localStorage
function loadPlacedItems() {
    const saved = localStorage.getItem('arPlacedItems');
    if (saved) {
        placedItems = JSON.parse(saved);
        placedItems.forEach(item => addMarkerToMap(item));
        updatePlacedItemsList();
    }
} 