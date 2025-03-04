// Map handling and item placement

// Store placed items
let placedItems = [];
let map;
let selectedModel = 'sheep';
let isPlacingMode = false;
let isMobileDevice = false;
let placementMarker = null; // Marker for showing where an item will be placed
let placingMode = false;
let markers = [];

// Check if the device is mobile
function checkMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Is mobile device:", isMobileDevice);
}

// Initialize the map
function initMap(containerId) {
    console.log("Initializing map...");

    // Check if map is already initialized
    if (map) {
        console.log("Map already initialized.");
        return;
    }

    // Create the map instance
    try {
        map = L.map(containerId, {
            center: [51.505, -0.09], // Default center
            zoom: 13,
            tap: true // Enable tap handling for mobile
        });

        console.log("Map instance created successfully.");

        // Add the tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        console.log("Tile layer added successfully.");

        // Get user's current location and center map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 16);
                    console.log(`Map centered at: [${latitude}, ${longitude}]`);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }

        // Create placement marker (initially hidden)
        const markerIcon = L.divIcon({
            className: 'placement-marker-container',
            html: '<div class="placement-marker"></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        placementMarker = L.marker([0, 0], {
            icon: markerIcon,
            zIndexOffset: 1000
        });
        
        // Set up event handlers
        setupEventHandlers();

        console.log("Map initialization complete.");
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

// Set up map event handlers
function setupEventHandlers() {
    if (!map) return;
    
    // Clear previous event listeners if any
    map.off('click');
    map.off('touchend');
    
    // Handle mouse clicks
    map.on('click', handleMapClick);
    
    // Handle mobile touch events
    map.on('touchend', function(e) {
        // Prevent click event from also firing
        L.DomEvent.preventDefault(e);
        
        if (placingMode) {
            console.log('Touch detected in placing mode');
            const touchLocation = e.latlng;
            updatePlacementMarker(touchLocation);
            
            // If we want to immediately place on touch
            placeItemAtLocation(touchLocation);
        }
    });
    
    console.log("Map event handlers initialized");
}

// Handle map click events
function handleMapClick(e) {
    if (placingMode) {
        console.log('Click detected in placing mode', e.latlng);
        updatePlacementMarker(e.latlng);
    }
}

// Update the placement marker position
function updatePlacementMarker(latlng) {
    if (placementMarker && placingMode) {
        placementMarker.setLatLng(latlng);
        
        if (!map.hasLayer(placementMarker)) {
            placementMarker.addTo(map);
        }
        
        console.log(`Placement marker updated to: [${latlng.lat}, ${latlng.lng}]`);
    }
}

// Enable placing mode
function enablePlacingMode() {
    placingMode = true;
    document.body.classList.add('placing-mode');
    
    const placeBtn = document.getElementById('place-btn');
    if (placeBtn) {
        placeBtn.classList.add('active');
        placeBtn.innerText = 'Cancel Placement';
    }
    
    // Show instruction to the user
    alert('Tap on the map to place an object');
    
    console.log("Placing mode enabled");
}

// Disable placing mode
function disablePlacingMode() {
    placingMode = false;
    document.body.classList.remove('placing-mode');
    
    const placeBtn = document.getElementById('place-btn');
    if (placeBtn) {
        placeBtn.classList.remove('active');
        placeBtn.innerText = 'Place Object';
    }
    
    // Remove placement marker from map
    if (placementMarker && map.hasLayer(placementMarker)) {
        map.removeLayer(placementMarker);
    }
    
    console.log("Placing mode disabled");
}

// Toggle placing mode
function togglePlacingMode() {
    if (placingMode) {
        disablePlacingMode();
    } else {
        enablePlacingMode();
    }
}

// Place an item at the specified location
function placeItemAtLocation(latlng) {
    if (!map || !latlng) return;
    
    console.log(`Placing item at: [${latlng.lat}, ${latlng.lng}]`);
    
    // Create a new marker
    const marker = L.marker(latlng).addTo(map);
    markers.push(marker);
    
    // Optional: Add a popup to the marker
    marker.bindPopup(`<b>Object placed here</b><br>Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`);
    
    // Optional: You could send this data to your backend
    // sendObjectPlacementToBackend(latlng.lat, latlng.lng);
    
    // Disable placing mode after successful placement
    disablePlacingMode();
}

// Add a button to toggle placing mode
function addPlacingButton() {
    const placeBtn = document.createElement('button');
    placeBtn.id = 'place-btn';
    placeBtn.innerText = 'Place Object';
    placeBtn.className = 'control-button';
    placeBtn.onclick = togglePlacingMode;
    
    const controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.appendChild(placeBtn);
    
    document.body.appendChild(controlPanel);
}

// Initialize map when the window loads
window.onload = function() {
    console.log("Window loaded, initializing map...");
    initMap('map');
    addPlacingButton();
};

// Model select change event
function modelSelectChange(e) {
    selectedModel = e.target.value;
}

// Back to map button (in AR view)
function backToMap() {
    const mapTabBtn = document.querySelector('[data-tab="map-view"]');
    if (mapTabBtn) mapTabBtn.click();
}

// Make sure pop-ups close properly on mobile
function closePopups(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (id) removeItem(id);
    }
}

// Update the UI list of placed items
function updatePlacedItemsList() {
    const listEl = document.getElementById('items-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    placedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.model} at ${item.position.lat.toFixed(6)}, ${item.position.lng.toFixed(6)}
            <button class="delete-btn" data-id="${item.id}">Delete</button>
        `;
        listEl.appendChild(li);
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