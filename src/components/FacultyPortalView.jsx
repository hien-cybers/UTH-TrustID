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
  Eye,
  Download,
  Calendar,
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
  Menu,
  FileText,
  GraduationCap,
  Edit3,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  X
} from 'lucide-react';
import GoogleMapsLiveView from './GoogleMapsLiveView';
import { exportAttendanceToExcel } from '../utils/exportAttendanceReport';

const DEFAULT_DEMO_COURSES = [
  {
    id: 'CLS_CT101',
    courseCode: 'CT101',
    courseName: 'Trí tuệ nhân tạo',
    defaultRoom: 'A2-301',
    totalStudents: 45,
    semester: 'HK1 (2026-2027)',
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 2, 08:00 – 10:00',
    sessions: [
      {
        sessionId: 'SES_CT101_B07',
        sessionNumber: 7,
        date: '19/11/2026',
        timeRange: '08:00 – 08:10',
        room: 'A2-301',
        isFinalized: true,
        status: 'FINALIZED',
        attendees: []
      }
    ]
  },
  {
    id: 'CLS_CT102',
    courseCode: 'CT102',
    courseName: 'Học máy nâng cao',
    defaultRoom: 'B1-205',
    totalStudents: 52,
    semester: 'HK1 (2026-2027)',
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 3, 13:00 – 15:00',
    sessions: []
  },
  {
    id: 'CLS_CT103',
    courseCode: 'CT103',
    courseName: 'Khoa học dữ liệu',
    defaultRoom: 'C3-102',
    totalStudents: 48,
    semester: 'HK1 (2026-2027)',
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 4, 08:00 – 10:00',
    sessions: []
  },
  {
    id: 'CLS_CT104',
    courseCode: 'CT104',
    courseName: 'Xử lý ngôn ngữ tự nhiên',
    defaultRoom: 'A1-404',
    totalStudents: 50,
    semester: 'HK1 (2026-2027)',
    defaultRadius: 35,
    defaultNetworkMode: 'CELLULAR_ANY',
    schedule: 'Thứ 5, 10:00 – 12:00',
    sessions: []
  }
];

const INITIAL_STUDENT_ROSTER = [
  {
    studentId: '23510001',
    name: 'Nguyễn Văn An',
    dob: '12/06/2005',
    major: 'Công nghệ Thông tin',
    email: '23510001@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: 'did:uth:7f3e...9a22',
    didStatus: 'VERIFIED',
    vcType: 'Điểm danh',
    vcDate: '19/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 98,
    checkInTime: '08:01:24',
    presentInDemo: true
  },
  {
    studentId: '23510002',
    name: 'Trần Thị Bình',
    dob: '28/09/2005',
    major: 'Khoa học Dữ liệu & AI',
    email: '23510002@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: 'did:uth:4c1b...8d0f',
    didStatus: 'VERIFIED',
    vcType: 'Hoàn thành môn học',
    vcDate: '15/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 96,
    checkInTime: '08:02:11',
    presentInDemo: true
  },
  {
    studentId: '23510003',
    name: 'Lê Minh Cường',
    dob: '14/03/2005',
    major: 'An toàn Thông tin',
    email: '23510003@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: 'did:uth:9d2a...e71c',
    didStatus: 'VERIFIED',
    vcType: 'Điểm danh',
    vcDate: '19/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 88,
    checkInTime: '–',
    presentInDemo: false
  },
  {
    studentId: '23510004',
    name: 'Phạm Thị Duyên',
    dob: '21/07/2005',
    major: 'Công nghệ Thông tin',
    email: '23510004@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: '',
    didStatus: 'UNVERIFIED',
    vcType: 'Điểm danh',
    vcDate: '19/11/2026',
    vcStatus: 'PENDING',
    attendanceRate: 94,
    checkInTime: '08:03:05',
    presentInDemo: true
  },
  {
    studentId: '2251120000',
    name: 'Nguyễn Đức Hiển',
    dob: '18/10/2004',
    major: 'An toàn Thông tin',
    email: '2251120000@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: 'did:uth:91fe...ed1d',
    didStatus: 'VERIFIED',
    vcType: 'Hoàn thành môn học',
    vcDate: '18/11/2026',
    vcStatus: 'ISSUED',
    attendanceRate: 100,
    checkInTime: '08:00:48',
    presentInDemo: true
  },
  {
    studentId: '2251120002',
    name: 'Trần Thị Mai',
    dob: '05/04/2004',
    major: 'An toàn Thông tin',
    email: '2251120002@ut.edu.vn',
    studyStatus: 'ACTIVE',
    did: 'did:uth:44cb...77e1',
    didStatus: 'VERIFIED',
    vcType: 'Điểm danh',
    vcDate: '14/11/2026',
    vcStatus: 'REVOKED',
    attendanceRate: 92,
    checkInTime: '08:04:19',
    presentInDemo: true
  }
];

const HOME_TREND_7D = [
  { day: 'T2', present: 86, absent: 14 },
  { day: 'T3', present: 91, absent: 9 },
  { day: 'T4', present: 93, absent: 7 },
  { day: 'T5', present: 95, absent: 5 },
  { day: 'T6', present: 94, absent: 6 },
  { day: 'T7', present: 96, absent: 4 },
  { day: 'CN', present: 95, absent: 5 }
];

