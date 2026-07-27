@echo off
setlocal
REM ============================================================
REM  UKM.sr - code naar GitHub zetten
REM
REM  Maak eerst een LEGE repository op github.com:
REM    - geen README, geen .gitignore, geen licentie aanvinken
REM    - kies Private tenzij de code openbaar mag zijn
REM  Kopieer daarna de URL en plak die hieronder.
REM ============================================================

cd /d "%~dp0"

echo.
echo   UKM.sr naar GitHub
echo   ------------------
echo.
echo   Maak eerst een LEGE repository op github.com.
echo   Vink daarbij niets aan: geen README, geen .gitignore.
echo.
set /p REPO=  Plak hier de repository-URL:

if "%REPO%"=="" (
  echo.
  echo   Geen URL ingevuld. Afgebroken.
  pause
  exit /b 1
)

REM Git wil weten wie de commits maakt; alleen voor deze map instellen.
for /f "delims=" %%i in ('git config user.email 2^>nul') do set HASMAIL=%%i
if "%HASMAIL%"=="" (
  echo.
  set /p GHMAIL=  Je GitHub e-mailadres:
  set /p GHNAAM=  Je naam:
  git config user.email "%GHMAIL%"
  git config user.name "%GHNAAM%"
)

echo.
echo   Koppelen aan %REPO%
git remote remove origin 2>nul
git remote add origin "%REPO%"
if errorlevel 1 goto fout

echo.
echo   Uploaden. De eerste keer opent een venster om in te loggen bij GitHub.
git push -u origin main
if errorlevel 1 goto fout

echo.
echo   Klaar. De code staat op GitHub.
echo.
echo   Koppel de repository nu in het Vercel-dashboard:
echo     Add New - Project - Import Git Repository
echo   Daarna publiceert elke wijziging zichzelf.
echo.
pause
exit /b 0

:fout
echo.
echo   Er ging iets mis. Kopieer de melding hierboven.
echo.
pause
exit /b 1
