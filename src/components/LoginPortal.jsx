import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Monitor, CheckCircle, ShieldCheck, ExternalLink, Lock, CheckCircle2, LogOut } from 'lucide-react';
import { NETWORK_CONFIG, subscribeToAuthEvents } from '../services/did';

export default function LoginPortal() {
  const [challengeData, setChallengeData] = useState(null);
  const [authenticatedSession, setAuthenticatedSession] = useState(null);

  // Sinh ngẫu nhiên phiên đăng nhập chuẩn hóa theo yêu cầu NCKH
  const generateNewSession = () => {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    const nonce = 'auth_nonce_' + Math.random().toString(36).substring(2, 14);

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
  };

  useEffect(() => {
    generateNewSession();

    // Lắng nghe sự kiện truyền phát chữ ký thời gian thực từ điện thoại
    const unsubscribe = subscribeToAuthEvents((authData) => {
      setAuthenticatedSession(authData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4 shadow-2xl flex flex-col items-center relative overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Portal */}
      <div className="flex items-center space-x-2 text-cyan-400 mb-2">
        <Monitor size={20} />
        <h3 className="font-semibold text-sm text-slate-200">Cổng Dịch Vụ - Xác Thực Không Mật Khẩu</h3>
      </div>

      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-4 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-full">
        <Lock size={12} className="text-emerald-400" />
        <span>Domain: <strong className="text-slate-300">nckh-auth.edu.vn</strong></span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400">Polygon Amoy (80002)</span>
      </div>

      {authenticatedSession ? (
        // MÀN HÌNH ĐĂNG NHẬP THÀNH CÔNG (Sau khi điện thoại quét và ký số)
        <div className="w-full space-y-4 py-2 animate-in fade-in zoom-in-95">
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-base text-emerald-300">ĐĂNG NHẬP THÀNH CÔNG!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Chữ ký mật mã EIP-191 đã được xác thực an toàn bởi thiết bị di động.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Địa chỉ ví xác thực (Signer):</span>
              <span className="text-cyan-300 font-semibold break-all">{authenticatedSession.signerAddress}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Mã định danh W3C DID:</span>
              <span className="text-slate-300 break-all">{authenticatedSession.did}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Chữ ký số mật mã:</span>
              <p className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 break-all border border-slate-800/60 max-h-16 overflow-y-auto">
                {authenticatedSession.signature}
              </p>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-500">Thời gian xác thực:</span>
              <span className="text-emerald-400 font-semibold">{new Date(authenticatedSession.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={generateNewSession}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition"
          >
            <LogOut size={14} />
            <span>Đăng xuất & Tạo phiên mới</span>
          </button>
        </div>
      ) : (
        // MÀN HÌNH CHỜ QUÉT MÃ QR
        <>
          <p className="text-xs text-slate-400 text-center mb-4 max-w-xs">
            Dùng ứng dụng trên iPhone quét mã QR bên dưới để xác thực danh tính sinh trắc học không mật khẩu
          </p>

          {challengeData && (
            <div className="p-4 bg-white rounded-2xl shadow-2xl relative group">
              <QRCodeSVG
                value={JSON.stringify(challengeData)}
                size={190}
                level="M"
                includeMargin={false}
              />
            </div>
          )}

          <div className="mt-4 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Challenge Nonce:</span>
              <span className="text-cyan-400 truncate max-w-[200px]">{challengeData?.nonce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Smart Contract:</span>
              <span className="text-slate-400 font-semibold">
                {NETWORK_CONFIG.contractAddress.slice(0, 6)}...{NETWORK_CONFIG.contractAddress.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Đang lắng nghe kết quả từ điện thoại qua kênh thời gian thực...</span>
          </div>

          <button
            onClick={generateNewSession}
            className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
          >
            <RefreshCw size={13} />
            <span>Làm mới phiên QR</span>
          </button>
        </>
      )}
    </div>
  );
}
