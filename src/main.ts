import "./style.css";

import { startCamera } from "./camera";

import {
  createHandTracker,
  detectHands,
} from "./handTracker";

import {
  clearCanvas,
  drawHandSkeleton,
} from "./renderer";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main class="stage">

    <video
      id="webcam"
      autoplay
      playsinline
      muted
    ></video>

    <canvas id="overlay"></canvas>

    <div class="hud">
      <h1>RASENGAN VISION</h1>
      <p id="status">Starting...</p>
    </div>

  </main>
`;

const webcam =
  document.querySelector<HTMLVideoElement>("#webcam")!;

const canvas =
  document.querySelector<HTMLCanvasElement>("#overlay")!;

const context =
  canvas.getContext("2d");

if (!context) {
  throw new Error(
    "Could not create canvas context."
  )
}

const statusText =
  document.querySelector<HTMLParagraphElement>("#status")!;

const resizeCanvas= (): void => {
  canvas.width =
    canvas.clientWidth;

  canvas.height =
    canvas.clientHeight;
};

resizeCanvas();

window.addEventListener(
  "resize",
  resizeCanvas
);

const initialize = async (): Promise<void> => {

  try {

    /* Starting webcam */
    statusText.textContent = "Requesting camera permission...";
    await startCamera(webcam);
    statusText.textContent = "camera ready ✅";

    /* Loading MediaPipe */
    statusText.textContent = "Loading hand tracker...";
    const handTracker = await createHandTracker()
    statusText.textContent = "Hand tracker ready 🟢"

    let lastVideoTime = -1;
    let hasLoggedLandmarks = false;

    /* Detection Loop */
    const detectLoop = (): void => {

      if (
        webcam.readyState >= 2 &&
        webcam.currentTime !== lastVideoTime
      ) {

        lastVideoTime = webcam.currentTime;

        const results =
          detectHands(handTracker, webcam);

        clearCanvas(
          context,
          canvas
        );

        for (const hand of results.landmarks) {

          drawHandSkeleton(
            context,
            hand,
            webcam,
            canvas
          );
        }

        const numberOfHands =
          results.landmarks.length;

        // if no hands showing
        if (numberOfHands === 0) {
          statusText.textContent =
            "show me your hand lil bro";

          hasLoggedLandmarks = false;
        }
        // hand detected
        else {
          const handNames =
            results.handedness.map(
              (hand) =>
                hand[0]?.categoryName ?? "Hand"
            );

            statusText.textContent =
              `${numberOfHands} hand${
                numberOfHands > 1 ? "s" : ""
              } detected: ${handNames.join(", ")}`;

          // Print landmarks once when a hand appears
          if (!hasLoggedLandmarks) {

            console.log(
              "Hand landmarks:",
              results.landmarks
            );

            console.log(
              "Handedness:",
              results.handedness
            );

            hasLoggedLandmarks = true;
          }


        }

      }
      requestAnimationFrame(detectLoop);
    };

    detectLoop();

  } catch(error) {

    console.error(error);

    statusText.textContent =
      "Something went wrong. Check the console.";
  }

};

initialize();