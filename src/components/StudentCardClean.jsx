// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số W3C VC Chuẩn Giao Diện Neon Cyberpunk
import React, { useRef, useState } from 'react';

export default function StudentCardClean({
  student,
  onScanClick,
  onAvatarChange,
  activeCourseSession
}) {
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const studentInfo = {
    name: student?.name || 'NGUYỄN ĐỨC HIỂN',
    studentId: student?.studentId || '2251120000',
    major: student?.major || 'An toàn Thông tin',
    faculty: student?.faculty || 'Công nghệ Thông tin',
    fullDid: student?.address
      ? `did:ethr:${student.address}`
      : 'did:ethr:0xc6DeB98a213A5C913253a6cDb45eD3f44383e645',
    didAddress: student?.address
      ? student.address.length > 12
        ? `${student.address.slice(0, 6)}...${student.address.slice(-4)}`
        : student.address
      : '0xc6De...e645',
    validUntil: '2027',
    status: student?.status || 'ACTIVE',
    avatar:
      student?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  };

  const courseCode = activeCourseSession?.courseCode || 'IT402.N01';
  const courseName = activeCourseSession?.courseName || 'An toàn Mạng máy tính & Ứng dụng';
  const room = activeCourseSession?.room || 'A2-301';
  const sessionNum = activeCourseSession?.sessionNumber || 3;
  const radius = activeCourseSession?.radius || 35;
  const netLabel =
    activeCourseSession?.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Trường' : '4G/5G';

  const handleCopyDid = () => {
    try {
      navigator.clipboard.writeText(studentInfo.fullDid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* THẺ SINH VIÊN SỐ W3C VC */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#0B172E] via-[#081329] to-[#040A17] border border-cyan-500/30 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        {/* Header thẻ */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black text-cyan-400 font-mono">
              UTH
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-white tracking-wide m-0">
                ĐH GIAO THÔNG VẬN TẢI TP.HCM
              </h3>
              <p className="text-[8px] font-mono text-cyan-400 m-0">
                W3C VERIFIABLE CREDENTIAL • FIDO2
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {studentInfo.status}
          </span>
        </div>

        {/* Thân thẻ: Avatar & Thông tin */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-inner bg-slate-950">
              <img src={studentInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
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
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[9px] text-cyan-400 mt-1.5 hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Đổi ảnh thẻ
                </button>
              </>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black text-white tracking-wide m-0">{studentInfo.name}</h4>
            <p className="text-[11px] font-mono text-cyan-300 font-bold tracking-wider m-0">
              MSSV: {studentInfo.studentId}
            </p>
            <p className="text-[10px] text-slate-300 m-0">Ngành: {studentInfo.major}</p>
            <p className="text-[10px] text-slate-400 m-0">Khoa: {studentInfo.faculty}</p>
          </div>
        </div>

        {/* Chân thẻ: DID & Hạn dùng */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>DID:</span>
            <span className="text-cyan-300 underline font-semibold">{studentInfo.didAddress}</span>
            <button
              type="button"
              onClick={handleCopyDid}
              className="text-slate-400 hover:text-white ml-0.5 bg-transparent border-none cursor-pointer p-0 font-mono text-[10px]"
            >
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
          <div className="text-slate-400">
            Hạn: <span className="text-white font-bold">{studentInfo.validUntil}</span>
          </div>
        </div>
      </div>

      {/* NÚT ACTION CHÍNH: QUÉT QR ĐIỂM DANH */}
      <button
        type="button"
        onClick={onScanClick}
        className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] text-slate-950 font-black text-xs tracking-wide shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
      >
        Quét QR Điểm Danh • {courseCode} (Buổi {sessionNum})
      </button>

      {/* THẺ THÔNG TIN LỚP HỌC ĐANG DIỄN RA */}
      <div className="p-4 rounded-3xl bg-[#081226]/80 border border-cyan-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
            {courseCode} • BUỔI HỌC THỨ {sessionNum}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {activeCourseSession?.isOpen !== false ? 'Đang mở QR' : 'Đã chốt sổ'}
          </span>
        </div>

        <p className="text-xs font-bold text-white m-0">{courseName}</p>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] font-mono text-slate-400 m-0">
            Phòng <strong className="text-white">{room}</strong> •{' '}
            <span className="text-cyan-300">R ≤ {radius}m</span> • {netLabel}
          </p>
          <button
            type="button"
            onClick={onScanClick}
            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] shadow-sm transition-all border-none cursor-pointer"
          >
            Quét QR Ngay
          </button>
        </div>
      </div>
    </div>
  );
}
