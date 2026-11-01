# UTH-TrustID: Decentralized Identity (W3C DID) & Passwordless Authentication Wallet

Hệ thống Ví định danh số phi tập trung (**W3C Decentralized Identity**) và xác thực không mật khẩu (**Passwordless Authentication**) tích hợp công nghệ Blockchain (**Polygon Amoy**), Sinh trắc học phần cứng (**WebAuthn**), Cây Merkle (**Merkle Tree Batch VC**) và Hệ thống Giám sát An ninh Dị thường (**IDS**), phục vụ đề tài Nghiên cứu Khoa học (NCKH) - Trường Đại học Giao thông Vận tải TP.HCM (UTH).

---

## 🌟 Tính Năng Nổi Bật

### 1. Chuẩn Hóa Logic An Toàn Thông Tin & Giao Thức (Security & Protocol Logic)
- **Domain & Origin Binding**: Chuẩn hóa cấu trúc ký số EIP-191 mang tính chống chối bỏ:
  $$\text{Payload} = \text{"uth.edu.vn wants you to sign in with non-repudiation: Nonce="} + nonce + \text{" at "} + timestamp$$
  Chống triệt để tấn công Phishing và Relay Attack giữa các máy chủ giả mạo.
- **Strict Nonce TTL (60s) & Single-Use Destruction**: Nonce có thời gian sống ngắn (60 giây) và **bị hủy ngay lập tức** khỏi bộ nhớ đệm tại request xác thực đầu tiên (bất kể thành công hay thất bại), triệt tiêu tuyệt đối nguy cơ tấn công phát lại (Replay Attack).
- **Cryptographic Proof of Association**: Ràng buộc mật mã chặt chẽ giữa Khóa Ví và Thẻ Sinh Viên Số $(MSSV, studentAddress, issueDate, expiryDate)$ thông qua chữ ký số ECDSA từ University Root Issuer.

### 2. Phân Hệ Sinh Viên (Student Wallet PWA - `/wallet`)
- **Xuất trình có chọn lọc (Selective Disclosure / Privacy Mode)**: Cho phép sinh viên bật chế độ riêng tư ẩn MSSV và thông tin cá nhân (`••••••••`), chỉ xuất trình bằng chứng mật mã xác nhận sinh viên UTH hợp lệ (Zero-Knowledge/Selective Disclosure cho Thư viện, Nhà xe).
- **Cơ chế Thu hồi Nội bộ Chủ động (Self-Revocation via Emergency Token)**: Cấp mã khẩn cấp bí mật (`EMERGENCY_UTH_...`) khi tạo ví. Khi bị mất thiết bị, sinh viên có thể dùng mã này để tự khóa/thu hồi danh tính từ xa trên bất kỳ trình duyệt nào.
- **Mã hóa Cục bộ AES-GCM-256 & WebAuthn**: Khóa riêng (Private Key) và cụm 12 từ khôi phục (BIP-39 Mnemonic) được mã hóa bằng AES-GCM kết hợp PBKDF2 (100.000 vòng lặp) và bảo vệ bằng TouchID/FaceID.
- **Tẩy bộ nhớ đệm RAM (Memory Sanitization)**: Tự động ghi đè (`0x00...`) và hủy biến khóa riêng ngay sau khi hoàn tất ký số EIP-191.

