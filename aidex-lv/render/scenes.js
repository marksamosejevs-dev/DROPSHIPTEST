// Offline renderer for the temporary AIDEX development imagery.
// Every image rendered here is original (procedural) and is intended to be
// replaced by real AIDEX project photography before launch.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const params = new URLSearchParams(location.search);
const SCENE = params.get('scene') || 'hero';
const W = +params.get('w') || 1600;
const H = +params.get('h') || 900;

// ---------- deterministic random ----------
let seed = 1337;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rr = (a, b) => a + (b - a) * rnd();

// ---------- canvas textures ----------
function canvasTex(w, h, draw, { repeat = [1, 1], srgb = true, aniso = 8 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = aniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(g, w, h, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${rnd() * alpha})`;
    g.fillRect(rnd() * w, rnd() * h, rr(1, 3), rr(1, 3));
  }
}

function panelTexture() {
  return canvasTex(560, 850, (g, w, h) => {
    g.fillStyle = '#020305'; g.fillRect(0, 0, w, h);
    const f = 10, cols = 6, rows = 20, gap = 3, mid = 10;
    const cw = (w - 2 * f - gap * (cols - 1)) / cols;
    const ch = (h - 2 * f - gap * (rows - 1) - mid) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = f + c * (cw + gap);
        const y = f + r * (ch + gap) + (r >= rows / 2 ? mid : 0);
        const l = rr(0, 6);
        const grd = g.createLinearGradient(x, y, x + cw, y + ch);
        grd.addColorStop(0, `rgb(${14 + l},${18 + l},${27 + l})`);
        grd.addColorStop(1, `rgb(${9 + l},${12 + l},${19 + l})`);
        g.fillStyle = grd;
        g.fillRect(x, y, cw, ch);
        g.strokeStyle = 'rgba(60,70,90,0.18)';
        g.lineWidth = 0.6;
        for (let b = 1; b < 12; b++) {
          g.beginPath(); g.moveTo(x + (cw * b) / 12, y); g.lineTo(x + (cw * b) / 12, y + ch); g.stroke();
        }
      }
    }
    g.strokeStyle = '#0b0c0e'; g.lineWidth = f * 2; g.strokeRect(0, 0, w, h);
  });
}

function claddingTexture(base, variance, boards = 12) {
  return canvasTex(1024, 1024, (g, w, h) => {
    const bw = w / boards;
    for (let i = 0; i < boards; i++) {
      const v = rr(-variance, variance);
      g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`;
      g.fillRect(i * bw, 0, bw, h);
      for (let k = 0; k < 40; k++) {
        const gv = rr(-variance, variance) * 0.8;
        g.strokeStyle = `rgba(${base[0] + gv},${base[1] + gv},${base[2] + gv},0.5)`;
        g.lineWidth = rr(0.5, 2);
        const x = i * bw + rr(4, bw - 4);
        g.beginPath(); g.moveTo(x, 0);
        g.bezierCurveTo(x + rr(-3, 3), h * 0.3, x + rr(-3, 3), h * 0.6, x + rr(-2, 2), h); g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(i * bw, 0, 3, h);
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(i * bw + 3, 0, 2, h);
    }
  });
}

function seamTexture(base) {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(0, 0, 6, h);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(6, 0, 4, h);
    noise(g, w, h, 300, 0.04);
  });
}

