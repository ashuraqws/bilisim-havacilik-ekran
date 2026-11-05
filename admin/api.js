/* Seçici + uyumluluk katmanı: config.js'te SUPABASE_URL doluysa gerçek Supabase (supabase-api.js), değilse deneme (mock-api.js).
   Arayüz window.AdminAPI sözleşmesini çağırır; alttaki katman window.AdminApi (listUsers/addUser/removeUser) kullanır. */
(function () {
  var cfg = window.APP_CONFIG || {};
  var real = !!cfg.SUPABASE_URL;
  var impl = real ? window.SupabaseApi : window.MockApi;
  window.AdminApi = impl;
  window.AdminAPI = {
    init: function () { return Promise.resolve({ mock: !real }); },
    getSession: function () { return impl.getSession(); },
    signIn: function (email) { return impl.signIn(email); },
    signOut: function () { return impl.signOut(); },
    listVideos: function () { return impl.listVideos(); },
    uploadVideo: function (file, meta, onProgress) {
      return impl.uploadVideo(file, meta, function (p) { if (onProgress) onProgress(p <= 1 ? p * 100 : p); });
    },
    updateVideo: function (id, patch) { return impl.updateVideo(id, patch); },
    deleteVideo: function (id) { return impl.deleteVideo(id); },
    videoUrl: function (video) { return impl.videoUrl(video); },
    listPeople: function () { return impl.listUsers(); },
    addPerson: function (email) { return impl.addUser(email); },
    removePerson: function (email) { return impl.removeUser(email); }
  };
})();
