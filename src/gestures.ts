type Landmark = {
    x: number;
    y: number;
    z: number;
};

type Finger = {
    mcp: number;
    pip: number;
    tip: number;
};

/*
  MediaPipe landmark indices:

  Index:
  MCP = 5
  PIP = 6
  TIP = 8

  Middle:
  MCP = 9
  PIP = 10
  TIP = 12

  Ring:
  MCP = 13
  PIP = 14
  TIP = 16

  Pinky:
  MCP = 17
  PIP = 18
  TIP = 20
*/

const FINGERS: Finger[] = [
  { mcp: 5, pip: 6, tip: 8 },
  { mcp: 9, pip: 10, tip: 12 },
  { mcp: 13, pip: 14, tip: 16 },
  { mcp: 17, pip: 18, tip: 20 },
];

const angleBetween = (
    a: Landmark,
    middle: Landmark,
    b: Landmark
): number => {

    /*
        Create two vectors:
        middle -> a
        middle -> b
    */

    const vectorA = {
        x: a.x - middle.x,
        y: a.y - middle.y,
        z: a.z - middle.z,
    };

    const vectorB = {
        x: b.x - middle.x,
        y: b.y - middle.y,
        z: b.z - middle.z,
    };


    const dotProduct =
        vectorA.x * vectorB.x +
        vectorA.y * vectorB.y +
        vectorA.z * vectorB.z;


    const magnitudeA = Math.sqrt(
        vectorA.x ** 2 +
        vectorA.y ** 2 +
        vectorA.z ** 2
    );


    const magnitudeB = Math.sqrt(
        vectorB.x ** 2 +
        vectorB.y ** 2 +
        vectorB.z ** 2
    );

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    let cosine =
        dotProduct /
        (magnitudeA * magnitudeB);

    /*
        Floating point calculations can occasionally
        give something like 1.00000001.

        Math.acos only accepts values from -1 to 1.
    */

    cosine = Math.max(
        -1,
        Math.min(1, cosine)
    );


    const radians =
        Math.acos(cosine);


    return radians * (180 / Math.PI);
    };


    const isFingerExtended = (
        landmarks: Landmark[],
        finger: Finger
    ): boolean => {

    const mcp =
        landmarks[finger.mcp];

    const pip =
        landmarks[finger.pip];

    const tip =
        landmarks[finger.tip];


    const angle =
        angleBetween(
            mcp,
            pip,
            tip
        );


    return angle > 150;
    };


    export const countExtendedFingers = (
        landmarks: Landmark[]
    ): number => {

    return FINGERS.filter(
        (finger) =>
            isFingerExtended(
                landmarks,
                finger
            )
        ).length;
    };


    export const isPalmOpen = (
        landmarks: Landmark[]
    ): boolean => {

        if (landmarks.length < 21) {
            return false;
        }


        const extendedFingers =
            countExtendedFingers(landmarks);


    return extendedFingers === 4;
};
