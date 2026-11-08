// src/components/MobileNavigation.jsx - Thanh Điều Hướng Holder Node (Sinh Viên) Chuẩn Ocean-Ice Dark Neon
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
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          height: calc(68px + env(safe-area-inset-bottom, 0px));
          padding: 6px 12px env(safe-area-inset-bottom, 0px);
          background: rgba(4, 15, 32, 0.94);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-top: 1px solid rgba(123, 189, 232, 0.22);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          z-index: 100;
          box-sizing: border-box;
          box-shadow: 0 -10px 32px rgba(0, 8, 20, 0.72);
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
          gap: 4px;
          text-decoration: none;
          color: #93B8D8;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          flex: 1;
          height: 52px;
          border-radius: 15px;
          border: 1px solid transparent;
        }

        .tab-item:hover {
          color: #E0F2FE;
        }

        .tab-active {
          color: #F0F9FF !important;
          background: linear-gradient(135deg, rgba(10, 65, 116, 0.78), rgba(56, 189, 248, 0.22));
          border: 1px solid rgba(123, 189, 232, 0.42);
          box-shadow: 0 4px 16px rgba(10, 65, 116, 0.45), inset 0 1px 0 rgba(189, 216, 233, 0.2);
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
