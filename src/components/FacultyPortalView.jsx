import React, { useState, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Home,
  BookOpen,
  Users,
  IdCard,
  Award,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Wifi,
  Radio,
  RefreshCw,
  Maximize2,
  UserPlus,
  Trash2,
  LogOut,
  Sparkles,
  Lock,
  Unlock,
  ChevronDown,
  X
} from 'lucide-react';
import GoogleMapsLiveView from './GoogleMapsLiveView';

const DEFAULT_DEMO_COURSES = [
  {
    id: 'CLS_CNTT101',
    courseCode: 'CNTT101',
    courseName: 'Lập trình Python',
    defaultRoom: 'A2-301',
    totalStudents: 46,
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 2, 07:30 – 10:00',
    sessions: [
      {
        sessionId: 'SES_CNTT101_B01',
        sessionNumber: 1,
        sessionIndex: 1,
        date: '19/11/2026',
        timeRange: '07:30 – 08:00',
        room: 'A2-301',
        isFinalized: true,
        status: 'FINALIZED',
        attendees: [
          {
            studentId: '2151050123',
            name: 'Nguyễn Văn An',
            major: 'Công nghệ Thông tin',
            distance: 4,
            checkInTime: '07:31:05',
            network: 'CAMPUS_WIFI',
            deviceId: 'HYBRID:iPhone15:WebAuthn:882a',
            status: 'PRESENT'
          },
          {
            studentId: '2151050124',
            name: 'Trần Thị Bích',
            major: 'Công nghệ Thông tin',
            distance: 6,
            checkInTime: '07:31:18',
            network: 'CAMPUS_WIFI',
            deviceId: 'HYBRID:SamsungS24:WebAuthn:19c4',
            status: 'PRESENT'
          },
          {
            studentId: '2251120000',
            name: 'Nguyễn Đức Hiển',
            major: 'An toàn Thông tin',
            distance: 3,
            checkInTime: '07:31:42',
            network: 'CAMPUS_WIFI',
            deviceId: 'HYBRID:iPhone15Pro:FIDO2:ed1d',
            status: 'PRESENT'
          },
          {
            studentId: '2251120002',
            name: 'Trần Thị Mai',
            major: 'An toàn Thông tin',
            distance: 5,
            checkInTime: '07:32:10',
            network: '4G_LTE',
            deviceId: 'HYBRID:Xiaomi14:FIDO2:77e1',
            status: 'PRESENT'
          },
          {
            studentId: '2251120004',
            name: 'Phạm Minh Tuấn',
            major: 'Công nghệ Thông tin',
            distance: 8,
            checkInTime: '07:33:04',
            network: 'CAMPUS_WIFI',
            deviceId: 'HYBRID:Pixel8:FIDO2:cba6',
            status: 'PRESENT'
          }
        ]
      }
    ]
  },
  {
    id: 'CLS_CTDL202',
    courseCode: 'CTDL202',
    courseName: 'Cấu trúc dữ liệu',
    defaultRoom: 'B1-204',
    totalStudents: 40,
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 3, 13:00 – 15:30',
    sessions: []
  },
  {
    id: 'CLS_AI301',
    courseCode: 'AI301',
    courseName: 'Học máy',
    defaultRoom: 'C3-402',
    totalStudents: 52,
    defaultRadius: 50,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 5, 15:45 – 17:15',
    sessions: []
  }
];

const INITIAL_STUDENT_ROSTER = [
  {
    studentId: '2151050123',
    name: 'Nguyễn Văn An',
    major: 'Công nghệ Thông tin',
    email: '2151050123@ut.edu.vn',
    did: 'did:uth:3f8a1bc94e20d17f...9c2e',
    didStatus: 'VERIFIED',
    vcType: 'Chứng chỉ hoàn thành',
    vcDate: '15/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 98,
    checkInTime: '07:31:05',
    presentInDemo: true
  },
  {
    studentId: '2151050124',
    name: 'Trần Thị Bích',
    major: 'Công nghệ Thông tin',
    email: '2151050124@ut.edu.vn',
    did: 'did:uth:7b14c2e81a09f44d...d45f',
    didStatus: 'VERIFIED',
    vcType: 'Chứng chỉ hiện diện',
    vcDate: '15/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 96,
    checkInTime: '07:31:18',
    presentInDemo: true
  },
  {
    studentId: '2151050125',
    name: 'Lê Minh Quân',
    major: 'An toàn Thông tin',
    email: '2151050125@ut.edu.vn',
    did: '',
    didStatus: 'UNVERIFIED',
    vcType: 'Chứng chỉ hoàn thành',
    vcDate: '14/11/2026',
    vcStatus: 'PENDING',
    attendanceRate: 74,
    checkInTime: '–',
    presentInDemo: false
  },
  {
    studentId: '2251120000',
    name: 'Nguyễn Đức Hiển',
    major: 'An toàn Thông tin',
    email: '2251120000@ut.edu.vn',
    did: 'did:uth:1d9b6938a3f073e3...ed1d',
    didStatus: 'VERIFIED',
    vcType: 'Chứng chỉ hoàn thành',
    vcDate: '15/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 100,
    checkInTime: '07:31:42',
    presentInDemo: true
  },
  {
    studentId: '2251120002',
    name: 'Trần Thị Mai',
    major: 'An toàn Thông tin',
    email: '2251120002@ut.edu.vn',
    did: 'did:uth:44cb881290a4e621...77e1',
    didStatus: 'VERIFIED',
    vcType: 'Chứng chỉ hiện diện',
    vcDate: '15/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 95,
    checkInTime: '07:32:10',
    presentInDemo: true
  },
  {
    studentId: '2251120004',
    name: 'Phạm Minh Tuấn',
    major: 'Khoa học Dữ liệu & AI',
    email: '2251120004@ut.edu.vn',
    did: 'did:uth:92ed1145abcd8871...cba6',
    didStatus: 'VERIFIED',
    vcType: 'Chứng chỉ hiện diện',
    vcDate: '14/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 92,
    checkInTime: '07:33:04',
    presentInDemo: true
  }
];

const SEVEN_DAY_BARS = [
  { date: '12/11', rate: 96.5 },
  { date: '13/11', rate: 95.8 },
  { date: '14/11', rate: 97.1 },
  { date: '15/11', rate: 96.0 },
  { date: '16/11', rate: 98.2 },
  { date: '17/11', rate: 97.5 },
  { date: '18/11', rate: 96.8 }
];

const WEEKLY_LINE_POINTS = [
  { week: 'T1', rate: 94.2 },
  { week: 'T2', rate: 95.5 },
  { week: 'T3', rate: 95.0 },
  { week: 'T4', rate: 96.4 },
  { week: 'T5', rate: 96.1 },
  { week: 'T6', rate: 97.5 },
  { week: 'T7', rate: 96.8 },
  { week: 'T8', rate: 97.2 }
];

