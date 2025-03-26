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



const materialParametrs = {};
materialParametrs.color = '#203340';
materialParametrs.fon = '#242e27';
materialParametrs.shadowColor = '#8e19b8';
materialParametrs.lightColor = '#8e19b8';
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
renderer.setClearColor(materialParametrs.fon);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, softer shadows

/**
 * Material
 */


const material = new THREE.ShaderMaterial(
  {
    vertexShader: shadingVertexShader,
    fragmentShader: shadingFragmentShader,

    uniforms: {
      uTime: new THREE.Uniform(0),
      uColor: new THREE.Uniform(new THREE.Color(materialParametrs.color)),
      uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
      unShadowRepetitions: new THREE.Uniform(100),
      uShadowColor: new THREE.Uniform(new THREE.Color(materialParametrs.shadowColor)),
      uLightRepetitions: new THREE.Uniform(80),
      uLightColor: new THREE.Uniform(new THREE.Color(materialParametrs.lightColor)),
    },
    // transparent: false,
    // side: THREE.DoubleSide,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending
  }
)



const controls = new OrbitControls(camera, renderer.domElement);

const sphery = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 32, 16),
  material
)
sphery.position.x = -5
scene.add(sphery)

const tourusKnotGeometry = new THREE.TorusKnotGeometry(1.1, 0.3, 128, 32)

const tourusKnot = new THREE.Mesh(tourusKnotGeometry, material)
scene.add(tourusKnot)



let suzanna = null;
gltfLoader.load('suzanne.glb',
  (gltf) => {
    suzanna = gltf.scene
    suzanna.scale.set(1.7, 1.7, 1.7)
    suzanna.position.set(5, 0, 0)
    suzanna.traverse((child) => {
      if (child.isMesh)
        child.material = material
    })
    scene.add(suzanna)
  }


)



gui
  .addColor(materialParametrs, 'color')
  .onChange(() => {
    material.uniforms.uColor.value.set(materialParametrs.color)
  })
gui
  .addColor(materialParametrs, 'fon')
  .onChange(() => {
    renderer.setClearColor(materialParametrs.fon)
  })

gui
  .add(material.uniforms.unShadowRepetitions, 'value').min(1).max(300).step(1)

gui.addColor(materialParametrs, 'shadowColor')
.onChange(() => {
  material.uniforms.uShadowColor.value.set(materialParametrs.shadowColor)
})
gui
  .add(material.uniforms.uLightRepetitions, 'value').min(1).max(300).step(1)

gui.addColor(materialParametrs, 'lightColor')
.onChange(() => {
  material.uniforms.uLightColor.value.set(materialParametrs.lightColor)
})



/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  tourusKnot.rotation.x = elapsedTime * 0.3
  tourusKnot.rotation.y = elapsedTime * 0.3

  if(suzanna) {
    suzanna.rotation.y = elapsedTime * 0.3
  }
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
