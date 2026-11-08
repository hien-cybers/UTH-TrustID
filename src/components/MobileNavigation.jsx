// src/components/MobileNavigation.jsx - Thanh Điều Hướng 3 Tab Holder Node (Sinh Viên) Nâng Cấp Bo Góc & Chấm Sáng Mint-Cyan
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
          height: calc(66px + env(safe-area-inset-bottom, 0px));
          padding: 5px 12px env(safe-area-inset-bottom, 0px);
          background: rgba(8, 18, 34, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(79, 240, 214, 0.22);
          border-radius: 24px 24px 0 0;
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
          gap: 2.5px;
          text-decoration: none;
          color: #94A3B8;
          font-size: 10.5px;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 33.33%;
          height: 52px;
          border-radius: 16px;
        }

        .tab-active {
          color: #64F5DF !important;
          background: rgba(79, 240, 214, 0.1);
          border: 1px solid rgba(79, 240, 214, 0.28);
          font-weight: 700;
        }

        .tab-dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: transparent;
          transition: all 0.2s ease;
        }

        .tab-active .tab-dot {
          background: #4FF0D6;
          box-shadow: 0 0 8px #4FF0D6;
        }
      `}</style>

      <nav className="bottom-nav">
        <NavLink to="/student" className={getTabClass}>
          <Wallet size={18} strokeWidth={2} />
          <span>Ví &amp; Lớp Học</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/history" className={getTabClass}>
          <ClipboardCheck size={18} strokeWidth={2} />
          <span>Sổ Chuyên Cần</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={18} strokeWidth={2} />
          <span>Dịch Vụ Số</span>
          <span className="tab-dot" />
        </NavLink>
      </nav>
    </>
  );
}
