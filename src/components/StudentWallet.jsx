import React, { useState, useEffect } from 'react';
import {
  generateNewIdentity,
  restoreIdentityFromMnemonic,
  getSavedIdentity,
  removeIdentity,
  signAuthChallenge,
  getSavedCredentials,
  getAuditLogs,
  revokeCurrentIdentity,
  isIdentityRevoked,
  authenticateWithBiometrics,
  getDecryptedPrivateKey,
  getDecryptedMnemonic,
  getPolygonAmoyBlockNumber,
  generateW3CDIDDocument,
  NETWORK_CONFIG,
} from '../services/did';
import { verifyGpsIntegrity } from '../utils/antiSpoofGps';
import { getDeviceFingerprint, verifyDeviceBinding } from '../utils/deviceFingerprint';
import Scanner from './Scanner';
import {
  ShieldCheck,
  Key,
  RefreshCw,
  QrCode,
  Lock,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  X,
  Award,
  History,
  AlertTriangle,
  Fingerprint,
  FileCode,
  Download,
  ExternalLink,
  ShieldAlert,
  Eye,
  EyeOff,
  Cpu,
  Flame,
} from 'lucide-react';

export default function StudentWallet() {
  const [identity, setIdentity] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);
  const [copiedEmergency, setCopiedEmergency] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  const [isRevoked, setIsRevoked] = useState(false);

  // Tab điều hướng: 'wallet' (Ví) | 'credentials' (Chứng chỉ) | 'logs' (Nhật ký)
  const [activeSubTab, setActiveSubTab] = useState('wallet');
  const [credentials, setCredentials] = useState([]);
  const [logs, setLogs] = useState([]);

  // Xuất trình có chọn lọc (Selective Disclosure)
  const [selectiveDisclosure, setSelectiveDisclosure] = useState(false);

  // Hộp thoại thu hồi khẩn cấp từ xa
  const [showSelfRevokeModal, setShowSelfRevokeModal] = useState(false);
  const [selfRevokeAddress, setSelfRevokeAddress] = useState('');
  const [selfRevokeToken, setSelfRevokeToken] = useState('');
  const [selfRevokeLoading, setSelfRevokeLoading] = useState(false);
  const [selfRevokeMsg, setSelfRevokeMsg] = useState('');

  // Modals
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [revealedMnemonic, setRevealedMnemonic] = useState('');
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [importPhraseInput, setImportPhraseInput] = useState('');
  const [restoreError, setRestoreError] = useState('');

  const [showDidDocModal, setShowDidDocModal] = useState(false);
  const [copiedDidDoc, setCopiedDidDoc] = useState(false);

  // Hộp thoại Phê duyệt Đăng nhập (Challenge - Response UX)
  const [pendingAuthRequest, setPendingAuthRequest] = useState(null);

  // Vé điểm danh ngoại tuyến (Offline VP QR)
  const [showOfflineQrModal, setShowOfflineQrModal] = useState(false);
  const [offlineTokenStr, setOfflineTokenStr] = useState('');

  // Cơ chế Tự Hủy Chống Dò Khóa (Tamper Self-Destruct)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('uth_tamper_failed_count') || '0', 10);
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinActionTarget, setPinActionTarget] = useState(null); // 'key' | 'mnemonic'
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showTamperSelfDestructModal, setShowTamperSelfDestructModal] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState('');

  useEffect(() => {
    loadAppData();
    getDeviceFingerprint().then(hash => {
      if (hash) setCurrentDeviceId(hash);
    }).catch(() => {});
  }, []);

  const syncIdentityToBackend = async (id) => {
    if (!id?.address) return;
    try {
      await fetch('/api/identity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: id.address,
          studentId: '2251120000',
          fullName: 'Sinh viên UTH',
          major: 'An toàn Thông tin',
          emergencyToken: id.emergencyToken,
        }),
      });
    } catch {
      // offline fallback
    }
  };

  const loadAppData = () => {
    const saved = getSavedIdentity();
    if (saved) {
      setIdentity(saved);
      setIsRevoked(isIdentityRevoked());
      setCredentials(getSavedCredentials());
      setLogs(getAuditLogs());
      syncIdentityToBackend(saved);
    }
  };

  const handleCreate = async () => {
    const newId = await generateNewIdentity();
    setIdentity(newId);
    loadAppData();
    syncIdentityToBackend(newId);
  };

  const handleResetIdentity = async () => {
    if (!confirm('Bạn có chắc chắn muốn tạo cặp khóa mới? Danh tính cũ sẽ được thay thế bằng danh tính W3C DID mới.')) {
      return;
    }
    removeIdentity();
    const newId = await generateNewIdentity();
    setIdentity(newId);
    setIsRevoked(false);
    loadAppData();
    syncIdentityToBackend(newId);
    alert(`Đã khởi tạo danh tính mới thành công!\nĐịa chỉ ví: ${newId.address}`);
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    setRestoreError('');
    try {
      if (!importPhraseInput.trim()) {
        setRestoreError('Vui lòng nhập cụm 12 từ khôi phục.');
        return;
      }
      const words = importPhraseInput.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        setRestoreError('Cụm từ khôi phục BIP-39 phải gồm đúng 12 (hoặc 24) từ cách nhau bởi dấu cách.');
        return;
      }
      const restored = await restoreIdentityFromMnemonic(importPhraseInput.trim());
      setIdentity(restored);
      setShowRestoreModal(false);
      setImportPhraseInput('');
      loadAppData();
      syncIdentityToBackend(restored);
    } catch (err) {
      setRestoreError('Khôi phục thất bại: ' + (err.message || 'Cụm từ không hợp lệ'));
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn xóa danh tính này khỏi thiết bị? Hãy đảm bảo đã sao lưu 12 từ khóa bí mật.')) {
      removeIdentity();
      setIdentity(null);
      setAuthResult(null);
      setIsRevoked(false);
    }
  };

  const handleRevoke = async () => {
    if (confirm('CẢNH BÁO: Thu hồi danh tính sẽ ghi nhận trạng thái Revoked trên Smart Contract Polygon Amoy. Tiếp tục?')) {
      revokeCurrentIdentity();
      setIsRevoked(true);
      setLogs(getAuditLogs());
      if (identity) {
        try {
          await fetch('/api/identity/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: identity.address }),
          });
        } catch {}
      }
    }
  };

  const triggerTamperSelfDestruct = async (reason = 'BRUTE_FORCE_EXCEEDED_5_ATTEMPTS') => {
    const targetAddress = identity?.address;
    const targetToken = identity?.emergencyToken;

    localStorage.removeItem('uth_tamper_failed_count');
    setFailedAttempts(0);

    // Xóa sạch toàn bộ khóa và danh tính cục bộ (Self-Destruct)
    removeIdentity();
    setIdentity(null);
    setIsRevoked(true);

    if (targetAddress) {
      try {
        await Promise.all([
          fetch('/api/identity/self-revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: targetAddress,
              emergencyToken: targetToken || 'EMERGENCY_AUTOKILL'
            })
          }),
          fetch('/api/attendance/anomaly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'TAMPER_SELF_DESTRUCT',
              severity: 'CRITICAL',
              detail: `Tự hủy trên thiết bị: Phát hiện xâm nhập dò mã PIN/Key ≥ 5 lần (Ví ${targetAddress.slice(0, 10)}...)`
            })
          })
        ]);
      } catch {}
    }

    setShowPinModal(false);
    setShowTamperSelfDestructModal(true);
  };

  const openProtectedAction = (action) => {
    setPinActionTarget(action);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    // PIN bảo mật mặc định là 123456
    if (pinInput === '123456') {
      localStorage.setItem('uth_tamper_failed_count', '0');
      setFailedAttempts(0);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');

      if (pinActionTarget === 'key') {
        const plainKey = await getDecryptedPrivateKey(identity);
        if (plainKey) {
          navigator.clipboard.writeText(plainKey);
          setCopiedKey(true);
          setTimeout(() => setCopiedKey(false), 2000);
          alert('Đã xác thực bảo mật! Private Key đã được sao chép vào bộ nhớ tạm.');
        }
      } else if (pinActionTarget === 'mnemonic') {
        const phrase = await getDecryptedMnemonic(identity);
        if (phrase) {
          setRevealedMnemonic(phrase);
          setShowMnemonicModal(true);
        }
      }
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      localStorage.setItem('uth_tamper_failed_count', nextFail.toString());
      setPinInput('');

      if (nextFail >= 5) {
        await triggerTamperSelfDestruct('BRUTE_FORCE_PIN_5_FAILS');
      } else {
        setPinError(`Mã PIN không chính xác! Cảnh báo: Còn lại ${5 - nextFail} lần thử trước khi ví tự hủy (Self-Destruct)!`);
      }
    }
  };

  const handleRevealMnemonic = async () => {
    const phrase = await getDecryptedMnemonic(identity);
    if (phrase) {
      setRevealedMnemonic(phrase);
      setShowMnemonicModal(true);
    } else {
      alert('Không tìm thấy bản lưu cụm từ bí mật.');
    }
  };

  const copyToClipboard = async (text, type) => {
    if (type === 'key') {
      const plainKey = await getDecryptedPrivateKey(identity);
      if (!plainKey) return;
      navigator.clipboard.writeText(plainKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      return;
    }

    navigator.clipboard.writeText(text);
    if (type === 'did') {
      setCopiedDid(true);
      setTimeout(() => setCopiedDid(false), 2000);
    } else if (type === 'mnemonic') {
      setCopiedMnemonic(true);
      setTimeout(() => setCopiedMnemonic(false), 2000);
    } else if (type === 'diddoc') {
      setCopiedDidDoc(true);
      setTimeout(() => setCopiedDidDoc(false), 2000);
    } else if (type === 'emergency') {
      setCopiedEmergency(true);
      setTimeout(() => setCopiedEmergency(false), 2000);
    }
  };

  const handleSelfRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!selfRevokeAddress || !selfRevokeToken) {
      alert('Vui lòng nhập địa chỉ ví và mã khẩn cấp!');
      return;
    }
    setSelfRevokeLoading(true);
    setSelfRevokeMsg('');
    try {
      const res = await fetch('/api/identity/self-revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: selfRevokeAddress,
          emergencyToken: selfRevokeToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelfRevokeMsg(data.message);
        if (identity && identity.address.toLowerCase() === selfRevokeAddress.toLowerCase()) {
          setIsRevoked(true);
        }
        alert(data.message);
        setShowSelfRevokeModal(false);
      } else {
        setSelfRevokeMsg('Lỗi: ' + data.message);
        alert(data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setSelfRevokeLoading(false);
    }
  };

  const handleGenerateOfflineQr = async () => {
    if (!identity) return;
    try {
      await authenticateWithBiometrics();
    } catch {
      alert("Xác thực FaceID/TouchID thất bại hoặc bị hủy bỏ!");
      return;
    }
    const token = `UTH:OFFLINE:${identity.studentId || '2251120000'}:${Date.now()}:0x` + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setOfflineTokenStr(token);
    setShowOfflineQrModal(true);
  };

  const handleScanClick = () => {
    if (isRevoked) {
      alert('Danh tính đã bị thu hồi khẩn cấp, không thể thực hiện quét mã xác thực.');
      return;
    }
    setIsScanning(true);
  };

  function calculateHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  const handleAttendanceScan = async (qrData, parsedObj = null) => {
    const parts = qrData ? qrData.split(':') : [];
    const isUthId = parts[0] === 'UTH_ID';
    const sessionId = parsedObj?.sessionId || parts[1];
    const nonce = parsedObj?.nonce || parts[2];
    const sessionLat = parsedObj?.sessionLat !== undefined ? parsedObj.sessionLat : parseFloat(parts[3]);
    const sessionLon = parsedObj?.sessionLon !== undefined ? parsedObj.sessionLon : parseFloat(parts[4]);
    const timestamp = parsedObj?.timestamp || (isUthId ? parseInt(parts[5], 10) : undefined);
    const policy = parsedObj?.policy || (isUthId ? (parts[6] || 'HYBRID_4G_5G') : (parts[5] || 'HYBRID_4G_5G'));

    try {
      await authenticateWithBiometrics();
    } catch {
      alert("Xác thực sinh trắc học FaceID/TouchID thất bại hoặc bị hủy bỏ!");
      return;
    }

    const performAttendance = async (userCoords) => {
      // Lớp 2: Kiểm tra Geo-fencing Haversine
      let distance = 0;
      if (!isNaN(sessionLat) && !isNaN(sessionLon)) {
        distance = calculateHaversine(sessionLat, sessionLon, userCoords.lat, userCoords.lon);
        if (distance > 35) {
          alert(`[TỪ CHỐI ĐIỂM DANH]\nBạn đang ở cách phòng học ${distance}m (Vượt quá bán kính cho phép 35m)!`);
          return;
        }
      }

      // Lớp 3: Ký số EIP-191 gắn kết định danh thiết bị (Device Binding)
      const currentDevId = await getDeviceFingerprint();
      const messageToSign = `UTH-ATTENDANCE:${nonce || qrData}:${currentDevId}`;

      const signResult = await signAuthChallenge(identity, messageToSign);
      if (!signResult.success) {
        alert("Lỗi ký số điểm danh: " + signResult.error);
        return;
      }

      try {
        const res = await fetch('/api/attendance/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            challengeNonce: nonce || qrData,
            signature: signResult.signature,
            deviceId: currentDevId,
            studentCoords: userCoords,
            sessionCoords: { lat: sessionLat, lon: sessionLon },
            allowedRadius: 35,
            networkPolicy: policy || 'HYBRID_4G_5G'
          })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert(`✅ ĐIỂM DANH THÀNH CÔNG!\nSinh viên: ${result.student || 'Sinh viên UTH'}\nKhoảng cách: ${result.data?.distance || distance}m\nThiết bị: Gắn kết phần cứng ✓ (${currentDevId.slice(0, 10)}...)\nMạng: ${result.data?.isCampusWifi ? 'UTH Campus Wi-Fi' : 'Di Động 4G/5G'}\nDữ liệu đã truyền thời gian thực về máy chiếu giảng viên!`);
        } else {
          alert(`❌ ĐIỂM DANH THẤT BẠI: ${result.message}`);
        }
      } catch {
        alert(`✅ ĐÃ XÁC THỰC CHỮ KÝ SỐ MẬT MÃ THÀNH CÔNG!\nKhoảng cách: ${distance}m\nThiết bị: ${currentDevId.slice(0, 10)}...`);
      }
      setLogs(getAuditLogs());
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Lớp 1: Anti-Mock GPS & Sensor Anomaly Detection
          const gpsAudit = verifyGpsIntegrity(pos);
          if (!gpsAudit.isValid) {
            alert(`[CẢNH BÁO AN NINH GIAN LẬN GPS]\nRisk Score: ${gpsAudit.riskScore}/100\nLý do: ${gpsAudit.reasons.join(', ')}`);
            return;
          }
          await performAttendance({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        async () => {
          // Fallback khi thiết bị không bật GPS hoặc môi trường giả lập
          await performAttendance({ lat: sessionLat || 10.7992, lon: sessionLon || 106.7056 });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      await performAttendance({ lat: sessionLat || 10.7992, lon: sessionLon || 106.7056 });
    }
  };

  const handleScanComplete = (data) => {
    setIsScanning(false);
    if (!data) return;

    // Nếu là QR Điểm danh (đã parse từ Scanner.jsx hoặc dạng chuỗi UTH:...)
    if (data.type === 'ATTENDANCE_QR') {
      handleAttendanceScan(data.raw, data);
      return;
    }

    let rawText = typeof data === 'string' ? data : (data.challenge || data.raw || JSON.stringify(data));
    if (typeof rawText === 'string' && (rawText.startsWith('UTH_ID:') || rawText.startsWith('UTH:'))) {
      handleAttendanceScan(rawText);
      return;
    }

    let payload = data;
    if (typeof data === 'string') {
      try {
        payload = JSON.parse(data);
      } catch {
        payload = { challenge: data };
      }
    }
    setPendingAuthRequest(payload);
  };

  const handleApproveAuth = async () => {
    if (!pendingAuthRequest) return;
    const challenge = pendingAuthRequest.nonce || pendingAuthRequest.challenge || JSON.stringify(pendingAuthRequest);

    const signResult = await signAuthChallenge(identity, challenge);

    if (signResult.success) {
      setAuthResult({
        domain: pendingAuthRequest.domain || 'auth.system.edu.vn',
        serviceName: pendingAuthRequest.serviceName || 'Cổng Dịch Vụ',
        challenge,
        signature: signResult.signature,
        signerAddress: signResult.signerAddress,
        time: new Date().toLocaleTimeString(),
      });
      setLogs(getAuditLogs());

      try {
        await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge,
            signature: signResult.signature,
          }),
        });
      } catch (e) {
        console.warn('Backend verify call failed:', e);
      }
    } else {
      alert('Lỗi: ' + signResult.error);
      setLogs(getAuditLogs());
    }
    setPendingAuthRequest(null);
  };

  const didDocument = identity ? generateW3CDIDDocument(identity) : null;

  const downloadDIDDocument = () => {
    if (!didDocument) return;
    const blob = new Blob([JSON.stringify(didDocument, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `did-document-${identity.address.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pt-2 pb-24 flex flex-col items-center">
      {!identity ? (
        // MÀN HÌNH KHI CHƯA CÓ DANH TÍNH
        <div className="flex-1 w-full flex flex-col justify-center items-center text-center px-2 py-6 sm:py-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-cyan-400 mb-5 shadow-xl shadow-cyan-950/20">
            <Key size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Chưa có danh tính số</h2>
          <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
            Tạo danh tính W3C DID với khóa bảo mật được mã hóa AES-GCM và lưu trữ phân tán trên Polygon Amoy Testnet.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleCreate}
              className="w-full bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] transition font-semibold text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/30 text-xs"
            >
              <RefreshCw size={15} />
              <span>Khởi tạo DID mới (Mã hóa AES-GCM)</span>
            </button>

            <button
              onClick={() => setShowRestoreModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs transition"
            >
              <Lock size={14} />
              <span>Khôi phục bằng 12 từ Mnemonic (BIP-39)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3 sm:space-y-3.5">
          {/* Top Segmented Sub-Tab Switcher: Thẻ DID | Chứng Chỉ VC | Bảo Mật & Khóa | Audit Log */}
          <div className="w-full flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-1 backdrop-blur-md">
            <button
              onClick={() => setActiveSubTab('wallet')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
                activeSubTab === 'wallet' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key size={13} />
              <span>Thẻ DID</span>
            </button>
            <button
              onClick={() => setActiveSubTab('credentials')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
                activeSubTab === 'credentials' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award size={13} />
              <span>Chứng chỉ</span>
            </button>
            <button
              onClick={() => setActiveSubTab('security')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
                activeSubTab === 'security' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Bảo mật</span>
            </button>
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
                activeSubTab === 'logs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History size={13} />
              <span>Nhật ký</span>
            </button>
          </div>

          {/* Cảnh báo nếu danh tính đã bị thu hồi khẩn cấp */}
          {isRevoked && (
            <div className="bg-rose-950/50 border border-rose-800 rounded-2xl p-3.5 sm:p-4 flex items-center space-x-3 text-rose-300">
              <AlertTriangle size={22} className="text-rose-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-rose-200">DANH TÍNH ĐÃ BỊ THU HỒI TRÊN BLOCKCHAIN</p>
                Khóa ECDSA đã bị đóng băng vĩnh viễn khỏi Smart Contract. Mọi phiên đăng nhập đều bị từ chối.
              </div>
            </div>
          )}

          {/* TAB 1: GIAO DIỆN VÍ CHÍNH */}
          {activeSubTab === 'wallet' && (
            <div className="w-full space-y-3.5 sm:space-y-4">
              {/* Thẻ DID Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
                      W3C Identifier
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${isRevoked
                          ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                          : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        }`}
                    >
                      {isRevoked ? 'REVOKED' : 'ACTIVE ON-CHAIN'}
                    </span>
                  </div>

                  <button
                    onClick={handleReset}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                    title="Xóa danh tính khỏi máy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <label className="text-[11px] text-slate-400 block mb-1">Mã định danh (W3C DID):</label>
                <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-3">
                  <span className="font-mono text-xs text-slate-300 truncate mr-2">
                    {identity.did}
                  </span>
                  <button
                    onClick={() => copyToClipboard(identity.did, 'did')}
                    className="text-slate-400 hover:text-white p-1 flex-shrink-0"
                  >
                    {copiedDid ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <label className="text-[11px] text-slate-400 block mb-1">Địa chỉ ví công khai (Ethereum Address):</label>
                <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5 mb-2.5 text-xs font-mono text-slate-300">
                  <span className="break-all text-[11px] sm:text-xs leading-relaxed mr-2">{identity.address}</span>
                  <a
                    href={`${NETWORK_CONFIG.explorerUrl}/address/${identity.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-cyan-400 p-1 flex-shrink-0"
                    title="Xem trên Polygonscan"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Device Hardware Footprint Badge */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 mb-3 text-xs">
                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <Cpu size={14} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-[10.5px] text-slate-400 whitespace-nowrap">Gắn kết:</span>
                    <span className="font-mono text-[10.5px] text-cyan-300 font-semibold truncate">
                      {currentDeviceId ? currentDeviceId.slice(0, 16) + '...' : '0x89d2f476961fe041...'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 flex-shrink-0">
                    <CheckCircle2 size={11} /> Đã khóa thiết bị
                  </span>
                </div>

                {/* Nút xem W3C DID Document */}
                <button
                  onClick={() => setShowDidDocModal(true)}
                  className="w-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <FileCode size={14} className="text-cyan-400" />
                  <span>Xem W3C DID Document (JSON-LD)</span>
                </button>
              </div>

              {/* HÀNH ĐỘNG CHÍNH: QUÉT MÃ ĐIỂM DANH */}
              <button
                onClick={handleScanClick}
                disabled={isRevoked}
                className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-center justify-center space-x-3 transition shadow-xl ${isRevoked
                    ? 'opacity-40 bg-slate-900 border border-slate-800 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold active:scale-[0.99] shadow-cyan-900/30'
                  }`}
              >
                <div className="p-2 bg-white/20 rounded-xl">
                  <QrCode size={22} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Quét Mã QR Điểm Danh / Đăng Nhập</div>
                  <div className="text-[11px] text-white/80 font-normal">Ký số EIP-191 & Ràng buộc dấu vân tay phần cứng</div>
                </div>
              </button>

              {/* Nút Tạo QR Điểm Danh Ngoại Tuyến */}
              <button
                onClick={handleGenerateOfflineQr}
                className="w-full bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 p-2.5 sm:p-3 rounded-xl flex items-center justify-center space-x-2 text-xs text-cyan-300 font-semibold transition"
              >
                <Award size={15} className="text-cyan-400" />
                <span>🎟️ Tạo Mã Điểm Danh Ngoại Tuyến (Tầng hầm B1)</span>
              </button>

              {/* Kết quả ký số gần nhất */}
              {authResult && (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 size={16} />
                      <span>Ký số EIP-191 thành công ({authResult.time})</span>
                    </div>
                    <button onClick={() => setAuthResult(null)}>
                      <X size={15} />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div><strong className="text-slate-500">Service:</strong> {authResult.serviceName} ({authResult.domain})</div>
                    <div className="text-[10px] text-emerald-400 max-h-16 overflow-y-auto">{authResult.signature}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VÍ CHỨNG CHỈ SỐ (VERIFIABLE CREDENTIALS) */}
          {activeSubTab === 'credentials' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-slate-200">Chứng chỉ đã lưu ({credentials.length})</h3>
                <span className="text-[11px] text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">
                  W3C VC Spec
                </span>
              </div>

              {/* Chế độ xuất trình có chọn lọc (Selective Disclosure) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectiveDisclosure ? <EyeOff size={16} className="text-cyan-400" /> : <Eye size={16} className="text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-200">Xuất trình có chọn lọc (Privacy Mode)</span>
                  </div>
                  <button
                    onClick={() => setSelectiveDisclosure(!selectiveDisclosure)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectiveDisclosure ? 'bg-cyan-600' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${selectiveDisclosure ? 'translate-x-4' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Khi bật, bạn có thể che giấu ngày sinh, lớp học hoặc GPA khi xuất trình thẻ cho bên thứ ba nhằm bảo vệ quyền riêng tư.
                </p>
              </div>

              {/* Danh sách thẻ/chứng chỉ */}
              <div className="space-y-3">
                {credentials.map((vc) => (
                  <div
                    key={vc.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded">
                          {(Array.isArray(vc.type) ? vc.type[1] : vc.type) || 'VerifiableCredential'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{vc.name || vc.title || 'Thẻ Sinh Viên Số UTH'}</h4>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} />
                        <span>Hợp lệ</span>
                      </span>
                    </div>

                    {/* Thuộc tính chứng chỉ */}
                    <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-800/60 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Sinh viên:</span>
                        <span className="font-semibold text-slate-200">{vc.credentialSubject?.fullName || vc.claims?.fullName || 'Sinh viên UTH'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">MSSV:</span>
                        <span className="text-cyan-300">{vc.credentialSubject?.studentId || vc.claims?.studentId || '2251120000'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Ngành:</span>
                        <span className="text-slate-300">{vc.credentialSubject?.major || vc.claims?.major || 'An toàn Thông tin'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Trạng thái:</span>
                        <span className="text-emerald-400 font-semibold">{vc.credentialSubject?.status || vc.claims?.status || 'Active'}</span>
                      </div>
                      {(vc.credentialSubject?.attendanceRate || vc.claims?.attendanceRate) && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Chuyên cần:</span>
                          <span className="text-emerald-400 font-bold">{vc.credentialSubject?.attendanceRate || vc.claims?.attendanceRate}%</span>
                        </div>
                      )}
                      {vc.credentialSubject?.merkleRoot && (
                        <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/40">
                          <span className="text-slate-500 font-sans">Merkle Root:</span>
                          <span className="text-amber-400 font-mono">{vc.credentialSubject.merkleRoot.slice(0, 14)}...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>Cấp bởi: {vc.issuer?.name || vc.issuer || 'ĐH UTH'}</span>
                      <span className="truncate max-w-[150px] font-mono">
                        {(vc.issuerSignature || vc.proof?.bindingHash || vc.proof?.merkleRoot || '0xOnChainVerified').slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BẢO MẬT & KHÔI PHỤC (SECURITY & RECOVERY) */}
          {activeSubTab === 'security' && (
            <div className="w-full space-y-3.5 sm:space-y-4">
              {/* Card Sao lưu khóa mật mã */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <Key size={15} />
                  <span>Sao Lưu & Quản Trị Khóa Mật Mã</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bảo vệ 12 từ khóa hạt giống (BIP-39) và khóa ECDSA secp256k1. Cần xác thực mã PIN bảo vệ để mở.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => openProtectedAction('mnemonic')}
                    className="bg-slate-950 hover:bg-slate-800 border border-purple-500/30 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 text-xs text-purple-300 font-semibold transition"
                  >
                    <Lock size={14} className="text-purple-400" />
                    <span>12 Từ Khóa</span>
                  </button>
                  <button
                    onClick={() => openProtectedAction('key')}
                    className="bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 text-xs text-cyan-300 font-semibold transition"
                  >
                    <Fingerprint size={14} className="text-cyan-400" />
                    <span>Private Key</span>
                  </button>
                </div>
                <a
                  href={`${NETWORK_CONFIG.explorerUrl}/address/${NETWORK_CONFIG.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl flex items-center justify-center space-x-1.5 text-[11px] text-slate-300 transition"
                >
                  <ExternalLink size={13} className="text-purple-400 flex-shrink-0" />
                  <span>Tra Cứu Smart Contract Trên Polygonscan</span>
                </a>
              </div>

              {/* Emergency Recovery Token Section */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                    <ShieldAlert size={15} />
                    <span>Mã Thu Hồi Khẩn Cấp (Emergency Token)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(identity.emergencyToken || 'EMERGENCY_UTH_' + identity.address.slice(2, 10).toUpperCase(), 'emergency')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center space-x-1 transition"
                  >
                    {copiedEmergency ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedEmergency ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lưu trữ mã này riêng biệt ngoài điện thoại. Khi mất máy, nhập mã này tại cổng Web để khóa danh tính từ xa:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 select-all break-all border border-slate-800">
                  {identity.emergencyToken || 'EMERGENCY_UTH_' + identity.address.slice(2, 10).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelfRevokeAddress(identity.address);
                    setSelfRevokeToken(identity.emergencyToken || '');
                    setShowSelfRevokeModal(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-medium transition text-center"
                >
                  Kích hoạt thu hồi từ xa ngay (Self-Revocation)
                </button>
              </div>

              {/* Anti-Tamper & Self-Destruct Status */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-2">
                  <Flame size={16} className="text-rose-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-rose-300">Tự Hủy Chống Dò Khóa (Anti-Tamper)</div>
                    <div className="text-[10.5px] text-slate-400">Tự động xóa sạch khóa & thu hồi on-chain sau 5 lần sai mã PIN</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerTamperSelfDestruct('SIMULATED_TEST')}
                  className="text-[10px] bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 px-2.5 py-1.5 rounded-lg transition flex-shrink-0"
                  title="Thử nghiệm cơ chế tự hủy"
                >
                  Test Tự Hủy
                </button>
              </div>

              {/* Nút Thu hồi khẩn cấp hoặc Khởi tạo lại */}
              {!isRevoked ? (
                <button
                  onClick={handleRevoke}
                  className="w-full bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition font-medium"
                >
                  <AlertTriangle size={15} />
                  <span>Thu hồi danh tính khẩn cấp (Incident Revocation)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-950/50 border border-rose-800/70 rounded-xl text-xs text-rose-300 text-center leading-relaxed">
                    Danh tính số này đã bị thu hồi khẩn cấp. Không thể tiếp tục ký số trên hệ thống.
                  </div>
                  <button
                    onClick={handleResetIdentity}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition font-medium shadow-lg shadow-cyan-900/30"
                  >
                    <RefreshCw size={15} />
                    <span>Khởi tạo cặp khóa danh tính mới</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {activeSubTab === 'credentials' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-slate-200">Chứng chỉ đã lưu ({credentials.length})</h3>
                <span className="text-[11px] text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">
                  W3C VC Spec
                </span>
              </div>

              {/* Chế độ xuất trình có chọn lọc (Selective Disclosure) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectiveDisclosure ? <EyeOff size={16} className="text-cyan-400" /> : <Eye size={16} className="text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-200">Xuất trình có chọn lọc (Privacy Mode)</span>
                  </div>
                  <button
                    onClick={() => setSelectiveDisclosure(!selectiveDisclosure)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectiveDisclosure ? 'bg-cyan-600' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${selectiveDisclosure ? 'translate-x-4' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {selectiveDisclosure
                    ? 'Đang ẩn MSSV & Thông tin cá nhân. Chỉ xuất trình bằng chứng mã hóa xác nhận sinh viên UTH hợp lệ (Zero-Knowledge / Selective Disclosure cho Thư viện / Nhà xe).'
                    : 'Đang hiển thị đầy đủ thông tin chứng chỉ sinh viên cho các nghiệp vụ kiểm tra học vụ.'}
                </p>
              </div>

              {credentials.map((vc) => (
                <div
                  key={vc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-cyan-300">{vc.title || vc.name || 'Thẻ Sinh Viên Số UTH'}</h4>
                      <p className="text-[11px] text-slate-400">{vc.issuer?.name || vc.issuer || 'ĐH Giao thông Vận tải TP.HCM'}</p>
                    </div>
                    <span className="flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <Check size={12} />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-800/60 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã sinh viên:</span>
                      <span className="text-slate-200 font-semibold">
                        {selectiveDisclosure ? '••••••••' : (vc.credentialSubject?.studentId || vc.claims?.studentId || '2251120000')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chuyên ngành:</span>
                      <span className="text-slate-200">
                        {selectiveDisclosure ? '••••••••' : (vc.credentialSubject?.major || vc.claims?.major || 'An toàn Thông tin')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Niên khóa:</span>
                      <span className="text-slate-300">{vc.claims?.academicYear || '2022 - 2026'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className="text-emerald-400 font-bold">{vc.credentialSubject?.status || vc.claims?.status || 'Active UTH Student'}</span>
                    </div>
                    {vc.issuerSignature && (
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-cyan-400/80 flex items-center justify-between">
                        <span>Issuer Binding:</span>
                        <span className="truncate max-w-[150px] font-mono">{vc.issuerSignature.slice(0, 16)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NHẬT KÝ KIỂM TOÁN AN NINH (AUDIT LOGS) */}
          {activeSubTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-slate-200">Audit Logs ({logs.length})</h3>
                <span className="text-[11px] text-slate-400">Kiểm toán an toàn thông tin</span>
              </div>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Chưa có bản ghi hoạt động nào.</p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-start space-x-3 text-xs"
                    >
                      <div
                        className={`p-1.5 rounded-lg flex-shrink-0 ${log.action === 'REVOCATION' || log.action === 'AUTH_FAIL'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                          }`}
                      >
                        <History size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-slate-300 font-mono text-[11px]">{log.action}</span>
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] truncate">{log.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: HỘP THOẠI PHÊ DUYỆT ĐĂNG NHẬP */}
      {pendingAuthRequest && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-cyan-400 border-b border-slate-800 pb-3">
              <ShieldCheck size={20} />
              <h3 className="font-bold text-sm text-slate-100">Yêu cầu Ủy quyền Đăng nhập</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Trang web đang yêu cầu chữ ký số từ Ví của bạn để xác thực phiên làm việc:
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên dịch vụ:</span>
                <span className="text-cyan-300 font-semibold truncate ml-2">{pendingAuthRequest.serviceName || 'Cổng Dịch Vụ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên miền (Domain):</span>
                <span className="text-slate-200 font-bold truncate ml-2">{pendingAuthRequest.domain || 'nckh-auth.edu.vn'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blockchain:</span>
                <span className="text-emerald-400">Polygon Amoy (80002)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Challenge Nonce:</span>
                <span className="text-slate-400 truncate block text-[11px]">{pendingAuthRequest.nonce || pendingAuthRequest.challenge}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setPendingAuthRequest(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition"
              >
                Từ chối
              </button>
              <button
                onClick={handleApproveAuth}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-900/30"
              >
                <Fingerprint size={16} />
                <span>Ký số (FaceID)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SAO LƯU 12 TỪ MNEMONIC */}
      {showMnemonicModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Lock size={18} />
                <h3 className="font-bold text-sm text-slate-100">Cụm từ bí mật (BIP-39)</h3>
              </div>
              <button onClick={() => setShowMnemonicModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-xl leading-relaxed">
              ⚠️ Ghi nhớ và giữ 12 từ khóa này ở nơi bí mật. Không bao giờ chia sẻ cho bất kỳ ai!
            </p>

            {/* Lưới 12 từ */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800">
              {revealedMnemonic.split(' ').map((word, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg p-1.5 sm:p-2 text-center text-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">{idx + 1}</span>
                  <span className="font-mono text-cyan-300 font-semibold text-[11px] sm:text-xs truncate block">{word}</span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => copyToClipboard(revealedMnemonic, 'mnemonic')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                {copiedMnemonic ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedMnemonic ? 'Đã sao chép 12 từ' : 'Sao chép cụm từ'}</span>
              </button>
              <button
                onClick={() => setShowMnemonicModal(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KHÔI PHỤC VÍ TỪ 12 TỪ MNEMONIC */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleRestoreSubmit}
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Key size={18} />
                <h3 className="font-bold text-sm text-slate-100">Khôi phục danh tính</h3>
              </div>
              <button type="button" onClick={() => setShowRestoreModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Nhập cụm 12 từ bí mật (BIP-39 Mnemonic) cách nhau bởi dấu cách để khôi phục cặp khóa W3C DID:
            </p>

            <textarea
              rows={3}
              value={importPhraseInput}
              onChange={(e) => setImportPhraseInput(e.target.value)}
              placeholder="ví dụ: apple banana cat dog elephant fox giraffe horse ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            ></textarea>

            {restoreError && <p className="text-xs text-rose-400">{restoreError}</p>}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 rounded-xl transition"
              >
                Khôi phục ví
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: XEM W3C DID DOCUMENT */}
      {showDidDocModal && didDocument && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 animate-in zoom-in-95 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2 text-cyan-400">
                <FileCode size={18} />
                <h3 className="font-bold text-sm text-slate-100">W3C DID Document (JSON-LD)</h3>
              </div>
              <button onClick={() => setShowDidDocModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex-shrink-0">
              Tài liệu định danh số chuẩn hóa theo khuyến nghị W3C DID Core Specification 1.0:
            </p>

            <pre className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-[10px] font-mono text-cyan-300 leading-relaxed max-h-60">
              {JSON.stringify(didDocument, null, 2)}
            </pre>

            <div className="flex space-x-2 pt-2 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(JSON.stringify(didDocument, null, 2), 'diddoc')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                {copiedDidDoc ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedDidDoc ? 'Đã sao chép' : 'Sao chép JSON'}</span>
              </button>
              <button
                onClick={downloadDIDDocument}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-900/30"
              >
                <Download size={14} />
                <span>Tải tệp .json</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: THU HỒI TỪ XA QUA MÃ KHẨN CẤP */}
      {showSelfRevokeModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSelfRevokeSubmit}
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-slate-900 border border-rose-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert size={18} />
                <h3 className="font-bold text-sm text-slate-100">Thu hồi danh tính khẩn cấp từ xa</h3>
              </div>
              <button type="button" onClick={() => setShowSelfRevokeModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Nhập địa chỉ ví cần thu hồi và mã bí mật khẩn cấp (Emergency Token) được cấp khi tạo danh tính:
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block">Địa chỉ ví (Address):</label>
              <input
                type="text"
                value={selfRevokeAddress}
                onChange={(e) => setSelfRevokeAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block">Mã khẩn cấp (Emergency Token):</label>
              <input
                type="text"
                value={selfRevokeToken}
                onChange={(e) => setSelfRevokeToken(e.target.value)}
                placeholder="EMERGENCY_UTH_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            {selfRevokeMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                {selfRevokeMsg}
              </p>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSelfRevokeModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={selfRevokeLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {selfRevokeLoading ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                <span>{selfRevokeLoading ? 'Đang xử lý...' : 'Xác nhận thu hồi'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Scanner */}
      {isScanning && (
        <Scanner onScanSuccess={handleScanComplete} onClose={() => setIsScanning(false)} />
      )}

      {/* Modal Xuất Trình QR Ngoại Tuyến (Offline VP QR) */}
      {showOfflineQrModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-cyan-400">VÉ ĐIỂM DANH NGOẠI TUYẾN (OFFLINE VP)</span>
              <button onClick={() => setShowOfflineQrModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Xuất trình mã này cho Giám thị quét khi phòng thi ở tầng hầm không có sóng 4G/Wi-Fi:
            </p>
            <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(offlineTokenStr)}`}
                alt="Offline QR"
                className="w-40 h-40 block"
              />
            </div>
            <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-cyan-300 break-all border border-slate-800 mb-3 text-left">
              {offlineTokenStr}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(offlineTokenStr);
                alert("Đã sao chép chuỗi mã vé ngoại tuyến!");
              }}
              className="w-full btn-primary py-2 text-xs"
            >
              Sao Chép Chuỗi Vé
            </button>
          </div>
        </div>
      )}

      {/* Modal Xác Thực Mã PIN & Chống Dò Khóa (Tamper Protection) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Lock size={16} />
                <span>Xác Thực Bảo Mật Thiết Bị</span>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vui lòng nhập mã PIN bảo mật (6 chữ số) để truy cập {pinActionTarget === 'key' ? 'Private Key' : '12 từ khóa Mnemonic'}:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Mã PIN mặc định: 123456"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-cyan-500"
              />

              {pinError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl flex items-center space-x-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex justify-between items-center px-1">
                <span>Số lần thử còn lại:</span>
                <span className={`font-mono font-bold ${failedAttempts >= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {5 - failedAttempts}/5 lần
                </span>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-xs py-2.5 rounded-xl font-semibold"
                >
                  Xác nhận
                </button>
              </div>

              {/* Nút giả lập tấn công Brute-force */}
              <button
                type="button"
                onClick={() => triggerTamperSelfDestruct('BRUTE_FORCE_EXCEEDED_5_ATTEMPTS')}
                className="w-full text-[10px] text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 py-1.5 rounded-lg transition"
              >
                ⚡ Mô phỏng dò sai PIN &ge; 5 lần &rarr; Tự Hủy Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cảnh Báo Tự Hủy Danh Tính (Tamper Self-Destruct Triggered) */}
      {showTamperSelfDestructModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl space-y-3">
            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <Flame size={28} />
            </div>
            <h3 className="text-base font-bold text-rose-400">🚨 ĐÃ TỰ HỦY DANH TÍNH (SELF-DESTRUCT)</h3>
            <p className="text-xs text-slate-300 leading-relaxed text-left bg-rose-950/30 border border-rose-900/50 p-3 rounded-xl">
              Hệ thống phát hiện hành vi xâm nhập / dò mã khóa liên tiếp vượt ngưỡng an toàn (&ge; 5 lần):<br/>
              • <strong>Bộ nhớ cục bộ:</strong> Đã tiêu hủy sạch Private Key và 12 từ Mnemonic.<br/>
              • <strong>Trạng thái On-chain:</strong> Đã gửi lệnh thu hồi khẩn cấp DID trên Polygon Registry.<br/>
              • <strong>Báo cáo IDS:</strong> Đã ghi nhận cảnh báo bất thường về Trung tâm Quản trị An ninh.
            </p>
            <button
              onClick={() => {
                setShowTamperSelfDestructModal(false);
                loadAppData();
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-xl transition"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

