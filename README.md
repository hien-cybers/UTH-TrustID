# UTH-TrustID: Decentralized Identity (W3C DID) & Passwordless Authentication Wallet

Hệ thống Ví định danh số phi tập trung (**W3C Decentralized Identity**) và xác thực không mật khẩu (**Passwordless Authentication**) tích hợp công nghệ Blockchain và Sinh trắc học phần cứng (**WebAuthn**), phục vụ đề tài Nghiên cứu Khoa học (NCKH) - Trường Đại học Giao thông Vận tải TP.HCM (UTH).

---

## 🌟 Tính Năng Nổi Bật

1. **Chuẩn hóa Định danh W3C DID & Verifiable Credentials (VC)**
   - Khởi tạo và quản lý mã định danh W3C: `did:ethr:polygon:<Address>`.
   - Xuất tài liệu **W3C DID Document** theo đặc tả chuẩn quốc tế dạng **JSON-LD**.
   - Lưu trữ và hiển thị Thẻ Sinh Viên Số UTH chuẩn W3C Verifiable Credentials.

2. **Cơ chế Bảo mật & Quản lý Khóa Đa Tầng (Key Management)**
   - **Mã hóa AES-GCM-256**: Private Key và Mnemonic không bao giờ lưu dưới dạng plain-text; được mã hóa cục bộ thông qua Web Crypto API kết hợp dẫn xuất khóa PBKDF2 (100.000 vòng băm SHA-256).
   - **Bảo vệ Sinh trắc học (WebAuthn)**: Yêu cầu xác thực FaceID / TouchID trước khi trích xuất khóa bí mật hoặc phê duyệt chữ ký.
   - **Tẩy bộ nhớ đệm (Memory Sanitization)**: Tự động ghi đè và hủy biến chứa khóa riêng trong RAM ngay sau khi hoàn tất ký số EIP-191.
   - **Sao lưu & Khôi phục chuẩn BIP-39**: Hỗ trợ xuất và khôi phục cặp khóa bằng cụm 12 từ khóa bí mật (Mnemonic Seed Phrase).

3. **Xác thực Không Mật Khẩu & Relay Thời Gian Thực (Challenge-Response UX)**
   - Mã QR đóng gói chuẩn JSON mang đầy đủ metadata: `domain`, `serviceName`, `nonce`, `chainId`, `contractAddress`.
   - **Hộp thoại Phê duyệt (Auth Approval Modal)**: Hiển thị minh bạch thông tin cổng dịch vụ trước khi người dùng đồng ý ký số.
   - **Tự động đăng nhập thời gian thực**: Cổng đăng nhập trên máy tính tự động nhận diện chữ ký từ điện thoại và chuyển trạng thái thành công tức thì.

4. **Tương tác Smart Contract trên Blockchain Polygon Amoy**
   - Kết nối trực tiếp RPC **Polygon Amoy Testnet (ChainId 80002)**.
   - Smart Contract `DIDRegistry.sol` quản lý danh tính, đối soát chữ ký số ECDSA (`ecrecover`) và cơ chế thu hồi khẩn cấp (**Incident Revocation**).

---

## 🏗️ Cấu Trúc Dự Án

```text
did-wallet/
├── public/                 # Icon PWA (192x192, 512x512), favicon, assets
├── src/
│   ├── components/
│   │   ├── LoginPortal.jsx # Cổng dịch vụ web mô phỏng hiển thị mã QR
│   │   └── Scanner.jsx     # Máy quét QR tối ưu WebKit / iOS Safari
│   ├── contracts/
│   │   └── DIDRegistry.sol # Smart Contract quản lý W3C DID trên Polygon Amoy
│   ├── services/
│   │   └── did.js          # Core service: Mật mã AES-GCM, WebAuthn, W3C DID, RPC
│   ├── App.jsx             # Giao diện ví đa tab (Ví DID, Chứng chỉ VC, Audit Log)
│   ├── index.css           # Cấu hình Tailwind CSS v4
│   └── main.jsx
├── index.html              # Thẻ meta chuẩn PWA độc lập (iOS Safari Standalone)
├── vite.config.js          # Cấu hình Vite, VitePWA, Tailwind CSS v4, BasicSSL
└── package.json
```

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Khởi chạy môi trường phát triển (HTTPS nội bộ)
```bash
npm run dev -- --host
```

### 3. Đóng gói sản phẩm (Production Build)
```bash
npm run build
```

---

## 📜 Bản Quyền
Dự án được phát triển phục vụ mục đích Nghiên cứu Khoa học (NCKH) - UTH.
Giấy phép: MIT License.
