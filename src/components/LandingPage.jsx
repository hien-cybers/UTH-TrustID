import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  ArrowRight,
  ArrowUp,
  Play,
  ShieldCheck,
  Layers,
  Zap,
  Fingerprint,
  IdCard,
  GitBranch,
  CheckCircle2,
  Building2,
  Smartphone,
  MonitorCheck,
  ShieldAlert,
  ExternalLink,
  User,
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
  { id: 'SYSTEM', label: 'Hệ thống' },
  { id: 'RESULTS', label: 'Kết quả' },
  { id: 'TEAM', label: 'Đội ngũ' }
];

const HERO_TECH_CARDS = [
  {
    id: 'W3C_DID',
    title: 'W3C DID',
    desc: 'Định danh số phi tập trung theo chuẩn W3C, giúp người dùng tự chủ danh tính và kiểm soát dữ liệu.',
    icon: <IdCard className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  },
  {
    id: 'WEBAUTHN',
    title: 'WebAuthn',
    desc: 'Xác thực an toàn, không mật khẩu với khóa công khai (Passkey), tăng cường bảo mật và trải nghiệm.',
    icon: <Fingerprint className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  },
  {
    id: 'MERKLE',
    title: 'Merkle Tree',
    desc: 'Xác minh tính toàn vẹn và minh bạch dữ liệu điểm danh, đảm bảo không thể giả mạo.',
    icon: <GitBranch className="w-8 h-8 text-[#6D28D9]" />,
    target: 'TECH'
  }
];

const OVERVIEW_STEPS = [
  {
    id: 'st-1',
    title: 'Sinh viên',
    sub: '(Thiết bị di động)',
    icon: <User className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-2',
    title: 'Xác thực WebAuthn',
    sub: '(Passkey)',
    icon: <Fingerprint className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-3',
    title: 'Ghi nhận & xác minh',
    sub: '(Merkle Tree)',
    icon: <Layers className="w-5 h-5 text-[#6D28D9]" />
  },
  {
    id: 'st-4',
    title: 'Lưu trữ & quản lý',
    sub: '(W3C DID)',
    icon: <IdCard className="w-5 h-5 text-[#6D28D9]" />
  }
];

const INTRO_OBJECTIVES = [
  {
    num: '01',
    title: 'Tự chủ danh tính theo chuẩn quốc tế W3C DID Core 1.0',
    desc: 'Trao quyền kiểm soát danh tính số (Self-Sovereign Identity) trực tiếp cho sinh viên trên thiết bị cá nhân, loại bỏ rủi ro rò rỉ dữ liệu tập trung.'
  },
  {
    num: '02',
    title: 'Xác thực không mật khẩu bằng WebAuthn / FIDO2 Passkey',
    desc: 'Khóa riêng tư sinh và bảo vệ trong chip bảo mật phần cứng (Face ID, Touch ID, Windows Hello), gắn chặt với thiết bị sinh viên.'
  },
  {
    num: '03',
    title: 'Xác thực hiện diện phòng học đa nhân tố thời gian thực',
    desc: 'Kết hợp mã QR Nonce xoay liên tục, khoanh vùng GPS Geofencing (R ≤ 35m), chữ ký số EIP-191 và hậu kiểm Spot-Check 60 giây.'
  }
];

const TECH_DETAILS = [
  {
    title: 'W3C DID & Verifiable Credentials',
    icon: <IdCard className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Định danh chuẩn did:uth:secp256k1 và chứng chỉ học thuật có chữ ký số xác minh độc lập, hỗ trợ tiết lộ chọn lọc ZKP-Lite bảo vệ quyền riêng tư.',
    tags: ['W3C DID 1.0', 'JSON-LD VC', 'EIP-191', 'ZKP-Lite']
  },
  {
    title: 'WebAuthn / FIDO2 Passkey',
    icon: <Fingerprint className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Cơ chế xác thực khóa công khai gắn phần cứng TPM / Secure Enclave cùng mã hóa AES-GCM 256-bit (PBKDF2 100.000 vòng) ngăn điểm danh hộ.',
    tags: ['FIDO2 Passkey', 'Face ID / Touch ID', 'Device Binding', 'AES-GCM 256']
  },
  {
    title: 'Keccak256 Merkle Tree & On-Chain Anchor',
    icon: <GitBranch className="w-6 h-6 text-[#6D28D9]" />,
    desc: 'Đóng lô hàng nghìn lượt điểm danh & chứng chỉ số thành 1 Merkle Root 32-byte duy nhất neo lên Blockchain, xác minh nhánh Proof O(log₂ N).',
    tags: ['Keccak256', 'Merkle Proof O(log N)', '32-Byte Root', 'Revocation O(1)']
  }
];

