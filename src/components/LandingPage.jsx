import React, { useState, useEffect, Fragment } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  ArrowUp,
  Play,
  Layers,
  Zap,
  Fingerprint,
  IdCard,
  GitBranch,
  CheckCircle2,
  Building2,
  MonitorCheck,
  ShieldAlert,
  ExternalLink,
  QrCode,
  Database,
  X
} from 'lucide-react';

const GITHUB_REPO_URL = 'https://github.com/hien-cybers/UTH-TrustID';

function GitHubIcon({ className = 'w-4 h-4' }) {
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
  { id: 'TECH', label: 'Công nghệ' },
  { id: 'SYSTEM', label: 'Phân hệ' },
  { id: 'RESULTS', label: 'Kết quả' },
  { id: 'TEAM', label: 'Đơn vị' }
];

const CORE_TECH_CARDS = [
  {
    id: 'W3C_DID',
    title: 'W3C DID',
    desc: 'Quản trị và cấp phát định danh số phi tập trung chuẩn W3C, minh bạch hóa dữ liệu toàn trường.',
    tags: ['W3C DID 1.0', 'JSON-LD VC'],
    icon: <IdCard className="w-7 h-7 text-[#6D28D9]" />
  },
  {
    id: 'WEBAUTHN',
    title: 'WebAuthn',
    desc: 'Kiểm soát chính sách xác thực không mật khẩu (Passkey), ràng buộc thiết bị và chống điểm danh hộ.',
    tags: ['FIDO2 Passkey', 'Device Binding'],
    icon: <Fingerprint className="w-7 h-7 text-[#6D28D9]" />
  },
  {
    id: 'MERKLE',
    title: 'Merkle Tree',
    desc: 'Đóng lô chứng chỉ số, xác minh tính toàn vẹn điểm danh O(log₂ N) và neo Merkle Root lên Blockchain.',
    tags: ['Keccak256', '32-Byte Root'],
    icon: <GitBranch className="w-7 h-7 text-[#6D28D9]" />
  }
];

const OVERVIEW_STEPS = [
  {
    id: 'st-1',
    stepNum: 'Bước 01',
    title: 'Giảng viên mở phiên',
    sub: 'Phát mã QR Nonce xoay động',
    icon: <QrCode className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-2',
    stepNum: 'Bước 02',
    title: 'Kiểm tra WebAuthn',
    sub: 'Xác thực chữ ký & GPS Radar',
    icon: <Fingerprint className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-3',
    stepNum: 'Bước 03',
    title: 'Đối soát toàn vẹn',
    sub: 'Cây băm Merkle & SOC IDS',
    icon: <Layers className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-4',
    stepNum: 'Bước 04',
    title: 'Quản trị & lưu vết',
    sub: 'Cấp DID / VC & Xuất Excel',
    icon: <Database className="w-5 h-5 text-[#6D28D9]" />
  }
];

const PORTAL_MODULES = [
  {
    step: '01',
    role: 'VERIFIER • GIẢNG VIÊN',
    title: 'Cổng Điều hành Giảng viên',
    badge: '10 Màn hình Nghiệp vụ',
    loginRole: 'FACULTY',
    ctaLabel: 'Đăng nhập Cổng Giảng viên',
    icon: <MonitorCheck className="w-6 h-6 text-white" />,
    barColor: 'from-[#16345E] to-[#2563EB]',
    iconBg: 'from-[#16345E] to-[#2563EB]',
    points: [
      'Quản lý lớp học, mở phiên QR Nonce xoay tự động & chế độ chiếu toàn màn hình.',
      'Giám sát bản đồ GPS Radar theo bán kính lớp & hậu kiểm Spot-Check 60 giây.',
      'Quản lý DID/VC lớp học, cảnh báo SOC IDS và xuất bảng điểm danh Excel (.xlsx).'
    ]
  },
  {
    step: '02',
    role: 'ISSUER • QUẢN TRỊ VIÊN',
    title: 'Cổng Quản trị Hệ thống',
    badge: '10 Phân hệ Hạ tầng',
    loginRole: 'ADMIN',
    ctaLabel: 'Đăng nhập Cổng Quản trị',
    icon: <Building2 className="w-6 h-6 text-white" />,
    barColor: 'from-[#5B21B6] to-[#7C3AED]',
    iconBg: 'from-[#6D28D9] to-[#4F46E5]',
    points: [
      'Quản trị tài khoản người dùng, cấp phát định danh W3C DID & chứng chỉ số (VC).',
      'Vận hành cây băm Merkle Tree, neo Merkle Root lên Blockchain & Smart Contract.',
      'Cấu hình chính sách WebAuthn (Passkey), thu hồi khóa O(1) và nhật ký kiểm toán.'
    ]
  }
];

