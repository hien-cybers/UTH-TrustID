// src/components/MobileNavigation.jsx - Thanh Điều Hướng Nổi Dạng Viên Thuốc (Floating Soft Pill Dock)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, LayoutGrid, QrCode } from 'lucide-react';

export default function MobileNavigation({ activeCourseSession }) {
  const getTabClass = ({ isActive }) =>
    `tab-item btn-press ${isActive ? 'tab-active' : ''}`;

  return (
    <>
      <style>{`
        .bottom-nav {
          position: absolute;
          bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 406px;
          height: 64px;
          padding: 6px;
          background: rgba(5, 19, 39, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(123, 189, 232, 0.30);
          border-radius: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          z-index: 100;
          box-sizing: border-box;
          box-shadow: 0 14px 36px rgba(0, 6, 18, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        @media (max-width: 499px) {
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
          color: #93B8D8;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          flex: 1;
          height: 50px;
          border-radius: 22px;
          border: 1px solid transparent;
        }

        .tab-item:hover {
          color: #E0F2FE;
        }

        .tab-active {
          color: #FFFFFF !important;
          background: linear-gradient(135deg, rgba(14, 79, 140, 0.85), rgba(56, 189, 248, 0.28));
          border: 1px solid rgba(123, 189, 232, 0.50);
          box-shadow: 0 6px 18px rgba(10, 65, 116, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.24);
          font-weight: 700;
        }
      `}</style>

      <nav className="bottom-nav">
        <NavLink to="/student" className={getTabClass}>
          <Wallet size={19} strokeWidth={2.1} />
          <span>Ví &amp; Lớp Học</span>
        </NavLink>

        <NavLink to="/scan" className={getTabClass}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={19} strokeWidth={2.2} />
            {activeCourseSession?.isOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -8,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981'
                }}
              />
            )}
          </div>
          <span>
            {activeCourseSession?.isOpen
              ? `Quét QR (Buổi ${activeCourseSession.sessionNumber || 1})`
              : 'Quét QR'}
          </span>
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <LayoutGrid size={19} strokeWidth={2.1} />
          <span>Dịch Vụ Số</span>
        </NavLink>
      </nav>
    </>
  );
}
