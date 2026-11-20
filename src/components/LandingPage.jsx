import React, { useState, useEffect } from 'react';
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
  { id: 'INTRO', label: 'Giới thiệu' },
  { id: 'TECH', label: 'Công nghệ' },
  { id: 'SYSTEM', label: 'Phân hệ' },
  { id: 'RESULTS', label: 'Kết quả' },
  { id: 'TEAM', label: 'Đơn vị' }
];

const HERO_TECH_CARDS = [
  {
    id: 'W3C_DID',
    title: 'W3C DID',
    desc: 'Quản trị và cấp phát định danh số phi tập trung chuẩn W3C, minh bạch hóa dữ liệu toàn trường.',
    icon: <IdCard className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  },
  {
    id: 'WEBAUTHN',
    title: 'WebAuthn',
    desc: 'Kiểm soát chính sách xác thực không mật khẩu (Passkey), ràng buộc thiết bị và chống giả mạo.',
    icon: <Fingerprint className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  },
  {
    id: 'MERKLE',
    title: 'Merkle Tree',
    desc: 'Đóng lô chứng chỉ số, xác minh tính toàn vẹn điểm danh và neo Merkle Root lên Blockchain.',
    icon: <GitBranch className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  }
];

const OVERVIEW_STEPS = [
  {
    id: 'st-1',
    title: 'Giảng viên mở phiên',
    sub: '(QR Nonce xoay động)',
    icon: <QrCode className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-2',
    title: 'Kiểm tra WebAuthn',
    sub: '(Chữ ký & GPS Radar)',
    icon: <Fingerprint className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-3',
    title: 'Ghi nhận & đối soát',
    sub: '(Merkle Tree & SOC IDS)',
    icon: <Layers className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-4',
    title: 'Quản trị & lưu vết',
    sub: '(Admin DID / VC / Excel)',
    icon: <Database className="w-5 h-5 text-[#6D28D9]" />
  }
];

const INTRO_OBJECTIVES = [
  {
    num: '01',
    title: 'Điều hành điểm danh phòng học thời gian thực cho Giảng viên',
    desc: 'Tạo phiên QR Nonce xoay tự động chống chụp ảnh, theo dõi bản đồ GPS Radar lớp học, kích hoạt hậu kiểm Spot-Check 60s và xuất báo cáo Excel (.xlsx).'
  },
  {
    num: '02',
    title: 'Quản trị hạ tầng định danh W3C DID & Chứng chỉ số (VC) cho Admin',
    desc: 'Cấp phát và quản lý danh mục người dùng, định danh DID, chứng chỉ số học thuật theo lô Merkle Tree và thu hồi khóa thiết bị độ phức tạp O(1).'
  },
  {
    num: '03',
    title: 'Phòng vệ chủ động 4 lớp SOC IDS & Minh bạch On-Chain',
    desc: 'Tự động phát hiện và chặn đứng hành vi quét lại QR cũ, giả mạo chữ ký EIP-191, điểm danh hộ 1 máy nhiều tài khoản và Fake GPS ngoài phạm vi lớp.'
  }
];

const TECH_DETAILS = [
  {
    title: 'W3C DID & Verifiable Credentials',
    icon: <IdCard className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Quản trị định danh chuẩn did:uth:secp256k1 và phát hành chứng chỉ số học thuật có chữ ký số xác minh độc lập trên toàn hệ thống UTH.',
    tags: ['W3C DID 1.0', 'JSON-LD VC', 'EIP-191', 'Zero-Trust']
  },
  {
    title: 'WebAuthn / FIDO2 & Device Policy',
    icon: <Fingerprint className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Thiết lập chính sách xác thực phần cứng TPM / Secure Enclave, ràng buộc thiết bị theo từng phiên học để ngăn chặn gian lận điểm danh hộ.',
    tags: ['FIDO2 Passkey', 'Device Binding', 'SOC Policy', 'Auto-Block 403']
  },
  {
    title: 'Keccak256 Merkle Tree & Blockchain',
    icon: <GitBranch className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Đóng lô hàng nghìn bản ghi điểm danh & chứng chỉ thành 1 Merkle Root 32-byte duy nhất neo lên Smart Contract, xác minh nhánh Proof O(log₂ N).',
    tags: ['Keccak256', 'Merkle Proof O(log N)', '32-Byte Root', 'Revocation O(1)']
  }
];

