# Admin paneli kurulumu

1. https://supabase.com adresinde ucretsiz bir proje acin.
2. **Authentication > Users > Add user**: kullanici adi olarak `pano@pano.local` yazin (panel bu adresi kendisi uretir, kullanici gormez), guclu bir sifre belirleyin ve **Auto Confirm User** secenegini isaretleyin. Olusan kullanicinin UUID'sini kopyalayin.
3. **Authentication > Sign In / Providers**'da "Allow new users to sign up" secenegini kapatin.
4. **SQL Editor**'de `supabase/setup.sql` dosyasinin tamamini calistirin. Sondaki `'UUID_BURAYA'` yerine 2. adimdaki UUID'yi yazip satir basindaki `--` isaretini kaldirin ve o satiri da calistirin.
5. **Project Settings > API**'den `Project URL` ve `anon public` anahtarini `config.js` icindeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` alanlarina yazin.
6. `service_role` anahtarini HICBIR dosyaya yazmayin, paylasmayin.
7. Degisikligi GitHub'a gonderin; `/admin/` adresinden kullanici adi `pano` ve belirlediginiz sifreyle giris yapin.

`SUPABASE_URL` bos kalirsa site eskisi gibi calisir, admin sayfasi sahte (localStorage) modda acilir; demo girisi `pano` / `1234`.
