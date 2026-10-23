/* yayin-v5 — kodla çizilen 3B modeller (harici model dosyası yok, lisans sorunu yok).
   Her model: (accent: THREE.Color) => { group, dist, update(t) }.
   Modeller bir süre bütün durur, sonra parçalarına ayrılır (patlatılmış görünüm), tekrar birleşir.
   Eksen: x yanal, y yukarı, z öne (burun +z). */
import * as THREE from './vendor/three.module.js';

const M = (o) => new THREE.MeshStandardMaterial(o);
const MP = (o) => new THREE.MeshPhysicalMaterial(o);
const glow = (color, k) => new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(k), toneMapped: false });
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const cyl = (rt, rb, h, mat, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
const grp = (...c) => { const g = new THREE.Group(); g.add(...c); return g; };

/* ---- patlatılmış görünüm: 12 sn döngü (bütün → açılır → açık kalır → kapanır) ---- */
const ease = (x) => x * x * (3 - 2 * x);
function explodeK(t) {
  const c = (t % 12) / 12;
  if (c < 0.2) return 0;
  if (c < 0.4) return ease((c - 0.2) / 0.2);
  if (c < 0.7) return 1;
  if (c < 0.9) return 1 - ease((c - 0.7) / 0.2);
  return 0;
}
const part = (obj, dir, label) => ({ obj, label, base: obj.position.clone(), dir: new THREE.Vector3(dir[0], dir[1], dir[2]) });
const spread = (parts, k) => parts.forEach((p) => p.obj.position.copy(p.base).addScaledVector(p.dir, k));

/* ---------- İşlemci (CPU) ---------- */
function cpu(acc) {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const pcbG = new THREE.Group(); body.add(pcbG);
  pcbG.add(box(7, 0.3, 7, MP({ color: 0x0b1a2e, metalness: 0.4, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 })));
  const gold = M({ color: 0xd4af37, metalness: 1, roughness: 0.28 });
  const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.04, 0.16), gold, 4 * 28);
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 28; i++) {
      const u = -3.25 + i * (6.5 / 27), v = 3.35;
      const [x, z] = side === 0 ? [u, v] : side === 1 ? [u, -v] : side === 2 ? [v, u] : [-v, u];
      m4.setPosition(x, 0.17, z);
      pads.setMatrixAt(k++, m4);
    }
  }
  pcbG.add(pads);
  // yüzey monte kondansatörler (SMD)
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.12, 0.16), M({ color: 0x8a6a3a, metalness: 0.6, roughness: 0.5 }), 48);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, r = 2.95;
    m4.makeRotationY(-a); m4.setPosition(Math.cos(a) * r, 0.2, Math.sin(a) * r);
    caps.setMatrixAt(i, m4);
  }
  pcbG.add(caps);
  const ihs = grp(box(4.6, 0.5, 4.6, M({ color: 0xbfc7d5, metalness: 1, roughness: 0.22 })));
  ihs.position.y = 0.4;
  const top = grp(box(4.2, 0.12, 4.2, M({ color: 0xe6ebf5, metalness: 1, roughness: 0.12 })));
  top.position.y = 0.7;
  const tmat = glow(acc, 1);
  const circ = new THREE.Group(); circ.position.y = 0.78;
  [0.55, 1.05, 1.55, 1.95].forEach((r) => {
    circ.add(box(r * 2, 0.03, 0.06, tmat, 0, 0, r), box(r * 2, 0.03, 0.06, tmat, 0, 0, -r), box(0.06, 0.03, r * 2, tmat, r, 0, 0), box(0.06, 0.03, r * 2, tmat, -r, 0, 0));
  });
  circ.add(box(0.06, 0.03, 4, tmat), box(4, 0.03, 0.06, tmat), box(1, 0.05, 1, tmat, 0, 0.01, 0));
  body.add(ihs, top, circ);
  const parts = [part(pcbG, [0, -1.6, 0], 'Devre kartı (PCB)'), part(ihs, [0, 0.9, 0], 'Isı yayıcı (IHS)'), part(top, [0, 2.0, 0], 'Üst plaka'), part(circ, [0, 3.2, 0], 'Devre yolları ve çekirdek')];
  body.rotation.x = 0.55;
  return { group: g, parts, dist: 11.5, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    body.scale.setScalar(1 - 0.2 * e);
    body.rotation.y = t * 0.35;
    tmat.color.copy(acc).multiplyScalar(0.7 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.2)));
  } };
}

