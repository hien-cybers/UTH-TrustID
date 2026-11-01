// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';

export default function App() {
  const navStyle = ({ isActive }) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 500,
    color: isActive ? '#38bdf8' : '#9ca3af',
    background: isActive ? '#1f2937' : 'transparent'
  });

  return (
    <BrowserRouter>
      {/* Header nhỏ gọn */}
      <header style={{ background: '#0b0f19', borderBottom: '1px solid #1f2937', padding: '8px 16px' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
            🛡️ UTH-TrustID
          </div>
          <nav style={{ display: 'flex', gap: '4px' }}>
            <NavLink to="/faculty" style={navStyle}>Giảng Viên</NavLink>
            <NavLink to="/wallet" style={navStyle}>Ví Sinh Viên</NavLink>
            <NavLink to="/portal" style={navStyle}>Cổng Web</NavLink>
            <NavLink to="/admin" style={navStyle}>Quản Trị</NavLink>
          </nav>
        </div>
      </header>

      {/* Nội dung */}
      <main style={{ minHeight: 'calc(100vh - 45px)' }}>
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
