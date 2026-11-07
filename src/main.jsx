// src/main.jsx - Phân tách tuyệt đối Miền Sinh Viên (Port 5173) và Miền Giảng Viên & Admin (Port 5174)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import FacultyDashboard from './components/FacultyDashboard.jsx';
import './styles/nativeApp.css';
import './styles/animations.css';
import './styles/appPro.css';
import './index.css';

const isFacultyPortalEnv =
  typeof window !== 'undefined' &&
  (window.location.port === '5174' ||
    window.location.pathname.startsWith('/portal') ||
    window.location.pathname.startsWith('/faculty') ||
    window.location.pathname.startsWith('/admin'));

// Nếu đang ở Cổng Web Giảng Viên & Admin (Port 5174): Hủy mọi Service Worker cũ của App Sinh viên để không bao giờ bị lẫn cache
if (isFacultyPortalEnv && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
} else if (!isFacultyPortalEnv && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('PWA ServiceWorker registered: ', reg.scope))
      .catch((err) => console.error('PWA ServiceWorker registration failed: ', err));
  });
}

const isRootAdminPath =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/admin') || window.location.search.includes('mode=admin'));

const rootEl = document.getElementById('portal-root') || document.getElementById('root');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    {isFacultyPortalEnv ? (
      <FacultyDashboard initialMode={isRootAdminPath ? 'ADMIN' : 'FACULTY'} />
    ) : (
      <App />
    )}
  </React.StrictMode>
);
