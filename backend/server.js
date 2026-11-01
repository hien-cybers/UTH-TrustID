import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { verifyMessage, getAddress, Wallet, keccak256, toUtf8Bytes } from 'ethers';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// ==========================================
// 1. CƠ SỞ DỮ LIỆU IN-MEMORY & SỔ CÁI AUDIT LOGS
// ==========================================

// Ví Issuer của Trường ĐH Giao thông Vận tải TP.HCM (Root Authority)
const UNIVERSITY_ISSUER_WALLET = new Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');

const identitiesDB = {
  '0x1D9b6938A3f073e3426052C7016155D85040Ed1D': {
    studentId: '2251120000',
    fullName: 'Sinh viên UTH',
    major: 'An toàn Thông tin',
    isRevoked: false,
    emergencyToken: 'EMERGENCY_UTH_DEMO_2026',
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
    detail: 'EIP-191 Verified / Nonce 60s hợp lệ',
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
];

// Hệ thống Cảnh báo Xâm nhập & Bất thường (Intrusion Detection System - IDS)
const idsAlertsDB = [
  {
    id: 'ids_seed_1',
    type: 'TAMPERING',
    address: '0x92eD...CBA6',
    severity: 'HIGH',
    detail: 'Chữ ký EIP-191 không khớp với dữ liệu đăng ký trong hệ thống (TC-02)',
    timestamp: Date.now() - 1200000,
    time: '11:30:12',
  },
];

const failedAttemptsMap = new Map(); // address -> { count, lastAttempt }
const loginLocationsMap = new Map(); // address -> { lat, lng, timestamp }

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
  if (auditLogsDB.length > 150) auditLogsDB.pop();
  return newLog;
}

function triggerIDSAlert(type, address, severity, detail) {
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'UNKNOWN';
  const alert = {
    id: 'ids_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type,
    address: shortAddr,
    fullAddress: address || '',
    severity,
    detail,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('vi-VN'),
  };
  idsAlertsDB.unshift(alert);
  if (idsAlertsDB.length > 50) idsAlertsDB.pop();
  recordAuditLog(address, `CẢNH BÁO IDS [${type}]`, 'Phát hiện bất thường', detail, 403);
  return alert;
}

// Lưu trữ các nonce hợp lệ đang chờ xác thực: { [nonce]: { expiresAt, domain, timestamp } }
const activeNonces = new Map();

// ==========================================
// 2. SOCKET.IO QUẢN LÝ PHIÊN THEO NONCE
// ==========================================

io.on('connection', (socket) => {
  socket.on('join-session', (nonce) => {
    socket.join(nonce);
  });
});

// ==========================================
// 3. API AUTHENTICATION & CHALLENGE-RESPONSE
// ==========================================

