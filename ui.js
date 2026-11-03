/* Üst menü (fare üst kenara gelince açılır) ve renk ayarları. Tercih localStorage'da { değişken: renk } olarak tutulur. */
(function () {
  var KEY = 'v5theme';
  var TOKENS = [
    ['--bg', 'Arka plan', '#eef2f7'],
    ['--panel', 'Kart ve panel', '#ffffff'],
    ['--menu', 'Üst menü ve ayarlar', '#ffffff'],
    ['--ink', 'Başlık ve metin', '#0f1b2d'],
    ['--ink2', 'İkincil metin', '#3a4a60'],
    ['--bi', 'Mavi vurgu (bilişim)', '#0a6cff'],
    ['--hv', 'Sarı vurgu (havacılık)', '#ffd000'],
    ['--gv', 'Yeşil vurgu (atölye)', '#1fbf75'],
    ['--code', 'Kod ve video zemini', '#0c1424'],
    ['--codeTx', 'Kod yazısı', '#cfe2ff']
  ];
  var root = document.documentElement, body = document.body;
  var burger = document.getElementById('burger'), list = document.getElementById('settings-list');
  var t = {};

  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    var out = {};
    TOKENS.forEach(function (d) { out[d[0]] = saved[d[0]] || d[2]; });
    return out;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {}
  }
  function apply() {
    Object.keys(t).forEach(function (k) { root.style.setProperty(k, t[k]); });
  }

  t = load();
  apply();
  TOKENS.forEach(function (d) {
    var row = document.createElement('label');
    row.textContent = d[1] + ' ';
    var input = document.createElement('input');
    input.type = 'color';
    input.value = t[d[0]];
    input.addEventListener('input', function () {
      t[d[0]] = input.value;
      root.style.setProperty(d[0], input.value);
      save();
    });
    row.appendChild(input);
    list.appendChild(row);
  });
  document.getElementById('reset').addEventListener('click', function () {
    TOKENS.forEach(function (d) { t[d[0]] = d[2]; });
    apply();
    save();
    Array.prototype.forEach.call(list.querySelectorAll('input'), function (el, i) { el.value = TOKENS[i][2]; });
  });

  var hideT = null;
  function show() { clearTimeout(hideT); body.classList.add('menu-open'); }
  function hide() {
    if (body.classList.contains('settings-open')) return;
    body.classList.remove('menu-open');
  }
  function later() { clearTimeout(hideT); hideT = setTimeout(hide, 300); }

  document.addEventListener('mousemove', function (e) {
    if (e.clientY < 40) show();
    else if (e.clientY > 120) later();
  });
  document.getElementById('menu').addEventListener('mouseenter', show);
  document.getElementById('menu').addEventListener('mouseleave', later);

  burger.addEventListener('click', function () {
    var open = body.classList.toggle('settings-open');
    if (open) show(); else later();
  });

  document.addEventListener('touchstart', function (e) {
    if (e.touches[0].clientY < 40) {
      if (body.classList.contains('menu-open')) { body.classList.remove('settings-open'); hide(); }
      else show();
    }
  }, { passive: true });
})();
