// src/App.jsx
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
    fontSize: '11px',
    fontWeight: 700,
    color: isActive ? '#38bdf8' : '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s ease'
  });

  return (
    <BrowserRouter>
      {/* Vùng nội dung chính co giãn động theo chiều cao thiết bị */}
      <main style={{ minHeight: 'calc(100dvh - 65px)', paddingBottom: '70px', background: '#070b14' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </main>

      {/* Thanh Bottom Nav cố định dưới đáy chuẩn Mobile app */}
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
        paddingBottom: 'var(--safe-bottom)',
        paddingTop: '6px'
      }}>
        <NavLink to="/faculty" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>👨‍🏫</span>
          <span>Giảng Viên</span>
        </NavLink>
        <NavLink to="/wallet" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>📱</span>
          <span>Ví Sinh Viên</span>
        </NavLink>
        <NavLink to="/portal" style={getNavClass}>
          <span style={{ fontSize: '18px' }}>💻</span>
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
