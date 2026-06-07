# Mini POS

Hệ thống quản lý bán hàng (Point of Sale) nhỏ gọn dành cho quán cà phê, trà sữa, hoạt động trên mạng nội bộ (LAN).
Được thiết kế theo tiêu chí "Cài 1 lần, dùng mãi mãi", không yêu cầu phí duy trì server, tự động kết nối qua mạng nội bộ và hỗ trợ in hóa đơn nhiệt (K58/K80).

## Cấu trúc dự án
- `backend/`: Máy chủ Node.js với Express, cung cấp API xử lý dữ liệu. Hệ thống Database dùng JSON được tách nhỏ thành từng file lưu trong thư mục `backend/data/` (Bao gồm các file đặc thù như `materials.json`, `recipes.json`, `customers.json`, `vouchers.json`), giúp tối ưu tốc độ và không cần cài SQL server. Hỗ trợ `multer` để upload ảnh. Backend đảm nhiệm tính toán trừ kho tự động, cộng/trừ điểm thưởng, và phân loại luồng in ấn (Tem dán ly / Phiếu chế biến).
- `frontend/`: Ứng dụng Single Page bằng ReactJS + Vite + Tailwind CSS. Giao diện tối ưu cho máy tính thu ngân và điện thoại. Được trang bị kiến trúc **Feature Flags** linh hoạt, cùng các tính năng mạnh mẽ: Quản lý Ca làm việc, Thanh toán mã QR động, Sơ đồ bàn, Báo cáo doanh thu, hệ thống **Quản lý Kho (Inventory)** kèm thiết lập định lượng cho món, và chương trình **Khách hàng thân thiết (Loyalty & Vouchers)**.

## Hướng dẫn khởi động & Môi trường
Dự án được quy hoạch theo chuẩn: Repo chứa code đóng vai trò là "Nhà máy (DEV)", dùng để test và xuất xưởng phần mềm ra môi trường chạy thật của khách hàng (PRD).

### 1. Môi trường Thử nghiệm (Development)
Chạy ứng dụng ở chế độ hỗ trợ chỉnh sửa code và test tính năng. Dữ liệu rác sinh ra được lưu tại `backend/data-dev/`.
- **Windows**: Click đúp vào file `start-dev.bat`.
- **Linux/Mac**: Cấp quyền và chạy `./start-dev.sh`.
- **Dọn dẹp rác Test (Reset)**: Khi muốn "tẩy trắng" dữ liệu test, chỉ cần chạy `reset-dev.bat` (Windows) hoặc `./reset-dev.sh` (Linux/Mac).

### 2. Công cụ Cấu hình Gói (Configurator Tool)
Hệ thống cho phép cấu hình tính năng (Feature Flags) thông qua giao diện dòng lệnh.
- **Windows**: Click đúp vào file `config.bat`.
- **Linux/Mac**: Cấp quyền và chạy `./config.sh`.
- Tool hỗ trợ chọn nhanh 3 Gói: **BASIC** (Cơ bản), **PRO** (Chuyên nghiệp), **PREMIUM** (Toàn diện). Cấu hình này sẽ được áp dụng khi bạn chạy lệnh Deploy.

### 3. Đóng gói & Triển khai Thực tế (Production Deployment)
Dùng script này để Build và Đóng gói phần mềm sang một thư mục độc lập trên máy khách hàng. Dữ liệu mua bán của khách hàng hoàn toàn tách biệt khỏi repo code.
- **Windows**: Click đúp vào file `deploy.bat` (Mặc định cài đặt vào `C:\MiniPOS`).
- **Linux/Mac**: Chạy `./deploy.sh` (Mặc định cài đặt vào `~/mini-pos-prd`).
- Tại thư mục đích (VD: `C:\MiniPOS`), khách hàng chỉ cần click chạy file `start.bat`. Hệ thống sẽ tối ưu khởi chạy **1 Server duy nhất** (cổng 3001) phục vụ cả giao diện UI và API!

Mặc định ở PRD:
- Máy tính thu ngân: Truy cập `http://localhost:3001`.
- Thiết bị điện thoại/tablet: Nhập địa chỉ mạng (Ví dụ: `http://192.168.1.X:3001`). Hệ thống sẽ **tự động quét và hiển thị** chính xác địa chỉ IP này trên màn hình đen mỗi khi bạn chạy file `start.bat`.

## Tài khoản mặc định
- **Admin**: `admin` / pass: `admin123`
- **Nhân viên**: `user1` -> `user5` / pass: `user123`

## Chỉnh sửa máy in
Nếu muốn kết nối máy in thật trên Windows, hãy mở file `backend/server.js`, tìm dòng `interface: 'printer:My_Printer'` và thay `My_Printer` bằng tên máy in hiển thị trong máy tính của bạn.
