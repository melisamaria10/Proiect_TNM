import * as THREE from "three";
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition";
import { metadata as rows, addRows } from "./Map";
import { sendPd } from "../pdRelay";

let marmaladeColors = {
  body: 0xffa500,
  legs: 0xe67e22,
  ears: 0xffa500,
  nose: 0xff9aa2,
};

export function setMarmaladeColors(next) {
  marmaladeColors = { ...marmaladeColors, ...next };
  rebuildMarmalade(player);
}

function Player() {
  const player = new THREE.Group();
  rebuildMarmalade(player);
  return player;
}

export function buildMarmalade(colors = marmaladeColors) {
  const marmalade = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({ color: colors.body });
  const legsMat = new THREE.MeshLambertMaterial({ color: colors.legs });
  const earsMat = new THREE.MeshLambertMaterial({ color: colors.ears });
  const black = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const noseMat = new THREE.MeshLambertMaterial({ color: colors.nose });
  const innerEarMat = new THREE.MeshLambertMaterial({ color: colors.nose });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 3), bodyMat);
  body.position.y = 1.25;
  marmalade.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), bodyMat);
  head.position.set(0, 2.4, -1.8);
  marmalade.add(head);

  // Ears
  const earGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
  const leftEar = new THREE.Mesh(earGeo, earsMat);
  leftEar.position.set(-0.5, 3.3, -1.8);
  const rightEar = new THREE.Mesh(earGeo, earsMat);
  rightEar.position.set(0.5, 3.3, -1.8);
  marmalade.add(leftEar, rightEar);

  // Inner ears
  const innerEarGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
  const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
  leftInnerEar.position.set(-0.5, 3.2, -2.05);
  const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
  rightInnerEar.position.set(0.5, 3.2, -2.05);
  marmalade.add(leftInnerEar, rightInnerEar);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.1);
  const leftEye = new THREE.Mesh(eyeGeo, black);
  leftEye.position.set(-0.35, 2.5, -2.75);
  const rightEye = new THREE.Mesh(eyeGeo, black);
  rightEye.position.set(0.35, 2.5, -2.75);
  marmalade.add(leftEye, rightEye);

  // Nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), noseMat);
  nose.position.set(0, 2.3, -2.8);
  marmalade.add(nose);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
  const legPositions = [
    [-0.7, 0.5, -1],
    [0.7, 0.5, -1],
    [-0.7, 0.5, 1],
    [0.7, 0.5, 1],
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, legsMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    marmalade.add(leg);
  });

  // Tail
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 2), bodyMat);
  tail.position.set(0, 2, 2);
  tail.rotation.x = Math.PI / 6;
  marmalade.add(tail);

  marmalade.rotation.x = Math.PI / 2;
  marmalade.scale.set(7, 7, 7);
  marmalade.position.z = 2;

  marmalade.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return marmalade;
}

function rebuildMarmalade(playerGroup) {
  const existing = playerGroup.getObjectByName("marmalade");
  if (existing) {
    existing.removeFromParent();
    existing.traverse((child) => {
      if (child.isMesh) child.geometry?.dispose?.();
    });
  }

  const marmalade = buildMarmalade(marmaladeColors);
  marmalade.name = "marmalade";
  playerGroup.add(marmalade);
}

export const player = Player();

export const position = {
  currentRow: 0,
  currentTile: 0,
};

export const movesQueue = [];

export function initializePlayer() {
  player.position.x = 0;
  player.position.y = 0;
  const marmalade = player.getObjectByName("marmalade") || player.children[0];
  if (marmalade) marmalade.position.z = 2;

  position.currentRow = 0;
  position.currentTile = 0;

  movesQueue.length = 0;
}

export function queueMove(direction) {
  const isValidMove = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, direction]
  );

  if (!isValidMove) return;

  movesQueue.push(direction);
}

export function stepCompleted() {
  const direction = movesQueue.shift();

  if (direction === "forward") position.currentRow += 1;
  if (direction === "backward") position.currentRow -= 1;
  if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1;

  // Add new rows if the player is running out of them
  if (position.currentRow > rows.length - 10) addRows();

  const currentRow = rows[position.currentRow - 1];
  if (currentRow?.type === "car" || currentRow?.type === "truck") sendPd("car");

  const scoreDOM = document.getElementById("score");
  if (scoreDOM) scoreDOM.innerText = position.currentRow.toString();
}