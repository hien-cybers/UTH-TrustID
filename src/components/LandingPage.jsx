import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Search,
  ArrowRight,
  Play,
  ChevronDown,
  ShieldCheck,
  QrCode,
  Sparkles,
  Clock,
  Layers,
  Lock,
  MapPin,
  BarChart3,
  CheckCircle2,
  Cpu,
  Globe,
  LogIn,
  X
} from 'lucide-react';

const FLOATING_PETALS = [
  { id: 1, top: '18%', left: '44%', rotate: '-22deg', size: 17, delay: '0s', duration: '6.2s' },
  { id: 2, top: '64%', left: '33%', rotate: '18deg', size: 19, delay: '1.1s', duration: '7.4s' },
  { id: 3, top: '50%', left: '52%', rotate: '35deg', size: 15, delay: '2.0s', duration: '5.8s' },
  { id: 4, top: '56%', left: '82%', rotate: '-28deg', size: 14, delay: '0.6s', duration: '6.6s' },
  { id: 5, top: '28%', left: '72%', rotate: '15deg', size: 16, delay: '1.7s', duration: '6.9s' },
  { id: 6, top: '74%', left: '61%', rotate: '-18deg', size: 15, delay: '2.6s', duration: '6.1s' }
];

const TECH_MARQUEE_ITEMS = [
  'Nền tảng Học tập Trực tuyến EduCampus',
  'Định danh số tự chủ W3C DID',
  'Cây băm Keccak256 Merkle Tree O(log N)',
  'Chữ ký số ECDSA & Khóa phần cứng FIDO2',
  'Điểm danh QR Nonce Động Chống Chụp Lén',
  'Hàng rào Địa lý Haversine & Lọc nhiễu Kalman',
  'Theo dõi Tiến độ Học tập Thời gian thực'
];

const ECOSYSTEM_CARDS = [
  {
    id: 'eco-1',
    badge: 'HỌC TẬP THÔNG MINH',
    title: 'Không gian học tập trực tuyến đa chiều',
    desc: 'Kết nối trực tiếp giữa giảng viên và sinh viên với lịch trình học tập trực quan, thông báo tức thì và đồng bộ dữ liệu đám mây theo thời gian thực.',
    icon: <BookOpen className="w-6 h-6 text-[#1A6BFF]" />,
    accent: 'from-[#1A6BFF]/15 to-[#38BDF8]/5 border-[#1A6BFF]/25',
    stats: '100% Đồng bộ thời gian thực'
  },
  {
    id: 'eco-2',
    badge: 'KHO HỌC LIỆU SỐ',
    title: 'Tài liệu phong phú, chuẩn hóa học thuật',
    desc: 'Hệ thống bài giảng điện tử, đề cương môn học, ngân hàng câu hỏi ôn tập và ghi chú thông minh giúp sinh viên chủ động ôn luyện mọi lúc mọi nơi.',
    icon: <Layers className="w-6 h-6 text-indigo-600" />,
    accent: 'from-indigo-500/15 to-purple-500/5 border-indigo-500/25',
    stats: '2.500+ Học liệu & Bài giảng số'
  },
  {
    id: 'eco-3',
    badge: 'BẢO MẬT ZERO-TRUST',
    title: 'Điểm danh QR Nonce & Định danh W3C DID',
    desc: 'Xác thực chuyên cần minh bạch bằng chữ ký số ECDSA từ ví định danh sinh viên kết hợp mã QR xoay vòng và định vị GPS Haversine tại giảng đường.',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    accent: 'from-emerald-500/15 to-teal-500/5 border-emerald-500/25',
    stats: 'Chống điểm danh hộ tuyệt đối'
  },
  {
    id: 'eco-4',
    badge: 'PHÂN TÍCH TIẾN ĐỘ',
    title: 'Theo dõi lộ trình & Chuyên cần trực quan',
    desc: 'Hệ thống biểu đồ phân tích tỷ lệ chuyên cần, điểm số học phần và cảnh báo học vụ sớm giúp sinh viên và giảng viên nắm bắt tiến độ chính xác.',
    icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
    accent: 'from-amber-500/15 to-orange-500/5 border-amber-500/25',
    stats: 'Báo cáo tự động tức thì'
  }
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Đăng nhập một chạm vào EduCampus',
    desc: 'Sử dụng tài khoản hệ thống, Google/Microsoft SSO hoặc quét mã QR không mật khẩu để truy cập ngay vào không gian học tập cá nhân.',
    icon: <Lock className="w-5 h-5 text-white" />,
    color: 'from-[#1A6BFF] to-[#0D47A1]'
  },
  {
    step: '02',
    title: 'Học tập, tra cứu tài liệu & Điểm danh số',
    desc: 'Truy cập kho bài giảng, trao đổi cùng cộng đồng sinh viên và quét mã QR điểm danh xác thực vị trí thực tế ngay tại lớp học.',
    icon: <QrCode className="w-5 h-5 text-white" />,
    color: 'from-[#0EA5E9] to-[#0284C7]'
  },
  {
    step: '03',
    title: 'Theo dõi tiến độ & Nhận chứng nhận số',
    desc: 'Kiểm tra lịch sử chuyên cần minh bạch trên sổ cái, theo dõi biểu đồ hoàn thành mục tiêu học tập trong suốt học kỳ.',
    icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    color: 'from-[#10B981] to-[#059669]'
  }
];

