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
    { id: 'sheep', name: 'Sheep', icon: 'sheep.svg' },
    { id: 'cube', name: 'Cube', icon: 'cube.svg' }
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
    
    // Check if map is already initialized
    if (map) {
        console.log("Map already initialized.");
        return;
    }
    
    try {
        // Create the map centered on a default location
        map = L.map(containerId, {
            center: [51.505, -0.09],
            zoom: 13,
            tap: true, // Enable tap for mobile
            dragging: true,
            zoomControl: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Get user's location and center the map
        if (navigator.geolocation) {
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
                }
            );
        }
        
        // Create drop highlight element (shows where item will be placed)
        createDropHighlight();
        
        // Create drag preview element
        createDragPreview();
        
        // Disable map drag when interacting with the model library
        const modelLibrary = document.querySelector('.model-library');
        if (modelLibrary) {
            modelLibrary.addEventListener('touchstart', (e) => {
                map.dragging.disable();
            }, { passive: true });
            
            modelLibrary.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    map.dragging.enable();
                }, 100);
            }, { passive: true });
        }
        
        console.log("Map initialization complete.");
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

// Create the model library with draggable items
function createModelLibrary() {
    console.log("Creating model library...");
    
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
}

// Create the drop highlight element
function createDropHighlight() {
    dropHighlight = document.createElement('div');
    dropHighlight.className = 'drop-highlight';
    document.body.appendChild(dropHighlight);
}

// Create the drag preview element
function createDragPreview() {
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
    
    // Clone the model item for the drag preview
    dragPreview.innerHTML = '';
    const icon = document.createElement('img');
    icon.src = availableModels.find(m => m.id === currentModelDragging).icon;
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
    if (map) {
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
    
    updateDragPreviewPosition(pageX, pageY);
    
    // Check if we're over the map
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
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
    dragPreview.style.display = 'none';
    
    // Check if we're over the map
    const pageX = e.clientX || 
                 (e.changedTouches && e.changedTouches[0].clientX);
    const pageY = e.clientY || 
                 (e.changedTouches && e.changedTouches[0].clientY);
    
    const mapElement = document.getElementById('map');
    if (!mapElement || !map) {
        currentModelDragging = null;
        dropHighlight.style.display = 'none';
        map.dragging.enable();
        return;
    }
    
    const mapRect = mapElement.getBoundingClientRect();
    
    const isOverMap = pageX >= mapRect.left && 
                     pageX <= mapRect.right && 
                     pageY >= mapRect.top && 
                     pageY <= mapRect.bottom;
    
    if (isOverMap) {
        // Convert screen coordinates to map point
        const point = L.point(
            pageX - mapRect.left, 
            pageY - mapRect.top
        );
        
        // Convert point to LatLng
        const latlng = map.containerPointToLatLng(point);
        
        // Place the item at this location
        placeItemAtLocation(latlng, currentModelDragging);
    }
    
    // Re-enable map dragging
    map.dragging.enable();
    
    // Hide drop highlight
    dropHighlight.style.display = 'none';
    
    // Reset current model dragging
    currentModelDragging = null;
}

// Place an item at a location
function placeItemAtLocation(latlng, modelType) {
    if (!map || !latlng || !modelType) return;
    
    console.log(`Placing ${modelType} at [${latlng.lat}, ${latlng.lng}]`);
    
    // Create a new item object
    const newItem = {
        id: Date.now().toString(),
        model: modelType,
        position: { lat: latlng.lat, lng: latlng.lng }
    };
    
    // Add marker to the map
    addMarkerToMap(newItem);
    
    // Add to list of markers
    markers.push(newItem);
    
    // Update the UI list
    updatePlacedItemsList();
    
    // Save to local storage
    savePlacedItems();
}

// Create SVG icon for sheep marker
function createMapMarkerSheep() {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#000000" stroke-width="1"/>
            <circle cx="10" cy="12" r="2" fill="#000000"/>
            <circle cx="22" cy="12" r="2" fill="#000000"/>
            <ellipse cx="16" cy="20" rx="6" ry="4" fill="#000000"/>
            <path d="M8 8 Q 16 4, 24 8" fill="none" stroke="#000000" stroke-width="2"/>
        </svg>
    `);
}

// Add a marker to the map for a placed item
function addMarkerToMap(item) {
    let iconUrl;
    
    if (item.model === 'sheep') {
        iconUrl = createMapMarkerSheep();
    } else {
        // Default cube icon
        iconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="24" height="24" fill="#4285f4" stroke="#ffffff" stroke-width="2"/>
                <line x1="4" y1="4" x2="28" y2="28" stroke="#ffffff" stroke-width="1"/>
                <line x1="28" y1="4" x2="4" y2="28" stroke="#ffffff" stroke-width="1"/>
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
    
    marker.bindPopup(`${item.model} (ID: ${item.id})<br>
                     <button class="delete-btn" data-id="${item.id}">Remove</button>`);
    
    // Store marker reference
    item.marker = marker;
    
    return marker;
}

// Update the list of placed items in the UI
function updatePlacedItemsList() {
    const listElement = document.getElementById('placed-items-list');
    if (!listElement) return;
    
    const itemsList = document.getElementById('items-list');
    if (!itemsList) return;
    
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
    initMap();
    createModelLibrary();
    
    // Load saved items
    setTimeout(loadPlacedItems, 1000); // Delay to ensure map is fully loaded
    
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