// Sinh Challenge Nonce ràng buộc Domain & Origin (Nonce TTL = 60s)
app.get('/api/auth/challenge', (req, res) => {
  const nonce = `auth_nonce_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  const domain = 'uth.edu.vn';
  const timestamp = Date.now();
  const expiresIn = 60; // 60 giây theo khuyến nghị NCKH

  // Lưu trữ phiên với thời gian sống 60 giây
  activeNonces.set(nonce, {
    expiresAt: timestamp + expiresIn * 1000,
    domain,
    timestamp,
  });

  // Chuỗi Payload EIP-191 chuẩn hóa ràng buộc chống Phishing / Relay Attack
  const standardizedPayload = `uth.edu.vn wants you to sign in with non-repudiation: Nonce=${nonce} at ${timestamp}`;

  return res.json({
    success: true,
    challenge: nonce,
    nonce,
    domain,
    timestamp,
    payload: standardizedPayload,
    expiresIn,
  });
});

// Xác thực chữ ký EIP-191 từ thiết bị di động
app.post('/api/auth/verify', (req, res) => {
  const { challenge, signature, location } = req.body;

  if (!challenge || !signature) {
    recordAuditLog('', 'Xác thực đăng nhập', 'Thất bại (400)', 'Thiếu challenge hoặc signature', 400);
    return res.status(400).json({ success: false, message: 'Thiếu challenge hoặc signature' });
  }

  // Bước A: Kiểm tra Nonce và THU HỒI NGAY LẬP TỨC (Single-Use Nonce)
  const nonceRecord = activeNonces.get(challenge);
  // Hủy nonce ngay trong ram để triệt tiêu vĩnh viễn Replay Attack
  activeNonces.delete(challenge);

  if (!nonceRecord || Date.now() > nonceRecord.expiresAt) {
    recordAuditLog('', 'Xác thực đăng nhập', 'Bị chặn (401)', 'Challenge Nonce không hợp lệ hoặc đã hết hạn (TC-01 Replay Attack)', 401);
    return res.status(401).json({
      success: false,
      message: 'Challenge Nonce không hợp lệ hoặc đã hết hạn (Phát hiện Replay Attack)',
    });
  }

  try {
    // Bước B: Khôi phục địa chỉ ví từ chữ ký số EIP-191
    let recoveredAddress = null;
    try {
      recoveredAddress = verifyMessage(challenge, signature);
    } catch {
      // Thử đối soát với định dạng payload chuẩn hóa
      const stdPayload = `uth.edu.vn wants you to sign in with non-repudiation: Nonce=${challenge} at ${nonceRecord.timestamp}`;
      recoveredAddress = verifyMessage(stdPayload, signature);
    }

    const checksumRecovered = getAddress(recoveredAddress);

    // Bước C: Đối soát quyền và kiểm tra trạng thái thu hồi
    const identity = identitiesDB[checksumRecovered];

    if (!identity) {
      // Ghi nhận sự cố bất thường (TC-02 Tampering)
      const currentFails = (failedAttemptsMap.get(checksumRecovered)?.count || 0) + 1;
      failedAttemptsMap.set(checksumRecovered, { count: currentFails, lastAttempt: Date.now() });

      if (currentFails >= 3) {
        triggerIDSAlert('BRUTE_FORCE', checksumRecovered, 'CRITICAL', `Cảnh báo Brute-force: Gửi chữ ký sai liên tục ${currentFails} lần`);
      } else {
        recordAuditLog(checksumRecovered, 'Xác thực đăng nhập', 'Thất bại (404)', 'Danh tính chưa đăng ký trong hệ thống (TC-02 Tampering)', 404);
      }

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

    // Bước D: Kiểm tra Bất Thường Vị Trí (Impossible Travel Detection)
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      const prevLoc = loginLocationsMap.get(checksumRecovered);
      if (prevLoc) {
        const timeDiffMinutes = (Date.now() - prevLoc.timestamp) / (1000 * 60);
        // Ước tính khoảng cách sơ bộ (Rough Haversine)
        const dLat = Math.abs(location.lat - prevLoc.lat);
        const dLng = Math.abs(location.lng - prevLoc.lng);
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;

        if (distKm > 100 && timeDiffMinutes < 15) {
          triggerIDSAlert(
            'IMPOSSIBLE_TRAVEL',
            checksumRecovered,
            'CRITICAL',
            `Impossible Travel: Khoảng cách ${distKm.toFixed(0)}km trong ${timeDiffMinutes.toFixed(1)} phút`
          );
        }
      }
      loginLocationsMap.set(checksumRecovered, { ...location, timestamp: Date.now() });
    }

    // Reset lại số lần fail khi đăng nhập thành công
    failedAttemptsMap.delete(checksumRecovered);

    // Bước E: Xác thực hoàn tất thành công -> Ghi log an ninh & cấp Token
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
// 4. API BÁO MẤT TỰ ĐỘNG BẰNG MÃ KHẨN CẤP (SELF-REVOCATION)
// ==========================================

app.post('/api/identity/self-revoke', (req, res) => {
  const { address, emergencyToken } = req.body;
  if (!address || !emergencyToken) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ ví và mã khẩn cấp' });
  }

  try {
    const checksum = getAddress(address);
    const identity = identitiesDB[checksum];
    if (!identity) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh tính số này' });
    }

    // Đối soát mã khẩn cấp
    const expectedToken = (identity.emergencyToken || '').trim().toUpperCase();
    if (expectedToken !== emergencyToken.trim().toUpperCase()) {
      triggerIDSAlert('TAMPERING', checksum, 'HIGH', 'Nhập sai mã khẩn cấp khi cố gắng thu hồi ví từ xa');
      return res.status(403).json({ success: false, message: 'Mã khẩn cấp không chính xác!' });
    }

    identity.isRevoked = true;
    recordAuditLog(checksum, 'Thu hồi chủ động từ xa', 'Thành công', 'Vô hiệu hóa danh tính bằng Emergency Token');
    return res.json({
      success: true,
      message: `Danh tính ví ${checksum} đã được khóa khẩn cấp thành công!`,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Địa chỉ ví không hợp lệ' });
  }
});

// ==========================================
// 5. KÝ PHÁT HÀNG LOẠT BẰNG MERKLE TREE (BATCH VC ISSUANCE)
// ==========================================

app.post('/api/admin/batch-issue', async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách sinh viên rỗng' });
  }

  const issuedCredentials = [];
  const leaves = [];

  for (const st of students) {
    const addr = st.address ? getAddress(st.address) : `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const studentId = st.studentId || ('225112' + Math.floor(1000 + Math.random() * 9000));
    const issueDate = new Date().toISOString();
    const expiryDate = new Date(Date.now() + 4 * 365 * 24 * 3600 * 1000).toISOString();

    // Ràng buộc mật mã giữa Khóa Ví và Thẻ VC
    const vcPayload = `${studentId}:${addr}:${issueDate}:${expiryDate}`;
    const leafHash = keccak256(toUtf8Bytes(vcPayload));
    leaves.push(leafHash);

    // Ký phát bởi University Root Issuer Wallet
    const issuerSig = await UNIVERSITY_ISSUER_WALLET.signMessage(vcPayload);

    const emergencyToken = 'EMERGENCY_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const vc = {
      id: 'vc_uth_' + studentId + '_' + Date.now(),
      type: ['VerifiableCredential', 'UTHStudentCard'],
      issuer: {
        id: 'did:ethr:polygon:' + UNIVERSITY_ISSUER_WALLET.address,
        name: 'Trường ĐH Giao thông Vận tải TP.HCM',
      },
      claims: {
        studentId,
        fullName: st.fullName || 'Sinh viên UTH',
        major: st.major || 'An toàn Thông tin',
        status: 'Active',
        issueDate,
        expiryDate,
      },
      credentialSubject: {
        id: 'did:ethr:polygon:' + addr,
        address: addr,
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: issueDate,
        verificationMethod: 'did:ethr:polygon:' + UNIVERSITY_ISSUER_WALLET.address + '#controller',
        issuerSignature: issuerSig,
      },
    };

    identitiesDB[addr] = {
      studentId,
      fullName: st.fullName || 'Sinh viên UTH',
      major: st.major || 'An toàn Thông tin',
      isRevoked: false,
      emergencyToken,
      vc,
      createdAt: Date.now(),
    };

    issuedCredentials.push(vc);
  }

  // Xây dựng cây Merkle tính toán Merkle Root
  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(keccak256(toUtf8Bytes(currentLevel[i] + currentLevel[i + 1])));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }
  const merkleRoot = currentLevel[0] || '0x00';

  recordAuditLog(
    UNIVERSITY_ISSUER_WALLET.address,
    'Ký phát VC hàng loạt',
    'Thành công',
    `Phát hành ${students.length} thẻ VC - Merkle Root: ${merkleRoot.slice(0, 10)}...`
  );

  return res.json({
    success: true,
    batchSize: students.length,
    merkleRoot,
    issuerAddress: UNIVERSITY_ISSUER_WALLET.address,
    credentials: issuedCredentials,
  });
});

