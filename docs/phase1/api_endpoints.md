# API Endpoints Release - Phase 1

Tài liệu này tổng hợp danh sách các API Endpoints đã được triển khai và sẵn sàng sử dụng trong Phase 1 của dự án.

## 🔐 Authentication & Identity
Cấu trúc cơ sở: `api/auth`

| Method | Path | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/login` | Đăng nhập bằng Email/Password | No |
| POST | `/google-login` | Đăng nhập bằng Google (IdToken hoặc AccessToken) | No |
| POST | `/register` | Đăng ký tài khoản mới | No |
| POST | `/verify-email` | Xác thực email bằng mã OTP | No |
| POST | `/resend-verification` | Gửi lại mã OTP xác thực email | No |
| POST | `/refresh` | Làm mới Access Token bằng Refresh Token | No |
| POST | `/forgot-password` | Gửi link reset mật khẩu qua email | No |
| POST | `/verify-reset-token` | Kiểm tra tính hợp lệ của token reset mật khẩu | No |
| POST | `/reset-password` | Thiết lập mật khẩu mới sau khi reset | No |
| PATCH | `/change-password` | Thay đổi mật khẩu (khi đã đăng nhập) | Yes |
| POST | `/logout` | Đăng xuất và hủy Refresh Token | Yes |
| DELETE | `/delete-account` | Xóa tài khoản người dùng | Yes |

## 👤 Profile Management
Cấu trúc cơ sở: `api/v1/profile` & `api/users`

| Method | Path | Description | Base Path | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/setup` | Thiết lập thông tin profile lần đầu | `api/v1/profile` | Yes |
| GET | `/me` | Lấy thông tin profile người dùng hiện tại | `api/users` | Yes |
| PATCH | `/me/profile` | Cập nhật thông tin profile tổng thể | `api/users` | Yes |
| PATCH | `/me/bio` | Cập nhật tiểu sử (Bio) | `api/users` | Yes |
| PATCH | `/me/location` | Cập nhật vị trí hiện tại | `api/users` | Yes |
| PATCH | `/me/preferences` | Cập nhật bộ lọc tìm kiếm (Tuổi, Khoảng cách) | `api/users` | Yes |

## 🖼️ Photo Management
Cấu trúc cơ sở: `api/users/photos`

| Method | Path | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Tải lên ảnh mới (Tối đa 6 ảnh) | Yes |
| DELETE | `/{photoId}` | Xóa ảnh đã tải lên | Yes |
| PATCH | `/reorder` | Thay đổi thứ tự hiển thị của ảnh | Yes |

---
**Ghi chú:** 
- Tất cả các yêu cầu cần **Authorization: Bearer <token>** ngoại trừ các tính năng đăng ký/đăng nhập và quên mật khẩu.
- Các API trả về theo định dạng chuẩn `ApiResponse<T>`.