export default function FacultyPortalView({
  facultyUser,
  courses,
  isCreated,
  isSessionOpen,
  sessionId,
  sessionConfig,
  currentNonce,
  timerProgress,
  rotateInterval,
  qrPayloadString,
  attendees,
  securityAlerts,
  spotCheckState,
  soundEnabled,
  setSoundEnabled,
  stageSafeMode,
  setStageSafeMode,
  setIsProjectorFullscreen,
  showCreateCourseForm,
  setShowCreateCourseForm,
  newCourseForm,
  setNewCourseForm,
  coursePresets,
  handleQuickFillCoursePreset,
  handleCreateNewCourse,
  handleCreateNewSession,
  handleFinalizeSession,
  handleToggleSessionState,
  handleInstantRotateNonce,
  handleChangeRotateInterval,
  handleSwitchLiveNetworkMode,
  handleUpdateLiveRadius,
  handleSyncLaptopGpsCenter,
  handleTriggerSpotCheck,
  handleSimulateAttack,
  simulatingAttack,
  handleExportCSV,
  handleExportSemesterCSV,
  setShowManualCheckInModal,
  setManualCheckInContext,
  setCourseToDelete,
  handleQuickSwitchAccount,
  handleLogout,
  statusBannerMsg,
  setStatusBannerMsg
}) {
  // 7 Mục Sidebar Chính
  const [sidebarTab, setSidebarTab] = useState('HOME'); // 'HOME' | 'CLASSES' | 'STUDENTS' | 'DID' | 'VC' | 'REPORTS' | 'SETTINGS'
  // 4 Chế độ con bên trong mục "Lớp học & Điểm danh" (Tương ứng Màn hình 2, 3, 4, 5 trong ảnh)
  const [classSubView, setClassSubView] = useState('LIST'); // 'LIST' | 'CREATE_SESSION' | 'LIVE_SESSION' | 'RESULTS'
  // Chế độ hiển thị bổ sung trong Phiên đang diễn ra (QR / Bản đồ GPS / Giám sát IDS)
  const [liveStageToolTab, setLiveStageToolTab] = useState('QR'); // 'QR' | 'RADAR' | 'IDS'

  // Bộ lọc và tìm kiếm
  const [courseSearch, setCourseSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDidFilter, setStudentDidFilter] = useState('ALL');
  const [didSearch, setDidSearch] = useState('');
  const [vcSubTab, setVcSubTab] = useState('ISSUED'); // 'ISSUED' | 'PENDING'
  const [selectedSemester, setSelectedSemester] = useState('HK1_2026_2027');

  // Danh sách sinh viên & DID/VC có thể tương tác cấp mới trực tiếp
  const [studentRecords, setStudentRecords] = useState(INITIAL_STUDENT_ROSTER);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [showIssueDidModal, setShowIssueDidModal] = useState(false);
  const [showIssueVcModal, setShowIssueVcModal] = useState(false);
  const [newDidForm, setNewDidForm] = useState({
    studentId: '2151050125',
    name: 'Lê Minh Quân',
    major: 'An toàn Thông tin'
  });
  const [newVcForm, setNewVcForm] = useState({
    studentId: '2151050125',
    vcType: 'Chứng chỉ hoàn thành'
  });
  const [portalToast, setPortalToast] = useState('');

  // Kết hợp danh sách lớp thực tế và 3 lớp chuẩn trong mẫu thiết kế
  const displayCourses = useMemo(() => {
    if (!courses || courses.length === 0) return DEFAULT_DEMO_COURSES;
    const existingCodes = new Set(courses.map((c) => c.courseCode));
    const merged = [...courses];
    DEFAULT_DEMO_COURSES.forEach((demo) => {
      if (!existingCodes.has(demo.courseCode)) {
        merged.push(demo);
      }
    });
    return merged;
  }, [courses]);

  const [selectedCourseForView, setSelectedCourseForView] = useState(
    () => displayCourses[0] || DEFAULT_DEMO_COURSES[0]
  );

  // Cấu hình form Tạo phiên điểm danh (Màn hình 3)
  const [sessionForm, setSessionForm] = useState({
    courseCode: 'CNTT101',
    startTime: '07:30',
    startDate: '19/11/2026',
    endTime: '08:00',
    endDate: '19/11/2026',
    useQr: true,
    useWebAuthn: true,
    useGeofence: true
  });

  const activeCourseObj =
    displayCourses.find((c) => c.courseCode === sessionConfig?.courseCode) ||
    selectedCourseForView ||
    displayCourses[0];

  const totalCoursesCount = Math.max(5, displayCourses.length);
  const totalStudentsCount = useMemo(() => {
    const sum = displayCourses.reduce((acc, c) => acc + (Number(c.totalStudents) || 45), 0);
    return Math.max(238, sum);
  }, [displayCourses]);
  const totalSessionsCount = useMemo(() => {
    const sum = displayCourses.reduce((acc, c) => acc + (c.sessions?.length || 0), 0);
    return Math.max(42, sum);
  }, [displayCourses]);

  const showToast = (msg) => {
    setPortalToast(msg);
    setTimeout(() => {
      setPortalToast((prev) => (prev === msg ? '' : prev));
    }, 4000);
  };

  // Mở màn hình 3: Tạo phiên điểm danh
  const handleOpenCreateSessionScreen = (course) => {
    const target = course || activeCourseObj;
    setSelectedCourseForView(target);
    setSessionForm((prev) => ({
      ...prev,
      courseCode: target.courseCode
    }));
    setSidebarTab('CLASSES');
    setClassSubView('CREATE_SESSION');
  };

  // Xác nhận Tạo phiên từ Màn hình 3 -> Chuyển sang Màn hình 4 (Phiên điểm danh đang diễn ra)
  const handleConfirmCreateSession = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const target =
      displayCourses.find((c) => c.courseCode === sessionForm.courseCode) ||
      selectedCourseForView ||
      displayCourses[0];
    setSelectedCourseForView(target);
    handleCreateNewSession(target);
    setSidebarTab('CLASSES');
    setClassSubView('LIVE_SESSION');
    setLiveStageToolTab('QR');
  };

  // Cấp / Cập nhật DID cho sinh viên (Màn hình 7)
  const handleIssueOrUpdateDid = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cleanId = newDidForm.studentId.trim();
    if (!cleanId) return;
    const randomHex = Math.random().toString(16).substring(2, 10);
    const tailHex = Math.random().toString(16).substring(2, 6);
    const generatedDid = `did:uth:${randomHex}...${tailHex}`;

    setStudentRecords((prev) => {
      const exists = prev.some((s) => s.studentId === cleanId);
      if (exists) {
        return prev.map((s) =>
          s.studentId === cleanId
            ? {
                ...s,
                name: newDidForm.name.trim() || s.name,
                did: generatedDid,
                didStatus: 'VERIFIED'
              }
            : s
        );
      }
      return [
        {
          studentId: cleanId,
          name: newDidForm.name.trim() || `Sinh viên ${cleanId}`,
          major: newDidForm.major || 'Công nghệ Thông tin',
          email: `${cleanId}@ut.edu.vn`,
          did: generatedDid,
          didStatus: 'VERIFIED',
          vcType: 'Chứng chỉ hiện diện',
          vcDate: new Date().toLocaleDateString('vi-VN'),
          vcStatus: 'ISSUED',
          attendanceRate: 100,
          checkInTime: '07:35:00',
          presentInDemo: true
        },
        ...prev
      ];
    });
    setShowIssueDidModal(false);
    showToast(`✓ Đã cấp định danh số ${generatedDid} cho MSSV ${cleanId}`);
  };

  // Cấp chứng chỉ số VC cho sinh viên (Màn hình 8)
  const handleIssueVc = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const todayStr = new Date().toLocaleDateString('vi-VN');
    setStudentRecords((prev) =>
      prev.map((s) =>
        s.studentId === newVcForm.studentId
          ? {
              ...s,
              vcType: newVcForm.vcType,
              vcDate: todayStr,
              vcStatus: 'ISSUED',
              didStatus: 'VERIFIED',
              did: s.did || `did:uth:8c4e19a2...${s.studentId.slice(-4)}`
            }
          : s
      )
    );
    setShowIssueVcModal(false);
    showToast(`✓ Đã ký và cấp ${newVcForm.vcType} (W3C VC) cho MSSV ${newVcForm.studentId}`);
  };

  // Tải file JSON chứng chỉ W3C VC của sinh viên
  const handleDownloadStudentVc = (student) => {
    const vcPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'UTHAttendanceCredential'],
      issuer: 'did:uth:issuer:university-of-transport-hcmc',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: student.did || `did:uth:${student.studentId}`,
        studentId: student.studentId,
        fullName: student.name,
        major: student.major,
        credentialType: student.vcType,
        issuedDate: student.vcDate
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date().toISOString(),
        verificationMethod: 'did:uth:issuer#key-1',
        merkleRoot: '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2'
      }
    };
    const blob = new Blob([JSON.stringify(vcPayload, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UTH_VC_${student.studentId}.json`;
    a.click();
    showToast(`✓ Đã tải xuống chứng chỉ W3C VC của ${student.name} (${student.studentId})`);
  };

  // Danh sách kết quả điểm danh kết hợp dữ liệu thực tế từ WebSocket (`attendees`) và danh sách lớp
  const combinedResultsRoster = useMemo(() => {
    const liveMap = new Map();
    (attendees || []).forEach((a) => {
      liveMap.set(String(a.studentId), a);
    });

    return studentRecords.map((st, idx) => {
      const liveRec = liveMap.get(String(st.studentId));
      const isPresent = Boolean(liveRec) || st.presentInDemo;
      return {
        stt: idx + 1,
        studentId: st.studentId,
        name: st.name,
        major: st.major,
        isPresent,
        checkInTime: liveRec?.checkInTime || (isPresent ? st.checkInTime : '–'),
        distance: liveRec?.distance ?? (isPresent ? 4 + idx : null)
      };
    });
  }, [attendees, studentRecords]);

  const classTotalSize = Number(activeCourseObj?.totalStudents) || 46;
  const liveAuthenticatedCount =
    attendees && attendees.length > 0 ? attendees.length : 37;
  const liveAuthenticatedPct = Math.min(
    100,
    Number(((liveAuthenticatedCount / classTotalSize) * 100).toFixed(1))
  );

  const lecturerDisplayName =
    facultyUser?.fullName && facultyUser.fullName !== 'TS. Trần Thế Vinh'
      ? facultyUser.fullName
      : 'ThS. Nguyễn Thị Hiên';

  return (
    <div
      className="min-h-screen w-full bg-[#08071A] text-white font-sans select-none flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 75% 15%, rgba(124, 58, 237, 0.16) 0%, transparent 50%), radial-gradient(circle at 20% 85%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), linear-gradient(180deg, #08071A 0%, #0B0922 100%)'
      }}
    >
      {/* ==================== TOPBAR UTH-TRUSTID GIẢNG VIÊN (FULL-WIDTH RESPONSIVE) ==================== */}
      <header className="sticky top-0 z-30 min-h-16 sm:h-20 px-4 sm:px-8 lg:px-10 py-2.5 border-b border-purple-500/20 bg-[#0A0820]/92 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        {/* Cụm Logo Trái */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.55)] border border-purple-300/35 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight text-white leading-none">
              UTH-TrustID
            </div>
            <div className="text-xs sm:text-sm font-medium text-purple-300 mt-0.5">
              Giảng viên
            </div>
          </div>
        </div>

        {/* Cụm Thông báo & Hồ sơ Giảng viên Bên Phải */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {isCreated && (
            <button
              type="button"
              onClick={() => {
                setSidebarTab('CLASSES');
                setClassSubView('LIVE_SESSION');
              }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang mở phiên: {sessionConfig.courseCode}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSidebarTab('CLASSES');
              setClassSubView('LIVE_SESSION');
              setLiveStageToolTab('IDS');
            }}
            title="Cảnh báo bảo mật & thông báo lớp học"
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#151232] hover:bg-[#1E1945] border border-purple-400/25 flex items-center justify-center text-slate-200 cursor-pointer transition-all"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 px-1 rounded-full bg-[#A855F7] text-[10px] font-bold text-white flex items-center justify-center">
              {securityAlerts?.length || 2}
            </span>
          </button>

          {/* Hồ sơ Giảng viên */}
          <div className="flex items-center gap-3 pl-2.5 border-l border-white/10">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-full bg-[#13102E] flex items-center justify-center text-xs sm:text-sm font-extrabold text-purple-200">
                NH
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm lg:text-base font-bold text-white leading-tight">
                {lecturerDisplayName}
              </div>
              <div className="text-xs text-slate-400 leading-tight mt-0.5">
                Giảng viên
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleQuickSwitchAccount && handleQuickSwitchAccount('admin@uth.edu.vn')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151232] hover:bg-[#1F1A48] border border-purple-400/30 text-purple-200 text-xs sm:text-sm font-semibold cursor-pointer transition-all"
          >
            ⇄ Cổng Admin
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ==================== KHUNG LÀM VIỆC CHÍNH: TOÀN MÀN HÌNH 100% WIDTH & RESPONSIVE MỌI THIẾT BỊ ==================== */}
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        
        {/* SIDEBAR TRÁI 7 MỤC CỠ LỚN (CUỘN NGANG TRÊN MOBILE/TABLET, CỘT DỌC RỘNG TRÊN DESKTOP) */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-purple-500/20 bg-[#0B0920]/80 p-3 sm:p-5 flex flex-col justify-between gap-5">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {[
              { id: 'HOME', label: 'Trang chủ', icon: <Home className="w-5 h-5 shrink-0" /> },
              {
                id: 'CLASSES',
                label: 'Lớp học & Điểm danh',
                icon: <BookOpen className="w-5 h-5 shrink-0" />
              },
              { id: 'STUDENTS', label: 'Sinh viên', icon: <Users className="w-5 h-5 shrink-0" /> },
              {
                id: 'DID',
                label: 'Danh tính số (DID)',
                icon: <IdCard className="w-5 h-5 shrink-0" />
              },
              {
                id: 'VC',
                label: 'Chứng chỉ số (VC)',
                icon: <Award className="w-5 h-5 shrink-0" />
              },
              {
                id: 'REPORTS',
                label: 'Báo cáo & Thống kê',
                icon: <BarChart3 className="w-5 h-5 shrink-0" />
              },
              { id: 'SETTINGS', label: 'Cài đặt', icon: <Settings className="w-5 h-5 shrink-0" /> }
            ].map((item) => {
              const isActive = sidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSidebarTab(item.id);
                    if (item.id === 'CLASSES' && classSubView === 'CREATE_SESSION') {
                      setClassSubView(isCreated ? 'LIVE_SESSION' : 'LIST');
                    }
                  }}
                  className={`px-4 py-3 lg:py-3.5 rounded-2xl text-xs sm:text-sm xl:text-[15px] font-bold cursor-pointer border-none transition-all flex items-center gap-3.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-[0_8px_24px_rgba(139,92,246,0.48)]'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Hộp trạng thái nhanh ở chân Sidebar */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-2xl bg-[#120F2D] border border-purple-400/25">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-purple-200">Trạng thái Node DID</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              W3C DID • WebAuthn FIDO2 • Keccak256 Merkle Tree
            </div>
            <button
              type="button"
              onClick={() => handleOpenCreateSessionScreen(activeCourseObj)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>+ Tạo phiên điểm danh</span>
            </button>
          </div>
        </aside>

        {/* KHÔNG GIAN NỘI DUNG CHÍNH BÊN PHẢI (MỞ RỘNG TOÀN MÀN HÌNH & VỪA KHÍT KHUNG) */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto flex flex-col gap-6">
          {/* Thông báo Toast / Banner */}
          {(portalToast || statusBannerMsg) && (
            <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-400/45 text-purple-100 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-[fadeIn_0.2s_ease-out] shrink-0">
              <span>{portalToast || statusBannerMsg}</span>
              <button
                type="button"
                onClick={() => {
                  setPortalToast('');
                  if (setStatusBannerMsg) setStatusBannerMsg('');
                }}
                className="text-purple-300 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 1: TRANG CHỦ (TỔNG QUAN)
             ========================================================================= */}
          {sidebarTab === 'HOME' && (
            <div className="flex-1 flex flex-col justify-between gap-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white m-0 tracking-tight">
                    Xin chào, {lecturerDisplayName} 👋
                  </h1>
                  <p className="text-sm text-slate-300 mt-1 mb-0">
                    Giảng viên Khoa Công nghệ thông tin
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarTab('CLASSES');
                      setClassSubView('LIST');
                      setShowCreateCourseForm(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#151234] hover:bg-[#1E1A46] border border-purple-400/35 text-purple-200 text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm lớp học phần</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateSessionScreen(activeCourseObj)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_25px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>+ Tạo phiên điểm danh</span>
                  </button>
                </div>
              </div>

              {/* 3 Thẻ KPI Tổng quan (5 Lớp đang giảng dạy | 238 Sinh viên | 42 Buổi điểm danh) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                <div
                  onClick={() => {
                    setSidebarTab('CLASSES');
                    setClassSubView('LIST');
                  }}
                  className="p-6 xl:p-7 rounded-2xl bg-gradient-to-br from-[#1B1445]/95 to-[#120E2E]/95 border border-purple-400/35 shadow-[0_12px_32px_rgba(6,4,20,0.6)] flex items-center gap-5 cursor-pointer hover:border-purple-300/70 transition-all"
                >
                  <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC] shrink-0">
                    <Users className="w-7 h-7 xl:w-8 xl:h-8" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold text-white leading-none">
                      {totalCoursesCount}
                    </div>
                    <div className="text-sm xl:text-base text-slate-300 mt-2 font-medium">
                      Lớp đang giảng dạy
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSidebarTab('STUDENTS')}
                  className="p-6 xl:p-7 rounded-2xl bg-gradient-to-br from-[#12224A]/95 to-[#101332]/95 border border-sky-400/35 shadow-[0_12px_32px_rgba(6,4,20,0.6)] flex items-center gap-5 cursor-pointer hover:border-sky-300/70 transition-all"
                >
                  <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
                    <BookOpen className="w-7 h-7 xl:w-8 xl:h-8" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold text-white leading-none">
                      {totalStudentsCount}
                    </div>
                    <div className="text-sm xl:text-base text-slate-300 mt-2 font-medium">
                      Sinh viên
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSidebarTab('REPORTS')}
                  className="p-6 xl:p-7 rounded-2xl bg-gradient-to-br from-[#23154F]/95 to-[#130E30]/95 border border-purple-400/35 shadow-[0_12px_32px_rgba(6,4,20,0.6)] flex items-center gap-5 cursor-pointer hover:border-purple-300/70 transition-all sm:col-span-2 lg:col-span-1"
                >
                  <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC] shrink-0">
                    <Calendar className="w-7 h-7 xl:w-8 xl:h-8" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold text-white leading-none">
                      {totalSessionsCount}
                    </div>
                    <div className="text-sm xl:text-base text-slate-300 mt-2 font-medium">
                      Buổi điểm danh
                    </div>
                  </div>
                </div>
              </div>

              {/* Biểu đồ cột: Tỷ lệ hiện diện (7 ngày gần nhất) đúng theo Panel 1 */}
              <div className="flex-1 p-6 sm:p-8 xl:p-9 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] flex flex-col justify-between gap-6 min-h-[340px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl xl:text-2xl font-extrabold text-white m-0">
                      Tỷ lệ hiện diện (7 ngày gần nhất)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
                      Thống kê xác thực hiện diện phòng học bằng QR Code + WebAuthn + W3C DID
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs sm:text-sm font-bold">
                    Trung bình: 96,8%
                  </span>
                </div>

                <div className="flex-1 flex items-end gap-3 sm:gap-6 min-h-[260px] pt-6 pb-2 px-1 sm:px-3 border-b border-white/10 relative">
                  {/* Trục tung Y-axis */}
                  <div className="hidden sm:flex flex-col justify-between h-full text-xs font-mono text-slate-400 pr-2 select-none">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  {/* 7 Cột tỷ lệ hiện diện */}
                  <div className="flex-1 grid grid-cols-7 gap-2 sm:gap-5 xl:gap-8 items-end h-full">
                    {SEVEN_DAY_BARS.map((bar) => (
                      <div
                        key={bar.date}
                        className="flex flex-col items-center justify-end h-full group"
                      >
                        <span className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-slate-200 mb-2 group-hover:text-[#C084FC] transition-colors">
                          {String(bar.rate).replace('.', ',')}%
                        </span>
                        <div className="w-full max-w-[78px] h-[84%] bg-[#19153A] rounded-t-xl overflow-hidden flex items-end p-0.5 border border-purple-400/20">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-[#5B21B6] via-[#7C3AED] to-[#C084FC] shadow-[0_0_24px_rgba(168,85,247,0.48)] group-hover:brightness-110 transition-all duration-500"
                            style={{ height: `${bar.rate}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-300 mt-3 font-semibold">
                          {bar.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MỤC 2: LỚP HỌC & ĐIỂM DANH (BAO GỒM MÀN HÌNH 2, 3, 4, 5 TRONG ẢNH)
             ========================================================================= */}
          {sidebarTab === 'CLASSES' && (
            <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              {/* Thanh chuyển nhanh giữa 4 màn hình con của Lớp học & Điểm danh */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'LIST', label: 'Lớp học của tôi' },
                    { id: 'CREATE_SESSION', label: 'Tạo phiên điểm danh' },
                    {
                      id: 'LIVE_SESSION',
                      label: `Phiên điểm danh ${isCreated ? '(Đang diễn ra)' : ''}`
                    },
                    { id: 'RESULTS', label: 'Kết quả điểm danh' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setClassSubView(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                        classSubView === tab.id
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white border-purple-300/40 shadow-md'
                          : 'bg-[#13102E] text-slate-300 border-purple-500/20 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateCourseForm((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-[#151234] hover:bg-[#1E1A46] border border-purple-400/35 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  {showCreateCourseForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showCreateCourseForm ? 'Đóng form tạo lớp' : '+ Thêm lớp học mới'}</span>
                </button>
              </div>

              {/* Form khởi tạo lớp học phần mới (Giữ nguyên tính năng tạo lớp & 3 mẫu 1-chạm của hệ thống) */}
              {showCreateCourseForm && (
                <div className="p-6 rounded-3xl bg-[#120E2E] border border-purple-400/40 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-extrabold text-white m-0 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C084FC]" />
                      <span>Khởi tạo lớp học phần mới</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {(coursePresets || []).map((preset, idx) => (
                        <button
                          key={preset.courseCode}
                          type="button"
                          onClick={() => handleQuickFillCoursePreset(idx)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/35 text-purple-200 text-xs font-bold cursor-pointer"
                        >
                          Mẫu: {preset.courseCode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => handleCreateNewCourse(e, false)}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Mã lớp (VD: CNTT101)"
                      value={newCourseForm.courseCode}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, courseCode: e.target.value })
                      }
                      className="p-3 rounded-xl bg-[#09071A] border border-slate-700 text-xs sm:text-sm text-white outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Tên học phần (VD: Lập trình Python)"
                      value={newCourseForm.courseName}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, courseName: e.target.value })
                      }
                      className="p-3 rounded-xl bg-[#09071A] border border-slate-700 text-xs sm:text-sm text-white outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Phòng học (VD: A2-301)"
                      value={newCourseForm.defaultRoom}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, defaultRoom: e.target.value })
                      }
                      className="p-3 rounded-xl bg-[#09071A] border border-slate-700 text-xs sm:text-sm text-white outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="Lịch học (VD: Thứ 2, 07:30 - 10:00)"
                      value={newCourseForm.schedule}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, schedule: e.target.value })
                      }
                      className="p-3 rounded-xl bg-[#09071A] border border-slate-700 text-xs sm:text-sm text-white outline-none focus:border-purple-400"
                    />
                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2.5">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs sm:text-sm font-extrabold border-none cursor-pointer"
                      >
                        Lưu lớp học phần
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------------- MÀN HÌNH 2: QUẢN LÝ LỚP HỌC (LỚP HỌC CỦA TÔI) ---------------- */}
              {classSubView === 'LIST' && (
                <div className="p-6 sm:p-7 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                      Lớp học của tôi
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          placeholder="Tìm kiếm lớp học..."
                          className="pl-10 pr-4 py-2.5 rounded-xl bg-[#181438] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400 w-56 sm:w-64"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCreateSessionScreen(activeCourseObj)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_24px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo phiên điểm danh</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0D0A22]">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                          <th className="p-4 font-bold">Mã lớp</th>
                          <th className="p-4 font-bold">Tên học phần</th>
                          <th className="p-4 font-bold text-center">Sĩ số</th>
                          <th className="p-4 font-bold">Lịch học</th>
                          <th className="p-4 font-bold text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/15">
                        {displayCourses
                          .filter((c) => {
                            const q = courseSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              c.courseCode.toLowerCase().includes(q) ||
                              c.courseName.toLowerCase().includes(q)
                            );
                          })
                          .map((course) => (
                            <tr
                              key={course.courseId || course.id || course.courseCode}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="p-4 font-mono font-extrabold text-white">
                                {course.courseCode}
                              </td>
                              <td className="p-4 font-semibold text-slate-100">
                                {course.courseName}
                                <span className="block text-xs text-slate-400 font-normal mt-0.5">
                                  Phòng {course.defaultRoom || 'A2-301'} • Bán kính R ≤{' '}
                                  {course.defaultRadius || 35}m
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono font-bold text-slate-200">
                                {course.totalStudents || 46}
                              </td>
                              <td className="p-4 text-slate-300">
                                {course.schedule || 'Thứ 2, 07:30 – 10:00'}
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCourseForView(course);
                                      handleCreateNewSession(course);
                                      setClassSubView('LIVE_SESSION');
                                      setLiveStageToolTab('QR');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:opacity-95 text-white text-xs font-extrabold border-none cursor-pointer shadow-md"
                                  >
                                    Điểm danh
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCourseForView(course);
                                      setClassSubView('RESULTS');
                                    }}
                                    className="px-3 py-2 rounded-xl bg-[#181438] hover:bg-[#231D4F] border border-purple-400/30 text-purple-200 text-xs font-bold cursor-pointer"
                                  >
                                    Kết quả
                                  </button>
                                  {courses.some(
                                    (c) =>
                                      (c.courseId || c.id) === (course.courseId || course.id)
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() => setCourseToDelete(course)}
                                      title="Xóa lớp học"
                                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- MÀN HÌNH 3: TẠO PHIÊN ĐIỂM DANH ---------------- */}
              {classSubView === 'CREATE_SESSION' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                    Tạo phiên điểm danh
                  </h2>

                  <form onSubmit={handleConfirmCreateSession} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Khối Trái: Chọn Lớp học & Hình thức xác thực */}
                      <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-5">
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-200 block mb-2">
                            Lớp học
                          </label>
                          <div className="relative">
                            <select
                              value={sessionForm.courseCode}
                              onChange={(e) =>
                                setSessionForm({ ...sessionForm, courseCode: e.target.value })
                              }
                              className="w-full p-3.5 rounded-xl bg-[#0D0A22] border border-purple-400/35 text-sm text-white font-semibold outline-none focus:border-purple-400 appearance-none"
                            >
                              {displayCourses.map((c) => (
                                <option key={c.courseCode} value={c.courseCode}>
                                  {c.courseCode} – {c.courseName}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs sm:text-sm font-bold text-slate-200 block">
                            Hình thức xác thực
                          </label>

                          {[
                            {
                              key: 'useQr',
                              label: 'Mã QR (ứng dụng sinh viên)'
                            },
                            {
                              key: 'useWebAuthn',
                              label: 'WebAuthn (khóa bảo mật)'
                            },
                            {
                              key: 'useGeofence',
                              label: 'Định vị lớp học (Geofencing)'
                            }
                          ].map((method) => (
                            <label
                              key={method.key}
                              className="flex items-center gap-3 p-3 rounded-xl bg-[#0D0A22]/80 border border-purple-500/20 cursor-pointer hover:border-purple-400/50 transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={sessionForm[method.key]}
                                onChange={(e) =>
                                  setSessionForm({
                                    ...sessionForm,
                                    [method.key]: e.target.checked
                                  })
                                }
                                className="w-4 h-4 rounded accent-[#8B5CF6] cursor-pointer"
                              />
                              <span className="text-xs sm:text-sm font-semibold text-white">
                                {method.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Khối Phải: Thời gian phiên & Cấu hình nâng cao */}
                      <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-4">
                        <label className="text-xs sm:text-sm font-bold text-slate-200 block">
                          Thời gian phiên
                        </label>

                        <div className="space-y-1.5">
                          <span className="text-xs text-slate-400 block">Bắt đầu</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              value={sessionForm.startTime}
                              onChange={(e) =>
                                setSessionForm({ ...sessionForm, startTime: e.target.value })
                              }
                              className="p-3 rounded-xl bg-[#0D0A22] border border-purple-400/30 text-xs sm:text-sm font-mono text-white outline-none"
                            />
                            <input
                              type="text"
                              value={sessionForm.startDate}
                              onChange={(e) =>
                                setSessionForm({ ...sessionForm, startDate: e.target.value })
                              }
                              className="p-3 rounded-xl bg-[#0D0A22] border border-purple-400/30 text-xs sm:text-sm font-mono text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs text-slate-400 block">Kết thúc</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              value={sessionForm.endTime}
                              onChange={(e) =>
                                setSessionForm({ ...sessionForm, endTime: e.target.value })
                              }
                              className="p-3 rounded-xl bg-[#0D0A22] border border-purple-400/30 text-xs sm:text-sm font-mono text-white outline-none"
                            />
                            <input
                              type="text"
                              value={sessionForm.endDate}
                              onChange={(e) =>
                                setSessionForm({ ...sessionForm, endDate: e.target.value })
                              }
                              className="p-3 rounded-xl bg-[#0D0A22] border border-purple-400/30 text-xs sm:text-sm font-mono text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">Bán kính Geofence:</span>
                            <span className="font-mono font-bold text-[#C084FC]">
                              R ≤ {sessionConfig.maxRadiusMeters}m
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {[15, 35, 100, 500].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleUpdateLiveRadius(r)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer border-none ${
                                  Number(sessionConfig.maxRadiusMeters) === r
                                    ? 'bg-[#8B5CF6] text-white'
                                    : 'bg-[#0D0A22] text-slate-300'
                                }`}
                              >
                                {r}m
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setClassSubView('LIST')}
                        className="px-6 py-3 rounded-xl bg-[#181438] hover:bg-[#231D4F] border border-purple-400/30 text-slate-200 text-xs sm:text-sm font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_10px_28px_rgba(139,92,246,0.5)] cursor-pointer"
                      >
                        Tạo phiên
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------------- MÀN HÌNH 4: PHIÊN ĐIỂM DANH (ĐANG DIỄN RA) ---------------- */}
              {classSubView === 'LIVE_SESSION' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6">
                  {/* Thanh tiêu đề Phiên điểm danh & Trạng thái Đang diễn ra */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                        Điểm danh – {sessionConfig.courseCode || activeCourseObj.courseCode}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold border ${
                          isSessionOpen || !isCreated
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                            : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{isSessionOpen || !isCreated ? 'Đang diễn ra' : 'Tạm khóa QR'}</span>
                      </span>
                    </div>

                    {/* Cụm công cụ mở rộng: Mã QR / Bản đồ GPS / Giám sát IDS / Phóng to */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'QR', label: 'Mã QR Điểm danh', icon: <QrCode className="w-3.5 h-3.5" /> },
                        {
                          id: 'RADAR',
                          label: `Bản đồ GPS (${attendees.length})`,
                          icon: <MapPin className="w-3.5 h-3.5" />
                        },
                        {
                          id: 'IDS',
                          label: `Giám sát IDS (${securityAlerts.length})`,
                          icon: <ShieldAlert className="w-3.5 h-3.5" />
                        }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLiveStageToolTab(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border inline-flex items-center gap-1.5 transition-all ${
                            liveStageToolTab === t.id
                              ? 'bg-[#8B5CF6] text-white border-purple-300/40'
                              : 'bg-[#171336] text-slate-300 border-purple-500/20 hover:text-white'
                          }`}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setIsProjectorFullscreen(true)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Toàn màn chiếu</span>
                      </button>
                    </div>
                  </div>

                  {liveStageToolTab === 'QR' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Cột Trái (5 Cột): Khung Mã QR Quét Xác Thực Hiện Diện */}
                      <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161236] border border-purple-400/30 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="text-sm font-bold text-slate-200">
                          Quét mã để xác thực hiện diện
                        </div>

                        <div
                          onClick={() => setIsProjectorFullscreen(true)}
                          title="Nhấp để phóng to toàn màn chiếu"
                          className="p-4 sm:p-5 bg-white rounded-3xl shadow-[0_0_45px_rgba(168,85,247,0.48)] border-4 border-purple-400 cursor-pointer hover:scale-[1.02] transition-transform max-w-full"
                        >
                          <QRCodeCanvas
                            value={
                              qrPayloadString ||
                              `UTH_ID:${sessionId || 'SES_CNTT101'}:${currentNonce}`
                            }
                            size={256}
                            level="M"
                            includeMargin={false}
                            style={{ width: '100%', height: 'auto', maxWidth: '256px' }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-mono font-bold">
                            ⏱ {timerProgress}s / {rotateInterval}s
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#0D0A22] border border-slate-700 font-mono text-sky-300 font-bold">
                            {currentNonce}
                          </span>
                          <button
                            type="button"
                            onClick={handleInstantRotateNonce}
                            className="px-2.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Đổi QR</span>
                          </button>
                        </div>
                      </div>

                      {/* Cột Phải (7 Cột): Thông tin phiên & Tiến độ Đã xác thực (Theo đúng Panel 4) */}
                      <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161236] border border-purple-400/30 flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2.5 border-b border-white/10 text-sm">
                            <span className="text-slate-400">Lớp học</span>
                            <strong className="text-white font-extrabold">
                              {sessionConfig.courseCode || activeCourseObj.courseCode} –{' '}
                              {sessionConfig.courseName || activeCourseObj.courseName}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between py-2.5 border-b border-white/10 text-sm">
                            <span className="text-slate-400">Thời gian</span>
                            <strong className="text-emerald-400 font-bold">
                              {sessionForm.startTime} – {sessionForm.endTime} (còn 12:34)
                            </strong>
                          </div>

                          <div className="flex items-center justify-between py-2.5 border-b border-white/10 text-sm">
                            <span className="text-slate-400">Hình thức</span>
                            <strong className="text-white font-bold">
                              QR Code + WebAuthn
                            </strong>
                          </div>

                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Đã xác thực</span>
                              <strong className="text-white font-extrabold">
                                {liveAuthenticatedCount} / {classTotalSize} (
                                {String(liveAuthenticatedPct).replace('.', ',')}%)
                              </strong>
                            </div>
                            <div className="w-full h-3 rounded-full bg-[#0B0920] overflow-hidden border border-purple-500/25">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                                style={{ width: `${liveAuthenticatedPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Thanh điều khiển nhanh các tính năng bảo mật nâng cao của Giảng viên */}
                          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setManualCheckInContext(null);
                                setShowManualCheckInModal(true);
                              }}
                              className="p-2.5 rounded-xl bg-[#0D0A22] hover:bg-[#1B1642] border border-purple-400/30 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Thủ công</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTriggerSpotCheck('ALL')}
                              disabled={spotCheckState?.active}
                              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>
                                {spotCheckState?.active
                                  ? `FaceID ${spotCheckState.countdown}s`
                                  : 'Hậu kiểm 60s'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSwitchLiveNetworkMode(
                                  sessionConfig.networkMode === 'CAMPUS_WIFI'
                                    ? 'CELLULAR_ANY'
                                    : 'CAMPUS_WIFI'
                                )
                              }
                              className="p-2.5 rounded-xl bg-[#0D0A22] hover:bg-[#1B1642] border border-sky-400/30 text-sky-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              {sessionConfig.networkMode === 'CAMPUS_WIFI' ? (
                                <Wifi className="w-3.5 h-3.5" />
                              ) : (
                                <Radio className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {sessionConfig.networkMode === 'CAMPUS_WIFI'
                                  ? 'Wi-Fi Trường'
                                  : 'Mạng 4G/5G'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={handleToggleSessionState}
                              className="p-2.5 rounded-xl bg-[#0D0A22] hover:bg-[#1B1642] border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              {isSessionOpen ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                              <span>{isSessionOpen ? 'Khóa QR' : 'Mở QR'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 2 Nút chính dưới cùng theo đúng Panel 4: Kết thúc phiên (Đỏ) & Xem danh sách (Tím) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCreated) handleFinalizeSession();
                              setClassSubView('RESULTS');
                            }}
                            className="py-3.5 px-5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-extrabold cursor-pointer inline-flex items-center justify-center gap-2 transition-all"
                          >
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Kết thúc phiên</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setClassSubView('RESULTS')}
                            className="py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_10px_25px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center justify-center gap-2 transition-all"
                          >
                            <Users className="w-4 h-4" />
                            <span>Xem danh sách</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chế độ Bản đồ Định vị GPS trực tiếp trong Phiên */}
                  {liveStageToolTab === 'RADAR' && (
                    <div className="space-y-4">
                      <GoogleMapsLiveView
                        sessionConfig={sessionConfig}
                        attendees={attendees}
                        focusedStudentId={null}
                        onSelectStudent={() => {}}
                        onSyncLaptopGps={handleSyncLaptopGpsCenter}
                      />
                    </div>
                  )}

                  {/* Chế độ Giám sát Gian lận IDS trực tiếp trong Phiên */}
                  {liveStageToolTab === 'IDS' && (
                    <div className="p-5 rounded-2xl bg-[#161236] border border-rose-500/35 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold text-rose-300 m-0 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Giám sát thiết bị &amp; Chống điểm danh hộ (IDS Telemetry)</span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={simulatingAttack}
                            onClick={() => handleSimulateAttack('REPLAY_ATTACK')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer"
                          >
                            + Test QR Cũ
                          </button>
                          <button
                            type="button"
                            disabled={simulatingAttack}
                            onClick={() => handleSimulateAttack('PROXY_ATTENDANCE')}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-200 text-xs font-bold cursor-pointer"
                          >
                            + Test 1 Máy 2 SV
                          </button>
                          <button
                            type="button"
                            disabled={simulatingAttack}
                            onClick={() => handleSimulateAttack('GEOFENCE_BREACH')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-bold cursor-pointer"
                          >
                            + Test Fake GPS
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(securityAlerts || []).slice(0, 6).map((al) => (
                          <div
                            key={al.id}
                            className="p-3 rounded-xl bg-[#0D0A22] border border-rose-500/30 flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-mono text-slate-400 mr-2">[{al.time}]</span>
                              <strong className="text-rose-300 mr-2">
                                {al.vectorLabel || al.type}:
                              </strong>
                              <span className="text-slate-200">{al.detail}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">
                              ĐÃ CHẶN (403)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- MÀN HÌNH 5: KẾT QUẢ ĐIỂM DANH ---------------- */}
              {classSubView === 'RESULTS' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6">
                  <div>
                    <button
                      type="button"
                      onClick={() => setClassSubView('LIST')}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0 mb-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                          Kết quả điểm danh
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-0 font-semibold">
                          {activeCourseObj.courseCode} – {sessionForm.startDate} (
                          {sessionForm.startTime} – {sessionForm.endTime})
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setManualCheckInContext(null);
                            setShowManualCheckInModal(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#181438] hover:bg-[#231D4F] border border-purple-400/35 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Điểm danh bổ sung</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            isCreated
                              ? handleExportCSV()
                              : handleExportSemesterCSV(activeCourseObj)
                          }
                          className="px-4 py-2.5 rounded-xl bg-[#181438] hover:bg-[#231D4F] border border-purple-400/35 text-white text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-[#C084FC]" />
                          <span>Xuất Excel</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Thẻ Thống kê Kết quả Điểm danh (46 Sĩ số | 45 Có mặt | 1 Vắng | 97,8% Tỷ lệ hiện diện) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#161236] border border-emerald-500/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white leading-none">
                          {classTotalSize}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">Sĩ số</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#161236] border border-purple-400/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC] shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white leading-none">
                          {attendees.length > 0 ? attendees.length : 45}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">Có mặt</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#161236] border border-rose-500/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white leading-none">
                          {attendees.length > 0
                            ? Math.max(0, classTotalSize - attendees.length)
                            : 1}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">Vắng</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#161236] border border-purple-400/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC] shrink-0 font-mono text-xs font-extrabold">
                        %
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white leading-none">
                          97,8%
                        </div>
                        <div className="text-xs text-slate-300 mt-1">Tỷ lệ hiện diện</div>
                      </div>
                    </div>
                  </div>

                  {/* Bảng chi tiết Kết quả điểm danh theo đúng Panel 5 */}
                  <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0D0A22]">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                          <th className="p-4 font-bold">STT</th>
                          <th className="p-4 font-bold">MSSV</th>
                          <th className="p-4 font-bold">Họ và tên</th>
                          <th className="p-4 font-bold text-center">Trạng thái</th>
                          <th className="p-4 font-bold text-right">Thời gian xác thực</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/15">
                        {combinedResultsRoster.map((row) => (
                          <tr key={row.studentId} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-slate-300">{row.stt}</td>
                            <td className="p-4 font-mono font-bold text-white">{row.studentId}</td>
                            <td className="p-4 font-semibold text-white">{row.name}</td>
                            <td className="p-4 text-center">
                              {row.isPresent ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Có mặt</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Vắng</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right font-mono text-slate-300">
                              {row.checkInTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 6: DANH SÁCH SINH VIÊN
             ========================================================================= */}
          {sidebarTab === 'STUDENTS' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                  Danh sách sinh viên – {activeCourseObj.courseCode}
                </h2>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={activeCourseObj.courseCode}
                    onChange={(e) => {
                      const found = displayCourses.find((c) => c.courseCode === e.target.value);
                      if (found) setSelectedCourseForView(found);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#181438] border border-purple-400/30 text-xs sm:text-sm text-white font-semibold outline-none"
                  >
                    {displayCourses.map((c) => (
                      <option key={c.courseCode} value={c.courseCode}>
                        Lớp {c.courseCode} – {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm theo MSSV, họ tên..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181438] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                  />
                </div>

                <select
                  value={studentDidFilter}
                  onChange={(e) => setStudentDidFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[#181438] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="VERIFIED">Đã xác thực DID</option>
                  <option value="UNVERIFIED">Chưa xác thực</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0D0A22]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                      <th className="p-4 font-bold">MSSV</th>
                      <th className="p-4 font-bold">Họ và tên</th>
                      <th className="p-4 font-bold text-center">Trạng thái DID</th>
                      <th className="p-4 font-bold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/15">
                    {studentRecords
                      .filter((st) => {
                        const q = studentSearch.trim().toLowerCase();
                        const matchQ =
                          !q ||
                          st.studentId.toLowerCase().includes(q) ||
                          st.name.toLowerCase().includes(q);
                        if (!matchQ) return false;
                        if (studentDidFilter === 'VERIFIED') return st.didStatus === 'VERIFIED';
                        if (studentDidFilter === 'UNVERIFIED') return st.didStatus !== 'VERIFIED';
                        return true;
                      })
                      .map((st) => (
                        <tr key={st.studentId} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{st.studentId}</td>
                          <td className="p-4 font-semibold text-white">
                            {st.name}
                            <span className="block text-xs text-slate-400 font-normal mt-0.5">
                              {st.major}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {st.didStatus === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã xác thực</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Chưa xác thực</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentDetail(st)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#181438] hover:bg-[#241E52] border border-purple-400/30 text-slate-200 hover:text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#C084FC]" />
                              <span>Xem</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 7: QUẢN LÝ DANH TÍNH SỐ (DID)
             ========================================================================= */}
          {sidebarTab === 'DID' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                  Danh tính số sinh viên
                </h2>

                <button
                  type="button"
                  onClick={() => setShowIssueDidModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_24px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cấp / Cập nhật DID</span>
                </button>
              </div>

              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={didSearch}
                  onChange={(e) => setDidSearch(e.target.value)}
                  placeholder="Tìm theo MSSV, họ tên..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181438] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0D0A22]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                      <th className="p-4 font-bold">MSSV</th>
                      <th className="p-4 font-bold">Họ và tên</th>
                      <th className="p-4 font-bold">DID</th>
                      <th className="p-4 font-bold text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/15">
                    {studentRecords
                      .filter((st) => {
                        const q = didSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          st.studentId.toLowerCase().includes(q) ||
                          st.name.toLowerCase().includes(q) ||
                          (st.did || '').toLowerCase().includes(q)
                        );
                      })
                      .map((st) => (
                        <tr key={st.studentId} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{st.studentId}</td>
                          <td className="p-4 font-semibold text-white">{st.name}</td>
                          <td className="p-4 font-mono text-slate-300">
                            {st.did ? st.did : '–'}
                          </td>
                          <td className="p-4 text-right">
                            {st.didStatus === 'VERIFIED' && st.did ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Hợp lệ</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewDidForm({
                                    studentId: st.studentId,
                                    name: st.name,
                                    major: st.major
                                  });
                                  setShowIssueDidModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-xs font-bold cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Chưa cấp</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 8: QUẢN LÝ CHỨNG CHỈ SỐ (VERIFIABLE CREDENTIAL)
             ========================================================================= */}
          {sidebarTab === 'VC' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                  Chứng chỉ số (Verifiable Credential)
                </h2>

                <button
                  type="button"
                  onClick={() => setShowIssueVcModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_24px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cấp chứng chỉ</span>
                </button>
              </div>

              {/* 2 Tab: Đã cấp (238) | Chờ xử lý (3) */}
              <div className="flex items-center gap-6 border-b border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setVcSubTab('ISSUED')}
                  className={`pb-3 text-xs sm:text-sm font-extrabold bg-transparent border-none cursor-pointer relative ${
                    vcSubTab === 'ISSUED' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Đã cấp (238)</span>
                  {vcSubTab === 'ISSUED' && (
                    <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setVcSubTab('PENDING')}
                  className={`pb-3 text-xs sm:text-sm font-extrabold bg-transparent border-none cursor-pointer relative ${
                    vcSubTab === 'PENDING' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>
                    Chờ xử lý ({studentRecords.filter((s) => s.vcStatus === 'PENDING').length})
                  </span>
                  {vcSubTab === 'PENDING' && (
                    <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                  )}
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0D0A22]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                      <th className="p-4 font-bold">MSSV</th>
                      <th className="p-4 font-bold">Họ và tên</th>
                      <th className="p-4 font-bold">Loại chứng chỉ</th>
                      <th className="p-4 font-bold">Ngày cấp</th>
                      <th className="p-4 font-bold text-right">Tải về</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/15">
                    {studentRecords
                      .filter((st) =>
                        vcSubTab === 'ISSUED' ? true : st.vcStatus === 'PENDING'
                      )
                      .map((st) => (
                        <tr key={st.studentId} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{st.studentId}</td>
                          <td className="p-4 font-semibold text-white">{st.name}</td>
                          <td className="p-4 text-slate-200">{st.vcType}</td>
                          <td className="p-4 font-mono text-slate-300">{st.vcDate}</td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDownloadStudentVc(st)}
                              title="Tải xuống chứng chỉ số W3C VC (.json)"
                              className="p-2 rounded-xl bg-[#181438] hover:bg-[#251E54] border border-purple-400/30 text-slate-200 hover:text-white cursor-pointer inline-flex items-center justify-center"
                            >
                              <Download className="w-4 h-4 text-[#C084FC]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 9: BÁO CÁO & THỐNG KÊ
             ========================================================================= */}
          {sidebarTab === 'REPORTS' && (
            <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                  Báo cáo &amp; Thống kê
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#161236] border border-purple-400/30 text-xs sm:text-sm text-white font-semibold outline-none"
                  >
                    <option value="HK1_2026_2027">Học kỳ 1 (2026 – 2027)</option>
                    <option value="HK2_2025_2026">Học kỳ 2 (2025 – 2026)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleExportSemesterCSV(activeCourseObj)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold border-none shadow-[0_8px_24px_rgba(139,92,246,0.45)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>
              </div>

              {/* 3 Thẻ KPI: 42 Buổi điểm danh | 96,8% Tỷ lệ hiện diện | 3 Sinh viên vắng nhiều */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#13102E] border border-purple-400/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC] shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                      {totalSessionsCount}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-1">Buổi điểm danh</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#102329] border border-emerald-400/35 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                      96,8%
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-200 mt-1">Tỷ lệ hiện diện</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#261224] border border-rose-400/35 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                      3
                    </div>
                    <div className="text-xs sm:text-sm text-rose-200 mt-1">
                      Sinh viên vắng nhiều
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Biểu đồ: Tỷ lệ hiện diện theo thời gian (Line Chart) & Tình trạng hiện diện (Donut Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Biểu đồ đường T1..T8 */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 space-y-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-white m-0">
                    Tỷ lệ hiện diện theo thời gian
                  </h3>

                  <div className="pt-2">
                    <svg className="w-full h-56 overflow-visible" viewBox="0 0 520 200">
                      <defs>
                        <linearGradient id="lineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Lưới ngang */}
                      {[
                        { y: 20, label: '100%' },
                        { y: 60, label: '95%' },
                        { y: 100, label: '90%' },
                        { y: 140, label: '85%' },
                        { y: 180, label: '80%' }
                      ].map((row) => (
                        <g key={row.label}>
                          <text
                            x="0"
                            y={row.y + 4}
                            fill="#94A3B8"
                            fontSize="11"
                            fontFamily="monospace"
                          >
                            {row.label}
                          </text>
                          <line
                            x1="42"
                            y1={row.y}
                            x2="500"
                            y2={row.y}
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeDasharray="4 4"
                          />
                        </g>
                      ))}

                      {/* Vùng tô màu dưới đường biểu đồ */}
                      <path
                        d="M 55 66 L 118 56 L 181 60 L 244 48 L 307 51 L 370 40 L 433 45 L 496 42 L 496 180 L 55 180 Z"
                        fill="url(#lineAreaGrad)"
                      />

                      {/* Đường gấp khúc chính */}
                      <path
                        d="M 55 66 L 118 56 L 181 60 L 244 48 L 307 51 L 370 40 L 433 45 L 496 42"
                        fill="none"
                        stroke="#C084FC"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />

                      {/* Các điểm nút T1..T8 */}
                      {WEEKLY_LINE_POINTS.map((pt, i) => {
                        const x = 55 + i * 63;
                        const y = 180 - ((pt.rate - 80) / 20) * 160;
                        return (
                          <g key={pt.week}>
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#0B0920"
                              stroke="#E9D5FF"
                              strokeWidth="3"
                            />
                            <text
                              x={x}
                              y="198"
                              textAnchor="middle"
                              fill="#CBD5E1"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              {pt.week}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Biểu đồ tròn Donut: Tình trạng hiện diện */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 flex flex-col justify-between space-y-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-white m-0">
                    Tình trạng hiện diện
                  </h3>

                  <div className="flex items-center justify-center gap-6 my-auto py-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="transparent"
                          stroke="#F43F5E"
                          strokeWidth="16"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="transparent"
                          stroke="url(#donutPurpleGrad)"
                          strokeWidth="16"
                          strokeDasharray={2 * Math.PI * 44}
                          strokeDashoffset={2 * Math.PI * 44 * (1 - 0.968)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="donutPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C084FC" />
                            <stop offset="100%" stopColor="#7C3AED" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-white">96,8%</span>
                        <span className="text-[10px] text-slate-400">Hiện diện</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-sm bg-[#A855F7]" />
                        <span className="text-slate-200 font-semibold">
                          Có mặt: <strong className="text-white">96,8%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-sm bg-rose-500" />
                        <span className="text-slate-200 font-semibold">
                          Vắng: <strong className="text-white">3,2%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MỤC 7: CÀI ĐẶT HỆ THỐNG GIẢNG VIÊN (GEOFENCE, NONCE, MẠNG, ÂM BÁO)
             ========================================================================= */}
          {sidebarTab === 'SETTINGS' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#110E2B]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                Cài đặt xác thực &amp; Phòng học thông minh
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-3">
                  <div className="text-sm font-bold text-white">
                    Chu kỳ xoay mã QR Nonce chống chụp màn hình
                  </div>
                  <div className="flex items-center gap-2">
                    {[15, 35, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleChangeRotateInterval(sec)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer border-none ${
                          rotateInterval === sec
                            ? 'bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white'
                            : 'bg-[#0D0A22] text-slate-300'
                        }`}
                      >
                        {sec} giây
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-3">
                  <div className="text-sm font-bold text-white">
                    Âm báo &amp; Chế độ ẩn danh màn chiếu hội trường
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled((p) => !p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                        soundEnabled
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                          : 'bg-[#0D0A22] border-slate-700 text-slate-300'
                      }`}
                    >
                      {soundEnabled ? '🔊 Âm báo: Đang bật' : '🔇 Âm báo: Đang tắt'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStageSafeMode((p) => !p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                        stageSafeMode
                          ? 'bg-purple-500/20 border-purple-400/40 text-purple-200'
                          : 'bg-[#0D0A22] border-slate-700 text-slate-300'
                      }`}
                    >
                      {stageSafeMode ? '🛡 Ẩn danh MSSV: Bật' : 'Ẩn danh MSSV: Tắt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== MODAL XEM CHI TIẾT SINH VIÊN (MÀN HÌNH 6) ==================== */}
      {selectedStudentDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudentDetail(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#130F30] border border-purple-400/45 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white m-0">
                  {selectedStudentDetail.name}
                </h3>
                <p className="text-xs font-mono text-purple-300 m-0 mt-0.5">
                  MSSV: {selectedStudentDetail.studentId} • {selectedStudentDetail.major}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-[#0B0920] border border-purple-500/20 flex justify-between">
                <span className="text-slate-400">Email học vụ:</span>
                <strong className="text-white">{selectedStudentDetail.email}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0920] border border-purple-500/20 flex justify-between">
                <span className="text-slate-400">Định danh W3C DID:</span>
                <strong className="text-purple-300 font-mono">
                  {selectedStudentDetail.did || 'Chưa cấp'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0920] border border-purple-500/20 flex justify-between">
                <span className="text-slate-400">Chứng chỉ số (VC):</span>
                <strong className="text-emerald-300">{selectedStudentDetail.vcType}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0920] border border-purple-500/20 flex justify-between">
                <span className="text-slate-400">Tỷ lệ hiện diện:</span>
                <strong className="text-white">{selectedStudentDetail.attendanceRate}%</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold border-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CẤP / CẬP NHẬT DID (MÀN HÌNH 7) ==================== */}
      {showIssueDidModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueDidModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleIssueOrUpdateDid}
            className="w-full max-w-md rounded-3xl bg-[#130F30] border border-purple-400/45 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white m-0">
                Cấp / Cập nhật Định danh số (W3C DID)
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueDidModal(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mã số sinh viên (MSSV)
                </label>
                <input
                  type="text"
                  required
                  value={newDidForm.studentId}
                  onChange={(e) => setNewDidForm({ ...newDidForm, studentId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Họ và tên sinh viên
                </label>
                <input
                  type="text"
                  required
                  value={newDidForm.name}
                  onChange={(e) => setNewDidForm({ ...newDidForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueDidModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs font-extrabold border-none cursor-pointer"
              >
                Ký &amp; Cấp DID
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CẤP CHỨNG CHỈ SỐ VC (MÀN HÌNH 8) ==================== */}
      {showIssueVcModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueVcModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleIssueVc}
            className="w-full max-w-md rounded-3xl bg-[#130F30] border border-purple-400/45 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white m-0">
                Cấp Chứng chỉ số (Verifiable Credential)
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueVcModal(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chọn sinh viên
                </label>
                <select
                  value={newVcForm.studentId}
                  onChange={(e) => setNewVcForm({ ...newVcForm, studentId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
                >
                  {studentRecords.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} – {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Loại chứng chỉ W3C VC
                </label>
                <select
                  value={newVcForm.vcType}
                  onChange={(e) => setNewVcForm({ ...newVcForm, vcType: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
                >
                  <option value="Chứng chỉ hoàn thành">Chứng chỉ hoàn thành</option>
                  <option value="Chứng chỉ hiện diện">Chứng chỉ hiện diện</option>
                  <option value="Chứng nhận chuyên cần xuất sắc">
                    Chứng nhận chuyên cần xuất sắc
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueVcModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs font-extrabold border-none cursor-pointer"
              >
                Phát hành VC
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
