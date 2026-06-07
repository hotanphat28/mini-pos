#!/bin/bash

echo "=============================================="
echo "  MINI POS - TRIỂN KHAI BẢN PRD (LINUX/MAC)"
echo "=============================================="

# 1. Hỏi đường dẫn PRD
DEFAULT_TARGET="$HOME/mini-pos-prd"
read -p "Nhập đường dẫn cài đặt PRD (Mặc định: $DEFAULT_TARGET): " USER_TARGET
TARGET="${USER_TARGET:-$DEFAULT_TARGET}"

echo ""
echo "Đường dẫn PRD sẽ là: $TARGET"
echo "Đang bắt đầu quá trình deploy..."
echo ""

# 2. Build Frontend
echo "[1/4] Đang build Frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Tạo thư mục và Copy Backend
echo "[2/4] Đang copy core API (Backend)..."
mkdir -p "$TARGET"
if command -v rsync > /dev/null; then
    rsync -av --exclude 'node_modules' --exclude 'data' --exclude 'data-dev' --exclude 'uploads' backend/ "$TARGET/" > /dev/null
else
    # cp fallback
    cp -r backend/* "$TARGET/" 2>/dev/null
    rm -rf "$TARGET/node_modules" "$TARGET/data" "$TARGET/data-dev" "$TARGET/uploads"
fi

# 4. Copy License PRD nếu có
echo "[3/4] Đang áp dụng bản quyền (License Key)..."
mkdir -p "$TARGET/data"
if [ -f "backend/data-dev/license.key" ]; then
    cp backend/data-dev/license.key "$TARGET/data/license.key"
    echo "  - Đã cập nhật license.key"
else
    echo "  - Không tìm thấy license.key mới (Giữ nguyên bản quyền cũ)."
fi

# 5. Copy Frontend Dist và Script Khởi động
echo "[4/4] Đang copy giao diện (Frontend) và script khởi động..."
mkdir -p "$TARGET/public"
cp -r frontend/dist/* "$TARGET/public/"
cp start-prd.sh "$TARGET/start.sh"
chmod +x "$TARGET/start.sh"

echo ""
echo "=============================================="
echo "TRIỂN KHAI THÀNH CÔNG!"
echo ""
echo "Bạn có thể mở terminal tại thư mục: $TARGET"
echo "Và chạy lệnh './start.sh' để khởi động phiên bản dành cho khách hàng."
echo "=============================================="