const SYSTEM_MODULES = [
  {
    step: '01',
    role: 'ISSUER • NHÀ TRƯỜNG',
    title: 'Cổng Quản trị (Admin Portal)',
    badge: 'Port 5174 • Admin',
    icon: <Building2 className="w-6 h-6 text-white" />,
    accent: 'from-[#6D28D9] to-[#4F46E5]',
    points: [
      'Cấp phát, giám sát định danh W3C DID và phân quyền tài khoản toàn trường.',
      'Đóng lô chứng chỉ số (VC) bằng cây Merkle Tree và neo lên Blockchain.',
      'Thu hồi khóa thiết bị bị mất độ phức tạp O(1) và theo dõi nhật ký SOC.'
    ]
  },
  {
    step: '02',
    role: 'HOLDER • SINH VIÊN',
    title: 'Ví Định danh Di động (DID Wallet)',
    badge: 'Port 5173 • Mobile',
    icon: <Smartphone className="w-6 h-6 text-white" />,
    accent: 'from-[#0284C7] to-[#2563EB]',
    points: [
      'Thẻ sinh viên số 3D hiển thị logo UTH, mã QR định danh & trạng thái xác thực.',
      'Quét QR điểm danh 1 chạm với WebAuthn Passkey và ký chữ ký số EIP-191.',
      'Hỗ trợ hàng đợi Offline Queue khi mất mạng và tiết lộ chọn lọc ZKP-Lite.'
    ]
  },
  {
    step: '03',
    role: 'VERIFIER • GIẢNG VIÊN',
    title: 'Cổng Điều hành Giảng viên',
    badge: 'Port 5174 • Faculty',
    icon: <MonitorCheck className="w-6 h-6 text-white" />,
    accent: 'from-[#7C3AED] to-[#9333EA]',
    points: [
      'Tạo phiên QR Nonce xoay liên tục chống chụp màn hình & chiếu toàn màn hình.',
      'Giám sát bản đồ GPS Radar lớp học & phát lệnh hậu kiểm Spot-Check 60s.',
      'Cảnh báo xâm nhập SOC IDS 4 lớp và xuất báo cáo điểm danh chuẩn Excel (.xlsx).'
    ]
  }
];

const RESULT_METRICS = [
  { value: '96,4%', label: 'Tiết kiệm chi phí Gas', sub: 'So với ghi từng chứng chỉ rời rạc On-Chain' },
  { value: '< 2 ms', label: 'Xác minh Merkle Proof', sub: 'Độ phức tạp tính toán O(log₂ N) tức thì' },
  { value: '100%', label: 'Chặn tấn công SOC IDS', sub: 'Tự động từ chối HTTP 403 cả 4 kịch bản' },
  { value: '12.548+', label: 'Định danh DID hoạt động', sub: 'Đồng bộ 26.937 chứng chỉ số (VC)' }
];

