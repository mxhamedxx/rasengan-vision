export type RasenganPhase =
    | "IDLE"
    | "CHARGING"
    | "ACTIVE"
    | "RELEASING";

export type RasenganState = {
    phase: RasenganPhase;

    /*
        Current energy level:

        0 = empty
        1 = fully charged
    */
    charge: number;

    /*
        Used to calculate how much time
        passed since the previous frame.
    */
    lastUpdatedAt: number;

    /*
        helps us ignore tiny tracking mistakes
    */
    lastOpenAt: number | null;
};

const CHARGE_DURATION_MS = 1000;

const RELEASE_DURATION_MS = 400;

/*
    If MediaPipe briefly says the palm is closed for less than this
    amount of time we ignore it
*/
const GESTURE_GRACE_MS = 160;

export const createRasenganState = (
    now: number = performance.now()
): RasenganState => ({
    phase: "IDLE",
    charge: 0,
    lastUpdatedAt: now,
    lastOpenAt: null,
});

export const updateRasenganState = (
    state: RasenganState,
    palmOpen: boolean,
    now: number
): RasenganState => {

    /*
        Calculate time since previous update.
        We cap it at 100ms so switching tabs doesn't instantly
        charge/discharge the Rasengan.
    */

    const deltaTime = Math.max(
        0,
        Math.min(
            now - state.lastUpdatedAt,
            100
        )
    );

    const lastOpenAt =
        palmOpen
            ? now
            : state.lastOpenAt;

    /*
        Consider the palm open during a very short detection failure.
    */

    const gestureStillOpen =
        palmOpen ||
        (
            lastOpenAt !== null &&
            now - lastOpenAt <=
                GESTURE_GRACE_MS
        );

    let phase =
        state.phase;

    let charge =
        state.charge;

    switch (state.phase) {
        /* IDLE */
        case "IDLE":    {
            if (palmOpen) {
                phase = "CHARGING";
            }
            break;
        }

        /* CHARGING */
        case "CHARGING":    {
            if (gestureStillOpen) {

                charge = Math.min(
                    1,
                    charge +
                        deltaTime /
                            CHARGE_DURATION_MS
                );

                if (charge >= 1) {
                    phase = "ACTIVE";
                }
            }
            else {
                phase = "RELEASING";
            }
            break;
        }

        /* ACTIVE */
        case "ACTIVE": {

            charge = 1;

            if (!gestureStillOpen) {
                phase = "RELEASING";
            }
            break;
        }

        /* RELEASING */
        case "RELEASING": {

            /*
                If the user opens their palm again while the energy is
                dissapearing, start charging from the remaining energy
                instead of zero.
            */

            if (palmOpen) {

                phase =
                    charge >= 1
                        ? "ACTIVE"
                        : "CHARGING";
            }

            else {

                charge = Math.max(
                    0,
                    charge -
                        deltaTime /
                            RELEASE_DURATION_MS
                );

                if (charge <= 0) {
                    phase = "IDLE";
                }
            }
            break;
        }

    }
    return {
        phase,
        charge,
        lastUpdatedAt: now,

        lastOpenAt:
            phase === "IDLE"
                ? null
                : lastOpenAt,
    };
};