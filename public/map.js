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
let dropHighlight = null;
let dragPreview = null;
let currentModelDragging = null;

// Available models
const availableModels = [
    { id: 'sheep', name: 'Sheep', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE0IiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPGNpcmNsZSBjeD0iMTAiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPGNpcmNsZSBjeD0iMjIiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPGVsbGlwc2UgY3g9IjE2IiBjeT0iMjAiIHJ4PSI2IiByeT0iNCIgZmlsbD0iIzAwMDAwMCIvPgogICAgPHBhdGggZD0iTTggOCBRIDE2IDQsIDI0IDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==' },
    { id: 'cube', name: 'Cube', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzQyODVmNCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxsaW5lIHgxPSI0IiB5MT0iNCIgeDI9IjI4IiB5Mj0iMjgiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8bGluZSB4MT0iMjgiIHkxPSI0IiB4Mj0iNCIgeTI9IjI4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=' }
];

// Check if the device is mobile
function checkMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`Device detected as ${isMobileDevice ? 'mobile' : 'desktop'}`);
}

// Initialize the map
function initMap(containerId = 'map') {
    console.log("Initializing map...");
    
    // Check if we're on a mobile device
    checkMobileDevice();
    
    // Make sure the map container exists
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
        console.error(`Map container #${containerId} not found!`);
        return;
    }
    
    console.log(`Map container found: ${mapContainer.id}`);
    
    // Check if map is already initialized
    if (map) {
        console.log("Map already initialized.");
        return;
    }
    
    try {
        // Create the map centered on a default location
        console.log("Creating map instance...");
        map = L.map(containerId, {
            center: [51.505, -0.09],
            zoom: 13,
            tap: true, // Enable tap for mobile
            dragging: true,
            zoomControl: true
        });
        
        console.log("Map instance created successfully");
        
        // Add tile layer
        console.log("Adding tile layer...");
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        console.log("Tile layer added successfully");
        
        // Get user's location and center the map
        if (navigator.geolocation) {
            console.log("Getting user location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 16);
                    console.log(`Map centered at user location: [${latitude}, ${longitude}]`);
                    
                    // Add a marker for the user's position
                    const userIcon = L.divIcon({
                        className: 'user-marker-container',
                        html: '<div class="user-marker"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    
                    L.marker([latitude, longitude], {
                        icon: userIcon
                    }).addTo(map);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Set a default location if geolocation fails
                    map.setView([51.505, -0.09], 13);
                }
            );
        } else {
            console.log("Geolocation not available");
            // Set a default location
            map.setView([51.505, -0.09], 13);
        }
        
        // Create drop highlight element (shows where item will be placed)
        createDropHighlight();
        
        // Create drag preview element
        createDragPreview();
        
        // Create the model library
        setTimeout(createModelLibrary, 500);
        
        console.log("Map initialization complete.");
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

// Create the model library with draggable items
function createModelLibrary() {
    console.log("Creating model library...");
    
    // Check if library already exists
    if (document.querySelector('.model-library')) {
        console.log("Model library already exists");
        return;
    }
    
    // Create container
    const modelLibrary = document.createElement('div');
    modelLibrary.className = 'model-library';
    
    // Add model items
    availableModels.forEach(model => {
        const modelItem = document.createElement('div');
        modelItem.className = 'model-item';
        modelItem.dataset.modelId = model.id;
        
        // Create icon element
        const icon = document.createElement('img');
        icon.src = model.icon;
        icon.alt = model.name;
        modelItem.appendChild(icon);
        
        // Create name element
        const name = document.createElement('span');
        name.className = 'model-name';
        name.textContent = model.name;
        modelItem.appendChild(name);
        
        // Add drag events for desktop
        modelItem.addEventListener('mousedown', startDragging);
        
        // Add touch events for mobile
        modelItem.addEventListener('touchstart', startDragging, { passive: false });
        
        modelLibrary.appendChild(modelItem);
    });
    
    document.body.appendChild(modelLibrary);
    
    console.log("Model library created");
    
    // Disable map drag when interacting with the model library
    if (map && modelLibrary) {
        modelLibrary.addEventListener('touchstart', (e) => {
            if (map.dragging) map.dragging.disable();
        }, { passive: true });
        
        modelLibrary.addEventListener('touchend', (e) => {
            setTimeout(() => {
                if (map.dragging) map.dragging.enable();
            }, 100);
        }, { passive: true });
    }
}

// Create the drop highlight element
function createDropHighlight() {
    console.log("Creating drop highlight element");
    
    if (document.querySelector('.drop-highlight')) {
        dropHighlight = document.querySelector('.drop-highlight');
        return;
    }
    
    dropHighlight = document.createElement('div');
    dropHighlight.className = 'drop-highlight';
    document.body.appendChild(dropHighlight);
}

// Create the drag preview element
function createDragPreview() {
    console.log("Creating drag preview element");
    
    if (document.querySelector('.drag-preview')) {
        dragPreview = document.querySelector('.drag-preview');
        return;
    }
    
    dragPreview = document.createElement('div');
    dragPreview.className = 'drag-preview';
    document.body.appendChild(dragPreview);
}

// Start dragging a model
function startDragging(e) {
    // Prevent default to avoid text selection, page scrolling, etc.
    e.preventDefault();
    
    const modelItem = e.currentTarget;
    currentModelDragging = modelItem.dataset.modelId;
    
    console.log(`Started dragging ${currentModelDragging}`);
    
    // Add dragging class
    modelItem.classList.add('dragging');
    
    // Set initial position of drag preview
    const pageX = e.clientX || (e.touches && e.touches[0].clientX);
    const pageY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!pageX || !pageY) {
        console.error("Could not determine touch position");
        return;
    }
    
    console.log(`Initial drag position: ${pageX}, ${pageY}`);
    
    // Clone the model item for the drag preview
    dragPreview.innerHTML = '';
    const icon = document.createElement('img');
    const modelData = availableModels.find(m => m.id === currentModelDragging);
    if (!modelData) {
        console.error(`Model data not found for ${currentModelDragging}`);
        return;
    }
    
    icon.src = modelData.icon;
    icon.alt = currentModelDragging;
    dragPreview.appendChild(icon);
    
    updateDragPreviewPosition(pageX, pageY);
    dragPreview.style.display = 'block';
    
    // Add the move and end events
    if (e.type === 'mousedown') {
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', stopDragging);
    } else if (e.type === 'touchstart') {
        document.addEventListener('touchmove', onDragging, { passive: false });
        document.addEventListener('touchend', stopDragging);
        document.addEventListener('touchcancel', stopDragging);
    }
    
    // Disable map dragging while dragging an item
    if (map && map.dragging) {
        map.dragging.disable();
    }
}

// Update drag preview position
function updateDragPreviewPosition(pageX, pageY) {
    if (!dragPreview) return;
    
    dragPreview.style.left = `${pageX}px`;
    dragPreview.style.top = `${pageY}px`;
}

// Handle dragging movement
function onDragging(e) {
    e.preventDefault(); // Prevent scrolling on mobile
    
    const pageX = e.clientX || (e.touches && e.touches[0].clientX);
    const pageY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!pageX || !pageY) {
        console.error("Could not determine drag position");
        return;
    }
    
    updateDragPreviewPosition(pageX, pageY);
    
    // Check if we're over the map
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Map element not found!");
        return;
    }
    
    const mapRect = mapElement.getBoundingClientRect();
    
    const isOverMap = pageX >= mapRect.left && 
                    pageX <= mapRect.right && 
                    pageY >= mapRect.top && 
                    pageY <= mapRect.bottom;
    
    if (isOverMap && map) {
        // Convert screen coordinates to map point
        const point = L.point(
            pageX - mapRect.left, 
            pageY - mapRect.top
        );
        
        // Convert point to LatLng
        const latlng = map.containerPointToLatLng(point);
        
        // Show drop highlight on the map
        dropHighlight.style.display = 'block';
        dropHighlight.style.left = `${pageX}px`;
        dropHighlight.style.top = `${pageY}px`;
    } else {
        // Hide drop highlight if not over map
        dropHighlight.style.display = 'none';
    }
}

