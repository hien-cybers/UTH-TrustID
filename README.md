# UTH-TrustID: Decentralized Identity (W3C DID) & Passwordless Authentication Wallet

Hệ thống Ví định danh số phi tập trung (**W3C Decentralized Identity**) và xác thực không mật khẩu (**Passwordless Authentication**) tích hợp công nghệ Blockchain (**Polygon Amoy**), Sinh trắc học phần cứng (**WebAuthn**), Cây Merkle (**Merkle Tree Batch VC**), Phát hiện GPS giả mạo (**Anti-Mock GPS Anomaly Detection**) và Hệ thống Giám sát An ninh Dị thường (**IDS**), phục vụ đề tài Nghiên cứu Khoa học (NCKH) - Trường Đại học Giao thông Vận tải TP.HCM (UTH).

---

## 🌟 Tính Năng Nổi Bật

### 1. Chuẩn Hóa Logic An Toàn Thông Tin & Giao Thức (Security & Protocol Logic)
- **Domain & Origin Binding**: Chuẩn hóa cấu trúc ký số EIP-191 mang tính chống chối bỏ:
  $$\text{Payload} = \text{"uth.edu.vn wants you to sign in with non-repudiation: Nonce="} + nonce + \text{" at "} + timestamp$$
  Chống triệt để tấn công Phishing và Relay Attack giữa các máy chủ giả mạo.
- **Strict Nonce TTL (60s) & Single-Use Destruction**: Nonce có thời gian sống ngắn (60 giây) và **bị hủy ngay lập tức** khỏi bộ nhớ đệm tại request xác thực đầu tiên (bất kể thành công hay thất bại), triệt tiêu tuyệt đối nguy cơ tấn công phát lại (Replay Attack).
- **Cryptographic Proof of Association**: Ràng buộc mật mã chặt chẽ giữa Khóa Ví và Thẻ Sinh Viên Số $(MSSV, studentAddress, issueDate, expiryDate)$ thông qua chữ ký số ECDSA từ University Root Issuer.
- **Khóa Danh Tính Theo Thiết Bị Gốc (Device Binding / Hardware Footprint)**: Băm định danh phần cứng kết hợp từ Canvas 2D fingerprint, WebGL GPU Renderer, độ phân giải màn hình, múi giờ và CPU cores thành chuỗi `DEV_FP_...`. Khi ký số điểm danh, payload bắt buộc phải khớp chữ ký + DeviceID đã đăng ký để chống sao chép khóa sang thiết bị khác (`HARDWARE_MISMATCH`).
- **Khóa 1 Phiên Duy Nhất (Single Active Session Enforcement)**: Tại một thời điểm, một mã sinh viên chỉ có 1 phiên hợp lệ duy nhất. Ngăn chặn hành vi một sinh viên đăng nhập cùng lúc ở 2 địa điểm/dịch vụ khác nhau.

### 2. Phân Hệ Sinh Viên (Student Wallet PWA - `/wallet`)
- **Giao Diện Deep Blue-Navy Glassmorphism**: Thẻ Sinh Viên Số thiết kế chuẩn kính mờ hiện đại, hiển thị trực quan thông tin định danh W3C DID, mã khóa, mã QR định danh và huy hiệu thiết bị gốc đã khóa.
- **Xuất trình có chọn lọc (Selective Disclosure / Privacy Mode)**: Cho phép sinh viên bật chế độ riêng tư ẩn MSSV và thông tin cá nhân (`••••••••`), chỉ xuất trình bằng chứng mật mã xác nhận sinh viên UTH hợp lệ (Zero-Knowledge/Selective Disclosure cho Thư viện, Nhà xe).
- **Cơ chế Thu hồi Khẩn cấp Chủ động (Self-Revocation via Emergency Token)**: Cấp mã khẩn cấp bí mật (`EMERGENCY_UTH_...`) khi tạo ví. Khi bị mất thiết bị, sinh viên có thể dùng mã này để tự khóa/thu hồi danh tính từ xa trên bất kỳ trình duyệt nào.
- **Cơ chế Tự Hủy Chống Dò Khóa (Tamper Self-Destruct)**: Khi nhập sai mã PIN/xác thực bảo mật quá 5 lần liên tiếp, hệ thống tự động kích hoạt quy trình tự hủy: xóa sạch Private Key và 12 từ Mnemonic khỏi bộ nhớ cục bộ (`localStorage`), đồng thời tự động gửi lệnh thu hồi on-chain và báo cáo cảnh báo khẩn cấp lên IDS Quản trị.
- **Mã hóa Cục bộ AES-GCM-256 & WebAuthn**: Khóa riêng (Private Key) và cụm 12 từ khôi phục (BIP-39 Mnemonic) được mã hóa bằng AES-GCM kết hợp PBKDF2 (100.000 vòng lặp) và bảo vệ bằng TouchID/FaceID.
- **Tẩy bộ nhớ đệm RAM (Memory Sanitization)**: Tự động ghi đè (`0x00...`) và hủy biến khóa riêng ngay sau khi hoàn tất ký số EIP-191.
- **Vé Điểm Danh Ngoại Tuyến (Offline Verifiable Presentation)**: Hỗ trợ sinh viên sinh mã QR offline chứa VP đã ký sẵn để điểm danh tại các phòng học/phòng thi tầng hầm không có sóng 4G/Wi-Fi.

