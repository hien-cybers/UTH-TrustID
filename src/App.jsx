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
import { startPreWarmGps } from './utils/gpsDriftFilter';
import './styles/appPro.css';

import { Key, LogOut, ShieldAlert, Lock } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Tự động kích hoạt màn hình khóa nếu rời app quá 30 giây (Zero-Trust Session)
  const { isLocked, unlock, lockNow } = useAutoLock(30000);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uth_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Pre-load GPS chạy nền ngay khi Splash Screen đang hiển thị để ứng dụng sẵn sàng tức thì
  useEffect(() => {
    try {
      startPreWarmGps();
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uth_staff_user');
    localStorage.removeItem('uth_staff_token');
    setCurrentUser(null);
  };

  const handleQuickRoleSwitch = (targetRole) => {
    if (targetRole === 'STUDENT') {
      localStorage.removeItem('uth_staff_user');
      localStorage.removeItem('uth_staff_token');
      setCurrentUser(null);
      return;
    }
    if (targetRole === 'FACULTY') {
      const gvUser = { id: 'GV001', fullName: 'TS. Trần Thế Vinh', role: 'FACULTY', email: 'giangvien@ut.edu.vn' };
      localStorage.setItem('uth_staff_user', JSON.stringify(gvUser));
      localStorage.setItem('uth_staff_token', 'mock_jwt_token_2026');
      setCurrentUser(gvUser);
      return;
    }
    if (targetRole === 'ADMIN') {
      const admUser = { id: 'ADM001', fullName: 'Quản Trị Viên Hệ Thống', role: 'ADMIN', email: 'admin@ut.edu.vn' };
      localStorage.setItem('uth_staff_user', JSON.stringify(admUser));
      localStorage.setItem('uth_staff_token', 'mock_jwt_token_2026');
      setCurrentUser(admUser);
    }
  };

  return (
    <>
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
      <div className="mobile-viewport mobile-app-root">
        
        {/* Top Header Chuẩn Native iOS / Android (Tránh đè lên Tai Thỏ / Dynamic Island) */}
        <header style={{
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 14, 23, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 16px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            
            {/* Logo Thương Hiệu UTH-TrustID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <UthTrustLogo size={30} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '13.5px', letterSpacing: '-0.2px', color: '#FFF', whiteSpace: 'nowrap' }}>
                  UTH TRUST<span style={{ color: '#38BDF8' }}>ID</span>
                </div>
                <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  {currentUser
                    ? (currentUser.role === 'ADMIN' ? 'ROLE: ROOT ADMIN' : 'ROLE: GIẢNG VIÊN')
                    : 'ROLE: SINH VIÊN (DID)'}
                </div>
              </div>
            </div>

            {/* Đồng hồ thời gian thực độc lập (<LiveClock />) + Trạng thái Phân Quyền RBAC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <LiveClock />

              <button
                onClick={lockNow}
                title="Khóa phiên bảo mật ngay (Test Auto-Lock / PIN 123456)"
                className="btn-press"
                style={{
                  padding: '5px 7px',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.28)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  color: '#38BDF8',
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
                    color: currentUser.role === 'ADMIN' ? '#10B981' : '#38BDF8',
                    border: currentUser.role === 'ADMIN' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    {currentUser.role === 'ADMIN' ? 'Admin' : 'GV'}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất tài khoản công vụ"
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
                  className="btn-press"
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38BDF8',
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

          {/* Thanh Chuyển Nhanh Vai Trò 1-Chạm (Sinh Viên | Giảng Viên | Quản Trị Admin) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            marginTop: '9px',
            padding: '4px',
            borderRadius: '10px',
            background: 'rgba(4, 6, 10, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <NavLink
              to="/wallet"
              onClick={() => handleQuickRoleSwitch('STUDENT')}
              style={{
                padding: '5px 8px',
                borderRadius: '7px',
                textAlign: 'center',
                fontSize: '10.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: !currentUser ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                color: !currentUser ? '#38BDF8' : '#64748B',
                border: !currentUser ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent'
              }}
            >
              Sinh Viên (DID)
            </NavLink>
            <NavLink
              to="/faculty"
              onClick={() => handleQuickRoleSwitch('FACULTY')}
              style={{
                padding: '5px 8px',
                borderRadius: '7px',
                textAlign: 'center',
                fontSize: '10.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: currentUser?.role === 'FACULTY' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                color: currentUser?.role === 'FACULTY' ? '#38BDF8' : '#64748B',
                border: currentUser?.role === 'FACULTY' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent'
              }}
            >
              Giảng Viên (QR)
            </NavLink>
            <NavLink
              to="/admin"
              onClick={() => handleQuickRoleSwitch('ADMIN')}
              style={{
                padding: '5px 8px',
                borderRadius: '7px',
                textAlign: 'center',
                fontSize: '10.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: currentUser?.role === 'ADMIN' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                color: currentUser?.role === 'ADMIN' ? '#10B981' : '#64748B',
                border: currentUser?.role === 'ADMIN' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent'
              }}
            >
              Root Admin
            </NavLink>
          </div>
        </header>

        {/* Vùng Nội Dung Cuộn Bên Trong Khung Điện Thoại */}
        <main className="mobile-scroll-body">
          <Routes>
            {/* 1. VAI TRÒ SINH VIÊN (KHÔNG CẦN TÀI KHOẢN - PASSWORDLESS DID) */}
            <Route path="/" element={<Navigate to="/wallet" replace />} />
            <Route path="/wallet" element={<StudentWalletPro />} />
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
    </>
  );
}
