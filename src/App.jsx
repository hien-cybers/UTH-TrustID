// src/App.jsx - UTH-TrustID Native Mobile App (Splash Screen Động, Phân Tách Role RBAC, Safe Area Tai Thỏ & Khung 430px)
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';
import StudentWalletPro from './pages/StudentWalletPro';
import FacultyPortalPro from './pages/FacultyPortalPro';
import ScanPage from './pages/ScanPage';
import ServicePortal from './pages/ServicePortal';
import AdminDashboardPro from './pages/AdminDashboardPro';
import StaffLogin from './pages/StaffLogin';
import UTHTrustIDApp from './UTHTrustIDApp';
import MobileNavigation from './components/MobileNavigation';
import UthTrustLogo from './components/UthTrustLogo';
import LiveClock from './components/LiveClock';
import LockScreenModal from './components/LockScreenModal';
import { useAutoLock } from './hooks/useAutoLock';
import { preWarmGPS } from './utils/gpsDriftFilter';
import { toggleTheme as applyRootTheme, getInitialThemeIsDark } from './utils/theme';
import { clearActiveWallet } from './utils/sessionKeyVault';
import './styles/appPro.css';

import { Key, LogOut, ShieldAlert, Lock, Sun, Moon } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Tự động kích hoạt màn hình khóa nếu rời app quá 30 giây (Zero-Trust Session)
  const { isLocked, unlock, lockNow } = useAutoLock(30000);
  const [theme, setTheme] = useState(() => (getInitialThemeIsDark() ? 'dark' : 'light'));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uth_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    applyRootTheme(theme === 'dark');
  }, [theme]);

  // Pre-warm GPS chạy nền ngay khi App mount để lấy sẵn toạ độ trong sessionStorage + RAM (< 5ms khi quét QR)
  useEffect(() => {
    try {
      preWarmGPS();
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uth_staff_user');
    localStorage.removeItem('uth_staff_token');
    clearActiveWallet();
    setCurrentUser(null);
  };

  const handleLockSession = () => {
    clearActiveWallet();
    lockNow();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col items-center justify-center">
      {/* Màn hình khởi động động (Animated Splash Screen) hiển thị khi vừa mở ứng dụng */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Khi bị khóa do thoát app quá 30 giây hoặc bấm khóa nhanh, modal này đè lên toàn bộ app */}
      {isLocked && (
        <LockScreenModal
          studentName="Nguyễn Đức Hiển"
          onUnlockSuccess={unlock}
        />
      )}

      {/* Giao diện chính của ứng dụng được nạp sẵn ngầm bên dưới */}
      <BrowserRouter>
      {/* Khung Smartphone 430px Cố Định Chính Giữa + Tự Động Tụt Dưới Tai Thỏ / Dynamic Island (--sat) */}
      <div className="mobile-viewport mobile-app-root bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        
        {/* Top Header Chuẩn Native iOS / Android (Tránh đè lên Tai Thỏ / Dynamic Island) */}
        <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200" style={{
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '11px 15px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            
            {/* Logo Thương Hiệu UTH-TrustID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <UthTrustLogo size={30} />
              <div style={{ minWidth: 0 }}>
                <div className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '13.5px', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                  UTH TRUST<span className="text-cyan-500">ID</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  {currentUser
                    ? (currentUser.role === 'ADMIN' ? 'ROLE: ROOT ISSUER' : 'ROLE: VERIFIER (GV)')
                    : 'ROLE: HOLDER (SINH VIÊN)'}
                </div>
              </div>
            </div>

            {/* Đồng hồ thời gian thực độc lập (<LiveClock />) + Dark/Light Mode + Trạng thái Phân Quyền RBAC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <LiveClock />

              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
                className="btn-press bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                style={{
                  padding: '5px 7px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              </button>

              <button
                onClick={handleLockSession}
                title="Khóa phiên bảo mật ngay (Test Auto-Lock / PIN 123456)"
                className="btn-press bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                style={{
                  padding: '5px 7px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={12} />
              </button>

              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: '6px',
                    background: currentUser.role === 'ADMIN' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.14)',
                    color: currentUser.role === 'ADMIN' ? '#10B981' : '#0284C7',
                    border: currentUser.role === 'ADMIN' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    {currentUser.role === 'ADMIN' ? 'Issuer' : 'Verifier'}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất tài khoản công vụ (Quay về chế độ Sinh viên)"
                    className="btn-press"
                    style={{
                      padding: '4px 7px',
                      borderRadius: '7px',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      background: 'rgba(244, 63, 94, 0.12)',
                      color: '#F43F5E',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <LogOut size={11} />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="btn-press bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Key size={11} />
                  <span>Cán Bộ</span>
                </NavLink>
              )}
            </div>

          </div>
        </header>

        {/* Vùng Nội Dung Cuộn Bên Trong Khung Điện Thoại */}
        <main className="mobile-scroll-body bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
          <Routes>
            {/* 1. VAI TRÒ HOLDER - SINH VIÊN (/student & /wallet) */}
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentWalletPro isDarkMode={theme === 'dark'} onToggleTheme={toggleTheme} />} />
            <Route path="/wallet" element={<StudentWalletPro isDarkMode={theme === 'dark'} onToggleTheme={toggleTheme} />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/all-in-one" element={<UTHTrustIDApp />} />

            {/* 2. CỔNG DỊCH VỤ & TRA CỨU (MỞ CHO SINH VIÊN, PHÂN QUYỀN TÍNH NĂNG CÁN BỘ) */}
            <Route path="/services" element={<ServicePortal currentUser={currentUser} />} />
            <Route path="/portal" element={<Navigate to="/services" replace />} />

            {/* 3. CỔNG ĐĂNG NHẬP CÁN BỘ (RBAC LOGIN GUARD) */}
            <Route path="/login" element={<StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />} />

            {/* 4. VAI TRÒ GIẢNG VIÊN (CHỈ MỞ KHI ĐÃ ĐĂNG NHẬP FACULTY HOẶC ADMIN) */}
            <Route
              path="/faculty"
              element={
                currentUser && (currentUser.role === 'FACULTY' || currentUser.role === 'ADMIN') ? (
                  <FacultyPortalPro />
                ) : (
                  <StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />
                )
              }
            />

            {/* 5. VAI TRÒ QUẢN TRỊ VIÊN ROOT ADMIN (CHẶN SINH VIÊN & CHẶN GIẢNG VIÊN 403) */}
            <Route
              path="/admin"
              element={
                currentUser && currentUser.role === 'ADMIN' ? (
                  <AdminDashboardPro />
                ) : currentUser ? (
                  <div style={{ padding: '16px 4px', textAlign: 'center' }}>
                    <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.35)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <ShieldAlert size={38} color="#F43F5E" strokeWidth={1.8} />
                      </div>
                      <h3 style={{ fontSize: '14.5px', color: '#F43F5E', fontWeight: 800, margin: '0 0 6px' }}>
                        Từ Chối Truy Cập (403 Forbidden)
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 14px' }}>
                        Tài khoản <strong>{currentUser.email}</strong> có vai trò <strong>{currentUser.role}</strong> (Giảng viên). Chỉ <strong>Root Admin (admin@ut.edu.vn)</strong> mới có quyền phát hành lô Merkle Tree và thu hồi thẻ <code>revokeKey()</code>.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="native-btn-primary btn-press"
                        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                      >
                        <span>Đăng xuất để chuyển sang tài khoản Admin</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />
                )
              }
            />

            <Route path="*" element={<Navigate to="/wallet" replace />} />
          </Routes>
        </main>

        {/* Thanh Điều Hướng Dưới Cùng Tự Động Tách Theo Vai Trò (RBAC) & Tích Hợp Safe Area */}
        <MobileNavigation currentUser={currentUser} />

      </div>
      </BrowserRouter>
    </div>
  );
}
