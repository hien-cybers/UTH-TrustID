// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet'; // Giao diện ví PWA của bạn
import WebPortal from './components/WebPortal';         // Cổng QR đăng nhập web của bạn

export default function App() {
  const navStyle = ({ isActive }) => ({
    padding: '8px 14px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    color: isActive ? '#38bdf8' : '#94a3b8',
    background: isActive ? '#1e293b' : 'transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <BrowserRouter>
      {/* Thanh điều hướng co giãn linh hoạt */}
      <nav style={{ background: '#090d16', padding: '10px clamp(12px, 3vw, 24px)', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px', color: '#f8fafc' }}>
            UTH-TrustID
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <NavLink to="/wallet" style={navStyle}>📱 Ví Sinh Viên</NavLink>
          <NavLink to="/faculty" style={navStyle}>👨‍🏫 Cổng Giảng Viên</NavLink>
          <NavLink to="/portal" style={navStyle}>💻 Đăng Nhập Web</NavLink>
          <NavLink to="/admin" style={navStyle}>🔒 Quản Trị</NavLink>
        </div>
      </nav>

      {/* Vùng hiển thị nội dung chính */}
      <main style={{ minHeight: 'calc(100vh - 58px)', background: '#0b1120' }}>
        <Routes>
          {/* Mặc định chuyển thẳng vào Cổng Giảng Viên hoặc Ví */}
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
