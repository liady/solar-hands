let videoAdjustedWidth, videoAdjustedHeight;
let inputVideoAdjustedWidth, inputVideoAdjustedHeight, inputToAdjustedVideoRatio;

export class Camera {
  constructor() {
    this.video = document.getElementById("video");
    this.canvas = document.getElementById("output");
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   * @param cameraParam From app `STATE.camera`.
   */
  static async setupCamera(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const { targetFPS } = cameraParam;
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Get maximum possible resolution
        width: { ideal: 4096 },
        height: { ideal: 2160 },
        frameRate: {
          ideal: targetFPS,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    videoAdjustedWidth = window.innerWidth;
    videoAdjustedHeight = window.innerHeight;
    const videoAdjustedAspectRatio = videoAdjustedWidth / videoAdjustedHeight;

    camera.canvas.width = videoAdjustedWidth;
    camera.canvas.height = videoAdjustedHeight;
    const canvasContainer = document.querySelector(".canvas-wrapper");
    canvasContainer.style = `width: ${videoAdjustedWidth}px; height: ${videoAdjustedHeight}px`;

    // Scale input video drawing on canvas to fit screen
    if (videoAdjustedAspectRatio >= videoAspectRatio) {
      inputVideoAdjustedWidth = videoAdjustedWidth;
      inputVideoAdjustedHeight = inputVideoAdjustedWidth / videoAspectRatio;
    } else {
      inputVideoAdjustedHeight = videoAdjustedHeight;
      inputVideoAdjustedWidth = inputVideoAdjustedHeight * videoAspectRatio;
    }
    inputToAdjustedVideoRatio = videoWidth / inputVideoAdjustedWidth;
    
    return camera;
  }

  drawCtx() {
    this.ctx.drawImage(
      this.video,
      ((inputVideoAdjustedWidth - videoAdjustedWidth) / 2) * inputToAdjustedVideoRatio,
      ((inputVideoAdjustedHeight - videoAdjustedHeight) / 2) * inputToAdjustedVideoRatio,
      videoAdjustedWidth * inputToAdjustedVideoRatio,
      videoAdjustedHeight * inputToAdjustedVideoRatio,
      0,
      0,
      videoAdjustedWidth,
      videoAdjustedHeight
    );
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, videoAdjustedWidth, videoAdjustedHeight);
  }
}
