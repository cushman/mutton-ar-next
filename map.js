// Map handling and item placement

// Store placed items
let placedItems = [];
let map;
let selectedModel = 'sheep';
let isPlacingMode = false;

// Initialize the map
function initMap() {
    // Create the map centered on the user's location
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            
            map = L.map('map').setView([latitude, longitude], 18);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Add user marker
            L.marker([latitude, longitude], {
                icon: L.divIcon({
                    html: '<div class="user-marker"></div>',
                    className: 'user-marker-container'
                })
            }).addTo(map);
            
            // Add click listener for placing items
            map.on('click', handleMapClick);
            
            // Load any previously saved items
            loadPlacedItems();
        },
        error => {
            console.error('Error getting location:', error);
            // Default to a generic location if geolocation fails
            map = L.map('map').setView([0, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            map.on('click', handleMapClick);
            loadPlacedItems();
        }
    );
}

// Handle map clicks for placing items
function handleMapClick(e) {
    if (!isPlacingMode) return;
    
    const { lat, lng } = e.latlng;
    
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
    
    isPlacingMode = false;
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