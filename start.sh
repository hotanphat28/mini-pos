#!/bin/bash

# Mini POS Start Script (Linux/Mac)

echo "Đang khởi động Backend server..."
cd backend
npm install
npm start &
BACKEND_PID=$!
cd ..

echo "Đang khởi động Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "Mini POS đã khởi động!"
echo "Truy cập Backend tại: http://localhost:3001"
echo "Truy cập Frontend tại: http://localhost:3000 (Và các thiết bị LAN có thể truy cập qua IP nội bộ)"
echo "Nhấn Ctrl+C để tắt hệ thống."

wait $BACKEND_PID
wait $FRONTEND_PID
