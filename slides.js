/* yayin-v3 — içerik: 8 bilişim (9. sınıf) + 8 havacılık slaytı.
   Her slayt: {topic,title,points[],fun,visual()->{html,run?(root)->cleanup}} */
(function () {
  var S = function (inner) { return '<svg viewBox="0 0 640 640" class="svg">' + inner + '</svg>'; };
  var T = function (x, y, s, c) { return '<text class="' + (c || 't') + '" x="' + x + '" y="' + y + '">' + s + '</text>'; };
  var ARROW = '<defs><marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker></defs>';

  /* ---------- BİLİŞİM ---------- */
  function bilesen() {
    var pins = '';
    for (var i = 0; i < 6; i++) {
      var p = 262 + i * 20;
      pins += '<line class="pin" x1="' + p + '" y1="236" x2="' + p + '" y2="250"/><line class="pin" x1="' + p + '" y1="390" x2="' + p + '" y2="404"/>' +
        '<line class="pin" x1="236" y1="' + p + '" x2="250" y2="' + p + '"/><line class="pin" x1="390" y1="' + p + '" x2="404" y2="' + p + '"/>';
    }
    return { html: S(
      '<path class="wire" d="M145 150V320H250"/><path class="wire" d="M145 490V360H250"/><path class="wire" d="M495 150V320H390"/><path class="wire" d="M495 490V360H390"/>' +
      '<rect class="bx" x="40" y="70" width="210" height="80" rx="14"/>' + T(145, 110, 'RAM') +
      '<rect class="bx" x="40" y="490" width="210" height="80" rx="14"/>' + T(145, 530, 'DEPOLAMA') +
      '<rect class="bx" x="390" y="70" width="210" height="80" rx="14"/>' + T(495, 110, 'EKRAN KARTI') +
      '<rect class="bx" x="390" y="490" width="210" height="80" rx="14"/>' + T(495, 530, 'EKRAN') +
      pins + '<rect class="bx pulse" x="250" y="250" width="140" height="140" rx="16" style="fill:var(--ac);fill-opacity:.2"/>' + T(320, 320, 'CPU', 't" style="font-size:38px')) };
  }

  function ikili() {
    var h = '', i;
    for (i = 0; i < 8; i++) {
      h += T(70 + i * 72, 200, 128 >> i, 'ts') + '<g class="bit"><rect x="' + (40 + i * 72) + '" y="225" width="60" height="100" rx="12"/>' + T(70 + i * 72, 275, '0', 't') + '</g>';
    }
    return { html: S(h + T(320, 120, '8 BİT = 1 BAYT', 't" style="font-size:34px;fill:var(--ac)') +
      '<text id="bnum" x="320" y="470" class="t" style="font-size:150px">0</text>' + T(320, 570, '', 'ts" id="bsum" style="font-size:26px')),
      run: function (root) {
        var n = 0, bits = [].slice.call(root.querySelectorAll('.bit')), num = root.querySelector('#bnum'), sum = root.querySelector('#bsum');
        function t() {
          n = (n + 37 + Math.floor(Math.random() * 20)) % 256;
          var parts = [];
          bits.forEach(function (b, i) {
            var on = (n >> (7 - i)) & 1;
            b.classList.toggle('on', !!on); b.querySelector('text').textContent = on;
            if (on) parts.push(128 >> i);
          });
          num.textContent = n; sum.textContent = (parts.length ? parts.join(' + ') : '0') + ' = ' + n;
        }
        t(); var id = setInterval(t, 1400); return function () { clearInterval(id); };
      } };
  }

  function isletim() {
    var L = [['KULLANICI', 'sen'], ['UYGULAMALAR', 'tarayıcı · oyun · ofis'], ['İŞLETİM SİSTEMİ', 'bellek · dosya · süreç yönetimi'], ['DONANIM', 'işlemci · RAM · disk']], h = '';
    L.forEach(function (l, i) {
      var y = 40 + i * 150;
      h += '<rect class="layer" style="animation-delay:' + i + 's" x="60" y="' + y + '" width="520" height="110" rx="20"/>' + T(320, y + 42, l[0]) + T(320, y + 78, l[1], 'ts');
      if (i < 3) h += '<path class="ol" d="M320 ' + (y + 118) + 'v24M308 ' + (y + 132) + 'l12 12l12-12"/>';
    });
    return { html: S(h) };
  }

  function ag() {
    var N = [[110, 120, 'PC'], [530, 120, 'TELEFON'], [110, 520, 'SUNUCU'], [530, 520, 'DİZÜSTÜ']], h = '', p = '';
    N.forEach(function (n, i) {
      h += '<path id="np' + i + '" class="ol" style="opacity:.5" d="M320 320L' + n[0] + ' ' + n[1] + '"/>' +
        '<rect class="bx" x="' + (n[0] - 70) + '" y="' + (n[1] - 36) + '" width="140" height="72" rx="14"/>' + T(n[0], n[1], n[2], 't" style="font-size:22px');
      p += '<circle r="9" class="ac"><animateMotion dur="2.4s" begin="' + (i * 0.6) + 's" repeatCount="indefinite" ' + (i % 2 ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : '') + '><mpath href="#np' + i + '"/></animateMotion></circle>';
    });
    return { html: S(h + '<circle class="bx pulse" cx="320" cy="320" r="56" style="fill:var(--ac);fill-opacity:.2"/>' + T(320, 320, 'ROUTER', 't" style="font-size:20px') + p) };
  }

  function siber() {
    var shield = 'M320 50L540 135V320C540 450 440 540 320 590C200 540 100 450 100 320V135Z';
    return { html: S('<defs><clipPath id="shc"><path d="' + shield + '"/></clipPath></defs>' +
      '<path class="ol pulse" style="fill:var(--ac);fill-opacity:.12;stroke-width:5" d="' + shield + '"/>' +
      '<g clip-path="url(#shc)"><rect class="scan" x="90" y="60" width="460" height="8"/></g>' +
      '<rect class="bx" x="250" y="300" width="140" height="120" rx="16" style="stroke-width:5"/>' +
      '<path class="ol" style="stroke-width:6" d="M280 300V260a40 40 0 0 1 80 0V300"/><circle class="ac" cx="320" cy="355" r="14"/>' +
      T(320, 470, '• • • • • • • • • • • •', 't" style="font-size:30px;letter-spacing:6px')) };
  }

  function algo() {
    function arrow(d) { return '<path class="ol" d="' + d + '" marker-end="url(#ah)"/>'; }
    var h = ARROW +
      arrow('M320 76V108') + arrow('M320 170V208') + arrow('M110 470V528H300') + arrow('M530 470V528H340') + arrow('M320 534V556') +
      '<polyline class="ol" points="190,290 110,290 110,408" marker-end="url(#ah)"/><polyline class="ol" points="450,290 530,290 530,408" marker-end="url(#ah)"/>' +
      '<rect id="fc0" class="bx fc" x="240" y="20" width="160" height="56" rx="28"/>' + T(320, 48, 'BAŞLA') +
      '<polygon id="fc1" class="bx fc" points="270,110 420,110 390,170 240,170"/>' + T(325, 140, 'Sayıyı gir') +
      '<polygon id="fc2" class="bx fc" points="320,210 450,290 320,370 190,290"/>' + T(320, 290, 'Çift mi?') +
      T(150, 270, 'EVET', 'ts') + T(490, 270, 'HAYIR', 'ts') +
      '<rect id="fc3" class="bx fc" x="30" y="410" width="160" height="60" rx="8"/>' + T(110, 440, '"ÇİFT" yaz') +
      '<rect id="fc4" class="bx fc" x="450" y="410" width="160" height="60" rx="8"/>' + T(530, 440, '"TEK" yaz') +
      '<rect id="fc5" class="bx fc" x="240" y="560" width="160" height="56" rx="28"/>' + T(320, 588, 'BİTİR');
    return { html: S(h), run: function (root) {
      var k = 0, A = [0, 1, 2, 3, 5], B = [0, 1, 2, 4, 5], path = A;
      var els = [0, 1, 2, 3, 4, 5].map(function (i) { return root.querySelector('#fc' + i); });
      function t() {
        els.forEach(function (e) { e.classList.remove('hl'); });
        els[path[k]].classList.add('hl');
        if (++k >= path.length) { k = 0; path = path === A ? B : A; }
      }
      t(); var id = setInterval(t, 900); return function () { clearInterval(id); };
    } };
  }

  function python() {
    return { html: '<div class="code"><span id="code"></span><div class="o" id="out"></div></div>', run: function (root) {
      var code = root.querySelector('#code'), out = root.querySelector('#out'), alive = true, timer;
      var src = 'for i in range(1, 4):\n    print("Merhaba", i)';
      function sleep(ms) { return new Promise(function (r) { timer = setTimeout(r, ms); }); }
      (async function () {
        while (alive) {
          code.textContent = ''; out.textContent = '';
          for (var c = 0; c < src.length; c++) { if (!alive) return; code.textContent += src[c]; await sleep(60); }
          await sleep(500);
          for (var i = 1; i < 4; i++) { if (!alive) return; out.textContent += 'Merhaba ' + i + '\n'; await sleep(650); }
          await sleep(2600);
        }
      })();
      return function () { alive = false; clearTimeout(timer); };
    } };
  }

  function yz() {
    var C = [3, 4, 4, 2], X = [110, 250, 390, 530], pos = [], h = '', l = '', n = '';
    C.forEach(function (c, i) { pos[i] = []; for (var j = 0; j < c; j++) pos[i].push([X[i], 320 + (j - (c - 1) / 2) * 110]); });
    for (var i = 0; i < 3; i++) pos[i].forEach(function (a) { pos[i + 1].forEach(function (b) { l += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--ac)" stroke-opacity=".28" stroke-width="2"/>'; }); });
    pos.forEach(function (col, i) { col.forEach(function (p, j) { n += '<circle class="nd" style="animation-delay:' + (i * 0.5 + j * 0.12) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="20"/>'; }); });
    return { html: S(l + n + T(110, 570, 'GİRDİ', 'ts') + T(320, 570, 'GİZLİ KATMANLAR', 'ts') + T(530, 570, 'ÇIKTI', 'ts') + T(320, 60, 'YAPAY SİNİR AĞI', 't" style="font-size:30px;fill:var(--ac)')) };
  }

  /* ---------- HAVACILIK ---------- */
  function planeSide() {
    return '<path d="M150 330C150 300 220 295 420 300C500 303 540 320 560 335C540 350 500 358 420 360C230 365 150 358 150 330Z" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:3"/>' +
      '<path d="M170 318L140 250H190L235 312Z" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:3"/>' +
      '<path d="M300 338L395 338L330 400L290 400Z" style="fill:#33466e;stroke:var(--ac);stroke-width:3"/>' +
      '<circle cx="520" cy="322" r="5" class="ac"/>';
  }
  function dortKuvvet() {
    return { html: S(ARROW + '<g class="bob">' + planeSide() + '</g>' +
      '<g class="arr" style="stroke:var(--ac);stroke-width:7;fill:none"><path d="M320 300V130" marker-end="url(#ah)"/><path d="M320 350V520" marker-end="url(#ah)"/><path d="M420 325H600" marker-end="url(#ah)"/><path d="M250 325H60" marker-end="url(#ah)"/></g>' +
      T(320, 90, 'KALDIRMA') + T(320, 570, 'AĞIRLIK') + '<text class="t" x="600" y="290" style="text-anchor:end">İTKİ</text><text class="t" x="40" y="290" style="text-anchor:start">SÜRÜKLEME</text>') };
  }

  function kanat() {
    var h = '', k, y;
    for (k = 0; k < 5; k++) { y = 245 - k * 32; h += '<path class="flow" style="animation-duration:' + (0.6 + k * 0.08) + 's" d="M10 ' + (y + 70) + ' C150 ' + (y + 70) + ' 200 ' + y + ' 320 ' + y + ' S520 ' + (y + 70) + ' 630 ' + (y + 70) + '"/>'; }
    for (k = 0; k < 4; k++) { y = 350 + k * 34; h += '<path class="flow" style="animation-duration:1.1s" d="M10 ' + (y - 40) + ' C150 ' + (y - 40) + ' 200 ' + y + ' 320 ' + y + ' S520 ' + (y - 40) + ' 630 ' + (y - 40) + '"/>'; }
    return { html: S(h + '<g transform="rotate(-8 320 320)"><path d="M110 320C170 262 340 250 530 318C340 346 210 350 110 320Z" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:4"/></g>' +
      T(320, 60, 'DÜŞÜK BASINÇ', 't" style="fill:var(--ac)') + T(320, 610, 'YÜKSEK BASINÇ', 't" style="fill:var(--ac)') +
      ARROW + '<path class="ol arr" style="stroke-width:7" d="M590 470V340" marker-end="url(#ah)"/>' + T(590, 500, 'KALDIRMA', 'ts')) };
  }

  function jet() {
    var blades = '';
    for (var i = 0; i < 6; i++) blades += '<rect class="zn z1" x="96" y="' + (246 + i * 25) + '" width="12" height="18" rx="3" style="fill:var(--ac)"/>';
    var lbl = function (x, n, s, k) { return '<g class="lb l' + k + '">' + T(x, 478, n, 't" style="font-size:30px;fill:var(--ac)') + T(x, 512, s, 'ts') + '</g>'; };
    return { html: S(
      '<rect x="60" y="225" width="530" height="190" rx="46" style="fill:none;stroke:rgba(255,255,255,.35);stroke-width:3"/>' +
      '<path class="flow" d="M40 200H610"/><path class="flow" d="M40 440H610" style="display:none"/>' +
      '<path class="flow" d="M115 320H300"/><path class="flow hot" d="M390 320H575"/>' + blades +
      '<polygon class="zn z2" points="130,262 300,285 300,355 130,378" style="fill:#2f6aa8;stroke:var(--ac);stroke-width:3"/>' +
      '<rect class="zn z3" x="310" y="285" width="80" height="70" rx="10" style="fill:#ff6b4a;stroke:#ffb347;stroke-width:3"/>' +
      '<polygon class="zn z4" points="400,285 470,262 470,378 400,355" style="fill:#6a5acd;stroke:var(--ac);stroke-width:3"/>' +
      '<polygon class="zn z4" points="480,272 575,292 575,348 480,368" style="fill:#c0413a;stroke:#ffb347;stroke-width:3"/>' +
      lbl(100, '1', 'EMME', 1) + lbl(215, '2', 'SIKIŞTIRMA', 2) + lbl(350, '3', 'YANMA', 3) + lbl(525, '4', 'EGZOZ', 4) +
      T(320, 150, 'TURBOFAN MOTOR KESİTİ', 't" style="font-size:28px')),
      run: function (root) {
        var k = 1;
        function t() {
          [].forEach.call(root.querySelectorAll('.on'), function (e) { e.classList.remove('on'); });
          [].forEach.call(root.querySelectorAll('.z' + k + ',.l' + k), function (e) { e.classList.add('on'); });
          k = k % 4 + 1;
        }
        t(); var id = setInterval(t, 1500); return function () { clearInterval(id); };
      } };
  }

  function profil() {
    var P = 'M30 520H110C190 520 190 200 290 200H400C500 200 490 520 580 520H620';
    return { html: S('<line x1="10" y1="530" x2="630" y2="530" stroke="rgba(255,255,255,.35)" stroke-width="3"/>' +
      '<path id="fp" class="ol" style="stroke-dasharray:4 14;stroke-width:4" d="' + P + '"/>' +
      '<path d="M-16 0L10 -9L16 0L10 9Z" class="ac"><animateMotion dur="9s" repeatCount="indefinite" rotate="auto"><mpath href="#fp"/></animateMotion></path>' +
      T(110, 565, 'KALKIŞ', 'ts') + T(150, 360, 'TIRMANIŞ', 'ts') + T(345, 165, 'SEYİR', 't" style="fill:var(--ac)') + T(500, 360, 'ALÇALMA', 'ts') + T(590, 565, 'İNİŞ', 'ts') +
      T(345, 135, '≈ 10–12 km', 'ts')) };
  }

  function kokpit() {
    var ladder = '';
    [-100, -50, 50, 100].forEach(function (d) { ladder += '<line x1="285" y1="' + (300 + d) + '" x2="355" y2="' + (300 + d) + '" stroke="#fff" stroke-width="3"/>'; });
    return { html: S('<defs><clipPath id="pf"><circle cx="320" cy="300" r="210"/></clipPath></defs>' +
      '<g clip-path="url(#pf)"><g class="hz"><rect x="-300" y="-300" width="1240" height="600" fill="#2a78c8"/><rect x="-300" y="300" width="1240" height="600" fill="#8a5a2b"/>' +
      '<line x1="-300" y1="300" x2="940" y2="300" stroke="#fff" stroke-width="4"/>' + ladder + '</g></g>' +
      '<circle cx="320" cy="300" r="210" class="ol" style="stroke-width:6"/>' +
      '<path d="M215 300H290L320 322L350 300H425" fill="none" stroke="#ffd447" stroke-width="8" stroke-linejoin="round"/>' +
      T(320, 570, 'HIZ 840 km/sa  ·  İRTİFA 11 000 m', 't" style="font-size:26px') + T(320, 30, 'YAPAY UFUK', 'ts')) };
  }

  function heli() {
    return { html: S('<g class="bob">' +
      '<ellipse class="flick" cx="280" cy="285" rx="250" ry="7" style="fill:var(--ac);opacity:.75"/>' +
      '<rect x="272" y="290" width="16" height="36" style="fill:var(--ac)"/>' +
      '<path d="M370 340L560 322L566 340L372 372Z" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:3"/>' +
      '<path d="M545 322L580 268L598 276L570 335Z" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:3"/>' +
      '<ellipse class="flick" cx="588" cy="300" rx="6" ry="38" style="fill:var(--ac);opacity:.8"/>' +
      '<ellipse cx="280" cy="365" rx="115" ry="62" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:3"/>' +
      '<path d="M190 350C200 320 260 318 300 330L300 372L195 378Z" style="fill:#5aa0d8;opacity:.55"/>' +
      '<path class="ol" d="M190 445H380M230 420V445M340 420V445"/></g>' +
      '<path class="flow dn" d="M200 480V610M280 480V610M360 480V610" style="stroke-dasharray:12 16;animation-name:dashr"/>' +
      T(280, 215, 'ANA ROTOR', 't" style="fill:var(--ac)') + T(560, 235, 'KUYRUK ROTORU', 'ts')) };
  }

  function drone() {
    var C = [[150, 150, ''], [490, 150, 'r'], [150, 490, 'r'], [490, 490, '']], h = '';
    C.forEach(function (c) {
      h += '<line x1="320" y1="320" x2="' + c[0] + '" y2="' + c[1] + '" stroke="#33466e" stroke-width="16" stroke-linecap="round"/>' +
        '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="74" fill="none" stroke="var(--ac)" stroke-opacity=".4" stroke-width="2" stroke-dasharray="6 8"/>' +
        '<g class="spin ' + c[2] + '" style="transform-origin:' + c[0] + 'px ' + c[1] + 'px"><line x1="' + (c[0] - 68) + '" y1="' + c[1] + '" x2="' + (c[0] + 68) + '" y2="' + c[1] + '" stroke="var(--ac)" stroke-width="10" stroke-linecap="round"/></g>' +
        '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="12" fill="#2a3a5c" stroke="var(--ac)" stroke-width="3"/>';
    });
    return { html: S('<g class="bob">' + h + '<rect x="268" y="268" width="104" height="104" rx="24" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:4"/><circle cx="320" cy="285" r="12" class="ac"/></g>' +
      T(320, 615, 'Çaprazlardaki pervaneler zıt yönde döner', 'ts')) };
  }

  function gelecek() {
    var wing = 'M320 70L350 200L580 400V430L380 380L360 520L400 560V580L320 560L240 580V560L280 520L260 380L60 430V400L290 200Z';
    return { html: S('<defs><filter id="gl"><feGaussianBlur stdDeviation="8"/></filter></defs>' +
      '<path class="flow dn" d="M190 380V620M450 380V620" style="stroke-width:5"/>' +
      '<g class="bob"><path d="' + wing + '" style="fill:#2a3a5c;stroke:var(--ac);stroke-width:4;stroke-linejoin:round"/>' +
      '<ellipse cx="190" cy="335" rx="16" ry="38" style="fill:#33466e;stroke:var(--ac);stroke-width:3"/><ellipse cx="450" cy="335" rx="16" ry="38" style="fill:#33466e;stroke:var(--ac);stroke-width:3"/>' +
      '<circle class="ac pulse" filter="url(#gl)" cx="190" cy="375" r="16"/><circle class="ac pulse" filter="url(#gl)" cx="450" cy="375" r="16"/></g>' +
      T(320, 30, 'ELEKTRİKLİ · HİDROJEN · SAF', 'ts')) };
  }

  window.SLIDES = [
    { topic: 'bilisim', title: 'Bilgisayarın Parçaları', visual: bilesen, points: [
      'İşlemci (CPU): komutları çalıştırır, hesaplar', 'RAM: açık işlerin geçici belleği; elektrik kesilince silinir', 'SSD/HDD: dosyaları kalıcı saklar', 'Ekran kartı: görüntüyü üretir'],
      fun: 'Modern bir işlemcide milyarlarca transistör bulunur.' },
    { topic: 'bilisim', title: 'İkili Sayı Sistemi', visual: ikili, points: [
      'Bilgisayar yalnızca 0 ve 1 ile çalışır', 'Her basamak 1 bittir; 8 bit = 1 bayt', '1 bayt 0–255 arası sayı tutar', '1 KB = 1024 bayt'],
      fun: 'Harfler de sayıyla saklanır: ASCII tablosunda “A” harfi 65’tir.' },
    { topic: 'bilisim', title: 'İşletim Sistemi', visual: isletim, points: [
      'Donanım ile uygulamalar arasında köprüdür', 'Bellek, dosya ve işlemleri yönetir', 'Örnekler: Windows, Linux, macOS, Android'],
      fun: 'Android, Linux çekirdeği üzerine kuruludur.' },
    { topic: 'bilisim', title: 'Ağlar ve İnternet', visual: ag, points: [
      'Ağ: birbirine bağlı cihazlar topluluğudur', 'Yönlendirici (router) veriyi doğru yola gönderir', 'Veri küçük paketlere bölünerek taşınır', 'Her cihazın bir IP adresi vardır'],
      fun: 'İnternet trafiğinin büyük kısmı deniz altı fiber kablolarla taşınır.' },
    { topic: 'bilisim', title: 'Siber Güvenlik', visual: siber, points: [
      'Uzun ve benzersiz parola kullan (12+ karakter)', 'İki adımlı doğrulamayı aç', 'Şüpheli bağlantı ve eklentilere tıklama (kimlik avı)', 'Yazılımları güncel tut'],
      fun: 'En sık kullanılan parolalar arasında hâlâ “123456” vardır.' },
    { topic: 'bilisim', title: 'Algoritma ve Akış Diyagramı', visual: algo, points: [
      'Algoritma: problemi çözen sıralı adımlar', 'Oval: başla/bitir · Paralelkenar: giriş/çıkış', 'Dikdörtgen: işlem · Eşkenar dörtgen: karar'],
      fun: '“Algoritma” sözcüğü matematikçi El-Harezmî’nin adından gelir.' },
    { topic: 'bilisim', title: 'Python ile Kodlama', visual: python, points: [
      'print() ekrana yazı yazdırır', 'for döngüsü işi tekrarlar', 'Python’da girinti (boşluk) kodun yapısını belirler'],
      fun: 'Python adı yılandan değil, Monty Python ekibinden gelir.' },
    { topic: 'bilisim', title: 'Yapay Zekâ', visual: yz, points: [
      'Makine öğrenmesi: veriden örüntü öğrenir', 'Yapay sinir ağı katmanlı düğümlerden oluşur', 'Örnek: görüntü tanıma, çeviri, öneri sistemleri', 'İyi sonuç için kaliteli ve dengeli veri gerekir'],
      fun: 'Bir model ne kadar çeşitli veriyle eğitilirse genellikle o kadar iyi öğrenir.' },

    { topic: 'havacilik', title: 'Uçuşun Dört Kuvveti', visual: dortKuvvet, points: [
      'Kaldırma: ağırlığa karşı yukarı iter', 'İtki: motorun ürettiği ileri kuvvet', 'Sürükleme: havanın yavaşlatan direnci', 'Sabit hız ve irtifada kuvvetler dengededir'],
      fun: 'Bir yolcu uçağı yaklaşık 800–900 km/sa hızla seyreder.' },
    { topic: 'havacilik', title: 'Kanat Profili', visual: kanat, points: [
      'Kanat havayı aşağı saptırır, tepki olarak yukarı itilir', 'Üst yüzeyde hava hızlanır, basınç düşer', 'Hücum açısı çok artarsa kanat “stall” olur'],
      fun: 'Kanat kesitine havacılıkta “airfoil” denir.' },
    { topic: 'havacilik', title: 'Jet Motoru', visual: jet, points: [
      '1 Emme: fan havayı alır', '2 Sıkıştırma: hava basınçlandırılır', '3 Yanma: yakıtla yanıp genişler', '4 Egzoz: türbin fanı döndürür, gaz itki üretir'],
      fun: 'Modern turbofanlarda havanın büyük kısmı çekirdeği atlayarak (bypass) geçer.' },
    { topic: 'havacilik', title: 'Kalkıştan İnişe', visual: profil, points: [
      'Kalkış: tam itkiyle hızlanıp yerden kesilme', 'Tırmanış: irtifa kazanma', 'Seyir: yaklaşık 10–12 km yükseklikte yatay uçuş', 'Alçalma ve iniş: hız ve irtifa kademeli azaltılır'],
      fun: 'Uçuşun büyük bölümü otopilot yardımıyla seyir evresinde geçer.' },
    { topic: 'havacilik', title: 'Kokpit ve Aviyonik', visual: kokpit, points: [
      'Yapay ufuk: yatış ve yunuslamayı gösterir', 'Altimetre irtifayı, hız göstergesi hızı verir', 'Fly-by-wire: pilot komutları bilgisayar üzerinden iletilir', 'Otopilot rotayı ve irtifayı otomatik tutar'],
      fun: 'Modern kokpitlerde göstergelerin çoğu ekranlara taşındı (“glass cockpit”).' },
    { topic: 'havacilik', title: 'Helikopter', visual: heli, points: [
      'Ana rotor hem kaldırma hem itki üretir', 'Kuyruk rotoru gövdenin dönmesini (tork) engeller', 'Havada asılı kalabilir, dikey kalkıp inebilir'],
      fun: 'Pist gerektirmediği için helikopterler arama-kurtarmada vazgeçilmezdir.' },
    { topic: 'havacilik', title: 'İnsansız Hava Araçları', visual: drone, points: [
      'İHA: pilotsuz, uzaktan veya otomatik uçar', 'Kamera, GPS ve sensörlerle görev yapar', 'Kullanım: haritalama, tarım, arama-kurtarma'],
      fun: 'Türkiye’de geliştirilen Bayraktar TB2 ve ANKA gibi İHA’lar dünya çapında tanınır.' },
    { topic: 'havacilik', title: 'Geleceğin Uçakları', visual: gelecek, points: [
      'Elektrikli ve hibrit tahrik: daha sessiz, daha az emisyon', 'Sürdürülebilir havacılık yakıtı (SAF) karbon salımını azaltır', 'Yeni kanat-gövde tasarımları verimi artırır', 'Milli savaş uçağı KAAN 2024’te ilk uçuşunu yaptı'],
      fun: 'Hidrojenle çalışan yolcu uçakları üzerinde dünyada çalışmalar sürüyor.' }
  ];

  /* ---------- Seriler: her konu 4 parça (1. parça animasyonlu çizim, 2-4 ortak şablonlar) ---------- */
  window.SLIDES.forEach(function (s) { s.series = s.title; s.part = 1; });
  var D = function (i) { return ' style="--d:' + (0.5 + i * 0.25) + 's"'; };
  function steps(l) { return { html: '<div class="gs">' + l.map(function (t, i) { return '<div class="st"' + D(i) + '><b>' + (i + 1) + '</b><span>' + t + '</span></div>'; }).join('') + '</div>' }; }
  function table(cols, rows) {
    return { html: '<div class="gt" style="--n:' + cols.length + '"><div class="gh">' + cols.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' +
      rows.map(function (r, i) { return '<div class="gr"' + D(i) + '>' + r.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>'; }).join('') + '</div>' };
  }
  function stats(c) { return { html: '<div class="gc">' + c.map(function (x, i) { return '<div class="cd"' + D(i) + '><div class="n">' + x[0] + '</div><div class="l">' + x[1] + '</div></div>'; }).join('') + '</div>' }; }
  var topicOf = {};
  window.SLIDES.forEach(function (s) { topicOf[s.series] = s.topic; });
  function X(series, part, title, points, fun, vis) {
    window.SLIDES.push({ topic: topicOf[series], series: series, part: part, title: title, points: points, fun: fun, visual: function () { return vis; } });
  }

  // BİLİŞİM
  X('Bilgisayarın Parçaları', 2, 'Bellek ve Depolama', ['RAM hızlıdır ama geçicidir', 'Depolama yavaştır ama kalıcıdır', 'SSD’de hareketli parça yoktur'],
    'Bir SSD’nin dosya okuma hızı HDD’nin birkaç katıdır.',
    table(['ÖZELLİK', 'HDD', 'SSD'], [['Çalışma', 'Mekanik disk', 'Flash bellek'], ['Hız', 'Yavaş', 'Çok hızlı'], ['Darbe', 'Hassas', 'Dayanıklı'], ['Fiyat (GB)', 'Ucuz', 'Daha pahalı']]));
  X('Bilgisayarın Parçaları', 3, 'Bilgisayar Nasıl Çalışır?', ['Girdi → işlem → çıktı döngüsüyle çalışır', 'Depolama bilgiyi saklar', 'Klavye girdi, ekran çıktı birimidir'],
    'Dokunmatik ekran hem girdi hem çıktı birimidir.',
    steps(['Girdi: klavye, fare, mikrofon', 'İşlem: CPU komutları yürütür', 'Çıktı: ekran, hoparlör, yazıcı', 'Depolama: dosyalar diske kaydedilir']));
  X('Bilgisayarın Parçaları', 4, 'Veri Birimleri', ['En küçük birim bittir (0 veya 1)', 'Her adım 1024 kat büyür', 'Kapasite GB ve TB ile ölçülür'],
    '1 TB = 1024 GB. Telefonlarda sık görülen depolama 128–512 GB’dır.',
    stats([['1 bayt', '8 bit'], ['1 KB', '1024 bayt'], ['1 MB', '1024 KB'], ['1 GB', '1024 MB']]));

  X('İkili Sayı Sistemi', 2, 'Onluktan İkiliye', ['Sayıyı sürekli 2’ye böl', 'Kalanları sondan başa oku', 'Örnek: 13 = 1101'],
    'Bu işlem 13’ün ikilik karşılığını verir: 1101.',
    steps(['13 ÷ 2 = 6, kalan 1', '6 ÷ 2 = 3, kalan 0', '3 ÷ 2 = 1, kalan 1', '1 ÷ 2 = 0, kalan 1', 'Kalanlar sondan başa: 1101']));
  X('İkili Sayı Sistemi', 3, 'Onluk ve İkilik Tablosu', ['Her basamak 2’nin bir kuvvetidir', 'Sağdan sola: 1, 2, 4, 8, 16…', '1 olan basamakların değerleri toplanır'],
    '4 bitle 0’dan 15’e kadar 16 farklı sayı yazılabilir.',
    table(['ONLUK', 'İKİLİK'], [['1', '0001'], ['2', '0010'], ['3', '0011'], ['5', '0101'], ['8', '1000'], ['15', '1111']]));
  X('İkili Sayı Sistemi', 4, 'Harfler de Sayıdır', ['Her karakterin bir sayı karşılığı vardır', 'Bilgisayar bu sayıları ikilik olarak saklar', 'Büyük ve küçük harfler farklı sayılardır'],
    '“A” harfinin ikilik karşılığı 01000001’dir (ASCII).',
    stats([['A', '65'], ['a', '97'], ['0', '48'], ['boşluk', '32']]));

  X('İşletim Sistemi', 2, 'Popüler İşletim Sistemleri', ['Her cihaz türünün kendi işletim sistemi vardır', 'Linux açık kaynaklıdır', 'Android’in çekirdeği Linux’tur'],
    'Birçok web sunucusu Linux ile çalışır.',
    table(['SİSTEM', 'KULLANIM'], [['Windows', 'Masaüstü ve dizüstü'], ['macOS', 'Apple bilgisayarlar'], ['Linux', 'Sunucu ve masaüstü'], ['Android', 'Akıllı telefonlar'], ['iOS', 'iPhone ve iPad']]));
  X('İşletim Sistemi', 3, 'İşletim Sisteminin Görevleri', ['Çalışan programları yönetir', 'Belleği paylaştırır', 'Dosya ve aygıtları yönetir'],
    'Aynı anda birçok program çalışması işletim sisteminin zamanlamasıyla mümkün olur.',
    steps(['Süreç yönetimi: programları çalıştırır', 'Bellek yönetimi: RAM’i paylaştırır', 'Dosya yönetimi: klasörleri düzenler', 'Aygıt yönetimi: yazıcı, fare, ekran']));
  X('İşletim Sistemi', 4, 'Dosya Türleri', ['Uzantı dosyanın türünü gösterir', 'Yanlış uzantı dosyanın açılmasını engelleyebilir', 'Bilinmeyen .exe dosyalarını çalıştırma'],
    'Bir dosyanın uzantısını değiştirmek içeriğini değiştirmez.',
    table(['UZANTI', 'TÜR'], [['.txt', 'Düz metin'], ['.jpg / .png', 'Resim'], ['.mp4', 'Video'], ['.pdf', 'Belge'], ['.exe', 'Çalıştırılabilir program']]));

  X('Ağlar ve İnternet', 2, 'Web Sitesine Nasıl Ulaşırız?', ['Adresi tarayıcıya yazarız', 'DNS adı IP adresine çevirir', 'Sunucu sayfayı bize gönderir'],
    'DNS, internetin telefon rehberi gibidir.',
    steps(['Tarayıcıya adres yazılır', 'DNS: alan adı IP’ye çevrilir', 'İstek sunucuya iletilir', 'Sunucu sayfayı geri gönderir', 'Tarayıcı sayfayı çizer']));
  X('Ağlar ve İnternet', 3, 'Ağ Türleri', ['Ağlar kapladığı alana göre sınıflanır', 'Okul ağı genellikle bir LAN’dır', 'İnternet, birçok ağın birbirine bağlanmasıdır'],
    'Wi-Fi, bir LAN’a kablosuz bağlanma yöntemidir.',
    table(['TÜR', 'KAPSAM'], [['PAN', 'Kişisel (Bluetooth)'], ['LAN', 'Ev, okul, ofis'], ['MAN', 'Şehir'], ['WAN', 'Ülkeler ve kıtalar']]));
  X('Ağlar ve İnternet', 4, 'IP Adresi ve Protokoller', ['IP adresi cihazın ağdaki adresidir', 'Protokol, cihazların konuşma kurallarıdır', 'HTTPS veriyi şifreleyerek taşır'],
    'IPv6, IPv4’ün adres sıkıntısını çözmek için geliştirildi.',
    stats([['IPv4', '32 bitlik adres'], ['IPv6', '128 bitlik adres'], ['HTTP', 'Web protokolü'], ['HTTPS', 'Şifreli web']]));

  X('Siber Güvenlik', 2, 'Güçlü Parola', ['Uzunluk çok önemlidir', 'Kişisel bilgileri parolada kullanma', 'Her hesap için farklı parola seç'],
    'Uzun bir cümle, hatırlaması kolay ve güçlü bir parolaya dönüşebilir.',
    steps(['En az 12 karakter kullan', 'Büyük, küçük harf ve rakam karıştır', 'Sembol ekle (! ? # %)', 'Doğum tarihi, ad gibi bilgilerden kaçın', 'Parola yöneticisi kullan']));
  X('Siber Güvenlik', 3, 'Zararlı Yazılımlar', ['Kötü amaçlı yazılıma “malware” denir', 'Kaynağı belirsiz dosyalar risklidir', 'Antivirüs ve güncelleme korur'],
    'Fidye yazılımına karşı en iyi korunma düzenli yedek almaktır.',
    table(['TÜR', 'NE YAPAR'], [['Virüs', 'Dosyalara bulaşır'], ['Solucan', 'Ağda kendini çoğaltır'], ['Truva atı', 'Zararsız gibi görünür'], ['Fidye yazılımı', 'Dosyaları şifreler'], ['Casus yazılım', 'Bilgi toplar']]));
  X('Siber Güvenlik', 4, 'Korunma Yöntemleri', ['Tek önlem yetmez, katmanlı korun', 'Şüpheli mesajı doğrulamadan açma', 'Önemli dosyaları yedekle'],
    'Kimlik avı saldırılarının çoğu bir bağlantıya tıklatmayla başlar.',
    stats([['2FA', 'İki adımlı doğrulama'], ['Güncelle', 'Yazılım ve sistem'], ['Yedekle', 'Önemli dosyalar'], ['Doğrula', 'Şüpheli bağlantı']]));

  X('Algoritma ve Akış Diyagramı', 2, 'Algoritma Nasıl Yazılır?', ['Önce problemi anla', 'Adımlar net ve sıralı olmalı', 'Her algoritma bitmelidir'],
    'İyi bir algoritma belirsiz ifade içermez.',
    steps(['Problemi tanımla', 'Girdi ve çıktıyı belirle', 'Adımları sırayla yaz', 'Örnek verilerle test et']));
  X('Algoritma ve Akış Diyagramı', 3, 'Akış Diyagramı Sembolleri', ['Her sembolün sabit bir anlamı var', 'Oklar akışın yönünü gösterir', 'Karar sembolünden iki yol çıkar'],
    'Karar sembolü genellikle Evet/Hayır ile iki yola ayrılır.',
    table(['SEMBOL', 'ANLAMI'], [['Oval', 'Başla / Bitir'], ['Dikdörtgen', 'İşlem'], ['Eşkenar dörtgen', 'Karar'], ['Paralelkenar', 'Giriş / Çıkış'], ['Ok', 'Akış yönü']]));
  X('Algoritma ve Akış Diyagramı', 4, 'Örnek: Not Ortalaması', ['Basit problemi adımlara böl', 'Önce topla, sonra böl', 'Sonucu çıktı olarak göster'],
    'Aynı algoritma Python ile birkaç satırda yazılabilir.',
    steps(['Üç sınav notunu gir', 'Notları topla', 'Toplamı 3’e böl', 'Ortalamayı ekrana yaz']));

  X('Python ile Kodlama', 2, 'Python Veri Türleri', ['Her değerin bir türü vardır', 'type() ile türü öğrenebilirsin', 'Metinler tırnak içinde yazılır'],
    'Python’da “5” (metin) ile 5 (sayı) aynı şey değildir.',
    table(['TÜR', 'ANLAMI', 'ÖRNEK'], [['int', 'Tam sayı', '42'], ['float', 'Ondalıklı sayı', '3.14'], ['str', 'Metin', '"Merhaba"'], ['bool', 'Doğru/Yanlış', 'True']]));
  X('Python ile Kodlama', 3, 'if ile Karar Verme', ['Koşul doğruysa blok çalışır', 'Koşulun sonuna : konur', 'Girinti bloğu belirler'],
    'if, elif ve else Python’un karar yapısının anahtar kelimeleridir.',
    steps(['if koşul: doğruysa çalışır', 'Girintili satırlar bloğu oluşturur', 'elif: ek koşulları dener', 'else: hiçbiri doğru değilse çalışır']));
  X('Python ile Kodlama', 4, 'Operatörler', ['Aritmetik işlemler operatörlerle yapılır', '% kalanı verir', '// tam bölme yapar'],
    'Bir sayının çift olup olmadığı sayı % 2 == 0 ile anlaşılır.',
    table(['OPERATÖR', 'İŞLEM', 'ÖRNEK'], [['+  -', 'Toplama, çıkarma', '5 + 2 = 7'], ['*  /', 'Çarpma, bölme', '6 / 2 = 3.0'], ['//', 'Tam bölme', '7 // 2 = 3'], ['%', 'Kalan', '7 % 2 = 1'], ['**', 'Üs alma', '2 ** 3 = 8']]));

  X('Yapay Zekâ', 2, 'Makine Öğrenmesi Adımları', ['Model veriyle eğitilir', 'Eğitimden sonra test edilir', 'Kötü veri kötü sonuç üretir'],
    '“Çöp girerse çöp çıkar” ilkesi yapay zekâda da geçerlidir.',
    steps(['Veri topla', 'Veriyi temizle ve düzenle', 'Modeli eğit', 'Test verisiyle doğrula', 'Gerçek hayatta kullan']));
  X('Yapay Zekâ', 3, 'Öğrenme Türleri', ['Yöntem veriye göre değişir', 'Etiket, doğru cevabı belirtir', 'Pekiştirmede ödül ve ceza vardır'],
    'Oyun oynayan yapay zekâlar pekiştirmeli öğrenmeyle gelişebilir.',
    table(['TÜR', 'NASIL ÖĞRENİR'], [['Denetimli', 'Etiketli örneklerle'], ['Denetimsiz', 'Grupları kendi bulur'], ['Pekiştirmeli', 'Ödül ve cezayla']]));
  X('Yapay Zekâ', 4, 'Günlük Hayatta Yapay Zekâ', ['Telefonlarda sürekli kullanılır', 'Öneri sistemleri izleme geçmişinden öğrenir', 'Hata yapabilir, kontrol et'],
    'Önemli bilgileri yapay zekâya güvenmeden farklı kaynaktan doğrula.',
    table(['UYGULAMA', 'ÖRNEK'], [['Sesli asistan', 'Konuşmayı anlama'], ['Çeviri', 'Anlık metin çevirisi'], ['Öneri', 'Video ve müzik önerisi'], ['Görüntü tanıma', 'Yüz ve nesne bulma'], ['Navigasyon', 'Trafik tahmini']]));

  // HAVACILIK
  X('Uçuşun Dört Kuvveti', 2, 'Uçak Nasıl Havalanır?', ['Kaldırma hızla artar', 'Kaldırma ağırlığı geçince uçak yükselir', 'Bu yüzden uçaklar pistte hızlanır'],
    'Bir yolcu uçağı kalkış için yaklaşık 250–300 km/sa hıza çıkar.',
    steps(['Motorlar itki üretir', 'Uçak pistte hızlanır', 'Kanatlar kaldırma üretir', 'Kaldırma ağırlığı aşar', 'Uçak yerden kesilir']));
  X('Uçuşun Dört Kuvveti', 3, 'Kontrol Yüzeyleri', ['Pilot yüzeyleri oynatarak yönlendirir', 'Her yüzey farklı bir hareketi kontrol eder', 'Flap düşük hızda kaldırmayı artırır'],
    'Kanat uçlarındaki kanatçıklar zıt yönde hareket eder.',
    table(['YÜZEY', 'GÖREVİ'], [['Kanatçık (aileron)', 'Yatış'], ['Yükseltici (elevator)', 'Burun yukarı/aşağı'], ['Dümen (rudder)', 'Sağa/sola dönüş'], ['Flap', 'Düşük hızda kaldırma']]));
  X('Uçuşun Dört Kuvveti', 4, 'Uçağın Üç Ekseni', ['Uçak üç eksen etrafında döner', 'Her eksenin ayrı bir kontrolü var', 'Pilot üçünü birlikte kullanır'],
    'Yatış kanatçıkla, yunuslama yükselticiyle, sapma dümenle kontrol edilir.',
    stats([['Yatış', 'Roll · boyuna eksen'], ['Yunuslama', 'Pitch · yan eksen'], ['Sapma', 'Yaw · dikey eksen'], ['3 eksen', '3 kontrol yüzeyi']]));

  X('Kanat Profili', 2, 'Kanadın Parçaları', ['Kanat birçok parçadan oluşur', 'Hücum kenarı havayı ilk karşılar', 'Firar kenarı havanın ayrıldığı uçtur'],
    'İnişte flaplar açılarak daha düşük hızda uçmak sağlanır.',
    table(['PARÇA', 'GÖREVİ'], [['Hücum kenarı', 'Havayı karşılar'], ['Firar kenarı', 'Havanın ayrıldığı uç'], ['Flap', 'Kaldırmayı artırır'], ['Kanatçık', 'Yatışı kontrol eder'], ['Spoiler', 'Kaldırmayı azaltır']]));
  X('Kanat Profili', 3, 'Kanat Şekilleri', ['Şekil uçağın görevine göre seçilir', 'Ok açılı kanat yüksek hızda verimlidir', 'Düz kanat düşük hızda iyidir'],
    'Planörlerin kanatları çok uzun ve incedir; motorsuz uzun süre süzülürler.',
    stats([['Düz', 'Hafif, yavaş uçaklar'], ['Ok açılı', 'Yolcu jetleri'], ['Delta', 'Hızlı savaş uçakları'], ['Uzun ince', 'Planörler']]));
  X('Kanat Profili', 4, 'Stall: Kaldırma Kaybı', ['Hücum açısı çok artarsa akış kanattan ayrılır', 'Kaldırma aniden düşer', 'Pilot burnu indirerek toparlar'],
    'Stall hızdan çok hücum açısına bağlıdır; yüksek hızda da oluşabilir.',
    steps(['Hücum açısı artar', 'Akış üst yüzeyden ayrılır', 'Kaldırma hızla düşer', 'Burun indirilir, itki artırılır', 'Akış kanada tekrar tutunur']));

  X('Jet Motoru', 2, 'Motor Türleri', ['Görevine göre motor seçilir', 'Yolcu uçaklarında turbofan kullanılır', 'Turboprop kısa mesafede verimlidir'],
    'Turboprop, jet türbinini pervane döndürmek için kullanır.',
    table(['MOTOR', 'KULLANIM'], [['Pistonlu', 'Küçük eğitim uçakları'], ['Turboprop', 'Bölgesel uçaklar'], ['Turbofan', 'Yolcu jetleri'], ['Turbojet', 'Eski ve hızlı jetler']]));
  X('Jet Motoru', 3, 'İtki Nasıl Oluşur?', ['Newton’un 3. yasası: etki–tepki', 'Gaz geriye atılır, uçak ileri gider', 'Daha çok hava, daha çok itki'],
    'Havası boşalan balonun ileri fırlaması aynı ilkedir.',
    steps(['Motor havayı içeri alır', 'Hava sıkıştırılır, yakıtla yanar', 'Sıcak gaz hızla geriye atılır', 'Tepki olarak uçak ileri itilir']));
  X('Jet Motoru', 4, 'Sayılarla Turbofan', ['Büyük motorlar gerçekten büyüktür', 'Seyirde yaklaşık 10 km yükseklikte çalışır', 'Çoğu yolcu uçağında iki motor bulunur'],
    'En büyük turbofanların fan çapı bir odanın genişliğini aşar.',
    stats([['3 m+', 'En büyük fan çapı'], ['10–12 km', 'Seyir irtifası'], ['800–900 km/sa', 'Seyir hızı'], ['2 motor', 'Çoğu yolcu uçağında']]));

  X('Kalkıştan İnişe', 2, 'Kalkış Aşamaları', ['Kalkış çok kontrollü bir süreçtir', 'V1 sonrası kalkış durdurulmaz', 'Burun kalkınca uçak havalanmaya başlar'],
    'V1 hızı her uçuş için önceden hesaplanır.',
    steps(['Pist başında hizalanma', 'Tam itki verilir', 'V1: karar hızı', 'Rotasyon: burun kaldırılır', 'Yerden kesilme, tekerler toplanır']));
  X('Kalkıştan İnişe', 3, 'İniş Aşamaları', ['İniş de adım adım yapılır', 'Flare ile teker teması yumuşatılır', 'Fren ve ters itki uçağı durdurur'],
    'Yolcu uçakları piste yaklaşık 250 km/sa hızla temas eder.',
    steps(['Alçalma ve yaklaşma', 'Final: pist hizasında alçalma', 'Flare: burun hafifçe kaldırılır', 'Teker teması', 'Fren ve ters itki']));
  X('Kalkıştan İnişe', 4, 'Havalimanında Kim Ne Yapar?', ['Havalimanı birçok bölümden oluşur', 'Kule uçakların hareketini koordine eder', 'Taksi yolu uçağı pistle bağlar'],
    'Hava trafik kontrolörleri aynı anda onlarca uçağı yönlendirebilir.',
    table(['BÖLÜM', 'GÖREVİ'], [['Kule', 'Hava trafik kontrolü'], ['Pist', 'Kalkış ve iniş'], ['Taksi yolu', 'Pist–apron bağlantısı'], ['Apron', 'Park ve yolcu alma']]));

  X('Kokpit ve Aviyonik', 2, 'Temel Göstergeler', ['Pilot sürekli göstergelere bakar', 'Yapay ufuk yatış ve yunuslamayı verir', 'Altimetre irtifayı gösterir'],
    'Eski uçaklarda bu göstergeler analog kadranlıydı.',
    table(['GÖSTERGE', 'GÖSTERDİĞİ'], [['Hız göstergesi', 'Uçuş hızı'], ['Yapay ufuk', 'Yatış ve yunuslama'], ['Altimetre', 'İrtifa'], ['Dikey hız', 'Çıkış/alçalma oranı'], ['Pusula', 'Uçuş yönü']]));
  X('Kokpit ve Aviyonik', 3, 'Uçuş Öncesi Kontrol', ['Kontrol listesi hatayı önler', 'Dış gözle muayene yapılır', 'Pilotlar listeyi sesli okur'],
    'Kontrol listeleri havacılığın en önemli güvenlik araçlarındandır.',
    steps(['Uçağın dış kontrolü', 'Kokpit ve sistem kontrolü', 'Motorların çalıştırılması', 'Taksi ve kalkış öncesi kontrol']));
  X('Kokpit ve Aviyonik', 4, 'Uçuş Otomasyonu', ['Otomasyon pilota yardım eder', 'Pilot yine sorumludur', 'Sistemler birbirini doğrular'],
    'TCAS, iki uçak çok yaklaşırsa pilotlara kaçınma talimatı verir.',
    stats([['Otopilot', 'Rota ve irtifayı tutar'], ['FMS', 'Uçuş planını yönetir'], ['TCAS', 'Çarpışma uyarısı'], ['GPS', 'Konum bulma']]));

  X('Helikopter', 2, 'Rotor Kontrolleri', ['Üç ana kontrolü vardır', 'Kollektif yüksekliği değiştirir', 'Siklik yönü belirler'],
    'Siklik kontrol rotor diskini eğerek helikopteri o yöne iter.',
    table(['KONTROL', 'ETKİSİ'], [['Kollektif', 'Yüksel / alçal'], ['Siklik', 'İleri, geri, yana gitme'], ['Pedallar', 'Kuyruk rotoru, yön']]));
  X('Helikopter', 3, 'Havada Asılı Kalma', ['Hover, kaldırma ve ağırlığın dengesidir', 'Küçük hareketler sürekli düzeltilir', 'Çok beceri ister'],
    'Hover, helikopter pilotluğunun en zor becerilerinden biridir.',
    steps(['Kaldırma = ağırlık yapılır', 'Kollektifle yükseklik tutulur', 'Siklik ile konum sabitlenir', 'Pedallarla burun yönü tutulur']));
  X('Helikopter', 4, 'Helikopter Görevleri', ['Pist gerektirmez', 'Zor erişilen yerlere ulaşır', 'Hayat kurtaran görevlerde kullanılır'],
    'Dikey kalkıp indikleri için dar alanlara iniş yapabilirler.',
    table(['GÖREV', 'ÖRNEK'], [['Arama kurtarma', 'Dağ ve deniz'], ['Hava ambulansı', 'Hasta nakli'], ['Yangın söndürme', 'Su taşıma'], ['Yük taşıma', 'Zor araziye malzeme']]));

  X('İnsansız Hava Araçları', 2, 'İHA Türleri', ['İHA’lar yapılarına göre ayrılır', 'Çok pervaneliler havada durabilir', 'Sabit kanatlılar uzun süre uçar'],
    'Sabit kanatlı İHA’lar enerjiyi daha verimli kullandığı için daha uzun uçar.',
    table(['TÜR', 'ÖZELLİK'], [['Çok pervaneli', 'Havada durabilir'], ['Sabit kanatlı', 'Uzun menzil ve süre'], ['Hibrit (VTOL)', 'Dikey kalkış + uzun uçuş']]));
  X('İnsansız Hava Araçları', 3, 'Bir İHA Görevi', ['Görev önceden planlanır', 'Yer istasyonu uçuşu izler', 'Veri uçuş sırasında toplanır'],
    'Bazı İHA’lar kalkıştan inişe tamamen otomatik uçabilir.',
    steps(['Görev planı hazırlanır', 'İHA kalkış yapar', 'Otomatik veya uzaktan uçuş', 'Kamera ve sensör verisi toplanır', 'İniş ve veri analizi']));
  X('İnsansız Hava Araçları', 4, 'İHA’nın Teknolojisi', ['Sensörler İHA’nın gözleridir', 'Konum GPS ile bulunur', 'Kontrol telsizle sağlanır'],
    'IMU, İHA’nın eğimini sürekli ölçerek dengeyi korur.',
    stats([['GPS', 'Konum'], ['IMU', 'Eğim ve ivme sensörü'], ['Kamera', 'Görüntü verisi'], ['Telsiz', 'Yer istasyonu bağlantısı']]));

  X('Geleceğin Uçakları', 2, 'Yeni Yakıt ve Tahrik', ['Amaç emisyonu azaltmak', 'SAF mevcut motorlarda kullanılabilir', 'Hidrojen ve elektrik geliştirme aşamasında'],
    'SAF; atık yağ gibi kaynaklardan üretilebilir.',
    table(['TEKNOLOJİ', 'DURUM'], [['SAF', 'Karışımla kullanılıyor'], ['Hibrit', 'Geliştiriliyor'], ['Elektrik', 'Kısa mesafe, küçük uçak'], ['Hidrojen', 'Araştırma, prototip']]));
  X('Geleceğin Uçakları', 3, 'Yeni Uçak Tasarımları', ['Tasarımda verim ön plandadır', 'eVTOL şehir içi taşımacılık için tasarlanıyor', 'Süpersonik yolcu uçakları yeniden gündemde'],
    'Concorde 2003’te emekli oldu; yeni süpersonik tasarımlar üzerinde çalışılıyor.',
    table(['TASARIM', 'FİKİR'], [['Bütünleşik kanat-gövde', 'Daha az sürükleme'], ['Uzun ince kanat', 'Daha az yakıt'], ['eVTOL', 'Elektrikli dikey kalkış'], ['Süpersonik', 'Ses hızından hızlı uçuş']]));
  X('Geleceğin Uçakları', 4, 'Türk Havacılığı', ['Türkiye kendi hava araçlarını üretiyor', 'KAAN milli savaş uçağıdır', 'İHA’larda dünya çapında tanınıyoruz'],
    'HÜRJET, pilotların jet uçağına geçiş eğitimi için geliştirildi.',
    stats([['KAAN', 'Milli savaş uçağı'], ['Bayraktar TB2', 'Silahlı İHA'], ['ANKA', 'Orta irtifa İHA'], ['HÜRJET', 'Jet eğitim uçağı']]));

  // Her slayta ek madde (seri|parça)
  var MORE = {
    'Bilgisayarın Parçaları|1': 'Anakart tüm parçaları birbirine bağlar',
    'Bilgisayarın Parçaları|2': 'Önbellek (cache), işlemcinin yanındaki çok hızlı küçük bellektir',
    'Bilgisayarın Parçaları|3': 'Güç kaynağı tüm parçalara elektrik dağıtır',
    'Bilgisayarın Parçaları|4': 'Hafıza kartı ve flash bellek de aynı birimlerle ölçülür',
    'İkili Sayı Sistemi|1': 'Onluk sistemde 10, ikilik sistemde 2 rakam kullanılır',
    'İkili Sayı Sistemi|2': 'Kontrol: 1101 = 8 + 4 + 1 = 13',
    'İkili Sayı Sistemi|3': 'Bir basamak eklemek sayı aralığını iki katına çıkarır',
    'İkili Sayı Sistemi|4': 'Türkçe karakterler için Unicode standardı kullanılır',
    'İşletim Sistemi|1': 'Masaüstü arayüzü işletim sisteminin parçasıdır',
    'İşletim Sistemi|2': 'Linux çoğunlukla ücretsizdir ve kaynak kodu açıktır',
    'İşletim Sistemi|3': 'Görev yöneticisi çalışan süreçleri gösterir',
    'İşletim Sistemi|4': 'Dosya yolu, dosyanın yerini gösterir (C:\\Belgeler\\ödev.docx)',
    'Ağlar ve İnternet|1': 'Kablolu bağlantı genellikle kablosuzdan daha kararlıdır',
    'Ağlar ve İnternet|2': 'HTTPS ile açılan sayfalarda bağlantı şifrelenir',
    'Ağlar ve İnternet|3': 'Bir anahtar (switch) çok sayıda cihazı aynı ağa bağlar',
    'Ağlar ve İnternet|4': 'Her alan adının (örn. meb.gov.tr) arkasında bir IP adresi vardır',
    'Siber Güvenlik|1': 'Güvenlik, teknik önlem kadar kullanıcı davranışına da bağlıdır',
    'Siber Güvenlik|2': 'Parolanı kimseyle paylaşma',
    'Siber Güvenlik|3': 'Resmî mağaza dışındaki uygulamalar risklidir',
    'Siber Güvenlik|4': 'Herkese açık Wi-Fi’da önemli işlem yapmaktan kaçın',
    'Algoritma ve Akış Diyagramı|1': 'Algoritma bir yemek tarifine benzer',
    'Algoritma ve Akış Diyagramı|2': 'Algoritma kâğıt üzerinde de denenebilir',
    'Algoritma ve Akış Diyagramı|3': 'Akış diyagramı kodlamadan önce planlamaya yardım eder',
    'Algoritma ve Akış Diyagramı|4': 'Aynı problem için birden çok algoritma yazılabilir',
    'Python ile Kodlama|1': 'Python öğrenmesi kolay, okunaklı bir dildir',
    'Python ile Kodlama|2': 'input() ile kullanıcıdan veri alınır; gelen değer metindir',
    'Python ile Kodlama|3': 'Karşılaştırma için == kullanılır; = ise atama yapar',
    'Python ile Kodlama|4': 'Parantez işlem önceliğini değiştirir',
    'Yapay Zekâ|1': 'Kurallar elle yazılmaz; model veriden öğrenir',
    'Yapay Zekâ|2': 'Model, hiç görmediği veriyle de test edilmelidir',
    'Yapay Zekâ|3': 'Aynı veriyle farklı yöntemler farklı sonuç verebilir',
    'Yapay Zekâ|4': 'Önyargılı veriyle eğitilen model önyargılı sonuç verebilir',
    'Uçuşun Dört Kuvveti|1': 'Hızlanırken itki, sürüklemeden büyüktür',
    'Uçuşun Dört Kuvveti|2': 'Hız arttıkça kanatta oluşan kaldırma da artar',
    'Uçuşun Dört Kuvveti|3': 'Pilot kumanda kolu ve pedallarla yüzeyleri hareket ettirir',
    'Uçuşun Dört Kuvveti|4': 'Üç eksen uçağın ağırlık merkezinden geçer',
    'Kanat Profili|1': 'Kanat kesiti üstte kavisli, altta daha düzdür',
    'Kanat Profili|2': 'Yakıt depoları çoğu uçakta kanadın içindedir',
    'Kanat Profili|3': 'Kanat şekli hız ve verim arasında bir dengedir',
    'Kanat Profili|4': 'Çoğu uçak stall yaklaşırken sesli ve titreşimli uyarı verir',
    'Jet Motoru|1': 'Modern motorlarda itkinin büyük kısmını fan üretir',
    'Jet Motoru|2': 'Motor seçimi hız, menzil ve yakıt verimine göre yapılır',
    'Jet Motoru|3': 'Motor ne kadar çok hava işlerse o kadar çok itki üretir',
    'Jet Motoru|4': 'Motorlar sıkı bir bakım ve kontrol programından geçer',
    'Kalkıştan İnişe|1': 'Uçuş beş evreden oluşur: kalkış, tırmanış, seyir, alçalma, iniş',
    'Kalkıştan İnişe|2': 'Kalkıştan önce pist uzunluğu ve rüzgâr hesaba katılır',
    'Kalkıştan İnişe|3': 'Uçaklar mümkünse rüzgâra karşı kalkar ve iner',
    'Kalkıştan İnişe|4': 'Pistler yön numarasıyla adlandırılır (örn. 35L)',
    'Kokpit ve Aviyonik|1': 'Pilot ve yardımcı pilot görevleri paylaşarak uçar',
    'Kokpit ve Aviyonik|2': 'Hız göstergesi havaya göre hızı ölçer',
    'Kokpit ve Aviyonik|3': 'Acil durumlar için ayrı kontrol listeleri vardır',
    'Kokpit ve Aviyonik|4': 'Otopilot kapalıyken pilot uçağı elle uçurur',
    'Helikopter|1': 'Rotor kanatları dönerek kanat gibi kaldırma üretir',
    'Helikopter|2': 'Kollektif kol pilotun sol elindedir, siklik kol sağ elindedir',
    'Helikopter|3': 'Rüzgâr ve yere yakınlık hover’ı etkiler',
    'Helikopter|4': 'Dağlık bölgelerde önemli bir ulaşım aracıdır',
    'İnsansız Hava Araçları|1': 'İHA’lar tehlikeli ve uzun görevlerde insan riskini azaltır',
    'İnsansız Hava Araçları|2': 'Pil kapasitesi çok pervaneli İHA’ların uçuş süresini sınırlar',
    'İnsansız Hava Araçları|3': 'Yer istasyonu uçuş verilerini canlı izler',
    'İnsansız Hava Araçları|4': 'İHA kullanımı uçuş izin ve kurallarına tabidir',
    'Geleceğin Uçakları|1': 'Verimli uçak aynı yolcuyu daha az yakıtla taşır',
    'Geleceğin Uçakları|2': 'Pil, gazyağına göre ağırlık başına çok daha az enerji taşır',
    'Geleceğin Uçakları|3': 'Yeni tasarımlar önce bilgisayar benzetimi ve rüzgâr tünelinde denenir',
    'Geleceğin Uçakları|4': 'Havacılık; yazılım, mühendislik ve veri alanlarında çok sayıda kişiye ihtiyaç duyar'
  };
  window.SLIDES.forEach(function (s) { var m = MORE[s.series + '|' + s.part]; if (m) s.points.push(m); });

  /* ---------- Yeni seriler (8): kütüphaneyi genişletir ---------- */
  ['Yazılım Türleri', 'Veri ve Bilgi', 'Bilişim Etiği', 'Bulut Bilişim ve Veri Merkezi'].forEach(function (n) { topicOf[n] = 'bilisim'; });
  ['Havalimanı ve Hava Trafik', 'Uçak Yapısı ve Malzemeler', 'Savaş ve Eğitim Uçakları', 'Meteoroloji ve Uçuş Güvenliği'].forEach(function (n) { topicOf[n] = 'havacilik'; });

  X('Yazılım Türleri', 1, 'Yazılım Nedir?', ['Yazılım, donanıma ne yapacağını söyleyen programlardır', 'Donanım dokunulur, yazılım dokunulmaz', 'Yazılımlar amaçlarına göre türlere ayrılır', 'Yazılımsız bir bilgisayar çalışamaz'],
    'Fiziksel parçalara donanım, programlara yazılım denir.',
    stats([['Donanım', 'Dokunulan parçalar'], ['Yazılım', 'Programlar'], ['Sistem', 'İşletim sistemi'], ['Uygulama', 'Kullanıcı programı']]));
  X('Yazılım Türleri', 2, 'Yazılım Çeşitleri', ['Sistem yazılımı donanımı yönetir', 'Uygulama yazılımı kullanıcının işini yapar', 'Yardımcı yazılım bakım ve koruma sağlar', 'Kod editörleri yazılım geliştirmek için kullanılır'],
    'Sürücü (driver), işletim sisteminin bir donanımı tanımasını sağlar.',
    table(['TÜR', 'ÖRNEK'], [['Sistem yazılımı', 'İşletim sistemi, sürücü'], ['Uygulama yazılımı', 'Ofis, tarayıcı, oyun'], ['Yardımcı yazılım', 'Antivirüs, sıkıştırma'], ['Geliştirme yazılımı', 'Derleyici, kod editörü']]));
  X('Yazılım Türleri', 3, 'Yazılım Lisansları', ['Her yazılımın bir kullanım lisansı vardır', 'Lisans neler yapabileceğini belirler', 'Açık kaynakta kod incelenebilir', 'Lisanssız (korsan) yazılım hem suçtur hem risklidir'],
    'Linux ve Firefox açık kaynaklı yazılımlara örnektir.',
    table(['LİSANS', 'ANLAMI'], [['Ticari', 'Satın alınır'], ['Ücretsiz (freeware)', 'Bedelsiz, kod kapalı'], ['Açık kaynak', 'Kaynak kod herkese açık'], ['Deneme (shareware)', 'Süreli kullanım']]));
  X('Yazılım Türleri', 4, 'Yazılım Nasıl Geliştirilir?', ['Yazılım önce planlanır, sonra kodlanır', 'Test, hataları yayından önce bulmayı sağlar', 'Yayından sonra güncelleme ve bakım sürer', 'Bu sürece yazılım yaşam döngüsü denir'],
    'Yazılımdaki hataya “bug” denir.',
    steps(['İhtiyaç ve plan', 'Tasarım', 'Kodlama', 'Test', 'Yayın ve bakım']));

  X('Veri ve Bilgi', 1, 'Veri, Bilgi, Karar', ['Veri, ham gerçeklerdir', 'İşlenen veri bilgi olur', 'Bilgiden karar çıkarılır', 'Doğru karar için veri doğru olmalıdır'],
    'Veri işlenip anlam kazandığında bilgi olur.',
    stats([['Veri', '38, 40, 36'], ['Bilgi', 'Ortalama 38'], ['Karar', 'Sonuca göre hareket'], ['Doğruluk', 'Kaynak güvenilir mi?']]));
  X('Veri ve Bilgi', 2, 'Veri Türleri', ['Bilgisayar her veriyi sonunda 0 ve 1 olarak saklar', 'Fotoğraf pikseller, ses örneklerden oluşur', 'Video art arda gelen görüntülerdir', 'Veri türü dosya boyutunu etkiler'],
    'Bir video saniyede çoğunlukla 24–60 görüntüden oluşur.',
    table(['TÜR', 'ÖRNEK'], [['Sayısal', 'Not, sıcaklık, fiyat'], ['Metin', 'Ad, adres, mesaj'], ['Görüntü', 'Fotoğraf'], ['Ses', 'Müzik, konuşma'], ['Video', 'Kamera kaydı']]));
  X('Veri ve Bilgi', 3, 'Veri Yedekleme', ['Veri kaybı her an olabilir', 'Yedek, tek kopyanın yerini tutmaz', '3-2-1 kuralı güvenli bir yöntemdir', 'Yedekleri zaman zaman test et'],
    'Yedekleme kuralı 3-2-1: 3 kopya, 2 farklı ortam, 1 farklı konum.',
    steps(['Önemli dosyaları belirle', 'En az 3 kopya oluştur', '2 farklı ortamda sakla', '1 kopyayı başka yerde tut']));
  X('Veri ve Bilgi', 4, 'Bulutta Veri', ['Bulut depolama verileri uzak sunucularda tutar', 'Her yerden erişim sağlar', 'İnternet ve güvenilir sağlayıcı gerekir', 'Önemli veriler için ayrıca yedek al'],
    'Bulut depolama, verilerin uzaktaki sunucularda tutulması demektir.',
    table(['ÖZELLİK', 'FAYDA'], [['Her yerden erişim', 'İnternet yeterli'], ['Otomatik yedek', 'Veri kaybı azalır'], ['Paylaşım', 'Ortak çalışma'], ['Dezavantaj', 'İnternet ve güven gerekir']]));

  X('Bilişim Etiği', 1, 'Dijital Vatandaşlık', ['Çevrimiçi de saygılı ol', 'Kişisel bilgilerini koru', 'Bilginin doğruluğunu kontrol et', 'Paylaşımlarının izi kalır'],
    'Bir kez paylaşılan içerik tamamen silinemeyebilir.',
    stats([['Saygı', 'Çevrimiçi de nazik ol'], ['Güvenlik', 'Kişisel bilgini koru'], ['Doğruluk', 'Bilgiyi kontrol et'], ['Sorumluluk', 'Paylaşımın izi kalır']]));
  X('Bilişim Etiği', 2, 'Telif Hakkı', ['Her eserin bir sahibi vardır', 'Alıntı yaparken kaynak göster', 'Creative Commons kullanım izni verir', 'Başkasının ödevini kopyalamak intihaldir'],
    'İnternette bulduğun her görsel serbestçe kullanılamaz.',
    table(['KAVRAM', 'ANLAMI'], [['Telif hakkı', 'Eser sahibinin hakkı'], ['Kaynak göstermek', 'Alıntıyı belirtmek'], ['Creative Commons', 'Kullanım izni lisansı'], ['İntihal', 'Başkasının işini kendi gibi sunmak']]));
  X('Bilişim Etiği', 3, 'Dijital Ayak İzi', ['Paylaşımların kaydedilir', 'Beğeni ve yorumların iz bırakır', 'Kişisel veriler yasayla korunur (KVKK)', 'Paylaşmadan önce bir kez daha düşün'],
    'Dijital ayak izin ileride okul ve iş başvurularında görülebilir.',
    steps(['Paylaştığın içerik kaydedilir', 'Beğeni ve yorumların iz bırakır', 'Arama geçmişi tutulur', 'Konum bilgisi paylaşılabilir', 'Toplamı dijital ayak izidir']));
  X('Bilişim Etiği', 4, 'Siber Zorbalık', ['Siber zorbalık çevrimiçi ortamda aşağılamadır', 'Yanıt verme, kanıtı sakla', 'Zorbayı engelle ve bildir', 'Bir yetişkine haber ver'],
    'Tanık olduğunda sessiz kalmak yerine yetişkine haber ver.',
    table(['DURUM', 'NE YAPMALI'], [['Hakaret gören', 'Cevap verme, kanıt sakla'], ['Tanık olan', 'Destek ol, bildir'], ['Şikâyet', 'Platforma ve yetişkine bildir'], ['Engelle', 'Kişiyi engelle']]));

  X('Bulut Bilişim ve Veri Merkezi', 1, 'Bulut Nedir?', ['Bulut, internet üzerinden kullanılan uzak sunuculardır', 'Kullandığın kadar kaynak kullanırsın', 'Her yerden erişilebilir', 'Fiziksel olarak veri merkezlerinde bulunur'],
    'Bulut, aslında başka birinin bilgisayarlarıdır.',
    stats([['Sunucu', 'Güçlü bilgisayar'], ['Bulut', 'Uzaktaki sunucular'], ['İnternet', 'Erişim yolu'], ['İsteğe bağlı', 'Kullandığın kadar']]));
  X('Bulut Bilişim ve Veri Merkezi', 2, 'Bulut Hizmet Türleri', ['Hizmetler üç ana grupta toplanır', 'IaaS: sanal altyapı', 'PaaS: geliştirme platformu', 'SaaS: hazır yazılım'],
    'E-posta ve çevrimiçi ofis uygulamaları SaaS örneğidir.',
    table(['TÜR', 'NE SUNAR'], [['IaaS', 'Sanal sunucu ve depolama'], ['PaaS', 'Uygulama geliştirme ortamı'], ['SaaS', 'Hazır yazılım (e-posta, ofis)']]));
  X('Bulut Bilişim ve Veri Merkezi', 3, 'Veri Merkezinde Neler Var?', ['Sunucu rafları verileri işler', 'Soğutma sistemleri ısıyı uzaklaştırır', 'Güç sistemi kesintisiz elektrik sağlar', 'Girişler sıkı güvenlik altındadır'],
    'Veri merkezleri kesintiye karşı UPS ve yedek jeneratörle korunur.',
    table(['BÖLÜM', 'GÖREVİ'], [['Sunucu rafları', 'Verileri işler'], ['Soğutma', 'Isıyı uzaklaştırır'], ['Güç sistemi', 'Kesintisiz elektrik'], ['Ağ', 'Dış dünyaya bağlantı'], ['Güvenlik', 'Kontrollü giriş']]));
  X('Bulut Bilişim ve Veri Merkezi', 4, 'Bulutun Artıları ve Eksileri', ['Hızlı kurulum ve esneklik sağlar', 'Düşük başlangıç maliyeti vardır', 'İnternet bağlantısı gerekir', 'Veriyi güvenilir sağlayıcıya emanet edersin'],
    'Bulut hizmetinde veriyi kimin, nerede sakladığını bilmek önemlidir.',
    table(['ARTI', 'EKSİ'], [['Hızlı kurulum', 'İnternet gerekir'], ['Esnek kapasite', 'Veri güvenliği endişesi'], ['Düşük başlangıç maliyeti', 'Sağlayıcıya bağımlılık']]));

  X('Havalimanı ve Hava Trafik', 1, 'Hava Trafik Kontrol', ['Kule pist ve yerdeki hareketi yönetir', 'Yaklaşma kontrolü inişe gelen uçakları sıralar', 'Saha kontrolü seyirdeki uçakları izler', 'Radar uçakların konumunu gösterir'],
    'Kule, pistteki ve piste yakın uçakları görsel ve telsizle yönlendirir.',
    stats([['Kule', 'Pist ve yer hareketleri'], ['Yaklaşma', 'İnişe gelen uçaklar'], ['Saha', 'Seyirdeki uçaklar'], ['Radar', 'Konum izleme']]));
  X('Havalimanı ve Hava Trafik', 2, 'Havalimanı Kodları', ['Her havalimanının iki harf kodu vardır', 'IATA kodu üç harftir (bilette görülür)', 'ICAO kodu dört harftir (pilot kullanır)', 'Türkiye’nin ICAO kodları “LT” ile başlar'],
    'IATA kodu bilette, ICAO kodu pilotun uçuş planında görülür.',
    table(['HAVALİMANI', 'IATA', 'ICAO'], [['İstanbul', 'IST', 'LTFM'], ['Sabiha Gökçen', 'SAW', 'LTFJ'], ['Ankara Esenboğa', 'ESB', 'LTAC'], ['İzmir Adnan Menderes', 'ADB', 'LTBJ']]));
  X('Havalimanı ve Hava Trafik', 3, 'Uçuş Seviyeleri', ['İrtifa feet (ayak) cinsinden ölçülür', 'FL350, 35.000 feet demektir', '1 feet yaklaşık 0,3 metredir', 'Zıt yöne giden uçaklar farklı seviyede uçar'],
    'Yolcu uçakları çoğunlukla FL300 ile FL400 arasında seyreder.',
    table(['SEVİYE', 'YAKLAŞIK İRTİFA'], [['FL100', '10.000 ft (≈ 3 km)'], ['FL250', '25.000 ft (≈ 7,6 km)'], ['FL350', '35.000 ft (≈ 10,7 km)'], ['FL390', '39.000 ft (≈ 11,9 km)']]));
  X('Havalimanı ve Hava Trafik', 4, 'Havalimanında Bir Uçuş', ['Yolcu önce check-in ve güvenlikten geçer', 'Uçak kapıdan geri itilir (pushback)', 'Taksi yolundan piste gider', 'Varışta bagajlar teslim edilir'],
    'Bir yolcu uçağı için yer hizmetleri çoğu zaman bir saatten kısa sürede yapılır.',
    steps(['Check-in ve güvenlik', 'Kapıdan uçağa biniş', 'Pushback ve taksi', 'Kalkış ve uçuş', 'İniş ve bagaj teslimi']));

  X('Uçak Yapısı ve Malzemeler', 1, 'Uçağın Ana Parçaları', ['Gövde yolcu ve yükü taşır', 'Kanat kaldırma üretir, yakıt taşır', 'Kuyruk denge ve yön sağlar', 'İniş takımı yerde hareketi sağlar'],
    'Bir yolcu uçağı yüz binlerce parçadan oluşur.',
    stats([['Gövde', 'Yolcu ve yük'], ['Kanat', 'Kaldırma, yakıt'], ['Kuyruk', 'Denge ve yön'], ['İniş takımı', 'Yerde hareket']]));
  X('Uçak Yapısı ve Malzemeler', 2, 'Uçak Malzemeleri', ['Uçağın hafif ve dayanıklı olması gerekir', 'Alüminyum alaşımlar yaygındır', 'Kompozit malzeme kullanımı artıyor', 'Titanyum sıcak ve zorlu bölgelerde kullanılır'],
    'Boeing 787’nin yapısının yaklaşık yarısı kompozit malzemedir.',
    table(['MALZEME', 'ÖZELLİK'], [['Alüminyum alaşım', 'Hafif ve dayanıklı'], ['Titanyum', 'Çok sağlam, ısıya dayanıklı'], ['Kompozit (karbon fiber)', 'Hafif ve güçlü'], ['Çelik', 'İniş takımı gibi yük taşıyan yerler']]));
  X('Uçak Yapısı ve Malzemeler', 3, 'Kabin Basınçlandırma', ['Seyir irtifasında dış hava çok seyrek ve soğuktur', 'Kabin havası basınçlandırılır', 'Kabin irtifası yaklaşık 2.000 m civarında tutulur', 'Basınç sürekli izlenir'],
    'Basınçlandırma olmasaydı yolcular oksijen maskesiyle uçmak zorunda kalırdı.',
    steps(['10 km’de dış hava çok seyrektir', 'Kabine hava verilir ve basınçlandırılır', 'Kabin basıncı izlenir', 'Sorun olursa oksijen maskeleri düşer']));
  X('Uçak Yapısı ve Malzemeler', 4, 'Bakım ve Test', ['Uçaklar planlı bakımdan geçer', 'Metal yorulması düzenli izlenir', 'Parçaların ömrü takip edilir', 'Her bakım kayıt altına alınır'],
    'Her uçağın bakım kayıtları uçağın “sağlık geçmişi” gibidir.',
    table(['KONTROL', 'AMAÇ'], [['Uçuş öncesi kontrol', 'Gözle muayene'], ['A / C bakımı', 'Planlı periyodik bakım'], ['Yorulma testi', 'Çatlak takibi'], ['Parça ömrü', 'Süresi dolanı değiştir']]));

  X('Savaş ve Eğitim Uçakları', 1, 'Savaş Uçağı Nedir?', ['Yüksek hız ve manevra için tasarlanır', 'Güçlü radar ve sensörler taşır', 'Çoğu süpersonik uçabilir', 'Pilot çok yüksek ivmeye dayanır'],
    'Savaş uçakları yüksek manevra kabiliyeti için tasarlanır.',
    stats([['Hız', 'Süpersonik uçabilir'], ['Manevra', 'Yüksek ivme'], ['Radar', 'Hedef algılama'], ['Sensör', 'Çevreyi izler']]));
  X('Savaş ve Eğitim Uçakları', 2, 'Ses Hızı ve Mach', ['Ses hızı yaklaşık 1.225 km/sa’tir', 'Mach 1, ses hızına eşittir', 'Yolcu uçakları yaklaşık Mach 0,8’de uçar', 'Süpersonik: Mach 1’in üstü'],
    'Ses hızı sıcaklığa bağlıdır; yükseklikte daha düşüktür.',
    table(['MACH', 'ANLAMI'], [['Mach 0,8', 'Yolcu uçağı seyir hızı'], ['Mach 1', 'Ses hızı (≈ 1.225 km/sa)'], ['Mach 2', 'Ses hızının 2 katı'], ['Süpersonik', 'Mach 1 üstü']]));
  X('Savaş ve Eğitim Uçakları', 3, 'Pilot Eğitimi', ['Pilot olmak uzun bir eğitim ister', 'Önce küçük uçakla temel beceri öğrenilir', 'Jet eğitim uçağı hıza alıştırır', 'Simülatör güvenli tekrar imkânı verir'],
    'Simülatörler pahalı ve riskli senaryoları güvenle çalışmayı sağlar.',
    steps(['Temel teorik eğitim', 'Küçük uçakla uçuş', 'Jet eğitim uçağı', 'Taktik eğitim', 'Operasyonel birlik']));
  X('Savaş ve Eğitim Uçakları', 4, 'Modern Teknolojiler', ['Gizlilik radarda küçük görünmeyi sağlar', 'Sensör birleştirme bilgileri tek ekranda toplar', 'Aktif radar hızlı tarama yapar', 'Fırlatma koltuğu acil durumda pilotu kurtarır'],
    'Yeni nesil savaş uçaklarında gizlilik temel tasarım ölçütüdür.',
    table(['TEKNOLOJİ', 'FAYDA'], [['Gizlilik (stealth)', 'Radarda küçük görünme'], ['Sensör birleştirme', 'Çok veri, tek ekran'], ['Aktif radar (AESA)', 'Hızlı ve esnek tarama'], ['Fırlatma koltuğu', 'Pilot kurtarma']]));

  X('Meteoroloji ve Uçuş Güvenliği', 1, 'Hava Uçuşu Nasıl Etkiler?', ['Hava durumu rota ve süreyi değiştirir', 'Sis görüş mesafesini azaltır', 'Buzlanma kaldırmayı düşürür', 'Uçaklar yıldırıma dayanıklı tasarlanır'],
    'Uçaklar yıldırım çarpmasına dayanacak şekilde tasarlanır.',
    stats([['Rüzgâr', 'Hız ve süre'], ['Sis', 'Görüş mesafesi'], ['Buzlanma', 'Kaldırma azalır'], ['Yıldırım', 'Uçak korunumlu']]));
  X('Meteoroloji ve Uçuş Güvenliği', 2, 'Bulut Türleri', ['Bulutlar yüksekliğe göre sınıflanır', 'Sirrus yüksekte ve incedir', 'Kümülonimbüs fırtına bulutudur', 'Pilotlar fırtına bulutlarından kaçınır'],
    'Pilotlar kümülonimbüs bulutlarının içinden geçmemeye çalışır.',
    table(['BULUT', 'ÖZELLİK'], [['Sirrus', 'Yüksek, ince'], ['Kümülüs', 'Pamuk gibi, genelde iyi hava'], ['Kümülonimbüs', 'Fırtına bulutu'], ['Stratus', 'Alçak, tabaka halinde']]));
  X('Meteoroloji ve Uçuş Güvenliği', 3, 'Türbülans', ['Türbülans hava akımının düzensizleşmesidir', 'Uçağı sarsabilir', 'Emniyet kemeri uyarısı yanar', 'Kemeri bağlı tutmak yaralanmayı önler'],
    'Emniyet kemeri türbülansa karşı en önemli korunmadır.',
    steps(['Hava akımları düzensizleşir', 'Uçak sarsılır', 'Emniyet kemeri uyarısı yanar', 'Yolcular oturup kemerini bağlar']));
  X('Meteoroloji ve Uçuş Güvenliği', 4, 'Hava Raporları', ['Pilotlar uçuştan önce hava raporunu okur', 'METAR güncel durumu verir', 'TAF tahmin eder', 'SIGMET tehlikeli hava için uyarır'],
    'Pilot uçuş öncesi bu raporları okuyarak rotayı planlar.',
    table(['RAPOR', 'ANLAMI'], [['METAR', 'Havalimanı güncel hava durumu'], ['TAF', 'Havalimanı hava tahmini'], ['SIGMET', 'Tehlikeli hava uyarısı']]));

  // her serinin toplam parça sayısı
  var cnt = {};
  window.SLIDES.forEach(function (s) { cnt[s.series] = (cnt[s.series] || 0) + 1; });
  window.SLIDES.forEach(function (s) { s.parts = cnt[s.series]; });

  // 3B model gösterilecek slaytlar (serinin 1. parçası); bg.js yoksa düz çizim kullanılır
  [['Bilgisayarın Parçaları', 'cpu'], ['Jet Motoru', 'turbofan'], ['Uçuşun Dört Kuvveti', 'airliner'],
   ['Bulut Bilişim ve Veri Merkezi', 'rack'], ['Helikopter', 'helicopter'], ['İnsansız Hava Araçları', 'drone'], ['Geleceğin Uçakları', 'bwb']].forEach(function (m) {
    window.SLIDES.forEach(function (s) { if (s.series === m[0] && s.part === 1) s.model = m[1]; });
  });

  // Atölye videoları: videos.js içindeki listeden eklenir
  (window.VIDEOS || []).forEach(function (v) {
    window.SLIDES.push({ topic: 'atolye', video: v.file, title: v.title || 'Atölyemizden' });
  });
})();
