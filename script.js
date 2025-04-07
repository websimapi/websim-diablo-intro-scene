import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Improve rendering quality slightly for the dark scene
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Helper function for smoothstep (GLSL equivalent)
function smoothstep(edge0, edge1, x) {
  // Scale, bias and saturate x to 0..1 range
  x = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  // Evaluate polynomial
  return x * x * (3 - 2 * x);
}

// Lighting (Mainly affects the sky now, terrain/sword are basic materials)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Reduce ambient influence
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff8c00, 15); // Keep for sky glow influence
directionalLight.position.set(0, 5, -15);
directionalLight.target.position.set(0, 2, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Ground/Hill - More pronounced central mound with more detail
const groundGeometry = new THREE.PlaneGeometry(20, 20, 128, 128); // Increased segments significantly
// Displace vertices to create a more detailed, rocky hill shape
const positionAttribute = groundGeometry.getAttribute('position');
const peakHeight = 4.5; // Max height of the central mound
const roughnessFactor = 0.8; // How jagged the rocks are
const detailFactor = 3.5; // Frequency of smaller details

for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, i);

    // Base Mound Shape (Gaussian-like)
    const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    let elevation = peakHeight * Math.exp(-(dist * dist) / 10.0); // Gaussian falloff from center

    // Add layered noise for rocky detail
    // Layer 1: Medium-scale roughness
    elevation += (Math.sin(vertex.x * 1.2 + dist * 0.8) * Math.cos(vertex.z * 0.8)) * roughnessFactor * 0.6;
    // Layer 2: Smaller scale detail
    elevation += (Math.sin(vertex.x * detailFactor + vertex.z * detailFactor * 0.7) * Math.cos(dist * detailFactor * 1.2)) * roughnessFactor * 0.3;
    // Layer 3: Fine noise
    elevation += (Math.random() - 0.5) * roughnessFactor * 0.2;

    // Ensure edges taper down more realistically
    elevation *= smoothstep(10.0, 4.0, dist); // Taper smoothly towards the edge (Use custom smoothstep)

    // Clamp elevation to avoid negative values near the edges if noise is strong
    elevation = Math.max(0, elevation);

    positionAttribute.setY(i, elevation);

    // Add slight horizontal displacement for extra roughness
    positionAttribute.setX(i, vertex.x + (Math.random() - 0.5) * 0.1);
    positionAttribute.setZ(i, vertex.z + (Math.random() - 0.5) * 0.1);
}
groundGeometry.computeVertexNormals(); // Still compute for potential future use, though MeshBasicMaterial ignores them

// Use MeshBasicMaterial for a pure black silhouette unaffected by light
const groundMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000, // Pure black
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be flat
ground.position.y = -1.5;
scene.add(ground);

// Distant Hills (Silhouettes) - Ensure pure black
const distantHillMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Pure black

// Left Hill - Taller and more jagged
const leftHillGeometry = new THREE.PlaneGeometry(15, 12, 64, 64); // Added segments for potential detail
const leftPosAttr = leftHillGeometry.getAttribute('position');
for (let i = 0; i < leftPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(leftPosAttr, i);
    if (vertex.y > -6) { // Modify top vertices
        const xFactor = (vertex.x + 7.5) / 15.0;
        // Increased vertical displacement for more jaggedness
        leftPosAttr.setY(i, vertex.y + Math.sin(xFactor * Math.PI * 2.8 + 1.2) * 3.5 + Math.cos(xFactor * Math.PI * 1.7 - 0.5) * 1.5 + Math.random() * 1.2);
    }
    leftPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.3); // Slight roughness
}
leftHillGeometry.computeVertexNormals();
const leftHill = new THREE.Mesh(leftHillGeometry, distantHillMaterial);
leftHill.position.set(-10, 2, -14);
leftHill.rotation.y = Math.PI / 12;
scene.add(leftHill);

