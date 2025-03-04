// AR view handling

// Function to initialize AR scene with placed items
function initARScene() {
    const arContentEntity = document.getElementById('ar-content');
    arContentEntity.innerHTML = ''; // Clear any existing content
    
    // Add all placed items to the AR scene
    placedItems.forEach(item => {
        addItemToARScene(item, arContentEntity);
    });
}

// Add an item to the AR scene
function addItemToARScene(item, parentEntity) {
    let entity;
    
    if (item.model === 'sheep') {
        entity = createSheepModel();
    } else {
        // Default cube
        entity = document.createElement('a-box');
        entity.setAttribute('color', 'blue');
        entity.setAttribute('width', '1');
        entity.setAttribute('height', '1');
        entity.setAttribute('depth', '1');
    }
    
    // Set the geographic position
    entity.setAttribute('gps-entity-place', `latitude: ${item.position.lat}; longitude: ${item.position.lng}`);
    
    // Add distance display
    entity.setAttribute('look-at', '[gps-camera]');
    
    // Set a reasonable scale that depends on distance
    entity.setAttribute('scale', '10 10 10');
    
    // Add to scene
    parentEntity.appendChild(entity);
}

// Handle switching to AR view
function enterARView() {
    // Initialize the AR scene with placed items
    initARScene();
    
    // Request device orientation permission if needed (iOS)
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    console.log('Device orientation permission granted');
                } else {
                    console.error('Permission for device orientation was denied');
                }
            })
            .catch(console.error);
    }
} 