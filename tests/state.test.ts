import { describe, it, expect } from "vitest";

import {
  createRasenganState,
  updateRasenganState,
} from "../src/state";

describe(
  "Rasengan state machine",
  () => {

    it(
      "starts in IDLE",
      () => {

        const state =
          createRasenganState(0);


        expect(
          state.phase
        ).toBe("IDLE");


        expect(
          state.charge
        ).toBe(0);

      }
    );


    it(
      "moves from IDLE to CHARGING when the palm opens",
      () => {

        const initial =
          createRasenganState(0);


        const next =
          updateRasenganState(
            initial,
            true,
            16
          );


        expect(
          next.phase
        ).toBe("CHARGING");

      }
    );


    it(
      "increases charge while the palm remains open",
      () => {

        let state =
          createRasenganState(0);


        state =
          updateRasenganState(
            state,
            true,
            0
          );


        state =
          updateRasenganState(
            state,
            true,
            100
          );


        expect(
          state.phase
        ).toBe("CHARGING");


        expect(
          state.charge
        ).toBeCloseTo(
          0.1,
          2
        );

      }
    );


    it(
      "ignores a brief tracking failure",
      () => {

        let state =
          createRasenganState(0);


        state =
          updateRasenganState(
            state,
            true,
            0
          );


        state =
          updateRasenganState(
            state,
            true,
            100
          );


        /*
          Palm appears closed only 100ms
          after it was last seen open.

          Grace period is 160ms.
        */

        state =
          updateRasenganState(
            state,
            false,
            200
          );


        expect(
          state.phase
        ).toBe("CHARGING");

      }
    );


    it(
      "starts releasing after the grace period expires",
      () => {

        let state =
          createRasenganState(0);


        state =
          updateRasenganState(
            state,
            true,
            0
          );


        state =
          updateRasenganState(
            state,
            true,
            100
          );


        state =
          updateRasenganState(
            state,
            false,
            200
          );


        /*
          Last open frame was at 100ms.

          At 300ms:
          200ms has passed,
          which exceeds the 160ms grace period.
        */

        state =
          updateRasenganState(
            state,
            false,
            300
          );


        expect(
          state.phase
        ).toBe("RELEASING");

      }
    );


    it(
      "returns to IDLE after releasing completely",
      () => {

        let state =
          createRasenganState(0);


        state.phase =
          "RELEASING";

        state.charge =
          0.5;

        state.lastUpdatedAt =
          0;


        for (
          let time = 100;
          time <= 500;
          time += 100
        ) {

          state =
            updateRasenganState(
              state,
              false,
              time
            );

        }


        expect(
          state.phase
        ).toBe("IDLE");


        expect(
          state.charge
        ).toBe(0);

      }
    );


    it(
      "resumes charging if the palm reopens during release",
      () => {

        let state =
          createRasenganState(0);


        state.phase =
          "RELEASING";

        state.charge =
          0.4;


        state =
          updateRasenganState(
            state,
            true,
            100
          );


        expect(
          state.phase
        ).toBe("CHARGING");


        expect(
          state.charge
        ).toBeCloseTo(
          0.4,
          2
        );

      }
    );

  }
);