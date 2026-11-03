// src/components/MobileNavigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, ShieldCheck, LayoutGrid, QrCode } from 'lucide-react';

export default function MobileNavigation() {
  const getTabClass = ({ isActive }) =>
    `tab-item ${isActive ? 'tab-active' : ''}`;

  return (
    <>
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          height: calc(62px + var(--safe-area-bottom));
          background: rgba(11, 14, 20, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          padding-top: 8px;
          z-index: 1000;
          box-sizing: border-box;
        }

        .tab-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          text-decoration: none;
          color: var(--text-tertiary);
          font-size: 10.5px;
          font-weight: 600;
          transition: color 0.15s ease, transform 0.15s ease;
          width: 25%;
        }

        .tab-active {
          color: #38BDF8 !important;
        }

        .tab-item:active {
          transform: scale(0.92);
        }
      `}</style>

      <nav className="bottom-nav">
        <NavLink to="/wallet" className={getTabClass}>
          <Wallet size={20} strokeWidth={2} />
          <span>Ví Số</span>
        </NavLink>

        <NavLink to="/scan" className={getTabClass}>
          <QrCode size={20} strokeWidth={2} />
          <span>Quét Mã</span>
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={20} strokeWidth={2} />
          <span>Dịch Vụ</span>
        </NavLink>

        <NavLink to="/admin" className={getTabClass}>
          <ShieldCheck size={20} strokeWidth={2} />
          <span>Quản Trị</span>
        </NavLink>
      </nav>
    </>
  );
}

