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
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(i * bw, 0, 5, h);
      g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(i * bw + 5, 0, 3, h);
      const gr = g.createLinearGradient(i * bw, 0, (i + 1) * bw, 0); gr.addColorStop(0, 'rgba(0,0,0,0.12)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.04)'); gr.addColorStop(1, 'rgba(0,0,0,0.1)'); g.fillStyle = gr; g.fillRect(i * bw, 0, bw, h);
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
const ALPHA = params.get('alpha') === '1';
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: ALPHA });
if (ALPHA) renderer.setClearColor(0x000000, 0);
const GLASS = { rough: 0.04, cc: 0.02, env: 1.6, clear: 1, spec: 1 };
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
    color: 0x0a0c0e, roughness: GLASS.rough, metalness: 0.0, specularIntensity: GLASS.spec, clearcoat: GLASS.clear, clearcoatRoughness: GLASS.cc,
    emissive: 0xffffff, emissiveMap: interior, emissiveIntensity: emissive, envMapIntensity: GLASS.env, reflectivity: 1,
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
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0c0e, roughness: GLASS.rough, specularIntensity: GLASS.spec, clearcoat: GLASS.clear, clearcoatRoughness: GLASS.cc, emissive: 0xffffff, emissiveMap: interior, emissiveIntensity: emissive, envMapIntensity: 1.5 });
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


// ======================================================================
// Realism helpers (v2): alpha-card foliage, grass blades, AO, grain
// ======================================================================
function needleTexture() {
  return canvasTex(256, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const twig = (x0, y0, x1, y1, n, len) => {
      g.strokeStyle = 'rgba(52,38,26,1)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      for (let i = 0; i < n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (const side of [-1, 1]) {
          const a = Math.atan2(y1 - y0, x1 - x0) + side * rr(0.6, 1.2);
          const l = len * rr(0.6, 1) * (1 - t * 0.4);
          const v = rr(-12, 14);
          g.strokeStyle = `rgba(${34 + v},${58 + v},${36 + v * 0.6},1)`;
          g.lineWidth = rr(1.4, 2.4);
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
        }
      }
    };
    twig(4, h / 2, w - 6, h / 2 + rr(-6, 6), 70, 26);
    for (let k = 0; k < 7; k++) {
      const x = rr(30, w - 60), dir = rnd() > 0.5 ? 1 : -1;
      twig(x, h / 2, x + rr(40, 80), h / 2 + dir * rr(22, 44), 24, 18);
    }
  }, { aniso: 4 });
}
function leafTexture(tint = [96, 128, 46]) {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = rr(20, w - 20), y = rr(20, h - 20);
      const dx = x - w / 2, dy = y - h / 2;
      if (dx * dx + dy * dy > (w / 2 - 14) ** 2) continue;
      const v = rr(-26, 26);
      g.fillStyle = `rgba(${tint[0] + v + rr(-10, 20)},${tint[1] + v},${tint[2] + v * 0.5},1)`;
      g.save(); g.translate(x, y); g.rotate(rnd() * 6.3);
      g.beginPath(); g.ellipse(0, 0, rr(4, 7), rr(2.5, 4.5), 0, 0, 7); g.fill(); g.restore();
    }
  }, { aniso: 4 });
}
function barkTexture(birch = false) {
  return canvasTex(128, 512, (g, w, h) => {
    g.fillStyle = birch ? '#e8e6e0' : '#4a3a2c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < (birch ? 140 : 400); i++) {
      g.fillStyle = birch ? `rgba(20,20,20,${rr(0.4, 0.95)})` : `rgba(${rr(20, 60)},${rr(15, 45)},${rr(10, 30)},0.6)`;
      g.fillRect(rr(0, w), rr(0, h), birch ? rr(6, 40) : rr(2, 6), birch ? rr(1.5, 5) : rr(10, 40));
    }
  }, { aniso: 4 });
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler();

