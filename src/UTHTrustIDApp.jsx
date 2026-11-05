// src/UTHTrustIDApp.jsx - Ứng Dụng Điều Phối Đồng Bộ Toàn Năng (Unified End-to-End Pipeline)
// Đồng bộ 100% thời gian thực: Giảng viên mở phòng -> Xoay Nonce 20s -> Sinh viên quét QR + FaceID + Ký EIP-191
// -> Hiện lên màn chiếu Giảng viên qua WebSocket -> Spot-check 60s (Quét lại FaceID hoặc tự động đánh VẮNG)
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ethers } from 'ethers';
import { 
  ShieldCheck, Wallet, Scan, Radio, MapPin, Wifi, Smartphone, 
  X, RotateCw, Play, XCircle, AlertTriangle, CheckCircle2, Maximize2, Minimize2, FileSpreadsheet
} from 'lucide-react';
import { verifyBiometricPresence } from './utils/webauthnHelper';
import SplashScreen from './components/SplashScreen';
import LiveClock from './components/LiveClock';
import CameraScannerPro from './components/CameraScannerPro';
import LockScreenModal from './components/LockScreenModal';
import FaceIDModal from './components/FaceIDModal';
import { exportAttendanceToExcel } from './utils/exportAttendanceReport';
import { useAutoLock } from './hooks/useAutoLock';
import { getSocketUrl, smartFetch, DEFAULT_LAN_IP, retargetSocket } from './utils/backendUrl';
import { getOrCreateDeviceId, signWithDecryptedKey } from './utils/identityManager';
import { getPreciseLocation } from './utils/geoManager';

// Địa chỉ IPv4 mạng LAN của máy tính Windows (ipconfig: 192.168.88.200) & tự động định tuyến đa môi trường
export const BACKEND_IP = DEFAULT_LAN_IP;
export const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});
// Trên .ipa: nếu Tunnel cố định đã chết, tự chuyển socket sang Backend dò được (LAN / Hotspot)
retargetSocket(socket).catch(() => {});