const PORTAL_MODULES = [
  {
    step: '01',
    role: 'VERIFIER • GIẢNG VIÊN',
    title: 'Cổng Điều hành Giảng viên (Faculty Portal)',
    badge: '10 Màn hình Nghiệp vụ',
    loginRole: 'FACULTY',
    ctaLabel: 'Đăng nhập Cổng Giảng viên',
    icon: <MonitorCheck className="w-6 h-6 text-white" />,
    accent: 'from-[#16345E] to-[#2563EB]',
    points: [
      'Quản lý lớp học, tạo phiên điểm danh QR Nonce động và chế độ chiếu toàn màn hình.',
      'Giám sát bản đồ GPS Radar phòng học theo bán kính lớp & hậu kiểm Spot-Check 60s.',
      'Cấp chứng chỉ số (VC), quản lý DID lớp học, cảnh báo SOC IDS và xuất Excel (.xlsx).'
    ]
  },
  {
    step: '02',
    role: 'ISSUER • QUẢN TRỊ VIÊN',
    title: 'Cổng Quản trị Hệ thống (Admin Portal)',
    badge: '10 Phân hệ Hạ tầng',
    loginRole: 'ADMIN',
    ctaLabel: 'Đăng nhập Cổng Quản trị',
    icon: <Building2 className="w-6 h-6 text-white" />,
    accent: 'from-[#6D28D9] to-[#4F46E5]',
    points: [
      'Quản trị tài khoản người dùng, cấp phát định danh W3C DID & quản lý vòng đời VC toàn trường.',
      'Vận hành cây băm Merkle Tree, neo Merkle Root lên Blockchain và giám sát Smart Contract.',
      'Cấu hình chính sách WebAuthn (Passkey), thu hồi khóa O(1), nhật ký kiểm toán & báo cáo.'
    ]
  }
];

const RESULT_METRICS = [
  { value: '96,4%', label: 'Tiết kiệm chi phí Gas', sub: 'So với ghi từng chứng chỉ rời rạc On-Chain' },
  { value: '< 2 ms', label: 'Xác minh Merkle Proof', sub: 'Độ phức tạp tính toán O(log₂ N) tức thì' },
  { value: '100%', label: 'Chặn tấn công SOC IDS', sub: 'Tự động từ chối HTTP 403 cả 4 kịch bản' },
  { value: '12.548+', label: 'Định danh DID quản trị', sub: 'Đồng bộ 26.937 chứng chỉ số (VC)' }
];

