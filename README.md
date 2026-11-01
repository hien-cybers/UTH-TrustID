# UTH-TrustID: Decentralized Identity (W3C DID) & Passwordless Authentication Wallet

Hệ thống Ví định danh số phi tập trung (**W3C Decentralized Identity**) và xác thực không mật khẩu (**Passwordless Authentication**) tích hợp công nghệ Blockchain và Sinh trắc học phần cứng (**WebAuthn**), phục vụ đề tài Nghiên cứu Khoa học (NCKH) - Trường Đại học Giao thông Vận tải TP.HCM (UTH).

---

## 🌟 Tính Năng Nổi Bật

1. **Chuẩn hóa Định danh W3C DID & Verifiable Credentials (VC)**
   - Khởi tạo và quản lý mã định danh W3C: `did:ethr:polygon:<Address>`.
   - Xuất tài liệu **W3C DID Document** theo đặc tả chuẩn quốc tế dạng **JSON-LD** (`GET /api/did/:address`).
   - Lưu trữ và hiển thị Thẻ Sinh Viên Số UTH chuẩn W3C Verifiable Credentials.

2. **Cơ chế Bảo mật & Quản lý Khóa Đa Tầng (Key Management)**
   - **Mã hóa AES-GCM-256**: Private Key và Mnemonic không bao giờ lưu dưới dạng plain-text; được mã hóa cục bộ thông qua Web Crypto API kết hợp dẫn xuất khóa PBKDF2 (100.000 vòng băm SHA-256).
   - **Bảo vệ Sinh trắc học (WebAuthn)**: Yêu cầu xác thực FaceID / TouchID trước khi trích xuất khóa bí mật hoặc phê duyệt chữ ký.
   - **Tẩy bộ nhớ đệm (Memory Sanitization)**: Tự động ghi đè (`0x00...`) và hủy biến chứa khóa riêng trong RAM ngay sau khi hoàn tất ký số EIP-191.
   - **Sao lưu & Khôi phục chuẩn BIP-39**: Hỗ trợ xuất và khôi phục cặp khóa bằng cụm 12 từ khóa bí mật (Mnemonic Seed Phrase).
   - **Tạo lại danh tính (Identity Reset)**: Hỗ trợ tạo cặp khóa mới độc lập sau khi danh tính cũ bị thu hồi.

3. **Xác thực Không Mật Khẩu & Relay Thời Gian Thực (Challenge-Response UX)**
   - Mã QR đóng gói chuẩn JSON mang đầy đủ metadata: `domain`, `serviceName`, `nonce`, `chainId`, `contractAddress`.
   - **Hộp thoại Phê duyệt (Auth Approval Modal)**: Hiển thị minh bạch thông tin cổng dịch vụ trước khi người dùng đồng ý ký số.
   - **WebSocket (Socket.io) Relay**: Cổng đăng nhập trên máy tính tự động nhận diện chữ ký từ điện thoại qua WebSocket room và chuyển sang **Dashboard Sinh Viên** tức thì không cần can thiệp thủ công.

4. **Trung Tâm Quản Trị Danh Tính & Giám Sát An Ninh (Admin Gateway)**
   - Quản lý tập trung toàn bộ danh tính sinh viên: Xem thông tin, chuyển đổi trạng thái **Hoạt Động (Active) $\leftrightarrow$ Thu Hồi (Revoked)** tức thì.
   - Bảng **Nhật Ký An Ninh Tập Trung (Centralized Audit Logs)**: Lưu vết bất biến các sự kiện xác thực, tấn công và thu hồi danh tính.

5. **Tương tác Smart Contract trên Blockchain Polygon Amoy**
   - Kết nối trực tiếp RPC **Polygon Amoy Testnet (ChainId 80002)**.
   - Smart Contract `DIDRegistry.sol` quản lý danh tính, đối soát chữ ký số ECDSA (`ecrecover`) và cơ chế thu hồi khẩn cấp (**Incident Revocation**).

6. **Giao Diện Thích Ứng Toàn Diện (Responsive Mobile First)**
   - Tương thích hoàn hảo với mọi kích cỡ màn hình từ iPhone SE (320px–375px) đến iPhone 11–16 (Notch, Dynamic Island) và các thiết bị Android.
   - Hỗ trợ chuẩn vùng an toàn `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`.

