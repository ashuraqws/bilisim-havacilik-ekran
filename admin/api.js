// Seçici: config.js'te SUPABASE_URL doluysa gerçek Supabase, değilse deneme (localStorage) uygulaması.
window.AdminApi = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) ? window.SupabaseApi : window.MockApi;
