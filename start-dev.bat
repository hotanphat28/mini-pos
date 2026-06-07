@echo off
echo Dang khoi dong Backend server (DEV)...
cd backend
call npm install
start cmd /k "npm run dev"
cd ..

echo Dang khoi dong Frontend (DEV)...
cd frontend
call npm install
start cmd /k "npm run dev"
cd ..

echo Mini POS (DEV) da khoi dong!
echo Truy cap Backend tai: http://localhost:3001
echo Truy cap Frontend tai: http://localhost:3000 (Va cac thiet bi trong mang LAN)
pause
