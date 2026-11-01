import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { verifyMessage, getAddress } from 'ethers';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// ==========================================
// 1. CƠ SỞ DỮ LIỆU IN-MEMORY & AUDIT LOGS
// ==========================================

const identitiesDB = {
  '0x1D9b6938A3f073e3426052C7016155D85040Ed1D': {
    studentId: '2251120000',
    fullName: 'Sinh viên UTH',
    major: 'An toàn Thông tin',
    isRevoked: false,
    createdAt: Date.now() - 3600000,
  },
};

// Sổ cái lưu vết Audit Log an ninh tập trung
const auditLogsDB = [
  {
    id: 'log_seed_1',
    time: '11:20:04',
    timestamp: Date.now() - 3600000,
    address: '0x1D9b...Ed1D',
    fullAddress: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
    action: 'Xác thực đăng nhập',
    result: 'Thành công',
    detail: 'EIP-191 Verified / Nonce hợp lệ',
    status: 200,
  },
  {
    id: 'log_seed_2',
    time: '11:24:15',
    timestamp: Date.now() - 2400000,
    address: '0x1D9b...Ed1D',
    fullAddress: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
    action: 'Thu hồi khẩn cấp',
    result: 'Ghi nhận',
    detail: 'Trạng thái chuyển sang Revoked',
    status: 200,
  },
  {
    id: 'log_seed_3',
    time: '11:25:02',
    timestamp: Date.now() - 1800000,
    address: '0x1D9b...Ed1D',
    fullAddress: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
    action: 'Xác thực đăng nhập',
    result: 'Bị chặn (403)',
    detail: 'Danh tính trong danh sách thu hồi',
    status: 403,
  },
];

function recordAuditLog(address, action, result, detail, status = 200) {
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'UNKNOWN';
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    time: new Date().toLocaleTimeString('vi-VN'),
    timestamp: Date.now(),
    address: shortAddr,
    fullAddress: address || '',
    action,
    result,
    detail,
    status,
  };
  auditLogsDB.unshift(newLog);
  if (auditLogsDB.length > 100) auditLogsDB.pop();
  return newLog;
}

// Lưu trữ các nonce hợp lệ đang chờ xác thực: { [nonce]: expiresAt }
const activeNonces = new Map();

