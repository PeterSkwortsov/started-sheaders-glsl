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
const textureLoader = new THREE.TextureLoader();

const displacement = {}

displacement.canvas = document.createElement('canvas');
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = 'fixed'
displacement.canvas.style.width = '256px'
displacement.canvas.style.height = '256px'
displacement.canvas.style.left = 0
displacement.canvas.style.zIndex = 10
document.body.append(displacement.canvas)

displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

displacement.glowImage = new Image()
displacement.glowImage.src = '/earth/glow.png'


displacement.interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide
  })
)
displacement.interactivePlane.visible = false
scene.add(displacement.interactivePlane)

displacement.raycaster = new THREE.Raycaster()
displacement.screenCursor = new THREE.Vector2(9999, 9999)
displacement.canvasCursor = new THREE.Vector2(9999, 9999)
displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999)


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
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
// camera.position.x = 7;
// camera.position.y = 5;
camera.position.z = 15;
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

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, softer shadows


const controls = new OrbitControls(camera, renderer.domElement);

displacement.texture = new THREE.CanvasTexture(displacement.canvas)

const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null) // это параметр увеличивает производительность за счет передачи меньшего количества вершин
particlesGeometry.deleteAttribute('normal')
 

const intensitiArray = new Float32Array(particlesGeometry.attributes.position.count) 
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count) 

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiArray[i] = Math.random()
  anglesArray[i] = Math.random() * Math.PI * 2
}

particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiArray, 1))
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,

  uniforms: 
  {
    uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
    uPictureTexture: new THREE.Uniform(textureLoader.load('/earth/picture-1.png')),
    uDisplacementTexture: new THREE.Uniform(displacement.texture)

  },
  // blending: THREE.AdditiveBlending

})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)





window.addEventListener('pointermove', (event) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1
})




/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();


  controls.update();

  displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
  const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)

  if (intersections.length)
  {
    const uv = intersections[0].uv
    displacement.canvasCursor.x = uv.x * displacement.canvas.width
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
  }

  displacement.context.globalCompositeOperation = 'source-over'
  displacement.context.globalAlpha = 0.02
  displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

  const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)  
  const alpha = Math.min(cursorDistance * 0.1, 1)

  displacement.canvasCursorPrevious.copy(displacement.canvasCursor)

  const glowSize = displacement.canvas.width * 0.25
  displacement.context.globalCompositeOperation = 'lighten'
  displacement.context.globalAlpha = alpha

  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize * 0.5,
    displacement.canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize
  )

  displacement.texture.needsUpdate = true
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
