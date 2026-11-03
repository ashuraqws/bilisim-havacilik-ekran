/* Üst menü (fare üst kenara gelince açılır) ve renk ayarları. Tercih localStorage'da {bg,bi,hv} olarak tutulur. */
(function () {
  var KEY = 'v5theme';
  var DEF = { bg: '#eef2f7', bi: '#0a6cff', hv: '#ffd000' };
  var root = document.documentElement, body = document.body, menu = document.getElementById('menu');
  var gear = document.getElementById('gear');
  var inputs = { bg: document.getElementById('c-bg'), bi: document.getElementById('c-bi'), hv: document.getElementById('c-hv') };

  function load() {
    try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEF); }
  }
  function save(t) {
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {}
  }
  function apply(t) {
    root.style.setProperty('--bg', t.bg);
    root.style.setProperty('--bi', t.bi);
    root.style.setProperty('--hv', t.hv);
    Object.keys(inputs).forEach(function (k) { inputs[k].value = t[k]; });
  }

  var t = load();
  apply(t);
  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener('input', function () {
      t[k] = inputs[k].value;
      apply(t);
      save(t);
    });
  });
  document.getElementById('reset').addEventListener('click', function () {
    t = Object.assign({}, DEF);
    apply(t);
    save(t);
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
  menu.addEventListener('mouseenter', show);
  menu.addEventListener('mouseleave', later);

  gear.addEventListener('click', function () {
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
