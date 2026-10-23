@echo off
rem v5: 3B modelli tasarim. Python gerektirir (yerel sunucu).
rem Onceki tasarimlara donmek icin: ..\yayin-v4 veya ..\yayin-v3 klasorundeki index.html dosyasini ac.
cd /d "%~dp0"
start "YayinV5Sunucu" /min cmd /c "python -m http.server 8770"
timeout /t 2 /nobreak >nul
start "" msedge --kiosk "http://localhost:8770/index.html" --edge-kiosk-type=fullscreen
