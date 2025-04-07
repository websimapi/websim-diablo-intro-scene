import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff8c00, 5); // Orange light, simulating sunset
directionalLight.position.set(0, 5, 10); // Positioned behind the hill/sword
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Ground/Hill - Simple representation
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// Displace vertices to create a hill shape
const positionAttribute = groundGeometry.getAttribute('position');
for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, i);
    const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    const elevation = Math.max(0, 2 - dist * 0.5 + Math.random() * 0.5); // Simple hill shape
     positionAttribute.setY(i, elevation);

    // Add some roughness
    positionAttribute.setX(i, vertex.x + (Math.random() - 0.5) * 0.2);
    positionAttribute.setZ(i, vertex.z + (Math.random() - 0.5) * 0.2);
}
groundGeometry.computeVertexNormals(); // Recalculate normals for lighting

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Dark color for silhouette
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be flat
ground.position.y = -1; // Lower it slightly
scene.add(ground);

// Distant Hills (Silhouettes)
const distantHillMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a }); // Very dark

// Left Hill
const leftHillGeometry = new THREE.PlaneGeometry(15, 8);
const leftPosAttr = leftHillGeometry.getAttribute('position');
for (let i = 0; i < leftPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(leftPosAttr, i);
    if (vertex.y > 0) { // Only modify top vertices
        leftPosAttr.setY(i, vertex.y + Math.sin(vertex.x * 0.8 + 2) * 1.5 + Math.random() * 0.5); // Jagged top edge
    }
     leftPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.1); // Slight roughness
}
const leftHill = new THREE.Mesh(leftHillGeometry, distantHillMaterial);
leftHill.position.set(-8, 1, -8); // Position to the left and back
leftHill.rotation.y = Math.PI / 8; // Angle slightly
scene.add(leftHill);

// Right Hill
const rightHillGeometry = new THREE.PlaneGeometry(15, 10);
const rightPosAttr = rightHillGeometry.getAttribute('position');
 for (let i = 0; i < rightPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(rightPosAttr, i);
     if (vertex.y > 0) { // Only modify top vertices
        rightPosAttr.setY(i, vertex.y + Math.cos(vertex.x * 0.6 - 1) * 2 + Math.random() * 0.7); // Jagged top edge
    }
      rightPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.1); // Slight roughness
}
const rightHill = new THREE.Mesh(rightHillGeometry, distantHillMaterial);
rightHill.position.set(8, 2, -9); // Position to the right and back
rightHill.rotation.y = -Math.PI / 10; // Angle slightly
scene.add(rightHill);


// Sword (Placeholder - simple shape)
const swordGroup = new THREE.Group();

// Blade
const bladeGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.02);
const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x101010, // Dark metal
    roughness: 0.6,
    metalness: 0.5
 });
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 1.25; // Center the blade vertically
swordGroup.add(blade);

// Hilt
const hiltGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.1);
const hilt = new THREE.Mesh(hiltGeometry, bladeMaterial);
hilt.position.y = 0; // Position at the base of the blade
swordGroup.add(hilt);

// Pommel (Simple Sphere)
const pommelGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const pommel = new THREE.Mesh(pommelGeometry, bladeMaterial);
pommel.position.y = -0.15; // Below the hilt
swordGroup.add(pommel);

// Add subtle details to hilt arms (wing-like shapes)
const armShape = new THREE.Shape();
armShape.moveTo(0, 0);
armShape.bezierCurveTo(0.1, 0.1, 0.25, 0.15, 0.3, 0); // Curved top
armShape.lineTo(0.25, -0.05); // Bottom edge
armShape.bezierCurveTo(0.15, -0.02, 0.05, -0.01, 0, 0); // Curved bottom back to center

const extrudeSettings = { depth: 0.05, bevelEnabled: false };
const armGeometry = new THREE.ExtrudeGeometry(armShape, extrudeSettings);

const leftArm = new THREE.Mesh(armGeometry, bladeMaterial);
leftArm.position.set(-0.3, 0, 0.025); // Attach to left side of hilt center
leftArm.rotation.z = Math.PI / 12; // Slight upward angle
swordGroup.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, bladeMaterial);
rightArm.position.set(0.3, 0, 0.025); // Attach to right side of hilt center
rightArm.rotation.z = -Math.PI / 12; // Slight upward angle
rightArm.rotation.y = Math.PI; // Flip geometry
swordGroup.add(rightArm);


swordGroup.position.set(0, 1, 0); // Position sword on top of the hill center
swordGroup.rotation.z = -Math.PI / 32; // Slight tilt
scene.add(swordGroup);


