// src/App.jsx - UTH-TrustID Commercial Native Mobile App (Apple Human Interface & Material 3)
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import StudentWalletPro from './pages/StudentWalletPro';
import FacultyPortalPro from './pages/FacultyPortalPro';
import ScanPage from './pages/ScanPage';
import ServicePortal from './pages/ServicePortal';
import AdminDashboardPro from './pages/AdminDashboardPro';
import StaffLogin from './pages/StaffLogin';
import MobileNavigation from './components/MobileNavigation';

import { 
  ShieldCheck, 
  Key, 
  LogOut, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uth_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('uth_staff_user');
    localStorage.removeItem('uth_staff_token');
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      {/* Khung Viewport Chuẩn Mobile Điện Thoại (iOS & Android) */}
      <div className="mobile-viewport">
        
        {/* Header Cố Định Chuẩn Ứng Dụng Ngân Hàng / Bảo Mật */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(7, 9, 14, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: 'calc(10px + var(--safe-area-top))',
          paddingBottom: '10px',
          paddingLeft: '14px',
          paddingRight: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            
            {/* Logo Brand Vector Lucide */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(6, 182, 212, 0.35)',
                flexShrink: 0
              }}>
                <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14.5px', letterSpacing: '-0.3px', color: '#FFF' }}>
                  UTH-TrustID
                </div>
                <div style={{ fontSize: '9px', color: 'var(--brand-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Passwordless DID
                </div>
              </div>
            </div>

            {/* Trạng thái Mạng & Hồ sơ Người Dùng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className={currentUser.role === 'ADMIN' ? 'badge-status badge-success' : 'badge-status badge-info'} style={{ fontSize: '10px' }}>
                    {currentUser.role === 'ADMIN' ? 'Root Admin' : 'Giảng Viên'}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất tài khoản công vụ"
                    style={{
                      padding: '3px 7px',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <LogOut size={11} />
                    <span>Thoát</span>
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38BDF8',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Key size={12} />
                  <span>Cán Bộ</span>
                </NavLink>
              )}

              {/* Huy hiệu kết nối Polygon Amoy */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 6px',
                background: 'var(--bg-surface)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }} className="font-mono">
                  Amoy
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Nội dung Màn Hình Chính */}
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            {/* 1. Màn hình Ví Thẻ Sinh Viên Số Hoàn Chỉnh (Onboarding & Apple Wallet) */}
            <Route path="/" element={<Navigate to="/wallet" replace />} />
            <Route path="/wallet" element={<StudentWalletPro />} />

            {/* 2. Màn hình Quét Mã Camera Riêng Biệt */}
            <Route path="/scan" element={<ScanPage />} />

            {/* 3. Cổng Dịch Vụ & Thẩm Tra Danh Tính */}
            <Route path="/services" element={<ServicePortal currentUser={currentUser} />} />
            <Route path="/portal" element={<Navigate to="/services" replace />} />
            <Route path="/faculty" element={<FacultyPortalPro />} />

            {/* 4. Đăng Nhập Cán Bộ (RBAC) */}
            <Route path="/login" element={<StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />} />

            {/* 5. Trung Tâm Quản Trị Cấp Cao Chuẩn Pro */}
            <Route
              path="/admin"
              element={
                currentUser && currentUser.role === 'ADMIN' ? (
                  <AdminDashboardPro />
                ) : currentUser ? (
                  <div style={{ padding: '24px 14px', textAlign: 'center' }}>
                    <div className="native-card">
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <ShieldAlert size={40} color="#EF4444" strokeWidth={1.8} />
                      </div>
                      <h3 style={{ fontSize: '15px', color: '#EF4444', fontWeight: 800, margin: '0 0 6px' }}>
                        Từ Chối Truy Cập (403 Forbidden)
                      </h3>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                        Tài khoản <strong>{currentUser.email}</strong> có quyền <strong>{currentUser.role}</strong>. Bảng điều khiển cấp cao yêu cầu quyền <strong>Root Admin</strong>.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="native-btn-primary"
                        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                      >
                        <span>Đăng xuất để đổi tài khoản Admin</span>
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

        {/* Bottom Navigation Bar Chuẩn App Store (Lucide Icons) */}
        <MobileNavigation />

      </div>
    </BrowserRouter>
  );
}