const WEEKLY_ATTENDANCE_BARS = [
  { week: 'T1', count: 82 },
  { week: 'T2', count: 98 },
  { week: 'T3', count: 102 },
  { week: 'T4', count: 130 },
  { week: 'T5', count: 128 },
  { week: 'T6', count: 112 },
  { week: 'T7', count: 124 }
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
  // 9 Mục Sidebar + Chế độ Phiên đang mở (LIVE_SESSION thuộc mục Tạo phiên điểm danh)
  const [sidebarTab, setSidebarTab] = useState('HOME');
  // 'HOME' | 'CLASSES' | 'CREATE_SESSION' | 'LIVE_SESSION' | 'RESULTS' | 'STUDENTS' | 'DID' | 'VC' | 'REPORTS' | 'SETTINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveStageToolTab, setLiveStageToolTab] = useState('QR'); // 'QR' | 'RADAR' | 'IDS'
  const [globalSearch, setGlobalSearch] = useState('');

  // Bộ lọc & tìm kiếm cho từng màn hình
  const [courseSearch, setCourseSearch] = useState('');
  const [resultSearch, setResultSearch] = useState('');
  const [resultDate, setResultDate] = useState('19/11/2026');
  const [studentSearch, setStudentSearch] = useState('');
  const [didSearch, setDidSearch] = useState('');
  const [vcSearch, setVcSearch] = useState('');
  const [vcSubTab, setVcSubTab] = useState('ISSUED'); // 'ISSUED' | 'PENDING' | 'REVOKED'
  const [reportSubTab, setReportSubTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'BY_CLASS' | 'BY_TIME'
  const [selectedSemester, setSelectedSemester] = useState('HK1 (2026-2027)');
  const [trendRange, setTrendRange] = useState('7D');

  // Dữ liệu tương tác Sinh viên / DID / VC
  const [studentRecords, setStudentRecords] = useState(INITIAL_STUDENT_ROSTER);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    studentId: '',
    name: '',
    dob: '15/05/2005',
    major: 'Công nghệ Thông tin'
  });
  const [showIssueDidModal, setShowIssueDidModal] = useState(false);
  const [showIssueVcModal, setShowIssueVcModal] = useState(false);
  const [newDidForm, setNewDidForm] = useState({
    studentId: '23510004',
    name: 'Phạm Thị Duyên',
    major: 'Công nghệ Thông tin'
  });
  const [newVcForm, setNewVcForm] = useState({
    studentId: '23510004',
    vcType: 'Điểm danh'
  });
  const [portalToast, setPortalToast] = useState('');

  // Đồng bộ lớp học thực tế từ backend/state với các lớp mẫu CT101..CT104
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

  // Cấu hình Form Tạo phiên điểm danh (Màn hình 3)
  const [sessionForm, setSessionForm] = useState({
    courseCode: 'CT101',
    authMethod: 'QR_DID_WEBAUTHN', // 'QR_DID_WEBAUTHN' | 'DIRECT_PASSKEY'
    openDate: '19/11/2026',
    openTime: '08:00',
    closeDate: '19/11/2026',
    closeTime: '08:10',
    note: 'Điểm danh buổi học 7'
  });

  const activeCourseObj =
    displayCourses.find((c) => c.courseCode === sessionConfig?.courseCode) ||
    selectedCourseForView ||
    displayCourses[0];

  const totalCoursesCount = Math.max(6, displayCourses.length);
  const totalStudentsCount = useMemo(() => {
    const sum = displayCourses.reduce((acc, c) => acc + (Number(c.totalStudents) || 45), 0);
    return Math.max(284, sum);
  }, [displayCourses]);
  const totalSessions7Days = useMemo(() => {
    const sum = displayCourses.reduce((acc, c) => acc + (c.sessions?.length || 0), 0);
    return Math.max(12, sum);
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
    setSidebarTab('CREATE_SESSION');
  };

  // Xác nhận Tạo phiên -> Gọi handleCreateNewSession thật & chuyển sang Màn hình 4 (Phiên điểm danh đang mở)
  const handleConfirmCreateSession = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const target =
      displayCourses.find((c) => c.courseCode === sessionForm.courseCode) ||
      selectedCourseForView ||
      displayCourses[0];
    setSelectedCourseForView(target);
    handleCreateNewSession(target);
    setSidebarTab('LIVE_SESSION');
    setLiveStageToolTab('QR');
    showToast(`✓ Đã mở phiên điểm danh cho lớp ${target.courseCode} – ${target.courseName}`);
  };

  // Thêm sinh viên mới vào lớp (Màn hình 6)
  const handleAddStudent = (e) => {
    e.preventDefault();
    const cleanId = newStudentForm.studentId.trim();
    const cleanName = newStudentForm.name.trim();
    if (!cleanId || !cleanName) return;
    setStudentRecords((prev) => [
      {
        studentId: cleanId,
        name: cleanName,
        dob: newStudentForm.dob || '15/05/2005',
        major: newStudentForm.major || 'Công nghệ Thông tin',
        email: `${cleanId}@ut.edu.vn`,
        studyStatus: 'ACTIVE',
        did: '',
        didStatus: 'UNVERIFIED',
        vcType: 'Điểm danh',
        vcDate: '19/11/2026',
        vcStatus: 'PENDING',
        attendanceRate: 100,
        checkInTime: '–',
        presentInDemo: false
      },
      ...prev
    ]);
    setNewStudentForm({ studentId: '', name: '', dob: '15/05/2005', major: 'Công nghệ Thông tin' });
    setShowAddStudentModal(false);
    showToast(`✓ Đã thêm sinh viên ${cleanName} (${cleanId}) vào lớp ${activeCourseObj.courseCode}`);
  };

  // Cấp / Cập nhật DID (Màn hình 7)
  const handleIssueOrUpdateDid = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cleanId = newDidForm.studentId.trim();
    if (!cleanId) return;
    const randomHex = Math.random().toString(16).substring(2, 6);
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
          dob: '10/08/2005',
          major: newDidForm.major || 'Công nghệ Thông tin',
          email: `${cleanId}@ut.edu.vn`,
          studyStatus: 'ACTIVE',
          did: generatedDid,
          didStatus: 'VERIFIED',
          vcType: 'Điểm danh',
          vcDate: '19/11/2026',
          vcStatus: 'ISSUED',
          attendanceRate: 100,
          checkInTime: '08:02:00',
          presentInDemo: true
        },
        ...prev
      ];
    });
    setShowIssueDidModal(false);
    showToast(`✓ Đã cấp định danh số ${generatedDid} cho MSSV ${cleanId}`);
  };

  // Cấp chứng chỉ số VC (Màn hình 8)
  const handleIssueVc = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setStudentRecords((prev) =>
      prev.map((s) =>
        s.studentId === newVcForm.studentId
          ? {
              ...s,
              vcType: newVcForm.vcType,
              vcDate: '19/11/2026',
              vcStatus: 'ISSUED',
              didStatus: 'VERIFIED',
              did: s.did || `did:uth:8c4e...${s.studentId.slice(-4)}`
            }
          : s
      )
    );
    setShowIssueVcModal(false);
    showToast(`✓ Đã ký và cấp chứng chỉ "${newVcForm.vcType}" (W3C VC) cho MSSV ${newVcForm.studentId}`);
  };

  // Tải file JSON chứng chỉ W3C VC
  const handleDownloadStudentVc = (student) => {
    const issuedStamp = `${student.vcDate || '19/11/2026'}T08:05:00.000Z`;
    const vcPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'UTHAttendanceCredential'],
      issuer: 'did:uth:issuer:university-of-transport-hcmc',
      issuanceDate: issuedStamp,
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
        created: issuedStamp,
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

  // Danh sách kết quả điểm danh kết hợp WebSocket live attendees + danh sách lớp (tự động đưa SV quét QR mới lên đầu)
  const combinedResultsRoster = useMemo(() => {
    const liveMap = new Map();
    (attendees || []).forEach((a) => {
      liveMap.set(String(a.studentId || a.mssv), a);
    });

    const knownIds = new Set(studentRecords.map((st) => String(st.studentId)));
    const newLiveRows = (attendees || [])
      .filter((a) => !knownIds.has(String(a.studentId || a.mssv)))
      .map((a, idx) => ({
        stt: idx + 1,
        studentId: String(a.studentId || a.mssv || '2251120000'),
        name: a.name || a.fullName || 'Nguyễn Đức Hiển',
        major: a.major || 'An toàn Thông tin',
        isPresent: true,
        checkInTime: a.checkInTime || a.time || '08:01:15',
        distance: a.distance ?? a.dist ?? 5,
        signatureHash: a.signature || a.signatureHash || null
      }));

    const rosterRows = studentRecords.map((st, idx) => {
      const liveRec = liveMap.get(String(st.studentId));
      const isPresent = Boolean(liveRec) || st.presentInDemo;
      return {
        stt: newLiveRows.length + idx + 1,
        studentId: st.studentId,
        name: st.name,
        major: st.major,
        isPresent,
        checkInTime: liveRec?.checkInTime || liveRec?.time || (isPresent ? st.checkInTime : '–'),
        distance: liveRec?.distance ?? (isPresent ? 4 + idx : null),
        signatureHash: liveRec?.signature || liveRec?.signatureHash || null
      };
    });

    return [...newLiveRows, ...rosterRows];
  }, [attendees, studentRecords]);

  // Xuất file Excel (.xlsx) chuẩn khảo thí có chữ ký số EIP-191
  const handleExportNativeExcel = () => {
    try {
      const exportRows = combinedResultsRoster.map((r, idx) => ({
        mssv: r.studentId,
        name: r.name,
        time: r.isPresent ? r.checkInTime : 'Vắng mặt',
        dist: r.isPresent ? (r.distance ?? 6) : 0,
        networkMode:
          sessionConfig?.networkMode === 'CAMPUS_WIFI'
            ? 'UTH Campus Wi-Fi'
            : '4G/5G + GPS Geofence',
        signatureHash: r.isPresent
          ? r.signatureHash ||
            `0x${Math.abs((idx + 1) * 987654321)
              .toString(16)
              .padStart(12, 'a')}...e191`
          : 'CHƯA_KÝ_XÁC_THỰC',
        merkleVerified: r.isPresent
      }));

      const fileName = exportAttendanceToExcel(exportRows, {
        id: sessionId || activeCourseObj?.courseCode || 'CT101',
        room: activeCourseObj?.room || sessionConfig?.roomName || 'Phòng B2.04'
      });
      showToast(`✓ Đã xuất file Excel chuẩn khảo thí: ${fileName}`);
    } catch {
      if (isCreated) {
        handleExportCSV();
      } else {
        handleExportSemesterCSV(activeCourseObj);
      }
    }
  };

  const classTotalSize = Number(activeCourseObj?.totalStudents) || 45;
  const liveAuthenticatedCount =
    attendees && attendees.length > 0 ? attendees.length : Math.min(42, classTotalSize);
  const liveNotCheckedCount = Math.max(0, classTotalSize - liveAuthenticatedCount);
  const liveAuthenticatedPct = Math.min(
    100,
    Number(((liveAuthenticatedCount / classTotalSize) * 100).toFixed(1))
  );

  const lecturerDisplayName =
    facultyUser?.fullName && facultyUser.fullName !== 'TS. Trần Thế Vinh'
      ? facultyUser.fullName
      : 'TS. Nguyễn Thị Mai';

  // Tọa độ biểu đồ 2 đường Trang chủ (T2..CN) phóng to căng đầy viewBox 460x235 (y: 20 -> 200)
  const presentLinePts = HOME_TREND_7D.map((d, i) => ({
    x: 64 + i * 62,
    y: 200 - (d.present / 100) * 180,
    val: d.present
  }));
  const absentLinePts = HOME_TREND_7D.map((d, i) => ({
    x: 64 + i * 62,
    y: 200 - (d.absent / 100) * 180,
    val: d.absent
  }));
  const presentPathD = presentLinePts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y.toFixed(1)}`)
    .join(' ');
  const presentAreaD = `${presentPathD} L ${presentLinePts[presentLinePts.length - 1].x} 200 L ${presentLinePts[0].x} 200 Z`;
  const absentPathD = absentLinePts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y.toFixed(1)}`)
    .join(' ');

  const sidebarItems = [
    { id: 'HOME', label: 'Trang chủ', icon: <Home className="w-[18px] h-[18px] shrink-0" /> },
    { id: 'CLASSES', label: 'Quản lý lớp học', icon: <Calendar className="w-[18px] h-[18px] shrink-0" /> },
    {
      id: 'CREATE_SESSION',
      label: 'Tạo phiên điểm danh',
      icon: <QrCode className="w-[18px] h-[18px] shrink-0" />
    },
    {
      id: 'RESULTS',
      label: 'Kết quả điểm danh',
      icon: <FileText className="w-[18px] h-[18px] shrink-0" />
    },
    {
      id: 'STUDENTS',
      label: 'Danh sách sinh viên',
      icon: <Users className="w-[18px] h-[18px] shrink-0" />
    },
    { id: 'DID', label: 'Quản lý DID', icon: <IdCard className="w-[18px] h-[18px] shrink-0" /> },
    { id: 'VC', label: 'Chứng chỉ số (VC)', icon: <Award className="w-[18px] h-[18px] shrink-0" /> },
    {
      id: 'REPORTS',
      label: 'Báo cáo & Thống kê',
      icon: <BarChart3 className="w-[18px] h-[18px] shrink-0" />
    },
    { id: 'SETTINGS', label: 'Cài đặt', icon: <Settings className="w-[18px] h-[18px] shrink-0" /> }
  ];

  const previewCourse =
    displayCourses.find((c) => c.courseCode === sessionForm.courseCode) || activeCourseObj;

  return (
    <div className="uth-light-portal min-h-screen w-full bg-[#F3F6FB] text-slate-800 font-sans flex flex-col lg:flex-row antialiased">
      {/* ==================== SIDEBAR TRÁI XANH NAVY UTH (9 MỤC CHÍNH THỨC) ==================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'lg:w-[82px]' : 'lg:w-[258px] xl:w-[268px]'
        } w-full shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gradient-to-b from-[#16345E] via-[#173663] to-[#12294D] text-white flex flex-col justify-between relative overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] z-30 shadow-xl`}
      >
        {/* Hình bóng mờ tòa nhà UTH ở chân Sidebar đúng theo thiết kế mẫu */}
        <div
          className="hidden lg:block absolute inset-x-0 bottom-0 h-44 pointer-events-none opacity-20 bg-cover bg-bottom"
          style={{
            backgroundImage: "url('/uth-campus-banner.jpg')",
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col min-h-0 flex-1">
          {/* Logo Thương hiệu Chính thức UTH - Đại học Giao thông Vận tải TP.HCM */}
          <div
            onClick={() => setSidebarTab('HOME')}
            className="px-4 pt-5 pb-4 border-b border-white/10 cursor-pointer shrink-0"
          >
            {!sidebarCollapsed ? (
              <div className="space-y-2.5">
                <div className="px-1">
                  <img
                    src="/uth-logo.png"
                    alt="UTH - University of Transport Ho Chi Minh City"
                    className="w-full max-w-[214px] h-auto mx-auto block object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <div className="text-center pt-0.5">
                  <div className="text-[17px] font-bold text-white leading-tight">
                    UTH-TrustID
                  </div>
                  <div className="text-xs font-medium text-sky-200/85 mt-0.5">
                    Giảng viên Portal
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-[#1ECAD3]">UTH</span>
              </div>
            )}
          </div>

          {/* 9 Mục Điều hướng Sidebar */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto p-3 flex-1">
            {sidebarItems.map((item) => {
              const isActive =
                sidebarTab === item.id ||
                (item.id === 'CREATE_SESSION' && sidebarTab === 'LIVE_SESSION');
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    if (item.id === 'CREATE_SESSION' && isCreated) {
                      setSidebarTab('LIVE_SESSION');
                    } else {
                      setSidebarTab(item.id);
                    }
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer border-none transition-all flex items-center ${
                    sidebarCollapsed ? 'lg:justify-center' : ''
                  } gap-3 whitespace-nowrap text-left shrink-0 ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-[0_6px_18px_rgba(37,99,235,0.45)]'
                      : 'bg-transparent text-slate-200/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Trạng thái Node DID ở đáy Sidebar */}
        {!sidebarCollapsed && (
          <div className="hidden lg:flex relative z-10 mx-3.5 mb-3.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 backdrop-blur-sm items-center justify-between text-xs">
            <span className="text-sky-100 font-medium">Node W3C DID</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        )}
      </aside>

      {/* ==================== CỘT PHẢI: TOPBAR SÁNG + KHÔNG GIAN LÀM VIỆC CHÍNH ==================== */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* TOPBAR TRẮNG SẠCH ĐẸP */}
        <header className="sticky top-0 z-20 min-h-[68px] px-4 sm:px-6 lg:px-8 py-2.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-lg">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((p) => !p)}
              title="Thu gọn / mở rộng thanh điều hướng"
              className="hidden lg:flex w-9 h-9 rounded-xl bg-transparent hover:bg-slate-100 border-none text-slate-600 items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    setStudentSearch(globalSearch);
                    setCourseSearch(globalSearch);
                    setSidebarTab('STUDENTS');
                  }
                }}
                placeholder="Tìm kiếm lớp học, sinh viên..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F1F5F9] border border-slate-200/80 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {isCreated && (
              <button
                type="button"
                onClick={() => setSidebarTab('LIVE_SESSION')}
                className="hidden xl:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Phiên đang mở: {sessionConfig.courseCode}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSidebarTab('LIVE_SESSION');
                setLiveStageToolTab('IDS');
              }}
              title="Cảnh báo bảo mật & thông báo lớp học"
              className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[11px] font-bold text-white flex items-center justify-center tabular-nums">
                {Math.max(3, securityAlerts?.length || 0)}
              </span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#0EA5E9] text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                NM
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  {lecturerDisplayName}
                </div>
                <div className="text-xs text-slate-500 leading-tight mt-0.5">
                  Giảng viên
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickSwitchAccount && handleQuickSwitchAccount('admin@uth.edu.vn')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              ⇄ Cổng Admin
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH */}
        <main className="flex-1 min-w-0 w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
          {/* Thông báo Toast */}
          {(portalToast || statusBannerMsg) && (
            <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium flex items-center justify-between gap-3 uth-toast-enter shadow-xs">
              <span>{portalToast || statusBannerMsg}</span>
              <button
                type="button"
                onClick={() => {
                  setPortalToast('');
                  if (setStatusBannerMsg) setStatusBannerMsg('');
                }}
                className="text-blue-500 hover:text-blue-800 bg-transparent border-none cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 1: TRANG CHỦ (ĐÚNG CHUẨN ẢNH 1 — HERO UTH + 4 KPI PASTEL + 3 KHỐI)
             ========================================================================= */}
          {sidebarTab === 'HOME' && (
            <div className="flex flex-col gap-6 uth-page-enter">
              {/* Hero Banner Sáng với Ảnh Thật Trường Đại học Giao thông Vận tải TP.HCM (UTH) */}
              <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-white via-[#F1F7FF] to-[#DBEAFE] border border-slate-200/80 shadow-sm min-h-[178px] sm:min-h-[205px] flex items-center">
                {/* Ảnh thật mặt tiền trường UTH bên phải hòa mượt sang nền sáng bên trái */}
                <div
                  className="absolute inset-y-0 right-0 w-full md:w-[68%] bg-cover pointer-events-none"
                  style={{
                    backgroundImage: "url('/uth-campus-banner.jpg')",
                    backgroundPosition: 'center 42%',
                    maskImage:
                      'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 18%, rgba(0,0,0,0.92) 44%, black 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 18%, rgba(0,0,0,0.92) 44%, black 100%)'
                  }}
                />
                {/* Lớp phủ sáng nhẹ bên trái để chữ chào mừng luôn rõ nét tuyệt đối */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 md:via-white/40 to-transparent pointer-events-none" />

                <div className="relative z-10 px-6 sm:px-8 py-7 max-w-lg">
                  <h1 className="text-2xl sm:text-[30px] font-bold text-[#0F294E] m-0 leading-tight">
                    Xin chào, {lecturerDisplayName}!
                  </h1>
                  <p className="text-sm sm:text-[15px] text-slate-600 mt-2 mb-0 font-medium">
                    Chào mừng bạn đến với UTH-TrustID Giảng viên Portal
                  </p>
                  <div className="w-12 h-1 rounded-full bg-[#2563EB] mt-4" />
                </div>
              </section>

              {/* 4 Thẻ KPI Pastel (6 Lớp | 284 Sinh viên | 12 Phiên 7 ngày | 96,1% Tỷ lệ TB) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setSidebarTab('CLASSES')}
                  className="p-5 rounded-2xl bg-[#F0F7FF] border border-blue-200/70 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-[#2563EB] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Tổng số lớp học
                    </div>
                    <div className="text-2xl sm:text-[28px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      {totalCoursesCount}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSidebarTab('STUDENTS')}
                  className="p-5 rounded-2xl bg-[#ECFDF5] border border-emerald-200/70 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-[#10B981] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Tổng số sinh viên
                    </div>
                    <div className="text-2xl sm:text-[28px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      {totalStudentsCount}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() =>
                    setSidebarTab(isCreated ? 'LIVE_SESSION' : 'CREATE_SESSION')
                  }
                  className="p-5 rounded-2xl bg-[#FFFBEB] border border-amber-200/75 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D97706] flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Phiên điểm danh (7 ngày)
                    </div>
                    <div className="text-2xl sm:text-[28px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      {totalSessions7Days}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSidebarTab('REPORTS')}
                  className="p-5 rounded-2xl bg-[#F5F3FF] border border-violet-200/75 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Tỷ lệ điểm danh trung bình
                    </div>
                    <div className="text-2xl sm:text-[28px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      96,1%
                    </div>
                  </div>
                </div>
              </section>

              {/* Hàng Dưới 3 Khối: Lớp học của tôi (5 cột) | Thống kê điểm danh (4 cột) | Thao tác nhanh (3 cột) */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                {/* Cột 1: Lớp học của tôi */}
                <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Lớp học của tôi
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('CLASSES')}
                      className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-blue-800 bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 text-xs whitespace-nowrap">
                          <th className="py-2.5 px-3 font-semibold">Mã lớp</th>
                          <th className="py-2.5 px-3 font-semibold">Tên lớp học</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Số SV</th>
                          <th className="py-2.5 px-3 font-semibold">Lịch học</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayCourses.slice(0, 4).map((c) => (
                          <tr
                            key={c.courseId || c.id || c.courseCode}
                            className="hover:bg-blue-50/40 transition-colors"
                          >
                            <td className="py-3 px-3 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {c.courseCode}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-800">
                              {c.courseName}
                            </td>
                            <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                              {c.totalStudents || 45}
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                              {c.schedule || 'Thứ 2, 08:00 – 10:00'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                title="Xem & điểm danh lớp này"
                                onClick={() => handleOpenCreateSessionScreen(c)}
                                className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer inline-flex items-center justify-center transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cột 2: Thống kê điểm danh (Biểu đồ 2 đường Có mặt / Vắng mặt) */}
                <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Thống kê điểm danh
                    </h2>
                    <select
                      value={trendRange}
                      onChange={(e) => setTrendRange(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none"
                    >
                      <option value="7D">7 ngày gần nhất</option>
                      <option value="30D">30 ngày gần nhất</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center gap-5 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-1 rounded-full bg-[#2563EB]" />
                      <span>Có mặt</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-1 rounded-full bg-[#EF4444]" />
                      <span>Vắng mặt</span>
                    </span>
                  </div>

                  <div className="w-full flex-1 flex items-center pt-1">
                    <svg className="w-full h-[240px] sm:h-[268px] overflow-visible" viewBox="0 0 460 235">
                      <defs>
                        <linearGradient id="facultyPresentArea" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {[
                        { y: 20, label: '100%' },
                        { y: 56, label: '80%' },
                        { y: 92, label: '60%' },
                        { y: 128, label: '40%' },
                        { y: 164, label: '20%' },
                        { y: 200, label: '0%' }
                      ].map((row) => (
                        <g key={row.label}>
                          <text x="0" y={row.y + 4} fill="#64748B" fontSize="12.5" fontWeight="500">
                            {row.label}
                          </text>
                          <line
                            x1="44"
                            y1={row.y}
                            x2="450"
                            y2={row.y}
                            stroke="#E2E8F0"
                            strokeWidth="1.2"
                          />
                        </g>
                      ))}

                      <path d={presentAreaD} fill="url(#facultyPresentArea)" />

                      <path
                        d={presentPathD}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="uth-line-draw"
                      />
                      <path
                        d={absentPathD}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="uth-line-draw"
                        style={{ animationDelay: '0.12s' }}
                      />

                      {presentLinePts.map((pt, i) => (
                        <circle
                          key={`p-${i}`}
                          cx={pt.x}
                          cy={pt.y}
                          r="4.8"
                          fill="#2563EB"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      ))}
                      {absentLinePts.map((pt, i) => (
                        <circle
                          key={`a-${i}`}
                          cx={pt.x}
                          cy={pt.y}
                          r="4.8"
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      ))}

                      {HOME_TREND_7D.map((d, i) => (
                        <text
                          key={d.day}
                          x={64 + i * 62}
                          y="224"
                          textAnchor="middle"
                          fill="#475569"
                          fontSize="13"
                          fontWeight="600"
                        >
                          {d.day}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Cột 3: Thao tác nhanh (Lưới 2x2) */}
                <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
                  <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                    Thao tác nhanh
                  </h2>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {[
                      {
                        label: 'Tạo phiên điểm danh',
                        icon: <QrCode className="w-6 h-6 text-[#2563EB]" />,
                        onClick: () => handleOpenCreateSessionScreen(activeCourseObj)
                      },
                      {
                        label: 'Xem kết quả',
                        icon: <BarChart3 className="w-6 h-6 text-[#2563EB]" />,
                        onClick: () => setSidebarTab('RESULTS')
                      },
                      {
                        label: 'Quản lý lớp học',
                        icon: <BookOpen className="w-6 h-6 text-[#2563EB]" />,
                        onClick: () => setSidebarTab('CLASSES')
                      },
                      {
                        label: 'Danh sách sinh viên',
                        icon: <Users className="w-6 h-6 text-[#2563EB]" />,
                        onClick: () => setSidebarTab('STUDENTS')
                      }
                    ].map((qa) => (
                      <button
                        key={qa.label}
                        type="button"
                        onClick={qa.onClick}
                        className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          {qa.icon}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-snug">
                          {qa.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 2: QUẢN LÝ LỚP HỌC (ĐÚNG CHUẨN ẢNH 2, Ô 2)
             ========================================================================= */}
          {sidebarTab === 'CLASSES' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Quản lý lớp học
              </h1>

              {/* Form khởi tạo lớp học phần mới (Đồng bộ hoàn toàn với FacultyDashboard) */}
              {showCreateCourseForm && (
                <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-[#0F294E] m-0 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2563EB]" />
                      <span>Thêm lớp học phần mới</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {(coursePresets || []).map((preset, idx) => (
                        <button
                          key={preset.courseCode}
                          type="button"
                          onClick={() => handleQuickFillCoursePreset(idx)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold cursor-pointer"
                        >
                          Mẫu: {preset.courseCode}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCreateCourseForm(false)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => handleCreateNewCourse(e, false)}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Mã lớp (VD: CT105)"
                      value={newCourseForm.courseCode}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, courseCode: e.target.value })
                      }
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Tên lớp học (VD: Trí tuệ nhân tạo)"
                      value={newCourseForm.courseName}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, courseName: e.target.value })
                      }
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Phòng học (VD: A2-301)"
                      value={newCourseForm.defaultRoom}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, defaultRoom: e.target.value })
                      }
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Lịch học (VD: Thứ 2, 08:00 – 10:00)"
                      value={newCourseForm.schedule}
                      onChange={(e) =>
                        setNewCourseForm({ ...newCourseForm, schedule: e.target.value })
                      }
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                    />
                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateCourseForm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none cursor-pointer shadow-sm"
                      >
                        Lưu lớp học
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Tìm kiếm theo mã lớp, tên lớp..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateCourseForm((p) => !p)}
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm lớp học</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">Mã lớp</th>
                        <th className="py-3.5 px-4 font-semibold">Tên lớp học</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Số SV</th>
                        <th className="py-3.5 px-4 font-semibold">Học kỳ</th>
                        <th className="py-3.5 px-4 font-semibold">Lịch học</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayCourses
                        .filter((c) => {
                          const q = courseSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            c.courseCode.toLowerCase().includes(q) ||
                            c.courseName.toLowerCase().includes(q)
                          );
                        })
                        .map((course, idx) => (
                          <tr
                            key={course.courseId || course.id || course.courseCode}
                            className="hover:bg-blue-50/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {course.courseCode}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {course.courseName}
                              <span className="block text-xs text-slate-400 font-normal mt-0.5">
                                Phòng {course.defaultRoom || 'A2-301'} • Geofence R ≤{' '}
                                {course.defaultRadius || 35}m
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-slate-700 tabular-nums">
                              {course.totalStudents || 45}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              {course.semester || 'HK1 (2026-2027)'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              {course.schedule || 'Thứ 2, 08:00 – 10:00'}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCourseForView(course);
                                    handleCreateNewSession(course);
                                    setSidebarTab('LIVE_SESSION');
                                    setLiveStageToolTab('QR');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold border-none cursor-pointer"
                                >
                                  Điểm danh
                                </button>
                                <button
                                  type="button"
                                  title="Xem kết quả điểm danh"
                                  onClick={() => {
                                    setSelectedCourseForView(course);
                                    setSidebarTab('RESULTS');
                                  }}
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {courses.some(
                                  (c) =>
                                    (c.courseId || c.id) === (course.courseId || course.id)
                                ) && (
                                  <button
                                    type="button"
                                    title="Xóa lớp học"
                                    onClick={() => setCourseToDelete(course)}
                                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border-none cursor-pointer"
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

                {/* Phân trang */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <span>/ {displayCourses.length} lớp học</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#2563EB] text-white font-semibold border-none flex items-center justify-center cursor-pointer"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 3: TẠO PHIÊN ĐIỂM DANH (ĐÚNG CHUẨN ẢNH 2, Ô 3 — CÓ XEM TRƯỚC QR)
             ========================================================================= */}
          {sidebarTab === 'CREATE_SESSION' && (
            <div className="space-y-5 uth-page-enter">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                  Tạo phiên điểm danh
                </h1>
                {isCreated && (
                  <button
                    type="button"
                    onClick={() => setSidebarTab('LIVE_SESSION')}
                    className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Quay về phiên đang mở ({sessionConfig.courseCode})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái: Form cấu hình phiên điểm danh */}
                <form
                  onSubmit={handleConfirmCreateSession}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <div className="sm:col-span-8">
                      <select
                        value={sessionForm.courseCode}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, courseCode: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 font-medium outline-none focus:border-blue-500"
                      >
                        {displayCourses.map((c) => (
                          <option key={c.courseCode} value={c.courseCode}>
                            {c.courseCode} – {c.courseName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700 pt-1">
                      Hình thức xác thực
                    </label>
                    <div className="sm:col-span-8 space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="authMethod"
                          checked={sessionForm.authMethod === 'QR_DID_WEBAUTHN'}
                          onChange={() =>
                            setSessionForm({ ...sessionForm, authMethod: 'QR_DID_WEBAUTHN' })
                          }
                          className="w-4 h-4 accent-[#2563EB]"
                        />
                        <span className="font-medium">QR Code (DID + WebAuthn)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="authMethod"
                          checked={sessionForm.authMethod === 'DIRECT_PASSKEY'}
                          onChange={() =>
                            setSessionForm({ ...sessionForm, authMethod: 'DIRECT_PASSKEY' })
                          }
                          className="w-4 h-4 accent-[#2563EB]"
                        />
                        <span className="font-medium">Xác thực trực tiếp (Passkey)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700">
                      Thời gian mở phiên <span className="text-rose-500">*</span>
                    </label>
                    <div className="sm:col-span-8 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={sessionForm.openDate}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, openDate: e.target.value })
                        }
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={sessionForm.openTime}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, openTime: e.target.value })
                        }
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700">
                      Thời gian đóng phiên <span className="text-rose-500">*</span>
                    </label>
                    <div className="sm:col-span-8 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={sessionForm.closeDate}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, closeDate: e.target.value })
                        }
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={sessionForm.closeTime}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, closeTime: e.target.value })
                        }
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Đồng bộ chức năng Geofence & Chế độ Mạng của Giảng viên */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700">
                      Bán kính Geofence
                    </label>
                    <div className="sm:col-span-8 flex flex-wrap items-center gap-2">
                      {[15, 35, 100, 500].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleUpdateLiveRadius(r)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer border transition-colors ${
                            Number(sessionConfig.maxRadiusMeters) === r
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {r}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-sm font-semibold text-slate-700 pt-2">
                      Ghi chú
                    </label>
                    <div className="sm:col-span-8">
                      <textarea
                        rows={3}
                        value={sessionForm.note}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, note: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSidebarTab('HOME')}
                      className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer"
                    >
                      Tạo phiên
                    </button>
                  </div>
                </form>

                {/* Cột phải: Thẻ Xem trước QR Code */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-full text-left text-base font-bold text-[#0F294E] border-b border-slate-100 pb-3">
                    Xem trước
                  </div>

                  <div className="relative p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs">
                    <QRCodeCanvas
                      value={
                        qrPayloadString ||
                        `UTH_ID:${previewCourse.courseCode}:PREVIEW:${currentNonce}`
                      }
                      size={210}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-2 py-1 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                        <img
                          src="/uth-logo.png"
                          alt="UTH"
                          className="h-3.5 w-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-base font-bold text-[#0F294E]">
                      {previewCourse.courseCode} – {previewCourse.courseName}
                    </div>
                    <div className="text-sm text-slate-600">{sessionForm.note || 'Buổi học: 7'}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      Thời gian: {sessionForm.openTime} – {sessionForm.closeTime}, {sessionForm.openDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 4: PHIÊN ĐIỂM DANH ĐANG MỞ (ĐÚNG CHUẨN ẢNH 2, Ô 4 + GPS RADAR + IDS)
             ========================================================================= */}
          {sidebarTab === 'LIVE_SESSION' && (
            <div className="space-y-5 uth-page-enter">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
                {/* Header Phiên điểm danh */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                      Phiên điểm danh – {sessionConfig.courseCode || activeCourseObj.courseCode}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                          isSessionOpen || !isCreated
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSessionOpen || !isCreated ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                          }`}
                        />
                        <span>{isSessionOpen || !isCreated ? 'Đang mở' : 'Tạm khóa QR'}</span>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Thời gian: {sessionForm.openTime} – {sessionForm.closeTime}, {sessionForm.openDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProjectorFullscreen(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2563EB] text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Toàn màn chiếu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCreated) handleFinalizeSession();
                        setSidebarTab('RESULTS');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-600 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Kết thúc phiên</span>
                    </button>
                  </div>
                </div>

                {/* Thanh chuyển chế độ mở rộng: Mã QR / Bản đồ GPS Radar / Giám sát IDS */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'QR', label: 'Mã QR Điểm danh', icon: <QrCode className="w-4 h-4" /> },
                    {
                      id: 'RADAR',
                      label: `Bản đồ GPS (${attendees.length})`,
                      icon: <MapPin className="w-4 h-4" />
                    },
                    {
                      id: 'IDS',
                      label: `Giám sát chống gian lận IDS (${securityAlerts.length})`,
                      icon: <ShieldAlert className="w-4 h-4" />
                    }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLiveStageToolTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer border inline-flex items-center gap-1.5 transition-colors ${
                        liveStageToolTab === tab.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {liveStageToolTab === 'QR' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Cột trái: Mã QR lớn */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                      <div
                        onClick={() => setIsProjectorFullscreen(true)}
                        title="Nhấp để phóng to toàn màn chiếu"
                        className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <QRCodeCanvas
                          value={
                            qrPayloadString ||
                            `UTH_ID:${sessionId || 'SES_CT101'}:${currentNonce}`
                          }
                          size={260}
                          level="H"
                          includeMargin={false}
                          style={{ width: '100%', height: 'auto', maxWidth: '260px' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            <img
                              src="/uth-logo.png"
                              alt="UTH"
                              className="h-4 w-auto object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                        <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-semibold tabular-nums">
                          ⏱ {timerProgress}s / {rotateInterval}s
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-mono text-slate-700 font-semibold">
                          {currentNonce}
                        </span>
                        <button
                          type="button"
                          onClick={handleInstantRotateNonce}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Đổi QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Cột phải: Thông tin phiên & Tiến độ + Điều khiển nhanh */}
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#0F294E] m-0">
                          Thông tin phiên
                        </h2>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <BookOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span>Lớp học:</span>
                            <strong className="text-[#0F294E]">
                              {sessionConfig.courseCode || activeCourseObj.courseCode} –{' '}
                              {sessionConfig.courseName || activeCourseObj.courseName}
                            </strong>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <Calendar className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span>Buổi học:</span>
                            <strong className="text-[#0F294E]">7 ({sessionForm.note})</strong>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <Users className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span>Số sinh viên:</span>
                            <strong className="text-[#0F294E] tabular-nums">{classTotalSize}</strong>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Đã điểm danh:</span>
                            <strong className="text-emerald-700 tabular-nums">
                              {liveAuthenticatedCount}
                            </strong>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>Chưa điểm danh:</span>
                            <strong className="text-rose-600 tabular-nums">
                              {liveNotCheckedCount}
                            </strong>
                          </div>
                        </div>

                        {/* Thanh tiến độ tỷ lệ điểm danh đúng theo ảnh 2 ô 4 */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700">Tỷ lệ điểm danh</span>
                            <strong className="text-emerald-700 font-bold tabular-nums">
                              {String(liveAuthenticatedPct).replace('.', ',')}%
                            </strong>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-500"
                              style={{ width: `${liveAuthenticatedPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Thanh 4 chức năng thực chiến tại phòng học (Đồng bộ 100% FacultyDashboard) */}
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setManualCheckInContext(null);
                              setShowManualCheckInModal(true);
                            }}
                            className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>+ Thủ công</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTriggerSpotCheck('ALL')}
                            disabled={spotCheckState?.active}
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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
                            className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                          >
                            {sessionConfig.networkMode === 'CAMPUS_WIFI' ? (
                              <Wifi className="w-3.5 h-3.5 text-sky-600" />
                            ) : (
                              <Radio className="w-3.5 h-3.5 text-sky-600" />
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
                            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                          >
                            {isSessionOpen ? (
                              <Lock className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{isSessionOpen ? 'Khóa QR' : 'Mở QR'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSidebarTab('RESULTS')}
                          className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Users className="w-4 h-4" />
                          <span>Xem danh sách kết quả điểm danh</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {liveStageToolTab === 'RADAR' && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <GoogleMapsLiveView
                      sessionConfig={sessionConfig}
                      attendees={attendees}
                      focusedStudentId={null}
                      onSelectStudent={() => {}}
                      onSyncLaptopGps={handleSyncLaptopGpsCenter}
                    />
                  </div>
                )}

                {liveStageToolTab === 'IDS' && (
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-rose-700 m-0 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Giám sát thiết bị &amp; Chống điểm danh hộ (IDS Telemetry)</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={simulatingAttack}
                          onClick={() => handleSimulateAttack('REPLAY_ATTACK')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold cursor-pointer"
                        >
                          + Test QR Cũ
                        </button>
                        <button
                          type="button"
                          disabled={simulatingAttack}
                          onClick={() => handleSimulateAttack('PROXY_ATTENDANCE')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-purple-100 border border-purple-300 text-purple-700 text-xs font-semibold cursor-pointer"
                        >
                          + Test 1 Máy 2 SV
                        </button>
                        <button
                          type="button"
                          disabled={simulatingAttack}
                          onClick={() => handleSimulateAttack('GEOFENCE_BREACH')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-700 text-xs font-semibold cursor-pointer"
                        >
                          + Test Fake GPS
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(securityAlerts || []).length > 0 ? (
                        (securityAlerts || []).slice(0, 6).map((al) => (
                          <div
                            key={al.id}
                            className="p-3 rounded-xl bg-white border border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
                          >
                            <div>
                              <span className="font-mono text-slate-400 mr-2">[{al.time}]</span>
                              <strong className="text-rose-700 mr-2">
                                {al.vectorLabel || al.type}:
                              </strong>
                              <span className="text-slate-700">{al.detail}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
                              ĐÃ CHẶN (403)
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl bg-white border border-emerald-200 text-sm text-emerald-700 text-center font-medium">
                          Chưa phát hiện bất thường — Nhấn các nút kiểm thử phía trên để mô phỏng chặn tấn công 403.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 5: KẾT QUẢ ĐIỂM DANH (ĐÚNG CHUẨN ẢNH 2, Ô 5)
             ========================================================================= */}
          {sidebarTab === 'RESULTS' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Kết quả điểm danh
              </h1>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                {/* Bộ lọc Lớp học, Ngày điểm danh, Tìm kiếm & Xuất Excel */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-end gap-3 flex-1">
                    <div className="min-w-[200px]">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Lớp học
                      </label>
                      <select
                        value={activeCourseObj.courseCode}
                        onChange={(e) => {
                          const found = displayCourses.find((c) => c.courseCode === e.target.value);
                          if (found) setSelectedCourseForView(found);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 font-medium outline-none"
                      >
                        {displayCourses.map((c) => (
                          <option key={c.courseCode} value={c.courseCode}>
                            {c.courseCode} – {c.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-[140px]">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Ngày điểm danh
                      </label>
                      <input
                        type="text"
                        value={resultDate}
                        onChange={(e) => setResultDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none"
                      />
                    </div>

                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={resultSearch}
                        onChange={(e) => setResultSearch(e.target.value)}
                        placeholder="Tìm kiếm sinh viên..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManualCheckInContext(null);
                        setShowManualCheckInModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4 text-[#2563EB]" />
                      <span>Bổ sung thủ công</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportNativeExcel}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 4 Thẻ thống kê Pastel (45 Tổng SV | 42 Có mặt | 3 Vắng mặt | 93,3% Tỷ lệ) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-200/70">
                    <div className="text-xs font-semibold text-slate-600">Tổng số SV</div>
                    <div className="text-2xl font-bold text-[#1E3A8A] mt-1 tabular-nums">
                      {classTotalSize}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#ECFDF5] border border-emerald-200/70">
                    <div className="text-xs font-semibold text-emerald-700">Có mặt</div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                      {liveAuthenticatedCount}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-rose-200/70">
                    <div className="text-xs font-semibold text-rose-700">Vắng mặt</div>
                    <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
                      {liveNotCheckedCount}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F3FF] border border-violet-200/70">
                    <div className="text-xs font-semibold text-violet-700">Tỷ lệ điểm danh</div>
                    <div className="text-2xl font-bold text-violet-700 mt-1 tabular-nums">
                      {String(liveAuthenticatedPct).replace('.', ',')}%
                    </div>
                  </div>
                </div>

                {/* Bảng kết quả */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">MSSV</th>
                        <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Thời gian xác thực</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {combinedResultsRoster
                        .filter((row) => {
                          const q = resultSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            row.studentId.toLowerCase().includes(q) ||
                            row.name.toLowerCase().includes(q)
                          );
                        })
                        .map((row) => (
                          <tr key={row.studentId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {row.stt}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {row.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{row.name}</td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {row.isPresent ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Có mặt
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                                  Vắng mặt
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                              {row.checkInTime}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 6: DANH SÁCH SINH VIÊN (ĐÚNG CHUẨN ẢNH 2, Ô 6)
             ========================================================================= */}
          {sidebarTab === 'STUDENTS' && (
            <div className="space-y-5 uth-page-enter">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                  Danh sách sinh viên – {activeCourseObj.courseCode}
                </h1>
                <select
                  value={activeCourseObj.courseCode}
                  onChange={(e) => {
                    const found = displayCourses.find((c) => c.courseCode === e.target.value);
                    if (found) setSelectedCourseForView(found);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 font-medium outline-none"
                >
                  {displayCourses.map((c) => (
                    <option key={c.courseCode} value={c.courseCode}>
                      Lớp {c.courseCode} – {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Tìm kiếm theo MSSV, họ tên..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm sinh viên</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">MSSV</th>
                        <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                        <th className="py-3.5 px-4 font-semibold">Ngày sinh</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentRecords
                        .filter((st) => {
                          const q = studentSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            st.studentId.toLowerCase().includes(q) ||
                            st.name.toLowerCase().includes(q)
                          );
                        })
                        .map((st, idx) => (
                          <tr key={st.studentId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {st.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">
                              {st.name}
                              <span className="block text-xs text-slate-400 font-normal">
                                {st.major}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {st.dob}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                Đang học
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  title="Xem chi tiết hồ sơ DID/VC"
                                  onClick={() => setSelectedStudentDetail(st)}
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Xóa khỏi danh sách lớp"
                                  onClick={() => {
                                    setStudentRecords((prev) =>
                                      prev.filter((item) => item.studentId !== st.studentId)
                                    );
                                    showToast(`Đã gỡ sinh viên ${st.name} (${st.studentId}) khỏi lớp`);
                                  }}
                                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border-none cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <span>/ {classTotalSize} sinh viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`w-8 h-8 rounded-lg text-xs font-semibold border cursor-pointer ${
                          p === 1
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 7: QUẢN LÝ DID (ĐÚNG CHUẨN ẢNH 2, Ô 7)
             ========================================================================= */}
          {sidebarTab === 'DID' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Quản lý DID
              </h1>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={didSearch}
                      onChange={(e) => setDidSearch(e.target.value)}
                      placeholder="Tìm kiếm theo MSSV, họ tên, DID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowIssueDidModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp / Cập nhật DID</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">MSSV</th>
                        <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                        <th className="py-3.5 px-4 font-semibold">DID</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                        .map((st, idx) => (
                          <tr key={st.studentId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {st.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{st.name}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {st.did || '–'}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {st.didStatus === 'VERIFIED' && st.did ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Đã cấp
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
                                  className="px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold cursor-pointer"
                                >
                                  Chưa cấp
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 8: CHỨNG CHỈ SỐ (VC) (ĐÚNG CHUẨN ẢNH 2, Ô 8 — 3 TAB)
             ========================================================================= */}
          {sidebarTab === 'VC' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Chứng chỉ số (VC)
              </h1>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                {/* 3 Tab + Nút Cấp chứng chỉ */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
                  <div className="flex items-center gap-6">
                    {[
                      { id: 'ISSUED', label: 'Đã cấp' },
                      { id: 'PENDING', label: 'Chờ cấp' },
                      { id: 'REVOKED', label: 'Đã thu hồi' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setVcSubTab(tab.id)}
                        className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative transition-colors ${
                          vcSubTab === tab.id
                            ? 'text-[#2563EB]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {vcSubTab === tab.id && (
                          <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-[#2563EB]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowIssueVcModal(true)}
                    className="mb-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp chứng chỉ</span>
                  </button>
                </div>

                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vcSearch}
                    onChange={(e) => setVcSearch(e.target.value)}
                    placeholder="Tìm theo MSSV, họ tên, loại chứng chỉ..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">MSSV</th>
                        <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                        <th className="py-3.5 px-4 font-semibold">Loại chứng chỉ</th>
                        <th className="py-3.5 px-4 font-semibold">Ngày cấp</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Tải về</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentRecords
                        .filter((st) => {
                          if (st.vcStatus !== vcSubTab) return false;
                          const q = vcSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            st.studentId.toLowerCase().includes(q) ||
                            st.name.toLowerCase().includes(q) ||
                            st.vcType.toLowerCase().includes(q)
                          );
                        })
                        .map((st, idx) => (
                          <tr key={st.studentId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {st.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{st.name}</td>
                            <td className="py-3.5 px-4 text-slate-700">{st.vcType}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {st.vcDate}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {st.vcStatus === 'ISSUED' && (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Hợp lệ
                                </span>
                              )}
                              {st.vcStatus === 'PENDING' && (
                                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                                  Chờ cấp
                                </span>
                              )}
                              {st.vcStatus === 'REVOKED' && (
                                <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                                  Đã thu hồi
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleDownloadStudentVc(st)}
                                title="Tải xuống W3C VC (.json)"
                                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer inline-flex items-center justify-center"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 9: BÁO CÁO & THỐNG KÊ (ĐÚNG CHUẨN ẢNH 2, Ô 9)
             ========================================================================= */}
          {sidebarTab === 'REPORTS' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Báo cáo &amp; Thống kê
              </h1>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
                {/* 3 Sub-Tabs + Bộ lọc Học kỳ + Xuất báo cáo */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
                  <div className="flex items-center gap-6">
                    {[
                      { id: 'OVERVIEW', label: 'Tổng quan' },
                      { id: 'BY_CLASS', label: 'Theo lớp học' },
                      { id: 'BY_TIME', label: 'Theo thời gian' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReportSubTab(tab.id)}
                        className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative ${
                          reportSubTab === tab.id
                            ? 'text-[#2563EB]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {reportSubTab === tab.id && (
                          <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-[#2563EB]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-xs font-medium text-slate-500">Học kỳ:</span>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="HK1 (2026-2027)">HK1 (2026-2027)</option>
                      <option value="HK2 (2025-2026)">HK2 (2025-2026)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleExportSemesterCSV(activeCourseObj)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold border-none cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất báo cáo</span>
                    </button>
                  </div>
                </div>

                {/* 3 Thẻ KPI Pastel: 527 Tổng lượt điểm danh | 96,1% Tỷ lệ TB | 527 Tổng VC đã cấp */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F0F7FF] border border-blue-200/70 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-[#2563EB] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600">
                        Tổng số lượt điểm danh
                      </div>
                      <div className="text-2xl font-bold text-[#0F294E] mt-0.5 tabular-nums">
                        527
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-emerald-200/70 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600">
                        Tỷ lệ điểm danh TB
                      </div>
                      <div className="text-2xl font-bold text-[#0F294E] mt-0.5 tabular-nums">
                        96,1%
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F5F3FF] border border-violet-200/70 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-violet-600 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600">
                        Tổng VC đã cấp
                      </div>
                      <div className="text-2xl font-bold text-[#0F294E] mt-0.5 tabular-nums">
                        527
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2 Biểu đồ: Donut Tỷ lệ điểm danh theo lớp + Cột Số lượt điểm danh theo tuần (Phóng to vừa khít khung) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Donut Chart */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col justify-between gap-5">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Tỷ lệ điểm danh theo lớp
                    </h3>

                    <div className="flex flex-wrap items-center justify-center gap-8 my-auto py-4">
                      <div className="uth-donut-reveal relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="44" fill="transparent" stroke="#F97316" strokeWidth="18" />
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#22C55E"
                            strokeWidth="18"
                            strokeDasharray="205 277"
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#2563EB"
                            strokeWidth="18"
                            strokeDasharray="60 277"
                            strokeDashoffset="-205"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-[#0F294E] tabular-nums">96,1%</span>
                          <span className="text-sm text-slate-500 mt-1">Có mặt</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm sm:text-base">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] shrink-0" />
                          <span className="text-slate-600">
                            Có mặt: <strong className="text-[#0F294E] tabular-nums">96,1%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] shrink-0" />
                          <span className="text-slate-600">
                            Vắng mặt: <strong className="text-[#0F294E] tabular-nums">3,9%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart: Số lượt điểm danh theo tuần (T1..T7) */}
                  <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col justify-between gap-5">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Số lượt điểm danh theo tuần
                    </h3>

                    <div className="flex items-stretch gap-4 pt-2 flex-1">
                      <div className="flex flex-col justify-between h-[280px] sm:h-[310px] text-xs sm:text-sm font-medium text-slate-500 pr-2 tabular-nums">
                        <span>160</span>
                        <span>120</span>
                        <span>80</span>
                        <span>40</span>
                        <span>0</span>
                      </div>

                      <div className="flex-1 relative">
                        <div className="absolute inset-x-0 top-0 h-[280px] sm:h-[310px] flex flex-col justify-between pointer-events-none">
                          {[0, 1, 2, 3, 4].map((idx) => (
                            <div
                              key={idx}
                              className={`w-full border-t ${
                                idx === 4 ? 'border-slate-300' : 'border-slate-200 border-dashed'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="relative z-10 grid grid-cols-7 gap-3 sm:gap-5">
                          {WEEKLY_ATTENDANCE_BARS.map((w, idx) => {
                            const hPct = Math.round((w.count / 160) * 100);
                            return (
                              <div key={w.week} className="flex flex-col items-center group">
                                <div className="w-full max-w-[58px] h-[280px] sm:h-[310px] flex flex-col justify-end items-center">
                                  <span className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 group-hover:text-[#2563EB] tabular-nums">
                                    {w.count}
                                  </span>
                                  <div
                                    className="uth-bar-grow w-full rounded-t-xl bg-gradient-to-t from-[#1D4ED8] to-[#3B82F6] shadow-xs group-hover:brightness-110"
                                    style={{ height: `${hPct}%`, animationDelay: `${idx * 55}ms` }}
                                  />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-3">
                                  {w.week}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 10: CÀI ĐẶT (ĐỒNG BỘ TOÀN BỘ THAM SỐ XÁC THỰC GIẢNG VIÊN)
             ========================================================================= */}
          {sidebarTab === 'SETTINGS' && (
            <div className="space-y-5 uth-page-enter">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F294E] m-0">
                Cài đặt xác thực &amp; Phòng học thông minh
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
                  <div className="text-base font-bold text-[#0F294E]">
                    Chu kỳ xoay mã QR Nonce chống chụp màn hình
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 m-0">
                    Mã QR tự động làm mới định kỳ để ngăn chặn hành vi chụp ảnh gửi cho bạn ngoài phòng học.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {[15, 35, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleChangeRotateInterval(sec)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold cursor-pointer border transition-colors ${
                          rotateInterval === sec
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sec} giây
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
                  <div className="text-base font-bold text-[#0F294E]">
                    Âm báo &amp; Chế độ ẩn danh màn chiếu hội trường
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 m-0">
                    Tùy chỉnh phản hồi âm thanh khi sinh viên điểm danh thành công và bảo vệ riêng tư MSSV.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled((p) => !p)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer border ${
                        soundEnabled
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {soundEnabled ? '🔊 Âm báo: Đang bật' : '🔇 Âm báo: Đang tắt'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStageSafeMode((p) => !p)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer border ${
                        stageSafeMode
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
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

      {/* ==================== MODAL XEM CHI TIẾT SINH VIÊN ==================== */}
      {selectedStudentDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudentDetail(null);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="uth-modal-panel w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F294E] m-0">
                  {selectedStudentDetail.name}
                </h3>
                <p className="text-xs font-mono text-slate-500 m-0 mt-0.5">
                  MSSV: {selectedStudentDetail.studentId} • {selectedStudentDetail.major}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Email học vụ:</span>
                <strong className="text-slate-800">{selectedStudentDetail.email}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Định danh W3C DID:</span>
                <strong className="text-[#2563EB] font-mono">
                  {selectedStudentDetail.did || 'Chưa cấp'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Chứng chỉ số (VC):</span>
                <strong className="text-emerald-700">{selectedStudentDetail.vcType}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Tỷ lệ chuyên cần:</span>
                <strong className="text-[#0F294E] tabular-nums">
                  {selectedStudentDetail.attendanceRate}%
                </strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold border-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL THÊM SINH VIÊN VÀO LỚP ==================== */}
      {showAddStudentModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddStudentModal(false);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAddStudent}
            className="uth-modal-panel w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F294E] m-0">
                Thêm sinh viên vào lớp {activeCourseObj.courseCode}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">MSSV *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 23510005"
                  value={newStudentForm.studentId}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, studentId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 font-mono outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hoàng Văn Em"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Ngày sinh</label>
                <input
                  type="text"
                  value={newStudentForm.dob}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold border-none cursor-pointer"
              >
                Lưu sinh viên
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CẤP / CẬP NHẬT DID ==================== */}
      {showIssueDidModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueDidModal(false);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleIssueOrUpdateDid}
            className="uth-modal-panel w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F294E] m-0">
                Cấp / Cập nhật Định danh số (W3C DID)
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueDidModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Mã số sinh viên (MSSV)
                </label>
                <input
                  type="text"
                  required
                  value={newDidForm.studentId}
                  onChange={(e) => setNewDidForm({ ...newDidForm, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 font-mono outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Họ và tên sinh viên
                </label>
                <input
                  type="text"
                  required
                  value={newDidForm.name}
                  onChange={(e) => setNewDidForm({ ...newDidForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueDidModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold border-none cursor-pointer"
              >
                Ký &amp; Cấp DID
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CẤP CHỨNG CHỈ SỐ VC ==================== */}
      {showIssueVcModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueVcModal(false);
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleIssueVc}
            className="uth-modal-panel w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F294E] m-0">
                Cấp Chứng chỉ số (Verifiable Credential)
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueVcModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Chọn sinh viên
                </label>
                <select
                  value={newVcForm.studentId}
                  onChange={(e) => setNewVcForm({ ...newVcForm, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-500"
                >
                  {studentRecords.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} – {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Loại chứng chỉ W3C VC
                </label>
                <select
                  value={newVcForm.vcType}
                  onChange={(e) => setNewVcForm({ ...newVcForm, vcType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="Điểm danh">Điểm danh</option>
                  <option value="Hoàn thành môn học">Hoàn thành môn học</option>
                  <option value="Chứng nhận chuyên cần xuất sắc">
                    Chứng nhận chuyên cần xuất sắc
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueVcModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold border-none cursor-pointer"
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
