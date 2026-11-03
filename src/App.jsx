// src/App.jsx - UTH-TrustID Native iOS Human Interface & Android Material 3
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppProView from './AppProView';
import ServicePortal from './pages/ServicePortal';
import AdminDashboardPro from './pages/AdminDashboardPro';
import StaffLogin from './pages/StaffLogin';
import './styles/appPro.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uth_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* Giao diện Ứng dụng Đỉnh cao tích hợp 3 phân hệ: Ví DID, Quét Radar, Bảng Giảng Viên */}
        <Route path="/" element={<AppProView initialTab="wallet" />} />
        <Route path="/wallet" element={<AppProView initialTab="wallet" />} />
        <Route path="/scan" element={<AppProView initialTab="scan" />} />
        <Route path="/faculty" element={<AppProView initialTab="faculty" />} />

        {/* Các route chuyên sâu mở rộng */}
        <Route path="/services" element={<ServicePortal currentUser={currentUser} />} />
        <Route path="/portal" element={<Navigate to="/services" replace />} />
        <Route path="/login" element={<StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />} />
        <Route path="/admin" element={<AdminDashboardPro />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
