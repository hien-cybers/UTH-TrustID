// src/App.jsx - UTH-TrustID Deep Blue-Navy Interface (Bottom Nav & Staff RBAC Guard)
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import ServicePortal from './pages/ServicePortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import StaffLogin from './pages/StaffLogin';

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

  const getNavClass = ({ isActive }) => ({
    flex: 1,
    minWidth: 0,
    padding: '7px 4px',
    textDecoration: 'none',
    fontSize: '11.5px',
    fontWeight: 700,
    color: isActive ? '#38bdf8' : '#8492a6',
    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <BrowserRouter>
      {/* Header hiển thị Logo & Trạng thái mạng & Nút Đăng nhập / Thoát RBAC */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 11, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        paddingBottom: '10px',
        paddingLeft: 'calc(14px + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(14px + env(safe-area-inset-right, 0px))',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', color: '#fff', whiteSpace: 'nowrap' }}>
                UTH-TrustID
              </div>
              <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                Passwordless DID System
              </div>
            </div>
          </div>

          {/* Góc phải Header: Huy hiệu người dùng (nếu có) / Nút Đăng nhập & Trạng thái Amoy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '10.5px',
                  color: currentUser.role === 'ADMIN' ? '#00e676' : '#38bdf8',
                  background: currentUser.role === 'ADMIN' ? 'rgba(0, 230, 118, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                  border: currentUser.role === 'ADMIN' ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}>
                  {currentUser.role === 'ADMIN' ? 'Root Admin' : 'Giảng Viên'}
                </span>

                <button
                  onClick={handleLogout}
                  title="Đăng xuất tài khoản quản trị"
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 82, 82, 0.4)',
                    background: 'rgba(255, 82, 82, 0.12)',
                    color: '#ff5252',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Thoát ({currentUser.fullName ? currentUser.fullName.split(' ').pop() : 'User'})
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🔑</span>
                <span>Cán Bộ Đăng Nhập</span>
              </NavLink>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 7px', background: '#0b1329', borderRadius: '6px', border: '1px solid #162032' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 6px #00e676' }} />
              <span style={{ fontSize: '10.5px', color: '#8492a6', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                Amoy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        minHeight: 'calc(100dvh - 65px)',
        paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        background: '#070b14',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Routes>
          {/* 1. Sinh viên: Truy cập ví tự do, không cần mật khẩu */}
          <Route path="/" element={<Navigate to="/wallet" replace />} />
          <Route path="/wallet" element={<StudentWallet />} />

          {/* 2. Cổng dịch vụ công khai (phân quyền tính năng theo role) */}
          <Route path="/services" element={<ServicePortal currentUser={currentUser} />} />
          <Route path="/portal" element={<Navigate to="/services" replace />} />
          <Route path="/faculty" element={<Navigate to="/services?tab=attendance" replace />} />

          {/* 3. Trang Đăng nhập cán bộ công vụ */}
          <Route path="/login" element={<StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />} />

          {/* 4. Trung tâm Quản trị Cấp cao (Chỉ dành cho ADMIN) */}
          <Route
            path="/admin"
            element={
              currentUser && currentUser.role === 'ADMIN' ? (
                <AdminDashboard />
              ) : currentUser ? (
                <div style={{ maxWidth: '440px', margin: '40px auto', padding: '24px 20px', background: '#0d131f', border: '1px solid #162032', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⛔</div>
                  <h3 style={{ fontSize: '16px', color: '#ff5252', fontWeight: 800, margin: '0 0 6px' }}>
                    Từ Chối Truy Cập (403 Forbidden)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#8492a6', lineHeight: '1.5', margin: '0 0 16px' }}>
                    Tài khoản <strong>{currentUser.email}</strong> có vai trò <strong>{currentUser.role}</strong>. Trung tâm Quản trị Cấp cao chỉ dành riêng cho tài khoản có quyền <strong>Root Admin</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(90deg, #ff5252, #d32f2f)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Đăng xuất để đổi tài khoản Admin
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

      {/* Thanh Bottom Navigation Bar duy nhất cố định dưới đáy */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(11, 19, 41, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        paddingTop: '6px',
        paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(10px + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(10px + env(safe-area-inset-right, 0px))',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        gap: '6px'
      }}>
        <NavLink to="/wallet" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>📱</span>
          <span>Ví Sinh Viên</span>
        </NavLink>
        <NavLink to="/services" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>🏛️</span>
          <span>Cổng Dịch Vụ</span>
        </NavLink>
        <NavLink to="/admin" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>🔒</span>
          <span>Quản Trị</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}
