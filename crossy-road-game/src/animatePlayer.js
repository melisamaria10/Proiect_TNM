import * as THREE from "three";
import { player, position, movesQueue, stepCompleted } from "./components/Player";
import { tileSize } from "./constants";

const moveClock = new THREE.Clock(false);
let startRotation = 0;

export function animatePlayer() {
  if (!movesQueue.length) return;

  if (!moveClock.running) moveClock.start();

  if (!moveClock.running) {
  const marmalade = player.getObjectByName("marmalade") || player.children[0];
  if (marmalade) startRotation = marmalade.rotation.z;

  moveClock.start();
}

  const stepTime = 0.2; // Seconds it takes to take a step
  const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

  setPosition(progress);
  setRotation(progress);

  // Once a step has ended
  if (progress >= 1) {
    stepCompleted();
    moveClock.stop();
  }
}

function setPosition(progress) {
  const startX = position.currentTile * tileSize;
  const startY = position.currentRow * tileSize;
  let endX = startX;
  let endY = startY;

  if (movesQueue[0] === "left") endX -= tileSize;
  if (movesQueue[0] === "right") endX += tileSize;
  if (movesQueue[0] === "forward") endY += tileSize;
  if (movesQueue[0] === "backward") endY -= tileSize;

  player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
  player.position.y = THREE.MathUtils.lerp(startY, endY, progress);

  const marmalade = player.getObjectByName("marmalade") || player.children[0];
  if (marmalade) {
    const baseZ = 2;
    marmalade.position.z = baseZ + Math.sin(progress * Math.PI) * 8;
  }
}

function setRotation(progress) {
  let endRotation = 0;

  if (movesQueue[0] === "forward") endRotation = 0;
  if (movesQueue[0] === "left") endRotation = Math.PI / 2;
  if (movesQueue[0] === "right") endRotation = -Math.PI / 2;
  if (movesQueue[0] === "backward") endRotation = Math.PI;

  const marmalade = player.getObjectByName("marmalade") || player.children[0];

  if (marmalade) {
    marmalade.rotation.y = endRotation;
  }
}