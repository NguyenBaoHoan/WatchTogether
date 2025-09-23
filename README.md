# 🎬 WatchTogether (WIP)

**WatchTogether** là một ứng dụng giúp mọi người có thể **xem phim cùng nhau theo thời gian thực**, với tính năng đồng bộ phát video, quản lý phòng, và trò chuyện trực tiếp.  
Dự án hiện đang trong quá trình phát triển.

---

## 🚀 Tech Stack

### Backend
- **Java 21** + **Spring Boot 3**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** + **PostgreSQL**
- **Redis** (lưu trữ phòng tạm thời, TTL)
- **WebSocket** (đang chuẩn bị, cho đồng bộ phát video & chat)
- **JWT (jjwt)**

### Frontend
- **React 19** + **Vite 7**
- **Tailwind CSS 4** (plugin cho Vite)

---

## ✨ Tính năng hiện có
- 🏠 **Tạo phòng xem chung** (`POST /rooms`) → trả về:
  - `roomId`, `inviteCode`, `accessToken`, `joinUrl`, `wsUrl`
- 🗃️ **Lưu phòng tạm thời** trên **Redis** (TTL 24h)
- 👤 **Lưu Host (participant)** vào **PostgreSQL**
- 🔑 **JWT** để xác thực các hành động sau
- 🔍 Endpoint kiểm tra:
  - `GET /hello` → test API
  - `GET /db-check` → test kết nối DB

---

## 🛠️ Tính năng dự kiến
- 🔗 Tham gia phòng bằng `inviteCode`
- 🎥 Đồng bộ trạng thái phát video (play/pause/seek) qua **WebSocket**
- 👥 Quản lý danh sách **participants**, phân quyền host/guest
- 💬 Chat ngắn gọn trong phòng
- 🎨 UI/UX hoàn chỉnh cho tạo phòng & trải nghiệm xem chung

---

## 📂 Cấu trúc thư mục chính

