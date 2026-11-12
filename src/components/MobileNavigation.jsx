// src/components/MobileNavigation.jsx - Thanh Điều Hướng Đáy "Floating Glass Pill Dock" (Kiểu iOS 18) + Chấm Tròn Nhấp Nháy Trực Tuyến
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
          background: linear-gradient(145deg, rgba(10, 22, 42, 0.88) 0%, rgba(5, 12, 26, 0.94) 100%);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(79, 240, 214, 0.28);
          border-radius: 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          z-index: 100;
          box-sizing: border-box;
          box-shadow:
            0 16px 36px rgba(0, 6, 18, 0.78),
            0 0 22px rgba(79, 240, 214, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
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
          letter-spacing: 0.1px;
          transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);
          width: 33.33%;
          height: 52px;
          border-radius: 20px;
          border: 1px solid transparent;
        }

        .tab-item:hover {
          color: #E2E8F0;
        }

        .tab-active {
          color: #64F5DF !important;
          background: linear-gradient(135deg, rgba(79, 240, 214, 0.18) 0%, rgba(34, 211, 238, 0.08) 100%);
          border: 1px solid rgba(79, 240, 214, 0.38);
          font-weight: 700;
          box-shadow:
            0 4px 14px rgba(79, 240, 214, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
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
          border: 1.5px solid #06101F;
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
          background: linear-gradient(90deg, #4FF0D6, #22D3EE);
          box-shadow: 0 0 8px #4FF0D6;
        }
      `}</style>

      <nav className="bottom-nav" aria-label="Điều hướng Ví Sinh viên">
        <NavLink to="/student" className={getTabClass}>
          <span className="tab-icon-wrap">
            <Wallet size={18} strokeWidth={2.1} />
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
            <ClipboardCheck size={18} strokeWidth={2.1} />
          </span>
          <span>Sổ Chuyên Cần</span>
          <span className="tab-dot" />
        </NavLink>

        <NavLink to="/services" className={getTabClass}>
          <span className="tab-icon-wrap">
            <LayoutGrid size={18} strokeWidth={2.1} />
          </span>
          <span>Dịch Vụ Số</span>
          <span className="tab-dot" />
        </NavLink>
      </nav>
    </>
  );
}
