// src/components/MobileNavigation.jsx - Thanh Điều Hướng Tách Biệt Theo Vai Trò (RBAC Navigation)
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
          left: 0;
          width: 100%;
          height: 66px;
          background: rgba(8, 12, 20, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 6px;
          z-index: 100;
          box-sizing: border-box;
        }

        .tab-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: #64748B;
          font-size: 10px;
          font-weight: 600;
          transition: color 0.15s ease, transform 0.15s ease;
          width: 25%;
          height: 100%;
        }

        .tab-active {
          color: #38BDF8 !important;
        }
      `}</style>

      <nav className="bottom-nav">
        {/* LUỒNG 1: SINH VIÊN (KHÔNG ĐĂNG NHẬP - PASSWORDLESS DID) */}
        {role === 'STUDENT' && (
          <>
            <NavLink to="/wallet" className={getTabClass}>
              <Wallet size={19} strokeWidth={2} />
              <span>Ví Số DID</span>
            </NavLink>

            <NavLink to="/scan" className={getTabClass}>
              <QrCode size={19} strokeWidth={2} />
              <span>Quét Mã</span>
            </NavLink>

            <NavLink to="/services" className={getTabClass}>
              <LayoutGrid size={19} strokeWidth={2} />
              <span>Dịch Vụ</span>
            </NavLink>

            <NavLink to="/login" className={getTabClass}>
              <Lock size={19} strokeWidth={2} />
              <span>Cán Bộ</span>
            </NavLink>
          </>
        )}

        {/* LUỒNG 2: GIẢNG VIÊN (ROLE = FACULTY) */}
        {role === 'FACULTY' && (
          <>
            <NavLink to="/faculty" className={getTabClass}>
              <Radio size={19} strokeWidth={2} />
              <span>Phòng Học</span>
            </NavLink>

            <NavLink to="/services" className={getTabClass}>
              <LayoutGrid size={19} strokeWidth={2} />
              <span>Tra Cứu SV</span>
            </NavLink>

            <NavLink to="/scan" className={getTabClass}>
              <QrCode size={19} strokeWidth={2} />
              <span>Máy Quét</span>
            </NavLink>

            <NavLink to="/wallet" className={getTabClass}>
              <Wallet size={19} strokeWidth={2} />
              <span>Ví Thử</span>
            </NavLink>
          </>
        )}

        {/* LUỒNG 3: QUẢN TRỊ VIÊN (ROLE = ADMIN) */}
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin" className={getTabClass}>
              <ShieldCheck size={19} strokeWidth={2} />
              <span>Quản Trị</span>
            </NavLink>

            <NavLink to="/faculty" className={getTabClass}>
              <Radio size={19} strokeWidth={2} />
              <span>Phòng Học</span>
            </NavLink>

            <NavLink to="/services" className={getTabClass}>
              <LayoutGrid size={19} strokeWidth={2} />
              <span>Dịch Vụ</span>
            </NavLink>

            <NavLink to="/wallet" className={getTabClass}>
              <Wallet size={19} strokeWidth={2} />
              <span>Ví Mẫu</span>
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
}
