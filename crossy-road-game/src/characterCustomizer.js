import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildMarmalade } from "./components/Player";

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "character-customizer";
  overlay.innerHTML = `
    <div class="cc-card">
      <div class="cc-left">
        <h2>Customize Marmalade</h2>
        <label class="cc-row">
          <span>Body + head</span>
          <input id="cc-body" type="color" value="#ffa500" />
        </label>
        <label class="cc-row">
          <span>Legs</span>
          <input id="cc-legs" type="color" value="#e67e22" />
        </label>
        <label class="cc-row">
          <span>Ears</span>
          <input id="cc-ears" type="color" value="#ffa500" />
        </label>
        <label class="cc-row">
          <span>Nose</span>
          <input id="cc-nose" type="color" value="#ff9aa2" />
        </label>

        <div class="cc-hint">
          Drag to rotate. Scroll to zoom.
        </div>

        <div class="cc-actions">
          <button id="cc-done" class="cc-done">Done</button>
        </div>
      </div>

      <div class="cc-right">
        <canvas id="cc-canvas"></canvas>
      </div>
    </div>
  `;

  return overlay;
}

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #character-customizer {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: grid;
      place-items: center;
      z-index: 9999;
    }

    #character-customizer .cc-card {
      width: min(920px, calc(100vw - 32px));
      height: min(520px, calc(100vh - 32px));
      background: white;
      border: 2px solid #111;
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 16px;
      padding: 16px;
      box-sizing: border-box;
    }

    #character-customizer h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
    }

    #character-customizer .cc-left {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    #character-customizer .cc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
    }

    #character-customizer input[type="color"] {
      width: 56px;
      height: 34px;
      padding: 0;
      border: 1px solid #222;
      background: transparent;
      cursor: pointer;
    }

    #character-customizer .cc-hint {
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.7;
      line-height: 1.4;
    }

    #character-customizer .cc-actions {
      margin-top: auto;
      display: flex;
      gap: 12px;
    }

    #character-customizer .cc-done {
      width: 100%;
      padding: 14px 12px;
      border: 2px solid #111;
      background: #111;
      color: white;
      font-family: inherit;
      cursor: pointer;
      font-size: 12px;
    }

    #character-customizer .cc-right {
      position: relative;
      border: 2px solid #111;
      background: #f6f6f6;
    }

    #character-customizer #cc-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;
  document.head.appendChild(style);
  return style;
}

function hexToInt(hex) {
  return parseInt(hex.replace("#", "0x"), 16);
}

export function customizeMarmalade() {
  return new Promise((resolve) => {
    const overlay = createOverlay();
    const style = injectStyles();
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#cc-canvas");
    const bodyInput = overlay.querySelector("#cc-body");
    const legsInput = overlay.querySelector("#cc-legs");
    const earsInput = overlay.querySelector("#cc-ears");
    const noseInput = overlay.querySelector("#cc-nose");
    const doneBtn = overlay.querySelector("#cc-done");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f6f6);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(8, -10, 14);
    scene.add(dir);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);
    // Pull the camera a bit farther back so Marmalade fits comfortably.
    camera.position.set(100, -80, 14);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0, 6);
    controls.update();

    let marmalade = buildMarmalade({
      body: hexToInt(bodyInput.value),
      legs: hexToInt(legsInput.value),
      ears: hexToInt(earsInput.value),
      nose: hexToInt(noseInput.value),
    });
    scene.add(marmalade);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function rebuildPreview() {
      scene.remove(marmalade);
      marmalade.traverse((child) => {
        if (child.isMesh) child.geometry?.dispose?.();
      });
      marmalade = buildMarmalade({
        body: hexToInt(bodyInput.value),
        legs: hexToInt(legsInput.value),
        ears: hexToInt(earsInput.value),
        nose: hexToInt(noseInput.value),
      });
      scene.add(marmalade);
    }

    bodyInput.addEventListener("input", rebuildPreview);
    legsInput.addEventListener("input", rebuildPreview);
    earsInput.addEventListener("input", rebuildPreview);
    noseInput.addEventListener("input", rebuildPreview);

    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    doneBtn.addEventListener("click", () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      overlay.remove();
      style.remove();

      resolve({
        body: hexToInt(bodyInput.value),
        legs: hexToInt(legsInput.value),
        ears: hexToInt(earsInput.value),
        nose: hexToInt(noseInput.value),
      });
    });
  });
}

