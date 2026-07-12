@echo off
title Flowchart Auto IP: 3013
cd /d C:\Web_Practice\Function\flowchart
echo C:\Web_Practice\Function\flowchart
echo Starting server.js ...
set "LOCAL_IP="
set "CHROME_EXE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$udp = New-Object System.Net.Sockets.UdpClient; try { $udp.Connect('8.8.8.8', 65530); $udp.Client.LocalEndPoint.Address.IPAddressToString } finally { $udp.Dispose() }"`) do set "LOCAL_IP=%%I"
if not defined LOCAL_IP set "LOCAL_IP=localhost"
echo Flowchart URL: http://%LOCAL_IP%:3013
echo Note: clicking the URL in CMD uses your Windows default browser.
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if defined CHROME_EXE (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process -FilePath $env:CHROME_EXE -ArgumentList 'http://%LOCAL_IP%:3013/flowchart.html'"
) else (
  start "" cmd /c "timeout /t 2 >nul && start chrome http://%LOCAL_IP%:3013/flowchart.html"
)
node server.js
pause
