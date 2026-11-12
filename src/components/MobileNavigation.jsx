// src/components/MobileNavigation.jsx - Thanh Điều Hướng Đáy "Floating Glass Pill Dock" Phối Màu 5 Tầng (#021024, #052659, #5483B3, #7DA0CA, #C1E8FF)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, ClipboardCheck, LayoutGrid } from 'lucide-react';

export default function MobileNavigation({ activeCourseSession = null, spotCheckState = null }) {
  const isSessionLive = Boolean(activeCourseSession?.isOpen);
  const isSpotCheckUrgent = Boolean(spotCheckState?.isActive);

  const getTabClass = ({ isActive }) =>
    `tab-item btn-press ${isActive ? 'tab-active' : ''}`;

  return (
    <>
      <style>{`
        @keyframes navLivePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.38);
            opacity: 0.55;
          }
        }

        .bottom-nav {
          position: absolute;
          bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 404px;
          height: 64px;
          padding: 5px 6px;
          background: linear-gradient(145deg, rgba(5, 38, 89, 0.94) 0%, rgba(2, 16, 36, 0.97) 100%);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(125, 160, 202, 0.42);
          border-radius: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          z-index: 100;
          box-sizing: border-box;
          box-shadow:
            0 18px 38px rgba(2, 16, 36, 0.8),
            0 0 22px rgba(84, 131, 179, 0.2),
            inset 0 1px 0 rgba(193, 232, 255, 0.22);
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
          color: #7DA0CA;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1px;
          transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);
          width: 33.33%;
          height: 52px;
          border-radius: 22px;
          border: 1px solid transparent;
        }

        .tab-item:hover {
          color: #C1E8FF;
        }

        .tab-active {
          color: #021024 !important;
          background: linear-gradient(135deg, #C1E8FF 0%, #7DA0CA 100%);
          border: 1px solid rgba(255, 255, 255, 0.65);
          font-weight: 800;
          box-shadow:
            0 6px 18px rgba(193, 232, 255, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);
        }

        .tab-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tab-live-badge {
          position: absolute;
          top: -3px;
          right: -7px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          border: 1.5px solid #021024;
          animation: navLivePulse 1.5s infinite ease-in-out;
        }

        .tab-live-badge-urgent {
          background: #F59E0B;
          box-shadow: 0 0 12px #F59E0B;
          animation-duration: 0.9s;
        }

        .tab-dot {
          width: 14px;
          height: 3px;
          border-radius: 999px;
          background: transparent;
          transition: all 0.24s ease;
        }

        .tab-active .tab-dot {
          background: #052659;
        }
      `}</style>

      <nav className="bottom-nav" aria-label="Điều hướng Ví Sinh viên">
        <NavLink to="/student" className={getTabClass}>
          <span className="tab-icon-wrap">
            <Wallet size={18} strokeWidth={2.2} />
            {(isSessionLive || isSpotCheckUrgent) && (
              <span
                className={`tab-live-badge ${isSpotCheckUrgent ? 'tab-live-badge-urgent' : ''}`}
                title={
                  isSpotCheckUrgent
                    ? 'Đang có yêu cầu hậu kiểm Spot-Check!'
                    : `Lớp ${activeCourseSession?.courseCode || ''} đang mở điểm danh`
                }
              />
            )}
          </span>
          <span>Ví &amp; Lớp Học</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/history" className={getTabClass}>
          <span className="tab-icon-wrap">
            <ClipboardCheck size={18} strokeWidth={2.2} />
          </span>
          <span>Sổ Chuyên Cần</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <span className="tab-icon-wrap">
            <LayoutGrid size={18} strokeWidth={2.2} />
          </span>
          <span>Dịch Vụ Số</span>
          <span className="tab-dot" />
        </NavLink>
      </nav>
    </>
  );
}