const DEFENSE_SCENARIOS = [
  {
    code: 'REPLAY_ATTACK',
    title: 'Chống quét lại ảnh QR cũ',
    desc: 'Vô hiệu hóa ảnh chụp màn hình QR gửi qua Zalo nhờ Nonce hết hạn sau vài giây.'
  },
  {
    code: 'DEVICE_SPOOFING',
    title: 'Chống giả mạo chữ ký số',
    desc: 'Đối chiếu chữ ký mật mã EIP-191 khớp khóa công khai DID đã đăng ký của sinh viên.'
  },
  {
    code: 'PROXY_ATTENDANCE',
    title: 'Chống 1 máy điểm danh 2 SV',
    desc: 'Khóa vân tay phần cứng thiết bị (Device Fingerprint) trên mỗi phiên học.'
  },
  {
    code: 'GEOFENCE_BREACH',
    title: 'Chống Fake GPS ngoài phòng học',
    desc: 'Tính khoảng cách Haversine so với tâm lớp học và cảnh báo tọa độ giả lập.'
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
      <style>{`
        @keyframes shieldLightFloat {
          0%, 100% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -8px, 0); }
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
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1E1B4B]">
                  UTH-TrustID
                </span>
              </div>
            </button>
          </div>

          {/* Giữa: 6 Mục điều hướng chuẩn ảnh mẫu */}
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

          {/* Phải: Nút Xem mã nguồn màu tím chuẩn ảnh mẫu */}
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

      {/* ==================== 2. HERO BANNER TRẮNG – TÍM LAVENDER + ẢNH TÒA NHÀ UTH THẬT & KHIÊN 3D ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7F4FF] to-[#EFE9FF]">
        {/* Dải sóng tím lavender mềm mại ở góc trên trái & chân Hero */}
        <svg
          className="pointer-events-none absolute top-0 left-0 w-72 h-52 opacity-60"
          viewBox="0 0 300 220"
          fill="none"
        >
          <path
            d="M-30 10 C 60 80, 140 130, 260 155 L -30 220 Z"
            fill="url(#leftSoftWave)"
          />
          <defs>
            <linearGradient id="leftSoftWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ảnh thật Tòa nhà ĐH Giao thông Vận tải TP.HCM (UTH) hòa quyện mượt mà bên phải màn hình lớn */}
        <div className="pointer-events-none hidden lg:block absolute right-0 top-0 bottom-0 w-[62%] overflow-hidden">
          <img
            src="/uth-campus-banner.jpg"
            alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
            className="w-full h-full object-cover object-center"
          />
          {/* Lớp chuyển sắc hòa nền mượt từ trái sang ảnh tòa nhà (không cắt cứng) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #FFFFFF 0%, rgba(248,245,255,0.96) 10%, rgba(247,244,255,0.62) 24%, rgba(247,244,255,0) 44%)'
            }}
          />
          {/* Lớp chuyển sắc mềm ở mép dưới vào nền lavender */}
          <div
            className="absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                'linear-gradient(0deg, #F7F5FE 0%, rgba(247,245,254,0.75) 45%, transparent 100%)'
            }}
          />
        </div>

        {/* Nội dung chính Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 pb-12 lg:pt-14 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          {/* Cột trái (6 cột): Huy hiệu NCKH, UTH-TrustID, Mô tả, 2 nút CTA & 3 giá trị */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#4C1D95] text-sm font-semibold shadow-2xs">
              <FlaskConical className="w-4 h-4 text-[#6D28D9]" />
              <span>Đề tài NCKH sinh viên</span>
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-[68px] font-black tracking-tight leading-none m-0 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] bg-clip-text text-transparent">
              UTH-TrustID
            </h1>

            <p className="text-base sm:text-[17px] text-slate-700 leading-[1.68] font-medium m-0 max-w-[520px]">
              Nghiên cứu, thiết kế và phát triển hệ thống định danh số phi tập trung và xác thực hiện diện phòng học, ứng dụng W3C DID, WebAuthn và Merkle Tree tại Trường Đại học Giao thông Vận tải TP.HCM (UTH).
            </p>

            {/* Cụm 2 nút CTA: Khám phá hệ thống & Xem video giới thiệu */}
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
                <span>Xem video giới thiệu</span>
              </button>
            </div>

            {/* Hàng 3 nhãn niềm tin: An toàn | Minh bạch | Phi tập trung */}
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

          {/* Cột phải (6 cột): Khiên 3D Tím Pha Lê đặt trên Bệ Đế Tròn trước tòa nhà UTH */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-end lg:min-h-[340px] lg:pl-2">
            {/* Trên điện thoại / tablet hiển thị ảnh tòa nhà UTH bo góc gọn đẹp */}
            <div className="lg:hidden w-full rounded-2xl overflow-hidden border border-purple-200 shadow-lg mb-4">
              <img
                src="/uth-campus-banner.jpg"
                alt="Trường Đại học Giao thông Vận tải TP.HCM (UTH)"
                className="w-full h-48 sm:h-60 object-cover"
              />
            </div>

            {/* Khiên Bảo mật 3D Tím Lavender + Đế tròn nổi bật (thuần GPU transform, 0 lag) */}
            <div
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              title="Bấm để mở Cổng Đăng nhập UTH-TrustID"
              className="relative flex flex-col items-center cursor-pointer select-none mt-auto"
              style={{ contain: 'layout paint' }}
            >
              <div
                className="relative z-10 will-change-transform"
                style={{ animation: 'shieldLightFloat 4.8s ease-in-out infinite' }}
              >
                <svg className="w-36 h-40 sm:w-44 sm:h-48 overflow-visible" viewBox="0 0 180 205" fill="none">
                  <defs>
                    <linearGradient id="lightShieldBody" x1="15%" y1="5%" x2="88%" y2="95%">
                      <stop offset="0%" stopColor="#C4B5FD" />
                      <stop offset="45%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#5B21B6" />
                    </linearGradient>
                    <linearGradient id="lightShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="55%" stopColor="#DDD6FE" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <linearGradient id="lightShieldGloss" x1="0%" y1="0%" x2="80%" y2="85%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Độ dày 3D cạnh khiên */}
                  <path
                    d="M90 12 L158 38 V98 C158 144 128 176 90 192 C52 176 22 144 22 98 V38 L90 12 Z"
                    fill="#4C1D95"
                    opacity="0.28"
                    transform="translate(7, 7)"
                  />
                  {/* Thân khiên pha lê tím */}
                  <path
                    d="M90 12 L158 38 V98 C158 144 128 176 90 192 C52 176 22 144 22 98 V38 L90 12 Z"
                    fill="url(#lightShieldBody)"
                    stroke="url(#lightShieldRim)"
                    strokeWidth="6"
                  />
                  {/* Phản chiếu ánh sáng nửa trên khiên */}
                  <path
                    d="M90 22 L148 44 V94 C148 112 141 128 130 142 C108 112 72 95 34 94 V44 L90 22 Z"
                    fill="url(#lightShieldGloss)"
                  />
                  {/* Dấu tích xác thực màu trắng đậm */}
                  <path
                    d="M62 103 L82 123 L122 79"
                    stroke="#FFFFFF"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Đế tròn 3D màu trắng – lavender */}
              <div className="relative -mt-6 flex flex-col items-center">
                <div className="w-44 sm:w-52 h-11 rounded-full bg-gradient-to-b from-white via-[#EDE9FE] to-[#C4B5FD] border-2 border-white shadow-[0_14px_30px_rgba(91,33,182,0.28)] flex items-center justify-center">
                  <div className="w-32 sm:w-38 h-5 rounded-full border border-purple-300/80 bg-gradient-to-b from-[#F5F3FF] to-[#DDD6FE]" />
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

      {/* ==================== 4. TỔNG QUAN HỆ THỐNG (LUỒNG 4 BƯỚC NGANG CHUẨN ẢNH MẪU) ==================== */}
      <section className="w-full bg-[#F7F5FE] pb-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6">
            {/* Tiêu đề bên trái kèm gạch tím */}
            <div className="shrink-0 xl:w-52">
              <h2 className="text-2xl font-extrabold text-[#1E1B4B] m-0">Tổng quan hệ thống</h2>
              <div className="w-12 h-1 rounded-full bg-[#6D28D9] mt-2.5" />
            </div>

            {/* 4 Bước kết nối bằng mũi tên tím */}
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

      {/* ==================== 5. GIỚI THIỆU ĐỀ TÀI (#landing-section-INTRO) ==================== */}
      <section
        id="landing-section-INTRO"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Giới thiệu Đề tài
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Giải quyết triệt để bài toán định danh &amp; chống điểm danh hộ
            </h2>
            <p className="text-base text-slate-600 m-0 leading-relaxed">
              Chuyển đổi từ phương thức điểm danh thủ công và mã QR tĩnh sang mô hình xác thực phi tập trung chuẩn W3C DID ngay trong môi trường giảng đường UTH.
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
              Ba trụ cột mật mã học bảo toàn danh tính
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

      {/* ==================== 7. KIẾN TRÚC HỆ THỐNG 3 PHÂN HỆ (#landing-section-SYSTEM) ==================== */}
      <section
        id="landing-section-SYSTEM"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Kiến trúc Hệ thống
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] m-0">
              Mô hình Tam giác Tin cậy: Issuer – Holder – Verifier
            </h2>
            <p className="text-base text-slate-600 m-0 leading-relaxed">
              Ba phân hệ vận hành tách biệt theo kiến trúc Zero-Trust và liên thông dữ liệu thời gian thực qua WebSocket &amp; Smart Contract.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SYSTEM_MODULES.map((mod) => (
              <div
                key={mod.step}
                className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 flex flex-col justify-between gap-5"
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
                    <h3 className="text-xl font-bold text-[#1E1B4B] mt-1 mb-0">{mod.title}</h3>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {mod.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-1" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
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

          {/* 4 KPI nổi bật */}
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

          {/* 4 Kịch bản tấn công bị chặn */}
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

      {/* ==================== 9. ĐỘI NGŨ THỰC HIỆN & CTA CUỐI TRANG (#landing-section-TEAM) ==================== */}
      <section
        id="landing-section-TEAM"
        className="scroll-mt-20 py-16 lg:py-20 bg-white border-t border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3EEFF] border border-[#E2D6FE] text-[#6D28D9] text-xs font-bold tracking-wider uppercase">
              Đội ngũ Thực hiện
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
                Trường Đại học Giao thông Vận tải TP.HCM (UTH) — Chuyên ngành An toàn Thông tin &amp; Khoa học Dữ liệu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                Giảng viên hướng dẫn
              </div>
              <div className="text-lg font-bold text-[#1E1B4B]">TS. Nguyễn Thị Mai</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                Cố vấn chuyên môn kiến trúc bảo mật, mật mã học ứng dụng &amp; đánh giá quy trình xác thực học thuật.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Nhóm sinh viên thực hiện
              </div>
              <div className="text-lg font-bold text-[#1E1B4B]">Nguyễn Đức Hiển &amp; Cộng sự</div>
              <p className="text-sm text-slate-600 m-0 leading-relaxed">
                MSSV: 2251120000 • Thiết kế và xây dựng trọn bộ hệ sinh thái Ví DID Sinh viên, Cổng Giảng viên &amp; Quản trị viên.
              </p>
            </div>
          </div>

          {/* CTA Banner màu tím đồng bộ */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white shadow-xl shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-2xl font-extrabold m-0">
                Sẵn sàng trải nghiệm hệ thống UTH-TrustID?
              </h3>
              <p className="text-sm sm:text-base text-purple-100 m-0">
                Đăng nhập Cổng Giảng viên / Quản trị viên để mở phiên điểm danh QR động và kiểm thử phòng vệ SOC IDS.
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
                <span>Khám phá hệ thống</span>
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
            <span>© 2026 UTH-TrustID • Đại học Giao thông Vận tải TP.HCM</span>
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

      {/* ==================== MODAL XEM VIDEO / GIỚI THIỆU TRỰC QUAN HỆ THỐNG ==================== */}
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
                  GIỚI THIỆU QUY TRÌNH VẬN HÀNH UTH-TRUSTID
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] mt-2 mb-0">
                  Luồng xác thực điểm danh 4 bước Zero-Trust
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
                  Hệ sinh thái Định danh Số Phi tập trung — Đại học Giao thông Vận tải TP.HCM (UTH)
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
