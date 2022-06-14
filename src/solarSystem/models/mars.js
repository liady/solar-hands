import * as THREE from "three";
import { degToRadians } from "../../common/util";

const diameter = 6;
const radius = 3;
const textures = {
  base: "/assets/textures/mars_1k.jpg",
  topo: "/assets/textures/mars_topo_1k.jpg",
};
const textureLoader = new THREE.TextureLoader();
Object.entries(textures).forEach(([, src]) => {
  textureLoader.load(src);
});

export function createMars() {
  const surface = createSurface(textures.base, textures.topo, null);
  const mars = createGeometry(surface);

  mars.name = "mars";
  window.mars = mars;
  mars.rotation.set(0, degToRadians(270), 0);
  return mars;
}

function getTexture(src, filter) {
  const texture = textureLoader.load(src);

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  if (filter) {
    texture.filter = filter;
  }

  return texture;
}

function createGeometry(surface) {
  const segmentsOffset = Number.parseInt(diameter + 1.1 * 60);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius - 0.1, segmentsOffset, segmentsOffset)
  );
  mesh.add(surface);

  return mesh;
}

function createSurface(base, topo) {
  const segmentsOffset = Number.parseInt(diameter + 1.1 * 60);
  const map = getTexture(base);
  map.minFilter = THREE.NearestFilter;
  const bumpMap = getTexture(topo);
  bumpMap.minFilter = THREE.NearestFilter;

  const surface = new THREE.MeshPhongMaterial({
    map: map,
    bumpMap: bumpMap || null,
    bumpScale: bumpMap ? 0.015 : null,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segmentsOffset, segmentsOffset),
    surface
  );
  mesh.rotation.x = 0;

  return mesh;
}
