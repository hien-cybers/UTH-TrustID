import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ArrowRight,
  ArrowUp,
  Play,
  ShieldCheck,
  Layers,
  Users,
  Zap,
  Fingerprint,
  IdCard,
  GitBranch,
  CheckCircle2,
  Building2,
  Smartphone,
  MonitorCheck,
  ShieldAlert,
  BookOpen
} from 'lucide-react';

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

const NAV_ITEMS = [
  { id: 'HOME', label: 'Trang chủ' },
  { id: 'TOPIC', label: 'Đề tài' },
  { id: 'SOLUTION', label: 'Giải pháp' },
  { id: 'TECH', label: 'Công nghệ' },
  { id: 'RESULTS', label: 'Kết quả' },
  { id: 'TEAM', label: 'Đội ngũ' }
];

const CORE_HIGHLIGHTS = [
  {
    id: 'hl-1',
    title: 'An toàn & Tin cậy',
    desc: 'Xác thực danh tính bằng khóa công khai phần cứng WebAuthn / FIDO2.',
    icon: <ShieldCheck className="w-6 h-6 text-[#C084FC]" />
  },
  {
    id: 'hl-2',
    title: 'Minh bạch dữ liệu',
    desc: 'Bảo toàn, đóng lô và đối soát tính toàn vẹn dữ liệu bằng Merkle Tree.',
    icon: <Layers className="w-6 h-6 text-[#38BDF8]" />
  },
  {
    id: 'hl-3',
    title: 'Tự chủ danh tính',
    desc: 'Tuân thủ chuẩn W3C DID Core 1.0, sinh viên làm chủ khóa riêng tư.',
    icon: <Users className="w-6 h-6 text-[#A855F7]" />
  },
  {
    id: 'hl-4',
    title: 'Ứng dụng thực tiễn',
    desc: 'Xác thực hiện diện phòng học thời gian thực, tối ưu cho đại học.',
    icon: <Zap className="w-6 h-6 text-[#34D399]" />
  }
];

const TOPIC_OBJECTIVES = [
  {
    num: '01',
    title: 'Tự chủ danh tính chuẩn W3C DID',
    desc: 'Trao quyền sở hữu danh tính (Self-Sovereign Identity) trực tiếp trên thiết bị cá nhân của sinh viên, loại bỏ nguy cơ rò rỉ dữ liệu tập trung.'
  },
  {
    num: '02',
    title: 'Xác thực không mật khẩu (Passwordless FIDO2)',
    desc: 'Thay thế mật khẩu truyền thống bằng sinh trắc học phần cứng WebAuthn (Face ID, Touch ID, Windows Hello) gắn liền định danh thiết bị.'
  },
  {
    num: '03',
    title: 'Xác thực hiện diện phòng học đa nhân tố',
    desc: 'Kết hợp mã QR Nonce xoay tự động, khoanh vùng tọa độ GPS Geofencing (R ≤ 35m) và chữ ký số mật mã EIP-191 chống điểm danh hộ tuyệt đối.'
  }
];

const SOLUTION_LAYERS = [
  {
    step: '01',
    role: 'ISSUER • NHÀ TRƯỜNG',
    title: 'Cổng Quản trị (Admin Portal)',
    badge: 'Port 5174 • Admin',
    icon: <Building2 className="w-6 h-6 text-white" />,
    accent: 'from-violet-600 to-indigo-600',
    items: [
      'Cấp phát & quản lý định danh số W3C DID cho toàn trường.',
      'Đóng lô chứng chỉ số (VC) bằng cây Merkle Tree lên Blockchain.',
      'Thu hồi khóa thiết bị bị mất với độ phức tạp O(1) tức thời.'
    ]
  },
  {
    step: '02',
    role: 'HOLDER • SINH VIÊN',
    title: 'Ví Định danh Di động',
    badge: 'Port 5173 • Mobile',
    icon: <Smartphone className="w-6 h-6 text-white" />,
    accent: 'from-sky-500 to-blue-600',
    items: [
      'Lưu khóa riêng tư bọc AES-GCM 256-bit (PBKDF2 100.000 vòng).',
      'Thẻ sinh viên số 3D tích hợp mã QR định danh & ký điểm danh 1 chạm.',
      'Hỗ trợ hàng đợi Offline Queue và tiết lộ chọn lọc ZKP-Lite.'
    ]
  },
  {
    step: '03',
    role: 'VERIFIER • GIẢNG VIÊN',
    title: 'Cổng Điều hành Giảng viên',
    badge: 'Port 5174 • Faculty',
    icon: <MonitorCheck className="w-6 h-6 text-white" />,
    accent: 'from-fuchsia-600 to-purple-600',
    items: [
      'Tạo phiên QR Nonce xoay tự động & chiếu toàn màn hình lớp học.',
      'Giám sát bản đồ GPS Radar thời gian thực & hậu kiểm Spot-Check 60s.',
      'Cảnh báo xâm nhập SOC IDS và xuất bảng điểm danh Excel (.xlsx).'
    ]
  }
];

