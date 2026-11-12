// src/portalMain.jsx - Entry Point Độc Lập cho Cổng Thông Tin Web Giảng Viên & Quản Trị Viên (Port 5174)
import React from 'react';
import { createRoot } from 'react-dom/client';
import FacultyDashboard from './components/FacultyDashboard';
import './styles/appPro.css';
import './index.css';

const isRootAdminPath =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/admin') || window.location.search.includes('mode=admin'));

class PortalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    console.error('UTH-TrustID Portal Runtime Error:', error);
    if (!sessionStorage.getItem('uth_portal_recovered')) {
      sessionStorage.setItem('uth_portal_recovered', 'true');
      try {
        localStorage.removeItem('uth_courses_catalog_v5');
        localStorage.removeItem('faculty_user');
      } catch {}
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#040814', color: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#4FF0D6', marginBottom: '8px' }}>Đang đồng bộ lại Cổng Giảng Viên &amp; Quản Trị</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', maxWidth: '420px', marginBottom: '16px' }}>
            {String(this.state.error?.message || 'Phát hiện dữ liệu đệm cũ.')}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{ padding: '12px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #4FF0D6, #22D3EE)', color: '#03141A', fontWeight: 800, cursor: 'pointer' }}
          >
            Làm Mới &amp; Mở Lại Cổng Web
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('portal-root')).render(
  <React.StrictMode>
    <PortalErrorBoundary>
      <FacultyDashboard initialMode={isRootAdminPath ? 'ADMIN' : 'FACULTY'} />
    </PortalErrorBoundary>
  </React.StrictMode>
);

