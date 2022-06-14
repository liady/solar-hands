import * as THREE from "three";
import starsData from "./starsData.json";
import * as d3 from "d3-scale";

export async function insertStars(scene, withLight) {
  const radius = d3.scaleLinear([6, -1], [0, 2]);
  const points = new Map();
  const texture = new THREE.TextureLoader().load(
    "https://raw.githubusercontent.com/Kuntal-Das/textures/main/sp2.png"
  );
  for (const { mag, sra0, sdec0 } of starsData) {
    const r = Math.round(radius(mag) * 10) / 3;
    if (r > 0) {
      const vertices = points.get(r) || [];
      const vector = new THREE.Vector3().setFromSphericalCoords(
        100,
        Math.PI / 2 - sdec0,
        sra0
      );
      vertices.push(vector.x);
      vertices.push(vector.y);
      vertices.push(vector.z);
      points.set(r, vertices);
    }
  }

  for (const data of points.entries()) {
    const [r, vertices] = data;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const p = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: r, map: texture, transparent: true })
    );
    scene.add(p);
  }

  if (withLight) {
    scene.add(new THREE.AmbientLight("#ffffff"));
  }
}
