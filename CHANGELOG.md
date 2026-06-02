# Changelog

Tất cả các thay đổi và cập nhật tính năng của dự án Mini POS sẽ được ghi chú tại đây. Dự án tuân theo tiêu chuẩn [Semantic Versioning](https://semver.org/).

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
