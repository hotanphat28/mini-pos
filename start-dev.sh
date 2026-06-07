#!/bin/bash

# Mini POS Start Script (Linux/Mac) - DEV

echo "Đang khởi động Backend server (DEV)..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

echo "Đang khởi động Frontend (DEV)..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "Mini POS (DEV) đã khởi động!"
echo "Truy cập Backend tại: http://localhost:3001"
echo "Truy cập Frontend tại: http://localhost:3000 (Và các thiết bị LAN có thể truy cập qua IP nội bộ)"
echo "Nhấn Ctrl+C để tắt hệ thống."

wait $BACKEND_PID
wait $FRONTEND_PID
