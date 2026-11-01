// src/App.jsx - UTH-TrustID Deep Blue-Navy Interface (Bottom Nav Only)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';

export default function App() {
  const getNavClass = ({ isActive }) => ({
    flex: 1,
    minWidth: 0,
    padding: '6px 2px',
    textDecoration: 'none',
    fontSize: '11px',
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
      {/* Header chỉ hiển thị Logo & Trạng thái mạng, KHÔNG để thanh điều hướng bên trên */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 11, 20, 0.88)',
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

          {/* Huy hiệu trạng thái kết nối mạng trường */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 8px #00e676' }} />
            <span style={{ fontSize: '11px', color: '#8492a6', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
              Amoy
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area co giãn động theo chiều cao thiết bị */}
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
          <Route path="/" element={<Navigate to="/wallet" replace />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
        paddingLeft: 'calc(6px + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(6px + env(safe-area-inset-right, 0px))',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        gap: '4px'
      }}>
        <NavLink to="/wallet" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>📱</span>
          <span>Ví Sinh Viên</span>
        </NavLink>
        <NavLink to="/portal" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>💻</span>
          <span>Cổng Dịch Vụ</span>
        </NavLink>
        <NavLink to="/faculty" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>👨‍🏫</span>
          <span>Giảng Viên</span>
        </NavLink>
        <NavLink to="/admin" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>🔒</span>
          <span>Quản Trị</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}
