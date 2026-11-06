/* Uzak video yayını ayarı. Boş bırakılırsa özellik kapalıdır (site eskisi gibi çalışır, admin DEMO modunda açılır).
   Yalnızca herkese açık anon anahtarı yazılır; service role anahtarı ASLA buraya yazılmaz. */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://bxvkmpykidppilvajzke.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_o5dvX6cV76nxL_C8kn4JgQ_0OPufqL1', // yalnızca publishable anahtar
  MAX_VIDEO_MB: 50
};
