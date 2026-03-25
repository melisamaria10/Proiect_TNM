import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { player, initializePlayer, setMarmaladeColors } from "./components/Player";
import { map, initializeMap } from "./components/Map";
import { animateVehicles } from "./animateVehicles";
import { animatePlayer } from "./animatePlayer";
import { hitTest, gameOver, resetGameOver } from "./hitTest";
import { customizeMarmalade } from "./characterCustomizer";
import "./style.css";
import "./collectUserInput";

const scene = new THREE.Scene();
scene.add(player);
scene.add(map);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const dirLight = DirectionalLight();
dirLight.target = player;
player.add(dirLight);

const camera = Camera();
player.add(camera);

const scoreDOM = document.getElementById("score");
const resultDOM = document.getElementById("result-container");

document
  .querySelector("#retry")
  ?.addEventListener("click", initializeGame);

function initializeGame() {
  resetGameOver();
  initializePlayer();
  initializeMap();

  // Initialize UI
  if (scoreDOM) scoreDOM.innerText = "0";
  if (resultDOM) resultDOM.style.visibility = "hidden";
}

const renderer = Renderer();

function animate() {
  if (!gameOver) {
    animateVehicles();
    animatePlayer();
    hitTest();
  }

  renderer.render(scene, camera);
}

async function boot() {
  try {
    const colors = await customizeMarmalade();
    setMarmaladeColors(colors);
  } catch (e) {
    // If the customizer fails for any reason, still start the game.
    console.error("Customizer failed, starting default character.", e);
  }

  initializeGame();
  renderer.setAnimationLoop(animate);
}

boot();