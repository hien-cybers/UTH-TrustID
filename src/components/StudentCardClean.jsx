// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số UTH (Bo Góc Mềm Mại & Gradient Teal-Cyan Hiện Đại)
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
    <div className="w-full mx-auto transition-colors duration-200 stagger-1">
      {/* Thẻ Sinh Viên UTH Gradient Teal-Navy Mềm Mại */}
      <div className="relative rounded-[26px] p-5 border shadow-xl transition-all duration-200 bg-gradient-to-br from-[#0F293A] via-[#0A1A2F] to-[#060E1C] border-teal-400/30 text-slate-100 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Header Thẻ */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4FF0D6]/25 to-cyan-400/15 border border-[#4FF0D6]/40 flex items-center justify-center font-extrabold text-[#64F5DF] text-xs flex-shrink-0">
              UTH
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-tight text-white m-0 truncate">
                ĐH Giao thông Vận tải TP.HCM
              </p>
              <p className="text-[9px] font-mono font-bold text-[#64F5DF] m-0 truncate">
                W3C VERIFIABLE CREDENTIAL • FIDO2
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4FF0D6]/15 text-[#64F5DF] border border-[#4FF0D6]/35 flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64F5DF] animate-pulse" />
            {student.status || "ACTIVE"}
          </span>
        </div>

        {/* Nội dung: Ảnh thẻ và thông tin cá nhân */}
        <div className="relative z-10 flex gap-4 items-center my-4">
          <div className="relative flex-shrink-0 text-center">
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
              alt={student.name}
              className="w-20 h-24 rounded-2xl object-cover border-2 border-[#4FF0D6]/40 shadow-md block bg-slate-900"
            />
            {onAvatarChange && (
              <>
                <label
                  htmlFor="student-card-avatar-upload"
                  className="block text-[10px] font-bold text-[#64F5DF] mt-1.5 cursor-pointer hover:underline"
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
            <h3 className="text-base font-extrabold truncate text-white m-0 tracking-tight">
              {student.name}
            </h3>
            <p className="text-xs font-mono font-bold text-[#64F5DF] mt-0.5 mb-0">
              MSSV: {student.studentId}
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              <p className="truncate m-0"><span className="text-slate-400">Ngành:</span> <b className="text-white">{student.major}</b></p>
              <p className="truncate m-0"><span className="text-slate-400">Khoa:</span> <b className="text-white">{student.faculty || "Công nghệ Thông tin"}</b></p>
            </div>
          </div>
        </div>

        {/* Footer Thẻ */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#64F5DF] transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            <span>DID:</span>
            <span className="underline decoration-dotted font-semibold text-[#64F5DF]">{shortAddress}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
              {copied ? "✓ Đã chép" : "Sao chép"}
            </span>
          </button>

          <span className="text-slate-400 text-[11px]">
            Hạn: <strong className="text-white">{student.validUntil || "2027"}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