### 3. Phân Hệ Giảng Viên (Faculty & Verifier Portal - `/faculty`)
- **Giao Diện Thẩm Mỹ Cao Cấp (Kalo Dark & Neon Lime Aesthetic)**: Thiết kế chuẩn Mobile-first theo ngôn ngữ Dark OLED hiện đại kết hợp điểm nhấn màu Lime neon (`#d4f938`) và ngọn lửa hổ phách (`#f59e0b`).
  - **Activity Bar Chart**: Biểu đồ cột 7 ngày trong tuần trực quan theo dõi lượng điểm danh/xác thực với ngày cao điểm nổi bật.
  - **Geo-fencing Accuracy Trend**: Biểu đồ đường cong uốn lượn sắc nét biểu diễn khoảng cách và độ chính xác định vị.
  - **Streak & Daily Goal Cards**: Thẻ theo dõi chuỗi điểm danh kèm vòng lửa `🔥` và thanh tiến độ mục tiêu ngày.
  - **Insights Analytics**: Thẻ phân tích nhanh gồm cơ cấu mạng kết nối (Donut chart), trung bình lượt xác thực và ngày hoạt động hiệu quả nhất (`⭐`).
- **Dynamic Rotating QR Code (Xoay mã 15s)**: Cơ chế xoay mã QR tự động sau mỗi 15 giây kèm thanh đếm lùi trực quan, chống việc sinh viên chụp ảnh mã gửi ra ngoài phòng thi / lớp học.
- **Geo-fencing & Campus Wi-Fi Subnet Check**: Tùy chọn kiểm tra tọa độ GPS sinh viên qua công thức Haversine hoặc ràng buộc mạng Wi-Fi nội bộ trường.
- **Bảng điểm danh & khảo thí thời gian thực**: Thống kê danh sách sinh viên đã đối soát on-chain kèm khoảng cách GPS và trạng thái mạng kết nối.

### 4. Phân Hệ Quản Trị Viên (Admin & Issuer Portal - `/admin`)
- **Cấp phát VC hàng loạt qua Merkle Tree (Batch VC Issuance)**: Nhập danh sách sinh viên theo lô (JSON Batch), hệ thống tự động tính toán **Merkle Tree Root** (`keccak256`) và ký số lô tập trung bằng ví Root Issuer của trường, giúp tiết kiệm chi phí và tăng tốc độ cấp phát chứng chỉ số quy mô lớn.
- **Hệ thống Giám sát An ninh & Cảnh báo Dị thường (IDS Alerts)**:
  - **Brute-force Challenge**: Phát hiện và chặn các nguồn thử sai chữ ký liên tiếp $\ge 3$ lần.
  - **Impossible Travel**: Phát hiện hành vi quét QR từ 2 vị trí địa lý cách nhau quá xa trong khoảng thời gian ngắn (ví dụ: > 100km trong < 15 phút).
- **Registry Quản lý & Audit Logs**: Quản lý tập trung trạng thái hoạt động/thu hồi on-chain và tra cứu lịch sử kiểm toán an toàn thông tin.

### 5. Cổng Dịch Vụ Web Không Mật Khẩu (Login Portal - `/portal`)
- Tích hợp **WebSocket (Socket.io)** hai chiều tự động chuyển hướng sang Dashboard cá nhân ngay khi điện thoại quét và ký số thành công.
- Tích hợp bộ đếm Nonce TTL 60s và nút **Báo mất ví khẩn cấp từ xa**.

---

## 🛡️ Thực Nghiệm Kiểm Thử An Toàn Thông Tin (Security Evaluation)

Bộ kịch bản kiểm thử tấn công tự động (`backend/test-attacks.js`) mô phỏng 3 vectơ tấn công phổ biến vào hệ thống xác thực phi tập trung:

| Mã Ca | Vectơ Tấn Công | Mô Tả Kịch Bản | Phản Hồi Kỳ Vọng | Kết Quả Thực Nghiệm | Đánh Giá NCKH |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **TC-01** | **Replay Attack** (Tấn công phát lại) | Kẻ tấn công thu thập gói tin chữ ký hợp lệ trước đó và gửi lại máy chủ | `HTTP 401 Unauthorized` | `HTTP 401` | **ĐẠT (PASS 100%)** |
| **TC-02** | **Signature Tampering** (Giả mạo chữ ký / MitM) | Kẻ tấn công sửa đổi payload hoặc dùng khóa riêng mạo danh sinh viên | `HTTP 404 Not Found` | `HTTP 404` | **ĐẠT (PASS 100%)** |
| **TC-03** | **Revocation Abuse** (Lạm dụng danh tính thu hồi) | Cố tình đăng nhập bằng danh tính đã bị báo mất / thu hồi trên hệ thống | `HTTP 403 Forbidden` | `HTTP 403` | **ĐẠT (PASS 100%)** |

