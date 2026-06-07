@echo off
echo ====================================
echo    MINI POS - PHIEN BAN SAN XUAT
echo ====================================

echo [1/3] Dang kiem tra thu vien...
call npm install --production

echo [2/3] Khoi dong may chu...
set NODE_ENV=production
start http://localhost:3001
node server.js
