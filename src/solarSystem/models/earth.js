import * as THREE from "three";
import { degToRadians } from "../../common/util";

const diameter = 6;
const radius = 3;
const textures = {
  base: "/assets/textures/earth.jpg",
  topo: "/assets/textures/earth_topo_1k.jpg",
  specular: "/assets/textures/earth_ocean_reflectance_4k.jpg",
  clouds: "/assets/textures/earth_clouds_active2.png",
};
const textureLoader = new THREE.TextureLoader();
Object.entries(textures).forEach(([, src]) => {
  textureLoader.load(src);
});

export function createEarth() {
  const surface = createSurface(textures.base, textures.topo, null);
  const atmo = createAtmosphere(textures.clouds);
  const earth = createGeometry(surface, atmo);

  earth.name = "earth";
  window.earth = earth;
  earth.rotation.set(0, degToRadians(270), 0);
  return earth;
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

function createGeometry(surface, atmosphere) {
  const segmentsOffset = Number.parseInt(diameter + 1.1 * 60);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius - 0.1, segmentsOffset, segmentsOffset)
  );
  mesh.add(surface);

  if (atmosphere) {
    mesh.add(atmosphere);
  }

  return mesh;
}

function createSurface(base, topo, specular) {
  const segmentsOffset = Number.parseInt(diameter + 1.1 * 60);

  const map = getTexture(base);

  map.minFilter = THREE.NearestFilter;

  let bumpMap, specularMap;

  if (topo) {
    bumpMap = getTexture(topo);
    bumpMap.minFilter = THREE.NearestFilter;
  }

  if (specular) {
    specularMap = getTexture(specular);
    specularMap.minFilter = THREE.LinearFilter;
  }

  const surface = new THREE.MeshPhongMaterial({
    map: map,
    bumpMap: bumpMap || null,
    bumpScale: bumpMap ? 0.015 : null,
    specularMap: specularMap || null,
    specular: specularMap ? new THREE.Color(0x0a0a0a) : null,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segmentsOffset, segmentsOffset),
    surface
  );
  mesh.rotation.x = 0;

  return mesh;
}

function createAtmosphere(clouds) {
  const segmentsOffset = getSphereGeometrySegmentOffset();
  const map = getTexture(clouds);

  map.minFilter = THREE.LinearFilter;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.01, segmentsOffset, segmentsOffset),
    new THREE.MeshPhongMaterial({
      map: map,
      transparent: true,
      opacity: 0.9,
    })
  );

  mesh.rotation.x = 0;

  return mesh;
}
function getSphereGeometrySegmentOffset() {
  return Number.parseInt(diameter + 1 * 60);
}
