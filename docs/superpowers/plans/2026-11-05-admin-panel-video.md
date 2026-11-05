# Admin Paneli ve Video Yayını Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Yetkili en fazla 5 kişinin giriş yapıp video yükleyebildiği, videonun tarih aralığı ve günlük saat penceresinde "her N slaytta bir" siteye otomatik girdiği bir admin paneli.

**Architecture:** Statik site (GitHub Pages) + Supabase (Auth: e-posta bağlantısı, Postgres: `allowed_users`, `videos`, Storage: `videos` bucket). Site, kiosk'ta kütüphane bağımlılığı olmadan Supabase REST'i `fetch` ile okur; admin sayfası `admin/` altında, Supabase JS istemcisiyle çalışır. Zamanlama kuralları tek bir saf modülde (`schedule.js`) durur; hem site hem admin kullanır.

**Tech Stack:** Vanilla HTML/CSS/JS (derleme yok), Supabase REST + Auth + Storage, `node:assert` ile testler.

**Spec:** Bu konuşmadaki kararlar (aşağıdaki "Global Constraints").

## Global Constraints

- Derleme adımı yok; kiosk sitesi (`index.html`) CDN'e bağımlı olmayacak.
- Yetkili e-posta listesi en fazla 5 kişi; giriş e-posta sihirli bağlantısıyla; e-posta karşılaştırması büyük/küçük harfe duyarsız.
- Video süresi: tarih aralığı (`start_date`..`end_date`, ikisi de dahil) + her gün için `daily_from`..`daily_to` (HH:MM, bitiş dahil değil; başlangıç > bitiş ise gece yarısını aşar) + isteğe bağlı hafta günleri (1=Pzt..7=Paz).
- Sıklık: `every_n` slaytta bir, varsayılan 10, video başına ayarlanabilir.
- Canlı yayın bu planın DIŞINDA.
- Video dosya sınırı `MAX_VIDEO_MB = 50` (tek sabit, `config.js` içinde); yalnız `video/*` türleri.
- Arayüz metinleri Türkçe.
- Bulutta (Supabase) proje, tablo veya veri OLUŞTURMA/DEĞİŞTİRME yok; yalnız `supabase/setup.sql` hazırlanır. `service_role` anahtarı hiçbir dosyaya yazılmaz; yalnız `SUPABASE_URL` ve `SUPABASE_ANON_KEY` (boş bırakılır) `config.js`'e girer.
- Ajanlar commit veya push YAPMAZ.
- Slayt akışındaki mevcut davranış bozulmaz: saat slaytı (her 4 slaytta bir), ok tuşları, kaydırma, 18 sn slayt süresi.

## Review Focus

- `now` tam `daily_to` (16:10) iken video aktif değil; tam `daily_from` (08:50) iken aktif.
- `end_date` bugün ise aktif (dahil); `start_date` yarın ise `scheduled`.
- Aktif video yoksa site hiçbir şey eklemez; ağ hatasında son liste (localStorage önbelleği) kullanılır, ekran boş kalmaz.
- 6. e-posta eklenmeye çalışılırsa reddedilir; aynı e-posta farklı harf boyutuyla iki kez eklenemez.
- 50 MB'ı aşan veya video olmayan dosya, yükleme başlamadan Türkçe mesajla reddedilir.

---

## Dosya yapısı

