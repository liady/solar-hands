import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./listeners";
import context from "../common/context";
import CameraControls from "camera-controls";
import { degToRadians } from "../common/util";

CameraControls.install({ THREE: THREE });

THREE.Cache.enabled = true;

export function initSolarSytem() {
  const canvas = document.querySelector("#three");
  context.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  canvas.width = 1920;
  canvas.height = 1080;
  context.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  context.renderer.setPixelRatio(window.devicePixelRatio);

  context.scene = new THREE.Scene();
  context.camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    1,
    1000
  );
  context.camera.position.set(0, 0, 50);
  context.camera.updateProjectionMatrix();
  context.camera.lookAt(0, 0, 0);

  const cameraControls = new CameraControls(
    context.camera,
    context.renderer.domElement
  );
  cameraControls.maxDistance = 100;
  cameraControls.minDistance = 10;
  context.cameraControls = cameraControls;

  // const axesHelper = new THREE.AxesHelper(50);
  // context.scene.add(axesHelper);

  // const controls = new OrbitControls(
  //   context.camera,
  //   context.renderer.domElement
  // );
  // controls.enablePan = false;
  // controls.enableZoom = true;
  // controls.minDistance = 20;
  // controls.maxDistance = 100;
  // controls.rotateSpeed = -1;
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.25;
  // controls.minPolarAngle = Math.PI / 2;
  // controls.maxPolarAngle = Math.PI / 2;

  // context.controls = controls;
  // new CameraControl(context.renderer, context.camera);
  animate();
}

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  context.cameraControls.update(delta);
  if (context.rotation) {
    Object.entries(context.rotation).forEach(([name, data]) => {
      if (data.speed) {
        context.scene.getObjectByName(name).rotation.y += data.speed;
      }
    });
  }
  if (context.orbit) {
    Object.entries(context.orbit).forEach(([name, data]) => {
      const angleSpeed = data.speed;
      const radius = data.radius;
      const element = context.scene.getObjectByName(name);
      const orbitAngleInRadians = degToRadians(data.orbitAngle);
      const xcoeff = data.xcoeff || 1;
      const zcoeff = data.zcoeff || 1;
      element.position.x = Math.cos(orbitAngleInRadians) * radius * xcoeff;
      element.position.z = Math.sin(orbitAngleInRadians) * radius * zcoeff;
      data.orbitAngle = (data.orbitAngle + angleSpeed) % 360;
    });
  }

  context.renderer.render(context.scene, context.camera);
  requestAnimationFrame(animate);
}
