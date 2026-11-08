// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số (Thiết kế Hiện Đại, Rõ Nét, Dễ Thao Tác)
import React, { useRef, useState } from 'react';
import { QrCode, Camera, ShieldCheck, Fingerprint, Copy, Check, MapPin } from 'lucide-react';

export default function StudentCardClean({
  student,
  onScanClick,
  onAvatarChange,
  activeCourseSession,
  spotCheckState,
  onTriggerSpotCheckFaceID
}) {
  const fileInputRef = useRef(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const studentData = student || {
    name: 'NGUYỄN ĐỨC HIỂN',
    studentId: '2251120000',
    major: 'An toàn Thông tin',
    faculty: 'Công nghệ Thông tin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    validUntil: '2026 - 2030',
    status: 'ACTIVE'
  };

  const shortAddress = studentData.address
    ? studentData.address.length > 16
      ? `${studentData.address.slice(0, 8)}...${studentData.address.slice(-6)}`
      : studentData.address
    : '0xf39F...2266';

  const handleCopyAddress = () => {
    if (!studentData.address) return;
    try {
      navigator.clipboard.writeText(studentData.address);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full space-y-3.5">
      {/* THẺ SINH VIÊN SỐ CAO CẤP (APPLE WALLET STYLE) */}
      <div
        className="w-full rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0D3B70 0%, #082347 55%, #041329 100%)',
          border: '1px solid rgba(123, 189, 232, 0.38)',
          boxShadow: '0 20px 44px rgba(1, 8, 22, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
        }}
      >
        {/* Hiệu ứng ánh sáng nền nhẹ nhàng */}
        <div
          className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%)' }}
        />

        {/* HÀNG 1: TÊN TRƯỜNG & TRẠNG THÁI */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-400/15 border border-sky-300/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={19} className="text-sky-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-sky-200/90 uppercase">
                ĐH Giao Thông Vận Tải TP.HCM
              </div>
              <div className="text-[13.5px] font-bold text-white">
                Thẻ Sinh Viên Điện Tử
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {studentData.status === 'ZKP-LITE' ? 'Ẩn danh' : 'Hợp lệ'}
          </span>
        </div>

        {/* HÀNG 2: ẢNH ĐẠI DIỆN & HỌ TÊN SINH VIÊN RÕ NÉT */}
        <div className="relative z-10 flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <img
              src={studentData.avatar}
              alt={studentData.name}
              className="w-[74px] h-[74px] rounded-2xl object-cover border-2 border-sky-300/60 shadow-lg"
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
                  onClick={() => fileInputRef.current?.click()}
                  title="Đổi ảnh thẻ"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 flex items-center justify-center shadow-md border-2 border-[#082347] cursor-pointer"
                >
                  <Camera size={13} />
                </button>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[18px] font-extrabold text-white truncate m-0 leading-snug">
              {studentData.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-[13px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-400/20 border border-sky-300/35 text-sky-200">
                MSSV: {studentData.studentId}
              </span>
            </div>
            <p className="text-[13px] text-slate-200 truncate m-0 mt-1.5">
              Chuyên ngành: <strong className="text-white">{studentData.major}</strong>
            </p>
          </div>
        </div>

        {/* HÀNG 3: MÃ VÍ ĐỊNH DANH & KHÓA HỌC */}
        <div className="relative z-10 pt-3.5 border-t border-sky-200/15 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="text-left rounded-xl px-3.5 py-2.5 bg-slate-950/45 border border-sky-200/15 hover:border-sky-300/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-sky-200/80 font-medium">
              <span>Mã định danh DID</span>
              {copiedAddr ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <Check size={11} /> Đã chép
                </span>
              ) : (
                <Copy size={11} />
              )}
            </div>
            <div className="font-mono text-[12.5px] font-bold text-white truncate mt-0.5">
              {shortAddress}
            </div>
          </button>

          <div className="rounded-xl px-3.5 py-2.5 bg-slate-950/45 border border-sky-200/15 flex flex-col justify-center">
            <span className="text-[11px] text-sky-200/80 font-medium">Niên khóa</span>
            <span className="text-[12.5px] font-bold text-white truncate mt-0.5">
              Khóa {studentData.validUntil || '2022 - 2026'}
            </span>
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
