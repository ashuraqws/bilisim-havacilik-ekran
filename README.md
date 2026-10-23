# Bilişim ve Havacılık Bilgi Ekranı

Okul ekranı için hazırlanmış, kendi kendine akan bir bilgi slaytı sitesi. Konular: **bilişim teknolojileri** ve **havacılık**. Slaytlar sırayla otomatik değişir; etkileşim gerekmez.

## Siteyi aç

**https://ashuraqws.github.io/bilisim-havacilik-ekran/**

Bu bir web sitesidir, bilgisayara hiçbir şey kurulmaz. Tarayıcıda linki açmak yeterlidir (internet bağlantısı gerekir). Ekranda tam ekran göstermek için **F11** tuşuna basın.

## Kontrol

| Tuş | İşlev |
|---|---|
| **Sağ ok (→)** | Bir sonraki slayta geçer (slaytın bitmesini beklemeden) |
| **F11** | Tam ekran açar/kapatır |

## Neler var

- 24 konu, her biri 4 parçalık seri (toplam 96 slayt). Bilişim ve havacılık sırayla gelir, sıra her turda karışır.
- Bazı slaytlarda dönen 3B modeller (işlemci, jet motoru, yolcu uçağı, geleceğin uçağı, sunucu rafı, helikopter, drone) bulunur. Modeller periyodik olarak parçalarına ayrılır ve parça adları görünür.
- Atölye videoları eklenebilir (aşağıya bakın).

## İçerik nasıl değiştirilir

- Slayt metinleri `slides.js` dosyasındadır.
- Atölye videosu eklemek için MP4 dosyasını `videos/` klasörüne koyun ve `videos.js` içine şu satırı ekleyin:

```js
{ file: 'videos/atolye1.mp4', title: 'Atölyede devre kurulumu' },
```

Değişiklikler GitHub'a yüklendikten yaklaşık 1-2 dakika sonra sitede görünür. Ekran her gün 04:00'te kendini yeniler.

## Yerelde çalıştırma (isteğe bağlı)

Siteyi kendi bilgisayarında denemek isterseniz klasörde `python -m http.server 8770` komutunu çalıştırıp `http://localhost:8770` adresini açın. `YAYIN-V5-AC.bat` dosyası aynısını tam ekran yapar. Sadece yerelde denemek içindir, yayın için gerekmez.

## Teknik not

- Tarayıcıda çalışan saf HTML/JavaScript. Derleme veya paket kurulumu yoktur.
- 3B için [Three.js](https://threejs.org/) (MIT lisanslı, `vendor/` içinde yerel kopya) kullanılır. 3B modeller kodla çizilir, harici model dosyası yoktur.
- Gizli bir ayar ya da kişisel veri içermez.
