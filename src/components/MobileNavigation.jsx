// src/components/MobileNavigation.jsx - Thanh Điều Hướng Tách Biệt Theo Vai Trò (RBAC) & Tích Hợp Safe Area (env(safe-area-inset-bottom))
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, ShieldCheck, LayoutGrid, QrCode, Radio, Lock } from 'lucide-react';

export default function MobileNavigation({ currentUser }) {
  const getTabClass = ({ isActive }) =>
    `tab-item btn-press ${isActive ? 'tab-active' : ''}`;

  const role = currentUser?.role || 'STUDENT';

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
          width: 33%;
          height: 60px;
        }

        .tab-active {
          color: #06B6D4 !important;
        }
      `}</style>

      <nav className="bottom-nav">
        {/* ROLE 1: HOLDER - SINH VIÊN (MOBILE APP) — Chỉ hiển thị Thẻ số, Quét QR và Dịch vụ cá nhân */}
        {role === 'STUDENT' && (
          <>
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
          </>
        )}

        {/* ROLE 2: VERIFIER - GIẢNG VIÊN / GIÁM THỊ (WEB PORTAL) */}
        {role === 'FACULTY' && (
          <>
            <NavLink to="/faculty" className={getTabClass}>
              <Radio size={18} strokeWidth={2} />
              <span>Phòng Học QR</span>
            </NavLink>

            <NavLink to="/services" className={getTabClass}>
              <LayoutGrid size={18} strokeWidth={2} />
              <span>Tra Cứu SV</span>
            </NavLink>
          </>
        )}

        {/* ROLE 3: ROOT ISSUER - NHÀ TRƯỜNG / KHẢO THÍ (QUẢN TRỊ TẬP TRUNG) */}
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin" className={getTabClass}>
              <ShieldCheck size={18} strokeWidth={2} />
              <span>Root Issuer</span>
            </NavLink>

            <NavLink to="/faculty" className={getTabClass}>
              <Radio size={18} strokeWidth={2} />
              <span>Phòng Học QR</span>
            </NavLink>

            <NavLink to="/services" className={getTabClass}>
              <LayoutGrid size={18} strokeWidth={2} />
              <span>Tra Cứu SV</span>
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
}
