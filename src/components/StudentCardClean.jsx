// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số Hologram 3D (Parallax Tilt + Shimmer + 3D Flip 180°)
import React, { useRef, useState, useEffect } from 'react';
import {
  QrCode,
  Camera,
  ShieldCheck,
  Fingerprint,
  Copy,
  Check,
  MapPin,
  RotateCw,
  RotateCcw,
  Cpu,
  History,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function StudentCardClean({
  student,
  onScanClick,
  onAvatarChange,
  activeCourseSession,
  spotCheckState,
  onTriggerSpotCheckFaceID,
  coursesCatalog = [],
  onOpenHistoryTab
}) {
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // State góc nghiêng 3D Parallax & vị trí luồng sáng Hologram Shimmer
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 35,
    active: false
  });

  const studentData = student || {
    name: 'NGUYỄN ĐỨC HIỂN',
    studentId: '2251120000',
    major: 'An toàn Thông tin',
    faculty: 'Công nghệ Thông tin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    merkleRoot: '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2',
    merkleProof: ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85'],
    validUntil: '2022 - 2026',
    status: 'ACTIVE'
  };

  const fullAddress = studentData.address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const shortAddress =
    fullAddress.length > 16
      ? `${fullAddress.slice(0, 8)}...${fullAddress.slice(-6)}`
      : fullAddress;

  const merkleProofStr = Array.isArray(studentData.merkleProof)
    ? studentData.merkleProof[0] || '0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85'
    : studentData.merkleProof || '0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85';

  // Cảm biến con quay hồi chuyển trên điện thoại (Gyroscope / DeviceOrientation)
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      // Giới hạn góc nghiêng nhẹ nhàng (-10 độ đến +10 độ)
      const clampedY = Math.max(-10, Math.min(10, Number(e.gamma) * 0.35));
      const clampedX = Math.max(-10, Math.min(10, (Number(e.beta) - 45) * -0.28));
      const glareX = Math.max(10, Math.min(90, 50 + clampedY * 3.8));
      const glareY = Math.max(10, Math.min(90, 50 - clampedX * 3.8));
      setTilt({
        rotateX: Number(clampedX.toFixed(2)),
        rotateY: Number(clampedY.toFixed(2)),
        glareX: Math.round(glareX),
        glareY: Math.round(glareY),
        active: true
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  // Hiệu ứng nghiêng 3D khi rê ngón tay / chuột trên bề mặt thẻ
  const updateTiltFromPoint = (clientX, clientY) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const pctX = Math.max(0, Math.min(1, x / rect.width));
    const pctY = Math.max(0, Math.min(1, y / rect.height));

    const rotateY = (pctX - 0.5) * 18; // -9deg -> +9deg
    const rotateX = (0.5 - pctY) * 15; // -7.5deg -> +7.5deg
    setTilt({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      glareX: Math.round(pctX * 100),
      glareY: Math.round(pctY * 100),
      active: true
    });
  };

  const handlePointerMove = (e) => {
    updateTiltFromPoint(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updateTiltFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleResetTilt = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 35,
      active: false
    });
  };

  const handleCopyAddress = (e) => {
    e?.stopPropagation();
    if (!fullAddress) return;
    try {
      navigator.clipboard.writeText(fullAddress);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } catch {}
  };

  const handleCopyProof = (e) => {
    e?.stopPropagation();
    try {
      navigator.clipboard.writeText(merkleProofStr);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    } catch {}
  };

  const handleFlipCard = (e) => {
    e?.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setIsFlipped((prev) => !prev);
  };

  // Tổng hợp nhanh lịch sử điểm danh cá nhân cho mặt sau thẻ
  const targetMssv =
    studentData.studentId && !studentData.studentId.includes('•')
      ? studentData.studentId
      : '2251120000';

  const personalAttendanceLogs = [];
  (Array.isArray(coursesCatalog) ? coursesCatalog : []).forEach((course) => {
    (course.sessions || []).forEach((ses) => {
      const myRec = (ses.attendees || []).find(
        (a) => (a.studentId || a.mssv) === targetMssv
      );
      if (myRec) {
        personalAttendanceLogs.push({
          id: `${course.courseCode}_B${ses.sessionIndex || 1}`,
          courseCode: course.courseCode,
          sessionIndex: ses.sessionIndex || 1,
          date: ses.date || '',
          time: myRec.checkInTime || '13:30',
          distance: myRec.distance ?? 3
        });
      }
    });
  });

  const displayLogs =
    personalAttendanceLogs.length > 0
      ? personalAttendanceLogs.slice(0, 3)
      : [
          { id: 'IT402_B3', courseCode: 'IT402.N01', sessionIndex: 3, date: '08/11/2026', time: '13:29:50', distance: 2 },
          { id: 'IT402_B2', courseCode: 'IT402.N01', sessionIndex: 2, date: '22/09/2026', time: '13:30:40', distance: 4 },
          { id: 'IT308_B1', courseCode: 'IT308.M11', sessionIndex: 1, date: '18/09/2026', time: '07:32:10', distance: 5 }
        ];

  const baseFlipDeg = isFlipped ? 180 : 0;
  const currentTransform = `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${baseFlipDeg + (isFlipped ? -tilt.rotateY : tilt.rotateY)}deg)`;

  return (
    <div className="w-full space-y-3.5">
      {/* KHUNG 3D PERSPECTIVE CHO THẺ SINH VIÊN HOLOGRAM */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleResetTilt}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleResetTilt}
        className="w-full select-none"
        style={{
          perspective: '1200px'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '266px',
            transformStyle: 'preserve-3d',
            transform: currentTransform,
            transition: tilt.active
              ? 'transform 0.12s ease-out'
              : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          {/* ================= MẶT TRƯỚC THẺ (FRONT FACE) ================= */}
          <div
            className="w-full rounded-3xl p-5 relative overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, #0D3B70 0%, #082347 55%, #041329 100%)',
              border: '1px solid rgba(123, 189, 232, 0.45)',
              boxShadow:
                '0 22px 46px rgba(1, 8, 22, 0.72), 0 0 24px rgba(56, 189, 248, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.22)'
            }}
          >
            {/* Dải phản quang Hologram 3D lấp lánh chạy theo góc nghiêng cảm biến */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-200"
              style={{
                opacity: tilt.active ? 0.85 : 0.45,
                background: `
                  radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.24) 0%, rgba(56, 189, 248, 0.18) 22%, rgba(168, 85, 247, 0.14) 42%, rgba(16, 185, 129, 0.1) 60%, transparent 78%),
                  linear-gradient(${115 + tilt.rotateY * 2.5}deg, transparent 20%, rgba(56, 189, 248, 0.14) 38%, rgba(232, 121, 249, 0.14) 48%, rgba(52, 211, 153, 0.14) 56%, transparent 74%)
                `,
                mixBlendMode: 'screen'
              }}
            />

            {/* Vân sóng bảo mật Guilloche mảnh tinh tế */}
            <div
              className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%)' }}
            />

            {/* HÀNG 1: TÊN TRƯỜNG, HUY HIỆU HOLOGRAM & NÚT LẬT MẶT SAU */}
            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-400/15 border border-sky-300/35 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <ShieldCheck size={19} className="text-sky-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold tracking-wider text-sky-200/90 uppercase truncate">
                    ĐH Giao Thông Vận Tải TP.HCM
                  </div>
                  <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                    <span>Thẻ Sinh Viên Số VC</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-sky-400/20 border border-sky-300/40 text-sky-200">
                      <Sparkles size={10} /> 3D
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {studentData.status === 'ZKP-LITE' ? 'Ẩn danh' : 'Hợp lệ'}
                </span>

                <button
                  type="button"
                  onClick={handleFlipCard}
                  title="Lật thẻ 180° xem Merkle Proof & Lịch sử"
                  className="btn-press px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/45 text-sky-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw size={12} />
                  <span>Mặt sau</span>
                </button>
              </div>
            </div>

            {/* HÀNG 2: ẢNH ĐẠI DIỆN, CHIP GẮN THẺ & HỌ TÊN SINH VIÊN */}
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <img
                  src={studentData.avatar}
                  alt={studentData.name}
                  className="w-[74px] h-[74px] rounded-2xl object-cover border-2 border-sky-300/65 shadow-lg"
                />
                {onAvatarChange && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      title="Đổi ảnh thẻ"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 flex items-center justify-center shadow-md border-2 border-[#082347] cursor-pointer"
                    >
                      <Camera size={13} />
                    </button>
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[17.5px] font-extrabold text-white truncate m-0 leading-snug">
                    {studentData.name}
                  </h3>
                  {/* Chip đồng gắn thẻ căn cước công nghệ cao */}
                  <div
                    title="Chip bảo mật W3C Verifiable Credential"
                    className="w-9 h-7 rounded-md flex items-center justify-center flex-shrink-0 border border-amber-200/60 shadow-inner"
                    style={{
                      background:
                        'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)'
                    }}
                  >
                    <Cpu size={15} className="text-amber-950" />
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[12.5px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-400/20 border border-sky-300/35 text-sky-200">
                    MSSV: {studentData.studentId}
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-200 truncate m-0 mt-1.5">
                  Chuyên ngành: <strong className="text-white">{studentData.major}</strong>
                </p>
              </div>
            </div>

            {/* HÀNG 3: MÃ VÍ ĐỊNH DANH & KHÓA HỌC */}
            <div className="relative z-10 pt-3 border-t border-sky-200/15 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-left rounded-xl px-3 py-2 bg-slate-950/50 border border-sky-200/15 hover:border-sky-300/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[10.5px] text-sky-200/85 font-medium">
                  <span>Địa chỉ ví DID</span>
                  {copiedAddr ? (
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <Check size={11} /> Đã chép
                    </span>
                  ) : (
                    <Copy size={11} />
                  )}
                </div>
                <div className="font-mono text-[12px] font-bold text-white truncate mt-0.5">
                  {shortAddress}
                </div>
              </button>

              <button
                type="button"
                onClick={handleFlipCard}
                className="text-left rounded-xl px-3 py-2 bg-slate-950/50 border border-sky-200/15 hover:border-sky-300/40 cursor-pointer transition-colors flex flex-col justify-center"
              >
                <span className="text-[10.5px] text-sky-200/85 font-medium flex items-center justify-between">
                  <span>Niên khóa • Merkle</span>
                  <RotateCw size={10} className="text-sky-300" />
                </span>
                <span className="text-[12px] font-bold text-white truncate mt-0.5">
                  Khóa {studentData.validUntil || '2022 - 2026'}
                </span>
              </button>
            </div>
          </div>

          {/* ================= MẶT SAU THẺ (BACK FACE - LẬT 180 ĐỘ) ================= */}
          <div
            className="w-full rounded-3xl p-5 absolute inset-0 overflow-hidden flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(145deg, #071F3E 0%, #041226 60%, #020A16 100%)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              boxShadow:
                '0 22px 46px rgba(1, 8, 22, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Dải phản quang Hologram mặt sau */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${100 - tilt.glareX}% ${tilt.glareY}%, rgba(56, 189, 248, 0.18), rgba(16, 185, 129, 0.1) 45%, transparent 75%)`
              }}
            />

            {/* Header Mặt Sau */}
            <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-sky-300/20">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                  Chứng Thực Mật Mã &amp; Lịch Sử Cá Nhân
                </span>
              </div>
              <button
                type="button"
                onClick={handleFlipCard}
                className="btn-press px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-400 text-slate-950 flex items-center gap-1 cursor-pointer border-none"
              >
                <RotateCcw size={12} />
                <span>Mặt trước</span>
              </button>
            </div>

            {/* Khối Địa chỉ ví 0x... & Merkle Proof */}
            <div className="relative z-10 grid grid-cols-1 gap-2 my-2">
              <div className="p-2.5 rounded-xl bg-slate-950/65 border border-sky-300/25 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-sky-300 uppercase">
                    Địa chỉ ví Holder (EIP-191)
                  </div>
                  <div className="font-mono text-[11.5px] font-bold text-white truncate mt-0.5">
                    {fullAddress}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="px-2 py-1 rounded-lg bg-sky-400/15 border border-sky-300/30 text-sky-200 text-[10.5px] font-bold cursor-pointer flex-shrink-0"
                >
                  {copiedAddr ? 'Đã chép' : 'Chép'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/65 border border-emerald-400/25 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-emerald-300 uppercase">
                    Merkle Proof (Cây danh tính UTH)
                  </div>
                  <div className="font-mono text-[11px] font-semibold text-emerald-100 truncate mt-0.5">
                    {merkleProofStr}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyProof}
                  className="px-2 py-1 rounded-lg bg-emerald-400/15 border border-emerald-300/30 text-emerald-200 text-[10.5px] font-bold cursor-pointer flex-shrink-0"
                >
                  {copiedProof ? 'Đã chép' : 'Chép'}
                </button>
              </div>
            </div>

            {/* Lịch sử điểm danh cá nhân gần nhất trên mặt sau thẻ */}
            <div className="relative z-10 pt-2 border-t border-sky-300/15">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-sky-200 flex items-center gap-1">
                  <History size={12} className="text-sky-400" />
                  <span>Các buổi điểm danh gần nhất:</span>
                </span>
                {onOpenHistoryTab && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHistoryTab();
                    }}
                    className="text-[11px] font-bold text-sky-300 hover:text-white bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem toàn kỳ →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {displayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-2 py-1.5 rounded-lg bg-slate-950/70 border border-sky-200/15 text-[10.5px]"
                  >
                    <div className="font-mono font-bold text-sky-300 truncate">
                      {log.courseCode} • B{log.sessionIndex}
                    </div>
                    <div className="text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={10} />
                      <span>{log.time.slice(0, 5)} ({log.distance}m)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NÚT QUÉT QR ĐIỂM DANH TO, RÕ RÀNG, DỄ BẤM */}
      <button
        type="button"
        onClick={onScanClick}
        className="btn-press w-full py-4 px-5 rounded-2xl font-extrabold text-[15px] flex items-center justify-center gap-3 cursor-pointer border-none shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
          color: '#020A15',
          boxShadow: '0 10px 26px rgba(2, 132, 199, 0.42)'
        }}
      >
        <QrCode size={21} strokeWidth={2.4} />
        <span>
          {activeCourseSession?.isOpen
            ? `Quét QR Điểm Danh • ${activeCourseSession.courseCode || 'IT402.N01'}`
            : 'Quét Mã QR Điểm Danh Lớp Học'}
        </span>
      </button>

      {/* Dòng thông tin buổi học đang mở ngắn gọn, dễ nhìn */}
      {activeCourseSession?.isOpen && (
        <div className="px-4 py-3 rounded-2xl bg-[#071C36] border border-sky-400/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 min-w-0">
            <MapPin size={15} className="text-sky-400 flex-shrink-0" />
            <span className="truncate">
              <strong className="text-white">{activeCourseSession.courseName}</strong> • Buổi {activeCourseSession.sessionNumber || 1} ({activeCourseSession.room || 'A2-301'})
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex-shrink-0">
            Đang mở
          </span>
        </div>
      )}

      {/* Nút xác thực lại Face ID khẩn cấp nếu đang có Spot-check 60s */}
      {spotCheckState?.isActive && (
        <button
          type="button"
          onClick={onTriggerSpotCheckFaceID}
          className="btn-press w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-lg cursor-pointer border-none animate-pulse"
        >
          <Fingerprint size={19} />
          <span>Xác Thực Lại Face ID Ngay ({spotCheckState.countdown}s)</span>
        </button>
      )}
    </div>
  );
}
