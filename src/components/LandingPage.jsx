import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  Play,
  ShieldCheck,
  Layers,
  Users,
  Zap,
  Fingerprint,
  IdCard,
  GitBranch,
  CheckCircle2,
  X
} from 'lucide-react';

const NAV_SECTION_MODALS = {
  TOPIC: {
    badge: 'ĐỀ TÀI NGHIÊN CỨU KHOA HỌC',
    title: 'Định danh số phi tập trung & Xác thực hiện diện phòng học',
    desc: 'Giải quyết triệt để bài toán giả mạo danh tính, điểm danh hộ, chia sẻ ảnh chụp mã QR và rủi ro lộ lọt cơ sở dữ liệu tập trung trong môi trường đại học.',
    points: [
      'Trao quyền tự chủ danh tính (Self-Sovereign Identity) cho sinh viên trên thiết bị cá nhân theo chuẩn W3C DID Core 1.0.',
      'Loại bỏ hoàn toàn mật khẩu truyền thống bằng khóa phần cứng WebAuthn / FIDO2 (Face ID, Touch ID, Windows Hello).',
      'Xác thực hiện diện đa nhân tố: QR Nonce xoay tự động + Định vị Geofencing Haversine (R ≤ 35m) + Chữ ký số EIP-191.'
    ]
  },
  SOLUTION: {
    badge: 'KIẾN TRÚC GIẢI PHÁP 3 TẦNG',
    title: 'Mô hình Tam giác Tin cậy: Issuer – Holder – Verifier',
    desc: 'Hệ sinh thái UTH-TrustID vận hành độc lập giữa 3 phân hệ được đồng bộ thời gian thực qua WebSocket và Smart Contract:',
    points: [
      '1. Nhà trường / Cổng Quản trị (Issuer): Phát hành chứng chỉ số W3C VC theo lô bằng cây băm Merkle Tree và thu hồi khóa O(1) trên chuỗi.',
      '2. Ví Định danh Sinh viên (Holder Node - Port 5173): Lưu trữ khóa riêng tư bọc AES-GCM 256-bit (PBKDF2 100.000 vòng), hỗ trợ điểm danh Offline & tiết lộ chọn lọc ZKP-Lite.',
      '3. Cổng Điều hành Giảng viên (Verifier - Port 5174): Phát mã QR động, giám sát bản đồ GPS Radar, hậu kiểm Spot-Check 60s và chặn gian lận SOC IDS.'
    ]
  },
  TECH: {
    badge: 'NỀN TẢNG CÔNG NGHỆ CỐT LÕI',
    title: 'Kết hợp W3C DID • WebAuthn FIDO2 • Keccak256 Merkle Tree',
    desc: 'Ba trụ cột mật mã học đảm bảo tính toàn vẹn, chống chối bỏ và tối ưu chi phí vận hành trên Blockchain:',
    points: [
      'W3C DID & Verifiable Credentials: Định danh chuẩn did:uth:secp256k1 tương thích chuẩn quốc tế W3C.',
      'WebAuthn / Passkey & Device Fingerprint: Khóa gắn chặt với phần cứng TPM / Secure Enclave, ngăn chặn 1 thiết bị điểm danh cho 2 MSSV.',
      'Merkle Tree Batching: Gom hàng ngàn bản ghi điểm danh và chứng chỉ thành 1 Merkle Root duy nhất (32 bytes) neo lên Smart Contract.'
    ]
  },
  RESULTS: {
    badge: 'KẾT QUẢ THỰC NGHIỆM & ĐÁNH GIÁ',
    title: 'Hiệu năng vượt trội & Phòng vệ 100% trước 4 kịch bản tấn công',
    desc: 'Kết quả đo kiểm thực tế trên hệ thống UTH-TrustID với quy mô 12.548 định danh và 26.937 chứng chỉ số:',
    points: [
      'Tiết kiệm 96,4% chi phí Gas lưu trữ On-Chain nhờ cơ chế neo lô Merkle Root so với ghi từng chứng chỉ rời rạc.',
      'Độ trễ xác minh nhánh Merkle Proof O(log₂ N) dưới 2 ms; thu hồi khóa thiết bị bị mất độ phức tạp O(1) tức thời.',
      'Hệ thống SOC IDS tự động chặn 100% (HTTP 403): Quét lại QR cũ (Replay Attack), Giả mạo chữ ký, Điểm danh hộ 1 máy 2 SV và Fake GPS.'
    ]
  },
  TEAM: {
    badge: 'ĐỘI NGŨ NGHIÊN CỨU & PHÁT TRIỂN',
    title: 'Trường Đại học Giao thông Vận tải TP.HCM (UTH)',
    desc: 'Đề tài Nghiên cứu Khoa học cấp Trường thuộc Khoa Công nghệ Thông tin – Chuyên ngành An toàn Thông tin & Khoa học Dữ liệu:',
    points: [
      'Đơn vị chủ trì: Khoa Công nghệ Thông tin – Trường Đại học Giao thông Vận tải TP.HCM (UTH).',
      'Giảng viên hướng dẫn & Cổng Giảng viên: TS. Nguyễn Thị Mai / ThS. Nguyễn Thị Hiên.',
      'Nhóm sinh viên thực hiện: Nguyễn Đức Hiển (MSSV: 2251120000) cùng cộng sự nhóm NCKH UTH-TrustID.'
    ]
  }
};

