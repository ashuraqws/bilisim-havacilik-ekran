/* yayin-v3 — slayt yöneticisi: otomatik akış, çeşitli geçişler, kalıcı çalışma.
   Aynı anda en fazla 2 slayt DOM'da; eski slayt geçiş sonrası temizlenir. */
(function () {
  var DWELL = 16000, TRANS = 1300;
  var stage = document.getElementById('stage'), host = document.getElementById('slides');
  var sweep = document.getElementById('sweep'), bar = document.getElementById('bar');
  var EASE = 'cubic-bezier(.7,0,.2,1)';

  function fit() {
    var s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  var TRANSITIONS = [
    { n: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], o: [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-6%)', opacity: 0 }] },
    { n: [{ transform: 'translateX(100%)' }, { transform: 'none' }], o: [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-35%)', opacity: .2 }] },
    { n: [{ opacity: 0, transform: 'scale(.92)', filter: 'blur(24px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], o: [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.12)', filter: 'blur(24px)' }] },
    { n: [{ transform: 'translateY(100%)' }, { transform: 'none' }], o: [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-25%)', opacity: .2 }] },
    { n: [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)' }], o: [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.06)', opacity: 0 }] }
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var total = SLIDES.length, queue = [], lastTopic = 'havacilik', current = null, tIdx = Math.floor(Math.random() * TRANSITIONS.length);

  // Bilişim ve havacılık dönüşümlü; her turda sıra yeniden karışır, tur geçişinde aynı konu art arda gelmez.
  // Slaytlar serilere (konu başına 4 parça) ayrılır; seri içinde sıra korunur, seriler karışır.
  function seriesOf(topic) {
    var map = {}, groups = [];
    SLIDES.filter(function (s) { return s.topic === topic; }).forEach(function (s) {
      if (!map[s.series]) { map[s.series] = []; groups.push(map[s.series]); }
      map[s.series].push(s);
    });
    groups.forEach(function (g) { g.sort(function (a, b) { return a.part - b.part; }); });
    return shuffle(groups);
  }
  function refill() {
    var b = seriesOf('bilisim'), h = seriesOf('havacilik');
    var firstB = lastTopic !== 'bilisim', gs = [];
    for (var i = 0; i < Math.max(b.length, h.length); i++) {
      var pair = firstB ? [b[i], h[i]] : [h[i], b[i]];
      pair.forEach(function (x) { if (x) gs.push(x); });
    }
    // atölye videoları her turda serilerin arasına serpiştirilir
    shuffle(SLIDES.filter(function (s) { return s.video; })).forEach(function (v) { gs.splice(1 + Math.floor(Math.random() * gs.length), 0, [v]); });
    // bakım kanalı: ?s=Seri Adı ilk turda o seriyi başa alır (denetim için)
    var want = new URLSearchParams(location.search).get('s');
    if (want && !refill.done) {
      refill.done = true;
      for (var q = 0; q < gs.length; q++) if (gs[q][0].series === want) { gs.unshift(gs.splice(q, 1)[0]); break; }
    }
    queue = [].concat.apply([], gs);
  }

  function build(s) {
    var el = document.createElement('section');
    el.className = 'slide'; el.dataset.topic = s.topic;
    if (s.video) {
      el.className = 'slide vslide';
      el.innerHTML = '<div class="top"><span class="tag">ATÖLYEMİZDEN</span></div>' +
        '<video muted playsinline preload="auto" src="' + s.video + '"></video><div class="vcap">' + s.title + '</div>';
      return { el: el, run: function (root, advance) {
        var v = root.querySelector('video');
        v.addEventListener('ended', advance); v.addEventListener('error', advance); // yüklenemeyen video atlanır
        var p = v.play(); if (p && p.catch) p.catch(advance);
        return function () { v.pause(); v.removeAttribute('src'); v.load(); };
      } };
    }
    var tag = s.topic === 'bilisim' ? 'BİLİŞİM TEKNOLOJİLERİ' : 'HAVACILIK';
    var use3d = s.model && window.mount3D; // bg.js yüklenemediyse düz çizime düşer
    var v = use3d
      ? { html: '<div class="v3d"></div>', run: function (root) { return window.mount3D(root.querySelector('.v3d'), s.model); } }
      : s.visual();
    var dots = '';
    for (var d = 0; d < s.parts; d++) dots += '<i class="' + (d < s.part ? 'on' : '') + '"></i>';
    el.innerHTML = '<div class="top"><span class="tag">' + tag + '</span></div>' +
      '<div class="left"><div class="eyebrow"><span>' + s.series + '</span><span class="dots">' + dots + '</span></div><h1>' + s.title + '</h1><ul>' + s.points.map(function (p, i) { return '<li style="--d:' + (0.6 + i * 0.4) + 's">' + p + '</li>'; }).join('') + '</ul></div>' +
      '<div class="vis' + (use3d ? ' v3' : '') + '">' + v.html + '</div>' +
      '<div class="fun"><b>BİLİYOR MUYDUN?</b>' + s.fun + '</div>';
    return { el: el, run: v.run };
  }

  function restartBar(ms) {
    bar.style.animation = 'none'; void bar.offsetWidth;
    if (ms) bar.style.animation = 'fill ' + ms + 'ms linear forwards';
  }

  function doSweep() {
    sweep.animate([{ transform: 'translateX(-100%)', opacity: 0 }, { opacity: .55, offset: .5 }, { transform: 'translateX(380%)', opacity: 0 }],
      { duration: 1200, easing: 'ease-in-out' });
  }

  // Kontrol: sağ ok tuşu bir sonraki slayta geçer (geçiş sürerken basılan tuş yok sayılır)
  var curTimer = null, lastAt = 0;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' || Date.now() - lastAt < TRANS) return;
    clearTimeout(curTimer);
    next();
  });

  function next() {
    var timer; // hata olsa bile akış devam eder
    try {
      if (!queue.length) refill();
      var s = queue.shift();
      timer = setTimeout(next, s.video ? 180000 : DWELL); // video: bitince erken geçilir, 3 dk yedek süre
      curTimer = timer; lastAt = Date.now();
      var b = build(s), old = current;
      stage.dataset.topic = s.topic;
      b.el.style.zIndex = 2;
      host.appendChild(b.el);
      current = { el: b.el, stop: null };
      try {
        current.stop = b.run && b.run(b.el, function () { if (current && current.el === b.el) { clearTimeout(timer); next(); } });
      } catch (e) { console.error('[v3] run', e); }
      lastTopic = s.topic;
      void b.el.offsetWidth;
      b.el.classList.add('live');
      restartBar(s.video ? 0 : DWELL);
      if (old) {
        var t = TRANSITIONS[tIdx++ % TRANSITIONS.length];
        old.el.style.zIndex = 1;
        b.el.animate(t.n, { duration: TRANS, easing: EASE });
        old.el.animate(t.o, { duration: TRANS, easing: EASE, fill: 'forwards' });
        // eski slaytın içeriği geçişin ilk yarısında tamamen silinir; yenisinin altında asılı kalmaz
        old.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: TRANS * 0.5, easing: 'ease-in', fill: 'forwards' });
        doSweep();
        setTimeout(function () { try { old.stop && old.stop(); } catch (e) {} old.el.remove(); }, TRANS + 100);
      }
    } catch (e) {
      console.error('[v3] slayt atlandı', e);
      clearTimeout(timer);
      setTimeout(next, 800);
    }
  }

  // bg.js (modül) DOMContentLoaded'dan önce çalışır; mount3D hazır olsun diye ilk slayt orada başlar
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', next);
  else next();

  // Her gün 04:00'te sayfa yenilenir (GitHub'daki güncel içerik gelsin).
  // İnternet yoksa yenilemez, 10 dk sonra tekrar dener; böylece ekranda hata sayfası çıkmaz.
  (function () {
    function retry() { setTimeout(tryReload, 10 * 60 * 1000); }
    function tryReload() {
      fetch(location.href, { cache: 'no-store' }).then(function (r) { if (r.ok) location.reload(); else retry(); }).catch(retry);
    }
    var n = new Date(), t = new Date(n);
    t.setHours(4, 0, 0, 0);
    if (t <= n) t.setDate(t.getDate() + 1);
    setTimeout(tryReload, t - n);
  })();
})();
