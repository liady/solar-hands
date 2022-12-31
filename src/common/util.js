import * as THREE from "three";
import gsap from "gsap";
import * as tf from "@tensorflow/tfjs-core";
import context from "./context";

const TUNABLE_FLAG_VALUE_RANGE_MAP = {
  WEBGL_VERSION: [1, 2],
  WASM_HAS_SIMD_SUPPORT: [true, false],
  WASM_HAS_MULTITHREAD_SUPPORT: [true, false],
  WEBGL_CPU_FORWARD: [true, false],
  WEBGL_PACK: [true, false],
  WEBGL_FORCE_F16_TEXTURES: [true, false],
  WEBGL_RENDER_FLOAT32_CAPABLE: [true, false],
  WEBGL_FLUSH_THRESHOLD: [-1, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  CHECK_COMPUTATION_FOR_ERRORS: [true, false],
};

export function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

/**
 * Reset the target backend.
 *
 * @param backendName The name of the backend to be reset.
 */
async function resetBackend(backendName) {
  const ENGINE = tf.engine();
  if (!(backendName in ENGINE.registryFactory)) {
    throw new Error(`${backendName} backend is not registed.`);
  }

  if (backendName in ENGINE.registry) {
    const backendFactory = tf.findBackendFactory(backendName);
    tf.removeBackend(backendName);
    tf.registerBackend(backendName, backendFactory);
  }

  await tf.setBackend(backendName);
}

/**
 * Set environment flags.
 *
 * This is a wrapper function of `tf.env().setFlags()` to constrain users to
 * only set tunable flags (the keys of `TUNABLE_FLAG_TYPE_MAP`).
 *
 * ```js
 * const flagConfig = {
 *        WEBGL_PACK: false,
 *      };
 * await setEnvFlags(flagConfig);
 *
 * console.log(tf.env().getBool('WEBGL_PACK')); // false
 * console.log(tf.env().getBool('WEBGL_PACK_BINARY_OPERATIONS')); // false
 * ```
 *
 * @param flagConfig An object to store flag-value pairs.
 */
export async function setBackendAndEnvFlags(flagConfig, backend) {
  if (flagConfig == null) {
    return;
  } else if (typeof flagConfig !== "object") {
    throw new Error(
      `An object is expected, while a(n) ${typeof flagConfig} is found.`
    );
  }

  // Check the validation of flags and values.
  for (const flag in flagConfig) {
    // TODO: check whether flag can be set as flagConfig[flag].
    if (!(flag in TUNABLE_FLAG_VALUE_RANGE_MAP)) {
      throw new Error(`${flag} is not a tunable or valid environment flag.`);
    }
    if (TUNABLE_FLAG_VALUE_RANGE_MAP[flag].indexOf(flagConfig[flag]) === -1) {
      throw new Error(
        `${flag} value is expected to be in the range [${TUNABLE_FLAG_VALUE_RANGE_MAP[flag]}], while ${flagConfig[flag]}` +
          " is found."
      );
    }
  }

  tf.env().setFlags(flagConfig);

  const [runtime, $backend] = backend.split("-");

  if (runtime === "tfjs") {
    await resetBackend($backend);
  }
}

export function degToRadians(degs) {
  return (degs * Math.PI) / 180;
}
export function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

const vec = new THREE.Vector3(); // create once and reuse
const pos = new THREE.Vector3(); // create once and reuse
export function getVectorFromXY(x, y) {
  vec.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
  vec.unproject(context.camera);
  vec.sub(context.camera.position).normalize();
  const distance = window.targetZ - context.camera.position.z / vec.z;
  pos.copy(context.camera.position).add(vec.multiplyScalar(distance));
  return pos;
}

export function distance(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z || 0 - p2.z || 0) ** 2
  );
}

export function range(arr) {
  return Math.max(...arr) - Math.min(...arr);
}

export function findAngleBetweenPoints(a, b, deg = true) {
  return Math.atan2(b.y - a.y, b.x - a.x) * (deg ? 180 / Math.PI : 1);
}

export function findAngleBetweenVectors(a, b, deg = true) {
  return (
    (Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x)) * (deg ? 180 / Math.PI : 1)
  );
}

export function findAngleBetweenThreePoints(
  left,
  head,
  right,
  { deg = true } = {}
) {
  const a = findVectorFromTwoPoints(head, left);
  const b = findVectorFromTwoPoints(head, right);
  return findAngleBetweenVectors(a, b, deg);
}

export function findVectorFromTwoPoints(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
    z: b.z || 0 - a.z || 0,
  };
}

export function getUnitVectorBetweenTwoPoints(a, b) {
  const vector = findVectorFromTwoPoints(a, b);
  const length = Math.sqrt(
    vector.x ** 2 + vector.y ** 2 + (vector.z || 0) ** 2
  );
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: (vector.z || 0) / length,
  };
}

export function bounceAndBack(
  obj,
  deltaX,
  deltaY,
  deltaZ = 0,
  {
    delay = 0,
    baseY = obj.position.y,
    baseX = obj.position.x,
    baseZ = obj.position.z,
  } = {}
) {
  const tl = gsap.timeline({
    delay,
  });
  tl.to(obj.position, {
    y: baseY + deltaY,
    x: baseX + deltaX,
    z: baseZ + deltaZ,
    duration: 0.3,
    ease: "back",
  });
  tl.to(obj.position, {
    y: baseY,
    x: baseX,
    z: baseZ,
    duration: 0.3,
    ease: "elastic.out(.5, 0.3)",
  });
}

// const tl = gsap.timeline();
// tl.to(earth.position, {y: 9, duration: .5, ease:'back'});
// tl.to(earth.position, {y:0, duration: .5,
//         ease: "elastic.out(.5, 0.3)"});
//         const tl2 = gsap.timeline();
// tl2.to(earth2.position, {y: 9, duration: .5, ease:'back'});
// tl2.to(earth2.position, {y:0, duration: .5,
//         ease: "elastic.out(.5, 0.3)"});

//         function run(){
//           earthOrbitAngle += speed; //advance angle in degrees
//       const orbitAngleInRadians = earthOrbitAngle * Math.PI / 180; //convert to radians

//       //update position of earth...
//       earth.position.x = Math.cos(orbitAngleInRadians) * earthOrbitRadius;
//       earth.position.z = Math.sin(orbitAngleInRadians) * earthOrbitRadius;
//           requestAnimationFrame(run)
// }
