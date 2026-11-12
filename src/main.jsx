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

// Hủy mọi Service Worker cũ để tránh lỗi cache trắng màn hình khi chạy Vite Dev Server
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}

const isRootAdminPath =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/admin') || window.location.search.includes('mode=admin'));

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    console.error('UTH-TrustID Runtime Error:', error);
    // Tự động làm sạch cache bị hỏng và tải lại 1 lần duy nhất
    if (!sessionStorage.getItem('uth_auto_recovered')) {
      sessionStorage.setItem('uth_auto_recovered', 'true');
      try {
        localStorage.removeItem('trustid_profile');
        localStorage.removeItem('uth_courses_catalog_v5');
        sessionStorage.removeItem('uth_spot_check_state');
      } catch {}
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#040914', color: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#64F5DF', marginBottom: '8px' }}>Đang khôi phục phiên làm việc UTH-TrustID</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', maxWidth: '420px', marginBottom: '16px' }}>
            {String(this.state.error?.message || 'Phát hiện dữ liệu bộ nhớ đệm cũ không tương thích.')}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              if ('indexedDB' in window) {
                try { indexedDB.deleteDatabase('UTHTRUSTID_DB'); } catch {}
              }
              window.location.reload();
            }}
            style={{ padding: '12px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #4FF0D6, #22D3EE)', color: '#03141A', fontWeight: 800, cursor: 'pointer' }}
          >
            Làm Mới Bộ Nhớ &amp; Mở Lại App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('portal-root') || document.getElementById('root');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RootErrorBoundary>
      {isFacultyPortalEnv ? (
        <FacultyDashboard initialMode={isRootAdminPath ? 'ADMIN' : 'FACULTY'} />
      ) : (
        <App />
      )}
    </RootErrorBoundary>
  </React.StrictMode>
);
