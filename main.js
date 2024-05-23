import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";

const gui = new GUI();

const canvas = document.querySelector(".webgl");

const size = {
  w: window.innerWidth,
  h: window.innerHeight,
};

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Axes Helper
 */
const axesHelper = new THREE.AxesHelper(3);
axesHelper.visible = false;
scene.add(axesHelper);

/**
 * Galaxy
 */
const objects = {
  count: 20000,
  size: 0.01,
  radius: 3,
  branches: 6,
  spinAngle: 3,
  randomness: 1,
  randomnessPower: 7,
  insideColor: 0x240771,
  outsideColor: 0x0ed811,
};

let bufferGeometry = null;
let pointsMaterial = null;
let points = null;

const galaxy = () => {
  // dispose mesh , geometry and material
  if (points !== null) {
    bufferGeometry.dispose();
    pointsMaterial.dispose();
    scene.remove(points);
  }

  //Float32Array
  const position = new Float32Array(objects.count * 3); // one vertex has 3 (x,y,z)
  const color = new Float32Array(objects.count * 3); // one vertex has 3 (x,y,z)

  const insideColor = new THREE.Color(objects.insideColor);
  const outsideColor = new THREE.Color(objects.outsideColor);

  for (let i = 0; i < objects.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * objects.radius;
    const branches = ((i % objects.branches) / objects.branches) * Math.PI * 2;
    const spinAngle = objects.spinAngle * radius;
    const X =
      Math.pow(Math.random(), objects.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      objects.randomness *
      radius;

    const Y =
      Math.pow(Math.random(), objects.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      objects.randomness *
      radius;

    const Z =
      Math.pow(Math.random(), objects.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      objects.randomness *
      radius;

    position[i3] = Math.cos(branches + spinAngle) * radius + X;
    position[i3 + 1] = Y;
    position[i3 + 2] = Math.sin(branches + spinAngle) * radius + Z;

    const cloneColor = insideColor.clone();
    cloneColor.lerp(outsideColor, radius / objects.radius);

    color[i3] = cloneColor.r;
    color[i3 + 1] = cloneColor.g;
    color[i3 + 2] = cloneColor.b;

    if (i < 3) {
      // console.log(radius / objects.radius);
    }
  }

  bufferGeometry = new THREE.BufferGeometry();

  bufferGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(position, 3)
  );

  bufferGeometry.setAttribute("color", new THREE.BufferAttribute(color, 3));

  pointsMaterial = new THREE.PointsMaterial({
    size: objects.size,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(bufferGeometry, pointsMaterial);
  scene.add(points);
};
galaxy();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, size.w / size.h);
camera.position.set(0, 0.5, 4);
scene.add(camera);

/**
 * Gui
 */
gui.add(camera.position, "y").min(0).max(4).step(0.01).onFinishChange(galaxy);
gui.add(camera.position, "x").min(0).max(4).step(0.01).onFinishChange(galaxy);
gui.add(camera.position, "z").min(0).max(6).step(0.01).onFinishChange(galaxy);
gui.add(objects, "count").min(50).max(50000).step(1).onFinishChange(galaxy);
gui
  .add(objects, "size")
  .min(0.01)
  .max(0.03)
  .step(0.0001)
  .onFinishChange(galaxy);
gui.add(objects, "radius").min(1).max(10).step(0.01).onFinishChange(galaxy);
gui.add(objects, "branches").min(1).max(10).step(1).onFinishChange(galaxy);
gui.add(objects, "spinAngle").min(0).max(5).step(0.01).onFinishChange(galaxy);
gui.add(objects, "randomness").min(0).max(2).step(0.001).onFinishChange(galaxy);
gui
  .add(objects, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(galaxy);
gui.addColor(objects, "insideColor").onFinishChange(galaxy);
gui.addColor(objects, "outsideColor").onFinishChange(galaxy);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(size.w, size.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Control
 */
const control = new OrbitControls(camera, canvas);
control.enableDamping = true;

/**
 * Responsive Screen
 */
window.addEventListener("resize", () => {
  size.w = window.innerWidth;
  size.h = window.innerHeight;

  camera.aspect = size.w / size.h;
  camera.updateProjectionMatrix();

  renderer.setSize(size.w, size.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Zoom In and Out with Double Click
 */
document.addEventListener("dblclick", () => {
  const fullScreen =
    document.fullscreenElement || document.webkitFullscreenElement;
  if (fullScreen) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } else {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }
});

/**
 * Tick
 */
const tick = () => {
  control.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
