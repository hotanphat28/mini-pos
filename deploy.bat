@echo off
setlocal

echo ==============================================
echo   MINI POS - TRIEN KHAI BAN PRD (WINDOWS)
echo ==============================================

:: 1. Hoi duong dan PRD
set TARGET=C:\MiniPOS
set /p USER_TARGET="Nhap duong dan cai dat PRD (Mac dinh: %TARGET%): "
if not "%USER_TARGET%"=="" set TARGET=%USER_TARGET%

echo.
echo Duong dan PRD se la: %TARGET%
echo Dang bat dau qua trinh deploy...
echo.

:: 2. Build Frontend
echo [1/4] Dang build Frontend...
cd frontend
call npm install
call npm run build
cd ..

:: 3. Tao thu muc va Copy Backend
echo [2/4] Dang copy core API (Backend)...
if not exist "%TARGET%" mkdir "%TARGET%"
xcopy /s /y /i backend\* "%TARGET%\" /exclude:deploy-exclude.txt > nul

:: 4. Copy License PRD neu co
echo [3/4] Dang ap dung ban quyen (License Key)...
if not exist "%TARGET%\data" mkdir "%TARGET%\data"
if exist backend\data-dev\license.key (
    copy /y backend\data-dev\license.key "%TARGET%\data\license.key" > nul
    echo   - Da cap nhat license.key
) else (
    echo   - Khong tim thay license.key moi (Giu nguyen ban quyen cu).
)

:: 5. Copy Frontend Dist va Script Khoi Dong
echo [4/4] Dang copy giao dien (Frontend) va script khoi dong...
if not exist "%TARGET%\public" mkdir "%TARGET%\public"
xcopy /s /e /y /i frontend\dist\* "%TARGET%\public\" > nul
copy /y start-prd.bat "%TARGET%\start.bat" > nul

echo.
echo ==============================================
echo TRIEN KHAI THANH CONG!
echo.
echo Ban co the mo thu muc: %TARGET%
echo Va chay file "start.bat" de khoi dong phien ban danh cho khach hang.
echo ==============================================
pause
endlocal
