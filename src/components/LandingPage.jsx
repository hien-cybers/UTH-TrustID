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
    title: 'Giảng viên mở phiên',
    sub: 'QR Nonce xoay động',
    icon: <QrCode className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-2',
    title: 'Kiểm tra WebAuthn',
    sub: 'Chữ ký & GPS Radar',
    icon: <Fingerprint className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-3',
    title: 'Đối soát toàn vẹn',
    sub: 'Merkle Tree & SOC IDS',
    icon: <Layers className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-4',
    title: 'Quản trị & lưu vết',
    sub: 'Admin DID / VC / Excel',
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
    ctaLabel: 'Đăng nhập Giảng viên',
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
    ctaLabel: 'Đăng nhập Quản trị',
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
      if (window.scrollY < 200) {
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
          50% { transform: translate3d(0, -7px, 0); }
        }
      `}</style>

      {/* ==================== 1. STICKY NAVBAR GỌN GÀNG, CÂN ĐỐI ==================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-purple-100 shadow-[0_2px_12px_rgba(109,40,217,0.04)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[70px] flex items-center justify-between gap-4">
          {/* Logo UTH + UTH-TrustID gọn 1 dòng */}
          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 shrink-0"
          >
            <img
              src="/uth-logo.png"
              alt="UTH - University of Transport Ho Chi Minh City"
              className="h-8 sm:h-9 w-auto object-contain block"
            />
            <span className="hidden sm:inline-block h-6 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#1E1B4B]">
                UTH-TrustID
              </span>
            </div>
          </button>

          {/* Menu Điều hướng 5 mục gọn thoáng */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2 text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-colors ${
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
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5F3FF] border border-purple-200 text-[#4C1D95] text-sm font-semibold no-underline transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Mã nguồn</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-sm font-bold border-none shadow-sm shadow-purple-500/25 cursor-pointer inline-flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Đăng nhập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO BANNER SÁNG ĐẸP: CHỮ TRÁI + KHIÊN 3D CŨ GỌN GÀNG + TÒA NHÀ UTH SẮC NÉT PHẢI ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8F5FF] to-[#EFE9FF]">
        {/* Ảnh thật Tòa nhà ĐH Giao thông Vận tải TP.HCM (UTH) sáng rõ không bị che chữ tên trường */}
        <div className="pointer-events-none hidden lg:block absolute right-0 top-0 bottom-0 w-[56%] overflow-hidden">
          <img
            src="/uth-campus-banner.jpg"
            alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
            className="w-full h-full object-cover object-[72%_center]"
          />
          {/* Chuyển sắc mượt từ nền trắng bên trái sang ảnh trường */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #FFFFFF 0%, rgba(248,245,255,0.94) 12%, rgba(248,245,255,0.52) 26%, rgba(248,245,255,0) 46%)'
            }}
          />
          {/* Chuyển sắc mềm ở chân ảnh hòa vào nền tím nhạt bên dưới */}
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                'linear-gradient(0deg, #F7F5FE 0%, rgba(247,245,254,0.75) 45%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-9 pb-10 lg:pt-11 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
          {/* Cột Trái (6 cột): Tiêu đề, mô tả súc tích & CTA */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#4C1D95] text-xs sm:text-sm font-semibold">
              <Building2 className="w-4 h-4 text-[#6D28D9]" />
              <span>Cổng Giảng viên &amp; Quản trị viên • UTH</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[62px] font-black tracking-tight leading-none m-0 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] bg-clip-text text-transparent">
              UTH-TrustID
            </h1>

            <p className="text-[15px] sm:text-base text-slate-700 leading-[1.68] font-medium m-0 max-w-[500px]">
              Hệ thống quản trị định danh số phi tập trung và xác thực hiện diện phòng học dành cho <strong className="text-[#1E1B4B]">Giảng viên</strong> &amp; <strong className="text-[#1E1B4B]">Quản trị viên</strong>, ứng dụng W3C DID, WebAuthn và Merkle Tree tại Trường Đại học Giao thông Vận tải TP.HCM.
            </p>

            {/* 2 Nút hành động gọn đẹp */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group px-6 py-3 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-sm sm:text-[15px] font-bold border-none shadow-lg shadow-purple-600/20 cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
              >
                <span>Khám phá hệ thống</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#1E1B4B] text-sm sm:text-[15px] font-bold border border-purple-200 shadow-2xs cursor-pointer transition-colors inline-flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>Quy trình vận hành</span>
              </button>
            </div>

            {/* 3 Nhãn niềm tin gọn sắc nét */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[13.5px] font-bold text-[#1E1B4B]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6D28D9]" />
                <span>An toàn</span>
              </span>
              <span className="h-3.5 w-px bg-purple-200" />
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#6D28D9]" />
                <span>Minh bạch</span>
              </span>
              <span className="h-3.5 w-px bg-purple-200" />
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#6D28D9]" />
                <span>Phi tập trung</span>
              </span>
            </div>
          </div>

          {/* Cột Phải (6 cột): Khiên 3D Cũ cỡ gọn (245px) đặt thấp góc trái tiền cảnh — KHÔNG che tên trường trên mặt tiền tòa nhà */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-end lg:min-h-[300px]">
            {/* Ảnh tòa nhà UTH trên màn hình di động / tablet */}
            <div className="lg:hidden w-full rounded-2xl overflow-hidden border border-purple-200 shadow-md mb-4">
              <img
                src="/uth-campus-banner.jpg"
                alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
                className="w-full h-48 sm:h-56 object-cover"
              />
            </div>

            {/* Khiên Bảo vệ 3D Cũ gọn đẹp, 2 vòng xoay 360° thuần GPU */}
            <div
              className="relative w-[240px] h-[240px] sm:w-[255px] sm:h-[255px] flex items-center justify-center select-none lg:translate-y-4 lg:-ml-4"
              style={{ contain: 'layout paint' }}
            >
              {/* Quầng sáng mềm phía sau khiên */}
              <div
                className="pointer-events-none absolute w-[225px] h-[225px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.88) 0%, rgba(237,233,254,0.65) 45%, rgba(168,85,247,0.12) 68%, transparent 78%)'
                }}
              />

              {/* Vòng quỹ đạo xoay tròn ngoài */}
              <div
                className="pointer-events-none absolute w-[236px] h-[236px] sm:w-[250px] sm:h-[250px] rounded-full will-change-transform"
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
                className="pointer-events-none absolute w-[184px] h-[184px] sm:w-[196px] sm:h-[196px] rounded-full will-change-transform"
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

              {/* Khiên Bảo vệ 3D Cũ + Đế Hologram gọn cân đối */}
              <div className="relative z-20 flex flex-col items-center pt-3">
                <div
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  title="Bấm để mở Cổng Đăng nhập Giảng viên & Quản trị viên"
                  className="relative cursor-pointer will-change-transform"
                  style={{ animation: 'shieldFloatPulse 5s ease-in-out infinite' }}
                >
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-[#38BDF8]/70 will-change-transform"
                    style={{ animation: 'orbitSpinClockwise 12s linear infinite' }}
                  />

                  <svg className="w-32 h-36 sm:w-34 sm:h-38 overflow-visible" viewBox="0 0 200 230" fill="none">
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

                {/* Bệ Đế Hologram gọn gàng */}
                <div className="relative -mt-2 flex flex-col items-center">
                  <div className="w-40 h-8 rounded-full bg-gradient-to-b from-[#2E1E72] to-[#110B36] border-2 border-[#A78BFA] shadow-[0_10px_24px_rgba(91,33,182,0.34)] flex items-center justify-center">
                    <div className="w-30 h-4 rounded-full border border-dashed border-[#38BDF8]/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. BA TRỤ CỘT CÔNG NGHỆ & LUỒNG TỔNG QUAN 4 BƯỚC ĐỀU NHAU ==================== */}
      <section id="landing-section-TECH" className="scroll-mt-20 w-full bg-[#F7F5FE] pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          {/* Hàng 3 thẻ công nghệ trắng sắc nét (gộp luôn tag kỹ thuật, tránh trùng lặp bên dưới) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CORE_TECH_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => handleNavClick('SYSTEM')}
                className="group relative bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-[0_6px_24px_rgba(109,40,217,0.05)] hover:shadow-[0_14px_32px_rgba(109,40,217,0.11)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] border border-[#E5DCFE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold text-[#1E1B4B] m-0 group-hover:text-[#6D28D9] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 m-0 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-[#F5F3FF] text-[#5B21B6] text-[11.5px] font-mono font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="w-7 h-7 rounded-full bg-[#F3EEFF] group-hover:bg-[#6D28D9] text-[#6D28D9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Thanh Tổng quan hệ thống 4 bước chiều rộng bằng nhau tuyệt đối */}
          <div className="pt-2 flex flex-col xl:flex-row xl:items-center gap-5">
            <div className="shrink-0 xl:w-48">
              <h2 className="text-xl font-extrabold text-[#1E1B4B] m-0">Tổng quan hệ thống</h2>
              <div className="w-11 h-1 rounded-full bg-[#6D28D9] mt-2" />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
              {OVERVIEW_STEPS.map((step, idx) => (
                <Fragment key={step.id}>
                  <div className="flex-1 bg-white rounded-2xl border border-purple-100 px-4 py-3.5 shadow-[0_4px_16px_rgba(109,40,217,0.04)] flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F3EEFF] flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-bold text-[#1E1B4B] truncate">
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{step.sub}</div>
                    </div>
                  </div>
                  {idx < OVERVIEW_STEPS.length - 1 && (
                    <ArrowRight className="hidden lg:block w-4 h-4 text-[#7C3AED] shrink-0" />
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
        className="scroll-mt-20 py-14 lg:py-16 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-9">
          <div className="max-w-2xl mx-auto text-center space-y-2.5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Phân hệ Nghiệp vụ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] m-0">
              Hai cổng điều hành chuyên biệt: Giảng viên &amp; Quản trị viên
            </h2>
            <p className="text-sm sm:text-base text-slate-600 m-0">
              Phân quyền tách bạch Zero-Trust giữa Cổng Giảng viên (Verifier) và Cổng Quản trị Hệ thống (Issuer).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PORTAL_MODULES.map((mod) => (
              <div
                key={mod.step}
                className="relative overflow-hidden rounded-3xl bg-[#FAF8FF] border border-purple-100 shadow-xs flex flex-col justify-between"
              >
                {/* Thanh viền màu nhận diện trên đỉnh thẻ */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${mod.barColor}`} />

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center shadow-sm`}
                      >
                        {mod.icon}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white border border-purple-200/80 text-xs font-mono font-semibold text-slate-600">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-[11.5px] font-bold text-[#6D28D9] tracking-wider uppercase">
                        {mod.step} • {mod.role}
                      </div>
                      <h3 className="text-xl font-extrabold text-[#1E1B4B] mt-1 mb-0">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {mod.points.map((pt, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-1" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => onOpenLogin && onOpenLogin(mod.loginRole)}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#6D28D9] text-[#5B21B6] hover:text-white border border-purple-200 hover:border-[#6D28D9] text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-colors shadow-2xs"
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
        className="scroll-mt-20 py-14 lg:py-16 bg-[#F7F5FE] border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-2.5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white border border-purple-200 text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Kết quả &amp; An toàn Hệ thống
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] m-0">
              Hiệu năng vượt trội &amp; Phòng vệ 4 lớp SOC IDS
            </h2>
          </div>

          {/* 4 Chỉ số KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {RESULT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_6px_20px_rgba(109,40,217,0.04)] text-center space-y-1"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#6D28D9] tabular-nums">
                  {m.value}
                </div>
                <div className="text-sm sm:text-[15px] font-bold text-[#1E1B4B]">{m.label}</div>
                <div className="text-xs text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* 4 Kịch bản phòng vệ SOC IDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFENSE_SCENARIOS.map((sc) => (
              <div
                key={sc.code}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200/75 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-rose-600">{sc.code}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
                <h4 className="text-sm font-bold text-[#1E1B4B] m-0">{sc.title}</h4>
                <p className="text-xs text-slate-600 m-0 leading-relaxed">{sc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. ĐƠN VỊ VẬN HÀNH & CTA CUỐI TRANG ==================== */}
      <section
        id="landing-section-TEAM"
        className="scroll-mt-20 py-14 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-1.5">
              <div className="text-[11.5px] font-bold text-[#6D28D9] uppercase tracking-wider">
                Đơn vị chủ trì
              </div>
              <div className="text-base font-extrabold text-[#1E1B4B]">
                Khoa Công nghệ Thông tin – UTH
              </div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Trường Đại học Giao thông Vận tải TP.HCM — Triển khai hạ tầng xác thực số học thuật.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-1.5">
              <div className="text-[11.5px] font-bold text-[#2563EB] uppercase tracking-wider">
                Cổng Điều hành Giảng viên
              </div>
              <div className="text-base font-extrabold text-[#1E1B4B]">TS. Nguyễn Thị Mai</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Điều hành lớp học, giám sát phiên QR động, bản đồ GPS Radar và cấp chứng chỉ số môn học.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-1.5">
              <div className="text-[11.5px] font-bold text-emerald-600 uppercase tracking-wider">
                Cổng Quản trị Hệ thống
              </div>
              <div className="text-base font-extrabold text-[#1E1B4B]">
                Ban Quản trị UTH-TrustID
              </div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Quản trị định danh W3C DID, chính sách WebAuthn, Merkle Tree Blockchain và giám sát SOC.
              </p>
            </div>
          </div>

          {/* CTA Banner gọn đẹp */}
          <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white shadow-lg shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold m-0">
                Truy cập Cổng Giảng viên &amp; Quản trị viên UTH-TrustID
              </h3>
              <p className="text-sm text-purple-100 m-0">
                Đăng nhập tài khoản cán bộ UTH để mở phiên điểm danh QR động và quản trị hạ tầng định danh số.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold no-underline inline-flex items-center gap-2 transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-[#5B21B6] text-sm font-extrabold border-none cursor-pointer inline-flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.02]"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER GỌN 1 DÒNG ==================== */}
      <footer className="w-full bg-[#F7F5FE] border-t border-purple-100 py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <img src="/uth-logo.png" alt="UTH" className="h-6 w-auto object-contain block" />
            <span className="text-slate-300">|</span>
            <span>© 2026 UTH-TrustID • Cổng Giảng viên &amp; Quản trị viên UTH</span>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F3EEFF] text-[#6D28D9] text-xs font-bold border border-purple-200 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
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
          <div className="uth-modal-panel w-full max-w-xl rounded-3xl bg-white border border-purple-100 p-6 sm:p-7 shadow-2xl space-y-5">
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
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs sm:text-sm font-semibold">
                  Cổng Điều hành Giảng viên &amp; Quản trị viên — ĐH Giao thông Vận tải TP.HCM
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OVERVIEW_STEPS.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-purple-100 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6D28D9] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1E1B4B] truncate">{st.title}</div>
                    <div className="text-xs text-slate-500 truncate">{st.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  if (onOpenLogin) onOpenLogin('FACULTY');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-bold border-none cursor-pointer inline-flex items-center gap-2 shadow-sm"
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