// ==========================================
// 6. API QUẢN TRỊ DANH TÍNH & IDS ALERTS
// ==========================================

app.get('/api/admin/identities', (req, res) => {
  return res.json({ success: true, identities: identitiesDB });
});

app.get('/api/admin/logs', (req, res) => {
  return res.json({ success: true, logs: auditLogsDB });
});

app.get('/api/admin/alerts', (req, res) => {
  return res.json({ success: true, alerts: idsAlertsDB });
});

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

app.post('/api/identity/register', (req, res) => {
  const { address, studentId, fullName, major, emergencyToken } = req.body;
  if (!address) return res.status(400).json({ message: 'Thiếu địa chỉ ví' });

  try {
    const checksum = getAddress(address);
    identitiesDB[checksum] = {
      studentId: studentId || '2251120000',
      fullName: fullName || 'Sinh viên UTH',
      major: major || 'An toàn Thông tin',
      isRevoked: false,
      emergencyToken: emergencyToken || 'EMERGENCY_UTH_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: Date.now(),
    };
    recordAuditLog(checksum, 'Đăng ký danh tính', 'Thành công', `Cấp phát tài khoản SV: ${identitiesDB[checksum].studentId}`);
    return res.json({ success: true, message: `Đã đăng ký danh tính cho ví ${checksum}`, identity: identitiesDB[checksum] });
  } catch {
    return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
  }
});

// Trích xuất W3C DID Document chuẩn JSON-LD
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
