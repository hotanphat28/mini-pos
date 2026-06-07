#!/bin/bash

echo "===================================="
echo "    MINI POS - PRODUCTION VERSION   "
echo "===================================="

echo "[1/3] Kiểm tra thư viện..."
npm install --production

echo "[2/3] Khởi động máy chủ..."
export NODE_ENV=production

# Mở trình duyệt (Tùy chọn, tùy vào OS có xdg-open hoặc open)
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3001 &
elif command -v open > /dev/null; then
  open http://localhost:3001 &
fi

node server.js