// ==========================================
// 2. SOCKET.IO QUẢN LÝ PHIÊN THEO NONCE
// ==========================================

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Trình duyệt Web tham gia phòng theo Nonce
  socket.on('join-session', (nonce) => {
    socket.join(nonce);
    console.log(`[Socket] Client ${socket.id} joined room: ${nonce}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ==========================================
// 3. API AUTHENTICATION & CHALLENGE-RESPONSE
// ==========================================

// Sinh Challenge Nonce ngẫu nhiên cho màn hình QR
app.get('/api/auth/challenge', (req, res) => {
  const nonce = `auth_nonce_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  // Nonce có hiệu lực trong 5 phút
  activeNonces.set(nonce, Date.now() + 5 * 60 * 1000);

  return res.json({
    success: true,
    challenge: nonce,
    expiresIn: 300,
  });
});

// Xác thực chữ ký EIP-191 từ ứng dụng di động
app.post('/api/auth/verify', (req, res) => {
  const { challenge, signature } = req.body;

  if (!challenge || !signature) {
    recordAuditLog('', 'Xác thực đăng nhập', 'Thất bại (400)', 'Thiếu challenge hoặc signature', 400);
    return res.status(400).json({ success: false, message: 'Thiếu challenge hoặc signature' });
  }

  // Bước A: Kiểm tra Nonce có hợp lệ và còn hạn không
  const expiresAt = activeNonces.get(challenge);
  if (!expiresAt || Date.now() > expiresAt) {
    recordAuditLog('', 'Xác thực đăng nhập', 'Bị chặn (401)', 'Challenge Nonce không hợp lệ hoặc đã hết hạn (TC-01 Replay Attack)', 401);
    return res.status(401).json({
      success: false,
      message: 'Challenge Nonce không hợp lệ hoặc đã hết hạn (Phát hiện Replay Attack)',
    });
  }
  // Xóa nonce ngay sau khi kiểm tra để chống Replay Attack
  activeNonces.delete(challenge);

  try {
    // Bước B: Khôi phục địa chỉ ví từ chữ ký số EIP-191 (ecrecover)
    const recoveredAddress = verifyMessage(challenge, signature);
    const checksumRecovered = getAddress(recoveredAddress);

    // Bước C: Đối soát quyền và kiểm tra trạng thái thu hồi
    const identity = identitiesDB[checksumRecovered];

    if (!identity) {
      recordAuditLog(checksumRecovered, 'Xác thực đăng nhập', 'Thất bại (404)', 'Danh tính chưa đăng ký trong hệ thống (TC-02 Tampering)', 404);
      return res.status(404).json({
        success: false,
        message: 'Danh tính chưa được đăng ký trong hệ thống',
        recoveredAddress: checksumRecovered,
      });
    }

    if (identity.isRevoked) {
      recordAuditLog(checksumRecovered, 'Xác thực đăng nhập', 'Bị chặn (403)', 'Danh tính trong danh sách thu hồi (TC-03 Revocation)', 403);
      return res.status(403).json({
        success: false,
        isRevoked: true,
        message: 'Từ chối xác thực: Danh tính số này đã bị thu hồi khẩn cấp (Revoked)!',
      });
    }

    // Bước D: Xác thực hoàn tất thành công -> Ghi log an ninh
    recordAuditLog(checksumRecovered, 'Xác thực đăng nhập', 'Thành công', 'EIP-191 Verified / Nonce hợp lệ', 200);

    const authData = {
      token: `jwt_uth_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      user: {
        address: checksumRecovered,
        studentId: identity.studentId,
        major: identity.major,
        fullName: identity.fullName,
      },
      timestamp: Date.now(),
    };

    // Bắn sự kiện Socket.io đến đúng phòng Web đang giữ Nonce này
    io.to(challenge).emit('auth-success', authData);

    return res.json({
      success: true,
      message: 'Xác thực danh tính thành công',
      ...authData,
    });
  } catch (error) {
    recordAuditLog('', 'Xác thực đăng nhập', 'Thất bại (400)', 'Chữ ký không hợp lệ: ' + error.message, 400);
    return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ: ' + error.message });
  }
});

// ==========================================
// 4. API QUẢN TRỊ DANH TÍNH (ADMIN GATEWAY)
// ==========================================

// Lấy danh sách toàn bộ danh tính
app.get('/api/admin/identities', (req, res) => {
  return res.json({ success: true, identities: identitiesDB });
});

// Lấy danh sách Audit Logs an ninh
app.get('/api/admin/logs', (req, res) => {
  return res.json({ success: true, logs: auditLogsDB });
});

// Thu hồi danh tính (Revoke)
app.post('/api/identity/revoke', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: 'Thiếu địa chỉ ví' });

  try {
    const checksum = getAddress(address);
    if (!identitiesDB[checksum]) {
      return res.status(404).json({ message: 'Danh tính không tồn tại' });
    }

    identitiesDB[checksum].isRevoked = true;
    recordAuditLog(checksum, 'Thu hồi khẩn cấp', 'Ghi nhận', 'Trạng thái chuyển sang Revoked');
    return res.json({ success: true, message: `Đã thu hồi danh tính ví ${checksum}` });
  } catch {
    return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
  }
});

// Kích hoạt lại danh tính (Reactivate)
app.post('/api/identity/reactivate', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: 'Thiếu địa chỉ ví' });

  try {
    const checksum = getAddress(address);
    if (!identitiesDB[checksum]) {
      return res.status(404).json({ message: 'Danh tính không tồn tại' });
    }

    identitiesDB[checksum].isRevoked = false;
    recordAuditLog(checksum, 'Kích hoạt lại', 'Thành công', 'Khôi phục trạng thái hoạt động Active');
    return res.json({ success: true, message: `Đã kích hoạt lại danh tính ví ${checksum}` });
  } catch {
    return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
  }
});

// Đăng ký danh tính sinh viên mới
app.post('/api/identity/register', (req, res) => {
  const { address, studentId, fullName, major } = req.body;
  if (!address) return res.status(400).json({ message: 'Thiếu địa chỉ ví' });

  try {
    const checksum = getAddress(address);
    identitiesDB[checksum] = {
      studentId: studentId || '2251120000',
      fullName: fullName || 'Sinh viên UTH',
      major: major || 'An toàn Thông tin',
      isRevoked: false,
      createdAt: Date.now(),
    };
    recordAuditLog(checksum, 'Đăng ký danh tính', 'Thành công', `Cấp phát tài khoản SV: ${identitiesDB[checksum].studentId}`);
    return res.json({ success: true, message: `Đã đăng ký danh tính cho ví ${checksum}`, identity: identitiesDB[checksum] });
  } catch {
    return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
  }
});

// ==========================================
// 5. TRÍCH XUẤT W3C DID DOCUMENT CHUẨN JSON-LD
// ==========================================

app.get('/api/did/:address', (req, res) => {
  try {
    const checksum = getAddress(req.params.address);
    const didUri = `did:ethr:polygon:${checksum}`;

    const didDoc = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      id: didUri,
      verificationMethod: [
        {
          id: `${didUri}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: didUri,
        },
      ],
      authentication: [`${didUri}#controller`],
    };

    return res.json(didDoc);
  } catch {
    return res.status(400).json({ error: 'Địa chỉ ví không hợp lệ' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend Auth & Socket Service running at http://localhost:${PORT}`);
});
