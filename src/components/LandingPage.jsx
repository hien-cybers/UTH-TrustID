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
  BarChart3,
  CheckCircle2,
  Monitor,
  Globe,
  LogIn,
  X
} from 'lucide-react';

const FLOATING_PETALS = [
  { id: 1, top: '20%', left: '45%', size: 14, delay: '0s', duration: '6.2s' },
  { id: 2, top: '62%', left: '34%', size: 15, delay: '1.1s', duration: '7.2s' },
  { id: 3, top: '48%', left: '52%', size: 13, delay: '2.0s', duration: '5.8s' },
  { id: 4, top: '54%', left: '80%', size: 12, delay: '0.7s', duration: '6.5s' },
  { id: 5, top: '28%', left: '72%', size: 13, delay: '1.6s', duration: '6.8s' }
];

const CORE_PILLARS = [
  {
    id: 'pillar-1',
    badge: 'LỚP HỌC THÔNG MINH',
    title: 'Khóa học & Học phần trực tuyến đa dạng',
    desc: 'Hệ thống học phần từ đại cương, chuyên ngành đến kỹ năng mềm được tổ chức khoa học theo từng học kỳ, giúp sinh viên chủ động kế hoạch học tập.',
    icon: <Monitor className="w-5 h-5 text-[#1A6BFF]" />,
    accent: 'from-blue-500/12 to-sky-500/5',
    metric: '120+ Học phần số hóa'
  },
  {
    id: 'pillar-2',
    badge: 'HỌC LIỆU CHUẨN HÓA',
    title: 'Kho tài liệu, bài giảng & đề cương phong phú',
    desc: 'Truy cập tức thì giáo trình điện tử, slide bài giảng, ngân hàng câu hỏi ôn tập và ghi chú học thuật đồng bộ trên mọi thiết bị.',
    icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    accent: 'from-indigo-500/12 to-purple-500/5',
    metric: '2.500+ Tài liệu & Bài giảng'
  },
  {
    id: 'pillar-3',
    badge: 'ĐIỂM DANH SỐ 1-CHẠM',
    title: 'Điểm danh QR động & Xác thực định danh số',
    desc: 'Tích hợp công nghệ điểm danh mã QR xoay vòng kết hợp định vị giảng đường và ví định danh điện tử, đảm bảo minh bạch và chống điểm danh hộ.',
    icon: <QrCode className="w-5 h-5 text-emerald-600" />,
    accent: 'from-emerald-500/12 to-teal-500/5',
    metric: 'Xác thực < 0.5 giây'
  },
  {
    id: 'pillar-4',
    badge: 'THEO DÕI LỘ TRÌNH',
    title: 'Phân tích tiến độ & Chuyên cần trực quan',
    desc: 'Bảng điều khiển trực quan giúp sinh viên và giảng viên theo dõi tỷ lệ chuyên cần, lịch sử tham gia lớp học và tiến độ hoàn thành môn học.',
    icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
    accent: 'from-amber-500/12 to-orange-500/5',
    metric: 'Đồng bộ thời gian thực'
  }
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Đăng nhập một chạm',
    desc: 'Truy cập hệ thống EduCampus bằng tài khoản học vụ, Google/Microsoft SSO hoặc quét mã QR không mật khẩu.',
    icon: <Lock className="w-4 h-4 text-white" />,
    color: 'from-[#1A6BFF] to-[#0D47A1]'
  },
  {
    step: '02',
    title: 'Học tập & Điểm danh tại lớp',
    desc: 'Xem lịch học, tải tài liệu bài giảng, thảo luận cùng lớp học phần và quét QR điểm danh trực tiếp tại giảng đường.',
    icon: <QrCode className="w-4 h-4 text-white" />,
    color: 'from-[#0EA5E9] to-[#0284C7]'
  },
  {
    step: '03',
    title: 'Theo dõi tiến độ & Kết quả',
    desc: 'Kiểm tra lịch sử chuyên cần minh bạch, theo dõi biểu đồ tiến độ học tập và xuất báo cáo tổng kết học kỳ.',
    icon: <CheckCircle2 className="w-4 h-4 text-white" />,
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const nodes = document.querySelectorAll('[data-section-id]');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx * 12, y: ny * 12 });
  };

  const scrollToSection = (sectionId, navKey) => {
    setActiveNav(navKey);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isScrolled = scrollY > 32;

  return (
    <div className="min-h-screen w-full bg-[#F4F7FC] text-slate-900 font-sans select-none overflow-x-hidden relative">
      {/* CSS Keyframes cho hiệu ứng động & cuộn mượt */}
      <style>{`
        @keyframes floatPetal {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          33% { transform: translate3d(10px, -9px, 0) rotate(12deg) scale(1.04); }
          66% { transform: translate3d(-8px, 8px, 0) rotate(-10deg) scale(0.96); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(220%) skewX(-18deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.75; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>

      {/* Thanh tiến trình cuộn trên đỉnh màn hình */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#1A6BFF] via-[#38BDF8] to-[#4FF0D6] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ==================== THANH ĐIỀU HƯỚNG NỔI (STICKY NAVBAR CÂN ĐỐI) ==================== */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#071A3E]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(4,12,32,0.28)] border-b border-white/15 py-2.5'
            : 'bg-gradient-to-b from-[#071836]/75 via-[#071836]/30 to-transparent py-3.5'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo EduCampus */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('HOME');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 text-white group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-md group-hover:bg-[#1A6BFF] transition-all">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
              EduCampus
            </span>
          </button>

          {/* Menu Điều Hướng Chính */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {[
              { id: 'HOME', label: 'Trang chủ', target: 'section-hero' },
              { id: 'FEATURES', label: 'Khóa học', target: 'section-features', hasDropdown: true },
              { id: 'DOCS', label: 'Tài liệu', target: 'section-workflow' },
              { id: 'COMMUNITY', label: 'Cộng đồng', target: 'section-community' }
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.target, item.id)}
                  className={`relative py-1.5 text-xs sm:text-sm font-semibold bg-transparent border-none cursor-pointer transition-all inline-flex items-center gap-1 ${
                    isActive ? 'text-white' : 'text-white/85 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-80" />}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cụm Tìm Kiếm & Nút Đăng Nhập Duy Nhất */}
          <div className="flex items-center gap-2.5">
            {searchOpen ? (
              <div className="hidden sm:flex items-center bg-white/20 backdrop-blur-md border border-white/40 rounded-full px-3 py-1 gap-2">
                <Search className="w-3.5 h-3.5 text-white" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      scrollToSection('section-features', 'FEATURES');
                    }
                  }}
                  placeholder="Tìm kiếm..."
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-white/75 w-32"
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
                title="Tìm kiếm"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-white cursor-pointer transition-all"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="group relative overflow-hidden px-5 py-2 rounded-full bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-xs sm:text-sm font-bold border border-white/30 shadow-[0_8px_20px_rgba(26,107,255,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <span
                className="pointer-events-none absolute inset-y-0 w-10 bg-white/30 blur-xs"
                style={{ animation: 'shimmerSweep 3.2s infinite' }}
              />
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== SECTION 1: HERO BANNER VỪA KHÍT MÀN HÌNH (100VH BALANCED) ==================== */}
      <section
        id="section-hero"
        onMouseMove={handleHeroMouseMove}
        className="relative w-full min-h-[580px] lg:h-screen lg:max-h-[780px] flex flex-col justify-between overflow-hidden"
      >
        {/* Ảnh nền sân trường mùa hoa phượng đỏ */}
        <img
          src={heroImgSrc}
          onError={() =>
            setHeroImgSrc(
              'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85'
            )
          }
          alt="EduCampus Vietnamese Students Hero"
          className="absolute inset-0 w-full h-full object-cover object-[center_22%] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `scale(1.04) translate3d(${-mousePos.x * 0.45}px, ${Math.min(scrollY * 0.15, 60) - mousePos.y * 0.45}px, 0)`
          }}
        />

        {/* Lớp phủ Gradient bên trái giúp chữ trắng sắc nét mà vẫn giữ sáng vùng ảnh sinh viên bên phải */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(8, 24, 54, 0.76) 0%, rgba(12, 32, 68, 0.45) 42%, rgba(12, 32, 68, 0.08) 76%, rgba(12, 32, 68, 0.14) 100%)'
          }}
        />

        {/* Hiệu ứng cánh hoa phượng đỏ bay nhẹ */}
        {FLOATING_PETALS.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute z-10"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size * 1.4}px`,
              height: `${p.size * 0.8}px`,
              background: 'linear-gradient(135deg, #FF5A36 0%, #E02424 70%, #9B1C1C 100%)',
              borderRadius: '80% 15% 80% 20%',
              boxShadow: '0 4px 12px rgba(224, 36, 36, 0.3)',
              opacity: 0.85,
              animation: `floatPetal ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay
            }}
          />
        ))}

        {/* Nội dung chính của Hero (Cân đối tỷ lệ trên màn hình Laptop & Desktop) */}
        <div className="relative z-20 max-w-[1200px] w-full mx-auto px-5 sm:px-8 pt-24 sm:pt-28 pb-6 flex-1 flex flex-col justify-center">
          <div
            className="max-w-[490px] space-y-4 sm:space-y-5 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px, 0)`
            }}
          >
            {/* Pill kính mờ */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10233F]/60 backdrop-blur-md border border-white/40 text-white text-xs font-medium shadow-md">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#38BDF8]"
                  style={{ animation: 'pulseRing 2s infinite' }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
              </span>
              <BookOpen className="w-3.5 h-3.5 text-sky-300" />
              <span>Nền tảng học tập trực tuyến</span>
            </div>

            {/* Tiêu đề chính 2 dòng cân đối */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.16] tracking-tight m-0 drop-shadow-[0_4px_18px_rgba(0,0,0,0.38)]">
              Học tập chủ động,
              <br />
              kiến tạo tương lai
            </h1>

            {/* Mô tả phụ */}
            <p className="text-sm sm:text-[15px] text-white/95 leading-relaxed m-0 max-w-[430px] font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Khóa học đa dạng, tài liệu chất lượng và cộng đồng học sinh, sinh viên năng động.
            </p>

            {/* Cụm nút CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                className="group relative overflow-hidden px-6 py-2.5 sm:py-3 rounded-full bg-[#1A6BFF] hover:bg-[#1558D6] text-white text-xs sm:text-sm font-bold border-none shadow-[0_10px_26px_rgba(26,107,255,0.5)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 w-12 bg-white/25 blur-xs"
                  style={{ animation: 'shimmerSweep 3.5s infinite' }}
                />
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-5 py-2.5 sm:py-3 rounded-full bg-[#182639]/55 hover:bg-[#182639]/75 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/45 cursor-pointer transition-all hover:scale-[1.02] inline-flex items-center gap-2 shadow-md"
              >
                <span className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                </span>
                <span>Xem video giới thiệu</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== DẢI 3 TÍNH NĂNG KÍNH MỜ NẰM GỌN TRONG CHÂN HERO ==================== */}
        <div className="relative z-20 w-full bg-gradient-to-b from-white/78 via-white/92 to-[#F4F7FC] backdrop-blur-xl border-t border-white/70">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300/75">
            {[
              {
                icon: <GraduationCap className="w-5 h-5 text-[#1A6BFF]" />,
                title: 'Khóa học đa dạng',
                desc: 'Từ THPT, đại học đến kỹ năng mềm',
                target: 'section-features',
                nav: 'FEATURES'
              },
              {
                icon: <BookOpen className="w-5 h-5 text-[#1A6BFF]" />,
                title: 'Tài liệu phong phú',
                desc: 'Bài giảng, đề thi, ghi chú',
                target: 'section-workflow',
                nav: 'DOCS'
              },
              {
                icon: <Users className="w-5 h-5 text-[#1A6BFF]" />,
                title: 'Cộng đồng học tập',
                desc: 'Trao đổi, hỗ trợ, cùng tiến bộ',
                target: 'section-community',
                nav: 'COMMUNITY'
              }
            ].map((feat) => (
              <div
                key={feat.title}
                onClick={() => scrollToSection(feat.target, feat.nav)}
                className="flex items-center gap-3.5 py-2.5 md:py-1 md:px-6 first:md:pl-0 last:md:pr-0 cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-full bg-white shadow-[0_4px_14px_rgba(26,107,255,0.15)] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#1A6BFF] group-hover:text-white transition-all duration-300">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 m-0 group-hover:text-[#1A6BFF] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 m-0 mt-0.5 font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: 4 TRỤ CỘT NỀN TẢNG EDUCAMPUS (CUỘN MƯỢT & CÂN ĐỐI) ==================== */}
      <section
        id="section-features"
        data-section-id="features"
        className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 pb-10"
      >
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 transition-all duration-700 ${
            visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-[#1A6BFF] text-[11px] font-extrabold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Giải pháp học tập &amp; quản lý đào tạo số
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-slate-900 m-0 tracking-tight">
              Không gian học tập trực tuyến toàn diện cho sinh viên &amp; giảng viên
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 m-0 max-w-md leading-relaxed">
            Kết nối liền mạch giữa quản lý lớp học phần, chia sẻ học liệu số, điểm danh thông minh và theo dõi lộ trình học tập.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {CORE_PILLARS.map((card, index) => (
            <div
              key={card.id}
              style={{ transitionDelay: `${index * 90}ms` }}
              className={`group relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/85 shadow-[0_8px_28px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_38px_rgba(26,107,255,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between gap-4 ${
                visibleSections.features
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${card.accent} blur-2xl opacity-80 group-hover:scale-125 transition-transform duration-500`}
              />

              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    {card.icon}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold tracking-wider">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 m-0 group-hover:text-[#1A6BFF] transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed m-0">
                  {card.desc}
                </p>
              </div>

              <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {card.metric}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
                  className="text-xs font-extrabold text-[#1A6BFF] hover:text-blue-800 bg-transparent border-none cursor-pointer inline-flex items-center gap-1 p-0"
                >
                  <span>Truy cập ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SECTION 3: QUY TRÌNH 3 BƯỚC & SỐ LIỆU HỆ THỐNG ==================== */}
      <section
        id="section-workflow"
        data-section-id="workflow"
        className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6"
      >
        <div
          className={`rounded-3xl bg-gradient-to-br from-[#081F49] via-[#0C2B64] to-[#0F387E] text-white p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(8,31,73,0.22)] relative overflow-hidden transition-all duration-700 ${
            visibleSections.workflow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-sky-200 text-[11px] font-bold">
                <Layers className="w-3.5 h-3.5" />
                QUY TRÌNH HỌC TẬP &amp; ĐIỂM DANH SỐ
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                Kết nối giảng đường thông minh chỉ với 3 bước
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-sky-100 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <Users className="w-3.5 h-3.5 text-sky-300" />
                15.000+ Sinh viên &amp; Giảng viên
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                Đồng bộ 24/7
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {WORKFLOW_STEPS.map((item, idx) => (
              <div
                key={item.step}
                style={{ transitionDelay: `${idx * 110}ms` }}
                className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 hover:bg-white/15 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between gap-3 ${
                  visibleSections.workflow
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/15">
                      BƯỚC {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white m-0">{item.title}</h3>
                  <p className="text-xs text-blue-100/90 leading-relaxed m-0">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4: CỘNG ĐỒNG & BANNER ĐĂNG NHẬP GỌN GÀNG ==================== */}
      <section
        id="section-community"
        data-section-id="community"
        className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-4 pb-12"
      >
        <div
          className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/85 shadow-[0_12px_36px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-700 ${
            visibleSections.community ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="space-y-1.5 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1A6BFF] text-[11px] font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CỔNG HỌC TẬP &amp; ĐIỂM DANH SỐ EDUCAMPUS</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 m-0">
              Sẵn sàng truy cập vào hệ thống học tập trực tuyến?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 m-0 leading-relaxed">
              Đăng nhập để quản lý lớp học phần, tra cứu tài liệu bài giảng và theo dõi tiến độ chuyên cần theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onQuickDemoLogin
                  ? onQuickDemoLogin('giangvien@uth.edu.vn')
                  : onOpenLogin && onOpenLogin('FACULTY')
              }
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer transition-all"
            >
              Vào nhanh: Giảng viên
            </button>
            <button
              type="button"
              onClick={() =>
                onQuickDemoLogin
                  ? onQuickDemoLogin('admin@uth.edu.vn')
                  : onOpenLogin && onOpenLogin('ADMIN')
              }
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-pointer transition-all"
            >
              Vào nhanh: Quản trị
            </button>
            <button
              type="button"
              onClick={() => onOpenLogin && onOpenLogin('FACULTY')}
              className="px-6 py-2.5 rounded-full bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_22px_rgba(26,107,255,0.38)] cursor-pointer transition-all hover:scale-[1.02] inline-flex items-center gap-1.5"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A6BFF] text-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 m-0">
                    Giới thiệu nền tảng EduCampus
                  </h3>
                  <p className="text-xs text-slate-500 m-0">
                    Hệ thống học tập trực tuyến &amp; quản lý chuyên cần thông minh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="m-0">
                <strong>EduCampus</strong> mang đến môi trường học tập số hóa đồng bộ cho sinh viên và giảng viên:
              </p>
              <ul className="space-y-1.5 pl-5 m-0">
                <li>
                  <strong>Quản lý khóa học &amp; học liệu:</strong> Tổ chức bài giảng, đề cương và tài liệu ôn tập trực quan theo từng môn học.
                </li>
                <li>
                  <strong>Điểm danh QR động &amp; Định danh số:</strong> Xác thực chuyên cần nhanh chóng tại lớp học, chống điểm danh hộ.
                </li>
                <li>
                  <strong>Theo dõi tiến độ thời gian thực:</strong> Thống kê tỷ lệ tham gia lớp học và xuất báo cáo học vụ tự động.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  if (onOpenLogin) onOpenLogin('FACULTY');
                }}
                className="px-4 py-2 rounded-xl bg-[#1A6BFF] hover:bg-[#1557D8] text-white text-xs font-extrabold border-none cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Đi tới Đăng nhập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
