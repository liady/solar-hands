import {
  distance,
  getUnitVectorBetweenTwoPoints,
  getVectorFromXY,
} from "../common/util";
import events from "../common/events";
import context from "../common/context";

let flickCandidate = { right: false, left: false };

export function detectFlick(hand, handness) {
  const dist = distance(hand.thumb_tip, hand.index_finger_tip);

  if (dist < 25) {
    const boxIndex = context.elements.findIndex((box) => {
      const d = distance(
        box.position,
        getVectorFromXY(hand.index_finger_tip.x, hand.index_finger_tip.y)
      );
      return d < 7;
    });
    if (boxIndex > -1) {
      flickCandidate[handness] = {
        b: context.elements[boxIndex],
        fingerLocation: getVectorFromXY(hand.thumb_tip.x, hand.thumb_tip.y),
      };
      //   boxes[boxIndex].material.color.setHex(0xff0000);
    } else {
      flickCandidate[handness] = false;
    }
  } else if (dist > 80 && flickCandidate[handness]) {
    const data = flickCandidate[handness];
    const {
      x: deltaX,
      y: deltaY,
      z: deltaZ,
    } = handness === "left"
      ? getUnitVectorBetweenTwoPoints(data.fingerLocation, data.b.position)
      : getUnitVectorBetweenTwoPoints(data.b.position, data.fingerLocation);
    events.publish("flick", {
      deltaX,
      deltaY,
      deltaZ,
      obj: data.b,
      fingerLocation: data.fingerLocation,
      hand,
      handness,
    });
    flickCandidate[handness] = false;
  }
}
