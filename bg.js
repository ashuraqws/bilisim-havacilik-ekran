/* yayin-v4 — Three.js arka plan katmanı.
   Bilişim: akan veri ağı (düğümler + bağlantılar). Havacılık: hız çizgileri (iz) + toz.
   Tek kalıcı sahne; konu değişince iki grup birbirine solar. Hata olursa CSS arka planı kalır.
   Kalite: piksel oranı 1, düşük güç modu; FPS 24 altında düşerse çözünürlük kademeli azalır. */
import * as THREE from './vendor/three.module.js';
import { MODELS, explodeK } from './models3d.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('bg');
const rand = (a, b) => a + Math.random() * (b - a);

try {
  const W = 1920, H = 1080;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false; // arka plan + panel modelleri aynı karede üst üste çizilir
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
  camera.position.set(0, 0, 26);

  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const dot = new THREE.CanvasTexture(c);

  const pointsMat = (color, size) => new THREE.PointsMaterial({ color, size, map: dot, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const lineMat = (color) => new THREE.LineBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

  /* ---- Panel 3B modelleri: slayttaki .v3d kutusunun üstüne, aynı renderer ile çizilir ---- */
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x16233f })));
  [[30, 10, [0, 30, 10], 3, 0xffffff], [10, 30, [-30, 5, 5], 2, 0x66ccff], [10, 20, [30, 0, -10], 2, 0xffb070]].forEach(([w, h, p, k, col]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...p); m.lookAt(0, 0, 0); envScene.add(m);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  const mounts = new Set();
  const wp = new THREE.Vector3();
  window.mount3D = (el, name) => {
    const build = MODELS[name];
    if (!build || !el) return null;
    const acc = new THREE.Color(stage.dataset.topic === 'havacilik' ? 0xffb347 : 0x35d0ff);
    const sc = new THREE.Scene();
    sc.environment = envTex;
    const m = build(acc);
    sc.add(m.group, new THREE.HemisphereLight(0x88aaff, 0x221100, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(5, 8, 6);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 1.3); // kameradan gelen yumuşak dolgu: karanlık yüzeyler siyah kalmasın
    fill.position.set(0, 2, 10);
    sc.add(fill);
    const rim = new THREE.DirectionalLight(acc, 1.6);
    rim.position.set(-6, 3, -5);
    sc.add(key, rim);
    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    cam.position.set(0, 0, m.dist);
    cam.lookAt(0, 0, 0);
    // parça etiketleri: model açılınca her parçanın yanında adı çıkar
    const labels = (m.parts || []).filter((p) => p.label).map((p) => {
      const d = document.createElement('div');
      d.className = 'lbl'; d.textContent = p.label; d.style.opacity = 0;
      el.appendChild(d);
      return { p, d };
    });
    const ent = { el, slide: el.closest('.slide'), sc, cam, m, labels, t0: null };
    mounts.add(ent);
    return () => {
      mounts.delete(ent);
      sc.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = o.material ? [].concat(o.material) : [];
        mats.forEach((mt) => mt.dispose());
      });
    };
  };

  /* ---- Bilişim: veri ağı ---- */
  const N = 90, pos = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) {
    pos.set([rand(-34, 34), rand(-20, 20), rand(-14, 10)], i * 3);
    vel.push([rand(-0.5, 0.5), rand(-0.5, 0.5), rand(-0.2, 0.2)]);
  }
  const netPts = pointsMat(0x35d0ff, 0.5);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const MAXL = 500, lp = new Float32Array(MAXL * 6);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  lg.setDrawRange(0, 0);
  const netLines = lineMat(0x4aa8ff);
  const net = new THREE.Group();
  net.add(new THREE.Points(pg, netPts), new THREE.LineSegments(lg, netLines));
  scene.add(net);

  /* ---- Havacılık: hız çizgileri ---- */
  const M = 140, sp = new Float32Array(M * 6), meta = [];
  for (let i = 0; i < M; i++) {
    const len = rand(3, 14), x = rand(-48, 48), y = rand(-20, 20), z = rand(-16, 8);
    sp.set([x, y, z, x + len, y, z], i * 6);
    meta.push({ len, speed: rand(6, 22) });
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const streakMat = lineMat(0xffb347);
  const D = 120, dp = new Float32Array(D * 3);
  for (let i = 0; i < D; i++) dp.set([rand(-40, 40), rand(-22, 22), rand(-14, 8)], i * 3);
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dustMat = pointsMat(0xffd08a, 0.35);
  const air = new THREE.Group();
  air.add(new THREE.LineSegments(sg, streakMat), new THREE.Points(dg, dustMat));
  scene.add(air);

  let mixB = 1, mixA = 0, tgtB = 1, tgtA = 0, t = 0;
  const setTopic = () => {
    const tp = stage.dataset.topic;
    tgtB = tp === 'bilisim' ? 1 : 0;
    tgtA = tp === 'havacilik' ? 1 : 0;
  };
  new MutationObserver(setTopic).observe(stage, { attributes: true, attributeFilter: ['data-topic'] });
  setTopic();

  const clock = new THREE.Clock();
  let acc = 0, frames = 0, level = 0, curW = W, curH = H;
  const SIZES = [[1920, 1080], [1280, 720], [960, 540]];

  renderer.setAnimationLoop(() => {
    if (document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.1);
    t += dt;
    const k = Math.min(1, dt * 2.5);
    mixB += (tgtB - mixB) * k; mixA += (tgtA - mixA) * k;

    net.visible = mixB > 0.01; air.visible = mixA > 0.01;
    netPts.opacity = mixB * 0.9; netLines.opacity = mixB * 0.45;
    streakMat.opacity = mixA * 0.55; dustMat.opacity = mixA * 0.7;

    if (net.visible) {
      for (let i = 0; i < N; i++) {
        const v = vel[i];
        for (let a = 0; a < 3; a++) {
          pos[i * 3 + a] += v[a] * dt;
          const lim = a === 0 ? 36 : a === 1 ? 22 : 14;
          if (pos[i * 3 + a] > lim || pos[i * 3 + a] < -lim) v[a] = -v[a];
        }
      }
      let n = 0;
      for (let i = 0; i < N && n < MAXL; i++) {
        for (let j = i + 1; j < N && n < MAXL; j++) {
          const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < 81) { lp.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]], n * 6); n++; }
        }
      }
      lg.setDrawRange(0, n * 2);
      lg.attributes.position.needsUpdate = true;
      pg.attributes.position.needsUpdate = true;
      net.rotation.y = Math.sin(t * 0.08) * 0.25;
    }
    if (air.visible) {
      for (let i = 0; i < M; i++) {
        const m = meta[i];
        sp[i * 6] -= m.speed * dt; sp[i * 6 + 3] -= m.speed * dt;
        if (sp[i * 6 + 3] < -50) { const x = 50 + rand(0, 10); sp[i * 6] = x; sp[i * 6 + 3] = x + m.len; }
      }
      sg.attributes.position.needsUpdate = true;
      air.rotation.z = Math.sin(t * 0.1) * 0.04;
    }
    camera.position.x = Math.sin(t * 0.07) * 3;
    camera.position.y = Math.cos(t * 0.05) * 1.5;
    camera.lookAt(0, 0, 0);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, curW, curH);
    renderer.clear();
    renderer.render(scene, camera);

    if (mounts.size) {
      const S = stage.getBoundingClientRect(), sc = S.width / 1920, f = curW / 1920;
      mounts.forEach((e) => {
        // geçiş sürerken (slayt hareket ediyor/soluyor) model çizilmez; geçiş bitince büyüyerek belirir
        if (e.slide && e.slide.getAnimations().length) { e.t0 = null; e.labels.forEach((l) => { l.d.style.opacity = 0; }); return; }
        const r = e.el.getBoundingClientRect();
        if (!r.width) return;
        if (e.t0 === null) e.t0 = t;
        const w = (r.width / sc) * f, h = (r.height / sc) * f, x = ((r.left - S.left) / sc) * f, y = curH - (((r.top - S.top) / sc) * f + h);
        const k = Math.min(1, (t - e.t0) / 0.9), ease = 1 - Math.pow(1 - k, 3);
        e.cam.aspect = w / h; e.cam.updateProjectionMatrix();
        e.m.group.scale.setScalar(0.65 + 0.35 * ease);
        e.m.update(t);
        renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.setScissorTest(true);
        renderer.clearDepth();
        renderer.render(e.sc, e.cam);
        if (e.labels.length) try {
          const op = Math.max(0, Math.min(1, (explodeK(t) - 0.5) / 0.4));
          const W2 = r.width / sc, H2 = r.height / sc;
          e.labels.forEach((l) => {
            l.p.obj.getWorldPosition(wp);
            wp.project(e.cam);
            l.d.style.transform = 'translate(' + ((wp.x * 0.5 + 0.5) * W2 + 30).toFixed(1) + 'px,' + ((-wp.y * 0.5 + 0.5) * H2 - 14).toFixed(1) + 'px)';
            l.d.style.opacity = op;
          });
        } catch (err) { console.error('[v5] etiket hatası', err); }
      });
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, curW, curH);
    }

    acc += dt; frames++;
    if (acc >= 3) {
      if (frames / acc < 24 && level < SIZES.length - 1) { level++; curW = SIZES[level][0]; curH = SIZES[level][1]; renderer.setSize(curW, curH, false); }
      acc = 0; frames = 0;
    }
  });

  stage.classList.add('gl');
} catch (e) {
  console.error('[v4] 3B arka plan başlatılamadı, CSS arka plan kullanılıyor', e);
}