/* ---------- Jet motoru (turbofan) ---------- */
function turbofan(acc) {
  const g = new THREE.Group(), eng = new THREE.Group();
  g.add(eng);
  const cowlM = MP({ color: 0xd9e0ec, metalness: 0.7, roughness: 0.25, side: THREE.DoubleSide, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const liningM = M({ color: 0x2a3446, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide });
  const tiM = M({ color: 0xa5b2c6, metalness: 0.85, roughness: 0.3 });
  const darkM = M({ color: 0x1b2333, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide });
  const P = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const nac = new THREE.Group();
  nac.add(new THREE.Mesh(new THREE.LatheGeometry(P([[2.05, 3.3], [2.28, 2.9], [2.42, 2.1], [2.4, 0.5], [2.25, -1.5], [1.9, -3.0], [1.35, -3.9], [1.1, -4.3]]), 96), cowlM));
  nac.add(new THREE.Mesh(new THREE.LatheGeometry(P([[2.0, 3.3], [1.95, 2.6], [1.9, 1.4], [1.85, 0.4]]), 96), liningM));
  const lip = new THREE.Mesh(new THREE.TorusGeometry(2.03, 0.06, 12, 96), glow(acc, 1.3));
  lip.rotation.x = Math.PI / 2; lip.position.y = 3.3;
  nac.add(lip);
  [[2.1, 2.42], [-0.6, 2.36], [-2.2, 2.08]].forEach(([y, r]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.018, 8, 96), M({ color: 0x3b475e, metalness: 0.8, roughness: 0.4 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = y;
    nac.add(ring);
  });
  nac.add(box(0.5, 3.2, 0.9, M({ color: 0x9aa7bb, metalness: 0.8, roughness: 0.35 }), 0, 0.2, -2.55));
  eng.add(nac);
  const bs = new THREE.Shape();
  bs.moveTo(0.85, -0.26); bs.lineTo(0.85, 0.26);
  bs.quadraticCurveTo(1.5, 0.42, 2.0, 0.3); bs.lineTo(2.0, -0.2);
  bs.quadraticCurveTo(1.5, -0.34, 0.85, -0.26);
  const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  bg.translate(0, 0, -0.025);
  bg.rotateX(Math.PI / 2);
  bg.rotateX(0.5);
  const fan = new THREE.Group();
  fan.position.y = 2.2;
  const blades = new THREE.InstancedMesh(bg, tiM, 24);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3();
  for (let i = 0; i < 24; i++) { q.setFromAxisAngle(up, (i / 24) * Math.PI * 2); m4.compose(zero, q, one); blades.setMatrixAt(i, m4); }
  const spinner = new THREE.Mesh(new THREE.LatheGeometry(P([[0.001, 1.25], [0.22, 1.1], [0.5, 0.8], [0.78, 0.4], [0.9, 0.0], [0.9, -0.4]]), 48), M({ color: 0xe6ebf5, metalness: 0.9, roughness: 0.2 }));
  const sring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.025, 8, 48), glow(acc, 1.2));
  sring.rotation.x = Math.PI / 2; sring.position.y = 0.76;
  fan.add(blades, spinner, sring);
  eng.add(fan);
  const ogv = new THREE.BoxGeometry(1.05, 0.4, 0.03);
  ogv.translate(1.45, 0, 0);
  ogv.rotateY(0.25);
  const vanes = new THREE.InstancedMesh(ogv, darkM, 40);
  for (let i = 0; i < 40; i++) { q.setFromAxisAngle(up, (i / 40) * Math.PI * 2); m4.compose(new THREE.Vector3(0, 1.3, 0), q, one); vanes.setMatrixAt(i, m4); }
  eng.add(vanes);
  // çekirdek: kompresör kademeleri + yanma odası + türbin
  const core = new THREE.Group();
  core.add(new THREE.Mesh(new THREE.LatheGeometry(P([[0.9, 2.0], [0.82, 1.0], [0.72, 0], [0.56, -1.5], [0.36, -3.2], [0.18, -4.3]]), 48), darkM));
  const stageM = M({ color: acc.clone().multiplyScalar(0.55), metalness: 1, roughness: 0.25 });
  const stages = [];
  [[1.0, 1.1], [0.2, 0.98], [-0.6, 0.86]].forEach(([yy, r]) => {
    const sg = new THREE.BoxGeometry(r - 0.55, 0.05, 0.2);
    sg.translate(0.55 + (r - 0.55) / 2, 0, 0); sg.rotateX(0.5);
    const s = new THREE.InstancedMesh(sg, stageM, 18);
    for (let i = 0; i < 18; i++) { q.setFromAxisAngle(up, (i / 18) * Math.PI * 2); m4.compose(new THREE.Vector3(0, yy, 0), q, one); s.setMatrixAt(i, m4); }
    core.add(s); stages.push(s);
  });
  const burner = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.14, 12, 40), glow(new THREE.Color(0xff7a30), 1.2));
  burner.rotation.x = Math.PI / 2; burner.position.y = -1.2;
  core.add(burner);
  eng.add(core);
  const noz = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.07, 12, 64), glow(new THREE.Color(0xff7a30), 1.5));
  noz.rotation.x = Math.PI / 2; noz.position.y = -4.3;
  eng.add(noz);
  const parts = [part(nac, [0, -4.2, 0], 'Motor gövdesi'), part(noz, [0, -5.6, 0], 'Egzoz nozulu'), part(fan, [0, 3.4, 0], 'Fan kanatları'), part(vanes, [0, 1.6, 0], 'Kılavuz kanatlar'), part(core, [0, -0.2, 0], 'Kompresör ve yanma odası')];
  eng.rotation.x = Math.PI / 2;
  return { group: g, parts, dist: 12.5, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    eng.scale.setScalar(1 - 0.28 * e);
    fan.rotation.y = t * 5;
    stages.forEach((s, i) => { s.rotation.y = -t * (6 + i * 2); });
    g.rotation.y = -0.6 + Math.sin(t * 0.3) * 0.25;
    g.rotation.x = 0.18;
  } };
}

