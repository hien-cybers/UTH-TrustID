// src/components/FacultyDashboard.jsx - Web Command Center dành cho Giảng viên & Quản trị viên (Stage QR Laser, Google Maps Live View, IDS Audit, Spot-Check 60s, CSV Export & Root Admin Merkle/Revoke)
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { getSocketUrl, smartFetch, retargetSocket, SERVER_URL } from '../utils/backendUrl';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import GoogleMapsLiveView from './GoogleMapsLiveView';

export default function FacultyDashboard({
  initialMode = 'FACULTY' // 'FACULTY' | 'ADMIN' | 'AUDITOR'
}) {
  // Xác thực Quản trị tập trung (Centralized RBAC + JWT Bearer Token cho Giảng viên, Admin & Thanh tra)
  const [token, setToken] = useState(() => localStorage.getItem('faculty_token') || null);
  const [facultyUser, setFacultyUser] = useState(() => {
    try {
      const raw = localStorage.getItem('faculty_user');
      return raw
        ? JSON.parse(raw)
        : {
            email: 'giangvien@uth.edu.vn',
            fullName: 'TS. Trần Thế Vinh',
            department: 'Khoa Công nghệ Thông tin',
            role: 'FACULTY'
          };
    } catch {
      return {
        email: 'giangvien@uth.edu.vn',
        fullName: 'TS. Trần Thế Vinh',
        department: 'Khoa Công nghệ Thông tin',
        role: 'FACULTY'
      };
    }
  });
  const [loginForm, setLoginForm] = useState({ email: 'giangvien@uth.edu.vn', password: 'Admin@2026' });
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Danh sách học phần mẫu được phân công cho Giảng viên
  const ASSIGNED_COURSES = [
    {
      courseCode: 'IT402.N01',
      courseName: 'An toàn Mạng máy tính & Ứng dụng',
      room: 'A2-301',
      schedule: 'Ca 3 (13:30 - 16:00)',
      totalStudents: 65
    },
    {
      courseCode: 'IT308.M11',
      courseName: 'Mật mã học & Ứng dụng Blockchain',
      room: 'B1-204',
      schedule: 'Ca 1 (07:30 - 10:00)',
      totalStudents: 50
    },
    {
      courseCode: 'IT415.P02',
      courseName: 'Bảo mật Web & Hệ thống Phân tán',
      room: 'A3-402',
      schedule: 'Ca 2 (09:30 - 12:00)',
      totalStudents: 60
    }
  ];

  // Cấu hình phiên học
  const [sessionConfig, setSessionConfig] = useState({
    courseCode: "IT402.N01",
    courseName: "An toàn Mạng máy tính & Ứng dụng",
    room: "A2-301",
    centerCoords: { lat: 10.799200, lon: 106.705600 },
    maxRadiusMeters: 35,
    networkMode: "CAMPUS_WIFI", // 'CAMPUS_WIFI' | 'CELLULAR_ANY'
    campusSsid: "UTH_STUDENT_SECURE"
  });

  const resolvedInitialRole = facultyUser?.role || (initialMode === 'ADMIN' ? 'ADMIN' : 'FACULTY');
  const [sessionId, setSessionId] = useState("SES_A2301");
  const [staffRole, setStaffRole] = useState(resolvedInitialRole); // 'FACULTY' | 'ADMIN' | 'AUDITOR'
  // QUAN TRỌNG: Mặc định isCreated = false đối với Giảng viên — Chỉ khi nào Giảng viên bấm "Tạo Lớp" thì mới sinh mã QR!
  const [isCreated, setIsCreated] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    resolvedInitialRole === 'ADMIN'
      ? 'ADMIN_ISSUANCE'
      : resolvedInitialRole === 'AUDITOR'
      ? 'IDS'
      : 'STAGE'
  );
  
  // Nonce xoay vòng & Tiến trình đếm lùi 35 giây
  const ROTATE_INTERVAL = 35;
  const [currentNonce, setCurrentNonce] = useState("NONCE_STAGE_8X9K");
  const [timerProgress, setTimerProgress] = useState(ROTATE_INTERVAL);
  const socketRef = useRef(null);

  // Danh sách sinh viên hiện diện thời gian thực (Kèm thông số Telemetry chống Fake GPS: gpsAccuracy & isMockGps)
  const [attendees, setAttendees] = useState([
    {
      studentId: "2251120001",
      name: "Nguyễn Văn An",
      major: "An toàn Thông tin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      coords: { lat: 10.799215, lon: 106.705620 },
      distance: 4,
      gpsAccuracy: 5.8,
      isMockGps: false,
      network: "UTH_STUDENT_SECURE",
      deviceId: "DEV_IPHONE_15_A1",
      checkInTime: "13:30:15",
      spotCheckStatus: "VERIFIED" // 'NONE' | 'PENDING' | 'VERIFIED' | 'FAILED'
    },
    {
      studentId: "2251120002",
      name: "Trần Thị Mai",
      major: "Khoa học Máy tính",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      coords: { lat: 10.799260, lon: 106.705680 },
      distance: 12,
      gpsAccuracy: 7.2,
      isMockGps: false,
      network: "UTH_STUDENT_SECURE",
      deviceId: "DEV_SAMSUNG_S23_B2",
      checkInTime: "13:31:02",
      spotCheckStatus: "NONE"
    },
    {
      studentId: "2251120003",
      name: "Lê Hoàng Quân",
      major: "Hệ thống Thông tin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      coords: { lat: 10.799480, lon: 106.706100 },
      distance: 65, // Ngoài vùng 35m
      gpsAccuracy: 0.0, // Sai số 0.0000m quá hoàn hảo -> Nghi vấn Mock Location / Fake GPS
      isMockGps: true,
      network: "VIETTEL_4G",
      deviceId: "DEV_IPHONE_15_A1", // Trùng deviceId với bạn An -> IDS Trigger
      checkInTime: "13:32:40",
      spotCheckStatus: "FAILED"
    }
  ]);

  // Trạng thái Tái kiểm tra đột xuất (Spot-check)
  const [spotCheckState, setSpotCheckState] = useState({
    active: false,
    countdown: 60,
    targetIds: []
  });

  // State Quản trị viên Root Admin (Merkle Batch Issuance & Key Revocation)
  const [adminStats, setAdminStats] = useState({
    totalDID: 1240,
    activeDID: 1238,
    revokedDID: 2,
    merkleRoot: localStorage.getItem('uth_latest_merkle_root') || '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2'
  });
  const [batchJson, setBatchJson] = useState(`[
  {
    "studentId": "2251120000",
    "fullName": "Nguyễn Đức Hiển",
    "major": "An toàn Thông tin",
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  },
  {
    "studentId": "2251120001",
    "fullName": "Nguyễn Văn An",
    "major": "An toàn Thông tin",
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
]`);
  const [revokeAddressInput, setRevokeAddressInput] = useState('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  const [adminStatusMsg, setAdminStatusMsg] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [networkBlockNotice, setNetworkBlockNotice] = useState(null);
  const [geofenceBlockNotice, setGeofenceBlockNotice] = useState(null);
  const [latestVerifiedNotice, setLatestVerifiedNotice] = useState(null);
  const [gpsSyncMsg, setGpsSyncMsg] = useState('');
  const [focusedMapStudentId, setFocusedMapStudentId] = useState(null);
  const [isProjectorFullscreen, setIsProjectorFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState('ALL'); // 'ALL' | 'VALID' | 'SUSPICIOUS'
  // 1. Chế độ Bảo vệ Quyền riêng tư Màn chiếu (Projection Privacy Mode / Stage Safe Mode - ZKP Light)
  const [stageSafeMode, setStageSafeMode] = useState(false);
  // 2. Cờ Yêu cầu Hậu kiểm từ Thanh tra gửi sang Giảng viên (Inspection Request Flag)
  const [auditorInspectionRequest, setAuditorInspectionRequest] = useState(null);
  const [auditorStatusMsg, setAuditorStatusMsg] = useState('');
  const [offlineSyncCount, setOfflineSyncCount] = useState(0);

  // Đồng bộ thời gian thực qua WebSocket với Backend
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      secure: true,
      rejectUnauthorized: false
    });
    socketRef.current = socket;

    const handleBackendChanged = (e) => {
      if (e?.detail) retargetSocket(socket, e.detail);
    };
    window.addEventListener('uth-backend-url-changed', handleBackendChanged);

    smartFetch('/api/session/active')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d?.session && d.session.isOpen) {
          const s = d.session;
          setSessionId(s.sessionId || "SES_A2301");
          if (s.nonce) setCurrentNonce(s.nonce);
          socket.emit('join-session', { sessionId: s.sessionId, role: 'FACULTY' });
        }
      })
      .catch(() => {});

    const upsertAttendee = (rec) => {
      if (!rec) return;
      const sid = rec.studentId || rec.mssv || ('SV_' + Date.now());
      const mapped = {
        studentId: sid,
        name: rec.fullName || rec.name || 'Sinh viên UTH',
        major: rec.major || 'An toàn Thông tin',
        avatar: rec.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        coords: rec.coords || {
          lat: Number(rec.lat || 10.799220),
          lon: Number(rec.lon || 106.705630)
        },
        distance: Number(rec.dist ?? rec.distance ?? 5),
        gpsAccuracy: Number(rec.gpsAccuracy ?? 6.4),
        isMockGps: Boolean(rec.isMockGps),
        network: rec.network || rec.networkMode || 'UTH_STUDENT_SECURE',
        deviceId: rec.deviceId || 'DEV_MOBILE_EIP191',
        checkInTime: rec.time || rec.checkInTime || new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        spotCheckStatus: rec.spotCheckVerified ? 'VERIFIED' : (rec.status === 'PENDING_SPOTCHECK' ? 'PENDING' : 'NONE')
      };

      if (rec.isOfflineSynced) {
        setOfflineSyncCount((c) => c + 1);
      }

      setAttendees((prev) => {
        const exists = prev.some((item) => item.studentId === sid);
        if (exists) {
          return prev.map((item) => (item.studentId === sid ? { ...item, ...mapped } : item));
        }
        return [mapped, ...prev];
      });
      setNetworkBlockNotice(null);
      setGeofenceBlockNotice(null);
      setFocusedMapStudentId(sid);
      setLatestVerifiedNotice({
        studentId: sid,
        name: mapped.name,
        distance: mapped.distance,
        network: mapped.network,
        time: mapped.checkInTime
      });
    };

    socket.on('new-attendee', upsertAttendee);
    socket.on('student-checked-in', upsertAttendee);
    socket.on('student-verified', upsertAttendee);
    socket.on('attendee-updated', upsertAttendee);

    // Lắng nghe Yêu cầu Hậu kiểm (Inspection Request Flag) hoặc Override từ Thanh tra (Auditor)
    socket.on('auditor-inspection-request', (payload) => {
      if (payload) {
        setAuditorInspectionRequest(payload);
      }
    });

    socket.on('auditor-override-spot-check', (payload) => {
      if (payload) {
        setAuditorInspectionRequest({ ...payload, isOverride: true });
        setSpotCheckState({
          active: true,
          countdown: 60,
          targetIds: payload.targetIds?.length ? payload.targetIds : ['2251120001', '2251120003']
        });
      }
    });

    socket.on('network-enforcement-blocked', (payload) => {
      if (payload) {
        setNetworkBlockNotice(payload);
      }
    });

    socket.on('geofence-blocked', (payload) => {
      if (payload) {
        setGeofenceBlockNotice(payload);
      }
    });

    socket.on('network-mode-updated', (payload) => {
      if (payload?.networkMode) {
        setSessionConfig((prev) => ({ ...prev, networkMode: payload.networkMode }));
      }
    });

    socket.on('radius-updated', (payload) => {
      if (payload?.maxRadiusMeters || payload?.radius) {
        const nextR = Number(payload.maxRadiusMeters || payload.radius);
        setSessionConfig((prev) => ({
          ...prev,
          maxRadiusMeters: nextR,
          centerCoords: payload.centerCoords || prev.centerCoords
        }));
      }
    });

    socket.on('nonce-updated', (payload) => {
      if (payload?.nonce) {
        setCurrentNonce(payload.nonce);
        setTimerProgress(ROTATE_INTERVAL);
      }
    });

    socket.on('spot-check-verified', (payload) => {
      const sid = payload?.studentId || payload?.mssv;
      if (sid) {
        setAttendees((prev) =>
          prev.map((a) => (a.studentId === sid ? { ...a, spotCheckStatus: 'VERIFIED' } : a))
        );
      }
    });

    socket.on('spot-check-updated', (payload) => {
      if (payload?.studentId && payload?.status === 'VERIFIED') {
        setAttendees((prev) =>
          prev.map((a) => (a.studentId === payload.studentId ? { ...a, spotCheckStatus: 'VERIFIED' } : a))
        );
      }
    });

    return () => {
      window.removeEventListener('uth-backend-url-changed', handleBackendChanged);
      socket.disconnect();
    };
  }, []);

  // Chuyển đổi nóng chế độ Kiểm soát kết nối mạng (Thực nghiệm 1: Wi-Fi trường vs Thực nghiệm 2: 4G/5G)
  const handleSwitchLiveNetworkMode = async (nextMode) => {
    setSessionConfig((prev) => ({ ...prev, networkMode: nextMode }));
    if (nextMode === 'CELLULAR_ANY') {
      setNetworkBlockNotice(null);
    }
    try {
      await smartFetch('/api/session/network-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          networkMode: nextMode
        })
      });
    } catch {}
  };

  // Điều chỉnh nóng Bán kính Geofencing cho phép (tính bằng mét: 5m, 15m, 35m, 100m, 500m, 10000m...)
  const handleUpdateLiveRadius = async (nextRadiusMeters, nextCenterCoords = null) => {
    const parsedRadius = Math.max(1, Math.min(50000, Number(nextRadiusMeters) || 35));
    setSessionConfig((prev) => ({
      ...prev,
      maxRadiusMeters: parsedRadius,
      centerCoords: nextCenterCoords || prev.centerCoords
    }));
    if (geofenceBlockNotice && parsedRadius >= (geofenceBlockNotice.distance || 0)) {
      setGeofenceBlockNotice(null);
    }
    try {
      await smartFetch('/api/session/radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          maxRadiusMeters: parsedRadius,
          centerCoords: nextCenterCoords || sessionConfig.centerCoords
        })
      });
    } catch {}
  };

  // Lấy tọa độ GPS thực tế hiện tại của Laptop làm tâm phòng học (Dùng khi test ở nhà / quán cafe / hội trường)
  const handleSyncLaptopGpsCenter = () => {
    if (!navigator.geolocation) {
      setGpsSyncMsg('Trình duyệt không hỗ trợ Geolocation');
      return;
    }
    setGpsSyncMsg('Đang lấy tọa độ GPS của Laptop...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lon: Number(pos.coords.longitude.toFixed(6))
        };
        handleUpdateLiveRadius(sessionConfig.maxRadiusMeters, coords);
        setGpsSyncMsg(`✓ Đã lấy tâm GPS hiện tại: ${coords.lat}, ${coords.lon}`);
      },
      () => {
        setGpsSyncMsg('Không lấy được GPS trình duyệt, giữ nguyên tọa độ tâm hiện tại.');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Khởi tạo phiên học lên Backend và bật máy chiếu
  const handleStartProjectorSession = async () => {
    const newSid = 'SES_' + (sessionConfig.room || 'A2301').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setSessionId(newSid);
    setIsCreated(true);
    setIsSessionOpen(true);
    setTimerProgress(ROTATE_INTERVAL);

    try {
      const res = await smartFetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSid,
          courseCode: sessionConfig.courseCode,
          courseName: sessionConfig.courseName,
          room: sessionConfig.room,
          centerCoords: sessionConfig.centerCoords,
          maxRadiusMeters: Number(sessionConfig.maxRadiusMeters) || 35,
          networkMode: sessionConfig.networkMode,
          campusSsid: sessionConfig.campusSsid
        })
      });
      const data = await res.json();
      if (data?.success) {
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.initialNonce) setCurrentNonce(data.initialNonce);
        socketRef.current?.emit('join-session', { sessionId: data.sessionId || newSid, role: 'FACULTY' });
      }
    } catch {}
  };

  // Đóng hoặc mở lại nhận diện phiên
  const handleToggleSessionState = async () => {
    const nextState = !isSessionOpen;
    setIsSessionOpen(nextState);
    if (!nextState) {
      socketRef.current?.emit('close-session', { sessionId });
      try {
        await smartFetch('/api/session/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch {}
    } else {
      handleStartProjectorSession();
    }
  };

  // Vòng lặp đếm lùi xoay Nonce (35s)
  useEffect(() => {
    if (!isCreated || !isSessionOpen) return;
    const interval = setInterval(() => {
      setTimerProgress(prev => {
        if (prev <= 1) {
          const nextNonce = "NONCE_" + Math.random().toString(36).substring(2, 9).toUpperCase();
          setCurrentNonce(nextNonce);
          socketRef.current?.emit('rotate-nonce', { sessionId, nonce: nextNonce });
          return ROTATE_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCreated, isSessionOpen, sessionId]);

  // Vòng lặp đếm lùi Spot-check 60s
  useEffect(() => {
    let timer = null;
    if (spotCheckState.active && spotCheckState.countdown > 0) {
      timer = setInterval(() => {
        setSpotCheckState(p => ({ ...p, countdown: p.countdown - 1 }));
      }, 1000);
    } else if (spotCheckState.active && spotCheckState.countdown === 0) {
      setAttendees(prev => prev.map(a => 
        spotCheckState.targetIds.includes(a.studentId) && a.spotCheckStatus === 'PENDING'
          ? { ...a, spotCheckStatus: 'FAILED' }
          : a
      ));
      setSpotCheckState(p => ({ ...p, active: false }));
    }
    return () => clearInterval(timer);
  }, [spotCheckState.active, spotCheckState.countdown, spotCheckState.targetIds]);

  // Tính Điểm Rủi Ro Gian Lận Tự Động (Fraud Risk Score: 0 -> 100)
  // Risk Score = w1*HardwareCollision + w2*DistanceDelta + w3*NetworkMismatch + w4*Time/FakeGPS
  const calculateFraudRiskScore = (student) => {
    let score = 0;
    const reasons = [];

    // w1: Hardware Fingerprint Collision (Trùng lặp mã thiết bị vật lý) -> +45 điểm
    const devUseCount = deviceCounts[student.deviceId] || 1;
    if (devUseCount > 1) {
      score += 45;
      reasons.push(`Trùng thiết bị (${devUseCount} SV)`);
    }

    // w2: Distance Delta (Khoảng cách Haversine so với tâm phòng R) -> tối đa +30 điểm
    const maxR = Number(sessionConfig.maxRadiusMeters || 100);
    if (student.distance > maxR) {
      score += 30;
      reasons.push(`Ngoài bán kính (${student.distance}m > ${maxR}m)`);
    } else if (student.distance > maxR * 0.75) {
      score += 12;
      reasons.push(`Sát biên Geofence (${student.distance}m)`);
    }

    // w3: Network Mismatch (Dùng 4G/5G hoặc kết nối ngoài khi khuyến nghị Wi-Fi trường) -> +15 điểm
    const netStr = String(student.network || '').toUpperCase();
    if (netStr.includes('4G') || netStr.includes('5G') || netStr.includes('CELLULAR')) {
      score += 15;
      reasons.push('Mạng di động 4G/5G');
    }

    // w4: System-level Anti-Fake GPS (isMock === true hoặc sai số accuracy == 0.0000m bất thường) -> +35 điểm
    const acc = Number(student.gpsAccuracy ?? 6.5);
    if (student.isMockGps || acc <= 0.5 || acc > 80) {
      score += 35;
      reasons.push(student.isMockGps || acc <= 0.5 ? `Nghi vấn Fake GPS (acc=${acc}m)` : `Sai số GPS cao (${acc}m)`);
    }

    const clamped = Math.min(100, score);
    const level = clamped > 70 ? 'CRITICAL' : clamped >= 30 ? 'WARNING' : 'SAFE';
    return { score: clamped, level, reasons };
  };

  // Ẩn danh ZKP-Light khi bật Chế độ Trình chiếu An toàn (Projection Privacy / Stage Safe Mode)
  const maskStudentName = (fullName = '') => {
    if (!stageSafeMode) return fullName;
    const parts = String(fullName).trim().split(/\s+/);
    if (parts.length <= 1) return `${fullName.slice(0, 2)}***`;
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ***. ${lastInitial}.`;
  };

  const maskStudentId = (sid = '') => {
    if (!stageSafeMode) return sid;
    const s = String(sid);
    if (s.length <= 3) return '***';
    return `*******${s.slice(-3)}`;
  };

  // Kích hoạt Spot-check (Giảng viên chủ động hoặc đồng ý từ Cờ Yêu Cầu Hậu Kiểm của Thanh tra)
  const handleTriggerSpotCheck = async (mode = 'ALL') => {
    if (attendees.length === 0) return;
    let targets = [];
    if (mode === 'ALL') {
      targets = attendees.map(a => a.studentId);
    } else if (mode === 'FURTHEST') {
      targets = [...attendees].sort((a, b) => b.distance - a.distance).slice(0, 2).map(a => a.studentId);
    } else if (mode === 'RISK_TARGETED') {
      targets = attendees
        .filter(a => calculateFraudRiskScore(a).score >= 30)
        .map(a => a.studentId);
      if (targets.length === 0) {
        targets = [...attendees].sort((a, b) => b.distance - a.distance).slice(0, 2).map(a => a.studentId);
      }
    }

    setAttendees(prev => prev.map(a => 
      targets.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a
    ));
    setSpotCheckState({ active: true, countdown: 60, targetIds: targets });
    setAuditorInspectionRequest(null);

    socketRef.current?.emit('trigger-spot-check', {
      sessionId,
      timeoutSec: 60,
      targetIds: targets
    });
    try {
      await smartFetch('/api/faculty/spot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          timeoutSeconds: 60,
          targetIds: targets,
          mode
        })
      });
    } catch {}
  };

  // Thanh tra (AUDITOR): Gửi Cờ Yêu Cầu Hậu Kiểm (Inspection Request Flag) cho Giảng viên
  // hoặc Kích hoạt Ép Hậu Kiểm Khẩn Cấp (Override Trigger có ghi nhận lý do vào Audit Log)
  const handleAuditorSendInspectionRequest = async (override = false) => {
    const suspiciousTargets = attendees
      .filter(a => calculateFraudRiskScore(a).score >= 30)
      .map(a => a.studentId);

    const reason = override
      ? 'Ép hậu kiểm khẩn cấp (Override Trigger): Phát hiện xung đột phần cứng Device ID & rủi ro gian lận > 70 điểm'
      : 'Đề nghị Giảng viên phát lệnh Spot-check 60s đối với nhóm sinh viên có điểm rủi ro (Risk Score ≥ 30)';

    try {
      const res = await smartFetch('/api/auditor/request-spot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          auditorEmail: facultyUser?.email || 'thanhtra@ut.edu.vn',
          reason,
          targetIds: suspiciousTargets,
          override
        })
      });
      const data = await res.json();
      if (data?.success) {
        setAuditorStatusMsg(data.message);
        if (override) {
          handleTriggerSpotCheck('RISK_TARGETED');
        }
        fetchAdminAuditLogs();
      }
    } catch {
      setAuditorStatusMsg(
        override
          ? '🚨 Đã kích hoạt Ép hậu kiểm khẩn cấp (Override Trigger) và ghi vết Audit Log!'
          : '🚩 Đã gửi Cờ Yêu Cầu Hậu Kiểm (Inspection Request Flag) tới màn hình Giảng viên!'
      );
      if (override) {
        handleTriggerSpotCheck('RISK_TARGETED');
      }
    }
  };

  // Giả lập sinh viên vượt qua Spot-check
  const handleMockPass = (studentId) => {
    setAttendees(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, spotCheckStatus: 'VERIFIED' } : a
    ));
  };

  // Xuất file CSV danh sách chuẩn học vụ (kèm BOM UTF-8 để hiển thị chuẩn tiếng Việt trên Excel)
  const handleExportCSV = () => {
    let csv = "\uFEFFMSSV,HoVaTen,Nganh,KhoangCach(m),ThietBi,ThoiGian,TrangThaiSpotCheck\n";
    attendees.forEach(a => {
      csv += `${a.studentId},"${a.name}",${a.major},${a.distance},${a.deviceId},${a.checkInTime},${a.spotCheckStatus}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DanhSach_${sessionConfig.courseCode}_${sessionConfig.room}.csv`;
    link.click();
  };

  // Chức năng Quản trị viên Root Admin: Phát hành lô Merkle Root & Thu hồi khóa
  const handleAdminIssueMerkleBatch = async () => {
    try {
      const parsed = JSON.parse(batchJson);
      const { rootHash, studentCredentials } = generateMerkleCredentials(parsed);
      localStorage.setItem('uth_latest_merkle_root', rootHash);
      localStorage.setItem('uth_issued_credentials', JSON.stringify(studentCredentials));
      for (const cred of studentCredentials) {
        try { await saveCredentialToStorage(cred); } catch {}
      }
      await smartFetch('/api/admin/issue-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsed })
      }).catch(() => {});

      setAdminStats(prev => ({
        ...prev,
        totalDID: prev.totalDID + studentCredentials.length,
        activeDID: prev.activeDID + studentCredentials.length,
        merkleRoot: rootHash
      }));
      setAdminStatusMsg(`✓ Đã phát hành lô ${studentCredentials.length} thẻ VC & neo Merkle Root mới: ${rootHash.slice(0, 22)}...`);
    } catch (err) {
      setAdminStatusMsg(`❌ Lỗi JSON đầu vào: ${err.message}`);
    }
  };

  const fetchAdminAuditLogs = async () => {
    try {
      const res = await smartFetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data?.success && Array.isArray(data.auditLogs)) {
        setAuditLogs(data.auditLogs);
      }
    } catch {}
  };

  useEffect(() => {
    if (staffRole === 'ADMIN' || staffRole === 'AUDITOR' || activeTab.startsWith('ADMIN')) {
      fetchAdminAuditLogs();
    }
  }, [activeTab, staffRole]);

  const handleAdminRevokeWallet = async () => {
    if (!revokeAddressInput.trim()) return;
    const addr = revokeAddressInput.trim();
    try {
      const currentRevoked = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]');
      if (!currentRevoked.includes(addr)) {
        currentRevoked.push(addr);
        localStorage.setItem('uth_revoked_keys', JSON.stringify(currentRevoked));
      }
      const targets = addr.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' || addr.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
        ? ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x1D9b6938A3f073e3426052C7016155D85040Ed1D']
        : [addr];

      for (const tAddr of targets) {
        await smartFetch('/api/admin/revoke-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: tAddr })
        }).catch(() => {});
      }

      setAdminStats(prev => ({
        ...prev,
        activeDID: Math.max(0, prev.activeDID - 1),
        revokedDID: prev.revokedDID + 1
      }));
      setAdminStatusMsg(`🚫 Đã thực thi revokeKey(${addr.slice(0, 10)}...)! Thiết bị iOS giữ khóa này sẽ bị chặn điểm danh ngay lập tức.`);
      fetchAdminAuditLogs();
    } catch (err) {
      setAdminStatusMsg(`❌ Lỗi thu hồi: ${err.message}`);
    }
  };

  const handleAdminUnrevokeWallet = async () => {
    if (!revokeAddressInput.trim()) return;
    const addr = revokeAddressInput.trim();
    try {
      const currentRevoked = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]').filter(
        (k) => k.toLowerCase() !== addr.toLowerCase()
      );
      localStorage.setItem('uth_revoked_keys', JSON.stringify(currentRevoked));

      const targets = addr.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' || addr.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
        ? ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x1D9b6938A3f073e3426052C7016155D85040Ed1D']
        : [addr];

      for (const tAddr of targets) {
        await smartFetch('/api/admin/unrevoke-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: tAddr })
        }).catch(() => {});
      }

      setAdminStats(prev => ({
        ...prev,
        activeDID: prev.activeDID + 1,
        revokedDID: Math.max(0, prev.revokedDID - 1)
      }));
      setAdminStatusMsg(`🔓 Đã khôi phục trạng thái Hợp lệ (Active) cho ví ${addr.slice(0, 10)}...! Thiết bị iOS có thể điểm danh trở lại.`);
      fetchAdminAuditLogs();
    } catch (err) {
      setAdminStatusMsg(`❌ Lỗi khôi phục: ${err.message}`);
    }
  };

  const deviceCounts = attendees.reduce((acc, cur) => {
    acc[cur.deviceId] = (acc[cur.deviceId] || 0) + 1;
    return acc;
  }, {});

  // Chuỗi QR chuẩn UTH_ID — CHỈ SINH RA KHI GIẢNG VIÊN ĐÃ TẠO LỚP (isCreated === true)
  const qrPayloadString = isCreated
    ? `UTH_ID:${sessionId}:${currentNonce}:${sessionConfig.centerCoords.lat}:${sessionConfig.centerCoords.lon}:${Date.now()}:${
        sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'CAMPUS_WIFI_ONLY' : 'HYBRID_4G_5G'
      }:${encodeURIComponent(SERVER_URL)}`
    : '';

  // Áp dụng phân quyền giao diện theo đúng Role đăng nhập
  const applyRoleWorkspace = (role, userObj) => {
    setFacultyUser(userObj);
    setStaffRole(role);
    if (role === 'ADMIN') {
      setIsCreated(false);
      setIsSessionOpen(false);
      setActiveTab('ADMIN_ISSUANCE');
    } else if (role === 'AUDITOR') {
      setIsCreated(false);
      setIsSessionOpen(false);
      setActiveTab('IDS');
    } else {
      // Giảng viên (FACULTY): Bắt đầu ở màn hình Tạo Lớp (isCreated = false -> chưa có QR)
      setIsCreated(false);
      setIsSessionOpen(false);
      setActiveTab('STAGE');
    }
  };

  // Xử lý Đăng nhập Quản trị tập trung (Centralized RBAC + JWT Bearer Token)
  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setLoginLoading(true);
    try {
      const res = await smartFetch('/api/auth/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Đăng nhập thất bại');

      const resolvedRole = data.role || data.user?.role || 'FACULTY';
      const userObj = data.user || {
        email: loginForm.email,
        fullName:
          resolvedRole === 'ADMIN'
            ? 'Quản Trị Viên Tối Cao'
            : resolvedRole === 'AUDITOR'
            ? 'Ban Thanh Tra & Khảo Thí UTH'
            : 'TS. Trần Thế Vinh',
        department:
          resolvedRole === 'ADMIN'
            ? 'Phòng Đào tạo & Quản trị Hệ thống'
            : resolvedRole === 'AUDITOR'
            ? 'Phòng Thanh tra & Đảm bảo Chất lượng'
            : 'Khoa Công nghệ Thông tin',
        role: resolvedRole
      };

      localStorage.setItem('faculty_token', data.token);
      localStorage.setItem('faculty_user', JSON.stringify(userObj));
      setToken(data.token);
      applyRoleWorkspace(resolvedRole, userObj);
    } catch (err) {
      setAuthError(err.message || 'Không thể kết nối máy chủ xác thực');
    } finally {
      setLoginLoading(false);
    }
  };

  // Chuyển nhanh giữa các tài khoản Thầy/Cô, Admin, Thanh tra để kiểm thử phân quyền RBAC
  const handleQuickSwitchAccount = async (targetEmail) => {
    setLoginForm({ email: targetEmail, password: 'Admin@2026' });
    try {
      const res = await smartFetch('/api/auth/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'Admin@2026' })
      });
      const data = await res.json();
      if (res.ok && data?.token) {
        const resolvedRole = data.role || data.user?.role || 'FACULTY';
        localStorage.setItem('faculty_token', data.token);
        localStorage.setItem('faculty_user', JSON.stringify(data.user));
        setToken(data.token);
        applyRoleWorkspace(resolvedRole, data.user);
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('faculty_token');
    localStorage.removeItem('faculty_user');
    setToken(null);
    setIsCreated(false);
    setIsSessionOpen(false);
    setAuthError('');
  };

  // ==================== CỔNG ĐĂNG NHẬP ĐA VAI TRÒ (GIẢNG VIÊN / ADMIN / THANH TRA) ====================
  if (!token) {
    const DEMO_ACCOUNTS = [
      {
        role: 'FACULTY',
        badge: '👨‍🏫 Giảng Viên 1',
        name: 'TS. Trần Thế Vinh',
        dept: 'Khoa Công nghệ Thông tin',
        email: 'giangvien@uth.edu.vn',
        desc: 'Tạo lớp học, phát QR điểm danh, định vị bản đồ & Spot-Check 60s',
        color: 'cyan'
      },
      {
        role: 'FACULTY',
        badge: '👨‍🏫 Giảng Viên 2',
        name: 'ThS. Nguyễn Minh Khoa',
        dept: 'Bộ môn An toàn Thông tin',
        email: 'gv.khoa@uth.edu.vn',
        desc: 'Quản lý lớp Bảo mật Web, phát QR TOTP & xuất danh sách CSV',
        color: 'cyan'
      },
      {
        role: 'ADMIN',
        badge: '🏛️ Quản Trị Viên (Root Admin)',
        name: 'Phòng Đào Tạo & CNTT',
        dept: 'Quản trị Định danh & Smart Contract',
        email: 'admin@uth.edu.vn',
        desc: 'Phát hành lô thẻ W3C VC, neo Merkle Root & thu hồi khóa thiết bị',
        color: 'emerald'
      },
      {
        role: 'AUDITOR',
        badge: '🛡️ Thanh Tra Khảo Thí',
        name: 'Ban Thanh Tra & ĐBCL',
        dept: 'Giám sát Gian lận & Học vụ',
        email: 'thanhtra@uth.edu.vn',
        desc: 'Kiểm toán xung đột thiết bị (IDS), tra cứu bản đồ & lập biên bản',
        color: 'amber'
      }
    ];

    return (
      <div className="min-h-screen bg-[#040814] text-slate-100 flex items-center justify-center p-5 select-none">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* CỘT TRÁI (7 CỘT): CHỌN VAI TRÒ TRUY CẬP (THẦY/CÔ, ADMIN, THANH TRA) */}
          <div className="lg:col-span-7 p-7 rounded-3xl bg-[#081226] border border-slate-800 shadow-2xl flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                  U
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-white m-0">
                    HỆ THỐNG QUẢN TRỊ ĐỊNH DANH SỐ UTH-TRUSTID
                  </h1>
                  <p className="text-xs font-medium text-cyan-400 mt-0.5 mb-0">
                    Phân quyền tập trung theo vai trò (Role-Based Access Control — JWT)
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed m-0">
                Chọn tài khoản tương ứng với vai trò của bạn để đăng nhập. Mỗi vai trò (<strong className="text-cyan-300">Giảng viên</strong>, <strong className="text-emerald-300">Quản trị viên</strong>, <strong className="text-amber-300">Thanh tra</strong>) được phân tách giao diện và chức năng riêng biệt:
              </p>
            </div>

            {/* Danh sách 4 tài khoản thuộc 3 Role khác nhau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = loginForm.email.toLowerCase() === acc.email.toLowerCase();
                const activeBorder =
                  acc.color === 'emerald'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : acc.color === 'amber'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-cyan-400 bg-cyan-500/10';
                const badgeStyle =
                  acc.color === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : acc.color === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setLoginForm({ email: acc.email, password: 'Admin@2026' });
                      setAuthError('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? `${activeBorder} shadow-lg`
                        : 'border-slate-800 bg-[#040814]/90 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeStyle}`}>
                          {acc.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-white">✓ Đang chọn</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white m-0">{acc.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-0">{acc.dept}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-300 leading-snug m-0">{acc.desc}</p>
                      <p className="text-[11px] font-mono text-cyan-400 mt-1.5 mb-0">{acc.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-[#040814] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>📱 <strong>Sinh viên:</strong> Quét QR qua App di động (Không cần tài khoản tập trung)</span>
              <span className="font-mono text-[11px] text-emerald-400">{SERVER_URL}</span>
            </div>
          </div>

          {/* CỘT PHẢI (5 CỘT): BIỂU MẪU ĐĂNG NHẬP */}
          <form
            onSubmit={handleLogin}
            className="lg:col-span-5 p-8 rounded-3xl bg-[#081226] border border-cyan-500/35 space-y-5 shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3.5">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  🔐 Cổng Đăng Nhập Cán Bộ &amp; Giảng Viên
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2.5 mb-1">
                  Đăng Nhập Hệ Thống
                </h2>
                <p className="text-xs text-slate-400 m-0">
                  Sử dụng tài khoản Email trường (@uth.edu.vn) để nhận chứng chỉ phân quyền JWT
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Email Cán bộ / Giảng viên / Quản trị viên
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="giangvien@uth.edu.vn hoặc admin@uth.edu.vn"
                  className="w-full p-3 rounded-xl bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Mật khẩu xác thực (Mặc định: <code className="text-cyan-300">Admin@2026</code>)
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-[#040814] border border-slate-800 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#040814] border border-slate-800/90 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white">Vai trò sẽ đăng nhập:</div>
                {loginForm.email.startsWith('admin') ? (
                  <p className="text-emerald-300 m-0">
                    🏛️ <strong>Quản Trị Viên Tối Cao (ADMIN):</strong> Mở cổng Phát hành thẻ Merkle Root &amp; Thu hồi khóa thiết bị.
                  </p>
                ) : loginForm.email.startsWith('thanhtra') || loginForm.email.startsWith('audit') ? (
                  <p className="text-amber-300 m-0">
                    🛡️ <strong>Thanh Tra Học Vụ (AUDITOR):</strong> Mở cổng Kiểm toán gian lận thiết bị IDS &amp; Giám sát bản đồ.
                  </p>
                ) : (
                  <p className="text-cyan-300 m-0">
                    👨‍🏫 <strong>Giảng Viên (FACULTY):</strong> Mở cổng Khởi tạo lớp học &amp; Phát mã QR điểm danh giảng đường.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer border-none"
              >
                {loginLoading ? '⏳ Đang xác thực thông tin...' : '🔐 Đăng Nhập Vào Hệ Thống'}
              </button>
              <p className="text-[11px] text-slate-500 text-center m-0">
                Phiên làm việc được bảo vệ bằng chữ ký JWT (Hiệu lực 8 giờ)
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const validAttendeesCount = attendees.filter((s) => s.distance <= sessionConfig.maxRadiusMeters).length;
  const suspiciousAttendeesCount = attendees.length - validAttendeesCount;
  const idsViolationCount = Object.values(deviceCounts).filter((c) => c > 1).length;

  const filteredAttendees = attendees.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      (s.network || '').toLowerCase().includes(q);
    if (!matchQuery) return false;
    if (rosterFilter === 'VALID') return s.distance <= sessionConfig.maxRadiusMeters;
    if (rosterFilter === 'SUSPICIOUS') return s.distance > sessionConfig.maxRadiusMeters;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col select-none">
      
      {/* ==================== THANH ĐIỀU HƯỚNG CHÍNH THEO ĐÚNG VAI TRÒ (ROLE-AWARE TOP NAVBAR) ==================== */}
      <header className="sticky top-0 z-30 px-6 py-3 border-b border-slate-800/80 bg-[#060D1F]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Cụm Thương hiệu & Thông tin Người dùng đang đăng nhập */}
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-slate-950 text-base shadow-lg ${
            staffRole === 'ADMIN'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : staffRole === 'AUDITOR'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : 'bg-gradient-to-br from-cyan-400 to-blue-600'
          }`}>
            U
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-wide text-white m-0">
                {staffRole === 'ADMIN'
                  ? 'UTH-TRUSTID • CỔNG QUẢN TRỊ VIÊN HỆ THỐNG'
                  : staffRole === 'AUDITOR'
                  ? 'UTH-TRUSTID • CỔNG THANH TRA & KHẢO THÍ'
                  : 'UTH-TRUSTID • CỔNG GIẢNG VIÊN ĐIỂM DANH'}
              </h1>

              {/* Nhãn Role hiện tại */}
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                staffRole === 'ADMIN'
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : staffRole === 'AUDITOR'
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                  : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
              }`}>
                {staffRole === 'ADMIN'
                  ? '🏛️ VAI TRÒ: ROOT ADMIN'
                  : staffRole === 'AUDITOR'
                  ? '🛡️ VAI TRÒ: THANH TRA IDS'
                  : '👨‍🏫 VAI TRÒ: GIẢNG VIÊN'}
              </span>

              {/* Chỉ hiện trạng thái phiên học khi là Giảng viên */}
              {staffRole === 'FACULTY' && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
                  !isCreated
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : isSessionOpen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    !isCreated ? 'bg-slate-400' : isSessionOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`} />
                  {!isCreated ? 'Chưa khởi tạo lớp (Chưa phát QR)' : isSessionOpen ? `Đang mở lớp ${sessionConfig.courseCode}` : 'Đã khóa phiên'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5 mb-0">
              Xin chào, <strong className="text-white">{facultyUser?.fullName}</strong> (<span className="font-mono text-cyan-400">{facultyUser?.email}</span>)
              {staffRole === 'FACULTY' && isCreated && (
                <> • Học phần: <strong className="text-white">{sessionConfig.courseCode}</strong> • Phòng: <strong className="text-cyan-300">{sessionConfig.room}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* ==================== CỤM TAB ĐIỀU HƯỚNG TÁCH BIỆT THEO TỪNG ROLE ==================== */}
        {/* 1. Tab dành riêng cho GIẢNG VIÊN (Chỉ hiện sau khi đã bấm Tạo Lớp) */}
        {staffRole === 'FACULTY' && isCreated && (
          <nav className="flex items-center bg-[#040814] p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('STAGE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'STAGE'
                  ? 'bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              📽️ Màn Chiếu QR Điểm Danh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RADAR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'RADAR'
                  ? 'bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🌍 Bản Đồ Định Vị Lớp ({attendees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('IDS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'IDS'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Giám Sát Thiết Bị Lớp
              {idsViolationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 border border-rose-400 text-rose-200 text-[10px] font-mono">
                  {idsViolationCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* 2. Tab dành riêng cho QUẢN TRỊ VIÊN TỐI CAO (ADMIN) */}
        {staffRole === 'ADMIN' && (
          <nav className="flex items-center bg-[#040814] p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_ISSUANCE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_ISSUANCE' || activeTab === 'ADMIN'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🪪 Cấp Phát Thẻ VC &amp; Merkle Root
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_REVOCATION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_REVOCATION'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🚫 Thu Hồi &amp; Khôi Phục Khóa ({adminStats.revokedDID})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_AUDIT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_AUDIT'
                  ? 'bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              📜 Sổ Cái Kiểm Toán Toàn Trường
            </button>
          </nav>
        )}

        {/* 3. Tab dành riêng cho THANH TRA KHẢO THÍ (AUDITOR) */}
        {staffRole === 'AUDITOR' && (
          <nav className="flex items-center bg-[#040814] p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('IDS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'IDS'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Thanh Tra Điểm Danh Hộ (IDS)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RADAR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'RADAR'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🌍 Giám Sát Bản Đồ Tọa Độ ({attendees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_AUDIT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_AUDIT'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              📜 Nhật Ký An Ninh Hệ Thống
            </button>
          </nav>
        )}

        {/* Cụm nút tác vụ & Chuyển nhanh tài khoản Demo RBAC bên phải */}
        <div className="flex flex-wrap items-center gap-2">
          {staffRole === 'FACULTY' && isCreated && (
            <>
              <button
                type="button"
                onClick={handleToggleSessionState}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSessionOpen
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                    : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                }`}
              >
                {isSessionOpen ? '🔒 Tạm Khóa QR' : '🔓 Mở Lại QR'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCreated(false);
                  setIsSessionOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:text-white cursor-pointer"
                title="Kết thúc phiên hiện tại hoặc đổi sang lớp học phần khác"
              >
                ⏹ Đổi Lớp Khác
              </button>
            </>
          )}

          {/* Bộ chuyển nhanh tài khoản giữa Thầy/Cô, Admin và Thanh tra để trình diễn Hội đồng */}
          <div className="flex items-center bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => handleQuickSwitchAccount('giangvien@uth.edu.vn')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                staffRole === 'FACULTY'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
              title="Chuyển nhanh sang tài khoản Giảng viên (TS. Trần Thế Vinh)"
            >
              👨‍🏫 Giảng Viên
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitchAccount('admin@uth.edu.vn')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                staffRole === 'ADMIN'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
              title="Chuyển nhanh sang tài khoản Quản trị viên (Root Admin)"
            >
              🏛️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitchAccount('thanhtra@uth.edu.vn')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                staffRole === 'AUDITOR'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
              title="Chuyển nhanh sang tài khoản Thanh tra khảo thí (Auditor)"
            >
              🛡️ Thanh Tra
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
            title="Đăng xuất về màn hình chọn tài khoản"
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </header>

      {/* ==================== BODY THEO ĐÚNG VAI TRÒ (FACULTY vs ADMIN vs AUDITOR) ==================== */}
      {staffRole === 'FACULTY' && !isCreated ? (
        /* ==================== BƯỚC 1 CỦA GIẢNG VIÊN: KHỞI TẠO LỚP HỌC (CHƯA CÓ MÃ QR) ==================== */
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Cột trái (5 cột): Chọn nhanh Học phần được phân công */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#081226] border border-slate-800 shadow-2xl flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    📚 Học Phần Phân Công
                  </span>
                  <span className="text-xs text-slate-400">Học kỳ II • 2025-2026</span>
                </div>
                <h3 className="text-base font-extrabold text-white m-0">
                  Chọn Lớp Học Để Mở Điểm Danh
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed m-0">
                  Nhấp vào một lớp học phần bên dưới để tự động điền thông tin phòng học, hoặc tùy chỉnh trực tiếp ở biểu mẫu bên phải:
                </p>

                <div className="space-y-2.5 pt-1">
                  {ASSIGNED_COURSES.map((course) => {
                    const isSelected = sessionConfig.courseCode === course.courseCode;
                    return (
                      <button
                        key={course.courseCode}
                        type="button"
                        onClick={() =>
                          setSessionConfig((prev) => ({
                            ...prev,
                            courseCode: course.courseCode,
                            courseName: course.courseName,
                            room: course.room
                          }))
                        }
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-md'
                            : 'border-slate-800 bg-[#040814]/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-300">{course.courseCode}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-semibold text-white">
                            Phòng {course.room}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white mt-1 mb-0.5">{course.courseName}</p>
                        <p className="text-[11px] text-slate-400 m-0">
                          {course.schedule} • Sĩ số: {course.totalStudents} SV
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Khung trạng thái: Chưa sinh mã QR */}
              <div className="p-4 rounded-2xl bg-[#040814] border border-dashed border-slate-700 text-center space-y-1.5">
                <div className="text-2xl">🔒</div>
                <p className="text-xs font-bold text-amber-300 m-0">
                  Chưa phát mã QR điểm danh
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed m-0">
                  Mã QR động (TOTP Nonce 35s) chỉ được khởi tạo và hiển thị sau khi Giảng viên bấm nút <strong className="text-cyan-300">&ldquo;Khởi Tạo Lớp &amp; Phát Mã QR&rdquo;</strong>.
                </p>
              </div>
            </div>

            {/* Cột phải (7 cột): Cấu hình thông số bảo mật của lớp học trước khi phát QR */}
            <div className="lg:col-span-7 p-7 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    Bước 1 / 2 • Thiết Lập Phiên Giảng Đường
                  </span>
                  <h2 className="text-lg font-extrabold text-white mt-2 mb-0.5">
                    Cấu Hình Lớp Học &amp; Ràng Buộc Không Gian
                  </h2>
                  <p className="text-xs text-slate-400 m-0">
                    Kiểm tra mã lớp, phòng học và chế độ mạng trước khi sinh mã QR trên màn chiếu
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mã Học Phần</label>
                    <input
                      value={sessionConfig.courseCode}
                      onChange={e => setSessionConfig({...sessionConfig, courseCode: e.target.value})}
                      className="w-full p-2.5 rounded-xl bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Phòng Học Giảng Đường</label>
                    <input
                      value={sessionConfig.room}
                      onChange={e => setSessionConfig({...sessionConfig, room: e.target.value})}
                      className="w-full p-2.5 rounded-xl bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Học Phần</label>
                  <input
                    value={sessionConfig.courseName}
                    onChange={e => setSessionConfig({...sessionConfig, courseName: e.target.value})}
                    className="w-full p-2.5 rounded-xl bg-[#040814] border border-slate-800 text-xs font-medium text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Chế Độ Kiểm Soát Kết Nối Mạng (Network Enforcement)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CAMPUS_WIFI'})}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionConfig.networkMode === 'CAMPUS_WIFI'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-[#040814] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold m-0">📶 Chế độ 1: Ràng buộc Wi-Fi Trường</p>
                      <p className="text-[11px] text-slate-400 mt-1 mb-0">Chặn 4G/5G cá nhân, bắt buộc kết nối Wi-Fi phòng học</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CELLULAR_ANY'})}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionConfig.networkMode === 'CELLULAR_ANY'
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-[#040814] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold m-0">🌐 Chế độ 2: Cho phép Mạng 4G/5G</p>
                      <p className="text-[11px] text-slate-400 mt-1 mb-0">Mở cho 4G/5G kèm đối soát tọa độ GPS bán kính R ≤ {sessionConfig.maxRadiusMeters}m</p>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-cyan-300">
                      📏 Bán kính phòng học cho phép (R = <span className="font-mono">{sessionConfig.maxRadiusMeters}m</span>)
                    </label>
                    <button
                      type="button"
                      onClick={handleSyncLaptopGpsCenter}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 cursor-pointer"
                    >
                      📍 Lấy GPS Laptop làm tâm phòng
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { val: 5, label: '5m' },
                      { val: 15, label: '15m' },
                      { val: 35, label: '35m (Chuẩn)' },
                      { val: 100, label: '100m' },
                      { val: 500, label: '500m' },
                      { val: 5000, label: '5000m (Test xa)' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleUpdateLiveRadius(opt.val)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          Number(sessionConfig.maxRadiusMeters) === opt.val
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        min={1}
                        max={50000}
                        value={sessionConfig.maxRadiusMeters}
                        onChange={(e) => handleUpdateLiveRadius(e.target.value)}
                        className="w-20 p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 text-center outline-none focus:border-cyan-400"
                      />
                      <span className="text-xs text-slate-400">mét</span>
                    </div>
                  </div>

                  {gpsSyncMsg && (
                    <p className="text-xs text-emerald-400 font-medium m-0">{gpsSyncMsg}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleStartProjectorSession}
                className="w-full py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all cursor-pointer border-none"
              >
                🚀 KHỞI TẠO LỚP ({sessionConfig.courseCode}) &amp; PHÁT MÃ QR ĐIỂM DANH
              </button>
            </div>
          </div>
        </main>
      ) : staffRole === 'ADMIN' ? (
        /* ==================== GIAO DIỆN DÀNH RIÊNG CHO QUẢN TRỊ VIÊN TỐI CAO (ROOT ADMIN PORTAL) ==================== */
        <div className="flex-1 flex flex-col p-6 gap-5 max-w-[1440px] w-full mx-auto">
          {/* 3 Thẻ Thống Kê Toàn Trường Của Admin */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#081226] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Tổng Định Danh Sinh Viên (W3C DID)</span>
                <span className="text-2xl font-extrabold text-white mt-1 block font-mono">{adminStats.totalDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                Toàn Trường
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#081226] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Chứng Chỉ Đang Hoạt Động (Active VC)</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-mono">{adminStats.activeDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                Hợp Lệ Điểm Danh
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#081226] border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Thiết Bị Đã Bị Thu Hồi Khóa (Revoked)</span>
                <span className="text-2xl font-extrabold text-rose-400 mt-1 block font-mono">{adminStats.revokedDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                Chặn Tức Thì
              </span>
            </div>
          </section>

          {adminStatusMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
              {adminStatusMsg}
            </div>
          )}

          {/* Phân hệ 1 của Admin: Phát hành lô thẻ VC & Merkle Root */}
          {(activeTab === 'ADMIN_ISSUANCE' || activeTab === 'ADMIN') && (
            <div className="p-7 rounded-3xl bg-[#081226] border border-emerald-500/30 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-emerald-300 m-0">
                    🪪 Phát Hành Lô Thẻ Định Danh Sinh Viên (Merkle Batch Issuance O(log N))
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 mb-0">
                    Chức năng đặc quyền của Root Admin: Băm danh sách sinh viên thành cây Merkle và neo Root Hash lên Smart Contract Polygon Amoy (80002)
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#040814] border border-slate-800 text-xs">
                  Merkle Root hiện tại: <code className="text-amber-300 font-mono">{adminStats.merkleRoot.slice(0, 26)}...</code>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Danh sách sinh viên cấp phát chứng chỉ W3C VC (Định dạng JSON):
                  </label>
                  <textarea
                    value={batchJson}
                    onChange={(e) => setBatchJson(e.target.value)}
                    rows={10}
                    className="w-full p-4 rounded-2xl bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-200 focus:border-emerald-400 outline-none resize-none"
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-[#040814] border border-slate-800 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white m-0">Cơ Chế Cây Merkle O(log N)</h3>
                    <ul className="text-xs text-slate-300 space-y-2 pl-4 m-0 leading-relaxed">
                      <li>Mỗi lá (Leaf) được băm chuẩn <code className="text-cyan-300">keccak256(address, studentId)</code>.</li>
                      <li>Gom hàng ngàn thẻ sinh viên vào <strong>1 giao dịch neo Merkle Root duy nhất</strong>, tiết kiệm 99% phí Gas trên Blockchain.</li>
                      <li>Sinh viên tải <code className="text-emerald-300">merkleProof</code> về điện thoại để chứng minh tư cách hợp lệ mà không cần tài khoản tập trung.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdminIssueMerkleBatch}
                    className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs cursor-pointer border-none shadow-lg"
                  >
                    ⚡ Băm Keccak256 &amp; Neo Merkle Root Lên Smart Contract
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phân hệ 2 của Admin: Thu hồi & Khôi phục khóa thiết bị độc lập */}
          {activeTab === 'ADMIN_REVOCATION' && (
            <div className="p-7 rounded-3xl bg-[#081226] border border-rose-500/30 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-extrabold text-rose-300 m-0">
                  🚫 Sổ Bộ Thu Hồi &amp; Khôi Phục Khóa Thiết Bị Độc Lập (Decoupled Key Revocation)
                </h2>
                <p className="text-xs text-slate-400 mt-1 mb-0">
                  Vô hiệu hóa tức thì thiết bị di động bị báo mất máy (<code>isRevoked[address] = true</code>) mà không làm thay đổi Merkle Root của các sinh viên khác
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Địa chỉ Ví mật mã học gắn với thiết bị cần thu hồi / khôi phục:
                    </label>
                    <input
                      value={revokeAddressInput}
                      onChange={(e) => setRevokeAddressInput(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#040814] border border-slate-800 text-xs font-mono text-rose-300 focus:border-rose-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleAdminRevokeWallet}
                      className="py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs cursor-pointer border-none shadow-lg"
                    >
                      🚫 Thu Hồi Khóa Thiết Bị (revokeKey)
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminUnrevokeWallet}
                      className="py-3.5 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-extrabold text-xs cursor-pointer"
                    >
                      🔓 Khôi Phục Khóa Thiết Bị (unrevokeKey)
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-2xl bg-[#040814] border border-slate-800 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  <div className="font-bold text-white">💡 Cơ chế Thu Hồi Khóa Độc Lập 2 Tầng O(1) (Decoupled Revocation)</div>
                  <p className="m-0">
                    Nếu gộp trạng thái thu hồi vào cây Merkle, mỗi khi 1 sinh viên mất điện thoại, nhà trường phải tính lại Merkle Root và bắt toàn bộ 10.000 sinh viên khác tải lại Proof mới.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
                    Verify(Proof) == True &amp;&amp; isRevoked[SignerAddress] == False
                  </div>
                  <p className="m-0 text-cyan-300">
                    • <strong>Tầng 1 (Tĩnh - O(log N)):</strong> Cây Merkle chứng minh sinh viên thuộc biên chế trường.<br />
                    • <strong>Tầng 2 (Động - O(1)):</strong> Bảng băm <code>mapping(address =&gt; bool) isRevoked</code> khóa máy tức thì với chi phí O(1).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phân hệ 3 của Admin: Sổ cái Kiểm toán An ninh Toàn trường */}
          {activeTab === 'ADMIN_AUDIT' && (
            <div className="p-7 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-cyan-300 m-0">
                    📜 Sổ Cái Kiểm Toán An Ninh Toàn Trường (System Audit Trail)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 mb-0">
                    Ghi vết bất biến mọi thao tác cấp phát, thu hồi khóa và xác thực chữ ký số EIP-191
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminAuditLogs}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer"
                >
                  🔄 Làm Mới Nhật Ký
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">Đang đồng bộ nhật ký kiểm toán từ máy chủ...</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-[#040814] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-mono text-slate-400 mr-2">[{log.time}]</span>
                        <strong className="text-emerald-300 mr-2">{log.action}:</strong>
                        <span className="text-slate-200">{log.detail}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-mono text-[11px] font-bold">
                        {log.result}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== GIAO DIỆN GIẢNG VIÊN (SAU KHI ĐÃ TẠO LỚP) & THANH TRA KHẢO THÍ ==================== */
        <div className="flex-1 flex flex-col p-5 gap-5 max-w-[1600px] w-full mx-auto">
          
          {/* ==================== THANH ĐIỀU KHIỂN NHANH 4 Ô (QUICK CONTROL & KPI BAR) ==================== */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Ô 1: Thống kê sĩ số thời gian thực + Hàng đợi Offline Grace Buffer */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-slate-800/90 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Sĩ Số Điểm Danh Thời Gian Thực
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-white font-mono">{attendees.length}</span>
                  <span className="text-xs font-semibold text-emerald-400">{validAttendeesCount} hợp lệ</span>
                  {suspiciousAttendeesCount > 0 && (
                    <span className="text-xs font-semibold text-rose-400">• {suspiciousAttendeesCount} ngoài vùng</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-cyan-400/90 block mt-0.5">
                  ✓ Grace Offline Buffer (T_sign ±5p): Đã đồng bộ {offlineSyncCount} gói
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold cursor-pointer"
                title="Tải xuống báo cáo điểm danh CSV"
              >
                📥 Xuất CSV
              </button>
            </div>

            {/* Ô 2: Chuyển đổi nhanh Thực nghiệm 1 (Wi-Fi Trường) vs Thực nghiệm 2 (4G/5G) */}
            <div className="p-3.5 rounded-2xl bg-[#081226] border border-slate-800/90 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Kiểm Soát Kết Nối Mạng
                </span>
                <span className={`text-[11px] font-bold ${
                  sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Chặn 4G ngoài' : 'Cho phép 4G/5G'}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  disabled={staffRole === 'AUDITOR'}
                  onClick={() => handleSwitchLiveNetworkMode('CAMPUS_WIFI')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none disabled:opacity-60 ${
                    sessionConfig.networkMode === 'CAMPUS_WIFI'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📶 TN1: Wi-Fi Trường
                </button>
                <button
                  type="button"
                  disabled={staffRole === 'AUDITOR'}
                  onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none disabled:opacity-60 ${
                    sessionConfig.networkMode !== 'CAMPUS_WIFI'
                      ? 'bg-emerald-400 text-slate-950 shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🌐 TN2: Mạng 4G/5G
                </button>
              </div>
            </div>

            {/* Ô 3: Điều chỉnh nhanh Bán kính Geofence (R) & Tâm GPS */}
            <div className="p-3.5 rounded-2xl bg-[#081226] border border-slate-800/90 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Bán Kính Phòng: <strong className="text-cyan-300 font-mono">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                </span>
                {staffRole === 'FACULTY' && (
                  <button
                    type="button"
                    onClick={handleSyncLaptopGpsCenter}
                    className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/25 cursor-pointer"
                    title="Lấy vị trí GPS hiện tại của Laptop làm tâm phòng học"
                  >
                    📍 Tâm GPS Laptop
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[15, 35, 100, 500, 5000].map((rVal) => (
                  <button
                    key={rVal}
                    type="button"
                    disabled={staffRole === 'AUDITOR'}
                    onClick={() => handleUpdateLiveRadius(rVal)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border-none disabled:opacity-60 ${
                      Number(sessionConfig.maxRadiusMeters) === rVal
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'bg-[#040814] text-slate-400 hover:text-white'
                    }`}
                  >
                    {rVal}m
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={50000}
                  disabled={staffRole === 'AUDITOR'}
                  value={sessionConfig.maxRadiusMeters}
                  onChange={(e) => handleUpdateLiveRadius(e.target.value)}
                  className="w-16 py-1 px-1.5 rounded-lg bg-[#040814] border border-slate-800 text-[11px] font-mono text-cyan-300 text-center outline-none focus:border-cyan-400 disabled:opacity-60"
                  title="Nhập số mét bán kính bất kỳ"
                />
              </div>
            </div>

            {/* Ô 4: Tách biệt cơ chế Hậu kiểm giữa GIẢNG VIÊN (Phát lệnh trực tiếp) vs THANH TRA (Gửi Cờ Yêu Cầu / Override) */}
            <div className="p-3.5 rounded-2xl bg-[#081226] border border-amber-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300">
                  {staffRole === 'AUDITOR' ? '🚩 Cờ Yêu Cầu Hậu Kiểm (RBAC)' : '⚡ Hậu Kiểm Face ID (Spot-Check)'}
                </span>
                {spotCheckState.active ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-extrabold text-[10px] animate-pulse">
                    Còn {spotCheckState.countdown}s
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    {staffRole === 'AUDITOR' ? 'Chống gián đoạn bài giảng' : 'Chu kỳ 60s'}
                  </span>
                )}
              </div>
              {staffRole === 'AUDITOR' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAuditorSendInspectionRequest(false)}
                    className="py-1.5 px-2 rounded-xl text-[10.5px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all border-none cursor-pointer"
                    title="Gửi cờ đề nghị hậu kiểm sang màn hình Giảng viên để đồng bộ với tiến trình bài giảng"
                  >
                    🚩 Gửi Cờ Cho GV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuditorSendInspectionRequest(true)}
                    className="py-1.5 px-2 rounded-xl text-[10.5px] font-bold border border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                    title="Chỉ dùng khi khẩn cấp: Ép hậu kiểm và bắt buộc ghi nhận lý do vào Audit Log"
                  >
                    🚨 Ép Khẩn (Override)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={spotCheckState.active}
                    onClick={() => handleTriggerSpotCheck('ALL')}
                    className="py-1.5 px-2 rounded-xl text-[10.5px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 border-none cursor-pointer"
                  >
                    ⚡ Kiểm Tra Cả Lớp
                  </button>
                  <button
                    type="button"
                    disabled={spotCheckState.active}
                    onClick={() => handleTriggerSpotCheck('RISK_TARGETED')}
                    className="py-1.5 px-2 rounded-xl text-[10.5px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    title="Chỉ phát lệnh hậu kiểm 60s tới các sinh viên có Điểm Rủi Ro Gian Lận (Risk Score ≥ 30)"
                  >
                    🎯 Theo Rủi Ro (≥30đ)
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Banner nhận Cờ Yêu Cầu Hậu Kiểm (Inspection Request Flag) từ Thanh tra hiển thị trên màn hình Giảng viên */}
          {staffRole === 'FACULTY' && auditorInspectionRequest && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400 text-amber-100 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-pulse">
              <div>
                <div className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                  <span>🚩 YÊU CẦU HẬU KIỂM TỪ BAN THANH TRA ({auditorInspectionRequest.auditorEmail})</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-[10px] font-mono">
                    Lúc {auditorInspectionRequest.requestedAt}
                  </span>
                </div>
                <p className="text-xs text-white mt-1 mb-0">
                  Lý do: <strong>{auditorInspectionRequest.reason}</strong> — Giảng viên vui lòng xác nhận khi đến đoạn nghỉ bài giảng để tránh gián đoạn lớp học.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerSpotCheck('RISK_TARGETED')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer border-none"
                >
                  ✅ Đồng Ý &amp; Phát Lệnh Spot-Check 60s
                </button>
                <button
                  type="button"
                  onClick={() => setAuditorInspectionRequest(null)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ⏳ Hoãn Sau Khi Giảng Xong
                </button>
              </div>
            </div>
          )}

          {auditorStatusMsg && (
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 flex items-center justify-between text-xs font-semibold">
              <span>{auditorStatusMsg}</span>
              <button
                type="button"
                onClick={() => setAuditorStatusMsg('')}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* ==================== KHÔNG GIAN LÀM VIỆC CHÍNH (2 CỘT GỌN GÀNG) ==================== */}
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* CỘT TRÁI (8 CỘT TRÊN MÀN LỚN): MÀN CHIẾU QR / GOOGLE MAPS / IDS / AUDIT */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              
              {/* TAB 1 (CHỈ HIỆN KHI GIẢNG VIÊN ĐÃ TẠO LỚP): MÀN CHIẾU QR ĐIỂM DANH */}
              {activeTab === 'STAGE' && staffRole === 'FACULTY' && isCreated && (
                <div className="flex-1 rounded-3xl bg-[#081226] border border-cyan-500/30 p-6 flex flex-col justify-between shadow-2xl gap-5">
                  
                  {/* Thanh tiêu đề trên cùng của Màn Chiếu */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/90">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-[11px] font-bold text-cyan-300">
                          Đang Chiếu Mã QR Động (TOTP 35s)
                        </span>
                        <span className="text-xs text-slate-400">
                          Phòng <strong className="text-white">{sessionConfig.room}</strong> • Chống chụp ảnh QR gửi hộ
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-white mt-1 mb-0">
                        {sessionConfig.courseCode} — {sessionConfig.courseName}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Nút bật/tắt Chế độ Trình chiếu Ẩn danh (Projection Privacy / Stage Safe Mode - ZKP Light) */}
                      <button
                        type="button"
                        onClick={() => setStageSafeMode((prev) => !prev)}
                        className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border transition-all ${
                          stageSafeMode
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                            : 'bg-[#040814] border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Bảo vệ quyền riêng tư trên máy chiếu (ZKP-Light): Che một phần Họ tên, MSSV và ẩn tọa độ GPS chi tiết"
                      >
                        {stageSafeMode ? '🕶️ Đang Bật Ẩn Danh Màn Chiếu (ZKP-Light)' : '👁️ Chế Độ Ẩn Danh Màn Chiếu'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.35)] cursor-pointer border-none transition-all"
                      >
                        ⛶ Phóng To QR Toàn Màn Chiếu (500px)
                      </button>
                    </div>
                  </div>

                  {/* Thông báo sự kiện thời gian thực (Nếu có sinh viên quét hoặc bị chặn) */}
                  {networkBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 flex items-center justify-between gap-3 animate-pulse">
                      <div>
                        <p className="text-xs font-extrabold text-rose-300 m-0">
                          🚨 CHẶN KẾT NỐI MẠNG (THỰC NGHIỆM 1) — {networkBlockNotice.fullName} ({networkBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-semibold text-white mt-0.5 mb-0">{networkBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở Chế Độ 4G/5G ➔
                      </button>
                    </div>
                  )}

                  {geofenceBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 flex items-center justify-between gap-3 animate-pulse">
                      <div>
                        <p className="text-xs font-extrabold text-amber-300 m-0">
                          📍 VƯỢT BÁN KÍNH PHÒNG HỌC — {geofenceBlockNotice.fullName} ({geofenceBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-semibold text-white mt-0.5 mb-0">{geofenceBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateLiveRadius(Math.max(100, (geofenceBlockNotice.distance || 85) + 15))}
                        className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở rộng R lên {Math.max(100, (geofenceBlockNotice.distance || 85) + 15)}m ➔
                      </button>
                    </div>
                  )}

                  {!networkBlockNotice && !geofenceBlockNotice && latestVerifiedNotice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs font-semibold">
                      <span>
                        ✅ Xác thực thành công: <strong>{latestVerifiedNotice.name}</strong> ({latestVerifiedNotice.studentId}) • Cách tâm {latestVerifiedNotice.distance}m ({latestVerifiedNotice.network})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMapStudentId(latestVerifiedNotice.studentId);
                          setActiveTab('RADAR');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-[11px] whitespace-nowrap cursor-pointer border-none"
                      >
                        📍 Xem Trên Google Maps
                      </button>
                    </div>
                  )}

                  {/* Khu vực trung tâm: Cột Trái (QR 360px) + Cột Phải (Thông số bảo mật phiên) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center my-auto">
                    
                    {/* Khung QR Điểm Danh Cỡ Lớn (7 cột) */}
                    <div className="xl:col-span-7 flex flex-col items-center">
                      <div
                        onClick={() => setIsProjectorFullscreen(true)}
                        title="Nhấp vào mã QR để phóng to toàn màn chiếu (500x500px)"
                        className="p-5 bg-white rounded-[28px] shadow-[0_0_60px_rgba(0,242,254,0.28)] border-4 border-cyan-400 flex flex-col items-center cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="w-[360px] h-[360px] max-w-[75vw] max-h-[75vw] bg-white rounded-2xl flex items-center justify-center relative overflow-hidden p-1.5">
                          <QRCodeCanvas
                            value={qrPayloadString}
                            size={348}
                            level="M"
                            includeMargin={false}
                            style={{ width: '100%', height: '100%', maxWidth: '348px', maxHeight: '348px' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none animate-pulse" />
                        </div>
                        <div className="mt-2.5 text-center">
                          <p className="text-sm font-mono font-bold text-slate-950 tracking-wider m-0">{currentNonce}</p>
                        </div>
                      </div>

                      {/* Thanh tiến trình xoay Nonce 35s */}
                      <div className="w-[360px] max-w-full mt-3.5 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-medium">Tự động làm mới mã QR sau:</span>
                          <span className="text-cyan-400 font-mono font-bold">{timerProgress}s</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timerProgress / ROTATE_INTERVAL) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bảng Trạng Thái Bảo Mật & Hướng Dẫn Quét (5 cột) */}
                    <div className="xl:col-span-5 flex flex-col gap-3">
                      <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800/90 space-y-3">
                        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                          🔒 Thông Số Bảo Mật Phiên Đang Áp Dụng
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Chế độ mạng:</span>
                            <span className={`font-bold ${
                              sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'text-amber-300' : 'text-emerald-300'
                            }`}>
                              {sessionConfig.networkMode === 'CAMPUS_WIFI' ? '📶 Wi-Fi Trường' : '🌐 4G/5G Tự Do'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Bán kính GPS:</span>
                            <span className="font-mono font-bold text-cyan-300">
                              Haversine R ≤ {sessionConfig.maxRadiusMeters}m
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Chữ ký định danh:</span>
                            <span className="font-bold text-emerald-300">
                              EIP-191 + Face ID
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Đối soát lớp học:</span>
                            <span className="font-bold text-purple-300">
                              Merkle Proof O(log N)
                            </span>
                          </div>
                        </div>

                        {gpsSyncMsg && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
                            {gpsSyncMsg}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800/90 space-y-2.5">
                        <div className="text-xs font-bold text-white">
                          🗺️ Chuyển Nhanh Sang Bản Đồ Định Vị
                        </div>
                        <p className="text-xs text-slate-400 m-0 leading-relaxed">
                          Xem trực tiếp vị trí GPS của từng sinh viên trên bản đồ Google Maps nhúng và vòng tròn Geofence.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('RADAR')}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer transition-all"
                        >
                          🌍 Mở Bản Đồ Google Maps ({attendees.length} SV) ➔
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ TOÀN MÀN CHIẾU SIÊU LỚN (500x500px PROJECTOR OVERLAY) */}
              {isProjectorFullscreen && isCreated && (
                <div className="fixed inset-0 z-50 bg-[#040814]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-cyan-500/20">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold">
                        📽️ CHẾ ĐỘ MÁY CHIẾU HỘI TRƯỜNG LỚN (MÃ QR 500x500PX)
                      </span>
                      <h2 className="text-2xl font-extrabold text-white mt-2 mb-0">
                        {sessionConfig.courseCode} — {sessionConfig.courseName} (Phòng {sessionConfig.room})
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStageSafeMode((prev) => !prev)}
                        className={`px-3.5 py-2 rounded-2xl font-bold text-xs cursor-pointer border transition-all ${
                          stageSafeMode
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {stageSafeMode ? '🕶️ Đang Ẩn Danh MSSV/Tên (ZKP-Light)' : '👁️ Bật Ẩn Danh Màn Chiếu'}
                      </button>
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold">
                        ✅ Sĩ số đã điểm danh: {attendees.length} SV
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(false)}
                        className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs cursor-pointer border-none shadow-lg"
                      >
                        ✕ Thu Nhỏ Về Bảng Điều Khiển
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl">
                    <div className="p-7 bg-white rounded-[32px] shadow-[0_0_90px_rgba(0,242,254,0.4)] border-4 border-cyan-400 flex flex-col items-center">
                      <div className="w-[480px] h-[480px] max-w-[82vw] max-h-[60vh] bg-white rounded-2xl flex items-center justify-center p-2 relative">
                        <QRCodeCanvas
                          value={qrPayloadString}
                          size={460}
                          level="M"
                          includeMargin={false}
                          style={{ width: '100%', height: '100%', maxWidth: '460px', maxHeight: '460px' }}
                        />
                      </div>
                      <p className="text-base font-mono font-bold text-slate-950 tracking-widest mt-3 mb-0">
                        {currentNonce}
                      </p>
                    </div>

                    <div className="w-full lg:w-80 space-y-4">
                      <div className="p-5 rounded-3xl bg-[#081226] border border-cyan-500/30 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-medium">Xoay mã Nonce sau:</span>
                          <span className="text-2xl font-mono font-extrabold text-cyan-400">{timerProgress}s</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timerProgress / ROTATE_INTERVAL) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 m-0">
                          Bán kính Geofencing: <strong className="text-cyan-300 font-mono">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                        </p>
                        <p className="text-xs text-slate-400 m-0">
                          Chế độ mạng: <strong className="text-emerald-400">{sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Trường' : '4G/5G Tự Do'}</strong>
                        </p>
                      </div>

                      <div className="p-5 rounded-3xl bg-[#081226] border border-slate-800 space-y-2.5 max-h-64 overflow-y-auto">
                        <p className="text-xs font-bold text-cyan-400 uppercase m-0">
                          Sinh viên vừa quét thành công ({attendees.length})
                        </p>
                        {attendees.slice(0, 5).map((st) => (
                          <div key={st.studentId} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white m-0">{maskStudentName(st.name)}</p>
                              <p className="text-[11px] font-mono text-slate-400 m-0">
                                MSSV: {maskStudentId(st.studentId)} • {stageSafeMode ? '✓ Trong vùng' : `${st.distance}m`}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                              ✓ EIP-191
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BẢN ĐỒ ĐỊNH VỊ GOOGLE MAPS THỜI GIAN THỰC */}
              {activeTab === 'RADAR' && (
                <GoogleMapsLiveView
                  sessionConfig={sessionConfig}
                  attendees={attendees}
                  focusedStudentId={focusedMapStudentId}
                  onSelectStudent={(sid) => setFocusedMapStudentId(sid)}
                  onSyncLaptopGps={handleSyncLaptopGpsCenter}
                />
              )}

              {/* TAB 3: IDS AUDIT & ĐIỂM RỦI RO GIAN LẬN TỰ ĐỘNG (FRAUD RISK SCORE 0-100) */}
              {activeTab === 'IDS' && (
                <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-rose-500/30 p-6 flex flex-col shadow-2xl gap-4">
                  <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-extrabold text-rose-300 m-0">
                        🛡️ Trung Tâm Phát Hiện Điểm Danh Hộ (IDS) &amp; Chấm Điểm Rủi Ro Tự Động
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 mb-0">
                        Công thức: <code className="text-cyan-300">RiskScore = w1·HardwareCollision + w2·DistanceDelta + w3·NetworkMismatch + w4·FakeGPS</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
                        {idsViolationCount} Xung Đột Phần Cứng
                      </span>
                    </div>
                  </div>

                  {/* Khung Phối hợp Quyền hạn Hậu kiểm giữa Thanh tra (AUDITOR) và Giảng viên (FACULTY) */}
                  <div className="p-4 rounded-2xl bg-[#040814] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <div className="font-bold text-amber-300">
                        {staffRole === 'AUDITOR'
                          ? '🚩 Cơ Chế Phối Hợp Thanh Tra — Giảng Viên (Tránh Làm Gián Đoạn Bài Giảng)'
                          : '🎯 Phát Lệnh Hậu Kiểm Chọn Lọc Theo Điểm Rủi Ro (Risk-Based Spot-Check)'}
                      </div>
                      <p className="text-slate-400 mt-0.5 mb-0">
                        {staffRole === 'AUDITOR'
                          ? 'Gửi Cờ Yêu Cầu Hậu Kiểm để Giảng viên chủ động bấm xác nhận, hoặc kích hoạt Override khẩn cấp có ghi nhật ký kiểm toán.'
                          : 'Tự động lọc các sinh viên có Risk Score ≥ 30 (Nghi vấn Vàng / Báo động Đỏ) để yêu cầu quét lại Face ID trong 60s.'}
                      </p>
                    </div>

                    {staffRole === 'AUDITOR' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAuditorSendInspectionRequest(false)}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs border-none cursor-pointer"
                        >
                          🚩 Gửi Cờ Yêu Cầu Hậu Kiểm Cho GV
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAuditorSendInspectionRequest(true)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-extrabold text-xs cursor-pointer"
                        >
                          🚨 Ép Hậu Kiểm Khẩn Cấp (Override + Log)
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTriggerSpotCheck('RISK_TARGETED')}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs border-none cursor-pointer"
                        >
                          🎯 Hậu Kiểm Nhóm Rủi Ro (Risk ≥ 30)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerSpotCheck('ALL')}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer"
                        >
                          ⚡ Hậu Kiểm Toàn Lớp
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                    {/* Cảnh báo trùng mã phần cứng Device ID */}
                    {Object.entries(deviceCounts).map(([devId, count]) => {
                      if (count > 1) {
                        const violators = attendees.filter(a => a.deviceId === devId);
                        return (
                          <div key={devId} className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/40 text-xs space-y-2">
                            <div className="flex justify-between text-rose-400 font-bold">
                              <span>⚠️ XUNG ĐỘT VÂN TAY PHẦN CỨNG: 1 MÁY ĐIỂM DANH CHO {count} SINH VIÊN</span>
                              <span className="font-mono">Device ID: {devId}</span>
                            </div>
                            <p className="text-slate-300 m-0">
                              Sinh viên liên quan: <strong>{violators.map(v => `${v.name} (${v.studentId})`).join(', ')}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* Bảng chấm điểm Fraud Risk Score (0-100) & Chống Fake GPS từng sinh viên */}
                    <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>📊 Bảng Chấm Điểm Rủi Ro Gian Lận &amp; Kiểm Định Fake GPS Thời Gian Thực</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          &lt;30: Hợp lệ (Xanh) • 30-70: Nghi vấn (Vàng) • &gt;70: Báo động đỏ
                        </span>
                      </div>

                      <div className="space-y-2">
                        {attendees.map((st) => {
                          const risk = calculateFraudRiskScore(st);
                          const badgeStyle =
                            risk.level === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : risk.level === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                          return (
                            <div
                              key={st.studentId}
                              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span>{st.name}</span>
                                  <span className="font-mono text-cyan-400 text-[11px]">({st.studentId})</span>
                                  <span className="font-mono text-[10px] text-slate-400">• Máy: {st.deviceId}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Khoảng cách: <strong className="text-slate-200">{st.distance}m</strong> • Sai số GPS:{' '}
                                  <strong className={st.isMockGps || Number(st.gpsAccuracy) <= 0.5 ? 'text-rose-400' : 'text-emerald-300'}>
                                    ±{st.gpsAccuracy ?? 6.2}m {st.isMockGps ? '(⚠️ Mock Location!)' : '(Cảm biến thật)'}
                                  </strong>
                                  {risk.reasons.length > 0 && (
                                    <span className="text-amber-300 ml-2">• Yếu tố: {risk.reasons.join(', ')}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg border font-mono font-extrabold text-xs ${badgeStyle}`}>
                                  Risk Score: {risk.score}/100
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#040814] border border-slate-800 text-xs text-slate-300">
                      ✓ Sliding Nonce TOTP + Grace Offline Buffer (T_sign ±5 phút): Chống Replay Attack 100% và hỗ trợ đồng bộ trễ khi nghẽn mạng.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB NHẬT KÝ AN NINH CHO THANH TRA KHẢO THÍ (AUDITOR) */}
              {activeTab === 'ADMIN_AUDIT' && (
                <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-amber-500/30 p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-amber-300 m-0">📜 Nhật Ký Thanh Tra An Ninh Hệ Thống</h3>
                      <p className="text-xs text-slate-400 mt-0.5 mb-0">Lịch sử kiểm toán chữ ký số EIP-191, trạng thái thu hồi khóa và điểm danh thực tế</p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchAdminAuditLogs}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer"
                    >
                      🔄 Làm Mới
                    </button>
                  </div>
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-[#040814] border border-slate-800 flex justify-between text-xs">
                        <span><code className="text-slate-400">[{log.time}]</code> <strong className="text-emerald-300">{log.action}</strong>: {log.detail}</span>
                        <span className="text-cyan-400 font-semibold ml-2">{log.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI (4 CỘT TRÊN MÀN LỚN): DANH SÁCH SINH VIÊN HIỆN DIỆN CÓ TÌM KIẾM & BỘ LỌC */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
              <div className="flex-1 min-h-[520px] rounded-3xl bg-[#081226] border border-slate-800 p-5 flex flex-col overflow-hidden shadow-2xl gap-3.5">
                
                {/* Header Danh sách sinh viên */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide text-white m-0">
                      👥 Danh Sách Hiện Diện ({filteredAttendees.length}/{attendees.length})
                    </h3>
                    <p className="text-[10px] font-mono text-cyan-400 mt-0.5 mb-0">
                      {stageSafeMode ? '🕶️ ĐANG BẬT CHẾ ĐỘ ẨN DANH MÀN CHIẾU (ZKP-LIGHT)' : 'ĐỒNG BỘ WEBSOCKET THỜI GIAN THỰC'}
                    </p>
                  </div>

                  <div className="flex items-center bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
                    {[
                      { id: 'ALL', label: 'Tất cả' },
                      { id: 'VALID', label: 'Hợp lệ' },
                      { id: 'SUSPICIOUS', label: 'Nghi vấn' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRosterFilter(tab.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
                          rosterFilter === tab.id
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ô tìm kiếm nhanh MSSV hoặc Họ tên */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Tìm nhanh theo tên sinh viên hoặc MSSV..."
                    className="w-full py-2 px-3 rounded-xl bg-[#040814] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Danh sách thẻ sinh viên */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[540px]">
                  {filteredAttendees.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono">
                      Không tìm thấy sinh viên nào khớp bộ lọc.
                    </div>
                  ) : (
                    filteredAttendees.map((s) => {
                      const isSuspicious = s.distance > sessionConfig.maxRadiusMeters;
                      const riskInfo = calculateFraudRiskScore(s);
                      return (
                        <div
                          key={s.studentId}
                          className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2 ${
                            isSuspicious || riskInfo.level === 'CRITICAL'
                              ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                              : riskInfo.level === 'WARNING'
                              ? 'bg-amber-950/15 border-amber-500/35 text-slate-200'
                              : 'bg-[#040814]/80 border-slate-800/90 hover:border-cyan-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={s.avatar}
                              alt={s.name}
                              className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 flex-shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-white truncate m-0">{maskStudentName(s.name)}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono text-cyan-400 font-semibold">{maskStudentId(s.studentId)}</span>
                                <span className="text-[10px] text-slate-600">•</span>
                                <span className="text-[10px] font-mono text-slate-400">{s.checkInTime}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold ${
                                  isSuspicious
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  📍 {stageSafeMode ? '✓ Hợp lệ' : `Cách tâm ${s.distance}m`}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                                  riskInfo.level === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : riskInfo.level === 'WARNING'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-900 text-emerald-300'
                                }`}>
                                  Risk: {riskInfo.score}đ
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                            {!stageSafeMode && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFocusedMapStudentId(s.studentId);
                                    setActiveTab('RADAR');
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold hover:bg-cyan-500/25 cursor-pointer"
                                  title="Định vị trực tiếp sinh viên này trên Bản đồ Google Maps"
                                >
                                  📍 Bản Đồ
                                </button>
                                <a
                                  href={`https://www.google.com/maps?q=${s.coords.lat},${s.coords.lon}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono hover:bg-blue-500/20 no-underline"
                                  title="Mở tọa độ trên Google Maps tab mới"
                                >
                                  ↗
                                </a>
                              </div>
                            )}

                            {s.spotCheckStatus === 'PENDING' && (
                              <button
                                onClick={() => handleMockPass(s.studentId)}
                                className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono animate-pulse cursor-pointer"
                                title="Nhấp để giả lập sinh viên quét Face ID thành công"
                              >
                                Chờ Face ID...
                              </button>
                            )}
                            {s.spotCheckStatus === 'VERIFIED' && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                                ✓ Đã xác thực
                              </span>
                            )}
                            {s.spotCheckStatus === 'FAILED' && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold">
                                ✗ Ngoài vùng
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

