// src/components/MobileNavigation.jsx - Thanh Điều Hướng Tối Giản Có Chấm Sáng Mint Pastel (Chuẩn Ảnh Mẫu)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PieChart, QrCode, LayoutGrid } from 'lucide-react';

export default function MobileNavigation() {
  const getTabClass = ({ isActive }) =>
    `tab-item btn-press ${isActive ? 'tab-active' : ''}`;

  return (
    <>
      <style>{`
        .bottom-nav {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          height: calc(66px + env(safe-area-inset-bottom, 0px));
          padding: 6px 16px env(safe-area-inset-bottom, 0px);
          background: rgba(25, 25, 36, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 26px 26px 0 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          box-sizing: border-box;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 480px) {
          .bottom-nav {
            position: fixed;
          }
        }

        .tab-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: #6E7185;
          font-size: 10px;
          font-weight: 600;
          transition: all 0.22s ease;
          width: 25%;
          height: 52px;
          border-radius: 16px;
        }

        .tab-active {
          color: #7CE8D8 !important;
          font-weight: 800;
        }

        .tab-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: transparent;
          transition: all 0.22s ease;
          margin-top: 1px;
        }

        .tab-active .tab-dot {
          background: #7CE8D8;
          box-shadow: 0 0 8px #7CE8D8;
        }
      `}</style>

      <nav className="bottom-nav">
        <NavLink to="/student" className={getTabClass}>
          <Home size={20} strokeWidth={2.1} />
          <span>Trang Chủ</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/history" className={getTabClass}>
          <PieChart size={20} strokeWidth={2.1} />
          <span>Chuyên Cần</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/scan" className={getTabClass}>
          <QrCode size={20} strokeWidth={2.1} />
          <span>Quét QR</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={20} strokeWidth={2.1} />
          <span>Dịch Vụ</span>
          <span className="tab-dot" />
        </NavLink>
      </nav>
    </>
  );
}
