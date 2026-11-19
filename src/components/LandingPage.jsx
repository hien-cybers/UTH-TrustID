import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Cpu,
  MapPin,
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

const BOTTOM_HIGHLIGHTS = [
  {
    id: 'hl-1',
    title: 'An toàn & tin cậy',
    desc: 'Xác thực danh tính bằng khóa công khai (WebAuthn)',
    icon: <ShieldCheck className="w-6 h-6 text-[#A855F7]" />
  },
  {
    id: 'hl-2',
    title: 'Minh bạch dữ liệu',
    desc: 'Bảo toàn và xác minh dữ liệu với Merkle Tree',
    icon: <Layers className="w-6 h-6 text-[#A855F7]" />
  },
  {
    id: 'hl-3',
    title: 'Tự chủ danh tính',
    desc: 'Theo chuẩn W3C DID, người dùng làm chủ dữ liệu',
    icon: <Users className="w-6 h-6 text-[#A855F7]" />
  },
  {
    id: 'hl-4',
    title: 'Ứng dụng thực tiễn',
    desc: 'Xác thực hiện diện phòng học, phù hợp môi trường đại học',
    icon: <Zap className="w-6 h-6 text-[#A855F7]" />
  }
];

const SOLUTION_PILLARS = [
  {
    id: 'sol-1',
    badge: 'W3C DID & VERIFIABLE CREDENTIALS',
    title: 'Định danh số tự chủ không phụ thuộc bên thứ ba',
    desc: 'Mỗi sinh viên sở hữu một định danh phi tập trung (DID) gắn liền với cặp khóa mật mã secp256k1 lưu trữ an toàn ngay trên thiết bị cá nhân.',
    icon: <IdCard className="w-5 h-5 text-[#C084FC]" />,
    metric: 'Chuẩn W3C Quốc tế'
  },
  {
    id: 'sol-2',
    badge: 'WEBAUTHN & FIDO2 PASSKEY',
    title: 'Xác thực sinh trắc học không mật khẩu',
    desc: 'Tích hợp khóa phần cứng FIDO2 / WebAuthn và sinh trắc học thiết bị để ký thông điệp xác thực EIP-191, ngăn chặn hoàn toàn hành vi mượn tài khoản.',
    icon: <Fingerprint className="w-5 h-5 text-[#38BDF8]" />,
    metric: 'Chống điểm danh hộ 100%'
  },
  {
    id: 'sol-3',
    badge: 'MERKLE TREE O(LOG N)',
    title: 'Cấp phát lô thẻ & Kiểm chứng nhánh băm tốc độ cao',
    desc: 'Băm danh sách lớp bằng thuật toán Keccak256 Sorted Pairs và chỉ lưu trữ Merkle Root, cho phép xác minh tư cách sinh viên trong thời gian O(log N).',
    icon: <GitBranch className="w-5 h-5 text-[#A855F7]" />,
    metric: 'Thu hồi khóa độc lập O(1)'
  },
  {
    id: 'sol-4',
    badge: 'DYNAMIC QR & HAVERSINE GPS',
    title: 'Xác thực hiện diện phòng học đa nhân tố',
    desc: 'Kết hợp mã QR Nonce xoay vòng chống chụp màn hình với hàng rào địa lý Haversine và bộ lọc nhiễu Kalman để xác minh sinh viên có mặt thực tế tại lớp.',
    icon: <MapPin className="w-5 h-5 text-emerald-400" />,
    metric: 'Xác thực < 0.5 giây'
  }
];

