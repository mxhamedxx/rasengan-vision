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

export const smoothPalmAnchor = (
    previous: PalmAnchor | undefined,
    current: PalmAnchor,
    smoothing: number = 0.22
): PalmAnchor => {

    if (!previous) {
        return current;
    }

    const lerp = (
        start: number,
        end: number,
        amount: number
    ): number => {

        return start +
            (end - start) * amount;
    };

    return {
        center: {
            x: lerp(
                previous.center.x,
                current.center.x,
                smoothing
            ),

            y: lerp(
                previous.center.y,
                current.center.y,
                smoothing
            ),
        },

        radius: lerp(
            previous.radius,
            current.radius,
            smoothing
        ),
    };
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

const psuedoRandom = (
    seed: number
): number => {

    const value =
        Math.sin(seed * 12.9898) *
        43758.5453;

    return value -
        Math.floor(value);
};

const drawEnergyStreak = (
    context: CanvasRenderingContext2D,
    radius: number,
    angle: number,
    offset: number,
    alpha: number
): void => {
    
    context.save();

    context.rotate(angle);

    context.beginPath();

    context.arc(
        0,
        0,
        radius + offset,
        -0.65,
        0.65
    );

    context.lineWidth =
        Math.max(
            1,
            radius * 0.035
        );

    context.strokeStyle =
    `rgba(
      186,
      230,
      253,
      ${alpha}
    )`;


    context.shadowBlur =
        radius * 0.18;

    context.shadowColor =
        "rgba(125, 211, 252, 0.9)";


    context.stroke();

    context.restore();
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
    
    const rotationSpeed =
        0.7 +
        power * 2.4;

    const turbulence =
        0.15 +
        power * 0.35;

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
        Math.sin(
            t *
            (4 + power * 5)
        ) *
        (
            0.025 +
            power * 0.055
        );

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
        0.12,
        "rgba(240, 249, 255, 1)"
    );

    core.addColorStop(
        0.35,
        "rgba(186, 230, 253, 1)"
    );

    core.addColorStop(
        0.72,
        "rgba(56, 189, 248, 0.95)"
    );

    core.addColorStop(
        1,
        "rgba(3, 105, 161, 0.15)"
    );

    context.shadowBlur =
        radius *
        (
            0.3 +
            power * 0.4
        );

    context.shadowColor =
        "rgba(125, 211, 252, 0.95)";

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

    context.shadowBlur = 0;
    /* Rotating Energy Rings */
    context.translate(
        center.x,
        center.y
    );

    const ringCount =
        3 +
        Math.round(
            power * 3
        );

    for (
        let ring = 0;
        ring < ringCount;
        ring++
    ) {

        context.save();

        const direction =
            ring % 2 === 0
                ? 1
                : -1;
        
        const ringSpeed =
            rotationSpeed *
            (
                0.55 +
                ring * 0.14
            );

        context.rotate(
            t *
                ringSpeed *
                direction +
                ring * 0.8
        );

        const wobble =
            Math.sin(
                t * 3 +
                ring * 1.7
            ) *
            radius *
            turbulence *
            0.12;

        context.beginPath();

        context.ellipse(
            0,
            wobble,
            radius *
                (
                    0.68 +
                    ring * 0.55
                ),
            radius *
                (
                    0.22 + 
                    ring * 0.025
                ),
            ring * 0.22,
            0,
            Math.PI * 2
        );

        context.lineWidth =
            1.3 +
            power * 1.5;

        context.strokeStyle =
            `rgba(
                186,
                230,
                253,
                ${
                    0.3 +
                    power * 0.45 -
                    ring * 0.035
                }
            )`;
        
        context.stroke();

        context.restore();
    }

    /* Curved Streaks */
    const streakCount =
        Math.round(
            5 +
            power * 10
        );
    
    for (
        let i = 0;
        i < streakCount;
        i++
    ) {
        const random =
            psuedoRandom(
                i * 7.13
            );
        
        const angle =
            t *
                rotationSpeed *
                (
                    0.7 +
                    random * 0.9
                ) +
            
            (
                i /
                streakCount
            ) *
                Math.PI *
                2;
        
        const offset =
            (
                psuedoRandom(
                    i * 11.41
                ) -
                0.5
            ) *
            radius *
            0.4;

        drawEnergyStreak(
            context,
            radius *
                (
                    0.65 +
                    random * 0.35
                ),
            angle,
            offset,
            0.12 +
                power * 0.5
        );
    }

    /* Orbitting Particles */

    const particleCount =
        Math.round(
            6 +
            power * 42
        );

    for (
        let i = 0;
        i < particleCount;
        i++
    ) {
        const randomA =
            psuedoRandom(
                i * 17.3
            );

        const randomB =
            psuedoRandom(
                i * 29.1
            );

        const baseAngle =
            (i / particleCount) *
            Math.PI *
            2;

        const speed =
            rotationSpeed *
            (
                0.55 +
                randomA * 0.9
            )
                
        const angle =
            baseAngle + 
            t * speed;

        const wobble =
            Math.sin(
                t *
                (
                    2 +
                    randomB * 5
                ) +
                i
            ) *
            radius *
            turbulence;

        const orbitRadius =
            radius *
                (
                    0.65 +
                    randomA * 0.65
                ) +
            wobble;

        const x =
            Math.cos(angle) *
            orbitRadius;

        const y =
            Math.sin(angle) *
            orbitRadius *
            (
                0.55 +
                randomB * 0.4
            );

        const particleSize =
            0.8 +
            randomB *
            (
                1.8 +
                power * 1.5
            );

        context.beginPath();

        context.arc(
            x,
            y,
            particleSize,
            0,
            Math.PI * 2,
        );

        context.fillStyle =
            randomA > 0.8
                ? "rgba(255,255,255,0.95)"
                : `rgba(
                        125,
                        211,
                        252,
                        ${
                            0.25 +
                            power * 0.65
                        }
                    )`;


        context.fill();
    }

    if (power > 0.7) {

        const sparkPower =
            (
                power - 0.7
            ) / 0.3;

        const sparkCount =
            Math.round(
                4 +
                sparkPower * 10
            );

        for (
            let i = 0;
            i < sparkCount;
            i++
        ) {
            const random =
                psuedoRandom(
                    i * 41.7
                );

            const angle =
                t * 
                (
                    1.5 +
                    random
                ) +
                random *
                Math.PI *
                8;
            
            const pulseDistance =
                (
                    Math.sin(
                        t *
                        (
                            4 +
                            random * 4
                        ) +
                        i
                    ) *
                    0.5 +
                    0.5
                );

            const startRadius =
                radius *
                (
                    0.8 +
                    pulseDistance * 0.3
                );

            const endRadius =
                startRadius +
                radius *
                (
                    0.15 +
                    random * 0.35
                );

            const startX =
                Math.cos(angle) *
                startRadius;

            const startY =
                Math.sin(angle) *
                startRadius;

            const endX =
                Math.cos(angle) *
                endRadius;
            
            const endY =
                Math.sin(angle) *
                endRadius;
            
            context.beginPath();

            context.moveTo(
                startX,
                startY,
            );

            context.lineTo(
                endX,
                endY
            );

            context.lineWidth =
                1 + 
                random * 1.5;

            context.strokeStyle =
                `rgba(
                    186,
                    230,
                    253,
                    ${
                        sparkPower *
                        (
                            0.25 +
                            random * 0.55
                        )
                    }
                    )`;

            context.stroke();
        }
    }

    context.beginPath();

    context.arc(
        0,
        0,
        radius *
            (
                0.1 +
                power * 0.08
            ),
        0,
        Math.PI * 2
    );

    context.fillStyle =
        `rgba(
        255,
        255,
        255,
        ${
            0.6 +
            power * 0.4
        }
        )`;

    context.shadowBlur =
        radius * 0.3;

    context.shadowColor =
        "white";

    context.fill();

    context.shadowBlur = 0;

    context.restore();
};
    