// Stop dragging and place object if over map
function stopDragging(e) {
    if (!currentModelDragging) return;
    
    console.log(`Stopped dragging ${currentModelDragging}`);
    
    // Remove event listeners
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', onDragging);
    document.removeEventListener('touchend', stopDragging);
    document.removeEventListener('touchcancel', stopDragging);
    
    // Remove dragging class from all model items
    document.querySelectorAll('.model-item').forEach(item => {
        item.classList.remove('dragging');
    });
    
    // Hide drag preview
    if (dragPreview) {
        dragPreview.style.display = 'none';
    }
    
    // Get the position where we stopped dragging
    const pageX = e.clientX || 
                (e.changedTouches && e.changedTouches[0].clientX);
    const pageY = e.clientY || 
                (e.changedTouches && e.changedTouches[0].clientY);
    
    if (!pageX || !pageY) {
        console.error("Could not determine drop position");
        currentModelDragging = null;
        if (dropHighlight) dropHighlight.style.display = 'none';
        if (map && map.dragging) map.dragging.enable();
        return;
    }
    
    console.log(`Drop position: ${pageX}, ${pageY}`);
    
    const mapElement = document.getElementById('map');
    if (!mapElement || !map) {
        console.error("Map element or map instance not found");
        currentModelDragging = null;
        if (dropHighlight) dropHighlight.style.display = 'none';
        if (map && map.dragging) map.dragging.enable();
        return;
    }
    
    const mapRect = mapElement.getBoundingClientRect();
    console.log(`Map rect: left=${mapRect.left}, right=${mapRect.right}, top=${mapRect.top}, bottom=${mapRect.bottom}`);
    
    const isOverMap = pageX >= mapRect.left && 
                    pageX <= mapRect.right && 
                    pageY >= mapRect.top && 
                    pageY <= mapRect.bottom;
    
    console.log(`Is over map: ${isOverMap}`);
    
    if (isOverMap) {
        try {
            // Convert screen coordinates to map point
            const point = L.point(
                pageX - mapRect.left, 
                pageY - mapRect.top
            );
            
            // Convert point to LatLng
            const latlng = map.containerPointToLatLng(point);
            console.log(`Drop LatLng: ${latlng.lat}, ${latlng.lng}`);
            
            // Place the item at this location
            placeItemAtLocation(latlng, currentModelDragging);
        } catch (error) {
            console.error("Error placing item:", error);
        }
    }
    
    // Re-enable map dragging
    if (map && map.dragging) {
        map.dragging.enable();
    }
    
    // Hide drop highlight
    if (dropHighlight) {
        dropHighlight.style.display = 'none';
    }
    
    // Reset current model dragging
    currentModelDragging = null;
}

