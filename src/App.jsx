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
} from './services/did';
import Scanner from './components/Scanner';
import LoginPortal from './components/LoginPortal';
import AdminGateway from './components/AdminGateway';
import {
  ShieldCheck,
  Key,
  RefreshCw,
  QrCode,
  Lock,
  Copy,
  Check,
  Trash2,
  Smartphone,
  CheckCircle2,
  X,
  Monitor,
  Award,
  History,
  AlertTriangle,
  Fingerprint,
  FileCode,
  Download,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Globe,
  Radio,
} from 'lucide-react';

export default function App() {
  const [identity, setIdentity] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  const [isRevoked, setIsRevoked] = useState(false);

  // Tab điều hướng: 'wallet' (Ví) | 'credentials' (Chứng chỉ) | 'logs' (Nhật ký)
  const [activeSubTab, setActiveSubTab] = useState('wallet');
  const [credentials, setCredentials] = useState([]);
  const [logs, setLogs] = useState([]);

  // Phân biệt chế độ xem Web Portal trên PC và Ví trên Mobile
  const [viewMode, setViewMode] = useState(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'wallet' : 'portal';
  });

  // Trạng thái mạng On-chain Polygon Amoy
  const [blockNumber, setBlockNumber] = useState(null);

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
    fetchBlockHeight();
    const timer = setInterval(fetchBlockHeight, 15000); // Polling block mỗi 15s
    return () => clearInterval(timer);
  }, []);

  const fetchBlockHeight = async () => {
    const block = await getPolygonAmoyBlockNumber();
    if (block) setBlockNumber(block);
  };

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
    }
  };

  const handleScanClick = () => {
    if (isRevoked) {
      alert('Danh tính đã bị thu hồi khẩn cấp, không thể thực hiện quét mã xác thực.');
      return;
    }
    setIsScanning(true);
  };

  // Khi camera quét được mã QR, mở Hộp thoại Phê duyệt Đăng nhập (Auth Approval Modal)
  const handleScanComplete = (data) => {
    setIsScanning(false);
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

  // Xác nhận ký số sau khi người dùng xem xét thông tin yêu cầu đăng nhập
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

      // Gửi chữ ký mật mã lên Backend để kích hoạt WebSocket tự động đăng nhập trên Web
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 selection:bg-cyan-500 selection:text-white pb-24">
      {/* Header */}
      <header className={`w-full ${viewMode === 'admin' ? 'max-w-4xl' : 'max-w-md'} flex flex-wrap justify-between items-center py-3 border-b border-slate-800 gap-3`}>
        <div className="flex items-center space-x-2">
          <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-400">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-base leading-tight">UTH TrustID</h1>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.2 rounded font-mono">
                W3C DID
              </span>
            </div>
            {/* Live On-chain RPC Indicator */}
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Amoy:</span>
              <span className="font-mono text-slate-300">
                {blockNumber ? `#${blockNumber.toLocaleString()}` : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Mode View Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs space-x-1">
          <button
            onClick={() => setViewMode('wallet')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              viewMode === 'wallet' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} />
            <span>Ví Mobile</span>
          </button>

          <button
            onClick={() => setViewMode('portal')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              viewMode === 'portal' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor size={14} />
            <span>Cổng Web</span>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              viewMode === 'admin' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={14} />
            <span>Quản Trị</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className={`w-full ${viewMode === 'admin' ? 'max-w-4xl' : 'max-w-md'} flex-1 py-4 flex flex-col items-center`}>
        {viewMode === 'admin' ? (
          <AdminGateway />
        ) : viewMode === 'portal' ? (
          <LoginPortal />
        ) : !identity ? (
          // MÀN HÌNH KHI CHƯA CÓ DANH TÍNH
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8">
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-950/20">
              <Key size={38} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Chưa có danh tính số</h2>
            <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
              Tạo danh tính W3C DID với khóa bảo mật được mã hóa AES-GCM và lưu trữ phân tán trên Polygon Amoy Testnet.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleCreate}
                className="w-full bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] transition font-semibold text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/30 text-xs"
              >
                <RefreshCw size={16} />
                <span>Khởi tạo DID mới (Mã hóa AES-GCM)</span>
              </button>

              <button
                onClick={() => setShowRestoreModal(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs transition"
              >
                <Lock size={15} />
                <span>Khôi phục bằng 12 từ Mnemonic (BIP-39)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cảnh báo nếu danh tính đã bị thu hồi khẩn cấp */}
            {isRevoked && (
              <div className="bg-rose-950/50 border border-rose-800 rounded-2xl p-4 flex items-center space-x-3 text-rose-300">
                <AlertTriangle size={24} className="text-rose-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-rose-200">DANH TÍNH ĐÃ BỊ THU HỒI TRÊN BLOCKCHAIN</p>
                  Khóa ECDSA đã bị đóng băng vĩnh viễn khỏi Smart Contract. Mọi phiên đăng nhập đều bị từ chối.
                </div>
              </div>
            )}

            {/* TAB 1: GIAO DIỆN VÍ CHÍNH */}
            {activeSubTab === 'wallet' && (
              <div className="space-y-4">
                {/* Thẻ DID Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
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
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {copiedDid ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <label className="text-[11px] text-slate-400 block mb-1">Địa chỉ ví công khai (Ethereum Address):</label>
                  <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5 mb-3 text-xs font-mono text-slate-300 break-all">
                    <span>{identity.address}</span>
                    <a
                      href={`${NETWORK_CONFIG.explorerUrl}/address/${identity.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-cyan-400 ml-2"
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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleScanClick}
                    disabled={isRevoked}
                    className={`border p-4 rounded-xl flex flex-col items-center justify-center space-y-2 transition ${isRevoked
                        ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 active:scale-[0.98]'
                      }`}
                  >
                    <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                      <QrCode size={22} />
                    </div>
                    <span className="text-xs font-semibold">Quét mã đăng nhập</span>
                  </button>

                  <button
                    onClick={handleRevealMnemonic}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 transition active:scale-[0.98]"
                  >
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                      <Lock size={22} />
                    </div>
                    <span className="text-xs font-semibold">Sao lưu 12 từ khóa</span>
                  </button>
                </div>

                {/* Hàng nút bảo mật phụ */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => copyToClipboard(identity.address, 'key')}
                    className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 text-xs text-slate-300 transition"
                  >
                    <Fingerprint size={15} className="text-cyan-400" />
                    <span>{copiedKey ? 'Đã sao chép Private Key' : 'Trích xuất Private Key'}</span>
                  </button>

                  <a
                    href={`${NETWORK_CONFIG.explorerUrl}/address/${NETWORK_CONFIG.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 text-xs text-slate-300 transition"
                  >
                    <ExternalLink size={14} className="text-purple-400" />
                    <span>Smart Contract Amoy</span>
                  </a>
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
                        <span className="text-slate-200 font-semibold">{vc.claims.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chuyên ngành:</span>
                        <span className="text-slate-200">{vc.claims.major}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Niên khóa:</span>
                        <span className="text-slate-300">{vc.claims.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className="text-emerald-400">{vc.claims.status}</span>
                      </div>
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
      </main>

      {/* Bottom Navigation Bar */}
      {identity && viewMode === 'wallet' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around py-3 max-w-md mx-auto z-40">
          <button
            onClick={() => setActiveSubTab('wallet')}
            className={`flex flex-col items-center space-y-1 text-xs ${activeSubTab === 'wallet' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Key size={18} />
            <span>Ví DID</span>
          </button>

          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`flex flex-col items-center space-y-1 text-xs ${activeSubTab === 'credentials' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Award size={18} />
            <span>Chứng chỉ VC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex flex-col items-center space-y-1 text-xs ${activeSubTab === 'logs' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <History size={18} />
            <span>Audit Log</span>
          </button>
        </nav>
      )}

      {/* MODAL 1: HỘP THOẠI PHÊ DUYỆT ĐĂNG NHẬP (CHALLENGE - RESPONSE UX) */}
      {pendingAuthRequest && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
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
                <span className="text-cyan-300 font-semibold">{pendingAuthRequest.serviceName || 'Cổng Dịch Vụ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên miền (Domain):</span>
                <span className="text-slate-200 font-bold">{pendingAuthRequest.domain || 'nckh-auth.edu.vn'}</span>
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

      {/* MODAL 2: SAO LƯU 12 TỪ MNEMONIC (BIP-39) */}
      {showMnemonicModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
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
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {revealedMnemonic.split(' ').map((word, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 text-center text-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">{idx + 1}</span>
                  <span className="font-mono text-cyan-300 font-semibold">{word}</span>
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
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRestoreSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
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

      {/* MODAL 4: XEM W3C DID DOCUMENT (JSON-LD) */}
      {showDidDocModal && didDocument && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
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

            <pre className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 p-3 rounded-xl text-[10px] font-mono text-cyan-300 leading-relaxed">
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

      {/* Modal Scanner */}
      {isScanning && (
        <Scanner onScanSuccess={handleScanComplete} onClose={() => setIsScanning(false)} />
      )}
    </div>
  );
}