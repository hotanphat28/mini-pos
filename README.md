# Mini POS

Hệ thống quản lý bán hàng (Point of Sale) nhỏ gọn dành cho quán cà phê, trà sữa, hoạt động trên mạng nội bộ (LAN).
Được thiết kế theo tiêu chí "Cài 1 lần, dùng mãi mãi", không yêu cầu phí duy trì server, tự động kết nối qua mạng nội bộ và hỗ trợ in hóa đơn nhiệt (K58/K80).

## Cấu trúc dự án
- `backend/`: Máy chủ Node.js với Express, cung cấp các API để quản lý dữ liệu. Sử dụng Database dạng JSON cục bộ (`pos_db.json`) để dễ cài đặt trên mọi hệ điều hành. Tích hợp thư viện điều khiển máy in nhiệt.
- `frontend/`: Ứng dụng Single Page bằng ReactJS + Vite + Tailwind CSS. Giao diện được tối ưu hiển thị tốt cho máy tính thu ngân và cả điện thoại nhân viên order.

## Hướng dẫn cài đặt & chạy ứng dụng
1. **Chạy trên Windows**: Click đúp vào file `start.bat`. Script sẽ tự động cài các gói NPM cần thiết và bật cả Backend lẫn Frontend.
2. **Chạy trên Linux/Mac**: Mở terminal, cấp quyền thực thi và chạy file `start.sh` (`chmod +x start.sh && ./start.sh`).

Mặc định:
- Backend chạy tại: `http://localhost:3001`
- Frontend chạy tại: `http://localhost:3000` (Các thiết bị điện thoại/tablet kết nối chung Wi-Fi có thể truy cập qua địa chỉ IP LAN của máy chủ).

## Tài khoản mặc định
- **Admin**: `admin` / pass: `admin123`
- **Nhân viên**: `user1` -> `user5` / pass: `user123`

## Chỉnh sửa máy in
Nếu muốn kết nối máy in thật trên Windows, hãy mở file `backend/server.js`, tìm dòng `interface: 'printer:My_Printer'` và thay `My_Printer` bằng tên máy in hiển thị trong máy tính của bạn.