const TECH_PILLARS = [
  {
    title: 'W3C DID & Verifiable Credentials',
    icon: <IdCard className="w-6 h-6 text-[#C084FC]" />,
    desc: 'Chuẩn hóa danh tính số phi tập trung did:uth:secp256k1 và chứng chỉ học thuật có chữ ký số xác minh độc lập không cần hỏi lại máy chủ gốc.',
    tags: ['W3C DID 1.0', 'JSON-LD VC', 'EIP-191', 'ZKP-Lite']
  },
  {
    title: 'WebAuthn / FIDO2 Passkey',
    icon: <Fingerprint className="w-6 h-6 text-[#38BDF8]" />,
    desc: 'Khóa mật mã sinh và bảo vệ trong vùng an toàn phần cứng TPM / Secure Enclave, ràng buộc chặt thiết bị để ngăn 1 máy điểm danh 2 MSSV.',
    tags: ['FIDO2', 'Face ID / Touch ID', 'Device Binding', 'AES-GCM']
  },
  {
    title: 'Keccak256 Merkle Tree & Smart Contract',
    icon: <GitBranch className="w-6 h-6 text-[#34D399]" />,
    desc: 'Gộp hàng nghìn bản ghi điểm danh & chứng chỉ thành một Merkle Root 32-byte duy nhất neo On-Chain, giảm tối đa chi phí Gas và đảm bảo bất biến.',
    tags: ['Keccak256', 'Merkle Proof O(log N)', '32-Byte Root', 'Revocation O(1)']
  }
];

const RESULT_METRICS = [
  { value: '96,4%', label: 'Tiết kiệm chi phí Gas', sub: 'So với ghi từng VC rời rạc On-Chain' },
  { value: '< 2 ms', label: 'Xác minh Merkle Proof', sub: 'Độ phức tạp tính toán O(log₂ N)' },
  { value: '100%', label: 'Chặn tấn công SOC IDS', sub: 'Tự động từ chối HTTP 403 tức thời' },
  { value: '12.548+', label: 'Định danh DID hoạt động', sub: 'Đồng bộ 26.937 chứng chỉ số (VC)' }
];

const DEFENSE_SCENARIOS = [
  {
    code: 'REPLAY_ATTACK',
    title: 'Chống quét lại QR cũ',
    desc: 'Từ chối ngay ảnh chụp màn hình mã QR gửi qua Zalo nhờ Nonce hết hạn tự động.'
  },
  {
    code: 'DEVICE_SPOOFING',
    title: 'Chống giả mạo chữ ký',
    desc: 'Xác thực chữ ký số EIP-191 khớp khóa công khai DID đã đăng ký trên hệ thống.'
  },
  {
    code: 'PROXY_ATTENDANCE',
    title: 'Chống 1 máy 2 sinh viên',
    desc: 'Khóa vân tay thiết bị (Device Fingerprint) theo từng phiên học để chặn điểm danh hộ.'
  },
  {
    code: 'GEOFENCE_BREACH',
    title: 'Chống Fake GPS ngoài lớp',
    desc: 'Đối chiếu khoảng cách Haversine với tâm phòng học và phát hiện tọa độ giả mạo.'
  }
];

