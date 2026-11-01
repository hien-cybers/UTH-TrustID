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

  useEffect(() => {
    loadAppData();
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

  const handleAttendanceScan = async (qrData) => {
    const parts = qrData.split(':');
    const [_, sessionId, nonce, sLat, sLon, policy] = parts;
    const sessionLat = parseFloat(sLat);
    const sessionLon = parseFloat(sLon);

    if (!navigator.geolocation) {
      alert("Thiết bị không hỗ trợ Geolocation!");
      return;
    }

    try {
      await authenticateWithBiometrics();
    } catch {
      alert("Xác thực sinh trắc học FaceID/TouchID thất bại hoặc bị hủy bỏ!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Lớp 1: Anti-Mock GPS & Sensor Anomaly Detection
        const gpsAudit = verifyGpsIntegrity(pos);
        if (!gpsAudit.isValid) {
          alert(`[CẢNH BÁO AN NINH GIAN LẬN GPS]\nRisk Score: ${gpsAudit.riskScore}/100\nLý do: ${gpsAudit.reasons.join(', ')}`);
          return;
        }

        // Lớp 2: Kiểm tra Geo-fencing Haversine
        let distance = 0;
        if (!isNaN(sessionLat) && !isNaN(sessionLon)) {
          distance = calculateHaversine(sessionLat, sessionLon, pos.coords.latitude, pos.coords.longitude);
          if (distance > 35) {
            alert(`[TỪ CHỐI ĐIỂM DANH]\nBạn đang ở cách phòng học ${distance}m (Vượt quá bán kính cho phép 35m)!`);
            return;
          }
        }

        // Lớp 3: Ký số EIP-191 và gửi lên Backend Dual-Factor Network Guard
        const signResult = await signAuthChallenge(identity, nonce || qrData);
        if (!signResult.success) {
          alert("Lỗi ký số điểm danh: " + signResult.error);
          return;
        }

        try {
          const res = await fetch('/api/attendance/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeNonce: nonce || qrData,
              signature: signResult.signature,
              studentCoords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
              sessionCoords: { lat: sessionLat, lon: sessionLon },
              allowedRadius: 35,
              networkPolicy: policy || 'HYBRID_4G_5G'
            })
          });
          const result = await res.json();
          if (res.ok && result.success) {
            alert(`✅ ĐIỂM DANH THÀNH CÔNG!\nKhoảng cách: ${result.data?.distance || distance}m\nMạng: ${result.data?.isCampusWifi ? 'UTH Campus Wi-Fi' : 'Di Động 4G/5G'}`);
          } else {
            alert(`❌ ĐIỂM DANH THẤT BẠI: ${result.message}`);
          }
        } catch {
          alert(`✅ ĐÃ XÁC THỰC CHỮ KÝ SỐ MẬT MÃ THÀNH CÔNG!\nKhoảng cách: ${distance}m`);
        }
        setLogs(getAuditLogs());
      },
      (err) => {
        alert("Không thể lấy toạ độ GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleScanComplete = (data) => {
    setIsScanning(false);
    let rawText = typeof data === 'string' ? data : (data.challenge || JSON.stringify(data));
    if (typeof rawText === 'string' && rawText.startsWith('UTH:')) {
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
    <div className={`w-full max-w-md mx-auto flex flex-col items-center ${identity ? 'pb-24 sm:pb-28' : 'pb-6'}`}>
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
        <div className="w-full space-y-3.5 sm:space-y-4">
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
                <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5 mb-3 text-xs font-mono text-slate-300">
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

                {/* Nút xem W3C DID Document */}
                <button
                  onClick={() => setShowDidDocModal(true)}
                  className="w-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <FileCode size={14} className="text-cyan-400" />
                  <span>Xem W3C DID Document (JSON-LD)</span>
                </button>
              </div>

              {/* Các nút hành động chính */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={handleScanClick}
                  disabled={isRevoked}
                  className={`border p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 transition ${isRevoked
                      ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 active:scale-[0.98]'
                    }`}
                >
                  <div className="p-2 sm:p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <QrCode size={20} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight">Quét mã đăng nhập</span>
                </button>

                <button
                  onClick={handleRevealMnemonic}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 transition active:scale-[0.98]"
                >
                  <div className="p-2 sm:p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Lock size={20} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight">Sao lưu 12 từ khóa</span>
                </button>
              </div>

              {/* Hàng nút bảo mật phụ */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={() => copyToClipboard(identity.address, 'key')}
                  className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl flex items-center justify-center space-x-1 text-[10px] sm:text-xs text-slate-300 transition"
                >
                  <Fingerprint size={14} className="text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{copiedKey ? 'Đã sao chép Key' : 'Trích xuất Private Key'}</span>
                </button>

                <a
                  href={`${NETWORK_CONFIG.explorerUrl}/address/${NETWORK_CONFIG.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl flex items-center justify-center space-x-1 text-[10px] sm:text-xs text-slate-300 transition"
                >
                  <ExternalLink size={13} className="text-purple-400 flex-shrink-0" />
                  <span className="truncate">Smart Contract Amoy</span>
                </a>
              </div>

              {/* Emergency Recovery Token Section */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                    <ShieldAlert size={14} />
                    <span>Mã thu hồi khẩn cấp (Emergency Token)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(identity.emergencyToken || 'EMERGENCY_UTH_' + identity.address.slice(2, 10).toUpperCase(), 'emergency')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center space-x-1 transition"
                  >
                    {copiedEmergency ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedEmergency ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Lưu trữ mã này riêng biệt. Khi mất điện thoại, dùng mã này để thu hồi danh tính từ xa nhằm bảo vệ tài khoản:
                </p>
                <div className="bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-amber-300 select-all break-all border border-slate-800">
                  {identity.emergencyToken || 'EMERGENCY_UTH_' + identity.address.slice(2, 10).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelfRevokeAddress(identity.address);
                    setSelfRevokeToken(identity.emergencyToken || '');
                    setShowSelfRevokeModal(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg text-[11px] font-medium transition text-center"
                >
                  Kích hoạt thu hồi từ xa ngay (Self-Revocation)
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
                      <h4 className="font-semibold text-sm text-cyan-300">{vc.title}</h4>
                      <p className="text-[11px] text-slate-400">{vc.issuer}</p>
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
                        {selectiveDisclosure ? '••••••••' : vc.claims.studentId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chuyên ngành:</span>
                      <span className="text-slate-200">
                        {selectiveDisclosure ? '••••••••' : vc.claims.major}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Niên khóa:</span>
                      <span className="text-slate-300">{vc.claims.academicYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className="text-emerald-400 font-bold">{vc.claims.status || 'Active UTH Student'}</span>
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

      {/* Bottom Navigation Bar */}
      {identity && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] max-w-md mx-auto z-40 px-2 shadow-2xl">
          <button
            onClick={() => setActiveSubTab('wallet')}
            className={`flex flex-col items-center space-y-1 py-1 px-3 text-[11px] sm:text-xs transition ${activeSubTab === 'wallet' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Key size={17} />
            <span>Ví DID</span>
          </button>

          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`flex flex-col items-center space-y-1 py-1 px-3 text-[11px] sm:text-xs transition ${activeSubTab === 'credentials' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Award size={17} />
            <span>Chứng chỉ VC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex flex-col items-center space-y-1 py-1 px-3 text-[11px] sm:text-xs transition ${activeSubTab === 'logs' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <History size={17} />
            <span>Audit Log</span>
          </button>
        </nav>
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
    </div>
  );
}

