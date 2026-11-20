import React, { useState } from 'react';
import {
  Home,
  Users,
  IdCard,
  Award,
  Fingerprint,
  GitBranch,
  Box,
  FileText,
  BarChart3,
  Settings,
  Bell,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Trash2,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const OVERVIEW_7D_SERIES = [
  { day: 'T2', users: 7200, did: 5800, vc: 3600 },
  { day: 'T3', users: 8100, did: 6400, vc: 4100 },
  { day: 'T4', users: 8800, did: 6900, vc: 4500 },
  { day: 'T5', users: 9500, did: 7400, vc: 5100 },
  { day: 'T6', users: 10200, did: 7900, vc: 5600 },
  { day: 'T7', users: 11300, did: 8600, vc: 6200 },
  { day: 'CN', users: 12100, did: 9300, vc: 6800 }
];

const INITIAL_USERS = [
  {
    code: '23510001',
    name: 'Nguyễn Văn An',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: 'an.nv@uth.edu.vn',
    status: 'ACTIVE',
    did: 'did:uth:7f3e...9a22',
    didDate: '19/11/2026'
  },
  {
    code: 'GV00123',
    name: 'Trần Thị Mai',
    role: 'Giảng viên',
    roleKey: 'FACULTY',
    email: 'mai.tt@uth.edu.vn',
    status: 'ACTIVE',
    did: 'did:uth:4c1b...8d0f',
    didDate: '19/11/2026'
  },
  {
    code: 'AD00001',
    name: 'Phạm Quốc Bảo',
    role: 'Quản trị viên',
    roleKey: 'ADMIN',
    email: 'bao.pq@uth.edu.vn',
    status: 'ACTIVE',
    did: 'did:uth:9d2a...e71c',
    didDate: '19/11/2026'
  },
  {
    code: '23510002',
    name: 'Lê Minh Cường',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: 'cuong.lm@uth.edu.vn',
    status: 'LOCKED',
    did: 'did:uth:8b4f...c91f',
    didDate: '18/11/2026'
  },
  {
    code: '2251120000',
    name: 'Nguyễn Đức Hiển',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: '2251120000@ut.edu.vn',
    status: 'ACTIVE',
    did: 'did:uth:91fe...ed1d',
    didDate: '18/11/2026'
  }
];

const INITIAL_VC_LIST = [
  {
    vcId: 'VC-0008457',
    studentId: '23510001',
    recipient: 'Nguyễn Văn An',
    type: 'Điểm danh',
    date: '19/11/2026',
    status: 'ISSUED'
  },
  {
    vcId: 'VC-0008456',
    studentId: '23510002',
    recipient: 'Trần Thị Bình',
    type: 'Hoàn thành môn học',
    date: '15/11/2026',
    status: 'ISSUED'
  },
  {
    vcId: 'VC-0008455',
    studentId: '23510003',
    recipient: 'Lê Minh Cường',
    type: 'Điểm danh',
    date: '19/11/2026',
    status: 'ISSUED'
  },
  {
    vcId: 'VC-0008454',
    studentId: '23510004',
    recipient: 'Phạm Thị Duyên',
    type: 'Điểm danh',
    date: '19/11/2026',
    status: 'PENDING'
  },
  {
    vcId: 'VC-0008453',
    studentId: '2251120002',
    recipient: 'Trần Thị Mai',
    type: 'Hoàn thành môn học',
    date: '14/11/2026',
    status: 'REVOKED'
  }
];

const WEBAUTHN_DEVICES = [
  {
    id: 'DEV-01',
    studentId: '23510001',
    user: 'Nguyễn Văn An',
    device: 'Xiaomi 13',
    aaguid: 'a1b2...9fbe',
    date: '18/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'DEV-02',
    studentId: '23510002',
    user: 'Trần Thị Bình',
    device: 'iPhone 15',
    aaguid: '8c3d...e721',
    date: '17/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'DEV-03',
    studentId: '23510003',
    user: 'Lê Minh Cường',
    device: 'Laptop Windows',
    aaguid: 'd9f1...b412',
    date: '14/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'DEV-04',
    studentId: '2251120000',
    user: 'Nguyễn Đức Hiển',
    device: 'iPhone 15 Pro • FaceID',
    aaguid: 'f04a...11c8',
    date: '15/11/2026',
    status: 'ACTIVE'
  }
];

const INITIAL_MERKLE_BATCHES = [
  {
    batchId: 'MT-20261118-001',
    dataType: 'Điểm danh',
    root: '0x8f4e2c9b...d7a1',
    records: '3.456',
    time: '18/11/2026 14:20',
    status: 'COMPLETED'
  },
  {
    batchId: 'MT-20261117-001',
    dataType: 'Điểm danh & VC',
    root: '0x7d4e8a1c...e921',
    records: '2.918',
    time: '17/11/2026 17:45',
    status: 'COMPLETED'
  },
  {
    batchId: 'MT-20261116-001',
    dataType: 'Định danh DID',
    root: '0x5b9d12f0...a2a7',
    records: '1.840',
    time: '16/11/2026 16:30',
    status: 'COMPLETED'
  }
];

const BLOCKCHAIN_TXS = [
  {
    txHash: '0x8f4e2c9b...d7a1',
    type: 'Neo Merkle Root',
    block: '#543.210',
    time: '18/11/2026 14:20',
    status: 'SUCCESS'
  },
  {
    txHash: '0x2a9d1e7f...c3b0',
    type: 'Cấp VC',
    block: '#543.208',
    time: '18/11/2026 14:15',
    status: 'SUCCESS'
  },
  {
    txHash: '0x5c7e9b1a...f8d4',
    type: 'Cập nhật DID',
    block: '#543.205',
    time: '18/11/2026 14:10',
    status: 'SUCCESS'
  }
];

const SYSTEM_AUDIT_ROWS = [
  {
    id: 'LOG-01',
    time: '18/11/2026 14:28',
    user: 'SV23510001',
    action: 'Cấp VC cho sinh viên',
    category: 'VC',
    result: 'SUCCESS'
  },
  {
    id: 'LOG-02',
    time: '18/11/2026 14:25',
    user: 'AD00001',
    action: 'Đăng ký DID mới',
    category: 'DID',
    result: 'SUCCESS'
  },
  {
    id: 'LOG-03',
    time: '18/11/2026 14:20',
    user: 'GV00123',
    action: 'Tạo phiên điểm danh',
    category: 'ATTENDANCE',
    result: 'SUCCESS'
  },
  {
    id: 'LOG-04',
    time: '18/11/2026 14:15',
    user: 'AD00001',
    action: 'Cập nhật cấu hình hệ thống',
    category: 'SYSTEM',
    result: 'SUCCESS'
  }
];

const DAILY_VC_BARS = [
  { day: 'T2', value: 4200 },
  { day: 'T3', value: 5100 },
  { day: 'T4', value: 5300 },
  { day: 'T5', value: 6400 },
  { day: 'T6', value: 6500 },
  { day: 'T7', value: 5800 },
  { day: 'CN', value: 6900 }
];

export default function AdminPortalView({
  adminStats,
  adminStatusMsg,
  setAdminStatusMsg,
  batchJson,
  handleAdminIssueMerkleBatch,
  selectedMerkleLeafIdx,
  setSelectedMerkleLeafIdx,
  revokeAddressInput,
  setRevokeAddressInput,
  handleAdminRevokeWallet,
  handleAdminUnrevokeWallet,
  deviceStatusFilter,
  setDeviceStatusFilter,
  securityAlerts,
  fetchAdminAuditLogs,
  handleExportAuditLogsCSV,
  handleSimulateAttack,
  simulatingAttack,
  handleQuickSwitchAccount,
  handleLogout,
  defaultEnrolledRoster,
  presetBatchWallets
}) {
  // 10 Mục Sidebar Quản trị hệ thống đồng bộ ảnh mẫu
  const [activeMenu, setActiveMenu] = useState('HOME');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // State Màn hình 2: Quản lý người dùng
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    code: '',
    name: '',
    roleKey: 'STUDENT',
    email: ''
  });

  // State Màn hình 3: Quản lý DID
  const [didSearch, setDidSearch] = useState('');
  const [didRoleFilter, setDidRoleFilter] = useState('ALL');
  const [showAddDidModal, setShowAddDidModal] = useState(false);

  // State Màn hình 4: Chứng chỉ số (VC)
  const [vcList, setVcList] = useState(INITIAL_VC_LIST);
  const [vcSubTab, setVcSubTab] = useState('ISSUED'); // 'ISSUED' | 'PENDING' | 'REVOKED'
  const [vcSearch, setVcSearch] = useState('');

  // State Màn hình 5: WebAuthn (Passkey)
  const [webAuthnSubTab, setWebAuthnSubTab] = useState('DEVICES'); // 'DEVICES' | 'POLICY'
  const [webAuthnSearch, setWebAuthnSearch] = useState('');
  const [webAuthnPolicies, setWebAuthnPolicies] = useState({
    requireUserVerification: true,
    hardwareAttestation: true,
    allowRoamingKeys: true,
    strictOriginBinding: true
  });

  // State Màn hình 6: Merkle Tree
  const [merkleBatches, setMerkleBatches] = useState(INITIAL_MERKLE_BATCHES);

  // State Màn hình 7: Blockchain
  const [blockchainSubTab, setBlockchainSubTab] = useState('TX'); // 'TX' | 'BLOCKS' | 'CONTRACTS'
  const [txSearch, setTxSearch] = useState('');

  // State Màn hình 8: Nhật ký & Giám sát
  const [auditSubTab, setAuditSubTab] = useState('ACTIVITY'); // 'ACTIVITY' | 'SERVICES'
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('ALL');
  const [auditTimeRange, setAuditTimeRange] = useState('7D');
  const [auditQuery, setAuditQuery] = useState('');

  // State Màn hình 9: Báo cáo & Thống kê
  const [reportSubTab, setReportSubTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'USERS' | 'DID' | 'VC' | 'ATTENDANCE'

  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 4000);
  };

  let parsedBatchAll = [];
  try {
    const arr = JSON.parse(batchJson);
    if (Array.isArray(arr)) parsedBatchAll = arr;
  } catch {
    parsedBatchAll = [];
  }

  const activeLeafIdx = Math.min(3, Math.max(0, selectedMerkleLeafIdx || 0));
  const rootDisplay = adminStats?.merkleRoot
    ? `${adminStats.merkleRoot.slice(0, 10)}...${adminStats.merkleRoot.slice(-4)}`
    : '8f4e2c9b...d7a1';

  // Đồng bộ danh bạ thiết bị mặc định từ props
  const directoryCount =
    (defaultEnrolledRoster || []).length + (presetBatchWallets || []).length;

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.code.trim() || !newUserForm.name.trim()) return;
    const roleLabel =
      newUserForm.roleKey === 'FACULTY'
        ? 'Giảng viên'
        : newUserForm.roleKey === 'ADMIN'
          ? 'Quản trị viên'
          : 'Sinh viên';
    const randomDid = `did:uth:${Math.random().toString(16).slice(2, 6)}...${Math.random()
      .toString(16)
      .slice(2, 6)}`;
    setUsersList((prev) => [
      {
        code: newUserForm.code.trim(),
        name: newUserForm.name.trim(),
        role: roleLabel,
        roleKey: newUserForm.roleKey,
        email:
          newUserForm.email.trim() || `${newUserForm.code.trim().toLowerCase()}@uth.edu.vn`,
        status: 'ACTIVE',
        did: randomDid,
        didDate: '19/11/2026'
      },
      ...prev
    ]);
    setNewUserForm({ code: '', name: '', roleKey: 'STUDENT', email: '' });
    setShowAddUserModal(false);
    setShowAddDidModal(false);
    triggerToast(`✓ Đã tạo tài khoản & cấp định danh ${randomDid} thành công`);
  };

  const handleDownloadVcFile = (vc) => {
    const payload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:${vc.vcId}`,
      type: ['VerifiableCredential', vc.type],
      issuer: 'did:uth:root:university-authority',
      issuanceDate: vc.date,
      credentialSubject: {
        id: `did:uth:${vc.studentId}`,
        recipientName: vc.recipient,
        credentialType: vc.type,
        status: vc.status
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vc.vcId}.json`;
    a.click();
    triggerToast(`✓ Đã tải xuống chứng chỉ số ${vc.vcId}`);
  };

  // Tọa độ biểu đồ 3 đường Trang chủ Admin phóng to vừa khít khung viewBox 560x255 (0 -> 15K, y: 218 -> 22)
  const mapY15K = (val) => 218 - (val / 15000) * 196;
  const lineUsersD = OVERVIEW_7D_SERIES.map(
    (d, i) => `${i === 0 ? 'M' : 'L'} ${68 + i * 78} ${mapY15K(d.users).toFixed(1)}`
  ).join(' ');
  const lineUsersAreaD = `${lineUsersD} L ${68 + (OVERVIEW_7D_SERIES.length - 1) * 78} 218 L 68 218 Z`;
  const lineDidD = OVERVIEW_7D_SERIES.map(
    (d, i) => `${i === 0 ? 'M' : 'L'} ${68 + i * 78} ${mapY15K(d.did).toFixed(1)}`
  ).join(' ');
  const lineVcD = OVERVIEW_7D_SERIES.map(
    (d, i) => `${i === 0 ? 'M' : 'L'} ${68 + i * 78} ${mapY15K(d.vc).toFixed(1)}`
  ).join(' ');

  const sidebarItems = [
    { id: 'HOME', label: 'Trang chủ', icon: <Home className="w-[18px] h-[18px] shrink-0" /> },
    {
      id: 'USERS',
      label: 'Quản lý người dùng',
      icon: <Users className="w-[18px] h-[18px] shrink-0" />
    },
    { id: 'DID', label: 'Quản lý DID', icon: <IdCard className="w-[18px] h-[18px] shrink-0" /> },
    { id: 'VC', label: 'Quản lý VC', icon: <Award className="w-[18px] h-[18px] shrink-0" /> },
    {
      id: 'WEBAUTHN',
      label: 'WebAuthn (Passkey)',
      icon: <Fingerprint className="w-[18px] h-[18px] shrink-0" />
    },
    {
      id: 'MERKLE',
      label: 'Merkle Tree',
      icon: <GitBranch className="w-[18px] h-[18px] shrink-0" />
    },
    { id: 'BLOCKCHAIN', label: 'Blockchain', icon: <Box className="w-[18px] h-[18px] shrink-0" /> },
    {
      id: 'AUDIT',
      label: 'Nhật ký & Giám sát',
      icon: <FileText className="w-[18px] h-[18px] shrink-0" />
    },
    {
      id: 'REPORTS',
      label: 'Báo cáo & Thống kê',
      icon: <BarChart3 className="w-[18px] h-[18px] shrink-0" />
    },
    {
      id: 'SETTINGS',
      label: 'Cấu hình hệ thống',
      icon: <Settings className="w-[18px] h-[18px] shrink-0" />
    }
  ];

  const latestMerkle = merkleBatches[0] || INITIAL_MERKLE_BATCHES[0];

  return (
    <div className="uth-light-portal min-h-screen w-full bg-[#F3F6FB] text-slate-800 font-sans flex flex-col lg:flex-row antialiased">
      {/* ==================== SIDEBAR TRÁI XANH NAVY UTH (10 MỤC QUẢN TRỊ) ==================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'lg:w-[82px]' : 'lg:w-[258px] xl:w-[268px]'
        } w-full shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gradient-to-b from-[#16345E] via-[#173663] to-[#12294D] text-white flex flex-col justify-between relative overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] z-30 shadow-xl`}
      >
        {/* Hình bóng mờ tòa nhà UTH ở chân Sidebar đồng bộ Cổng Giảng viên */}
        <div
          className="hidden lg:block absolute inset-x-0 bottom-0 h-44 pointer-events-none opacity-20 bg-cover bg-bottom"
          style={{
            backgroundImage: "url('/uth-campus-banner.jpg')",
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col min-h-0 flex-1">
          {/* Logo Thương hiệu Chính thức UTH */}
          <div
            onClick={() => setActiveMenu('HOME')}
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
                    Admin Portal
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-[#1ECAD3]">UTH</span>
              </div>
            )}
          </div>

          {/* 10 Mục Sidebar có cuộn độc lập mượt mà trên mọi độ cao màn hình */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto p-3 flex-1">
            {sidebarItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => setActiveMenu(item.id)}
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

        {/* Trạng thái Node Blockchain ở chân Sidebar */}
        {!sidebarCollapsed && (
          <div className="hidden lg:flex relative z-10 mx-3.5 mb-3.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 backdrop-blur-sm items-center justify-between text-xs">
            <span className="text-sky-100 font-medium">
              Blockchain Node ({directoryCount || 10})
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        )}
      </aside>

      {/* ==================== CỘT PHẢI: TOPBAR SÁNG + 10 MÀN HÌNH QUẢN TRỊ ==================== */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* TOPBAR TRẮNG SÁNG ĐỒNG BỘ 100% VỚI CỔNG GIẢNG VIÊN */}
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
                    setUserSearch(globalSearch);
                    setActiveMenu('USERS');
                  }
                }}
                placeholder="Tìm kiếm người dùng, lớp học, mã DID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F1F5F9] border border-slate-200/80 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMenu('AUDIT')}
              title="Nhật ký & cảnh báo bảo mật"
              className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[11px] font-bold text-white flex items-center justify-center tabular-nums">
                {Math.max(3, (securityAlerts || []).length)}
              </span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#16345E] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  Admin UTH
                </div>
                <div className="text-xs text-slate-500 leading-tight mt-0.5">
                  Quản trị viên
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleQuickSwitchAccount && handleQuickSwitchAccount('giangvien@uth.edu.vn')
              }
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              ⇄ Cổng Giảng Viên
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* VÙNG NỘI DUNG CHÍNH */}
        <main className="flex-1 min-w-0 w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
          {(toastMsg || adminStatusMsg) && (
            <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium flex items-center justify-between gap-3 uth-toast-enter shadow-xs">
              <span>{toastMsg || adminStatusMsg}</span>
              <button
                type="button"
                onClick={() => {
                  setToastMsg('');
                  if (setAdminStatusMsg) setAdminStatusMsg('');
                }}
                className="text-blue-500 hover:text-blue-800 bg-transparent border-none cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 1: BẢNG ĐIỀU KHIỂN QUẢN TRỊ HỆ THỐNG (ĐÚNG CHUẨN Ô 1)
             ========================================================================= */}
          {activeMenu === 'HOME' && (
            <div className="flex flex-col gap-6 uth-page-enter">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-[26px] font-bold text-[#0F294E] m-0">
                    Bảng điều khiển quản trị hệ thống
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 mb-0">
                    Tổng quan hoạt động và trạng thái hệ thống UTH-TrustID
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Hệ thống hoạt động tốt</span>
                </span>
              </div>

              {/* 4 Thẻ KPI Pastel: 12.548 Người dùng | 12.548 DID | 26.937 VC | 184.731 Giao dịch Blockchain */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setActiveMenu('USERS')}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Tổng người dùng</div>
                    <div className="text-2xl sm:text-[26px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      12.548
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-0.5 tabular-nums">
                      ↑ 6,2%
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('DID')}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">DID đã cấp</div>
                    <div className="text-2xl sm:text-[26px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      12.548
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-0.5 tabular-nums">
                      ↑ 5,1%
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('VC')}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Chứng chỉ số (VC)</div>
                    <div className="text-2xl sm:text-[26px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      26.937
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-0.5 tabular-nums">
                      ↑ 8,7%
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('BLOCKCHAIN')}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 uth-card-lift flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Giao dịch Blockchain</div>
                    <div className="text-2xl sm:text-[26px] font-bold text-[#0F294E] leading-tight mt-0.5 tabular-nums">
                      184.731
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-0.5 tabular-nums">
                      ↑ 12,3%
                    </div>
                  </div>
                </div>
              </section>

              {/* Hàng giữa: Tổng quan hệ thống (Biểu đồ 3 đường 7 cột) + Trạng thái dịch vụ (5 cột) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Tổng quan hệ thống
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full bg-[#2563EB]" />
                        <span>Người dùng</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full bg-[#7C3AED]" />
                        <span>DID</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full bg-[#10B981]" />
                        <span>VC</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex-1 flex items-center pt-2">
                    <svg className="w-full h-[270px] sm:h-[300px] overflow-visible" viewBox="0 0 560 255">
                      <defs>
                        <linearGradient id="adminUsersArea" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {[
                        { y: 22, label: '15K' },
                        { y: 87.3, label: '10K' },
                        { y: 152.6, label: '5K' },
                        { y: 218, label: '0' }
                      ].map((row) => (
                        <g key={row.label}>
                          <text x="0" y={row.y + 4} fill="#64748B" fontSize="13" fontWeight="500">
                            {row.label}
                          </text>
                          <line
                            x1="44"
                            y1={row.y}
                            x2="548"
                            y2={row.y}
                            stroke="#E2E8F0"
                            strokeWidth="1.2"
                          />
                        </g>
                      ))}

                      <path d={lineUsersAreaD} fill="url(#adminUsersArea)" />

                      <path
                        d={lineUsersD}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="uth-line-draw"
                      />
                      <path
                        d={lineDidD}
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="uth-line-draw"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <path
                        d={lineVcD}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="uth-line-draw"
                        style={{ animationDelay: '0.2s' }}
                      />

                      {OVERVIEW_7D_SERIES.map((d, i) => {
                        const x = 68 + i * 78;
                        return (
                          <g key={d.day}>
                            <circle cx={x} cy={mapY15K(d.users)} r="5" fill="#2563EB" stroke="#FFF" strokeWidth="2" />
                            <circle cx={x} cy={mapY15K(d.did)} r="5" fill="#7C3AED" stroke="#FFF" strokeWidth="2" />
                            <circle cx={x} cy={mapY15K(d.vc)} r="5" fill="#10B981" stroke="#FFF" strokeWidth="2" />
                            <text x={x} y="244" textAnchor="middle" fill="#475569" fontSize="13.5" fontWeight="600">
                              {d.day}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                    Trạng thái dịch vụ
                  </h2>

                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {[
                      { label: 'DID Service', target: 'DID' },
                      { label: 'WebAuthn', target: 'WEBAUTHN' },
                      { label: 'Merkle Tree', target: 'MERKLE' },
                      { label: 'Blockchain', target: 'BLOCKCHAIN' }
                    ].map((svc) => (
                      <div
                        key={svc.label}
                        onClick={() => setActiveMenu(svc.target)}
                        className="p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-blue-50/60 border border-slate-200/75 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span className="text-sm font-semibold text-slate-800">{svc.label}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                          Hoạt động
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Hàng tóm tắt hoạt động gần đây & cảnh báo bảo mật */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0F294E] m-0">Hoạt động gần đây</h3>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('AUDIT')}
                      className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 bg-transparent border-none cursor-pointer"
                    >
                      Xem nhật ký →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {SYSTEM_AUDIT_ROWS.map((row) => (
                      <div key={row.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">{row.action}</span>
                          <span className="text-xs text-slate-400 font-mono ml-2">({row.user})</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 shrink-0">{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0F294E] m-0">Cảnh báo bảo mật SOC</h3>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('AUDIT')}
                      className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 bg-transparent border-none cursor-pointer"
                    >
                      Kiểm thử IDS →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-amber-900 truncate">
                          3 lượt quét QR hết hạn bị chặn (403)
                        </div>
                        <div className="text-xs text-amber-700/80">18/11/2026 14:18</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-emerald-900 truncate">
                          Merkle Root đã đồng bộ on-chain
                        </div>
                        <div className="text-xs font-mono text-emerald-700/80 truncate">{rootDisplay}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 2: QUẢN LÝ NGƯỜI DÙNG (ĐÚNG CHUẨN Ô 2)
             ========================================================================= */}
          {activeMenu === 'USERS' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Quản lý người dùng</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Quản lý tài khoản và phân quyền trong hệ thống
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-end gap-3 flex-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Vai trò</label>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="STUDENT">Sinh viên</option>
                        <option value="FACULTY">Giảng viên</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Trạng thái</label>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="LOCKED">Khóa</option>
                      </select>
                    </div>

                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Tìm kiếm theo MSSV, họ tên, email..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm người dùng</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                        <th className="py-3.5 px-4 font-semibold">STT</th>
                        <th className="py-3.5 px-4 font-semibold">MSSV / ID</th>
                        <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                        <th className="py-3.5 px-4 font-semibold">Vai trò</th>
                        <th className="py-3.5 px-4 font-semibold">Email</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList
                        .filter((u) => {
                          if (userRoleFilter !== 'ALL' && u.roleKey !== userRoleFilter) return false;
                          if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
                          const q = userSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            u.code.toLowerCase().includes(q) ||
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        })
                        .map((u, idx) => (
                          <tr key={u.code} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {u.code}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {u.name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{u.role}</td>
                            <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-rose-50 border-rose-200 text-rose-600'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  title="Chỉnh sửa hồ sơ"
                                  onClick={() =>
                                    triggerToast(`Đang chỉnh sửa tài khoản ${u.name} (${u.code})`)
                                  }
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                  onClick={() =>
                                    setUsersList((prev) =>
                                      prev.map((item) =>
                                        item.code === u.code
                                          ? {
                                              ...item,
                                              status: item.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border-none cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
                    <span>/ 12.548 người dùng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
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
                    <button type="button" className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 3: QUẢN LÝ DID (ĐÚNG CHUẨN Ô 3 + THU HỒI KHÓA SMART CONTRACT O(1))
             ========================================================================= */}
          {activeMenu === 'DID' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Quản lý DID</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Quản lý định danh phi tập trung (Decentralized Identifier)
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-end gap-3 flex-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Vai trò</label>
                      <select
                        value={didRoleFilter}
                        onChange={(e) => setDidRoleFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="STUDENT">Sinh viên</option>
                        <option value="FACULTY">Giảng viên</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Trạng thái</label>
                      <select
                        value={deviceStatusFilter}
                        onChange={(e) => setDeviceStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Đã cấp</option>
                        <option value="REVOKED">Đã thu hồi</option>
                      </select>
                    </div>

                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={didSearch}
                        onChange={(e) => setDidSearch(e.target.value)}
                        placeholder="Tìm kiếm theo MSSV, DID..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddDidModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp DID</span>
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
                        <th className="py-3.5 px-4 font-semibold">Ngày cấp</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList
                        .filter((u) => {
                          if (didRoleFilter !== 'ALL' && u.roleKey !== didRoleFilter) return false;
                          const q = didSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            u.code.toLowerCase().includes(q) ||
                            u.name.toLowerCase().includes(q) ||
                            u.did.toLowerCase().includes(q)
                          );
                        })
                        .map((u, idx) => (
                          <tr key={u.code} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {u.code}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {u.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {u.did}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {u.didDate}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-rose-50 border-rose-200 text-rose-600'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Đã cấp' : 'Đã thu hồi'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  title="Xem DID Document"
                                  onClick={() =>
                                    triggerToast(`DID Document: ${u.did} (${u.name}) — Hợp lệ trên Smart Contract`)
                                  }
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Thu hồi / Khôi phục DID"
                                  onClick={() =>
                                    setUsersList((prev) =>
                                      prev.map((item) =>
                                        item.code === u.code
                                          ? {
                                              ...item,
                                              status: item.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 border-none cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Khối Thu hồi / Khôi phục khóa thiết bị độc lập O(1) trên Smart Contract */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex-1 min-w-[260px]">
                    <div className="text-xs font-semibold text-slate-600 mb-1.5">
                      Thu hồi / Khôi phục khóa thiết bị độc lập O(1) trên Smart Contract (isRevoked[address]):
                    </div>
                    <input
                      value={revokeAddressInput}
                      onChange={(e) => setRevokeAddressInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdminRevokeWallet()}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold border-none cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Thu hồi khóa (revokeKey)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminUnrevokeWallet()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Khôi phục (unrevokeKey)</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                  <span>Hiển thị 10 / 12.548 DID</span>
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
              MÀN HÌNH 4: CHỨNG CHỈ SỐ (VC) (ĐÚNG CHUẨN Ô 4)
             ========================================================================= */}
          {activeMenu === 'VC' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Chứng chỉ số (VC)</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Quản lý phát hành và thu hồi Verifiable Credential
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
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
                        className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative ${
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
                    onClick={() => {
                      const nextId = `VC-000${Math.floor(8458 + Math.random() * 100)}`;
                      setVcList((prev) => [
                        {
                          vcId: nextId,
                          studentId: '2251120000',
                          recipient: 'Nguyễn Đức Hiển',
                          type: 'Điểm danh',
                          date: '19/11/2026',
                          status: 'ISSUED'
                        },
                        ...prev
                      ]);
                      setVcSubTab('ISSUED');
                      triggerToast(`✓ Đã ký và phát hành chứng chỉ số ${nextId} chuẩn W3C VC`);
                    }}
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
                    placeholder="Tìm theo MSSV, lớp học, loại chứng chỉ..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
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
                        <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vcList
                        .filter((vc) => {
                          if (vc.status !== vcSubTab) return false;
                          const q = vcSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            vc.studentId.toLowerCase().includes(q) ||
                            vc.recipient.toLowerCase().includes(q) ||
                            vc.type.toLowerCase().includes(q)
                          );
                        })
                        .map((vc, idx) => (
                          <tr key={vc.vcId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                              {vc.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {vc.recipient}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{vc.type}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {vc.date}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {vc.status === 'ISSUED' && (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Hợp lệ
                                </span>
                              )}
                              {vc.status === 'PENDING' && (
                                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                                  Chờ cấp
                                </span>
                              )}
                              {vc.status === 'REVOKED' && (
                                <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                                  Đã thu hồi
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadVcFile(vc)}
                                  title="Tải W3C VC (.json)"
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border-none cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Thu hồi / Kích hoạt lại"
                                  onClick={() =>
                                    setVcList((prev) =>
                                      prev.map((item) =>
                                        item.vcId === vc.vcId
                                          ? {
                                              ...item,
                                              status: item.status === 'ISSUED' ? 'REVOKED' : 'ISSUED'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 border-none cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                  <span>Hiển thị 10 / 26.937 chứng chỉ</span>
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
              MÀN HÌNH 5: WEBAUTHN (PASSKEY) (ĐÚNG CHUẨN Ô 5)
             ========================================================================= */}
          {activeMenu === 'WEBAUTHN' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">WebAuthn (Passkey)</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Quản lý thiết bị và khóa xác thực của người dùng
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
                  <div className="flex items-center gap-6">
                    {[
                      { id: 'DEVICES', label: 'Thiết bị đã đăng ký' },
                      { id: 'POLICY', label: 'Chính sách xác thực' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setWebAuthnSubTab(tab.id)}
                        className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative ${
                          webAuthnSubTab === tab.id
                            ? 'text-[#2563EB]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {webAuthnSubTab === tab.id && (
                          <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-[#2563EB]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setWebAuthnSubTab('POLICY');
                      triggerToast('Đang mở cấu hình Chính sách xác thực WebAuthn FIDO2');
                    }}
                    className="mb-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm chính sách</span>
                  </button>
                </div>

                {webAuthnSubTab === 'DEVICES' ? (
                  <>
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={webAuthnSearch}
                        onChange={(e) => setWebAuthnSearch(e.target.value)}
                        placeholder="Tìm theo MSSV, tên thiết bị..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                            <th className="py-3.5 px-4 font-semibold">STT</th>
                            <th className="py-3.5 px-4 font-semibold">MSSV</th>
                            <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                            <th className="py-3.5 px-4 font-semibold">Thiết bị</th>
                            <th className="py-3.5 px-4 font-semibold">Ngày đăng ký</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {WEBAUTHN_DEVICES.filter((d) => {
                            const q = webAuthnSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              d.studentId.toLowerCase().includes(q) ||
                              d.user.toLowerCase().includes(q) ||
                              d.device.toLowerCase().includes(q)
                            );
                          }).map((d, idx) => (
                            <tr key={d.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                                {d.studentId}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                {d.user}
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                                {d.device}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                                {d.date}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Hoạt động
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                      <span>Hiển thị 10 / 8.421 thiết bị</span>
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
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'requireUserVerification',
                        title: 'Bắt buộc xác thực sinh trắc học (UV = Required)',
                        desc: 'Yêu cầu FaceID, TouchID hoặc Windows Hello PIN cho mọi phiên điểm danh.'
                      },
                      {
                        key: 'hardwareAttestation',
                        title: 'Kiểm chứng chứng thư phần cứng (Direct Attestation)',
                        desc: 'Xác minh AAGUID và chứng chỉ từ TPM / Secure Enclave của thiết bị.'
                      },
                      {
                        key: 'allowRoamingKeys',
                        title: 'Hỗ trợ khóa cứng FIDO2 (YubiKey / NFC)',
                        desc: 'Cho phép giảng viên và quản trị viên đăng nhập bằng khóa bảo mật vật lý.'
                      },
                      {
                        key: 'strictOriginBinding',
                        title: 'Ràng buộc tên miền chống Phishing (RP ID Binding)',
                        desc: 'Chữ ký WebAuthn chỉ có hiệu lực trên đúng tên miền hệ thống UTH-TrustID.'
                      }
                    ].map((pol) => {
                      const enabled = webAuthnPolicies[pol.key];
                      return (
                        <div
                          key={pol.key}
                          className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-[#0F294E]">{pol.title}</div>
                            <div className="text-xs text-slate-500 leading-relaxed">{pol.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWebAuthnPolicies((p) => ({ ...p, [pol.key]: !p[pol.key] }));
                              triggerToast(`✓ Đã cập nhật chính sách: ${pol.title}`);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer shrink-0 ${
                              enabled
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-slate-100 border-slate-300 text-slate-500'
                            }`}
                          >
                            {enabled ? 'Đang bật' : 'Đang tắt'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 6: MERKLE TREE (ĐÚNG CHUẨN Ô 6 — THÔNG TIN CÂY + SƠ ĐỒ PASTEL)
             ========================================================================= */}
          {activeMenu === 'MERKLE' && (
            <div className="space-y-5 uth-page-enter">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F294E] m-0">Merkle Tree</h1>
                  <p className="text-sm text-slate-500 mt-1 mb-0">
                    Quản lý cây Merkle và xác minh tính toàn vẹn dữ liệu
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAdminIssueMerkleBatch();
                    const newId = `MT-20261119-00${merkleBatches.length + 1}`;
                    setMerkleBatches((prev) => [
                      {
                        batchId: newId,
                        dataType: 'Điểm danh',
                        root: rootDisplay,
                        records: String(parsedBatchAll.length || '3.456'),
                        time: '19/11/2026 08:30',
                        status: 'COMPLETED'
                      },
                      ...prev
                    ]);
                    triggerToast(`✓ Đã băm Keccak256 và tạo cây Merkle mới ${newId}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo cây mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Cột trái (5 cột): Thông tin cây Merkle mới nhất */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
                  <h2 className="text-base font-bold text-[#0F294E] m-0 border-b border-slate-100 pb-3">
                    Thông tin cây Merkle mới nhất
                  </h2>

                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="py-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">ID cây</span>
                      <strong className="font-mono text-[#0F294E]">{latestMerkle.batchId}</strong>
                    </div>
                    <div className="py-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Loại dữ liệu</span>
                      <strong className="text-slate-800">{latestMerkle.dataType}</strong>
                    </div>
                    <div className="py-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Số lượng giao dịch</span>
                      <strong className="font-mono text-[#0F294E] tabular-nums">
                        {latestMerkle.records}
                      </strong>
                    </div>
                    <div className="py-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Merkle Root</span>
                      <strong className="font-mono text-[#2563EB]">{rootDisplay}</strong>
                    </div>
                    <div className="py-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Thời gian tạo</span>
                      <strong className="font-mono text-slate-700">{latestMerkle.time}</strong>
                    </div>
                  </div>
                </div>

                {/* Cột phải (7 cột): Sơ đồ Cấu trúc Merkle Tree Pastel (Root -> H1, H2 -> Tx1..Tx4) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-5">
                  <div className="flex flex-col items-center space-y-4 my-auto">
                    {/* Root (Tím nhạt) */}
                    <div className="px-8 py-3 rounded-xl bg-[#EDE9FE] border border-[#C4B5FD] text-center shadow-xs">
                      <div className="text-sm font-bold text-[#4C1D95]">Root</div>
                      <div className="text-xs font-mono text-[#5B21B6] mt-0.5">{rootDisplay}</div>
                    </div>

                    {/* Nhánh nối tầng 1 -> tầng 2 */}
                    <div className="w-3/5 h-5 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-lg" />

                    {/* H1 & H2 (Xanh dương nhạt) */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                      <div
                        className={`p-3 rounded-xl border text-center transition-all ${
                          activeLeafIdx < 2
                            ? 'bg-[#DBEAFE] border-[#3B82F6] shadow-xs'
                            : 'bg-[#EFF6FF] border-[#BFDBFE]'
                        }`}
                      >
                        <div className="text-sm font-bold text-[#1E3A8A]">H1</div>
                        <div className="text-xs font-mono text-blue-700 mt-0.5">3a7d...c1e2</div>
                      </div>
                      <div
                        className={`p-3 rounded-xl border text-center transition-all ${
                          activeLeafIdx >= 2
                            ? 'bg-[#DBEAFE] border-[#3B82F6] shadow-xs'
                            : 'bg-[#EFF6FF] border-[#BFDBFE]'
                        }`}
                      >
                        <div className="text-sm font-bold text-[#1E3A8A]">H2</div>
                        <div className="text-xs font-mono text-blue-700 mt-0.5">9b8e...f4a0</div>
                      </div>
                    </div>

                    {/* Nhánh nối tầng 2 -> tầng 3 */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-md px-6">
                      <div className="h-4 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-md" />
                      <div className="h-4 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-md" />
                    </div>

                    {/* Tx1, Tx2, Tx3, Tx4 */}
                    <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
                      {[
                        { label: 'Tx1', hash: '...a12f' },
                        { label: 'Tx2', hash: '...b7c4' },
                        { label: 'Tx3', hash: '...d9e0' },
                        { label: 'Tx4', hash: '...e3f5' }
                      ].map((tx, idx) => (
                        <button
                          key={tx.label}
                          type="button"
                          onClick={() => setSelectedMerkleLeafIdx(idx)}
                          className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                            activeLeafIdx === idx
                              ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                              : 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0F294E] hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-xs font-bold">{tx.label}</div>
                          <div
                            className={`text-[11px] font-mono mt-0.5 ${
                              activeLeafIdx === idx ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {tx.hash}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Xác minh bằng chứng Merkle Proof O(log2 N) cho lá đang chọn */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-800 font-medium">
                      Merkle Proof cho <strong>Tx{activeLeafIdx + 1}</strong>: Sibling{' '}
                      <span className="font-mono">
                        {activeLeafIdx < 2 ? 'H2 (9b8e...f4a0)' : 'H1 (3a7d...c1e2)'}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Khớp On-Chain Root</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 7: BLOCKCHAIN (ĐÚNG CHUẨN Ô 7 — 3 TAB GIAO DỊCH / KHỐI / SMART CONTRACT)
             ========================================================================= */}
          {activeMenu === 'BLOCKCHAIN' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Blockchain</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Giám sát giao dịch và trạng thái blockchain
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-6 border-b border-slate-200">
                  {[
                    { id: 'TX', label: 'Giao dịch' },
                    { id: 'BLOCKS', label: 'Khối (Block)' },
                    { id: 'CONTRACTS', label: 'Smart Contract' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBlockchainSubTab(tab.id)}
                      className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative ${
                        blockchainSubTab === tab.id
                          ? 'text-[#2563EB]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {blockchainSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-[#2563EB]" />
                      )}
                    </button>
                  ))}
                </div>

                {blockchainSubTab === 'TX' && (
                  <>
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        placeholder="Tìm theo mã giao dịch, hash..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                            <th className="py-3.5 px-4 font-semibold">STT</th>
                            <th className="py-3.5 px-4 font-semibold">Mã giao dịch (Tx Hash)</th>
                            <th className="py-3.5 px-4 font-semibold">Loại giao dịch</th>
                            <th className="py-3.5 px-4 font-semibold">Thời gian</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {BLOCKCHAIN_TXS.filter((tx) => {
                            const q = txSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              tx.txHash.toLowerCase().includes(q) ||
                              tx.type.toLowerCase().includes(q)
                            );
                          }).map((tx, idx) => (
                            <tr key={tx.txHash} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#2563EB] whitespace-nowrap">
                                {tx.txHash}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                {tx.type}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                                {tx.time}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Thành công
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                      <span>Hiển thị 10 / 184.731 giao dịch</span>
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
                  </>
                )}

                {blockchainSubTab === 'BLOCKS' && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                          <th className="py-3.5 px-4 font-semibold">Số khối</th>
                          <th className="py-3.5 px-4 font-semibold">Block Hash</th>
                          <th className="py-3.5 px-4 font-semibold text-center">Số giao dịch</th>
                          <th className="py-3.5 px-4 font-semibold">Validator</th>
                          <th className="py-3.5 px-4 font-semibold text-right">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { num: '#543.210', hash: '0x8f4e...d7a1', txs: 18, validator: 'UTH-Validator-01', time: '18/11/2026 14:20' },
                          { num: '#543.209', hash: '0x7c1b...88d2', txs: 12, validator: 'UTH-Validator-02', time: '18/11/2026 14:15' },
                          { num: '#543.208', hash: '0x4e02...19f7', txs: 24, validator: 'UTH-Validator-01', time: '18/11/2026 14:10' }
                        ].map((blk) => (
                          <tr key={blk.num} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E]">{blk.num}</td>
                            <td className="py-3.5 px-4 font-mono text-[#2563EB]">{blk.hash}</td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-700">{blk.txs}</td>
                            <td className="py-3.5 px-4 text-slate-700">{blk.validator}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600">{blk.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {blockchainSubTab === 'CONTRACTS' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'UTHIdentityRegistry.sol',
                        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                        desc: 'Quản lý W3C DID & ánh xạ khóa công khai thiết bị sinh viên/giảng viên.'
                      },
                      {
                        name: 'MerkleBatchAnchor.sol',
                        address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                        desc: 'Neo Merkle Root Keccak256 theo lô, tiết kiệm 96% chi phí on-chain.'
                      },
                      {
                        name: 'CredentialRevocationO1.sol',
                        address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                        desc: 'Cơ chế thu hồi khóa & chứng chỉ độ phức tạp O(1) tức thời.'
                      }
                    ].map((ct) => (
                      <div key={ct.name} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#0F294E]">{ct.name}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#2563EB] break-all">{ct.address}</div>
                        <p className="text-xs text-slate-600 m-0 leading-relaxed">{ct.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 8: NHẬT KÝ & GIÁM SÁT (ĐÚNG CHUẨN Ô 8 + SOC SIMULATOR)
             ========================================================================= */}
          {activeMenu === 'AUDIT' && (
            <div className="space-y-5 uth-page-enter">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F294E] m-0">Nhật ký &amp; Giám sát</h1>
                  <p className="text-sm text-slate-500 mt-1 mb-0">
                    Theo dõi hoạt động hệ thống và cảnh báo bảo mật
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportAuditLogsCSV}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-[#2563EB]" />
                    <span>Xuất .CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={fetchAdminAuditLogs}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2563EB] text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-6 border-b border-slate-200">
                  {[
                    { id: 'ACTIVITY', label: 'Nhật ký hoạt động' },
                    { id: 'SERVICES', label: 'Giám sát dịch vụ' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAuditSubTab(tab.id)}
                      className={`pb-3 text-sm font-semibold bg-transparent border-none cursor-pointer relative ${
                        auditSubTab === tab.id
                          ? 'text-[#2563EB]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {auditSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-[#2563EB]" />
                      )}
                    </button>
                  ))}
                </div>

                {auditSubTab === 'ACTIVITY' ? (
                  <>
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Loại hoạt động
                        </label>
                        <select
                          value={auditCategoryFilter}
                          onChange={(e) => setAuditCategoryFilter(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                        >
                          <option value="ALL">Tất cả</option>
                          <option value="VC">Chứng chỉ VC</option>
                          <option value="DID">Định danh DID</option>
                          <option value="ATTENDANCE">Điểm danh</option>
                          <option value="SYSTEM">Hệ thống</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Thời gian
                        </label>
                        <select
                          value={auditTimeRange}
                          onChange={(e) => setAuditTimeRange(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 outline-none"
                        >
                          <option value="7D">7 ngày gần nhất</option>
                          <option value="30D">30 ngày gần nhất</option>
                        </select>
                      </div>

                      <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={auditQuery}
                          onChange={(e) => setAuditQuery(e.target.value)}
                          placeholder="Tìm theo người dùng, hành động..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] whitespace-nowrap">
                            <th className="py-3.5 px-4 font-semibold">STT</th>
                            <th className="py-3.5 px-4 font-semibold">Thời gian</th>
                            <th className="py-3.5 px-4 font-semibold">Người dùng</th>
                            <th className="py-3.5 px-4 font-semibold">Hành động</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Kết quả</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {SYSTEM_AUDIT_ROWS.filter((row) => {
                            if (auditCategoryFilter !== 'ALL' && row.category !== auditCategoryFilter)
                              return false;
                            const q = auditQuery.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              row.action.toLowerCase().includes(q) ||
                              row.user.toLowerCase().includes(q)
                            );
                          }).map((row, idx) => (
                            <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                                {row.time}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#0F294E] whitespace-nowrap">
                                {row.user}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-800">
                                {row.action}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                  Thành công
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm text-slate-500">
                      <span>Hiển thị 10 / 2.846 bản ghi</span>
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
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'DID Resolution Service (W3C Core)', uptime: '99,98%', latency: '28 ms', cpu: '14%', mem: '412 MB' },
                      { name: 'WebAuthn FIDO2 Assertion Engine', uptime: '99,99%', latency: '42 ms', cpu: '19%', mem: '368 MB' },
                      { name: 'Merkle Tree Keccak256 Batcher', uptime: '100%', latency: '16 ms', cpu: '8%', mem: '220 MB' },
                      { name: 'Blockchain RPC & Event Listener', uptime: '99,95%', latency: '64 ms', cpu: '22%', mem: '540 MB' }
                    ].map((svc) => (
                      <div key={svc.name} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#0F294E]">{svc.name}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            Hoạt động
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] text-slate-400">Uptime</div>
                            <div className="text-xs font-mono font-semibold text-emerald-600 mt-0.5">{svc.uptime}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] text-slate-400">Độ trễ</div>
                            <div className="text-xs font-mono font-semibold text-[#2563EB] mt-0.5">{svc.latency}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] text-slate-400">CPU</div>
                            <div className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{svc.cpu}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] text-slate-400">RAM</div>
                            <div className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{svc.mem}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Khu vực giả lập kiểm thử 4 lớp phòng vệ SOC IDS */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-rose-800">
                    ⚡ Giả lập kiểm thử 4 lớp phòng vệ SOC IDS (403 Auto-Block):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { type: 'REPLAY_ATTACK', label: 'Test Quét QR Cũ' },
                      { type: 'DEVICE_SPOOFING', label: 'Test Giả Mạo Chữ Ký' },
                      { type: 'PROXY_ATTENDANCE', label: 'Test 1 Máy Điểm Danh Hộ' },
                      { type: 'GEOFENCE_BREACH', label: 'Test Fake GPS Ngoài Vùng' }
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        type="button"
                        disabled={simulatingAttack}
                        onClick={() => handleSimulateAttack(btn.type)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 9: BÁO CÁO & THỐNG KÊ (ĐÚNG CHUẨN Ô 9 — 5 TAB + DONUT 3 MÀU + CỘT VC)
             ========================================================================= */}
          {activeMenu === 'REPORTS' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Báo cáo &amp; Thống kê</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Thống kê và xuất báo cáo hoạt động hệ thống
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-6">
                    {[
                      { id: 'OVERVIEW', label: 'Tổng quan' },
                      { id: 'USERS', label: 'Người dùng' },
                      { id: 'DID', label: 'DID' },
                      { id: 'VC', label: 'VC' },
                      { id: 'ATTENDANCE', label: 'Điểm danh' }
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

                  <button
                    type="button"
                    onClick={handleExportAuditLogsCSV}
                    className="mb-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>

                {/* 2 Biểu đồ chính chuẩn Ô 9 (Phóng to vừa khít khung) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Donut Chart: Tỷ lệ người dùng theo vai trò */}
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col justify-between gap-5">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      Tỷ lệ người dùng theo vai trò
                    </h2>

                    <div className="flex flex-wrap items-center justify-center gap-8 my-auto py-4">
                      <div className="uth-donut-reveal relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="44" fill="transparent" stroke="#E2E8F0" strokeWidth="18" />
                          {/* Sinh viên 88.4% (~244 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#2563EB"
                            strokeWidth="18"
                            strokeDasharray="244 277"
                            strokeDashoffset="0"
                          />
                          {/* Giảng viên 8.1% (~22.4 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#F97316"
                            strokeWidth="18"
                            strokeDasharray="22.4 277"
                            strokeDashoffset="-244"
                          />
                          {/* Quản trị viên 3.5% (~10 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#22C55E"
                            strokeWidth="18"
                            strokeDasharray="10 277"
                            strokeDashoffset="-266.4"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-3xl font-bold text-[#0F294E] tabular-nums">12.548</span>
                          <span className="text-sm text-slate-500 mt-1">Người dùng</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm sm:text-base">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] shrink-0" />
                          <span className="text-slate-600">
                            Sinh viên: <strong className="text-[#0F294E] tabular-nums">88,4%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] shrink-0" />
                          <span className="text-slate-600">
                            Giảng viên: <strong className="text-[#0F294E] tabular-nums">8,1%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] shrink-0" />
                          <span className="text-slate-600">
                            Quản trị viên: <strong className="text-[#0F294E] tabular-nums">3,5%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart: Số lượng VC được cấp (T2..CN) */}
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col justify-between gap-5">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F294E] m-0">
                      {reportSubTab === 'DID'
                        ? 'Số lượng DID được cấp'
                        : reportSubTab === 'ATTENDANCE'
                          ? 'Số lượt điểm danh theo ngày'
                          : 'Số lượng VC được cấp'}
                    </h2>

                    <div className="flex items-stretch gap-4 pt-2 flex-1">
                      <div className="flex flex-col justify-between h-[280px] sm:h-[310px] text-xs sm:text-sm font-medium text-slate-500 pr-2 tabular-nums">
                        <span>8K</span>
                        <span>6K</span>
                        <span>4K</span>
                        <span>2K</span>
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

                        <div className="relative z-10 grid grid-cols-7 gap-3 sm:gap-4">
                          {DAILY_VC_BARS.map((d, idx) => {
                            const hPct = Math.round((d.value / 8000) * 100);
                            return (
                              <div key={d.day} className="flex flex-col items-center group">
                                <div className="w-full max-w-[56px] h-[280px] sm:h-[310px] flex flex-col justify-end items-center">
                                  <span className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 group-hover:text-[#2563EB] tabular-nums">
                                    {(d.value / 1000).toFixed(1).replace('.', ',')}k
                                  </span>
                                  <div
                                    className="uth-bar-grow w-full rounded-t-xl bg-gradient-to-t from-[#1D4ED8] to-[#3B82F6] shadow-xs group-hover:brightness-110"
                                    style={{ height: `${hPct}%`, animationDelay: `${idx * 55}ms` }}
                                  />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-3">
                                  {d.day}
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
              MÀN HÌNH 10: CẤU HÌNH HỆ THỐNG
             ========================================================================= */}
          {activeMenu === 'SETTINGS' && (
            <div className="space-y-5 uth-page-enter">
              <div>
                <h1 className="text-2xl font-bold text-[#0F294E] m-0">Cấu hình hệ thống</h1>
                <p className="text-sm text-slate-500 mt-1 mb-0">
                  Thiết lập chuẩn định danh W3C DID, chính sách WebAuthn FIDO2 và kết nối mạng Blockchain
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="font-bold text-[#0F294E]">Chuẩn Định danh phi tập trung (DID)</div>
                  <div className="text-slate-600 leading-relaxed">
                    W3C DID Core 1.0 • Phương thức{' '}
                    <span className="font-mono text-[#2563EB] font-semibold">did:uth:secp256k1</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="font-bold text-[#0F294E]">Cấu hình WebAuthn &amp; QR Nonce</div>
                  <div className="text-slate-600 leading-relaxed">
                    FIDO2 Hardware Passkey • Chu kỳ xoay Nonce 35 giây • Bán kính Geofence R ≤ 35m
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="font-bold text-[#0F294E]">Chính sách neo dữ liệu Merkle Tree</div>
                  <div className="text-slate-600 leading-relaxed">
                    Thuật toán băm Keccak256 • Tự động gom lô và neo Root on-chain cuối mỗi phiên
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="font-bold text-[#0F294E]">Giám sát phòng vệ SOC IDS</div>
                  <div className="text-slate-600 leading-relaxed">
                    Tự động chặn HTTP 403 đối với QR hết hạn, giả mạo chữ ký, điểm danh hộ và Fake GPS
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== MODAL THÊM NGƯỜI DÙNG / CẤP DID MỚI ==================== */}
      {(showAddUserModal || showAddDidModal) && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddUserModal(false);
              setShowAddDidModal(false);
            }
          }}
          className="uth-modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateUser}
            className="uth-modal-panel w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F294E] m-0">
                {showAddDidModal ? 'Cấp định danh số (DID) mới' : 'Thêm người dùng mới'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setShowAddDidModal(false);
                }}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="MSSV / Mã người dùng (VD: 23510009)"
                value={newUserForm.code}
                onChange={(e) => setNewUserForm({ ...newUserForm, code: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 font-mono outline-none focus:bg-white focus:border-blue-500"
              />
              <input
                type="text"
                required
                placeholder="Họ và tên"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
              <select
                value={newUserForm.roleKey}
                onChange={(e) => setNewUserForm({ ...newUserForm, roleKey: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="STUDENT">Sinh viên</option>
                <option value="FACULTY">Giảng viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
              <input
                type="email"
                placeholder="Email UTH (VD: ten@uth.edu.vn)"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setShowAddDidModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold border-none cursor-pointer"
              >
                Lưu &amp; Cấp DID
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