export default function LandingPage({ onOpenLogin, onQuickDemoLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visibleSections, setVisibleSections] = useState({
    topic: false,
    tech: false,
    results: false
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (id && entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.14 }
    );
    const nodes = document.querySelectorAll('[data-section-id]');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx * 14, y: ny * 14 });
  };

  const scrollToSection = (sectionId, navId) => {
    setActiveNav(navId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isScrolled = scrollY > 30;

  return (
    <div className="min-h-screen w-full bg-[#070618] text-white font-sans select-none overflow-x-hidden relative">
      {/* CSS Keyframes cho Khiên Bảo Vệ Xoay Tròn 360° & Hiệu Ứng Ánh Sáng */}
      <style>{`
        @keyframes orbitSpinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitSpinCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes shieldFloatPulse {
          0%, 100% {
            transform: translateY(0px) rotateY(-6deg) rotateX(3deg);
            filter: drop-shadow(0 0 28px rgba(139, 92, 246, 0.55));
          }
          50% {
            transform: translateY(-10px) rotateY(8deg) rotateX(-3deg);
            filter: drop-shadow(0 0 44px rgba(56, 189, 248, 0.72));
          }
        }
        @keyframes radarSweepSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cardFloatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pedestalWave {
          0%, 100% { opacity: 0.55; transform: scaleX(1); }
          50% { opacity: 0.95; transform: scaleX(1.06); }
        }
        @keyframes btnShine {
          0% { transform: translateX(-130%) skewX(-20deg); }
          100% { transform: translateX(230%) skewX(-20deg); }
        }
      `}</style>

      {/* ==================== THANH ĐIỀU HƯỚNG TRÊN CÙNG (NAVBAR UTH-TRUSTID) ==================== */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#08071C]/90 backdrop-blur-2xl border-b border-purple-500/20 shadow-[0_10px_35px_rgba(4,3,18,0.75)] py-3'
            : 'bg-gradient-to-b from-[#08071C]/85 via-[#08071C]/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo Khiên UTH-TrustID */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveNav('HOME');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 text-white group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_22px_rgba(139,92,246,0.6)] border border-purple-300/35 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                UTH-TrustID
              </span>
            </button>
            <span className="hidden md:inline-block h-5 w-px bg-white/15" />
          </div>

          {/* Menu Điều Hướng Giữa */}
          <nav className="hidden lg:flex items-center gap-7">
            {[
              { id: 'HOME', label: 'Trang chủ', target: 'section-hero' },
              { id: 'TOPIC', label: 'Đề tài', target: 'section-topic' },
              { id: 'SOLUTION', label: 'Giải pháp', target: 'section-topic' },
              { id: 'TECH', label: 'Công nghệ', target: 'section-tech' },
              { id: 'RESULTS', label: 'Kết quả', target: 'section-results' },
              { id: 'TEAM', label: 'Đội ngũ', target: 'section-results' }
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.target, item.id)}
                  className={`relative py-1.5 text-xs sm:text-sm font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1] shadow-[0_0_10px_rgba(168,85,247,0.9)] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cụm Nút Bên Phải: Mã nguồn & Dùng thử hệ thống */}
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13102E]/85 hover:bg-[#1D1842] border border-purple-400/30 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold no-underline transition-all"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Mã nguồn</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group relative overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-bold border border-purple-300/40 shadow-[0_0_25px_rgba(139,92,246,0.55)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span
                className="pointer-events-none absolute inset-y-0 w-10 bg-white/25 blur-xs"
                style={{ animation: 'btnShine 3.2s infinite' }}
              />
              <span>Dùng thử hệ thống</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== SECTION 1: HERO UTH-TRUSTID & KHIÊN BẢO VỆ XOAY TRÒN 360° ==================== */}
      <section
        id="section-hero"
        onMouseMove={handleMouseMove}
        className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden pt-20"
        style={{
          background:
            'radial-gradient(circle at 70% 42%, rgba(124, 58, 237, 0.24) 0%, rgba(56, 189, 248, 0.08) 28%, transparent 62%), radial-gradient(circle at 18% 30%, rgba(99, 102, 241, 0.16) 0%, transparent 50%), linear-gradient(180deg, #070618 0%, #0B0824 55%, #08061B 100%)'
        }}
      >
        {/* Phối cảnh tòa nhà UTH mờ ảo bên góc phải theo đúng thiết kế */}
        <div className="pointer-events-none absolute right-0 top-16 bottom-28 w-[34%] hidden xl:flex flex-col items-end justify-center opacity-25 select-none">
          <div
            className="w-80 h-96 rounded-l-3xl border-l border-t border-b border-purple-400/30 bg-gradient-to-br from-[#1E164B]/60 to-[#09071C]/90 p-6 flex flex-col justify-between shadow-2xl"
            style={{
              transform: 'perspective(900px) rotateY(-18deg) skewY(-4deg)'
            }}
          >
            <div className="px-4 py-1.5 rounded-lg bg-purple-500/20 border border-purple-300/40 w-fit text-2xl font-black tracking-widest text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
              UTH
            </div>
            <div className="grid grid-cols-3 gap-3 opacity-60">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gradient-to-b from-purple-300/30 to-indigo-900/20 border border-purple-300/20"
                />
              ))}
            </div>
            <div className="h-3 w-full rounded bg-purple-400/25" />
          </div>
        </div>

        {/* Nội dung chính Hero: 2 Cột (Trái: Thông điệp đề tài | Phải: Khiên Bảo Vệ Xoay Tròn & 3 Node Công Nghệ) */}
        <div className="relative z-20 max-w-[1280px] w-full mx-auto px-5 sm:px-8 py-6 lg:py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          
          {/* CỘT TRÁI (6 CỘT): THÔNG ĐIỆP ĐỀ TÀI NCKH UTH-TRUSTID */}
          <div className="lg:col-span-6 space-y-5">
            {/* Huy hiệu Đề tài Nghiên cứu khoa học */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C1244]/90 border border-purple-400/35 text-purple-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <GraduationCap className="w-4 h-4 text-[#C084FC]" />
              <span>Đề tài Nghiên cứu khoa học</span>
            </div>

            {/* Tiêu đề lớn UTH-TrustID với vòng cung ánh sáng */}
            <div className="relative inline-block">
              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black italic tracking-tight leading-none m-0">
                <span className="text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
                  UTH-
                </span>
                <span className="bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#6366F1] bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(168,85,247,0.55)]">
                  TrustID
                </span>
              </h1>
              {/* Vòng cung quỹ đạo ánh sáng bao quanh chữ TrustID */}
              <svg
                className="pointer-events-none absolute -right-7 -top-3 w-48 sm:w-64 h-20 sm:h-24 overflow-visible"
                viewBox="0 0 260 90"
                fill="none"
              >
                <path
                  d="M10 68 C 95 88, 235 62, 248 22 C 254 5, 220 -4, 175 8"
                  stroke="url(#titleArcGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="246" cy="24" r="3.5" fill="#E9D5FF" />
                <circle cx="155" cy="74" r="2.2" fill="#38BDF8" />
                <defs>
                  <linearGradient id="titleArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(168,85,247,0)" />
                    <stop offset="60%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Tiêu đề phụ 2 dòng */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-[1.24] tracking-tight m-0">
              Định danh số phi tập trung và
              <br />
              xác thực hiện diện phòng học
            </h2>

            {/* Đoạn mô tả chuẩn học thuật */}
            <p className="text-sm sm:text-[15px] text-slate-300/95 leading-relaxed m-0 max-w-[540px]">
              Nghiên cứu, thiết kế và phát triển hệ thống định danh số theo chuẩn W3C DID, kết hợp WebAuthn và Merkle Tree, hướng tới môi trường học tập an toàn, minh bạch và không phụ thuộc vào bên trung gian.
            </p>

            {/* Cụm 2 nút CTA: Khám phá giải pháp & Xem mã nguồn */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group relative overflow-hidden px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-sm font-bold border border-purple-300/45 shadow-[0_10px_32px_rgba(139,92,246,0.55)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 w-12 bg-white/25 blur-xs"
                  style={{ animation: 'btnShine 3.4s infinite' }}
                />
                <span className="w-6 h-6 rounded-full bg-white text-[#6D28D9] flex items-center justify-center shadow-xs">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Khám phá giải pháp</span>
              </button>

              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#110E2A]/85 hover:bg-[#1B1640] text-slate-100 text-sm font-semibold border border-purple-400/35 hover:border-purple-300/65 no-underline transition-all hover:scale-[1.02] inline-flex items-center gap-2.5 shadow-lg"
              >
                <GitHubIcon className="w-4 h-4 text-white" />
                <span>Xem mã nguồn</span>
              </a>
            </div>
          </div>

          {/* CỘT PHẢI (6 CỘT): KHIÊN BẢO VỆ TRUNG TÂM VỚI CHUYỂN ĐỘNG XOAY TRÒN 360° & 3 THẺ CÔNG NGHỆ */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[440px] sm:min-h-[490px]">
            
            {/* Quầng sáng trung tâm sau Khiên */}
            <div
              className="pointer-events-none absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-55"
              style={{
                background:
                  'radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(56,189,248,0.28) 45%, transparent 72%)',
                transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`
              }}
            />

            {/* VÒNG QUỸ ĐẠO XOAY TRÒN 1 (NGOÀI CÙNG - XOAY THUẬN CHIỀU KIM ĐỒNG HỒ 360°) */}
            <div
              className="pointer-events-none absolute w-[330px] h-[330px] sm:w-[400px] sm:h-[400px] rounded-full"
              style={{ animation: 'orbitSpinClockwise 20s linear infinite' }}
            >
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                <circle
                  cx="200"
                  cy="200"
                  r="186"
                  stroke="url(#outerOrbitGrad)"
                  strokeWidth="1.8"
                  strokeDasharray="14 10 4 10"
                />
                {/* Các hạt năng lượng phát sáng xoay tròn trên quỹ đạo */}
                <circle
                  cx="200"
                  cy="14"
                  r="5"
                  fill="#E9D5FF"
                  style={{ filter: 'drop-shadow(0 0 10px #A855F7)' }}
                />
                <circle
                  cx="386"
                  cy="200"
                  r="4.5"
                  fill="#38BDF8"
                  style={{ filter: 'drop-shadow(0 0 10px #38BDF8)' }}
                />
                <circle
                  cx="200"
                  cy="386"
                  r="4"
                  fill="#C084FC"
                  style={{ filter: 'drop-shadow(0 0 8px #C084FC)' }}
                />
                <circle
                  cx="14"
                  cy="200"
                  r="4.5"
                  fill="#38BDF8"
                  style={{ filter: 'drop-shadow(0 0 10px #38BDF8)' }}
                />
                <defs>
                  <linearGradient id="outerOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* VÒNG QUỸ ĐẠO XOAY TRÒN 2 (BÊN TRONG - XOAY NGƯỢC CHIỀU KIM ĐỒNG HỒ 360°) */}
            <div
              className="pointer-events-none absolute w-[250px] h-[250px] sm:w-[304px] sm:h-[304px] rounded-full"
              style={{ animation: 'orbitSpinCounter 13s linear infinite' }}
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
                <circle cx="152" cy="12" r="4" fill="#38BDF8" />
                <circle cx="152" cy="292" r="4" fill="#E9D5FF" />
                <defs>
                  <linearGradient id="innerOrbitGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* QUÉT RADAR XOAY TRÒN QUANH TÂM KHIÊN (360° CONIC RADAR SWEEP) */}
            <div
              className="pointer-events-none absolute w-[220px] h-[220px] sm:w-[268px] sm:h-[268px] rounded-full opacity-35"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(168, 85, 247, 0.45) 60deg, rgba(56, 189, 248, 0.65) 90deg, transparent 95deg)',
                animation: 'radarSweepSpin 6s linear infinite'
              }}
            />

            {/* ==================== KHIÊN BẢO VỆ 3D CHÍNH GIỮA & BỆ ĐẾ HOLOGRAM ==================== */}
            <div className="relative z-20 flex flex-col items-center pt-6">
              {/* Khiên 3D phát sáng có hiệu ứng nghiêng & xoay nhẹ */}
              <div
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                title="Bấm để truy cập Cổng xác thực UTH-TrustID"
                className="relative cursor-pointer group"
                style={{ animation: 'shieldFloatPulse 4.5s ease-in-out infinite' }}
              >
                {/* Vòng năng lượng xoay tròn sát viền Khiên */}
                <div
                  className="pointer-events-none absolute -inset-4 rounded-full border border-dashed border-sky-400/45"
                  style={{ animation: 'orbitSpinClockwise 10s linear infinite' }}
                />

                <svg
                  className="w-40 h-48 sm:w-48 sm:h-56 overflow-visible"
                  viewBox="0 0 200 230"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="shieldOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E9D5FF" />
                      <stop offset="35%" stopColor="#A855F7" />
                      <stop offset="75%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                    <linearGradient id="shieldInnerGrad" x1="15%" y1="10%" x2="85%" y2="95%">
                      <stop offset="0%" stopColor="#2A1B6E" stopOpacity="0.95" />
                      <stop offset="55%" stopColor="#150D3A" stopOpacity="0.96" />
                      <stop offset="100%" stopColor="#091534" stopOpacity="0.98" />
                    </linearGradient>
                    <linearGradient id="neonRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                  </defs>

                  {/* Lớp bóng đổ 3D phía sau Khiên */}
                  <path
                    d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                    fill="url(#shieldOuterGrad)"
                    opacity="0.35"
                    transform="translate(6, 6)"
                  />

                  {/* Khung Khiên 3D chính */}
                  <path
                    d="M100 14 L176 46 V112 C176 165 142 202 100 220 C58 202 24 165 24 112 V46 L100 14 Z"
                    fill="url(#shieldInnerGrad)"
                    stroke="url(#shieldOuterGrad)"
                    strokeWidth="4.5"
                  />

                  {/* Đường viền Neon bên trong Khiên */}
                  <path
                    d="M100 27 L163 54 V110 C163 155 135 186 100 202 C65 186 37 155 37 110 V54 L100 27 Z"
                    fill="none"
                    stroke="url(#neonRimGrad)"
                    strokeWidth="2.2"
                    opacity="0.9"
                  />

                  {/* Biểu tượng Sinh viên / Người dùng định danh ở chính giữa Khiên */}
                  <circle
                    cx="100"
                    cy="94"
                    r="20"
                    fill="url(#shieldOuterGrad)"
                    opacity="0.92"
                  />
                  <path
                    d="M64 154 C64 133 79 122 100 122 C121 122 136 133 136 154"
                    fill="url(#shieldOuterGrad)"
                    opacity="0.88"
                  />

                  {/* Huy hiệu Khiên nhỏ có dấu tích xác thực ở góc dưới bên phải */}
                  <g transform="translate(122, 134)">
                    <path
                      d="M28 4 L52 14 V35 C52 51 41 63 28 69 C15 63 4 51 4 35 V14 L28 4 Z"
                      fill="#6D28D9"
                      stroke="#E9D5FF"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 36 L25 43 L39 27"
                      stroke="#FFFFFF"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </div>

              {/* Bệ Đế Hologram Phát Sáng Có Vòng Xoay 3D Dưới Chân Khiên */}
              <div className="relative -mt-4 flex flex-col items-center">
                {/* Cột sáng chiếu từ bệ lên khiên */}
                <div
                  className="pointer-events-none w-36 h-10 -mb-6 blur-md"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.45) 60%, rgba(168, 85, 247, 0.7) 100%)'
                  }}
                />
                {/* Đĩa xoay 3D trên mặt bệ */}
                <div className="relative w-52 sm:w-64 h-12 rounded-full bg-gradient-to-b from-[#231754] to-[#0C0826] border-2 border-purple-400/60 shadow-[0_0_40px_rgba(139,92,246,0.65)] flex items-center justify-center overflow-hidden">
                  <div
                    className="w-44 sm:w-56 h-7 rounded-full border border-dashed border-sky-300/80"
                    style={{ animation: 'orbitSpinClockwise 8s linear infinite' }}
                  />
                  <div className="absolute inset-x-8 top-1.5 h-2 rounded-full bg-sky-400/50 blur-xs" />
                </div>
                <div
                  className="w-64 sm:w-80 h-3 rounded-full bg-purple-500/35 blur-md -mt-1"
                  style={{ animation: 'pedestalWave 3s ease-in-out infinite' }}
                />
              </div>
            </div>

            {/* ==================== 3 THẺ NODE CÔNG NGHỆ XUNG QUANH QUỸ ĐẠO KHIÊN ==================== */}
            {/* Node 1 (Đỉnh Khiên): W3C DID */}
            <div
              onClick={() => scrollToSection('section-tech', 'TECH')}
              style={{ animation: 'cardFloatGentle 4.2s ease-in-out infinite' }}
              className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl bg-[#16113A]/85 hover:bg-[#1F1852]/95 backdrop-blur-xl border border-purple-400/45 shadow-[0_12px_32px_rgba(10,6,34,0.75)] flex items-center gap-3 cursor-pointer transition-all hover:scale-105"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] border border-purple-300/45 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0">
                <IdCard className="w-5 h-5 text-white" />
              </div>
              <div className="pr-1">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  W3C DID
                </div>
                <div className="text-[11px] text-slate-300 whitespace-nowrap">
                  Định danh phi tập trung
                </div>
              </div>
            </div>

            {/* Node 2 (Bên Trái Khiên): WebAuthn */}
            <div
              onClick={() => scrollToSection('section-tech', 'TECH')}
              style={{
                animation: 'cardFloatGentle 4.8s ease-in-out infinite',
                animationDelay: '0.8s'
              }}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 px-4 py-2.5 rounded-2xl bg-[#16113A]/85 hover:bg-[#1F1852]/95 backdrop-blur-xl border border-purple-400/45 shadow-[0_12px_32px_rgba(10,6,34,0.75)] flex items-center gap-3 cursor-pointer transition-all hover:scale-105"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#38BDF8] border border-sky-300/50 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.5)] shrink-0">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  WebAuthn
                </div>
                <div className="text-[11px] text-slate-300 leading-tight">
                  Xác thực an toàn,
                  <br />
                  không mật khẩu
                </div>
              </div>
            </div>

            {/* Node 3 (Bên Phải Khiên): Merkle Tree */}
            <div
              onClick={() => scrollToSection('section-tech', 'TECH')}
              style={{
                animation: 'cardFloatGentle 4.5s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
              className="absolute right-0 sm:right-2 top-[54%] -translate-y-1/2 z-30 px-4 py-2.5 rounded-2xl bg-[#16113A]/85 hover:bg-[#1F1852]/95 backdrop-blur-xl border border-purple-400/45 shadow-[0_12px_32px_rgba(10,6,34,0.75)] flex items-center gap-3 cursor-pointer transition-all hover:scale-105"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] border border-purple-300/45 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  Merkle Tree
                </div>
                <div className="text-[11px] text-slate-300 leading-tight">
                  Xác minh dữ liệu
                  <br />
                  nhanh và minh bạch
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== DẢI 4 GIÁ TRỊ CỐT LÕI Ở CHÂN HERO (THEO ĐÚNG MẪU ẢNH) ==================== */}
        <div className="relative z-20 w-full bg-[#090720]/90 backdrop-blur-xl border-t border-purple-500/25 shadow-[0_-10px_40px_rgba(7,6,24,0.8)]">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-purple-500/15">
            {BOTTOM_HIGHLIGHTS.map((item) => (
              <div
                key={item.id}
                onClick={() => scrollToSection('section-topic', 'TOPIC')}
                className="flex items-start gap-3.5 py-3 lg:py-1 lg:px-6 first:lg:pl-0 last:lg:pr-0 cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#161138] border border-purple-400/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(168,85,247,0.2)] group-hover:border-purple-400 group-hover:scale-105 transition-all">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-extrabold text-white m-0 group-hover:text-[#C084FC] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300/90 m-0 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: ĐỀ TÀI & GIẢI PHÁP CÔNG NGHỆ (SCROLL-REVEAL) ==================== */}
      <section
        id="section-topic"
        data-section-id="topic"
        className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14"
      >
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9 transition-all duration-700 ${
            visibleSections.topic ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-300 text-[11px] font-extrabold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Kiến trúc đề tài &amp; giải pháp
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0 tracking-tight">
              Giải pháp xác thực hiện diện đa lớp Zero-Trust
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 m-0 max-w-md leading-relaxed">
            Giải quyết triệt để bài toán điểm danh hộ và rò rỉ dữ liệu cá nhân thông qua mật mã học khóa công khai và cấu trúc cây băm Merkle.
          </p>
        </div>

        <div id="section-tech" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SOLUTION_PILLARS.map((card, idx) => (
            <div
              key={card.id}
              style={{ transitionDelay: `${idx * 100}ms` }}
              className={`group rounded-3xl bg-[#100C2A]/90 hover:bg-[#161138] border border-purple-500/25 hover:border-purple-400/60 p-6 shadow-[0_14px_38px_rgba(4,3,16,0.65)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between gap-4 ${
                visibleSections.topic ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-[#1C1548] border border-purple-400/35 flex items-center justify-center shadow-md">
                    {card.icon}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-[10.5px] font-mono font-bold">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white m-0 group-hover:text-[#C084FC] transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed m-0">
                  {card.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {card.metric}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  className="text-xs font-extrabold text-[#C084FC] hover:text-white bg-transparent border-none cursor-pointer inline-flex items-center gap-1 p-0"
                >
                  <span>Trải nghiệm ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SECTION 3: KẾT QUẢ THỰC NGHIỆM & TRẢI NGHIỆM HỆ THỐNG ==================== */}
      <section
        id="section-results"
        data-section-id="results"
        className="max-w-[1280px] mx-auto px-5 sm:px-8 pb-16"
      >
        <div
          className={`rounded-3xl bg-gradient-to-r from-[#181042] via-[#22155B] to-[#15133C] border border-purple-400/35 p-7 sm:p-10 shadow-[0_24px_60px_rgba(8,5,28,0.8)] flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-700 ${
            visibleSections.results ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-300/35 text-purple-200 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>HỆ THỐNG DEMO THỰC NGHIỆM UTH-TRUSTID</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white m-0">
              Sẵn sàng kiểm thử hệ thống định danh số &amp; điểm danh phòng học?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 m-0 leading-relaxed">
              Truy cập trực tiếp vào Cổng Giảng viên để phát mã QR Nonce động hoặc Cổng Quản trị để cấp phát lô thẻ sinh viên trên cây Merkle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                onQuickDemoLogin
                  ? onQuickDemoLogin('giangvien@uth.edu.vn')
                  : onOpenLogin && onOpenLogin('FACULTY')
              }
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-purple-300/35 text-white text-xs sm:text-sm font-bold cursor-pointer transition-all"
            >
              Demo nhanh: Giảng viên
            </button>
            <button
              type="button"
              onClick={() =>
                onQuickDemoLogin
                  ? onQuickDemoLogin('admin@uth.edu.vn')
                  : onOpenLogin && onOpenLogin('ADMIN')
              }
              className="px-4 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-bold cursor-pointer transition-all"
            >
              Demo nhanh: Quản trị
            </button>
            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border border-purple-300/40 shadow-[0_10px_28px_rgba(139,92,246,0.5)] cursor-pointer transition-all inline-flex items-center gap-2"
            >
              <span>Dùng thử hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== MODAL XEM GIỚI THIỆU ==================== */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120E2E] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-400/40 space-y-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#6366F1] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white m-0">
                    Đề tài NCKH UTH-TrustID
                  </h3>
                  <p className="text-xs text-purple-300 m-0">
                    Định danh số phi tập trung &amp; xác thực hiện diện phòng học
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p className="m-0">
                Hệ thống kết hợp 3 trụ cột công nghệ bảo mật hiện đại:
              </p>
              <ul className="space-y-1.5 pl-5 m-0">
                <li>
                  <strong className="text-white">W3C DID:</strong> Định danh số tự chủ cho sinh viên và giảng viên.
                </li>
                <li>
                  <strong className="text-white">WebAuthn / FIDO2:</strong> Xác thực khóa công khai không mật khẩu gắn với phần cứng thiết bị.
                </li>
                <li>
                  <strong className="text-white">Merkle Tree:</strong> Xác minh chứng chỉ học vụ nhanh O(log N) và minh bạch dữ liệu.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  if (onOpenLogin) onOpenLogin('FACULTY');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs font-extrabold border-none cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Dùng thử hệ thống</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
