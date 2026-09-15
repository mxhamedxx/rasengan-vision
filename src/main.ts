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

import {
  isPalmOpen,
  countExtendedFingers,
} from "./gestures";

import {
  drawRasengan,
  getPalmAnchor,
  smoothPalmAnchor,
} from "./rasengan";

import {
  createRasenganState,
  updateRasenganState,
} from "./state";

import type {
  RasenganState,
} from "./state";

import type {
  PalmAnchor,
} from "./rasengan";


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

    <div class="title-row">
      <div>
        <h1>RASENGAN VISION</h1>
        <p id="status">Starting...</p>
      </div>

      <button
        id="skeleton-toggle"
        type="button"
      >
        Skeleton: ON
      </button>
      </div>

      <p id="power-status">
        Left: IDLE 0% | Right: IDLE 0%
      </p>

    </div>

  </main>
`;

const webcam =
  document.querySelector<HTMLVideoElement>("#webcam")!;

const canvas =
  document.querySelector<HTMLCanvasElement>("#overlay")!;

const skeletonToggle =
  document.querySelector<HTMLButtonElement>(
    "#skeleton-toggle"
  )!;

let showSkeleton = true;

skeletonToggle.addEventListener(
  "click",
  () => {

    showSkeleton =
      !showSkeleton;

    skeletonToggle.textContent =
      `Skeleton: ${
        showSkeleton
          ? "ON"
          : "OFF"
      }`;
  }
)

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key.toLowerCase() === "s"
    ) {

      showSkeleton =
        !showSkeleton;

      skeletonToggle.textContent =
        `Skeleton: ${
          showSkeleton
            ? "ON"
            : "OFF"
        }`;
    }
  }
);

const context =
  canvas.getContext("2d");

if (!context) {
  throw new Error(
    "Could not create canvas context."
  )
}

const statusText =
  document.querySelector<HTMLParagraphElement>("#status")!;

const powerStatusText =
  document.querySelector<HTMLParagraphElement>(
    "#power-status"
  )!;

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

type HandId =
  | "Left"
  | "Right";

const HAND_IDS: HandId[] = [
  "Left",
  "Right",
];

const rasenganStates:
  Record<HandId, RasenganState> = {

    Left:
      createRasenganState(),

    Right:
      createRasenganState(),

  };

const lastPalmAnchors:
  Partial<Record<HandId, PalmAnchor>> = {};

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
        
        const currentTime = 
          performance.now();

        /*
          Assume neither hand is open.
          If we detect one below we will change its value to true
        */
        const palmOpenThisFrame:
          Record<HandId, boolean> = {

            Left: false,
            Right: false,

          };

        /* Process Detected Hands */
        results.landmarks.forEach(
          (hand, index) => {

            if (showSkeleton) {
              drawHandSkeleton(
                context,
                hand,
                webcam,
                canvas
              );
            }

            const handedness =
              results.handedness[index]?.[0]
                ?.categoryName;

            /*
              MediaPipe returns either "Left" or "Right"
            */
            if (
              handedness !== "Left" &&
              handedness !== "Right"
            ) {
              return;
            }

            const handId: HandId =
              handedness;

            const palmOpen =
              isPalmOpen(hand);
            
            palmOpenThisFrame[handId] =
              palmOpen;

            /*
              Remember the most recent position of this palm
            */
            const palm =
              getPalmAnchor(
                hand,
                webcam,
                canvas
              );

            if (palm) {
              lastPalmAnchors[handId] =
                smoothPalmAnchor(
                  lastPalmAnchors[handId],
                  palm
                );
            }
          }
        );

        for (const handId of HAND_IDS) {

          rasenganStates[handId] =
            updateRasenganState(
              rasenganStates[handId],
              palmOpenThisFrame[handId],
              currentTime
            );
          
          const state =
            rasenganStates[handId];

          const palm =
            lastPalmAnchors[handId];

          /* No point drawing if we have never seen this hand before */

          if (!palm) {
            continue;
          }

          /* Idle = nothing to draw */
          if (
            state.phase === "IDLE" ||
            state.charge <= 0
          ) {
            delete lastPalmAnchors[handId];
            continue;
          }
          
          /*
            Ease-out curve. Makes the orb grow quickly at the start
            then slow down near full size.
          */
          const easedCharge =
            1 -
            Math.pow(
              1 - state.charge,
              3
            );

          const sizeScale =
            0.2 +
            easedCharge * 0.8;
          
          drawRasengan(
            context,
            palm.center,
            palm.radius * 
              sizeScale,
            currentTime,
            state.charge
          );

          const left =
          rasenganStates.Left;

          const right =
            rasenganStates.Right;

          powerStatusText.textContent =
            `Left: ${left.phase} ${Math.round(
              left.charge * 100
            )}% | ` +
            `Right: ${right.phase} ${Math.round(
              right.charge * 100
            )}%`;
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

          const gestureDescriptions =
            results.landmarks.map(
              (hand, index) => {

                const handName =
                  handNames[index] ?? "Hand";

                const fingerCount =
                  countExtendedFingers(hand);

                const palmOpen =
                  isPalmOpen(hand);

                return palmOpen
                  ? `${handName}: OPEN PALM ✋`
                  : `${handName}: ${fingerCount}/4 fingers`;
              }
            );

            statusText.textContent =
              gestureDescriptions.join(" | ");

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