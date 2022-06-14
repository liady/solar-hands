import { findAngleBetweenPoints, range } from "../common/util";
import events from "../common/events";

const orbitCandidate = { right: false, left: false };
export function detectOrbit(hand, handness) {
  const fingers = ["index_finger", "middle_finger", "ring_finger"];
  const startOrbit = fingers.every((fingerName) =>
    isStraightAndVertical(hand, handness, fingerName)
  );
  if (startOrbit) {
    const prev = orbitCandidate[handness];
    if (prev) {
      const current = hand.index_finger_tip;
      const deltaX = current.x - prev.x;
      const deltaY = current.y - prev.y;
      const sensitivity = 2;
      if (Math.abs(deltaX) > sensitivity && Math.abs(deltaY) > sensitivity) {
        events.publish("orbit", {
          hand,
          handness,
          deltaX,
          deltaY,
        });
        orbitCandidate[handness] = hand.index_finger_tip;
      }
    } else {
      orbitCandidate[handness] = hand.index_finger_tip;
    }
  } else {
    orbitCandidate[handness] = false;
  }
}

function isStraightAndVertical(hand, handness, fingerName) {
  const topAngle = findAngleBetweenPoints(
    hand[`${fingerName}_tip`],
    hand[`${fingerName}_dip`]
  );
  const middleAngle = findAngleBetweenPoints(
    hand[`${fingerName}_dip`],
    hand[`${fingerName}_pip`]
  );
  const bottomAngle = findAngleBetweenPoints(
    hand[`${fingerName}_pip`],
    hand[`${fingerName}_mcp`]
  );
  const STRAIGHT_THRES = handness === "right" ? 90 : 88;
  const anglesRange = range([topAngle, middleAngle, bottomAngle]);
  const straight = Math.abs(anglesRange) < 15;
  const vertical = Math.abs(bottomAngle - STRAIGHT_THRES) < 10;
  return straight && vertical;
}
