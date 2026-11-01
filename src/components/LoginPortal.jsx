import React, { useState, useEffect, useRef } from 'react';
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
  FileCheck
} from 'lucide-react';
import { NETWORK_CONFIG, subscribeToAuthEvents } from '../services/did';

export default function LoginPortal() {
  const [challengeData, setChallengeData] = useState(null);
  const [authenticatedSession, setAuthenticatedSession] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Khởi tạo kết nối WebSocket Socket.io (kết nối trực tiếp qua proxy Vite)
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('[Portal] Socket.io connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('[Portal] Socket.io disconnected');
    });

    // Lắng nghe sự kiện đăng nhập thành công từ WebSocket
    socket.on('auth-success', (authData) => {
      console.log('[Portal] Received auth-success via Socket.io:', authData);
      setAuthenticatedSession(authData);
    });

    // Lắng nghe sự kiện fallback qua BroadcastChannel (nếu cùng thiết bị)
    const unsubscribeBroadcast = subscribeToAuthEvents((authData) => {
      setAuthenticatedSession(authData);
    });

    generateNewSession();

    return () => {
      unsubscribeBroadcast();
      socket.disconnect();
    };
  }, []);

  // Cấp phát phiên đăng nhập chuẩn hóa Nonce từ backend
  const generateNewSession = async () => {
    let nonce = 'auth_nonce_' + Math.random().toString(36).substring(2, 14);
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);

    try {
      const res = await fetch('/api/auth/challenge');
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          nonce = data.challenge;
        }
      }
    } catch (e) {
      console.warn('Backend challenge fetch fallback to local:', e);
    }

    const payload = {
      action: 'auth',
      domain: 'nckh-auth.edu.vn',
      serviceName: 'Cổng Khảo Thí & Đào Tạo Số UTH',
      sessionId,
      nonce,
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

  const user = authenticatedSession?.user || {
    studentId: '2251120000',
    fullName: 'Sinh viên UTH',
    major: 'An toàn Thông tin',
    address: authenticatedSession?.signerAddress,
  };

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 mt-4 shadow-2xl flex flex-col items-center relative overflow-hidden animate-in fade-in duration-300">
      {/* Background neon glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Portal */}
      <div className="flex items-center space-x-2 text-cyan-400 mb-2">
        <Monitor size={22} />
        <h3 className="font-semibold text-base text-slate-100">Cổng Dịch Vụ - Xác Thực Không Mật Khẩu</h3>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-5 bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-full">
        <Lock size={12} className="text-emerald-400" />
        <span>Domain: <strong className="text-slate-300">nckh-auth.edu.vn</strong></span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400 font-medium">Polygon Amoy (80002)</span>
      </div>

      {authenticatedSession ? (
        // ==========================================
        // MÀN HÌNH DASHBOARD SINH VIÊN (SAU KHI QUÉT THÀNH CÔNG)
        // ==========================================
        <div className="w-full space-y-4 py-1 animate-in zoom-in-95 fade-in duration-300">
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-center flex flex-col items-center relative">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-base text-emerald-300">ĐĂNG NHẬP THÀNH CÔNG!</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Thiết bị di động đã xác thực sinh trắc học và ký số mật mã EIP-191 thành công.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <User size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-100">{user.fullName || 'Sinh Viên UTH'}</h5>
                  <p className="text-xs text-slate-400 flex items-center space-x-1">
                    <GraduationCap size={13} className="text-cyan-400" />
                    <span>MSSV: {user.studentId || '2251120000'}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="text-xs font-mono space-y-2 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Địa chỉ Ví DID (Signer):</span>
                <span className="text-cyan-300 font-semibold break-all text-[11px]">
                  {authenticatedSession.user?.address || authenticatedSession.signerAddress}
                </span>
              </div>

              {authenticatedSession.token && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Phiên Ủy Quyền (Auth Token):</span>
                  <span className="text-slate-400 break-all text-[10px] bg-slate-900 px-2 py-1 rounded block border border-slate-800/70">
                    {authenticatedSession.token}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-[11px] font-sans border-t border-slate-800/80">
                <span className="text-slate-500 flex items-center space-x-1">
                  <FileCheck size={14} className="text-emerald-400" />
                  <span>Xác minh chữ ký EIP-191:</span>
                </span>
                <span className="text-emerald-400 font-semibold">Hợp Lệ (On-Chain)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition border border-slate-700"
          >
            <LogOut size={15} />
            <span>Đăng xuất & Khởi tạo phiên mới</span>
          </button>
        </div>
      ) : (
        // ==========================================
        // MÀN HÌNH CHỜ QUÉT MÃ QR
        // ==========================================
        <>
          <p className="text-xs text-slate-400 text-center mb-4 max-w-sm leading-relaxed">
            Mở ứng dụng <strong>UTH TrustID</strong> trên điện thoại và quét mã QR để đăng nhập bằng FaceID / TouchID
          </p>

          {challengeData && (
            <div className="p-4 bg-white rounded-3xl shadow-2xl relative group transition transform hover:scale-[1.01]">
              <QRCodeSVG
                value={JSON.stringify(challengeData)}
                size={210}
                level="M"
                includeMargin={false}
              />
            </div>
          )}

          <div className="mt-4 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Challenge Nonce:</span>
              <span className="text-cyan-400 truncate max-w-[220px]">{challengeData?.nonce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Smart Contract:</span>
              <span className="text-slate-400 font-semibold">
                {NETWORK_CONFIG.contractAddress.slice(0, 6)}...{NETWORK_CONFIG.contractAddress.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mt-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              {socketConnected
                ? 'Kênh WebSocket thời gian thực đang chờ điện thoại ký số...'
                : 'Đang kết nối kênh bảo mật...'}
            </span>
          </div>

          <button
            onClick={generateNewSession}
            className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
          >
            <RefreshCw size={13} />
            <span>Làm mới phiên đăng nhập</span>
          </button>
        </>
      )}
    </div>
  );
}
