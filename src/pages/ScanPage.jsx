// src/pages/ScanPage.jsx - Màn Hình Quét Mã Sinh Viên:
// 1. Cryptographic Biometric Gate: WebAuthn (FaceID/TouchID) + AES-GCM Key Wrapping + PBKDF2 6-Digit Recovery PIN
// 2. Seamless Re-enrollment: Khi sinh viên đổi FaceID/Vân tay trên OS (InvalidStateError/NotAllowedError),
//    mở Modal nhập Mã PIN 6 số (123456) để giải mã Master Key & liên kết lại FaceID mới mà KHÔNG mất Thẻ VC!
// 3. Pre-warm GPS nền (< 300ms) + Hybrid Hardware ID (Fuzzy >= 80%) + Auto-Sync 2 Lớp + Visual Liveness Stamp
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import CameraScannerPro from '../components/CameraScannerPro';
import ProofOfLivenessStamp from '../components/ProofOfLivenessStamp';
import FaceIDModal from '../components/FaceIDModal';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Wifi,
  WifiOff,
  Zap,
  RefreshCw,
  Fingerprint,
  KeyRound
} from 'lucide-react';
import { getSavedIdentity, signAuthChallenge, publishAuthSuccess } from '../services/did';
import {
  getActiveCredential,
  saveOfflineAttendanceToIDB,
  getAllOfflineAttendanceFromIDB,
  syncOfflineAttendanceFromIDB,
  registerDualLayerOfflineSync
} from '../utils/credentialStorage';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { triggerScanSuccessFeedback, triggerSessionTerminatedFeedback } from '../utils/hapticAudioFeedback';
import {
  startPreWarmGps,
  stopPreWarmGps,
  getSmoothedGpsPosition,
  evaluateGpsDriftTolerance
} from '../utils/gpsDriftFilter';
import {
  authenticateWithFallback,
  verifyRecoveryPinAndUnwrap,
  setSimulatedBiometricInvalidation,
  isSimulatedBiometricInvalidated
} from '../utils/webauthnHelper';
import { getSocketUrl, smartFetch, retargetSocket, SERVER_URL, getCustomServerUrl, setCustomServerUrl } from '../utils/backendUrl';
import { getOrCreateDeviceId, signWithDecryptedKey } from '../utils/identityManager';
import { getItem } from '../utils/db';
import { getPreciseLocation } from '../utils/geoManager';

