// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';

export default function App() {
  const getNavClass = ({ isActive }) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    color: isActive ? '#38bdf8' : 'var(--text-muted)',
    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
  });

  return (
    <BrowserRouter>
      {/* Header Sticky Glassmorphism */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7, 11, 20, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)', padding: '12px clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px', color: '#fff' }}>
                UTH-TrustID
              </div>
              <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Passwordless DID System
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <NavLink to="/faculty" style={getNavClass}>
              <span>👨‍🏫</span> Cổng Giảng Viên
            </NavLink>
            <NavLink to="/wallet" style={getNavClass}>
              <span>📱</span> Ví Sinh Viên
            </NavLink>
            <NavLink to="/portal" style={getNavClass}>
              <span>💻</span> Cổng Dịch Vụ
            </NavLink>
            <NavLink to="/admin" style={getNavClass}>
              <span>🔒</span> Quản Trị
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