const GITHUB_REPO_URL = 'https://github.com/hien-cybers/UTH-TrustID';

function GitHubIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const BOTTOM_HIGHLIGHTS = [
  {
    id: 'hl-1',
    title: 'An toàn & tin cậy',
    desc: 'Xác thực danh tính bằng khóa công khai (WebAuthn)',
    icon: <ShieldCheck className="w-7 h-7 text-[#C084FC]" />
  },
  {
    id: 'hl-2',
    title: 'Minh bạch dữ liệu',
    desc: 'Bảo toàn và xác minh dữ liệu với Merkle Tree',
    icon: <Layers className="w-7 h-7 text-[#C084FC]" />
  },
  {
    id: 'hl-3',
    title: 'Tự chủ danh tính',
    desc: 'Theo chuẩn W3C DID, người dùng làm chủ dữ liệu',
    icon: <Users className="w-7 h-7 text-[#C084FC]" />
  },
  {
    id: 'hl-4',
    title: 'Ứng dụng thực tiễn',
    desc: 'Xác thực hiện diện phòng học, phù hợp môi trường đại học',
    icon: <Zap className="w-7 h-7 text-[#C084FC]" />
  }
];

export default function LandingPage({ onOpenLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');

  return (
    <div
      className="min-h-screen lg:h-screen w-full bg-[#070618] text-white font-sans select-none overflow-x-hidden lg:overflow-hidden relative flex flex-col justify-between"
      style={{
        background:
          'radial-gradient(circle at 68% 46%, rgba(124, 58, 237, 0.28) 0%, rgba(56, 189, 248, 0.1) 30%, transparent 64%), radial-gradient(circle at 18% 32%, rgba(99, 102, 241, 0.18) 0%, transparent 52%), linear-gradient(180deg, #070618 0%, #0C0926 55%, #07051A 100%)'
      }}
    >
      {/* CSS Keyframes thuần GPU Compositor (0 filter, 0 blur repaint, 0 mousemove JS) -> 60-120fps tuyệt đối */}
      <style>{`
        @keyframes orbitSpinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinCounter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes shieldFloatPulse {
          0%, 100% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
        @keyframes cardFloatGentle {
          0%, 100% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
      `}</style>

      {/* Ảnh thật Tòa nhà Trường Đại học Giao thông Vận tải TP.HCM (UTH) mờ nghệ thuật bên góc phải */}
      <div className="pointer-events-none absolute right-0 top-20 bottom-28 w-[34%] hidden xl:flex flex-col items-end justify-center opacity-35 select-none">
        <div
          className="relative w-96 h-[430px] rounded-l-3xl border-l border-t border-b border-purple-400/40 overflow-hidden shadow-2xl"
          style={{
            transform: 'perspective(900px) rotateY(-14deg) skewY(-2deg)'
          }}
        >
          <img
            src="/uth-campus-banner.jpg"
            alt="UTH Campus"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070618] via-[#150E3A]/55 to-[#150E3A]/30" />
          <div className="absolute top-5 left-5 px-3.5 py-2 rounded-xl bg-[#0D0A24]/85 border border-purple-300/40">
            <img src="/uth-logo.png" alt="UTH" className="h-6 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* ==================== THANH ĐIỀU HƯỚNG TRÊN CÙNG (NAVBAR UTH-TRUSTID CỠ LỚN) ==================== */}
      <header className="relative z-30 w-full border-b border-white/10 bg-[#08071C]/95 shrink-0">
        <div className="w-full max-w-[1920px] 2xl:max-w-[95vw] mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 py-4 lg:py-5 flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo Khiên UTH-TrustID */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveNav('HOME')}
              className="flex items-center gap-3.5 bg-transparent border-none cursor-pointer p-0 text-white group"
            >
              <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_26px_rgba(139,92,246,0.65)] border border-purple-300/40 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-white">
                UTH-TrustID
              </span>
            </button>
            <span className="hidden md:inline-block h-6 w-px bg-white/15" />
          </div>

          {/* Menu Điều Hướng Giữa (Cỡ chữ lớn rõ ràng) */}
          <nav className="hidden lg:flex items-center gap-9 xl:gap-11">
            {[
              { id: 'HOME', label: 'Trang chủ' },
              { id: 'TOPIC', label: 'Đề tài' },
              { id: 'SOLUTION', label: 'Giải pháp' },
              { id: 'TECH', label: 'Công nghệ' },
              { id: 'RESULTS', label: 'Kết quả' },
              { id: 'TEAM', label: 'Đội ngũ' }
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`relative py-2 text-base xl:text-[17px] font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1] shadow-[0_0_12px_rgba(168,85,247,0.95)] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cụm Nút Bên Phải: Mã nguồn & Dùng thử hệ thống */}
          <div className="flex items-center gap-3.5">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 lg:py-3 rounded-2xl bg-[#13102E]/90 hover:bg-[#1D1842] border border-purple-400/35 text-slate-100 hover:text-white text-sm lg:text-base font-semibold no-underline transition-all"
            >
              <GitHubIcon className="w-5 h-5" />
              <span>Mã nguồn</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group relative overflow-hidden px-6 lg:px-7 py-2.5 lg:py-3 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:brightness-110 text-white text-sm lg:text-base font-bold border border-purple-300/45 shadow-[0_0_24px_rgba(139,92,246,0.5)] cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
            >
              <span>Dùng thử hệ thống</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== NỘI DUNG HERO CHÍNH GIỮA (PHÓNG TO CÂN ĐỐI TOÀN MÀN HÌNH & MỌI THIẾT BỊ) ==================== */}
      <main className="relative z-20 flex-1 w-full max-w-[1920px] 2xl:max-w-[95vw] mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 py-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
        
        {/* CỘT TRÁI (6 CỘT): THÔNG ĐIỆP ĐỀ TÀI NCKH UTH-TRUSTID CỠ LỚN */}
        <div className="lg:col-span-6 space-y-6 xl:space-y-7">
          {/* Huy hiệu Đề tài Nghiên cứu khoa học */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#1C1244]/90 border border-purple-400/40 text-purple-200 text-sm sm:text-base lg:text-[17px] font-semibold shadow-[0_0_24px_rgba(139,92,246,0.3)]">
            <GraduationCap className="w-5 h-5 text-[#C084FC]" />
            <span>Đề tài Nghiên cứu khoa học</span>
          </div>

          {/* Tiêu đề lớn UTH-TrustID với vòng cung ánh sáng */}
          <div className="relative inline-block">
            <h1 className="text-5xl sm:text-7xl lg:text-[78px] xl:text-[88px] font-black italic tracking-tight leading-none m-0">
              <span className="text-white drop-shadow-[0_4px_28px_rgba(255,255,255,0.22)]">
                UTH-
              </span>
              <span className="bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#6366F1] bg-clip-text text-transparent drop-shadow-[0_0_38px_rgba(168,85,247,0.6)]">
                TrustID
              </span>
            </h1>
            {/* Vòng cung quỹ đạo ánh sáng bao quanh chữ TrustID */}
            <svg
              className="pointer-events-none absolute -right-10 -top-4 w-64 sm:w-80 xl:w-96 h-24 sm:h-28 xl:h-32 overflow-visible"
              viewBox="0 0 260 90"
              fill="none"
            >
              <path
                d="M10 68 C 95 88, 235 62, 248 22 C 254 5, 220 -4, 175 8"
                stroke="url(#titleArcGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="246" cy="24" r="4" fill="#E9D5FF" />
              <circle cx="155" cy="74" r="2.6" fill="#38BDF8" />
              <defs>
                <linearGradient id="titleArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0)" />
                  <stop offset="60%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Tiêu đề phụ 2 dòng cỡ lớn */}
          <h2 className="text-2xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold text-white leading-[1.22] tracking-tight m-0">
            Định danh số phi tập trung và
            <br />
            xác thực hiện diện phòng học
          </h2>

          {/* Đoạn mô tả chuẩn học thuật cỡ chữ lớn dễ đọc */}
          <p className="text-base sm:text-lg xl:text-[19px] text-slate-200/95 leading-[1.65] m-0 max-w-[660px]">
            Nghiên cứu, thiết kế và phát triển hệ thống định danh số theo chuẩn W3C DID, kết hợp WebAuthn và Merkle Tree, hướng tới môi trường học tập an toàn, minh bạch và không phụ thuộc vào bên trung gian.
          </p>

          {/* Cụm 2 nút CTA cỡ lớn: Khám phá giải pháp & Xem mã nguồn */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group relative overflow-hidden px-7 xl:px-8 py-4 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-base xl:text-lg font-bold border border-purple-300/45 shadow-[0_12px_36px_rgba(139,92,246,0.58)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-3"
            >
              <span className="w-7 h-7 rounded-full bg-white text-[#6D28D9] flex items-center justify-center shadow-xs">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </span>
              <span>Khám phá giải pháp</span>
            </button>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="px-7 xl:px-8 py-4 rounded-2xl bg-[#110E2A] hover:bg-[#1B1640] text-slate-100 text-base xl:text-lg font-semibold border border-purple-400/40 hover:border-purple-300/75 no-underline transition-transform duration-200 hover:scale-[1.02] inline-flex items-center gap-3 shadow-lg"
            >
              <GitHubIcon className="w-5 h-5 text-white" />
              <span>Xem mã nguồn</span>
            </a>
          </div>
        </div>

        {/* CỘT PHẢI (6 CỘT): KHIÊN BẢO VỆ TRUNG TÂM PHÓNG TO VỚI CHUYỂN ĐỘNG XOAY TRÒN 360° (CÔ LẬP GPU CONTAIN) */}
        <div
          className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[540px] xl:min-h-[620px] scale-[0.78] sm:scale-95 lg:scale-100 2xl:scale-105 origin-center"
          style={{ contain: 'layout paint' }}
        >
          {/* Quầng sáng Radial Gradient thuần (KHÔNG dùng blur-3xl gây lag GPU!) */}
          <div
            className="pointer-events-none absolute w-[480px] h-[480px] xl:w-[580px] xl:h-[580px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(168,85,247,0.34) 0%, rgba(56,189,248,0.16) 38%, rgba(124,58,237,0.06) 58%, transparent 72%)'
            }}
          />

          {/* VÒNG QUỸ ĐẠO XOAY TRÒN 1 (NGOÀI CÙNG — GPU LAYER RIÊNG, KHÔNG FILTER DROP-SHADOW) */}
          <div
            className="pointer-events-none absolute w-[420px] h-[420px] sm:w-[490px] sm:h-[490px] xl:w-[550px] xl:h-[550px] rounded-full will-change-transform"
            style={{ animation: 'orbitSpinClockwise 24s linear infinite' }}
          >
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <circle
                cx="200"
                cy="200"
                r="186"
                stroke="url(#outerOrbitGrad)"
                strokeWidth="2"
                strokeDasharray="16 10 4 10"
              />
              {/* 4 điểm sáng dùng vòng halo tròn mờ thay cho filter drop-shadow -> nhanh gấp 20x */}
              <circle cx="200" cy="14" r="11" fill="#A855F7" opacity="0.28" />
              <circle cx="200" cy="14" r="5" fill="#F3E8FF" />
              <circle cx="386" cy="200" r="10" fill="#38BDF8" opacity="0.28" />
              <circle cx="386" cy="200" r="4.8" fill="#BAE6FD" />
              <circle cx="200" cy="386" r="9.5" fill="#C084FC" opacity="0.28" />
              <circle cx="200" cy="386" r="4.5" fill="#E9D5FF" />
              <circle cx="14" cy="200" r="10" fill="#38BDF8" opacity="0.28" />
              <circle cx="14" cy="200" r="4.8" fill="#BAE6FD" />
              <defs>
                <linearGradient id="outerOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* VÒNG QUỸ ĐẠO XOAY TRÒN 2 (BÊN TRONG — XOAY NGƯỢC CHIỀU 360°) */}
          <div
            className="pointer-events-none absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] xl:w-[430px] xl:h-[430px] rounded-full will-change-transform"
            style={{ animation: 'orbitSpinCounter 16s linear infinite' }}
          >
            <svg className="w-full h-full" viewBox="0 0 304 304" fill="none">
              <circle
                cx="152"
                cy="152"
                r="140"
                stroke="url(#innerOrbitGrad)"
                strokeWidth="2.4"
                strokeDasharray="65 35 20 35"
                strokeLinecap="round"
              />
              <circle cx="152" cy="12" r="4.5" fill="#38BDF8" />
              <circle cx="152" cy="292" r="4.5" fill="#E9D5FF" />
              <defs>
                <linearGradient id="innerOrbitGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* ==================== KHIÊN BẢO VỆ 3D CHÍNH GIỮA CỠ LỚN & BỆ ĐẾ HOLOGRAM ==================== */}
          <div className="relative z-20 flex flex-col items-center pt-8">
            <div
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              title="Bấm để truy cập Cổng xác thực UTH-TrustID"
              className="relative cursor-pointer group will-change-transform"
              style={{ animation: 'shieldFloatPulse 5s ease-in-out infinite' }}
            >
              {/* Vòng năng lượng xoay tròn sát viền Khiên */}
              <div
                className="pointer-events-none absolute -inset-6 rounded-full border-2 border-dashed border-sky-400/45 will-change-transform"
                style={{ animation: 'orbitSpinClockwise 12s linear infinite' }}
              />

              <svg
                className="w-52 h-60 sm:w-64 sm:h-72 xl:w-72 xl:h-80 overflow-visible"
                viewBox="0 0 200 230"
                fill="none"
              >
                <defs>
                  <linearGradient id="shieldOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F3E8FF" />
                    <stop offset="35%" stopColor="#A855F7" />
                    <stop offset="75%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="shieldInnerGrad" x1="15%" y1="10%" x2="85%" y2="95%">
                    <stop offset="0%" stopColor="#2E1D7A" stopOpacity="0.96" />
                    <stop offset="55%" stopColor="#170E40" stopOpacity="0.97" />
                    <stop offset="100%" stopColor="#091638" stopOpacity="0.98" />
                  </linearGradient>
                  <linearGradient id="neonRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#E879F9" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>

                {/* Lớp bóng đổ 3D phía sau Khiên */}
                <path
                  d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                  fill="url(#shieldOuterGrad)"
                  opacity="0.38"
                  transform="translate(7, 7)"
                />

                {/* Khung Khiên 3D chính */}
                <path
                  d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                  fill="url(#shieldInnerGrad)"
                  stroke="url(#shieldOuterGrad)"
                  strokeWidth="4.8"
                />

                {/* Đường viền Neon bên trong Khiên */}
                <path
                  d="M100 27 L163 54 V110 C163 155 135 186 100 202 C65 186 37 155 37 110 V54 L100 27 Z"
                  fill="none"
                  stroke="url(#neonRimGrad)"
                  strokeWidth="2.5"
                  opacity="0.95"
                />

                {/* Biểu tượng Người dùng định danh ở chính giữa Khiên */}
                <circle
                  cx="100"
                  cy="94"
                  r="21"
                  fill="url(#shieldOuterGrad)"
                  opacity="0.95"
                />
                <path
                  d="M62 156 C62 133 78 122 100 122 C122 122 138 133 138 156"
                  fill="url(#shieldOuterGrad)"
                  opacity="0.9"
                />

                {/* Huy hiệu Khiên nhỏ có dấu tích xác thực ở góc dưới bên phải */}
                <g transform="translate(122, 134)">
                  <path
                    d="M28 4 L52 14 V35 C52 51 41 63 28 69 C15 63 4 51 4 35 V14 L28 4 Z"
                    fill="#6D28D9"
                    stroke="#F3E8FF"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 36 L25 43 L39 27"
                    stroke="#FFFFFF"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </div>

            {/* Bệ Đế Hologram Phát Sáng (Pure Gradient — không blur-md/blur-xs lặp) */}
            <div className="relative -mt-5 flex flex-col items-center">
              <div
                className="pointer-events-none w-52 h-14 -mb-8"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 85%, rgba(168, 85, 247, 0.48) 0%, rgba(56, 189, 248, 0.25) 45%, transparent 75%)'
                }}
              />
              <div className="relative w-68 sm:w-80 xl:w-96 h-14 rounded-full bg-gradient-to-b from-[#26195C] to-[#0B0724] border-2 border-purple-400/70 shadow-[0_0_32px_rgba(139,92,246,0.5)] flex items-center justify-center overflow-hidden">
                <div className="w-56 sm:w-68 xl:w-80 h-8 rounded-full border-2 border-dashed border-sky-300/75" />
                <div className="absolute inset-x-12 top-1.5 h-2 rounded-full bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
              </div>
              <div
                className="w-80 sm:w-96 xl:w-[440px] h-5 -mt-1"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.4) 0%, transparent 70%)'
                }}
              />
            </div>
          </div>

          {/* ==================== 3 THẺ NODE CÔNG NGHỆ CỠ LỚN (BỎ BACKDROP-BLUR ĐỂ KHÔNG LAG GPU) ==================== */}
          {/* Node 1 (Đỉnh Khiên): W3C DID */}
          <div
            onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
            style={{ animation: 'cardFloatGentle 5s ease-in-out infinite' }}
            className="absolute top-0 sm:top-1 left-1/2 -translate-x-1/2 z-30 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-[#16113A]/96 hover:bg-[#221A58] border border-purple-400/55 shadow-[0_14px_32px_rgba(8,5,28,0.75)] flex items-center gap-4 cursor-pointer transition-colors duration-200 will-change-transform"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#4F46E5] border border-purple-300/50 flex items-center justify-center shrink-0">
              <IdCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="pr-1">
              <div className="text-base sm:text-lg xl:text-xl font-bold text-white leading-tight">
                W3C DID
              </div>
              <div className="text-xs sm:text-sm text-slate-200 whitespace-nowrap mt-0.5">
                Định danh phi tập trung
              </div>
            </div>
          </div>

          {/* Node 2 (Bên Trái Khiên): WebAuthn */}
          <div
            onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
            style={{
              animation: 'cardFloatGentle 5.6s ease-in-out infinite',
              animationDelay: '0.8s'
            }}
            className="absolute -left-2 sm:left-0 xl:left-2 top-[48%] -translate-y-1/2 z-30 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-[#16113A]/96 hover:bg-[#221A58] border border-purple-400/55 shadow-[0_14px_32px_rgba(8,5,28,0.75)] flex items-center gap-4 cursor-pointer transition-colors duration-200 will-change-transform"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#38BDF8] border border-sky-300/60 flex items-center justify-center shrink-0">
              <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="text-base sm:text-lg xl:text-xl font-bold text-white leading-tight">
                WebAuthn
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-snug mt-0.5">
                Xác thực an toàn,
                <br />
                không mật khẩu
              </div>
            </div>
          </div>

          {/* Node 3 (Bên Phải Khiên): Merkle Tree */}
          <div
            onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
            style={{
              animation: 'cardFloatGentle 5.3s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
            className="absolute -right-2 sm:right-0 xl:right-2 top-[53%] -translate-y-1/2 z-30 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-[#16113A]/96 hover:bg-[#221A58] border border-purple-400/55 shadow-[0_14px_32px_rgba(8,5,28,0.75)] flex items-center gap-4 cursor-pointer transition-colors duration-200 will-change-transform"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] border border-purple-300/50 flex items-center justify-center shrink-0">
              <GitBranch className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="text-base sm:text-lg xl:text-xl font-bold text-white leading-tight">
                Merkle Tree
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-snug mt-0.5">
                Xác minh dữ liệu
                <br />
                nhanh và minh bạch
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ==================== DẢI 4 GIÁ TRỊ CỐT LÕI CỠ LỚN Ở CHÂN TRANG ==================== */}
      <footer className="relative z-20 w-full bg-[#090720]/96 border-t border-purple-500/30 shadow-[0_-10px_30px_rgba(7,6,24,0.75)] shrink-0">
        <div className="w-full max-w-[1920px] 2xl:max-w-[95vw] mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 py-5 lg:py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-purple-500/20">
          {BOTTOM_HIGHLIGHTS.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="flex items-start gap-4 py-3 lg:py-1.5 lg:px-7 first:lg:pl-0 last:lg:pr-0 cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#17113A] border border-purple-400/35 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.25)] group-hover:border-purple-300 group-hover:scale-105 transition-all">
                {item.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg xl:text-[19px] font-extrabold text-white m-0 group-hover:text-[#C084FC] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm xl:text-[15px] text-slate-300 m-0 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </footer>
      {/* ==================== MODAL NỘI DUNG HỌC THUẬT KHI BẤM CÁC MỤC NAVBAR (ĐỀ TÀI / GIẢI PHÁP / CÔNG NGHỆ / KẾT QUẢ / ĐỘI NGŨ) ==================== */}
      {activeNav !== 'HOME' && NAV_SECTION_MODALS[activeNav] && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveNav('HOME');
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="uth-modal-panel w-full max-w-2xl rounded-3xl bg-[#120E2E] border border-purple-400/45 p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1.5">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold tracking-wider">
                  {NAV_SECTION_MODALS[activeNav].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white m-0">
                  {NAV_SECTION_MODALS[activeNav].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNav('HOME')}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl p-2 border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed m-0">
              {NAV_SECTION_MODALS[activeNav].desc}
            </p>

            <div className="space-y-3">
              {NAV_SECTION_MODALS[activeNav].points.map((pt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#1A1440] border border-purple-400/25 flex items-start gap-3 text-sm sm:text-[15px] text-slate-100 leading-relaxed"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#C084FC] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'TOPIC', label: 'Đề tài' },
                  { id: 'SOLUTION', label: 'Giải pháp' },
                  { id: 'TECH', label: 'Công nghệ' },
                  { id: 'RESULTS', label: 'Kết quả' },
                  { id: 'TEAM', label: 'Đội ngũ' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveNav(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                      activeNav === tab.id
                        ? 'bg-[#7C3AED] text-white border-purple-300'
                        : 'bg-[#19133C] text-slate-300 border-purple-500/25 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveNav('HOME')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-semibold border-none cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('HOME');
                    if (onOpenLogin) onOpenLogin('FACULTY');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Dùng thử hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
