// Deneme (mock) AdminApi: sözleşmeyi localStorage ile uygular. Supabase yapılandırılmamışken kullanılır.
(function () {
  const KEY = 'v5admin-mock';
  const MAX_USERS = 5;
  const blobs = {}; // id -> object URL; yalnız bu oturumda yüklenen dosyalar için (sayfa yenilenince kaybolur)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const pad = n => String(n).padStart(2, '0');
  const day = off => { const d = new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const norm = e => String(e || '').trim().toLowerCase();
  const maxMb = () => (window.APP_CONFIG && window.APP_CONFIG.MAX_VIDEO_MB) || 50;

  function seed() {
    const ALL = [1, 2, 3, 4, 5, 6, 7];
    const v = (id, title, s, e, f, t, n, w, en) => ({ id, title, storage_path: 'mock/' + id + '.mp4', start_date: day(s), end_date: day(e), daily_from: f, daily_to: t, every_n: n, weekdays: w, enabled: en, created_at: new Date(Date.now() - 864e5 * 3).toISOString(), created_by: 'mudur@okul.k12.tr' });
    return {
      session: null,
      users: ['mudur@okul.k12.tr', 'bilisim@okul.k12.tr', 'havacilik@okul.k12.tr'],
      videos: [
        v('m1', 'Okul tanıtım filmi', -3, 4, '00:00', '23:59', 10, ALL, true),
        v('m2', 'Bilişim haftası duyurusu', -1, 6, '08:50', '16:10', 8, [1, 2, 3, 4, 5], true),
        v('m3', 'Teknofest başvuruları', 5, 19, '09:00', '17:00', 12, ALL, true),
        v('m4', 'Kantin kuralları', -2, 10, '12:00', '13:00', 6, ALL, false),
        v('m5', 'Cumhuriyet Bayramı töreni', -14, -2, '08:00', '17:00', 10, ALL, true)
      ]
    };
  }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.videos) return s; } catch (e) {} return seed(); }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const usersOf = s => s.users.map(email => ({ email }));

  function checkMeta(m) {
    if (!m.title || !String(m.title).trim()) throw new Error('Başlık boş olamaz.');
    if (!m.start_date || !m.end_date) throw new Error('Başlangıç ve bitiş tarihini seç.');
    if (m.end_date < m.start_date) throw new Error('Bitiş tarihi başlangıçtan önce olamaz.');
    if (!/^\d\d:\d\d$/.test(m.daily_from || '') || !/^\d\d:\d\d$/.test(m.daily_to || '')) throw new Error('Saatleri SS:DD biçiminde gir.');
    if (m.daily_from === m.daily_to) throw new Error('Başlangıç ve bitiş saati aynı olamaz.');
    const n = Number(m.every_n);
    if (!Number.isInteger(n) || n < 1) throw new Error('Sıklık 1 veya daha büyük bir tam sayı olmalı.');
  }

  window.MockApi = {
    mode: 'mock',
    async getSession() { const s = load(); return s.session ? { email: s.session } : null; },
    async signIn(email) {
      await wait(300);
      const s = load(), e = norm(email);
      if (!EMAIL_RE.test(e)) return { ok: false, message: 'Geçerli bir e-posta adresi yaz.' };
      if (!s.users.includes(e)) return { ok: false, message: 'Bu adres yetkili listesinde yok. Bir yöneticiden seni eklemesini iste.' };
      s.session = e; save(s);
      return { ok: true, message: 'Deneme modunda bağlantı gerekmez; giriş yapıldı.' };
    },
    async signOut() { const s = load(); s.session = null; save(s); },
    async listVideos() { return load().videos.slice(); },
    async uploadVideo(file, meta, onProgress) {
      if (!file) throw new Error('Önce bir video dosyası seç.');
      if (!/^video\//.test(file.type || '')) throw new Error('Bu dosya bir video değil. MP4 veya WebM gibi bir video seç.');
      if (file.size > maxMb() * 1048576) throw new Error('Dosya ' + (file.size / 1048576).toFixed(1) + ' MB; en fazla ' + maxMb() + ' MB yüklenebilir.');
      checkMeta(meta);
      for (let p = 0; p <= 100; p += 10) { onProgress && onProgress(p / 100); await wait(80); }
      const s = load(), id = 'm' + Date.now().toString(36);
      const v = Object.assign({}, meta, { id, title: meta.title.trim(), every_n: Number(meta.every_n), weekdays: meta.weekdays || [], enabled: meta.enabled !== false, storage_path: 'mock/' + id + '-' + file.name, created_at: new Date().toISOString(), created_by: s.session || '' });
      blobs[id] = URL.createObjectURL(file);
      s.videos.push(v); save(s);
      return v;
    },
    async updateVideo(id, patch) {
      const s = load(), v = s.videos.find(x => x.id === id);
      if (!v) throw new Error('Video bulunamadı.');
      const next = Object.assign({}, v, patch, { id: v.id });
      checkMeta(next);
      Object.assign(v, next); save(s);
      return v;
    },
    async deleteVideo(id) {
      const s = load(); s.videos = s.videos.filter(x => x.id !== id); save(s);
      if (blobs[id]) { URL.revokeObjectURL(blobs[id]); delete blobs[id]; }
    },
    videoUrl(video) { return blobs[video.id] || ''; }, // örnek videoların dosyası yok; arayüz yer tutucu gösterir
    async listUsers() { return usersOf(load()); },
    async addUser(email) {
      const s = load(), e = norm(email);
      if (!EMAIL_RE.test(e)) throw new Error('Geçerli bir e-posta adresi yaz.');
      if (s.users.includes(e)) throw new Error('Bu adres zaten listede.');
      if (s.users.length >= MAX_USERS) throw new Error('En fazla ' + MAX_USERS + ' yetkili olabilir. Önce birini çıkar.');
      s.users.push(e); save(s);
      return usersOf(s);
    },
    async removeUser(email) {
      const s = load(), e = norm(email);
      if (e === s.session) throw new Error('Kendini listeden çıkaramazsın.');
      s.users = s.users.filter(u => u !== e); save(s);
      return usersOf(s);
    }
  };
})();