/* ---------- Yolcu uçağı ---------- */
function wingGeo(pts, depth) {
  const s = new THREE.Shape();
  pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function airliner(acc) {
  const g = new THREE.Group(), plane = new THREE.Group();
  g.add(plane);
  const white = MP({ color: 0xeef2f8, metalness: 0.3, roughness: 0.28, side: THREE.DoubleSide, clearcoat: 0.7, clearcoatRoughness: 0.15 });
  const grey = M({ color: 0x9aa7bb, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide });
  const accent = M({ color: acc, metalness: 0.4, roughness: 0.35, side: THREE.DoubleSide });
  const prof = [[0.02, 4.6], [0.35, 4.4], [0.62, 3.8], [0.75, 2.8], [0.78, 1.5], [0.78, -1.5], [0.7, -2.8], [0.5, -3.8], [0.25, -4.6], [0.08, -5.0]];
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48), white);
  fus.rotation.x = Math.PI / 2;
  const win = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), M({ color: 0x0a1a30, emissive: acc, emissiveIntensity: 0.25, roughness: 0.2 }), 52);
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < 26; i++) {
    const z = -1.5 + i * 0.17;
    [-1, 1].forEach((sd) => { m4.setPosition(sd * 0.78 * Math.cos(0.25), 0.78 * Math.sin(0.25), z); win.setMatrixAt(k++, m4); });
  }
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), M({ color: 0x0a1a30, metalness: 0.2, roughness: 0.1 }));
  cockpit.scale.set(1, 0.6, 0.7); cockpit.position.set(0, 0.36, 3.9);
  const fuse = grp(fus, win);
  const wing = new THREE.Mesh(wingGeo([[0.7, 1.0], [5.2, -1.6], [5.2, -2.4], [0.7, -1.4]], 0.14), grey);
  wing.position.y = -0.25;
  const wingL = wing.clone(); wingL.scale.x = -1;
  const stab = new THREE.Mesh(wingGeo([[0.3, -3.7], [2.0, -4.6], [2.0, -5.0], [0.3, -4.3]], 0.1), grey);
  stab.position.y = 0.15;
  const stabL = stab.clone(); stabL.scale.x = -1;
  const fg = new THREE.Shape();
  [[-3.0, 0.5], [-4.5, 2.3], [-5.1, 2.3], [-5.0, 0.4]].forEach(([a, b], i) => (i ? fg.lineTo(a, b) : fg.moveTo(a, b)));
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fg, { depth: 0.1, bevelEnabled: false }), accent);
  fin.geometry.translate(0, 0, -0.05);
  fin.rotation.y = -Math.PI / 2;
  plane.add(fuse, cockpit, wing, wingL, stab, stabL, fin);
  const engines = [-1, 1].map((sd) => {
    const e = new THREE.Group();
    const nac = cyl(0.3, 0.3, 1.3, grey, 24); nac.rotation.x = Math.PI / 2;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 24), accent); lip.position.z = 0.65;
    const inlet = new THREE.Mesh(new THREE.CircleGeometry(0.27, 24), M({ color: 0x0a0f18, roughness: 0.4 })); inlet.position.z = 0.651;
    e.add(nac, lip, inlet, box(0.1, 0.4, 0.8, grey, 0, 0.3, -0.1));
    e.position.set(sd * 1.9, -0.65, 0.5);
    plane.add(e);
    return part(e, [sd * 2.0, -1.5, 0.6], sd > 0 ? 'Turbofan motor' : undefined);
  });
  const parts = [part(wing, [3.0, -0.3, 0], 'Kanat'), part(wingL, [-3.0, -0.3, 0]), part(stab, [1.8, 0.2, -1.2], 'Yatay stabilizer'), part(stabL, [-1.8, 0.2, -1.2]), part(fin, [0, 2.0, -1.2], 'Dikey kuyruk'), part(cockpit, [0, 1.2, 0.6], 'Kokpit'), ...engines];
  return { group: g, parts, dist: 14, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    plane.scale.setScalar(1 - 0.3 * e);
    plane.rotation.y = t * 0.25;
    plane.rotation.z = Math.sin(t * 0.6) * 0.08;
    plane.rotation.x = 0.2;
  } };
}

