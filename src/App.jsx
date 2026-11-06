// src/App.jsx - UTH-TrustID Native Mobile App (Splash Screen Động, Phân Tách Role RBAC, Safe Area Tai Thỏ & Global Fault-Tolerant Spot-Check 60s)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { io } from 'socket.io-client';

import SplashScreen from './components/SplashScreen';
import StudentWalletPro from './pages/StudentWalletPro';
import FacultyPortalPro from './pages/FacultyPortalPro';
import FacultyAdminDashboard from './components/FacultyAdminDashboard';
import ScanPage from './pages/ScanPage';
import ServicePortal from './pages/ServicePortal';
import AdminDashboardPro from './pages/AdminDashboardPro';
import StaffLogin from './pages/StaffLogin';
import UTHTrustIDApp from './UTHTrustIDApp';
import MobileNavigation from './components/MobileNavigation';
import UthTrustLogo from './components/UthTrustLogo';
import LiveClock from './components/LiveClock';
import LockScreenModal from './components/LockScreenModal';
import FaceIDModal from './components/FaceIDModal';
import { useAutoLock } from './hooks/useAutoLock';
import { preWarmGPS } from './utils/gpsDriftFilter';
import { toggleTheme as applyRootTheme, getInitialThemeIsDark } from './utils/theme';
import { clearActiveWallet } from './utils/sessionKeyVault';
import { getSocketUrl, smartFetch, retargetSocket } from './utils/backendUrl';
import { getItem } from './utils/db';
import { signWithDecryptedKey } from './utils/identityManager';
import { signAuthChallenge } from './services/did';
import { triggerScanSuccessFeedback, triggerSessionTerminatedFeedback } from './utils/hapticAudioFeedback';
import './styles/appPro.css';

