import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cube to test shadows
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(-15, 0, 0);
scene.add(cube);

// Add a plane to receive shadows
const planeGeometry = new THREE.PlaneGeometry(75, 75);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -25;
plane.receiveShadow = true;
// scene.add(plane);

// Set the camera position
camera.position.z = 5;

// GLTFLoader to load the 3D model
const loader = new GLTFLoader();

// Create a directional light (sun)
const sun = new THREE.DirectionalLight(0xffa500, 8);
sun.castShadow = true;
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 500;
sun.shadow.mapSize.set(2048, 2048);
sun.position.set(50, 50, 50);
scene.add(sun);

// Load the GLTF model and set shadow properties
loader.load(
  "Races.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true; // GLTF model will cast shadows
        node.receiveShadow = true; // GLTF model will receive shadows
      }
    });
    gltf.scene.position.set(0, -40, 0);
    gltf.scene.rotation.y += THREE.MathUtils.degToRad(45);
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Movement controls based on the camera's direction
const controls = new PointerLockControls(camera, document.body);

// Event listener to request pointer lock when clicking
document.addEventListener(
  "click",
  function () {
    controls.lock();
  },
  false
);

document.addEventListener(
  "pointerlockchange",
  function () {
    if (document.pointerLockElement === document.body) {
      controls.lock();
    } else {
      controls.unlock();
    }
  },
  false
);

// Track which keys are being pressed
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

// Set up event listeners for keydown and keyup
document.addEventListener("keydown", function (event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      movement.forward = true;
      break;
    case "ArrowDown":
    case "KeyS":
      movement.backward = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      movement.left = true;
      break;
    case "ArrowRight":
    case "KeyD":
      movement.right = true;
      break;
    case "Space":
      movement.up = true;
      break;
    case "ShiftLeft":
      movement.down = true;
      break;
  }
});

document.addEventListener("keyup", function (event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      movement.forward = false;
      break;
    case "ArrowDown":
    case "KeyS":
      movement.backward = false;
      break;
    case "ArrowLeft":
    case "KeyA":
      movement.left = false;
      break;
    case "ArrowRight":
    case "KeyD":
      movement.right = false;
      break;
    case "Space":
      movement.up = false;
      break;
    case "ShiftLeft":
      movement.down = false;
      break;
  }
});

// Function to move the camera based on direction
function updateMovement(deltaTime) {
  const speed = 10 * deltaTime; // Speed of movement
  const direction = new THREE.Vector3();

  // Determine the direction of movement
  if (movement.forward) direction.z -= speed;
  if (movement.backward) direction.z += speed;
  if (movement.left) direction.x -= speed;
  if (movement.right) direction.x += speed;
  if (movement.up) camera.position.y += speed;
  if (movement.down) camera.position.y -= speed;

  // Move based on the camera's orientation
  direction.applyQuaternion(camera.quaternion); // Apply camera's rotation to the direction
  camera.position.add(direction); // Move the camera in the calculated direction
}

// Animation loop
function animate() {
  const deltaTime = 0.1; // Example time step, this can be made dynamic if needed

  updateMovement(deltaTime);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

// Use `setAnimationLoop` for VR/AR support and smoother animation
renderer.setAnimationLoop(animate);
