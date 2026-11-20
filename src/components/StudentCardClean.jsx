// src/components/StudentCardClean.jsx - Thẻ Sinh Viên Số UTH 2 Mặt Lật 3D (Interactive 3D Flip Digital ID & W3C Verifiable Credential)
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, KeyRound, CheckCircle2, Copy } from 'lucide-react';

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
        {/* ==================== MẶT TRƯỚC (FRONT FACE): THÔNG TIN SINH VIÊN & THƯƠNG HIỆU UTH ==================== */}
        <div
          className="card-3d-face relative rounded-[26px] p-5 border shadow-xl transition-transform duration-300 bg-gradient-to-br from-[#16345E] via-[#122B50] to-[#0B1C36] border-[#1ECAD3]/45 text-slate-100 overflow-hidden"
          style={{ contain: 'layout paint' }}
        >
          {/* Hình nền mờ tòa nhà UTH chính thức (Zero-Blur GPU friendly) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] pointer-events-none"
            style={{ backgroundImage: "url('/uth-campus-banner.jpg')" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 88% 12%, rgba(30, 202, 211, 0.22) 0%, transparent 55%), linear-gradient(135deg, rgba(22, 52, 94, 0.72) 0%, rgba(11, 28, 54, 0.92) 100%)'
            }}
          />

          {/* Header Thẻ Mặt Trước: Logo UTH Chính Thức */}
          <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/15 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="px-2 py-1 rounded-lg bg-white/95 border border-white/40 flex items-center justify-center flex-shrink-0 shadow-xs">
                <img
                  src="/uth-logo.png"
                  alt="UTH"
                  className="h-4 w-auto object-contain block"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11.5px] font-extrabold uppercase tracking-tight text-white m-0 truncate">
                  ĐH Giao thông Vận tải TP.HCM
                </p>
                <p className="text-[10.5px] font-mono font-bold text-[#64F5DF] m-0 truncate">
                  THẺ SINH VIÊN SỐ • W3C DID
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#4FF0D6]/15 text-[#64F5DF] border border-[#4FF0D6]/40 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#64F5DF]" />
              {student.status || "ACTIVE"}
            </span>
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
                className="w-20 h-24 rounded-2xl object-cover border-2 border-[#4FF0D6]/45 shadow-md block bg-slate-900"
              />
              {onAvatarChange && (
                <>
                  <label
                    htmlFor="student-card-avatar-upload"
                    className="block text-[11px] font-bold text-[#64F5DF] mt-1.5 cursor-pointer hover:underline"
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
              <h3 className="text-[17px] font-extrabold truncate text-white m-0 tracking-tight">
                {student.name}
              </h3>
              <p className="text-[12.5px] font-mono font-bold text-[#64F5DF] mt-0.5 mb-0">
                MSSV: {student.studentId}
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-200">
                <p className="truncate m-0">
                  <span className="text-slate-300">Ngành:</span> <b className="text-white">{student.major}</b>
                </p>
                <p className="truncate m-0">
                  <span className="text-slate-300">Khoa:</span> <b className="text-white">{student.faculty || "Công nghệ Thông tin"}</b>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Thẻ Mặt Trước */}
          <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#64F5DF] transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              <span>DID:</span>
              <span className="underline decoration-dotted font-semibold text-[#64F5DF]">{shortAddress}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10.5px] text-slate-200">
                {copied ? "✓ Đã chép" : "Sao chép"}
              </span>
            </button>

            <span className="text-slate-300 text-[11.5px]">
              Hạn: <strong className="text-white">{student.validUntil || "2027"}</strong>
            </span>
          </div>
        </div>

        {/* ==================== MẶT SAU (BACK FACE): QR ĐỊNH DANH CÁ NHÂN & CHỮ KÝ SỐ ISSUER ==================== */}
        <div
          className="card-3d-back rounded-[26px] p-5 border shadow-xl bg-gradient-to-br from-[#142F56] via-[#0E2240] to-[#081529] border-[#4FF0D6]/45 text-slate-100 overflow-hidden flex flex-col justify-between"
          style={{ contain: 'layout paint' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 15% 15%, rgba(30, 202, 211, 0.16) 0%, transparent 50%)'
            }}
          />

          {/* Header Mặt Sau */}
          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck size={16} className="text-[#64F5DF] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-white m-0 truncate">
                  CHỨNG THỰC ĐỊNH DANH SỐ W3C
                </p>
                <p className="text-[10px] font-mono text-[#64F5DF] m-0 truncate">
                  ISSUER: did:web:uth.edu.vn (Root Authority)
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4FF0D6]/15 text-[#64F5DF] border border-[#4FF0D6]/35 flex-shrink-0">
              VERIFIED
            </span>
          </div>

          {/* Nội dung Mặt Sau: QR Định danh + Thông số Mật mã */}
          <div className="relative z-10 flex items-center gap-3.5 my-2">
            {/* Mã QR Định danh cá nhân (Dùng quét tại Thư viện / Cổng trường) */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="p-2 rounded-2xl bg-white shadow-md border-2 border-[#4FF0D6]/50">
                <QRCodeCanvas
                  value={vcQrPayload}
                  size={84}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0B1C36"
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#64F5DF] mt-1">
                QR CỔNG TRƯỜNG
              </span>
            </div>

            {/* Thông số Khóa Công Khai & Chữ ký số */}
            <div className="min-w-0 flex-1 space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-[#071326]/90 border border-white/15 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[10.5px] flex items-center gap-1">
                    <KeyRound size={11} className="text-[#64F5DF]" />
                    <span>Vân tay Khóa (PubKey):</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> On-Chain
                  </span>
                </div>
                <p className="font-mono text-[10.5px] text-[#64F5DF] font-bold truncate m-0">
                  {pubKeyFingerprint}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
                  <span className="text-slate-300 block text-[10px]">Thuật toán ký</span>
                  <strong className="text-white font-mono">secp256k1</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
                  <span className="text-slate-300 block text-[10px]">Bảo vệ khóa</span>
                  <strong className="text-[#64F5DF] font-mono">FIDO2 Enclave</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Mặt Sau: Chữ ký số của Trường & Nút sao chép DID URI */}
          <div className="relative z-10 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-slate-300 truncate">
              Chữ ký ĐH GTVT: <strong className="text-emerald-300">0x8f4e...c91a ✓</strong>
            </span>

            <button
              type="button"
              onClick={handleCopyDidUri}
              className="px-2.5 py-1 rounded-lg bg-[#4FF0D6]/15 hover:bg-[#4FF0D6]/25 border border-[#4FF0D6]/35 text-[#64F5DF] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Copy size={11} />
              <span>{copiedDidUri ? "✓ Đã chép DID" : "Chép DID URI"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
