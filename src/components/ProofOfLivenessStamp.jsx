// src/components/ProofOfLivenessStamp.jsx - Con Dấu Động Chống Chụp Màn Hình (Dynamic Liveness Stamp)
// 1. Đồng hồ mili-giây (40ms): Nhảy số liên tục ở góc để giảng viên nhìn lướt qua biết app thật đang chạy
// 2. Hạt phân tử xoay (Particle Orbit): Các hạt ánh sáng li ti chuyển động tròn quanh huy hiệu VERIFIED
// 3. Mã Watermark đổi màu động: Mã hash gói tin in chìm và biến thiên màu theo thời gian thực
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ProofOfLivenessStamp({
  studentName = 'NGUYỄN ĐỨC HIỂN',
  mssv = '2251120000',
  sessionId = 'SES_A2301',
  courseCode = 'IT402.N01',
  courseName = 'An toàn Mạng máy tính & Ứng dụng',
  room = 'A2-301',
  sessionNumber = 4,
  signatureHash = '0x8a4f91c2b7e0...c4e191',
  distance = '8m',
  biometricVerified = true,
  proximityWarning = null,
  onClose
}) {
  const [liveTimeMs, setLiveTimeMs] = useState('');
  const [dynamicHash1s, setDynamicHash1s] = useState('0x9f4a82c1...e01b');
  const [wavePhase, setWavePhase] = useState(0);
  const [hueShift, setHueShift] = useState(160);

  // 1. Đồng hồ chạy liên tục đến cấp độ mili-giây (40ms/frame) + Sóng Radar + Đổi màu Watermark
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setLiveTimeMs(`${hh}:${mm}:${ss}.${ms}`);
      setWavePhase((p) => (p + 15) % 360);
      setHueShift((h) => (h + 4) % 360);
    }, 40);

    return () => clearInterval(tick);
  }, []);

  // 2. Mã Hash động thay đổi liên tục mỗi 1 giây (1000ms)
  useEffect(() => {
    const updateOneSecondHash = () => {
      const randHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setDynamicHash1s(`0x${randHex.slice(0, 8)}...${randHex.slice(-4)}`);
    };
    updateOneSecondHash();
    const hashInterval = setInterval(updateOneSecondHash, 1000);
    return () => clearInterval(hashInterval);
  }, []);

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=0284c7,0369a1&fontWeight=700`;

  return (
    <div
      className="hero-pass rounded-3xl relative overflow-hidden p-4 border shadow-[0_14px_36px_rgba(16,185,129,0.18)] bg-gradient-to-br from-[#06182c] via-[#071326] to-[#030914]"
      style={{
        borderColor: proximityWarning ? 'rgba(245, 158, 11, 0.65)' : 'rgba(16, 185, 129, 0.5)'
      }}
    >
      <style>{`
        @keyframes livenessRadarExpand {
          0% { transform: scale(0.75); opacity: 0.9; }
          100% { transform: scale(2.25); opacity: 0; }
        }
        @keyframes particleOrbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes particleOrbitReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* WATERMARK ĐỔI MÀU ĐỘNG IN CHÌM CHỐNG CHỤP MÀN HÌNH ZALO */}
      <div
        className="pointer-events-none select-none absolute inset-0 flex flex-col items-center justify-center opacity-15 font-mono font-black text-[13px] tracking-widest"
        style={{
          transform: 'rotate(-16deg)',
          color: `hsl(${hueShift}, 90%, 65%)`,
          textShadow: `0 0 12px hsl(${(hueShift + 60) % 360}, 90%, 55%)`
        }}
      >
        <div>UTH LIVE • {mssv} • {liveTimeMs}</div>
        <div className="mt-2">{dynamicHash1s} • ANTI-SCREENSHOT</div>
      </div>

      {/* Header Con Dấu Động + Vòng Hạt Phân Tử Xoay (Particle Orbit) */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Vòng hạt phân tử ánh sáng xoay quanh huy hiệu VERIFIED */}
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            <span
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1.5px solid #10B981',
                animation: 'livenessRadarExpand 1.6s infinite ease-out'
              }}
            />
            {/* Quỹ đạo hạt phân tử 1 */}
            <div
              style={{
                position: 'absolute',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px dashed rgba(34, 211, 238, 0.45)',
                animation: 'particleOrbitSpin 3.2s linear infinite'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  left: '50%',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#22D3EE',
                  boxShadow: '0 0 8px #22D3EE'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: -3,
                  left: '50%',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981'
                }}
              />
            </div>
            {/* Quỹ đạo hạt phân tử 2 */}
            <div
              style={{
                position: 'absolute',
                width: 26,
                height: 26,
                borderRadius: '50%',
                animation: 'particleOrbitReverse 2.4s linear infinite'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: -2,
                  top: '50%',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#34D399',
                  boxShadow: '0 0 6px #34D399'
                }}
              />
            </div>

            <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-400/60 flex items-center justify-center z-10 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[11px] font-black tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>VERIFIED • LIVENESS STAMP</span>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate">
              Chứng chỉ hiện diện sống • Chống chụp màn hình Zalo
            </div>
          </div>
        </div>

        {/* Huy hiệu Sinh trắc học WebAuthn */}
        <span className="flex items-center gap-1 text-[9.5px] font-bold font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-1 rounded-xl flex-shrink-0">
          <Fingerprint size={11} />
          <span>FaceID Live</span>
        </span>
      </div>

      {/* HỌ TÊN + MSSV CỠ LỚN KÈM ẢNH HỒ SƠ SỐ (VC AVATAR) ĐỐI SOÁT TẠI CHỖ */}
      <div className="relative z-10 flex items-center gap-3 bg-[#040915]/90 border border-slate-800/90 rounded-2xl p-3 mb-2.5">
        <img
          src={avatarUrl}
          alt={studentName}
          className="w-11 h-11 rounded-xl border border-cyan-400/60 flex-shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] text-cyan-400 font-bold tracking-wider uppercase">
            HỒ SƠ ĐỐI SOÁT TRỰC QUAN (VC HOLDER)
          </div>
          <div className="text-[15px] font-extrabold text-white truncate mt-0.5">
            {studentName}
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs font-mono font-extrabold text-emerald-400">
              MSSV: {mssv}
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              {courseCode} • {room} ({distance})
            </span>
          </div>
          {courseName && (
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {courseName} • Buổi {sessionNumber || 1} ({sessionId})
            </div>
          )}
        </div>
      </div>

      {/* Đồng hồ Mili-giây (40ms) + Mã Watermark Đổi Màu Động */}
      <div className="relative z-10 bg-[#040915]/95 border border-emerald-500/35 rounded-2xl p-3 mb-2.5">
        <div className="flex justify-between items-center gap-2">
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              ĐỒNG HỒ MILI-GIÂY (40MS)
            </div>
            <div className="text-[15px] font-black font-mono text-emerald-400 tracking-wide mt-0.5">
              {liveTimeMs}
            </div>
          </div>

          <div className="text-right min-w-0">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              WATERMARK HASH ĐỘNG (1S)
            </div>
            <div
              className="text-xs font-black font-mono mt-0.5 whitespace-nowrap transition-colors duration-75"
              style={{ color: `hsl(${hueShift}, 92%, 68%)` }}
            >
              {dynamicHash1s}
            </div>
          </div>
        </div>
      </div>

      {/* Cảnh báo nếu phát hiện va chạm vi thời gian */}
      {proximityWarning && (
        <div className="relative z-10 flex items-start gap-1.5 bg-amber-950/40 border border-amber-500/45 rounded-xl p-2.5 mb-2 text-[10px] text-amber-300">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Cảnh báo IDS [{proximityWarning.alert}]:</strong> {proximityWarning.detail}
          </div>
        </div>
      )}

      {/* Sóng hài chuyển động liên tục theo frame */}
      <svg width="100%" height="20" viewBox="0 0 280 20" className="relative z-10 block mb-1.5">
        <path
          d={`M 0 10 Q 35 ${10 + Math.sin((wavePhase * Math.PI) / 180) * 8}, 70 10 T 140 10 T 210 10 T 280 10`}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeOpacity="0.88"
        />
        <path
          d={`M 0 10 Q 35 ${10 - Math.cos((wavePhase * Math.PI) / 180) * 6}, 70 10 T 140 10 T 210 10 T 280 10`}
          fill="none"
          stroke={`hsl(${hueShift}, 90%, 60%)`}
          strokeWidth="1.4"
          strokeOpacity="0.75"
        />
      </svg>

      <div className="relative z-10 flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
        <span className="truncate">EIP-191: <code className="text-cyan-300">{signatureHash}</code></span>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-transparent border-none text-cyan-400 text-[10px] font-bold cursor-pointer hover:underline ml-2 flex-shrink-0"
          >
            Thu gọn
          </button>
        )}
      </div>
    </div>
  );
}
