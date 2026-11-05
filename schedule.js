/* Video zamanlama çekirdeği (tarayıcı: window.Schedule, Node: module.exports). Tarih/saat yerel saattir. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Schedule = api;
})(typeof self !== 'undefined' ? self : this, function () {
  function minutes(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
    return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : NaN;
  }
  function ymd(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  // Pencerenin başladığı gün tarih aralığında ve seçili hafta günlerinde mi (1=Pzt..7=Paz)
  function dayOk(v, d) {
    var s = ymd(d);
    var wd = v.weekdays || [];
    return s >= v.start_date && s <= v.end_date && (wd.length === 0 || wd.indexOf(d.getDay() || 7) >= 0);
  }
  function isActiveNow(v, now) {
    now = now || new Date();
    if (!v || !v.enabled || !v.start_date || !v.end_date) return false;
    var from = minutes(v.daily_from), to = minutes(v.daily_to), cur = now.getHours() * 60 + now.getMinutes();
    if (isNaN(from) || isNaN(to) || from === to) return false;
    if (from < to) return cur >= from && cur < to && dayOk(v, now);
    if (cur >= from) return dayOk(v, now);          // gece yarısını aşan pencere, akşam kısmı
    if (cur < to) { var y = new Date(now); y.setDate(y.getDate() - 1); return dayOk(v, y); } // sabah kısmı: başlangıç günü dün
    return false;
  }
  // Panel rozeti için: disabled | expired | scheduled | active | outside-hours
  function statusOf(v, now) {
    now = now || new Date();
    if (!v.enabled) return 'disabled';
    var today = ymd(now);
    if (today > v.end_date) return 'expired';
    if (today < v.start_date) return 'scheduled';
    return isActiveNow(v, now) ? 'active' : 'outside-hours';
  }
  // lastId'den sonraki aktif videoyu dairesel seçer; lastId listede/aktif değilse bile çalışır.
  function pickNext(list, lastId, now) {
    list = list || [];
    var i = -1, k, v;
    for (k = 0; k < list.length; k++) if (list[k].id === lastId) i = k;
    for (k = 1; k <= list.length; k++) {
      v = list[(i + k + list.length) % list.length];
      if (isActiveNow(v, now)) return v;
    }
    return null;
  }
  return { isActiveNow: isActiveNow, isActive: isActiveNow, statusOf: statusOf, pickNext: pickNext };
});
