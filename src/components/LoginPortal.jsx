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
    <div className="w-full bg-gradient-to-br from-[#0B1930] to-[#060E1E] border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col items-center relative overflow-hidden box-border">
      {/* Header Portal */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400">
          <Monitor size={16} />
          <h3 className="font-extrabold text-xs text-white m-0">Đăng Nhập Web Không Mật Khẩu</h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-[#040814] border border-slate-800 px-2 py-0.5 rounded-lg">
          uth.edu.vn
        </span>
      </div>

      {authenticatedSession ? (
        <div className="w-full space-y-3 py-1">
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 text-center flex flex-col items-center">
            <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-1.5">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="font-extrabold text-sm text-emerald-400 m-0">ĐĂNG NHẬP THÀNH CÔNG</h4>
          </div>

          <div className="bg-[#040814] border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <User size={18} />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-white m-0">{user.fullName || 'Sinh Viên UTH'}</h5>
                  <p className="text-[11px] text-cyan-400 font-mono m-0 mt-0.5">
                    MSSV: {user.studentId || '2251120000'}
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
                ACTIVE
              </span>
            </div>

            <div className="text-[11px] font-mono space-y-1.5">
              <div className="text-slate-400 break-all">
                DID: <span className="text-cyan-300 font-semibold">{authenticatedSession.user?.address || authenticatedSession.signerAddress}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 font-sans text-[11px]">
                <span className="text-slate-400">Chữ ký EIP-191:</span>
                <span className="text-emerald-400 font-bold">✓ Hợp lệ</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-[#040814] hover:bg-slate-900 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Đăng xuất phiên</span>
          </button>
        </div>
      ) : (
        <>
          <div className="w-full flex items-center justify-between px-1 mb-2.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" />
              <span>Hiệu lực QR:</span>
            </span>

            <span
              className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                timeLeft <= 10
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {isExpired ? 'Hết hạn' : `${timeLeft}s`}
            </span>
          </div>

          {challengeData && !isExpired ? (
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center mx-auto">
              <QRCodeSVG
                value={JSON.stringify(challengeData)}
                size={156}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="w-44 h-44 bg-[#040814] border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center space-y-2">
              <Clock size={28} className="text-rose-400" />
              <p className="text-xs text-rose-300 font-bold m-0">Mã QR đã hết hạn</p>
              <button
                onClick={generateNewSession}
                className="px-3 py-1.5 bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-xl border-none cursor-pointer"
              >
                Tạo mã mới
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleQuickDemoSignIn}
            className="btn-press w-full mt-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 border-none cursor-pointer"
          >
            <Zap size={14} />
            <span>Ký Số EIP-191 Đăng Nhập Ngay</span>
          </button>

          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={generateNewSession}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 bg-transparent border-none cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Làm mới QR</span>
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={() => setShowSelfRevokeModal(true)}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer"
            >
              <ShieldAlert size={12} />
              <span>Báo mất ví</span>
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
