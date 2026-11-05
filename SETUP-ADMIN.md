# Admin paneli kurulumu

1. https://supabase.com adresinde ucretsiz bir proje acin.
2. **Authentication > Providers**'da E-posta girisini acik tutun. **URL Configuration**'da Site URL olarak yayin adresini (GitHub Pages) ve `.../admin/` adresini Redirect URLs'e ekleyin.
3. **SQL Editor**'de `supabase/setup.sql` dosyasinin tamamini calistirin.
4. Ayni yerde ilk yetkili e-postayi ekleyin:
   `insert into public.allowed_users (email) values ('siz@okul.k12.tr');`
   (En fazla 5 kisi; sonrasini admin panelinden eklersiniz.)
5. **Project Settings > API**'den `Project URL` ve `anon public` anahtarini `config.js` icindeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` alanlarina yazin.
6. `service_role` anahtarini HICBIR dosyaya yazmayin, paylasmayin.
7. Degisikligi GitHub'a gonderin; `/admin/` adresinden e-posta ile giris yapin.

`SUPABASE_URL` bos kalirsa site eskisi gibi calisir, admin sayfasi sahte (localStorage) modda acilir.
