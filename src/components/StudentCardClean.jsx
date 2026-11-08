// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số (Ocean-Ice Holographic DID Card)
import React, { useRef, useState } from 'react';
import { QrCode, Camera, ShieldCheck, Fingerprint, Copy, Check, Radio } from 'lucide-react';

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
    <div className="w-full">
      {/* THẺ SINH VIÊN SỐ HOLOGRAM OCEAN-ICE */}
      <div
        className="w-full rounded-[22px] p-5 relative overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, #0B3363 0%, #071F3F 52%, #031022 100%)',
          border: '1px solid rgba(123, 189, 232, 0.34)',
          boxShadow: '0 18px 42px rgba(1, 8, 20, 0.72), inset 0 1px 0 rgba(189, 216, 233, 0.22)'
        }}
      >
        {/* Ánh sáng cực quang Ocean-Ice mềm mại */}
        <div
          className="pointer-events-none absolute -top-20 -right-16 w-52 h-52 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(123, 189, 232, 0.25) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 w-48 h-48 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, transparent 70%)' }}
        />

        {/* HÀNG 1: TÊN TRƯỜNG & TRẠNG THÁI THẺ */}
        <div className="relative z-10 flex justify-between items-start gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(123, 189, 232, 0.14)',
                border: '1px solid rgba(123, 189, 232, 0.32)'
              }}
            >
              <ShieldCheck size={18} className="text-[#7BBDE8]" />
            </div>
            <div>
              <p className="text-[10.5px] font-bold tracking-wider text-[#BDD8E9] uppercase m-0 leading-tight">
                ĐH Giao Thông Vận Tải TP.HCM
              </p>
              <h2 className="text-[13.5px] font-bold text-[#F0F7FF] m-0 mt-0.5 leading-tight">
                Thẻ Sinh Viên Số • W3C DID
              </h2>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.38)',
              color: '#34D399'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {studentData.status === 'ZKP-LITE' ? 'Ẩn danh ZKP' : 'Đang hoạt động'}
          </span>
        </div>

        {/* HÀNG 2: ẢNH THẺ & THÔNG TIN ĐỊNH DANH */}
        <div className="relative z-10 flex items-center gap-3.5 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={studentData.avatar}
              alt={studentData.name}
              className="w-16 h-16 rounded-2xl object-cover"
              style={{
                border: '2px solid rgba(123, 189, 232, 0.5)',
                boxShadow: '0 6px 16px rgba(0, 10, 24, 0.5)'
              }}
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
                  title="Đổi ảnh thẻ sinh viên"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#38BDF8] hover:bg-[#7BBDE8] text-[#020A15] flex items-center justify-center shadow-md border-2 border-[#061A36] cursor-pointer transition-transform active:scale-90"
                >
                  <Camera size={11} />
                </button>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-extrabold text-[#F0F7FF] truncate m-0 leading-snug tracking-tight">
              {studentData.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="font-mono text-[11.5px] font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(56, 189, 248, 0.16)',
                  border: '1px solid rgba(123, 189, 232, 0.32)',
                  color: '#7BBDE8'
                }}
              >
                MSSV: {studentData.studentId}
              </span>
            </div>
            <p className="text-[12px] text-[#BDD8E9] truncate m-0 mt-1 font-medium">
              Ngành: <span className="text-[#F0F7FF] font-semibold">{studentData.major}</span>
            </p>
          </div>
        </div>

        {/* HÀNG 3: ĐỊA CHỈ VÍ MẬT MÃ & HIỆU LỰC */}
        <div
          className="relative z-10 pt-3 grid grid-cols-2 gap-2.5"
          style={{ borderTop: '1px solid rgba(123, 189, 232, 0.2)' }}
        >
          <div
            onClick={handleCopyAddress}
            title="Chạm để sao chép địa chỉ ví DID"
            className="rounded-xl px-3 py-2 cursor-pointer transition-colors"
            style={{
              background: 'rgba(3, 13, 27, 0.65)',
              border: '1px solid rgba(123, 189, 232, 0.18)'
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10.5px] font-medium text-[#7BBDE8]">Địa chỉ ví DID</span>
              {copiedAddr ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                  <Check size={10} /> Đã chép
                </span>
              ) : (
                <Copy size={11} className="text-[#7BBDE8]/75" />
              )}
            </div>
            <p className="text-[11.5px] font-mono font-semibold text-[#F0F7FF] truncate m-0 mt-0.5">
              {shortAddress}
            </p>
          </div>

          <div
            className="rounded-xl px-3 py-2 flex flex-col justify-center"
            style={{
              background: 'rgba(3, 13, 27, 0.65)',
              border: '1px solid rgba(123, 189, 232, 0.18)'
            }}
          >
            <span className="text-[10.5px] font-medium text-[#7BBDE8]">Chuẩn bảo mật</span>
            <p className="text-[11.5px] font-semibold text-[#F0F7FF] truncate m-0 mt-0.5">
              EIP-191 • Khóa {studentData.validUntil || '2027'}
            </p>
          </div>
        </div>
      </div>

      {/* NÚT QUÉT QR ĐIỂM DANH HOẶC THÔNG BÁO PHIÊN HỌC ĐANG MỞ */}
      <div className="mt-3 flex flex-col gap-2.5">
        {activeCourseSession?.isOpen && (
          <div
            className="rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 65, 116, 0.58), rgba(7, 28, 54, 0.9))',
              border: '1px solid rgba(56, 189, 248, 0.38)'
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Radio size={13} className="text-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-mono text-[11px] font-bold text-[#7BBDE8] truncate">
                  {activeCourseSession.courseCode || 'IT402.N01'} • Buổi {activeCourseSession.sessionNumber || 1}
                </span>
                <span className="text-[11px] text-[#BDD8E9]">
                  • Phòng <b className="text-white">{activeCourseSession.room || 'A2-301'}</b>
                </span>
              </div>
              <div className="text-[12px] font-semibold text-[#F0F7FF] truncate mt-0.5">
                {activeCourseSession.courseName || 'An toàn Mạng máy tính & Ứng dụng'} (R ≤ {activeCourseSession.radius || 35}m)
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 font-mono text-[10.5px] font-semibold flex-shrink-0">
              Đang mở QR
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onScanClick}
          className="btn-press w-full py-3.5 px-4 rounded-2xl font-bold text-[13.5px] flex items-center justify-center gap-2.5 cursor-pointer border-none"
          style={{
            background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
            color: '#020A15',
            boxShadow: '0 10px 24px rgba(2, 132, 199, 0.38)'
          }}
        >
          <QrCode size={18} strokeWidth={2.3} />
          <span>
            {activeCourseSession?.isOpen
              ? `Quét QR Điểm Danh • ${activeCourseSession.courseCode || 'IT402.N01'} (Buổi ${activeCourseSession.sessionNumber || 1})`
              : 'Quét Mã QR Điểm Danh Lớp Học'}
          </span>
        </button>

        {/* Nút xác thực lại Face ID khẩn cấp nếu đang có Spot-check 60s */}
        {spotCheckState?.isActive && (
          <button
            type="button"
            onClick={onTriggerSpotCheckFaceID}
            className="btn-press w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-md cursor-pointer border-none animate-pulse"
          >
            <Fingerprint size={17} />
            <span>Xác Thực Lại Face ID Ngay ({spotCheckState.countdown}s)</span>
          </button>
        )}
      </div>
    </div>
  );
}
