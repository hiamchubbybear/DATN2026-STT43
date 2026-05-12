# Hệ Thống Ghép Đôi Người Dùng & Phát Hiện Tài Khoản Lừa Đảo

## Trạng thái build & server
- Backend API build: passing / pipeline đang chạy ổn định.
- Trạng thái server: ![Server Status](https://img.shields.io/endpoint?url=https://datn.chessy.dev/health&logo=statuspage&logoColor=white&cacheSeconds=60)

## API & Trạng thái Server
- **Base URL**: `https://datn.chessy.dev`
- **Kiểm tra Health**: [https://datn.chessy.dev/health](https://datn.chessy.dev/health)
- **Tài liệu API**: Chi tiết kế hoạch endpoint có tại [API_PLAN.md](API_PLAN.md)

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Thành viên & vai trò](#thành-viên--vai-trò)
- [Công nghệ](#công-nghệ)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Quy tắc repository](#quy-tắc-repository)
  - [Branch strategy](#branch-strategy)
  - [Quy ước commit](#quy-ước-commit)
  - [Pull Request](#pull-request)
  - [Milestone](#milestone)
  - [Issue](#issue)
  - [Bảo vệ branch](#bảo-vệ-branch)
  - [Release](#release)
  - [Workflow mẫu](#workflow-mẫu)
- [Folder structure](#folder-structure)

## Giới thiệu
Xây dựng hệ thống ghép đôi người dùng tích hợp mô hình học máy để phát hiện tài khoản lừa đảo. Người dùng được đánh giá liên tục từ giao tiếp WebRTC, hành vi chat/kéo. ML model hỗ trợ bằng XGBoost + Sentence Transformers. Backend/API dùng ASP.NET Core 8, realtime layer WebSocket, call system WebRTC + STUN/TURN.

## Thành viên & vai trò
| MSSV | Họ và tên | Email | Vai trò |
| --- | --- | --- | --- |
| 28209051610 | [Chu Phương Anh](https://github.com/Chuuuu21) | chuphuonganh21082004@gmail.com | Frontend |
| 28211153072 | [Phan Công Danh](https://github.com/CongDanh06) | cdanh1324@gmail.com | Backend |
| 28211152835 | [Trần Huy](https://github.com/huynartLZ) | tranhuy142004@gmail.com | Backend |
| 28211152784 | [Phùng Định Quang Huy](https://github.com/HawkPoseidon) | huyphung00@gmail.com | Machine Learning |
| 28211152835 | [Trần Văn Huy](https://github.com/hiamchubbybear) | tranvanhuy160304@gmail.com | System / DevOps |

## Công nghệ
- Frontend: ReactJS, React Native, TypeScript, TailwindCSS, WebSocket.
- Backend: ASP.NET Core 8 (JWT, FluentValidation), WebSocket Server.
- Database: MongoDB.
- Cache: Redis.
- AI/ML: Python + FastAPI, XGBoost, Sentence Transformers.
- Call System: WebRTC + STUN + Coturn (TURN).
- DevOps: Docker + Nginx, Vercel cho frontend, VPS cho backend + call server.

## Kiến trúc hệ thống
Client (Web/Mobile) → Frontend (React/React Native) → Backend API (ASP.NET Core)  
└→ MongoDB · Redis · AI service (FastAPI + XGBoost + Sentence Transformers)  
Realtime layer: WebSocket gateways (API + call)  
Call system: WebRTC + STUN/TURN + Coturn.

## Quy tắc repository

### Branch strategy
- GitFlow: `main` (production, không commit trực tiếp), `develop`, `feature/*`, `release/*`, `hotfix/*`.
- Ví dụ branch: `feature/authentication`, `release/v0.1.0`, `hotfix/login-bug`.

### Quy ước commit
- Conventional Commit: `<type>(<scope>): <message>`.
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Ví dụ: `feat(auth): implement user login API`.

### Pull Request
- Từ feature branch merge vào `develop`, tiêu đề rõ ràng, checklist: build, review, conflict.
- Template: Description / Related Issue / Changes / Checklist.

### Milestone
- v0.1.0: Authentication + profile
- v0.2.0: Swipe system
- v0.3.0: Recommendation engine
- v0.4.0: Scam detection ML
- v1.0.0: Production release

### Issue
- Mỗi feature cần issue trước khi code, kèm milestone/assignee.

### Bảo vệ branch
- `main`: PR + code review + CI pass.  
- `develop`: CI pass.

### Release
- Khi milestone xong: `develop → release/vX.X.X` → test → `release → main` → tag `vX.X.X`.

### Workflow mẫu
1. Tạo issue `#45 Build swipe API` (Milestone v0.2.0).  
2. Checkout: `git checkout develop` → `git checkout -b feature/swipe-api`.  
3. Commit: `feat(swipe): implement swipe API`.  
4. Push: `git push origin feature/swipe-api`.  
5. Tạo PR từ feature vào develop.

## Chức năng chính

### Đối với Người dùng
- **Xác thực đa phương thức**: Đăng ký/đăng nhập truyền thống, OAuth (Google), Reset mật khẩu và Xác thực Email.
- **Hồ sơ & Ảnh**: Quản lý thông tin cá nhân, sở thích, vị trí và bộ sưu tập ảnh.
- **Xác minh tài khoản**: Xác thực danh tính qua khuôn mặt (FaceID), số điện thoại và ID để tăng độ tin cậy.
- **Ghép đôi & Gợi ý**: Hệ thống Discovery gợi ý người dùng dựa trên sở thích và vị trí.
- **Swipe & Match**: Cơ chế quẹt trái/phải cổ điển với thông báo Match tức thì.
- **Chat & Real-time**: Nhắn tin văn bản thời gian thực, quản lý hội thoại.
- **Cuộc gọi Audio/Video**: Tích hợp gọi điện bảo mật qua giao thức WebRTC (STUN/TURN).
- **An toàn & Bảo mật**: Chế độ Safe-mode, chia sẻ vị trí khẩn cấp và Check-in khi đi hẹn hò.

### Đối với Quản trị viên (Admin)
- **Hệ thống Đánh giá (Flag)**: Tự động gắn cờ các nội dung/hành vi vi phạm (tin nhắn, ảnh, profile).
- **Chỉ số tin cậy (Trust Score)**: ML model tự động tính toán điểm uy tín để phát hiện lừa đảo.
- **Quản trị người dùng**: Ban/Unban, Shadow-ban, đình chỉ tài khoản và bắt buộc đăng xuất.
- **Báo cáo & Phân tích**: Dashboard theo dõi người dùng (DAU), số lượng match, báo cáo lừa đảo và phân tích hành vi.
- **Quản lý hệ thống**: Công cụ reindex dữ liệu, dọn dẹp cache và cập nhật mô hình ML.

## Danh sách API Endpoints

### Phase 1: Nền tảng (Auth & Profile)
- `POST /api/auth/*`: Đăng ký, Đăng nhập, OAuth và Quản lý phiên làm việc.
- `GET/PATCH /api/users/me/*`: Quản lý hồ sơ, ảnh và tùy chọn cá nhân.
- `POST /api/verification/*`: Xác thực Face, Phone và CMND.

### Phase 2: Dating Core (Swipe & Chat)
- `GET /api/discovery/*`: Danh sách gợi ý và xem chi tiết profile.
- `POST /api/swipes/*`: Thực hiện quẹt Like/Pass và Undo.
- `GET/POST /api/chat/*`: Quản lý hội thoại và tin nhắn real-time.
- `POST /api/calls/*`: Khởi tạo và xử lý cuộc gọi (WebRTC).

### Phase 3: An toàn & Quản trị
- `POST /api/flags/*`: Gắn cờ vi phạm nội dung và người dùng.
- `GET /api/trust/*`: Xem điểm uy tín và phân loại người dùng của ML.
- `GET/POST /api/admin/*`: Các API đặc quyền Dashboard, Ban người dùng và Phân tích số liệu.
- `GET /api/system/health`: Kiểm tra trạng thái hệ thống (Health Check).

## 🚀 Sắp ra mắt (Coming Soon)
- **Admin Dashboard**: Giao diện quản trị toàn diện cho người điều hành hệ thống.
- **Server Health Check**: Hệ thống giám sát và biểu đồ hóa sức khỏe server thời gian thực.
- **Mobile App**: Phiên bản ứng dụng di động cho iOS và Android.

## Folder structure
```
repo
├── .github
├── k8s
├── backend
│   ├── web
│   ├── infrash
│   ├── domain
│   └── application
├── frontend
│   ├── mobile
│   └── web
├── ai
├── docs
└── README.md
```
