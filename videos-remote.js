/* Uzak video yayını (kiosk): Supabase'ten listeyi fetch ile alır, zamanlamaya göre süzer. config.js boşsa hiçbir şey yapmaz. */
(function () {
  var C = window.APP_CONFIG || {}, KEY = 'v5remote', on = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY);
  var list = [], started = false;
  if (on) { try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {} if (!Array.isArray(list)) list = []; } // son iyi liste (çevrimdışı yedek)

  function refresh() {
    return fetch(C.SUPABASE_URL + '/rest/v1/videos?select=id,title,storage_path,start_date,end_date,daily_from,daily_to,weekdays,every_n,enabled&enabled=eq.true', {
      headers: { apikey: C.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + C.SUPABASE_ANON_KEY }, cache: 'no-store'
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows)) throw new Error('liste');
        list = rows;
        try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
      })
      .catch(function (e) { console.warn('[v5] video listesi alınamadı, son iyi liste kullanılıyor', e); });
  }

  var api = {
    lastId: null, // app.js araya video koyunca günceller; aynı video art arda gelmez
    start: function () { if (on && !started) { started = true; refresh(); setInterval(refresh, 60000); } },
    // Aktif ve sıradaki videoyu verir (durum değiştirmez); sayaç kararı app.js'tedir.
    next: function (now) {
      if (!on || !window.Schedule) return null;
      var v = window.Schedule.pickNext(list, api.lastId, now || new Date());
      return v ? { video: C.SUPABASE_URL + '/storage/v1/object/public/videos/' + encodeURI(v.storage_path), title: v.title, topic: null, every_n: v.every_n || 10, id: v.id } : null;
    }
  };
  window.RemoteVideos = api;
})();
