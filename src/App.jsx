import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';
import { ProtectedAdminRoute } from './components/ProtectedRoute';

import {
  ShieldCheck,
  Smartphone,
  Monitor,
  GraduationCap,
  Lock,
  Home
} from 'lucide-react';
import { getPolygonAmoyBlockNumber } from './services/did';

export default function App() {
  const [blockNumber, setBlockNumber] = useState(null);

  useEffect(() => {
    fetchBlockHeight();
    const timer = setInterval(fetchBlockHeight, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchBlockHeight = async () => {
    const block = await getPolygonAmoyBlockNumber();
    if (block) setBlockNumber(block);
  };

  return (
    <BrowserRouter>
      <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
        {/* Top Navbar: Brand & Route Navigation with Safe Area Insets */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Brand Logo & Chain Status */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 text-decoration-none">
                <div className="bg-cyan-500/10 p-1.5 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                      🛡️ UTH-TrustID
                    </span>
                    <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.2 rounded font-mono">
                      W3C DID
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Polygon Amoy:</span>
                    <span className="font-mono text-slate-300">
                      {blockNumber ? `#${blockNumber.toLocaleString()}` : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Role-based Navigation Tabs (Horizontal smooth swipe on mobile) */}
            <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 -mx-1 px-1 text-xs">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-slate-800 text-white border-slate-600 shadow-md'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Home size={13} />
                <span>Trang Chủ</span>
              </NavLink>

              <NavLink
                to="/wallet"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/70 text-cyan-300 border-slate-800 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Smartphone size={13} />
                <span>📱 Ví Sinh Viên</span>
              </NavLink>

              <NavLink
                to="/portal"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Monitor size={13} />
                <span>💻 Cổng Dịch Vụ</span>
              </NavLink>

              <NavLink
                to="/faculty"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/40'
                      : 'bg-slate-950/70 text-purple-300 border-slate-800 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <GraduationCap size={13} />
                <span>👨‍🏫 Giảng Viên</span>
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/70 text-rose-300 border-rose-900/40 hover:text-white hover:bg-rose-950/30'
                  }`
                }
              >
                <Lock size={13} />
                <span>🔒 Quản Trị</span>
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4">
          <Routes>
            {/* 1. Trang Chủ Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Dành cho Sinh viên (Mobile PWA) */}
            <Route path="/wallet" element={<StudentWallet />} />

            {/* 3. Cổng đăng nhập xác thực không mật khẩu (QR Code) */}
            <Route path="/portal" element={<WebPortal />} />

            {/* 4. Dành cho Giảng viên (Điểm danh / Khảo thí) */}
            <Route path="/faculty" element={<FacultyPortal />} />

            {/* 5. Dành cho Quản trị viên (Được bảo vệ bằng Route Guard) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback điều hướng về Trang Chủ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
