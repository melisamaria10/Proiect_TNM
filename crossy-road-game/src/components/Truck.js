import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

const colors = [0xb4c6fc, 0xF3F4F4, 0xF7F0F0, 0xF1E9E9, 0xBFC6C4];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(70, 35, 35),
    new THREE.MeshLambertMaterial({
      color: randomElement(colors),
      flatShading: true,
    })
  );
  cargo.position.x = -15;
  cargo.position.z = 25;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, 30),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  cabin.position.x = 35;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  const frontWheel = Wheel(37);
  truck.add(frontWheel);

  const middleWheel = Wheel(5);
  truck.add(middleWheel);

  const backWheel = Wheel(-35);
  truck.add(backWheel);

  return truck;
}