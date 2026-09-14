import { landmarkToCanvas } from "./renderer";

type Landmark = {
  x: number;
  y: number;
  z: number;
};


type Point = {
  x: number;
  y: number;
};

export type PalmAnchor = {
  center: Point;
  radius: number;
};

const distance = (
    a: Point,
    b: Point
): number => {

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    return Math.sqrt(
        dx * dx + dy * dy
    );
};

export const getPalmAnchor = (
    landmarks: Landmark[],
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
): PalmAnchor | null => {

    if (landmarks.length < 21) {
        return null;
    }

    /*
        These landmarks roughly define the palm.

        0 = wrist
        5 = index base
        9 = middle base
        13 = ring base
        17 = pinky base
    */

    const palmIndices = [
        0,
        5,
        9,
        13,
        17,
    ]

    const palmPoints =
        palmIndices.map(
            (index) =>
                landmarkToCanvas(
                    landmarks[index],
                    video,
                    canvas
                )
        );

    const center = palmPoints.reduce(
        (sum, point) => ({
            x: sum.x + point.x,
            y: sum.y + point.y,
        }),
        { x: 0, y: 0 }
    );

    center.x /= palmPoints.length;
    center.y /= palmPoints.length;

    /*
        Use the width of the palm to decide how large the Rasengan
        should be, this means the closer the hand is to the camera,
        the larger the palm so the larger the rasengan
    */

    const indexBase =
        landmarkToCanvas(
            landmarks[5],
            video,
            canvas
        );

    const pinkyBase =
        landmarkToCanvas(
            landmarks[17],
            video,
            canvas
        );

    const palmWidth =
        distance(
            indexBase,
            pinkyBase
        );

    const radius =
        Math.max(
            28,
            Math.min(
                100,
                palmWidth * 0.72
            )
        );

    return {
        center,
        radius,
    };
};

export const drawRasengan = (
    context: CanvasRenderingContext2D,
    center: Point,
    radius: number,
    time: number,
    strength: number = 1
): void => {

    const t =
        time / 1000;
    
    const power = 
        Math.max(
            0,
            Math.min(1, strength)
        );
    
    if (power <= 0) {
        return;
    }

    context.save();

    context.globalAlpha =
        0.15 +
        power * 0.85;

    /*
        "lighter" makes overlapping bright shapes add thier light together.
        so this is going to be really nice for making the rasengan glowy and shiny.
    */

    context.globalCompositeOperation = "lighter";

    /* Outer Glow */
    const outerGlow = 
        context.createRadialGradient(
            center.x,
            center.y,
            radius * 0.1,
            center.x,
            center.y,
            radius * 1.6,
        );

    outerGlow.addColorStop(
        0,
        "rgba(255, 255, 255, 0.95)"
    );

    outerGlow.addColorStop(
        0.25,
        "rgba(56, 189, 248, 0.85)"
    );

    outerGlow.addColorStop(
        0.65,
        "rgba(14, 165, 233, 0.35)"
    );

    outerGlow.addColorStop(
        1,
        "rgba(2, 132, 199, 0)"
    );

    context.fillStyle =
        outerGlow;

    context.beginPath();

    context.arc(
        center.x,
        center.y,
        radius * 1.6,
        0,
        Math.PI * 2
    );

    context.fill();

    /* Energy Core */
    const pulse =
        1 + 
        Math.sin(t * 5) * 0.06;

    const coreRadius = 
        radius * 0.58 * pulse;

    const core = 
        context.createRadialGradient(
            center.x - radius * 0.12,
            center.y - radius * 0.12,
            0,
            center.x,
            center.y,
            coreRadius
        );

    core.addColorStop(
        0,
        "rgba(255, 255, 255, 1)"
    );

    core.addColorStop(
        0.25,
        "rgba(186, 230, 253, 1)"
    );

    core.addColorStop(
        0.7,
        "rgba(56, 189, 248, 0.9)"
    );

    core.addColorStop(
        1,
        "rgba(2, 132, 199, 0.25)"
    );


    context.fillStyle =
        core;


    context.beginPath();

    context.arc(
        center.x,
        center.y,
        coreRadius,
        0,
        Math.PI * 2
    );

    context.fill();

    /* Rotating Energy Rings */
    context.translate(
        center.x,
        center.y
    );

    for (
        let ring = 0;
        ring < 4;
        ring++
    ) {

        context.save();

        const direction =
            ring % 2 === 0
                ? 1
                : -1;

        context.rotate(
            t *
                (0.9 + ring * 0.18) *
                direction +
                ring
        );

        context.beginPath();

        context.ellipse(
            0,
            0,
            radius *
                (0.72 + ring * 0.07),
            radius *
                (0.28 + ring * 0.035),
            0,
            0,
            Math.PI * 2
        );

        context.lineWidth =
            2.2;

        context.strokeStyle =
            `rgba(
                186,
                230,
                253,
                ${0.75 - ring * 0.1}
            )`;
        
        context.stroke();

        context.restore();
    }

    /* Orbitting Particles */

    const particleCount =
        Math.max(
            4,
            Math.round(
                24 * power
            )
        );

    for (
        let i = 0;
        i < particleCount;
        i++
    ) {
        const baseAngle =
            (i / particleCount) *
            Math.PI *
            2;

        const speed =
            1.3 +
            (i % 4) * 0.15;

        const angle =
            baseAngle + 
            t * speed;

        const wobble =
            Math.sin(
                t * 3 + i
            ) * radius * 0.12;

        const orbitRadius =
            radius *
                (0.72 +
                    (i % 5) * 0.07) +
            wobble;

        const x =
            Math.cos(angle) *
            orbitRadius;

        const y =
            Math.sin(angle) *
            orbitRadius *
            0.72;

        const particleSize =
            1.5 +
            (i % 3);

        context.beginPath();

        context.arc(
            x,
            y,
            particleSize,
            0,
            Math.PI * 2,
        );

        context.fillStyle =
            i % 3 === 0
                ? "rgba(255,255,255,0.95)"
                : "rgba(125,211,252,0.8)";
                
        context.fill();
    }

    context.restore();
};
    