const DEFENSE_SCENARIOS = [
  {
    code: 'REPLAY_ATTACK',
    title: 'Chống quét lại ảnh QR cũ',
    desc: 'Vô hiệu hóa ảnh chụp màn hình QR gửi qua mạng nhờ mã Nonce xoay liên tục.'
  },
  {
    code: 'DEVICE_SPOOFING',
    title: 'Chống giả mạo chữ ký số',
    desc: 'Đối chiếu chữ ký mật mã EIP-191 khớp khóa công khai DID đã đăng ký trên hệ thống.'
  },
  {
    code: 'PROXY_ATTENDANCE',
    title: 'Chống 1 máy điểm danh hộ',
    desc: 'Khóa vân tay phần cứng thiết bị (Device Fingerprint) trên mỗi phiên học.'
  },
  {
    code: 'GEOFENCE_BREACH',
    title: 'Chống Fake GPS ngoài lớp',
    desc: 'Tính khoảng cách Haversine so với tâm phòng học và cảnh báo tọa độ giả lập.'
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
    const sectionIds = ['INTRO', 'TECH', 'SYSTEM', 'RESULTS', 'TEAM'];
    const handleScroll = () => {
      if (window.scrollY < 240) {
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
      {/* Keyframes thuần GPU Compositor cho Khiên 3D & 2 Vòng quỹ đạo xoay tròn như cũ */}
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
          50% { transform: translate3d(0, -9px, 0); }
        }
      `}</style>

      {/* ==================== 1. STICKY TOP NAVBAR SÁNG TRẮNG CHUẨN ĐẠI HỌC UTH ==================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-purple-100/90 shadow-[0_2px_14px_rgba(109,40,217,0.04)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-[76px] flex items-center justify-between gap-4">
          {/* Trái: Logo UTH Chính thức | Khiên UTH-TrustID */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('HOME')}
              className="flex items-center gap-3.5 sm:gap-4 bg-transparent border-none cursor-pointer p-0"
            >
              <img
                src="/uth-logo.png"
                alt="UTH - University of Transport Ho Chi Minh City"
                className="h-8 sm:h-10 w-auto object-contain block"
              />
              <span className="hidden sm:inline-block h-7 w-px bg-slate-300" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-sm shadow-purple-500/30">
                  <ShieldCheck className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-lg font-extrabold tracking-tight text-[#1E1B4B]">
                    UTH-TrustID
                  </span>
                  <span className="block text-[10px] font-bold text-[#6D28D9] uppercase tracking-wider">
                    Faculty &amp; Admin Portal
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Giữa: 6 Mục điều hướng */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2 text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                    isActive ? 'text-[#6D28D9]' : 'text-slate-700 hover:text-[#6D28D9]'
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

          {/* Phải: Nút Xem mã nguồn màu tím */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-sm font-semibold no-underline shadow-md shadow-purple-500/20 inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Xem mã nguồn</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-90" />
            </a>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO BANNER TRẮNG – TÍM LAVENDER + ẢNH UTH & KHIÊN 3D XOAY QUỸ ĐẠO NHƯ CŨ ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7F4FF] to-[#EFE9FF]">
        {/* Dải sóng tím lavender mềm mại ở góc trên trái */}
        <svg
          className="pointer-events-none absolute top-0 left-0 w-72 h-52 opacity-55"
          viewBox="0 0 300 220"
          fill="none"
        >
          <path d="M-30 10 C 60 80, 140 130, 260 155 L -30 220 Z" fill="url(#leftSoftWave)" />
          <defs>
            <linearGradient id="leftSoftWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ảnh thật Tòa nhà ĐH Giao thông Vận tải TP.HCM (UTH) hòa nền mượt bên phải */}
        <div className="pointer-events-none hidden lg:block absolute right-0 top-0 bottom-0 w-[62%] overflow-hidden">
          <img
            src="/uth-campus-banner.jpg"
            alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #FFFFFF 0%, rgba(248,245,255,0.96) 10%, rgba(247,244,255,0.62) 26%, rgba(247,244,255,0.12) 48%)'
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                'linear-gradient(0deg, #F7F5FE 0%, rgba(247,245,254,0.8) 45%, transparent 100%)'
            }}
          />
        </div>

        {/* Nội dung chính Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 pb-12 lg:pt-12 lg:pb-14 grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          {/* Cột trái (6 cột): Thông điệp Cổng Giảng viên & Quản trị viên */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#4C1D95] text-sm font-semibold shadow-2xs">
              <Building2 className="w-4 h-4 text-[#6D28D9]" />
              <span>Cổng Điều hành Giảng viên &amp; Quản trị viên</span>
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-[68px] font-black tracking-tight leading-none m-0 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] bg-clip-text text-transparent">
              UTH-TrustID
            </h1>

            <p className="text-base sm:text-[17px] text-slate-700 leading-[1.68] font-medium m-0 max-w-[530px]">
              Hệ thống quản trị định danh số phi tập trung và điều hành xác thực hiện diện phòng học dành riêng cho <strong className="text-[#1E1B4B]">Giảng viên</strong> và <strong className="text-[#1E1B4B]">Quản trị viên</strong>, ứng dụng W3C DID, WebAuthn và Merkle Tree tại Trường Đại học Giao thông Vận tải TP.HCM (UTH).
            </p>

            {/* Cụm 2 nút CTA */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:brightness-110 text-white text-[15px] font-bold border-none shadow-lg shadow-purple-600/25 cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span>Khám phá hệ thống</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#1E1B4B] text-[15px] font-bold border border-purple-200/90 shadow-xs cursor-pointer transition-colors inline-flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Xem quy trình vận hành</span>
              </button>
            </div>

            {/* Hàng 3 nhãn niềm tin */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-3 text-sm font-bold text-[#1E1B4B]">
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

          {/* Cột phải (6 cột): ĐƯA LẠI KHIÊN 3D CŨ CÓ 2 VÒNG QUỸ ĐẠO XOAY 360° + BỆ ĐẾ HOLOGRAM */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-center lg:pl-4">
            {/* Trên màn hình nhỏ hiển thị thêm ảnh trường UTH gọn đẹp */}
            <div className="lg:hidden w-full rounded-2xl overflow-hidden border border-purple-200 shadow-lg mb-4">
              <img
                src="/uth-campus-banner.jpg"
                alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
                className="w-full h-48 sm:h-60 object-cover"
              />
            </div>

            <div
              className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center select-none"
              style={{ contain: 'layout paint' }}
            >
              {/* Quầng sáng dịu tôn Khiên nổi bật trước nền trường UTH */}
              <div
                className="pointer-events-none absolute w-[290px] h-[290px] sm:w-[330px] sm:h-[330px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(237,233,254,0.68) 42%, rgba(168,85,247,0.16) 66%, transparent 78%)'
                }}
              />

              {/* Vòng quỹ đạo xoay tròn ngoài (Clockwise 360°) */}
              <div
                className="pointer-events-none absolute w-[285px] h-[285px] sm:w-[335px] sm:h-[335px] rounded-full will-change-transform"
                style={{ animation: 'orbitSpinClockwise 24s linear infinite' }}
              >
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                  <circle
                    cx="200"
                    cy="200"
                    r="186"
                    stroke="url(#outerOrbitGrad)"
                    strokeWidth="2.4"
                    strokeDasharray="16 10 4 10"
                  />
                  <circle cx="200" cy="14" r="10" fill="#7C3AED" opacity="0.25" />
                  <circle cx="200" cy="14" r="4.8" fill="#6D28D9" />
                  <circle cx="386" cy="200" r="10" fill="#0284C7" opacity="0.25" />
                  <circle cx="386" cy="200" r="4.8" fill="#0EA5E9" />
                  <circle cx="200" cy="386" r="9" fill="#9333EA" opacity="0.25" />
                  <circle cx="200" cy="386" r="4.5" fill="#7C3AED" />
                  <circle cx="14" cy="200" r="10" fill="#0284C7" opacity="0.25" />
                  <circle cx="14" cy="200" r="4.8" fill="#0EA5E9" />
                  <defs>
                    <linearGradient id="outerOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Vòng quỹ đạo xoay tròn trong (Counter-Clockwise 360°) */}
              <div
                className="pointer-events-none absolute w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full will-change-transform"
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

              {/* Khiên Bảo vệ 3D Cũ (Biểu tượng Định danh + Khiên Tích góc dưới phải + Đế Hologram) */}
              <div className="relative z-20 flex flex-col items-center pt-4">
                <div
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  title="Bấm để mở Cổng Đăng nhập Giảng viên & Quản trị viên UTH-TrustID"
                  className="relative cursor-pointer will-change-transform"
                  style={{ animation: 'shieldFloatPulse 5s ease-in-out infinite' }}
                >
                  {/* Vòng nét đứt quay sát viền Khiên */}
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-full border-2 border-dashed border-[#38BDF8]/65 will-change-transform"
                    style={{ animation: 'orbitSpinClockwise 12s linear infinite' }}
                  />

                  <svg
                    className="w-40 h-46 sm:w-44 sm:h-52 overflow-visible"
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

                    {/* Lớp bóng đổ 3D phía sau Khiên */}
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="#4C1D95"
                      opacity="0.34"
                      transform="translate(7, 7)"
                    />

                    {/* Khung Khiên 3D chính */}
                    <path
                      d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                      fill="url(#shieldInnerGrad)"
                      stroke="url(#shieldOuterGrad)"
                      strokeWidth="5"
                    />

                    {/* Đường viền Neon bên trong Khiên */}
                    <path
                      d="M100 27 L163 54 V110 C163 155 135 186 100 202 C65 186 37 155 37 110 V54 L100 27 Z"
                      fill="none"
                      stroke="url(#neonRimGrad)"
                      strokeWidth="2.5"
                      opacity="0.95"
                    />

                    {/* Biểu tượng Định danh ở chính giữa Khiên */}
                    <circle cx="100" cy="94" r="21" fill="url(#shieldOuterGrad)" opacity="0.96" />
                    <path
                      d="M62 156 C62 133 78 122 100 122 C122 122 138 133 138 156"
                      fill="url(#shieldOuterGrad)"
                      opacity="0.92"
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

                {/* Bệ Đế Hologram tròn cân đối bên dưới Khiên */}
                <div className="relative -mt-3 flex flex-col items-center">
                  <div className="w-52 sm:w-56 h-10 rounded-full bg-gradient-to-b from-[#2E1E72] to-[#110B36] border-2 border-[#A78BFA] shadow-[0_12px_28px_rgba(91,33,182,0.38)] flex items-center justify-center">
                    <div className="w-40 sm:w-44 h-5 rounded-full border border-dashed border-[#38BDF8]/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. HÀNG 3 THẺ CÔNG NGHỆ TRẮNG SÁNG (W3C DID • WEBAUTHN • MERKLE TREE) ==================== */}
      <section className="relative z-20 w-full bg-[#F7F5FE] pt-2 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {HERO_TECH_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => handleNavClick(card.target)}
              className="group relative bg-white rounded-2xl border border-purple-100/90 p-6 shadow-[0_8px_28px_rgba(109,40,217,0.06)] hover:shadow-[0_16px_36px_rgba(109,40,217,0.12)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex items-start gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#F3EEFF] border border-[#E5DCFE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {card.icon}
              </div>

              <div className="min-w-0 flex-1 pr-6">
                <h3 className="text-xl font-extrabold text-[#1E1B4B] m-0 group-hover:text-[#6D28D9] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 m-0 mt-1.5 leading-relaxed">{card.desc}</p>
              </div>

              <span className="absolute right-4 bottom-4 w-7 h-7 rounded-full bg-[#F3EEFF] group-hover:bg-[#6D28D9] text-[#6D28D9] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. TỔNG QUAN QUY TRÌNH ĐIỀU HÀNH (GIẢNG VIÊN & QUẢN TRỊ VIÊN) ==================== */}
      <section className="w-full bg-[#F7F5FE] pb-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6">
            <div className="shrink-0 xl:w-52">
              <h2 className="text-2xl font-extrabold text-[#1E1B4B] m-0">Tổng quan hệ thống</h2>
              <div className="w-12 h-1 rounded-full bg-[#6D28D9] mt-2.5" />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-center">
              {OVERVIEW_STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2.5">
                  <div className="flex-1 bg-white rounded-2xl border border-purple-100/90 px-4 py-3.5 shadow-[0_6px_20px_rgba(109,40,217,0.05)] flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F3EEFF] flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#1E1B4B] truncate">{step.title}</div>
                      <div className="text-xs text-slate-500 truncate">{step.sub}</div>
                    </div>
                  </div>
                  {idx < OVERVIEW_STEPS.length - 1 && (
                    <ArrowRight className="hidden lg:block w-4 h-4 text-[#7C3AED] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. GIỚI THIỆU HỆ THỐNG (#landing-section-INTRO) ==================== */}
      <section
        id="landing-section-INTRO"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Giới thiệu Hệ thống
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Nền tảng quản trị định danh &amp; điều hành điểm danh UTH
            </h2>
            <p className="text-base text-slate-600 m-0 leading-relaxed">
              Thiết kế tối ưu cho đội ngũ Giảng viên và Quản trị viên nhà trường kiểm soát toàn diện vòng đời định danh DID, phiên điểm danh phòng học và dữ liệu kiểm toán Blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {INTRO_OBJECTIVES.map((obj) => (
              <div
                key={obj.num}
                className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] text-white font-mono font-bold text-base flex items-center justify-center shadow-sm shadow-purple-500/25">
                  {obj.num}
                </div>
                <h3 className="text-lg font-bold text-[#1E1B4B] m-0 leading-snug">{obj.title}</h3>
                <p className="text-sm text-slate-600 m-0 leading-relaxed">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. NỀN TẢNG CÔNG NGHỆ (#landing-section-TECH) ==================== */}
      <section
        id="landing-section-TECH"
        className="scroll-mt-20 py-16 lg:py-20 bg-[#F7F5FE] border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white border border-purple-200 text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Công nghệ Cốt lõi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Ba trụ cột mật mã học bảo toàn dữ liệu đào tạo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TECH_DETAILS.map((tech, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-purple-100 shadow-[0_8px_24px_rgba(109,40,217,0.05)] flex flex-col justify-between gap-5"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] border border-[#E2D6FE] flex items-center justify-center">
                    {tech.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1E1B4B] m-0">{tech.title}</h3>
                  <p className="text-sm text-slate-600 m-0 leading-relaxed">{tech.desc}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  {tech.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#F5F3FF] border border-purple-200/80 text-xs font-mono font-semibold text-[#5B21B6]"
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

      {/* ==================== 7. HAI PHÂN HỆ CHÍNH: GIẢNG VIÊN & QUẢN TRỊ VIÊN (#landing-section-SYSTEM) ==================== */}
      <section
        id="landing-section-SYSTEM"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Phân hệ Quản trị &amp; Điều hành
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Hai cổng nghiệp vụ chuyên biệt: Giảng viên &amp; Quản trị viên
            </h2>
            <p className="text-base text-slate-600 m-0 leading-relaxed">
              Phân quyền tách bạch theo nguyên tắc Zero-Trust giữa Cổng Điều hành Giảng viên (Verifier) và Cổng Quản trị Hệ thống (Issuer).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PORTAL_MODULES.map((mod) => (
              <div
                key={mod.step}
                className="p-7 rounded-3xl bg-[#FAF8FF] border border-purple-100 shadow-xs flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.accent} flex items-center justify-center shadow-md`}
                    >
                      {mod.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border border-purple-200/80 text-xs font-mono font-semibold text-slate-600">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#6D28D9] tracking-wider uppercase">
                      {mod.step} • {mod.role}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] mt-1 mb-0">
                      {mod.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {mod.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#6D28D9] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={() => onOpenLogin && onOpenLogin(mod.loginRole)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#6D28D9] text-[#5B21B6] hover:text-white border border-purple-200 hover:border-[#6D28D9] text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{mod.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 8. KẾT QUẢ THỰC NGHIỆM & PHÒNG VỆ SOC IDS (#landing-section-RESULTS) ==================== */}
      <section
        id="landing-section-RESULTS"
        className="scroll-mt-20 py-16 lg:py-20 bg-[#F7F5FE] border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white border border-purple-200 text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Kết quả Thực nghiệm
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Hiệu năng vượt trội &amp; Phòng vệ 4 lớp SOC IDS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESULT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-purple-100 shadow-[0_8px_24px_rgba(109,40,217,0.05)] text-center space-y-1.5"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#6D28D9] tabular-nums">
                  {m.value}
                </div>
                <div className="text-base font-bold text-[#1E1B4B]">{m.label}</div>
                <div className="text-xs text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFENSE_SCENARIOS.map((sc) => (
              <div
                key={sc.code}
                className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-rose-600">{sc.code}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
                <h4 className="text-sm font-bold text-[#1E1B4B] m-0">{sc.title}</h4>
                <p className="text-xs sm:text-[13px] text-slate-600 m-0 leading-relaxed">{sc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 9. ĐƠN VỊ VẬN HÀNH & CTA CUỐI TRANG (#landing-section-TEAM) ==================== */}
      <section
        id="landing-section-TEAM"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Đơn vị Chủ trì &amp; Vận hành
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Trường Đại học Giao thông Vận tải TP.HCM (UTH)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider">
                Đơn vị chủ trì
              </div>
              <div className="text-lg font-bold text-[#1E1B4B]">Khoa Công nghệ Thông tin</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Trường Đại học Giao thông Vận tải TP.HCM (UTH) — Trung tâm triển khai thử nghiệm hạ tầng xác thực số học thuật.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                Cổng Điều hành Giảng viên
              </div>
              <div className="text-lg font-bold text-[#1E1B4B]">TS. Nguyễn Thị Mai</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Phụ trách chuyên môn điều hành lớp học, giám sát điểm danh QR động, bản đồ GPS Radar và cấp chứng chỉ số môn học.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Cổng Quản trị Hệ thống
              </div>
              <div className="text-lg font-bold text-[#1E1B4B]">Ban Quản trị UTH-TrustID</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Vận hành hạ tầng W3C DID, chính sách WebAuthn, Merkle Tree Blockchain và giám sát an toàn thông tin SOC 24/7.
              </p>
            </div>
          </div>

          {/* CTA Banner cuối trang */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white shadow-xl shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-2xl font-extrabold m-0">
                Truy cập Cổng Giảng viên &amp; Quản trị viên UTH-TrustID
              </h3>
              <p className="text-sm sm:text-base text-purple-100 m-0">
                Đăng nhập tài khoản cán bộ UTH để mở phiên điểm danh QR động, quản trị DID/VC và giám sát hệ thống.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold no-underline inline-flex items-center gap-2 transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>Xem GitHub</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="px-6 py-3 rounded-xl bg-white hover:bg-purple-50 text-[#5B21B6] text-sm font-extrabold border-none cursor-pointer inline-flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
              >
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER SÁNG GỌN GÀNG + NÚT CUỘN LÊN ĐẦU TRANG ==================== */}
      <footer className="w-full bg-[#F7F5FE] border-t border-purple-100 py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <img src="/uth-logo.png" alt="UTH" className="h-6 w-auto object-contain block" />
            <span className="text-slate-300">|</span>
            <span>© 2026 UTH-TrustID • Cổng Giảng viên &amp; Quản trị viên UTH</span>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('HOME')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F3EEFF] text-[#6D28D9] text-xs sm:text-sm font-bold border border-purple-200 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Cuộn lên đầu trang</span>
          </button>
        </div>
      </footer>

      {/* ==================== MODAL XEM QUY TRÌNH VẬN HÀNH GIẢNG VIÊN & ADMIN ==================== */}
      {showIntroModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIntroModal(false);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
        >
          <div className="uth-modal-panel w-full max-w-2xl rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#F3EEFF] text-[#6D28D9] text-xs font-bold">
                  QUY TRÌNH VẬN HÀNH GIẢNG VIÊN &amp; QUẢN TRỊ VIÊN
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] mt-2 mb-0">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/85 via-[#1E1B4B]/20 to-transparent flex items-end p-4">
                <div className="text-white text-sm font-semibold">
                  Cổng Điều hành Giảng viên &amp; Quản trị viên — Đại học Giao thông Vận tải TP.HCM (UTH)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OVERVIEW_STEPS.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-purple-100 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#6D28D9] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1E1B4B]">{st.title}</div>
                    <div className="text-xs text-slate-500">{st.sub}</div>
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-bold border-none cursor-pointer inline-flex items-center gap-2 shadow-md shadow-purple-500/25"
              >
                <span>Mở cổng hệ thống ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
