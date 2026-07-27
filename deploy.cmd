@echo off
setlocal
REM ============================================================
REM  UKM.sr - publiceren op Vercel
REM
REM  Dubbelklik dit bestand.
REM  Stap 1 logt in (opent de browser), stap 2 publiceert.
REM
REM  De Vercel CLI start zelf geen login als je meteen
REM  publiceert; hij meldt dan "token is not valid". Daarom
REM  wordt hier eerst apart ingelogd.
REM ============================================================

cd /d "%~dp0"

echo.
echo   UKM.sr publiceren op Vercel
echo   ---------------------------
echo.

REM --- Stap 1: is er al iemand ingelogd? ---------------------
echo   Controleren of je al ingelogd bent...
call npx --yes vercel@latest whoami >nul 2>&1
if errorlevel 1 (
  echo   Nog niet ingelogd. De browser wordt geopend.
  echo.
  echo   Kies "Continue with Email" en gebruik het adres
  echo   van het Vercel-account waar de site onder moet komen.
  echo.
  pause
  call npx --yes vercel@latest login
  if errorlevel 1 goto loginfout
) else (
  echo   Al ingelogd.
)

echo.
echo   Ingelogd als:
call npx --yes vercel@latest whoami

REM --- Stap 2: publiceren ------------------------------------
echo.
echo   Nu publiceren. Druk steeds op Enter voor de standaardkeuze.
echo.
pause

call npx --yes vercel@latest --prod
if errorlevel 1 goto deployfout

echo.
echo   ============================================
echo    Klaar. De link hierboven is je live website.
echo   ============================================
echo.
echo   Stuur die link door, dan wordt hij nagekeken.
echo.
pause
exit /b 0

:loginfout
echo.
echo   Inloggen is niet gelukt. Kopieer de melding hierboven.
echo.
pause
exit /b 1

:deployfout
echo.
echo   Publiceren is niet gelukt. Kopieer de melding hierboven.
echo.
pause
exit /b 1