### 3. Phân Hệ Giảng Viên (Faculty & Verifier Portal - `/faculty`)
- **Giao Diện Thẩm Mỹ Cao Cấp (Deep Blue-Navy Glassmorphism Aesthetic)**: Thiết kế chuẩn Mobile-first theo ngôn ngữ Dark Glassmorphism hiện đại kết hợp điểm nhấn màu xanh Cyan (`#38bdf8`) và gradient xanh biển.
- **Dynamic Rotating QR Code (Xoay mã 15s)**: Cơ chế xoay mã QR tự động sau mỗi 15 giây kèm thanh đếm lùi trực quan, chống việc sinh viên chụp ảnh mã gửi ra ngoài phòng thi / lớp học.
- **Fullscreen Projector Mode**: Nút phóng to mã QR toàn màn hình overlay sắc nét trên máy chiếu giảng đường lớn.
- **Điểm Danh Ngẫu Nhiên Giữa Giờ (Mid-Session Random Verification)**: Giảng viên kích hoạt thử thách đột xuất 120 giây với mã Nonce khẩn cấp (`MID_...`), sinh viên trên lớp phải xác thực lại để chứng minh không bỏ về sớm.
- **Kiểm Tra Minh Chứng Ngang Hàng (Peer-to-Peer Attestation / Mesh Check)**: Tùy chọn yêu cầu xác thực chéo từ $\ge 2$ bạn cùng lớp ở gần trước khi hệ thống ghi nhận điểm danh chính thức.
- **Đồng Bộ Hệ Thống Đào Tạo SIS (Webhook Integration)**: Nút đồng bộ kết quả điểm danh trực tiếp về Cổng Quản lý Đào tạo UTH thông qua Webhook `/api/sis/sync-attendance`.
- **Khóa Phiên Tự Động (Auto-Lock Session Timer)**: Tự động đếm lùi 15 phút và đóng phòng điểm danh, từ chối mọi yêu cầu quét mã muộn.
- **Xuất Dữ Liệu Nghiệm Thu Ra CSV (Export Audit Trail)**: Xuất file bảng tính chi tiết: MSSV, Họ tên, Thời gian, Toạ độ GPS, Khoảng cách Haversine (m), Chế độ mạng, Hash chữ ký số EIP-191.

### 4. Phân Hệ Quản Trị Viên (Admin & Issuer Portal - `/admin`)
- **Cấp phát VC hàng loạt qua Merkle Tree (Batch VC Issuance)**: Nhập danh sách sinh viên theo lô (JSON Batch), hệ thống tự động tính toán **Merkle Tree Root** (`keccak256`) và ký số lô tập trung bằng ví Root Issuer của trường, giúp tiết kiệm chi phí và tăng tốc độ cấp phát chứng chỉ số quy mô lớn.
- **Chứng Chỉ Đủ Điều Kiện Dự Thi (Exam Eligibility VC)**: Cấp phát chứng chỉ số W3C VC chuẩn cho sinh viên có tỷ lệ chuyên cần $\ge 80\%$, ký số EIP-191 bởi University Root Authority, tích hợp trực tiếp vào hồ sơ thi chính thức.
- **Khôi Phục Danh Tính Qua Cố Vấn Học Tập (Faculty Social Recovery)**: Khi sinh viên mất điện thoại/thiết bị, Cố vấn học tập có thẩm quyền ký duyệt cấp lại DID mới và tự động thu hồi khóa cũ trên Polygon Amoy mà không làm mất lịch sử điểm danh và chứng chỉ đã tích lũy.
- **Đo Lường Hiệu Năng Mật Mã (NCKH Benchmark Tool)**: Đo lường và định lượng độ trễ thời gian thực của các thuật toán: Sinh khóa secp256k1, Ký EIP-191, Phục hồi địa chỉ qua ecrecover, Tính khoảng cách Haversine và Dựng cây Merkle Tree (100 sinh viên).
- **Hệ thống Giám sát An ninh & Cảnh báo Dị thường (IDS Alerts)**:
  - **Brute-force Challenge**: Phát hiện và chặn các nguồn thử sai chữ ký liên tiếp $\ge 3$ lần.
  - **Impossible Travel**: Phát hiện hành vi quét QR từ 2 vị trí địa lý cách nhau quá xa trong khoảng thời gian ngắn (vận tốc di chuyển vượt ngưỡng vật lý $v > 30\text{ m/s}$).
  - **Hardware Mismatch & Tamper**: Ghi nhận cảnh báo khi DeviceID bị thay đổi hoặc kích hoạt cơ chế tự hủy.