| Dosya | Sorumluluk | Sahibi |
| --- | --- | --- |
| `schedule.js` | Saf zamanlama (UMD: `window.Schedule` + `module.exports`) | Sonnet |
| `tests/schedule.test.js` | `schedule.js` testleri | Sonnet |
| `supabase/setup.sql` | Tablolar, RLS, storage bucket ve politikaları | Sonnet |
| `SETUP-ADMIN.md` | Kurulum adımları (Türkçe, kısa) | Sonnet |
| `config.js` | `window.APP_CONFIG` (url, anon key, `MAX_VIDEO_MB`) | Sonnet |
| `remote-videos.js` | Site tarafı: listeyi çek, önbellekle, sıradaki videoyu seç | Sonnet |
| `app.js` (değişiklik) | Slayt akışına video ekleme | Sonnet |
| `index.html` (değişiklik) | `config.js`, `schedule.js`, `remote-videos.js` script etiketleri | Sonnet |
| `admin/supabase-api.js` | Gerçek Supabase uygulaması (`window.SupabaseApi`) | Sonnet |
| `admin/api.js` | Seçici: `window.AdminApi = APP_CONFIG.SUPABASE_URL ? SupabaseApi : MockApi` | Sonnet |
| `admin/mock-api.js` | localStorage tabanlı sahte uygulama (`window.MockApi`) | Opus |
| `admin/index.html`, `admin/admin.css`, `admin/admin.js` | Arayüz | Opus |
| `graphify-out/` | Kod haritası (`.gitignore`'a eklenir) | Haiku |

## Ortak arayüz (sözleşme)

`Video` = `{ id: string, title: string, storage_path: string, start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD', daily_from: 'HH:MM', daily_to: 'HH:MM', every_n: number, weekdays: number[], enabled: boolean, created_at: string, created_by: string }`

`Schedule` (schedule.js):
- `isActive(video: Video, now: Date): boolean`
- `statusOf(video: Video, now: Date): 'disabled' | 'scheduled' | 'expired' | 'outside-hours' | 'active'` (öncelik: disabled, expired, scheduled, hafta günü/saat dışı = outside-hours, active)
- `pickNext(activeVideos: Video[], lastId: string | null): Video | null` (id sırasına göre döner, liste boşsa null)

`AdminApi` (admin/api.js; MockApi ve SupabaseApi aynı yüzeyi uygular, hepsi Promise döner):
- `mode: 'mock' | 'supabase'`
- `getSession(): {email: string} | null`
- `signIn(email: string): {ok: boolean, message: string}`
- `signOut(): void`
- `listVideos(): Video[]`
- `uploadVideo(file: File, meta: Omit<Video,'id'|'storage_path'|'created_at'|'created_by'>, onProgress: (p: number) => void): Video` (50 MB / tür kontrolü burada, `Error` ile Türkçe mesaj)
- `updateVideo(id: string, patch: Partial<Video>): Video`
- `deleteVideo(id: string): void`
- `videoUrl(video: Video): string`
- `listUsers(): {email: string}[]`, `addUser(email: string): {email: string}[]` (6. kişide hata), `removeUser(email: string): {email: string}[]`

`RemoteVideos` (remote-videos.js, `window.RemoteVideos`):
- `refresh(): Promise<void>` (60 sn'de bir, hata olursa önbellek `localStorage['v5videos']`)
- `due(slidesSinceLastVideo: number): Video | null` (sıradaki aktif videonun `every_n`'i dolmuşsa o videoyu döner)

Site tarafı slayt nesnesi: `{ video: <URL>, title, topic: lastTopic }` (mevcut video slaytı mekanizmasını `app.js` build içinde zaten kullanır).

Supabase şeması: `allowed_users(email text primary key)` (en fazla 5 satır, trigger); `videos` tablosu Video alanlarıyla (`id uuid default gen_random_uuid()`); RLS: `videos` ve storage okuma anon'a açık, yazma yalnız e-postası `allowed_users`'ta olanlara.

---

### Task 1: Zamanlama modülü (Sonnet)

**Files:** Create `schedule.js`, `tests/schedule.test.js`.

- [ ] Yaz: `tests/schedule.test.js` Review Focus'taki 1-2 maddeleri (08:50 aktif, 16:10 aktif değil, `end_date` dahil, `start_date` yarın=scheduled) ve gece yarısını aşan pencereyi doğrulasın.
- [ ] Çalıştır: `node tests/schedule.test.js` — önce FAIL.
- [ ] `schedule.js` içinde `isActive`, `statusOf`, `pickNext` (UMD).
- [ ] Çalıştır: `node tests/schedule.test.js` — PASS.

### Task 2: Supabase şeması ve kurulum notu (Sonnet)

**Files:** Create `supabase/setup.sql`, `SETUP-ADMIN.md`.

- [ ] `setup.sql`: tablolar, 5 kişi sınırı trigger'ı, RLS politikaları, `videos` bucket (public read) ve yazma politikaları. Buluta uygulanmaz.
- [ ] `SETUP-ADMIN.md`: proje açma, SQL'i çalıştırma, ilk e-postayı ekleme, `config.js`'e URL ve anon key yazma (service_role yazma).

### Task 3: Gerçek API (Sonnet)

**Files:** Create `admin/supabase-api.js`, `admin/api.js`.
**Consumes:** `AdminApi` sözleşmesi, `window.APP_CONFIG`. Supabase JS istemcisi `admin/index.html`'de CDN'den yüklenir (yalnız admin sayfası).

- [ ] `SupabaseApi`: tüm sözleşme metotları; boyut/tür kontrolü yükleme başlamadan.
- [ ] `api.js`: seçici.

### Task 4: Site entegrasyonu (Sonnet)

**Files:** Create `config.js`, `remote-videos.js`; Modify `app.js`, `index.html`.

- [ ] `remote-videos.js`: Supabase REST (`/rest/v1/videos?enabled=eq.true`), `apikey` başlığı, `refresh` ve `due`; `SUPABASE_URL` boşsa hiçbir şey yapmaz.
- [ ] `app.js` `next()`: saat slaytından ÖNCE video kontrolü (video önce, saat sonra); sayaç `slidesSinceVideo`.
- [ ] `index.html`: `config.js`, `schedule.js`, `remote-videos.js` etiketleri `app.js`'ten önce.
- [ ] Doğrula: `node --check app.js`; `SUPABASE_URL` boşken eski davranış aynen çalışır.

### Task 5: Admin arayüzü (Opus, tasarım)

**Files:** Create `admin/index.html`, `admin/admin.css`, `admin/admin.js`, `admin/mock-api.js`.
**Consumes:** `AdminApi` sözleşmesi; `const api = window.AdminApi || window.MockApi`.

- [ ] `mock-api.js`: sözleşmeyi localStorage ile uygular, örnek verilerle (aktif, planlı, bitmiş videolar; 3 yetkili e-posta); `mode: 'mock'`.
- [ ] Giriş ekranı: e-posta ile bağlantı iste.
- [ ] Dashboard: video ekleme kartı (sürükle-bırak, başlık, tarih aralığı, günlük saat penceresi, hafta günleri, sıklık), "şu an aktif" önizleme kartları (kalan süre), planlı ve bitmiş listeler, yetkili kişiler kartı (en fazla 5), yükleme ilerlemesi, silme/uzatma/açma-kapama.
- [ ] Tasarım: sitenin açık teması (gri-beyaz zemin, mavi vurgu), kiosk dışı normal ekran, duyarlı, erişilebilir, Türkçe.
- [ ] Doğrula: tarayıcıda mock ile tüm akışlar; ekran görüntüsü.

### Task 6: Kod haritası (Haiku)

**Files:** Modify `.gitignore`.

- [ ] graphify ile `C:\kimyas\yayin-v5` haritası; `graphify-out/` `.gitignore`'a eklenir; kısa özet döner.
