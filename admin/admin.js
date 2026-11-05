// Yayın paneli arayüzü. Veri katmanı AdminApi sözleşmesidir (Supabase ya da deneme).
const api = window.AdminApi || window.MockApi;
const S = window.Schedule;
const $ = id => document.getElementById(id);
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MAX_MB = (window.APP_CONFIG && window.APP_CONFIG.MAX_VIDEO_MB) || 50;
const MAX_USERS = 5;
let videos = [];
let me = null;
let lastSig = '';

// ---------- yardımcılar ----------
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
}
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return ymd(d); };
const toMin = t => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
const fmtDay = s => parseDay(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
const dayDiff = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);
const isoDow = d => (d.getDay() + 6) % 7 + 1;
const dur = m => (m >= 60 ? Math.floor(m / 60) + ' sa ' : '') + (m % 60) + ' dk';
const daysText = v => v.weekdays && v.weekdays.length && v.weekdays.length < 7 ? v.weekdays.slice().sort().map(d => DAYS[d - 1]).join(', ') : 'her gün';

function toast(msg, bad) {
  const t = $('toast');
  t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200);
}
function setMsg(el, msg, bad) { el.textContent = msg || ''; el.classList.toggle('bad', !!bad); }

// ---------- görünüm ----------
function show(view) {
  $('login').hidden = view !== 'login';
  $('app').hidden = view !== 'app';
  $('mockNote').hidden = api.mode !== 'mock';
}

function remainingText(v, now) {
  const nm = now.getHours() * 60 + now.getMinutes();
  let left = toMin(v.daily_to) - nm;
  if (left <= 0) left += 1440;
  const d = dayDiff(ymd(now), v.end_date);
  return 'Bugün ' + v.daily_to + '’a kadar · ' + dur(left) + ' kaldı · son gün ' + fmtDay(v.end_date) + (d > 0 ? ' (' + d + ' gün)' : ' (bugün)');
}

function statusText(v, st, now) {
  const today = ymd(now);
  if (st === 'disabled') return 'Kapalı · elle durduruldu';
  if (st === 'scheduled') { const d = dayDiff(today, v.start_date); return fmtDay(v.start_date) + '’de başlar' + (d === 1 ? ' (yarın)' : ' (' + d + ' gün sonra)'); }
  if (st === 'expired') return fmtDay(v.end_date) + ' tarihinde bitti';
  if (st === 'outside-hours') {
    if (v.weekdays && v.weekdays.length && !v.weekdays.includes(isoDow(now))) return 'Bugün yayın günü değil · ' + daysText(v);
    return 'Saat dışında · ' + v.daily_from + '–' + v.daily_to + ' arası oynar';
  }
  return '';
}
const PILL = { disabled: 'Kapalı', scheduled: 'Planlı', expired: 'Bitti', 'outside-hours': 'Beklemede', active: 'Yayında' };

function actions(v, st) {
  return h('div', { class: 'acts' },
    h('button', { type: 'button', class: 'btn small', 'aria-pressed': String(v.enabled), onclick: () => mutate(() => api.updateVideo(v.id, { enabled: !v.enabled }), v.enabled ? 'Video durduruldu.' : 'Video yeniden açıldı.') },
      v.enabled ? 'Durdur' : 'Aç'),
    h('button', { type: 'button', class: 'btn small', onclick: () => {
      const today = ymd(new Date());
      const base = v.end_date < today ? today : v.end_date;
      mutate(() => api.updateVideo(v.id, { end_date: addDays(base, 7) }), 'Bitiş ' + fmtDay(addDays(base, 7)) + ' oldu.');
    } }, st === 'expired' ? '1 hafta daha yayınla' : '1 hafta uzat'),
    h('button', { type: 'button', class: 'btn small danger', onclick: () => {
      if (confirm('“' + v.title + '” silinsin mi? Bu geri alınamaz.')) mutate(() => api.deleteVideo(v.id), 'Video silindi.');
    } }, 'Sil'));
}