### 5. Cổng Dịch Vụ Web Không Mật Khẩu (Login Portal - `/portal`)
- Tích hợp **WebSocket (Socket.io)** hai chiều tự động chuyển hướng sang Dashboard cá nhân ngay khi điện thoại quét và ký số thành công.
- Tích hợp bộ đếm Nonce TTL 60s và nút **Báo mất ví khẩn cấp từ xa**.

---

## 🛡️ Thực Nghiệm Kiểm Thử An Toàn Thông Tin (Security Evaluation)

Bộ kịch bản kiểm thử tấn công tự động (`backend/test-attacks.js`) mô phỏng các vectơ tấn công phổ biến vào hệ thống xác thực phi tập trung:

| Mã Ca | Vectơ Tấn Công | Mô Tả Kịch Bản | Phản Hồi Kỳ Vọng | Kết Quả Thực Nghiệm | Đánh Giá NCKH |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Replay Attack** (Tấn công phát lại) | Kẻ tấn công thu thập gói tin chữ ký hợp lệ trước đó và gửi lại máy chủ | `HTTP 401 Unauthorized` | `HTTP 401` | **ĐẠT (PASS 100%)** |
| **TC-02** | **Signature Tampering** (Giả mạo chữ ký / MitM) | Kẻ tấn công sửa đổi payload hoặc dùng khóa riêng mạo danh sinh viên | `HTTP 404 Not Found` | `HTTP 404` | **ĐẠT (PASS 100%)** |
| **TC-03** | **Revocation Abuse** (Lạm dụng danh tính thu hồi) | Cố tình đăng nhập bằng danh tính đã bị báo mất / thu hồi trên hệ thống | `HTTP 403 Forbidden` | `HTTP 403` | **ĐẠT (PASS 100%)** |
| **TC-04** | **Device Mismatch** (Sao chép Private Key sang máy khác) | Ký số bằng khóa riêng nhưng gửi DeviceID phần cứng không khớp | `HTTP 403 HARDWARE_MISMATCH` | `HTTP 403` | **ĐẠT (PASS 100%)** |

> **Tổng kết:** 4/4 ca thử nghiệm đều đạt chuẩn an toàn tuyệt đối (100% phòng thủ thành công).

---

## 🏗️ Cấu Trúc Dự Án

```text
UTH-TrustID/
├── backend/                      # Máy chủ Node.js / Express & Socket.io
│   ├── middlewares/
│   │   └── networkGuard.js       # Dual-Factor Campus Network Guard (UTH Wi-Fi Subnet)
│   ├── server.js                 # API Challenge, Verify, Device Binding, SIS Webhook, Social Recovery, Exam VC
│   ├── test-attacks.js           # Kịch bản kiểm thử tấn công tự động TC-01, TC-02, TC-03, TC-04
│   └── package.json
├── public/                       # Manifest PWA, Service Worker, Icons
├── src/
│   ├── components/
│   │   ├── AdminGateway.jsx      # Quản trị Registry, Merkle Batch Issuer & IDS Alerts
│   │   ├── LoginPortal.jsx       # Cổng xác thực Web Socket.io & TTL 60s
│   │   ├── ProtectedRoute.jsx    # Lớp bảo vệ tuyến đường (Route Guard) phân quyền
│   │   ├── Scanner.jsx           # Máy quét QR WebKit / iOS Safari / Android
│   │   ├── StudentWallet.jsx     # Ví DID Mobile PWA: WebAuthn, Device Binding, Tamper Self-Destruct, Offline VP
│   │   └── WebPortal.jsx         # Wrapper Cổng dịch vụ
│   ├── pages/
│   │   ├── AdminDashboard.jsx    # Dashboard Quản trị: Merkle Tree, Social Recovery, Exam VC, Benchmark, IDS
│   │   └── FacultyPortal.jsx     # Cổng Giảng viên: Rotating QR 15s, Mid-session Check, P2P Mesh, SIS Webhook
│   ├── contracts/
│   │   └── DIDRegistry.sol       # Smart Contract Registry trên Polygon Amoy Testnet
│   ├── services/
│   │   ├── did.js                # Core Mật mã: AES-GCM, PBKDF2, WebAuthn, W3C DID, Polygon RPC
│   │   └── merkleTree.js         # Thuật toán sinh cây Merkle & Merkle Proof
│   ├── utils/
│   │   ├── antiSpoofGps.js       # Thuật toán phát hiện bất thường GPS (Accuracy, Teleport)
│   │   └── deviceFingerprint.js  # Thuật toán băm phần cứng (Canvas 2D + WebGL GPU + Screen + Timezone)
│   ├── App.jsx                   # Định tuyến Router: /wallet, /faculty, /admin, /portal
│   ├── index.css                 # Giao diện Deep Blue-Navy Glassmorphism & Vùng an toàn iOS/Android
│   ├── admin.css                 # Thiết kế hệ thống quản trị an ninh
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
