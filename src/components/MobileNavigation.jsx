// src/components/MobileNavigation.jsx - Thanh Điều Hướng Đáy Chuẩn StudentMobileApp.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function MobileNavigation({ activeCourseSession }) {
  const location = useLocation();
  const isWalletActive = location.pathname === '/student' || location.pathname === '/wallet';
  const isScanActive = location.pathname === '/scan';
  const isServicesActive = location.pathname === '/services' || location.pathname === '/portal';
  const sessionNum = activeCourseSession?.sessionNumber || 3;

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-20 bg-[#060D1E]/95 border-t border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between z-50">
      {/* Nút 1: Ví & Lớp Học */}
      <NavLink
        to="/student"
        className={`flex flex-col items-center gap-1 transition-all no-underline ${
          isWalletActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span className="text-[10px] font-semibold">Ví &amp; Lớp Học</span>
      </NavLink>

      {/* Nút 2: Quét QR Trung tâm */}
      <NavLink
        to="/scan"
        className={`flex flex-col items-center gap-1 transition-all relative no-underline ${
          isScanActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          {activeCourseSession?.isOpen !== false && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <span className="text-[10px] font-semibold">
          {activeCourseSession?.isOpen !== false ? `Quét QR (Buổi ${sessionNum})` : 'Quét QR'}
        </span>
      </NavLink>

      {/* Nút 3: Dịch Vụ Số */}
      <NavLink
        to="/services"
        className={`flex flex-col items-center gap-1 transition-all no-underline ${
          isServicesActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span className="text-[10px] font-semibold">Dịch Vụ Số</span>
      </NavLink>
    </nav>
  );
}