export default function LandingPage({ onOpenLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');

  const handleNavClick = (sectionId) => {
    setActiveNav(sectionId);
    if (sectionId === 'HOME') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetEl = document.getElementById(`landing-section-${sectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Tự động cập nhật mục Navbar đang xem khi người dùng cuộn lên / xuống
  useEffect(() => {
    const sectionIds = ['TOPIC', 'SOLUTION', 'TECH', 'RESULTS', 'TEAM'];
    const handleScroll = () => {
      if (window.scrollY < 260) {
        setActiveNav('HOME');
        return;
      }
      const scrollMid = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i -= 1) {
        const el = document.getElementById(`landing-section-${sectionIds[i]}`);
        if (el && el.offsetTop <= scrollMid) {
          setActiveNav(sectionIds[i]);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="landing-top"
      className="min-h-screen w-full bg-[#070618] text-white font-sans overflow-x-clip relative flex flex-col"
    >
      {/* CSS Keyframes thuần GPU Compositor -> 60-120fps mượt tuyệt đối */}
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
          0%, 100% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }
      `}</style>

      {/* ==================== 1. STICKY NAVBAR CỐ ĐỊNH TRÊN CÙNG ==================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070618]/95">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-[74px] flex items-center justify-between gap-4">
          {/* Thương hiệu UTH-TrustID */}
          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 text-white group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.55)] border border-purple-300/40 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xl font-extrabold tracking-tight text-white">
                UTH-TrustID
              </span>
              <span className="block text-[10.5px] font-semibold text-purple-300/90 uppercase tracking-wider">
                W3C DID • WebAuthn
              </span>
            </div>
          </button>

          {/* Menu Điều hướng 6 mục cuộn mượt */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2 text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#38BDF8] transition-all duration-200 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cụm nút Hành động */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13102E] hover:bg-[#1D1842] border border-purple-400/30 text-slate-200 hover:text-white text-sm font-semibold no-underline transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Mã nguồn</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:brightness-110 text-white text-sm font-bold border border-purple-300/40 shadow-[0_0_20px_rgba(139,92,246,0.45)] cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span>Dùng thử hệ thống</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO BANNER GỌN GÀNG, CÂN ĐỐI 2 CỘT ==================== */}
      <section
        className="relative overflow-hidden border-b border-white/10"
        style={{
          background:
            'radial-gradient(circle at 72% 45%, rgba(124, 58, 237, 0.28) 0%, rgba(56, 189, 248, 0.1) 34%, transparent 66%), radial-gradient(circle at 18% 30%, rgba(99, 102, 241, 0.16) 0%, transparent 52%), linear-gradient(180deg, #070618 0%, #0D0A28 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
          {/* Cột trái (6 cột): Tiêu đề, mô tả & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C1244] border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-semibold">
              <GraduationCap className="w-4 h-4 text-[#C084FC]" />
              <span>Đề tài Nghiên cứu Khoa học • Đại học GTVT TP.HCM (UTH)</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl xl:text-[68px] font-black italic tracking-tight leading-none m-0">
                <span className="text-white">UTH-</span>
                <span className="bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#38BDF8] bg-clip-text text-transparent">
                  TrustID
                </span>
              </h1>

              <h2 className="text-2xl sm:text-3xl xl:text-[36px] font-extrabold text-white leading-[1.25] tracking-tight m-0">
                Định danh số phi tập trung và xác thực hiện diện phòng học
              </h2>
            </div>

            <p className="text-base sm:text-[17px] text-slate-300 leading-relaxed m-0 max-w-xl">
              Nghiên cứu, thiết kế và phát triển hệ thống định danh số theo chuẩn <strong className="text-white">W3C DID</strong>, kết hợp <strong className="text-white">WebAuthn (FIDO2)</strong> và <strong className="text-white">Merkle Tree</strong>, hướng tới môi trường đại học an toàn, minh bạch và chống gian lận điểm danh tuyệt đối.
            </p>

            {/* Nút hành động chính */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:brightness-110 text-white text-base font-bold border border-purple-300/40 shadow-[0_10px_28px_rgba(139,92,246,0.45)] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-white text-[#6D28D9] flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Trải nghiệm hệ thống</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('SOLUTION')}
                className="px-6 py-3.5 rounded-2xl bg-[#13102E] hover:bg-[#1C1742] text-slate-100 text-base font-semibold border border-purple-400/35 cursor-pointer transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#C084FC]" />
                <span>Xem kiến trúc giải pháp</span>
              </button>
            </div>
          </div>

          {/* Cột phải (6 cột): Khiên Bảo vệ 3D sạch sẽ + Hàng 3 công nghệ căn thẳng bên dưới (KHÔNG chồng đè) */}
          <div className="lg:col-span-6 flex flex-col items-center gap-6">
            {/* Vùng Khiên 3D & Quỹ đạo xoay cô lập GPU */}
            <div
              className="relative w-full max-w-[420px] h-[330px] sm:h-[370px] flex items-center justify-center"
              style={{ contain: 'layout paint' }}
            >
              {/* Quầng sáng Radial Gradient thuần */}
              <div
                className="pointer-events-none absolute w-[340px] h-[340px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(168,85,247,0.34) 0%, rgba(56,189,248,0.14) 42%, transparent 72%)'
                }}
              />

              {/* Vòng quỹ đạo ngoài xoay 360° */}
              <div
                className="pointer-events-none absolute w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] rounded-full will-change-transform"
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
                  <circle cx="200" cy="14" r="9" fill="#A855F7" opacity="0.3" />
                  <circle cx="200" cy="14" r="4.5" fill="#F3E8FF" />
                  <circle cx="386" cy="200" r="9" fill="#38BDF8" opacity="0.3" />
                  <circle cx="386" cy="200" r="4.5" fill="#BAE6FD" />
                  <circle cx="200" cy="386" r="8" fill="#C084FC" opacity="0.3" />
                  <circle cx="200" cy="386" r="4" fill="#E9D5FF" />
                  <circle cx="14" cy="200" r="9" fill="#38BDF8" opacity="0.3" />
                  <circle cx="14" cy="200" r="4.5" fill="#BAE6FD" />
                  <defs>
                    <linearGradient id="outerOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Vòng quỹ đạo trong xoay ngược chiều */}
              <div
                className="pointer-events-none absolute w-[235px] h-[235px] sm:w-[270px] sm:h-[270px] rounded-full will-change-transform"
                style={{ animation: 'orbitSpinCounter 16s linear infinite' }}
              >
                <svg className="w-full h-full" viewBox="0 0 304 304" fill="none">
                  <circle
                    cx="152"
                    cy="152"
                    r="140"
                    stroke="url(#innerOrbitGrad)"
                    strokeWidth="2.2"
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

              {/* Khiên Bảo vệ 3D chính giữa */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  title="Bấm để truy cập Cổng xác thực UTH-TrustID"
                  className="relative cursor-pointer will-change-transform"
                  style={{ animation: 'shieldFloatPulse 5s ease-in-out infinite' }}
                >
                  <svg className="w-44 h-52 sm:w-48 sm:h-56 overflow-visible" viewBox="0 0 200 230" fill="none">
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
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="url(#shieldOuterGrad)"
                      opacity="0.35"
                      transform="translate(6, 6)"
                    />
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="url(#shieldInnerGrad)"
                      stroke="url(#shieldOuterGrad)"
                      strokeWidth="4.8"
                    />
                    <path
                      d="M100 27 L163 54 V110 C163 155 135 186 100 202 C65 186 37 155 37 110 V54 L100 27 Z"
                      fill="none"
                      stroke="url(#neonRimGrad)"
                      strokeWidth="2.5"
                      opacity="0.95"
                    />
                    <circle cx="100" cy="94" r="21" fill="url(#shieldOuterGrad)" opacity="0.95" />
                    <path
                      d="M62 156 C62 133 78 122 100 122 C122 122 138 133 138 156"
                      fill="url(#shieldOuterGrad)"
                      opacity="0.9"
                    />
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

                {/* Bệ Đế Hologram gọn đẹp */}
                <div className="relative -mt-3 flex flex-col items-center">
                  <div className="w-56 sm:w-64 h-10 rounded-full bg-gradient-to-b from-[#26195C] to-[#0B0724] border border-purple-400/65 shadow-[0_0_24px_rgba(139,92,246,0.45)] flex items-center justify-center">
                    <div className="w-44 sm:w-52 h-5 rounded-full border border-dashed border-sky-300/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Thẻ trụ cột công nghệ xếp thẳng hàng, không che khuất khiên */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleNavClick('TECH')}
                className="p-3.5 rounded-2xl bg-[#130F32] hover:bg-[#1B1547] border border-purple-400/35 text-left flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#4F46E5] flex items-center justify-center shrink-0">
                  <IdCard className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">W3C DID</div>
                  <div className="text-xs text-slate-300 truncate">Định danh tự chủ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('TECH')}
                className="p-3.5 rounded-2xl bg-[#130F32] hover:bg-[#1B1547] border border-sky-400/35 text-left flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#2563EB] flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">WebAuthn</div>
                  <div className="text-xs text-slate-300 truncate">Không mật khẩu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('TECH')}
                className="p-3.5 rounded-2xl bg-[#130F32] hover:bg-[#1B1547] border border-emerald-400/35 text-left flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0D9488] flex items-center justify-center shrink-0">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">Merkle Tree</div>
                  <div className="text-xs text-slate-300 truncate">Minh bạch dữ liệu</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. DẢI 4 GIÁ TRỊ CỐT LÕI ==================== */}
      <section className="w-full bg-[#0A0820] border-b border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CORE_HIGHLIGHTS.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#110D2C] border border-purple-500/20 hover:border-purple-400/45 transition-colors flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1A1442] border border-purple-400/30 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white m-0">{item.title}</h3>
                <p className="text-sm text-slate-300 m-0 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. ĐỀ TÀI NGHIÊN CỨU & ẢNH KHUÔN VIÊN UTH ==================== */}
      <section id="landing-section-TOPIC" className="scroll-mt-20 py-16 lg:py-22 bg-[#070618]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200 text-xs font-bold tracking-wider uppercase">
              Đề tài Nghiên cứu Khoa học
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white m-0">
              Giải quyết triệt để bài toán định danh &amp; điểm danh hộ
            </h2>
            <p className="text-base text-slate-300 m-0 leading-relaxed">
              Thay thế phương thức điểm danh thủ công và mã QR tĩnh dễ bị chia sẻ ảnh chụp bằng kiến trúc định danh phi tập trung bảo mật cao.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Ảnh thật khuôn viên Đại học GTVT TP.HCM (UTH) đóng khung gọn đẹp */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-purple-400/35 bg-[#110D2C] shadow-2xl">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src="/uth-campus-banner.jpg"
                    alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0924] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-5 flex items-center justify-between gap-4 bg-[#110D2C]">
                  <div className="px-3 py-1.5 rounded-xl bg-white shrink-0">
                    <img src="/uth-logo.png" alt="UTH" className="h-6 w-auto object-contain block" />
                  </div>
                  <div className="text-right min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      ĐH Giao thông Vận tải TP.HCM
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      Khoa Công nghệ Thông tin • UTH-TrustID
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Mục tiêu nghiên cứu đánh số rõ ràng */}
            <div className="lg:col-span-7 space-y-4">
              {TOPIC_OBJECTIVES.map((obj) => (
                <div
                  key={obj.num}
                  className="p-5 rounded-2xl bg-[#110D2C] border border-purple-500/20 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white font-mono font-bold text-base flex items-center justify-center shrink-0">
                    {obj.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white m-0">{obj.title}</h3>
                    <p className="text-sm sm:text-[15px] text-slate-300 m-0 mt-1.5 leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. KIẾN TRÚC GIẢI PHÁP 3 TẦNG (ISSUER - HOLDER - VERIFIER) ==================== */}
      <section
        id="landing-section-SOLUTION"
        className="scroll-mt-20 py-16 lg:py-22 bg-[#0B0922] border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/35 text-sky-200 text-xs font-bold tracking-wider uppercase">
              Kiến trúc Giải pháp 3 Tầng
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white m-0">
              Mô hình Tam giác Tin cậy: Issuer – Holder – Verifier
            </h2>
            <p className="text-base text-slate-300 m-0 leading-relaxed">
              Ba phân hệ vận hành độc lập theo nguyên lý Zero-Trust và đồng bộ thời gian thực qua WebSocket &amp; Smart Contract.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SOLUTION_LAYERS.map((layer) => (
              <div
                key={layer.step}
                className="p-6 rounded-3xl bg-[#120E30] border border-purple-500/25 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${layer.accent} flex items-center justify-center shadow-lg`}
                    >
                      {layer.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                      {layer.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-purple-300 tracking-wider uppercase">
                      {layer.step} • {layer.role}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1 mb-0">{layer.title}</h3>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {layer.items.map((txt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#C084FC] shrink-0 mt-1" />
                        <span>{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. NỀN TẢNG CÔNG NGHỆ CỐT LÕI ==================== */}
      <section id="landing-section-TECH" className="scroll-mt-20 py-16 lg:py-22 bg-[#070618]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200 text-xs font-bold tracking-wider uppercase">
              Công nghệ Cốt lõi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white m-0">
              Ba trụ cột mật mã học bảo toàn danh tính
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TECH_PILLARS.map((tech, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#110D2C] border border-purple-500/20 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1B1546] border border-purple-400/30 flex items-center justify-center">
                    {tech.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white m-0">{tech.title}</h3>
                  <p className="text-sm text-slate-300 m-0 leading-relaxed">{tech.desc}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {tech.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#1A1442] border border-purple-400/25 text-xs font-mono text-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 7. KẾT QUẢ THỰC NGHIỆM & 4 LỚP PHÒNG VỆ SOC IDS ==================== */}
      <section
        id="landing-section-RESULTS"
        className="scroll-mt-20 py-16 lg:py-22 bg-[#0B0922] border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 text-xs font-bold tracking-wider uppercase">
              Kết quả Thực nghiệm &amp; Đánh giá
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white m-0">
              Hiệu năng vượt trội &amp; Phòng vệ 4 lớp SOC IDS
            </h2>
          </div>

          {/* 4 Chỉ số KPI nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESULT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#120E30] border border-purple-500/25 text-center space-y-1.5"
              >
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#C084FC] to-[#38BDF8] bg-clip-text text-transparent tabular-nums">
                  {m.value}
                </div>
                <div className="text-base font-bold text-white">{m.label}</div>
                <div className="text-xs text-slate-400">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* 4 Kịch bản tấn công bị chặn 100% */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFENSE_SCENARIOS.map((sc) => (
              <div
                key={sc.code}
                className="p-5 rounded-2xl bg-[#161038] border border-rose-400/25 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-rose-300">{sc.code}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
                <h4 className="text-sm font-bold text-white m-0">{sc.title}</h4>
                <p className="text-xs sm:text-[13px] text-slate-300 m-0 leading-relaxed">{sc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 8. ĐỘI NGŨ THỰC HIỆN & CHÂN TRANG ==================== */}
      <section id="landing-section-TEAM" className="scroll-mt-20 py-16 lg:py-20 bg-[#070618]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200 text-xs font-bold tracking-wider uppercase">
              Đội ngũ Nghiên cứu
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white m-0">
              Trường Đại học Giao thông Vận tải TP.HCM (UTH)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#110D2C] border border-purple-500/20 space-y-2">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Đơn vị chủ trì
              </div>
              <div className="text-lg font-bold text-white">Khoa Công nghệ Thông tin</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">
                Trường Đại học Giao thông Vận tải TP.HCM (UTH) — Chuyên ngành An toàn Thông tin &amp; Khoa học Dữ liệu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#110D2C] border border-purple-500/20 space-y-2">
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Giảng viên hướng dẫn
              </div>
              <div className="text-lg font-bold text-white">TS. Nguyễn Thị Mai</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">
                Cố vấn chuyên môn kiến trúc bảo mật, mật mã ứng dụng &amp; đánh giá quy trình xác thực học thuật.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#110D2C] border border-purple-500/20 space-y-2">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Nhóm sinh viên thực hiện
              </div>
              <div className="text-lg font-bold text-white">Nguyễn Đức Hiển &amp; Cộng sự</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">
                MSSV: 2251120000 • Thiết kế, lập trình Full-Stack hệ sinh thái Ví DID, Cổng Giảng viên &amp; Quản trị viên.
              </p>
            </div>
          </div>

          {/* CTA Banner cuối trang */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1A1245] via-[#22165A] to-[#141D48] border border-purple-400/35 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-2xl font-extrabold text-white m-0">
                Sẵn sàng trải nghiệm hệ sinh thái UTH-TrustID?
              </h3>
              <p className="text-sm sm:text-base text-slate-200 m-0">
                Đăng nhập Cổng Giảng viên / Quản trị viên để mở phiên điểm danh QR động &amp; kiểm thử phòng vệ SOC IDS.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-[#0D0A24] hover:bg-[#16113A] border border-purple-400/35 text-slate-100 text-sm font-semibold no-underline inline-flex items-center gap-2"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>Xem GitHub</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] hover:brightness-110 text-white text-sm font-bold border-none cursor-pointer inline-flex items-center gap-2 shadow-lg"
              >
                <span>Dùng thử ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER GỌN GÀNG + NÚT CUỘN LÊN ĐẦU TRANG ==================== */}
      <footer className="w-full border-t border-white/10 bg-[#050412] py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-white">
              <img src="/uth-logo.png" alt="UTH" className="h-5 w-auto object-contain block" />
            </div>
            <span>© 2026 UTH-TrustID • Đại học Giao thông Vận tải TP.HCM</span>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="px-4 py-2 rounded-xl bg-[#13102E] hover:bg-[#1E1848] text-purple-200 text-xs sm:text-sm font-semibold border border-purple-400/30 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Cuộn lên đầu trang</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
