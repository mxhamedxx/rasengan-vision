type Landmark = {
    x: number;
    y: number;
    z: number;
};

const HAND_CONNECTIONS: [number, number][] = [
    // Thumb
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],

    // Index finger
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],

    // Middle finger
    [5, 9],
    [9, 10],
    [10, 11],
    [11, 12],

    // Ring finger
    [9, 13],
    [13, 14],
    [14, 15],
    [15, 16],

    // Pinky
    [13, 17],
    [17, 18],
    [18, 19],
    [19, 20],

    // Bottom of palm
    [17, 0],
];

type Point = {
    x: number;
    y: number;
};

export const landmarkToCanvas = (
    landmark: Landmark,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
): Point => {

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    /*
        Our webcam uses object-fit: cover, this means the video might be
        cropped slightly depending on the browser window.

        so we calculate the same scale here so that the landmarks line
        up correctly.
    */

    const scale = Math.max(
        canvasWidth / videoWidth,
        canvasHeight / videoHeight
    );

    const renderedWidth =
        videoWidth * scale;

    const renderedHeight =
        videoHeight * scale;

    const offsetX =
        (canvasWidth - renderedWidth) / 2;

    const offsetY = 
        (canvasHeight - renderedHeight) / 2;

    const normalX =
        offsetX + landmark.x * renderedWidth;

    const normalY =
        offsetY + landmark.y * renderedHeight;

    /*
        Our webcam is mirrored with:

        transform: scaleX(-1)

        MediaPipe coordinates are not mirrored on the canvas,
        so we flip X ourselves.
    */
    
    const mirroredX = 
        canvasWidth - normalX;
    
    return {
        x: mirroredX,
        y: normalY,
    };
};

export const clearCanvas = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
): void => {

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
    );
};

export const drawHandSkeleton = (
    context: CanvasRenderingContext2D,
    landmarks: Landmark[],
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
): void => {

    const points =
        landmarks.map((landmark) =>
            landmarkToCanvas(
                landmark,
                video,
                canvas
            )
        );
    
    /* Drawing connections */
    context.lineWidth = 3;
    context.strokeStyle = "#38bdf8";

    context.beginPath();

    for (const [startIndex, endIndex] of HAND_CONNECTIONS) {

        const start = points[startIndex];
        const end = points[endIndex];

        context.moveTo(
            start.x,
            start.y
        );

        context.lineTo(
            end.x,
            end.y
        );
    }

    context.stroke()

    /* Drawing joints */
    for (const point of points) {

        context.beginPath();

        context.arc(
            point.x,
            point.y,
            5,
            0,
            Math.PI * 2
        );

        context.fillStyle = "#ffffff"

        context.fill();
    }
};