function meta(v) {
  return h('p', { class: 'meta' }, v.daily_from + '–' + v.daily_to + ' · ' + daysText(v) + ' · ' + v.every_n + ' slaytta bir');
}

function liveCard(v, now) {
  const media = h('div', { class: 'media' });
  Promise.resolve(api.videoUrl(v)).then(url => {
    if (url) return media.append(h('video', { src: url, controls: true, muted: true, preload: 'metadata', 'aria-label': v.title + ' önizlemesi' }));
    const ph = h('div', { class: 'placeholder' });
    ph.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg><span>Önizleme yok</span>';
    media.append(ph);
  });
  return h('article', { class: 'live-card' }, media,
    h('div', { class: 'live-body' },
      h('h3', null, v.title),
      h('p', { class: 'rem', 'data-rem': v.id }, remainingText(v, now)),
      meta(v),
      actions(v, 'active')));
}

function row(v, st, now) {
  return h('li', { class: 'row' },
    h('div', { class: 'row-main' },
      h('p', { class: 'row-title' }, h('span', { class: 'pill ' + st }, PILL[st]), v.title),
      h('p', { class: 'meta' }, statusText(v, st, now) + ' · ' + fmtDay(v.start_date) + ' – ' + fmtDay(v.end_date)),
      meta(v)),
    actions(v, st));
}

function onToday(v, now) {
  const t = ymd(now);
  return v.enabled && v.start_date <= t && v.end_date >= t && (!v.weekdays || !v.weekdays.length || v.weekdays.includes(isoDow(now)));
}

function renderStrip(now) {
  const list = $('strip');
  const today = videos.filter(v => onToday(v, now)).sort((a, b) => a.daily_from.localeCompare(b.daily_from));
  list.replaceChildren(...(today.length ? today.map(v => {
    const a = toMin(v.daily_from), b = toMin(v.daily_to);
    const segs = a < b ? [[a, b]] : [[a, 1440], [0, b]]; // başlangıç > bitiş: gece yarısını aşar
    const on = S.isActive(v, now);
    return h('li', { class: 'lane' + (on ? ' on' : '') },
      h('span', { class: 'lane-name' }, v.title, h('span', { class: 'lane-time' }, v.daily_from + '–' + v.daily_to)),
      h('span', { class: 'track', 'aria-hidden': 'true' },
        segs.map(([x, y]) => h('i', { style: 'left:' + (x / 14.4) + '%;width:' + ((y - x) / 14.4) + '%' }))));
  }) : [h('li', { class: 'empty' }, 'Bugün yayın planlanmış video yok.')]));
  const nm = now.getHours() * 60 + now.getMinutes();
  $('nowLine').style.setProperty('--x-n', nm / 1440);
  $('nowLine').hidden = !today.length;
  $('clock').textContent = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
}

function render() {
  const now = new Date();
  const by = { active: [], queue: [], expired: [] };
  for (const v of videos) {
    const st = S.statusOf(v, now);
    (st === 'active' ? by.active : st === 'expired' ? by.expired : by.queue).push([v, st]);
  }
  by.queue.sort((a, b) => a[0].start_date.localeCompare(b[0].start_date));
  by.expired.sort((a, b) => b[0].end_date.localeCompare(a[0].end_date));
  lastSig = videos.map(v => v.id + S.statusOf(v, now)).join();

  renderStrip(now);
  $('liveCount').textContent = by.active.length;
  $('live').replaceChildren(...(by.active.length ? by.active.map(([v]) => liveCard(v, now))
    : [h('p', { class: 'empty panel' }, 'Şu an ekranda dönen video yok. Slaytlar normal akışında.')]));
  $('queueCount').textContent = by.queue.length;
  $('queue').replaceChildren(...(by.queue.length ? by.queue.map(([v, st]) => row(v, st, now)) : [h('li', { class: 'empty' }, 'Bekleyen video yok.')]));
  $('doneCount').textContent = by.expired.length;
  $('done').replaceChildren(...(by.expired.length ? by.expired.map(([v, st]) => row(v, st, now)) : [h('li', { class: 'empty' }, 'Süresi biten video yok.')]));
}

