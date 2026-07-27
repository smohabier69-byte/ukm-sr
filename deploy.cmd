@echo off
REM ============================================================
REM  UKM.sr - publiceren op Vercel
REM  Dubbelklik dit bestand. De eerste keer opent de browser om
REM  in te loggen; daarna gaat het vanzelf.
REM ============================================================

cd /d "%~dp0"

echo.
echo   UKM.sr wordt gepubliceerd op Vercel
echo   ----------------------------------
echo.
echo   De eerste keer opent je browser om in te loggen.
echo   Daarna: druk steeds op Enter om de standaardkeuze te nemen.
echo.
pause

call npx --yes vercel@latest --prod

echo.
if errorlevel 1 (
  echo   Er ging iets mis. Kopieer de melding hierboven.
) else (
  echo   Klaar. De link hierboven is je live website.
)
echo.
pause
