// This file defines a sheep model using Three.js

// Function to create and return a sheep model
function createSheepModel() {
    // This function will return an A-Frame entity with a sheep model
    const sheepEntity = document.createElement('a-entity');
    
    // Base of the sheep (body)
    const body = document.createElement('a-entity');
    body.setAttribute('geometry', 'primitive: box; width: 1; height: 0.6; depth: 0.6');
    body.setAttribute('material', 'color: white');
    body.setAttribute('position', '0 0.3 0');
    
    // Head
    const head = document.createElement('a-entity');
    head.setAttribute('geometry', 'primitive: box; width: 0.4; height: 0.4; depth: 0.4');
    head.setAttribute('material', 'color: white');
    head.setAttribute('position', '0.6 0.5 0');
    
    // Face
    const face = document.createElement('a-entity');
    face.setAttribute('geometry', 'primitive: box; width: 0.2; height: 0.2; depth: 0.2');
    face.setAttribute('material', 'color: black');
    face.setAttribute('position', '0.8 0.5 0');
    
    // Legs (4)
    const legPositions = [
        {x: -0.3, z: -0.2}, // back left
        {x: -0.3, z: 0.2},  // back right
        {x: 0.3, z: -0.2},  // front left
        {x: 0.3, z: 0.2}    // front right
    ];
    
    legPositions.forEach(pos => {
        const leg = document.createElement('a-entity');
        leg.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.4; depth: 0.1');
        leg.setAttribute('material', 'color: #CCCCCC');
        leg.setAttribute('position', `${pos.x} -0.2 ${pos.z}`);
        sheepEntity.appendChild(leg);
    });
    
    // Ears (2)
    const leftEar = document.createElement('a-entity');
    leftEar.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.1; depth: 0.05');
    leftEar.setAttribute('material', 'color: white');
    leftEar.setAttribute('position', '0.6 0.7 -0.2');
    
    const rightEar = document.createElement('a-entity');
    rightEar.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.1; depth: 0.05');
    rightEar.setAttribute('material', 'color: white');
    rightEar.setAttribute('position', '0.6 0.7 0.2');
    
    // Assemble sheep
    sheepEntity.appendChild(body);
    sheepEntity.appendChild(head);
    sheepEntity.appendChild(face);
    sheepEntity.appendChild(leftEar);
    sheepEntity.appendChild(rightEar);
    
    // Scale the entire sheep
    sheepEntity.setAttribute('scale', '0.5 0.5 0.5');
    
    // Add animation to make it more lively
    sheepEntity.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear');
    
    return sheepEntity;
}

// Function to create a simpler sheep model for map markers
function createMapMarkerSheep() {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" stroke="black" stroke-width="1"/>
            <circle cx="16" cy="10" r="2" fill="black"/>
            <path d="M8 16 A6 4 0 0 0 16 16" fill="none" stroke="black" stroke-width="1"/>
        </svg>
    `);
} 