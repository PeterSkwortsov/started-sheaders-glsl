import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import shadingVertexShader from "./shaders/shading/vertex.glsl";
import shadingFragmentShader from "./shaders/shading/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl";


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
const textureLoader = new THREE.TextureLoader();



const materialParametrs = {};
// materialParametrs.color = '#203340';
materialParametrs.fon = '#000011';
materialParametrs.shadowColor = '#8e19b8';
materialParametrs.lightColor = '#8e19b8';

const earthParameters = {};
earthParameters.atmosphereDayColor = "#00aaff";
earthParameters.atmosphereTwilightColor = "#ff6600";


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

  material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
// camera.position.x = 7;
// camera.position.y = 5;
camera.position.z = 8;
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
renderer.setClearColor(materialParametrs.fon);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, softer shadows


const controls = new OrbitControls(camera, renderer.domElement);

const earthDayTexture = textureLoader.load('./earth/day.jpg');
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8


const earthNightTexture = textureLoader.load('./earth/night.jpg');
earthNightTexture.colorSpace = THREE.SRGBColorSpace; // Всегда добавляй этот параметр! Чтобы картинка была ярче, сочнее
earthNightTexture.anisotropy = 8 // Anisotropy это поле, которое контролирует растяжение света. С его помощью создают, например, эффект полосатого или матового стекла.

const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg');
earthSpecularCloudsTexture.colorSpace = THREE.SRGBColorSpace;
earthSpecularCloudsTexture.anisotropy = 8



const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0.0, 0.0, 1.0)),

    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),

  },
  side: THREE.DoubleSide,
  wireframe: false
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);


const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,

  uniforms: {
    
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0.0, 0.0, 1.0)),

    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),

  },
})
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.8, 1.10, 1.10);
scene.add(atmosphere);

gui.addColor(earthParameters, "atmosphereDayColor").onChange(() => {
  earthMaterial.uniforms.uAtmosphereDayColor.value.set(
    earthParameters.atmosphereDayColor
  )
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
    earthParameters.atmosphereDayColor
  )
})
gui.addColor(earthParameters, "atmosphereTwilightColor").onChange(() => {
  earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(
    earthParameters.atmosphereTwilightColor
  )
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
    earthParameters.atmosphereTwilightColor
  )
})



//солнце

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 5),
  new THREE.MeshBasicMaterial()
)
scene.add(debugSun)

const updateSun = () => {
  sunDirection.setFromSpherical(sunSpherical);
  debugSun.position.copy(sunDirection).multiplyScalar(5);

  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
}

updateSun()

gui.add(sunSpherical, 'phi').min(0).max(Math.PI * 2).onChange(updateSun);
gui.add(sunSpherical, 'theta').min(-Math.PI * 2).max(Math.PI * 2).onChange(updateSun);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  earth.rotation.y = elapsedTime * 0.1;

  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
