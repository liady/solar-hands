import * as mpHands from "@mediapipe/hands";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import { initSolarSytem, resizeSolarSystem } from "./solarSystem/solarSystem.js";
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);
import * as handdetection from "@tensorflow-models/hand-pose-detection";
import { Camera } from "./common/camera.js";
import { HandDraw } from "./common/handDraw.js";

let detector, camera, handDraw, loading;
let detect = false;
window.targetZ = 0;

async function createDetector() {
  return handdetection.createDetector(
    handdetection.SupportedModels.MediaPipeHands,
    {
      runtime: "mediapipe",
      modelType: "full",
      maxHands: 2,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`,
    }
  );
}

async function renderResult() {
  if (!detect) return;
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(camera.video);
      };
    });
  }

  let hands = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // FPS only counts the time it takes to finish estimateHands.

    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      hands = await detector.estimateHands(camera.canvas, {
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }

  camera.drawCtx();
  handDraw.clear();

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (hands && hands.length > 0) {
    handDraw.drawResults(hands);
  }
}

async function renderPrediction() {
  await renderResult();
  requestAnimationFrame(renderPrediction);
}

async function app() {
  loading = document.getElementById("loading");
  // Gui content will change depending on which model is in the query string.
  camera = await Camera.setupCamera({ targetFPS: 60, sizeOption: "640 X 480" });
  handDraw = new HandDraw();

  detect = true;
  detector = await createDetector();

  window.addEventListener( 'resize', onWindowResize );

  loading.style.display = "none";
  renderPrediction();
}

app();
initSolarSytem();
// initStars(true);
// insertEarth(0, 0, 0);

async function onWindowResize() {
  detect = false;
  loading.style.display = "flex";
  camera = await Camera.setupCamera({ targetFPS: 60, sizeOption: "640 X 480" });
  handDraw = new HandDraw();
  resizeSolarSystem();
  loading.style.display = "none";
  detect = true;
}
