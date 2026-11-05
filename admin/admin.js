/* Yayın paneli arayüzü. Veri: window.AdminAPI (api.js), zamanlama: window.Schedule (schedule.js). */
(function () {
  'use strict';
  var API = window.AdminAPI, S = window.Schedule;
  var CFG = window.APP_CONFIG || {};
  var MAX_MB = CFG.MAX_VIDEO_MB || 50, MAX_PEOPLE = 5, SLIDE_SEC = 18;
  var DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  var DAYS_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  var MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  var MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var me = null, videos = [], people = [], urls = {}, sig = '', chosen = null, picked = [1, 2, 3, 4, 5, 6, 7];
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- yardımcılar ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function icon(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function pad(n) { return ('0' + n).slice(-2); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function diffDays(a, b) { return Math.round((parse(b) - parse(a)) / 864e5); }
  function mins(t) { var p = String(t || '').split(':'); return +p[0] * 60 + +p[1]; }
  function fmtDate(s) {
    var d = parse(s), y = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '';
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + y;
  }
  function fmtDur(m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + ' sa' + (r ? ' ' + r + ' dk' : '') : r + ' dk'; }
  function hhmm(t) { return String(t || '').slice(0, 5); }
  function wd(d) { return d.getDay() || 7; }
  function every(n) { var m = Math.max(1, Math.round(n * SLIDE_SEC / 60)); return 'yaklaşık ' + m + ' dk'; }
  function daysText(w) {
    w = (w || []).slice().sort();
    if (w.length === 7) return 'Her gün';
    if (w.join() === '1,2,3,4,5') return 'Hafta içi';
    if (w.join() === '6,7') return 'Hafta sonu';
    return w.map(function (x) { return DAYS[x - 1]; }).join(', ') || 'Gün seçilmemiş';
  }
  function mb(bytes) { return (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB'; }
  function msg(e) { return (e && e.message) || 'Beklenmeyen bir hata oldu. Tekrar dene.'; }
  function initials(email) { var s = String(email).split('@')[0].replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, ''); return (s.charAt(0) || '?').toLocaleUpperCase('tr'); }
  var TINTS = [['#e8f1ff', '#0a55cc'], ['#e3f5ec', '#0f6b4b'], ['#fff3d9', '#7a4a00'], ['#fde8ef', '#a3264f'], ['#eceff5', '#3a4a60']];
  function tint(email) { var h = 0; for (var i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0; return TINTS[h % TINTS.length]; }

  /* ---------- bildirim ve onay ---------- */
  var toastT;
  function toast(text, bad) {
    var t = $('toast'); t.textContent = text; t.className = 'toast on' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast' + (bad ? ' bad' : ''); }, bad ? 6000 : 3800);
  }
  function confirmBox(title, text, yes) {
    var d = $('confirm');
    if (!d.showModal) return Promise.resolve(window.confirm(title + '\n\n' + text));
    $('cfTitle').textContent = title; $('cfText').textContent = text; $('cfYes').textContent = yes || 'Sil';
    var back = document.activeElement;
    d.returnValue = ''; d.showModal(); $('cfNo').focus();
    return new Promise(function (res) {
      d.addEventListener('close', function () { res(d.returnValue === 'yes'); if (back && back.isConnected) back.focus(); }, { once: true });
    });
  }

  /* ---------- zamanlama sınıfları ---------- */
  // Bir sonraki yayın penceresinin başlangıcı (yoksa null). Gece yarısını aşan pencere başlangıç gününe sayılır.
  function nextStart(v, now) {
    if (!v.weekdays || !v.weekdays.length) return null;
    var today = ymd(now), from = mins(v.daily_from);
    for (var k = 0; k < 400; k++) {
      var s = addDays(today, k);
      if (s > v.end_date) return null;
      if (s < v.start_date) { k += Math.max(0, diffDays(s, v.start_date) - 1); continue; }
      var d = parse(s);
      if (v.weekdays.indexOf(wd(d)) < 0) continue;
      d.setMinutes(from);
      if (d > now) return d;
    }
    return null;
  }
  function groupOf(v, now) {
    if (S.isActiveNow(v, now)) return 'live';
    if (v.end_date < ymd(now)) return 'done';
    if (!v.enabled) return 'plan';
    return nextStart(v, now) ? 'plan' : 'done';
  }
  function minutesLeft(v, now) {
    var f = mins(v.daily_from), t = mins(v.daily_to), c = now.getHours() * 60 + now.getMinutes();
    if (f < t) return t - c;
    return c >= f ? 1440 - c + t : t - c;
  }
  function whenText(d, now) {
    var k = diffDays(ymd(now), ymd(d)), t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (k === 0) return 'Bugün ' + t + ' başlar';
    if (k === 1) return 'Yarın ' + t + ' başlar';
    if (k < 7) return DAYS_LONG[wd(d) - 1] + ' ' + t + ' başlar';
    return fmtDate(ymd(d)) + ' ' + t + ' başlar';
  }

  /* ---------- gün şeridi ---------- */
  function band(from, to, now) {
    var f = mins(from) / 14.4, t = mins(to) / 14.4, seg;
    if (isNaN(f) || isNaN(t) || f === t) seg = '';
    else if (f < t) seg = '<span class="w" style="left:' + f + '%;width:' + (t - f) + '%"></span>';
    else seg = '<span class="w" style="left:0;width:' + t + '%"></span><span class="w" style="left:' + f + '%;right:0"></span>';
    var n = now ? '<span class="n" data-now style="left:' + ((now.getHours() * 60 + now.getMinutes()) / 14.4) + '%"></span>' : '';
    return seg + n;
  }

  /* ---------- çizim ---------- */
  function render(force) {
    var now = new Date(), g = { live: [], plan: [], done: [] };
    videos.forEach(function (v) { g[groupOf(v, now)].push(v); });
    g.plan.sort(function (a, b) { return a.start_date < b.start_date ? -1 : 1; });
    g.done.sort(function (a, b) { return a.end_date > b.end_date ? -1 : 1; });
    var s = JSON.stringify([g.live, g.plan, g.done].map(function (l) { return l.map(function (v) { return v.id; }); })) + JSON.stringify(videos);
    $('nowText').textContent = DAYS_LONG[wd(now) - 1] + ', ' + now.getDate() + ' ' + MONTHS_LONG[now.getMonth()] + ' · ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    $('summary').textContent = g.live.length
      ? g.live.length + ' video şu an koridor ekranında dönüyor. Değişiklikler ekrana 1 dakika içinde yansır.'
      : 'Şu an ekranda video yok; slaytlar normal akışında dönüyor.';
    if (!force && s === sig) { tick(g, now); return; }
    sig = s;
    $('liveCount').textContent = g.live.length; $('planCount').textContent = g.plan.length; $('doneCount').textContent = g.done.length;
    $('live').innerHTML = g.live.length ? g.live.map(function (v) { return liveCard(v, now); }).join('')
      : '<div class="empty">' + icon('film') + '<div><b>Şu an yayında video yok</b>' +
        (g.plan.length ? 'Planlanan videolar saatleri gelince burada görünür.' : 'Video ekle formuyla bir video yükle; tarih ve saat aralığına girince burada döner.') + '</div></div>';
    $('plan').innerHTML = g.plan.length ? g.plan.map(function (v) { return planRow(v, now); }).join('')
      : '<li><div class="empty">' + icon('cal') + '<div><b>Planlanmış video yok</b>İleri bir tarihe video eklersen sırası gelene kadar burada bekler.</div></div></li>';
    $('done').innerHTML = g.done.length ? g.done.map(doneRow).join('')
      : '<li><div class="empty">' + icon('check') + '<div><b>Biten video yok</b>Süresi dolan videolar burada kalır; tek tıkla yeniden yayınlayabilirsin.</div></div></li>';
    g.live.forEach(attachPreview);
  }
  function liveFacts(v, now) {
    var left = minutesLeft(v, now), daysLeft = diffDays(ymd(now), v.end_date);
    if (mins(v.daily_from) > mins(v.daily_to) && now.getHours() * 60 + now.getMinutes() < mins(v.daily_to)) daysLeft++; // gece yarısı sonrası: dünün penceresi
    return '<div>' + icon('clock') + '<span>Bugün bitiş <b>' + hhmm(v.daily_to) + '</b>, ' + fmtDur(left) + ' kaldı</span></div>' +
      '<div>' + icon('cal') + '<span>' + (daysLeft <= 0 ? '<b>Bugün son gün</b>' : 'Son gün <b>' + fmtDate(v.end_date) + '</b>, ' + daysLeft + ' gün kaldı') + '</span></div>' +
      '<div>' + icon('layers') + '<span>Her <b>' + v.every_n + '</b> slaytta bir, ' + every(v.every_n) + '</span></div>';
  }
  function liveCard(v, now) {
    return '<article class="card" data-id="' + esc(v.id) + '">' +
      '<div class="media" data-media="' + esc(v.id) + '"><div class="ph">' + icon('film') + '<span>Önizleme yükleniyor</span></div><span class="onair">Yayında</span></div>' +
      '<div class="card-b"><h3>' + esc(v.title) + '</h3><div class="facts" data-facts="' + esc(v.id) + '">' + liveFacts(v, now) + '</div>' +
      '<div><div class="dayband" aria-hidden="true">' + band(v.daily_from, v.daily_to, now) + '</div>' +
      '<div class="ticks" aria-hidden="true"><span>00</span><span>' + hhmm(v.daily_from) + '–' + hhmm(v.daily_to) + '</span><span>24</span></div></div></div>' +
      '<div class="acts">' +
      '<button class="btn sm" data-act="pause" data-id="' + esc(v.id) + '">' + icon('pause') + 'Durdur</button>' +
      '<button class="btn sm" data-act="extend" data-id="' + esc(v.id) + '">' + icon('calplus') + '1 hafta uzat</button>' +
      '<button class="btn sm icon danger" data-act="delete" data-id="' + esc(v.id) + '" aria-label="' + esc(v.title) + ' videosunu sil">' + icon('trash') + '</button>' +
      '</div></article>';
  }
  function rowShell(v, tag, line, acts) {
    return '<li class="row"><div class="thumb">' + icon('film') + '</div>' +
      '<div class="row-t"><b>' + esc(v.title) + '</b><span>' + tag + esc(line) + '</span></div>' +
      '<div class="row-a">' + acts + '<button class="btn sm icon danger" data-act="delete" data-id="' + esc(v.id) + '" aria-label="' + esc(v.title) + ' videosunu sil">' + icon('trash') + '</button></div></li>';
  }
  function planRow(v, now) {
    var range = fmtDate(v.start_date) + ' – ' + fmtDate(v.end_date) + ' · ' + hhmm(v.daily_from) + '–' + hhmm(v.daily_to) + ' · ' + daysText(v.weekdays);
    if (!v.enabled) return rowShell(v, '<span class="tag off">Durduruldu</span>', range,
      '<button class="btn sm" data-act="resume" data-id="' + esc(v.id) + '">' + icon('play') + 'Yayına al</button>');
    var n = nextStart(v, now);
    return rowShell(v, '<span class="tag wait">' + esc(whenText(n, now)) + '</span>', range,
      '<button class="btn sm" data-act="pause" data-id="' + esc(v.id) + '">' + icon('pause') + 'Durdur</button>');
  }
  function doneRow(v) {
    return rowShell(v, '<span class="tag end">' + fmtDate(v.end_date) + ' bitti</span>', fmtDate(v.start_date) + ' – ' + fmtDate(v.end_date) + ' · ' + hhmm(v.daily_from) + '–' + hhmm(v.daily_to),
      '<button class="btn sm" data-act="replay" data-id="' + esc(v.id) + '">' + icon('repeat') + 'Yeniden yayınla</button>');
  }
  // Saat ilerledikçe yalnız metin ve şerit işaretini güncelle; oynayan önizlemeler yeniden kurulmasın.
  function tick(g, now) {
    g.live.forEach(function (v) {
      var f = document.querySelector('[data-facts="' + CSS.escape(String(v.id)) + '"]'); if (f) f.innerHTML = liveFacts(v, now);
    });
    var left = (now.getHours() * 60 + now.getMinutes()) / 14.4 + '%';
    document.querySelectorAll('[data-now]').forEach(function (n) { n.style.left = left; });
  }
  function attachPreview(v) {
    var box = document.querySelector('[data-media="' + CSS.escape(String(v.id)) + '"]'); if (!box) return;
    var ph = box.querySelector('.ph');
    var none = function () { ph.innerHTML = icon('film') + '<span>Önizleme yok</span>'; };
    if (!(v.id in urls)) urls[v.id] = Promise.resolve().then(function () { return API.videoUrl(v); }).catch(function () { return ''; });
    urls[v.id].then(function (u) {
      if (!u) return none();
      var el = document.createElement('video');
      el.muted = true; el.loop = true; el.playsInline = true; el.preload = 'metadata'; el.setAttribute('aria-label', v.title + ' önizlemesi');
      if (!REDUCED) el.autoplay = true; // hareket azaltma açıksa yalnız ilk kare
      el.onloadeddata = function () { ph.remove(); };
      el.onerror = function () { el.remove(); none(); };
      el.src = u; box.insertBefore(el, box.firstChild);
    });
  }

  /* ---------- veriler ---------- */
  function loadVideos() {
    return API.listVideos().then(function (list) {
      videos = list || []; $('loadErr').hidden = true; render(true);
    }).catch(function (e) {
      $('loadErrText').textContent = 'Videolar alınamadı: ' + msg(e); $('loadErr').hidden = false;
      $('live').innerHTML = ''; $('summary').textContent = 'Liste alınamadı.';
    });
  }
  function loadPeople() {
    return API.listPeople().then(function (list) { people = (list || []).map(function (p) { return p.email; }); drawPeople(); })
      .catch(function (e) { $('personErr').textContent = 'Kişiler alınamadı: ' + msg(e); });
  }
  function drawPeople() {
    var n = people.length, full = n >= MAX_PEOPLE;
    $('peopleCount').innerHTML = '<span class="meter" aria-hidden="true">' + [0, 1, 2, 3, 4].map(function (i) { return '<i' + (i < n ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' + n + '/' + MAX_PEOPLE;
    $('people').innerHTML = people.map(function (e) {
      var t = tint(e), self = me && e === me.email.toLowerCase(), last = n <= 1;
      return '<li class="person"><span class="av" style="background:' + t[0] + ';color:' + t[1] + '" aria-hidden="true">' + esc(initials(e)) + '</span>' +
        '<span class="person-m">' + esc(e) + (self ? '<small>Sen</small>' : '') + '</span>' +
        '<button class="btn sm icon quiet" data-act="person-del" data-email="' + esc(e) + '"' + (last ? ' disabled title="Son yetkili silinemez"' : '') +
        ' aria-label="' + esc(e) + ' adresini kaldır">' + icon('trash') + '</button></li>';
    }).join('');
    $('personEmail').disabled = $('personBtn').disabled = full;
    $('personHelp').textContent = full ? 'Liste dolu. Yeni kişi için önce birini çıkar.' : 'En fazla ' + MAX_PEOPLE + ' kişi giriş yapabilir. Eklenen kişi kendi e-postasıyla girer.';
  }

  /* ---------- liste işlemleri ---------- */
  function byId(id) { for (var i = 0; i < videos.length; i++) if (String(videos[i].id) === id) return videos[i]; return null; }
  function patch(v, p, done) {
    return API.updateVideo(v.id, p).then(function () { toast(done); return loadVideos(); }).catch(function (e) { toast(msg(e), true); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    var act = b.dataset.act;
    if (act === 'person-del') return delPerson(b.dataset.email);
    var v = byId(b.dataset.id); if (!v) return;
    var today = ymd(new Date());
    if (act === 'pause') return patch(v, { enabled: false }, '“' + v.title + '” durduruldu.');
    if (act === 'resume') return patch(v, { enabled: true }, '“' + v.title + '” yayına alındı.');
    if (act === 'extend') { var end = addDays(v.end_date < today ? today : v.end_date, 7); return patch(v, { end_date: end }, 'Son gün ' + fmtDate(end) + ' oldu.'); }
    if (act === 'replay') {
      var e2 = addDays(today, 6);
      return patch(v, { start_date: today, end_date: e2, enabled: true }, '“' + v.title + '” ' + fmtDate(e2) + ' gününe kadar yeniden yayında.');
    }
    if (act === 'delete') {
      confirmBox('Video silinsin mi?', '“' + v.title + '” kalıcı olarak silinir ve ekrandan kalkar. Bu geri alınamaz.', 'Videoyu sil').then(function (ok) {
        if (!ok) return;
        API.deleteVideo(v.id).then(function () { delete urls[v.id]; toast('“' + v.title + '” silindi.'); return loadVideos(); })
          .catch(function (er) { toast(msg(er), true); });
      });
    }
  });
  function delPerson(email) {
    var self = me && email === me.email.toLowerCase();
    confirmBox('Yetki kaldırılsın mı?', email + ' artık panele giriş yapamaz.' + (self ? ' Bu senin adresin; çıkış yapmış olursun.' : ''), 'Yetkiyi kaldır').then(function (ok) {
      if (!ok) return;
      API.removePerson(email).then(function () { toast(email + ' kaldırıldı.'); return self ? signOut() : loadPeople(); })
        .catch(function (e) { toast(msg(e), true); });
    });
  }
  $('personForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('personEmail'), email = inp.value.trim().toLowerCase(), err = $('personErr');
    err.textContent = ''; inp.removeAttribute('aria-invalid');
    var bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Geçerli bir e-posta adresi yaz.' : people.indexOf(email) >= 0 ? 'Bu adres zaten listede.' : '';
    if (bad) { err.textContent = bad; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
    $('personBtn').disabled = true;
    API.addPerson(email).then(function () { inp.value = ''; toast(email + ' eklendi.'); return loadPeople(); })
      .catch(function (er) { err.textContent = msg(er); inp.setAttribute('aria-invalid', 'true'); $('personBtn').disabled = false; });
  });
  $('retry').addEventListener('click', loadVideos);

  /* ---------- video ekle formu ---------- */
  var F = { file: $('file'), title: $('title'), start: $('startDate'), end: $('endDate'), from: $('dailyFrom'), to: $('dailyTo'), n: $('everyN') };
  function setErr(id, text, input) {
    $(id).textContent = text || '';
    [].concat(input || []).forEach(function (i) { if (text) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
  }
  function drawDays() {
    $('days').innerHTML = DAYS.map(function (d, i) {
      return '<button type="button" class="day" data-day="' + (i + 1) + '" aria-pressed="' + (picked.indexOf(i + 1) >= 0) + '" aria-label="' + DAYS_LONG[i] + '">' + d + '</button>';
    }).join('');
  }
  function checkDays() {
    var t = picked.length ? '' : 'En az bir gün seç; gün seçilmezse video hiç gösterilmez.';
    setErr('daysErr', t); return !t;
  }
  $('days').addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]'); if (!b) return;
    var d = +b.dataset.day, i = picked.indexOf(d);
    if (i >= 0) picked.splice(i, 1); else picked.push(d);
    b.setAttribute('aria-pressed', String(i < 0)); checkDays();
  });
  document.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () { picked = b.dataset.preset.split(',').map(Number); drawDays(); checkDays(); });
  });
  function drawRot() {
    var n = parseInt(F.n.value, 10), ok = n >= 2 && n <= 60;
    var cycles = ok ? (n <= 14 ? 2 : 1) : 0, html = '';
    for (var c = 0; c < cycles; c++) { for (var i = 0; i < n; i++) html += '<i></i>'; html += '<i class="v"></i>'; }
    $('rot').innerHTML = html;
    $('everyHelp').textContent = ok ? n + ' slayt ' + every(n) + '. Mavi çubuk videonun sırası.' : '2 ile 60 arasında bir sayı yaz. 10 slayt yaklaşık 3 dk.';
  }
  function drawFormBand() {
    $('formBand').innerHTML = band(F.from.value, F.to.value, null);
    var f = F.from.value, t = F.to.value;
    $('timeHelp').textContent = f && t && f > t ? 'Gece yarısını aşar: ' + f + ' başlar, ertesi gün ' + t + ' biter.' : 'Okul saatleri: 08:50–16:10.';
  }
  function checkFile(f) {
    if (!f) return 'Bir video dosyası seç.';
    if (f.type && !/^video\//.test(f.type)) return 'Bu dosya video değil. MP4 veya WebM seç.';
    if (f.size > MAX_MB * 1048576) return 'Dosya çok büyük: ' + mb(f.size) + '. En fazla ' + MAX_MB + ' MB yüklenebilir; videoyu kısaltıp ya da sıkıştırıp tekrar dene.';
    return '';
  }
  function choose(f) {
    var bad = checkFile(f);
    $('drop').classList.toggle('bad', !!bad);
    setErr('fileErr', bad, F.file);
    if (bad) { chosen = null; $('fileBox').hidden = true; $('drop').hidden = false; F.file.value = ''; return; }
    chosen = f;
    $('fileName').textContent = f.name; $('fileSize').textContent = mb(f.size);
    var vid = $('fileVid'); if (vid.src) URL.revokeObjectURL(vid.src); vid.src = URL.createObjectURL(f);
    $('fileBox').hidden = false; $('drop').hidden = true;
    if (!F.title.value.trim()) F.title.value = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 80);
    setErr('titleErr', '', F.title);
  }
  function clearFile() {
    chosen = null; F.file.value = '';
    var vid = $('fileVid'); if (vid.src) { URL.revokeObjectURL(vid.src); vid.removeAttribute('src'); vid.load(); }
    $('fileBox').hidden = true; $('drop').hidden = false; $('drop').classList.remove('bad');
  }
  F.file.addEventListener('change', function () { if (F.file.files[0]) choose(F.file.files[0]); });
  $('fileClear').addEventListener('click', function () { clearFile(); F.file.focus(); });
  ['dragenter', 'dragover'].forEach(function (t) { $('drop').addEventListener(t, function (e) { e.preventDefault(); $('drop').classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { $('drop').addEventListener(t, function () { $('drop').classList.remove('over'); }); });
  $('drop').addEventListener('drop', function (e) { e.preventDefault(); var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) choose(f); });

  F.n.addEventListener('input', drawRot);
  F.from.addEventListener('input', drawFormBand); F.to.addEventListener('input', drawFormBand);
  [F.title, F.start, F.end, F.from, F.to, F.n].forEach(function (i) { i.addEventListener('input', function () { i.removeAttribute('aria-invalid'); }); });

  function validate() {
    var first = null, today = ymd(new Date());
    function bad(id, text, inputs) { setErr(id, text, inputs); if (text && !first) first = [].concat(inputs)[0]; }
    bad('fileErr', checkFile(chosen), F.file);
    bad('titleErr', F.title.value.trim() ? '' : 'Başlık yaz; ekranda videonun altında görünür.', F.title);
    var s = F.start.value, e = F.end.value;
    bad('dateErr', !s || !e ? 'Başlangıç ve bitiş tarihini seç.' : e < s ? 'Bitiş tarihi başlangıçtan önce olamaz.' : e < today ? 'Bitiş tarihi geçmişte; video hiç gösterilmez.' : '',
      !s ? F.start : F.end);
    bad('timeErr', !F.from.value || !F.to.value ? 'Başlangıç ve bitiş saatini seç.' : F.from.value === F.to.value ? 'Başlangıç ve bitiş saati aynı olamaz.' : '', !F.from.value ? F.from : F.to);
    if (!checkDays() && !first) first = $('days').querySelector('button');
    var n = Number(F.n.value);
    bad('everyErr', Number.isInteger(n) && n >= 2 && n <= 60 ? '' : '2 ile 60 arasında bir tam sayı yaz.', F.n);
    if (first) { first.focus(); return false; }
    return true;
  }
  function progress(p) {
    p = Math.max(0, Math.min(100, Math.round(p || 0))); // api.js yüzde verir (0-100)
    $('progress').hidden = false;
    $('progress').querySelector('span').style.width = p + '%';
    $('progress').querySelector('.bar').setAttribute('aria-valuenow', p);
    $('progressText').textContent = p >= 100 ? 'Kaydediliyor' : 'Yükleniyor: %' + p;
  }
  $('addForm').addEventListener('submit', function (e) {
    e.preventDefault(); setErr('formErr', '');
    if (!validate()) return;
    var meta = { title: F.title.value.trim(), start_date: F.start.value, end_date: F.end.value, daily_from: F.from.value, daily_to: F.to.value,
      weekdays: picked.slice().sort(), every_n: Number(F.n.value), enabled: $('enabled').checked };
    var btn = $('addBtn'); btn.disabled = true; btn.lastChild.textContent = 'Yükleniyor';
    progress(0);
    API.uploadVideo(chosen, meta, progress).then(function () {
      toast('“' + meta.title + '” eklendi. Ekrana 1 dakika içinde yansır.');
      F.title.value = ''; clearFile();
      return loadVideos();
    }).catch(function (er) {
      setErr('formErr', msg(er));
    }).then(function () {
      btn.disabled = false; btn.lastChild.textContent = 'Yükle ve kaydet'; $('progress').hidden = true;
    });
  });
  function resetDates() { var t = ymd(new Date()); F.start.value = t; F.end.value = addDays(t, 7); }

  /* ---------- giriş ve oturum ---------- */
  var MOCK = false;
  function status(text, ok) { var s = $('loginStatus'); s.className = 'status ' + (ok ? 'ok' : 'bad'); s.textContent = text; }
  function showLogin() { $('app').hidden = true; $('login').hidden = false; }
  function showApp(session) {
    me = session; $('login').hidden = true; $('app').hidden = false;
    $('whoMail').textContent = session.email; $('whoMail').title = session.email;
    loadVideos(); loadPeople();
  }
  function signOut() {
    return Promise.resolve().then(function () { return API.signOut(); }).catch(function () {}).then(function () {
      me = null; videos = []; sig = ''; showLogin(); status('Çıkış yaptın.', true); $('loginEmail').focus();
    });
  }
  $('signOut').addEventListener('click', signOut);
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('loginEmail'), email = inp.value.trim();
    $('loginStatus').textContent = ''; setErr('loginErr', '', inp);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('loginErr', 'Geçerli bir e-posta adresi yaz.', inp); inp.focus(); return; }
    var btn = $('loginBtn'); btn.disabled = true; btn.lastChild.textContent = 'Gönderiliyor';
    API.signIn(email).then(function () {
      if (MOCK) return API.getSession().then(function (s) { if (s) showApp(s); });
      status('Bağlantı ' + email + ' adresine gönderildi. E-postandaki bağlantıya tıkla; bu sayfa açılınca giriş yapmış olursun.', true);
    }).catch(function (er) { status(msg(er), false); })
      .then(function () { btn.disabled = false; btn.lastChild.textContent = 'Giriş bağlantısı gönder'; });
  });

  /* ---------- başlangıç ---------- */
  if (!API || !S) { document.body.insertAdjacentHTML('afterbegin', '<p class="oops" role="alert">Panel dosyaları yüklenemedi (api.js veya schedule.js). Sayfayı yenile.</p>'); return; }
  $('fileHelp').querySelector('.maxmb').textContent = MAX_MB;
  drawDays(); drawRot(); drawFormBand(); resetDates();
  setInterval(function () { if (me) render(false); }, 30000);
  API.init().then(function (r) {
    MOCK = !!(r && r.mock); $('demo').hidden = !MOCK;
    return API.getSession();
  }).then(function (s) { if (s) showApp(s); else showLogin(); })
    .catch(function (e) { showLogin(); status(msg(e), false); });
})();
