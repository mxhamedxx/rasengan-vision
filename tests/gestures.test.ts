import { describe, it, expect } from "vitest";

import {
  countExtendedFingers,
  isPalmOpen,
} from "../src/gestures";

type Landmark = {
  x: number;
  y: number;
  z: number;
};


const createLandmarks = (): Landmark[] => {

  return Array.from(
    { length: 21 },
    () => ({
      x: 0,
      y: 0,
      z: 0,
    })
  );

};


const makeFingerStraight = (
  landmarks: Landmark[],
  mcp: number,
  pip: number,
  tip: number,
  x: number
): void => {

  landmarks[mcp] = {
    x,
    y: 2,
    z: 0,
  };

  landmarks[pip] = {
    x,
    y: 1,
    z: 0,
  };

  landmarks[tip] = {
    x,
    y: 0,
    z: 0,
  };

};


const makeFingerBent = (
  landmarks: Landmark[],
  mcp: number,
  pip: number,
  tip: number,
  x: number
): void => {

  landmarks[mcp] = {
    x,
    y: 2,
    z: 0,
  };

  landmarks[pip] = {
    x,
    y: 1,
    z: 0,
  };

  landmarks[tip] = {
    x: x + 1,
    y: 1,
    z: 0,
  };

};


describe(
  "gesture recognition",
  () => {

    it(
      "detects four extended fingers as an open palm",
      () => {

        const hand =
          createLandmarks();


        makeFingerStraight(
          hand,
          5,
          6,
          8,
          1
        );

        makeFingerStraight(
          hand,
          9,
          10,
          12,
          2
        );

        makeFingerStraight(
          hand,
          13,
          14,
          16,
          3
        );

        makeFingerStraight(
          hand,
          17,
          18,
          20,
          4
        );


        expect(
          countExtendedFingers(hand)
        ).toBe(4);


        expect(
          isPalmOpen(hand)
        ).toBe(true);

      }
    );


    it(
      "does not classify a closed hand as an open palm",
      () => {

        const hand =
          createLandmarks();


        makeFingerBent(
          hand,
          5,
          6,
          8,
          1
        );

        makeFingerBent(
          hand,
          9,
          10,
          12,
          2
        );

        makeFingerBent(
          hand,
          13,
          14,
          16,
          3
        );

        makeFingerBent(
          hand,
          17,
          18,
          20,
          4
        );


        expect(
          countExtendedFingers(hand)
        ).toBe(0);


        expect(
          isPalmOpen(hand)
        ).toBe(false);

      }
    );


    it(
      "counts two straight fingers correctly",
      () => {

        const hand =
          createLandmarks();


        makeFingerStraight(
          hand,
          5,
          6,
          8,
          1
        );

        makeFingerStraight(
          hand,
          9,
          10,
          12,
          2
        );

        makeFingerBent(
          hand,
          13,
          14,
          16,
          3
        );

        makeFingerBent(
          hand,
          17,
          18,
          20,
          4
        );


        expect(
          countExtendedFingers(hand)
        ).toBe(2);


        expect(
          isPalmOpen(hand)
        ).toBe(false);

      }
    );


    it(
      "rejects incomplete landmark data",
      () => {

        const hand =
          createLandmarks()
            .slice(0, 10);


        expect(
          isPalmOpen(hand)
        ).toBe(false);

      }
    );

  }
);