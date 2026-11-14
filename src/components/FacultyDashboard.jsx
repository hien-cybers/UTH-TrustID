// src/components/FacultyDashboard.jsx - Web Command Center dành cho Giảng viên & Quản trị viên (Stage QR Laser, Google Maps Live View, IDS Audit, Spot-Check 60s, CSV Export & Root Admin Merkle/Revoke)
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import {
  BookOpen,
  QrCode,
  MapPin,
  ShieldAlert,
  Users,
  Download,
  Plus,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Search,
  Clock,
  Wifi,
  Radio,
  UserPlus,
  Trash2,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Layers,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { getSocketUrl, smartFetch, retargetSocket, SERVER_URL } from '../utils/backendUrl';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import { toggleTheme } from '../utils/theme';
import GoogleMapsLiveView from './GoogleMapsLiveView';

export default function FacultyDashboard({
  initialMode = 'FACULTY' // 'FACULTY' | 'ADMIN'
}) {
  useEffect(() => {
    toggleTheme();
  }, []);
  // Xác thực Quản trị tập trung (Centralized RBAC + JWT Bearer Token cho Giảng viên & Admin)
  const [token, setToken] = useState(() => localStorage.getItem('faculty_token') || null);
  const [facultyUser, setFacultyUser] = useState(() => {
    try {
      const raw = localStorage.getItem('faculty_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.role === 'AUDITOR') {
          return {
            email: 'giangvien@uth.edu.vn',
            fullName: 'TS. Trần Thế Vinh',
            department: 'Khoa Công nghệ Thông tin',
            role: 'FACULTY'
          };
        }
        return parsed;
      }
      return {
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
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'email' | 'password' | null
  const [loginParallax, setLoginParallax] = useState({ x: 0, y: 0 });
  const [loginHelperNotice, setLoginHelperNotice] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Mô hình Kiến Trúc Phân Cấp 1 - N (1 Lớp học -> Nhiều Buổi học con):
  // Danh sách sinh viên đăng ký môn học gốc (Enrolled Roster) — Dùng cho Ma trận Chuyên cần Lũy kế & Smart Inheritance
  const DEFAULT_ENROLLED_ROSTER = [
    { studentId: '2251120000', name: 'Nguyễn Đức Hiển', major: 'An toàn Thông tin' },
    { studentId: '2251120001', name: 'Nguyễn Văn An', major: 'An toàn Thông tin' },
    { studentId: '2251120002', name: 'Trần Thị Mai', major: 'Khoa học Máy tính' },
    { studentId: '2251120003', name: 'Lê Hoàng Quân', major: 'Hệ thống Thông tin' },
    { studentId: '2251120004', name: 'Phạm Minh Tuấn', major: 'Kỹ thuật Phần mềm' },
    { studentId: '2251120005', name: 'Hoàng Bảo Ngọc', major: 'An toàn Thông tin' }
  ];

  // Hàm băm SHA-256 / Keccak mô phỏng phía Client để đối soát tức thì tính toàn vẹn của buổi học đã chốt sổ
  const computeLocalSessionHash = (sid, attendeesArr = []) => {
    const normalized = [...attendeesArr]
      .sort((a, b) => String(a.studentId || '').localeCompare(String(b.studentId || '')))
      .map((a) => `${a.studentId}:${a.status || 'VERIFIED'}:${a.distance ?? 0}m`)
      .join('|');
    const raw = `${sid}::${normalized}::${attendeesArr.length}`;
    let h1 = 0xdeadbeef ^ raw.length;
    let h2 = 0x41c6ce57 ^ raw.length;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `0x${hex1}${hex2}${hex1}${hex2}${hex1}${hex2}${hex1}${hex2}`;
  };

  // Danh mục lớp học khởi tạo rỗng ban đầu — Chỉ hiển thị khi Giảng viên tạo lớp mới
  const INITIAL_COURSES_DB = [];

  const [courses, setCourses] = useState(() => {
    try {
      localStorage.removeItem('uth_courses_catalog_v4');
      localStorage.removeItem('uth_courses_catalog_v3');
      localStorage.removeItem('uth_courses_catalog_v2');
      const saved = localStorage.getItem('uth_courses_catalog_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_COURSES_DB;
  });

  const saveCoursesToStorage = (nextCourses) => {
    setCourses(nextCourses);
    try {
      localStorage.setItem('uth_courses_catalog_v5', JSON.stringify(nextCourses));
    } catch {}
    smartFetch('/api/courses/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses: nextCourses })
    }).catch(() => {});
  };

  const [activeCourseId, setActiveCourseId] = useState('');
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    courseCode: '',
    courseName: '',
    defaultRoom: '',
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 2 • Ca 1 (07:30 - 10:00)',
    totalStudents: 50
  });
  const [historyCourseId, setHistoryCourseId] = useState(null);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState('ALL');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [finalizedBannerNotice, setFinalizedBannerNotice] = useState(null);

  // Cấu hình phiên học của buổi điểm danh đang mở
  const [sessionConfig, setSessionConfig] = useState({
    courseCode: '',
    courseName: '',
    room: '',
    centerCoords: { lat: 10.799200, lon: 106.705600 },
    maxRadiusMeters: 35,
    networkMode: 'CELLULAR_ANY', // 'CAMPUS_WIFI' | 'CELLULAR_ANY'
    campusSsid: 'UTH_STUDENT_SECURE'
  });

  const resolvedInitialRole =
    facultyUser?.role === 'ADMIN' || initialMode === 'ADMIN' ? 'ADMIN' : 'FACULTY';
  const [sessionId, setSessionId] = useState('');
  const [staffRole, setStaffRole] = useState(resolvedInitialRole); // 'FACULTY' | 'ADMIN'
  // Mặc định isCreated = false đối với Giảng viên — Hiển thị màn hình Quản lý Danh mục Lớp học (Course Hub)
  const [isCreated, setIsCreated] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    resolvedInitialRole === 'ADMIN' ? 'ADMIN_ISSUANCE' : 'STAGE'
  );
  
  // Đồng hồ thời gian thực trên Executive Topbar
  const [liveClock, setLiveClock] = useState(() => new Date());
  useEffect(() => {
    const clockTimer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Bộ 3 Mẫu Học Phần Thông Minh (1-Click Presets)
  const COURSE_PRESETS = [
    {
      courseCode: 'IT402.N01',
      courseName: 'An toàn Mạng máy tính & Ứng dụng',
      defaultRoom: 'A2-301',
      defaultRadius: 35,
      defaultNetworkMode: 'CELLULAR_ANY',
      schedule: 'Thứ 2 • Ca 3 (13:30 - 16:00)',
      totalStudents: 60
    },
    {
      courseCode: 'IT308.N02',
      courseName: 'Mật mã học & An ninh Blockchain',
      defaultRoom: 'B1-405',
      defaultRadius: 35,
      defaultNetworkMode: 'CELLULAR_ANY',
      schedule: 'Thứ 4 • Ca 1 (07:30 - 10:00)',
      totalStudents: 55
    },
    {
      courseCode: 'IT205.N01',
      courseName: 'Hệ điều hành & Bảo mật Hệ thống',
      defaultRoom: 'C3-202',
      defaultRadius: 35,
      defaultNetworkMode: 'CAMPUS_WIFI',
      schedule: 'Thứ 6 • Ca 2 (09:30 - 12:00)',
      totalStudents: 50
    }
  ];

  // Tìm kiếm & Lọc Sổ điểm toàn kỳ + Modal Điểm danh thủ công tại lớp
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyEligibilityFilter, setHistoryEligibilityFilter] = useState('ALL'); // 'ALL' | 'QUALIFIED' | 'WARNING'
  const [showManualCheckInModal, setShowManualCheckInModal] = useState(false);
  const [manualCheckInContext, setManualCheckInContext] = useState(null); // null => live STAGE; { course, session } => history session
  const [manualForm, setManualForm] = useState({
    studentId: '',
    name: '',
    major: 'An toàn Thông tin',
    reason: 'Quên điện thoại / Hết pin'
  });

  // Nonce xoay vòng & Chu kỳ tùy chỉnh (15s / 35s / 60s)
  const [rotateInterval, setRotateInterval] = useState(35);
  const rotateIntervalRef = useRef(35);
  useEffect(() => {
    rotateIntervalRef.current = rotateInterval;
  }, [rotateInterval]);
  const [currentNonce, setCurrentNonce] = useState('NONCE_STAGE_8X9K');
  const [timerProgress, setTimerProgress] = useState(35);
  const socketRef = useRef(null);

  // Danh sách sinh viên hiện diện thời gian thực (Khởi tạo rỗng, đồng bộ khi sinh viên quét QR)
  const [attendees, setAttendees] = useState([]);

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
  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 'ids_seed_1',
      type: 'REPLAY_ATTACK',
      vectorLabel: 'Chặn Replay Attack (QR Đã Hết Hạn)',
      studentId: '2251120003',
      studentName: 'Lê Hoàng Quân',
      address: '0x88fA...91B2',
      deviceId: 'HYBRID:iOS17:ZaloForward:91b2',
      severity: 'CRITICAL',
      defenseLayer: 'Dynamic Nonce 35s + Single-Use Token',
      detail: 'Từ chối gói tin điểm danh dùng lại mã QR đã hết hạn (Nonce TTL > 35s). Chặn tấn công chụp ảnh màn hình gửi qua Zalo.',
      time: '08:15:22'
    },
    {
      id: 'ids_seed_2',
      type: 'DEVICE_SPOOFING',
      vectorLabel: 'Chặn Giả Mạo Khóa & Chữ Ký Số',
      studentId: '2251120004',
      studentName: 'Phạm Minh Tuấn',
      address: '0x92eD...CBA6',
      deviceId: 'HYBRID:Linux:CurlScript:cba6',
      severity: 'CRITICAL',
      defenseLayer: 'ECDSA secp256k1 + FIDO2 Passkey',
      detail: 'Chữ ký EIP-191 khôi phục địa chỉ ví không khớp với khóa công khai DID đã neo trong Sổ bộ Merkle Root.',
      time: '08:19:40'
    },
    {
      id: 'ids_seed_3',
      type: 'PROXY_ATTENDANCE',
      vectorLabel: 'Chặn Điểm Danh Hộ (1 Máy 2 SV)',
      studentId: '2251120002',
      studentName: 'Trần Thị Mai',
      address: '0x44cB...77E1',
      deviceId: 'HYBRID:iPhone15Pro:Enclave:882a',
      severity: 'HIGH',
      defenseLayer: 'Hardware Device Fingerprint Binding',
      detail: 'Thiết bị HYBRID:iPhone15Pro:Enclave:882a vừa ký điểm danh cho SV 2251120001, bị chặn khi cố điểm danh hộ cho SV 2251120002.',
      time: '08:24:05'
    },
    {
      id: 'ids_seed_4',
      type: 'GEOFENCE_BREACH',
      vectorLabel: 'Chặn Ngoài Vùng / Fake GPS',
      studentId: '2251120005',
      studentName: 'Hoàng Bảo Ngọc',
      address: '0x71dE...33F9',
      deviceId: 'HYBRID:Android:MockLocation:33f9',
      severity: 'HIGH',
      defenseLayer: 'Haversine Geofence + Kalman Filter',
      detail: 'Phát hiện tọa độ cách phòng học 412m kèm sai số GPS = 0.00m (Dấu hiệu phần mềm Fake GPS / Mock Location).',
      time: '08:28:51'
    }
  ]);
  const [simulatingAttack, setSimulatingAttack] = useState(false);
  const [networkBlockNotice, setNetworkBlockNotice] = useState(null);
  const [geofenceBlockNotice, setGeofenceBlockNotice] = useState(null);
  const [latestVerifiedNotice, setLatestVerifiedNotice] = useState(null);
  const [gpsSyncMsg, setGpsSyncMsg] = useState('');
  const [focusedMapStudentId, setFocusedMapStudentId] = useState(null);
  const [isProjectorFullscreen, setIsProjectorFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState('ALL'); // 'ALL' | 'VALID' | 'SUSPICIOUS'
  const [stageSafeMode, setStageSafeMode] = useState(false);
  const [statusBannerMsg, setStatusBannerMsg] = useState('');

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

    smartFetch('/api/courses')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.courses)) {
          setCourses((prev) => {
            if (d.courses.length > 0) {
              try {
                localStorage.setItem('uth_courses_catalog_v5', JSON.stringify(d.courses));
              } catch {}
              return d.courses;
            }
            if (prev.length > 0) {
              smartFetch('/api/courses/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courses: prev })
              }).catch(() => {});
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    smartFetch('/api/session/active')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d?.active && d?.session && d.session.isOpen) {
          const s = d.session;
          setSessionId(s.sessionId || 'SES_A2301');
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

      setAttendees((prev) => {
        const exists = prev.some((item) => item.studentId === sid);
        const nextList = exists
          ? prev.map((item) => (item.studentId === sid ? { ...item, ...mapped } : item))
          : [mapped, ...prev];

        // Tự động lưu đồng bộ sinh viên vừa điểm danh từ App vào buổi học hiện tại trong danh mục lớp
        try {
          setCourses((prevCourses) => {
            const targetCourseCode = rec.courseCode;
            const targetSid = rec.sessionId;
            const updated = prevCourses.map((c) => {
              if (targetCourseCode && c.courseCode !== targetCourseCode && (c.courseId || c.id) !== rec.classId) return c;
              const sessList = Array.isArray(c.sessions) ? c.sessions : [];
              if (!targetSid || !sessList.some((s) => s.sessionId === targetSid)) return c;
              return {
                ...c,
                sessions: sessList.map((s) =>
                  s.sessionId === targetSid
                    ? {
                        ...s,
                        attendees: nextList.map((a) => ({
                          studentId: a.studentId,
                          name: a.name,
                          major: a.major,
                          checkInTime: a.checkInTime,
                          distance: a.distance,
                          status: a.distance <= 100 ? 'VERIFIED' : 'OUT_OF_RANGE',
                          signatureHash: a.signatureHash
                        }))
                      }
                    : s
                )
              };
            });
            localStorage.setItem('uth_courses_catalog_v5', JSON.stringify(updated));
            return updated;
          });
        } catch {}

        return nextList;
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

    // Lắng nghe đồng bộ danh mục lớp học phần (courses-updated) từ Backend
    socket.on('courses-updated', (payload) => {
      if (Array.isArray(payload?.courses)) {
        setCourses(payload.courses);
        try {
          localStorage.setItem('uth_courses_catalog_v5', JSON.stringify(payload.courses));
        } catch {}
      }
    });

    // Lắng nghe sự kiện Sinh viên kích hoạt Ví lần đầu qua Gmail OTP & FIDO2 (Stage 1 Enrollment)
    socket.on('enrollment-otp-sent', (payload) => {
      if (payload?.studentId) {
        setAuditLogs((prev) => [
          {
            id: 'otp_' + Date.now(),
            time: new Date().toLocaleTimeString('vi-VN'),
            action: 'Gửi OTP Kích Hoạt Ví (Stage 1)',
            detail: `Đã gửi OTP 6 số về ${payload.email} cho SV ${payload.name} (${payload.studentId})`,
            result: 'Thành công'
          },
          ...prev.slice(0, 49)
        ]);
      }
    });

    socket.on('identity-enrolled', (payload) => {
      if (payload?.studentId) {
        setAuditLogs((prev) => [
          {
            id: 'enroll_' + Date.now(),
            time: new Date().toLocaleTimeString('vi-VN'),
            action: 'Kích Hoạt Ví FIDO2 & Khóa secp256k1',
            detail: `SV ${payload.fullName} (${payload.studentId}) đã neo khóa DID ${payload.address?.slice(0, 8)}...`,
            result: 'ACTIVE'
          },
          ...prev.slice(0, 49)
        ]);
      }
    });

    // Lắng nghe sự kiện hủy kết quả điểm danh gian lận từ Giảng viên
    socket.on('attendee-revoked', (payload) => {
      const revokedMssv = payload?.studentId;
      if (revokedMssv) {
        setAttendees((prev) => prev.filter((a) => a.studentId !== revokedMssv));
        setStatusBannerMsg(
          `Đã đình chỉ & hủy kết quả điểm danh của SV ${payload.studentName || revokedMssv} (${revokedMssv})`
        );
      }
    });

    // Lắng nghe cảnh báo IDS thời gian thực (Replay Attack, Device Spoofing, Xung đột thiết bị, Mock GPS)
    socket.on('ids-alert', (alert) => {
      if (alert) {
        setSecurityAlerts((prev) => {
          const exists = prev.some((item) => item.id === alert.id);
          if (exists) return prev;
          return [alert, ...prev.slice(0, 49)];
        });
        setAuditLogs((prev) => [
          {
            id: alert.id || 'ids_' + Date.now(),
            time: alert.time || new Date().toLocaleTimeString('vi-VN'),
            action: `CẢNH BÁO IDS [${alert.type}]`,
            detail: alert.detail,
            result: alert.severity || 'HIGH'
          },
          ...prev.slice(0, 49)
        ]);
        setStatusBannerMsg(
          `🛡️ HỆ THỐNG ĐÃ CHẶN TỰ ĐỘNG [${alert.vectorLabel || alert.type}]: ${alert.detail}`
        );
      }
    });

    socket.on('security-alert', (alert) => {
      if (alert) {
        setStatusBannerMsg(
          `CẢNH BÁO GIAN LẬN: Thiết bị ${alert.deviceId} đã điểm danh cho ${alert.firstStudent}, nay cố điểm danh hộ cho ${alert.attemptedStudent}!`
        );
      }
    });

    // Lắng nghe sự kiện cập nhật Merkle Root & Thu hồi khóa trên chuỗi
    socket.on('merkle-root-updated', (payload) => {
      if (payload?.merkleRoot) {
        setAdminStats((prev) => ({ ...prev, merkleRoot: payload.merkleRoot }));
      }
    });

    socket.on('identity-revoked', () => {
      fetchAdminAuditLogs();
    });

    socket.on('identity-unrevoked', () => {
      fetchAdminAuditLogs();
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
        setTimerProgress(rotateIntervalRef.current);
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

  // Tạo mới Lớp học phần (Classroom Entity - Tồn tại suốt học kỳ 15 tuần)
  const handleCreateNewCourse = async (e, launchQrImmediately = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = newCourseForm.courseCode.trim().toUpperCase();
    const name = newCourseForm.courseName.trim();
    const room = newCourseForm.defaultRoom.trim().toUpperCase() || 'A2-301';
    if (!code || !name) return;

    const createdCourse = {
      id: `CLS_${code.replace(/[^A-Z0-9]/gi, '_')}_${Date.now().toString(36).slice(-4).toUpperCase()}`,
      courseCode: code,
      courseName: name,
      defaultRoom: room,
      defaultRadius: Number(newCourseForm.defaultRadius) || 35,
      defaultNetworkMode: newCourseForm.defaultNetworkMode || 'CELLULAR_ANY',
      schedule: newCourseForm.schedule.trim() || 'Thứ 2 • Ca 1 (07:30 - 10:00)',
      totalStudents: Number(newCourseForm.totalStudents) || 60,
      createdAt: new Date().toISOString().slice(0, 10),
      enrolledStudents: DEFAULT_ENROLLED_ROSTER,
      sessions: []
    };

    const nextList = [createdCourse, ...courses];
    saveCoursesToStorage(nextList);
    setNewCourseForm({
      courseCode: '',
      courseName: '',
      defaultRoom: '',
      defaultRadius: 35,
      defaultNetworkMode: 'CELLULAR_ANY',
      schedule: 'Thứ 2 • Ca 1 (07:30 - 10:00)',
      totalStudents: 60
    });
    setShowCreateCourseForm(false);

    if (launchQrImmediately) {
      await handleCreateNewSession(createdCourse, nextList);
    }
  };

  // Điền nhanh thông tin mẫu vào biểu mẫu tạo lớp (hỗ trợ Bộ 3 Mẫu Học Phần Thông Minh)
  const handleQuickFillCoursePreset = (presetIndex = 0) => {
    const idx = typeof presetIndex === 'number' ? presetIndex : 0;
    const preset = COURSE_PRESETS[idx] || COURSE_PRESETS[0];
    setNewCourseForm({ ...preset });
  };

  // Tạo nhanh 1 lớp học mẫu & Mở màn chiếu QR ngay với 1 chạm
  const handleQuickCreateDemoCourseAndLaunchQr = async (presetIndex = 0) => {
    const idx = typeof presetIndex === 'number' ? presetIndex : 0;
    const preset = COURSE_PRESETS[idx] || COURSE_PRESETS[0];
    const createdCourse = {
      id: `CLS_${preset.courseCode.replace(/[^A-Z0-9]/gi, '_')}_${Date.now().toString(36).slice(-4).toUpperCase()}`,
      ...preset,
      createdAt: new Date().toISOString().slice(0, 10),
      enrolledStudents: DEFAULT_ENROLLED_ROSTER,
      sessions: []
    };
    const nextList = [createdCourse, ...courses];
    saveCoursesToStorage(nextList);
    setShowCreateCourseForm(false);
    await handleCreateNewSession(createdCourse, nextList);
  };

  // Xoay mã QR tức thì (chống chụp màn hình)
  const handleInstantRotateNonce = () => {
    const nextNonce = 'NONCE_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setCurrentNonce(nextNonce);
    setTimerProgress(rotateInterval);
    socketRef.current?.emit('rotate-nonce', { sessionId, nonce: nextNonce });
    setStatusBannerMsg(`↻ Đã đổi mã QR mới (${nextNonce}) — Chu kỳ xoay tự động ${rotateInterval}s`);
  };

  // Tùy chỉnh chu kỳ xoay mã QR (15s / 35s / 60s)
  const handleChangeRotateInterval = (seconds) => {
    const cleanSec = Number(seconds) || 35;
    setRotateInterval(cleanSec);
    setTimerProgress(cleanSec);
    setStatusBannerMsg(`⏱ Đã chuyển chu kỳ tự động xoay mã QR sang ${cleanSec} giây`);
  };

  // Điểm danh thủ công / bổ sung sinh viên tại lớp (quên điện thoại, hết pin, vắng có phép)
  const handleManualCheckInStudent = ({ studentId, name, major = 'An toàn Thông tin', reason = 'Điểm danh bổ sung tại lớp' }) => {
    const cleanId = String(studentId || '').trim();
    if (!cleanId) return;
    const cleanName = String(name || '').trim() || `Sinh viên ${cleanId}`;
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour12: false });

    if (!manualCheckInContext) {
      const manualRec = {
        studentId: cleanId,
        name: cleanName,
        major,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        coords: { ...sessionConfig.centerCoords },
        distance: 0,
        gpsAccuracy: 3.0,
        isMockGps: false,
        network: `GV Bổ Sung (${reason})`,
        deviceId: `FACULTY_MANUAL_${cleanId}`,
        checkInTime: nowTime,
        signatureHash: computeLocalSessionHash(`${sessionId}_${cleanId}`, [{ studentId: cleanId, status: 'VERIFIED', distance: 0 }]),
        spotCheckStatus: 'VERIFIED',
        isManual: true
      };

      const exists = attendees.some((a) => a.studentId === cleanId);
      const nextList = exists
        ? attendees.map((a) => (a.studentId === cleanId ? { ...a, ...manualRec } : a))
        : [manualRec, ...attendees];
      setAttendees(nextList);

      const updatedCourses = courses.map((c) => {
        if ((c.courseId || c.id) !== activeCourseId && c.courseCode !== sessionConfig.courseCode) return c;
        return {
          ...c,
          sessions: (c.sessions || []).map((s) =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  attendees: nextList.map((a) => ({
                    studentId: a.studentId,
                    name: a.name,
                    major: a.major,
                    checkInTime: a.checkInTime,
                    distance: a.distance,
                    status: a.distance <= sessionConfig.maxRadiusMeters ? 'VERIFIED' : 'EXCEPTION',
                    signatureHash: a.signatureHash
                  }))
                }
              : s
          )
        };
      });
      saveCoursesToStorage(updatedCourses);

      setLatestVerifiedNotice({
        studentId: cleanId,
        name: cleanName,
        distance: 0,
        network: `Điểm danh thủ công (${reason})`,
        time: nowTime
      });
      setStatusBannerMsg(`✓ Đã điểm danh thủ công cho SV ${cleanName} (${cleanId}) — Lý do: ${reason}`);
    } else {
      const { course: targetCourse, session: targetSes } = manualCheckInContext;
      const targetCourseId = targetCourse.courseId || targetCourse.id;
      const targetSid = targetSes.sessionId;
      const newRec = {
        studentId: cleanId,
        name: cleanName,
        major,
        checkInTime: nowTime,
        distance: 0,
        status: 'VERIFIED',
        signatureHash: computeLocalSessionHash(`${targetSid}_${cleanId}`, [{ studentId: cleanId, status: 'VERIFIED', distance: 0 }])
      };

      const updatedCourses = courses.map((c) => {
        if ((c.courseId || c.id) !== targetCourseId) return c;
        return {
          ...c,
          sessions: (c.sessions || []).map((s) => {
            if (s.sessionId !== targetSid) return s;
            const prevAtt = Array.isArray(s.attendees) ? s.attendees : [];
            const exists = prevAtt.some((a) => a.studentId === cleanId);
            const nextAtt = exists
              ? prevAtt.map((a) => (a.studentId === cleanId ? newRec : a))
              : [newRec, ...prevAtt];
            return { ...s, attendees: nextAtt };
          })
        };
      });
      saveCoursesToStorage(updatedCourses);
      setStatusBannerMsg(
        `✓ Đã bổ sung điểm danh SV ${cleanName} (${cleanId}) vào Buổi ${targetSes.sessionIndex || targetSes.sessionNumber}`
      );
    }

    setManualForm((prev) => ({ ...prev, studentId: '', name: '' }));
  };

  // Xóa vĩnh viễn Lớp học phần (kèm đóng phiên QR nếu lớp đang mở)
  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const targetId = courseToDelete.courseId || courseToDelete.id;
    const nextList = courses.filter((c) => (c.courseId || c.id) !== targetId);
    saveCoursesToStorage(nextList);

    if (historyCourseId === targetId) {
      setHistoryCourseId(null);
    }
    if (activeCourseId === targetId || sessionConfig.courseCode === courseToDelete.courseCode) {
      socketRef.current?.emit('close-session', { sessionId });
      smartFetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});
      setIsCreated(false);
      setIsSessionOpen(false);
      setActiveCourseId(nextList[0]?.id || '');
    }
    setCourseToDelete(null);
  };

  // Xóa một buổi điểm danh cụ thể bên trong Lớp học phần
  const handleDeleteSession = (course, sessionObj) => {
    if (!course || !sessionObj) return;
    const targetCourseId = course.courseId || course.id;
    const targetSid = sessionObj.sessionId;

    const updatedCourses = courses.map((c) => {
      if ((c.courseId || c.id) !== targetCourseId) return c;
      const nextSessions = (c.sessions || [])
        .filter((s) => s.sessionId !== targetSid)
        .map((s, idx) => ({
          ...s,
          sessionIndex: idx + 1,
          sessionNumber: idx + 1
        }));
      return {
        ...c,
        sessions: nextSessions
      };
    });

    saveCoursesToStorage(updatedCourses);

    if (sessionId === targetSid) {
      socketRef.current?.emit('close-session', { sessionId: targetSid });
      smartFetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: targetSid })
      }).catch(() => {});
      setIsCreated(false);
      setIsSessionOpen(false);
    }
    if (selectedHistorySessionId === targetSid) {
      setSelectedHistorySessionId('ALL');
    }
  };

  // 3. TÁI SỬ DỤNG CẤU HÌNH CHO BUỔI TIẾP THEO (SMART INHERITANCE — 1-CLICK LAUNCH)
  // Khi bấm "+ Thêm Buổi Học Mới", hệ thống tự động kế thừa Tâm tọa độ GPS phòng học, Bán kính R = 35m,
  // Chế độ mạng (CAMPUS_WIFI / CELLULAR_ANY) và Danh sách sinh viên gốc (enrolledStudents) từ buổi trước
  const handleCreateNewSession = async (courseOrId, customCoursesList = null) => {
    const sourceCourses = Array.isArray(customCoursesList) ? customCoursesList : courses;
    const targetCourse =
      typeof courseOrId === 'string'
        ? sourceCourses.find((c) => (c.courseId || c.id) === courseOrId)
        : courseOrId || sourceCourses.find((c) => (c.courseId || c.id) === activeCourseId) || sourceCourses[0];
    if (!targetCourse) return;

    const targetId = targetCourse.courseId || targetCourse.id;
    const existingSessions = Array.isArray(targetCourse.sessions) ? targetCourse.sessions : [];
    const lastSession = existingSessions.length > 0 ? existingSessions[existingSessions.length - 1] : null;
    const nextIndex = existingSessions.length + 1;
    const cleanRoom = (targetCourse.defaultRoom || 'A2301').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const newSid = `SES_${cleanRoom}_B${String(nextIndex).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // Tự động kế thừa thông số từ buổi học trước đó hoặc cấu hình gốc của lớp (Smart Inheritance)
    const inheritedCoords =
      lastSession?.centerCoords ||
      targetCourse.defaultCoords ||
      sessionConfig.centerCoords || { lat: 10.799200, lon: 106.705600 };
    const inheritedRadius = Number(lastSession?.maxRadiusMeters || targetCourse.defaultRadius || 35);
    const inheritedNetworkMode = lastSession?.networkMode || targetCourse.defaultNetworkMode || 'CELLULAR_ANY';
    const inheritedRoster =
      Array.isArray(targetCourse.enrolledStudents) && targetCourse.enrolledStudents.length > 0
        ? targetCourse.enrolledStudents
        : DEFAULT_ENROLLED_ROSTER;

    const newSession = {
      sessionId: newSid,
      sessionIndex: nextIndex,
      sessionNumber: nextIndex,
      date: todayStr,
      sessionDate: todayStr,
      centerCoords: inheritedCoords,
      maxRadiusMeters: inheritedRadius,
      networkMode: inheritedNetworkMode,
      status: 'LIVE',
      isFinalized: false,
      nonce: currentNonce,
      attendees: []
    };

    // Cập nhật buổi học mới trực tiếp vào mảng sessions của lớp đó (Kiến trúc 1 - N)
    const updatedCourses = sourceCourses.map((c) =>
      (c.courseId || c.id) === targetId
        ? {
            ...c,
            defaultCoords: inheritedCoords,
            defaultRadius: inheritedRadius,
            defaultNetworkMode: inheritedNetworkMode,
            enrolledStudents: inheritedRoster,
            sessions: [...(c.sessions || []), newSession]
          }
        : c
    );
    saveCoursesToStorage(updatedCourses);

    const nextConfig = {
      ...sessionConfig,
      sessionNumber: nextIndex,
      sessionIndex: nextIndex,
      courseCode: targetCourse.courseCode,
      courseName: targetCourse.courseName,
      room: targetCourse.defaultRoom,
      centerCoords: inheritedCoords,
      maxRadiusMeters: inheritedRadius,
      networkMode: inheritedNetworkMode
    };

    setActiveCourseId(targetId);
    setHistoryCourseId(targetId);
    setSessionConfig(nextConfig);
    setSessionId(newSid);
    setAttendees([]);
    setIsCreated(true);
    setIsSessionOpen(true);
    setActiveTab('STAGE');
    setTimerProgress(rotateInterval);

    try {
      const res = await smartFetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSid,
          classId: targetId,
          sessionNumber: nextIndex,
          courseCode: nextConfig.courseCode,
          courseName: nextConfig.courseName,
          room: nextConfig.room,
          centerCoords: nextConfig.centerCoords,
          maxRadiusMeters: nextConfig.maxRadiusMeters,
          networkMode: nextConfig.networkMode,
          campusSsid: nextConfig.campusSsid
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

  const handleStartSessionFromCourse = (course) => handleCreateNewSession(course);

  // Mở lại Màn Chiếu QR cho một buổi học chưa khóa sổ bên trong Lớp học phần
  const handleReopenExistingSession = async (course, sessionObj) => {
    if (!course || !sessionObj) return;
    if (sessionObj.isFinalized || sessionObj.status === 'FINALIZED') {
      setStatusBannerMsg(
        `Buổi ${sessionObj.sessionIndex || sessionObj.sessionNumber} đã Khóa Sổ Bất Biến. Không thể mở lại mã QR hoặc ghi thêm dữ liệu.`
      );
      return;
    }
    const targetId = course.courseId || course.id;
    const sNum = Number(sessionObj.sessionIndex || sessionObj.sessionNumber || 1);
    const nextConfig = {
      ...sessionConfig,
      sessionNumber: sNum,
      sessionIndex: sNum,
      courseCode: course.courseCode,
      courseName: course.courseName,
      room: course.defaultRoom,
      centerCoords: sessionObj.centerCoords || course.defaultCoords || sessionConfig.centerCoords,
      maxRadiusMeters: Number(sessionObj.maxRadiusMeters || course.defaultRadius) || 35,
      networkMode: sessionObj.networkMode || course.defaultNetworkMode || 'CAMPUS_WIFI'
    };

    setActiveCourseId(targetId);
    setHistoryCourseId(targetId);
    setSessionConfig(nextConfig);
    setSessionId(sessionObj.sessionId);
    setAttendees(
      (sessionObj.attendees || []).map((a) => ({
        studentId: a.studentId,
        name: a.name,
        major: a.major || 'An toàn Thông tin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        coords: { lat: 10.799215, lon: 106.70562 },
        distance: Number(a.distance || 6),
        gpsAccuracy: 6.2,
        isMockGps: false,
        network: 'UTH_STUDENT_SECURE',
        deviceId: `DEV_${a.studentId}`,
        checkInTime: a.checkInTime || '13:30:00',
        signatureHash: a.signatureHash,
        spotCheckStatus: 'VERIFIED'
      }))
    );
    setIsCreated(true);
    setIsSessionOpen(true);
    setActiveTab('STAGE');
    setTimerProgress(rotateInterval);

    try {
      await smartFetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionObj.sessionId,
          classId: targetId,
          sessionNumber: sNum,
          courseCode: nextConfig.courseCode,
          courseName: nextConfig.courseName,
          room: nextConfig.room,
          centerCoords: nextConfig.centerCoords,
          maxRadiusMeters: nextConfig.maxRadiusMeters,
          networkMode: nextConfig.networkMode,
          campusSsid: nextConfig.campusSsid
        })
      });
    } catch {}
  };

  // Khởi tạo phiên học lên Backend và bật máy chiếu
  const handleStartProjectorSession = async () => {
    const activeCourse = courses.find((c) => (c.courseId || c.id) === activeCourseId);
    if (activeCourse) {
      return handleCreateNewSession(activeCourse);
    }
    const newSid = 'SES_' + (sessionConfig.room || 'A2301').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setSessionId(newSid);
    setIsCreated(true);
    setIsSessionOpen(true);
    setTimerProgress(rotateInterval);
  };

  // 1. CƠ CHẾ "KHÓA SỔ BUỔI HỌC" (SESSION FINALIZATION & TAMPER-PROOF ROOT)
  // Đóng kết nối WebSocket, từ chối mọi yêu cầu quét mã tiếp theo, gom danh sách sinh viên có mặt,
  // băm thành Session Hash (Merkle Leaf), ký điện tử bằng khóa Giảng viên và lưu cố định bất biến
  const handleFinalizeSession = async (targetCourseParam = null, sessionObjParam = null) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const finalizedAt = new Date().toISOString();
    const targetCourseId = targetCourseParam
      ? (targetCourseParam.courseId || targetCourseParam.id)
      : activeCourseId;
    const targetSid = sessionObjParam ? sessionObjParam.sessionId : sessionId;

    const currentAttendeesList = sessionObjParam
      ? (sessionObjParam.attendees || [])
      : attendees.map((a) => ({
          studentId: a.studentId,
          name: a.name,
          major: a.major || 'An toàn Thông tin',
          checkInTime: a.checkInTime,
          distance: a.distance,
          status: a.distance <= sessionConfig.maxRadiusMeters ? 'VERIFIED' : 'EXCEPTION',
          signatureHash: a.signatureHash || computeLocalSessionHash(a.studentId, [a])
        }));

    let officialSessionHash = computeLocalSessionHash(targetSid, currentAttendeesList);
    let officialFacultySignature = `0x${officialSessionHash.slice(2, 34)}${officialSessionHash.slice(10, 42)}1b`;
    let officialFacultySigner = 'did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    try {
      const res = await smartFetch('/api/session/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSid,
          classId: targetCourseId,
          courseCode: targetCourseParam?.courseCode || sessionConfig.courseCode,
          attendees: currentAttendeesList
        })
      });
      const data = await res.json();
      if (data?.success) {
        if (data.sessionHash) officialSessionHash = data.sessionHash;
        if (data.facultySignature) officialFacultySignature = data.facultySignature;
        if (data.facultySigner) officialFacultySigner = data.facultySigner;
      }
    } catch {}

    let finalizedSessionNumber = sessionConfig.sessionNumber || 1;
    let finalizedCourseCode = targetCourseParam?.courseCode || sessionConfig.courseCode;

    const updatedCourses = courses.map((c) => {
      if ((c.courseId || c.id) !== targetCourseId && c.courseCode !== finalizedCourseCode) return c;
      finalizedCourseCode = c.courseCode;
      const existingSessions = Array.isArray(c.sessions) ? c.sessions : [];
      const alreadyIdx = existingSessions.findIndex((s) => s.sessionId === targetSid);
      const sNum = alreadyIdx >= 0
        ? (existingSessions[alreadyIdx].sessionIndex || existingSessions[alreadyIdx].sessionNumber)
        : (sessionConfig.sessionNumber || existingSessions.length + 1);
      finalizedSessionNumber = sNum;

      const lockedSessionRecord = {
        sessionId: targetSid,
        sessionIndex: sNum,
        sessionNumber: sNum,
        date: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].date || existingSessions[alreadyIdx].sessionDate || todayStr) : todayStr,
        sessionDate: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].sessionDate || existingSessions[alreadyIdx].date || todayStr) : todayStr,
        centerCoords: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].centerCoords || sessionConfig.centerCoords) : sessionConfig.centerCoords,
        maxRadiusMeters: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].maxRadiusMeters || sessionConfig.maxRadiusMeters) : sessionConfig.maxRadiusMeters,
        networkMode: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].networkMode || sessionConfig.networkMode) : sessionConfig.networkMode,
        status: 'FINALIZED',
        isFinalized: true,
        finalizedAt,
        sessionHash: officialSessionHash,
        facultySignature: officialFacultySignature,
        facultySigner: officialFacultySigner,
        nonce: currentNonce,
        attendees: currentAttendeesList
      };

      const nextSessions =
        alreadyIdx >= 0
          ? existingSessions.map((s, idx) => (idx === alreadyIdx ? lockedSessionRecord : s))
          : [...existingSessions, lockedSessionRecord];

      return {
        ...c,
        defaultRoom: sessionConfig.room || c.defaultRoom,
        defaultRadius: Number(sessionConfig.maxRadiusMeters) || c.defaultRadius,
        defaultCoords: sessionConfig.centerCoords || c.defaultCoords,
        defaultNetworkMode: sessionConfig.networkMode || c.defaultNetworkMode,
        sessions: nextSessions
      };
    });

    saveCoursesToStorage(updatedCourses);
    socketRef.current?.emit('close-session', { sessionId: targetSid });

    setFinalizedBannerNotice({
      courseCode: finalizedCourseCode,
      sessionId: targetSid,
      sessionNumber: finalizedSessionNumber,
      attendeeCount: currentAttendeesList.length,
      sessionHash: officialSessionHash,
      facultySignature: officialFacultySignature,
      facultySigner: officialFacultySigner,
      finalizedAt
    });
    setHistoryCourseId(targetCourseId);
    setSelectedHistorySessionId('ALL');
    setIsCreated(false);
    setIsSessionOpen(false);
  };

  // Kết thúc buổi học hiện tại (tạm lưu chưa khóa sổ hoặc quay về Trang Chi Tiết Lớp Học)
  const handleFinishAndSaveSession = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedCourses = courses.map((c) => {
      if ((c.courseId || c.id) !== activeCourseId && c.courseCode !== sessionConfig.courseCode) return c;
      const existingSessions = Array.isArray(c.sessions) ? c.sessions : [];
      const alreadyIdx = existingSessions.findIndex((s) => s.sessionId === sessionId);
      const sNum = alreadyIdx >= 0
        ? (existingSessions[alreadyIdx].sessionIndex || existingSessions[alreadyIdx].sessionNumber)
        : (sessionConfig.sessionNumber || existingSessions.length + 1);
      const newSessionRecord = {
        sessionId,
        sessionIndex: sNum,
        sessionNumber: sNum,
        date: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].date || existingSessions[alreadyIdx].sessionDate || todayStr) : todayStr,
        sessionDate: alreadyIdx >= 0 ? (existingSessions[alreadyIdx].sessionDate || existingSessions[alreadyIdx].date || todayStr) : todayStr,
        centerCoords: sessionConfig.centerCoords,
        maxRadiusMeters: sessionConfig.maxRadiusMeters,
        networkMode: sessionConfig.networkMode,
        status: alreadyIdx >= 0 && existingSessions[alreadyIdx].isFinalized ? 'FINALIZED' : 'COMPLETED',
        isFinalized: alreadyIdx >= 0 ? Boolean(existingSessions[alreadyIdx].isFinalized) : false,
        sessionHash: alreadyIdx >= 0 ? existingSessions[alreadyIdx].sessionHash : undefined,
        facultySignature: alreadyIdx >= 0 ? existingSessions[alreadyIdx].facultySignature : undefined,
        nonce: currentNonce,
        attendees: attendees.map((a) => ({
          studentId: a.studentId,
          name: a.name,
          major: a.major,
          checkInTime: a.checkInTime,
          distance: a.distance,
          status: a.distance <= sessionConfig.maxRadiusMeters ? 'VERIFIED' : 'EXCEPTION',
          signatureHash: a.signatureHash || computeLocalSessionHash(a.studentId, [a])
        }))
      };
      const nextSessions =
        alreadyIdx >= 0
          ? existingSessions.map((s, idx) => (idx === alreadyIdx ? newSessionRecord : s))
          : [...existingSessions, newSessionRecord];

      return {
        ...c,
        defaultRoom: sessionConfig.room,
        defaultRadius: Number(sessionConfig.maxRadiusMeters) || c.defaultRadius,
        defaultCoords: sessionConfig.centerCoords || c.defaultCoords,
        defaultNetworkMode: sessionConfig.networkMode,
        sessions: nextSessions
      };
    });
    saveCoursesToStorage(updatedCourses);
    socketRef.current?.emit('close-session', { sessionId });
    smartFetch('/api/session/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(() => {});
    setHistoryCourseId(activeCourseId);
    setSelectedHistorySessionId('ALL');
    setIsCreated(false);
    setIsSessionOpen(false);
  };

  // Xuất file CSV cho riêng 1 Buổi học (ClassSession) bên trong Lớp (kèm Session Hash & Chữ ký EIP-191)
  const handleExportSingleSessionCSV = (course, ses) => {
    if (!course || !ses) return;
    const sIdx = ses.sessionIndex || ses.sessionNumber || 1;
    const sDate = ses.date || ses.sessionDate || '';
    let csv = `\uFEFFMSSV,HoVaTen,ChuyenNganh,GioDiemDanh,KhoangCachGPS(m),TrangThai,BienLaiChuKyEIP191,SessionHashChotSo\n`;
    (ses.attendees || []).forEach((st) => {
      csv += `${st.studentId},"${st.name}","${st.major || 'CNTT'}","${st.checkInTime || ''}","${st.distance ?? 0}m","${st.status || 'VERIFIED'}","${st.signatureHash || ''}","${ses.sessionHash || 'CHUA_CHOT_SO'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DiemDanh_${course.courseCode}_Buoi_${sIdx}_${sDate}.csv`;
    link.click();
  };

  // 2. XUẤT BÁO CÁO MA TRẬN CHUYÊN CẦN LŨY KẾ TOÀN KỲ (.CSV / EXCEL UTF-8 BOM NỘP PHÒNG ĐÀO TẠO)
  const handleExportSemesterCSV = (course) => {
    if (!course) return;
    const sessionList = Array.isArray(course.sessions) ? course.sessions : [];
    const roster =
      Array.isArray(course.enrolledStudents) && course.enrolledStudents.length > 0
        ? course.enrolledStudents
        : DEFAULT_ENROLLED_ROSTER;
    const studentMap = new Map();

    // Khởi tạo từ danh sách sinh viên đăng ký môn học gốc (Enrolled Roster)
    roster.forEach((st) => {
      studentMap.set(st.studentId, {
        studentId: st.studentId,
        name: st.name,
        major: st.major || 'An toàn Thông tin',
        attendedBySession: {}
      });
    });

    // Ghép kết quả từng buổi học vào ma trận
    sessionList.forEach((ses) => {
      (ses.attendees || []).forEach((st) => {
        if (!studentMap.has(st.studentId)) {
          studentMap.set(st.studentId, {
            studentId: st.studentId,
            name: st.name,
            major: st.major || 'An toàn Thông tin',
            attendedBySession: {}
          });
        }
        studentMap.get(st.studentId).attendedBySession[ses.sessionId] = st;
      });
    });

    const sessionHeaders = sessionList
      .map((s) => `"Buổi ${s.sessionIndex || s.sessionNumber} (${s.date || s.sessionDate})"`)
      .join(',');
    let csv = `\uFEFFMSSV,"Họ và Tên","Chuyên Ngành",${sessionHeaders ? sessionHeaders + ',' : ''}"Tỷ lệ hiện diện","Đánh giá điều kiện thi"\n`;

    studentMap.forEach((st) => {
      let attendedCount = 0;
      const cols = sessionList.map((s) => {
        const rec = st.attendedBySession[s.sessionId];
        if (rec) {
          attendedCount += 1;
          const distLabel = rec.distance !== undefined ? `${rec.distance}m` : 'Hợp lệ';
          if (rec.status === 'EXCEPTION' || rec.status === 'OUT_OF_RANGE' || Number(rec.distance) > (Number(course.defaultRadius) || 35)) {
            return `"Ngoại lệ (${distLabel})"`;
          }
          return `"Có mặt (${distLabel})"`;
        }
        return '"Vắng"';
      });
      const totalSess = sessionList.length;
      const ratioNum = totalSess > 0 ? Number(((attendedCount / totalSess) * 100).toFixed(1)) : 100;
      const absentCount = totalSess - attendedCount;
      const isWarning = totalSess > 0 && ((ratioNum < 80 && absentCount >= 2) || ratioNum < 60);
      const ratioText = `${attendedCount}/${totalSess} (${ratioNum}%)`;
      const eligibilityText = isWarning ? 'Cảnh báo cấm thi (< 80%)' : 'Đủ điều kiện';

      csv += `${st.studentId},"${st.name}","${st.major}",${cols.length > 0 ? cols.join(',') + ',' : ''}"${ratioText}","${eligibilityText}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SoDiemChuyenCan_LuyKe_${course.courseCode}_ToanKy.csv`;
    link.click();
  };

  // Đóng hoặc mở lại nhận diện phiên (Giữ nguyên buổi học hiện tại, KHÔNG tạo buổi học mới khi bấm Mở lại)
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
      setTimerProgress(rotateInterval);
      try {
        const res = await smartFetch('/api/session/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            classId: activeCourseId,
            sessionNumber: sessionConfig.sessionNumber || 1,
            courseCode: sessionConfig.courseCode,
            courseName: sessionConfig.courseName,
            room: sessionConfig.room,
            centerCoords: sessionConfig.centerCoords,
            maxRadiusMeters: sessionConfig.maxRadiusMeters,
            networkMode: sessionConfig.networkMode,
            campusSsid: sessionConfig.campusSsid
          })
        });
        const data = await res.json();
        if (data?.success && data.initialNonce) {
          setCurrentNonce(data.initialNonce);
          socketRef.current?.emit('join-session', { sessionId, role: 'FACULTY' });
        }
      } catch {}
    }
  };

  // Vòng lặp đếm lùi xoay Nonce động theo chu kỳ rotateInterval (15s / 35s / 60s)
  useEffect(() => {
    if (!isCreated || !isSessionOpen) return;
    const interval = setInterval(() => {
      setTimerProgress(prev => {
        if (prev <= 1) {
          const nextNonce = "NONCE_" + Math.random().toString(36).substring(2, 9).toUpperCase();
          setCurrentNonce(nextNonce);
          socketRef.current?.emit('rotate-nonce', { sessionId, nonce: nextNonce });
          return rotateInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCreated, isSessionOpen, sessionId, rotateInterval]);

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
    let targets = [];
    if (mode === 'ALL') {
      targets = attendees.map((a) => a.studentId);
    } else if (mode === 'FURTHEST') {
      targets = [...attendees]
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 2)
        .map((a) => a.studentId);
    } else if (mode === 'RISK_TARGETED') {
      targets = attendees
        .filter((a) => calculateFraudRiskScore(a).score >= 30)
        .map((a) => a.studentId);
      if (targets.length === 0) {
        targets = [...attendees]
          .sort((a, b) => b.distance - a.distance)
          .slice(0, 2)
          .map((a) => a.studentId);
      }
    }

    // Luôn bao gồm MSSV thiết bị di động đang mở (2251120000) để thông báo Tái điểm danh báo về điện thoại sinh viên ngay lập tức
    const mergedTargetSet = new Set(['2251120000', ...targets]);
    const finalTargets = Array.from(mergedTargetSet);

    setAttendees((prev) => {
      const hasPrimary = prev.some((a) => a.studentId === '2251120000');
      const baseList = hasPrimary
        ? prev
        : [
            {
              studentId: '2251120000',
              name: 'Nguyễn Đức Hiển',
              major: 'An toàn Thông tin',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              coords: { lat: 10.799215, lon: 106.70562 },
              distance: 4,
              gpsAccuracy: 5.8,
              isMockGps: false,
              network: 'UTH_STUDENT_SECURE',
              deviceId: 'DEV_MOBILE_EIP191',
              checkInTime: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
              spotCheckStatus: 'PENDING'
            },
            ...prev
          ];
      return baseList.map((a) =>
        finalTargets.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a
      );
    });
    setSpotCheckState({ active: true, countdown: 60, targetIds: finalTargets });
    setStatusBannerMsg(
      `Đã phát lệnh Tái kiểm tra Face ID (Spot-Check 60s) xuống ${finalTargets.length} thiết bị di động của sinh viên!`
    );

    socketRef.current?.emit('trigger-spot-check', {
      sessionId,
      timeoutSec: 60,
      targetIds: finalTargets,
      mode
    });
    try {
      await smartFetch('/api/faculty/spot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          timeoutSeconds: 60,
          targetIds: finalTargets,
          mode
        })
      });
    } catch {}
  };

  // Phát lệnh Hậu kiểm 60s đích danh 1 sinh viên nghi vấn từ bảng IDS
  const handleTriggerSingleStudentSpotCheck = async (student) => {
    if (!student?.studentId) return;
    const targetIds = Array.from(new Set([student.studentId, '2251120000']));
    setAttendees((prev) =>
      prev.map((a) => (targetIds.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a))
    );
    setSpotCheckState({ active: true, countdown: 60, targetIds });
    setStatusBannerMsg(
      `Đã phát lệnh Hậu kiểm Face ID 60s đích danh tới sinh viên ${student.name} (${student.studentId})!`
    );
    socketRef.current?.emit('trigger-spot-check', {
      sessionId,
      timeoutSec: 60,
      targetIds,
      mode: 'SINGLE_TARGET'
    });
    try {
      await smartFetch('/api/faculty/spot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          timeoutSeconds: 60,
          targetIds,
          mode: 'SINGLE_TARGET'
        })
      });
    } catch {}
  };

  // Đình chỉ & Hủy kết quả điểm danh gian lận từ bảng IDS (Giảng viên)
  const handleRevokeFraudulentAttendee = async (student) => {
    if (!student?.studentId) return;
    setAttendees((prev) => prev.filter((a) => a.studentId !== student.studentId));
    setStatusBannerMsg(
      `Đã hủy kết quả điểm danh của sinh viên ${student.name} (${student.studentId}) do vi phạm quy chế IDS!`
    );
    try {
      await smartFetch('/api/auditor/revoke-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          studentId: student.studentId,
          studentName: student.name,
          reason: `Vi phạm quy chế IDS (Thiết bị: ${student.deviceId}, Khoảng cách: ${student.distance}m)`
        })
      });
      fetchAdminAuditLogs();
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

  const fetchSecurityTelemetry = async () => {
    try {
      const res = await smartFetch('/api/security/telemetry');
      const data = await res.json();
      if (data?.success && Array.isArray(data.alerts) && data.alerts.length > 0) {
        setSecurityAlerts(data.alerts);
      }
    } catch {}
  };

  const handleSimulateAttack = async (attackType = 'REPLAY_ATTACK') => {
    setSimulatingAttack(true);
    try {
      const res = await smartFetch('/api/security/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType })
      });
      const data = await res.json();
      if (data?.success && data?.alert) {
        setSecurityAlerts((prev) => {
          const exists = prev.some((item) => item.id === data.alert.id);
          return exists ? prev : [data.alert, ...prev.slice(0, 49)];
        });
        setStatusBannerMsg(
          `🛡️ ĐÃ CHẶN TẤN CÔNG GIẢ LẬP [${data.alert.vectorLabel}]: ${data.alert.detail}`
        );
        setSimulatingAttack(false);
        return;
      }
    } catch {}

    // Fallback cục bộ tức thì nếu offline
    const localMap = {
      REPLAY_ATTACK: {
        type: 'REPLAY_ATTACK',
        vectorLabel: 'Chặn Replay Attack (QR Đã Hết Hạn)',
        studentId: '2251120003',
        studentName: 'Lê Hoàng Quân',
        address: '0x88fA...91B2',
        deviceId: 'HYBRID:iOS17:ZaloForward:91b2',
        severity: 'CRITICAL',
        defenseLayer: 'Dynamic Nonce 35s + Single-Use Token',
        detail: 'Phát hiện gói tin sử dụng lại Nonce QR cũ đã hết hạn (quét từ ảnh chụp màn hình qua Zalo). Hệ thống hủy giao dịch tức thì.'
      },
      DEVICE_SPOOFING: {
        type: 'DEVICE_SPOOFING',
        vectorLabel: 'Chặn Giả Mạo Khóa & Chữ Ký Số',
        studentId: '2251120004',
        studentName: 'Phạm Minh Tuấn',
        address: '0x92eD...CBA6',
        deviceId: 'HYBRID:Linux:CurlScript:cba6',
        severity: 'CRITICAL',
        defenseLayer: 'ECDSA secp256k1 + FIDO2 Secure Enclave',
        detail: 'Chữ ký số EIP-191 giả mạo: Khóa công khai khôi phục (ecrecover) không khớp với DID đã đăng ký của SV 2251120004.'
      },
      PROXY_ATTENDANCE: {
        type: 'PROXY_ATTENDANCE',
        vectorLabel: 'Chặn Điểm Danh Hộ (Xung Đột Phần Cứng)',
        studentId: '2251120002',
        studentName: 'Trần Thị Mai',
        address: '0x44cB...77E1',
        deviceId: 'HYBRID:iPhone15Pro:Enclave:882a',
        severity: 'HIGH',
        defenseLayer: 'Hardware Device Fingerprint Binding',
        detail: 'Xung đột phần cứng: Thiết bị HYBRID:iPhone15Pro:Enclave:882a đã điểm danh cho SV 2251120001, bị chặn khi cố ký hộ cho SV 2251120002.'
      },
      GEOFENCE_BREACH: {
        type: 'GEOFENCE_BREACH',
        vectorLabel: 'Chặn Fake GPS & Ngoài Bán Kính Lớp',
        studentId: '2251120005',
        studentName: 'Hoàng Bảo Ngọc',
        address: '0x71dE...33F9',
        deviceId: 'HYBRID:Android:MockLocation:33f9',
        severity: 'HIGH',
        defenseLayer: 'Haversine Geofence + Kalman Drift Filter',
        detail: 'Từ chối điểm danh từ khoảng cách 385m (vượt ngưỡng 35m của phòng học) và phát hiện cờ Mock GPS (Accuracy = 0.0m).'
      }
    };
    const chosen = localMap[attackType] || localMap.REPLAY_ATTACK;
    const newAlert = {
      ...chosen,
      id: 'ids_sim_' + Date.now(),
      time: new Date().toLocaleTimeString('vi-VN')
    };
    setSecurityAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
    setStatusBannerMsg(`🛡️ ĐÃ CHẶN TẤN CÔNG GIẢ LẬP [${newAlert.vectorLabel}]: ${newAlert.detail}`);
    setSimulatingAttack(false);
  };

  const fetchAdminAuditLogs = async () => {
    fetchSecurityTelemetry();
    try {
      const res = await smartFetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data?.success) {
        if (Array.isArray(data.auditLogs)) {
          setAuditLogs(data.auditLogs);
        }
        setAdminStats((prev) => ({
          ...prev,
          merkleRoot: data.merkleRoot || prev.merkleRoot,
          revokedDID: Array.isArray(data.revokedAddresses) ? data.revokedAddresses.length : prev.revokedDID
        }));
      }
    } catch {}
  };

  useEffect(() => {
    fetchSecurityTelemetry();
    if (staffRole === 'ADMIN' || activeTab.startsWith('ADMIN')) {
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

  // Áp dụng phân quyền giao diện theo đúng Role đăng nhập (Chỉ còn FACULTY & ADMIN)
  const applyRoleWorkspace = (role, userObj) => {
    const cleanRole = role === 'ADMIN' ? 'ADMIN' : 'FACULTY';
    setFacultyUser(userObj);
    setStaffRole(cleanRole);
    if (cleanRole === 'ADMIN') {
      setIsCreated(false);
      setIsSessionOpen(false);
      setActiveTab('ADMIN_ISSUANCE');
    } else {
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

      const resolvedRole = (data.role || data.user?.role) === 'ADMIN' ? 'ADMIN' : 'FACULTY';
      const userObj = data.user || {
        email: loginForm.email,
        fullName:
          resolvedRole === 'ADMIN'
            ? 'Quản Trị Viên Tối Cao'
            : 'TS. Trần Thế Vinh',
        department:
          resolvedRole === 'ADMIN'
            ? 'Phòng Đào tạo & Quản trị Hệ thống'
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

  // Chuyển nhanh giữa tài khoản Giảng Viên và Quản Trị Viên
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
        const resolvedRole = (data.role || data.user?.role) === 'ADMIN' ? 'ADMIN' : 'FACULTY';
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
    setLoginForm({ email: '', password: '' });
    setIsCreated(false);
    setIsSessionOpen(false);
    setAuthError('');
  };

  // ==================== CỔNG ĐĂNG NHẬP NGHỆ THUẬT (PHỐI MÀU OCEAN ICE: #001D39, #0A4174, #49769F, #4E8EA2, #6EA2B3, #7BBDE8, #BDD8E9) ====================
  if (!token) {
    const FIREFLIES = [
      { id: 1, top: '22%', left: '68%', size: 5, delay: '0s', dur: '5.5s', color: '#7BBDE8' },
      { id: 2, top: '34%', left: '42%', size: 6, delay: '1.1s', dur: '6.2s', color: '#fde047' },
      { id: 3, top: '46%', left: '28%', size: 5, delay: '0.4s', dur: '4.8s', color: '#BDD8E9' },
      { id: 4, top: '54%', left: '52%', size: 7, delay: '1.8s', dur: '6.8s', color: '#7BBDE8' },
      { id: 5, top: '64%', left: '36%', size: 5, delay: '2.3s', dur: '5.1s', color: '#4E8EA2' },
      { id: 6, top: '72%', left: '64%', size: 6, delay: '0.9s', dur: '5.9s', color: '#BDD8E9' },
      { id: 7, top: '16%', left: '48%', size: 4, delay: '1.5s', dur: '4.5s', color: '#ffffff' },
      { id: 8, top: '28%', left: '82%', size: 4, delay: '2.7s', dur: '5.3s', color: '#7BBDE8' },
      { id: 9, top: '58%', left: '76%', size: 5, delay: '0.6s', dur: '6.4s', color: '#BDD8E9' },
      { id: 10, top: '82%', left: '48%', size: 6, delay: '1.9s', dur: '5.7s', color: '#7BBDE8' }
    ];

    const PALETTE_SWATCHES = [
      '#001D39',
      '#0A4174',
      '#49769F',
      '#4E8EA2',
      '#6EA2B3',
      '#7BBDE8',
      '#BDD8E9'
    ];

    const handleCardMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setLoginParallax({ x: nx * 14, y: ny * 14 });
    };

    const handleCardMouseLeave = () => {
      setLoginParallax({ x: 0, y: 0 });
    };

    return (
      <div
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none"
        style={{
          background:
            'linear-gradient(180deg, #BDD8E9 0%, #7BBDE8 24%, #6EA2B3 44%, #4E8EA2 60%, #49769F 74%, #0A4174 88%, #001D39 100%)'
        }}
      >
        {/* Quầng bóng đổ sâu màu Xanh Đại Dương (#001D39 & #0A4174) phía dưới Card */}
        <div
          className="pointer-events-none absolute w-[84%] max-w-[920px] h-[540px] rounded-[44px] blur-3xl opacity-80 transition-transform duration-500"
          style={{
            background:
              'radial-gradient(circle at 50% 85%, rgba(0, 29, 57, 0.88), rgba(10, 65, 116, 0.6), transparent 74%)',
            transform: `translate3d(${loginParallax.x * 0.5}px, ${30 + loginParallax.y * 0.5}px, 0)`
          }}
        />

        {/* ==================== KHUNG CARD ĐĂNG NHẬP 2 CỘT (50% ARTWORK OCEAN / 50% FORM BĂNG TUYẾT #F7FBFE) ==================== */}
        <div className="animate-login-card relative z-10 w-full max-w-[960px] min-h-[590px] rounded-[26px] bg-[#F9FCFF] border border-[#BDD8E9]/70 shadow-[0_36px_90px_-12px_rgba(0,29,57,0.72)] overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* ==================== CỘT TRÁI (6 CỘT): TRANH ĐÊM HÒA QUYỆN TÔNG XANH ĐẠI DƯƠNG (#001D39 -> #7BBDE8) ==================== */}
          <div className="md:col-span-6 relative min-h-[300px] md:min-h-[590px] bg-[#001D39] overflow-hidden flex items-center justify-center">
            
            {/* Lớp Tranh Nền chuyển động Parallax + Ken Burns nhẹ nhàng */}
            <img
              src="/login-art.jpg"
              alt="Welcome Artwork"
              className="animate-art-breathe absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out pointer-events-none"
              style={{
                transform: `scale(1.05) translate3d(${-loginParallax.x}px, ${-loginParallax.y}px, 0)`
              }}
            />

            {/* Lớp phủ hòa sắc nhẹ (Color Grading Overlay) theo bảng màu #001D39 - #0A4174 - #4E8EA2 - #7BBDE8 */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-55"
              style={{
                background:
                  'linear-gradient(160deg, rgba(0,29,57,0.75) 0%, rgba(10,65,116,0.5) 45%, rgba(78,142,162,0.4) 78%, rgba(123,189,232,0.45) 100%)'
              }}
            />

            {/* Hiệu ứng Quầng Sáng Ấm Áp lan tỏa từ mái nhà vàng */}
            <div
              className="animate-pavilion-glow pointer-events-none absolute rounded-full blur-2xl"
              style={{
                top: '36%',
                left: '30%',
                width: '140px',
                height: '100px',
                background:
                  'radial-gradient(circle, rgba(253, 224, 71, 0.62) 0%, rgba(123, 189, 232, 0.35) 58%, transparent 78%)',
                transform: `translate3d(${-loginParallax.x * 1.1}px, ${-loginParallax.y * 1.1}px, 0)`
              }}
            />

            {/* Hiệu ứng Đom Đóm & Sao Đêm Lấp Lánh Bay Lên (#7BBDE8 & #BDD8E9) */}
            {FIREFLIES.map((f) => (
              <span
                key={f.id}
                className="pointer-events-none absolute rounded-full"
                style={{
                  top: f.top,
                  left: f.left,
                  width: `${f.size}px`,
                  height: `${f.size}px`,
                  backgroundColor: f.color,
                  boxShadow: `0 0 12px 3px ${f.color}`,
                  animation: `fireflyDrift ${f.dur} ease-in-out ${f.delay} infinite`
                }}
              />
            ))}

            {/* Huy hiệu UTH-TrustID + Thanh 7 chấm màu Ocean Ice ở góc dưới bên trái */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-[#001D39]/85 backdrop-blur-md border border-[#BDD8E9]/30 text-[10.5px] font-semibold tracking-wider text-[#BDD8E9] shadow-sm">
                UTH-TRUSTID • ZERO-TRUST PORTAL
              </span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#001D39]/80 backdrop-blur-md border border-[#BDD8E9]/25">
                {PALETTE_SWATCHES.map((hex) => (
                  <span
                    key={hex}
                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ==================== CỘT PHẢI (6 CỘT): BIỂU MẪU LOGIN TỐI GIẢN PHỐI MÀU #001D39 -> #7BBDE8 ==================== */}
          <div
            className="md:col-span-6 px-8 sm:px-14 py-10 flex flex-col justify-between relative"
            style={{
              background:
                'linear-gradient(180deg, #FFFFFF 0%, #F7FBFE 65%, #EBF4FA 100%)'
            }}
          >
            {/* Khoảng đệm phía trên để căn giữa Form giống mẫu */}
            <div className="hidden md:block" />

            {/* Khối trung tâm: Tiêu đề Login + 2 ô Underline Input + Nút Login Gradient (#001D39 -> #0A4174 -> #49769F) */}
            <div className="w-full max-w-[330px] mx-auto my-auto">
              <h1 className="text-[32px] font-extrabold text-[#001D39] text-center tracking-tight mb-10">
                Login
              </h1>

              {/* Thông báo lỗi nếu nhập sai tài khoản hoặc mật khẩu */}
              {authError && (
                <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-[fadeIn_0.25s_ease-out]">
                  <span>⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              {/* Thông báo hỗ trợ khi bấm Forgot password? hoặc Sign up */}
              {loginHelperNotice && !authError && (
                <div className="mb-6 p-3 rounded-xl bg-[#BDD8E9]/40 border border-[#7BBDE8] text-[#001D39] text-xs leading-relaxed flex items-start justify-between gap-2 animate-[fadeIn_0.25s_ease-out]">
                  <span>{loginHelperNotice}</span>
                  <button
                    type="button"
                    onClick={() => setLoginHelperNotice('')}
                    className="text-[#0A4174] hover:text-[#001D39] bg-transparent border-none cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-8">
                
                {/* Ô nhập Email (Underline Input + Thanh gạch chân chuyển sắc #001D39 -> #0A4174 -> #4E8EA2 -> #7BBDE8) */}
                <div className="relative pt-2">
                  <label
                    className={`block transition-all duration-300 pointer-events-none ${
                      focusedField === 'email' || loginForm.email
                        ? 'text-[11px] font-bold text-[#0A4174] -translate-y-1'
                        : 'text-[14px] font-medium text-[#49769F] translate-y-4'
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={loginForm.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value });
                      if (authError) setAuthError('');
                    }}
                    className="w-full pt-1 pb-2.5 bg-transparent border-0 border-b border-[#6EA2B3]/65 text-[14.5px] text-[#001D39] font-semibold outline-none transition-colors"
                    required
                  />
                  {/* Thanh gạch chân động (Animated Expanding Ocean Gradient Underline) */}
                  <span
                    className={`pointer-events-none absolute bottom-0 left-0 h-[2.5px] transition-all duration-300 ease-out ${
                      focusedField === 'email' ? 'w-full' : 'w-0'
                    }`}
                    style={{
                      background: 'linear-gradient(90deg, #001D39 0%, #0A4174 35%, #4E8EA2 70%, #7BBDE8 100%)'
                    }}
                  />
                </div>

                {/* Ô nhập Password + Nút "Forgot password?" nằm bên phải ngay trên đường kẻ giống hệt ảnh mẫu */}
                <div className="relative pt-2">
                  <div className="flex items-baseline justify-between">
                    <label
                      className={`block transition-all duration-300 pointer-events-none ${
                        focusedField === 'password' || loginForm.password
                          ? 'text-[11px] font-bold text-[#0A4174] -translate-y-1'
                          : 'text-[14px] font-medium text-[#49769F] translate-y-4'
                      }`}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setLoginHelperNotice(
                          '🔑 Mật khẩu SSO mặc định cho Giảng viên (giangvien@uth.edu.vn) và Quản trị viên (admin@uth.edu.vn) là: Admin@2026'
                        )
                      }
                      className="text-[11.5px] font-bold text-[#0A4174] hover:text-[#4E8EA2] bg-transparent border-none cursor-pointer p-0 transition-colors z-10"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        setLoginForm({ ...loginForm, password: e.target.value });
                        if (authError) setAuthError('');
                      }}
                      className="w-full pt-1 pb-2.5 pr-10 bg-transparent border-0 border-b border-[#6EA2B3]/65 text-[14.5px] text-[#001D39] font-semibold outline-none transition-colors"
                      required
                    />
                    {loginForm.password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 bottom-2 text-[11px] font-bold text-[#49769F] hover:text-[#001D39] bg-transparent border-none cursor-pointer"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>

                  {/* Thanh gạch chân động (Animated Expanding Ocean Gradient Underline) */}
                  <span
                    className={`pointer-events-none absolute bottom-0 left-0 h-[2.5px] transition-all duration-300 ease-out ${
                      focusedField === 'password' ? 'w-full' : 'w-0'
                    }`}
                    style={{
                      background: 'linear-gradient(90deg, #001D39 0%, #0A4174 35%, #4E8EA2 70%, #7BBDE8 100%)'
                    }}
                  />
                </div>

                {/* Nút Login Phối màu #001D39 -> #0A4174 -> #49769F kèm Hiệu ứng Ánh sáng lướt */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    style={{
                      background: 'linear-gradient(135deg, #001D39 0%, #0A4174 58%, #49769F 100%)'
                    }}
                    className="login-btn-shimmer w-full py-3.5 px-6 rounded-[14px] text-white font-bold text-[15px] tracking-wide shadow-[0_14px_30px_-6px_rgba(0,29,57,0.55)] hover:shadow-[0_18px_36px_-6px_rgba(10,65,116,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border border-[#7BBDE8]/35"
                  >
                    {loginLoading ? 'Signing in...' : 'Login'}
                  </button>
                </div>
              </form>

              {/* Cụm chọn nhanh vai trò Giảng Viên / Quản Trị Viên 1 chạm */}
              <div className="mt-5 pt-4 border-t border-[#BDD8E9]/70">
                <p className="text-[11px] font-bold text-[#49769F] text-center uppercase tracking-wider mb-2.5">
                  Truy Cập Nhanh (Demo 1-Chạm)
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSwitchAccount('giangvien@uth.edu.vn')}
                    className="py-2.5 px-3 rounded-xl bg-[#001D39]/8 hover:bg-[#001D39]/15 border border-[#0A4174]/25 text-[#001D39] text-xs font-bold cursor-pointer transition-all"
                  >
                    👨‍🏫 Cổng Giảng Viên
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSwitchAccount('admin@uth.edu.vn')}
                    className="py-2.5 px-3 rounded-xl bg-[#0A4174]/10 hover:bg-[#0A4174]/20 border border-[#0A4174]/25 text-[#0A4174] text-xs font-bold cursor-pointer transition-all"
                  >
                    🛡️ Cổng Quản Trị
                  </button>
                </div>
              </div>
            </div>

            {/* Chân Form: "Don't have an account? Sign up" phối màu #49769F & #001D39 */}
            <div className="text-center pt-4">
              <p className="text-[12.5px] font-medium text-[#49769F] m-0">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() =>
                    setLoginHelperNotice(
                      '🏛️ Tài khoản Giảng viên (giangvien@uth.edu.vn) và Quản trị viên (admin@uth.edu.vn) được cấp tập trung qua Phòng Đào tạo & CNTT.'
                    )
                  }
                  className="font-extrabold text-[#001D39] hover:text-[#0A4174] hover:underline bg-transparent border-none cursor-pointer p-0 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
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

  const validRatioPercent =
    attendees.length > 0 ? Math.round((validAttendeesCount / attendees.length) * 100) : 100;

  return (
    <div className="theme-fintech-dark min-h-screen w-full p-2 sm:p-4 lg:p-6 flex flex-col select-none">
      {/* KHUNG VIỀN BO TRÒN NỔI DARK NEON (FLOATING ROUNDED DASHBOARD SHELL) */}
      <div className="dashboard-outer-shell w-full max-w-[1620px] mx-auto flex-1 rounded-[28px] overflow-hidden flex flex-col">
      
      {/* ==================== THANH ĐIỀU HƯỚNG EXECUTIVE COMMAND BAR (FACULTY & ADMIN) ==================== */}
      <header className="sticky top-0 z-30 px-5 sm:px-6 py-3.5 border-b border-cyan-500/20 bg-[#060E1C]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Cụm Thương hiệu & Thông tin Người dùng đang đăng nhập */}
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[#03141A] text-lg shadow-[0_0_24px_rgba(79,240,214,0.3)] ${
            staffRole === 'ADMIN'
              ? 'bg-gradient-to-br from-[#4FF0D6] to-[#10B981]'
              : 'bg-gradient-to-br from-[#4FF0D6] to-[#22D3EE]'
          }`}>
            U
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold text-white m-0 tracking-tight">
                {staffRole === 'ADMIN'
                  ? 'UTH-TrustID • Cổng Quản Trị Hệ Thống'
                  : 'UTH-TrustID • Cổng Điều Hành Giảng Viên'}
              </h1>

              {/* Nhãn Role hiện tại */}
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                staffRole === 'ADMIN'
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : 'bg-[#22D3EE]/15 border-[#4FF0D6]/40 text-[#4FF0D6]'
              }`}>
                {staffRole === 'ADMIN' ? 'Quản Trị Viên' : 'Giảng Viên'}
              </span>

              {/* Đồng hồ thời gian thực trên Topbar */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#040814] border border-cyan-500/25 text-[11.5px] font-mono text-cyan-200">
                <Clock size={12} className="text-[#4FF0D6]" />
                <strong className="text-white">
                  {liveClock.toLocaleTimeString('vi-VN', { hour12: false })}
                </strong>
                <span className="text-slate-400">•</span>
                <span>{liveClock.toLocaleDateString('vi-VN')}</span>
              </span>

              {/* Chỉ hiện trạng thái phiên học khi là Giảng viên */}
              {staffRole === 'FACULTY' && (
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                  !isCreated
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                    : isSessionOpen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    !isCreated ? 'bg-slate-400' : isSessionOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`} />
                  {!isCreated
                    ? courses.length === 0
                      ? 'Chưa tạo lớp học phần'
                      : `Đang quản lý ${courses.length} lớp học phần`
                    : isSessionOpen
                    ? `Đang chiếu QR: ${sessionConfig.courseCode} (Buổi ${sessionConfig.sessionNumber || 1})`
                    : 'Đã tạm khóa QR'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 mb-0">
              <strong className="text-white font-semibold">{facultyUser?.fullName}</strong> (<span className="text-[#4FF0D6]">{facultyUser?.email}</span>)
              {staffRole === 'FACULTY' && isCreated && (
                <> • Học phần: <strong className="text-white font-semibold">{sessionConfig.courseCode}</strong> • Phòng: <strong className="text-[#4FF0D6] font-semibold">{sessionConfig.room}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* ==================== CỤM TAB ĐIỀU HƯỚNG VIÊN THUỐC (PILL TABS) ==================== */}
        {/* 1. Tab dành riêng cho GIẢNG VIÊN (Chỉ hiện khi đã tạo lớp & đang mở buổi điểm danh) */}
        {staffRole === 'FACULTY' && isCreated && (
          <nav className="flex flex-wrap items-center bg-[#040814] p-1.5 rounded-full border border-cyan-500/25 gap-1">
            <button
              type="button"
              onClick={handleFinishAndSaveSession}
              className="faculty-pill-btn px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 bg-transparent text-slate-300 hover:text-white"
              title="Lưu tạm buổi học hiện tại và trở về Danh mục Lớp học"
            >
              <Layers size={14} className="text-[#4FF0D6]" />
              Danh Mục Lớp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('STAGE')}
              className={`faculty-pill-btn px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'STAGE'
                  ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-[#03141A] shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              <QrCode size={14} />
              Màn Chiếu Mã QR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RADAR')}
              className={`faculty-pill-btn px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'RADAR'
                  ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-[#03141A] shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              <MapPin size={14} />
              Bản Đồ Định Vị ({attendees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('IDS')}
              className={`faculty-pill-btn px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'IDS'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert size={14} />
              Giám Sát Thiết Bị
              {idsViolationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-bold">
                  {idsViolationCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* 2. Tab dành riêng cho QUẢN TRỊ VIÊN TỐI CAO (ADMIN) */}
        {staffRole === 'ADMIN' && (
          <nav className="flex items-center bg-[#040814] p-1.5 rounded-full border border-cyan-500/25 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_ISSUANCE')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_ISSUANCE' || activeTab === 'ADMIN'
                  ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-[#03141A] shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              Cấp Phát Thẻ VC &amp; Merkle Root
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_REVOCATION')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_REVOCATION'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              Thu Hồi &amp; Khôi Phục Khóa ({adminStats.revokedDID})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN_AUDIT')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                activeTab === 'ADMIN_AUDIT'
                  ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-[#03141A] shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              Sổ Cái Kiểm Toán
            </button>
          </nav>
        )}

        {/* Cụm nút tác vụ bên phải */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút chuyển nhanh giữa Giảng Viên và Quản Trị Viên */}
          <button
            type="button"
            onClick={() =>
              handleQuickSwitchAccount(
                staffRole === 'ADMIN' ? 'giangvien@uth.edu.vn' : 'admin@uth.edu.vn'
              )
            }
            className="faculty-pill-btn px-3.5 py-2 rounded-full text-xs font-semibold border border-cyan-500/30 bg-[#0C1D33] text-cyan-200 hover:border-[#4FF0D6] hover:text-white cursor-pointer transition-all"
          >
            {staffRole === 'ADMIN' ? '⇄ Chuyển Sang Giảng Viên' : '⇄ Chuyển Sang Quản Trị'}
          </button>

          {staffRole === 'FACULTY' && isCreated && (
            <>
              <button
                type="button"
                onClick={handleToggleSessionState}
                className={`faculty-pill-btn px-3.5 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer inline-flex items-center gap-1.5 ${
                  isSessionOpen
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                    : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                }`}
              >
                {isSessionOpen ? <Lock size={13} /> : <Unlock size={13} />}
                {isSessionOpen ? 'Tạm Khóa Mã QR' : 'Mở Lại Mã QR'}
              </button>

              <button
                type="button"
                onClick={() => handleFinalizeSession()}
                className="faculty-pill-btn px-4 py-2 rounded-full text-xs font-bold border border-emerald-400/50 bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] hover:opacity-95 text-[#03141A] shadow-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                title="Đóng kết nối WebSocket, băm danh sách sinh viên có mặt thành Session Hash (Merkle Leaf), ký số Giảng viên và khóa sổ bất biến"
              >
                <CheckCircle2 size={14} />
                Kết Thúc &amp; Chốt Sổ
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="faculty-pill-btn px-3.5 py-2 rounded-full text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer inline-flex items-center gap-1.5"
          >
            <LogOut size={13} />
            Đăng Xuất
          </button>
        </div>
      </header>

      {/* ==================== BODY THEO ĐÚNG VAI TRÒ (FACULTY vs ADMIN) ==================== */}
      {staffRole === 'FACULTY' && !isCreated ? (
        /* ==================== MÀN HÌNH CHÍNH GIẢNG VIÊN: QUẢN LÝ DANH MỤC LỚP HỌC PHẦN (COURSE HUB) ==================== */
        <main className="flex-1 w-full max-w-[1540px] mx-auto p-6 lg:p-8 flex flex-col gap-6">
          
          {/* 4 Thẻ Bento KPI Tóm Tắt Quy Mô Học Kỳ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="faculty-kpi-card p-5 rounded-[24px] flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-300 block">Lớp Học Phần Phụ Trách</span>
                <span className="text-2xl font-extrabold text-white block font-mono">{courses.length} lớp</span>
                <span className="text-[11px] font-semibold text-sky-300 block">HK II • 2025-2026</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-sky-400/15 border border-sky-300/35 flex items-center justify-center text-sky-300 shrink-0">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="faculty-kpi-card p-5 rounded-[24px] flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-300 block">Buổi Đã Điểm Danh</span>
                <span className="text-2xl font-extrabold text-emerald-400 block font-mono">
                  {courses.reduce((sum, c) => sum + (c.sessions?.length || 0), 0)} buổi
                </span>
                <span className="text-[11px] font-semibold text-emerald-300/90 block">
                  {courses.length === 0 ? 'Chưa có phiên mở' : 'Đồng bộ sổ điểm'}
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 shrink-0">
                <QrCode size={20} />
              </div>
            </div>

            <div className="faculty-kpi-card p-5 rounded-[24px] flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-300 block">Tổng Sinh Viên</span>
                <span className="text-2xl font-extrabold text-cyan-300 block font-mono">
                  {courses.reduce((sum, c) => sum + (Number(c.totalStudents) || 0), 0)} SV
                </span>
                <span className="text-[11px] font-semibold text-slate-300 block">Định danh Zero-Trust</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#4FF0D6]/15 border border-[#4FF0D6]/35 flex items-center justify-center text-[#4FF0D6] shrink-0">
                <Users size={20} />
              </div>
            </div>

            <div className="faculty-kpi-card p-5 rounded-[24px] flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <span className="text-xs font-medium text-slate-300 block">Thao Tác Nhanh</span>
                <span className="text-xs font-bold text-white block truncate">
                  {showCreateCourseForm ? 'Đang mở biểu mẫu' : 'Khởi tạo học phần mới'}
                </span>
                <span className="text-[11px] text-cyan-300 block">Hỗ trợ mẫu 1-chạm</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHistoryCourseId(null);
                  setShowCreateCourseForm((prev) => !prev);
                }}
                className="faculty-pill-btn px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#4FF0D6] to-[#38BDF8] hover:opacity-95 text-[#03141A] font-extrabold text-xs cursor-pointer border-none shadow-[0_10px_24px_rgba(56,189,248,0.28)] inline-flex items-center gap-1.5 shrink-0"
              >
                {showCreateCourseForm ? <X size={14} /> : <Plus size={15} />}
                {showCreateCourseForm ? 'Đóng' : 'Tạo Lớp Mới'}
              </button>
            </div>
          </section>

          {/* ==================== KHUNG TẠO LỚP HỌC PHẦN MỚI (CÓ BỘ 3 MẪU THÔNG MINH) ==================== */}
          {showCreateCourseForm && (
            <section className="faculty-glass-card w-full p-6 sm:p-7 rounded-[26px] space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white m-0 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#4FF0D6]" />
                    Khởi Tạo Lớp Học Phần Mới
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 mb-0">
                    Chọn nhanh từ 3 học phần mẫu hoặc nhập thông số lớp học của bạn.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {COURSE_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.courseCode}
                      type="button"
                      onClick={() => handleQuickFillCoursePreset(idx)}
                      className={`faculty-pill-btn px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                        newCourseForm.courseCode === preset.courseCode
                          ? 'bg-[#4FF0D6] border-[#4FF0D6] text-[#03141A]'
                          : 'bg-sky-400/10 border-sky-300/35 text-sky-200 hover:bg-sky-400/20'
                      }`}
                    >
                      <Sparkles size={12} />
                      {preset.courseCode}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCreateCourseForm(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <X size={13} /> Đóng
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => handleCreateNewCourse(e, false)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Mã Lớp Học Phần
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: IT402.N01"
                      value={newCourseForm.courseCode}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, courseCode: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm font-mono text-[#4FF0D6] focus:border-[#4FF0D6] outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Tên Môn Học / Học Phần
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: An toàn Mạng máy tính & Ứng dụng"
                      value={newCourseForm.courseName}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, courseName: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm text-white focus:border-[#4FF0D6] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Phòng Học Mặc Định
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: A2-301"
                      value={newCourseForm.defaultRoom}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, defaultRoom: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm font-mono text-[#4FF0D6] focus:border-[#4FF0D6] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Sĩ Số Sinh Viên Dự Kiến
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={newCourseForm.totalStudents}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, totalStudents: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm font-mono text-white focus:border-[#4FF0D6] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Bán Kính Geofence Mặc Định (m)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={50000}
                      value={newCourseForm.defaultRadius}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, defaultRadius: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm font-mono text-[#4FF0D6] focus:border-[#4FF0D6] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Lịch Giảng Dạy Hàng Tuần
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Thứ 2 • Ca 3 (13:30 - 16:00)"
                      value={newCourseForm.schedule}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, schedule: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#040814] border border-slate-700 text-sm text-white focus:border-[#4FF0D6] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCourseForm({ ...newCourseForm, defaultNetworkMode: 'CAMPUS_WIFI' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        newCourseForm.defaultNetworkMode === 'CAMPUS_WIFI'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700/70 bg-[#040814] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <Wifi size={16} />
                      <p className="text-xs font-bold m-0">Wi-Fi Giảng Đường</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourseForm({ ...newCourseForm, defaultNetworkMode: 'CELLULAR_ANY' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        newCourseForm.defaultNetworkMode === 'CELLULAR_ANY'
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-700/70 bg-[#040814] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <Radio size={16} />
                      <p className="text-xs font-bold m-0">Mạng 4G / 5G + GPS</p>
                    </button>
                  </div>

                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="submit"
                      className="faculty-pill-btn w-full py-4 px-4 rounded-2xl bg-[#040814] hover:bg-slate-900 border border-[#22D3EE]/50 text-[#4FF0D6] font-bold text-xs cursor-pointer transition-all"
                    >
                      Lưu Vào Danh Mục Lớp
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCreateNewCourse(e, true)}
                      className="faculty-pill-btn w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] hover:opacity-95 text-[#03141A] font-extrabold text-xs cursor-pointer border-none shadow-[0_10px_28px_rgba(34,211,238,0.3)] transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={14} />
                      Tạo Lớp &amp; Phát QR Ngay
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* ==================== MÀN HÌNH 2: TRANG CHI TIẾT LỚP HỌC (INSIDE CLASS VIEW — QUAN HỆ PHÂN CẤP 1 LỚP -> N BUỔI HỌC) ==================== */}
          {historyCourseId ? (
            (() => {
              const targetCourse = courses.find((c) => (c.courseId || c.id) === historyCourseId);
              if (!targetCourse) return null;
              const sessionList = Array.isArray(targetCourse.sessions) ? targetCourse.sessions : [];
              const nextSessionIndex = sessionList.length + 1;
              const totalClassStudents = Number(targetCourse.totalStudents) || 50;
              const enrolledRoster =
                Array.isArray(targetCourse.enrolledStudents) && targetCourse.enrolledStudents.length > 0
                  ? targetCourse.enrolledStudents
                  : DEFAULT_ENROLLED_ROSTER;

              const studentSummaryMap = new Map();
              enrolledRoster.forEach((st) => {
                studentSummaryMap.set(st.studentId, {
                  studentId: st.studentId,
                  name: st.name,
                  major: st.major || 'An toàn Thông tin',
                  sessionsAttended: {}
                });
              });

              sessionList.forEach((ses) => {
                (ses.attendees || []).forEach((st) => {
                  if (!studentSummaryMap.has(st.studentId)) {
                    studentSummaryMap.set(st.studentId, {
                      studentId: st.studentId,
                      name: st.name,
                      major: st.major || 'An toàn Thông tin',
                      sessionsAttended: {}
                    });
                  }
                  studentSummaryMap.get(st.studentId).sessionsAttended[ses.sessionId] = st;
                });
              });
              const summaryRows = Array.from(studentSummaryMap.values());
              const filteredSummaryRows = summaryRows.filter((row) => {
                const q = historySearchQuery.trim().toLowerCase();
                const matchSearch =
                  !q ||
                  row.studentId.toLowerCase().includes(q) ||
                  row.name.toLowerCase().includes(q) ||
                  (row.major || '').toLowerCase().includes(q);
                if (!matchSearch) return false;
                if (historyEligibilityFilter === 'ALL') return true;
                const attendedCount = Object.keys(row.sessionsAttended).length;
                const totalSess = sessionList.length;
                const ratioNum = totalSess > 0 ? Number(((attendedCount / totalSess) * 100).toFixed(1)) : 100;
                const absentCount = totalSess - attendedCount;
                const isWarning = totalSess > 0 && ((ratioNum < 80 && absentCount >= 2) || ratioNum < 60);
                return historyEligibilityFilter === 'WARNING' ? isWarning : !isWarning;
              });
              const selectedSessionObj =
                selectedHistorySessionId === 'ALL'
                  ? null
                  : sessionList.find((s) => s.sessionId === selectedHistorySessionId);

              return (
                <section className="faculty-glass-card w-full p-6 sm:p-7 rounded-[26px] space-y-6 animate-[fadeIn_0.2s_ease-out]">
                  {/* KHU VỰC TRÊN: THÔNG TIN LỚP HỌC PHẦN + NÚT PHÁT QR BUỔI MỚI + XÓA LỚP */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setHistoryCourseId(null)}
                          className="faculty-pill-btn px-3 py-1.5 rounded-xl bg-[#040814] border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft size={13} />
                          Danh Sách Lớp Học
                        </button>
                        <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/35 font-mono text-xs font-bold text-cyan-300">
                          {targetCourse.courseCode}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-[#040814] border border-slate-800 text-xs font-semibold text-slate-200">
                          Phòng {targetCourse.defaultRoom} • Bán kính R = {targetCourse.defaultRadius}m • {targetCourse.defaultNetworkMode === 'CAMPUS_WIFI' ? 'CAMPUS_WIFI' : 'CELLULAR_ANY'}
                        </span>
                        <span className="text-xs text-slate-300">
                          {targetCourse.schedule}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-2.5 mb-0">
                        {targetCourse.courseCode} — {targetCourse.courseName}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 mb-0">
                        Sĩ số: <strong className="text-white">{totalClassStudents} SV</strong> • Đã mở: <strong className="text-emerald-400">{sessionList.length} buổi</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleExportSemesterCSV(targetCourse)}
                        className="faculty-pill-btn px-4 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Download size={14} />
                        Xuất Sổ Điểm (.CSV)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseToDelete(targetCourse)}
                        className="faculty-pill-btn px-4 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Xóa Lớp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateNewSession(targetCourse)}
                        className="faculty-pill-btn px-5 py-3 rounded-xl bg-gradient-to-r from-[#4FF0D6] to-[#38BDF8] hover:opacity-95 text-[#03141A] font-extrabold text-xs cursor-pointer border-none shadow-lg inline-flex items-center gap-1.5"
                      >
                        <QrCode size={14} />
                        + Phát Mã QR (Buổi {nextSessionIndex})
                      </button>
                    </div>
                  </div>

                  {/* THÔNG BÁO ĐÃ CHỐT SỔ BUỔI HỌC */}
                  {finalizedBannerNotice && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/12 border border-emerald-400/40 text-emerald-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-bold text-xs">
                          ĐÃ CHỐT SỔ BUỔI HỌC
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {finalizedBannerNotice.courseCode} • Buổi {finalizedBannerNotice.sessionNumber} ({finalizedBannerNotice.attendeeCount} sinh viên có mặt)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinalizedBannerNotice(null)}
                        className="text-xs text-slate-300 hover:text-white bg-transparent border-none cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* BIỂU ĐỒ TRÒN CHUYÊN CẦN (SVG DONUT CHART) & THỐNG KÊ ĐỦ ĐIỀU KIỆN DỰ THI */}
                  {(() => {
                    const totalSessionsCount = sessionList.length;
                    let qualifiedCount = 0;
                    let warningCount = 0;
                    let totalAttendanceSum = 0;

                    summaryRows.forEach((row) => {
                      const attendedCount = Object.keys(row.sessionsAttended || {}).length;
                      const pct = totalSessionsCount > 0
                        ? Math.round((attendedCount / totalSessionsCount) * 100)
                        : 100;
                      totalAttendanceSum += pct;
                      if (pct >= 80) qualifiedCount += 1;
                      else warningCount += 1;
                    });

                    const avgClassRate = summaryRows.length > 0
                      ? Math.round(totalAttendanceSum / summaryRows.length)
                      : 100;
                    const qualifiedRatio = summaryRows.length > 0
                      ? Math.round((qualifiedCount / summaryRows.length) * 100)
                      : 100;
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (avgClassRate / 100) * circumference;

                    return (
                      <div className="p-5 rounded-2xl bg-[#040814] border border-cyan-500/25 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className="lg:col-span-5 flex items-center gap-4">
                          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                              <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                fill="transparent"
                                stroke="rgba(30, 41, 59, 0.9)"
                                strokeWidth="8"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                fill="transparent"
                                stroke="url(#classDonutGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                              />
                              <defs>
                                <linearGradient id="classDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#4FF0D6" />
                                  <stop offset="100%" stopColor="#38BDF8" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-lg font-extrabold font-mono text-cyan-300 leading-none">
                                {totalSessionsCount > 0 ? `${avgClassRate}%` : '—'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Chuyên cần</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
                              THỐNG KÊ CHUYÊN CẦN
                            </span>
                            <h3 className="text-sm font-bold text-white m-0">
                              Hiện diện trung bình: {totalSessionsCount > 0 ? `${avgClassRate}%` : 'Chưa mở buổi học'}
                            </h3>
                          </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-[#081226] border border-emerald-500/30">
                            <div className="text-xs text-slate-400">Đủ điều kiện (≥ 80%)</div>
                            <div className="text-xl font-extrabold font-mono text-emerald-300 mt-1">
                              {totalSessionsCount > 0 ? `${qualifiedCount}/${summaryRows.length} SV` : `${summaryRows.length} SV`}
                            </div>
                            <div className="text-[11px] text-emerald-400/90 mt-0.5">
                              {totalSessionsCount > 0 ? `${qualifiedRatio}% sĩ số lớp` : 'Sẵn sàng'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#081226] border border-amber-500/30">
                            <div className="text-xs text-slate-400">Cảnh báo (&lt; 80%)</div>
                            <div className="text-xl font-extrabold font-mono text-amber-300 mt-1">
                              {totalSessionsCount > 0 ? `${warningCount} SV` : '0 SV'}
                            </div>
                            <div className="text-[11px] text-amber-400/90 mt-0.5">
                              {warningCount > 0 ? 'Vắng quá quy định' : 'Không có'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#081226] border border-cyan-500/30">
                            <div className="text-xs text-slate-400">Buổi đã chốt sổ</div>
                            <div className="text-xl font-extrabold font-mono text-cyan-300 mt-1">
                              {sessionList.filter((s) => s.isFinalized || s.status === 'FINALIZED').length}/{totalSessionsCount} buổi
                            </div>
                            <div className="text-[11px] text-cyan-400/90 mt-0.5">
                              Đã lưu sổ điểm
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* KHU VỰC GIỮA: DANH SÁCH CÁC BUỔI HỌC TRONG LỚP */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white m-0">
                      Các Buổi Học Đã Mở ({sessionList.length} buổi)
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {sessionList.map((ses) => {
                        const sIdx = ses.sessionIndex || ses.sessionNumber || 1;
                        const sDate = ses.date || ses.sessionDate || '';
                        const presentCount = ses.attendees?.length || 0;
                        const ratePercent = Math.min(100, Math.round((presentCount / enrolledRoster.length) * 100));
                        const isSelected = selectedHistorySessionId === ses.sessionId;
                        const isLocked = Boolean(ses.isFinalized || ses.status === 'FINALIZED');

                        return (
                          <div
                            key={ses.sessionId}
                            className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                              isSelected
                                ? 'bg-[#1D3E6E]/85 border-cyan-400 shadow-lg'
                                : 'bg-[#040814] border-slate-700/70 hover:border-cyan-400/45'
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-3.5">
                              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/35 font-mono text-xs font-bold text-cyan-300">
                                Buổi {sIdx} ({sDate})
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-white">
                                    {presentCount}/{enrolledRoster.length} SV có mặt
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold">
                                    {ratePercent}%
                                  </span>
                                  {isLocked ? (
                                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 text-xs font-semibold">
                                      Đã Chốt Sổ
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-semibold">
                                      Đang Mở
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedHistorySessionId(isSelected ? 'ALL' : ses.sessionId)
                                }
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                                  isSelected
                                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                                    : 'bg-[#081226] text-cyan-200 border-cyan-500/30 hover:border-cyan-400'
                                }`}
                              >
                                {isSelected ? 'Đang xem' : 'Chi tiết'}
                              </button>

                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setManualCheckInContext({ course: targetCourse, session: ses });
                                    setShowManualCheckInModal(true);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                                >
                                  <UserPlus size={13} />
                                  + Bổ sung SV
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleExportSingleSessionCSV(targetCourse, ses)}
                                className="px-3.5 py-2 rounded-xl bg-[#081226] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                              >
                                Xuất CSV
                              </button>

                              {!isLocked && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleFinalizeSession(targetCourse, ses)}
                                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold cursor-pointer transition-all"
                                  >
                                    Chốt Sổ
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReopenExistingSession(targetCourse, ses)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold cursor-pointer transition-all"
                                  >
                                    Chiếu Lại QR
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteSession(targetCourse, ses)}
                                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-semibold cursor-pointer transition-all"
                              >
                                Xóa Buổi
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleCreateNewSession(targetCourse)}
                        className="w-full p-4 rounded-2xl border border-dashed border-cyan-400/45 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-200 font-bold text-xs cursor-pointer transition-all flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>+ Mở Buổi Điểm Danh Tiếp Theo (Buổi {nextSessionIndex})</span>
                        <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#4FF0D6] to-[#38BDF8] text-[#03141A] font-extrabold">
                          Phát Mã QR →
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* KHU VỰC DƯỚI: SỔ ĐIỂM TỔNG HỢP CHUYÊN CẦN LŨY KẾ + TÌM KIẾM & LỌC */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHistorySessionId('ALL')}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                            selectedHistorySessionId === 'ALL'
                              ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                              : 'bg-[#040814] text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          Sổ Điểm Chuyên Cần Toàn Kỳ ({filteredSummaryRows.length}/{summaryRows.length} SV)
                        </button>
                        {selectedSessionObj && (
                          <span className="px-3.5 py-2 rounded-xl bg-[#040814] border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                            Buổi {selectedSessionObj.sessionIndex || selectedSessionObj.sessionNumber} ({selectedSessionObj.date || selectedSessionObj.sessionDate})
                          </span>
                        )}
                      </div>

                      {selectedHistorySessionId === 'ALL' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={historySearchQuery}
                              onChange={(e) => setHistorySearchQuery(e.target.value)}
                              placeholder="Tìm MSSV hoặc Họ tên..."
                              className="pl-8 pr-3 py-2 rounded-xl bg-[#040814] border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-[#4FF0D6] w-52"
                            />
                          </div>
                          <div className="flex items-center bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
                            {[
                              { id: 'ALL', label: 'Tất cả' },
                              { id: 'QUALIFIED', label: 'Đủ ĐK (≥80%)' },
                              { id: 'WARNING', label: 'Cảnh báo (<80%)' }
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setHistoryEligibilityFilter(f.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                                  historyEligibilityFilter === f.id
                                    ? f.id === 'WARNING'
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-[#4FF0D6] text-slate-950 font-bold'
                                    : 'bg-transparent text-slate-300 hover:text-white'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedHistorySessionId === 'ALL' ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040814]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-300">
                              <th className="p-3.5 font-semibold">MSSV</th>
                              <th className="p-3.5 font-semibold">Họ và Tên</th>
                              {sessionList.map((s) => (
                                <th key={s.sessionId} className="p-3.5 font-semibold text-center">
                                  Buổi {s.sessionIndex || s.sessionNumber} ({String(s.date || s.sessionDate).slice(5).split('-').reverse().join('/')})
                                </th>
                              ))}
                              <th className="p-3.5 font-semibold text-center">Tỷ lệ hiện diện</th>
                              <th className="p-3.5 font-semibold text-right">Đánh giá điều kiện thi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSummaryRows.length === 0 ? (
                              <tr>
                                <td colSpan={4 + sessionList.length} className="p-8 text-center text-slate-400">
                                  {summaryRows.length === 0
                                    ? 'Chưa có dữ liệu điểm danh nào cho lớp học phần này.'
                                    : 'Không có sinh viên nào khớp điều kiện tìm kiếm / bộ lọc.'}
                                </td>
                              </tr>
                            ) : (
                              filteredSummaryRows.map((row) => {
                                const attendedCount = Object.keys(row.sessionsAttended).length;
                                const totalSess = sessionList.length;
                                const ratioNum = totalSess > 0 ? Number(((attendedCount / totalSess) * 100).toFixed(1)) : 100;
                                const absentCount = totalSess - attendedCount;
                                const isWarning = totalSess > 0 && ((ratioNum < 80 && absentCount >= 2) || ratioNum < 60);

                                return (
                                  <tr
                                    key={row.studentId}
                                    className={`border-b transition-all ${
                                      isWarning
                                        ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-950/55'
                                        : 'border-slate-800/70 hover:bg-slate-900/40'
                                    }`}
                                  >
                                    <td className={`p-3.5 font-mono font-bold ${isWarning ? 'text-rose-300' : 'text-cyan-300'}`}>
                                      {row.studentId}
                                    </td>
                                    <td className="p-3.5 font-semibold text-white">
                                      {row.name}
                                      <span className="block text-[11px] font-normal text-slate-400">{row.major}</span>
                                    </td>
                                    {sessionList.map((s) => {
                                      const rec = row.sessionsAttended[s.sessionId];
                                      if (!rec) {
                                        return (
                                          <td key={s.sessionId} className="p-3.5 text-center">
                                            <span className="px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                                              Vắng
                                            </span>
                                          </td>
                                        );
                                      }
                                      const isException =
                                        rec.status === 'EXCEPTION' ||
                                        rec.status === 'OUT_OF_RANGE' ||
                                        Number(rec.distance) > (Number(targetCourse.defaultRadius) || 35);
                                      return (
                                        <td key={s.sessionId} className="p-3.5 text-center">
                                          {isException ? (
                                            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold">
                                              Ngoại lệ ({rec.distance ?? 45}m)
                                            </span>
                                          ) : (
                                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold">
                                              Có mặt ({rec.distance ?? 3}m)
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                    <td className="p-3.5 text-center font-mono font-bold text-white">
                                      {attendedCount}/{totalSess} ({ratioNum}%)
                                    </td>
                                    <td className="p-3.5 text-right">
                                      {isWarning ? (
                                        <span className="px-3 py-1 rounded-lg bg-rose-500/25 border border-rose-500 text-rose-200 font-bold text-xs">
                                          Cảnh báo cấm thi (&lt; 80%)
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-semibold text-xs">
                                          Đủ điều kiện
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-[#040814] border border-slate-700/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                          <div>
                            Chi tiết <strong>Buổi {selectedSessionObj?.sessionIndex || selectedSessionObj?.sessionNumber}</strong> • Ngày: <strong>{selectedSessionObj?.date || selectedSessionObj?.sessionDate}</strong>
                          </div>
                          {selectedSessionObj && !selectedSessionObj.isFinalized && selectedSessionObj.status !== 'FINALIZED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setManualCheckInContext({ course: targetCourse, session: selectedSessionObj });
                                setShowManualCheckInModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <UserPlus size={13} />
                              + Điểm Danh Bổ Sung
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(selectedSessionObj?.attendees || []).map((st) => (
                            <div key={st.studentId} className="p-4 rounded-2xl bg-[#040814] border border-slate-700/70 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-white m-0">{st.name}</p>
                                <p className="text-xs font-mono text-cyan-300 mt-0.5 mb-0">
                                  {st.studentId} • {st.checkInTime}
                                </p>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                                {st.distance}m
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()
          ) : (
            /* ==================== MÀN HÌNH 1: DANH SÁCH LỚP HỌC PHẦN ==================== */
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold text-white m-0 flex items-center gap-2">
                  <BookOpen size={18} className="text-[#4FF0D6]" />
                  Danh Sách Lớp Học Phần
                </h2>
              </div>

              {courses.length === 0 ? (
                /* KHUNG TRẠNG THÁI RỖNG SANG TRỌNG, GỌN GÀNG + 1-CHẠM KHỞI TẠO NHANH */
                <div className="faculty-glass-card w-full p-10 sm:p-14 rounded-[28px] border border-dashed border-sky-400/40 flex flex-col items-center justify-center text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4FF0D6]/20 to-[#38BDF8]/15 border border-[#4FF0D6]/45 flex items-center justify-center shadow-[0_0_30px_rgba(79,240,214,0.2)] text-[#4FF0D6]">
                    <QrCode size={30} />
                  </div>

                  <div className="max-w-lg space-y-1.5">
                    <h3 className="text-xl font-extrabold text-white m-0">
                      Chưa Có Lớp Học Phần
                    </h3>
                    <p className="text-xs text-slate-300 m-0 leading-relaxed">
                      Khởi tạo lớp học phần mới hoặc dùng nút tạo nhanh 1 chạm để phát mã QR điểm danh ngay lập tức.
                    </p>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuickCreateDemoCourseAndLaunchQr(0)}
                      className="faculty-pill-btn px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4FF0D6] to-[#38BDF8] hover:opacity-95 text-[#03141A] font-extrabold text-xs sm:text-sm cursor-pointer border-none shadow-[0_12px_28px_rgba(56,189,248,0.3)] inline-flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      Tạo Nhanh Lớp Mẫu &amp; Phát QR Ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickFillCoursePreset(0);
                        setShowCreateCourseForm(true);
                      }}
                      className="faculty-pill-btn px-5 py-3.5 rounded-2xl bg-[#040814] hover:bg-slate-900 border border-cyan-400/45 text-cyan-200 font-bold text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Tạo Lớp Học Phần Mới
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const cid = course.courseId || course.id;
                    const sessionList = Array.isArray(course.sessions) ? course.sessions : [];
                    const completedSessions = sessionList.length;
                    const nextSessionNum = completedSessions + 1;
                    const totalStudentsCount = Number(course.totalStudents) || 50;
                    const enrolledLen =
                      (Array.isArray(course.enrolledStudents) && course.enrolledStudents.length > 0
                        ? course.enrolledStudents.length
                        : DEFAULT_ENROLLED_ROSTER.length) || 6;
                    const avgCourseRate =
                      completedSessions > 0
                        ? Math.min(
                            100,
                            Math.round(
                              sessionList.reduce(
                                (acc, s) => acc + ((s.attendees?.length || 0) / enrolledLen) * 100,
                                0
                              ) / completedSessions
                            )
                          )
                        : 0;

                    return (
                      <div
                        key={cid}
                        onClick={() => {
                          setHistoryCourseId(cid);
                          setSelectedHistorySessionId('ALL');
                        }}
                        className="faculty-glass-card card-hover-lift p-6 rounded-[26px] hover:border-[#4FF0D6]/70 flex flex-col justify-between gap-5 transition-all cursor-pointer"
                      >
                        <div className="space-y-4">
                          {/* Hàng trên cùng: Mã lớp + Phòng học */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-xl bg-[#22D3EE]/15 border border-[#4FF0D6]/40 font-mono text-xs font-bold text-[#4FF0D6]">
                              {course.courseCode}
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-[#040814] border border-slate-700 text-xs font-semibold text-white">
                              Phòng {course.defaultRoom}
                            </span>
                          </div>

                          {/* Tên môn học & Lịch học */}
                          <div>
                            <h3 className="text-base font-extrabold text-white m-0 leading-snug">
                              {course.courseName}
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 mb-0">
                              {course.schedule}
                            </p>
                          </div>

                          {/* Bảng thông số 3 ô cân đối */}
                          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#040814] border border-slate-800/90 text-center">
                            <div>
                              <span className="text-xs text-slate-400 block">Sĩ số lớp</span>
                              <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                                {totalStudentsCount} SV
                              </strong>
                            </div>
                            <div className="border-x border-slate-800">
                              <span className="text-xs text-slate-400 block">Số buổi đã mở</span>
                              <strong className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                                {completedSessions} buổi
                              </strong>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block">Cấu hình</span>
                              <strong className="text-xs font-semibold text-[#4FF0D6] mt-1 block">
                                R ≤ {course.defaultRadius}m • {course.defaultNetworkMode === 'CAMPUS_WIFI' ? 'Wi-Fi' : '4G/5G'}
                              </strong>
                            </div>
                          </div>

                          {/* Thanh tiến độ chuyên cần trung bình của lớp */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">Chuyên cần trung bình lớp</span>
                              <span className="font-mono font-bold text-[#4FF0D6]">
                                {completedSessions > 0 ? `${avgCourseRate}%` : 'Chưa mở buổi'}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#040814] border border-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#4FF0D6] to-[#38BDF8] transition-all duration-500"
                                style={{ width: `${completedSessions > 0 ? Math.max(6, avgCourseRate) : 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Cây phân cấp thu gọn các buổi học bên trong lớp */}
                          <div className="p-3.5 rounded-2xl bg-[#040814]/90 border border-slate-800/80 space-y-1.5">
                            <div className="text-xs font-semibold text-slate-300 mb-1">
                              Các buổi điểm danh trong lớp:
                            </div>
                            {sessionList.length === 0 ? (
                              <div className="text-xs text-slate-400">
                                Chưa mở buổi điểm danh nào — Bấm Phát Mã QR bên dưới để mở Buổi 1
                              </div>
                            ) : (
                              sessionList.slice(-2).map((s) => (
                                <div key={s.sessionId} className="flex items-center justify-between text-xs text-slate-300">
                                  <span className="font-mono text-[#4FF0D6]">
                                    • Buổi {s.sessionIndex || s.sessionNumber} ({s.date || s.sessionDate})
                                  </span>
                                  <span className="text-emerald-400 font-semibold">
                                    {s.attendees?.length || 0}/{enrolledLen} SV
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Cụm nút hành động khi đã tạo lớp */}
                        <div
                          className="space-y-2 pt-2 border-t border-slate-800/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleCreateNewSession(course)}
                            className="faculty-pill-btn w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] hover:opacity-95 text-[#03141A] font-extrabold text-xs cursor-pointer border-none shadow-[0_8px_22px_rgba(34,211,238,0.28)] flex items-center justify-center gap-2"
                          >
                            <QrCode size={15} />
                            <span>Phát Mã QR Điểm Danh (Buổi {nextSessionNum})</span>
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setHistoryCourseId(cid);
                                setSelectedHistorySessionId('ALL');
                              }}
                              className="col-span-2 py-2.5 px-3 rounded-xl bg-[#040814] hover:bg-slate-900 border border-cyan-500/35 text-cyan-200 font-semibold text-xs cursor-pointer transition-all"
                            >
                              Chi Tiết &amp; Sổ Điểm ({completedSessions} buổi)
                            </button>

                            <button
                              type="button"
                              onClick={() => setCourseToDelete(course)}
                              className="col-span-1 py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 font-bold text-xs cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                            >
                              <Trash2 size={13} />
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Hộp thoại Xác nhận An toàn khi Xóa Lớp Học Phần */}
          {courseToDelete && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md p-6 rounded-3xl bg-[#081226] border border-rose-500/40 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white m-0">
                  Xác Nhận Xóa Lớp Học Phần
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed m-0">
                  Bạn có chắc chắn muốn xóa lớp học phần <strong className="text-cyan-300">{courseToDelete.courseCode} — {courseToDelete.courseName}</strong> cùng toàn bộ {courseToDelete.sessions?.length || 0} buổi điểm danh đã lưu?
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setCourseToDelete(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCourse}
                    className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold cursor-pointer border-none"
                  >
                    Xác Nhận Xóa Vĩnh Viễn
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : staffRole === 'ADMIN' ? (
        /* ==================== GIAO DIỆN DÀNH RIÊNG CHO QUẢN TRỊ VIÊN TỐI CAO (ROOT ADMIN PORTAL) ==================== */
        <div className="flex-1 flex flex-col p-6 gap-5 max-w-[1540px] w-full mx-auto">
          {/* 3 Thẻ Thống Kê Toàn Trường Của Admin */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hero-navy-card p-5 rounded-2xl bg-[#081226] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Tổng Định Danh Sinh Viên (W3C DID)</span>
                <span className="text-2xl font-bold text-white mt-1 block font-mono">{adminStats.totalDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                Toàn Trường
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#081226] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Chứng Chỉ Đang Hoạt Động (Active VC)</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono">{adminStats.activeDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Hợp Lệ Điểm Danh
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#081226] border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Thiết Bị Đã Bị Thu Hồi Khóa (Revoked)</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block font-mono">{adminStats.revokedDID}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
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
                  <h2 className="text-lg font-bold text-emerald-300 m-0">
                    Phát Hành Lô Thẻ Định Danh Sinh Viên (Merkle Batch Issuance)
                  </h2>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#040814] border border-slate-800 text-xs">
                  Merkle Root hiện tại: <code className="text-amber-300 font-mono">{adminStats.merkleRoot.slice(0, 26)}...</code>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Danh sách sinh viên cấp phát chứng chỉ W3C VC (JSON):
                  </label>
                  <textarea
                    value={batchJson}
                    onChange={(e) => setBatchJson(e.target.value)}
                    rows={9}
                    className="w-full p-4 rounded-2xl bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-200 focus:border-emerald-400 outline-none resize-none"
                  />
                </div>

                <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-[#040814] border border-slate-800 space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-white m-0">Cấp phát hàng loạt O(log N)</h3>
                    <p className="text-xs text-slate-300 m-0 leading-relaxed">
                      Băm danh sách sinh viên thành cây Merkle và neo Root Hash lên Smart Contract để xác thực ngoại tuyến không cần tài khoản tập trung.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdminIssueMerkleBatch}
                    className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs cursor-pointer border-none shadow-lg"
                  >
                    Băm Keccak256 &amp; Neo Merkle Root
                  </button>
                </div>
              </div>

              {/* SƠ ĐỒ TRỰC QUAN CÂY NHỊ PHÂN MERKLE TREE 3 TẦNG (ON-CHAIN MERKLE PROOF TOPOLOGY) */}
              {(() => {
                let parsedBatch = [];
                try {
                  const arr = JSON.parse(batchJson);
                  if (Array.isArray(arr)) parsedBatch = arr.slice(0, 4);
                } catch {
                  parsedBatch = [];
                }
                const sampleLeaves = parsedBatch.length >= 2
                  ? parsedBatch
                  : [
                      { studentId: '0123456789', fullName: 'Nguyễn Văn An' },
                      { studentId: '2251120001', fullName: 'Trần Thị Bích Ngọc' },
                      { studentId: '2251120002', fullName: 'Lê Hoàng Nam' },
                      { studentId: '2251120003', fullName: 'Phạm Minh Tuấn' }
                    ];
                while (sampleLeaves.length < 4) {
                  sampleLeaves.push({
                    studentId: `225112000${sampleLeaves.length + 1}`,
                    fullName: `Sinh viên #${sampleLeaves.length + 1}`
                  });
                }

                const rootDisplay = adminStats.merkleRoot || '0x8f9c2d1e4a7b...';

                return (
                  <div className="p-5 rounded-2xl bg-[#040814] border border-emerald-500/25 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold">
                          TRỰC QUAN HÓA CẤU TRÚC CÂY MERKLE 3 TẦNG
                        </span>
                        <span className="text-xs text-slate-400">
                          Minh họa đường dẫn xác thực $O(\log N)$ từ Lá Sinh Viên lên On-Chain Root
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-300">
                        Keccak256 Sorted Pairs
                      </span>
                    </div>

                    {/* Tầng 1: On-Chain Merkle Root */}
                    <div className="flex flex-col items-center">
                      <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-center max-w-md w-full">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Tầng 1 • On-Chain Merkle Root (Smart Contract)
                        </div>
                        <div className="text-xs font-mono font-bold text-white truncate mt-0.5">
                          {rootDisplay}
                        </div>
                      </div>

                      {/* Nhánh nối Tầng 1 -> Tầng 2 */}
                      <div className="w-1/2 h-4 border-t-2 border-l-2 border-r-2 border-emerald-500/40 rounded-t-lg mt-1" />
                    </div>

                    {/* Tầng 2: Nút Trung Gian (Intermediate Hashes) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-[#081226] border border-cyan-500/35 text-center">
                        <div className="text-[10px] font-bold text-cyan-300 uppercase">
                          Tầng 2 • Nút Nhánh Trái H₁₂ = Keccak256(L₁ ‖ L₂)
                        </div>
                        <div className="text-xs font-mono text-slate-300 mt-1">
                          0x4a7e91c0...b82d19f4
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#081226] border border-cyan-500/35 text-center">
                        <div className="text-[10px] font-bold text-cyan-300 uppercase">
                          Tầng 2 • Nút Nhánh Phải H₃₄ = Keccak256(L₃ ‖ L₄)
                        </div>
                        <div className="text-xs font-mono text-slate-300 mt-1">
                          0x9c3b60e2...71fa08d1
                        </div>
                      </div>
                    </div>

                    {/* Tầng 3: 4 Nút Lá Sinh Viên (Leaf Nodes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      {sampleLeaves.slice(0, 4).map((st, idx) => (
                        <div
                          key={st.studentId || idx}
                          className="p-3 rounded-xl bg-[#081226]/90 border border-slate-800 hover:border-emerald-400/50 transition-all"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
                            <span>Lá L{idx + 1}</span>
                            <span>H(SV_{idx + 1})</span>
                          </div>
                          <div className="text-xs font-bold text-white truncate mt-1">
                            {st.fullName || st.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            MSSV: {st.studentId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Phân hệ 2 của Admin: Thu hồi & Khôi phục khóa thiết bị độc lập */}
          {activeTab === 'ADMIN_REVOCATION' && (
            <div className="p-7 rounded-3xl bg-[#081226] border border-rose-500/30 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-rose-300 m-0">
                  Thu Hồi &amp; Khôi Phục Khóa Thiết Bị Độc Lập (O(1))
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-4">
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
                      className="py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer border-none shadow-lg"
                    >
                      Thu Hồi Khóa Thiết Bị (revokeKey)
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminUnrevokeWallet}
                      className="py-3.5 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"
                    >
                      Khôi Phục Khóa Thiết Bị (unrevokeKey)
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 rounded-2xl bg-[#040814] border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="font-bold text-white">Thu Hồi Khóa Độc Lập O(1)</div>
                  <p className="m-0">
                    Vô hiệu hóa tức thì thiết bị báo mất thông qua bảng băm <code>isRevoked[address]</code> mà không làm thay đổi Merkle Root của các sinh viên khác.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phân hệ 3 của Admin: Trung Tâm Giám Sát Chống Gian Lận (Anti-Fraud Telemetry) & Sổ Cái Kiểm Toán */}
          {activeTab === 'ADMIN_AUDIT' && (
            <div className="space-y-6">
              {/* Khối 1: Trung tâm Giám sát Bảo mật chống Gian lận (Anti-Fraud Telemetry Panel) */}
              <div className="p-7 rounded-3xl bg-[#081226] border border-rose-500/35 shadow-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                      <h2 className="text-lg font-extrabold text-white m-0">
                        🛡️ Trung Tâm Giám Sát Bảo Mật Chống Gian Lận (Anti-Fraud Telemetry)
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 font-mono text-xs font-bold">
                      Đã chặn tự động: {securityAlerts.length} cuộc tấn công
                    </span>
                    <button
                      type="button"
                      onClick={fetchAdminAuditLogs}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
                    >
                      Đồng Bộ Telemetry
                    </button>
                  </div>
                </div>

                {/* 4 Ô Thống Kê Các Lớp Phòng Vệ Mật Mã */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    {
                      type: 'REPLAY_ATTACK',
                      title: 'Chặn Replay Attack (QR Cũ)',
                      count: securityAlerts.filter((a) => a.type === 'REPLAY_ATTACK' || a.type === 'REPLAY').length,
                      layer: 'Dynamic Nonce 35s',
                      color: 'text-rose-300 border-rose-500/35 bg-rose-500/10'
                    },
                    {
                      type: 'DEVICE_SPOOFING',
                      title: 'Chặn Giả Mạo Chữ Ký Số',
                      count: securityAlerts.filter((a) => a.type === 'DEVICE_SPOOFING' || a.type === 'TAMPERING').length,
                      layer: 'ECDSA secp256k1 + FIDO2',
                      color: 'text-amber-300 border-amber-500/35 bg-amber-500/10'
                    },
                    {
                      type: 'PROXY_ATTENDANCE',
                      title: 'Chặn Điểm Danh Hộ (1 Máy)',
                      count: securityAlerts.filter((a) => a.type === 'PROXY_ATTENDANCE' || a.type === 'SYBIL_DEVICE').length,
                      layer: 'Hardware Fingerprint',
                      color: 'text-purple-300 border-purple-500/35 bg-purple-500/10'
                    },
                    {
                      type: 'GEOFENCE_BREACH',
                      title: 'Chặn Ngoài Vùng / Fake GPS',
                      count: securityAlerts.filter((a) => a.type === 'GEOFENCE_BREACH' || a.type === 'MOCK_GPS').length,
                      layer: 'Haversine + Kalman Filter',
                      color: 'text-cyan-300 border-cyan-500/35 bg-cyan-500/10'
                    }
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="p-4 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold ${item.color}`}>
                          BLOCKED
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-2xl font-extrabold text-white font-mono">{item.count}</span>
                        <span className="text-[11px] font-mono text-[#4FF0D6]">{item.layer}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thanh Mô Phỏng Tấn Công Kiểm Thử (Dành cho Demo Hội Đồng NCKH) */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-[#4FF0D6]/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-extrabold text-[#4FF0D6] block">
                      ⚡ Bảng Giả Lập Tấn Công Thực Tế (Kiểm Thử Phòng Vệ Trực Tiếp)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={simulatingAttack}
                      onClick={() => handleSimulateAttack('REPLAY_ATTACK')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      Test Quét Lại QR Cũ
                    </button>
                    <button
                      type="button"
                      disabled={simulatingAttack}
                      onClick={() => handleSimulateAttack('DEVICE_SPOOFING')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      Test Giả Mạo Chữ Ký
                    </button>
                    <button
                      type="button"
                      disabled={simulatingAttack}
                      onClick={() => handleSimulateAttack('PROXY_ATTENDANCE')}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      Test 1 Máy Điểm Danh Hộ
                    </button>
                    <button
                      type="button"
                      disabled={simulatingAttack}
                      onClick={() => handleSimulateAttack('GEOFENCE_BREACH')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      Test Fake GPS Ngoài Vùng
                    </button>
                  </div>
                </div>

                {/* Luồng Cảnh Báo Gian Lận Bị Chặn Thời Gian Thực */}
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {securityAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-2xl bg-[#040814] border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1 min-w-[260px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-slate-400">[{alert.time}]</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-[11px]">
                            {alert.vectorLabel || alert.type}
                          </span>
                          {alert.studentId && alert.studentId !== 'UNKNOWN' && (
                            <span className="font-bold text-white">
                              SV: {alert.studentName} ({alert.studentId})
                            </span>
                          )}
                          {alert.deviceId && (
                            <span className="font-mono text-[11px] text-slate-400">
                              • Thiết bị: {alert.deviceId}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 m-0">{alert.detail}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold">
                          ✓ ĐÃ CHẶN TỰ ĐỘNG (403)
                        </span>
                        {alert.defenseLayer && (
                          <span className="font-mono text-[10.5px] text-[#4FF0D6]">
                            Lớp chặn: {alert.defenseLayer}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Khối 2: Sổ cái Kiểm toán An ninh Toàn trường */}
              <div className="p-7 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-cyan-300 m-0">
                      Sổ Cái Kiểm Toán An Ninh Toàn Trường
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAdminAuditLogs}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
                  >
                    Làm Mới Nhật Ký
                  </button>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">Đang đồng bộ nhật ký kiểm toán từ máy chủ...</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-3.5 rounded-xl bg-[#040814] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono text-slate-400 mr-2">[{log.time}]</span>
                          <strong className="text-emerald-300 mr-2">{log.action}:</strong>
                          <span className="text-slate-200">{log.detail}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-mono text-xs font-semibold">
                          {log.result}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== GIAO DIỆN GIẢNG VIÊN (SAU KHI ĐÃ TẠO LỚP & PHÁT MÃ QR) ==================== */
        <div className="flex-1 flex flex-col p-5 gap-5 max-w-[1600px] w-full mx-auto">
          
          {/* ==================== THANH ĐIỀU KHIỂN NHANH 4 Ô (QUICK CONTROL & KPI BAR) ==================== */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Ô 1: Thống kê sĩ số thời gian thực */}
            <div className="hero-navy-card p-4 rounded-2xl bg-[#081226] border border-slate-800/90 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Sĩ Số Điểm Danh Thời Gian Thực
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white font-mono">{attendees.length}</span>
                    <span className="text-xs font-semibold text-emerald-400">{validAttendeesCount} hợp lệ</span>
                    {suspiciousAttendeesCount > 0 && (
                      <span className="text-xs font-semibold text-rose-400">• {suspiciousAttendeesCount} ngoài vùng</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold cursor-pointer"
                >
                  Xuất CSV Buổi Học
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-300 font-medium">Tỉ lệ trong vùng Geofence</span>
                  <span className="font-bold text-white font-mono">{validRatioPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4FF0D6] via-[#22D3EE] to-blue-500 transition-all duration-500"
                    style={{ width: `${validRatioPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ô 2: Chuyển đổi nhanh chế độ mạng */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-slate-800/90 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Kiểm Soát Kết Nối Mạng
                </span>
                <span className={`text-xs font-semibold ${
                  sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Chặn 4G ngoài' : 'Cho phép 4G/5G'}
                </span>
              </div>
              <div className="grid grid-cols-2 bg-[#040814] p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitchLiveNetworkMode('CAMPUS_WIFI')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
                    sessionConfig.networkMode === 'CAMPUS_WIFI'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  Wi-Fi Giảng Đường
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
                    sessionConfig.networkMode !== 'CAMPUS_WIFI'
                      ? 'bg-emerald-400 text-slate-950 shadow-sm'
                      : 'bg-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  Mạng 4G / 5G
                </button>
              </div>
            </div>

            {/* Ô 3: Điều chỉnh nhanh Bán kính Geofence (R) & Tâm GPS */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-slate-800/90 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Bán Kính Phòng: <strong className="text-cyan-300 font-mono">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSyncLaptopGpsCenter}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 cursor-pointer"
                >
                  Lấy Tâm GPS Laptop
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {[15, 35, 100, 500, 5000].map((rVal) => (
                  <button
                    key={rVal}
                    type="button"
                    onClick={() => handleUpdateLiveRadius(rVal)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
                      Number(sessionConfig.maxRadiusMeters) === rVal
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'bg-[#040814] text-slate-300 hover:text-white'
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
                  className="w-16 py-1.5 px-2 rounded-lg bg-[#040814] border border-slate-800 text-xs font-mono text-cyan-300 text-center outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Ô 4: Hậu kiểm Face ID (Spot-Check 60s) */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-amber-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">
                  Hậu Kiểm Face ID (60s)
                </span>
                {spotCheckState.active ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-xs animate-pulse">
                    Còn {spotCheckState.countdown}s
                  </span>
                ) : (
                  <span className="text-xs text-slate-300">Sẵn sàng</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('ALL')}
                  className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 border-none cursor-pointer"
                >
                  Kiểm Tra Cả Lớp
                </button>
                <button
                  type="button"
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('RISK_TARGETED')}
                  className="py-2 px-2.5 rounded-xl text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Nhóm Rủi Ro (≥30đ)
                </button>
              </div>
            </div>
          </section>

          {statusBannerMsg && (
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 flex items-center justify-between text-xs font-semibold">
              <span>{statusBannerMsg}</span>
              <button
                type="button"
                onClick={() => setStatusBannerMsg('')}
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
              
              {/* TAB 1: MÀN CHIẾU QR ĐIỂM DANH */}
              {activeTab === 'STAGE' && staffRole === 'FACULTY' && isCreated && (
                <div className="flex-1 faculty-glass-card rounded-3xl border border-cyan-500/30 p-6 flex flex-col justify-between shadow-2xl gap-5">
                  
                  {/* Thanh tiêu đề trên cùng của Màn Chiếu (Màn hình 3: IT402.N01 • BUỔI HỌC THỨ N) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/90">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-xs font-bold text-cyan-300">
                          <QrCode size={14} />
                          {sessionConfig.courseCode} • BUỔI HỌC THỨ {sessionConfig.sessionNumber || 1}
                        </span>
                        <span className="text-xs text-slate-300">
                          Phòng <strong className="text-white">{sessionConfig.room}</strong> • Mã phiên: <code className="text-cyan-300">{sessionId}</code>
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white mt-1.5 mb-0">
                        {sessionConfig.courseCode} • BUỔI HỌC THỨ {sessionConfig.sessionNumber || 1} — {sessionConfig.courseName}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStageSafeMode((prev) => !prev)}
                        className={`px-3.5 py-2.5 rounded-2xl font-semibold text-xs cursor-pointer border transition-all ${
                          stageSafeMode
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                            : 'bg-[#040814] border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {stageSafeMode ? 'Đang Bật Ẩn Danh Màn Chiếu' : 'Chế Độ Ẩn Danh Màn Chiếu'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer border-none transition-all shadow-md shadow-cyan-500/20"
                      >
                        <Maximize2 size={14} />
                        Phóng To QR Toàn Màn Chiếu
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const activeCourse = courses.find((c) => (c.courseId || c.id) === activeCourseId);
                          const currentSes = activeCourse?.sessions?.find((s) => s.sessionId === sessionId) || { sessionId };
                          if (activeCourse) {
                            handleDeleteSession(activeCourse, currentSes);
                          } else {
                            setIsCreated(false);
                            setIsSessionOpen(false);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer transition-all"
                      >
                        <Trash2 size={14} />
                        Xóa Phiên QR Này
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinalizeSession()}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs cursor-pointer border-none shadow-lg transition-all"
                      >
                        <CheckCircle2 size={14} />
                        Chốt Sổ Buổi Học
                      </button>
                    </div>
                  </div>

                  {/* Thanh tiến độ sĩ số hiện diện trực tiếp */}
                  {(() => {
                    const activeCourseObj = courses.find((c) => (c.courseId || c.id) === activeCourseId);
                    const targetClassTotal = Number(activeCourseObj?.totalStudents) || (activeCourseObj?.enrolledStudents?.length || 6);
                    const presentCount = attendees.length;
                    const progressPct = targetClassTotal > 0 ? Math.min(100, Math.round((presentCount / targetClassTotal) * 100)) : 0;
                    return (
                      <div className="rounded-2xl bg-[#040814]/85 border border-slate-800/90 px-4 py-3 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                            <Users size={14} className="text-cyan-400" />
                            Sĩ số hiện diện: <strong className="text-white">{presentCount}/{targetClassTotal} SV</strong>
                          </span>
                          <span className="font-mono font-bold text-cyan-300">
                            {progressPct}% đã điểm danh
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Thông báo sự kiện thời gian thực */}
                  {networkBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-rose-300 m-0">
                          CHẶN KẾT NỐI MẠNG — {networkBlockNotice.fullName} ({networkBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-medium text-white mt-0.5 mb-0">{networkBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSwitchLiveNetworkMode('CELLULAR_ANY')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở Chế Độ 4G/5G
                      </button>
                    </div>
                  )}

                  {geofenceBlockNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-amber-300 m-0">
                          VƯỢT BÁN KÍNH PHÒNG HỌC — {geofenceBlockNotice.fullName} ({geofenceBlockNotice.studentId})
                        </p>
                        <p className="text-xs font-medium text-white mt-0.5 mb-0">{geofenceBlockNotice.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateLiveRadius(Math.max(100, (geofenceBlockNotice.distance || 85) + 15))}
                        className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Mở rộng R lên {Math.max(100, (geofenceBlockNotice.distance || 85) + 15)}m
                      </button>
                    </div>
                  )}

                  {!networkBlockNotice && !geofenceBlockNotice && latestVerifiedNotice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs font-semibold">
                      <span>
                        Xác thực thành công: <strong>{latestVerifiedNotice.name}</strong> ({latestVerifiedNotice.studentId}) • Cách tâm {latestVerifiedNotice.distance}m ({latestVerifiedNotice.network})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMapStudentId(latestVerifiedNotice.studentId);
                          setActiveTab('RADAR');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer border-none"
                      >
                        Xem Trên Bản Đồ
                      </button>
                    </div>
                  )}

                  {/* Khu vực trung tâm: Màn Chiếu Mã QR "Cinema Split-Stage" (Cột Trái QR + Vòng Đếm Ngược 35s | Cột Phải Live Check-in Toast & Bảo Mật) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center my-auto">
                    
                    {/* Khung QR Điểm Danh Cỡ Lớn (7 cột) — Cinema Split-Stage với Vòng Tròn Đếm Ngược 35s */}
                    <div className="xl:col-span-7 flex flex-col items-center">
                      {(() => {
                        const ringColor =
                          timerProgress <= 5
                            ? '#F43F5E'
                            : timerProgress <= 10
                            ? '#F59E0B'
                            : '#06B6D4';
                        const glowShadow =
                          timerProgress <= 5
                            ? '0 0 70px rgba(244,63,94,0.38)'
                            : timerProgress <= 10
                            ? '0 0 70px rgba(245,158,11,0.35)'
                            : '0 0 70px rgba(0,242,254,0.34)';

                        return (
                          <div
                            onClick={() => setIsProjectorFullscreen(true)}
                            title="Nhấp vào mã QR để phóng to toàn màn chiếu Hội trường (500x500px)"
                            style={{ boxShadow: glowShadow }}
                            className="relative p-6 bg-white rounded-[34px] border-4 border-cyan-400 flex flex-col items-center cursor-pointer hover:scale-[1.01] transition-all"
                          >
                            {/* 4 Góc Định Vị Máy Chiếu Cinema */}
                            <span className="absolute top-3 left-3 w-4 h-4 border-t-[3px] border-l-[3px] border-cyan-500 rounded-tl-md pointer-events-none" />
                            <span className="absolute top-3 right-3 w-4 h-4 border-t-[3px] border-r-[3px] border-cyan-500 rounded-tr-md pointer-events-none" />
                            <span className="absolute bottom-12 left-3 w-4 h-4 border-b-[3px] border-l-[3px] border-cyan-500 rounded-bl-md pointer-events-none" />
                            <span className="absolute bottom-12 right-3 w-4 h-4 border-b-[3px] border-r-[3px] border-cyan-500 rounded-br-md pointer-events-none" />

                            {/* Vòng tròn SVG Countdown 35s chạy quanh tâm QR */}
                            <div className="relative w-[364px] h-[364px] max-w-[75vw] max-h-[75vw] bg-white rounded-2xl flex items-center justify-center p-3">
                              <svg
                                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                                viewBox="0 0 364 364"
                              >
                                <rect
                                  x="5"
                                  y="5"
                                  width="354"
                                  height="354"
                                  rx="24"
                                  fill="none"
                                  stroke="rgba(226, 232, 240, 0.95)"
                                  strokeWidth="6"
                                />
                                <rect
                                  x="5"
                                  y="5"
                                  width="354"
                                  height="354"
                                  rx="24"
                                  fill="none"
                                  stroke={ringColor}
                                  strokeWidth="6"
                                  strokeDasharray={1390}
                                  strokeDashoffset={1390 - (timerProgress / rotateInterval) * 1390}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease' }}
                                />
                              </svg>
                              <QRCodeCanvas
                                value={qrPayloadString}
                                size={334}
                                level="M"
                                includeMargin={false}
                                style={{ width: '100%', height: '100%', maxWidth: '334px', maxHeight: '334px' }}
                              />
                            </div>

                            <div className="mt-3 flex items-center gap-2.5 text-center">
                              <span
                                className="px-3 py-0.5 rounded-full text-white font-mono text-xs font-extrabold shadow-sm"
                                style={{ backgroundColor: ringColor }}
                              >
                                ⏱ {timerProgress}s
                              </span>
                              <p className="text-sm font-mono font-extrabold text-slate-950 tracking-wider m-0">
                                {currentNonce}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Thanh tiến trình xoay Nonce & Điều khiển QR Thông minh */}
                      <div className="w-[364px] max-w-full mt-3.5 space-y-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">Chu kỳ xoay Nonce chống chụp lén:</span>
                          <span className="text-cyan-400 font-mono font-bold">{timerProgress}s / {rotateInterval}s</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timerProgress / rotateInterval) * 100}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="inline-flex items-center gap-1 bg-[#040814] border border-slate-800 rounded-xl p-1">
                            <span className="inline-flex items-center gap-1 px-2 text-[11px] font-semibold text-slate-400">
                              <Clock size={13} className="text-cyan-400" />
                              Chu kỳ:
                            </span>
                            {[15, 35, 60].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => handleChangeRotateInterval(sec)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer border-none transition-all ${
                                  rotateInterval === sec
                                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/70'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleInstantRotateNonce}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 font-bold text-[11px] cursor-pointer transition-all"
                          >
                            <RefreshCw size={13} />
                            Đổi Mã QR Ngay
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cột Phải (5 cột): Live Check-in Toast Stream + Thông Số Bảo Mật Phiên */}
                    <div className="xl:col-span-5 flex flex-col gap-3.5">
                      {/* Hộp Live Check-in Toast (Trượt mượt từ phải sang khi có sinh viên vừa quét mã) */}
                      <div className="p-4 rounded-2xl bg-[#040814] border border-emerald-500/35 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                              Live Check-in Toast ({attendees.length} SV)
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Thời gian thực
                          </span>
                        </div>

                        {attendees.length === 0 ? (
                          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                            Đang chờ sinh viên đầu tiên quét mã QR trên màn chiếu...
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {attendees.slice(0, 2).map((st, idx) => (
                              <div
                                key={`${st.studentId}-${idx}`}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all animate-[fadeIn_0.25s_ease-out] ${
                                  idx === 0
                                    ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                    : 'bg-slate-950/90 border-slate-800/90 opacity-85'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                                    #{attendees.length - idx}
                                  </div>
                                  <div className="truncate">
                                    <div className="text-xs font-bold text-white truncate">
                                      {maskStudentName(st.name)}
                                    </div>
                                    <div className="text-[11px] font-mono text-emerald-300 truncate">
                                      MSSV: {maskStudentId(st.studentId)} • {stageSafeMode ? 'Trong vùng R' : `${st.distance}m`}
                                    </div>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-mono text-[10px] font-extrabold shrink-0">
                                  HỢP LỆ
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800/90 space-y-3">
                        <div className="text-xs font-bold text-cyan-300">
                          Thông Số Bảo Mật Phiên Điểm Danh
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-300">Chế độ mạng:</span>
                            <span className={`font-semibold ${
                              sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'text-amber-300' : 'text-emerald-300'
                            }`}>
                              {sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Giảng Đường' : 'Mạng 4G/5G'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-300">Bán kính GPS:</span>
                            <span className="font-mono font-bold text-cyan-300">
                              R ≤ {sessionConfig.maxRadiusMeters}m
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-300">Chữ ký định danh:</span>
                            <span className="font-semibold text-emerald-300">
                              EIP-191 + Face ID
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-300">Đối soát lớp học:</span>
                            <span className="font-semibold text-purple-300">
                              Merkle Proof O(log N)
                            </span>
                          </div>
                        </div>

                        {gpsSyncMsg && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300">
                            {gpsSyncMsg}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800/90 space-y-2.5">
                        <div className="text-xs font-bold text-white">
                          Bản Đồ Tọa Độ Trực Tuyến
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('RADAR')}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-xs cursor-pointer transition-all"
                        >
                          Mở Bản Đồ Google Maps ({attendees.length} SV)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ TOÀN MÀN CHIẾU HỘI TRƯỜNG "CINEMA SPLIT-STAGE" SIÊU LỚN (500x500px PROJECTOR OVERLAY) */}
              {isProjectorFullscreen && isCreated && (
                <div className="fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 overflow-y-auto">
                  <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/25">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-extrabold tracking-wide">
                          CINEMA SPLIT-STAGE PROJECTOR (500x500PX)
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
                          Chu kỳ Nonce {rotateInterval}s
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-white mt-2 mb-0">
                        {sessionConfig.courseCode} — {sessionConfig.courseName} (Phòng {sessionConfig.room})
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStageSafeMode((prev) => !prev)}
                        className={`px-3.5 py-2 rounded-2xl font-semibold text-xs cursor-pointer border transition-all ${
                          stageSafeMode
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {stageSafeMode ? 'Đang Ẩn Danh MSSV/Tên' : 'Bật Ẩn Danh Màn Chiếu'}
                      </button>
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-extrabold">
                        Đã điểm danh: {attendees.length} SV
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(false)}
                        className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer border-none shadow-lg"
                      >
                        Thu Nhỏ Về Bảng Điều Khiển
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 w-full max-w-6xl">
                    {/* Cột Trái Cinema Stage (7 cột): Khung QR 500x500px + Vòng Tròn Đếm Ngược SVG */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                      {(() => {
                        const hallRingColor =
                          timerProgress <= 5
                            ? '#F43F5E'
                            : timerProgress <= 10
                            ? '#F59E0B'
                            : '#06B6D4';
                        return (
                          <div className="relative p-7 bg-white rounded-[38px] shadow-[0_0_100px_rgba(0,242,254,0.42)] border-4 border-cyan-400 flex flex-col items-center">
                            <div className="relative w-[488px] h-[488px] max-w-[82vw] max-h-[62vh] bg-white rounded-3xl flex items-center justify-center p-3.5">
                              <svg
                                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                                viewBox="0 0 488 488"
                              >
                                <rect
                                  x="6"
                                  y="6"
                                  width="476"
                                  height="476"
                                  rx="28"
                                  fill="none"
                                  stroke="rgba(226, 232, 240, 0.95)"
                                  strokeWidth="7"
                                />
                                <rect
                                  x="6"
                                  y="6"
                                  width="476"
                                  height="476"
                                  rx="28"
                                  fill="none"
                                  stroke={hallRingColor}
                                  strokeWidth="7"
                                  strokeDasharray={1870}
                                  strokeDashoffset={1870 - (timerProgress / rotateInterval) * 1870}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease' }}
                                />
                              </svg>
                              <QRCodeCanvas
                                value={qrPayloadString}
                                size={452}
                                level="M"
                                includeMargin={false}
                                style={{ width: '100%', height: '100%', maxWidth: '452px', maxHeight: '452px' }}
                              />
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <span
                                className="px-3.5 py-1 rounded-full text-white font-mono text-sm font-extrabold"
                                style={{ backgroundColor: hallRingColor }}
                              >
                                ⏱ {timerProgress}s
                              </span>
                              <p className="text-base font-mono font-extrabold text-slate-950 tracking-widest m-0">
                                {currentNonce}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Cột Phải Cinema Stage (5 cột): Đồng hồ Nonce lớn + Luồng Live Check-in Toast Hội trường */}
                    <div className="lg:col-span-5 flex flex-col gap-4 w-full">
                      <div className="p-5 rounded-3xl bg-[#081226] border border-cyan-500/35 space-y-3 shadow-xl">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 font-semibold">Đếm ngược xoay mã QR:</span>
                          <span className="text-3xl font-mono font-extrabold text-cyan-400">{timerProgress}s</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timerProgress / rotateInterval) * 100}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-[#040814] border border-slate-800 text-slate-300">
                            Bán kính GPS: <strong className="text-cyan-300 font-mono">R ≤ {sessionConfig.maxRadiusMeters}m</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#040814] border border-slate-800 text-slate-300">
                            Mạng: <strong className="text-emerald-400">{sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Trường' : '4G/5G Tự Do'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-3xl bg-[#081226] border border-emerald-500/35 space-y-3 max-h-80 overflow-y-auto shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <p className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider m-0">
                              Live Check-in Toast ({attendees.length} SV)
                            </p>
                          </div>
                          <span className="text-xs font-mono text-cyan-300">EIP-191 + Merkle OK</span>
                        </div>

                        {attendees.length === 0 ? (
                          <div className="p-6 rounded-2xl bg-[#040814] border border-dashed border-slate-800 text-center text-xs text-slate-400">
                            Hãy đưa camera Ví Sinh viên UTH hướng về phía màn chiếu để điểm danh...
                          </div>
                        ) : (
                          attendees.slice(0, 6).map((st, idx) => (
                            <div
                              key={st.studentId}
                              className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all animate-[fadeIn_0.25s_ease-out] ${
                                idx === 0
                                  ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                                  : 'bg-[#040814] border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                                  #{attendees.length - idx}
                                </span>
                                <div className="truncate">
                                  <p className="font-bold text-white m-0 truncate">{maskStudentName(st.name)}</p>
                                  <p className="text-xs font-mono text-slate-400 m-0 truncate">
                                    MSSV: {maskStudentId(st.studentId)} • {stageSafeMode ? 'Trong vùng R' : `${st.distance}m`}
                                  </p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold shrink-0">
                                Hợp lệ
                              </span>
                            </div>
                          ))
                        )}
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

              {/* TAB 3: IDS AUDIT & ĐIỂM RỦI RO GIAN LẬN TỰ ĐỘNG */}
              {activeTab === 'IDS' && (
                <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-rose-500/30 p-6 flex flex-col shadow-2xl gap-4">
                  <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                      <h3 className="text-base font-bold text-rose-300 m-0">
                        🛡️ Trung Tâm Giám Sát Bảo Mật Chống Gian Lận (IDS &amp; Anti-Fraud Telemetry)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                        Đã chặn: {securityAlerts.length} cuộc tấn công
                      </span>
                      <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                        {idsViolationCount} Xung Đột Phần Cứng
                      </span>
                    </div>
                  </div>

                  {/* 4 Ô Thống Kê Lớp Phòng Vệ Chống Gian Lận Thời Gian Thực */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        type: 'REPLAY_ATTACK',
                        title: 'Chặn Replay QR Cũ',
                        count: securityAlerts.filter((a) => a.type === 'REPLAY_ATTACK' || a.type === 'REPLAY').length,
                        layer: 'Nonce 35s',
                        color: 'text-rose-300 border-rose-500/35 bg-rose-500/10'
                      },
                      {
                        type: 'DEVICE_SPOOFING',
                        title: 'Chặn Giả Mạo Chữ Ký',
                        count: securityAlerts.filter((a) => a.type === 'DEVICE_SPOOFING' || a.type === 'TAMPERING').length,
                        layer: 'secp256k1 + FIDO2',
                        color: 'text-amber-300 border-amber-500/35 bg-amber-500/10'
                      },
                      {
                        type: 'PROXY_ATTENDANCE',
                        title: 'Chặn Điểm Danh Hộ',
                        count: securityAlerts.filter((a) => a.type === 'PROXY_ATTENDANCE' || a.type === 'SYBIL_DEVICE').length,
                        layer: 'Device Binding',
                        color: 'text-purple-300 border-purple-500/35 bg-purple-500/10'
                      },
                      {
                        type: 'GEOFENCE_BREACH',
                        title: 'Chặn Fake GPS',
                        count: securityAlerts.filter((a) => a.type === 'GEOFENCE_BREACH' || a.type === 'MOCK_GPS').length,
                        layer: 'Kalman Geofence',
                        color: 'text-cyan-300 border-cyan-500/35 bg-cyan-500/10'
                      }
                    ].map((card) => (
                      <div
                        key={card.type}
                        className="p-3 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-slate-300 truncate">{card.title}</span>
                          <span className={`px-1.5 py-0.5 rounded border font-mono text-[9.5px] font-bold ${card.color}`}>
                            403
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold text-white font-mono">{card.count}</span>
                          <span className="text-[10px] font-mono text-[#4FF0D6]">{card.layer}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Thanh Kiểm Thử Giả Lập Tấn Công & Phát Lệnh Hậu Kiểm Chọn Lọc */}
                  <div className="p-3.5 rounded-2xl bg-[#040814] border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-extrabold text-[#4FF0D6] mr-1">
                        ⚡ Test Chặn Gian Lận:
                      </span>
                      <button
                        type="button"
                        disabled={simulatingAttack}
                        onClick={() => handleSimulateAttack('REPLAY_ATTACK')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer"
                      >
                        + QR Hết Hạn
                      </button>
                      <button
                        type="button"
                        disabled={simulatingAttack}
                        onClick={() => handleSimulateAttack('DEVICE_SPOOFING')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer"
                      >
                        + Sai Chữ Ký
                      </button>
                      <button
                        type="button"
                        disabled={simulatingAttack}
                        onClick={() => handleSimulateAttack('PROXY_ATTENDANCE')}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-bold cursor-pointer"
                      >
                        + 1 Máy 2 SV
                      </button>
                      <button
                        type="button"
                        disabled={simulatingAttack}
                        onClick={() => handleSimulateAttack('GEOFENCE_BREACH')}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer"
                      >
                        + Fake GPS
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerSpotCheck('RISK_TARGETED')}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs border-none cursor-pointer"
                      >
                        Hậu Kiểm Nhóm Rủi Ro (≥ 30đ)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSpotCheck('ALL')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-semibold text-xs cursor-pointer"
                      >
                        Hậu Kiểm Toàn Lớp
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                    {/* Nhật ký các cuộc tấn công gian lận vừa bị hệ thống tự động chặn (403) */}
                    <div className="p-4 rounded-2xl bg-[#040814] border border-rose-500/30 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                        <span>Nhật Ký Chặn Gian Lận Thời Gian Thực (Zero-Trust Guard)</span>
                        <span className="font-mono text-[11px] text-emerald-300">Trạng thái: Đang bảo vệ 100%</span>
                      </div>
                      <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
                        {securityAlerts.slice(0, 8).map((alert) => (
                          <div
                            key={alert.id}
                            className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5 flex-1 min-w-[220px]">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-slate-400">[{alert.time}]</span>
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-[10.5px]">
                                  {alert.vectorLabel || alert.type}
                                </span>
                                {alert.studentId && alert.studentId !== 'UNKNOWN' && (
                                  <span className="font-semibold text-white">
                                    {alert.studentName} ({alert.studentId})
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-300 text-[11.5px] m-0">{alert.detail}</p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[10.5px] font-bold">
                                ✓ ĐÃ CHẶN (403)
                              </span>
                              {alert.defenseLayer && (
                                <span className="font-mono text-[10px] text-[#4FF0D6]">{alert.defenseLayer}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cảnh báo trùng mã phần cứng Device ID */}
                    {Object.entries(deviceCounts).map(([devId, count]) => {
                      if (count > 1) {
                        const violators = attendees.filter(a => a.deviceId === devId);
                        return (
                          <div key={devId} className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/40 text-xs space-y-2">
                            <div className="flex justify-between text-rose-400 font-bold">
                              <span>XUNG ĐỘT VÂN TAY PHẦN CỨNG: 1 MÁY ĐIỂM DANH CHO {count} SINH VIÊN</span>
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

                    {/* Bảng chấm điểm Fraud Risk Score (0-100) */}
                    <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Bảng Điểm Rủi Ro &amp; Đối Soát Tọa Độ</span>
                        <span className="text-xs font-normal text-slate-300">
                          &lt;30: Hợp lệ • 30-70: Nghi vấn • &gt;70: Cảnh báo
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
                                <div className="font-semibold text-white flex items-center gap-2">
                                  <span>{st.name}</span>
                                  <span className="font-mono text-cyan-400 text-xs">({st.studentId})</span>
                                  <span className="font-mono text-xs text-slate-400">• Máy: {st.deviceId}</span>
                                </div>
                                <div className="text-xs text-slate-300 mt-0.5">
                                  Khoảng cách: <strong className="text-white">{st.distance}m</strong> • Sai số GPS:{' '}
                                  <strong className={st.isMockGps || Number(st.gpsAccuracy) <= 0.5 ? 'text-rose-400' : 'text-emerald-300'}>
                                    ±{st.gpsAccuracy ?? 6.2}m {st.isMockGps ? '(Mock Location)' : '(Hợp lệ)'}
                                  </strong>
                                  {risk.reasons.length > 0 && (
                                    <span className="text-amber-300 ml-2">• {risk.reasons.join(', ')}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${badgeStyle}`}>
                                  Risk Score: {risk.score}/100
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleTriggerSingleStudentSpotCheck(st)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-semibold cursor-pointer transition-all"
                                  title="Yêu cầu sinh viên này quét lại Face ID trong 60s"
                                >
                                  Hậu Kiểm 60s
                                </button>
                                {risk.score >= 30 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeFraudulentAttendee(st)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer transition-all"
                                    title="Đình chỉ và hủy kết quả điểm danh nghi vấn gian lận"
                                  >
                                    Hủy Điểm Danh
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI (4 CỘT TRÊN MÀN LỚN): DANH SÁCH SINH VIÊN HIỆN DIỆN CÓ TÌM KIẾM & BỘ LỌC */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
              <div className="flex-1 min-h-[520px] faculty-glass-card rounded-3xl border border-slate-800 p-5 flex flex-col overflow-hidden shadow-2xl gap-3.5">
                
                {/* Header Danh sách sinh viên */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <h3 className="text-base font-bold text-white m-0">
                      Danh Sách Hiện Diện ({filteredAttendees.length}/{attendees.length})
                    </h3>
                    <p className="text-xs font-medium text-cyan-300 mt-0.5 mb-0">
                      {stageSafeMode ? 'Đang bật chế độ ẩn danh màn chiếu' : 'Đồng bộ thời gian thực'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setManualCheckInContext(null);
                      setShowManualCheckInModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 font-bold text-xs cursor-pointer transition-all"
                  >
                    <UserPlus size={13} />
                    Điểm Danh Thủ Công
                  </button>
                </div>

                <div className="flex items-center justify-end">
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
                          rosterFilter === tab.id
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-transparent text-slate-300 hover:text-white'
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
                    placeholder="Tìm nhanh theo tên sinh viên hoặc MSSV..."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#040814] border border-slate-800 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
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
                    <div className="py-12 text-center text-xs text-slate-400">
                      Không tìm thấy sinh viên nào khớp bộ lọc.
                    </div>
                  ) : (
                    filteredAttendees.map((s) => {
                      const isSuspicious = s.distance > sessionConfig.maxRadiusMeters;
                      const riskInfo = calculateFraudRiskScore(s);
                      return (
                        <div
                          key={s.studentId}
                          className={`p-3.5 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2.5 ${
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
                              className="w-11 h-11 rounded-xl object-cover border border-cyan-500/30 flex-shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-sm font-semibold text-white truncate m-0">{maskStudentName(s.name)}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-mono text-cyan-300 font-semibold">{maskStudentId(s.studentId)}</span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs font-mono text-slate-300">{s.checkInTime}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                  isSuspicious
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {stageSafeMode ? 'Hợp lệ' : `Cách tâm ${s.distance}m`}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
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
                                  className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 cursor-pointer"
                                >
                                  Bản Đồ
                                </button>
                                <a
                                  href={`https://www.google.com/maps?q=${s.coords.lat},${s.coords.lon}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 no-underline"
                                >
                                  ↗
                                </a>
                              </div>
                            )}

                            {s.spotCheckStatus === 'PENDING' && (
                              <button
                                onClick={() => handleMockPass(s.studentId)}
                                className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold animate-pulse cursor-pointer"
                              >
                                Chờ Face ID...
                              </button>
                            )}
                            {s.spotCheckStatus === 'VERIFIED' && (
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                                Đã xác thực
                              </span>
                            )}
                            {s.spotCheckStatus === 'FAILED' && (
                              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
                                Ngoài vùng
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

      {/* MODAL ĐIỂM DANH THỦ CÔNG / BỔ SUNG TẠI LỚP */}
      {showManualCheckInModal && (() => {
        const modalCourse = manualCheckInContext
          ? courses.find((c) => (c.courseId || c.id) === (manualCheckInContext.course.courseId || manualCheckInContext.course.id)) || manualCheckInContext.course
          : courses.find((c) => (c.courseId || c.id) === activeCourseId || c.courseCode === sessionConfig.courseCode);
        const modalSession = manualCheckInContext
          ? (modalCourse?.sessions || []).find((s) => s.sessionId === manualCheckInContext.session.sessionId) || manualCheckInContext.session
          : null;
        const presentList = manualCheckInContext
          ? (Array.isArray(modalSession?.attendees) ? modalSession.attendees : [])
          : attendees;
        const alreadyPresentIds = new Set(presentList.map((a) => String(a.studentId || '')));
        const rosterList = Array.isArray(modalCourse?.enrolledStudents) && modalCourse.enrolledStudents.length > 0
          ? modalCourse.enrolledStudents
          : DEFAULT_ENROLLED_ROSTER;
        const contextLabel = manualCheckInContext
          ? `${modalCourse?.courseCode || ''} • Buổi ${modalSession?.sessionIndex || modalSession?.sessionNumber || 1}`
          : `${sessionConfig.courseCode} • Buổi ${sessionConfig.sessionNumber || 1} (Đang phát trực tiếp)`;
        const absentCount = rosterList.filter((st) => !alreadyPresentIds.has(String(st.studentId))).length;

        return (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowManualCheckInModal(false);
            }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="faculty-glass-card w-full max-w-2xl rounded-3xl border border-cyan-500/35 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
              {/* Header Modal */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800/90">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-[11px] font-bold text-cyan-300">
                    <UserPlus size={12} />
                    ĐIỂM DANH THỦ CÔNG / BỔ SUNG TẠI LỚP
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1.5 mb-0">
                    {contextLabel}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 mb-0">
                    Hỗ trợ sinh viên quên điện thoại, hết pin, lỗi camera/GPS hoặc bổ sung vắng có phép.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualCheckInModal(false)}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all"
                  aria-label="Đóng hộp thoại điểm danh thủ công"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Phần 1: Điểm danh nhanh từ danh sách lớp (1-click) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-200 inline-flex items-center gap-1.5">
                    <Users size={14} className="text-cyan-400" />
                    Danh sách lớp học phần ({rosterList.length} SV)
                  </span>
                  <span className="font-mono font-semibold text-amber-300">
                    Chưa điểm danh: {absentCount} SV
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {rosterList.map((st) => {
                    const isPresent = alreadyPresentIds.has(String(st.studentId));
                    return (
                      <div
                        key={st.studentId}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          isPresent
                            ? 'bg-emerald-500/10 border-emerald-500/35'
                            : 'bg-[#040814]/85 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{st.name}</div>
                          <div className="text-[11px] font-mono text-cyan-300">{st.studentId}</div>
                        </div>

                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shrink-0">
                            <CheckCircle2 size={12} />
                            Đã có mặt
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleManualCheckInStudent({
                                studentId: st.studentId,
                                name: st.name,
                                major: st.major || 'An toàn Thông tin',
                                reason: manualForm.reason || 'Quên điện thoại / Hết pin'
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-extrabold cursor-pointer border-none shrink-0 transition-all"
                          >
                            <Plus size={12} />
                            Có mặt
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phần 2: Nhập MSSV thủ công hoặc chọn lý do bổ sung */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!manualForm.studentId.trim()) return;
                  handleManualCheckInStudent(manualForm);
                }}
                className="rounded-2xl bg-[#040814]/90 border border-slate-800 p-4 space-y-3"
              >
                <div className="text-xs font-bold text-slate-200">
                  Thêm MSSV ngoài danh sách / Lý do ghi nhận
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={manualForm.studentId}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    placeholder="MSSV (VD: 2251120099)"
                    className="py-2.5 px-3 rounded-xl bg-[#071326] border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-mono"
                  />
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Họ và tên sinh viên"
                    className="py-2.5 px-3 rounded-xl bg-[#071326] border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
                  />
                  <select
                    value={manualForm.reason}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, reason: e.target.value }))}
                    className="py-2.5 px-3 rounded-xl bg-[#071326] border border-slate-700 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Quên điện thoại / Hết pin">Quên điện thoại / Hết pin</option>
                    <option value="Hỏng camera / Lỗi GPS">Hỏng camera / Lỗi GPS</option>
                    <option value="Bổ sung có phép">Bổ sung có phép</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualCheckInModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold cursor-pointer border-none shadow-md"
                  >
                    <CheckCircle2 size={14} />
                    Xác Nhận Có Mặt
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}

