import {
    FilesetResolver,
    HandLandmarker,
} from "@mediapipe/tasks-vision";

import type {
    HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

const WASM_PATH =
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

const MODEL_PATH =
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export const createHandTracker =
    async (): Promise<HandLandmarker> => {

        const vision =
            await FilesetResolver.forVisionTasks(WASM_PATH);

        const handLandmarker =
            await HandLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath: MODEL_PATH,
                    },

                    runningMode: "VIDEO",

                    numHands: 2,

                    minHandDetectionConfidence: 0.5,
                    minHandPresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                }
            );

            return handLandmarker;
    };

export const detectHands = (
    handLandmarker: HandLandmarker,
    video: HTMLVideoElement
):  HandLandmarkerResult => {

    return handLandmarker.detectForVideo(
        video,
        performance.now()
    );
};