export default function LandingPage({ onOpenLogin, onQuickDemoLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [heroImgSrc, setHeroImgSrc] = useState('/campus-hero.png');
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visibleSections, setVisibleSections] = useState({
    metrics: false,
    features: false,
    workflow: false,
    community: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      setScrollY(currentY);
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(docHeight > 0 ? Math.min(100, (currentY / docHeight) * 100) : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );

    const nodes = document.querySelectorAll('[data-section-id]');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx * 18, y: ny * 18 });
  };

  const scrollToSection = (sectionId, navKey) => {
    setActiveNav(navKey);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isScrolled = scrollY > 40;

  return (
    <div className="min-h-screen w-full bg-[#F3F7FD] text-slate-900 font-sans select-none overflow-x-hidden relative">
      {/* CSS Keyframes cho hiệu ứng động & cuộn */}
      <style>{`
        @keyframes floatPetal {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          33% { transform: translate3d(14px, -12px, 0) rotate(14deg) scale(1.06); }
          66% { transform: translate3d(-10px, 10px, 0) rotate(-12deg) scale(0.95); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(220%) skewX(-18deg); }
        }
        @keyframes marqueeSlide {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.7; }
          70% { transform: scale(1.22); opacity: 0; }
          100% { transform: scale(1.22); opacity: 0; }
        }
      `}</style>

      {/* Thanh tiến trình cuộn trang (Scroll Progress Bar) */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#1A6BFF] via-[#38BDF8] to-[#4FF0D6] shadow-[0_0_12px_rgba(26,107,255,0.8)] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ==================== THANH ĐIỀU HƯỚNG NỔI (STICKY MORPHING NAVBAR) ==================== */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#071A3E]/88 backdrop-blur-2xl shadow-[0_14px_38px_rgba(4,12,32,0.32)] border-b border-white/15 py-3'
            : 'bg-gradient-to-b from-[#071836]/75 via-[#071836]/35 to-transparent py-5'
        }`}
      >
        <div className="max-w-[1340px] mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
          {/* Logo EduCampus */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('HOME');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 text-white group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-[#1A6BFF] transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white drop-shadow" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              EduCampus
            </span>
          </button>

          {/* Menu Điều Hướng Chính */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {[
              { id: 'HOME', label: 'Trang chủ', target: 'section-hero' },
              { id: 'FEATURES', label: 'Tính năng', target: 'section-features', hasDropdown: true },
              { id: 'DOCS', label: 'Tài liệu', target: 'section-workflow' },
              { id: 'COMMUNITY', label: 'Cộng đồng', target: 'section-community' }
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.target, item.id)}
                  className={`relative py-2 text-sm lg:text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-all inline-flex items-center gap-1 ${
                    isActive ? 'text-white' : 'text-white/85 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && <ChevronDown className="w-4 h-4 opacity-80" />}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cụm Tìm Kiếm & Nút Đăng Nhập Duy Nhất (Đã loại bỏ Đăng ký) */}
          <div className="flex items-center gap-3">
            {searchOpen ? (
              <div className="hidden sm:flex items-center bg-white/20 backdrop-blur-md border border-white/40 rounded-full px-3.5 py-1.5 gap-2 animate-[fadeIn_0.2s_ease-out]">
                <Search className="w-4 h-4 text-white" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      scrollToSection('section-features', 'FEATURES');
                    }
                  }}
                  placeholder="Tìm tính năng, tài liệu..."
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-white/75 w-40"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchKeyword('');
                  }}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer p-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title="Tìm kiếm nhanh"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group relative overflow-hidden px-6 py-2.5 rounded-full bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-sm font-bold border border-white/30 shadow-[0_10px_28px_rgba(26,107,255,0.48)] cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span
                className="pointer-events-none absolute inset-y-0 w-12 bg-white/30 blur-sm"
                style={{ animation: 'shimmerSweep 3.2s infinite' }}
              />
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== SECTION 1: HERO BANNER SÂN TRƯỜNG & HIỆU ỨNG PARALLAX ==================== */}
      <section
        id="section-hero"
        onMouseMove={handleHeroMouseMove}
        className="relative w-full min-h-[760px] lg:min-h-[840px] flex flex-col justify-between overflow-hidden"
      >
        {/* Ảnh nền sân trường mùa hoa phượng đỏ với Parallax khi cuộn & rê chuột */}
        <img
          src={heroImgSrc}
          onError={() =>
            setHeroImgSrc(
              'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85'
            )
          }
          alt="EduCampus Vietnamese Students Hero"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `scale(1.06) translate3d(${-mousePos.x * 0.6}px, ${scrollY * 0.22 - mousePos.y * 0.6}px, 0)`
          }}
        />

        {/* Lớp phủ Gradient bảo đảm độ tương phản chữ bên trái và độ trong trẻo bên phải */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(8, 24, 52, 0.72) 0%, rgba(12, 32, 68, 0.42) 45%, rgba(12, 32, 68, 0.08) 78%, rgba(12, 32, 68, 0.16) 100%)'
          }}
        />

        {/* Quầng sáng động (Dynamic Ambient Light Orbs) */}
        <div
          className="pointer-events-none absolute top-24 left-12 w-80 h-80 rounded-full blur-3xl opacity-35"
          style={{
            background: 'radial-gradient(circle, rgba(26,107,255,0.55), transparent 70%)',
            transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`
          }}
        />

        {/* Hiệu ứng cánh hoa phượng đỏ bay trong nắng */}
        {FLOATING_PETALS.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute z-10"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size * 1.5}px`,
              height: `${p.size * 0.85}px`,
              background: 'linear-gradient(135deg, #FF5A36 0%, #E02424 70%, #9B1C1C 100%)',
              borderRadius: '80% 15% 80% 20%',
              boxShadow: '0 6px 16px rgba(224, 36, 36, 0.35)',
              opacity: 0.88,
              animation: `floatPetal ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay
            }}
          />
        ))}

        {/* Nội dung chính của Hero */}
        <div className="relative z-20 max-w-[1340px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-36 sm:pt-44 pb-16 flex-1 flex flex-col justify-center">
          <div
            className="max-w-[600px] space-y-6 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 0.35}px, ${-scrollY * 0.08 + mousePos.y * 0.35}px, 0)`
            }}
          >
            {/* Pill kính mờ */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#10233F]/55 hover:bg-[#10233F]/75 backdrop-blur-md border border-white/40 text-white text-xs sm:text-sm font-medium shadow-lg transition-all">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#38BDF8]"
                  style={{ animation: 'pulseRing 2s infinite' }}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38BDF8]" />
              </span>
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>Nền tảng học tập trực tuyến</span>
            </div>

            {/* Tiêu đề chính 2 dòng */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-white leading-[1.13] tracking-tight m-0 drop-shadow-[0_4px_24px_rgba(0,0,0,0.38)]">
              Học tập chủ động,
              <br />
              kiến tạo tương lai
            </h1>

            {/* Mô tả phụ */}
            <p className="text-base sm:text-lg text-white/95 leading-relaxed m-0 max-w-[500px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              Khóa học đa dạng, tài liệu chất lượng và cộng đồng học sinh, sinh viên năng động.
            </p>

            {/* Cụm nút CTA */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group relative overflow-hidden px-7 py-3.5 rounded-full bg-[#1A6BFF] hover:bg-[#1558D6] text-white text-sm sm:text-base font-bold border-none shadow-[0_12px_32px_rgba(26,107,255,0.55)] cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 w-14 bg-white/25 blur-sm"
                  style={{ animation: 'shimmerSweep 3.5s infinite' }}
                />
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-6 py-3.5 rounded-full bg-[#182639]/55 hover:bg-[#182639]/75 backdrop-blur-md text-white text-sm sm:text-base font-semibold border border-white/45 cursor-pointer transition-all hover:scale-[1.02] inline-flex items-center gap-2.5 shadow-lg"
              >
                <span className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </span>
                <span>Xem video giới thiệu</span>
              </button>
            </div>
          </div>

          {/* Nút cuộn xuống có hiệu ứng nhịp điệu */}
          <div className="mt-10 hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSection('section-features', 'FEATURES')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-semibold cursor-pointer transition-all"
              style={{ animation: 'floatSlow 2.8s ease-in-out infinite' }}
            >
              <span>Cuộn xuống để khám phá</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================== DẢI 3 TÍNH NĂNG KÍNH MỜ (FROSTED GLASS FEATURE STRIP) ==================== */}
        <div className="relative z-20 w-full bg-gradient-to-b from-white/75 via-white/88 to-[#F3F7FD] backdrop-blur-xl border-t border-white/65 shadow-[0_-10px_40px_rgba(15,23,42,0.08)]">
          <div className="max-w-[1260px] mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300/70">
            {[
              {
                icon: <GraduationCap className="w-6 h-6 text-[#1A6BFF]" />,
                title: 'Khóa học đa dạng',
                desc: 'Từ THPT, đại học đến kỹ năng mềm',
                target: 'section-features',
                nav: 'FEATURES'
              },
              {
                icon: <BookOpen className="w-6 h-6 text-[#1A6BFF]" />,
                title: 'Tài liệu phong phú',
                desc: 'Bài giảng, đề thi, ghi chú',
                target: 'section-workflow',
                nav: 'DOCS'
              },
              {
                icon: <Users className="w-6 h-6 text-[#1A6BFF]" />,
                title: 'Cộng đồng học tập',
                desc: 'Trao đổi, hỗ trợ, cùng tiến bộ',
                target: 'section-community',
                nav: 'COMMUNITY'
              }
            ].map((feat) => (
              <div
                key={feat.title}
                onClick={() => scrollToSection(feat.target, feat.nav)}
                className="flex items-center gap-4 py-3 md:py-1 md:px-8 first:md:pl-2 last:md:pr-2 cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(26,107,255,0.16)] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#1A6BFF] group-hover:text-white transition-all duration-300">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 m-0 group-hover:text-[#1A6BFF] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 m-0 mt-0.5 font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DẢI CHẠY CÔNG NGHỆ ĐỘNG (INFINITE ANIMATED MARQUEE) ==================== */}
      <div className="w-full bg-[#091E46] text-white py-3.5 overflow-hidden border-y border-blue-400/20">
        <div
          className="flex items-center gap-10 whitespace-nowrap w-max"
          style={{ animation: 'marqueeSlide 28s linear infinite' }}
        >
          {[...TECH_MARQUEE_ITEMS, ...TECH_MARQUEE_ITEMS].map((text, idx) => (
            <div key={`${text}-${idx}`} className="inline-flex items-center gap-3 text-xs sm:text-sm font-semibold text-blue-100">
              <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span>{text}</span>
              <span className="text-blue-400/50 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== SECTION 2: SỐ LIỆU ẤN TƯỢNG HIỆU ỨNG CUỘN (SCROLL-REVEAL METRICS) ==================== */}
      <section
        data-section-id="metrics"
        className="max-w-[1260px] mx-auto px-5 sm:px-8 pt-14 pb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              value: '15.000+',
              label: 'Học sinh & Sinh viên',
              sub: 'Tham gia học tập & định danh số',
              icon: <Users className="w-5 h-5 text-[#1A6BFF]" />,
              delay: '0ms'
            },
            {
              value: '99.98%',
              label: 'Độ chính xác xác thực',
              sub: 'Chữ ký số ECDSA & W3C DID',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
              delay: '100ms'
            },
            {
              value: '< 0.5 giây',
              label: 'Tốc độ điểm danh QR',
              sub: 'Kiểm chứng Nonce & GPS tức thì',
              icon: <Clock className="w-5 h-5 text-sky-600" />,
              delay: '200ms'
            },
            {
              value: '24/7',
              label: 'Đồng bộ tiến độ học tập',
              sub: 'Truy cập đa thiết bị Web & Mobile',
              icon: <Globe className="w-5 h-5 text-indigo-600" />,
              delay: '300ms'
            }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ transitionDelay: stat.delay }}
              className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_12px_35px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_45px_rgba(26,107,255,0.14)] hover:-translate-y-1.5 transition-all duration-700 ${
                visibleSections.metrics
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-10 scale-95'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {stat.icon}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  Trực tuyến
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SECTION 3: HỆ SINH THÁI TÍNH NĂNG (SCROLL-REVEAL BENTO GRID) ==================== */}
      <section
        id="section-features"
        data-section-id="features"
        className="max-w-[1260px] mx-auto px-5 sm:px-8 py-14"
      >
        <div
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${
            visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-[#1A6BFF] text-xs font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ sinh thái giáo dục số EduCampus
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3 tracking-tight">
            Trải nghiệm học tập &amp; quản lý lớp học thế hệ mới
          </h2>
          <p className="text-sm sm:text-base text-slate-600 m-0 leading-relaxed">
            Tích hợp đồng bộ giữa không gian học liệu trực tuyến, theo dõi tiến độ học tập và công nghệ điểm danh định danh số chống gian lận.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ECOSYSTEM_CARDS.map((card, index) => (
            <div
              key={card.id}
              style={{ transitionDelay: `${index * 120}ms` }}
              className={`group relative overflow-hidden rounded-[28px] bg-white p-7 sm:p-8 border border-slate-200/80 shadow-[0_14px_40px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_55px_rgba(26,107,255,0.14)] hover:-translate-y-1.5 transition-all duration-700 flex flex-col justify-between gap-5 ${
                visibleSections.features
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-12 -top-12 w-44 h-44 rounded-full bg-gradient-to-br ${card.accent} blur-2xl opacity-70 group-hover:scale-125 transition-transform duration-500`}
              />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {card.icon}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold tracking-wider">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 m-0 group-hover:text-[#1A6BFF] transition-colors">
                  {card.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed m-0">
                  {card.desc}
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {card.stats}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  className="text-xs font-extrabold text-[#1A6BFF] hover:text-blue-800 bg-transparent border-none cursor-pointer inline-flex items-center gap-1 p-0"
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SECTION 4: QUY TRÌNH 3 BƯỚC THÔNG MINH (SCROLL-REVEAL TIMELINE) ==================== */}
      <section
        id="section-workflow"
        data-section-id="workflow"
        className="max-w-[1260px] mx-auto px-5 sm:px-8 py-12"
      >
        <div
          className={`rounded-[32px] bg-gradient-to-br from-[#081F49] via-[#0C2B64] to-[#0F387E] text-white p-8 sm:p-12 shadow-[0_24px_65px_rgba(8,31,73,0.28)] relative overflow-hidden transition-all duration-700 ${
            visibleSections.workflow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.6), transparent 70%)'
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-sky-200 text-xs font-bold">
                <Cpu className="w-3.5 h-3.5" />
                QUY TRÌNH HỌC TẬP &amp; XÁC THỰC KHÉP KÍN
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0">
                Bắt đầu hành trình học tập chỉ với 3 bước đơn giản
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="w-fit px-6 py-3 rounded-full bg-white text-[#0B2960] hover:bg-blue-50 text-sm font-extrabold border-none shadow-lg cursor-pointer transition-all hover:scale-[1.02] inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#1A6BFF]" />
              <span>Truy cập cổng đăng nhập</span>
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item, idx) => (
              <div
                key={item.step}
                style={{ transitionDelay: `${idx * 150}ms` }}
                className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/15 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between gap-4 ${
                  visibleSections.workflow
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-white/10 text-sky-200 border border-white/15">
                      BƯỚC {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white m-0">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed m-0">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-sky-200 font-semibold">
                  <span>Tích hợp UTH-TrustID</span>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 5: CỘNG ĐỒNG & BANNER ĐĂNG NHẬP CUỐI TRANG ==================== */}
      <section
        id="section-community"
        data-section-id="community"
        className="max-w-[1260px] mx-auto px-5 sm:px-8 pt-6 pb-20"
      >
        <div
          className={`bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.07)] flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-700 ${
            visibleSections.community ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1A6BFF] text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>CỔNG TRUY CẬP HỆ THỐNG EDUCAMPUS &amp; UTH-TRUSTID</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 m-0">
              Sẵn sàng kết nối vào hệ thống học tập trực tuyến?
            </h3>
            <p className="text-sm text-slate-600 m-0 leading-relaxed">
              Đăng nhập ngay để quản lý lớp học phần, truy cập kho tài liệu số, theo dõi tiến độ học tập hoặc thực hiện điểm danh xác thực không mật khẩu.
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
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer transition-all"
            >
              Demo Nhanh: Giảng Viên
            </button>
            <button
              type="button"
              onClick={() =>
                onQuickDemoLogin
                  ? onQuickDemoLogin('admin@uth.edu.vn')
                  : onOpenLogin && onOpenLogin('ADMIN')
              }
              className="px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200 cursor-pointer transition-all"
            >
              Demo Nhanh: Quản Trị
            </button>
            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="px-7 py-3.5 rounded-full bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-sm font-extrabold border-none shadow-[0_10px_28px_rgba(26,107,255,0.4)] cursor-pointer transition-all hover:scale-[1.02] inline-flex items-center gap-2"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== MODAL XEM GIỚI THIỆU HỆ THỐNG ==================== */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1A6BFF] text-white flex items-center justify-center shadow-md">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 m-0">
                    Giới thiệu nền tảng EduCampus • UTH-TrustID
                  </h3>
                  <p className="text-xs text-slate-500 m-0">
                    Kiến trúc học tập trực tuyến kết hợp định danh số W3C DID &amp; Merkle Tree
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p className="m-0">
                <strong>EduCampus (UTH-TrustID)</strong> là nền tảng học tập chủ động tích hợp định danh tự chủ và điểm danh đa nhân tố:
              </p>
              <ul className="space-y-2 pl-5 m-0">
                <li>
                  <strong>Cấp phát chứng chỉ lô Merkle O(log N):</strong> Xác thực danh sách lớp nhanh chóng không cần lưu trữ khóa tập trung.
                </li>
                <li>
                  <strong>Chữ ký số ECDSA &amp; Khóa phần cứng FIDO2:</strong> Chống điểm danh hộ tuyệt đối bằng sinh trắc học thiết bị.
                </li>
                <li>
                  <strong>QR Nonce xoay vòng &amp; Định vị Haversine:</strong> Chặn đứng hành vi chụp màn hình mã QR hoặc giả lập vị trí GPS.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  if (onOpenLogin) onOpenLogin('FACULTY');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-xs font-extrabold border-none cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Đi tới Trang Đăng nhập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