const RESULT_METRICS = [
  { value: '96,4%', label: 'Tiết kiệm Gas On-Chain', sub: 'So với ghi từng VC rời rạc' },
  { value: '< 2 ms', label: 'Xác minh Merkle Proof', sub: 'Độ phức tạp O(log₂ N)' },
  { value: '100%', label: 'Chặn tấn công SOC IDS', sub: 'Tự động từ chối HTTP 403' },
  { value: '12.548+', label: 'Định danh DID quản trị', sub: 'Đồng bộ 26.937 chứng chỉ VC' }
];

const DEFENSE_SCENARIOS = [
  {
    code: 'REPLAY_ATTACK',
    title: 'Chống quét lại QR cũ',
    desc: 'Vô hiệu hóa ảnh chụp màn hình mã QR nhờ Nonce hết hạn tự động.'
  },
  {
    code: 'DEVICE_SPOOFING',
    title: 'Chống giả mạo chữ ký',
    desc: 'Đối chiếu chữ ký EIP-191 khớp khóa công khai DID đã đăng ký.'
  },
  {
    code: 'PROXY_ATTENDANCE',
    title: 'Chống 1 máy điểm danh hộ',
    desc: 'Ràng buộc vân tay phần cứng thiết bị (Device Fingerprint) theo phiên.'
  },
  {
    code: 'GEOFENCE_BREACH',
    title: 'Chống Fake GPS ngoài lớp',
    desc: 'Đo khoảng cách Haversine tới tâm phòng học và phát hiện tọa độ ảo.'
  }
];

