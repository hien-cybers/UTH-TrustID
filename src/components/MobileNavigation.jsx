// src/components/MobileNavigation.jsx - Thanh Điều Hướng Holder Node (Sinh Viên) & Tích Hợp Safe Area (env(safe-area-inset-bottom))
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, LayoutGrid, QrCode } from 'lucide-react';

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
          /* Tự động cộng thêm độ cao của thanh gạt Home Indicator trên iPhone */
          height: calc(60px + env(safe-area-inset-bottom, 0px));
          padding: 0 6px env(safe-area-inset-bottom, 0px);
          background: var(--bg-header, rgba(15, 23, 42, 0.95));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          box-sizing: border-box;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        @media (max-width: 480px) {
          .bottom-nav {
            position: fixed;
          }
        }

        .tab-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: var(--text-dim, #64748B);
          font-size: 10px;
          font-weight: 600;
          transition: color 0.15s ease, transform 0.15s ease;
          width: 33.33%;
          height: 60px;
        }

        .tab-active {
          color: #06B6D4 !important;
        }
      `}</style>

      <nav className="bottom-nav">
        {/* HOLDER NODE - SINH VIÊN (MOBILE APP) — Chỉ chứa Thẻ Sinh Viên, Quét QR và Dịch Vụ Số */}
        <NavLink to="/student" className={getTabClass}>
          <Wallet size={18} strokeWidth={2} />
          <span>Thẻ Sinh Viên</span>
        </NavLink>

        <NavLink to="/scan" className={getTabClass}>
          <QrCode size={18} strokeWidth={2} />
          <span>Quét QR</span>
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={18} strokeWidth={2} />
          <span>Dịch Vụ Số</span>
        </NavLink>
      </nav>
    </>
  );
}
