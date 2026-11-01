// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';

import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import StudentWallet from './components/StudentWallet';
import WebPortal from './components/WebPortal';
import Scanner from './components/Scanner';

function AppContent() {
  const [showQuickScan, setShowQuickScan] = useState(false);
  const location = useLocation();

  const getNavClass = ({ isActive }) => ({
    flex: 1,
    padding: '8px 0',
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: 600,
    color: isActive ? '#d4f938' : '#71717a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    transition: 'all 0.15s ease'
  });

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Top Header Bar chuẩn Kalo */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(8, 10, 8, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '14px 20px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Left: Stylized Leaf/Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(212, 249, 56, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4f938',
            fontSize: '18px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V13C3 18.5 7 21.6 12 22C17 21.6 21 18.5 21 13V7L12 2Z" stroke="#d4f938" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="#d4f938" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            UTH TrustID
          </span>
        </div>

        {/* Right: Flame Streak Badge + Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Flame streak pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#fbbf24'
          }}>
            <span>🔥</span>
            <span>7</span>
          </div>

          {/* User profile avatar circle */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#181d18',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4f938',
            fontSize: '13px',
            fontWeight: 700
          }}>
            👤
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '90px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/wallet" element={<StudentWallet />} />
          <Route path="/portal" element={<WebPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Routes>
      </main>

      {/* Floating Bottom Navigation Bar chuẩn Kalo */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        zIndex: 50,
        background: 'rgba(14, 18, 14, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 'calc(6px + var(--safe-bottom))',
        paddingTop: '6px',
        paddingLeft: '8px',
        paddingRight: '8px'
      }}>
        {/* Tab 1: Ví Số / Today */}
        <NavLink to="/wallet" style={getNavClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span>Ví Số</span>
        </NavLink>

        {/* Tab 2: Cổng Web / Log */}
        <NavLink to="/portal" style={getNavClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <span>Dịch Vụ</span>
        </NavLink>

        {/* Center: Big Elevated Lime Circle Button with '+' */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setShowQuickScan(true)}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#d4f938',
              color: '#080a08',
              border: '4px solid #080a08',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '-24px',
              boxShadow: '0 4px 20px rgba(212, 249, 56, 0.45)',
              transition: 'transform 0.15s ease'
            }}
            title="Quét mã QR tức thì"
          >
            +
          </button>
        </div>

        {/* Tab 3: Giảng Viên / Progress */}
        <NavLink to="/faculty" style={getNavClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Tiến Độ</span>
        </NavLink>

        {/* Tab 4: Quản Trị / Learn */}
        <NavLink to="/admin" style={getNavClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Quản Trị</span>
        </NavLink>
      </nav>

      {/* Quick QR Scanner Modal khi bấm nút '+' */}
      {showQuickScan && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 7, 5, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#131613',
            border: '1px solid rgba(212, 249, 56, 0.3)',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>
                📸 Quét Mã QR Xác Thực
              </div>
              <button
                onClick={() => setShowQuickScan(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <Scanner
              onScanSuccess={(data) => {
                alert(`Đã quét mã thành công: ${data}`);
                setShowQuickScan(false);
              }}
              onClose={() => setShowQuickScan(false)}
            />

            <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              Hướng camera về phía mã QR trên máy chiếu hoặc cổng dịch vụ UTH
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
