import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

// Import các components tương ứng với 3 vai trò
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';
import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import { ProtectedAdminRoute } from './components/ProtectedRoute';

import {
  ShieldCheck,
  Smartphone,
  Monitor,
  GraduationCap,
  Lock,
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
        {/* Top Navbar: Brand & Route Navigation */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Brand Logo & Chain Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-cyan-500/10 p-1.5 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                      UTH TrustID
                    </span>
                    <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.2 rounded font-mono">
                      W3C DID
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Polygon Amoy:</span>
                    <span className="font-mono text-slate-300">
                      {blockNumber ? `#${blockNumber.toLocaleString()}` : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-based Navigation Tabs (Responsive flex wrap / scroll) */}
            <nav className="flex items-center space-x-1.5 overflow-x-auto py-0.5 no-scrollbar text-xs">
              <NavLink
                to="/wallet"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white border-cyan-500 font-medium shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Smartphone size={14} />
                <span>Ví Sinh Viên</span>
              </NavLink>

              <NavLink
                to="/portal"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white border-cyan-500 font-medium shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Monitor size={14} />
                <span>Cổng Đăng Nhập</span>
              </NavLink>

              <NavLink
                to="/faculty"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600 text-white border-cyan-500 font-medium shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <GraduationCap size={14} />
                <span>Cổng Giảng Viên</span>
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-500 font-medium shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/60 text-rose-300 border-rose-900/40 hover:text-white hover:bg-rose-950/30'
                  }`
                }
              >
                <Lock size={14} />
                <span>Quản Trị Viên</span>
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4">
          <Routes>
            {/* 1. Mặc định chuyển hướng vào Ví Sinh Viên */}
            <Route path="/" element={<Navigate to="/wallet" replace />} />

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

            {/* Bắt các tuyến đường không tồn tại */}
            <Route path="*" element={<Navigate to="/wallet" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