function grassTexture(tint = [58, 74, 44]) {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = `rgb(${tint.join(',')})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const v = rr(-14, 10), r = rr(60, 240), x = rnd() * w, y = rnd() * h;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${tint[0] + v + 6},${tint[1] + v},${tint[2] + v * 0.4},0.5)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 60000; i++) {
      const v = rr(-18, 18);
      g.fillStyle = `rgba(${tint[0] + v + rr(-6, 6)},${tint[1] + v},${tint[2] + v * 0.6},0.6)`;
      const x = rnd() * w, y = rnd() * h;
      g.fillRect(x, y, 1.2, rr(2, 6));
    }
  }, { repeat: [60, 60] });
}

function gravelTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#8d8a84'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 20000; i++) {
      const v = rr(-40, 40);
      g.fillStyle = `rgb(${140 + v},${137 + v},${132 + v})`;
      g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(0.6, 2.2), 0, 7); g.fill();
    }
  }, { repeat: [20, 20] });
}

function deckTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 8, bh = h / n;
    for (let i = 0; i < n; i++) {
      const v = rr(-10, 10);
      g.fillStyle = `rgb(${118 + v},${92 + v},${66 + v})`;
      g.fillRect(0, i * bh, w, bh);
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, i * bh, w, 3);
      for (let k = 0; k < 30; k++) {
        g.strokeStyle = `rgba(60,40,25,${rr(0.05, 0.2)})`;
        const y = i * bh + rr(4, bh - 2);
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + rr(-3, 3)); g.stroke();
      }
    }
  }, { repeat: [3, 3] });
}

function concreteTexture(base = 150) {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = `rgb(${base},${base - 2},${base - 5})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      const v = rr(-14, 14);
      const grd = g.createRadialGradient(0, 0, 0, 0, 0, rr(20, 120));
      grd.addColorStop(0, `rgba(${base + v},${base + v - 2},${base + v - 5},0.12)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(rnd() * w, rnd() * h); g.fillStyle = grd; g.fillRect(-120, -120, 240, 240); g.restore();
    }
    noise(g, w, h, 30000, 0.06); noise(g, w, h, 30000, 0.06, false);
  });
}

function interiorTexture(warm = 1, kind = 'living') {
  return canvasTex(512, 512, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, `rgb(${120 * warm},${82 * warm},${48 * warm})`);
    bg.addColorStop(0.62, `rgb(${170 * warm},${120 * warm},${72 * warm})`);
    bg.addColorStop(0.64, `rgb(${70 * warm},${46 * warm},${28 * warm})`);
    bg.addColorStop(1, `rgb(${40 * warm},${26 * warm},${16 * warm})`);
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // light pools
    for (let i = 0; i < 3; i++) {
      const x = rr(0.15, 0.85) * w;
      const grd = g.createRadialGradient(x, h * 0.25, 2, x, h * 0.35, h * 0.5);
      grd.addColorStop(0, 'rgba(255,215,160,0.9)');
      grd.addColorStop(1, 'rgba(255,190,120,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,240,210,1)'; g.beginPath(); g.arc(x, h * 0.2, 5, 0, 7); g.fill();
      g.strokeStyle = 'rgba(30,20,10,0.6)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * 0.19); g.stroke();
    }
    // furniture silhouettes
    g.fillStyle = `rgba(25,17,10,0.85)`;
    if (kind === 'living') {
      g.fillRect(w * 0.1, h * 0.52, w * 0.38, h * 0.14);
      g.fillRect(w * 0.1, h * 0.44, w * 0.06, h * 0.22);
      g.fillRect(w * 0.62, h * 0.18, w * 0.22, h * 0.46);
      g.fillStyle = 'rgba(200,150,100,0.35)';
      for (let s = 0; s < 4; s++) g.fillRect(w * 0.63, h * (0.22 + s * 0.1), w * 0.2, 2);
    } else {
      g.fillRect(w * 0.2, h * 0.5, w * 0.6, h * 0.04);
      g.fillRect(w * 0.25, h * 0.54, w * 0.02, h * 0.1);
      g.fillRect(w * 0.73, h * 0.54, w * 0.02, h * 0.1);
    }
  }, { aniso: 4 });
}

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 2000);

function setupSky({ elevation, azimuth, turbidity = 4, rayleigh = 1.6, mie = 0.005, mieG = 0.8, exposure = 0.5 }) {
  const sky = new Sky();
  sky.scale.setScalar(10000);
  const u = sky.material.uniforms;
  u.turbidity.value = turbidity;
  u.rayleigh.value = rayleigh;
  u.mieCoefficient.value = mie;
  u.mieDirectionalG.value = mieG;
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elevation), THREE.MathUtils.degToRad(azimuth));
  u.sunPosition.value.copy(sun);
  scene.add(sky);
  renderer.toneMappingExposure = exposure;
  // environment from sky
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const sky2 = new Sky(); sky2.scale.setScalar(10000);
  Object.assign(sky2.material.uniforms.turbidity, { value: turbidity });
  sky2.material.uniforms.rayleigh.value = rayleigh;
  sky2.material.uniforms.mieCoefficient.value = mie;
  sky2.material.uniforms.mieDirectionalG.value = mieG;
  sky2.material.uniforms.sunPosition.value.copy(sun);
  envScene.add(sky2);
  scene.environment = pm.fromScene(envScene).texture;
  return sun;
}

function sunLight(dir, color, intensity, size = 40) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.copy(dir).multiplyScalar(100);
  l.castShadow = true;
  l.shadow.mapSize.set(4096, 4096);
  l.shadow.camera.left = -size; l.shadow.camera.right = size;
  l.shadow.camera.top = size; l.shadow.camera.bottom = -size;
  l.shadow.camera.far = 300;
  l.shadow.bias = -0.0004;
  l.shadow.normalBias = 0.02;
  l.shadow.radius = 4;
  scene.add(l);
  return l;
}

const panelTex = panelTexture();
const panelTop = new THREE.MeshPhysicalMaterial({ map: panelTex, roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2 });
const blackAlu = new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.4, metalness: 0.7 });
const silverAlu = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.35, metalness: 0.9 });
const panelGeo = new THREE.BoxGeometry(1.134, 0.035, 1.722);
const panelMats = [blackAlu, blackAlu, panelTop, blackAlu, blackAlu, blackAlu];

function panel(frame = blackAlu) {
  const m = new THREE.Mesh(panelGeo, frame === blackAlu ? panelMats : [frame, frame, panelTop, frame, frame, frame]);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function ground({ tint, size = 800 } = {}) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: grassTexture(tint), roughness: 0.95 }));
  g.material.map.repeat.set(size / 14, size / 14);
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true;
  scene.add(g);
  return g;
}

function forest({ inner = 35, outer = 140, count = 700, color = 0x1a2620, center = [0, 0], birch = 0, arc = [0, Math.PI * 2] } = {}) {
  const cone = new THREE.ConeGeometry(1, 1, 7);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
  const TI = 9;
  const inst = new THREE.InstancedMesh(cone, mat, count * TI);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1f18, roughness: 1 });
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.2, 1, 5), trunkMat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < count; i++) {
    const a = rr(arc[0], arc[1]);
    const d = inner + Math.pow(rnd(), 0.7) * (outer - inner);
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    const hgt = rr(14, 26);
    const rad = hgt * rr(0.16, 0.22);
    for (let t = 0; t < TI; t++) {
      const hh = hgt * (0.2 - t * 0.012);
      p.set(x + rr(-0.3, 0.3), hgt * 0.22 + t * hgt * 0.085 + hh / 2, z + rr(-0.3, 0.3));
      q.setFromEuler(new THREE.Euler(rr(-0.08, 0.08), rnd() * 6, rr(-0.08, 0.08)));
      const sc = (1 - t * 0.1) * rr(0.8, 1.15);
      s.set(rad * sc, hh, rad * sc);
      m.compose(p, q, s); inst.setMatrixAt(k++, m);
    }
    p.set(x, hgt * 0.2, z); s.set(1, hgt * 0.4, 1); m.compose(p, q, s); trunk.setMatrixAt(i, m);
    const c = new THREE.Color(color).offsetHSL(rr(-0.02, 0.02), 0, rr(-0.03, 0.03));
    for (let t = 0; t < TI; t++) inst.setColorAt(k - TI + t, c);
  }
  inst.castShadow = true; trunk.castShadow = true;
  scene.add(inst, trunk);
}

function windowPane(w, h, { interior, emissive = 1.5, frame = 0x0d0d0e, mullions = 0 } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0a0c0e, roughness: 0.04, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02,
    emissive: 0xffffff, emissiveMap: interior, emissiveIntensity: emissive, envMapIntensity: 1.6, reflectivity: 1,
  });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glass);
  g.add(pane);
  const fm = new THREE.MeshStandardMaterial({ color: frame, roughness: 0.5, metalness: 0.4 });
  const t = 0.06, d = 0.1;
  const bars = [
    [w + t * 2, t, 0, h / 2 + t / 2], [w + t * 2, t, 0, -h / 2 - t / 2],
    [t, h, -w / 2 - t / 2, 0], [t, h, w / 2 + t / 2, 0],
  ];
  for (let i = 1; i <= mullions; i++) bars.push([0.04, h, -w / 2 + (w * i) / (mullions + 1), 0]);
  for (const [bw, bh, x, y] of bars) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d), fm);
    b.position.set(x, y, d / 2 - 0.02); b.castShadow = true; g.add(b);
  }
  return g;
}

// Scandinavian gable house. Length along x, width along z.
function house({ L = 15, Wd = 8, Hw = 3.1, R = 3.6, clad, roof = '#1b1c1e', panels = true, interiorWarm = 1, emissive = 1.6, deck = true, pos = [0, 0, 0], rotY = 0, panelFrame }) {
  const grp = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-Wd / 2, 0); shape.lineTo(Wd / 2, 0); shape.lineTo(Wd / 2, Hw); shape.lineTo(0, Hw + R); shape.lineTo(-Wd / 2, Hw); shape.lineTo(-Wd / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false });
  geo.rotateY(Math.PI / 2); geo.translate(-L / 2, 0, 0);
  const cladTex = clad.clone(); cladTex.needsUpdate = true; cladTex.repeat.set(1 / 2.4, 1 / 2.4);
  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: cladTex, roughness: 0.85 }));
  body.castShadow = true; body.receiveShadow = true;
  grp.add(body);

  // plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(L + 0.04, 0.35, Wd + 0.04), new THREE.MeshStandardMaterial({ map: concreteTexture(120), roughness: 0.9 }));
  plinth.position.y = 0.17; plinth.receiveShadow = true; grp.add(plinth);

  // roof slabs
  const a = Math.atan2(R, Wd / 2);
  const sl = Math.hypot(Wd / 2, R);
  const over = 0.3, th = 0.16;
  const seam = seamTexture(roof); seam.repeat.set((L + 0.3) / 0.5, 1);
  const roofMat = new THREE.MeshStandardMaterial({ map: seam, roughness: 0.45, metalness: 0.6 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: roof, roughness: 0.5, metalness: 0.5 });
  const slabGeo = new THREE.BoxGeometry(L + 0.3, th, sl + over);
  const slabs = [];
  for (const side of [1, -1]) {
    const slab = new THREE.Mesh(slabGeo, [edgeMat, edgeMat, roofMat, edgeMat, edgeMat, edgeMat]);
    const dz = (Wd / 2) / sl, dy = -R / sl;
    const cz = side * (Wd / 4 + dz * over / 2) + side * Math.sin(a) * th / 2 * 1;
    const cy = Hw + R / 2 + dy * over / 2 + Math.cos(a) * th / 2;
    slab.position.set(0, cy, cz);
    slab.rotation.x = side * a;
    slab.castShadow = true; slab.receiveShadow = true;
    grp.add(slab); slabs.push(slab);
  }
  // solar array on +z slope
  if (panels) {
    const arr = new THREE.Group();
    arr.position.copy(slabs[0].position);
    arr.rotation.x = a;
    const cols = Math.floor((L - 1.2) / 1.15);
    const rows = Math.max(1, Math.floor((sl - 0.9) / 1.745));
    const x0 = -((cols - 1) * 1.15) / 2;
    const z0 = -((rows - 1) * 1.745) / 2 - 0.05;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p = panel(panelFrame);
      p.position.set(x0 + c * 1.15, th / 2 + 0.07, z0 + r * 1.745);
      arr.add(p);
    }
    grp.add(arr);
  }
  // gable glazing (+x end)
  const interior = interiorTexture(interiorWarm);
  const gw = Wd - 2.2, gh = Hw + R - 1.6;
  const gl = new THREE.Shape();
  gl.moveTo(-gw / 2, 0); gl.lineTo(gw / 2, 0); gl.lineTo(gw / 2, Hw - 0.4);
  const k = R / (Wd / 2);
  gl.lineTo(0.0, Hw - 0.4 + k * (gw / 2)); gl.lineTo(-gw / 2, Hw - 0.4); gl.lineTo(-gw / 2, 0);
  const gGeo = new THREE.ShapeGeometry(gl);
  // normalise uvs
  gGeo.computeBoundingBox();
  const bb = gGeo.boundingBox, uv = gGeo.attributes.uv, ps = gGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (ps.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (ps.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0c0e, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, emissive: 0xffffff, emissiveMap: interior, emissiveIntensity: emissive, envMapIntensity: 1.5 });
  const gable = new THREE.Mesh(gGeo, glassMat);
  gable.rotation.y = Math.PI / 2; gable.position.set(L / 2 + 0.02, 0.35, 0);
  grp.add(gable);
  // gable mullions
  const fm = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.5, metalness: 0.4 });
  const top = Hw - 0.4 + k * (gw / 2);
  for (const z of [-gw / 2, -gw / 6, gw / 6, gw / 2]) {
    const hgt = Hw - 0.4 + k * (gw / 2 - Math.abs(z));
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, hgt, 0.07), fm);
    b.position.set(L / 2 + 0.05, 0.35 + hgt / 2, z); grp.add(b);
  }
  for (const y of [0, 2.5]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, gw), fm);
    b.position.set(L / 2 + 0.05, 0.35 + y, 0); grp.add(b);
  }
  // sloped glazing frames
  for (const s of [1, -1]) {
    const len = Math.hypot(gw / 2, top - (Hw - 0.4));
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, len), fm);
    b.position.set(L / 2 + 0.05, 0.35 + (Hw - 0.4 + top) / 2, s * gw / 4);
    b.rotation.x = s * Math.atan2(top - (Hw - 0.4), gw / 2);
    grp.add(b);
  }
  // long side windows (+z)
  const wins = [[-4.8, 1.2, 2.3], [-2.2, 3.4, 2.5], [2.0, 1.0, 2.3], [4.6, 1.0, 2.3]];
  for (const [x, w, h] of wins) {
    if (Math.abs(x) + w / 2 > L / 2 - 0.5) continue;
    const win = windowPane(w, h, { interior: interiorTexture(interiorWarm, rnd() > 0.5 ? 'living' : 'kitchen'), emissive: emissive * 0.6, mullions: w > 2 ? 1 : 0 });
    win.position.set(x, 0.35 + h / 2 + (h < 2.4 ? 0.2 : 0), Wd / 2 + 0.01);
    grp.add(win);
  }
  // -z side windows
  for (const [x, w, h] of [[-3, 1.2, 1.6], [3.5, 2.4, 2.4]]) {
    const win = windowPane(w, h, { interior: interiorTexture(interiorWarm), emissive: emissive * 0.8 });
    win.position.set(x, 0.35 + h / 2 + 0.3, -Wd / 2 - 0.01); win.rotation.y = Math.PI;
    grp.add(win);
  }
  // deck + gravel
  if (deck) {
    const dk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, Wd + 2), new THREE.MeshStandardMaterial({ map: deckTexture(), roughness: 0.8 }));
    dk.position.set(L / 2 + 2.1, 0.09, 0.4); dk.receiveShadow = true; dk.castShadow = true; grp.add(dk);
  }
  const gravel = new THREE.Mesh(new THREE.PlaneGeometry(L + 1.6, Wd + 1.6), new THREE.MeshStandardMaterial({ map: gravelTexture(), roughness: 1 }));
  gravel.rotation.x = -Math.PI / 2; gravel.position.y = 0.01; gravel.receiveShadow = true; grp.add(gravel);

  grp.position.set(...pos); grp.rotation.y = rotY;
  scene.add(grp);
  return grp;
}

function shrubs(n, area, color = 0x2d3a26) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat);
    const s = rr(0.3, 0.7);
    m.scale.set(s * rr(1, 1.5), s * rr(0.6, 0.9), s * rr(1, 1.5));
    m.position.set(rr(area[0], area[1]), s * 0.4, rr(area[2], area[3]));
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  }
}


function flatRoofBuilding({ L = 90, Wd = 48, Hb = 9, rowsGap = 3.2, color = 0x9aa0a4, tilt = 12, pos = [0, 0, 0], rows, cols }) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(L, Hb, Wd), new THREE.MeshStandardMaterial({ map: seamTexture('#8e9398'), color, roughness: 0.6, metalness: 0.3 }));
  body.material.map.repeat.set(L / 0.6, 1);
  body.position.y = Hb / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(L + 0.6, 0.4, Wd + 0.6), new THREE.MeshStandardMaterial({ map: concreteTexture(112), roughness: 0.95 }));
  roof.material.map.repeat.set(6, 3);
  roof.position.y = Hb + 0.2; roof.receiveShadow = true; g.add(roof);
  const parapet = new THREE.MeshStandardMaterial({ color: 0x5c6166, roughness: 0.6, metalness: 0.4 });
  for (const [w, d, x, z] of [[L + 0.6, 0.3, 0, Wd / 2 + 0.15], [L + 0.6, 0.3, 0, -Wd / 2 - 0.15], [0.3, Wd + 0.6, L / 2 + 0.15, 0], [0.3, Wd + 0.6, -L / 2 - 0.15, 0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), parapet); m.position.set(x, Hb + 0.6, z); m.castShadow = true; g.add(m);
  }
  const t = THREE.MathUtils.degToRad(tilt);
  const nr = rows || Math.floor((Wd - 4) / rowsGap), nc = cols || Math.floor((L - 4) / 1.15);
  const inst = new THREE.InstancedMesh(panelGeo, [silverAlu, silverAlu, panelTop, silverAlu, silverAlu, silverAlu], nr * nc);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(t, 0, 0)), sc = new THREE.Vector3(1, 1, 1);
  let k = 0;
  for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
    if (rnd() < 0.015) continue;
    m.compose(new THREE.Vector3(-L / 2 + 2.6 + c * 1.15, Hb + 0.75, -Wd / 2 + 2.5 + r * rowsGap), q, sc);
    inst.setMatrixAt(k++, m);
  }
  inst.count = k; inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
  // loading docks
  const dockMat = new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.5, metalness: 0.5 });
  for (let i = 0; i < 8; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4, 0.2), dockMat); d.position.set(-L / 2 + 10 + i * 6, 2, Wd / 2 + 0.1); g.add(d);
  }
  g.position.set(...pos); scene.add(g);
  return g;
}

function asphalt(size, pos) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshStandardMaterial({ map: concreteTexture(78), roughness: 0.9 }));
  m.material.map.repeat.set(size[0] / 20, size[1] / 20);
  m.rotation.x = -Math.PI / 2; m.position.set(pos[0], 0.02, pos[1]); m.receiveShadow = true; scene.add(m);
}

function groundArray({ rows = 14, cols = 60, gap = 7, tilt = 30, x0 = -40, z0 = -30 }) {
  const t = THREE.MathUtils.degToRad(tilt);
  const n = rows * cols * 2;
  const inst = new THREE.InstancedMesh(panelGeo, [silverAlu, silverAlu, panelTop, silverAlu, silverAlu, silverAlu], n);
  const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 1, 0.08), silverAlu, rows * cols);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(t, 0, 0, 'YXZ')), sc = new THREE.Vector3(1, 1, 1);
  let k = 0, l = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let s = 0; s < 2; s++) {
    const y = 1.1 + s * Math.sin(t) * 1.75, z = z0 + r * gap - s * Math.cos(t) * 1.75;
    m.compose(new THREE.Vector3(x0 + c * 1.15, y, z), q, sc); inst.setMatrixAt(k++, m);
    if (s === 0 && c % 3 === 0) { m.compose(new THREE.Vector3(x0 + c * 1.15, 0.8, z + 0.3), new THREE.Quaternion(), new THREE.Vector3(1, 1.6, 1)); legs.setMatrixAt(l++, m); }
  }
  legs.count = l; inst.castShadow = true; inst.receiveShadow = true; legs.castShadow = true;
  scene.add(inst, legs);
}

function roundedBox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat); m.castShadow = true; m.receiveShadow = true; return m;
}

// ---------- composer ----------
function render({ bloom = 0.25, radius = 0.6, threshold = 0.85, focus = 0, aperture = 0.00006, maxblur = 0.006 } = {}) {
  const comp = new EffectComposer(renderer);
  comp.setSize(W, H);
  comp.addPass(new RenderPass(scene, camera));
  if (bloom > 0) comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), bloom, radius, threshold));
  if (focus > 0) comp.addPass(new BokehPass(scene, camera, { focus, aperture, maxblur }));
  comp.addPass(new OutputPass());
  comp.render();
  document.title = 'done';
}

// ---------- scenes ----------
const scenes = {

  day() {
    seed = 42;
    const sun = setupSky({ elevation: 30, azimuth: 330, turbidity: 2.4, rayleigh: 1.0, mie: 0.003, mieG: 0.8, exposure: 0.36 });
    scene.fog = new THREE.FogExp2(0xaebccb, 0.0032);
    sunLight(sun, 0xfff1e0, 3.4);
    scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x4d5a3a, 0.8));
    ground({ tint: [78, 104, 56] });
    house({ clad: claddingTexture([188, 184, 176], 6), roof: '#2b2d30', interiorWarm: 0.6, emissive: 0.2, L: 16, R: 3.4 });
    forest({ inner: 60, outer: 190, count: 1000, color: 0x1f3326 });
    camera.fov = 30; camera.position.set(24, 2.0, 27); camera.lookAt(-1.5, 3.9, 0);
    if (H > W) { camera.fov = 46; camera.position.set(8, 1.8, 24); camera.lookAt(2, 3.8, 0); }
    camera.updateProjectionMatrix();
    render({ bloom: 0, focus: H > W ? 25 : 35, aperture: 0.00014, maxblur: 0.01 });
  },
  roof() {
    seed = 7;
    const sun = setupSky({ elevation: 14, azimuth: 300, turbidity: 3, rayleigh: 1.3, mie: 0.005, mieG: 0.85, exposure: 0.45 });
    scene.fog = new THREE.FogExp2(0x8e96a0, 0.0035);
    sunLight(sun, 0xffd2a0, 3.4);
    scene.add(new THREE.HemisphereLight(0xb4c6de, 0x3a3226, 0.6));
    ground({ tint: [60, 74, 44] });
    house({ clad: claddingTexture([36, 35, 34], 7), roof: '#18191b', emissive: 0.4, L: 18 });
    forest({ inner: 60, outer: 190, count: 1000, color: 0x13201a });
    camera.fov = 40; camera.position.set(10.5, 7.3, 7.2); camera.lookAt(-4, 5.2, 1.6);
    camera.updateProjectionMatrix();
    render({ bloom: 0.2, threshold: 0.9, focus: 9, aperture: 0.0004, maxblur: 0.012 });
  },
  night() {
    seed = 1337;
    const sun = setupSky({ elevation: -0.6, azimuth: 296, turbidity: 2, rayleigh: 3, mie: 0.004, mieG: 0.8, exposure: 0.75 });
    scene.fog = new THREE.FogExp2(0x2a3850, 0.007);
    scene.children.filter(o => o instanceof Sky).forEach(o => scene.remove(o));
    scene.background = canvasTex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a14'); gr.addColorStop(0.55, '#1a2740'); gr.addColorStop(0.75, '#3a4a66'); gr.addColorStop(1, '#2a3850'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const moon = sunLight(new THREE.Vector3(-0.4, 0.6, 0.7).normalize(), 0x7f9cc8, 0.6);
    scene.add(new THREE.HemisphereLight(0x3a4c70, 0x0d0f12, 0.5));
    ground({ tint: [36, 44, 34] });
    house({ clad: claddingTexture([36, 35, 34], 7), roof: '#18191b', interiorWarm: 1.0, emissive: 1.5 });
    forest({ inner: 62, outer: 190, count: 1100, color: 0x0e1812 });
    const pl = new THREE.PointLight(0xffb070, 30, 14, 2); pl.position.set(9.5, 1.2, 1); scene.add(pl);
    camera.fov = 32; camera.position.set(25, 1.7, 23); camera.lookAt(-3.2, 4.1, 0);
    camera.updateProjectionMatrix();
    render({ bloom: 0.55, radius: 0.6, threshold: 0.6, focus: 32, aperture: 0.00018, maxblur: 0.012 });
  },
  commercial() {
    seed = 99;
    const sun = setupSky({ elevation: 34, azimuth: 350, turbidity: 3, rayleigh: 1.0, mie: 0.004, mieG: 0.8, exposure: 0.36 });
    scene.fog = new THREE.FogExp2(0xaebccb, 0.0016);
    sunLight(sun, 0xfff0dc, 3.2, 120);
    scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x4d5a3a, 0.8));
    ground({ tint: [74, 96, 54], size: 1600 });
    asphalt([160, 60], [0, 50]);
    flatRoofBuilding({});
    flatRoofBuilding({ L: 60, Wd: 36, pos: [-95, 0, -20], Hb: 8 });
    forest({ inner: 150, outer: 420, count: 1600, color: 0x1f3326 });
    camera.fov = 30; camera.position.set(95, 62, 95); camera.lookAt(-10, 4, -6);
    if (H > W) { camera.fov = 44; camera.position.set(60, 55, 70); camera.lookAt(-5, 6, -6); }
    camera.updateProjectionMatrix();
    render({ bloom: 0.1, threshold: 0.95 });
  },
  field() {
    seed = 5;
    const sun = setupSky({ elevation: 18, azimuth: 330, turbidity: 3.5, rayleigh: 1.4, mie: 0.005, mieG: 0.85, exposure: 0.34 });
    scene.fog = new THREE.FogExp2(0xa3a8ad, 0.0022);
    sunLight(sun, 0xffdcb0, 3.4, 120);
    scene.add(new THREE.HemisphereLight(0xc2d3ea, 0x4d5a3a, 0.7));
    ground({ tint: [84, 100, 52], size: 1600 });
    groundArray({ rows: 16, cols: 90, x0: -60, z0: -70 });
    forest({ inner: 130, outer: 420, count: 1600, color: 0x1a2c20 });
    camera.fov = 34; camera.position.set(58, 14, 44); camera.lookAt(-10, 0, -20);
    camera.updateProjectionMatrix();
    render({ bloom: 0.15, threshold: 0.92, focus: 50, aperture: 0.00008, maxblur: 0.008 });
  },
  battery() {
    seed = 3;
    renderer.toneMappingExposure = 0.9;
    const pm = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x777777);
    const lightPanel = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    lightPanel.position.set(-4, 2, 3); lightPanel.lookAt(0, 0, 0); env.add(lightPanel);
    scene.environment = pm.fromScene(env, 0.04).texture;
    scene.background = new THREE.Color(0xd9d6d0);
    // room
    const wallMat = new THREE.MeshStandardMaterial({ map: concreteTexture(196), roughness: 0.92 });
    wallMat.map.repeat.set(1.5, 1);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallMat); back.position.set(0, 3, 0); back.receiveShadow = true; scene.add(back);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat); side.rotation.y = Math.PI / 2; side.position.set(-4.2, 3, 5); side.receiveShadow = true; scene.add(side);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshStandardMaterial({ map: concreteTexture(120), roughness: 0.55, metalness: 0.05 }));
    floor.material.map.repeat.set(2, 2);
    floor.rotation.x = -Math.PI / 2; floor.position.z = 5; floor.receiveShadow = true; scene.add(floor);
    // oak slats on side
    const oak = new THREE.MeshStandardMaterial({ map: deckTexture(), roughness: 0.7 });
    for (let i = 0; i < 26; i++) { const sl = roundedBox(0.045, 6, 0.06, 0.01, oak); sl.position.set(-4.15, 3, 2.2 + i * 0.11); scene.add(sl); }
    // battery stack
    const shell = new THREE.MeshPhysicalMaterial({ color: 0xf3f2ef, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.35, metalness: 0.4 });
    const led = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0x6ee7a8, emissiveIntensity: 3 });
    for (let i = 0; i < 4; i++) {
      const b = roundedBox(0.72, 0.44, 0.26, 0.04, shell); b.position.set(-0.2, 0.28 + i * 0.46, 0.14); scene.add(b);
      const st = roundedBox(0.3, 0.012, 0.01, 0.004, led); st.position.set(-0.2, 0.28 + i * 0.46 + 0.12, 0.275); scene.add(st);
    }
    const cap = roundedBox(0.74, 0.1, 0.28, 0.03, dark); cap.position.set(-0.2, 0.28 + 4 * 0.46 - 0.18, 0.14); scene.add(cap);
    // second stack
    for (let i = 0; i < 3; i++) {
      const b = roundedBox(0.72, 0.44, 0.26, 0.04, shell); b.position.set(0.7, 0.28 + i * 0.46, 0.14); scene.add(b);
      const st = roundedBox(0.3, 0.012, 0.01, 0.004, led); st.position.set(0.7, 0.28 + i * 0.46 + 0.12, 0.275); scene.add(st);
    }
    const cap2 = roundedBox(0.74, 0.1, 0.28, 0.03, dark); cap2.position.set(0.7, 0.28 + 3 * 0.46 - 0.18, 0.14); scene.add(cap2);
    // inverter
    const inv = roundedBox(0.62, 0.78, 0.2, 0.05, shell); inv.position.set(1.9, 1.75, 0.1); scene.add(inv);
    const scr = roundedBox(0.2, 0.08, 0.01, 0.01, new THREE.MeshStandardMaterial({ color: 0x050607, emissive: 0x9fd8ff, emissiveIntensity: 0.6 })); scr.position.set(1.9, 1.92, 0.205); scene.add(scr);
    const band = roundedBox(0.62, 0.12, 0.205, 0.03, dark); band.position.set(1.9, 1.42, 0.1); scene.add(band);
    // conduits
    const pipe = new THREE.MeshStandardMaterial({ color: 0x2a2c2f, roughness: 0.5, metalness: 0.6 });
    for (const x of [1.78, 2.02]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 12), pipe); c.position.set(x, 0.68, 0.05); scene.add(c); }
    const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 12), pipe); hc.rotation.z = Math.PI / 2; hc.position.set(1.15, 0.05, 0.05); scene.add(hc);
    // light
    const key = new THREE.DirectionalLight(0xfff3e4, 2.6); key.position.set(-6, 7, 6); key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); key.shadow.radius = 8; key.shadow.bias = -0.0002;
    scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8278, 1.1));
    const fill = new THREE.RectAreaLight ? null : null;
    camera.fov = 34; camera.position.set(3.6, 1.35, 5.2); camera.lookAt(0.6, 1.0, 0);
    if (H > W) { camera.fov = 40; camera.position.set(2.2, 1.3, 4.6); camera.lookAt(0.5, 1.0, 0); }
    camera.updateProjectionMatrix();
    render({ bloom: 0.25, threshold: 0.9 });
  },
  hero() {
    const sun = setupSky({ elevation: 6, azimuth: 296, turbidity: 3.5, rayleigh: 1.2, mie: 0.004, mieG: 0.8, exposure: 0.36 });
    scene.fog = new THREE.FogExp2(0x6f7a86, 0.0085);
    sunLight(sun, 0xffc38a, 3.6);
    scene.add(new THREE.HemisphereLight(0xa9bcd6, 0x3a3226, 0.5));
    ground({ tint: [56, 68, 42] });
    house({ clad: claddingTexture([36, 35, 34], 7), roof: '#18191b', interiorWarm: 1.0, emissive: 0.85 });
    forest({ inner: 62, outer: 190, count: 1100, color: 0x122019 });
    const portrait = H > W;
    if (portrait) { camera.fov = 44; camera.position.set(19, 1.6, 20); camera.lookAt(2.5, 3.6, 0); }
    else { camera.fov = 32; camera.position.set(25, 1.7, 23); camera.lookAt(-3.2, 4.1, 0); }
    camera.updateProjectionMatrix();
    render({ bloom: 0.28, radius: 0.55, threshold: 0.92, focus: H > W ? 27 : 32, aperture: 0.00018, maxblur: 0.012 });
  },
};

(scenes[SCENE] || scenes.hero)();
