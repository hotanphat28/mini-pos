# Changelog

Tất cả các thay đổi và cập nhật tính năng của dự án Mini POS sẽ được ghi chú tại đây. Dự án tuân theo tiêu chuẩn [Semantic Versioning](https://semver.org/).

## [1.7.0] - 2026-06-07

### Đã thêm (Added)
- **Tách biệt Triển khai (Deployment Separation)**: Kiến trúc hoàn toàn mới giúp tách biệt Repo code (DEV) và Môi trường chạy thật (PRD). Thêm script `deploy.bat` và `deploy.sh` để tự động build, đóng gói và cài đặt phần mềm sang thư mục khách hàng (VD: `C:\MiniPOS`) mà không làm ảnh hưởng đến dữ liệu cũ.
- **Tích hợp Port (PRD)**: Ở môi trường PRD, Backend (Node.js) tự động host tĩnh các file build của Frontend (React). Khách hàng chỉ cần khởi chạy 1 server duy nhất trên cổng 3001 cho cả UI lẫn API, tối ưu hóa tài nguyên và trải nghiệm.
- **Mã Hóa Bản Quyền (License Key)**: Hệ thống PRD không còn dùng file `.json` cấu hình thô. Công cụ cấu hình giờ sẽ sinh ra một tệp `license.key` được mã hóa Base64 để chống khách hàng sửa trộm và tự ý nâng cấp tính năng.
- **Hiển thị Địa chỉ IP Tự động**: Server giờ đây tự động quét mạng WiFi/LAN và in ra chính xác địa chỉ IP kết nối dành cho các thiết bị di động (điện thoại, iPad) ngay trên màn hình Console khi khởi động.

### Thay đổi (Changed)
- **Công cụ Cấu hình**: Giao diện dòng lệnh `config.bat` được nâng cấp để phục vụ 2 mục đích rõ ràng: (1) Cấu hình nội bộ cho môi trường DEV để test, và (2) Sinh mã Kích hoạt bản quyền (`license.key`) để gửi cho khách hàng PRD.
- **Làm sạch Repo**: Xóa bỏ hoàn toàn dấu vết dữ liệu thật (thư mục `backend/data/`) và các script khởi động PRD dư thừa (`start.bat`, `start.sh`) khỏi repo lưu trữ code. Codebase giờ đây là DEV 100% sạch sẽ.

## [1.6.0] - 2026-06-07

### Đã thêm (Added)
- **Công cụ Cấu hình (Configurator Tool)**: Thêm các script `config.bat` (Windows) và `config.sh` (Mac/Linux) chạy bằng môi trường console (Node.js readline) giúp cài đặt nhanh các Feature Flags mà không cần sửa file JSON thủ công.
- **Tùy chọn Bán theo Gói (Packages)**: Tích hợp sẵn 3 Gói (Basic, Pro, Premium) trong công cụ Cấu hình. Cho phép bật/tắt đồng loạt các tính năng phù hợp với từng Gói (ví dụ: gõ 'B' để chọn gói Basic) chỉ bằng một phím bấm.

## [1.5.0] - 2026-06-07

### Đã thêm (Added)
- **Môi trường Development & Production**: Tách bạch logic môi trường. Frontend ở PRD được build thành static files, frontend ở DEV hỗ trợ hot-reload.
- **Bảo vệ dữ liệu**: Database của backend tự động trỏ đến `data-dev` ở chế độ DEV và `data` ở chế độ PRD.
- **Hỗ trợ đa nền tảng**: Cung cấp đầy đủ các file `.bat` (Windows) và `.sh` (Mac/Linux) gồm: `start`/`start-dev` và công cụ dọn dẹp dữ liệu test `reset-dev`.


## [1.4.0] - 2026-06-07

### Đã thêm (Added)
- **Khách hàng thân thiết (Loyalty)**: Quản lý danh sách khách hàng theo số điện thoại, tự động cộng điểm sau mỗi lần mua hàng (tỷ lệ 10.000 VNĐ = 1 điểm).
- **Sử dụng Điểm thưởng**: Khách hàng có thể quy đổi điểm để giảm thẳng vào tiền mặt (tỷ lệ 1 điểm = 1.000 VNĐ).
- **Mã Khuyến mãi (Vouchers)**: Quản lý các mã giảm giá linh hoạt (theo % hoặc số tiền mặt cố định), có quy định mức đơn hàng tối thiểu để áp dụng.
- **Tích hợp POS**: Màn hình thu ngân được nâng cấp, cho phép nhập nhanh Số điện thoại khách hàng và Mã Voucher, tự động tính toán số tiền giảm giá một cách minh bạch.

## [1.3.0] - 2026-06-07

### Đã thêm (Added)
- **Quản lý Kho (Inventory Management)**: Thêm chức năng theo dõi và quản lý số lượng nguyên vật liệu đầu vào (VD: cafe hạt, sữa, đường).
- **Thiết lập Định lượng (Recipes)**: Cho phép thiết lập công thức tiêu hao nguyên liệu cho từng sản phẩm.
- **Tự động trừ kho**: Hệ thống tự động khấu trừ nguyên vật liệu dựa theo định lượng mỗi khi một đơn hàng được thanh toán thành công trên POS.
- **In ấn chuyên biệt (Tách Bếp/Pha chế)**: Tách luồng in ấn riêng biệt: "Tem dán ly" cho các sản phẩm Thức uống (Takeaway), và "Phiếu chế biến" cho Thức ăn (Dine-in).

## [1.2.0] - 2026-06-07

### Đã thêm (Added)
- **Cơ chế Feature Flags**: Đặt nền móng kỹ thuật cho việc bật/tắt tính năng theo gói (Packages), hỗ trợ mở rộng phần mềm theo mô hình SaaS.
- **Quản lý Ca làm việc (Shift Management)**: Bắt buộc nhân viên (User) nhập tiền lẻ đầu ca và đếm tiền chốt ca. Hệ thống tự động tính toán tổng doanh thu trong ca. Tài khoản Admin được bỏ qua (bypass) yêu cầu này để tiện quản lý.
- **Phương thức thanh toán**: Tách bạch thanh toán "Tiền mặt" và "Chuyển khoản". Hỗ trợ tự động hiển thị mã QR tĩnh khi khách chọn chuyển khoản.
- **Sơ đồ Bàn (Table Management) (Bản thu gọn)**: Cho phép thu ngân chọn và gắn đơn hàng vào một bàn cụ thể trước khi thanh toán.

### Thay đổi (Changed)
- **Kiến trúc Database**: Chia tách file `pos_db.json` thành nhiều file nhỏ lẻ (như `users.json`, `products.json`, `orders.json`, `shifts.json`, `features.json`) nằm trong thư mục `backend/data/`. Đảm bảo an toàn dữ liệu, chống phình to file mà vẫn giữ nguyên tiêu chí "cài đặt 1 lần không cần server SQL".

## [1.1.0] - 2026-06-02

### Đã thêm (Added)
- Báo cáo doanh thu chi tiết (Detailed Reports): Hiển thị từng đơn hàng, kèm thông tin nhân viên (người bán), ngày giờ, và chi tiết các món (khi hover).
- Quản lý hình ảnh: Thêm tính năng upload hình ảnh cho sản phẩm. Backend lưu ảnh vào thư mục `backend/uploads/` thông qua `multer`.
- Tùy chọn món ăn (Food Options): Hỗ trợ thêm các tùy chọn (kèm giá) riêng biệt cho danh mục thức ăn, cho phép nhân viên tích chọn khi thêm vào giỏ hàng.

### Thay đổi (Changed)
- Cấu trúc danh mục được cố định thành 2 nhóm chính: "Thức uống" và "Thức ăn".
- Nâng cấp Quản lý thực đơn: Thêm Form cập nhật sản phẩm (Edit), bao gồm các trường hình ảnh, tùy chọn, và trạng thái (Active/Inactive).
- Giao diện Admin Dashboard & POS: Cải tiến UX/UI, tự động ẩn các món ăn có trạng thái Inactive trên màn hình POS.

## [1.0.0] - 2026-06-02

### Đã thêm (Added)
- Khởi tạo dự án Mini POS (Monorepo gồm backend và frontend).
- **Backend**: API bằng Node.js & Express.
- **Frontend**: Giao diện React, Vite, Tailwind CSS hiện đại, responsive.
- Chức năng Xác thực: Đăng nhập có phân quyền Admin / User.
- **Giao diện bán hàng (POS)**: Hệ thống lưới sản phẩm theo danh mục, tính tổng tiền, lựa chọn in bill khổ K58 hoặc K80.
- Tích hợp in bill nhiệt qua module `node-thermal-printer`.
- **Admin Dashboard**: Cung cấp giao diện quản lý doanh thu theo ngày và CRUD (Thêm/Xóa) cho Danh mục và Món ăn.
- File cấu trúc Data tĩnh `pos_db.json` loại bỏ hoàn toàn các lỗi build C++ của native dependency, đảm bảo 100% chạy mượt trên mọi máy tính cục bộ.
- Kịch bản khởi động dự án nhanh: `start.bat` (Windows) và `start.sh` (Linux/Mac).
