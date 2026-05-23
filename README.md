# Crossy Road Game

Acest proiect este un joc 3D de tip *endless runner*, inspirat de **Crossy Road**, în care un personaj („Marmalade”) traversează rânduri cu pădure, drumuri și vehicule, evitând coliziunile și avansând cât mai departe posibil. Proiectul este construit cu **Three.js** și extins de la tutorialul:

[Crossy Road with Three.js - Setting up the Game](https://javascriptgametutorials.com/tutorials/three-js/crossy-road/setup)

---

## Tema proiectului

Joc browser 3D în stil **Crossy Road**: deplasare pe o hartă infinită generată procedural, cu obstacole (mașini, camioane, copaci), scor bazat pe distanța parcursă și progresie vizuală prin **trei anotimpuri** (vară → toamnă → iarnă). Personajul poate fi personalizat înainte de start, iar experiența este completată cu **sunet generat în Pure Data**, declanșat de acțiunile din joc.

---

## Tehnologii

| Categorie | Tehnologie |
|-----------|------------|
| Motor 3D | [Three.js](https://threejs.org/) (WebGL) |
| Build & dev server | [Vite](https://vitejs.dev/) |
| Audio (extern) | [Pure Data](https://puredata.info/) |
| Bridge browser → audio | Node.js + `ws` + `osc` (`src/pure_data/relay.cjs`) |
| Controale preview personaj | `OrbitControls` (Three.js addons) |

---

## Limbaje

- **JavaScript** (ES modules) — logică joc, randare, input, coliziuni, integrare audio
- **HTML** — structură pagină (canvas, scor, ecran game over)
- **CSS** — UI (customizare personaj, overlay-uri)
- **Pure Data** — patch-uri sonore (`.pd`)

---

## API-uri și protocoale folosite

| API / protocol | Utilizare în proiect |
|----------------|----------------------|
| **WebGL** (prin Three.js) | Scene 3D, mesh-uri, materiale, umbre, cameră |
| **WebSocket** (`ws://localhost:8081`) | Trimitere evenimente din joc către relay-ul Node.js |
| **OSC** (Open Sound Control, UDP port 9000) | Relay-ul traduce mesajele WebSocket în mesaje pentru Pure Data |
| **DOM / Canvas** | UI scor, game over, customizer; canvas principal de joc |
| **Keyboard events** | Deplasare cu `W`/`A`/`S`/`D` |
| **`requestAnimationFrame`** / `renderer.setAnimationLoop` | Bucla de animație |

---

## Funcționalități (features)

- **Gameplay Crossy Road**: mișcare discretă pe grilă, coliziuni cu vehicule, scor = numărul de rânduri parcurse
- **Hartă infinită procedurală**: rânduri aleatoare de tip pădure, bandă de mașini sau camioane, generate pe măsură ce jucătorul avansează
- **Personaj custom „Marmalade”**: model 3D (corp, cap, urechi, ochi, nas, picioare, coadă)
- **Customizare culori** înainte de start, cu preview 3D interactiv (rotație/zoom)
- **Trei biome / anotimpuri**: vară (verde), toamnă (galben-portocaliu), iarnă (zăpadă) — la rândurile 0–29, 30–59, 60+
- **Game over**: oprire logică la impact, afișare scor final, buton **Retry**
- **Input tastatură** (`W`/`A`/`S`, `D`) 
- **Sunet reactiv (Pure Data)**: evenimente `start`, `hop`, `splat` trimise prin WebSocket → relay OSC
- **Iluminare și umbre**: lumină ambientală + direcțională, umbre pe personaj și mediu

---

## Ce am preluat din tutorial

- Configurarea scenei, a randării și a camerei
- lumină + umbre
- construirea hărții
- logica jocului

---

## Ce am adaugat

## 1) Model de player diferit ("Marmalade")

În locul modelului simplu, am creat un personaj compus din mai multe segmente (body, head, ears, eyes, nose, legs, tail) toate grupate într-un singur obiect.

```
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
  ```

  ## 2) Character Customization

  Am adaugat o interfață pentru personalizarea personajului, unde putem alege culori pentru:
  - Cap + Corp 
  - Picioare
  - Urechi
  - Nas

  Selecția se poate face numai înainte de a începe jocul propriu-zis.
  Totodată, se poate vedea în timp real atunci când se schimbă culorile:

  ```
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
 ```

## 3) Adaugarea mai multor anotimpuri

Jocul este împărțit în 3 etape, în funcție de cât de mult avansează jucătorul:

- **Vara** : primele 30 de rânduri
- **Toamna** : rândurile de la 30 la 59
- **Iarna** : rândurile de la 60

```
export function getBiomeForRow(rowIndex) {
  const row = Math.max(0, rowIndex);

  if (row < 30) return "summer"; // default/green
  if (row < 60) return "autumn"; // yellow/orange/brown
  return "winter"; // snowy
}
```

## 4) Game-Over Freeze

Atunci când jucătorul moare, apare pe ecran scorul obținut și butonul de retry, neputând să mai mișcăm caracterul

```
function animate() {
  // Cat timp jocul ruleaza, actualizam miscarea si coliziunile
  if (!gameOver) {
    animateVehicles();
    animatePlayer();
    hitTest();
  }
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

## 5) Sunete reactive cu Pure Data

Am adăugat un sistem de audio în care **evenimentele din joc declanșează sunete** generate în **Pure Data**, nu în browser (fără Web Audio API în JavaScript). Fluxul este:

```
Joc (browser)  →  WebSocket (port 8081)  →  relay Node.js  →  OSC/UDP (port 9000)  →  Pure Data
```

### Componente

| Fisier | Rol |
|--------|-----|
| `src/pdRelay.js` | Deschide WebSocket către relay; funcția `sendPd()` trimite mesaje JSON `{ address, args }` |
| `src/pure_data/relay.cjs` | Server Node: primește WebSocket, le convertește în mesaje OSC (`/hop`, `/car`, etc.) și le trimite la Pure Data pe UDP |
| `src/pure_data/first sounds prototype.pd` | Patch Pure Data: ascultă pe portul **9000**, parsează OSC și routează evenimentele |

### Evenimente sonore

| Mesaj | Când se trimite | Unde în cod |
|-------|-----------------|-------------|
| `start` | La pornirea jocului (dupa customizer) | `main.js` → `boot()` |
| `hop` | La fiecare mișcare (tasta sau tilt) | `collectUserInput.js` |
| `splat` | La coliziune / game over | `hitTest.js` |

Exemplu din joc — trimiterea unui eveniment:

```
export function sendPd(address, ...args) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ address, args }));
    return;
  }
  pending.push({ address, args }); // coada pâna se deschide socket-ul
}
```

Exemplu din relay — conversia în OSC pentru Pure Data:

```
ws.on("message", (data) => {
  const msg = JSON.parse(data);
  udpPort.send({ address: "/" + msg.address, args: msg.args || [] });
});
```

În patch-ul Pure Data, mesajele sunt separate cu `[select hop splat start]` și fiecare ramură declanșeaza un sunet diferit (oscilatoare, zgomot filtrat, envelope-uri `line~`, etc.).

### Cum rulezi partea de sunete

1. Pornește patch-ul Pure Data (`first sounds prototype.pd`) — asculta UDP pe **9000**
2. Pornește relay-ul: `node src/pure_data/relay.cjs` — WebSocket pe **8081**
3. Pornește jocul: `npm run dev`

Fără relay și Pure Data pornite, jocul funcționează normal, doar **fără sunet**.
