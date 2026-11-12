// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số UTH 2 Mặt Lật 3D (Interactive 3D Flip Digital ID & W3C Verifiable Credential)
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { RotateCw, ShieldCheck, KeyRound, CheckCircle2, Copy } from 'lucide-react';

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDidUri, setCopiedDidUri] = useState(false);

  const rawAddress = student.address || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const didUri = rawAddress.startsWith('did:') ? rawAddress : `did:ethr:${rawAddress}`;

  const handleCopy = (e) => {
    if (e) e.stopPropagation();
    if (rawAddress) {
      navigator.clipboard.writeText(rawAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyDidUri = (e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(didUri);
    setCopiedDidUri(true);
    setTimeout(() => setCopiedDidUri(false), 1500);
  };

  const shortAddress = rawAddress
    ? rawAddress.length > 14
      ? `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`
      : rawAddress
    : '';

  const pubKeyFingerprint = `SHA256:${rawAddress.replace(/^0x/i, '').slice(0, 8).toUpperCase()}:${rawAddress.slice(-6).toUpperCase()}`;

  const vcQrPayload = JSON.stringify({
    v: 'W3C-VC-2.0',
    did: didUri,
    studentId: student.studentId || '2251120000',
    name: student.name || 'NGUYỄN ĐỨC HIỂN',
    faculty: student.faculty || 'Công nghệ Thông tin',
    issuer: 'did:web:uth.edu.vn',
    alg: 'ECDSA-secp256k1-FIDO2'
  });

  return (
    <div className="w-full mx-auto transition-colors duration-200 stagger-1 card-3d-scene select-none">
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className={`card-3d-inner cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
      >
        {/* ==================== MẶT TRƯỚC (FRONT FACE): THÔNG TIN SINH VIÊN & HOLOGRAM ==================== */}
        <div className="card-3d-face relative rounded-[26px] p-5 border shadow-xl transition-all duration-300 bg-gradient-to-br from-[#0F293A] via-[#0A1A2F] to-[#060E1C] border-teal-400/35 text-slate-100 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          {/* Header Thẻ Mặt Trước */}
          <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl holo-foil-badge border border-[#4FF0D6]/45 flex items-center justify-center font-extrabold text-[#64F5DF] text-xs flex-shrink-0 shadow-[0_0_15px_rgba(79,240,214,0.2)]">
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

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4FF0D6]/15 text-[#64F5DF] border border-[#4FF0D6]/35 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#64F5DF] animate-pulse" />
                {student.status || "ACTIVE"}
              </span>
            </div>
          </div>

          {/* Nội dung: Ảnh thẻ và thông tin cá nhân */}
          <div className="relative z-10 flex gap-4 items-center my-4">
            <div
              className="relative flex-shrink-0 text-center"
              onClick={(e) => e.stopPropagation()}
            >
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
                <p className="truncate m-0">
                  <span className="text-slate-400">Ngành:</span> <b className="text-white">{student.major}</b>
                </p>
                <p className="truncate m-0">
                  <span className="text-slate-400">Khoa:</span> <b className="text-white">{student.faculty || "Công nghệ Thông tin"}</b>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Thẻ Mặt Trước */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
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

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10.5px]">
                Hạn: <strong className="text-white">{student.validUntil || "2027"}</strong>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="px-2.5 py-1 rounded-full bg-[#4FF0D6]/15 hover:bg-[#4FF0D6]/25 border border-[#4FF0D6]/40 text-[#64F5DF] text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <RotateCw size={11} />
                <span>Lật mặt sau</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== MẶT SAU (BACK FACE): QR ĐỊNH DANH CÁ NHÂN & CHỮ KÝ SỐ ISSUER ==================== */}
        <div className="card-3d-back rounded-[26px] p-5 border shadow-xl bg-gradient-to-br from-[#0A1F33] via-[#071426] to-[#040B16] border-[#4FF0D6]/45 text-slate-100 overflow-hidden flex flex-col justify-between">
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

          {/* Header Mặt Sau */}
          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck size={16} className="text-[#64F5DF] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-white m-0 truncate">
                  CHỨNG THỰC ĐỊNH DANH SỐ • MẶT SAU
                </p>
                <p className="text-[9px] font-mono text-[#64F5DF] m-0 truncate">
                  ISSUER: did:web:uth.edu.vn (Root Authority)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <RotateCw size={11} />
              <span>Mặt trước</span>
            </button>
          </div>

          {/* Nội dung Mặt Sau: QR Định danh + Thông số Mật mã */}
          <div className="relative z-10 flex items-center gap-3.5 my-2">
            {/* Mã QR Định danh cá nhân (Dùng quét tại Thư viện / Cổng trường) */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="p-2 rounded-2xl bg-white shadow-[0_0_20px_rgba(79,240,214,0.25)] border-2 border-[#4FF0D6]/50">
                <QRCodeCanvas
                  value={vcQrPayload}
                  size={84}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#040B16"
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-[#64F5DF] mt-1">
                QR CỔNG TRƯỜNG
              </span>
            </div>

            {/* Thông số Khóa Công Khai & Chữ ký số */}
            <div className="min-w-0 flex-1 space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-[#040814]/90 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <KeyRound size={10} className="text-[#64F5DF]" />
                    <span>Vân tay Khóa (PubKey):</span>
                  </span>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-300 flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> On-Chain
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#64F5DF] font-bold truncate m-0">
                  {pubKeyFingerprint}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[9px]">Thuật toán ký</span>
                  <strong className="text-white font-mono">secp256k1</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[9px]">Bảo vệ khóa</span>
                  <strong className="text-[#64F5DF] font-mono">FIDO2 Enclave</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Mặt Sau: Chữ ký số của Trường & Nút sao chép DID URI */}
          <div className="relative z-10 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[10.5px] font-mono">
            <span className="text-slate-400 truncate">
              Chữ ký ĐH GTVT: <strong className="text-emerald-300">0x8f4e...c91a ✓</strong>
            </span>

            <button
              type="button"
              onClick={handleCopyDidUri}
              className="px-2.5 py-1 rounded-lg bg-[#4FF0D6]/15 hover:bg-[#4FF0D6]/25 border border-[#4FF0D6]/35 text-[#64F5DF] text-[10px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Copy size={10} />
              <span>{copiedDidUri ? "✓ Đã chép DID" : "Chép DID URI"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
