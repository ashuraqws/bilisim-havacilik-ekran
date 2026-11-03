/* Üst menü (fare üst kenara gelince açılır, isteğe bağlı sabit), hazır temalar ve renk ayarları. Tercih localStorage'da tutulur. */
(function () {
  var KEY = 'v5theme', PIN_KEY = 'v5pin', PRESET_KEY = 'v5preset', VER_KEY = 'v5theme_v', VER = '2';
  var TOKENS = [
    ['--bg', 'Arka plan (bilişim)', '#eef2f7'],
    ['--panel', 'Kart ve panel', '#ffffff'],
    ['--menu', 'Üst menü ve ayarlar', '#ffffff'],
    ['--ink', 'Başlık ve metin (bilişim)', '#0f1b2d'],
    ['--ink2', 'İkincil metin (bilişim)', '#3a4a60'],
    ['--bi', 'Mavi vurgu (bilişim)', '#0a6cff'],
    ['--hv', 'Sarı vurgu (havacılık)', '#ffd000'],
    ['--hvbg', 'Zemin (havacılık)', '#f6eedf'],
    ['--hvink', 'Başlık ve metin (havacılık)', '#1d3d33'],
    ['--gv', 'Yeşil vurgu (atölye)', '#1fbf75'],
    ['--code', 'Kod ve video zemini', '#0c1424'],
    ['--codeTx', 'Kod yazısı', '#cfe2ff']
  ];
  var DEF = {};
  TOKENS.forEach(function (d) { DEF[d[0]] = d[2]; });
  var PRESETS = {
    'Varsayılan': {},
    'Hoca: havacılık krem': { '--hv': '#d9822b', '--hvbg': '#f6eedf', '--hvink': '#1d3d33', '--panel': '#fbf7ee' }
  };
  var root = document.documentElement, body = document.body;
  var burger = document.getElementById('burger'), list = document.getElementById('settings-list');
  var pin = document.getElementById('pin');
  var t = {}, inputs = {}, presetName = 'Varsayılan';

  function save() {
    var diff = {};
    TOKENS.forEach(function (d) { if (t[d[0]] !== DEF[d[0]]) diff[d[0]] = t[d[0]]; });
    try {
      localStorage.setItem(KEY, JSON.stringify(diff));
      localStorage.setItem(PRESET_KEY, presetName);
      localStorage.setItem(VER_KEY, VER);
    } catch (e) {}
  }
  function apply() {
    Object.keys(t).forEach(function (k) { root.style.setProperty(k, t[k]); });
    Object.keys(inputs).forEach(function (k) { inputs[k].value = t[k]; });
  }
  function usePreset(name) {
    presetName = name;
    t = Object.assign({}, DEF, PRESETS[name]);
    apply();
    save();
  }

  var saved = {};
  try {
    if (localStorage.getItem(VER_KEY) === VER) {
      saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      presetName = localStorage.getItem(PRESET_KEY) || 'Varsayılan';
    } else {
      localStorage.removeItem(KEY); localStorage.removeItem(PRESET_KEY); // eski sürüm kaydı: sıfırla
    }
  } catch (e) {}
  if (!PRESETS[presetName]) presetName = 'Varsayılan';
  t = Object.assign({}, DEF, PRESETS[presetName]);
  TOKENS.forEach(function (d) { if (saved[d[0]]) t[d[0]] = saved[d[0]]; });
  apply();

  var sel = document.createElement('select');
  sel.id = 'preset';
  Object.keys(PRESETS).forEach(function (name) {
    var o = document.createElement('option');
    o.value = name;
    o.textContent = name;
    sel.appendChild(o);
  });
  sel.value = presetName;
  var selRow = document.createElement('label');
  selRow.textContent = 'Hazır tema ';
  selRow.appendChild(sel);
  list.appendChild(selRow);
  sel.addEventListener('change', function () { usePreset(sel.value); });

  var GROUPS = [
    ['Bilişim', ['--bg', '--ink', '--ink2', '--bi']],
    ['Havacılık', ['--hvbg', '--hvink', '--hv']],
    ['Ortak', ['--panel', '--menu', '--gv', '--code', '--codeTx']]
  ];
  GROUPS.forEach(function (g) {
    var h = document.createElement('h4');
    h.textContent = g[0];
    list.appendChild(h);
    g[1].forEach(function (k) {
      var d = TOKENS.filter(function (x) { return x[0] === k; })[0];
      var row = document.createElement('label');
      row.textContent = d[1] + ' ';
      var input = document.createElement('input');
      input.type = 'color';
      input.value = t[k];
      inputs[k] = input;
      input.addEventListener('input', function () {
        t[k] = input.value;
        root.style.setProperty(k, input.value);
        sel.value = 'Varsayılan';
        presetName = 'Varsayılan';
        save();
      });
      row.appendChild(input);
      list.appendChild(row);
    });
  });
  document.getElementById('reset').addEventListener('click', function () {
    sel.value = 'Varsayılan';
    usePreset('Varsayılan');
  });

  var pinned = false;
  try { pinned = localStorage.getItem(PIN_KEY) === '1'; } catch (e) {}
  pin.checked = pinned;
  body.classList.toggle('menu-pinned', pinned);
  pin.addEventListener('change', function () {
    pinned = pin.checked;
    body.classList.toggle('menu-pinned', pinned);
    try { localStorage.setItem(PIN_KEY, pinned ? '1' : '0'); } catch (e) {}
  });

  var hideT = null;
  function show() { clearTimeout(hideT); body.classList.add('menu-open'); }
  function hide() {
    if (pinned || body.classList.contains('settings-open')) return;
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
