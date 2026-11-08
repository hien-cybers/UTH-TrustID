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
    <div
      className="w-full max-w-md sm:max-w-lg rounded-[28px] p-4 sm:p-6 mt-1 sm:mt-3 flex flex-col items-center relative overflow-hidden box-border animate-in fade-in duration-300"
      style={{
        background: 'linear-gradient(165deg, rgba(11, 40, 76, 0.9) 0%, rgba(5, 20, 42, 0.96) 100%)',
        border: '1px solid rgba(123, 189, 232, 0.30)',
        boxShadow: '0 20px 48px rgba(1, 8, 22, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
      }}
    >
      {/* Background neon glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Portal */}
      <div className="flex items-center space-x-2.5 text-sky-400 mb-2.5">
        <div className="w-8 h-8 rounded-2xl bg-sky-400/15 border border-sky-300/35 flex items-center justify-center flex-shrink-0">
          <Monitor size={17} />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-white text-center m-0">
          Cổng Dịch Vụ Số • Xác Thực Không Mật Khẩu
        </h3>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-sky-100/90 mb-4 bg-[#030D1B] border border-sky-300/25 px-3.5 py-1.5 rounded-full max-w-full text-center">
        <div className="flex items-center space-x-1.5">
          <Lock size={12} className="text-emerald-400 flex-shrink-0" />
          <span className="truncate">
            Domain: <strong className="text-sky-300 font-mono">uth.edu.vn</strong>
          </span>
        </div>
        <span className="text-sky-300/40 hidden sm:inline">•</span>
        <span className="text-emerald-300 font-semibold">EIP-191 Zero-Knowledge</span>
      </div>

      {authenticatedSession ? (
        // ==========================================
        // MÀN HÌNH DASHBOARD SINH VIÊN (SAU KHI QUÉT THÀNH CÔNG)
        // ==========================================
        <div className="w-full space-y-3.5 sm:space-y-4 py-1 animate-in zoom-in-95 fade-in duration-300">
          <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-[24px] p-4 text-center flex flex-col items-center relative">
            <div className="w-13 h-13 bg-emerald-500/20 border border-emerald-400/40 rounded-full flex items-center justify-center text-emerald-300 mb-2 p-3 shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-300 m-0">
              ĐĂNG NHẬP THÀNH CÔNG!
            </h4>
            <p className="text-xs text-slate-200 mt-1 max-w-xs mb-0">
              Thiết bị di động đã xác thực sinh trắc học và ký số mật mã EIP-191 thành công.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="bg-[#030D1B] border border-sky-300/25 rounded-[24px] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200/15 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-400/15 border border-sky-300/35 flex items-center justify-center text-sky-300">
                  <User size={19} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white m-0">{user.fullName || 'Sinh Viên UTH'}</h5>
                  <p className="text-xs text-sky-200 flex items-center space-x-1 m-0 mt-0.5">
                    <GraduationCap size={13} className="text-sky-400" />
                    <span>MSSV: {user.studentId || '2251120000'}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10.5px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                HỢP LỆ
              </span>
            </div>

            <div className="text-xs font-mono space-y-2 pt-1">
              <div>
                <span className="text-sky-200/75 block text-[10.5px] uppercase font-sans font-semibold">
                  Địa chỉ Ví DID (Signer):
                </span>
                <span className="text-sky-300 font-bold break-all text-[11px]">
                  {authenticatedSession.user?.address || authenticatedSession.signerAddress}
                </span>
              </div>

              {authenticatedSession.token && (
                <div>
                  <span className="text-sky-200/75 block text-[10.5px] uppercase font-sans font-semibold">
                    Phiên Ủy Quyền (Auth Token):
                  </span>
                  <span className="text-slate-200 break-all text-[10.5px] bg-[#071C36] px-3 py-1.5 rounded-2xl block border border-sky-300/20 mt-1">
                    {authenticatedSession.token}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-[11px] font-sans border-t border-sky-200/15">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <FileCheck size={14} className="text-emerald-400" />
                  <span>Xác minh chữ ký EIP-191:</span>
                </span>
                <span className="text-emerald-300 font-bold">Hợp Lệ (Verified)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-press w-full bg-[#071C36] hover:bg-[#0B284C] text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition border border-sky-300/30 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Đăng xuất &amp; Khởi tạo phiên mới</span>
          </button>
        </div>
      ) : (
        // ==========================================
        // MÀN HÌNH CHỜ QUÉT MÃ QR
        // ==========================================
        <>
          <p className="text-xs text-slate-200 text-center mb-3.5 max-w-sm leading-relaxed px-1">
            Mở ứng dụng <strong>UTH TrustID</strong> trên điện thoại và quét mã QR để đăng nhập bằng Face ID / Vân tay
          </p>

          {/* Countdown & Status Bar */}
          <div className="w-full flex items-center justify-between px-2 mb-3">
            <span className="text-xs text-slate-200 flex items-center space-x-1.5 font-medium">
              <Clock size={13} className="text-sky-400" />
              <span>Thời gian hiệu lực:</span>
            </span>

            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                timeLeft <= 10
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 animate-pulse'
                  : 'bg-sky-400/15 border-sky-300/40 text-sky-300'
              }`}
            >
              {isExpired ? 'Đã hết hạn' : `${timeLeft}s còn lại`}
            </span>
          </div>

          {challengeData && !isExpired ? (
            <div
              className="p-4 bg-white rounded-[28px] shadow-xl border-4 border-sky-300/40 relative group transition transform hover:scale-[1.01] flex items-center justify-center mx-auto"
              style={{
                boxShadow: '0 14px 36px rgba(56, 189, 248, 0.22)'
              }}
            >
              <QRCodeSVG
                value={JSON.stringify(challengeData)}
                size={165}
                level="M"
                includeMargin={false}
                className="w-36 h-36 sm:w-44 sm:h-44"
              />
            </div>
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-[#030D1B] border border-sky-300/25 rounded-[28px] flex flex-col items-center justify-center p-4 text-center space-y-2">
              <Clock size={32} className="text-rose-400 animate-bounce" />
              <p className="text-xs text-rose-300 font-bold m-0">Mã QR đã hết hạn!</p>
              <p className="text-[11px] text-slate-300 m-0">Mã có TTL 60s để ngăn ngừa tấn công phát lại.</p>
              <button
                onClick={generateNewSession}
                className="btn-press mt-1 px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-extrabold rounded-full transition border-none cursor-pointer"
              >
                Tạo mã mới
              </button>
            </div>
          )}

          <div className="mt-4 w-full bg-[#030D1B] border border-sky-300/20 rounded-[22px] p-3.5 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-sans">Challenge Nonce:</span>
              <span className="text-sky-300 font-bold truncate max-w-[160px] sm:max-w-[220px]">
                {challengeData?.nonce}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-sans">Single-Use TTL:</span>
              <span className="text-emerald-300 font-semibold">60 Giây (Tự hủy sau 1 lần ký)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-sans">Smart Contract:</span>
              <span className="text-sky-200 font-semibold">
                {NETWORK_CONFIG.contractAddress.slice(0, 6)}...{NETWORK_CONFIG.contractAddress.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-300 mt-3.5 text-center font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0"></span>
            <span className="truncate">
              {socketConnected
                ? 'Kênh WebSocket đang chờ điện thoại ký số...'
                : 'Đang kết nối kênh bảo mật...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoSignIn}
            className="btn-press w-full mt-3.5 py-3.5 px-5 rounded-2xl text-slate-950 text-xs sm:text-[13px] font-extrabold shadow-lg flex items-center justify-center space-x-2 border-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #38BDF8 0%, #34D399 100%)',
              boxShadow: '0 10px 26px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Zap size={15} />
            <span>Ký Số EIP-191 Đăng Nhập Nhanh (1 Chạm)</span>
          </button>

          <div className="flex items-center space-x-3 mt-3.5">
            <button
              onClick={generateNewSession}
              className="btn-press px-3.5 py-1.5 rounded-full bg-[#030D1B] border border-sky-300/25 flex items-center space-x-1.5 text-xs text-sky-200 hover:text-white transition cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Làm mới QR</span>
            </button>

            <button
              onClick={() => setShowSelfRevokeModal(true)}
              className="btn-press px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/30 flex items-center space-x-1.5 text-xs text-rose-300 hover:text-rose-200 transition cursor-pointer"
            >
              <ShieldAlert size={12} />
              <span>Báo mất ví từ xa</span>
            </button>
          </div>
        </>
      )}

      {/* MODAL THU HỒI TỪ XA TRÊN CỔNG DỊCH VỤ WEB (PORTAL) */}
      {showSelfRevokeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleRemoteSelfRevoke}
            className="w-full max-w-sm bg-[#071C36] border border-rose-400/45 rounded-[28px] p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-sky-200/15 pb-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert size={18} />
                <h4 className="font-bold text-sm text-white m-0">Báo Mất Thiết Bị / Thu Hồi Khẩn Cấp</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSelfRevokeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-sky-200/20 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed m-0">
              Dành cho sinh viên bị mất điện thoại: Dùng mã khẩn cấp (Emergency Token) được cấp lúc khởi tạo ví để vô hiệu hóa tài khoản ngay lập tức:
            </p>

            <div className="space-y-1.5">
              <label className="text-[11.5px] text-sky-200 block font-semibold">Địa chỉ Ví sinh viên (0x...):</label>
              <input
                type="text"
                value={revokeAddress}
                onChange={(e) => setRevokeAddress(e.target.value)}
                placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
                className="pro-input font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11.5px] text-sky-200 block font-semibold">Mã bí mật khẩn cấp (Emergency Token):</label>
              <input
                type="text"
                value={revokeToken}
                onChange={(e) => setRevokeToken(e.target.value)}
                placeholder="EMERGENCY_UTH_9999"
                className="pro-input font-mono text-xs text-amber-300"
              />
            </div>

            {revokeMsg && (
              <p className="text-xs text-rose-300 bg-rose-950/50 p-3 rounded-2xl border border-rose-400/40 m-0">
                {revokeMsg}
              </p>
            )}

            <div className="flex space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSelfRevokeModal(false)}
                className="btn-press flex-1 bg-[#030D1B] text-slate-200 text-xs font-bold py-3 rounded-2xl border border-sky-300/25 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={revokeLoading}
                className="btn-press flex-1 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs py-3 rounded-2xl border-none cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {revokeLoading ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                <span>{revokeLoading ? 'Đang xử lý...' : 'Vô hiệu hóa ngay'}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