/** Pines built from alpha "branch cards". positions: [[x,z,height], ...] */
function pines(positions, { tint = 0x40603c } = {}) {
  const tex = needleTexture();
  const geo = new THREE.PlaneGeometry(1, 0.5); geo.translate(0.5, 0, 0);
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9, color: tint });
  let count = 0;
  const plan = positions.map(([x, z, hgt]) => {
    const whorls = Math.floor((hgt * 0.78) / 0.42);
    count += whorls * 7 * 2;
    return { x, z, hgt, whorls };
  });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const trunkMat = new THREE.MeshStandardMaterial({ map: barkTexture(false), roughness: 1 });
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.26, 1, 7), trunkMat, positions.length);
  let k = 0;
  const col = new THREE.Color();
  plan.forEach(({ x, z, hgt, whorls }, ti) => {
    const maxR = hgt * rr(0.17, 0.23);
    for (let wI = 0; wI < whorls; wI++) {
      const t = wI / whorls;
      const y = hgt * 0.22 + t * hgt * 0.78;
      const L = maxR * Math.pow(1 - t, 0.85) + 0.35;
      const n = t > 0.85 ? 4 : 7;
      for (let b = 0; b < 7; b++) {
        for (let c = 0; c < 2; c++) {
          if (b >= n) { _s.set(0, 0, 0); _m.compose(_p.set(x, y, z), _q.identity(), _s); inst.setMatrixAt(k++, _m); continue; }
          const yaw = (b / n) * Math.PI * 2 + wI * 1.3 + rr(-0.3, 0.3);
          _e.set(c ? Math.PI / 2 : 0, yaw, rr(-0.55, -0.15), 'YZX');
          _q.setFromEuler(_e);
          const l = L * rr(0.75, 1.15);
          _s.set(l, l * 0.55, 1);
          _m.compose(_p.set(x + rr(-0.05, 0.05), y + rr(-0.1, 0.1), z), _q, _s);
          inst.setMatrixAt(k, _m);
          col.setHSL(rr(0.26, 0.33), rr(0.25, 0.4), rr(0.55, 0.8) * (0.7 + 0.3 * t));
          inst.setColorAt(k++, col);
        }
      }
    }
    _m.compose(_p.set(x, hgt * 0.5, z), _q.identity(), _s.set(hgt * 0.012 + 0.6, hgt, hgt * 0.012 + 0.6));
    trunks.setMatrixAt(ti, _m);
  });
  inst.castShadow = true; inst.receiveShadow = true; trunks.castShadow = true;
  scene.add(inst, trunks);
}

/** Birches: white trunks with leaf-cluster crowns. */
function birches(positions, { tint = [104, 138, 50] } = {}) {
  const tex = leafTexture(tint);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.85 });
  const per = 170;
  const inst = new THREE.InstancedMesh(geo, mat, positions.length * per);
  const trunkMat = new THREE.MeshStandardMaterial({ map: barkTexture(true), roughness: 0.8 });
  const col = new THREE.Color();
  let k = 0;
  positions.forEach(([x, z, hgt]) => {
    const lean = rr(-0.08, 0.08);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.17, hgt, 8), trunkMat);
    tr.position.set(x + lean * hgt * 0.5, hgt / 2, z); tr.rotation.z = -lean; tr.castShadow = true; scene.add(tr);
    const cy = hgt * 0.68, rx = hgt * 0.2, ry = hgt * 0.32;
    for (let i = 0; i < per; i++) {
      const u = rnd() * 6.283, v = Math.acos(rr(-1, 1)), r = Math.cbrt(rnd());
      _p.set(x + lean * cy + Math.sin(v) * Math.cos(u) * rx * r, cy + Math.cos(v) * ry * r, z + Math.sin(v) * Math.sin(u) * rx * r);
      _q.setFromEuler(_e.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3));
      const sz = rr(0.9, 1.6);
      _m.compose(_p, _q, _s.set(sz, sz, sz)); inst.setMatrixAt(k, _m);
      col.setHSL(rr(0.2, 0.27), rr(0.35, 0.5), rr(0.6, 0.9)); inst.setColorAt(k++, col);
    }
  });
  inst.castShadow = true; inst.receiveShadow = true;
  scene.add(inst);
}

