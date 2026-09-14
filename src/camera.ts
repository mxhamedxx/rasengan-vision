export const startCamera = async (
    video: HTMLVideoElement
): Promise<MediaStream> => {

    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported.")
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
        },

        audio: false,
    });

    video.srcObject = stream;

    await video.play();

    return stream;
};

