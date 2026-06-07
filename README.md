# Mini POS

Hệ thống quản lý bán hàng (Point of Sale) nhỏ gọn dành cho quán cà phê, trà sữa, hoạt động trên mạng nội bộ (LAN).
Được thiết kế theo tiêu chí "Cài 1 lần, dùng mãi mãi", không yêu cầu phí duy trì server, tự động kết nối qua mạng nội bộ và hỗ trợ in hóa đơn nhiệt (K58/K80).

## Cấu trúc dự án
- `backend/`: Máy chủ Node.js với Express, cung cấp API xử lý dữ liệu. Hệ thống Database dùng JSON được tách nhỏ thành từng file lưu trong thư mục `backend/data/` (Bao gồm các file đặc thù như `materials.json`, `recipes.json`, `customers.json`, `vouchers.json`), giúp tối ưu tốc độ và không cần cài SQL server. Hỗ trợ `multer` để upload ảnh. Backend đảm nhiệm tính toán trừ kho tự động, cộng/trừ điểm thưởng, và phân loại luồng in ấn (Tem dán ly / Phiếu chế biến).
- `frontend/`: Ứng dụng Single Page bằng ReactJS + Vite + Tailwind CSS. Giao diện tối ưu cho máy tính thu ngân và điện thoại. Được trang bị kiến trúc **Feature Flags** linh hoạt, cùng các tính năng mạnh mẽ: Quản lý Ca làm việc, Thanh toán mã QR động, Sơ đồ bàn, Báo cáo doanh thu, hệ thống **Quản lý Kho (Inventory)** kèm thiết lập định lượng cho món, và chương trình **Khách hàng thân thiết (Loyalty & Vouchers)**.

## Hướng dẫn khởi động & Môi trường
Dự án cung cấp công cụ tự động phân tách 2 môi trường để giữ an toàn dữ liệu thật.

### 1. Môi trường Thực tế (Production)
Chạy ứng dụng tối ưu hóa tĩnh và lưu trữ dữ liệu chính thức tại `backend/data/`. Sử dụng khi hoạt động bán hàng.
- **Windows**: Click đúp vào file `start.bat`.
- **Linux/Mac**: Cấp quyền và chạy `./start.sh` (`chmod +x start.sh && ./start.sh`).

### 2. Môi trường Thử nghiệm (Development)
Chạy ứng dụng ở chế độ hỗ trợ chỉnh sửa và lưu trữ dữ liệu tại `backend/data-dev/`. Bạn có thể thao tác test hóa đơn thoải mái.
- **Windows**: Click đúp vào file `start-dev.bat`.
- **Linux/Mac**: Cấp quyền và chạy `./start-dev.sh`.
- **Dọn dẹp rác Test (Reset)**: Khi muốn "tẩy trắng" dữ liệu test, chỉ cần chạy `reset-dev.bat` (Windows) hoặc `./reset-dev.sh` (Linux/Mac). Lần khởi động Dev tiếp theo sẽ tự động có lại tài khoản gốc.

Mặc định:
- Backend chạy tại: `http://localhost:3001`
- Frontend chạy tại: `http://localhost:3000` (Các thiết bị điện thoại/tablet kết nối chung Wi-Fi có thể truy cập qua địa chỉ IP LAN của máy chủ).

## Tài khoản mặc định
- **Admin**: `admin` / pass: `admin123`
- **Nhân viên**: `user1` -> `user5` / pass: `user123`

## Chỉnh sửa máy in
Nếu muốn kết nối máy in thật trên Windows, hãy mở file `backend/server.js`, tìm dòng `interface: 'printer:My_Printer'` và thay `My_Printer` bằng tên máy in hiển thị trong máy tính của bạn.
