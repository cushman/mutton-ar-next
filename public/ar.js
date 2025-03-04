// AR implementation using Three.js and WebXR
let camera, scene, renderer;
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let placedObjects = [];

// Initialize AR
function initAR() {
    console.log('Initializing AR...');
    
    // Create the container if it doesn't exist
    const container = document.getElementById('ar-scene');
    if (!container) {
        console.error('AR container not found');
        return;
    }
    
    // Clear any existing content from the AR scene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Initialize scene
    scene = new THREE.Scene();
    
    // Add lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
    
    // Set up camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    
    // Set up renderer with WebXR support
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Create reticle for placement
    reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    
    // Set up session start button
    const arButton = document.createElement('button');
    arButton.id = 'ar-start-button';
    arButton.textContent = 'Start AR';
    arButton.style.position = 'absolute';
    arButton.style.bottom = '100px';
    arButton.style.left = '50%';
    arButton.style.transform = 'translateX(-50%)';
    arButton.style.padding = '12px 20px';
    arButton.style.border = 'none';
    arButton.style.borderRadius = '5px';
    arButton.style.backgroundColor = '#4285f4';
    arButton.style.color = 'white';
    arButton.style.fontWeight = 'bold';
    arButton.style.zIndex = '1000';
    
    // Create AR button using WebXR session
    document.body.appendChild(arButton);
    arButton.addEventListener('click', () => {
        // Handle AR button click
        if (navigator.xr) {
            console.log('WebXR is supported');
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                if (supported) {
                    console.log('AR is supported');
                    startARSession();
                } else {
                    showARNotSupportedMessage();
                }
            });
        } else {
            showARNotSupportedMessage();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('AR initialized');
}

// Start the AR session
function startARSession() {
    console.log('Starting AR session...');
    
    // Hide the start button while in the session
    const arButton = document.getElementById('ar-start-button');
    if (arButton) arButton.style.display = 'none';
    
    // Hide the AR message
    const arMessage = document.querySelector('.ar-message');
    if (arMessage) arMessage.style.display = 'none';
    
    navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test']
    }).then(onSessionStarted);
}

// When AR session starts
function onSessionStarted(session) {
    console.log('Session started');
    
    session.addEventListener('end', onSessionEnded);
    session.addEventListener('select', onSelect);
    
    renderer.xr.setReferenceSpaceType('local');
    renderer.xr.setSession(session);
    
    // Set up hit testing
    hitTestSourceRequested = false;
    session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
            hitTestSource = source;
        });
    });
    
    session.requestReferenceSpace('local').then((referenceSpace) => {
        renderer.xr.setReferenceSpace(referenceSpace);
    });
    
    // Start animation loop
    renderer.setAnimationLoop(render);
}

// When AR session ends
function onSessionEnded() {
    console.log('Session ended');
    hitTestSource = null;
    hitTestSourceRequested = false;
    
    // Show the start button again
    const arButton = document.getElementById('ar-start-button');
    if (arButton) arButton.style.display = 'block';
    
    // Show the AR message again
    const arMessage = document.querySelector('.ar-message');
    if (arMessage) arMessage.style.display = 'block';
    
    // Stop animation loop
    renderer.setAnimationLoop(null);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle selection (placing objects)
function onSelect() {
    if (reticle.visible) {
        // Get the saved objects from map view
        const savedItems = getSavedObjectsFromMap();
        
        if (savedItems && savedItems.length > 0) {
            // Place the saved objects in AR
            savedItems.forEach(item => {
                addObjectToScene(item.model, reticle.matrix);
            });
        } else {
            // Default to placing a cube if no saved objects
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshBasicMaterial({ color: 0x4285f4 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.setFromMatrixPosition(reticle.matrix);
            scene.add(mesh);
            placedObjects.push(mesh);
        }
    }
}

// Get saved objects from map view
function getSavedObjectsFromMap() {
    try {
        const savedItemsJson = localStorage.getItem('placedItems');
        if (savedItemsJson) {
            return JSON.parse(savedItemsJson);
        }
    } catch (e) {
        console.error('Error loading saved items:', e);
    }
    return [];
}

// Add object to scene based on model type
function addObjectToScene(modelType, matrix) {
    let geometry, material, mesh;
    
    if (modelType === 'sheep') {
        // Create a simple sheep with spheres
        const group = new THREE.Group();
        
        // Body
        geometry = new THREE.SphereGeometry(0.15, 32, 16);
        material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        
        // Head
        geometry = new THREE.SphereGeometry(0.08, 32, 16);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0.18, 0.06, 0);
        group.add(mesh);
        
        // Legs
        material = new THREE.MeshPhongMaterial({ color: 0x333333 });
        geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        
        // Front legs
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0.1, -0.15, 0.06);
        group.add(mesh);
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0.1, -0.15, -0.06);
        group.add(mesh);
        
        // Back legs
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-0.1, -0.15, 0.06);
        group.add(mesh);
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-0.1, -0.15, -0.06);
        group.add(mesh);
        
        group.position.setFromMatrixPosition(matrix);
        scene.add(group);
        placedObjects.push(group);
    } else {
        // Default cube
        geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        material = new THREE.MeshBasicMaterial({ color: 0x4285f4 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.setFromMatrixPosition(matrix);
        scene.add(mesh);
        placedObjects.push(mesh);
    }
}

// Render function
function render(timestamp, frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();
        
        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    hitTestSource = source;
                });
            });
            session.addEventListener('end', () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });
            hitTestSourceRequested = true;
        }
        
        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            
            if (hitTestResults.length) {
                const hit = hitTestResults[0];
                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
    }
    
    renderer.render(scene, camera);
}

// Show message when AR is not supported
function showARNotSupportedMessage() {
    const arMessage = document.querySelector('.ar-message');
    if (arMessage) {
        arMessage.innerHTML = `
            <h2>AR Not Supported</h2>
            <p>
                Your device or browser doesn't support WebXR AR experiences. 
                Please try using a compatible device with Chrome, Safari or Firefox.
            </p>
        `;
    }
}

// Clean up AR resources
function cleanupAR() {
    console.log('Cleaning up AR resources...');
    
    if (renderer) {
        renderer.setAnimationLoop(null);
        
        const container = document.getElementById('ar-scene');
        if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
        }
    }
    
    // Clean up placed objects
    placedObjects.forEach(object => {
        if (scene) scene.remove(object);
    });
    placedObjects = [];
    
    // Remove AR start button
    const arButton = document.getElementById('ar-start-button');
    if (arButton) {
        arButton.remove();
    }
}

// Check if AR is supported
function checkARSupport() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-ar')
            .then((supported) => {
                if (supported) {
                    console.log('AR is supported on this device');
                    return true;
                } else {
                    console.log('AR is not supported on this device');
                    showARNotSupportedMessage();
                    return false;
                }
            })
            .catch(err => {
                console.error('Error checking AR support:', err);
                showARNotSupportedMessage();
                return false;
            });
    } else {
        console.log('WebXR not available on this browser');
        showARNotSupportedMessage();
        return false;
    }
} 