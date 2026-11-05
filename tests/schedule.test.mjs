import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { isActiveNow, pickNext } = createRequire(import.meta.url)('../schedule.js');

const v = (o = {}) => ({ id: 'a', enabled: true, start_date: '2026-11-01', end_date: '2026-11-30',
  daily_from: '08:50', daily_to: '16:10', weekdays: [1, 2, 3, 4, 5, 6, 7], every_n: 10, ...o });
const at = (s) => new Date(s); // yerel saat, saat dilimi eki yok

test('pencere içi ve dışı', () => {
  assert.equal(isActiveNow(v(), at('2026-11-05T12:00:00')), true);
  assert.equal(isActiveNow(v(), at('2026-11-05T08:50:00')), true);
  assert.equal(isActiveNow(v(), at('2026-11-05T08:49:00')), false);
  assert.equal(isActiveNow(v(), at('2026-11-05T16:10:00')), false);
});
test('enabled=false', () => assert.equal(isActiveNow(v({ enabled: false }), at('2026-11-05T12:00:00')), false));
test('tarih uçları dahil, dışı kapalı', () => {
  assert.equal(isActiveNow(v(), at('2026-11-01T12:00:00')), true);
  assert.equal(isActiveNow(v(), at('2026-11-30T12:00:00')), true);
  assert.equal(isActiveNow(v(), at('2026-10-31T12:00:00')), false);
  assert.equal(isActiveNow(v(), at('2026-12-01T12:00:00')), false);
});
test('hafta günü: 2026-11-05 Persembe (4)', () => {
  assert.equal(isActiveNow(v({ weekdays: [1, 2, 3] }), at('2026-11-05T12:00:00')), false);
  assert.equal(isActiveNow(v({ weekdays: [4] }), at('2026-11-05T12:00:00')), true);
  assert.equal(isActiveNow(v({ weekdays: [] }), at('2026-11-05T12:00:00')), true); // boş liste = her gün
  assert.equal(isActiveNow(v({ weekdays: [7] }), at('2026-11-08T12:00:00')), true); // Pazar
});
test('gece yarısını aşan pencere 22:00-02:00', () => {
  const n = v({ daily_from: '22:00', daily_to: '02:00', weekdays: [4] }); // yalnız Persembe başlar
  assert.equal(isActiveNow(n, at('2026-11-05T23:00:00')), true);
  assert.equal(isActiveNow(n, at('2026-11-06T01:00:00')), true);  // Cuma 01:00, başlangıç günü Persembe
  assert.equal(isActiveNow(n, at('2026-11-06T02:00:00')), false);
  assert.equal(isActiveNow(n, at('2026-11-06T23:00:00')), false); // Cuma başlangıcı seçili değil
  assert.equal(isActiveNow(n, at('2026-11-05T01:00:00')), false); // Persembe 01:00 Çarşamba penceresidir
  assert.equal(isActiveNow(v({ daily_from: '22:00', daily_to: '02:00', end_date: '2026-11-05' }), at('2026-11-06T01:00:00')), true);
});
test('eksik veya bozuk alanlar kapalı sayılır', () => {
  assert.equal(isActiveNow(null, at('2026-11-05T12:00:00')), false);
  assert.equal(isActiveNow(v({ daily_from: 'xx' }), at('2026-11-05T12:00:00')), false);
  assert.equal(isActiveNow(v({ start_date: '' }), at('2026-11-05T12:00:00')), false);
});
test('pickNext dairesel', () => {
  const now = at('2026-11-05T12:00:00');
  const l = [v({ id: 'a' }), v({ id: 'b' }), v({ id: 'c' })];
  assert.equal(pickNext(l, 'a', now).id, 'b');
  assert.equal(pickNext(l, 'c', now).id, 'a');
  assert.equal(pickNext(l, null, now).id, 'a');
  assert.equal(pickNext(l, 'zzz', now).id, 'a');
});
test('pickNext pasifleri atlar, tek aktif kendini döndürür, hiç yoksa null', () => {
  const now = at('2026-11-05T12:00:00');
  const l = [v({ id: 'a' }), v({ id: 'b', enabled: false }), v({ id: 'c' })];
  assert.equal(pickNext(l, 'a', now).id, 'c');
  assert.equal(pickNext([v({ id: 'a' })], 'a', now).id, 'a');
  assert.equal(pickNext([l[1]], null, now), null);
  assert.equal(pickNext([], 'a', now), null);
});
