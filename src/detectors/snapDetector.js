import {
  distance,
  findAngleBetweenThreePoints,
  getVectorFromXY,
} from "../common/util";
import events from "../common/events";

let snapCandidate = { right: false, left: false };

export function detectSnap(hand, handness) {
  if (handness !== "left") {
    return;
  }
  const dist = distance(hand.thumb_tip, hand.middle_finger_tip);
  const bentThumb =
    handness === "right"
      ? hand.thumb_tip.x < hand.thumb_ip.x
      : hand.thumb_tip.x > hand.thumb_ip.x;

  const middleFingerAngle = findAngleBetweenThreePoints(
    hand.middle_finger_mcp,
    hand.middle_finger_pip,
    hand.middle_finger_dip
  );

  if (dist < 25 && Math.abs(middleFingerAngle) > 150) {
    snapCandidate[handness] = true;
  } else {
    if (hand.thumb_tip.y > hand.middle_finger_tip.y || bentThumb) {
      snapCandidate[handness] = false;
    } else if (dist > 60 && snapCandidate[handness]) {
      snapCandidate[handness] = false;
      const { x, y, z } = getVectorFromXY(hand.thumb_tip.x, hand.thumb_tip.y);
      events.publish("snap", { x, y, z, hand, handness });
    }
  }
}
