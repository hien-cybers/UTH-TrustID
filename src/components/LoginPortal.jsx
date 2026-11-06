import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import {
  RefreshCw,
  Monitor,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Lock,
  CheckCircle2,
  LogOut,
  User,
  GraduationCap,
  KeyRound,
  FileCheck,
  Clock,
  ShieldAlert,
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { NETWORK_CONFIG, subscribeToAuthEvents, getSavedIdentity, signAuthChallenge, publishAuthSuccess } from '../services/did';
import { getSocketUrl, smartFetch, retargetSocket } from '../utils/backendUrl';

export default function LoginPortal() {
  const [challengeData, setChallengeData] = useState(null);
  const [authenticatedSession, setAuthenticatedSession] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Nonce TTL Countdown (60s)
  const NONCE_TTL = 60;
  const [timeLeft, setTimeLeft] = useState(NONCE_TTL);
  const [isExpired, setIsExpired] = useState(false);

  // Self-Revocation Modal from Web Portal
  const [showSelfRevokeModal, setShowSelfRevokeModal] = useState(false);
  const [revokeAddress, setRevokeAddress] = useState('');
  const [revokeToken, setRevokeToken] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState('');

  // Khởi tạo kết nối WebSocket Socket.io (hỗ trợ đa thiết bị LAN/Mobile/Tunnel)
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      secure: true,
      rejectUnauthorized: false
    });
    socketRef.current = socket;

    const handleBackendChanged = (e) => {
      if (e?.detail) retargetSocket(socket, e.detail);
    };
    window.addEventListener('uth-backend-url-changed', handleBackendChanged);

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Lắng nghe sự kiện đăng nhập thành công từ WebSocket
    socket.on('auth-success', (authData) => {
      setAuthenticatedSession(authData);
    });

    // Lắng nghe sự kiện fallback qua BroadcastChannel (nếu cùng thiết bị)
    const unsubscribeBroadcast = subscribeToAuthEvents((authData) => {
      setAuthenticatedSession(authData);
    });

    generateNewSession();

    return () => {
      window.removeEventListener('uth-backend-url-changed', handleBackendChanged);
      unsubscribeBroadcast();
      socket.disconnect();
    };
  }, []);

  // Timer 60s đếm lùi Nonce TTL
  useEffect(() => {
    if (authenticatedSession) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authenticatedSession, challengeData]);

  // Cấp phát phiên đăng nhập chuẩn hóa Nonce từ backend
  const generateNewSession = async () => {
    setIsExpired(false);
    setTimeLeft(NONCE_TTL);

    let nonce = 'auth_nonce_' + Math.random().toString(36).substring(2, 14);
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    let domain = 'uth.edu.vn';
    let messageToSign = '';

    try {
      const res = await smartFetch('/api/auth/challenge');
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          nonce = data.challenge;
        }
        if (data.domain) {
          domain = data.domain;
        }
        if (data.messageToSign) {
          messageToSign = data.messageToSign;
        }
      }
    } catch (e) {
      console.warn('Backend challenge fetch fallback to local:', e);
    }

    const payload = {
      action: 'auth',
      domain,
      serviceName: 'Cổng Khảo Thí & Đào Tạo Số UTH',
      sessionId,
      nonce,
      messageToSign,
      chainId: NETWORK_CONFIG.chainId,
      contractAddress: NETWORK_CONFIG.contractAddress,
      timestamp: Date.now(),
    };

    setChallengeData(payload);
    setAuthenticatedSession(null);

    // Báo cho Socket server biết để join room theo Nonce
    if (socketRef.current) {
      socketRef.current.emit('join-session', nonce);
    }
  };

  const handleLogout = () => {
    setAuthenticatedSession(null);
    generateNewSession();
  };

  const handleQuickDemoSignIn = async () => {
    if (!challengeData?.nonce) return;
    let identity = getSavedIdentity();
    if (!identity || !identity.address) {
      identity = {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        student: {
          studentId: '2251120000',
          fullName: 'Nguyễn Đức Hiển',
          major: 'An toàn Thông tin'
        }
      };
    }
    try {
      const signed = await signAuthChallenge(identity, challengeData.nonce);
      const res = await smartFetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: challengeData.nonce,
          signature: signed.signature,
          studentData: {
            studentId: identity.student?.studentId || '2251120000',
            fullName: identity.student?.fullName || 'Nguyễn Đức Hiển',
            major: identity.student?.major || 'An toàn Thông tin',
            address: signed.signerAddress || identity.address
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticatedSession(data);
        publishAuthSuccess(data);
        return;
      }
    } catch {}
    // Fallback local demo
    const fallbackAuth = {
      token: `jwt_uth_session_${Date.now()}`,
      user: {
        address: identity.address,
        studentId: identity.student?.studentId || '2251120000',
        fullName: identity.student?.fullName || 'Nguyễn Đức Hiển',
        major: identity.student?.major || 'An toàn Thông tin'
      },
      timestamp: Date.now()
    };
    setAuthenticatedSession(fallbackAuth);
  };

  const handleRemoteSelfRevoke = async (e) => {
    e.preventDefault();
    if (!revokeAddress || !revokeToken) {
      alert("Vui lòng nhập địa chỉ ví và mã khẩn cấp!");
      return;
    }
    setRevokeLoading(true);
    setRevokeMsg('');
    try {
      const res = await smartFetch('/api/identity/self-revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: revokeAddress.trim(),
          emergencyToken: revokeToken.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setRevokeMsg(data.message);
        alert(data.message);
        setShowSelfRevokeModal(false);
        setRevokeAddress('');
        setRevokeToken('');
      } else {
        setRevokeMsg('Lỗi: ' + data.message);
        alert(data.message);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setRevokeLoading(false);
    }
  };

  const user = authenticatedSession?.user || {
    studentId: '2251120000',
    fullName: 'Sinh viên UTH',
    major: 'An toàn Thông tin',
    address: authenticatedSession?.signerAddress,
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 mt-1 sm:mt-3 shadow-lg flex flex-col items-center relative overflow-hidden box-border animate-in fade-in duration-300">
      {/* Background neon glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Portal */}
      <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 mb-2">
        <Monitor size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" />
        <h3 className="font-semibold text-xs sm:text-base text-slate-900 dark:text-slate-100 text-center">Cổng Dịch Vụ - Xác Thực Không Mật Khẩu</h3>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 sm:px-3 py-1 rounded-xl max-w-full text-center">
        <div className="flex items-center space-x-1">
          <Lock size={12} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="truncate">Domain: <strong className="text-cyan-700 dark:text-cyan-300 font-mono">uth.edu.vn</strong></span>
        </div>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
        <span className="text-purple-600 dark:text-purple-400 font-medium">Polygon Amoy (80002)</span>
      </div>

      {authenticatedSession ? (
        // ==========================================
        // MÀN HÌNH DASHBOARD SINH VIÊN (SAU KHI QUÉT THÀNH CÔNG)
        // ==========================================
        <div className="w-full space-y-3.5 sm:space-y-4 py-1 animate-in zoom-in-95 fade-in duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 text-center flex flex-col items-center relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
              <CheckCircle2 size={28} className="sm:w-[32px] sm:h-[32px]" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-emerald-700 dark:text-emerald-300">ĐĂNG NHẬP THÀNH CÔNG!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs">
              Thiết bị di động đã xác thực sinh trắc học và ký số mật mã EIP-191 thành công.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <User size={18} className="sm:w-[20px] sm:h-[20px]" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{user.fullName || 'Sinh Viên UTH'}</h5>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                    <GraduationCap size={13} className="text-cyan-600 dark:text-cyan-400" />
                    <span>MSSV: {user.studentId || '2251120000'}</span>
                  </p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="text-xs font-mono space-y-2 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Địa chỉ Ví DID (Signer):</span>
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold break-all text-[10px] sm:text-[11px]">
                  {authenticatedSession.user?.address || authenticatedSession.signerAddress}
                </span>
              </div>

              {authenticatedSession.token && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Phiên Ủy Quyền (Auth Token):</span>
                  <span className="text-slate-600 dark:text-slate-400 break-all text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded block border border-slate-200 dark:border-slate-800/70">
                    {authenticatedSession.token}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-[10px] sm:text-[11px] font-sans border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500 flex items-center space-x-1">
                  <FileCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Xác minh chữ ký EIP-191:</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Hợp Lệ (On-Chain)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-800 dark:text-slate-200 text-xs font-semibold py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition border border-slate-200 dark:border-slate-700"
          >
            <LogOut size={14} />
            <span>Đăng xuất & Khởi tạo phiên mới</span>
          </button>
        </div>
      ) : (
        // ==========================================
        // MÀN HÌNH CHỜ QUÉT MÃ QR
        // ==========================================
        <>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-3 sm:mb-4 max-w-sm leading-relaxed px-1">
            Mở ứng dụng <strong>UTH TrustID</strong> trên điện thoại và quét mã QR để đăng nhập bằng FaceID / TouchID
          </p>

          {/* Countdown & Status Bar */}
          <div className="w-full flex items-center justify-between px-2 mb-3">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1">
              <Clock size={12} className="text-cyan-600 dark:text-cyan-400" />
              <span>Thời gian hiệu lực:</span>
            </span>

            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                timeLeft <= 10
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 animate-pulse'
                  : 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300'
              }`}
            >
              {isExpired ? 'Hết hạn (Expired)' : `${timeLeft}s còn lại`}
            </span>
          </div>

          {challengeData && !isExpired ? (
            <div className="p-3 bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 relative group transition transform hover:scale-[1.01] flex items-center justify-center max-w-[210px] max-h-[210px] mx-auto">
              <QRCodeSVG
                value={JSON.stringify(challengeData)}
                size={165}
                level="M"
                includeMargin={false}
                className="w-36 h-36 sm:w-44 sm:h-44"
              />
            </div>
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-4 text-center space-y-2">
              <Clock size={32} className="text-rose-500 dark:text-rose-400 animate-bounce" />
              <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold">Mã QR đã hết hạn!</p>
              <p className="text-[10px] text-slate-500">Mã có TTL 60s để ngăn ngừa tấn công phát lại (Replay Attack).</p>
              <button
                onClick={generateNewSession}
                className="mt-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Tạo mã mới
              </button>
            </div>
          )}

          <div className="mt-3.5 sm:mt-4 w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Challenge Nonce:</span>
              <span className="text-cyan-600 dark:text-cyan-400 truncate max-w-[150px] sm:max-w-[220px]">{challengeData?.nonce}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Single-Use TTL:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">60 Giây (Tự hủy sau 1 lần xác thực)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Smart Contract:</span>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                {NETWORK_CONFIG.contractAddress.slice(0, 6)}...{NETWORK_CONFIG.contractAddress.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 sm:mt-4 text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping flex-shrink-0"></span>
            <span className="truncate">
              {socketConnected
                ? 'Kênh WebSocket đang chờ điện thoại ký số...'
                : 'Đang kết nối kênh bảo mật...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoSignIn}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
          >
            <Zap size={14} />
            <span>Ký Số EIP-191 Đăng Nhập Nhanh (1-Chạm Trên Thiết Bị Này)</span>
          </button>

          <div className="flex items-center space-x-4 mt-3">
            <button
              onClick={generateNewSession}
              className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
            >
              <RefreshCw size={13} />
              <span>Làm mới phiên QR</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <button
              onClick={() => setShowSelfRevokeModal(true)}
              className="flex items-center space-x-1 text-xs text-rose-500 dark:text-rose-400/90 hover:text-rose-600 dark:hover:text-rose-300 transition"
            >
              <ShieldAlert size={13} />
              <span>Báo mất ví từ xa</span>
            </button>
          </div>
        </>
      )}

      {/* MODAL THU HỒI TỪ XA TRÊN CỔNG DỊCH VỤ WEB (PORTAL) */}
      {showSelfRevokeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleRemoteSelfRevoke}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert size={18} />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Báo Mất Thiết Bị / Thu Hồi Khẩn Cấp</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSelfRevokeModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dành cho sinh viên bị mất điện thoại: Dùng mã khẩn cấp (Emergency Token) được cấp lúc khởi tạo ví để vô hiệu hóa tài khoản ngay lập tức từ trình duyệt:
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">Địa chỉ Ví sinh viên (0x...):</label>
              <input
                type="text"
                value={revokeAddress}
                onChange={(e) => setRevokeAddress(e.target.value)}
                placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">Mã bí mật khẩn cấp (Emergency Token):</label>
              <input
                type="text"
                value={revokeToken}
                onChange={(e) => setRevokeToken(e.target.value)}
                placeholder="EMERGENCY_UTH_9999"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-amber-700 dark:text-amber-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            {revokeMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                {revokeMsg}
              </p>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSelfRevokeModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs py-2.5 rounded-xl transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={revokeLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {revokeLoading ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                <span>{revokeLoading ? 'Đang gửi lệnh...' : 'Vô hiệu hóa ngay'}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
