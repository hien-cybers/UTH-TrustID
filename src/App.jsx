// src/App.jsx - UTH-TrustID Native Mobile App (Isolated Holder Node - Sinh Viên, Safe Area Tai Thỏ & Global Fault-Tolerant Spot-Check 60s)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import SplashScreen from './components/SplashScreen';
import StudentWalletPro from './pages/StudentWalletPro';
import ScanPage from './pages/ScanPage';
import ServicePortal from './pages/ServicePortal';
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

import { ShieldCheck, Lock, Fingerprint, CheckCircle2, Minimize2, ExternalLink } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Tự động kích hoạt màn hình khóa nếu rời app quá 30 giây (Zero-Trust Session)
  const { isLocked, unlock, lockNow } = useAutoLock(30000);

  useEffect(() => {
    getInitialThemeIsDark();
    applyRootTheme(true);
  }, []);

  // Trạng thái Lớp Học Phần & Buổi Điểm Danh đang mở từ Web Portal Giảng viên (Đồng bộ thời gian thực)
  const [activeCourseSession, setActiveCourseSession] = useState({
    isOpen: true,
    sessionId: 'SES_A2301',
    classId: 'CLS_IT402_N01',
    courseCode: 'IT402.N01',
    courseName: 'An toàn Mạng máy tính & Ứng dụng',
    room: 'A2-301',
    sessionNumber: 3,
    radius: 35,
    networkMode: 'CELLULAR_ANY',
    nonce: 'NONCE_LIVE'
  });

  // Danh mục Lớp học phần phân cấp 1 - N (1 Lớp học -> Nhiều Buổi học con) đồng bộ từ Backend
  const [coursesCatalog, setCoursesCatalog] = useState([]);

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

      // Đồng bộ danh mục Lớp học phần 1 - N (1 Lớp -> N Buổi học) từ Backend
      smartFetch('/api/courses')
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && Array.isArray(d.courses)) {
            setCoursesCatalog(d.courses);
          }
        })
        .catch(() => {});

      socket.on('courses-updated', (payload) => {
        if (Array.isArray(payload?.courses)) {
          setCoursesCatalog(payload.courses);
        }
      });

      // Kiểm tra phiên đang mở & Backend Grace Spot-Check khi vừa mở lại app
      smartFetch('/api/session/active')
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && d?.session) {
            const s = d.session;
            setActiveCourseSession({
              isOpen: s.isOpen !== false,
              sessionId: s.sessionId || 'SES_A2301',
              classId: s.classId || 'CLS_IT402_N01',
              courseCode: s.courseCode || 'IT402.N01',
              courseName: s.courseName || 'An toàn Mạng máy tính & Ứng dụng',
              room: s.room || 'A2-301',
              sessionNumber: Number(s.sessionNumber || 1),
              radius: Number(s.radius || s.maxRadius || 35),
              networkMode: s.networkMode || 'CELLULAR_ANY',
              nonce: s.nonce || 'NONCE_LIVE'
            });
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

      socket.on('session-created', (payload) => {
        if (payload?.sessionId) {
          setActiveCourseSession({
            isOpen: true,
            sessionId: payload.sessionId,
            classId: payload.classId || 'CLS_IT402_N01',
            courseCode: payload.courseCode || 'IT402.N01',
            courseName: payload.courseName || 'An toàn Mạng máy tính & Ứng dụng',
            room: payload.room || 'A2-301',
            sessionNumber: Number(payload.sessionNumber || 1),
            radius: Number(payload.maxRadius || payload.radius || 35),
            networkMode: payload.networkMode || (payload.networkPolicy === 'CAMPUS_WIFI_ONLY' ? 'CAMPUS_WIFI' : 'CELLULAR_ANY'),
            nonce: payload.nonce || 'NONCE_LIVE'
          });
          socket.emit('join-session', {
            sessionId: payload.sessionId,
            role: 'STUDENT',
            studentId: studentIdentityRef.current?.studentId || '2251120000'
          });
        }
      });

      socket.on('network-mode-updated', (payload) => {
        if (payload?.networkMode) {
          setActiveCourseSession((prev) => ({ ...prev, networkMode: payload.networkMode }));
        }
      });

      socket.on('radius-updated', (payload) => {
        if (payload?.maxRadiusMeters || payload?.radius) {
          setActiveCourseSession((prev) => ({
            ...prev,
            radius: Number(payload.maxRadiusMeters || payload.radius)
          }));
        }
      });

      socket.on('nonce-updated', (payload) => {
        if (payload?.nonce) {
          setActiveCourseSession((prev) => ({
            ...prev,
            sessionId: payload.sessionId || prev.sessionId,
            nonce: payload.nonce
          }));
        }
      });

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
        setActiveCourseSession((prev) => ({ ...prev, isOpen: false }));
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
        setSpotVerifiedNotice(errData.error || 'Tái điểm danh bị từ chối!');
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
        `Đã xác thực lại Face ID (Spot-Check) thành công lúc ${new Date().toLocaleTimeString('vi-VN')}!`
      );
      setTimeout(() => setSpotVerifiedNotice(''), 6000);
    } catch (err) {
      console.error('Global Spot-Check error:', err);
    }
  };

  const handleLockSession = () => {
    clearActiveWallet();
    lockNow();
  };

  const portalHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const facultyPortalUrl = `https://${portalHost}:5174`;

  // Màn hình cô lập miền đặc quyền (Privilege Domain Separation) nếu ai đó truy cập đường dẫn Cán bộ từ Mobile App
  const renderPrivilegeSeparationGuard = () => (
    <div className="glass-card animate-fade-scale" style={{ borderRadius: '18px', padding: '24px 18px', textAlign: 'center', marginTop: '12px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'rgba(6, 182, 212, 0.14)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
        color: '#06B6D4'
      }}>
        <ShieldCheck size={24} />
      </div>
      <div style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        color: '#10B981',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.5px',
        marginBottom: '8px'
      }}>
        ZERO-TRUST • PRIVILEGE DOMAIN SEPARATION
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>
        Cổng Giảng Viên & Admin Đã Tách Sang Web Portal Độc Lập
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 14px' }}>
        Để ngăn chặn dịch ngược mã nguồn (Reverse Engineering) trên gói APK/IPA Sinh viên, toàn bộ <b>Faculty & Admin Command Center</b> đã được cô lập sang miền độc lập trên Laptop/PC (<b>Port 5174</b>).
      </p>
      <a
        href={facultyPortalUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-press"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284C7, #06B6D4)',
          color: '#FFFFFF',
          fontSize: '12.5px',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)'
        }}
      >
        <ExternalLink size={15} />
        <span>Mở Web Portal Giảng Viên ({facultyPortalUrl})</span>
      </a>
    </div>
  );

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

      {/* Giao diện chính của ứng dụng Sinh viên (Holder Node) */}
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
                  HOLDER NODE • SINH VIÊN
                </div>
              </div>
            </div>

            {/* Đồng hồ thời gian thực độc lập (<LiveClock />) + Khóa phiên + Huy hiệu Holder FIDO2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <LiveClock />

              <button
                onClick={handleLockSession}
                title="Khóa phiên bảo mật ngay (Test Auto-Lock / PIN 123456)"
                className="btn-press bg-slate-800 border border-slate-700 text-cyan-400"
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

              <span
                title="Thiết bị Sinh viên đã tách biệt hoàn toàn khỏi quyền Giảng viên (Zero-Trust Holder Node)"
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                style={{
                  padding: '4px 7px',
                  borderRadius: '8px',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  letterSpacing: '0.3px'
                }}
              >
                <ShieldCheck size={11} />
                <span>FIDO2</span>
              </span>
            </div>

          </div>
        </header>

        {/* 2. BANNER CẢNH BÁO KHẨN CẤP GHIM TRÊN MỌI MÀN HÌNH NẾU ĐANG TRONG 60S SPOT-CHECK */}
        {spotCheckState.isActive && !spotCheckState.isModalOpen && (
          <div
            onClick={() => setSpotCheckState((prev) => ({ ...prev, isModalOpen: true }))}
            className="sticky top-[53px] z-40 mx-3 mt-2 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 backdrop-blur-md flex items-center justify-between cursor-pointer animate-pulse shadow-lg"
          >
            <div>
              <p className="text-xs font-bold text-amber-300 m-0">
                Yêu cầu Hậu kiểm Spot-Check đang diễn ra
              </p>
              <p className="text-[10px] text-amber-200/80 m-0">
                Chạm vào đây để quét Face ID xác thực ngay
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs">
              {spotCheckState.countdown}s
            </span>
          </div>
        )}

        {/* Thông báo hoàn tất Spot-check toàn cục */}
        {spotVerifiedNotice && (
          <div className="mx-3 mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
            <span>{spotVerifiedNotice}</span>
          </div>
        )}

        {/* Vùng Nội Dung Cuộn Bên Trong Khung Điện Thoại */}
        <main className="mobile-scroll-body bg-slate-950 transition-colors duration-200">
          <Routes>
            {/* 1. VAI TRÒ HOLDER - SINH VIÊN (/student & /wallet) */}
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route
              path="/student"
              element={
                <StudentWalletPro
                  isDarkMode={true}
                  activeCourseSession={activeCourseSession}
                  coursesCatalog={coursesCatalog}
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />
            <Route
              path="/wallet"
              element={
                <StudentWalletPro
                  isDarkMode={true}
                  activeCourseSession={activeCourseSession}
                  coursesCatalog={coursesCatalog}
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />
            <Route
              path="/scan"
              element={
                <ScanPage
                  activeCourseSession={activeCourseSession}
                  coursesCatalog={coursesCatalog}
                  spotCheckState={spotCheckState}
                  onTriggerSpotCheckFaceID={handleTriggerSpotCheckFaceID}
                />
              }
            />

            {/* 2. CỔNG DỊCH VỤ SỐ SINH VIÊN */}
            <Route path="/services" element={<ServicePortal />} />
            <Route path="/portal" element={<Navigate to="/services" replace />} />

            {/* 3. MIỀN ĐẶC QUYỀN GIẢNG VIÊN / ADMIN ĐÃ ĐƯỢC TÁCH SANG PORT 5174 */}
            <Route path="/login" element={renderPrivilegeSeparationGuard()} />
            <Route path="/faculty" element={renderPrivilegeSeparationGuard()} />
            <Route path="/command-center" element={renderPrivilegeSeparationGuard()} />
            <Route path="/admin" element={renderPrivilegeSeparationGuard()} />

            <Route path="*" element={<Navigate to="/wallet" replace />} />
          </Routes>
        </main>

        {/* Thanh Điều Hướng Dưới Cùng Dành Riêng Cho Sinh Viên (Holder Node) */}
        <MobileNavigation activeCourseSession={activeCourseSession} />

      </div>

      {/* MODAL SPOT-CHECK KHẨN CẤP TOÀN CỤC (CHỐNG CLICK-OUTSIDE MẤT LƯỢT) */}
      {spotCheckState.isActive && spotCheckState.isModalOpen && typeof document !== 'undefined' && createPortal(
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
              <span>KIỂM TRA HIỆN DIỆN ĐỘT XUẤT</span>
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
              Giảng viên đang kiểm tra sĩ số giữa giờ tại lớp <b>{activeCourseSession.courseCode} ({activeCourseSession.room})</b>. Vui lòng xác thực sinh trắc học trước khi hết <b>{spotCheckState.countdown} giây</b> để giữ trạng thái <b>Có Mặt</b>.
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
              <span>Xác Thực Lại Face ID ({spotCheckState.countdown}s)</span>
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
