import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import shadingVertexShader from "./shaders/shading/vertex.glsl";
import shadingFragmentShader from "./shaders/shading/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 7;
camera.position.y = 5;
camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("gray");

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, softer shadows

/**
 * Material
 */
const materialParameters = {};
materialParameters.color = "#ffffff";

const material = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
  },
});

gui.addColor(materialParameters, "color").onChange(() => {
  material.uniforms.uColor.value.set(materialParameters.color);
});

// Suzanne
let suzanne = null;
gltfLoader.load("./suzanne.glb", (gltf) => {
  suzanne = gltf.scene;
  suzanne.rotation.y = Math.PI;
  suzanne.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
      child.material.uniforms.uColor.value.set("#A9A9A9");
      child.castShadow = true; // Enable shadow casting for Suzanne
      child.receiveShadow = true; // Enable shadow receiving for Suzanne
    }
  });
  scene.add(suzanne);
});

// Create a circular floor
const floorGeometry = new THREE.CircleGeometry(5, 64); // Radius 5, with 64 segments for smoothness

// Create a material for the floor (you can modify this to resemble water)
const floorMaterial = new THREE.MeshStandardMaterial({
  color: "#1e90ff", // Water-like color (adjust as needed)
  transparent: true,
  opacity: 0.8, // Some transparency to make it look like water
  side: THREE.DoubleSide, // Render both sides of the circle
});

// Create the mesh with geometry and material
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Rotate it to lay flat (horizontal plane)
floor.rotation.x = -Math.PI / 2; // Rotate by 90 degrees along the X-axis

// Position it at the desired height (0 for ground level)
floor.position.y = -1.2; // You can adjust this value as needed

// Add the circular floor to the scene
scene.add(floor);

const sphery = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  material
);
sphery.position.x = -3;
scene.add(sphery);

const tourusKnotGeometry = new THREE.TorusKnotGeometry(0.8, 0.2, 128, 32)
 
const tourusKnot = new THREE.Mesh(tourusKnotGeometry, material)
tourusKnot.position.x = 3
scene.add(tourusKnot)

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.y = elapsedTime * 0.1;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
