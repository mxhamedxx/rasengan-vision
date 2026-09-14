import "./style.css";
import { startCamera } from "./camera";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main class="stage">

    <video
      id="webcam"
      autoplay
      playsinline
      muted
    ></video>

    <div class="hud">
      <h1>RASENGAN VISION</h1>
      <p id="status">Starting...</p>
    </div>
  </main>
`;

const webcam =
  document.querySelector<HTMLVideoElement>("#webcam")!;

const status =
  document.querySelector<HTMLParagraphElement>("#status")!;

const initialize = async (): Promise<void> => {

  try {

    status.textContent = "Requesting camera permission...";

    await startCamera(webcam);

    status.textContent = "camera ready ✅";

  } catch(error) {

    console.error(error);

    status.textContent =
      "Camera unavailable. Check browser permissions."
  }

};

initialize();