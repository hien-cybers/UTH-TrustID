// src/components/MobileNavigation.jsx - Thanh Điều Hướng Holder Node (Sinh Viên) Chuẩn Dark Neon
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, ClipboardCheck, LayoutGrid } from 'lucide-react';

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
          height: calc(64px + env(safe-area-inset-bottom, 0px));
          padding: 4px 10px env(safe-area-inset-bottom, 0px);
          background: rgba(6, 18, 36, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(56, 189, 248, 0.25);
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 6px;
          z-index: 100;
          box-sizing: border-box;
          box-shadow: 0 -8px 28px rgba(0, 8, 20, 0.65);
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
          color: #94A3B8;
          font-size: 10.5px;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 33.33%;
          height: 50px;
          border-radius: 14px;
        }

        .tab-active {
          color: #38BDF8 !important;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-weight: 700;
        }
      `}</style>

      <nav className="bottom-nav">
        <NavLink to="/student" className={getTabClass}>
          <Wallet size={18} strokeWidth={2} />
          <span>Ví &amp; Lớp Học</span>
        </NavLink>

        <NavLink to="/history" className={getTabClass}>
          <ClipboardCheck size={18} strokeWidth={2} />
          <span>Sổ Chuyên Cần</span>
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={18} strokeWidth={2} />
          <span>Dịch Vụ Số</span>
        </NavLink>
      </nav>
    </>
  );
}