// Place an item at a location
function placeItemAtLocation(latlng, modelType) {
    if (!map || !latlng || !modelType) {
        console.error("Missing data for placing item:", { map: !!map, latlng, modelType });
        return;
    }
    
    console.log(`Placing ${modelType} at [${latlng.lat}, ${latlng.lng}]`);
    
    // Create a new item object
    const newItem = {
        id: Date.now().toString(),
        model: modelType,
        position: { lat: latlng.lat, lng: latlng.lng }
    };
    
    // Add marker to the map
    const marker = addMarkerToMap(newItem);
    
    if (!marker) {
        console.error("Failed to add marker to map");
        return;
    }
    
    // Add to list of markers
    markers.push(newItem);
    
    // Update the UI list
    updatePlacedItemsList();
    
    // Save to local storage
    savePlacedItems();
    
    console.log(`Item placed successfully: ${newItem.id}`);
}

// Create SVG icon for sheep marker
function createMapMarkerSheep() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE0IiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPGNpcmNsZSBjeD0iMTAiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPGNpcmNsZSBjeD0iMjIiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPGVsbGlwc2UgY3g9IjE2IiBjeT0iMjAiIHJ4PSI2IiByeT0iNCIgZmlsbD0iIzAwMDAwMCIvPgogICAgPHBhdGggZD0iTTggOCBRIDE2IDQsIDI0IDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==';
}