/** Instanced grass blades in a rectangle [x0,x1]×[z0,z1]. */
function grassBlades({ x0, x1, z0, z1, count = 120000, tint = [70, 96, 44], height = [0.12, 0.34], avoid = [] }) {
  const seg = 4, wdt = 0.03;
  const pos = [], idx = [], colors = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, w = wdt * (1 - t * 0.9);
    pos.push(-w / 2, t, 0, w / 2, t, 0);
    const c = 0.45 + 0.55 * t; colors.push(c, c, c, c, c, c);
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  // curve
  const pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); pa.setZ(i, y * y * 0.35); }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.95 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const col = new THREE.Color();
  let k = 0;
  for (let i = 0; i < count; i++) {
    const x = rr(x0, x1), z = rr(z0, z1);
    if (avoid.some(([ax0, ax1, az0, az1]) => x > ax0 && x < ax1 && z > az0 && z < az1)) continue;
    const h = rr(height[0], height[1]);
    _q.setFromEuler(_e.set(rr(-0.25, 0.25), rnd() * 6.3, rr(-0.25, 0.25)));
    _m.compose(_p.set(x, 0, z), _q, _s.set(1, h, h)); inst.setMatrixAt(k, _m);
    const v = rr(-0.08, 0.08);
    col.setRGB((tint[0] / 255) * (1 + v + rr(-0.1, 0.15)), (tint[1] / 255) * (1 + v), (tint[2] / 255) * (1 + v)); inst.setColorAt(k++, col);
  }
  inst.count = k; inst.receiveShadow = true;
  scene.add(inst);
}

/** Scatter helper: positions in a ring sector around a centre. */
function scatter(n, { inner, outer, arc = [0, Math.PI * 2], h = [14, 24], center = [0, 0] }) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rr(arc[0], arc[1]), d = inner + Math.sqrt(rnd()) * (outer - inner);
    out.push([center[0] + Math.cos(a) * d, center[1] + Math.sin(a) * d, rr(h[0], h[1])]);
  }
  return out;
}

const GrainShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.035 }, vignette: { value: 0.28 }, seed: { value: 3.7 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; uniform float vignette; uniform float seed; varying vec2 vUv;
    float rand(vec2 co){ return fract(sin(dot(co.xy + seed, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      float n = rand(vUv * 1000.0) - 0.5; c.rgb += n * amount;
      vec2 d = vUv - 0.5; c.rgb *= 1.0 - dot(d, d) * vignette * 2.0;
      c.rgb = mix(c.rgb, c.rgb * vec3(1.02, 1.0, 0.97), 0.6);
      gl_FragColor = c; }`,
};

function render2({ bloom = 0.2, radius = 0.5, threshold = 0.9, focus = 0, aperture = 0.00015, maxblur = 0.01, ao = true, grain = 0.03, vignette = 0.28 } = {}) {
  const comp = new EffectComposer(renderer);
  comp.setSize(W, H);
  comp.addPass(new RenderPass(scene, camera));
  if (ao) { const g = new GTAOPass(scene, camera, W, H); g.output = GTAOPass.OUTPUT.Default; g.blendIntensity = 0.9; g.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1 }); comp.addPass(g); }
  if (bloom > 0) comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), bloom, radius, threshold));
  if (focus > 0) comp.addPass(new BokehPass(scene, camera, { focus, aperture, maxblur }));
  comp.addPass(new OutputPass());
  const gp = new ShaderPass(GrainShader); gp.uniforms.amount.value = grain; gp.uniforms.vignette.value = vignette; comp.addPass(gp);
  comp.render();
  document.title = 'done';
}


// ---- equipment for hotspot / iso scenes ----
function wallEquipment(grp, { x, z, face = 1 }) {
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xf2f2ef, roughness: 0.35, clearcoat: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.4, metalness: 0.4 });
  const led = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0x3ddc84, emissiveIntensity: 2 });
  const out = {};
  const inv = roundedBox(0.55, 0.7, 0.2, 0.04, shell); inv.position.set(x, 1.65, z + face * 0.12); grp.add(inv); out.inverter = inv;
  const scr = roundedBox(0.18, 0.06, 0.01, 0.005, new THREE.MeshStandardMaterial({ color: 0x050607, emissive: 0x7cc8ff, emissiveIntensity: 0.6 })); scr.position.set(x, 1.8, z + face * 0.225); grp.add(scr);
  const bat = roundedBox(0.62, 1.3, 0.24, 0.05, shell); bat.position.set(x + 0.8, 0.85, z + face * 0.14); grp.add(bat); out.battery = bat;
  const bl = roundedBox(0.28, 0.012, 0.01, 0.004, led); bl.position.set(x + 0.8, 1.3, z + face * 0.265); grp.add(bl);
  const band = roundedBox(0.62, 0.1, 0.245, 0.03, dark); band.position.set(x + 0.8, 0.28, z + face * 0.14); grp.add(band);
  const ev = roundedBox(0.3, 0.42, 0.14, 0.04, dark); ev.position.set(x + 1.9, 1.2, z + face * 0.09); grp.add(ev); out.ev = ev;
  const evl = roundedBox(0.12, 0.012, 0.01, 0.004, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0x4fa3ff, emissiveIntensity: 2 })); evl.position.set(x + 1.9, 1.32, z + face * 0.165); grp.add(evl);
  [inv, bat, ev].forEach((m) => (m.castShadow = true));
  return out;
}
function project(obj) {
  const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(camera);
  return [+((v.x + 1) * 50).toFixed(1), +((1 - v.y) * 50).toFixed(1)];
}
function roundTree(x, z, s = 1, color = 0x5d8a3a) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.6 * s, 10), new THREE.MeshStandardMaterial({ color: 0x6b4f37, roughness: 1 }));
  trunk.position.y = 0.8 * s; g.add(trunk);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(0.7, 1.05) * s, 3), mat);
    b.position.set(rr(-0.6, 0.6) * s, (2.2 + rr(-0.3, 1.1)) * s, rr(-0.6, 0.6) * s); b.castShadow = true; b.receiveShadow = true; g.add(b);
  }
  trunk.castShadow = true;
  g.position.set(x, 0, z); scene.add(g);
}
function isoScene(night) {
  seed = 11;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  renderer.toneMappingExposure = night ? 0.9 : 1.0;
  scene.environmentIntensity = night ? 0.12 : 0.55;
  const base = roundedBox(24, 1.4, 24, 1.2, new THREE.MeshStandardMaterial({ color: night ? 0x9aa3ad : 0xe9ecef, roughness: 0.7 }));
  base.position.y = -0.7; scene.add(base);
  const lawn = roundedBox(22.6, 0.3, 22.6, 0.9, new THREE.MeshStandardMaterial({ color: night ? 0x4e7040 : 0x86b25e, roughness: 0.95 })); lawn.position.y = 0.05; lawn.receiveShadow = true; scene.add(lawn);
  const drive = new THREE.Mesh(new THREE.BoxGeometry(5, 0.06, 9.5), new THREE.MeshStandardMaterial({ map: concreteTexture(186), roughness: 0.8 }));
  drive.position.set(6.2, 0.23, 6.4); drive.receiveShadow = true; scene.add(drive);
  const h = house({ L: 11, Wd: 7, Hw: 3.0, R: 3.1, clad: claddingTexture([226, 224, 218], 4), roof: '#26282b', interiorWarm: night ? 1 : 0.6, emissive: night ? 1.4 : 0.15, deck: true, pos: [-1.5, 0.2, -1.5] });
  const eq = wallEquipment(h, { x: 2.9, z: 3.5, face: 1 });
  roundTree(-8.5, 7.5, 1.1); roundTree(8.2, -7.8, 1.25, 0x4f7d33); roundTree(-8.8, -7.2, 0.9, 0x6a9443);
  shrubs(9, [-9, -3, 4.8, 9.5], 0x3f6b2c);
  if (night) {
    scene.add(new THREE.HemisphereLight(0x5a6f99, 0x1a1d24, 0.9));
    const moon = sunLight(new THREE.Vector3(-0.5, 1, 0.3).normalize(), 0x9fb4e0, 0.7, 18); moon.shadow.radius = 4;
    const pl = new THREE.PointLight(0xffb36b, 25, 10, 2); pl.position.set(4, 1.5, 3); scene.add(pl);
  } else {
    scene.add(new THREE.HemisphereLight(0xdfeaf7, 0x7a8466, 1.0));
    const sl = sunLight(new THREE.Vector3(-0.55, 1, 0.45).normalize(), 0xfff4e2, 2.6, 18); sl.shadow.radius = 5;
  }
  const fr = 15;
  const ortho = new THREE.OrthographicCamera(-fr * (W / H), fr * (W / H), fr, -fr, 0.1, 400);
  ortho.position.set(40, 34, 40); ortho.lookAt(0, 1.5, 0);
  renderer.render(scene, ortho);
  scene.updateMatrixWorld();
  console.log('HOTSPOTS ' + JSON.stringify({ inverter: projectWith(eq.inverter, ortho), battery: projectWith(eq.battery, ortho), ev: projectWith(eq.ev, ortho) }));
  document.title = 'done';
}
function projectWith(obj, cam) {
  const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(cam);
  return [+((v.x + 1) * 50).toFixed(1), +((1 - v.y) * 50).toFixed(1)];
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

  pkg6() {
    seed = 61; GLASS.rough = 0.22; GLASS.cc = 0.3; GLASS.clear = 0.25; GLASS.env = 0.9; GLASS.spec = 0.2;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 7, azimuth: 292, turbidity: 3.5, rayleigh: 1.4, mie: 0.005, mieG: 0.85, exposure: 0.42 });
    scene.fog = new THREE.FogExp2(0x939ca3, 0.007);
    sunLight(sun, 0xffc27e, 3.6, 30).shadow.radius = 6;
    scene.add(new THREE.HemisphereLight(0xb5c6dc, 0x40382a, 0.5));
    ground({ tint: [56, 70, 38] });
    house({ L: 10, Wd: 7, Hw: 2.9, R: 3.3, clad: claddingTexture([46, 41, 36], 15), roof: '#1b1c1e', interiorWarm: 0.8, emissive: 0.3, deck: false });
    grassBlades({ x0: -10, x1: 22, z0: -10, z1: 22, count: 140000, tint: [84, 104, 48], height: [0.15, 0.45], avoid: [[-5.8, 5.8, -4.3, 4.9]] });
    pines(scatter(80, { inner: 12, outer: 50, arc: [1.7, 6.0], h: [15, 26] }));
    birches(scatter(10, { inner: 8, outer: 18, arc: [1.8, 4.8], h: [9, 14] }));
    forest({ inner: 55, outer: 180, count: 700, color: 0x16241c });
    camera.fov = 44; camera.position.set(9.5, 1.9, 9.6); camera.lookAt(-1.5, 5.0, -0.5); camera.updateProjectionMatrix();
    render2({ bloom: 0.25, threshold: 0.95, focus: 12, aperture: 0.00022, maxblur: 0.01 });
  },
  pkg8() {
    seed = 81; GLASS.rough = 0.18; GLASS.cc = 0.3; GLASS.clear = 0.3; GLASS.env = 1.0; GLASS.spec = 0.2;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 24, azimuth: 330, turbidity: 5, rayleigh: 1.1, mie: 0.006, mieG: 0.8, exposure: 0.38 });
    scene.fog = new THREE.FogExp2(0xa9b3ba, 0.006);
    sunLight(sun, 0xfff1dc, 2.8, 40).shadow.radius = 8;
    scene.add(new THREE.HemisphereLight(0xc8d6e6, 0x4a4a36, 0.8));
    ground({ tint: [62, 82, 42] });
    house({ L: 14, Wd: 8, Hw: 3.1, R: 3.6, clad: claddingTexture([54, 48, 42], 14), roof: '#1c1d1f', interiorWarm: 0.6, emissive: 0.15 });
    grassBlades({ x0: -14, x1: 34, z0: -12, z1: 34, count: 170000, tint: [82, 108, 50], avoid: [[-7.4, 7.4, -4.8, 5.4], [6.6, 11.4, -4.6, 5.4]] });
    birches([[13, 14, 13], [15.5, 11, 12], [-12, 9, 14], [-15, 4, 12]].concat(scatter(14, { inner: 12, outer: 26, arc: [1.8, 5.6], h: [10, 16] })));
    pines(scatter(80, { inner: 18, outer: 60, arc: [1.9, 5.9], h: [16, 27] }));
    forest({ inner: 62, outer: 200, count: 800, color: 0x1a2a20 });
    camera.fov = 36; camera.position.set(22, 2.4, 16); camera.lookAt(-1.5, 4.0, 0); camera.updateProjectionMatrix();
    render2({ bloom: 0.1, threshold: 0.95, focus: 26, aperture: 0.00012, maxblur: 0.008 });
  },
  pkg10() {
    seed = 101; GLASS.rough = 0.15; GLASS.cc = 0.25; GLASS.clear = 0.35; GLASS.env = 1.1; GLASS.spec = 0.2;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 26, azimuth: 330, turbidity: 2.6, rayleigh: 1.1, mie: 0.004, mieG: 0.8, exposure: 0.27 });
    scene.fog = new THREE.FogExp2(0xaebccb, 0.0028);
    sunLight(sun, 0xfff4e6, 3.0, 40).shadow.radius = 5;
    scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x4d5a3a, 0.75));
    ground({ tint: [70, 98, 50] });
    house({ L: 16, Wd: 8.5, Hw: 3.2, R: 3.6, clad: claddingTexture([196, 192, 184], 8), roof: '#27292c', interiorWarm: 0.5, emissive: 0.12 });
    grassBlades({ x0: -14, x1: 34, z0: -12, z1: 34, count: 170000, tint: [86, 118, 54], avoid: [[-8.4, 8.4, -5.1, 5.7], [7.6, 12.4, -4.9, 5.6]] });
    pines(scatter(90, { inner: 18, outer: 60, arc: [1.9, 5.9], h: [16, 28] }));
    birches(scatter(10, { inner: 13, outer: 24, arc: [2.0, 5.6], h: [10, 15] }));
    forest({ inner: 62, outer: 200, count: 800, color: 0x1f3326 });
    camera.fov = 34; camera.position.set(19, 1.8, 24); camera.lookAt(-0.5, 4.0, 0); camera.updateProjectionMatrix();
    render2({ bloom: 0.08, threshold: 0.97, focus: 30, aperture: 0.00011, maxblur: 0.008 });
  },
  pkgmax() {
    seed = 121; GLASS.rough = 0.18; GLASS.cc = 0.3; GLASS.clear = 0.3; GLASS.env = 1.0; GLASS.spec = 0.2;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 16, azimuth: 310, turbidity: 3.5, rayleigh: 1.3, mie: 0.005, mieG: 0.84, exposure: 0.4 });
    scene.fog = new THREE.FogExp2(0x9aa6ae, 0.0045);
    sunLight(sun, 0xffd8a8, 3.3, 50).shadow.radius = 6;
    scene.add(new THREE.HemisphereLight(0xbfd0e4, 0x46412e, 0.6));
    ground({ tint: [60, 78, 40] });
    house({ L: 22, Wd: 10, Hw: 3.3, R: 4.3, clad: claddingTexture([48, 43, 38], 14), roof: '#1a1b1d', interiorWarm: 0.8, emissive: 0.3 });
    groundArray({ rows: 2, cols: 16, gap: 5.5, tilt: 30, x0: -9, z0: 16 });
    grassBlades({ x0: -16, x1: 40, z0: -14, z1: 40, count: 190000, tint: [80, 102, 46], avoid: [[-11.4, 11.4, -5.9, 6.6], [10.6, 16, -5.6, 6.6]] });
    pines(scatter(100, { inner: 22, outer: 70, arc: [1.9, 5.9], h: [16, 28] }));
    birches(scatter(12, { inner: 17, outer: 30, arc: [1.9, 5.7], h: [10, 16] }));
    forest({ inner: 72, outer: 220, count: 900, color: 0x16241c });
    camera.fov = 34; camera.position.set(30, 7, 34); camera.lookAt(0, 2.5, 5); camera.updateProjectionMatrix();
    render2({ bloom: 0.18, threshold: 0.93, focus: 40, aperture: 0.0001, maxblur: 0.008 });
  },
  hotspot() {
    seed = 141; GLASS.rough = 0.15; GLASS.cc = 0.25; GLASS.clear = 0.35; GLASS.env = 1.1; GLASS.spec = 0.2;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 26, azimuth: 320, turbidity: 3, rayleigh: 1.1, mie: 0.004, mieG: 0.8, exposure: 0.25 });
    scene.fog = new THREE.FogExp2(0xaebccb, 0.003);
    sunLight(sun, 0xfff3e2, 2.8, 40).shadow.radius = 5;
    scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x4d5a3a, 0.8));
    ground({ tint: [70, 96, 48] });
    const h = house({ L: 15, Wd: 8, Hw: 3.1, R: 3.6, clad: claddingTexture([196, 192, 184], 8), roof: '#27292c', interiorWarm: 0.5, emissive: 0.12 });
    const eq = wallEquipment(h, { x: 5.5, z: 4.0, face: 1 });
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(5, 16), new THREE.MeshStandardMaterial({ map: concreteTexture(170), roughness: 0.85 }));
    drive.rotation.x = -Math.PI / 2; drive.position.set(5.5, 0.02, 12); drive.receiveShadow = true; scene.add(drive);
    grassBlades({ x0: -14, x1: 30, z0: -12, z1: 30, count: 150000, tint: [86, 116, 52], avoid: [[-8.4, 8.4, -4.8, 5.4], [7.1, 12.4, -4.6, 5.4], [3, 8, 4, 30]] });
    pines(scatter(80, { inner: 17, outer: 60, arc: [1.9, 5.9], h: [16, 27] }));
    birches(scatter(12, { inner: 12, outer: 24, arc: [1.8, 5.6], h: [10, 15] }));
    forest({ inner: 62, outer: 200, count: 800, color: 0x1f3326 });
    camera.fov = 38; camera.position.set(13, 2.0, 17.5); camera.lookAt(0.5, 3.4, 1.5); camera.updateProjectionMatrix();
    camera.updateMatrixWorld(); scene.updateMatrixWorld();
    const roofPt = new THREE.Object3D(); roofPt.position.set(-2, 5.3, 2.2); scene.add(roofPt); scene.updateMatrixWorld();
    console.log('HOTSPOTS ' + JSON.stringify({ panels: project(roofPt), inverter: project(eq.inverter), battery: project(eq.battery), ev: project(eq.ev) }));
    render2({ bloom: 0, focus: 16, aperture: 0.0001, maxblur: 0.007 });
  },
  iso() { isoScene(false); },
  isonight() { isoScene(true); },

  hero2() {
    seed = 21;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 9, azimuth: 300, turbidity: 3.2, rayleigh: 1.3, mie: 0.004, mieG: 0.82, exposure: 0.4 });
    scene.fog = new THREE.FogExp2(0x8f9aa3, 0.006);
    const sl = sunLight(sun, 0xffc890, 3.4, 45); sl.shadow.radius = 6; sl.shadow.blurSamples = 16;
    scene.add(new THREE.HemisphereLight(0xb5c6dc, 0x40382a, 0.55));
    ground({ tint: [58, 72, 40] });
    GLASS.rough = 0.22; GLASS.cc = 0.3; GLASS.clear = 0.25; GLASS.env = 0.9; GLASS.spec = 0.2;
    house({ clad: claddingTexture([44, 40, 36], 15), roof: '#1a1b1d', interiorWarm: 0.85, emissive: 0.42 });
    grassBlades({ x0: -14, x1: 34, z0: -12, z1: 34, count: 170000, tint: [78, 100, 46], avoid: [[-8.4, 8.4, -4.8, 5.4], [7.6, 12.4, -4.6, 5.4]] });
    pines(scatter(90, { inner: 16, outer: 60, arc: [1.9, 5.9], h: [16, 27] }));
    birches(scatter(16, { inner: 11, outer: 24, arc: [1.8, 5.8], h: [9, 15] }));
    forest({ inner: 62, outer: 200, count: 900, color: 0x16241c });
    const portrait = H > W;
    if (portrait) { camera.fov = 46; camera.position.set(16, 1.4, 17); camera.lookAt(2.5, 4.4, 0); }
    else { camera.fov = 33; camera.position.set(21, 1.6, 19); camera.lookAt(-2.2, 4.2, 0); }
    camera.updateProjectionMatrix();
    render2({ bloom: 0.22, threshold: 0.92, focus: portrait ? 23 : 28, aperture: 0.00012, maxblur: 0.008 });
  },

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
  commercial2() {
    seed = 99;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const sun = setupSky({ elevation: 22, azimuth: 20, turbidity: 3.2, rayleigh: 1.2, mie: 0.004, mieG: 0.8, exposure: 0.4 });
    scene.fog = new THREE.FogExp2(0xb6c2cd, 0.0018);
    sunLight(sun, 0xffeed6, 3.4, 130).shadow.radius = 3;
    scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x4d5a3a, 0.7));
    ground({ tint: [72, 92, 50], size: 1600 });
    asphalt([160, 60], [0, 50]);
    flatRoofBuilding({ color: 0x8c9297 });
    flatRoofBuilding({ L: 60, Wd: 36, pos: [-95, 0, -20], Hb: 8, color: 0x8c9297 });
    pines(scatter(170, { inner: 60, outer: 170, arc: [3.5, 5.9], h: [18, 28], center: [0, -10] }));
    birches(scatter(14, { inner: 70, outer: 100, arc: [0.3, 1.1], h: [12, 18] }));
    forest({ inner: 170, outer: 420, count: 1400, color: 0x1f3326 });
    camera.fov = 32; camera.position.set(70, 34, 68); camera.lookAt(-8, 6, -4);
    camera.updateProjectionMatrix();
    render2({ bloom: 0, focus: 150, aperture: 0.00003, maxblur: 0.004, ao: true });
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
