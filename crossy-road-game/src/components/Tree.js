import * as THREE from "three";
import { tileSize } from "../constants";

// biome: "summer" | "autumn" | "winter"
export function Tree(tileIndex, height, biome = "summer") {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: 0x4d2926,
      flatShading: true,
    })
  );
  trunk.position.z = 10;
  tree.add(trunk);

  let crownColor;
  if (biome === "winter") {
    crownColor = 0xffffff; // snowy tree
  } else if (biome === "autumn") {
    // random autumn-ish color
    const autumnColors = [0xffa500, 0xffc04d, 0xcc7722]; // orange, yellow, brownish
    crownColor =
      autumnColors[Math.floor(Math.random() * autumnColors.length)];
  } else {
    crownColor = 0x7aa21d; // original green
  }

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, height),
    new THREE.MeshLambertMaterial({
      color: crownColor,
      flatShading: true,
    })
  );
  crown.position.z = height / 2 + 20;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);

  return tree;
}