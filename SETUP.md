# Admin paneli kurulumu

1. supabase.com'da yeni bir proje açın.
2. SQL Editor'da `supabase/setup.sql` dosyasını çalıştırın. Dosyanın sonundaki `insert ... 'E_POSTA_BURAYA'` satırının başındaki `--` işaretini kaldırıp kendi e-postanızı (küçük harf) yazın.
3. Project Settings > API sayfasındaki Project URL ve `anon public` anahtarını `config.js` içindeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` alanlarına yazın. `service_role` anahtarını hiçbir dosyaya yazmayın.
4. Authentication > URL Configuration bölümünde Site URL ve Redirect URLs listesine sitenin adresini ekleyin (örn. `https://kullanici.github.io/yayin-v5/admin/`).
5. `/admin/` adresini açın, e-postanızı girin, gelen bağlantıyla giriş yapın. Diğer yetkilileri (en fazla 5) panelden ekleyin.

`config.js` boşsa admin panel DEMO modunda (veriler yalnız o tarayıcıda) açılır ve kiosk uzak videoları hiç çağırmaz.