/* ---------- Bütünleşik kanat-gövde (geleceğin uçağı) ---------- */
function bwb(acc) {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const skinM = MP({ color: 0x5a7bb0, metalness: 0.7, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, side: THREE.DoubleSide });
  const innerM = M({ color: 0x9aa7bb, metalness: 0.9, roughness: 0.35 });
  const outline = [[0, 4.4], [1.0, 3.0], [5.0, -1.2], [5.0, -1.8], [1.8, -2.0], [0.9, -2.6], [0, -2.4], [-0.9, -2.6], [-1.8, -2.0], [-5.0, -1.8], [-5.0, -1.2], [-1.0, 3.0]];
  const geo = wingGeo(outline, 0.12);
  const topSkin = new THREE.Mesh(geo, skinM); topSkin.position.y = 0.3;
  const botSkin = new THREE.Mesh(geo, skinM); botSkin.position.y = -0.25;
  const inner = new THREE.Group();
  for (let i = -8; i <= 8; i++) {
    const x = i * 0.55, ax = Math.abs(x);
    const front = ax < 1.0 ? 4.4 - ax * 1.4 : 3.0 - (ax - 1.0) * 1.05, back = ax < 0.9 ? -2.5 : -1.9;
    inner.add(box(0.05, 0.4, front - back, innerM, x, 0, (front + back) / 2));
  }
  [-1, 0, 1].forEach((i) => inner.add(box(9.6, 0.08, 0.1, innerM, 0, 0.1, i * 1.2)));
  const cabin = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.28, toneMapped: false, depthWrite: false }));
  cabin.scale.set(1.5, 0.3, 2.6); cabin.position.set(0, 0.02, 0.8);
  const engines = [-1, 1].map((sd) => {
    const e = new THREE.Group();
    const c = cyl(0.38, 0.38, 1.6, M({ color: 0xc6cedb, metalness: 0.9, roughness: 0.25 }), 24); c.rotation.x = Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 32), glow(acc, 1.4)); ring.position.z = 0.8;
    e.add(c, ring);
    e.position.set(sd * 1.1, 0.7, -1.6);
    body.add(e);
    return part(e, [sd * 1.0, 2.4, -0.6], sd > 0 ? 'Elektrikli motor' : undefined);
  });
  body.add(topSkin, botSkin, inner, cabin);
  const parts = [part(topSkin, [0, 2.0, 0], 'Üst kaplama'), part(botSkin, [0, -2.0, 0], 'Alt kaplama'), part(cabin, [0, 0.4, 0.3], 'Yolcu kabini'), ...engines];
  body.rotation.x = 0.7;
  return { group: g, parts, dist: 12.5, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    body.scale.setScalar(1 - 0.22 * e);
    body.rotation.y = t * 0.3;
  } };
}

