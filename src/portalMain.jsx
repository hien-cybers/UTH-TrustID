// src/portalMain.jsx - Entry Point Độc Lập cho Cổng Thông Tin Web Giảng Viên & Quản Trị Viên (Port 5174)
import React from 'react';
import { createRoot } from 'react-dom/client';
import FacultyDashboard from './components/FacultyDashboard';
import './styles/appPro.css';
import './index.css';

const isRootAdminPath =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/admin') || window.location.search.includes('mode=admin'));

createRoot(document.getElementById('portal-root')).render(
  <React.StrictMode>
    <FacultyDashboard initialMode={isRootAdminPath ? 'ADMIN' : 'FACULTY'} />
  </React.StrictMode>
);

