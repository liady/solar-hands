import gsap from "gsap";
import context from "../common/context";
import { createEarth } from "./models/earth";
import { createMars } from "./models/mars";
import { insertStars } from "./models/stars";
import { createSun } from "./models/sun";

export function insertSun(x, y, z) {
  const sun = createSun(context.scene);
  sun.position.set(x, y, z);
  context.scene.add(sun);
  sun.scale.set(1.1, 1.1, 1.1);
  gsap.to(sun.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 1, ease: "elastic" });
  context.elements.push(sun);
}

export function insertEarth(x, y, z) {
  const earth = createEarth(context.scene);
  earth.position.set(x, y, z);
  context.scene.add(earth);
  earth.scale.set(1.1, 1.1, 1.1);
  gsap.to(earth.scale, {
    x: 0.9,
    y: 0.9,
    z: 0.9,
    duration: 1,
    ease: "elastic",
  });
  context.elements.push(earth);
}

export function insertMars(x, y, z) {
  const mars = createMars(context.scene);
  mars.position.set(x, y, z);
  context.scene.add(mars);
  mars.scale.set(1.1, 1.1, 1.1);
  gsap.to(mars.scale, {
    x: 0.9,
    y: 0.9,
    z: 0.9,
    duration: 1,
    ease: "elastic",
  });
  context.elements.push(mars);
}

export function initStars(withLight) {
  insertStars(context.scene, withLight);
}
