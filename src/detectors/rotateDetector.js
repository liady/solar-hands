import {
  distance,
  findAngleBetweenPoints,
  getVectorFromXY,
  range,
} from "../common/util";
import events from "../common/events";
import context from "../common/context";

const rotateCandidate = { right: false, left: false };

export function detectRotate(hand, handness) {
  const topAngle = findAngleBetweenPoints(
    hand.index_finger_tip,
    hand.index_finger_dip
  );
  const middleAngle = findAngleBetweenPoints(
    hand.index_finger_dip,
    hand.index_finger_pip
  );
  const bottomAngle = findAngleBetweenPoints(
    hand.index_finger_pip,
    hand.index_finger_mcp
  );
  const STRAIGHT_THRES = handness === "right" ? 90 : 88;
  const END_THRES = handness === "right" ? 115 : 50;
  const anglesRange = range([topAngle, middleAngle, bottomAngle]);
  const straight = Math.abs(anglesRange) < 15;
  const vertical = Math.abs(bottomAngle - STRAIGHT_THRES) < 10;
  if (straight) {
    if (vertical) {
      const boxIndex = context.elements.findIndex((box) => {
        const d = distance(
          box.position,
          getVectorFromXY(hand.index_finger_tip.x, hand.index_finger_tip.y)
        );
        return d < 7;
      });
      if (boxIndex > -1) {
        rotateCandidate[handness] = {
          b: context.elements[boxIndex],
          fingerLocation: getVectorFromXY(
            hand.index_finger_tip.x,
            hand.index_finger_tip.y
          ),
        };
        //   boxes[boxIndex].material.color.setHex(0xff0000);
      } else {
        rotateCandidate[handness] = false;
      }
    } else {
      if (Math.abs(bottomAngle - END_THRES) < 10 && rotateCandidate[handness]) {
        const data = rotateCandidate[handness];
        events.publish("rotate", {
          obj: data.b,
          fingerLocation: data.fingerLocation,
          hand,
          handness,
        });
        rotateCandidate[handness] = false;
      }
    }
  } else {
    rotateCandidate[handness] = false;
  }
}