// Right Hill - Taller and more jagged
const rightHillGeometry = new THREE.PlaneGeometry(17, 14, 64, 64); // Added segments
const rightPosAttr = rightHillGeometry.getAttribute('position');
for (let i = 0; i < rightPosAttr.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(rightPosAttr, i);
    if (vertex.y > -7) { // Modify top vertices
        const xFactor = (vertex.x + 8.5) / 17.0;
        // Increased vertical displacement for more jaggedness/spires
        rightPosAttr.setY(i, vertex.y + Math.cos(xFactor * Math.PI * 2.5 - 1.8) * 4.0 + Math.sin(xFactor * Math.PI * 2.1 + 0.3) * 1.8 + Math.random() * 1.5);
    }
    rightPosAttr.setX(i, vertex.x + (Math.random() - 0.5) * 0.3); // Slight roughness
}
rightHillGeometry.computeVertexNormals();
const rightHill = new THREE.Mesh(rightHillGeometry, distantHillMaterial);
rightHill.position.set(11, 2.5, -15);
rightHill.rotation.y = -Math.PI / 15;
scene.add(rightHill);

// Sword - Use MeshBasicMaterial for pure silhouette
const swordGroup = new THREE.Group();
const swordMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Pure black silhouette

// Blade
const bladeGeometry = new THREE.BoxGeometry(0.2, 3.5, 0.04);
const blade = new THREE.Mesh(bladeGeometry, swordMaterial); // Use new basic material
blade.position.y = 1.75;
swordGroup.add(blade);

// Hilt Guard (Crossguard)
const hiltGeometry = new THREE.BoxGeometry(1.0, 0.2, 0.18);
const hilt = new THREE.Mesh(hiltGeometry, swordMaterial); // Use new basic material
hilt.position.y = 0;
swordGroup.add(hilt);

// Pommel (Simple Sphere)
const pommelGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const pommel = new THREE.Mesh(pommelGeometry, swordMaterial); // Use new basic material
pommel.position.y = -0.25;
swordGroup.add(pommel);

// Hilt arms (wing-like shapes)
const armShape = new THREE.Shape();
armShape.moveTo(0, 0.06);
armShape.bezierCurveTo(0.15, 0.2, 0.4, 0.25, 0.5, 0.1);
armShape.lineTo(0.45, -0.15);
armShape.bezierCurveTo(0.3, -0.1, 0.15, -0.05, 0, 0);
armShape.closePath();

const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 };
const armGeometry = new THREE.ExtrudeGeometry(armShape, extrudeSettings);

const leftArm = new THREE.Mesh(armGeometry, swordMaterial); // Use new basic material
leftArm.position.set(-0.5, 0, 0.0);
leftArm.rotation.z = Math.PI / 8;
swordGroup.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, swordMaterial); // Use new basic material
rightArm.position.set(0.5, 0, 0.0);
rightArm.rotation.z = -Math.PI / 8;
rightArm.rotation.y = Math.PI;
swordGroup.add(rightArm);

// Find highest point on the generated hill near the center to place the sword
const raycaster = new THREE.Raycaster();
const centerGround = new THREE.Vector3(0, 5, 0.3); // Start ray above center, slightly forward
const down = new THREE.Vector3(0, -1, 0);
raycaster.set(centerGround, down);
const intersects = raycaster.intersectObject(ground);
let swordYPosition = 1.8; // Default position
if (intersects.length > 0) {
    swordYPosition = intersects[0].point.y + 0.1; // Place slightly above intersection point
}

swordGroup.position.set(0, swordYPosition + 1.7, 0.3); // Adjust Y based on terrain height, +1.7 approx half blade height + pommel offset
swordGroup.rotation.z = -Math.PI / 50;
swordGroup.scale.set(1.8, 1.8, 1.8);
scene.add(swordGroup);

