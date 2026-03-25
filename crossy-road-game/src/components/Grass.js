import * as THREE from "three";
import { tilesPerRow, tileSize } from "../constants";

// biome: "summer" | "autumn" | "winter"
export function Grass(rowIndex, biome = "summer") {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  let color;
  if (biome === "winter") {
    color = 0xffffff; // snow
  } else if (biome === "autumn") {
    color = 0xffc04d; // yellow/orange-ish
  } else {
    color = 0xbaf455; // original green
  }

  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color })
  );
  foundation.position.z = 1.5;
  foundation.receiveShadow = true;
  grass.add(foundation);

  return grass;
}