export default function LandingPage({ onOpenLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');
  const [showIntroModal, setShowIntroModal] = useState(false);

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

  useEffect(() => {
    const sectionIds = ['TECH', 'SYSTEM', 'RESULTS', 'TEAM'];
    const handleScroll = () => {
      if (window.scrollY < 240) {
        setActiveNav('HOME');
        return;
      }
      const scrollMid = window.scrollY + 260;
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
      className="min-h-screen w-full bg-[#F7F5FE] text-slate-900 font-sans overflow-x-clip relative flex flex-col"
    >
      {/* Keyframes thuần GPU Compositor cho Khiên 3D & 2 Vòng quỹ đạo xoay tròn */}
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

      {/* ==================== 1. STICKY NAVBAR THOÁNG RỘNG ==================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-purple-100 shadow-[0_2px_16px_rgba(109,40,217,0.05)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between gap-6">
          {/* Logo UTH + UTH-TrustID có khoảng thở rộng rãi */}
          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="flex items-center gap-4 bg-transparent border-none cursor-pointer p-0 shrink-0"
          >
            <img
              src="/uth-logo.png"
              alt="UTH - University of Transport Ho Chi Minh City"
              className="h-9 sm:h-10 w-auto object-contain block"
            />
            <span className="hidden sm:inline-block h-7 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#1E1B4B]">
                UTH-TrustID
              </span>
            </div>
          </button>

          {/* Menu Điều hướng 5 mục cách đều thoáng mắt */}
          <nav className="hidden lg:flex items-center gap-9 xl:gap-11">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2.5 text-[15.5px] font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                    isActive ? 'text-[#6D28D9]' : 'text-slate-600 hover:text-[#6D28D9]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#6D28D9] transition-all duration-200 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Nút Mã nguồn + Đăng nhập */}
          <div className="flex items-center gap-3.5 shrink-0">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F3FF] border border-purple-200 text-[#4C1D95] text-sm font-semibold no-underline transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Mã nguồn</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-sm font-bold border-none shadow-md shadow-purple-500/20 cursor-pointer inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Đăng nhập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO BANNER THOÁNG RỘNG, TÁCH BẠCH RÕ RÀNG 2 CỘT ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8F5FF] to-[#EFE9FF] border-b border-purple-100/80">
        {/* Ảnh thật Tòa nhà ĐH Giao thông Vận tải TP.HCM (UTH) bên phải */}
        <div className="pointer-events-none hidden lg:block absolute right-0 top-0 bottom-0 w-[54%] overflow-hidden">
          <img
            src="/uth-campus-banner.jpg"
            alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
            className="w-full h-full object-cover object-[70%_center]"
          />
          {/* Chuyển sắc rộng và mượt từ nền trắng bên trái sang ảnh trường */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #FFFFFF 0%, rgba(248,245,255,0.95) 16%, rgba(248,245,255,0.55) 34%, rgba(248,245,255,0.08) 56%)'
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                'linear-gradient(0deg, #F3EEFF 0%, rgba(243,238,255,0.65) 45%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
          {/* Cột Trái (6 cột): Khoảng cách dòng và khối thoáng rộng */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#4C1D95] text-xs sm:text-sm font-semibold shadow-2xs">
              <Building2 className="w-4 h-4 text-[#6D28D9]" />
              <span>Cổng Điều hành Giảng viên &amp; Quản trị viên • UTH</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl xl:text-[66px] font-black tracking-tight leading-none m-0 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] bg-clip-text text-transparent">
                UTH-TrustID
              </h1>
              <p className="text-lg sm:text-xl font-bold text-[#1E1B4B] m-0">
                Định danh số phi tập trung &amp; Xác thực hiện diện phòng học
              </p>
            </div>

            <p className="text-base sm:text-[17px] text-slate-700 leading-[1.75] font-medium m-0 max-w-[540px]">
              Hệ thống quản trị định danh số chuẩn <strong className="text-[#1E1B4B]">W3C DID</strong>, xác thực không mật khẩu <strong className="text-[#1E1B4B]">WebAuthn</strong> và cây băm <strong className="text-[#1E1B4B]">Merkle Tree</strong> dành riêng cho đội ngũ Giảng viên và Quản trị viên tại Trường Đại học Giao thông Vận tải TP.HCM.
            </p>

            {/* 2 Nút hành động cách nhau thoáng */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-base font-bold border-none shadow-lg shadow-purple-600/25 cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span>Khám phá hệ thống</span>
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-6 py-4 rounded-2xl bg-white hover:bg-[#F5F3FF] text-[#1E1B4B] text-base font-bold border border-purple-200 shadow-xs cursor-pointer transition-colors inline-flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Quy trình vận hành</span>
              </button>
            </div>

            {/* 3 Nhãn niềm tin cách rộng */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-sm font-bold text-[#1E1B4B]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#6D28D9]" />
                <span>An toàn</span>
              </span>
              <span className="h-4 w-px bg-purple-200" />
              <span className="inline-flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-[#6D28D9]" />
                <span>Minh bạch</span>
              </span>
              <span className="h-4 w-px bg-purple-200" />
              <span className="inline-flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-[#6D28D9]" />
                <span>Phi tập trung</span>
              </span>
            </div>
          </div>

          {/* Cột Phải (6 cột): Khiên 3D Cũ đặt chính giữa cột phải, tách xa cột chữ bên trái */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* Ảnh tòa nhà UTH trên màn hình di động / tablet */}
            <div className="lg:hidden w-full rounded-2xl overflow-hidden border border-purple-200 shadow-md mb-8">
              <img
                src="/uth-campus-banner.jpg"
                alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
                className="w-full h-52 sm:h-64 object-cover"
              />
            </div>

            {/* Khiên Bảo vệ 3D Cũ + 2 vòng xoay 360° */}
            <div
              className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] flex items-center justify-center select-none"
              style={{ contain: 'layout paint' }}
            >
              {/* Quầng sáng mềm phía sau khiên */}
              <div
                className="pointer-events-none absolute w-[270px] h-[270px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(237,233,254,0.7) 46%, rgba(168,85,247,0.14) 68%, transparent 80%)'
                }}
              />

              {/* Vòng quỹ đạo xoay tròn ngoài */}
              <div
                className="pointer-events-none absolute w-[275px] h-[275px] sm:w-[300px] sm:h-[300px] rounded-full will-change-transform"
                style={{ animation: 'orbitSpinClockwise 24s linear infinite' }}
              >
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                  <circle
                    cx="200"
                    cy="200"
                    r="186"
                    stroke="url(#outerOrbitGrad)"
                    strokeWidth="2.6"
                    strokeDasharray="16 10 4 10"
                  />
                  <circle cx="200" cy="14" r="5" fill="#6D28D9" />
                  <circle cx="386" cy="200" r="5" fill="#0EA5E9" />
                  <circle cx="200" cy="386" r="4.5" fill="#7C3AED" />
                  <circle cx="14" cy="200" r="5" fill="#0EA5E9" />
                  <defs>
                    <linearGradient id="outerOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Vòng quỹ đạo xoay tròn trong */}
              <div
                className="pointer-events-none absolute w-[215px] h-[215px] sm:w-[235px] sm:h-[235px] rounded-full will-change-transform"
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
                  <circle cx="152" cy="12" r="4.5" fill="#0EA5E9" />
                  <circle cx="152" cy="292" r="4.5" fill="#7C3AED" />
                  <defs>
                    <linearGradient id="innerOrbitGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Khiên Bảo vệ 3D Cũ + Đế Hologram */}
              <div className="relative z-20 flex flex-col items-center pt-3">
                <div
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  title="Bấm để mở Cổng Đăng nhập Giảng viên & Quản trị viên"
                  className="relative cursor-pointer will-change-transform"
                  style={{ animation: 'shieldFloatPulse 5s ease-in-out infinite' }}
                >
                  <div
                    className="pointer-events-none absolute -inset-3.5 rounded-full border border-dashed border-[#38BDF8]/70 will-change-transform"
                    style={{ animation: 'orbitSpinClockwise 12s linear infinite' }}
                  />

                  <svg className="w-36 h-40 sm:w-40 sm:h-44 overflow-visible" viewBox="0 0 200 230" fill="none">
                    <defs>
                      <linearGradient id="shieldOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F3E8FF" />
                        <stop offset="35%" stopColor="#A855F7" />
                        <stop offset="75%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                      <linearGradient id="shieldInnerGrad" x1="15%" y1="10%" x2="85%" y2="95%">
                        <stop offset="0%" stopColor="#3B2396" stopOpacity="0.97" />
                        <stop offset="55%" stopColor="#1E1354" stopOpacity="0.98" />
                        <stop offset="100%" stopColor="#0F1B44" stopOpacity="0.98" />
                      </linearGradient>
                      <linearGradient id="neonRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="50%" stopColor="#E879F9" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="#4C1D95"
                      opacity="0.32"
                      transform="translate(6, 6)"
                    />
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="url(#shieldInnerGrad)"
                      stroke="url(#shieldOuterGrad)"
                      strokeWidth="5"
                    />
                    <path
                      d="M100 27 L163 54 V110 C163 155 135 186 100 202 C65 186 37 155 37 110 V54 L100 27 Z"
                      fill="none"
                      stroke="url(#neonRimGrad)"
                      strokeWidth="2.5"
                      opacity="0.95"
                    />
                    <circle cx="100" cy="94" r="21" fill="url(#shieldOuterGrad)" opacity="0.96" />
                    <path
                      d="M62 156 C62 133 78 122 100 122 C122 122 138 133 138 156"
                      fill="url(#shieldOuterGrad)"
                      opacity="0.92"
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

                {/* Bệ Đế Hologram */}
                <div className="relative -mt-2 flex flex-col items-center">
                  <div className="w-44 h-9 rounded-full bg-gradient-to-b from-[#2E1E72] to-[#110B36] border-2 border-[#A78BFA] shadow-[0_12px_26px_rgba(91,33,182,0.34)] flex items-center justify-center">
                    <div className="w-34 h-4.5 rounded-full border border-dashed border-[#38BDF8]/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. BA TRỤ CỘT CÔNG NGHỆ & LUỒNG TỔNG QUAN (KHOẢNG CÁCH RỘNG THOÁNG) ==================== */}
      <section id="landing-section-TECH" className="scroll-mt-24 w-full bg-[#F7F5FE] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-16">
          {/* Tiêu đề mục Công nghệ */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-purple-200 text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Nền tảng Công nghệ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Ba trụ cột mật mã học bảo toàn danh tính &amp; điểm danh
            </h2>
          </div>

          {/* Hàng 3 thẻ công nghệ cách nhau rộng rãi (gap-8, p-8) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
            {CORE_TECH_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => handleNavClick('SYSTEM')}
                className="group relative bg-white rounded-3xl border border-purple-100 p-7 sm:p-8 shadow-[0_10px_30px_rgba(109,40,217,0.05)] hover:shadow-[0_18px_40px_rgba(109,40,217,0.12)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="w-15 h-15 rounded-2xl bg-[#F3EEFF] border border-[#E5DCFE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-[#1E1B4B] m-0 group-hover:text-[#6D28D9] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[15px] text-slate-600 m-0 leading-relaxed">{card.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-[#F5F3FF] text-[#5B21B6] text-xs font-mono font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#F3EEFF] group-hover:bg-[#6D28D9] text-[#6D28D9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Khối Tổng quan hệ thống 4 bước đóng khung thoáng rộng */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white/80 border border-purple-100/90 shadow-[0_8px_28px_rgba(109,40,217,0.04)] space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-[#1E1B4B] m-0">Tổng quan hệ thống</h3>
                <div className="w-14 h-1 rounded-full bg-[#6D28D9] mt-2.5" />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Chuỗi 4 bước điều hành &amp; đối soát dữ liệu khép kín
              </span>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {OVERVIEW_STEPS.map((step, idx) => (
                <Fragment key={step.id}>
                  <div className="flex-1 bg-[#FAF8FF] rounded-2xl border border-purple-100 p-5 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] border border-purple-200/60 flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[11px] font-mono font-bold text-[#6D28D9] uppercase tracking-wider">
                        {step.stepNum}
                      </div>
                      <div className="text-[15px] font-bold text-[#1E1B4B] truncate">
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{step.sub}</div>
                    </div>
                  </div>
                  {idx < OVERVIEW_STEPS.length - 1 && (
                    <ArrowRight className="hidden lg:block w-5 h-5 text-[#7C3AED] shrink-0" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. HAI PHÂN HỆ NGHIỆP VỤ: GIẢNG VIÊN & QUẢN TRỊ VIÊN ==================== */}
      <section
        id="landing-section-SYSTEM"
        className="scroll-mt-24 py-20 lg:py-24 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-3.5">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Phân hệ Nghiệp vụ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Hai cổng điều hành chuyên biệt: Giảng viên &amp; Quản trị viên
            </h2>
            <p className="text-base text-slate-600 m-0 leading-relaxed">
              Phân quyền tách bạch Zero-Trust giữa Cổng Điều hành Giảng viên (Verifier) và Cổng Quản trị Hệ thống (Issuer).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {PORTAL_MODULES.map((mod) => (
              <div
                key={mod.step}
                className="relative overflow-hidden rounded-3xl bg-[#FAF8FF] border border-purple-100 shadow-[0_10px_30px_rgba(109,40,217,0.05)] flex flex-col justify-between"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${mod.barColor}`} />

                <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div
                        className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center shadow-md`}
                      >
                        {mod.icon}
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-white border border-purple-200/80 text-xs font-mono font-semibold text-slate-600">
                        {mod.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-[#6D28D9] tracking-wider uppercase">
                        {mod.step} • {mod.role}
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#1E1B4B] m-0">{mod.title}</h3>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {mod.points.map((pt, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => onOpenLogin && onOpenLogin(mod.loginRole)}
                      className="px-6 py-3 rounded-xl bg-white hover:bg-[#6D28D9] text-[#5B21B6] hover:text-white border border-purple-200 hover:border-[#6D28D9] text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-colors shadow-2xs"
                    >
                      <span>{mod.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. KẾT QUẢ THỰC NGHIỆM & 4 LỚP PHÒNG VỆ SOC IDS ==================== */}
      <section
        id="landing-section-RESULTS"
        className="scroll-mt-24 py-20 lg:py-24 bg-[#F7F5FE] border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3.5">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-purple-200 text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Kết quả &amp; An toàn Hệ thống
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Hiệu năng vượt trội &amp; Phòng vệ 4 lớp SOC IDS
            </h2>
          </div>

          {/* 4 Chỉ số KPI cách thoáng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {RESULT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-purple-100 shadow-[0_8px_24px_rgba(109,40,217,0.05)] text-center space-y-2"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#6D28D9] tabular-nums">
                  {m.value}
                </div>
                <div className="text-base font-bold text-[#1E1B4B]">{m.label}</div>
                <div className="text-xs sm:text-sm text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* 4 Kịch bản phòng vệ SOC IDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEFENSE_SCENARIOS.map((sc) => (
              <div
                key={sc.code}
                className="p-6 rounded-3xl bg-white border border-rose-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-rose-600">{sc.code}</span>
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                </div>
                <h4 className="text-base font-bold text-[#1E1B4B] m-0">{sc.title}</h4>
                <p className="text-sm text-slate-600 m-0 leading-relaxed">{sc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. ĐƠN VỊ VẬN HÀNH & CTA CUỐI TRANG ==================== */}
      <section
        id="landing-section-TEAM"
        className="scroll-mt-24 py-20 lg:py-24 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3.5">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Đơn vị Chủ trì &amp; Vận hành
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Trường Đại học Giao thông Vận tải TP.HCM (UTH)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
            <div className="p-7 rounded-3xl bg-[#FAF8FF] border border-purple-100 space-y-2.5">
              <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider">
                Đơn vị chủ trì
              </div>
              <div className="text-lg font-extrabold text-[#1E1B4B]">
                Khoa Công nghệ Thông tin – UTH
              </div>
              <p className="text-sm sm:text-[15px] text-slate-600 m-0 leading-relaxed">
                Trường Đại học Giao thông Vận tải TP.HCM — Triển khai hạ tầng xác thực số học thuật.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF8FF] border border-purple-100 space-y-2.5">
              <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                Cổng Điều hành Giảng viên
              </div>
              <div className="text-lg font-extrabold text-[#1E1B4B]">TS. Nguyễn Thị Mai</div>
              <p className="text-sm sm:text-[15px] text-slate-600 m-0 leading-relaxed">
                Điều hành lớp học, giám sát phiên QR động, bản đồ GPS Radar và cấp chứng chỉ số môn học.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF8FF] border border-purple-100 space-y-2.5">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Cổng Quản trị Hệ thống
              </div>
              <div className="text-lg font-extrabold text-[#1E1B4B]">
                Ban Quản trị UTH-TrustID
              </div>
              <p className="text-sm sm:text-[15px] text-slate-600 m-0 leading-relaxed">
                Quản trị định danh W3C DID, chính sách WebAuthn, Merkle Tree Blockchain và giám sát SOC.
              </p>
            </div>
          </div>

          {/* CTA Banner thoáng rộng */}
          <div className="p-8 sm:p-11 rounded-3xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white shadow-xl shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold m-0">
                Truy cập Cổng Giảng viên &amp; Quản trị viên UTH-TrustID
              </h3>
              <p className="text-sm sm:text-base text-purple-100 m-0">
                Đăng nhập tài khoản cán bộ UTH để mở phiên điểm danh QR động và quản trị hạ tầng định danh số.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold no-underline inline-flex items-center gap-2 transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>Xem GitHub</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-[#5B21B6] text-sm font-extrabold border-none cursor-pointer inline-flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER THOÁNG ĐẸP ==================== */}
      <footer className="w-full bg-[#F7F5FE] border-t border-purple-100 py-7">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-3.5">
            <img src="/uth-logo.png" alt="UTH" className="h-7 w-auto object-contain block" />
            <span className="text-slate-300">|</span>
            <span>© 2026 UTH-TrustID • Cổng Giảng viên &amp; Quản trị viên UTH</span>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F3EEFF] text-[#6D28D9] text-xs sm:text-sm font-bold border border-purple-200 cursor-pointer inline-flex items-center gap-2 shadow-2xs transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Lên đầu trang</span>
          </button>
        </div>
      </footer>

      {/* ==================== MODAL XEM QUY TRÌNH VẬN HÀNH ==================== */}
      {showIntroModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIntroModal(false);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
        >
          <div className="uth-modal-panel w-full max-w-xl rounded-3xl bg-white border border-purple-100 p-7 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#F3EEFF] text-[#6D28D9] text-xs font-bold">
                  QUY TRÌNH VẬN HÀNH GIẢNG VIÊN &amp; ADMIN
                </span>
                <h3 className="text-xl font-extrabold text-[#1E1B4B] mt-2 mb-0">
                  4 bước kiểm soát xác thực Zero-Trust tại UTH
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-purple-100 relative">
              <img
                src="/uth-campus-banner.jpg"
                alt="UTH Campus"
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs sm:text-sm font-semibold">
                  Cổng Điều hành Giảng viên &amp; Quản trị viên — ĐH Giao thông Vận tải TP.HCM
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {OVERVIEW_STEPS.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-[#FAF8FF] border border-purple-100 flex items-center gap-3.5"
                >
                  <div className="w-9 h-9 rounded-full bg-[#6D28D9] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1E1B4B] truncate">{st.title}</div>
                    <div className="text-xs text-slate-500 truncate">{st.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  if (onOpenLogin) onOpenLogin('FACULTY');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-bold border-none cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Mở cổng hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
