// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số Phong Cách Mint Pastel Bento (Lấy cảm hứng từ Smart Home UI)
import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Camera } from 'lucide-react';

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
    ? student.address.length > 12
      ? `${student.address.slice(0, 6)}..${student.address.slice(-4)}`
      : student.address
    : '0xf39F..2266';

  return (
    <div className="w-full mx-auto stagger-1">
      {/* HERO CARD MINT PASTEL GRADIENT (Chuẩn ảnh mẫu "Cloudy 28°") */}
      <div
        className="relative rounded-[28px] p-5 overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #6CE5D4 0%, #9AF2E5 55%, #CCFBF4 100%)',
          boxShadow: '0 16px 36px rgba(108, 229, 212, 0.18)',
          color: '#0D2628'
        }}
      >
        {/* Ánh sáng trang trí mềm mại góc phải */}
        <div
          className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)' }}
        />

        {/* HÀNG TRÊN: AVATAR + HỌ TÊN NGÀNH (TRÁI) & TRẠNG THÁI LỚN (PHẢI) */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={student.name}
                className="w-14 h-14 rounded-2xl object-cover shadow-md block"
                style={{ border: '2px solid rgba(255, 255, 255, 0.85)', background: '#0D2628' }}
              />
              {onAvatarChange && (
                <>
                  <label
                    htmlFor="student-card-avatar-upload"
                    title="Đổi ảnh thẻ"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0D2628] text-[#7CE8D8] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
                  >
                    <Camera size={12} />
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

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0D2628]/10 text-[#0D2628] text-[9.5px] font-extrabold tracking-wide uppercase mb-1">
                <ShieldCheck size={11} />
                <span>UTH Verifiable ID</span>
              </div>
              <h3 className="text-[16px] font-black truncate text-[#0A1F22] m-0 tracking-tight leading-tight">
                {student.name}
              </h3>
              <p className="text-[11.5px] font-semibold text-[#1E4B4E] m-0 truncate mt-0.5">
                {student.major} • {student.faculty || "CNTT"}
              </p>
            </div>
          </div>

          {/* Góc phải kiểu "28°" trong ảnh mẫu */}
          <div className="text-right flex-shrink-0">
            <div className="text-[22px] font-black tracking-tight text-[#0A1F22] leading-none">
              {student.validUntil || "2027"}
            </div>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#0A1F22] text-[#7CE8D8] text-[9.5px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7CE8D8] animate-pulse" />
              {student.status || "ACTIVE"}
            </span>
          </div>
        </div>

        {/* HÀNG DƯỚI: 4 CỘT THÔNG SỐ (Chuẩn bố cục 31° Sensible | 65% Humidity | 3 W.force | 1009hpa Pressure) */}
        <div
          className="relative z-10 grid grid-cols-4 gap-2 mt-5 pt-3.5"
          style={{ borderTop: '1px solid rgba(13, 38, 40, 0.12)' }}
        >
          <div>
            <div className="text-[12px] font-black font-mono text-[#0A1F22] truncate">
              {student.studentId}
            </div>
            <div className="text-[10px] font-semibold text-[#255457] mt-0.5">
              Mã số SV
            </div>
          </div>

          <div className="text-center">
            <div className="text-[12px] font-black text-[#0A1F22]">
              100%
            </div>
            <div className="text-[10px] font-semibold text-[#255457] mt-0.5">
              Chuyên cần
            </div>
          </div>

          <div className="text-center">
            <div className="text-[12px] font-black text-[#0A1F22]">
              FIDO2
            </div>
            <div className="text-[10px] font-semibold text-[#255457] mt-0.5">
              Chuẩn khóa
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="text-right bg-transparent border-none p-0 cursor-pointer group"
            title="Chạm để sao chép địa chỉ DID"
          >
            <div className="text-[11.5px] font-black font-mono text-[#0A1F22] flex items-center justify-end gap-1 group-hover:opacity-80">
              <span className="truncate">{shortAddress}</span>
              {copied ? <Check size={11} /> : <Copy size={10} />}
            </div>
            <div className="text-[10px] font-semibold text-[#255457] mt-0.5">
              {copied ? "Đã chép DID" : "Ví DID"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
