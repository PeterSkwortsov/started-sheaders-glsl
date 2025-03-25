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

const debugObject = {}


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
renderer.setClearColor("black");

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, softer shadows

/**
 * Material
 */
const geometry = new THREE.PlaneGeometry(2, 2, 500, 500);
geometry.deleteAttribute('normal');
geometry.deleteAttribute('uv');
debugObject.depthColor = '#151c37';
debugObject.surfaceColor = '#ff4000';



const material = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(2.5, 1.5) }, // вектор 2 означает направление по - x, y
    uBigWavesSpeed: { value: 0.5 },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3.0 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4 },


    udDephColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.0925 },
    uColorMultiplier: { value: 1.0 },


  }
});
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = Math.PI * 0.5;
scene.add(mesh);

camera.position.z = 2;
camera.position.y = 2;
const controls = new OrbitControls(camera, renderer.domElement);

gui.add(mesh.material.uniforms.uBigWavesElevation, 'value').min(0).max(2).step(0.01).name('высота волны');
gui.add(mesh.material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.01).name('частота волны по x');
gui.add(mesh.material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.01).name('частота волны по y');
gui.add(mesh.material.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.01).name('скорость волны');


gui.addColor(debugObject, 'depthColor').name('цвет глубины').onChange(() => {
  mesh.material.uniforms.udDephColor.value.set(debugObject.depthColor);
})
gui.addColor(debugObject, 'surfaceColor').name('цвет поверхности').onChange(() => {
  mesh.material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
})
gui.add(mesh.material.uniforms.uColorOffset, 'value').min(0).max(5).step(0.01).name('смещение цвета');
gui.add(mesh.material.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.01).name('множитель цвета');
gui.add(mesh.material.uniforms.uSmallWavesElevation, 'value').min(0).max(2).step(0.01).name('высота волны');
gui.add(mesh.material.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.01).name('частота волны');
gui.add(mesh.material.uniforms.uSmallWavesSpeed, 'value').min(0).max(5).step(0.01).name('скорость волны');
gui.add(mesh.material.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1.0).name('количество волны');


/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  mesh.material.uniforms.uTime.value = elapsedTime;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
