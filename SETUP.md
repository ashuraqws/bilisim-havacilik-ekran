# Admin paneli kurulumu

1. supabase.com'da yeni bir proje açın.
2. Authentication > Users > Add user: kullanıcı adı olarak `pano@pano.local` yazın (panel bu adresi kendisi üretir, kullanıcı görmez), güçlü bir şifre belirleyin ve "Auto Confirm User" seçeneğini işaretleyin. Oluşan kullanıcının UUID'sini kopyalayın.
3. Authentication > Sign In / Providers bölümünde "Allow new users to sign up" seçeneğini kapatın; başka kullanıcı kaydı açılmasın.
4. SQL Editor'da `supabase/setup.sql` dosyasını çalıştırın. Dosyanın sonundaki `'UUID_BURAYA'` yerine 2. adımdaki UUID'yi yazın, satır başındaki `--` işaretini kaldırın ve bu satırı da çalıştırın.
5. Project Settings > API sayfasındaki Project URL ve `anon public` anahtarını `config.js` içindeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` alanlarına yazın. `service_role` anahtarını hiçbir dosyaya yazmayın.
6. `/admin/` adresini açın, kullanıcı adı olarak `pano` ve 2. adımda belirlediğiniz şifreyi girin.

`config.js` boşsa admin panel DEMO modunda (veriler yalnız o tarayıcıda) açılır; demo girişi kullanıcı adı `pano`, şifre `1234`tür. Kiosk uzak videoları hiç çağırmaz.
