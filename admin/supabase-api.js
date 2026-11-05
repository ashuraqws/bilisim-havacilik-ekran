/* Gerçek Supabase uygulaması (window.SupabaseApi). Önce CDN'den supabase-js (window.supabase) yüklenmeli. */
(function () {
  var C = window.APP_CONFIG || {};
  var MAX = (C.MAX_VIDEO_MB || 50) * 1024 * 1024;
  if (!C.SUPABASE_URL || !window.supabase) return; // yapılandırılmamış: api.js MockApi'yi seçer
  var db = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  function fail(error, msg) { if (error) throw new Error(msg || error.message); }
  function clean(email) { return String(email || '').trim().toLowerCase(); }

  // Dosya adı güvenli ve benzersiz olsun
  function pathFor(file) {
    var ext = (file.name.match(/\.[A-Za-z0-9]{1,5}$/) || [''])[0].toLowerCase();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + ext;
  }

  // Yükleme ilerlemesi için XHR (supabase-js ilerleme vermez)
  function putFile(path, file, token, onProgress) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open('POST', C.SUPABASE_URL + '/storage/v1/object/videos/' + encodeURI(path));
      x.setRequestHeader('Authorization', 'Bearer ' + token);
      x.setRequestHeader('apikey', C.SUPABASE_ANON_KEY);
      x.setRequestHeader('Content-Type', file.type);
      x.setRequestHeader('x-upsert', 'false');
      x.upload.onprogress = function (e) { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      x.onload = function () { x.status < 300 ? resolve() : reject(new Error('Video yüklenemedi (' + x.status + ').')); };
      x.onerror = function () { reject(new Error('Bağlantı hatası: video yüklenemedi.')); };
      x.send(file);
    });
  }

  window.SupabaseApi = {
    mode: 'supabase',

    getSession: function () {
      return db.auth.getSession().then(function (r) {
        var u = r.data && r.data.session && r.data.session.user;
        return u && u.email ? { email: u.email } : null;
      });
    },
    signIn: function (email) {
      email = clean(email);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.resolve({ ok: false, message: 'Geçerli bir e-posta adresi yazın.' });
      // yetki girişte değil allowed_users tablosunda (RLS) denetlenir
      return db.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } })
        .then(function (r) {
          return r.error ? { ok: false, message: 'Bağlantı gönderilemedi: ' + r.error.message }
            : { ok: true, message: 'Giriş bağlantısı e-postanıza gönderildi.' };
        });
    },
    signOut: function () { return db.auth.signOut().then(function () {}); },

    listVideos: function () {
      return db.from('videos').select('*').order('created_at', { ascending: false }).then(function (r) { fail(r.error); return r.data; });
    },
    uploadVideo: function (file, meta, onProgress) {
      // Kontroller yükleme başlamadan yapılır
      if (!file || !/^video\//.test(file.type)) return Promise.reject(new Error('Yalnızca video dosyaları yüklenebilir.'));
      if (file.size > MAX) return Promise.reject(new Error('Video en fazla ' + (C.MAX_VIDEO_MB || 50) + ' MB olabilir.'));
      var path = pathFor(file), token;
      return db.auth.getSession().then(function (r) {
        token = r.data && r.data.session && r.data.session.access_token;
        if (!token) throw new Error('Oturum bulunamadı, tekrar giriş yapın.');
        return putFile(path, file, token, onProgress);
      }).then(function () {
        var row = Object.assign({}, meta, { storage_path: path });
        return db.from('videos').insert(row).select().single();
      }).then(function (r) {
        if (r.error) { db.storage.from('videos').remove([path]); fail(r.error); } // kayıt eklenemezse dosya yetim kalmasın
        return r.data;
      });
    },
    updateVideo: function (id, patch) {
      return db.from('videos').update(patch).eq('id', id).select().single().then(function (r) { fail(r.error); return r.data; });
    },
    deleteVideo: function (id) {
      return db.from('videos').select('storage_path').eq('id', id).single().then(function (r) {
        fail(r.error);
        return db.from('videos').delete().eq('id', id).then(function (d) {
          fail(d.error);
          return db.storage.from('videos').remove([r.data.storage_path]);
        });
      }).then(function () {});
    },
    videoUrl: function (v) { return db.storage.from('videos').getPublicUrl(v.storage_path).data.publicUrl; },

    listUsers: function () {
      return db.from('allowed_users').select('email').order('email').then(function (r) { fail(r.error); return r.data; });
    },
    addUser: function (email) {
      email = clean(email);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.reject(new Error('Geçerli bir e-posta adresi yazın.'));
      var self = this;
      return db.from('allowed_users').insert({ email: email }).then(function (r) {
        if (r.error) {
          if (/En fazla 5/.test(r.error.message)) throw new Error('En fazla 5 yetkili kişi eklenebilir.');
          if (r.error.code === '23505') throw new Error('Bu e-posta zaten ekli.');
          throw new Error(r.error.message);
        }
        return self.listUsers();
      });
    },
    removeUser: function (email) {
      var self = this;
      return db.from('allowed_users').delete().eq('email', clean(email)).then(function (r) { fail(r.error); return self.listUsers(); });
    }
  };
})();