---

## 🛡️ Thực Nghiệm Kiểm Thử An Toàn Thông Tin (Security Evaluation)

Bộ kịch bản kiểm thử tấn công tự động (`backend/test-attacks.js`) mô phỏng 3 vectơ tấn công phổ biến vào hệ thống xác thực phi tập trung:

| Mã Ca | Vectơ Tấn Công | Mô Tả Kịch Bản | Phản Hồi Kỳ Vọng | Kết Quả Thực Nghiệm | Đánh Giá NCKH |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **TC-01** | **Replay Attack** (Tấn công phát lại) | Kẻ tấn công thu thập gói tin chữ ký hợp lệ trước đó và gửi lại máy chủ | `HTTP 401 Unauthorized` | `HTTP 401` | **ĐẠT (PASS)** |
| **TC-02** | **Signature Tampering** (Giả mạo chữ ký / MitM) | Kẻ tấn công sửa đổi payload hoặc dùng khóa riêng mạo danh sinh viên | `HTTP 404 Not Found` | `HTTP 404` | **ĐẠT (PASS)** |
| **TC-03** | **Revocation Abuse** (Lạm dụng danh tính thu hồi) | Cố tình đăng nhập bằng danh tính đã bị báo mất / thu hồi trên hệ thống | `HTTP 403 Forbidden` | `HTTP 403` | **ĐẠT (PASS)** |

> **Tổng kết:** 3/3 ca thử nghiệm đều đạt chuẩn an toàn tuyệt đối (100% phòng thủ thành công).

---

## 🏗️ Cấu Trúc Dự Án

```text
UTH-TrustID/
├── backend/                    # Máy chủ Node.js / Express & Socket.io
│   ├── server.js               # API Challenge, Verify, Admin, Audit Logs, W3C DID
│   ├── test-attacks.js         # Script kiểm thử tự động TC-01, TC-02, TC-03
│   └── package.json            # Dependencies: express, cors, ethers, socket.io
├── public/                     # Icon PWA (192x192, 512x512), favicon, manifest
├── src/
│   ├── components/
│   │   ├── AdminGateway.jsx    # Bảng điều khiển quản trị danh tính & Audit Log
│   │   ├── LoginPortal.jsx     # Cổng dịch vụ web kết nối Socket.io & Dashboard SV
│   │   └── Scanner.jsx         # Máy quét QR tối ưu WebKit / iOS Safari
│   ├── contracts/
│   │   └── DIDRegistry.sol     # Smart Contract quản lý W3C DID trên Polygon Amoy
│   ├── services/
│   │   └── did.js              # Core: Mật mã AES-GCM, WebAuthn, W3C DID, Polygon RPC
│   ├── App.jsx                 # Ứng dụng Ví PWA (Ví Mobile, Cổng Web, Quản Trị)
│   ├── index.css               # Cấu hình Tailwind CSS v4 & Safe Area Insets
│   └── main.jsx
├── index.html                  # Thẻ meta PWA độc lập (iOS Safari Standalone)
├── vite.config.js              # Cấu hình Vite, VitePWA, Tailwind v4, SSL, Reverse Proxy
└── package.json
```

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Khởi chạy Backend Service
```bash
cd backend
npm install
npm start
# Máy chủ Auth & Socket.io lắng nghe tại http://localhost:4000
```

### 2. Chạy Kiểm thử Tấn công Thực nghiệm
```bash
cd backend
node test-attacks.js
```

### 3. Khởi chạy Ứng Dụng Frontend (PWA)
```bash
npm install
npm run dev -- --host
# Truy cập https://localhost:5173 (hoặc qua đường hầm Cloudflare)
```

### 4. Đóng gói Sản Phẩm (Production Build)
```bash
npm run build
```

---

## 📜 Bản Quyền & Trích Dẫn
Dự án được nghiên cứu và phát triển phục vụ đề tài Nghiên cứu Khoa học (NCKH) sinh viên - Trường Đại học Giao thông Vận tải TP.HCM (UTH).
Giấy phép phát hành: MIT License.
