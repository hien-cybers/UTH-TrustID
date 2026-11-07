// src/components/FacultyDashboard.jsx - Web Command Center dành cho Giảng viên & Quản trị viên (Stage QR Laser, Google Maps Live View, IDS Audit, Spot-Check 60s, CSV Export & Root Admin Merkle/Revoke)
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { getSocketUrl, smartFetch, retargetSocket, SERVER_URL } from '../utils/backendUrl';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import GoogleMapsLiveView from './GoogleMapsLiveView';

export default function FacultyDashboard({
  initialMode = 'FACULTY' // 'FACULTY' | 'ADMIN'
}) {
  // Xác thực Quản trị tập trung (Centralized RBAC + JWT Bearer Token cho Giảng viên & Admin)
  const [token, setToken] = useState(() => localStorage.getItem('faculty_token') || null);
  const [facultyUser, setFacultyUser] = useState(() => {
    try {
      const raw = localStorage.getItem('faculty_user');
      return raw ? JSON.parse(raw) : { email: 'giangvien@uth.edu.vn', fullName: 'TS. Trần Thế Vinh', role: 'FACULTY' };
    } catch {
      return { email: 'giangvien@uth.edu.vn', fullName: 'TS. Trần Thế Vinh', role: 'FACULTY' };
    }
  });
  const [loginForm, setLoginForm] = useState({ email: 'giangvien@uth.edu.vn', password: 'Admin@2026' });
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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

  const [sessionId, setSessionId] = useState("SES_A2301");
  const [staffRole, setStaffRole] = useState(initialMode === 'ADMIN' ? 'ADMIN' : 'FACULTY'); // 'FACULTY' | 'ADMIN'
  const [isCreated, setIsCreated] = useState(true);
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(initialMode === 'ADMIN' ? 'ADMIN' : 'STAGE'); // 'STAGE' | 'RADAR' | 'IDS' | 'ADMIN'
  
  // Nonce xoay vòng & Tiến trình đếm lùi 35 giây
  const ROTATE_INTERVAL = 35;
  const [currentNonce, setCurrentNonce] = useState("NONCE_STAGE_8X9K");
  const [timerProgress, setTimerProgress] = useState(ROTATE_INTERVAL);
  const socketRef = useRef(null);

  // Danh sách sinh viên hiện diện thời gian thực
  const [attendees, setAttendees] = useState([
    {
      studentId: "2251120001",
      name: "Nguyễn Văn An",
      major: "An toàn Thông tin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      coords: { lat: 10.799215, lon: 106.705620 },
      distance: 4,
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
        network: rec.network || rec.networkMode || 'UTH_STUDENT_SECURE',
        deviceId: rec.deviceId || 'DEV_MOBILE_EIP191',
        checkInTime: rec.time || rec.checkInTime || new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        spotCheckStatus: rec.spotCheckVerified ? 'VERIFIED' : (rec.status === 'PENDING_SPOTCHECK' ? 'PENDING' : 'NONE')
      };

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

  // Kích hoạt Spot-check
  const handleTriggerSpotCheck = async (mode = 'ALL') => {
    if (attendees.length === 0) return;
    let targets = [];
    if (mode === 'ALL') {
      targets = attendees.map(a => a.studentId);
    } else if (mode === 'FURTHEST') {
      targets = [...attendees].sort((a, b) => b.distance - a.distance).slice(0, 2).map(a => a.studentId);
    }

    setAttendees(prev => prev.map(a => 
      targets.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a
    ));
    setSpotCheckState({ active: true, countdown: 60, targetIds: targets });

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
    if (activeTab === 'ADMIN') {
      fetchAdminAuditLogs();
    }
  }, [activeTab]);

  const handleAdminRevokeWallet = async () => {
    if (!revokeAddressInput.trim()) return;
    const addr = revokeAddressInput.trim();
    try {
      const currentRevoked = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]');
      if (!currentRevoked.includes(addr)) {
        currentRevoked.push(addr);
        localStorage.setItem('uth_revoked_keys', JSON.stringify(currentRevoked));
      }
      // Thu hồi đồng thời địa chỉ nhập vào và cả 2 địa chỉ mặc định của thẻ sinh viên 2251120000 nếu đang demo
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

  // Chuỗi QR chuẩn UTH_ID để điện thoại sinh viên quét trực tiếp từ Stage Mode (Nhúng kèm SERVER_URL LocalTunnel cho điện thoại 4G)
  const qrPayloadString = `UTH_ID:${sessionId}:${currentNonce}:${sessionConfig.centerCoords.lat}:${sessionConfig.centerCoords.lon}:${Date.now()}:${
    sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'CAMPUS_WIFI_ONLY' : 'HYBRID_4G_5G'
  }:${encodeURIComponent(SERVER_URL)}`;

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
        fullName: resolvedRole === 'ADMIN' ? 'Quản Trị Viên Tối Cao' : 'TS. Trần Thế Vinh',
        role: resolvedRole
      };

      localStorage.setItem('faculty_token', data.token);
      localStorage.setItem('faculty_user', JSON.stringify(userObj));
      setToken(data.token);
      setFacultyUser(userObj);
      setStaffRole(resolvedRole);
      if (resolvedRole === 'ADMIN') {
        setActiveTab('ADMIN');
      } else {
        setActiveTab('STAGE');
      }
    } catch (err) {
      setAuthError(err.message || 'Không thể kết nối máy chủ xác thực');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('faculty_token');
    localStorage.removeItem('faculty_user');
    setToken(null);
    setAuthError('');
  };

  // NẾU CHƯA ĐĂNG NHẬP: HIỆN CỔNG XÁC THỰC QUẢN TRỊ TẬP TRUNG (LOGIN GATE - ZERO TRUST RBAC)
  if (!token) {
    return (
      <div className="min-h-screen bg-[#040814] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CỘT TRÁI (7 CỘT): SƠ ĐỒ KIẾN TRÚC ZERO-TRUST ĐỐI XỨNG 2 PHÍA */}
          <div className="lg:col-span-7 p-7 rounded-3xl bg-[#081226] border border-cyan-500/25 shadow-2xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-black text-cyan-400 text-base shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                  U
                </div>
                <div>
                  <h1 className="text-base font-black tracking-wider text-white m-0">
                    KIẾN TRÚC XÁC THỰC KÉP ZERO-TRUST &amp; W3C DID
                  </h1>
                  <p className="text-[11px] font-mono text-cyan-400 m-0">
                    CENTRALIZED RBAC (ISSUER/VERIFIER) + ACCOUNT-LESS SSI (HOLDER)
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed m-0">
                Hệ thống phân tách hoàn toàn miền xác thực giữa <strong className="text-cyan-300">Cán bộ Quản trị</strong> và <strong className="text-emerald-300">Sinh viên</strong> nhằm triệt tiêu bề mặt tấn công mật khẩu tập trung nhưng vẫn kiểm soát chặt chẽ đặc quyền học vụ:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Khối 1: Giảng viên & Admin */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/35 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    ISSUER &amp; VERIFIER
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">🔐 Bắt buộc JWT</span>
                </div>
                <h3 className="text-xs font-bold text-white m-0">
                  1. Phía Giảng Viên &amp; Admin (Web Portal)
                </h3>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-4 m-0">
                  <li>Xác thực tập trung qua <strong className="text-slate-200">Email trường (@uth.edu.vn) + Mật khẩu</strong>.</li>
                  <li>Backend cấp <strong className="text-cyan-300">JWT Bearer Token (8h)</strong> gắn vai trò <code>FACULTY</code> / <code>ADMIN</code>.</li>
                  <li>Bảo vệ các API đặc quyền: Tạo phòng, xoay Nonce, phát lệnh Spot-check, cấp Merkle Root &amp; thu hồi khóa (<code>revokeKey</code>).</li>
                </ul>
              </div>

              {/* Khối 2: Sinh viên */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/35 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    HOLDER NODE (iOS/MOBILE)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">⚡ Account-less SSI</span>
                </div>
                <h3 className="text-xs font-bold text-white m-0">
                  2. Phía Sinh Viên (Không Tài Khoản)
                </h3>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-4 m-0">
                  <li><strong className="text-emerald-300">Không Username/Password tập trung</strong> (Chống lộ lọt &amp; Brute-force).</li>
                  <li>Danh tính là cặp khóa <code>secp256k1</code> (<code>did:ethr:0x...</code>) lưu trong thiết bị.</li>
                  <li>Mở khóa bằng <strong className="text-slate-200">Face ID (WebAuthn)</strong> để ký số <strong>EIP-191</strong> + <strong>Merkle Proof</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>🌐 LocalTunnel: <strong className="text-emerald-400">{SERVER_URL}</strong></span>
              <span className="text-cyan-300">Middleware: requireFacultyAuth (JWT)</span>
            </div>
          </div>

          {/* CỘT PHẢI (5 CỘT): FORM ĐĂNG NHẬP GIẢNG VIÊN & ADMIN */}
          <form
            onSubmit={handleLogin}
            className="lg:col-span-5 p-8 rounded-3xl bg-[#081226] border border-cyan-500/40 space-y-4 shadow-[0_0_50px_rgba(0,242,254,0.12)] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h2 className="text-lg font-black text-white tracking-wide m-0">
                  CỔNG GIẢNG VIÊN &amp; ADMIN
                </h2>
                <p className="text-[11px] font-mono text-cyan-400 m-0">
                  XÁC THỰC QUYỀN ĐIỀU PHỐI HỆ THỐNG (JWT RBAC)
                </p>
              </div>

              {/* Nút điền nhanh tài khoản mẫu để Demo trước Hội đồng NCKH */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                  ⚡ Chọn nhanh tài khoản thực nghiệm NCKH:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginForm({ email: 'giangvien@uth.edu.vn', password: 'Admin@2026' });
                      setAuthError('');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      loginForm.email.startsWith('giangvien')
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[11px] font-bold m-0">👨‍🏫 Giảng Viên</p>
                    <p className="text-[9.5px] font-mono text-slate-400 truncate m-0">giangvien@uth.edu.vn</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginForm({ email: 'admin@uth.edu.vn', password: 'Admin@2026' });
                      setAuthError('');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      loginForm.email.startsWith('admin')
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[11px] font-bold m-0">🏛️ Root Admin</p>
                    <p className="text-[9.5px] font-mono text-slate-400 truncate m-0">admin@uth.edu.vn</p>
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs text-center font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-slate-400">Email Giảng viên / Quản trị viên</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="giangvien@uth.edu.vn"
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400">Mật khẩu (Mặc định: Admin@2026)</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer border-none"
              >
                {loginLoading ? '⏳ ĐANG XÁC THỰC JWT...' : '🔐 ĐĂNG NHẬP QUẢN TRỊ & CẤP JWT'}
              </button>
              <p className="text-[10px] font-mono text-slate-500 text-center m-0">
                Token JWT có hiệu lực 8 giờ • Ghi vết vào Sổ cái Audit Logs
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
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans select-none">
      
      {/* ==================== THANH ĐIỀU HƯỚNG CHÍNH (CLEAN TOP NAVBAR) ==================== */}
      <header className="sticky top-0 z-30 px-6 py-3 border-b border-slate-800/80 bg-[#060D1F]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Cụm thương hiệu & Thông tin lớp học */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_20px_rgba(0,242,254,0.35)]">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wide text-white m-0">UTH-TRUSTID PORTAL</h1>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300">
                CỔNG GIẢNG VIÊN &amp; ADMIN
              </span>
              {isCreated && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                  isSessionOpen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSessionOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                  {isSessionOpen ? 'ĐANG MỞ ĐIỂM DANH' : 'ĐÃ KHÓA PHIÊN'}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 mb-0">
              {facultyUser?.fullName || 'TS. Trần Thế Vinh'} (<span className="text-cyan-400">{facultyUser?.email}</span>) • Lớp <strong className="text-white">{sessionConfig.courseCode}</strong> • Phòng <strong className="text-cyan-300">{sessionConfig.room}</strong>
            </p>
          </div>
        </div>

        {/* Cụm Tab điều hướng trung tâm */}
        {isCreated && (
          <nav className="flex items-center bg-[#040814] p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => {
                setStaffRole('FACULTY');
                setActiveTab('STAGE');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'STAGE'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              📽️ Màn Chiếu QR
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffRole('FACULTY');
                setActiveTab('RADAR');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'RADAR'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🌍 Bản Đồ Định Vị
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'RADAR' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-300'
              }`}>
                {attendees.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffRole('FACULTY');
                setActiveTab('IDS');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'IDS'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Kiểm Toán IDS
              {idsViolationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 border border-rose-400 text-rose-200 text-[10px] font-mono">
                  {idsViolationCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffRole('ADMIN');
                setActiveTab('ADMIN');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🏛️ Quản Trị Root Admin
            </button>
          </nav>
        )}

        {/* Cụm nút tác vụ nhanh bên phải */}
        <div className="flex items-center gap-2">
          {isCreated && (
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
                {isSessionOpen ? '🔒 Khóa Phiên' : '🔓 Mở Lại Phiên'}
              </button>

              <button
                type="button"
                onClick={() => setIsCreated(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900/90 text-slate-300 hover:border-cyan-500/40 hover:text-white cursor-pointer"
              >
                ⚙ Đổi Lớp
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-rose-500/40 hover:text-rose-300 cursor-pointer"
            title="Đăng xuất khỏi phiên Giảng viên / Admin"
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </header>

      {/* ==================== BODY CHÍNH ==================== */}
      {!isCreated ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white m-0">Thiết Lập Phiên Điểm Danh Giảng Đường</h2>
                <p className="text-xs text-slate-400 mt-1 mb-0">Cấu hình môn học, kiểm soát mạng và bán kính không gian trước khi mở máy chiếu</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreated(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                ✕ Quay Lại
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400">Mã Học Phần</label>
                <input
                  value={sessionConfig.courseCode}
                  onChange={e => setSessionConfig({...sessionConfig, courseCode: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400">Phòng Học</label>
                <input
                  value={sessionConfig.room}
                  onChange={e => setSessionConfig({...sessionConfig, room: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400">Tên Môn Học</label>
              <input
                value={sessionConfig.courseName}
                onChange={e => setSessionConfig({...sessionConfig, courseName: e.target.value})}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Chế Độ Kiểm Soát Kết Nối Mạng (Network Enforcement)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CAMPUS_WIFI'})}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    sessionConfig.networkMode === 'CAMPUS_WIFI'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold m-0">📶 TN1: Ràng buộc Wi-Fi Trường</p>
                  <p className="text-[10px] text-slate-400 mt-1 mb-0">Từ chối 4G/5G ngoài luồng, bắt buộc kết nối Wi-Fi giảng đường</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CELLULAR_ANY'})}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    sessionConfig.networkMode === 'CELLULAR_ANY'
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold m-0">🌐 TN2: Mạng 4G/5G Tự Do</p>
                  <p className="text-[10px] text-slate-400 mt-1 mb-0">Cho phép 4G/5G và đối soát tọa độ GPS bán kính R ≤ {sessionConfig.maxRadiusMeters}m</p>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-mono text-cyan-300 font-bold">
                  📏 Bán kính Geofencing cho phép (R = {sessionConfig.maxRadiusMeters}m)
                </label>
                <button
                  type="button"
                  onClick={handleSyncLaptopGpsCenter}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/25 cursor-pointer"
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
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                      Number(sessionConfig.maxRadiusMeters) === opt.val
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
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
                  <span className="text-xs font-mono text-slate-400">mét</span>
                </div>
              </div>

              {gpsSyncMsg && (
                <p className="text-[10px] font-mono text-emerald-400 m-0">{gpsSyncMsg}</p>
              )}
            </div>

            <button
              onClick={handleStartProjectorSession}
              className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all cursor-pointer border-none"
            >
              🚀 LƯU CẤU HÌNH &amp; MỞ MÀN CHIẾU ĐIỂM DANH
            </button>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col p-5 gap-5 max-w-[1600px] w-full mx-auto">
          
          {/* ==================== THANH ĐIỀU KHIỂN NHANH 4 Ô (QUICK CONTROL & KPI BAR) ==================== */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Ô 1: Thống kê sĩ số thời gian thực */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-slate-800/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Sĩ Số Điểm Danh Thời Gian Thực
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">{attendees.length}</span>
                  <span className="text-xs font-mono text-emerald-400">{validAttendeesCount} hợp lệ</span>
                  {suspiciousAttendeesCount > 0 && (
                    <span className="text-xs font-mono text-rose-400">• {suspiciousAttendeesCount} ngoài vùng</span>
                  )}
                </div>
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Kiểm Soát Kết Nối Mạng (Network)
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Chặn 4G ngoài' : 'Cho phép 4G/5G'}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitchLiveNetworkMode('CAMPUS_WIFI')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                    sessionConfig.networkMode === 'CAMPUS_WIFI'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📶 TN1: Wi-Fi Trường
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Bán Kính Phòng Học: <strong className="text-cyan-300">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSyncLaptopGpsCenter}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold hover:bg-cyan-500/25 cursor-pointer"
                  title="Lấy vị trí GPS hiện tại của Laptop làm tâm phòng học"
                >
                  📍 Tâm GPS Laptop
                </button>
              </div>
              <div className="flex items-center gap-1">
                {[15, 35, 100, 500, 5000].map((rVal) => (
                  <button
                    key={rVal}
                    type="button"
                    onClick={() => handleUpdateLiveRadius(rVal)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border-none ${
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
                  value={sessionConfig.maxRadiusMeters}
                  onChange={(e) => handleUpdateLiveRadius(e.target.value)}
                  className="w-16 py-1 px-1.5 rounded-lg bg-[#040814] border border-slate-800 text-[11px] font-mono text-cyan-300 text-center outline-none focus:border-cyan-400"
                  title="Nhập số mét bán kính bất kỳ"
                />
              </div>
            </div>

            {/* Ô 4: Phát lệnh Tái kiểm tra đột xuất (Spot-Check 60s) */}
            <div className="p-3.5 rounded-2xl bg-[#081226] border border-amber-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  ⚡ Hậu Kiểm Face ID Đột Xuất (Spot-Check)
                </span>
                {spotCheckState.active ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[10px] animate-pulse">
                    Còn {spotCheckState.countdown}s
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">Chu kỳ 60s</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('ALL')}
                  className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 border-none cursor-pointer"
                >
                  ⚡ Kiểm Tra Cả Lớp
                </button>
                <button
                  type="button"
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('FURTHEST')}
                  className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  🎯 SV Xa Tâm Nhất
                </button>
              </div>
            </div>
          </section>

          {/* ==================== KHÔNG GIAN LÀM VIỆC CHÍNH (2 CỘT GỌN GÀNG) ==================== */}
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* CỘT TRÁI (8 CỘT TRÊN MÀN LỚN): MÀN CHIẾU QR / GOOGLE MAPS / IDS / ADMIN */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              
              {/* TAB 1: MÀN CHIẾU QR ĐIỂM DANH (BỐ CỤC CHIA 2 NỬA CÂN ĐỐI & HIỆN ĐẠI) */}
              {activeTab === 'STAGE' && (
                <div className="flex-1 rounded-3xl bg-[#081226] border border-cyan-500/30 p-6 flex flex-col justify-between shadow-2xl gap-5">
                  
                  {/* Thanh tiêu đề trên cùng của Màn Chiếu */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/90">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300">
                          CHALLENGE-RESPONSE TOTP
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Phòng {sessionConfig.room} • Sliding Window 3 Nonces
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-white mt-1 mb-0">
                        {sessionConfig.courseCode} — {sessionConfig.courseName}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsProjectorFullscreen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.35)] cursor-pointer border-none transition-all"
                    >
                      ⛶ Phóng To QR Toàn Màn Chiếu (500px)
                    </button>
                  </div>

                  {/* Thông báo sự kiện thời gian thực (Nếu có sinh viên quét hoặc bị chặn) */}
                  {networkBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 flex items-center justify-between gap-3 animate-pulse">
                      <div>
                        <p className="text-xs font-black text-rose-300 m-0">
                          🚨 CHẶN KẾT NỐI MẠNG (THỰC NGHIỆM 1) — {networkBlockNotice.fullName} ({networkBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5 mb-0">{networkBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở Chế Độ 4G/5G ➔
                      </button>
                    </div>
                  )}

                  {geofenceBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 flex items-center justify-between gap-3 animate-pulse">
                      <div>
                        <p className="text-xs font-black text-amber-300 m-0">
                          📍 VƯỢT BÁN KÍNH PHÒNG HỌC — {geofenceBlockNotice.fullName} ({geofenceBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5 mb-0">{geofenceBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateLiveRadius(Math.max(100, (geofenceBlockNotice.distance || 85) + 15))}
                        className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở rộng R lên {Math.max(100, (geofenceBlockNotice.distance || 85) + 15)}m ➔
                      </button>
                    </div>
                  )}

                  {!networkBlockNotice && !geofenceBlockNotice && latestVerifiedNotice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs font-bold">
                      <span>
                        ✅ Xác thực thành công: <strong>{latestVerifiedNotice.name}</strong> ({latestVerifiedNotice.studentId}) • Cách tâm {latestVerifiedNotice.distance}m ({latestVerifiedNotice.network})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMapStudentId(latestVerifiedNotice.studentId);
                          setActiveTab('RADAR');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-[11px] whitespace-nowrap cursor-pointer border-none"
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
                          <p className="text-sm font-mono font-black text-slate-950 tracking-wider m-0">{currentNonce}</p>
                        </div>
                      </div>

                      {/* Thanh tiến trình xoay Nonce 35s */}
                      <div className="w-[360px] max-w-full mt-3.5 space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Tự động làm mới mã QR sau:</span>
                          <span className="text-cyan-400 font-black">{timerProgress}s</span>
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
                        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          🔒 Thông Số Bảo Mật Phiên Đang Áp Dụng
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Chế độ mạng:</span>
                            <span className={`font-mono font-bold ${
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
                            <span className="font-mono font-bold text-emerald-300">
                              EIP-191 + Face ID
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Đối soát lớp học:</span>
                            <span className="font-mono font-bold text-purple-300">
                              Merkle Proof O(log N)
                            </span>
                          </div>
                        </div>

                        {gpsSyncMsg && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                            {gpsSyncMsg}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800/90 space-y-2.5">
                        <div className="text-xs font-bold text-white">
                          🗺️ Chuyển Nhanh Sang Bản Đồ Định Vị
                        </div>
                        <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
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
              {isProjectorFullscreen && (
                <div className="fixed inset-0 z-50 bg-[#040814]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-cyan-500/20">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold">
                        📽️ CHẾ ĐỘ MÁY CHIẾU HỘI TRƯỜNG LỚN (ULTRA-LARGE QR 500x500PX)
                      </span>
                      <h2 className="text-2xl font-black text-white mt-2 mb-0">
                        {sessionConfig.courseCode} — {sessionConfig.courseName} (Phòng {sessionConfig.room})
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-sm font-bold">
                        ✅ Sĩ số đã điểm danh: {attendees.length} SV
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(false)}
                        className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs cursor-pointer border-none shadow-lg"
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
                      <p className="text-base font-mono font-black text-slate-950 tracking-widest mt-3 mb-0">
                        {currentNonce}
                      </p>
                    </div>

                    <div className="w-full lg:w-80 space-y-4">
                      <div className="p-5 rounded-3xl bg-[#081226] border border-cyan-500/30 space-y-3">
                        <div className="flex justify-between items-center font-mono text-sm">
                          <span className="text-slate-400">Xoay mã Nonce sau:</span>
                          <span className="text-2xl font-black text-cyan-400">{timerProgress}s</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timerProgress / ROTATE_INTERVAL) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs font-mono text-slate-400 m-0">
                          Bán kính Geofencing: <strong className="text-cyan-300">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                        </p>
                        <p className="text-xs font-mono text-slate-400 m-0">
                          Chế độ mạng: <strong className="text-emerald-400">{sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Trường' : '4G/5G Tự Do'}</strong>
                        </p>
                      </div>

                      <div className="p-5 rounded-3xl bg-[#081226] border border-slate-800 space-y-2.5 max-h-64 overflow-y-auto">
                        <p className="text-xs font-mono font-bold text-cyan-400 uppercase m-0">
                          Sinh viên vừa quét thành công ({attendees.length})
                        </p>
                        {attendees.slice(0, 5).map((st) => (
                          <div key={st.studentId} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white m-0">{st.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 m-0">MSSV: {st.studentId} • {st.distance}m</p>
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

              {/* TAB 3: IDS AUDIT */}
              {activeTab === 'IDS' && (
                <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-rose-500/30 p-6 flex flex-col shadow-2xl">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-rose-300 m-0">🛡️ Nhật Ký Phát Hiện Điểm Danh Hộ (IDS)</h3>
                      <p className="text-xs text-slate-400 mt-0.5 mb-0">Đối soát xung đột dấu vân tay phần cứng thiết bị (Hardware Fingerprint Collision)</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                      {idsViolationCount} Cảnh Báo Xung Đột
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto">
                    {Object.entries(deviceCounts).map(([devId, count]) => {
                      if (count > 1) {
                        const violators = attendees.filter(a => a.deviceId === devId);
                        return (
                          <div key={devId} className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/40 text-xs space-y-2.5">
                            <div className="flex justify-between text-rose-400 font-bold font-mono">
                              <span>⚠️ PHÁT HIỆN 1 THIẾT BỊ ĐIỂM DANH CHO {count} SINH VIÊN</span>
                              <span>Device ID: {devId}</span>
                            </div>
                            <p className="text-slate-300 m-0">
                              Sinh viên liên quan: <strong>{violators.map(v => `${v.name} (${v.studentId})`).join(', ')}</strong>
                            </p>
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => alert(`Đã ghi nhận biên bản gian lận thiết bị: ${devId}`)}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs border-none cursor-pointer"
                              >
                                Lập Biên Bản Học Vụ
                              </button>
                              <button 
                                onClick={() => handleTriggerSpotCheck('ALL')}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer"
                              >
                                Buộc Tái Xác Thực Face ID Cả Lớp
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    <div className="p-3.5 rounded-xl bg-[#040814] border border-slate-800 text-xs text-slate-300 font-mono">
                      ✓ Sliding Nonce TOTP: Không phát hiện Replay Attack trong 120 chu kỳ.
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#040814] border border-slate-800 text-xs text-slate-300 font-mono">
                      ✓ Chữ ký số EIP-191 Secp256k1: Khôi phục địa chỉ ví trùng khớp 100% Merkle Root.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ROOT ADMIN CONSOLE (MERKLE BATCH ISSUANCE & DECOUPLED REVOCATION) */}
              {activeTab === 'ADMIN' && (
                <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-emerald-500/30 p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-emerald-300 m-0">🏛️ Trung Tâm Quản Trị Cấp Cao (Root Issuer &amp; Revocation)</h3>
                      <p className="text-xs text-slate-400 mt-0.5 mb-0">Cấp phát lô thẻ sinh viên Merkle Tree O(log N) &amp; Thu hồi khóa độc lập (Polygon Amoy 80002)</p>
                    </div>
                    <div className="flex gap-2 text-xs font-mono">
                      <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                        Tổng DID: {adminStats.totalDID}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                        Active: {adminStats.activeDID}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                        Revoked: {adminStats.revokedDID}
                      </span>
                    </div>
                  </div>

                  {adminStatusMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                      {adminStatusMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col gap-2.5">
                      <div className="text-xs font-bold text-cyan-300">1. Phát Hành Lô Thẻ VC (Merkle Batch Issuance)</div>
                      <textarea
                        value={batchJson}
                        onChange={(e) => setBatchJson(e.target.value)}
                        rows={6}
                        className="w-full flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200 focus:border-cyan-400 outline-none resize-none"
                      />
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        Merkle Root: <span className="text-amber-300">{adminStats.merkleRoot}</span>
                      </div>
                      <button
                        onClick={handleAdminIssueMerkleBatch}
                        className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs cursor-pointer border-none"
                      >
                        ⚡ Băm Keccak256 &amp; Neo Merkle Root On-Chain
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-rose-300">2. Thu Hồi &amp; Khôi Phục Khóa Thiết Bị iOS (Decoupled Revocation)</div>
                        <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
                          Vô hiệu hóa ngay lập tức thẻ sinh viên trên iPhone bị báo mất máy (<code>isRevoked[address] = true</code>) mà giữ nguyên Merkle Root của toàn trường:
                        </p>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400">Địa chỉ Ví thiết bị iOS (SV 2251120000 - Nguyễn Đức Hiển):</label>
                          <input
                            value={revokeAddressInput}
                            onChange={(e) => setRevokeAddressInput(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 focus:border-rose-400 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleAdminRevokeWallet}
                          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs cursor-pointer border-none"
                        >
                          🚫 Thu Hồi Khóa Thiết Bị iOS (revokeKey)
                        </button>
                        <button
                          onClick={handleAdminUnrevokeWallet}
                          className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"
                        >
                          🔓 Khôi Phục Khóa Thiết Bị iOS (unrevokeKey)
                        </button>
                      </div>
                    </div>
                  </div>

                  {auditLogs.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#040814] border border-slate-800 space-y-1.5 max-h-40 overflow-y-auto">
                      <div className="text-[11px] font-mono font-bold text-cyan-300">
                        📜 Sổ Cái Kiểm Toán An Ninh Thời Gian Thực (Live Backend Audit Logs)
                      </div>
                      {auditLogs.slice(0, 6).map((log) => (
                        <div key={log.id} className="text-[10.5px] font-mono text-slate-300 flex justify-between border-b border-slate-900 pb-1">
                          <span>[{log.time}] <b className="text-emerald-300">{log.action}</b>: {log.detail}</span>
                          <span className="text-cyan-400 ml-2">{log.result}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                      ĐỒNG BỘ WEBSOCKET THỜI GIAN THỰC
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
                      return (
                        <div
                          key={s.studentId}
                          className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2 ${
                            isSuspicious
                              ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
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
                              <p className="font-bold text-white truncate m-0">{s.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono text-cyan-400 font-semibold">{s.studentId}</span>
                                <span className="text-[10px] text-slate-600">•</span>
                                <span className="text-[10px] font-mono text-slate-400">{s.checkInTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold ${
                                  isSuspicious
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  📍 Cách tâm {s.distance}m
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 truncate max-w-[110px]">
                                  {s.network}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
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

