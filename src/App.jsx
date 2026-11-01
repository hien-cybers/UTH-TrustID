// src/App.jsx - UTH-TrustID Original Deep Blue-Navy Interface
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';

export default function App() {
  const getNavClass = ({ isActive }) => ({
    flex: 1,
    padding: '8px 4px',
    textDecoration: 'none',
    fontSize: '11.5px',
    fontWeight: 700,
    color: isActive ? '#38bdf8' : '#8492a6',
    background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s ease'
  });

  const getHeaderNavClass = ({ isActive }) => ({
    padding: '6px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    color: isActive ? '#38bdf8' : '#8492a6',
    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <BrowserRouter>
      {/* Header Sticky Glassmorphism (Desktop & Tablet) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 16px'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
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
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)'
            }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', color: '#fff' }}>
                UTH-TrustID
              </div>
              <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Passwordless DID System
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <NavLink to="/faculty" style={getHeaderNavClass}>
              <span>👨‍🏫</span> Cổng Giảng Viên
            </NavLink>
            <NavLink to="/wallet" style={getHeaderNavClass}>
              <span>📱</span> Ví Sinh Viên
            </NavLink>
            <NavLink to="/portal" style={getHeaderNavClass}>
              <span>💻</span> Cổng Dịch Vụ
            </NavLink>
            <NavLink to="/admin" style={getHeaderNavClass}>
              <span>🔒</span> Quản Trị
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Area co giãn động theo chiều cao thiết bị */}
      <main style={{ minHeight: 'calc(100dvh - 65px)', paddingBottom: '75px', background: '#070b14' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </main>

      {/* Thanh Bottom Navigation Bar cố định dưới đáy chuẩn Mobile */}
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
        padding: '6px 8px calc(6px + var(--safe-bottom)) 8px',
        gap: '4px'
      }}>
        <NavLink to="/faculty" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>👨‍🏫</span>
          <span>Giảng Viên</span>
        </NavLink>
        <NavLink to="/wallet" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>📱</span>
          <span>Ví Sinh Viên</span>
        </NavLink>
        <NavLink to="/portal" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>💻</span>
          <span>Cổng Dịch Vụ</span>
        </NavLink>
        <NavLink to="/admin" style={getNavClass}>
          <span style={{ fontSize: '17px' }}>🔒</span>
          <span>Quản Trị</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}