// Background (Sky) - Brighter, larger glow
const skyGeometry = new THREE.PlaneGeometry(70, 40); // Even Wider and taller
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
        uniform vec3 color1; // Bottom color
        uniform vec3 color2; // Middle color
        uniform vec3 color3; // Upper color
        uniform vec3 glowColor; // Center glow color
        uniform float time;

        // Standard 2D random function
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        // 2D Noise based on Morgan McGuire @morgan3d
        // https://www.shadertoy.com/view/4dS3Wd
        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            // Four corners in 2D of a tile
            float a = rand(i);
            float b = rand(i + vec2(1.0, 0.0));
            float c = rand(i + vec2(0.0, 1.0));
            float d = rand(i + vec2(1.0, 1.0));

            // Smooth Interpolation using Smoothstep
            vec2 u = f*f*(3.0-2.0*f);

            // Mix 4 corners percentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        // GLSL smoothstep implementation in JS-like syntax (for reference)
        /* float smoothstep(float edge0, float edge1, float x) {
          // Scale, bias and saturate x to 0..1 range
          x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
          // Evaluate polynomial
          return x * x * (3.0 - 2.0 * x);
       }*/

        void main() {
            // Gradient blending - adjusted stops for emphasis
            float mixVal1 = smoothstep(0.2, 0.5, vUv.y);
            float mixVal2 = smoothstep(0.45, 0.9, vUv.y); // Upper blend starts lower

            vec3 bottomMix = mix(color1, color2, mixVal1);
            vec3 topMix = mix(color2, color3, mixVal2);
            vec3 baseColor = mix(bottomMix, topMix, vUv.y * 0.8 + 0.2); // Bias towards upper colors

            // Central Glow - Larger and much brighter
            float horizontalDist = abs(vUv.x - 0.5) * 1.5; // Make horizontal spread slightly less wide than vertical
            float verticalDist = abs(vUv.y - 0.5) * 2.0;   // Center vertically
            float distFromCenter = sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);
            // Wider spread (1.2), sharper cutoff (0.1), higher intensity (1.8)
            float glow = smoothstep(1.2, 0.1, distFromCenter) * 1.8;

            // Add glow additively for brightness, clamp to avoid > 1
            vec3 colorWithGlow = clamp(baseColor + glowColor * glow, 0.0, 1.0);

            // Animated Cloud/Noise Texture
            vec2 cloudUv = vUv * vec2(4.0, 1.5) + vec2(time * 0.02, 0.0); // Adjusted scale
            float cloudNoise = 0.0;
            float amplitude = 0.45;
            float frequency = 1.0;
            for (int i = 0; i < 4; i++) {
                cloudNoise += noise(cloudUv * frequency) * amplitude;
                frequency *= 2.1; // Slightly different frequency
                amplitude *= 0.5;
            }

            cloudNoise = smoothstep(0.35, 0.65, cloudNoise); // Adjust contrast
            // Make clouds less dark, more apparent higher up
            cloudNoise *= (0.1 + vUv.y * 0.5);

            // Darken base color by noise amount - reduced darkening factor
            vec3 finalColor = colorWithGlow * (1.0 - cloudNoise * 0.45);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    uniforms: {
        // Slightly adjusted colors for vibrancy
        color1: { value: new THREE.Color(0x2a0a0a) },
        color2: { value: new THREE.Color(0xe5550f) },
        color3: { value: new THREE.Color(0x70250c) },
        glowColor: { value: new THREE.Color(0xffd833) }, // Brighter yellow/orange glow
        time: { value: 0.0 }
    },
    side: THREE.BackSide
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.position.z = -20;
sky.position.y = 10; // Raise sky slightly to accommodate taller hills/view
scene.add(sky);

// Camera Position - Adjusted for new scene scale and composition
camera.position.set(0, 2.2, 9); // Slightly lower, bit closer
camera.lookAt(0, 2.0, 0); // Look slightly higher towards the sword hilt area on the taller hill

// OrbitControls for debugging (optional)
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 2.0, 0); // Updated target
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