> **Tổng kết:** 3/3 ca thử nghiệm đều đạt chuẩn an toàn tuyệt đối (100% phòng thủ thành công).

---

## 🏗️ Cấu Trúc Dự Án

```text
UTH-TrustID/
├── backend/                      # Máy chủ Node.js / Express & Socket.io
│   ├── server.js                 # API Challenge, Verify, Merkle Batch, IDS Alerts, Self-Revoke
│   ├── test-attacks.js           # Kịch bản kiểm thử tấn công tự động TC-01, TC-02, TC-03
│   └── package.json
├── public/                       # Manifest PWA, Service Worker, Icons
├── src/
│   ├── components/
│   │   ├── AdminGateway.jsx      # Quản trị Registry, Merkle Batch Issuer & IDS Alerts
│   │   ├── LoginPortal.jsx       # Cổng xác thực Web Socket.io & TTL 60s
│   │   ├── ProtectedRoute.jsx    # Lớp bảo vệ tuyến đường (Route Guard) phân quyền
│   │   ├── Scanner.jsx           # Máy quét QR WebKit / iOS Safari / Android
│   │   ├── StudentWallet.jsx     # Ví DID Mobile PWA: WebAuthn, Selective Disclosure, Self-Revoke
│   │   └── WebPortal.jsx         # Wrapper Cổng dịch vụ
│   ├── pages/
│   │   ├── AdminDashboard.jsx    # Dashboard Quản trị viên & Issuer
│   │   └── FacultyPortal.jsx     # Cổng Giảng viên: Rotating QR 15s, Geo-fencing & Subnet
│   ├── contracts/
│   │   └── DIDRegistry.sol       # Smart Contract Registry trên Polygon Amoy Testnet
│   ├── services/
│   │   └── did.js                # Core Mật mã: AES-GCM, PBKDF2, WebAuthn, W3C DID, Polygon RPC
│   ├── App.jsx                   # Định tuyến Router: /wallet, /faculty, /admin, /portal
│   ├── index.css                 # Giao diện Tailwind CSS v4 & Vùng an toàn iOS/Android
│   └── main.jsx
├── index.html                    # PWA Standalone configuration
├── vite.config.js                # Vite PWA, SSL Proxy, API Rewrite
└── package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi chạy Backend Service
```bash
cd backend
npm install
npm start
# Máy chủ Auth & Socket.io lắng nghe tại http://localhost:4000
```

### 2. Chạy Kiểm Thử Tấn Công Thực Nghiệm
```bash
cd backend
node test-attacks.js
```

### 3. Khởi chạy Ứng Dụng Frontend (PWA)
```bash
npm install
npm run dev -- --host
# Truy cập https://localhost:5173
```

### 4. Đóng gói Bản Phát Hành (Production Build)
```bash
npm run build
```

---

## 🧭 Điều Hướng Các Phân Hệ
* **Cổng Giảng Viên (Mặc định: Điểm danh / Thi cử & Geo-Fencing)**: `/faculty` (hoặc `/`)
* **Ví Sinh Viên (Mobile PWA)**: `/wallet`
* **Cổng Dịch Vụ Web (Đăng nhập không mật khẩu)**: `/portal`
* **Cổng Quản Trị Viên (Admin & Issuer)**: `/admin`

---

## 📜 Bản Quyền & Trích Dẫn
Dự án được nghiên cứu và phát triển phục vụ đề tài Nghiên cứu Khoa học (NCKH) sinh viên - **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**.  
Giấy phép phát hành: **MIT License**.
