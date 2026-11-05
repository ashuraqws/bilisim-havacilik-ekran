/* Uzak video yayını ayarı. Boş bırakılırsa özellik kapalıdır (site eskisi gibi çalışır, admin DEMO modunda açılır).
   Yalnızca herkese açık anon anahtarı yazılır; service role anahtarı ASLA buraya yazılmaz. */
window.APP_CONFIG = {
  SUPABASE_URL: '',      // örn. https://xxxx.supabase.co
  SUPABASE_ANON_KEY: '', // Project Settings > API > anon public
  MAX_VIDEO_MB: 50
};
