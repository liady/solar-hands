import * as THREE from "three";
const DISTANCE_TO_KUIPER_BELT = 7479893535; // Kuiper Belt radius

export function createSun(scene) {
  const src = "assets/textures/sun_detailed.png";
  const texture = new THREE.TextureLoader().load(src);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.minFilter = THREE.NearestFilter;

  const material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
    transparent: true,
    opacity: 1,
    shading: THREE.SmoothShading,
  });

  //
  const geometry = new THREE.SphereGeometry(7, 84, 42);
  const mesh = new THREE.Mesh(geometry, material);
  const lightColor = 0xffffff;
  const intesity = 1;
  const lightDistanceStrength = DISTANCE_TO_KUIPER_BELT * Math.pow(10, -4.2);
  const lightDecayRate = 0.6;
  const sunLight = new THREE.PointLight(
    lightColor,
    intesity,
    lightDistanceStrength,
    lightDecayRate
  );

  // mesh.rotation.x = 90 * 0.0174532925;

  mesh.name = "sun";

  mesh.add(sunLight);
  //   scene.background = new THREE.Color("#081f2b");
  scene.add(new THREE.AmbientLight("#ffffff"));

  return mesh;
}