import { Key, LogOut, ShieldAlert, Lock, Sun, Moon, Fingerprint, CheckCircle2, Minimize2 } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [widescreenFacultyMode, setWidescreenFacultyMode] = useState(true);
  // Tự động kích hoạt màn hình khóa nếu rời app quá 30 giây (Zero-Trust Session)
  const { isLocked, unlock, lockNow } = useAutoLock(30000);
  const [theme, setTheme] = useState(() => (getInitialThemeIsDark() ? 'dark' : 'light'));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uth_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    applyRootTheme(theme === 'dark');
  }, [theme]);

  // Pre-warm GPS chạy nền ngay khi App mount để lấy sẵn toạ độ trong sessionStorage + RAM (< 5ms khi quét QR)
  useEffect(() => {
    try {
      preWarmGPS();
    } catch {}
  }, []);

  // =========================================================================
  // GLOBAL FAULT-TOLERANT SPOT-CHECK STATE (KHÔNG BAO GIỜ MẤT KHI ĐỔI TAB / TẢI LẠI)
  // =========================================================================
  const [spotCheckState, setSpotCheckState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('uth_spot_check_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isActive && parsed?.deadline && Date.now() < parsed.deadline) {
          return {
            ...parsed,
            countdown: Math.max(1, Math.ceil((parsed.deadline - Date.now()) / 1000))
          };
        }
      }
    } catch {}
    return {
      isActive: false,
      isModalOpen: false,
      countdown: 0,
      deadline: 0,
      sessionId: 'SES_A2301',
      challenge: ''
    };
  });
  const [showGlobalSpotFaceId, setShowGlobalSpotFaceId] = useState(false);
  const [spotVerifiedNotice, setSpotVerifiedNotice] = useState('');
  const globalSocketRef = useRef(null);
  const studentIdentityRef = useRef({ studentId: '2251120000', fullName: 'Nguyễn Đức Hiển' });

  // Nạp thông tin sinh viên từ IndexedDB để đối soát allowedStudents
  useEffect(() => {
    getItem('uth_student_vc')
      .then((vc) => {
        if (vc?.studentId) {
          studentIdentityRef.current = {
            studentId: vc.studentId,
            fullName: vc.fullName || 'Nguyễn Đức Hiển'
          };
        }
      })
      .catch(() => {});
  }, []);

  // Lưu trạng thái Spot-check vào sessionStorage mỗi khi thay đổi để chịu lỗi Reload
  useEffect(() => {
    try {
      if (spotCheckState.isActive && spotCheckState.deadline > Date.now()) {
        sessionStorage.setItem('uth_spot_check_state', JSON.stringify(spotCheckState));
      } else {
        sessionStorage.removeItem('uth_spot_check_state');
      }
    } catch {}
  }, [spotCheckState]);

  // Bộ đếm ngược 60s chạy ngầm toàn cục dựa trên mốc thời gian thực (deadline)
  useEffect(() => {
    if (!spotCheckState.isActive || !spotCheckState.deadline) return;
    const timer = setInterval(() => {
      const remaining = Math.ceil((spotCheckState.deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        sessionStorage.removeItem('uth_spot_check_state');
        setSpotCheckState({
          isActive: false,
          isModalOpen: false,
          countdown: 0,
          deadline: 0,
          sessionId: 'SES_A2301',
          challenge: ''
        });
      } else {
        setSpotCheckState((prev) => (prev.isActive ? { ...prev, countdown: remaining } : prev));
      }
    }, 500);
    return () => clearInterval(timer);
  }, [spotCheckState.isActive, spotCheckState.deadline]);

  // Lắng nghe sự kiện Spot-check toàn cục qua Socket.io & Khôi phục từ Backend Grace Spot-Check (/api/session/active)
  useEffect(() => {
    const activateSpotCheckIfEligible = (payload) => {
      if (!payload) return;
      const myMssv = studentIdentityRef.current?.studentId || '2251120000';
      let checkedInMeta = null;
      try {
        checkedInMeta = JSON.parse(sessionStorage.getItem('uth_checked_in_session') || 'null');
      } catch {}

      const allowed = payload.allowedStudents || payload.targetStudents || payload.validStudentIds;
      const isInAllowedList = Array.isArray(allowed) && allowed.includes(myMssv);
      const hasCheckedInLocally = Boolean(checkedInMeta);

      // Zero-Trust: Chỉ hiển thị cho sinh viên đã điểm danh thành công ban đầu
      if (!isInAllowedList && !hasCheckedInLocally) {
        return;
      }
      if (Array.isArray(allowed) && allowed.length > 0 && !isInAllowedList) {
        return;
      }

      const durationSec = Number(payload.duration || payload.timeoutSeconds || payload.timeoutSec || 60);
      const deadline = payload.spotCheckDeadline || payload.expireAt || (Date.now() + durationSec * 1000);
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      if (remaining <= 0) return;

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      triggerSessionTerminatedFeedback();

      setSpotCheckState({
        isActive: true,
        isModalOpen: true,
        countdown: remaining,
        deadline,
        sessionId: payload.sessionId || checkedInMeta?.sessionId || 'SES_A2301',
        challenge: payload.spotNonce || payload.challenge || ('SPOT_' + Date.now())
      });
    };

    try {
      const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
      globalSocketRef.current = socket;
      retargetSocket(socket).catch(() => {});

      // Kiểm tra phiên đang mở & Backend Grace Spot-Check khi vừa mở lại app
      smartFetch('/api/session/active')
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && d?.session) {
            const s = d.session;
            const myMssv = studentIdentityRef.current?.studentId || '2251120000';
            socket.emit('join-session', {
              sessionId: s.sessionId,
              role: 'STUDENT',
              studentId: myMssv
            });
            // Nếu sinh viên đã có mặt trong danh sách attendees trên server, đồng bộ lại uth_checked_in_session
            const myRecord = Array.isArray(s.attendees)
              ? s.attendees.find((a) => (a.studentId || a.mssv) === myMssv)
              : null;
            if (myRecord) {
              sessionStorage.setItem(
                'uth_checked_in_session',
                JSON.stringify({
                  sessionId: s.sessionId,
                  studentId: myMssv,
                  fullName: myRecord.fullName || myRecord.name || 'Nguyễn Đức Hiển',
                  timestamp: Date.now()
                })
              );
              if (s.activeSpotCheck && !myRecord.spotCheckVerified) {
                activateSpotCheckIfEligible(s.activeSpotCheck);
              }
            }
          }
        })
        .catch(() => {});

      const handleStudentCheckedIn = (e) => {
        if (e?.detail?.sessionId) {
          socket.emit('join-session', {
            sessionId: e.detail.sessionId,
            role: 'STUDENT',
            studentId: e.detail.studentId || '2251120000'
          });
        }
      };
      window.addEventListener('uth-student-checked-in', handleStudentCheckedIn);

      socket.on('spot-check-trigger', activateSpotCheckIfEligible);
      socket.on('spot-check-start', activateSpotCheckIfEligible);
      socket.on('spot-check-requested', activateSpotCheckIfEligible);

      const handleSessionClosed = () => {
        sessionStorage.removeItem('uth_spot_check_state');
        setSpotCheckState((prev) => (prev.isActive ? { ...prev, isActive: false, isModalOpen: false, countdown: 0 } : prev));
      };
      socket.on('session-closed', handleSessionClosed);
      socket.on('session-terminated', handleSessionClosed);

      return () => {
        window.removeEventListener('uth-student-checked-in', handleStudentCheckedIn);
        socket.disconnect();
      };
    } catch {}
  }, []);

  // Kích hoạt quét Face ID cho Spot-Check từ bất kỳ màn hình nào (Banner, Modal hoặc Thẻ Sinh Viên)
  const handleTriggerSpotCheckFaceID = useCallback(() => {
    setSpotCheckState((prev) => ({ ...prev, isModalOpen: false }));
    setShowGlobalSpotFaceId(true);
  }, []);

  // Sau khi quét Face ID thành công -> Ký số EIP-191 và gửi lên Backend Grace Spot-Check
  const handleCompleteGlobalSpotCheck = async () => {
    setShowGlobalSpotFaceId(false);
    try {
      const targetSpotNonce = spotCheckState.challenge || 'SPOT_CHECK';
      const targetSid = spotCheckState.sessionId || 'SES_A2301';

      let studentId = studentIdentityRef.current.studentId || '2251120000';
      let fullName = studentIdentityRef.current.fullName || 'Nguyễn Đức Hiển';
      let privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

      try {
        const vc = (await getItem('uth_student_vc')) || {};
        if (vc.studentId) studentId = vc.studentId;
        if (vc.fullName) fullName = vc.fullName;
        if (vc.privateKey) privateKey = vc.privateKey;
      } catch {}

      let sig = '';
      try {
        const signVault = await signWithDecryptedKey('123456', targetSpotNonce);
        sig = signVault.signature;
      } catch {
        const sigRes = await signAuthChallenge({ privateKey }, targetSpotNonce);
        sig = sigRes.signature;
      }

      globalSocketRef.current?.emit('submit-spot-check', {
        sessionId: targetSid,
        studentId,
        signature: sig
      });

      const verifyRes = await smartFetch('/api/attendance/spot-check-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSid,
          studentId,
          fullName,
          faceIdVerified: true
        })
      }).catch(() => null);

      if (verifyRes && !verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        setSpotVerifiedNotice(`❌ ${errData.error || 'Tái điểm danh bị từ chối!'}`);
        setTimeout(() => setSpotVerifiedNotice(''), 5000);
        return;
      }

      triggerScanSuccessFeedback();
      sessionStorage.removeItem('uth_spot_check_state');
      setSpotCheckState({
        isActive: false,
        isModalOpen: false,
        countdown: 0,
        deadline: 0,
        sessionId: targetSid,
        challenge: ''
      });
      setSpotVerifiedNotice(
        `✓ Đã xác thực lại Face ID (Spot-Check) thành công lúc ${new Date().toLocaleTimeString('vi-VN')}!`
      );
      setTimeout(() => setSpotVerifiedNotice(''), 6000);
    } catch (err) {
      console.error('Global Spot-Check error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uth_staff_user');
    localStorage.removeItem('uth_staff_token');
    clearActiveWallet();
    setCurrentUser(null);
  };

  const handleLockSession = () => {
    clearActiveWallet();
    lockNow();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col items-center justify-center">
      {/* Màn hình khởi động động (Animated Splash Screen) hiển thị khi vừa mở ứng dụng */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Khi bị khóa do thoát app quá 30 giây hoặc bấm khóa nhanh, modal này đè lên toàn bộ app */}
      {isLocked && (
        <LockScreenModal
          studentName="Nguyễn Đức Hiển"
          onUnlockSuccess={unlock}
        />
      )}

      {/* Giao diện chính của ứng dụng được nạp sẵn ngầm bên dưới */}
      <BrowserRouter>
      {/* Khung Smartphone 430px Cố Định Chính Giữa + Tự Động Tụt Dưới Tai Thỏ / Dynamic Island (--sat) */}
      <div className="mobile-viewport mobile-app-root bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        
        {/* Top Header Chuẩn Native iOS / Android (Tránh đè lên Tai Thỏ / Dynamic Island) */}
        <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200" style={{
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '11px 15px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            
            {/* Logo Thương Hiệu UTH-TrustID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <UthTrustLogo size={30} />
              <div style={{ minWidth: 0 }}>
                <div className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '13.5px', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                  UTH TRUST<span className="text-cyan-500">ID</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  {currentUser
                    ? (currentUser.role === 'ADMIN' ? 'ROLE: ROOT ISSUER' : 'ROLE: VERIFIER (GV)')
                    : 'ROLE: HOLDER (SINH VIÊN)'}
                </div>
              </div>
            </div>

            {/* Đồng hồ thời gian thực độc lập (<LiveClock />) + Dark/Light Mode + Trạng thái Phân Quyền RBAC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <LiveClock />

              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
                className="btn-press bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                style={{
                  padding: '5px 7px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              </button>

              <button
                onClick={handleLockSession}
                title="Khóa phiên bảo mật ngay (Test Auto-Lock / PIN 123456)"
                className="btn-press bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                style={{
                  padding: '5px 7px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={12} />
              </button>

              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: '6px',
                    background: currentUser.role === 'ADMIN' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.14)',
                    color: currentUser.role === 'ADMIN' ? '#10B981' : '#0284C7',
                    border: currentUser.role === 'ADMIN' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    {currentUser.role === 'ADMIN' ? 'Issuer' : 'Verifier'}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất tài khoản công vụ (Quay về chế độ Sinh viên)"
                    className="btn-press"
                    style={{
                      padding: '4px 7px',
                      borderRadius: '7px',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      background: 'rgba(244, 63, 94, 0.12)',
                      color: '#F43F5E',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <LogOut size={11} />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="btn-press bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Key size={11} />
                  <span>Cán Bộ</span>
                </NavLink>
              )}
            </div>

          </div>
        </header>

        {/* 2. BANNER CẢNH BÁO KHẨN CẤP GHIM TRÊN MỌI MÀN HÌNH NẾU ĐANG TRONG 60S SPOT-CHECK */}
        {spotCheckState.isActive && !spotCheckState.isModalOpen && !currentUser && (
          <div
            onClick={() => setSpotCheckState((prev) => ({ ...prev, isModalOpen: true }))}
            className="sticky top-[53px] z-40 mx-3 mt-2 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 backdrop-blur-md flex items-center justify-between cursor-pointer animate-pulse shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 m-0">
                  Yêu cầu Tái điểm danh đang diễn ra!
                </p>
                <p className="text-[10px] text-amber-800/80 dark:text-amber-200/80 m-0">
                  Chạm vào đây để quét Face ID xác thực ngay
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs">
              {spotCheckState.countdown}s
            </span>
          </div>
        )}

        {/* Thông báo hoàn tất Spot-check toàn cục */}
        {spotVerifiedNotice && !currentUser && (
          <div className="mx-3 mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
            <span>{spotVerifiedNotice}</span>
          </div>
        )}

        {/* Vùng Nội Dung Cuộn Bên Trong Khung Điện Thoại */}
        <main className="mobile-scroll-body bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
          <Routes>
            {/* 1. VAI TRÒ HOLDER - SINH VIÊN (/student & /wallet) */}
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route
              path="/student"
              element={
                <StudentWalletPro
                  isDarkMode={theme === 'dark'}
                  onToggleTheme={toggleTheme}
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />
            <Route
              path="/wallet"
              element={
                <StudentWalletPro
                  isDarkMode={theme === 'dark'}
                  onToggleTheme={toggleTheme}
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />
            <Route
              path="/scan"
              element={
                <ScanPage
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />
            <Route path="/all-in-one" element={<UTHTrustIDApp />} />

            {/* 2. CỔNG DỊCH VỤ & TRA CỨU (MỞ CHO SINH VIÊN, PHÂN QUYỀN TÍNH NĂNG CÁN BỘ) */}
            <Route path="/services" element={<ServicePortal currentUser={currentUser} />} />
            <Route path="/portal" element={<Navigate to="/services" replace />} />

            {/* 3. CỔNG ĐĂNG NHẬP CÁN BỘ (RBAC LOGIN GUARD) */}
            <Route path="/login" element={<StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />} />

            {/* 4. VAI TRÒ GIẢNG VIÊN: MẶC ĐỊNH MỞ COMMAND CENTER 16:9 TOÀN MÀN HÌNH CHO MÁY CHIẾU LAPTOP/PC */}
            <Route
              path="/faculty"
              element={
                widescreenFacultyMode && typeof document !== 'undefined' ? (
                  createPortal(
                    <div className="fixed inset-0 z-[9990] overflow-y-auto bg-[#040814]">
                      <FacultyAdminDashboard onSwitchMobileView={() => setWidescreenFacultyMode(false)} />
                    </div>,
                    document.body
                  )
                ) : (
                  <FacultyPortalPro onSwitchWidescreen={() => setWidescreenFacultyMode(true)} />
                )
              }
            />
            <Route
              path="/command-center"
              element={
                typeof document !== 'undefined' ? (
                  createPortal(
                    <div className="fixed inset-0 z-[9990] overflow-y-auto bg-[#040814]">
                      <FacultyAdminDashboard onSwitchMobileView={() => setWidescreenFacultyMode(false)} />
                    </div>,
                    document.body
                  )
                ) : (
                  <FacultyAdminDashboard />
                )
              }
            />

            {/* 5. VAI TRÒ QUẢN TRỊ VIÊN ROOT ADMIN (CHẶN SINH VIÊN & CHẶN GIẢNG VIÊN 403) */}
            <Route
              path="/admin"
              element={
                currentUser && currentUser.role === 'ADMIN' ? (
                  <AdminDashboardPro />
                ) : currentUser ? (
                  <div style={{ padding: '16px 4px', textAlign: 'center' }}>
                    <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.35)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <ShieldAlert size={38} color="#F43F5E" strokeWidth={1.8} />
                      </div>
                      <h3 style={{ fontSize: '14.5px', color: '#F43F5E', fontWeight: 800, margin: '0 0 6px' }}>
                        Từ Chối Truy Cập (403 Forbidden)
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 14px' }}>
                        Tài khoản <strong>{currentUser.email}</strong> có vai trò <strong>{currentUser.role}</strong> (Giảng viên). Chỉ <strong>Root Admin (admin@ut.edu.vn)</strong> mới có quyền phát hành lô Merkle Tree và thu hồi thẻ <code>revokeKey()</code>.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="native-btn-primary btn-press"
                        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                      >
                        <span>Đăng xuất để chuyển sang tài khoản Admin</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <StaffLogin onLoginSuccess={(u) => setCurrentUser(u)} />
                )
              }
            />

            <Route path="*" element={<Navigate to="/wallet" replace />} />
          </Routes>
        </main>

        {/* Thanh Điều Hướng Dưới Cùng Tự Động Tách Theo Vai Trò (RBAC) & Tích Hợp Safe Area */}
        <MobileNavigation currentUser={currentUser} />

      </div>

      {/* MODAL SPOT-CHECK KHẨN CẤP TOÀN CỤC (CHỐNG CLICK-OUTSIDE MẤT LƯỢT) */}
      {spotCheckState.isActive && spotCheckState.isModalOpen && !currentUser && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          // Vô hiệu hóa click-outside để sinh viên không bao giờ lỡ tay bấm ra ngoài làm mất lượt điểm danh
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="glass-card animate-fade-scale"
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--bg-modal)',
              border: '2px solid rgba(245, 158, 11, 0.75)',
              borderRadius: '24px',
              padding: '22px 18px 18px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(245, 158, 11, 0.25)'
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#F59E0B',
              fontSize: '11px',
              fontWeight: 800,
              marginBottom: '12px'
            }}>
              <span>⚠️ KIỂM TRA HIỆN DIỆN ĐỘT XUẤT</span>
              <span style={{
                background: '#F59E0B',
                color: '#04060A',
                padding: '1px 7px',
                borderRadius: '999px',
                fontFamily: 'JetBrains Mono',
                fontWeight: 900
              }}>
                {spotCheckState.countdown}s
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>
              Yêu Cầu Tái Điểm Danh Bằng Face ID
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px' }}>
              Giảng viên đang kiểm tra sĩ số giữa giờ (Phiên <b>{spotCheckState.sessionId}</b>). Vui lòng xác thực sinh trắc học trước khi hết <b>{spotCheckState.countdown} giây</b> để giữ trạng thái <b>Có Mặt</b>.
            </p>

            <button
              type="button"
              onClick={handleTriggerSpotCheckFaceID}
              className="btn-press"
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                color: '#04060A',
                fontSize: '13.5px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                marginBottom: '10px'
              }}
            >
              <Fingerprint size={18} />
              <span>⚡ Xác Thực Lại Face ID ({spotCheckState.countdown}s)</span>
            </button>

            <button
              type="button"
              onClick={() => setSpotCheckState((prev) => ({ ...prev, isModalOpen: false }))}
              className="btn-press"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '12px',
                border: '1px solid var(--border-hairline)',
                background: 'var(--bg-inset)',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Minimize2 size={13} />
              <span>Thu gọn thành thanh cảnh báo trên cùng (Không hủy lượt)</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL FACE ID TOÀN CỤC CHO SPOT-CHECK (KHI TẮT VẪN GIỮ NGUYÊN PHIÊN 60S) */}
      <FaceIDModal
        isOpen={showGlobalSpotFaceId}
        onSuccess={handleCompleteGlobalSpotCheck}
        onCancel={() => {
          // Không hủy phiên Spot-check nếu sinh viên lỡ tay đóng FaceIDModal, chỉ thu về Banner/Modal
          setShowGlobalSpotFaceId(false);
        }}
        onFallbackPin={handleCompleteGlobalSpotCheck}
        studentName={studentIdentityRef.current.fullName}
        studentId={studentIdentityRef.current.studentId}
        reason={`Xác thực lại hiện diện Spot-Check (Còn ${spotCheckState.countdown}s)`}
      />
      </BrowserRouter>
    </div>
  );
}