// Her 30 sn: durumlar değiştiyse tümünü çiz, değişmediyse yalnız saat ve kalan süreleri güncelle (oynayan önizleme kesilmesin).
function tick() {
  if ($('app').hidden) return;
  const now = new Date();
  if (videos.map(v => v.id + S.statusOf(v, now)).join() !== lastSig) return render();
  renderStrip(now);
  document.querySelectorAll('[data-rem]').forEach(el => {
    const v = videos.find(x => x.id === el.dataset.rem);
    if (v) el.textContent = remainingText(v, now);
  });
}

async function loadVideos() {
  try { videos = await api.listVideos(); render(); }
  catch (e) { toast('Videolar alınamadı: ' + e.message, true); }
}

async function mutate(fn, okMsg) {
  try { await fn(); toast(okMsg); await loadVideos(); }
  catch (e) { toast(e.message, true); }
}

// ---------- yetkili kişiler ----------
function renderUsers(list) {
  $('usersCount').textContent = list.length + ' / ' + MAX_USERS;
  $('users').replaceChildren(...list.map(u => h('li', null,
    h('span', null, u.email, u.email === me ? h('span', { class: 'you' }, ' (sen)') : null),
    u.email === me ? null : h('button', { type: 'button', class: 'btn small ghost', 'aria-label': u.email + ' adresini çıkar', onclick: async () => {
      if (!confirm(u.email + ' yetkili listesinden çıkarılsın mı?')) return;
      try { renderUsers(await api.removeUser(u.email)); setMsg($('userMsg'), 'Çıkarıldı.'); }
      catch (e) { setMsg($('userMsg'), e.message, true); }
    } }, 'Çıkar'))));
  const full = list.length >= MAX_USERS;
  $('userEmail').disabled = full;
  $('userForm').querySelector('button').disabled = full;
  $('userEmail').placeholder = full ? 'Liste dolu (en fazla 5 kişi)' : 'yeni.kisi@okul.k12.tr';
}

$('userForm').addEventListener('submit', async e => {
  e.preventDefault();
  try { renderUsers(await api.addUser($('userEmail').value)); $('userEmail').value = ''; setMsg($('userMsg'), 'Eklendi. Bu kişi artık giriş yapabilir.'); }
  catch (err) { setMsg($('userMsg'), err.message, true); }
});

// ---------- video ekleme ----------
const fileInput = $('file'), drop = $('drop');
$('dropLimit').textContent = 'Yalnız video dosyaları, en fazla ' + MAX_MB + ' MB';
$('days').append(...DAYS.map((d, i) => h('label', { class: 'day' }, h('input', { type: 'checkbox', value: String(i + 1) }), h('span', null, d))));

