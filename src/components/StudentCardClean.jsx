// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số Hologram 3D (Parallax Tilt + 3D Flip 180°) chuẩn Dark Neon Cyberpunk
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ShieldCheck, Copy, Check, QrCode, Sparkles } from 'lucide-react';

export default function StudentCardClean({
  student = {
    name: "NGUYỄN ĐỨC HIỂN",
    studentId: "2251120000",
    major: "An toàn Thông tin",
    faculty: "Công nghệ Thông tin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    merkleRoot: "0x9f84b2c71e09a43d5c621b8e74031a92d8f4c6e1b2a093847561029384756102",
    validUntil: "2027",
    status: "ACTIVE"
  },
  onScanClick,
  onAvatarChange,
  activeCourseSession,
  spotCheckState,
  onTriggerSpotCheckFaceID
}) {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const cardRef = useRef(null);

  // Cảm biến con quay hồi chuyển trên điện thoại cho hiệu ứng Parallax Tilt
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.beta == null || e.gamma == null) return;
      const clampedBeta = Math.max(-20, Math.min(20, e.beta - 40));
      const clampedGamma = Math.max(-20, Math.min(20, e.gamma));
      setTilt({
        rx: Number((-clampedBeta * 0.35).toFixed(2)),
        ry: Number((clampedGamma * 0.35).toFixed(2)),
        gx: Math.round(50 + clampedGamma * 1.8),
        gy: Math.round(50 + clampedBeta * 1.8)
      });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setTilt({
      rx: Number(((0.5 - y) * 10).toFixed(2)),
      ry: Number(((x - 0.5) * 10).toFixed(2)),
      gx: Math.round(x * 100),
      gy: Math.round(y * 100)
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    if (student.address) {
      navigator.clipboard.writeText(`did:ethr:${student.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleFlipToggle = (e) => {
    e?.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setIsFlipped((prev) => !prev);
  };

  const shortAddress = student.address
    ? student.address.length > 14
      ? `${student.address.slice(0, 6)}...${student.address.slice(-4)}`
      : student.address
    : '';

  const merkleRootHex =
    student.merkleRoot ||
    '0x9f84b2c71e09a43d5c621b8e74031a92d8f4c6e1b2a093847561029384756102';

  return (
    <div className="w-full mx-auto transition-colors duration-200 stagger-1">
      {/* Khung 3D Perspective */}
      <div
        ref={cardRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerLeave}
        style={{ perspective: '1200px' }}
        className="w-full select-none"
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: `rotateX(${tilt.rx}deg) rotateY(${
              (isFlipped ? 180 : 0) + tilt.ry
            }deg)`
          }}
          className="relative w-full"
        >
          {/* ================= MẶT TRƯỚC THẺ W3C VERIFIABLE CREDENTIAL ================= */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="sheen-card relative rounded-3xl p-5 border shadow-[0_14px_38px_rgba(0,242,254,0.12)] transition-all duration-200 bg-gradient-to-br from-[#081226] via-[#041529] to-[#020c18] border-cyan-500/40 text-slate-100 overflow-hidden"
          >
            {/* Dải phản quang Hologram động theo góc nghiêng */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(34,211,238,0.18), rgba(16,185,129,0.06) 42%, transparent 70%)`
              }}
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            />
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

            {/* Header Thẻ */}
            <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-slate-800/80 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center font-extrabold text-cyan-400 text-xs shadow-[0_0_12px_rgba(34,211,238,0.2)] flex-shrink-0">
                  UTH
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-tight text-slate-100 m-0 truncate">
                    ĐH Giao thông Vận tải TP.HCM
                  </p>
                  <p className="text-[9px] font-mono font-bold text-cyan-400 m-0 truncate">
                    W3C VERIFIABLE CREDENTIAL • FIDO2
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {student.status || "ACTIVE"}
                </span>

                <button
                  type="button"
                  onClick={handleFlipToggle}
                  title="Lật mặt sau thẻ xem Merkle Proof & DID"
                  className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RotateCw size={10} />
                  <span>3D</span>
                </button>
              </div>
            </div>

            {/* Nội dung: Ảnh thẻ và thông tin cá nhân */}
            <div className="relative z-10 flex gap-4 items-center my-4">
              <div className="relative flex-shrink-0 text-center">
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-b from-cyan-400/60 via-cyan-500/20 to-emerald-400/50 shadow-md">
                  <img
                    src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                    alt={student.name}
                    className="w-20 h-24 rounded-[14px] object-cover block bg-slate-900"
                  />
                </div>
                {onAvatarChange && (
                  <>
                    <label
                      htmlFor="student-card-avatar-upload"
                      className="block text-[10px] font-bold text-cyan-400 mt-1.5 cursor-pointer hover:underline"
                    >
                      Đổi ảnh thẻ
                    </label>
                    <input
                      id="student-card-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarChange}
                    />
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-semibold text-cyan-300 mb-1">
                  <Sparkles size={9} />
                  <span>HOLOGRAM CHIP • EIP-191</span>
                </div>
                <h3 className="text-base font-extrabold truncate text-white m-0 tracking-tight">
                  {student.name}
                </h3>
                <p className="text-xs font-mono font-bold text-cyan-400 mt-0.5 mb-0">
                  MSSV: {student.studentId}
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p className="truncate m-0"><span className="font-semibold text-slate-300">Ngành:</span> {student.major}</p>
                  <p className="truncate m-0"><span className="font-semibold text-slate-300">Khoa:</span> {student.faculty || "Công nghệ Thông tin"}</p>
                </div>
              </div>
            </div>

            {/* Footer Thẻ */}
            <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                <span>DID:</span>
                <span className="underline decoration-dotted font-semibold text-cyan-300">{shortAddress}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-300">
                  {copied ? "✓ Đã chép" : "Sao chép"}
                </span>
              </button>

              <span className="text-slate-400 text-[11px]">
                Hạn: <strong className="text-slate-200">{student.validUntil || "2027"}</strong>
              </span>
            </div>
          </div>

          {/* ================= MẶT SAU THẺ 3D (MERKLE PROOF & VÍ DID) ================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className="absolute inset-0 rounded-3xl p-5 border shadow-[0_14px_38px_rgba(0,242,254,0.16)] bg-gradient-to-br from-[#061022] via-[#041326] to-[#020914] border-cyan-400/50 text-slate-100 flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-[11px] font-mono font-extrabold text-cyan-300 uppercase tracking-wider">
                  MẶT SAU CHỨNG CHỈ SỐ W3C VC
                </span>
              </div>
              <button
                type="button"
                onClick={handleFlipToggle}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 cursor-pointer"
              >
                <RotateCw size={10} />
                <span>Mặt trước</span>
              </button>
            </div>

            <div className="space-y-2 my-2 font-mono text-[10px]">
              <div className="p-2.5 rounded-xl bg-[#030712]/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-0.5">
                  <span>ĐỊA CHỈ VÍ DID (EIP-191 HOLDER)</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-cyan-400 hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 text-[9.5px]"
                  >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                    <span>{copied ? 'Đã chép' : 'Chép DID'}</span>
                  </button>
                </div>
                <div className="text-cyan-300 font-bold break-all leading-tight">
                  did:ethr:{student.address}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#030712]/90 border border-slate-800">
                <div className="text-slate-400 mb-0.5">MERKLE ROOT LỚP HỌC PHẦN (ON-CHAIN)</div>
                <div className="text-emerald-400 font-bold break-all leading-tight">
                  {merkleRootHex.slice(0, 42)}...
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Chuẩn khóa: <b className="text-emerald-400">SECP256K1 + WebAuthn</b></span>
              <span>MSSV: <b className="text-white">{student.studentId}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động chính bên dưới thẻ */}
      {spotCheckState?.isActive ? (
        <button
          type="button"
          onClick={() => onTriggerSpotCheckFaceID && onTriggerSpotCheckFaceID()}
          className="mt-4 w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 animate-bounce border-none cursor-pointer"
        >
          Xác Thực Lại Face ID ({spotCheckState.countdown}s)
        </button>
      ) : (
        <button
          type="button"
          onClick={onScanClick}
          className="btn-press mt-4 w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 border-none cursor-pointer"
        >
          <QrCode size={17} />
          <span>
            {activeCourseSession?.isOpen
              ? `Quét QR Điểm Danh • ${activeCourseSession.courseCode || 'IT402.N01'} (Buổi ${activeCourseSession.sessionNumber || 1})`
              : 'Quét QR Điểm Danh'}
          </span>
        </button>
      )}
    </div>
  );
}
