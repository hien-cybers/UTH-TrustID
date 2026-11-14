import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Search,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Sparkles,
  Clock,
  Star,
  X
} from 'lucide-react';

const FEATURED_COURSES = [
  {
    id: 'MATH101.N01',
    code: 'MATH101.N01',
    category: 'Đại cương & Toán ứng dụng',
    title: 'Toán Cao Cấp & Giải Tích Mật Mã Học',
    instructor: 'PGS.TS. Nguyễn Minh Khoa',
    students: 128,
    rating: '4.9',
    lessons: '15 buổi',
    image:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-emerald-500/90 text-white'
  },
  {
    id: 'IT402.N01',
    code: 'IT402.N01',
    category: 'An toàn thông tin',
    title: 'An Toàn Mạng & Định Danh Phi Tập Trung W3C DID',
    instructor: 'TS. Trần Thế Vinh',
    students: 96,
    rating: '5.0',
    lessons: '15 buổi',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-[#0D59F2] text-white'
  },
  {
    id: 'ENG204.N02',
    code: 'ENG204.N02',
    category: 'Ngoại ngữ học thuật',
    title: 'Tiếng Anh Chuyên Ngành Công Nghệ & Học Thuật Quốc Tế',
    instructor: 'ThS. Lê Hoàng Bảo Trân',
    students: 145,
    rating: '4.8',
    lessons: '12 buổi',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-rose-500/90 text-white'
  },
  {
    id: 'IT308.N02',
    code: 'IT308.N02',
    category: 'Khoa học dữ liệu & AI',
    title: 'Trí Tuệ Nhân Tạo, Sinh Trắc Học & Phân Tích Dữ Liệu Số',
    instructor: 'TS. Trần Thế Vinh',
    students: 112,
    rating: '4.9',
    lessons: '15 buổi',
    image:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-indigo-600/90 text-white'
  }
];

const FLOATING_PETALS = [
  { id: 1, top: '24%', left: '46%', rotate: '-22deg', size: 16, delay: '0s', duration: '6s' },
  { id: 2, top: '66%', left: '34%', rotate: '18deg', size: 18, delay: '1.2s', duration: '7s' },
  { id: 3, top: '54%', left: '50%', rotate: '35deg', size: 15, delay: '2.1s', duration: '5.8s' },
  { id: 4, top: '58%', left: '80%', rotate: '-30deg', size: 14, delay: '0.7s', duration: '6.4s' }
];

export default function LandingPage({ onOpenLogin, onQuickDemoLogin }) {
  const [activeNav, setActiveNav] = useState('HOME');
  const [searchOpen, setSearchOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [heroImgSrc, setHeroImgSrc] = useState('/campus-hero.png');

  const filteredCourses = FEATURED_COURSES.filter((c) => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q)
    );
  });

  const scrollToCourses = () => {
    setActiveNav('COURSES');
    const el = document.getElementById('featured-courses-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#E8F0FA] text-slate-900 font-sans select-none overflow-x-hidden flex flex-col">
      {/* ==================== PHẦN 1: HERO BANNER TOÀN MÀN HÌNH + THANH NAVBAR NỔI ==================== */}
      <section className="relative w-full min-h-[620px] lg:min-h-[680px] flex flex-col justify-between overflow-hidden">
        {/* Ảnh nền sân trường nắng vàng + hoa phượng đỏ */}
        <img
          src={heroImgSrc}
          onError={() =>
            setHeroImgSrc(
              'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=85'
            )
          }
          alt="EduCampus UTH Banner"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-[1.01] transition-transform duration-700"
        />

        {/* Lớp phủ chuyển sắc giúp chữ trắng bên trái sắc nét và giữ nguyên nắng ấm bên phải */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(10, 22, 38, 0.78) 0%, rgba(12, 27, 46, 0.54) 40%, rgba(12, 27, 46, 0.14) 72%, rgba(12, 27, 46, 0.18) 100%)'
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 15, 28, 0.72) 0%, rgba(6, 15, 28, 0.28) 65%, transparent 100%)'
          }}
        />

        {/* Cánh hoa phượng đỏ bay nhẹ trong nắng */}
        {FLOATING_PETALS.map((petal) => (
          <span
            key={petal.id}
            className="pointer-events-none absolute rounded-tl-full rounded-br-full bg-gradient-to-br from-[#FF5A36] to-[#E11D48] opacity-85 shadow-sm"
            style={{
              top: petal.top,
              left: petal.left,
              width: `${petal.size}px`,
              height: `${Math.round(petal.size * 0.58)}px`,
              transform: `rotate(${petal.rotate})`,
              animation: `fireflyDrift ${petal.duration} ease-in-out ${petal.delay} infinite`
            }}
          />
        ))}

        {/* ==================== THANH ĐIỀU HƯỚNG TRÊN CÙNG (GIỐNG ẢNH MẪU EDUCAMPUS) ==================== */}
        <header className="relative z-20 w-full max-w-[1340px] mx-auto px-5 sm:px-10 pt-5 pb-3 flex items-center justify-between gap-4">
          {/* Logo EduCampus */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm">
              <GraduationCap size={24} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-[22px] font-extrabold text-white tracking-tight drop-shadow-sm">
                EduCampus
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-mono font-bold text-sky-200">
                UTH-TrustID
              </span>
            </div>
          </div>

          {/* Menu chính giữa: Trang chủ | Khóa học | Tài liệu | Cộng đồng */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-white/90">
            <button
              type="button"
              onClick={() => setActiveNav('HOME')}
              className="relative py-1.5 text-white font-bold bg-transparent border-none cursor-pointer"
            >
              Trang chủ
              {activeNav === 'HOME' && (
                <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={scrollToCourses}
              className="relative py-1.5 text-white/90 hover:text-white font-semibold bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
            >
              <span>Khóa học</span>
              <ChevronDown size={15} />
              {activeNav === 'COURSES' && (
                <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav('DOCS');
                setShowIntroModal(true);
              }}
              className="relative py-1.5 text-white/90 hover:text-white font-semibold bg-transparent border-none cursor-pointer"
            >
              Tài liệu
            </button>

            <button
              type="button"
              onClick={scrollToCourses}
              className="relative py-1.5 text-white/90 hover:text-white font-semibold bg-transparent border-none cursor-pointer"
            >
              Cộng đồng
            </button>
          </nav>

          {/* Cụm nút bên phải: Tìm kiếm + Đăng nhập + Đăng ký */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {searchOpen ? (
              <div className="flex items-center bg-slate-900/65 backdrop-blur-md border border-white/45 rounded-xl px-3 py-1.5">
                <Search size={15} className="text-white/75 mr-2" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Tìm khóa học, mã môn..."
                  className="bg-transparent border-none text-xs text-white placeholder-white/60 outline-none w-36 sm:w-44"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setCourseSearch('');
                  }}
                  className="text-white/70 hover:text-white bg-transparent border-none cursor-pointer p-0 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Tìm kiếm khóa học"
                className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer transition-all"
              >
                <Search size={20} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenLogin('FACULTY')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/75 text-white text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-sm"
            >
              Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => onOpenLogin('ADMIN')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#1A6BFF] hover:bg-[#0D59F2] text-white text-xs sm:text-sm font-bold cursor-pointer border border-blue-300/40 shadow-[0_6px_20px_rgba(26,107,255,0.45)] transition-all"
            >
              Đăng ký
            </button>
          </div>
        </header>

        {/* ==================== NỘI DUNG HERO BÊN TRÁI ==================== */}
        <div className="relative z-10 w-full max-w-[1340px] mx-auto px-5 sm:px-10 pt-8 pb-14 lg:pb-20 flex-1 flex items-center">
          <div className="max-w-[590px] space-y-5">
            {/* Huy hiệu kính mờ */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/55 backdrop-blur-md border border-white/45 text-white text-xs sm:text-[13px] font-semibold shadow-md">
              <BookOpen size={15} className="text-sky-300" />
              <span>Nền tảng học tập trực tuyến</span>
            </div>

            {/* Tiêu đề chính 2 dòng */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.13] tracking-tight m-0 drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              Học tập chủ động,
              <br />
              kiến tạo tương lai
            </h1>

            {/* Mô tả phụ */}
            <p className="text-sm sm:text-[16.5px] text-white/95 font-medium leading-relaxed max-w-[490px] m-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              Khóa học đa dạng, tài liệu chất lượng và cộng đồng học sinh, sinh viên năng động.
            </p>

            {/* 2 Nút CTA chính */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenLogin('FACULTY')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0D59F2] to-[#1D70FF] hover:from-[#0B4FD8] hover:to-[#155EE0] text-white font-bold text-sm sm:text-[15px] shadow-[0_12px_28px_rgba(13,89,242,0.5)] cursor-pointer border border-blue-300/35 inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(true)}
                className="px-6 py-3.5 rounded-full bg-slate-900/45 hover:bg-slate-900/65 backdrop-blur-md border border-white/65 text-white font-semibold text-sm sm:text-[15px] cursor-pointer inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5"
              >
                <span className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                  <Play size={10} className="fill-white text-white ml-0.5" />
                </span>
                <span>Xem video giới thiệu</span>
              </button>
            </div>

            {/* Lối tắt Demo 1-chạm dành cho Giảng viên & Quản trị viên */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-white/80 drop-shadow">
                Truy cập nhanh UTH-TrustID:
              </span>
              <button
                type="button"
                onClick={() => onQuickDemoLogin('giangvien@uth.edu.vn')}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/40 text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <QrCode size={12} />
                Vào Cổng Giảng Viên
              </button>
              <button
                type="button"
                onClick={() => onQuickDemoLogin('admin@uth.edu.vn')}
                className="px-3 py-1 rounded-full bg-emerald-500/25 hover:bg-emerald-500/35 backdrop-blur-md border border-emerald-300/50 text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <ShieldCheck size={12} />
                Vào Cổng Quản Trị
              </button>
            </div>
          </div>
        </div>

        {/* ==================== DẢI KÍNH MỜ 3 TIỆN ÍCH CHÍNH (FROSTED GLASS STRIP) ==================== */}
        <div className="relative z-10 w-full backdrop-blur-xl bg-gradient-to-b from-white/75 via-[#EDF3FB]/90 to-[#E8F0FA] border-t border-white/65">
          <div className="max-w-[1260px] mx-auto px-5 sm:px-10 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-slate-300/75">
            <div className="flex items-center gap-4 md:pr-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_24px_rgba(13,89,242,0.12)] border border-blue-100 flex items-center justify-center text-[#0D59F2] shrink-0">
                <GraduationCap size={26} />
              </div>
              <div>
                <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 m-0">
                  Khóa học đa dạng
                </h3>
                <p className="text-xs sm:text-[13.5px] text-slate-600 font-medium m-0 mt-0.5">
                  Từ THPT, đại học đến kỹ năng mềm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:px-8">
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_24px_rgba(13,89,242,0.12)] border border-blue-100 flex items-center justify-center text-[#0D59F2] shrink-0">
                <BookOpen size={25} />
              </div>
              <div>
                <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 m-0">
                  Tài liệu phong phú
                </h3>
                <p className="text-xs sm:text-[13.5px] text-slate-600 font-medium m-0 mt-0.5">
                  Bài giảng, đề thi, ghi chú
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:pl-8">
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_24px_rgba(13,89,242,0.12)] border border-blue-100 flex items-center justify-center text-[#0D59F2] shrink-0">
                <Users size={25} />
              </div>
              <div>
                <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 m-0">
                  Cộng đồng học tập
                </h3>
                <p className="text-xs sm:text-[13.5px] text-slate-600 font-medium m-0 mt-0.5">
                  Trao đổi, hỗ trợ, cùng tiến bộ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PHẦN 2: KHỐI TRẮNG BO TRÒN "KHÓA HỌC NỔI BẬT" ==================== */}
      <section
        id="featured-courses-section"
        className="w-full px-4 sm:px-8 pb-14 pt-2 flex-1"
      >
        <div className="max-w-[1280px] mx-auto bg-white rounded-[32px] shadow-[0_20px_60px_rgba(15,37,71,0.08)] border border-white p-6 sm:p-9 space-y-6">
          {/* Header Khóa học nổi bật */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight m-0">
                Khóa học nổi bật
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenLogin('FACULTY')}
                className="text-sm font-bold text-[#0D59F2] hover:text-[#0B4FD8] bg-transparent border-none cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={15} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCourseSearch('')}
                  aria-label="Khóa học trước"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer transition-all"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLogin('FACULTY')}
                  aria-label="Khóa học tiếp theo"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer transition-all"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Lưới 4 Thẻ Khóa Học Nổi Bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onOpenLogin('FACULTY')}
                className="group rounded-2xl bg-white border border-slate-200/90 hover:border-[#0D59F2]/50 shadow-sm hover:shadow-[0_16px_36px_rgba(13,89,242,0.12)] overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold shadow ${course.badgeColor}`}
                    >
                      {course.code}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-amber-300 text-[11px] font-bold inline-flex items-center gap-1">
                      <Star size={11} className="fill-amber-300 text-amber-300" />
                      {course.rating}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[11px] font-bold text-[#0D59F2] uppercase tracking-wider block">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug m-0 group-hover:text-[#0D59F2] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium m-0">
                      Giảng viên: <strong className="text-slate-700">{course.instructor}</strong>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock size={13} className="text-slate-400" />
                    {course.lessons}
                  </span>
                  <span className="font-bold text-[#0D59F2] inline-flex items-center gap-1">
                    Vào lớp học
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MODAL GIỚI THIỆU HỆ SINH THÁI UTH-TRUSTID & EDUCAMPUS ==================== */}
      {showIntroModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIntroModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#071326] border border-cyan-500/35 p-6 sm:p-7 text-white shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-[11px] font-bold text-cyan-300">
                  <Sparkles size={12} />
                  GIỚI THIỆU NỀN TẢNG EDUCAMPUS • UTH-TRUSTID
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1.5 mb-0">
                  Hệ Sinh Thái Học Tập Số &amp; Điểm Danh Phi Tập Trung W3C DID
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#040814] border border-emerald-500/30 space-y-1.5">
                <div className="font-mono font-bold text-emerald-300">01 • MERKLE BATCH</div>
                <div className="font-bold text-white">Cấp phát chứng chỉ O(log N)</div>
                <p className="text-slate-300 m-0 leading-relaxed">
                  Admin băm danh sách sinh viên thành cây Merkle và neo Root Hash lên Smart Contract.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/30 space-y-1.5">
                <div className="font-mono font-bold text-cyan-300">02 • FIDO2 ENCLAVE</div>
                <div className="font-bold text-white">Ký số không mật khẩu</div>
                <p className="text-slate-300 m-0 leading-relaxed">
                  Sinh viên kích hoạt ví qua Gmail @ut.edu.vn và ký xác thực điểm danh bằng Face ID / Vân tay.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#040814] border border-sky-500/30 space-y-1.5">
                <div className="font-mono font-bold text-sky-300">03 • DYNAMIC QR + GPS</div>
                <div className="font-bold text-white">Chống điểm danh hộ 4 lớp</div>
                <p className="text-slate-300 m-0 leading-relaxed">
                  QR xoay Nonce tự động kết hợp kiểm chứng bán kính GPS Haversine &amp; bộ lọc Kalman.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIntroModal(false);
                  onOpenLogin('FACULTY');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1A6BFF] hover:bg-[#0D59F2] text-white text-xs font-extrabold cursor-pointer border-none"
              >
                Đi Tới Trang Đăng Nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
