// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số UTH (Phối màu 5 tầng chuẩn mẫu: #021024, #052659, #5483B3, #7DA0CA, #C1E8FF)
import React, { useState } from 'react';

export default function StudentCardClean({
  student = {
    name: "NGUYỄN ĐỨC HIỂN",
    studentId: "2251120000",
    major: "An toàn Thông tin",
    faculty: "Công nghệ Thông tin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    validUntil: "2027",
    status: "ACTIVE"
  },
  onAvatarChange
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (student.address) {
      navigator.clipboard.writeText(student.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const shortAddress = student.address
    ? student.address.length > 14
      ? `${student.address.slice(0, 6)}...${student.address.slice(-4)}`
      : student.address
    : '';

  return (
    <div className="w-full mx-auto transition-all duration-300 animate-spring-pop">
      {/* Thẻ Sinh Viên UTH Phối Màu 5 Tầng (#021024 • #052659 • #5483B3 • #7DA0CA • #C1E8FF) */}
      <div
        className="card-hover-lift relative rounded-[30px] p-5 border text-white overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #021024 0%, #052659 48%, #5483B3 100%)',
          borderColor: 'rgba(193, 232, 255, 0.42)',
          boxShadow: '0 20px 44px -10px rgba(2, 16, 36, 0.65), inset 0 1px 0 rgba(193, 232, 255, 0.35)'
        }}
      >
        {/* Hiệu ứng lớp chồng (Stacked Pill Glow) lấy cảm hứng từ bảng màu 5 tầng */}
        <div
          className="absolute -right-8 -top-10 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(193, 232, 255, 0.25) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-10 -bottom-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(125, 160, 202, 0.25) 0%, transparent 70%)' }}
        />

        {/* Header Thẻ */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-[#7DA0CA]/30 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #C1E8FF 0%, #7DA0CA 100%)',
                color: '#021024'
              }}
            >
              UTH
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-extrabold uppercase tracking-tight text-white m-0 truncate">
                ĐH Giao thông Vận tải TP.HCM
              </p>
              <p className="text-[9.5px] font-mono font-bold text-[#C1E8FF] m-0 truncate">
                W3C VERIFIABLE CREDENTIAL • FIDO2
              </p>
            </div>
          </div>

          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: 'rgba(193, 232, 255, 0.18)',
              color: '#C1E8FF',
              border: '1px solid rgba(193, 232, 255, 0.45)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1E8FF] animate-pulse" />
            {student.status || "ACTIVE"}
          </span>
        </div>

        {/* Nội dung: Ảnh thẻ và thông tin cá nhân */}
        <div className="relative z-10 flex gap-4 items-center my-4">
          <div className="relative flex-shrink-0 text-center">
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
              alt={student.name}
              className="w-20 h-24 rounded-2xl object-cover border-2 border-[#C1E8FF]/65 shadow-lg block bg-[#021024]"
            />
            {onAvatarChange && (
              <>
                <label
                  htmlFor="student-card-avatar-upload"
                  className="block text-[10px] font-bold text-[#C1E8FF] mt-1.5 cursor-pointer hover:underline"
                >
                  Đổi ảnh
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
            <h3 className="text-base font-extrabold truncate !text-white m-0 tracking-tight">
              {student.name}
            </h3>
            <p className="text-xs font-mono font-bold text-[#C1E8FF] mt-0.5 mb-0">
              MSSV: {student.studentId}
            </p>
            <div className="mt-2 space-y-1 text-xs text-[#C1E8FF]/90">
              <p className="truncate m-0"><span className="text-[#7DA0CA]">Ngành:</span> <b className="!text-white">{student.major}</b></p>
              <p className="truncate m-0"><span className="text-[#7DA0CA]">Khoa:</span> <b className="!text-white">{student.faculty || "Công nghệ Thông tin"}</b></p>
            </div>
          </div>
        </div>

        {/* Footer Thẻ */}
        <div className="relative z-10 pt-3 border-t border-[#7DA0CA]/30 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[#C1E8FF] hover:opacity-90 transition-opacity bg-transparent border-none p-0 cursor-pointer"
          >
            <span className="text-[#7DA0CA]">DID:</span>
            <span className="underline decoration-dotted font-semibold text-[#C1E8FF]">{shortAddress}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#021024]/55 border border-[#7DA0CA]/40 text-[10px] text-[#C1E8FF]">
              {copied ? "✓ Đã chép" : "Sao chép"}
            </span>
          </button>

          <span className="text-[#7DA0CA] text-[11px]">
            Hạn: <strong className="!text-white">{student.validUntil || "2027"}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
