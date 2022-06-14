import context from "../common/context";
import events from "../common/events";
import gsap from "gsap";
import { initStars, insertEarth, insertMars, insertSun } from "./handlers";
import { bounceAndBack } from "../common/util";
import "../detectors/handListener";

window.gsap = gsap;

let state = "stars";

events.subscribe("snap", ({ x, y, z }) => {
  switch (state) {
    case "stars":
      initStars();
      state = "sun";
      break;
    case "sun":
      insertSun(x, y, z);
      state = "earth";
      break;
    case "earth":
      insertEarth(x, y, z);
      state = "mars";
      break;
    case "mars":
      insertMars(x, y, z);
      state = "";
      break;
  }
});

events.subscribe("flick", ({ deltaX, deltaY, deltaZ, obj }) => {
  deltaX = deltaX * 1.1;
  deltaY = deltaY * 1.1;
  deltaZ = deltaZ * 1.1;
  if (obj.name === "sun") {
    if (obj.position.y === 0) {
      bounceAndBack(obj, deltaX * 2, deltaY * 2, deltaZ * 2);
      context.elements.forEach((obj) => {
        if (obj.name === "earth") {
          bounceAndBack(obj, deltaX * 3, deltaY * 3, deltaZ * 3, {
            delay: 0.1,
          });
        }
        if (obj.name === "mars") {
          bounceAndBack(obj, deltaX * 3, deltaY * 3, deltaZ * 3, {
            delay: 0.15,
          });
        }
      });
    } else {
      gsap.to(obj.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "elastic",
      });
    }
  }
  if (obj.name === "earth" || obj.name === "mars") {
    const isEarth = obj.name === "earth";
    if (obj.position.y === 0) {
      bounceAndBack(obj, deltaX * 3, deltaY * 3, deltaZ * 3);
    } else {
      bounceAndBack(obj, deltaX * 3, deltaY * 3, deltaZ * 3, { baseY: 0 });
      // gsap.to(obj.position, {
      //   x: obj.position.x + deltaX,
      //   y: 0,
      //   duration: 1,
      //   ease: "elastic",
      // });
      setTimeout(() => {
        context.orbit = context.orbit || {};
        context.orbit[obj.name] = context.orbit[obj.name] || {};
        context.orbit[obj.name].speed = isEarth ? 2 : 1.6;
        context.orbit[obj.name].radius = obj.position.x;
        context.orbit[obj.name].orbitAngle = 0;
        context.orbit[obj.name].xcoeff = 1;
        context.orbit[obj.name].zcoeff = isEarth ? 0.8 : 0.9;
      }, 250);
    }
  }
});

events.subscribe("rotate", ({ obj, handness }) => {
  context.rotation = context.rotation || {};
  context.rotation[obj.name] = context.rotation[obj.name] || {};
  const speedSign = handness === "right" ? 1 : -1;
  context.rotation[obj.name].speed =
    speedSign * (obj.name === "sun" ? 0.015 : 0.025);
});

events.subscribe("orbit", ({ deltaX, deltaY, handness }) => {
  if (handness === "right") {
    if (state) {
      deltaY = 0;
    }
    context.cameraControls.rotate(deltaX * -0.01, deltaY * -0.01, true);
  }
  if (handness === "left") {
    context.cameraControls.dolly(deltaY * -0.7, true);
  }
});
