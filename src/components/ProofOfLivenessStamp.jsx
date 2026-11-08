// src/components/ProofOfLivenessStamp.jsx - Con Dấu Động Chống Chụp Màn Hình (Dynamic Liveness Stamp)
// 1. Đồng hồ mili-giây (40ms): Nhảy số liên tục ở góc để Giảng viên nhìn lướt qua biết ngay App thật đang chạy.
// 2. Hạt phân tử xoay (Particle Orbit): Các hạt ánh sáng li ti chuyển động tròn quanh huy hiệu UTH / chữ tick xanh VERIFIED.
// 3. Mã Watermark đổi màu động: Mã hash gói tin in chìm chéo và biến thiên màu theo thời gian thực chống gửi ảnh qua Zalo.
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Fingerprint, Lock, Sparkles, AlertTriangle } from 'lucide-react';

export default function ProofOfLivenessStamp({
  studentName = 'NGUYỄN ĐỨC HIỂN',
  mssv = '2251120000',
  sessionId = 'SES_A2301',
  courseCode = 'IT402.N01',
  courseName = 'An toàn Mạng máy tính & Ứng dụng',
  room = 'A2-301',
  sessionNumber = 3,
  signatureHash = '0x8f92c1a4e7b0...3d1a',
  distance = '3m',
  biometricVerified = true,
  proximityWarning = null,
  onClose
}) {
  const [liveTime, setLiveTime] = useState(() => {
    const d = new Date();
    return `${d.toLocaleTimeString('vi-VN', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
  });
  const [dynamicHash1s, setDynamicHash1s] = useState('A9F4•C82E•71B0');
  const [colorPhase, setColorPhase] = useState(0);

  // 1. Đồng hồ mili-giây nhảy số liên tục mỗi 40ms (25 khung hình/giây)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setLiveTime(`${timeStr}.${ms}`);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // 2. Biến thiên mã băm động & pha màu Watermark mỗi 900ms
  useEffect(() => {
    const computeDynamicToken = () => {
      const secSlot = Math.floor(Date.now() / 1000);
      const seed = `${sessionId}:${mssv}:${signatureHash}:${secSlot}`;
      let h1 = 0x811c9dc5;
      let h2 = 0x01000193;
      for (let i = 0; i < seed.length; i++) {
        const ch = seed.charCodeAt(i);
        h1 ^= ch;
        h1 = Math.imul(h1, 0x01000193) >>> 0;
        h2 ^= ch + i;
        h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
      }
      const hex1 = h1.toString(16).toUpperCase().padStart(8, '0');
      const hex2 = h2.toString(16).toUpperCase().padStart(8, '0');
      setDynamicHash1s(`${hex1.slice(0, 4)}•${hex1.slice(4, 8)}•${hex2.slice(0, 4)}`);
      setColorPhase((p) => (p + 1) % 360);
    };

    computeDynamicToken();
    const hashInterval = setInterval(computeDynamicToken, 900);
    return () => clearInterval(hashInterval);
  }, [sessionId, mssv, signatureHash]);

  const watermarkLines = Array.from({ length: 6 }).map(
    (_, idx) =>
      `${signatureHash} • ${dynamicHash1s} • UTH-${mssv} • ${courseCode} • LIVE-${idx + 1}`
  );

  return (
    <div
      className="animate-fade-scale relative overflow-hidden rounded-3xl p-5"
      style={{
        background: 'linear-gradient(155deg, #041E2B 0%, #05162C 52%, #030C1A 100%)',
        border: '1.5px solid rgba(52, 211, 153, 0.55)',
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.78), 0 0 32px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* CSS Keyframes cho Hạt phân tử xoay (Particle Orbit) & Mã Watermark đổi màu động */}
      <style>{`
        @keyframes livenessOrbitCw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes livenessOrbitCcw {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes watermarkHueFlow {
          0% {
            color: rgba(56, 189, 248, 0.16);
            text-shadow: 0 0 8px rgba(56, 189, 248, 0.12);
            transform: translateX(-4%) rotate(-14deg);
          }
          33% {
            color: rgba(52, 211, 153, 0.19);
            text-shadow: 0 0 8px rgba(52, 211, 153, 0.14);
            transform: translateX(2%) rotate(-14deg);
          }
          66% {
            color: rgba(167, 139, 250, 0.17);
            text-shadow: 0 0 8px rgba(167, 139, 250, 0.13);
            transform: translateX(-2%) rotate(-14deg);
          }
          100% {
            color: rgba(56, 189, 248, 0.16);
            text-shadow: 0 0 8px rgba(56, 189, 248, 0.12);
            transform: translateX(-4%) rotate(-14deg);
          }
        }
        @keyframes livenessSweepBar {
          0% { transform: translateX(-110%) skewX(-18deg); }
          100% { transform: translateX(210%) skewX(-18deg); }
        }
      `}</style>

      {/* LỚP 1: MÃ WATERMARK HASH GÓI TIN IN CHÌM ĐỔI MÀU ĐỘNG THEO THỜI GIAN THỰC */}
      <div
        className="pointer-events-none select-none absolute -inset-8 flex flex-col justify-between z-0 overflow-hidden"
        style={{
          animation: 'watermarkHueFlow 4.2s ease-in-out infinite'
        }}
      >
        {watermarkLines.map((line, idx) => (
          <div
            key={idx}
            className="font-mono text-[10.5px] font-extrabold whitespace-nowrap tracking-wider"
            style={{
              marginLeft: idx % 2 === 0 ? '-20px' : '15px'
            }}
          >
            {line} • {line}
          </div>
        ))}
      </div>

      {/* Luồng sáng quét chống chụp màn hình tĩnh */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.13), rgba(56, 189, 248, 0.13), transparent)',
          animation: 'livenessSweepBar 2.8s infinite linear'
        }}
      />

      {/* HÀNG TRÊN CÙNG: TIÊU ĐỀ CHỨNG CHỈ & ĐỒNG HỒ MILI-GIÂY (40ms) Ở GÓC */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/45 text-emerald-300 text-[11px] font-extrabold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>CHỨNG CHỈ HIỆN DIỆN SỐNG</span>
        </div>

        {/* Đồng hồ mili-giây 40ms nhảy số liên tục ở góc phải */}
        <div
          title="Đồng hồ mili-giây 40ms chống chụp màn hình gửi qua Zalo"
          className="px-3 py-1 rounded-xl bg-slate-950/85 border border-sky-400/50 font-mono text-[12.5px] font-extrabold text-sky-300 shadow-md flex items-center gap-1.5"
        >
          <Sparkles size={12} className="text-emerald-400 animate-spin" />
          <span>{liveTime}</span>
        </div>
      </div>

      {/* TRUNG TÂM: VÒNG HẠT PHÂN TỬ XOAY (PARTICLE ORBIT) QUANH LOGO TRƯỜNG / TICK XANH VERIFIED */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 py-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Vòng quỹ đạo ngoài (Xoay thuận chiều kim đồng hồ - 4 hạt phân tử ánh sáng) */}
          <div
            className="absolute inset-0 rounded-full border border-dashed border-emerald-400/35"
            style={{ animation: 'livenessOrbitCw 5.5s linear infinite' }}
          >
            {/* Hạt phân tử 1 (Top) */}
            <span
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 12px #34D399, 0 0 20px #10B981' }}
            />
            {/* Hạt phân tử 2 (Bottom) */}
            <span
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-400"
              style={{ boxShadow: '0 0 12px #38BDF8' }}
            />
            {/* Hạt phân tử 3 (Left) */}
            <span
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300"
              style={{ boxShadow: '0 0 10px #FBBF24' }}
            />
            {/* Hạt phân tử 4 (Right) */}
            <span
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-300"
              style={{ boxShadow: '0 0 10px #6EE7B7' }}
            />
          </div>

          {/* Vòng quỹ đạo trong (Xoay ngược chiều kim đồng hồ - 3 hạt phân tử ánh sáng) */}
          <div
            className="absolute inset-3 rounded-full border border-sky-400/35"
            style={{ animation: 'livenessOrbitCcw 3.6s linear infinite' }}
          >
            <span
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-300"
              style={{ boxShadow: '0 0 10px #38BDF8' }}
            />
            <span
              className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 10px #10B981' }}
            />
            <span
              className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-purple-400"
              style={{ boxShadow: '0 0 10px #C084FC' }}
            />
          </div>

          {/* Huy hiệu trung tâm UTH + Chữ Tick Xanh VERIFIED */}
          <div
            className="relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-emerald-300/70 shadow-xl"
            style={{
              background: 'radial-gradient(circle, #059669 0%, #064E3B 100%)',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)'
            }}
          >
            <CheckCircle2 size={28} className="text-white drop-shadow" />
            <span className="text-[8.5px] font-black tracking-widest text-emerald-100 mt-0.5">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Họ tên & MSSV Sinh viên đã xác thực */}
        <h3 className="text-[18px] font-extrabold text-white tracking-tight m-0 mt-1 text-center">
          {studentName}
        </h3>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-400/20 border border-sky-300/35 text-sky-200">
            MSSV: {mssv}
          </span>
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/35 text-emerald-300">
            Cách tâm: {distance}
          </span>
        </div>
      </div>

      {/* KHỐI THÔNG TIN LỚP HỌC & WATERMARK ĐỘNG ĐỔI MÀU */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-slate-950/75 border border-sky-300/25 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-300">Học phần:</span>
          <span className="font-bold text-white truncate">
            {courseCode} • Buổi {sessionNumber} ({room})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-300">Hash gói tin (Đổi màu động):</span>
          <span
            className="font-mono font-extrabold text-[11.5px] px-2 py-0.5 rounded-md border transition-colors duration-500"
            style={{
              color: colorPhase % 2 === 0 ? '#34D399' : '#38BDF8',
              borderColor:
                colorPhase % 2 === 0 ? 'rgba(52, 211, 153, 0.45)' : 'rgba(56, 189, 248, 0.45)',
              background:
                colorPhase % 2 === 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.14)'
            }}
          >
            {dynamicHash1s}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-sky-200/15">
          <span className="text-slate-300">Chữ ký EIP-191:</span>
          <span className="font-mono text-[11px] font-bold text-sky-300 truncate max-w-[190px]">
            {signatureHash}
          </span>
        </div>
      </div>

      {/* CẢNH BÁO FAKE GPS NẾU ĐANG BẬT THỰC NGHIỆM GIẢ LẬP VỊ TRÍ */}
      {proximityWarning && (
        <div className="relative z-10 mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-start gap-2 text-xs text-amber-200">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">{proximityWarning.alert}</div>
            <div className="text-[11px] mt-0.5">{proximityWarning.detail}</div>
          </div>
        </div>
      )}

      {/* HUY HIỆU BẢO MẬT PHẦN CỨNG */}
      <div className="relative z-10 mt-3 flex items-center justify-between gap-2 text-[11px] text-emerald-300 font-semibold">
        <span className="flex items-center gap-1">
          <Fingerprint size={13} />
          <span>{biometricVerified ? 'Đã ký Face ID phần cứng' : 'Đã ký EIP-191'}</span>
        </span>
        <span className="flex items-center gap-1 text-sky-300">
          <Lock size={12} />
          <span>Chống chụp màn hình Zalo</span>
        </span>
      </div>
    </div>
  );
}