function fileProblem(f) {
  if (!f) return 'Önce bir video dosyası seç.';
  if (!/^video\//.test(f.type || '')) return 'Bu dosya bir video değil. MP4 veya WebM gibi bir video seç.';
  if (f.size > MAX_MB * 1048576) return 'Dosya ' + (f.size / 1048576).toFixed(1) + ' MB; en fazla ' + MAX_MB + ' MB yüklenebilir.';
  return '';
}
function pickedFile() {
  const f = fileInput.files[0];
  const bad = f && fileProblem(f);
  drop.classList.toggle('has', !!f && !bad);
  drop.classList.toggle('bad', !!bad);
  $('dropText').replaceChildren(...(f ? [h('b', null, f.name), ' · ' + (f.size / 1048576).toFixed(1) + ' MB'] : [h('b', null, 'Videoyu buraya sürükle'), ' ya da seçmek için tıkla']));
  setMsg($('addMsg'), bad || '', !!bad);
  if (f && !bad && !$('title').value.trim()) $('title').value = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}
fileInput.addEventListener('change', pickedFile);
['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; pickedFile(); } });

function resetForm() {
  $('addForm').reset();
  const t = ymd(new Date());
  $('startDate').value = t; $('endDate').value = addDays(t, 7);
  pickedFile();
}

$('addForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = fileInput.files[0], msg = $('addMsg');
  const bad = fileProblem(f);
  if (bad) return setMsg(msg, bad, true);
  const m = {
    title: $('title').value.trim(), start_date: $('startDate').value, end_date: $('endDate').value,
    daily_from: $('dailyFrom').value, daily_to: $('dailyTo').value, every_n: Number($('everyN').value),
    weekdays: [...$('days').querySelectorAll('input:checked')].map(i => Number(i.value)), enabled: true
  };
  if (!m.weekdays.length) m.weekdays = [1, 2, 3, 4, 5, 6, 7]; // schedule.js boş listeyi "hiçbir gün" sayar
  if (!m.title) { $('title').focus(); return setMsg(msg, 'Videoya bir başlık ver.', true); }
  if (!m.start_date || !m.end_date || m.end_date < m.start_date) return setMsg(msg, 'Bitiş tarihi başlangıçtan önce olamaz.', true);
  if (!Number.isInteger(m.every_n) || m.every_n < 2 || m.every_n > 50) return setMsg(msg, 'Sıklık 2 ile 50 arasında olmalı.', true);

  const btn = $('addBtn'), bar = $('progress');
  btn.disabled = true; bar.hidden = false; bar.firstElementChild.style.width = '0%';
  setMsg(msg, 'Yükleniyor…');
  try {
    await api.uploadVideo(f, m, p => { bar.firstElementChild.style.width = Math.round(p * 100) + '%'; setMsg(msg, 'Yükleniyor… %' + Math.round(p * 100)); });
    resetForm();
    setMsg(msg, '“' + m.title + '” eklendi.');
    await loadVideos();
  } catch (err) { setMsg(msg, err.message, true); }
  finally { btn.disabled = false; setTimeout(() => { bar.hidden = true; }, 600); }
});

// ---------- giriş ----------
$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.submitter || $('loginForm').querySelector('button');
  btn.disabled = true; setMsg($('loginMsg'), 'Gönderiliyor…');
  try {
    const r = await api.signIn($('loginEmail').value);
    setMsg($('loginMsg'), r.message, !r.ok);
    if (r.ok && await api.getSession()) await enter();
  } catch (err) { setMsg($('loginMsg'), err.message, true); }
  finally { btn.disabled = false; }
});

$('signOut').addEventListener('click', async () => { await api.signOut(); me = null; show('login'); $('loginEmail').focus(); });

async function enter() {
  const s = await api.getSession();
  if (!s) return show('login');
  me = s.email.toLowerCase();
  $('whoEmail').textContent = s.email;
  show('app');
  resetForm();
  await Promise.all([loadVideos(), api.listUsers().then(renderUsers).catch(e => setMsg($('userMsg'), e.message, true))]);
}

(async function init() {
  if (!api || !S) {
    show('login');
    $('loginForm').hidden = true;
    setMsg($('loginMsg'), 'Panel dosyaları eksik yüklendi (' + (!S ? 'schedule.js' : 'api') + '). Sayfayı yenile; düzelmezse yöneticiye haber ver.', true);
    $('loginForm').after($('loginMsg'));
    return;
  }
  if (api.mode === 'mock') {
    const hint = $('loginHint');
    hint.hidden = false;
    hint.textContent = 'Deneme modu: örnek adreslerden biriyle gir, ör. mudur@okul.k12.tr';
  }
  await enter();
  setInterval(tick, 30000);
})();