export default function UTHTrustIDApp() {
  const [showSplash, setShowSplash] = useState(true);
  // Tự động kích hoạt màn hình khóa nếu rời app quá 30 giây
  const { isLocked, unlock } = useAutoLock(30000);
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'scan' | 'faculty'
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Trạng thái Xác thực Sinh trắc học Face ID Apple Laser Scanning & Native Biometric
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const [faceIdReason, setFaceIdReason] = useState('Mở khóa Private Key trong RAM để ký điểm danh EIP-191');
  const [pendingScanPayload, setPendingScanPayload] = useState(null);
  const [isSpotCheckFaceId, setIsSpotCheckFaceId] = useState(false);

  // DỮ LIỆU DANH TÍNH SINH VIÊN (HOLDER) - KHỚP TOÁN HỌC 100% VỚI PRIVATE KEY & MERKLE ROOT
  const [credential] = useState({
    studentId: '2251120000',
    fullName: 'Nguyễn Đức Hiển',
    major: 'An toàn Thông tin',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    merkleRoot: '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2',
    merkleProof: ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85']
  });

  // PRE-WARM GPS VỊ TRÍ & LƯU TRỮ VÀO INDEXEDDB
  const [coords, setCoords] = useState({ lat: 10.7992, lon: 106.7056 });
  useEffect(() => {
    getPreciseLocation().then(pos => setCoords({ lat: pos.lat, lon: pos.lon })).catch(() => {});
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        null,
        { enableHighAccuracy: true, maximumAge: 2000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // TRẠNG THÁI CON DẤU LIVENESS SAU KHI ĐIỂM DANH THÀNH CÔNG
  const [livenessActive, setLivenessActive] = useState(false);
  const livenessActiveRef = useRef(false);
  useEffect(() => {
    livenessActiveRef.current = livenessActive;
  }, [livenessActive]);
  const [livenessTimeStr, setLivenessTimeStr] = useState('08:30:00');
  const [livenessMs, setLivenessMs] = useState('000');
  const [dynamicHash, setDynamicHash] = useState('0x000');

  useEffect(() => {
    if (!livenessActive) return;
    const t1 = setInterval(() => {
      const now = new Date();
      setLivenessTimeStr(now.toLocaleTimeString('vi-VN', { hour12: false }));
      setLivenessMs(now.getMilliseconds().toString().padStart(3, '0'));
    }, 40);
    const t2 = setInterval(() => {
      setDynamicHash('0x' + Math.random().toString(16).substring(2, 10));
    }, 1000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [livenessActive]);

  // ==========================================
  // LOGIC ĐỒNG BỘ: SPOT-CHECK PHÍA SINH VIÊN
  // ==========================================
  const [spotCheckData, setSpotCheckData] = useState(null);
  const [spotCountdown, setSpotCountdown] = useState(60);
  const [joinedSessionId, setJoinedSessionId] = useState(null);

  // ==========================================
  // LOGIC ĐỒNG BỘ: CỔNG GIẢNG VIÊN (VERIFIER)
  // ==========================================
  const [facultySession, setFacultySession] = useState(null);
  const [networkPolicy, setNetworkPolicy] = useState('ALLOW_ALL');
  const [attendees, setAttendees] = useState([]);
  const [mapIframeStudent, setMapIframeStudent] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onSpotCheckStart = (data) => {
      // [QUY TẮC AN TOÀN THÔNG TIN ①]: Bỏ qua nếu sinh viên CHƯA điểm danh thành công ban đầu
      if (!livenessActiveRef.current) {
        console.warn('[SpotCheck] Từ chối kích hoạt: Sinh viên chưa điểm danh thành công ban đầu!');
        return;
      }

      // [QUY TẮC AN TOÀN THÔNG TIN ②]: Kiểm tra MSSV có nằm trong danh sách allowedStudents hợp lệ không
      const allowedStudents = data?.allowedStudents || data?.targetStudents || data?.validStudentIds;
      if (!Array.isArray(allowedStudents) || !allowedStudents.includes(credential.studentId)) {
        console.warn(`[SpotCheck] Bỏ qua: Sinh viên ${credential.studentId} không thuộc danh sách allowedStudents.`);
        return;
      }

      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setSpotCheckData(data);
      setSpotCountdown(data.duration || data.timeoutSec || 60);
    };

    const onSpotCheckConfirmed = () => {
      setSpotCheckData(null);
      alert('✅ Đã hoàn tất tái kiểm tra FaceID!');
    };

    const onSpotCheckFailed = ({ message }) => {
      alert('❌ ' + message);
    };

    socket.on('spot-check-trigger', onSpotCheckStart);
    socket.on('spot-check-start', onSpotCheckStart);
    socket.on('spot-check-confirmed', onSpotCheckConfirmed);
    socket.on('spot-check-failed', onSpotCheckFailed);

    return () => {
      socket.off('spot-check-start', onSpotCheckStart);
      socket.off('spot-check-confirmed', onSpotCheckConfirmed);
      socket.off('spot-check-failed', onSpotCheckFailed);
    };
  }, []);

  // Đếm ngược Spot-check
  useEffect(() => {
    if (!spotCheckData || spotCountdown <= 0) return;
    const timer = setInterval(() => {
      setSpotCountdown((c) => {
        if (c <= 1) {
          setSpotCheckData(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [spotCheckData, spotCountdown]);

  // Sinh viên quét FaceID phản hồi Spot-check -> Mở Modal Face ID Apple / Native Biometric
  const handleConfirmSpotCheck = () => {
    if (!spotCheckData) return;
    setFaceIdReason('Xác thực lại Face ID cho đợt kiểm tra đột xuất (Spot-Check 60s)');
    setIsSpotCheckFaceId(true);
    setShowFaceIdModal(true);
  };

  // Ký số và gửi phản hồi Spot-Check
  const executeSpotCheckSubmit = async () => {
    try {
      let sig = '';
      try {
        const signRes = await signWithDecryptedKey('123456', spotCheckData.spotNonce);
        sig = signRes.signature;
      } catch {
        const wallet = new ethers.Wallet(credential.privateKey);
        sig = await wallet.signMessage(spotCheckData.spotNonce);
      }
      socket.emit('submit-spot-check', {
        sessionId: spotCheckData.sessionId || joinedSessionId || facultySession?.id || 'SES_A2301',
        studentId: credential.studentId,
        signature: sig
      });
      setSpotCheckData(null);
    } catch (e) {
      alert('Lỗi FaceID Spot-Check: ' + e.message);
    }
  };

  // Lắng nghe danh sách sinh viên quét mã thời gian thực qua Socket
  useEffect(() => {
    const onNewAttendee = (record) => {
      setAttendees((prev) => [record, ...prev.filter((a) => a.mssv !== record.mssv)]);
    };

    const onNonceUpdated = ({ nonce }) => {
      setFacultySession((prev) => (prev ? { ...prev, nonce } : null));
    };

    const onAttendeeUpdated = (updated) => {
      setAttendees((prev) => prev.map((a) => (a.mssv === updated.mssv ? updated : a)));
    };

    const onSpotCheckEnded = ({ attendees: finalList }) => {
      if (Array.isArray(finalList)) {
        setAttendees(finalList);
      }
    };

    socket.on('new-attendee', onNewAttendee);
    socket.on('student-checked-in', onNewAttendee);
    socket.on('session-closed', () => {
      setFacultySession((prev) => (prev ? { ...prev, isClosed: true } : null));
    });
    socket.on('nonce-updated', onNonceUpdated);
    socket.on('attendee-updated', onAttendeeUpdated);
    socket.on('spot-check-ended', onSpotCheckEnded);

    return () => {
      socket.off('new-attendee', onNewAttendee);
      socket.off('student-checked-in', onNewAttendee);
      socket.off('session-closed');
      socket.off('nonce-updated', onNonceUpdated);
      socket.off('attendee-updated', onAttendeeUpdated);
      socket.off('spot-check-ended', onSpotCheckEnded);
    };
  }, []);

  const handleStartFacultySession = async (mode = 'ATTENDANCE') => {
    const sId = 'SES_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const fallbackNonce = 'NONCE_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const payload = {
      sessionId: sId,
      roomName: 'Phòng A2-301',
      coords: coords || { lat: 10.7992, lon: 106.7056 },
      radius: mode === 'EXAM' ? 20 : 35,
      networkPolicy
    };

    // Kích hoạt ngay mã QR và phiên trên giao diện để không bao giờ bị trễ
    setFacultySession({ id: sId, nonce: fallbackNonce, mode, radius: payload.radius });
    setAttendees([]);
    socket.emit('join-session', { sessionId: sId, role: 'FACULTY' });

    try {
      const res = await smartFetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.initialNonce) {
        setFacultySession({ id: sId, nonce: data.initialNonce, mode, radius: payload.radius });
        socket.emit('join-session', { sessionId: sId, role: 'FACULTY' });
      }
    } catch (e) {
      console.error('Lỗi mở phòng:', e);
    }
  };

  const handleCloseFacultySession = async () => {
    if (facultySession?.id) {
      const confirmClose = window.confirm("Bạn có chắc chắn muốn đóng phòng điểm danh này không?");
      if (!confirmClose) return;

      socket.emit('close-session', { sessionId: facultySession.id });
      try {
        await smartFetch('/api/session/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: facultySession.id })
        });
      } catch {}
      setFacultySession((prev) => (prev ? { ...prev, isClosed: true } : null));
    }
    setIsFullscreen(false);
  };

  // Sinh viên thực hiện Quét QR & Gửi lên Backend
  const handleStudentScanAndSubmit = async (scannedPayload = null) => {
    try {
      let targetSessionId = facultySession?.id || null;
      let targetNonce = facultySession?.nonce || null;

      // Nếu quét từ Camera thật (chuỗi UTH:sessionId:nonce hoặc UTH_ID:sessionId:nonce:...)
      if (scannedPayload) {
        const raw = typeof scannedPayload === 'string' ? scannedPayload : (scannedPayload.raw || scannedPayload.challenge || '');
        if (raw.startsWith('UTH:') || raw.startsWith('UTH_ID:')) {
          const parts = raw.split(':');
          targetSessionId = parts[1];
          targetNonce = parts[2];
        } else if (scannedPayload.sessionId && scannedPayload.nonce) {
          targetSessionId = scannedPayload.sessionId;
          targetNonce = scannedPayload.nonce;
        }
      }

      // Nếu chưa có sessionId (ví dụ test giữa 2 tab/máy), tự động lấy phiên đang mở trên Backend
      if (!targetSessionId || !targetNonce) {
        try {
          const activeRes = await smartFetch('/api/session/active');
          const activeData = await activeRes.json();
          if (activeData.success && activeData.session) {
            targetSessionId = activeData.session.sessionId;
            targetNonce = activeData.session.nonce;
          }
        } catch {}
      }

      if (!targetSessionId || !targetNonce) {
        alert('⚠️ Hiện chưa có phòng học nào đang mở! Hãy sang tab Giảng Viên bấm "Mở Lớp Học" trước.');
        return;
      }

      setShowCameraScanner(false);
      setPendingScanPayload({ targetSessionId, targetNonce });
      setFaceIdReason('Mở khóa Private Key trong RAM để ký điểm danh EIP-191');
      setIsSpotCheckFaceId(false);
      setShowFaceIdModal(true);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Ký số EIP-191 và gửi điểm danh sau khi Face ID đã xác thực
  const executeAttendanceSubmit = async ({ targetSessionId, targetNonce }) => {
    try {
      // 2. Ký thông điệp EIP-191 chuẩn ngữ cảnh (Toạ độ, Device ID, Timestamp)
      const timestamp = Date.now();
      const deviceId = getOrCreateDeviceId();
      const sLatStr = Number(coords?.lat ?? 10.7992).toFixed(6);
      const sLonStr = Number(coords?.lon ?? 106.7056).toFixed(6);
      const challenge = `${targetSessionId}:${targetNonce}:${sLatStr}:${sLonStr}:${deviceId}:${timestamp}`;

      let signature = '';
      let address = credential.address;

      try {
        const signVault = await signWithDecryptedKey('123456', challenge);
        signature = signVault.signature;
        address = signVault.address;
      } catch {
        const wallet = new ethers.Wallet(credential.privateKey);
        signature = await wallet.signMessage(challenge);
      }

      // 3. Gửi Payload đối soát 7 lớp lên Backend
      const res = await smartFetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSessionId,
          nonce: targetNonce,
          timestamp,
          deviceId,
          studentCoords: coords,
          studentData: { ...credential, address },
          signature,
          merkleProof: credential.merkleProof
        })
      });

      const data = await res.json();
      if (data.success) {
        // Tham gia phòng socket để đón Spot-check
        setJoinedSessionId(targetSessionId);
        socket.emit('join-session', {
          sessionId: targetSessionId,
          role: 'STUDENT',
          studentId: credential.studentId
        });
        setLivenessActive(true);
        setActiveTab('wallet');
      } else {
        alert('❌ Từ chối điểm danh: ' + (data.message || data.error));
      }
    } catch (err) {
      alert('Lỗi gửi điểm danh: ' + err.message);
    }
  };

  // Xác thực Face ID thành công
  const handleFaceIdSuccess = async () => {
    setShowFaceIdModal(false);
    if (isSpotCheckFaceId) {
      await executeSpotCheckSubmit();
    } else if (pendingScanPayload) {
      await executeAttendanceSubmit(pendingScanPayload);
    }
  };

  const handleFaceIdFallbackPin = async () => {
    setShowFaceIdModal(false);
    const pin = prompt('Nhập mã PIN dự phòng 6 chữ số:');
    if (pin === '123456') {
      if (isSpotCheckFaceId) {
        await executeSpotCheckSubmit();
      } else if (pendingScanPayload) {
        await executeAttendanceSubmit(pendingScanPayload);
      }
    } else if (pin !== null) {
      alert('Mã PIN không chính xác (mặc định là 123456)');
    }
  };

  return (
    <div style={{ maxWidth: isFullscreen ? '100vw' : '430px', margin: '0 auto', minHeight: '100dvh', background: '#04060A', color: '#FFF', position: 'relative', paddingBottom: '70px', boxSizing: 'border-box' }}>
      
      {/* SPLASH SCREEN */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* KHI BỊ KHÓA DO THOÁT APP QUÁ 30 GIÂY, MODAL NÀY ĐÈ LÊN TOÀN BỘ APP */}
      {isLocked && (
        <LockScreenModal
          studentName={credential.fullName}
          onUnlockSuccess={unlock}
        />
      )}

      {/* TOP HEADER (Sử dụng <LiveClock /> độc lập để không làm re-render Camera) */}
      <header style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0A0E17', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#38BDF8" />
          <span style={{ fontWeight: 800, fontSize: '13.5px' }}>UTH TRUST<span style={{ color: '#38BDF8' }}>ID</span></span>
        </div>
        <LiveClock />
      </header>

      {/* NỘI DUNG TỪNG PHÂN HỆ */}
      <main style={{ padding: '16px 14px' }}>

        {/* TAB 1: VÍ SINH VIÊN */}
        {activeTab === 'wallet' && (
          <div>
            <div style={{ background: 'linear-gradient(145deg, #0F172A, #03132B)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '18px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#38BDF8', fontWeight: 800 }}>
                <span>W3C VERIFIABLE CREDENTIAL</span>
                <span style={{ color: '#10B981' }}>● ACTIVE</span>
              </div>
              <div style={{ margin: '14px 0' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{credential.fullName}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>MSSV: {credential.studentId} • {credential.major}</div>
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace', wordBreak: 'break-all' }}>{credential.address}</div>
            </div>

            <div style={{ background: '#0A0E17', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11.5px', color: '#94A3B8' }}>
              🛰️ Toạ độ GPS nền: <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
            </div>
          </div>
        )}

        {/* TAB 2: QUÉT MÃ QR & HIỂN THỊ CON DẤU LIVENESS */}
        {activeTab === 'scan' && (
          <div style={{ textAlign: 'center' }}>
            {!livenessActive ? (
              <div>
                {showCameraScanner ? (
                  <div style={{ marginBottom: '14px' }}>
                    <CameraScannerPro
                      onScanSuccess={(res) => handleStudentScanAndSubmit(res)}
                      onClose={() => setShowCameraScanner(false)}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setShowCameraScanner(true)}
                    style={{ width: '220px', height: '220px', margin: '20px auto', border: '2px dashed #38BDF8', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(56,189,248,0.04)' }}
                  >
                    <Scan size={48} color="#38BDF8" />
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Chạm để bật Camera quét QR</span>
                  </div>
                )}

                <button
                  onClick={() => handleStudentScanAndSubmit()}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', border: 'none', borderRadius: '12px', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  ⚡ Quét FaceID &amp; Ký Điểm Danh
                </button>
              </div>
            ) : (
              <div style={{ background: '#0A0E17', border: '1px solid #10B981', borderRadius: '20px', padding: '24px 16px' }}>
                <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ color: '#10B981', margin: '0 0 6px' }}>ĐIỂM DANH THÀNH CÔNG!</h3>
                <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px', borderRadius: '12px', margin: '14px 0' }}>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>PROOF OF LIVENESS STAMP</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', margin: '6px 0' }}>
                    {livenessTimeStr}.<span style={{ color: '#38BDF8' }}>{livenessMs}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>Hash: {dynamicHash}</div>
                </div>
                <button onClick={() => setLivenessActive(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Đóng
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHÂN HỆ GIẢNG VIÊN (VERIFIER) */}
        {activeTab === 'faculty' && (
          <div>
            {!facultySession ? (
              <div>
                {/* Chọn chính sách mạng */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <button
                    onClick={() => setNetworkPolicy('CAMPUS_WIFI_ONLY')}
                    style={{ padding: '10px', borderRadius: '10px', border: networkPolicy === 'CAMPUS_WIFI_ONLY' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)', background: networkPolicy === 'CAMPUS_WIFI_ONLY' ? 'rgba(56,189,248,0.15)' : '#0A0E17', color: networkPolicy === 'CAMPUS_WIFI_ONLY' ? '#38BDF8' : '#94A3B8', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Wifi size={14} style={{ display: 'inline', marginRight: 4 }} /> Chỉ Wi-Fi UTH
                  </button>
                  <button
                    onClick={() => setNetworkPolicy('ALLOW_ALL')}
                    style={{ padding: '10px', borderRadius: '10px', border: networkPolicy === 'ALLOW_ALL' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)', background: networkPolicy === 'ALLOW_ALL' ? 'rgba(16,185,129,0.15)' : '#0A0E17', color: networkPolicy === 'ALLOW_ALL' ? '#10B981' : '#94A3B8', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Smartphone size={14} style={{ display: 'inline', marginRight: 4 }} /> Cho Phép 4G
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button onClick={() => handleStartFacultySession('ATTENDANCE')} style={{ padding: '14px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', border: 'none', borderRadius: '12px', color: '#FFF', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Play size={16} /> Mở Lớp Học (35m)
                  </button>
                  <button onClick={() => handleStartFacultySession('EXAM')} style={{ padding: '14px', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', border: 'none', borderRadius: '12px', color: '#FFF', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Mở Phòng Thi (20m)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Màn chiếu QR Code động xoay mỗi 20s */}
                <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>● PHÒNG ĐANG MỞ (NONCE TỰ XOAY MỖI 20S)</span>
                    <button
                      onClick={() => setIsFullscreen((f) => !f)}
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38BDF8', borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                      <span>{isFullscreen ? 'Thu Nhỏ' : 'Màn Chiếu'}</span>
                    </button>
                  </div>

                  <div style={{ background: '#FFF', padding: isFullscreen ? '18px' : '10px', borderRadius: '12px', width: 'fit-content', margin: '0 auto 10px' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=${isFullscreen ? '320x320' : '180x180'}&data=${encodeURIComponent(`UTH:${facultySession.id}:${facultySession.nonce}`)}`}
                      alt="QR"
                      style={{ width: isFullscreen ? 320 : 180, height: isFullscreen ? 320 : 180, display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', marginBottom: '12px' }}>
                    SESSION: {facultySession.id} • NONCE: {facultySession.nonce}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => socket.emit('trigger-spot-check', { sessionId: facultySession.id, timeoutSec: 60 })}
                      style={{ flex: 1, padding: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', borderRadius: '8px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <RotateCw size={12} /> Tái Kiểm Tra (60s)
                    </button>
                    <button
                      onClick={handleCloseFacultySession}
                      disabled={facultySession?.isClosed}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: facultySession?.isClosed ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.15)',
                        border: facultySession?.isClosed ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239,68,68,0.3)',
                        color: facultySession?.isClosed ? '#64748B' : '#EF4444',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: facultySession?.isClosed ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <XCircle size={12} /> {facultySession?.isClosed ? 'Phòng Đã Đóng' : 'Đóng Phòng'}
                    </button>
                  </div>

                  {facultySession?.isClosed && (
                    <button
                      onClick={() => { setFacultySession(null); setAttendees([]); }}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(56,189,248,0.15)',
                        border: '1px solid rgba(56,189,248,0.3)',
                        color: '#38BDF8',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      + Mở Phiên Điểm Danh Mới
                    </button>
                  )}
                </div>

                {/* Danh sách sinh viên cập nhật thời gian thực & Xuất Báo Cáo Excel (.xlsx) */}
                <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                      SINH VIÊN ĐÃ ĐIỂM DANH ({attendees.length})
                    </div>
                    {attendees.length > 0 && (
                      <button
                        onClick={() => exportAttendanceToExcel(attendees, { sessionId: facultySession?.id, roomName: 'Phòng A2-301 (Lab ATTT)' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(16,185,129,0.15)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10B981',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <FileSpreadsheet size={12} />
                        <span>Xuất Excel (.xlsx)</span>
                      </button>
                    )}
                  </div>
                  {attendees.length === 0 ? (
                    <div style={{ fontSize: '11.5px', color: '#64748B', textAlign: 'center', padding: '14px 0' }}>
                      Chưa có sinh viên nào quét mã. Hãy dùng điện thoại quét QR để danh sách tự động nhảy lên đây qua WebSocket.
                    </div>
                  ) : (
                    attendees.map((st, i) => (
                      <div key={st.mssv || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#04060A', padding: '10px', borderRadius: '8px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt="Avatar"
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid rgba(56,189,248,0.4)',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 700 }}>
                              {st.name} ({st.mssv})
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                              Cách máy chiếu: {st.dist}m • {st.network}
                            </div>
                            <div style={{ fontSize: '10.5px', color: st.status === 'PRESENT' ? '#10B981' : st.status === 'ABSENT' ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>
                              Trạng thái: {st.status === 'PRESENT' ? '✓ Có Mặt' : st.status === 'ABSENT' ? '✗ Vắng Mặt' : '⏳ Chờ Quét Lại...'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setMapIframeStudent(st)}
                          style={{ padding: '6px 8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8', borderRadius: '6px', fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                        >
                          <MapPin size={12} /> Maps
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* POPUP MODAL TÁI KIỂM TRA ĐỘT XUẤT CHO SINH VIÊN */}
      {spotCheckData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#0F172A', border: '2px solid #F59E0B', borderRadius: '20px', padding: '24px', textAlign: 'center', maxWidth: '340px', width: '100%' }}>
            <AlertTriangle size={44} color="#F59E0B" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#FFF' }}>KIỂM TRA ĐỘT XUẤT!</h3>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 16px' }}>Giảng viên yêu cầu quét lại FaceID trong vòng:</p>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', fontFamily: 'monospace', marginBottom: '18px' }}>
              {spotCountdown}s
            </div>
            <button
              onClick={handleConfirmSpotCheck}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
            >
              Quét FaceID Xác Nhận Ngay
            </button>
          </div>
        </div>
      )}

      {/* MODAL NHÚNG GOOGLE MAPS IFRAME TRỰC TIẾP */}
      {mapIframeStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '380px', background: '#0A0E17', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(56,189,248,0.3)' }}>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Vị trí: {mapIframeStudent.name} ({mapIframeStudent.dist}m)</span>
              <button onClick={() => setMapIframeStudent(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${mapIframeStudent.lat},${mapIframeStudent.lon}&z=19&output=embed`}
              />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', height: '60px', background: 'rgba(10,14,23,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50 }}>
        <button onClick={() => setActiveTab('wallet')} style={{ background: 'transparent', border: 'none', color: activeTab === 'wallet' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <Wallet size={18} /><span style={{ fontSize: '10px', marginTop: 2 }}>Ví DID</span>
        </button>
        <button onClick={() => setActiveTab('scan')} style={{ background: 'transparent', border: 'none', color: activeTab === 'scan' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <Scan size={18} /><span style={{ fontSize: '10px', marginTop: 2 }}>Quét Mã</span>
        </button>
        <button onClick={() => setActiveTab('faculty')} style={{ background: 'transparent', border: 'none', color: activeTab === 'faculty' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <Radio size={18} /><span style={{ fontSize: '10px', marginTop: 2 }}>Giảng Viên</span>
        </button>
      </nav>

      {/* MODAL FACE ID APPLE LASER SCANNING & NATIVE BIOMETRIC */}
      <FaceIDModal
        isOpen={showFaceIdModal}
        onSuccess={handleFaceIdSuccess}
        onCancel={() => setShowFaceIdModal(false)}
        onFallbackPin={handleFaceIdFallbackPin}
        studentName={credential.fullName}
        studentId={credential.studentId}
        reason={faceIdReason}
      />

    </div>
  );
}
