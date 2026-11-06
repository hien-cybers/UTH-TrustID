// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số Đồng Bộ Màu Light/Dark Mode & Tốc Độ Tức Thì (< 50ms)
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
  onScanClick,
  onAvatarChange,
  spotCheckState,
  onTriggerSpotCheckFaceID
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
    ? `${student.address.slice(0, 6)}...${student.address.slice(-4)}`
    : '';

  return (
    <div className="w-full mx-auto transition-colors duration-200 stagger-1">
      {/* Card Thẻ Sinh Viên - Thiết kế Hologram Sheen đồng đều cả 2 theme */}
      <div className="sheen-card card-interactive relative rounded-3xl p-5 border shadow-xl transition-all duration-200 bg-white border-slate-200 text-slate-900 dark:bg-gradient-to-br dark:from-[#0B1528] dark:via-[#081021] dark:to-[#040915] dark:border-cyan-500/30 dark:text-slate-100 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Header Thẻ */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center font-extrabold text-cyan-600 dark:text-cyan-400 text-xs shadow-sm">
              UTH
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-tight text-slate-800 dark:text-slate-100 m-0">
                ĐH Giao thông Vận tải TP.HCM
              </p>
              <p className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 m-0">
                W3C VERIFIABLE CREDENTIAL • FIDO2
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            {student.status || "ACTIVE"}
          </span>
        </div>

        {/* Nội dung: Ảnh thẻ và thông tin cá nhân */}
        <div className="flex gap-4 items-center my-4">
          <div className="relative flex-shrink-0 text-center">
            <img 
              src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
              alt={student.name}
              className="w-20 h-24 rounded-2xl object-cover border-2 border-cyan-500/35 shadow-md block"
            />
            {onAvatarChange && (
              <>
                <label
                  htmlFor="student-card-avatar-upload"
                  className="block text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mt-1.5 cursor-pointer hover:underline"
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
            <h3 className="text-base font-extrabold truncate text-slate-900 dark:text-white m-0 tracking-tight">
              {student.name}
            </h3>
            <p className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 mb-0">
              MSSV: {student.studentId}
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p className="truncate m-0"><span className="font-semibold text-slate-700 dark:text-slate-300">Ngành:</span> {student.major}</p>
              <p className="truncate m-0"><span className="font-semibold text-slate-700 dark:text-slate-300">Khoa:</span> {student.faculty || "Công nghệ Thông tin"}</p>
            </div>
          </div>
        </div>

        {/* Footer Thẻ */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <button 
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            <span>DID:</span>
            <span className="underline decoration-dotted font-semibold text-cyan-600 dark:text-cyan-300">{shortAddress}</span>
            <span className="text-[10px]">{copied ? "✓ Đã chép" : "📋"}</span>
          </button>

          <span className="text-slate-400 dark:text-slate-400 text-[11px]">
            Hạn: <strong className="text-slate-700 dark:text-slate-200">{student.validUntil || "2027"}</strong>
          </span>
        </div>
      </div>

      {/* Trong giao diện Thẻ sinh viên: Nếu đang có lệnh Spot-check 60s -> Hiển thị nút Tái Xác Thực Ngay */}
      {spotCheckState?.isActive ? (
        <button
          type="button"
          onClick={() => onTriggerSpotCheckFaceID && onTriggerSpotCheckFaceID()}
          className="mt-4 w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 animate-bounce border-none cursor-pointer"
        >
          ⚡ Xác Thực Lại Face ID ({spotCheckState.countdown}s)
        </button>
      ) : (
        <button
          type="button"
          onClick={onScanClick}
          className="btn-press mt-4 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm tracking-wide text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 border-none cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Quét QR Điểm Danh
        </button>
      )}
    </div>
  );
}