// Background (Sky) - Gradient Plane or Skybox
// Using a simple gradient plane for now
const skyGeometry = new THREE.PlaneGeometry(50, 25);
const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        void main() {
            // More complex gradient mimicking the image
            float mixVal1 = smoothstep(0.3, 0.6, vUv.y); // Transition from dark red to orange
            float mixVal2 = smoothstep(0.5, 0.8, vUv.y); // Transition from orange to yellow/bright orange center
            float horizontalCenter = abs(vUv.x - 0.5) * 2.0; // 0 at center, 1 at edges
            float glowFactor = 1.0 - smoothstep(0.0, 0.6, horizontalCenter); // Stronger glow in the center

            vec3 bottomColor = mix(color1, color2, mixVal1);
            vec3 topColorMix = mix(color2, color3, mixVal2);

            // Blend based on vertical position and add horizontal glow
            vec3 finalColor = mix(bottomColor, topColorMix, vUv.y);
            finalColor = mix(finalColor, color3, glowFactor * (vUv.y - 0.4) * 1.5); // Apply glow stronger towards center and top


             // Add subtle noise/cloud texture
            float noise = fract(sin(dot(vUv * vec2(15.0, 5.0) ,vec2(12.9898,78.233))) * 43758.5453);
            noise = smoothstep(0.4, 0.6, noise) * 0.1; // Subtle cloudiness

            gl_FragColor = vec4(finalColor - noise, 1.0);
            //gl_FragColor = vec4(vUv.y > 0.5 ? color2 : color1, 1.0); // Simple horizontal split
        }
    `,
    uniforms: {
        color1: { value: new THREE.Color(0x3d0f0f) }, // Dark red/brown at the bottom
        color2: { value: new THREE.Color(0xff4500) }, // Orange/Red middle
        color3: { value: new THREE.Color(0xffa500) }  // Lighter Orange/Yellow top/center glow
    },
    side: THREE.BackSide // Render on the back side so it's visible from the front
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.position.z = -15; // Place it far back
sky.position.y = 8; // Position it vertically
scene.add(sky);

// Camera Position
camera.position.set(0, 2, 8); // Adjusted position for a better view
camera.lookAt(0, 1, 0); // Look at the center of the hill/sword base

// OrbitControls for debugging (optional)
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 1, 0);
// controls.update();

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Add cloud movement here later (e.g., modifying shader uniforms or moving texture coordinates)

    // controls.update(); // Update controls if enabled
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();
`````` plan
1.  **HTML Structure (`index.html`):** Create a basic HTML file to host the 3D scene. Include an import map for Three.js and its addons.
2.  **CSS Styling (`style.css`):** Add basic CSS to remove default margins, hide overflow, and make the canvas fill the screen.
3.  **JavaScript Setup (`script.js`):**
    *   Import necessary Three.js modules (`THREE`, `OrbitControls`, `GLTFLoader` - though GLTFLoader won't be used initially).
    *   Set up the core Three.js components: `Scene`, `PerspectiveCamera`, and `WebGLRenderer`. Append the renderer's canvas to the body.
    *   Add basic lighting: an `AmbientLight` for overall illumination and a `DirectionalLight` positioned behind the hill to simulate the sunset glow, casting silhouettes.
    *   Create the main hill geometry using a `PlaneGeometry`. Displace its vertices programmatically to create a rough, hilly shape. Use a dark `MeshStandardMaterial` for a silhouette effect.
    *   Create distant hills using `PlaneGeometry` with modified top vertices for jagged silhouettes. Use a very dark `MeshBasicMaterial` as they don't need complex lighting. Position them behind the main hill on the left and right.
    *   Create a placeholder sword using basic Three.js geometries (`BoxGeometry`, `SphereGeometry`, `ExtrudeGeometry` from a `Shape`) grouped together. Use a dark metallic `MeshStandardMaterial`. Position it atop the main hill.
    *   Create the sky background using a large `PlaneGeometry` placed far behind the scene. Apply a `ShaderMaterial` with custom vertex and fragment shaders to generate a multi-stop gradient (dark red -> orange -> yellow-orange) mimicking the sunset in the reference image. Add a simple noise function to the shader for subtle cloud texture.
    *   Position the camera to replicate the viewpoint from the reference image, looking slightly up towards the sword on the hill.
    *   (Optional: Add `OrbitControls` for debugging purposes, commented out in the final version).
    *   Create the main animation loop (`animate`) using `requestAnimationFrame` to render the scene continuously.
    *   Add a window resize event listener to update the camera aspect ratio and renderer size.
    *   Start the animation loop.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff8c00, 5); // Orange light, simulating sunset
directionalLight.position.set(0, 5, -10); // Positioned behind the hill/sword (moved further back)
directionalLight.target.position.set(0, 1, 0); // Target the hill/sword area
scene.add(directionalLight);
scene.add(directionalLight.target);

// Ground/Hill - Simple representation
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// Displace vertices to create a hill shape
const positionAttribute = groundGeometry.getAttribute('position');
for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, i);
    // Create a more central mound
    const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    let elevation = Math.max(0, 2.5 - dist * 0.8 + Math.sin(dist * 2.0) * 0.3); // Mound shape
    elevation *= (1.0 - Math.abs(vertex.x) / 10.0); // Taper edges slightly
    elevation += (Math.random() - 0.5) * 0.4; // Add roughness

    positionAttribute.setY(i, elevation);

    // Add some horizontal roughness too
    positionAttribute.setX(i, vertex.x + (Math.random() - 0.5) * 0.2);
    positionAttribute.setZ(i, vertex.z + (Math.random() - 0.5) * 0.2);
}
groundGeometry.computeVertexNormals(); // Recalculate normals for lighting

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Dark color for silhouette
    roughness: 0.9,
    metalness: 0.0
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be flat
ground.position.y = -1; // Lower it slightly
scene.add(ground);

// Distant Hills (Silhouettes)
const distantHillMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a }); // Very dark

// Left Hill
const leftHillGeometry = new THREE.PlaneGeometry(15, 8);
const leftPosAttr = leftHillGeometry.getAttribute('position');
for (let i = 0; i < leftPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(leftPosAttr, i);
    if (vertex.y > -4) { // Only modify top vertices (adjust threshold if needed)
        const xFactor = (vertex.x + 7.5) / 15.0; // Normalize x from 0 to 1
        leftPosAttr.setY(i, vertex.y + Math.sin(xFactor * Math.PI * 2.5 + 1) * 2.5 + Math.cos(xFactor * Math.PI * 1.5) * 1.0 + Math.random() * 0.8); // Jagged top edge
    }
     leftPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.2); // Slight roughness
}
leftHillGeometry.computeVertexNormals(); // Though basic material, good practice
const leftHill = new THREE.Mesh(leftHillGeometry, distantHillMaterial);
leftHill.position.set(-10, 1, -12); // Position to the left and further back
leftHill.rotation.y = Math.PI / 12; // Angle slightly
scene.add(leftHill);

// Right Hill
const rightHillGeometry = new THREE.PlaneGeometry(17, 10); // Slightly wider
const rightPosAttr = rightHillGeometry.getAttribute('position');
 for (let i = 0; i < rightPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(rightPosAttr, i);
     if (vertex.y > -5) { // Only modify top vertices
        const xFactor = (vertex.x + 8.5) / 17.0; // Normalize x from 0 to 1
        rightPosAttr.setY(i, vertex.y + Math.cos(xFactor * Math.PI * 2.2 - 1.5) * 3.0 + Math.sin(xFactor * Math.PI * 1.8) * 1.2 + Math.random() * 1.0); // Jagged top edge with spires
    }
      rightPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.2); // Slight roughness
}
rightHillGeometry.computeVertexNormals();
const rightHill = new THREE.Mesh(rightHillGeometry, distantHillMaterial);
rightHill.position.set(11, 1.5, -13); // Position to the right, bit higher and back
rightHill.rotation.y = -Math.PI / 15; // Angle slightly
scene.add(rightHill);


// Sword (Placeholder - simple shape)
const swordGroup = new THREE.Group();

// Blade
const bladeGeometry = new THREE.BoxGeometry(0.15, 3.0, 0.03); // Slightly thicker/longer
const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x080808, // Darker metal
    roughness: 0.7,
    metalness: 0.3
 });
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 1.5; // Center the blade vertically
swordGroup.add(blade);

// Hilt Guard (Crossguard)
const hiltGeometry = new THREE.BoxGeometry(0.8, 0.15, 0.15); // Thicker guard
const hilt = new THREE.Mesh(hiltGeometry, bladeMaterial);
hilt.position.y = 0; // Position at the base of the blade
swordGroup.add(hilt);

// Pommel (Simple Sphere)
const pommelGeometry = new THREE.SphereGeometry(0.12, 16, 16); // Slightly larger
const pommel = new THREE.Mesh(pommelGeometry, bladeMaterial);
pommel.position.y = -0.2; // Below the hilt
swordGroup.add(pommel);

// Hilt arms (wing-like shapes) - More defined curve
const armShape = new THREE.Shape();
armShape.moveTo(0, 0.05); // Start slightly higher
armShape.bezierCurveTo(0.1, 0.15, 0.3, 0.2, 0.4, 0.05); // More pronounced upper curve
armShape.lineTo(0.35, -0.1); // Taper inwards at bottom
armShape.bezierCurveTo(0.2, -0.05, 0.1, -0.02, 0, 0); // Curve back to center (lower part)
armShape.closePath(); // Close the shape

const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 }; // Add slight bevel
const armGeometry = new THREE.ExtrudeGeometry(armShape, extrudeSettings);

const leftArm = new THREE.Mesh(armGeometry, bladeMaterial);
leftArm.position.set(-0.4, 0, 0.0); // Attach to left side of hilt center
leftArm.rotation.z = Math.PI / 9; // More upward angle
swordGroup.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, bladeMaterial);
rightArm.position.set(0.4, 0, 0.0); // Attach to right side of hilt center
rightArm.rotation.z = -Math.PI / 9; // More upward angle
rightArm.rotation.y = Math.PI; // Flip geometry
swordGroup.add(rightArm);


swordGroup.position.set(0, 0.9, 0.2); // Position sword slightly forward on the hill center, slightly lower base
swordGroup.rotation.z = -Math.PI / 45; // Very slight tilt
swordGroup.scale.set(1.2, 1.2, 1.2); // Make sword slightly larger overall
scene.add(swordGroup);


// Background (Sky) - Gradient Plane or Skybox
const skyGeometry = new THREE.PlaneGeometry(60, 35); // Wider and taller
const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color1; // Bottom color (dark red/brown)
        uniform vec3 color2; // Middle color (fiery orange)
        uniform vec3 color3; // Upper color (darker orange/red)
        uniform vec3 glowColor; // Center glow color (bright yellow/orange)
        uniform float time; // Time for animation

        // Simple noise function
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        // Value noise function
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = rand(i);
            float b = rand(i + vec2(1.0, 0.0));
            float c = rand(i + vec2(0.0, 1.0));
            float d = rand(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }


        void main() {
            // Gradient blending
            float mixVal1 = smoothstep(0.25, 0.55, vUv.y); // Blend from bottom to middle
            float mixVal2 = smoothstep(0.5, 0.85, vUv.y);  // Blend from middle to top

            vec3 bottomMix = mix(color1, color2, mixVal1);
            vec3 topMix = mix(color2, color3, mixVal2);
            vec3 baseColor = mix(bottomMix, topMix, vUv.y);


            // Central Glow
            float horizontalDist = abs(vUv.x - 0.5) * 2.0; // 0 at center, 1 at edges
            float verticalDist = abs(vUv.y - 0.55) * 1.5; // Centered slightly above middle
            float distFromCenter = sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);
            float glow = smoothstep(0.8, 0.0, distFromCenter) * 0.8; // Inverse smoothstep for glow, intensity 0.8

            vec3 colorWithGlow = mix(baseColor, glowColor, glow);

            // Animated Cloud/Noise Texture
            vec2 cloudUv = vUv * vec2(5.0, 2.0) + vec2(time * 0.02, 0.0); // Scale and animate horizontally
            float cloudNoise = 0.0;
            float amplitude = 0.4;
            float frequency = 1.0;
             // Fractal noise (summing multiple layers)
            for (int i = 0; i < 4; i++) {
                 cloudNoise += noise(cloudUv * frequency) * amplitude;
                 frequency *= 2.0;
                 amplitude *= 0.5;
            }

            cloudNoise = smoothstep(0.3, 0.7, cloudNoise); // Adjust contrast/coverage
            cloudNoise *= (0.2 + vUv.y * 0.4); // Make clouds thicker higher up and add base value

            // Darken base color by noise amount - more subtle than adding black
            vec3 finalColor = colorWithGlow * (1.0 - cloudNoise * 0.6); // Adjust darkening factor (0.6)

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    uniforms: {
        color1: { value: new THREE.Color(0x2c0b0b) }, // Darker red/brown
        color2: { value: new THREE.Color(0xdf4f0f) }, // Fiery orange
        color3: { value: new THREE.Color(0x6a230d) }, // Darker upper red/orange
        glowColor: { value: new THREE.Color(0xffa500) }, // Bright Orange/Yellow glow
        time: { value: 0.0 } // Initialize time uniform
    },
    side: THREE.BackSide // Render on the back side
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.position.z = -20; // Place it further back
sky.position.y = 8; // Position it vertically
scene.add(sky);

// Camera Position
camera.position.set(0, 2.5, 10); // Adjusted position: slightly higher, further back
camera.lookAt(0, 1.5, 0); // Look slightly higher towards the sword hilt area

// OrbitControls for debugging (optional)
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 1.5, 0);
// controls.update();

const clock = new THREE.Clock(); // Clock for animation timing

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Update shader time uniform for cloud movement
    skyMaterial.uniforms.time.value = elapsedTime;

    // controls.update(); // Update controls if enabled
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();