// Add a marker to the map for a placed item
function addMarkerToMap(item) {
    let iconUrl;
    
    if (item.model === 'sheep') {
        iconUrl = createMapMarkerSheep();
    } else {
        // Default cube icon
        iconUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzQyODVmNCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxsaW5lIHgxPSI0IiB5MT0iNCIgeDI9IjI4IiB5Mj0iMjgiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8bGluZSB4MT0iMjgiIHkxPSI0IiB4Mj0iNCIgeTI9IjI4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=';
    }
    
    try {
        if (!map) {
            console.error("Map not initialized when adding marker");
            return null;
        }
        
        const marker = L.marker([item.position.lat, item.position.lng], {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        }).addTo(map);
        
        marker.bindPopup(`${item.model} (ID: ${item.id})<br>
                        <button class="delete-btn" data-id="${item.id}">Remove</button>`);
        
        // Store marker reference
        item.marker = marker;
        
        return marker;
    } catch (error) {
        console.error("Error adding marker to map:", error);
        return null;
    }
}

// Update the list of placed items in the UI
function updatePlacedItemsList() {
    const listElement = document.getElementById('placed-items-list');
    if (!listElement) {
        console.error("Placed items list element not found");
        return;
    }
    
    const itemsList = document.getElementById('items-list');
    if (!itemsList) {
        console.error("Items list element not found");
        return;
    }
    
    // Clear the list
    itemsList.innerHTML = '';
    
    // Add each item to the list
    markers.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item.model} (ID: ${item.id})
            <button class="delete-btn" data-id="${item.id}">×</button>
        `;
        itemsList.appendChild(listItem);
    });
    
    // Show/hide items list based on whether we have any items
    listElement.style.display = markers.length > 0 ? 'block' : 'none';
}

// Remove an item by ID
function removeItem(id) {
    const index = markers.findIndex(item => item.id === id);
    if (index !== -1) {
        const item = markers[index];
        
        // Remove marker from map
        if (item.marker && map) {
            map.removeLayer(item.marker);
        }
        
        // Remove from array
        markers.splice(index, 1);
        
        // Update UI
        updatePlacedItemsList();
        
        // Save changes
        savePlacedItems();
        
        console.log(`Removed item ${id}`);
    }
}

// Save placed items to local storage
function savePlacedItems() {
    const itemsToSave = markers.map(item => ({
        id: item.id,
        model: item.model,
        position: item.position
    }));
    
    localStorage.setItem('placedItems', JSON.stringify(itemsToSave));
    console.log(`Saved ${itemsToSave.length} items to local storage`);
}

// Load placed items from local storage
function loadPlacedItems() {
    const saved = localStorage.getItem('placedItems');
    if (saved) {
        try {
            const items = JSON.parse(saved);
            console.log(`Loaded ${items.length} items from local storage`);
            
            items.forEach(item => {
                // Add marker to map
                addMarkerToMap(item);
                
                // Add to markers array
                markers.push(item);
            });
            
            // Update UI
            updatePlacedItemsList();
        } catch (e) {
            console.error('Error loading saved items:', e);
        }
    }
}

// Initialize when window loads
window.onload = function() {
    console.log("Window loaded");
    
    // Set a timeout to ensure DOM is ready
    setTimeout(() => {
        console.log("Initializing map...");
        initMap();
        
        // Load saved items after a delay to ensure map is fully loaded
        setTimeout(loadPlacedItems, 1000);
    }, 500);
    
    // Add click handler for item deletion
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (id) removeItem(id);
        }
    });
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