/* ---------- Sunucu rafı ---------- */
function rack(acc) {
  const g = new THREE.Group(), rk = new THREE.Group();
  g.add(rk);
  const frame = M({ color: 0x2a3550, metalness: 0.9, roughness: 0.35 });
  const unit = MP({ color: 0x0f1b2d, metalness: 0.8, roughness: 0.35, clearcoat: 0.5 });
  const rail = M({ color: 0x33415f, metalness: 0.9, roughness: 0.3 });
  [[-1.6, -1.0], [1.6, -1.0], [-1.6, 1.0], [1.6, 1.0]].forEach(([x, z]) => rk.add(box(0.12, 6.4, 0.12, frame, x, 0, z)));
  const topP = box(3.4, 0.12, 2.3, frame, 0, 3.2, 0), botP = box(3.4, 0.12, 2.3, frame, 0, -3.2, 0);
  rk.add(topP, botP);
  const ledMats = [glow(new THREE.Color(0x3dff7a), 1.3), glow(acc, 1.3), glow(new THREE.Color(0xffb347), 1.3)];
  const leds = [], parts = [part(topP, [0, 1.2, 0], 'Üst plaka'), part(botP, [0, -1.2, 0])];
  for (let i = 0; i < 10; i++) {
    const u = new THREE.Group();
    u.position.y = -2.6 + i * 0.58;
    u.add(box(3.0, 0.46, 2.0, unit), box(3.0, 0.04, 0.04, rail, 0, 0.2, 1.01));
    for (let v = 0; v < 12; v++) u.add(box(0.9, 0.02, 0.02, rail, 0.6, -0.02 + (v % 3) * 0.06, 1.015));
    for (let j = 0; j < 5; j++) {
      const l = box(0.07, 0.07, 0.02, ledMats[(i + j) % 3], -1.25 + j * 0.15, 0, 1.03);
      l.userData.ph = Math.random() * 6;
      leds.push(l); u.add(l);
    }
    rk.add(u);
    parts.push(part(u, [0, (i - 4.5) * 0.3, 1.0 + (i % 2) * 1.6], i % 3 === 0 ? 'Sunucu ' + (i + 1) : undefined));
  }
  return { group: g, parts, dist: 14, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    rk.scale.setScalar(1 - 0.2 * e);
    rk.rotation.y = 0.55 + Math.sin(t * 0.35) * 0.45;
    leds.forEach((l) => { l.visible = Math.sin(t * 4 + l.userData.ph * 3) > -0.3; });
  } };
}

/* ---------- Helikopter ---------- */
function helicopter(acc) {
  const g = new THREE.Group(), heli = new THREE.Group();
  g.add(heli);
  const bodyM = MP({ color: 0x23406b, metalness: 0.6, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const accentM = M({ color: acc, metalness: 0.4, roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), bodyM);
  body.scale.set(0.9, 0.85, 1.7);
  const stripe = box(1.82, 0.08, 2.6, accentM, 0, -0.1, 0.1);
  const cabin = grp(body, stripe);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), M({ color: 0x66ccff, transparent: true, opacity: 0.5, metalness: 0, roughness: 0.05 }));
  glass.scale.set(0.8, 0.6, 1.0); glass.position.set(0, 0.25, 0.85);
  const boom = cyl(0.32, 0.15, 3.6, bodyM, 16); boom.rotation.x = Math.PI / 2; boom.position.z = -2.9;
  const fin = box(0.08, 1.2, 0.8, accentM, 0, 0.6, -4.6); fin.rotation.x = -0.25;
  const bladeM = M({ color: 0x151c2b, metalness: 0.7, roughness: 0.4 });
  const tail = new THREE.Group(); tail.position.set(0.22, 0.75, -4.7);
  tail.add(box(0.04, 1.1, 0.12, bladeM), box(0.04, 0.12, 1.1, bladeM));
  const tailG = grp(boom, fin, tail);
  const mast = cyl(0.1, 0.14, 0.5, M({ color: 0x9aa7bb, metalness: 1, roughness: 0.3 }), 12); mast.position.y = 1.4;
  const rotor = new THREE.Group(); rotor.position.y = 1.62;
  rotor.add(box(7.6, 0.04, 0.28, bladeM), box(0.28, 0.04, 7.6, bladeM));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.8, 48), new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 1.62;
  const rotorG = grp(mast, rotor, disc);
  const skidM = M({ color: 0x9aa7bb, metalness: 1, roughness: 0.3 });
  const skids = new THREE.Group();
  [-0.8, 0.8].forEach((x) => {
    const sk = cyl(0.05, 0.05, 2.8, skidM, 8); sk.rotation.x = Math.PI / 2; sk.position.set(x, -1.25, 0.1);
    skids.add(sk, box(0.05, 0.4, 0.05, skidM, x, -1.05, 0.9), box(0.05, 0.4, 0.05, skidM, x, -1.05, -0.7));
  });
  heli.add(cabin, glass, tailG, rotorG, skids);
  const parts = [part(glass, [0, 1.0, 1.0], 'Kokpit camı'), part(tailG, [0, 0.3, -2.8], 'Kuyruk bomu ve rotoru'), part(rotorG, [0, 2.6, 0], 'Ana rotor'), part(skids, [0, -1.8, 0], 'İniş kızakları')];
  return { group: g, parts, dist: 13, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    heli.scale.setScalar(1 - 0.28 * e);
    rotor.rotation.y = t * 30;
    tail.rotation.x = t * 40;
    heli.position.y = Math.sin(t * 1.1) * 0.2;
    heli.rotation.x = 0.12;
    g.rotation.y = t * 0.3;
  } };
}

