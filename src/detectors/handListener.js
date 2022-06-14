import events from "../common/events";
import { detectSnap } from "./snapDetector";
import { detectFlick } from "./flickDetector";
import { detectRotate } from "./rotateDetector";
import { detectOrbit } from "./orbitDetector";

events.subscribe("hand", (hand) => {
  let hands = { left: {}, right: {} };
  const handness = hand.handness.toLowerCase();
  hands[handness] = Object.fromEntries(
    Object.entries(hand).map(([keypoint, xy]) => {
      return [keypoint, { x: 1920 - xy.x, y: xy.y }];
    })
  );
  detectSnap(hands[handness], handness);
  detectFlick(hands[handness], handness);
  detectRotate(hands[handness], handness);
  detectOrbit(hands[handness], handness);
});
