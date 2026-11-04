<div align="center">

# 🛡️ UTH-TrustID: Decentralized Identity & Anti-Proxy Attendance Framework
**Hệ sinh thái Danh tính số Phi tập trung (W3C DID) & Xác thực Hiện diện Phòng học / Phòng thi ứng dụng Merkle Tree & WebAuthn**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Polygon Network](https://img.shields.io/badge/Network-Polygon_Amoy_Testnet-8247E5?logo=polygon&logoColor=white)](https://amoy.polygonscan.com/)
[![W3C Standard](https://img.shields.io/badge/W3C-Verifiable_Credentials-blue?logo=w3c&logoColor=white)](https://www.w3.org/TR/vc-data-model/)
[![Security: Defense-in-Depth](https://img.shields.io/badge/Security-Defense--in--Depth-success?logo=shield)](https://github.com/hien-cybers)

[Tổng quan](#-tổng-quan-kiến-trúc) • [Mô hình Đe dọa](#-mô-hình-đe-dọa--ma-trận-phòng-thủ-threat-model) • [Công nghệ](#-ngăn-xếp-công-nghệ-tech-stack) • [Cấu trúc](#-cấu-trúc-thư-mục-repository) • [Cài đặt](#-cài-đặt--triển-khai-nhanh) • [Smart Contract](#-hợp-đồng-thông-minh-didregistrysol)

</div>

---

## 📌 Tổng Quan Kiến Trúc

**UTH-TrustID** giải quyết triệt để các vấn nạn gian lận điểm danh, điểm danh hộ (Proxy Attendance) và thi hộ trong môi trường đại học. Dự án chuyển đổi mô hình định danh truyền thống (User/Password tập trung) sang kiến trúc **Tam giác Danh tính Phi tập trung (Decentralized Identity Triangle)** theo tiêu chuẩn W3C:

```text
               ┌──────────────────────────────┐
               │  ROOT ISSUER (Nhà trường)    │
               │  - Batch Issue via Merkle    │
               │  - Commit Merkle Root to Chain│
               └──────────────┬───────────────┘
                              │
                Phát hành VC  │  Neo Root On-Chain
                              │  (DIDRegistry.sol)
                              ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│   HOLDER (Sinh viên)    │ ────────────► │  VERIFIER (Giảng viên)  │
│ - Non-custodial Keypair │  Trình xuất   │ - Real-time Session     │
│ - Hardware Device Bind  │  Bằng chứng   │ - Dynamic Sliding Nonce │
│ - Biometric Gatekeeper  │   (EIP-191)   │ - Visual Liveness Stamp │
└─────────────────────────┘               └─────────────────────────┘
```

### Các Trụ Cột Kỹ Thuật Chính:
1. **Zero-Gas / O(log N) Scalability:** Sử dụng cây **Merkle Tree** nén toàn bộ danh sách sinh viên hợp lệ thành một mã băm gốc 32-byte duy nhất (`merkleRoot`) neo trên blockchain Polygon. Sinh viên tự lưu trữ thẻ và chứng minh tính hợp lệ với độ phức tạp $O(\log N)$.
2. **On-Chain Revocation Registry:** Tách rời cấu trúc cây Merkle và sổ bộ thu hồi. Khi sinh viên mất máy, quản trị viên đưa địa chỉ ví cũ vào bảng `isRevoked` trên Smart Contract mà không làm vô hiệu hóa mảng Proof của các sinh viên khác.
3. **Cryptographic Biometric Gate:** Tích hợp **WebAuthn (FIDO2)** gọi trực tiếp Secure Enclave (Apple) / Titan M (Android). Khóa bí mật chỉ được cấp quyền ký số EIP-191 khi vượt qua xác thực sinh trắc học phần cứng.

---

## ⚔️ Mô Hình Đe Dọa & Ma Trận Phòng Thủ (Threat Model)

| Vector Tấn Công | Kịch Bản Khai Thác | Cơ Chế Phòng Thủ Trọng Yếu Của UTH-TrustID |
| :--- | :--- | :--- |
| **Replay Attack** | Bắt gói tin chữ ký qua mạng và phát lại sau đó. | **Sliding Window Nonce:** Mã QR xoay Nonce mỗi chu kỳ 15–30s. Nonce gắn nhãn thời gian và chỉ tồn tại trong TTL 45s. |
| **GPS Spoofing / Mock Location** | Dùng phần mềm giả lập toạ độ ở nhà để quét mã. | **Cơ chế Lai (Hybrid Geo-Fencing):** Kết hợp công thức Haversine ($\le 20\text{m}$ / $\le 35\text{m}$) và ràng buộc dải mạng nội bộ (Campus Wi-Fi Subnet IP). |
| **Physical Device Delegation** | Đưa cả 2 điện thoại cho bạn cùng lớp cầm vào phòng. | **WebAuthn Local Gate:** Khóa Private Key sau lớp bảo vệ Face ID/Vân tay. Người khác cầm máy không thể mở khóa để ký số. |
| **Screen Capture Fraud** | Chụp ảnh màn hình điểm danh thành công gửi cho nhau. | **Dynamic Liveness Stamp:** Con dấu số động gồm sóng radar, đồng hồ mili-giây thời gian thực ($40\text{ms}$) và 1s Dynamic Hash. |
| **Mid-class Truancy** | Điểm danh đầu giờ rồi trốn về giữa buổi học. | **Random Spot-Check:** Kênh WebSocket kích hoạt lệnh tái kiểm tra đột xuất; sinh viên phải quét lại Face ID trong vòng 60 giây. |

---

## 💻 Ngăn Xếp Công Nghệ (Tech Stack)

* **Blockchain & Cryptography:** Solidity `^0.8.20`, Ethers.js v6, MerkleTree.js, Keccak256, W3C DID, EIP-191 Personal Sign.
* **Frontend Mobile / PWA:** React 19, Vite, Capacitor (Native Bridge iOS/Android), TailwindCSS / Vanilla CSS Safe-Area Engine, Lucide Icons.
* **Backend & Real-Time Engine:** Node.js, Express.js, Socket.io (WebSocket Room Management), Web Crypto API (PBKDF2/AES-GCM).
* **DevOps & Testing:** Hardhat, GitHub Actions (macOS Runner CI/CD cho iOS IPA), Sideloadly.

---

## 📁 Cấu Trúc Thư Mục Repository

```text
UTH-TrustID/
├── contracts/                     # Hợp đồng thông minh Solidity
│   └── DIDRegistry.sol            # Quản lý Merkle Root & Sổ bộ thu hồi (Revocation)
├── scripts/                       # Kịch bản deploy Hardhat lên Polygon Amoy
│   └── deploy.js
├── uth-trustid-backend/           # Node.js Server & Socket.io Gateway
│   ├── server.js                  # Xử lý ecrecover, Haversine, Sliding Nonce, Spot-check
│   └── package.json
├── did-wallet/                    # Frontend React Vite PWA & Native App
│   ├── src/
│   │   ├── components/
│   │   │   ├── SplashScreen.jsx           # Màn hình Splash động phong cách Native
│   │   │   ├── CameraScannerPro.jsx       # Bộ quét Camera chống chớp tắt trên WebKit iOS
│   │   │   ├── LiveClock.jsx              # Đồng hồ độc lập chống re-render
│   │   │   └── ProofOfLivenessStamp.jsx   # Con dấu động Liveness Stamp
│   │   ├── pages/
│   │   │   ├── StudentWalletPro.jsx       # Ví Sinh viên số W3C VC & ZKP-lite
│   │   │   ├── ScanPage.jsx               # Màn hình quét mã điểm danh & Spot-Check
│   │   │   ├── FacultyPortalPro.jsx       # Cổng giảng viên (Projector Mode, Iframe Maps)
│   │   │   └── AdminDashboardPro.jsx      # Quản trị Merkle Tree & Thu hồi khóa
│   │   ├── utils/
│   │   │   ├── webauthnHelper.js          # Module FaceID/TouchID native WebAuthn + Key Wrapping
│   │   │   └── gpsDriftFilter.js          # Pre-warm GPS & Bộ lọc sai số trôi dạt
│   │   ├── App.jsx                        # Giao diện chính phân quyền RBAC & Safe-Area
│   │   └── main.jsx
│   ├── ios/                               # Dự án Native iOS Xcode & SPM
│   ├── .github/workflows/
│   │   └── build-ios.yml                  # CI/CD tự động biên dịch IPA trên macOS Runner
│   ├── capacitor.config.json              # Cấu hình Native App cho iOS
│   └── package.json
└── README.md
```

---

## 🚀 Cài Đặt & Triển Khai Nhanh

### 1. Khởi chạy Backend Server
```bash
cd uth-trustid-backend
npm install
node server.js
# Backend sẵn sàng tại port 4000 kèm Socket.io
```

### 2. Khởi chạy Frontend React
```bash
cd did-wallet
npm install
npm run dev -- --host
# Mở trình duyệt tại http://localhost:5173
```

### 3. Đóng gói Ứng Dụng Di Động Native (Capacitor)
```bash
cd did-wallet
# Biên dịch giao diện tĩnh
npm run build

# Đồng bộ thay đổi vào thư mục iOS
npx cap sync ios
```

- **iOS (IPA đóng gói tự động):** Dự án tích hợp sẵn GitHub Actions workflow `.github/workflows/build-ios.yml`. Khi đẩy code lên nhánh `main`, GitHub Actions tự động biên dịch trên máy ảo macOS-15. Bạn chỉ cần tải file `.ipa` từ mục **Artifacts** và cài đặt vào iPhone qua **Sideloadly**.

---

## 📜 Hợp Đồng Thông Minh (DIDRegistry.sol)

Hợp đồng được tối ưu hóa chi phí lưu trữ, triển khai tại mạng Polygon Amoy Testnet:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UTH-TrustID DIDRegistry
 * @dev Quản trị Merkle Root danh tính sinh viên UTH và sổ bộ thu hồi khóa On-Chain
 */
contract DIDRegistry {
    address public immutable rootAdmin;
    bytes32 public currentMerkleRoot;

    // Sổ bộ thu hồi địa chỉ ví khi mất máy (Bảo toàn Merkle Root chung)
    mapping(address => bool) public isRevoked;

    event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot, uint256 timestamp);
    event KeyRevoked(address indexed studentWallet, uint256 timestamp);
    event KeyReinstated(address indexed studentWallet, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == rootAdmin, "UTH: Caller is not root admin");
        _;
    }

    constructor(bytes32 _initialRoot) {
        rootAdmin = msg.sender;
        currentMerkleRoot = _initialRoot;
    }

    function setMerkleRoot(bytes32 _newRoot) external onlyAdmin {
        emit MerkleRootUpdated(currentMerkleRoot, _newRoot, block.timestamp);
        currentMerkleRoot = _newRoot;
    }

    function revokeKey(address _studentWallet) external onlyAdmin {
        require(!isRevoked[_studentWallet], "UTH: Already revoked");
        isRevoked[_studentWallet] = true;
        emit KeyRevoked(_studentWallet, block.timestamp);
    }

    function reinstateKey(address _studentWallet) external onlyAdmin {
        require(isRevoked[_studentWallet], "UTH: Not in revoked list");
        isRevoked[_studentWallet] = false;
        emit KeyReinstated(_studentWallet, block.timestamp);
    }
}
```

---

## 🔒 Tuân Thủ Tiêu Chuẩn & Quyền Riêng Tư (Privacy-by-Design)

- **Zero Identity Leaks:** Không lưu trữ khóa bí mật (Private Key) hoặc dữ liệu sinh trắc học (vân tay/khuôn mặt) trên máy chủ tập trung.
- **Selective Disclosure:** Chế độ ẩn danh cho phép sinh viên xuất trình bằng chứng danh tính hợp lệ mà không làm lộ Họ tên, Mã sinh viên hay Địa chỉ ví công khai khi qua cổng trường hoặc mượn sách thư viện.
- **Data Protection Compliance:** Cấu trúc dữ liệu và quy trình định danh được thiết kế bám sát các nguyên tắc cốt lõi của GDPR (Right to be Forgotten via Key Revocation) và tiêu chuẩn an toàn ISO/IEC 27001.

---

## 👨‍💻 Tác Giả & Bản Quyền

- **Tác giả:** Nguyễn Đức Hiển ([@hien-cybers](https://github.com/hien-cybers))
- **Đơn vị:** Khoa Công nghệ Thông tin - Chuyên ngành An toàn Thông tin - Trường Đại học Giao thông Vận tải TP.HCM (UTH).
- **Giấy phép:** Dự án được phân phối dưới giấy phép [MIT License](https://opensource.org/licenses/MIT).