/* ---------- Drone (4 pervaneli) ---------- */
function drone(acc) {
  const g = new THREE.Group(), d = new THREE.Group();
  g.add(d);
  const bodyM = MP({ color: 0x1b2438, metalness: 0.7, roughness: 0.3, clearcoat: 0.6 });
  const armM = M({ color: 0x2c3a58, metalness: 0.8, roughness: 0.35 });
  const hull = box(1.1, 0.35, 1.1, bodyM);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: 0xc6cedb, metalness: 1, roughness: 0.2 }));
  dome.position.y = 0.17;
  const ledR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glow(new THREE.Color(0xff3030), 1.6)); ledR.position.set(0.5, 0, 0.56);
  const ledG = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glow(new THREE.Color(0x30ff60), 1.6)); ledG.position.set(-0.5, 0, 0.56);
  const core = grp(hull, ledR, ledG);
  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), M({ color: 0x0f1626, metalness: 0.8, roughness: 0.2 }));
  gimbal.position.set(0, -0.35, 0.45);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glow(acc, 1.4)); lens.position.set(0, -0.35, 0.73);
  const cam = grp(gimbal, lens);
  d.add(core, dome, cam);
  const parts = [part(dome, [0, 1.1, 0], 'Üst kapak'), part(cam, [0, -1.3, 0.8], 'Kamera (gimbal)')], props = [];
  [[1, 1, 1], [-1, 1, -1], [-1, -1, 1], [1, -1, -1]].forEach(([sx, sz, dir]) => {
    const arm = box(2.4, 0.12, 0.16, armM);
    arm.rotation.y = Math.atan2(-sz, sx);
    arm.position.set(sx * 0.8, 0, sz * 0.8);
    const motor = cyl(0.22, 0.22, 0.3, bodyM, 16); motor.position.set(sx * 1.6, 0.05, sz * 1.6);
    const armG = grp(arm, motor);
    const prop = new THREE.Group(); prop.position.set(sx * 1.6, 0.25, sz * 1.6);
    prop.add(box(2.4, 0.03, 0.18, M({ color: 0x0f1626, metalness: 0.6, roughness: 0.4 })));
    prop.userData.dir = dir;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.set(sx * 1.6, 0.25, sz * 1.6);
    const propG = grp(prop, disc);
    d.add(armG, propG);
    parts.push(part(armG, [sx * 0.9, 0, sz * 0.9], sx > 0 && sz > 0 ? 'Kol ve motor' : undefined), part(propG, [sx * 0.9, 1.9, sz * 0.9], sx > 0 && sz < 0 ? 'Pervane' : undefined));
    props.push(prop);
  });
  d.rotation.x = 0.4;
  return { group: g, parts, dist: 10.5, update(t) {
    const e = explodeK(t);
    spread(parts, e);
    d.scale.setScalar(1 - 0.22 * e);
    props.forEach((p) => { p.rotation.y = t * 45 * p.userData.dir; });
    d.position.y = Math.sin(t * 1.3) * 0.25;
    g.rotation.y = t * 0.35;
  } };
}

export { explodeK };
export const MODELS = { cpu, turbofan, airliner, bwb, rack, helicopter, drone };