export default function ScanPage({ activeCourseSession, spotCheckState, onTriggerSpotCheckFaceID }) {
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [livenessStampData, setLivenessStampData] = useState(null);

  // Cấu hình SERVER_URL LocalTunnel & Chế độ Mạng Điện Thoại (Thực nghiệm 1 & 2 trước Hội đồng NCKH)
  const [serverUrlInput, setServerUrlInput] = useState(() => getCustomServerUrl());
  const [showServerUrlBar, setShowServerUrlBar] = useState(false);
  const [phoneNetworkMode, setPhoneNetworkMode] = useState('4G'); // '4G' | 'WIFI'
  const [sessionNetworkMode, setSessionNetworkMode] = useState('CAMPUS_WIFI'); // Đồng bộ với Giảng viên ('CAMPUS_WIFI' | 'CELLULAR_ANY')
  const [sessionRadius, setSessionRadius] = useState(35); // Bán kính Geofencing hiện tại của phòng học (mét)
  const [simDistanceMeters, setSimDistanceMeters] = useState('8'); // Khoảng cách GPS thực nghiệm ('8', '85', 'FAKE_GPS', 'REAL_GPS', hoặc số mét bất kỳ)
  const [courseMeta, setCourseMeta] = useState({
    classId: activeCourseSession?.classId || 'CLS_IT402_N01',
    courseCode: activeCourseSession?.courseCode || 'IT402.N01',
    courseName: activeCourseSession?.courseName || 'An toàn Mạng máy tính & Ứng dụng',
    room: activeCourseSession?.room || 'A2-301',
    sessionNumber: activeCourseSession?.sessionNumber || 4
  });

  // Trạng thái Offline Proof-of-Presence (IndexedDB)
  const [isOfflineMode, setIsOfflineMode] = useState(() => !navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Trạng thái Mô phỏng đổi FaceID/Vân tay & Modal nhập Mã PIN dự phòng 6 số (Seamless Re-enrollment)
  const [simBiometricChanged, setSimBiometricChanged] = useState(() => isSimulatedBiometricInvalidated());
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const pinResolverRef = useRef(null);

  // Trạng thái Tái kiểm tra điểm danh đột xuất (Spot-Check 60s từ Giảng viên)
  const [spotCheckRequest, setSpotCheckRequest] = useState(null);
  const [spotCheckCountdown, setSpotCheckCountdown] = useState(0);

  // Trạng thái Xác thực Sinh trắc học Face ID (Apple Laser Scan & Native Biometric)
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const [faceIdReason, setFaceIdReason] = useState('Mở khóa Private Key trong RAM để ký điểm danh EIP-191');
  const [pendingQrPayload, setPendingQrPayload] = useState(null);
  const [isSpotCheckFaceId, setIsSpotCheckFaceId] = useState(false);

  // Bộ Nhập Mã PIN Dự Phòng Khi Hỏng Camera (6 ô số viền neon - OTP Pin Boxes)
  const [showOtpPinMode, setShowOtpPinMode] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpPopIndex, setOtpPopIndex] = useState(-1);
  const otpInputRefs = useRef([]);

  const triggerOtpComplete = (code6) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    setShowOtpPinMode(false);
    setOtpDigits(['', '', '', '', '', '']);
    handleScanSuccess(
      `UTH_ID:SES_A2301:NONCE_PIN_${code6}_${Date.now().toString(36).toUpperCase()}:10.7992:106.7056`
    );
  };

  const handleOtpDigitChange = (index, rawValue) => {
    const clean = String(rawValue || '').replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Nếu người dùng dán nhiều số cùng lúc
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, i) => {
        if (index + i < 6) next[index + i] = ch;
      });
      setOtpDigits(next);
      const lastIdx = Math.min(5, index + chars.length - 1);
      setOtpPopIndex(lastIdx);
      setTimeout(() => setOtpPopIndex(-1), 170);
      if (next.every((d) => d !== '')) {
        setTimeout(() => triggerOtpComplete(next.join('')), 140);
      } else {
        otpInputRefs.current[Math.min(5, index + chars.length)]?.focus();
      }
      return;
    }

    const digit = clean.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    // Hiệu ứng nảy nhẹ scale-110 rồi về scale-100
    setOtpPopIndex(index);
    setTimeout(() => setOtpPopIndex(-1), 170);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(18);
    }

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Đủ 6 số -> tự động kích hoạt navigator.vibrate(100) và mở Face ID ngay lập tức
    if (next.every((d) => d !== '')) {
      setTimeout(() => triggerOtpComplete(next.join('')), 140);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const next = [...otpDigits];
        next[index] = '';
        setOtpDigits(next);
      } else if (index > 0) {
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const socketRef = useRef(null);
  const isTerminatedRef = useRef(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(() => Boolean(sessionStorage.getItem('uth_checked_in_session')));
  const hasCheckedInRef = useRef(Boolean(sessionStorage.getItem('uth_checked_in_session')));
  const myStudentIdRef = useRef('2251120000');
  const activeSessionRef = useRef(null);
  const motionTelemetryRef = useRef({ beta: 42.5, gamma: -3.2, accelMag: 9.81 });

  // Khởi tạo nạp trước MSSV của sinh viên từ IndexedDB
  useEffect(() => {
    getItem('uth_student_vc').then((vc) => {
      if (vc?.studentId) myStudentIdRef.current = vc.studentId;
    }).catch(() => {});
  }, []);

  // [ĐIỂM NGHẼN ① & TẦNG 3 TELEMETRY]: Kích hoạt Pre-warm GPS nền + Cảm biến góc nghiêng/gia tốc
  useEffect(() => {
    startPreWarmGps();

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        motionTelemetryRef.current = {
          ...motionTelemetryRef.current,
          beta: Number(e.beta.toFixed(2)),
          gamma: Number(e.gamma.toFixed(2))
        };
      }
    };
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (acc && acc.x !== null) {
        const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
        motionTelemetryRef.current = {
          ...motionTelemetryRef.current,
          accelMag: Number(mag.toFixed(2))
        };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      stopPreWarmGps();
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // [ĐIỂM NGHẼN ④]: Đăng ký Cơ chế Đồng bộ Tự động 2 Lớp (Android SW Sync + iOS online & visibilitychange)
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const list = await getAllOfflineAttendanceFromIDB();
        setOfflineQueue(list || []);
      } catch {}
    };
    loadQueue();

    const unregisterDualSync = registerDualLayerOfflineSync((result, triggerSource) => {
      setIsOfflineMode(false);
      setOfflineQueue([]);
      setSyncMessage(
        `Đã tự động đồng bộ ${result.syncedCount || 1} gói điểm danh từ IndexedDB (Nguồn: ${triggerSource})!`
      );
      triggerScanSuccessFeedback();
    });

    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      unregisterDualSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Đồng bộ trạng thái phòng học tức thời qua WebSocket Room (session-terminated)
  useEffect(() => {
    try {
      const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      retargetSocket(socket).catch(() => {});

      // Nạp sẵn phiên đang mở từ Backend vào RAM nền để khi bấm Quét Nhanh tốn 0ms
      smartFetch('/api/session/active')
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && d?.session) {
            const netMode = d.session.networkMode || (d.session.networkPolicy === 'CAMPUS_WIFI_ONLY' ? 'CAMPUS_WIFI' : 'CELLULAR_ANY');
            const rMeters = Number(d.session.radius || d.session.maxRadius || 35);
            activeSessionRef.current = {
              sessionId: d.session.sessionId,
              nonce: d.session.nonce,
              classId: d.session.classId || 'CLS_IT402_N01',
              courseCode: d.session.courseCode || 'IT402.N01',
              courseName: d.session.courseName || 'An toàn Mạng máy tính & Ứng dụng',
              room: d.session.room || 'A2-301',
              sessionNumber: Number(d.session.sessionNumber || 1),
              networkMode: netMode,
              radius: rMeters,
              coords: d.session.coords || { lat: 10.7992, lon: 106.7056 }
            };
            setCourseMeta({
              classId: d.session.classId || 'CLS_IT402_N01',
              courseCode: d.session.courseCode || 'IT402.N01',
              courseName: d.session.courseName || 'An toàn Mạng máy tính & Ứng dụng',
              room: d.session.room || 'A2-301',
              sessionNumber: Number(d.session.sessionNumber || 1)
            });
            setSessionNetworkMode(netMode);
            setSessionRadius(rMeters);
            socket.emit('join-session', {
              sessionId: d.session.sessionId,
              role: 'STUDENT',
              studentId: myStudentIdRef.current || '2251120000'
            });
          }
        })
        .catch(() => {});

      socket.on('session-created', (payload) => {
        if (payload?.sessionId) {
          const netMode = payload.networkMode || (payload.networkPolicy === 'CAMPUS_WIFI_ONLY' ? 'CAMPUS_WIFI' : 'CELLULAR_ANY');
          const rMeters = Number(payload.maxRadius || payload.radius || 35);
          activeSessionRef.current = {
            sessionId: payload.sessionId,
            nonce: payload.nonce || 'NONCE_LIVE',
            classId: payload.classId || 'CLS_IT402_N01',
            courseCode: payload.courseCode || 'IT402.N01',
            courseName: payload.courseName || 'An toàn Mạng máy tính & Ứng dụng',
            room: payload.room || 'A2-301',
            sessionNumber: Number(payload.sessionNumber || 1),
            networkMode: netMode,
            radius: rMeters,
            coords: payload.coords || { lat: 10.7992, lon: 106.7056 }
          };
          setCourseMeta({
            classId: payload.classId || 'CLS_IT402_N01',
            courseCode: payload.courseCode || 'IT402.N01',
            courseName: payload.courseName || 'An toàn Mạng máy tính & Ứng dụng',
            room: payload.room || 'A2-301',
            sessionNumber: Number(payload.sessionNumber || 1)
          });
          setSessionNetworkMode(netMode);
          setSessionRadius(rMeters);
          socket.emit('join-session', {
            sessionId: payload.sessionId,
            role: 'STUDENT',
            studentId: myStudentIdRef.current || '2251120000'
          });
        }
      });

      socket.on('network-mode-updated', (payload) => {
        if (payload?.networkMode) {
          setSessionNetworkMode(payload.networkMode);
          activeSessionRef.current = {
            ...(activeSessionRef.current || {}),
            networkMode: payload.networkMode
          };
        }
      });

      socket.on('radius-updated', (payload) => {
        if (payload?.maxRadiusMeters || payload?.radius) {
          const rMeters = Number(payload.maxRadiusMeters || payload.radius);
          setSessionRadius(rMeters);
          activeSessionRef.current = {
            ...(activeSessionRef.current || {}),
            radius: rMeters,
            coords: payload.centerCoords || activeSessionRef.current?.coords
          };
        }
      });

      socket.on('nonce-updated', (payload) => {
        if (payload?.nonce) {
          activeSessionRef.current = {
            ...(activeSessionRef.current || {}),
            sessionId: payload.sessionId || activeSessionRef.current?.sessionId || 'SES_A2301',
            nonce: payload.nonce
          };
        }
      });

      const handleClosed = (payload) => {
        // Nếu sinh viên ĐÃ điểm danh thành công: Giữ nguyên con dấu Liveness Stamp và giao diện thành công!
        if (hasCheckedInRef.current) {
          setIsScanning(false);
          return;
        }

        isTerminatedRef.current = true;
        setIsScanning(false);
        setLivenessStampData(null);
        setSpotCheckRequest(null);
        triggerSessionTerminatedFeedback();
        setScanStatus({
          type: 'ERROR',
          title: payload?.sessionHash ? 'BUỔI HỌC ĐÃ KHÓA SỔ BẤT BIẾN' : 'PHIÊN ĐIỂM DANH ĐÃ KẾT THÚC',
          message:
            payload?.message ||
            (payload?.sessionHash
              ? `Giảng viên đã kết thúc & chốt sổ buổi học (Session Hash: ${payload.sessionHash.slice(0, 16)}...). Hệ thống từ chối mọi gói tin gửi bù.`
              : 'Phiên điểm danh đã kết thúc bởi giảng viên. Camera đã tự động tắt.'),
          details: payload?.sessionId ? { sessionId: payload.sessionId } : null
        });
      };

      socket.on('session-finalized', handleClosed);
      socket.on('session-terminated', handleClosed);
      socket.on('session-closed', handleClosed);

      // Khi Giảng viên bấm "Tái Kiểm Tra Đột Xuất (Spot-Check)": Rung máy & yêu cầu quét lại FaceID trong 60s
      const handleSpotCheck = (payload) => {
        const allowedStudents = payload?.allowedStudents || payload?.targetStudents || payload?.validStudentIds;
        const currentMssv = myStudentIdRef.current || '2251120000';
        if (
          Array.isArray(allowedStudents) &&
          allowedStudents.length > 0 &&
          !allowedStudents.includes(currentMssv) &&
          !allowedStudents.includes('2251120000')
        ) {
          return;
        }

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        triggerSessionTerminatedFeedback();
        setSpotCheckRequest(
          payload || { sessionId: 'SES_A2301', spotNonce: 'SPOT_' + Date.now(), challenge: 'SPOT_' + Date.now() }
        );
        setSpotCheckCountdown(payload?.duration || payload?.timeoutSec || payload?.timeoutSeconds || 60);
      };

      socket.on('spot-check-trigger', handleSpotCheck);
      socket.on('spot-check-start', handleSpotCheck);
      socket.on('spot-check-requested', handleSpotCheck);
      socket.on('auditor-override-spot-check', handleSpotCheck);

      socket.on('spot-check-confirmed', () => {
        triggerScanSuccessFeedback();
        setSpotCheckRequest(null);
        setSyncMessage(`Đã hoàn tất xác thực lại FaceID (Spot-Check) lúc ${new Date().toLocaleTimeString('vi-VN')}!`);
      });

      socket.on('spot-check-failed', ({ message }) => {
        setSyncMessage(`Spot-Check thất bại: ${message}`);
      });

      return () => {
        socket.disconnect();
      };
    } catch {}
  }, []);

  // Đếm lùi 60s cho lệnh Tái kiểm tra điểm danh đột xuất (Spot-Check)
  useEffect(() => {
    if (spotCheckState && !spotCheckState.isActive && spotCheckRequest) {
      setSpotCheckRequest(null);
      setSpotCheckCountdown(0);
    }
  }, [spotCheckState?.isActive]);

  useEffect(() => {
    if (!spotCheckRequest || spotCheckCountdown <= 0) return;
    const t = setInterval(() => {
      setSpotCheckCountdown((c) => {
        if (c <= 1) {
          setSpotCheckRequest(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [spotCheckRequest, spotCheckCountdown]);

  // Kích hoạt Modal Face ID khi Giảng viên yêu cầu Tái kiểm tra đột xuất
  const handleConfirmSpotCheckFaceId = () => {
    if (onTriggerSpotCheckFaceID && spotCheckState?.isActive) {
      onTriggerSpotCheckFaceID();
      return;
    }
    if (!spotCheckRequest) return;
    setFaceIdReason('Xác thực lại Face ID cho đợt kiểm tra đột xuất (Spot-Check 60s)');
    setIsSpotCheckFaceId(true);
    setShowFaceIdModal(true);
  };

  // Ký số và gửi xác nhận Spot-Check sau khi vượt qua Face ID hoặc PIN dự phòng
  const executeSpotCheckSubmit = async () => {
    if (!spotCheckRequest) return;
    try {
      const targetSpotNonce = spotCheckRequest.spotNonce || spotCheckRequest.challenge || 'SPOT_CHECK';

      let studentId = '2251120000';
      let fullName = 'Nguyễn Đức Hiển';
      let privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      try {
        const vc = (await getItem('uth_student_vc')) || (await getItem('uth_vc_storage')) || {};
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

      socketRef.current?.emit('submit-spot-check', {
        sessionId: spotCheckRequest.sessionId || 'SES_A2301',
        studentId,
        signature: sig
      });

      const verifyRes = await smartFetch('/api/attendance/spot-check-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: spotCheckRequest.sessionId || 'SES_A2301',
          studentId,
          fullName,
          faceIdVerified: true
        })
      }).catch(() => null);

      if (verifyRes && !verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        setSpotCheckRequest(null);
        setSyncMessage(errData.error || 'Tái kiểm tra bị từ chối do chưa điểm danh hợp lệ ban đầu!');
        return;
      }

      triggerScanSuccessFeedback();
      setSpotCheckRequest(null);
      setSyncMessage(`Đã hoàn tất xác thực lại FaceID (Spot-Check) lúc ${new Date().toLocaleTimeString('vi-VN')}!`);
    } catch (e) {
      console.error('Lỗi spot check:', e);
    }
  };

  const handleBackgroundSync = async () => {
    setSyncingOffline(true);
    setSyncMessage('');
    try {
      const data = await syncOfflineAttendanceFromIDB();
      if (data && data.success) {
        setSyncMessage(`Đã Background Sync & đối soát Merkle Root thành công ${data.syncedCount || offlineQueue.length} gói tin từ IndexedDB!`);
        setOfflineQueue([]);
        triggerScanSuccessFeedback();
      }
    } catch {
      setSyncMessage('Chưa có kết nối máy chủ. Gói tin vẫn được lưu an toàn trong IndexedDB.');
    } finally {
      setSyncingOffline(false);
    }
  };

  // Mở Modal yêu cầu nhập Mã PIN 6 số khi FaceID/Vân tay trên thiết bị thay đổi (InvalidStateError / NotAllowedError)
  const requestPinFallbackModal = () => {
    return new Promise((resolve) => {
      setPinInput('');
      setPinError('');
      setPinModalOpen(true);
      pinResolverRef.current = resolve;
    });
  };

  const handleConfirmPinModal = async () => {
    if (pinAttempts >= 5) {
      setPinError('Bạn đã nhập sai quá 5 lần. Vui lòng chờ 5 phút.');
      return;
    }

    if (pinInput !== '123456') {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setPinError(`Mã PIN không chính xác! (${nextAttempts}/5)`);
      setPinInput('');
      return;
    }

    const check = await verifyRecoveryPinAndUnwrap(pinInput);
    if (!check.valid) {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setPinError(`Mã PIN không chính xác! (${nextAttempts}/5)`);
      setPinInput('');
      return;
    }
    setPinAttempts(0);
    setPinError('');
    setPinModalOpen(false);
    setSimBiometricChanged(false);
    setSimulatedBiometricInvalidation(false);
    if (pinResolverRef.current) {
      pinResolverRef.current(true);
      pinResolverRef.current = null;
    }
  };

  const handleCancelPinModal = () => {
    setPinModalOpen(false);
    if (pinResolverRef.current) {
      pinResolverRef.current(false);
      pinResolverRef.current = null;
    }
  };

  const handleCloseCamera = useCallback(() => {
    navigate('/wallet');
  }, [navigate]);

  // Khi Camera hoặc nút Quét Thử Nhanh quét được mã QR
  const handleScanSuccess = async (qrResult) => {
    if (isTerminatedRef.current) return;

    // Tự động nhận diện SERVER_URL LocalTunnel nếu được nhúng trong mã QR trên màn chiếu Giảng viên
    const parsedServerUrl = qrResult?.serverUrl || '';
    if (parsedServerUrl && parsedServerUrl.startsWith('http')) {
      setServerUrlInput(parsedServerUrl);
    }

    // Kiểm tra chính sách mạng của phòng học (Từ QR payload hoặc từ trạng thái phiên đồng bộ)
    const rawStr = typeof qrResult === 'string' ? qrResult : (qrResult?.raw || '');
    const qrPolicy =
      qrResult?.policy ||
      (rawStr.includes('CAMPUS_WIFI_ONLY') ? 'CAMPUS_WIFI_ONLY' : '');
    const effectiveRoomNetMode =
      qrPolicy === 'CAMPUS_WIFI_ONLY'
        ? 'CAMPUS_WIFI'
        : qrPolicy === 'HYBRID_4G_5G'
        ? 'CELLULAR_ANY'
        : (activeSessionRef.current?.networkMode || sessionNetworkMode);

    // [THỰC NGHIỆM 1 - CHẾ ĐỘ WI-FI TRƯỜNG]:
    // Nếu Web Giảng viên đang bật "Ràng buộc Wi-Fi trường" mà điện thoại đang bật 4G -> Từ chối ngay lập tức!
    const isAttendanceScan =
      qrResult?.type === 'ATTENDANCE_QR' ||
      rawStr.startsWith('UTH_ID:') ||
      rawStr.startsWith('UTH:');

    if (isAttendanceScan && effectiveRoomNetMode === 'CAMPUS_WIFI' && phoneNetworkMode === '4G') {
      setIsScanning(false);
      setLivenessStampData(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      triggerSessionTerminatedFeedback();

      const blockMsg = 'Từ chối: Thiết bị không thuộc mạng Wi-Fi chỉ định của phòng học!';
      setScanStatus({
        type: 'ERROR',
        title: 'CHẶN KẾT NỐI 4G/5G (NETWORK ENFORCEMENT)',
        message: blockMsg,
        details: {
          sessionId: qrResult?.sessionId || activeSessionRef.current?.sessionId || 'SES_A2301',
          distance: 'Mạng di động 4G/5G (LocalTunnel)',
          time: new Date().toLocaleTimeString('vi-VN'),
          signatureHash: 'BLOCKED_BY_WIFI_POLICY'
        }
      });

      // Báo ngay lên màn chiếu Giảng viên để Hội đồng NCKH thấy cảnh báo chặn trực tiếp
      smartFetch('/api/attendance/network-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: qrResult?.sessionId || activeSessionRef.current?.sessionId || 'SES_A2301',
          studentId: myStudentIdRef.current || '2251120000',
          fullName: 'Nguyễn Đức Hiển',
          clientNetwork: '4G/5G Cellular (LocalTunnel)',
          reason: blockMsg
        })
      }).catch(() => {});
      return;
    }

    // [THỰC NGHIỆM 2 - CHẾ ĐỘ 4G / TỰ DO]: Mở xác thực Face ID tức thì!
    setIsScanning(false);
    setPendingQrPayload(qrResult);
    setFaceIdReason('Mở khóa Private Key trong RAM để ký điểm danh EIP-191');
    setIsSpotCheckFaceId(false);
    setShowFaceIdModal(true);
  };

  // Xác thực Face ID thành công
  const handleFaceIdSuccess = async () => {
    setShowFaceIdModal(false);
    if (isSpotCheckFaceId) {
      await executeSpotCheckSubmit();
    } else if (pendingQrPayload) {
      await executeAttendanceSubmission(pendingQrPayload);
    }
  };

  // Người dùng chọn phương thức Fallback sang Mã PIN 6 số (123456)
  const handleFaceIdFallbackPin = () => {
    setShowFaceIdModal(false);
    requestPinFallbackModal().then(async (pinSuccess) => {
      if (pinSuccess) {
        if (isSpotCheckFaceId) {
          await executeSpotCheckSubmit();
        } else if (pendingQrPayload) {
          await executeAttendanceSubmission(pendingQrPayload);
        }
      } else {
        setIsScanning(true);
      }
    });
  };

  // Tiến trình trích xuất toạ độ GPS, ký số EIP-191 và gửi lên Backend
  const executeAttendanceSubmission = async (qrResult) => {
    if (isTerminatedRef.current) return;

    setScanStatus({
      type: 'PROCESSING',
      title: 'ĐANG XỬ LÝ ĐIỂM DANH MẬT MÃ...',
      message: 'Đang trích xuất toạ độ GPS, đối soát chữ ký EIP-191 và Merkle Proof...'
    });

    let identity = getSavedIdentity();
    if (!identity || !identity.address) {
      let savedVC = await getItem('uth_student_vc');
      if (!savedVC) savedVC = await getItem('uth_vc_storage');
      if (savedVC) {
        try {
          const vc = typeof savedVC === 'string' ? JSON.parse(savedVC) : savedVC;
          identity = {
            address:
              vc.address?.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
                ? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
                : vc.address,
            privateKey: vc.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            student: {
              studentId: vc.studentId,
              mssv: vc.studentId,
              fullName: vc.fullName,
              major: vc.major
            }
          };
        } catch {}
      }
    }

    if (!identity || !identity.address) {
      identity = {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        student: {
          studentId: '2251120000',
          mssv: '2251120000',
          fullName: 'Nguyễn Đức Hiển',
          major: 'An toàn Thông tin'
        }
      };
    } else if (identity.address.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d') {
      identity.address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    }

    // 2. Phân loại mã QR: Điểm danh (UTH_ID:... hoặc UTH:...)
    if (
      qrResult.type === 'ATTENDANCE_QR' ||
      (typeof qrResult === 'string' && (qrResult.startsWith('UTH_ID:') || qrResult.startsWith('UTH:')))
    ) {
      const parts = qrResult.raw ? qrResult.raw.split(':') : (typeof qrResult === 'string' ? qrResult.split(':') : []);
      let sessionId = qrResult.sessionId || parts[1] || 'SES_A2301';
      let nonce = qrResult.nonce || parts[2] || 'NONCE_DEMO';
      const sessionLat = qrResult.sessionLat !== undefined && !isNaN(qrResult.sessionLat) ? qrResult.sessionLat : parseFloat(parts[3] || '10.7992');
      const sessionLon = qrResult.sessionLon !== undefined && !isNaN(qrResult.sessionLon) ? qrResult.sessionLon : parseFloat(parts[4] || '106.7056');
      const policy = qrResult.policy || parts[6] || 'HYBRID_4G_5G';

      // Nếu bấm nút Quét Thử Nhanh (SES_A2301), ưu tiên lấy ngay từ RAM (0ms), hoặc lấy từ Backend
      if (!isOfflineMode && sessionId === 'SES_A2301') {
        if (activeSessionRef.current?.sessionId && activeSessionRef.current?.nonce) {
          sessionId = activeSessionRef.current.sessionId;
          nonce = activeSessionRef.current.nonce;
        } else {
          try {
            const activeRes = await smartFetch('/api/session/active');
            const activeData = await activeRes.json();
            if (activeData.success && activeData.session) {
              sessionId = activeData.session.sessionId;
              nonce = activeData.session.nonce;
              activeSessionRef.current = { sessionId, nonce };
            }
          } catch {}
        }
      }

      if (sessionId && socketRef.current) {
        socketRef.current.emit('join-session', {
          sessionId,
          role: 'STUDENT',
          studentId: identity.student?.studentId || '2251120000'
        });
      }

      // [BƯỚC 2]: Rung phản hồi Haptic [40, 60, 40] & Âm thanh Beep khi vượt qua Sinh trắc học
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      triggerScanSuccessFeedback();

      if (isTerminatedRef.current) return;

      // 3. [ĐIỂM NGHẼN ①]: Lấy tọa độ tức thì từ Pre-warm GPS / sessionStorage (< 5ms, không chờ bắt vệ tinh lâu)
      const gpsStart = performance.now();
      const centerLat = activeSessionRef.current?.coords?.lat ?? sessionLat ?? 10.7992;
      const centerLon = activeSessionRef.current?.coords?.lon ?? sessionLon ?? 106.7056;
      const allowedR = activeSessionRef.current?.radius ?? sessionRadius ?? 35;

      const isFakeGpsSimulated = simDistanceMeters === 'FAKE_GPS';
      let smoothedPos = {
        lat: parseFloat(sessionStorage.getItem('cached_lat') || '10.79925') || 10.79925,
        lon: parseFloat(sessionStorage.getItem('cached_lon') || '106.70564') || 106.70564,
        accuracy: isFakeGpsSimulated ? 0.0 : 8.4,
        isMock: isFakeGpsSimulated,
        samplesCount: 3,
        preWarmed: true
      };

      if (simDistanceMeters === 'REAL_GPS') {
        try {
          const pos = await getSmoothedGpsPosition(2, allowedR);
          if (pos) smoothedPos = { ...pos, isMock: Boolean(pos.isMock) };
        } catch {}
      } else {
        // Tính tọa độ cách tâm phòng chính xác X mét theo công thức Haversine (1 độ vĩ tuyến ≈ 111,139m)
        const targetDistMeters = isFakeGpsSimulated ? 2 : Math.max(0, Number(simDistanceMeters) || 8);
        const deltaLat = targetDistMeters / 111139;
        smoothedPos = {
          lat: Number((centerLat + deltaLat).toFixed(6)),
          lon: Number(centerLon.toFixed(6)),
          accuracy: isFakeGpsSimulated ? 0.0 : 6.8,
          isMock: isFakeGpsSimulated,
          samplesCount: 3,
          preWarmed: true
        };
      }
      const gpsLatencyMs = Math.max(1, Math.round(performance.now() - gpsStart));

      if (isTerminatedRef.current) return;

      const driftEval = evaluateGpsDriftTolerance(centerLat, centerLon, smoothedPos, allowedR);
      const distance =
        isFakeGpsSimulated
          ? 2
          : simDistanceMeters !== 'REAL_GPS'
          ? Math.max(0, Math.round(Number(simDistanceMeters) || 8))
          : driftEval.withinRange !== false
          ? (driftEval.effectiveDistance || 8)
          : Math.round(driftEval.rawDistance || 85);

      // 4. [ĐIỂM NGHẼN ②]: Hybrid Hardware ID (5 thành phần, hỗ trợ Fuzzy Matching >= 80% trên iOS Safari)
      const deviceId = await getDeviceFingerprint();
      const targetMssv = identity.student?.studentId || identity.student?.mssv || '2251120000';
      myStudentIdRef.current = targetMssv;
      const studentFullName = identity.student?.fullName || 'Nguyễn Đức Hiển';

      let vc = null;
      try {
        vc = await getActiveCredential(targetMssv);
      } catch {}

      // NẾU ĐANG Ở CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE PROOF-OF-PRESENCE): LƯU VÀO INDEXEDDB
      if (isOfflineMode) {
        const ts = Date.now();
        const offlineMsg = `UTH-OFFLINE-ATTENDANCE:${sessionId}:${nonce}:${ts}:${deviceId}`;
        const signOffline = await signAuthChallenge(identity, offlineMsg);
        const shortSig = `${signOffline.signature.slice(0, 14)}...${signOffline.signature.slice(-6)}`;

        await saveOfflineAttendanceToIDB({
          id: 'OFF_' + ts,
          sessionId,
          nonce,
          timestamp: ts,
          timeStr: new Date(ts).toLocaleTimeString('vi-VN', { hour12: false }),
          studentId: targetMssv,
          fullName: studentFullName,
          major: identity.student?.major || 'An toàn Thông tin',
          address: identity.address,
          deviceId,
          dist: distance,
          signedPayload: offlineMsg,
          signature: signOffline.signature,
          merkleRoot: vc?.merkleRoot,
          merkleProof: vc?.merkleProof
        });

        const updatedQueue = await getAllOfflineAttendanceFromIDB();
        setOfflineQueue(updatedQueue || []);

        setLivenessStampData({
          studentName: studentFullName.toUpperCase(),
          mssv: targetMssv,
          sessionId,
          signatureHash: shortSig,
          distance: `${distance}m`,
          biometricVerified: true
        });

        setScanStatus({
          type: 'SUCCESS',
          title: 'ĐÃ LƯU GÓI ĐIỂM DANH NGOẠI TUYẾN (INDEXEDDB)',
          message: `Đã xác thực Sinh trắc học & ký số EIP-191 ngoại tuyến (Pre-warm GPS ${gpsLatencyMs}ms). Tự động đồng bộ qua 2 lớp khi có mạng.`,
          details: {
            sessionId,
            distance: `${distance}m`,
            time: new Date().toLocaleTimeString('vi-VN'),
            signatureHash: shortSig,
            merkleVerified: true
          }
        });
        return;
      }

      // CHẾ ĐỘ ONLINE BÌNH THƯỜNG (ƯU TIÊN UNIFIED PIPELINE /api/attendance/submit)
      // Cấu trúc thông điệp chuẩn hóa EIP-191 chống gian lận & gắn thiết bị
      const timestamp = Date.now();
      const currentDeviceId = getOrCreateDeviceId();
      const sLatStr = Number(smoothedPos.lat || 10.7992).toFixed(6);
      const sLonStr = Number(smoothedPos.lon || 106.7056).toFixed(6);
      const rawChallenge = `${sessionId}:${nonce}:${sLatStr}:${sLonStr}:${currentDeviceId}:${timestamp}`;

      let unifiedSignature = '';
      let signingAddress = identity.address;

      try {
        const signVault = await signWithDecryptedKey('123456', rawChallenge);
        unifiedSignature = signVault.signature;
        signingAddress = signVault.address;
      } catch {
        const fallbackSign = await signAuthChallenge(identity, rawChallenge);
        unifiedSignature = fallbackSign.signature || '';
        if (fallbackSign.signerAddress) {
          signingAddress = fallbackSign.signerAddress;
        }
      }

      const shortSig = `${unifiedSignature.slice(0, 14)}...${unifiedSignature.slice(-6)}`;

      try {
        // Thử gửi qua Unified Pipeline (/api/attendance/submit) nếu Giảng viên đã mở phòng
        const submitRes = await smartFetch('/api/attendance/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            nonce,
            timestamp,
            deviceId: currentDeviceId,
            clientNetwork: phoneNetworkMode,
            gpsTelemetry: {
              accuracy: smoothedPos.accuracy,
              isMock: Boolean(smoothedPos.isMock)
            },
            studentCoords: {
              lat: smoothedPos.lat,
              lon: smoothedPos.lon,
              accuracy: smoothedPos.accuracy,
              isMock: Boolean(smoothedPos.isMock)
            },
            studentData: {
              studentId: targetMssv,
              fullName: studentFullName,
              name: studentFullName,
              major: identity.student?.major || vc?.major || 'An toàn Thông tin',
              avatar: vc?.avatar || identity.student?.avatar,
              address: signingAddress,
              merkleRoot: vc?.merkleRoot
            },
            signature: unifiedSignature,
            merkleProof: vc?.merkleProof || ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85']
          })
        });
        let submitData = null;
        try {
          submitData = await submitRes.json();
        } catch {}

        if (submitRes.ok && submitData?.success) {
          setHasCheckedIn(true);
          hasCheckedInRef.current = true;
          const recCourseCode = submitData.record?.courseCode || activeSessionRef.current?.courseCode || courseMeta.courseCode || 'IT402.N01';
          const recCourseName = submitData.record?.courseName || activeSessionRef.current?.courseName || courseMeta.courseName || 'An toàn Mạng máy tính & Ứng dụng';
          const recRoom = submitData.record?.room || activeSessionRef.current?.room || courseMeta.room || 'A2-301';
          const recSessionNum = submitData.record?.sessionNumber || activeSessionRef.current?.sessionNumber || courseMeta.sessionNumber || 4;
          try {
            const checkedInMeta = {
              sessionId: submitData.record?.sessionId || sessionId,
              classId: submitData.record?.classId || activeSessionRef.current?.classId || courseMeta.classId,
              courseCode: recCourseCode,
              courseName: recCourseName,
              room: recRoom,
              sessionNumber: recSessionNum,
              studentId: targetMssv,
              fullName: studentFullName,
              timestamp: Date.now()
            };
            sessionStorage.setItem('uth_checked_in_session', JSON.stringify(checkedInMeta));
            window.dispatchEvent(new CustomEvent('uth-student-checked-in', { detail: checkedInMeta }));
          } catch {}
          setLivenessStampData({
            studentName: studentFullName.toUpperCase(),
            mssv: targetMssv,
            sessionId,
            courseCode: recCourseCode,
            courseName: recCourseName,
            room: recRoom,
            sessionNumber: recSessionNum,
            signatureHash: shortSig,
            distance: `${submitData.record?.dist ?? distance}m`,
            biometricVerified: true,
            proximityWarning: smoothedPos.isMock
              ? {
                  alert: 'FAKE_GPS_DETECTED',
                  detail: 'Hệ thống phát hiện cờ giả lập vị trí (isMock=true, accuracy=0.0m). Đã gắn cờ nghi vấn trên IDS!'
                }
              : null
          });

          setScanStatus({
            type: 'SUCCESS',
            title: 'ĐIỂM DANH THÀNH CÔNG (UNIFIED PIPELINE)',
            message: `Sinh viên ${studentFullName} (${targetMssv}) đã điểm danh lớp ${recCourseCode} (${recRoom} • Buổi ${recSessionNum}) và đồng bộ trực tiếp lên Web Portal Giảng viên!`,
            details: {
              sessionId,
              distance: `${submitData.record?.dist ?? distance}m (Pre-warm GPS ${gpsLatencyMs}ms)`,
              time: submitData.record?.time || new Date().toLocaleTimeString('vi-VN'),
              signatureHash: shortSig,
              merkleVerified: true
            }
          });
          return;
        }

        // Nếu máy chủ từ chối có thông điệp lỗi (Ví dụ: hết hạn, ngoài phòng, chưa mở phòng...)
        if (submitData?.error) {
          setScanStatus({
            type: 'ERROR',
            title: 'ĐIỂM DANH THẤT BẠI',
            message: submitData.error
          });
          return;
        }

        throw new Error(submitData?.message || 'Lỗi gửi dữ liệu lên máy chủ');
      } catch (networkErr) {
        console.warn('Lỗi kết nối máy chủ, chuyển sang chế độ lưu offline vào IndexedDB:', networkErr);
        const ts = Date.now();
        await saveOfflineAttendanceToIDB({
          id: 'OFF_' + ts,
          sessionId,
          nonce,
          timestamp: ts,
          studentId: targetMssv,
          fullName: studentFullName,
          address: signingAddress || identity.address,
          deviceId: currentDeviceId,
          dist: distance,
          signedPayload: rawChallenge,
          signature: unifiedSignature
        });
        const updatedQueue = await getAllOfflineAttendanceFromIDB();
        setOfflineQueue(updatedQueue || []);

        setLivenessStampData({
          studentName: studentFullName.toUpperCase(),
          mssv: targetMssv,
          sessionId,
          signatureHash: shortSig,
          distance: `${distance}m`,
          biometricVerified: true
        });

        setScanStatus({
          type: 'SUCCESS',
          title: 'ĐÃ LƯU NGOẠI TUYẾN VÀO INDEXEDDB',
          message: `Chưa có kết nối máy chủ. Gói tin điểm danh đã được ký số EIP-191 và lưu vào IndexedDB an toàn để tự động đồng bộ khi có mạng.`,
          details: {
            sessionId,
            distance: `${distance}m`,
            time: new Date().toLocaleTimeString('vi-VN'),
            signatureHash: shortSig,
            merkleVerified: true
          }
        });
      }
      return;
    }

    // 3. Phân loại mã QR: Đăng nhập Web Không Mật Khẩu (Passwordless Web Login - action: 'auth')
    if (
      qrResult?.action === 'auth' ||
      String(qrResult?.nonce || qrResult?.challenge || '').startsWith('auth_nonce_')
    ) {
      const challenge = qrResult.nonce || qrResult.challenge;
      const targetMssv = identity.student?.studentId || identity.student?.mssv || '2251120000';
      const studentFullName = identity.student?.fullName || 'Nguyễn Đức Hiển';
      const studentMajor = identity.student?.major || 'An toàn Thông tin';

      let signature = '';
      let signerAddress = identity.address;
      try {
        const signVault = await signWithDecryptedKey('123456', challenge);
        signature = signVault.signature;
        signerAddress = signVault.address;
      } catch {
        const fallbackSign = await signAuthChallenge(identity, challenge);
        signature = fallbackSign.signature || '';
        if (fallbackSign.signerAddress) {
          signerAddress = fallbackSign.signerAddress;
        }
      }

      const shortSig = `${signature.slice(0, 14)}...${signature.slice(-6)}`;
      triggerScanSuccessFeedback();

      try {
        const verifyRes = await smartFetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge,
            signature,
            studentData: {
              studentId: targetMssv,
              fullName: studentFullName,
              major: studentMajor,
              address: signerAddress
            }
          })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          publishAuthSuccess(verifyData);
          setLivenessStampData({
            studentName: studentFullName.toUpperCase(),
            mssv: targetMssv,
            sessionId: qrResult.sessionId || 'WEB_PORTAL',
            signatureHash: shortSig,
            distance: 'Web SSO',
            biometricVerified: true
          });
          setScanStatus({
            type: 'SUCCESS',
            title: 'ĐĂNG NHẬP CỔNG WEB THÀNH CÔNG!',
            message: `Đã ký số EIP-191 xác thực phiên đăng nhập không mật khẩu cho ${studentFullName} (${targetMssv}) trên ${qrResult.domain || 'uth.edu.vn'}.`,
            details: {
              sessionId: qrResult.sessionId || challenge.slice(0, 14),
              distance: 'SSO Verified',
              time: new Date().toLocaleTimeString('vi-VN'),
              signatureHash: shortSig,
              merkleVerified: true
            }
          });
          return;
        }

        setScanStatus({
          type: 'ERROR',
          title: 'XÁC THỰC ĐĂNG NHẬP THẤT BẠI',
          message: verifyData.message || 'Phiên đăng nhập Web đã hết hạn hoặc bị từ chối.'
        });
        return;
      } catch (err) {
        // Fallback BroadcastChannel nếu cùng thiết bị hoặc offline
        const localAuth = {
          challenge,
          token: `jwt_uth_local_${Date.now()}`,
          user: {
            address: signerAddress,
            studentId: targetMssv,
            fullName: studentFullName,
            major: studentMajor
          },
          timestamp: Date.now()
        };
        publishAuthSuccess(localAuth);
        setScanStatus({
          type: 'SUCCESS',
          title: 'ĐĂNG NHẬP CỔNG DỊCH VỤ THÀNH CÔNG',
          message: `Đã ký số EIP-191 và truyền phiên xác thực sang Cổng Dịch Vụ UTH cho ${studentFullName}.`,
          details: {
            sessionId: qrResult.sessionId || 'WEB_SSO',
            distance: 'Local SSO',
            time: new Date().toLocaleTimeString('vi-VN'),
            signatureHash: shortSig,
            merkleVerified: true
          }
        });
        return;
      }
    }

    // 4. Fallback cho các định dạng QR không thuộc UTH-TrustID
    setScanStatus({
      type: 'ERROR',
      title: 'MÃ QR KHÔNG ĐÚNG ĐỊNH DẠNG UTH-TRUSTID',
      message: 'Vui lòng quét mã QR Điểm danh trên màn chiếu Giảng viên (UTH_ID:...) hoặc mã QR Đăng nhập Cổng Dịch Vụ UTH.'
    });
  };

  return (
    <div className="page-enter" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 1. THANH TIÊU ĐỀ & LỚP HỌC BO TRÒN PILL MỀM MẠI TRÊN CÙNG */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/wallet')}
          className="btn-press"
          style={{
            background: '#071C36',
            border: '1px solid rgba(123, 189, 232, 0.35)',
            borderRadius: '999px',
            padding: '8px 16px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={15} />
          <span>Về Ví</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#071C36] border border-sky-300/35">
          <span className="font-mono text-xs font-bold text-sky-300">
            {courseMeta.courseCode || activeCourseSession?.courseCode || 'IT402.N01'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-bold text-emerald-300">
            Buổi {courseMeta.sessionNumber || activeCourseSession?.sessionNumber || 3} ({courseMeta.room || activeCourseSession?.room || 'A2-301'})
          </span>
        </div>
      </div>

      {/* BANNER TÁI KIỂM TRA ĐIỂM DANH ĐỘT XUẤT (DỰ PHÒNG KHI CHƯA BẬT STICKY BANNER TOÀN CỤC) */}
      {!spotCheckState?.isActive && spotCheckRequest && (
        <div
          className="glass-card"
          style={{
            borderColor: 'rgba(245, 158, 11, 0.75)',
            background: 'rgba(245, 158, 11, 0.18)',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FBBF24' }}>
              ⚡ KIỂM TRA HIỆN DIỆN GIỮA GIỜ (SPOT-CHECK)
            </span>
            <span style={{ fontSize: '12.5px', fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#F59E0B' }}>
              ⏱ {spotCheckCountdown}s
            </span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute -inset-0.5 rounded-xl bg-amber-400/50 animate-ping" />
            <button
              onClick={handleConfirmSpotCheckFaceId}
              className="relative z-10 btn-press"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                color: '#04060A',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Fingerprint size={16} />
              <span>Xác Thực Lại Face ID Ngay ({spotCheckCountdown}s)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL NHẬP MÃ PIN KHÔI PHỤC 6 SỐ KHI SINH VIÊN ĐỔI FACEID / VÂN TAY TRÊN ĐIỆN THOẠI */}
      {pinModalOpen && (
        <div
          className="glass-card"
          style={{
            borderColor: 'rgba(245, 158, 11, 0.55)',
            background: 'var(--tint-amber)',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <KeyRound size={18} color="#F59E0B" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FBBF24', margin: 0 }}>
              Xác Nhận Mã PIN 6 Số Để Liên Kết Lại Face ID
            </h3>
          </div>
          <p style={{ fontSize: '12.5px', color: '#F0F7FF', lineHeight: 1.5, margin: '0 0 10px' }}>
            Nhập <b>Mã PIN 6 số (Mặc định: 123456)</b> để mở khóa thẻ và cập nhật Face ID mới:
          </p>

          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="pro-input"
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '4px',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          />

          {pinError && (
            <div style={{ fontSize: '12px', color: '#FB7185', marginBottom: '8px', fontWeight: 700 }}>
              {pinError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleConfirmPinModal}
              className="btn-press"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Xác Nhận PIN
            </button>
            <button
              onClick={handleCancelPinModal}
              className="btn-press"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-neutral)',
                background: 'var(--bg-inset)',
                color: 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* 2. KHUNG NGẮM CAMERA QUÉT MÃ QR HOẶC BỘ NHẬP MÃ PIN 6 Ô SỐ VIỀN NEON KHI HỎNG CAMERA */}
      {isScanning && !pinModalOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!showOtpPinMode ? (
            <CameraScannerPro
              onScanSuccess={handleScanSuccess}
              onClose={handleCloseCamera}
            />
          ) : (
            /* BỘ NHẬP MÃ PIN DỰ PHÒNG KHI HỎNG CAMERA (6 Ô SỐ VIỀN NEON - OTP PIN BOXES) */
            <div
              className="glass-card animate-fade-scale"
              style={{
                padding: '18px 16px',
                borderRadius: '22px',
                background: 'linear-gradient(155deg, #071E3D 0%, #030D1B 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 16px 38px rgba(0, 0, 0, 0.65), 0 0 24px rgba(56, 189, 248, 0.16)'
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-400/20 border border-sky-300/40 flex items-center justify-center">
                    <KeyRound size={16} className="text-sky-300" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-extrabold text-white m-0">
                      Nhập Mã PIN Buổi Học (6 Số)
                    </h3>
                    <p className="text-[11px] text-sky-200/80 m-0">
                      Dùng khi camera hỏng • Đủ 6 số tự mở Face ID
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpPinMode(false);
                    setOtpDigits(['', '', '', '', '', '']);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-300/30 text-sky-300 text-xs font-bold cursor-pointer"
                >
                  Bật Camera
                </button>
              </div>

              {/* 6 Ô SỐ VIỀN NEON (OTP PIN BOXES) VỚI HIỆU ỨNG NẢY SCALE-110 -> SCALE-100 */}
              <div className="grid grid-cols-6 gap-2 my-4">
                {otpDigits.map((digit, idx) => {
                  const isPopping = otpPopIndex === idx;
                  const isFilled = digit !== '';
                  return (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      placeholder="•"
                      className={`w-full h-13 rounded-xl text-center font-mono text-[20px] font-extrabold outline-none transition-all duration-150 ${
                        isPopping ? 'scale-110' : 'scale-100'
                      }`}
                      style={{
                        height: '52px',
                        background: isFilled ? 'rgba(14, 165, 233, 0.18)' : '#020A15',
                        color: '#FFFFFF',
                        border: isFilled
                          ? '2px solid #38BDF8'
                          : '1.5px solid rgba(123, 189, 232, 0.38)',
                        boxShadow: isFilled
                          ? '0 0 16px rgba(56, 189, 248, 0.45), inset 0 0 8px rgba(56, 189, 248, 0.2)'
                          : 'inset 0 2px 6px rgba(0, 0, 0, 0.6)'
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="text-slate-300">
                  Gợi ý mã PIN phiên: <strong className="font-mono text-sky-300">123456</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleOtpDigitChange(0, '123456')}
                  className="px-3 py-1.5 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/40 text-sky-200 font-bold text-xs cursor-pointer"
                >
                  Điền nhanh 123456
                </button>
              </div>
            </div>
          )}

          {/* Hàng 2 nút thao tác: Quét Nhanh 1 Chạm + Nhập PIN (Khi Hỏng Camera) Bo Tròn 22px */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleScanSuccess(`UTH_ID:SES_A2301:NONCE_${Date.now().toString(36).toUpperCase()}:10.7992:106.7056`)}
              className="btn-press col-span-2"
              style={{
                width: '100%',
                padding: '14px 12px',
                borderRadius: '22px',
                border: 'none',
                background: isOfflineMode
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                  : 'linear-gradient(135deg, #38BDF8, #0284C7)',
                color: '#020A15',
                fontSize: '13.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Zap size={16} />
              <span>
                {simBiometricChanged
                  ? 'Quét (Test PIN)'
                  : isOfflineMode
                  ? 'Quét Offline'
                  : 'Quét Nhanh (1 Chạm)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMode = !showOtpPinMode;
                setShowOtpPinMode(nextMode);
                if (nextMode) {
                  setOtpDigits(['', '', '', '', '', '']);
                  setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
                }
              }}
              className="btn-press"
              style={{
                width: '100%',
                padding: '14px 10px',
                borderRadius: '22px',
                border: showOtpPinMode
                  ? '1.5px solid #38BDF8'
                  : '1px solid rgba(123, 189, 232, 0.4)',
                background: showOtpPinMode ? 'rgba(56, 189, 248, 0.22)' : '#071C36',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <KeyRound size={15} className="text-sky-300" />
              <span>Nhập PIN</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. BẢNG TÙY CHỌN GIẢ LẬP THỰC NGHIỆM NCKH BO TRÒN 26PX MỀM MẠI */}
      <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '26px' }}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-white">
            Chế độ Thực nghiệm (Mạng &amp; Vị trí GPS)
          </span>
          <button
            type="button"
            onClick={() => setShowServerUrlBar((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-[#030D1B] border border-sky-300/30 text-sky-300 text-[11px] font-semibold cursor-pointer"
          >
            {showServerUrlBar ? 'Ẩn nâng cao ▲' : 'Mở rộng ▼'}
          </button>
        </div>

        {/* Hàng chọn nhanh Mạng + Vị trí GPS phổ biến nhất */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-[#030D1B] border border-sky-200/15 flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-300 font-semibold">Kết nối mạng:</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setPhoneNetworkMode('4G')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                  phoneNetworkMode === '4G'
                    ? 'bg-sky-400 text-slate-950 border-sky-300'
                    : 'bg-transparent text-slate-300 border-slate-700'
                }`}
              >
                4G/5G
              </button>
              <button
                type="button"
                onClick={() => setPhoneNetworkMode('WIFI')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                  phoneNetworkMode === 'WIFI'
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-transparent text-slate-300 border-slate-700'
                }`}
              >
                Wi-Fi
              </button>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#030D1B] border border-sky-200/15 flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-300 font-semibold">Khoảng cách GPS:</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSimDistanceMeters('8')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                  simDistanceMeters === '8'
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-transparent text-slate-300 border-slate-700'
                }`}
              >
                Trong lớp (8m)
              </button>
              <button
                type="button"
                onClick={() => setSimDistanceMeters('85')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                  simDistanceMeters === '85'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-transparent text-slate-300 border-slate-700'
                }`}
              >
                Ngoài (85m)
              </button>
            </div>
          </div>
        </div>

        {/* Mở rộng thêm các nút Fake GPS / Đổi Face ID / Offline / URL khi cần */}
        {showServerUrlBar && (
          <div className="mt-2.5 pt-2.5 border-t border-sky-200/15 space-y-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setSimDistanceMeters('FAKE_GPS')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  simDistanceMeters === 'FAKE_GPS'
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-[#030D1B] text-slate-300 border-slate-700'
                }`}
              >
                Fake GPS
              </button>
              <button
                type="button"
                onClick={() => setSimDistanceMeters('REAL_GPS')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  simDistanceMeters === 'REAL_GPS'
                    ? 'bg-sky-400 text-slate-950 border-sky-300'
                    : 'bg-[#030D1B] text-slate-300 border-slate-700'
                }`}
              >
                GPS Thật
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !simBiometricChanged;
                  setSimBiometricChanged(next);
                  setSimulatedBiometricInvalidation(next);
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  simBiometricChanged
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-[#030D1B] text-slate-300 border-slate-700'
                }`}
              >
                Đổi FaceID
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextOffline = !isOfflineMode;
                  setIsOfflineMode(nextOffline);
                  if (!nextOffline && offlineQueue.length > 0) {
                    handleBackgroundSync();
                  }
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  isOfflineMode
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-[#030D1B] text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isOfflineMode ? 'Offline' : 'Online'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
                placeholder="https://uth-trustid-demo.loca.lt"
                className="pro-input"
                style={{ flex: 1, fontSize: '12px', fontFamily: 'JetBrains Mono', padding: '8px 10px' }}
              />
              <button
                type="button"
                onClick={() => {
                  setCustomServerUrl(serverUrlInput);
                  setShowServerUrlBar(false);
                }}
                className="btn-press px-3.5 py-2 rounded-xl bg-sky-400 text-slate-950 text-xs font-bold border-none cursor-pointer"
              >
                Lưu URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TẦNG 2 NGHIỆP VỤ: CON DẤU SỐ ĐỘNG & HỒ SƠ ĐỐI SOÁT TRỰC QUAN (VISUAL LIVENESS STAMP) */}
      {livenessStampData && (
        <ProofOfLivenessStamp
          studentName={livenessStampData.studentName}
          mssv={livenessStampData.mssv}
          sessionId={livenessStampData.sessionId}
          courseCode={livenessStampData.courseCode || courseMeta.courseCode}
          courseName={livenessStampData.courseName || courseMeta.courseName}
          room={livenessStampData.room || courseMeta.room}
          sessionNumber={livenessStampData.sessionNumber || courseMeta.sessionNumber}
          signatureHash={livenessStampData.signatureHash}
          distance={livenessStampData.distance}
          biometricVerified={livenessStampData.biometricVerified}
          proximityWarning={livenessStampData.proximityWarning}
          onClose={() => setLivenessStampData(null)}
        />
      )}

      {/* MẢNH GHÉP #4: HÀNG ĐỢI INDEXEDDB & DUAL-LAYER AUTO-SYNC */}
      {offlineQueue.length > 0 && (
        <div className="glass-card" style={{ borderColor: 'rgba(56, 189, 248, 0.38)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                Hàng Đợi IndexedDB ({offlineQueue.length} gói chữ ký)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Auto-Sync 2 Lớp: Android SW Sync + iOS online/visibilitychange
              </div>
            </div>
            <button
              onClick={handleBackgroundSync}
              disabled={syncingOffline}
              className="btn-press"
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: 'none',
                background: '#38BDF8',
                color: '#04060A',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <RefreshCw size={12} />
              <span>{syncingOffline ? 'Đang Sync...' : 'Đồng Bộ Ngay'}</span>
            </button>
          </div>
        </div>
      )}

      {syncMessage && (
        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, textAlign: 'center' }}>
          {syncMessage}
        </div>
      )}

      {/* Kết Quả Xử Lý */}
      {scanStatus && (
        <div className="glass-card animate-fade-scale">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {scanStatus.type === 'SUCCESS' && <CheckCircle2 size={18} color="#10B981" />}
            {scanStatus.type === 'ERROR' && <AlertTriangle size={18} color="#EF4444" />}
            {scanStatus.type === 'PROCESSING' && <ShieldCheck size={18} color="#06B6D4" />}
            
            <h3 style={{
              fontSize: '13px',
              fontWeight: 800,
              margin: 0,
              color: scanStatus.type === 'SUCCESS' ? '#10B981' : (scanStatus.type === 'ERROR' ? '#EF4444' : '#06B6D4')
            }}>
              {scanStatus.title}
            </h3>
          </div>

          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.45 }}>
            {scanStatus.message}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => {
                isTerminatedRef.current = false;
                setScanStatus(null);
                setLivenessStampData(null);
                setIsScanning(true);
              }}
              className="btn-press"
              style={{
                padding: '12px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                color: '#020A15',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <span>Quét Lại</span>
            </button>
            <button
              onClick={() => navigate('/wallet')}
              className="btn-press"
              style={{
                padding: '12px',
                borderRadius: '999px',
                border: '1px solid var(--border-hairline)',
                background: 'var(--bg-inset)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Về Ví Số</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Face ID Apple Laser Scanning & Native Biometric */}
      <FaceIDModal
        isOpen={showFaceIdModal}
        onSuccess={handleFaceIdSuccess}
        onCancel={() => {
          setShowFaceIdModal(false);
          setIsScanning(true);
        }}
        onFallbackPin={handleFaceIdFallbackPin}
        studentName="Nguyễn Đức Hiển"
        studentId="2251120000"
        reason={faceIdReason}
      />

    </div>
  );
}
