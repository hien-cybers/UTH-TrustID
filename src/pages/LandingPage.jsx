import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Smartphone,
  GraduationCap,
  Lock,
  ArrowRight,
  MapPin,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  QrCode,
  Layers,
  Database
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 text-slate-100 animate-in fade-in duration-300">
      {/* Header Banner */}
      <header className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-slate-900 border border-cyan-500/30 text-cyan-400 rounded-full text-xs sm:text-sm font-medium mb-4 shadow-lg shadow-cyan-950/30">
          <Sparkles size={15} />
          <span>Đề tài NCKH: Định danh số phi tập trung (W3C DID) & Bằng chứng xác thực (VC)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent max-w-4xl mx-auto">
          Hệ Thống Xác Thực Không Mật Khẩu UTH-TrustID
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
          Giải pháp điểm danh lớp học, phòng thi và đăng nhập bảo mật một chạm bằng chữ ký mật mã ECDSA secp256k1 kết hợp định vị không gian Geo-Fencing và cây Merkle.
        </p>

        {/* Haversine Formula Mini-Banner */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300">
          <MapPin size={14} className="text-cyan-400" />
          <span>Công thức Haversine: <strong className="text-cyan-300">d = 2R · arcsin(√...)</strong></span>
          <span className="text-slate-600">|</span>
          <span>Bán kính phòng học: <strong className="text-emerald-400">R ≤ 50m</strong></span>
        </div>
      </header>

      {/* Grid điều hướng các phân hệ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phân hệ 1: Ví Sinh Viên */}
        <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col justify-between transition group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">
              📱 Ví Sinh Viên (Mobile PWA)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Quản lý chìa khoá riêng (Private Key), Thẻ Sinh Viên Số UTH chuẩn W3C VC, bảo vệ bằng WebAuthn sinh trắc học và quét mã xác thực không mật khẩu.
            </p>
          </div>
          <Link
            to="/wallet"
            className="inline-flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg shadow-cyan-900/30"
          >
            <span>Mở Ví Di Động</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Phân hệ 2: Cổng Giảng Viên */}
        <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col justify-between transition group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">
              👨‍🏫 Cổng Giảng Viên (Verifier)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Mở phòng điểm danh/thi cử, lấy toạ độ GPS lớp học, tạo mã QR xoay vòng và tra cứu nhanh hồ sơ sinh viên qua MSSV hoặc Token mã hóa.
            </p>
          </div>
          <Link
            to="/faculty"
            className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg shadow-purple-900/30"
          >
            <span>Vào Cổng Giảng Viên</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Phân hệ 3: Quản Trị Hệ Thống */}
        <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col justify-between transition group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-rose-400 mb-2">
              🔒 Quản Trị Hệ Thống (Issuer)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Quản lý vòng đời danh tính, kích hoạt thu hồi khẩn cấp (Revocation), nạp danh sách sinh viên qua JSON và truy vết kiểm toán an toàn toàn diện.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg shadow-rose-900/30"
          >
            <span>Bảng Quản Trị</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
          <ShieldCheck size={20} className="text-cyan-400" />
          <span>Kiến Trúc Kỹ Thuật Đạt Chuẩn Nghiên Cứu Khoa Học</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Fingerprint size={16} />
              <span>ECDSA & WebAuthn</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Ký mật mã EIP-191 kết hợp xác thực vân tay / FaceID phần cứng, không lưu mật khẩu.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <MapPin size={16} />
              <span>Geo-Fencing Haversine</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Đo khoảng cách thực tế giữa Giảng viên và Sinh viên với độ chính xác &le; 50m.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Layers size={16} />
              <span>Merkle Tree Batch VC</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Gốc Merkle Tree (keccak256) cho phép cấp phát và đối soát hàng loạt chứng chỉ số.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Database size={16} />
              <span>Polygon Amoy Testnet</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Smart contract DIDRegistry.sol ghi nhận trạng thái thu hồi bất biến trên Blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
