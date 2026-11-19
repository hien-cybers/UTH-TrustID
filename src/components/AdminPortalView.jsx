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
  Smartphone,
  Laptop,
  Monitor,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Plus,
  RefreshCw,
  Download,
  Layers,
  Eye,
  Edit3,
  Zap,
  Calendar,
  BookOpen,
  LogOut,
  X
} from 'lucide-react';

const SEVEN_DAY_AUTH_STATS = [
  { date: '12/11', count: 650, rate: 96.4 },
  { date: '13/11', count: 700, rate: 97.1 },
  { date: '14/11', count: 735, rate: 97.8 },
  { date: '15/11', count: 720, rate: 97.4 },
  { date: '16/11', count: 790, rate: 98.4 },
  { date: '17/11', count: 785, rate: 98.5 },
  { date: '18/11', count: 860, rate: 99.1 }
];

const MONTHLY_AUTH_BARS = [
  { month: 'T6', count: 4200, pct: 42 },
  { month: 'T7', count: 5100, pct: 51 },
  { month: 'T8', count: 6100, pct: 61 },
  { month: 'T9', count: 6800, pct: 68 },
  { month: 'T10', count: 8100, pct: 81 },
  { month: 'T11', count: 9200, pct: 92 }
];

const INITIAL_USERS = [
  {
    code: 'SV2310001',
    name: 'Nguyễn Minh Anh',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: 'minh.an@uth.edu.vn',
    did: 'did:uth:7b39...a21c',
    status: 'ACTIVE'
  },
  {
    code: 'SV2310002',
    name: 'Trần Quốc Bảo',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: 'bao.tran@uth.edu.vn',
    did: 'did:uth:3c12...f72e',
    status: 'ACTIVE'
  },
  {
    code: 'GV0012',
    name: 'Lê Thị Hải Yến',
    role: 'Giảng viên',
    roleKey: 'FACULTY',
    email: 'yen.le@uth.edu.vn',
    did: 'did:uth:4a91...e3b5',
    status: 'ACTIVE'
  },
  {
    code: 'GV0013',
    name: 'Phạm Đức Minh',
    role: 'Giảng viên',
    roleKey: 'FACULTY',
    email: 'minh.pham@uth.edu.vn',
    did: 'did:uth:88e0...c91f',
    status: 'ACTIVE'
  },
  {
    code: 'AD0001',
    name: 'Trần Văn Hùng',
    role: 'Quản trị viên',
    roleKey: 'ADMIN',
    email: 'hung.tran@uth.edu.vn',
    did: 'did:uth:root...0001',
    status: 'ACTIVE'
  },
  {
    code: '2251120000',
    name: 'Nguyễn Đức Hiển',
    role: 'Sinh viên',
    roleKey: 'STUDENT',
    email: '2251120000@ut.edu.vn',
    did: 'did:uth:1d9b...ed1d',
    status: 'ACTIVE'
  }
];

const INITIAL_VC_LIST = [
  {
    vcId: 'VC-0008457',
    recipient: 'Nguyễn Minh Anh',
    studentId: 'SV2310001',
    type: 'Thẻ sinh viên số',
    date: '18/11/2026',
    status: 'ACTIVE'
  },
  {
    vcId: 'VC-0008456',
    recipient: 'Trần Quốc Bảo',
    studentId: 'SV2310002',
    type: 'Giấy xác nhận học tập',
    date: '18/11/2026',
    status: 'ACTIVE'
  },
  {
    vcId: 'VC-0008455',
    recipient: 'Lê Thị Hải Yến',
    studentId: 'GV0012',
    type: 'Chứng nhận giảng viên',
    date: '17/11/2026',
    status: 'ACTIVE'
  },
  {
    vcId: 'VC-0008454',
    recipient: 'Phạm Đức Minh',
    studentId: 'GV0013',
    type: 'Xác nhận tham gia',
    date: '17/11/2026',
    status: 'REVOKED'
  }
];

const WEBAUTHN_DEVICES = [
  {
    id: 'wa-1',
    user: 'Nguyễn Minh Anh',
    device: 'Windows Hello',
    deviceType: 'DESKTOP',
    aaguid: 'a1b2...9f0e',
    date: '18/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'wa-2',
    user: 'Trần Quốc Bảo',
    device: 'YubiKey 5',
    deviceType: 'KEY',
    aaguid: '8c3d...e721',
    date: '17/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'wa-3',
    user: 'Lê Thị Hải Yến',
    device: 'Face ID (iOS)',
    deviceType: 'MOBILE',
    aaguid: 'd9f1...b412',
    date: '16/11/2026',
    status: 'ACTIVE'
  },
  {
    id: 'wa-4',
    user: 'Nguyễn Đức Hiển',
    device: 'Touch ID / Secure Enclave',
    deviceType: 'MOBILE',
    aaguid: 'f4a8...ed1d',
    date: '18/11/2026',
    status: 'ACTIVE'
  }
];

const MERKLE_BATCHES = [
  {
    batchId: 'MT-20261118-01',
    root: '0x9a3f...7c21',
    records: '1.248',
    date: '18/11/2026',
    status: 'COMPLETED'
  },
  {
    batchId: 'MT-20261117-01',
    root: '0x7d4e...a891',
    records: '1.235',
    date: '17/11/2026',
    status: 'COMPLETED'
  },
  {
    batchId: 'MT-20261116-01',
    root: '0x5b9d...e2a7',
    records: '1.210',
    date: '16/11/2026',
    status: 'COMPLETED'
  }
];

const BLOCKCHAIN_TXS = [
  {
    txHash: '0x8f3a...e721',
    type: 'Ghi Merkle Root',
    block: '#543.210',
    time: '18/11/2026, 10:24',
    status: 'SUCCESS'
  },
  {
    txHash: '0x4d9c...b137',
    type: 'Cấp chứng chỉ (VC)',
    block: '#543.208',
    time: '18/11/2026, 09:57',
    status: 'SUCCESS'
  },
  {
    txHash: '0xa7e1...c903',
    type: 'Cập nhật DID',
    block: '#543.205',
    time: '17/11/2026, 22:08',
    status: 'SUCCESS'
  },
  {
    txHash: '0x3b06...faf2',
    type: 'Neo Merkle Batch CNTT101',
    block: '#543.199',
    time: '17/11/2026, 18:45',
    status: 'SUCCESS'
  }
];

const SYSTEM_AUDIT_ROWS = [
  {
    id: 'aud-1',
    time: '18/11/2026, 10:24',
    user: 'AD0001',
    action: 'Tạo tài khoản giảng viên',
    target: 'GV0014',
    level: 'INFO'
  },
  {
    id: 'aud-2',
    time: '18/11/2026, 09:57',
    user: 'AD0001',
    action: 'Cấp chứng chỉ số (VC)',
    target: 'SV2310005',
    level: 'SUCCESS'
  },
  {
    id: 'aud-3',
    time: '18/11/2026, 09:12',
    user: 'AD0001',
    action: 'Ghi dữ liệu lên chuỗi',
    target: 'Merkle Root',
    level: 'SUCCESS'
  },
  {
    id: 'aud-4',
    time: '18/11/2026, 08:41',
    user: '–',
    action: 'Đăng nhập bất thường',
    target: 'IP: 172.16.0.9',
    level: 'WARNING'
  },
  {
    id: 'aud-5',
    time: '17/11/2026, 22:08',
    user: 'AD0001',
    action: 'Cập nhật chính sách xác thực',
    target: 'WebAuthn',
    level: 'INFO'
  }
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
  // 10 Mục Sidebar Quản trị hệ thống khớp 100% với bộ 9 màn hình + Cấu hình hệ thống
  const [activeMenu, setActiveMenu] = useState('HOME');
  const [globalSearch, setGlobalSearch] = useState('');

  // State Màn hình 2: Quản lý người dùng
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [userSubTab, setUserSubTab] = useState('ALL'); // 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN'
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    code: '',
    name: '',
    roleKey: 'STUDENT',
    email: ''
  });

  // State Màn hình 3: Quản lý định danh số (DID)
  const [didSearch, setDidSearch] = useState('');
  const [didTypeFilter, setDidTypeFilter] = useState('ALL');
  const [showAddDidModal, setShowAddDidModal] = useState(false);

  // State Màn hình 4: Quản lý chứng chỉ số (VC)
  const [vcList, setVcList] = useState(INITIAL_VC_LIST);
  const [vcSubTab, setVcSubTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'REVOKED'
  const [vcSearch, setVcSearch] = useState('');
  const [vcTypeFilter, setVcTypeFilter] = useState('ALL');

  // State Màn hình 5: Quản trị xác thực WebAuthn
  const [webAuthnSubTab, setWebAuthnSubTab] = useState('DEVICES'); // 'DEVICES' | 'POLICY' | 'LOGS'
  const [webAuthnSearch, setWebAuthnSearch] = useState('');
  const [webAuthnPolicies, setWebAuthnPolicies] = useState({
    requireUserVerification: true,
    hardwareAttestation: true,
    allowRoamingKeys: true,
    strictOriginBinding: true
  });

  // Tọa độ biểu đồ đường tỷ lệ thành công 7 ngày (trục phải 90% -> 100%, y từ 158 -> 18)
  const adminRatePoints = SEVEN_DAY_AUTH_STATS.map((item, idx) => ({
    x: 61 + idx * 54,
    y: 158 - ((item.rate - 90) / 10) * 140,
    rate: item.rate
  }));
  const adminRatePath = adminRatePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y.toFixed(1)}`)
    .join(' ');

  // State Màn hình 6: Quản lý Merkle Tree
  const [merkleSubTab, setMerkleSubTab] = useState('TREE'); // 'TREE' | 'PROOF'
  const [merkleBatches, setMerkleBatches] = useState(MERKLE_BATCHES);

  // State Màn hình 7: Quản lý Blockchain
  const [blockchainSubTab, setBlockchainSubTab] = useState('TX'); // 'TX' | 'BLOCKS' | 'CONTRACTS'
  const [txSearch, setTxSearch] = useState('');

  // State Màn hình 8: Nhật ký & Giám sát
  const [auditSubTab, setAuditSubTab] = useState('ACTIVITY'); // 'ACTIVITY' | 'SERVICES' | 'SECURITY'
  const [auditQuery, setAuditQuery] = useState('');
  const [auditLevelFilter, setAuditLevelFilter] = useState('ALL');

  // State Màn hình 9: Báo cáo & Thống kê
  const [reportSubTab, setReportSubTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'ATTENDANCE' | 'DID_VC' | 'PERFORMANCE'

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
    ? `${adminStats.merkleRoot.slice(0, 8)}...${adminStats.merkleRoot.slice(-4)}`
    : '0x9a3f...7c21';

  const directoryMap = new Map();
  (defaultEnrolledRoster || []).forEach((st, idx) => {
    const addr =
      (presetBatchWallets && presetBatchWallets[idx]) ||
      `0x${String(st.studentId).padEnd(40, '0').slice(0, 40)}`;
    directoryMap.set(String(st.studentId), {
      studentId: st.studentId,
      fullName: st.name,
      major: st.major || 'An toàn Thông tin',
      address: addr
    });
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    const code = newUserForm.code.trim() || `SV2310${Math.floor(100 + Math.random() * 899)}`;
    const roleLabel =
      newUserForm.roleKey === 'ADMIN'
        ? 'Quản trị viên'
        : newUserForm.roleKey === 'FACULTY'
        ? 'Giảng viên'
        : 'Sinh viên';
    const randHex = Math.random().toString(16).substring(2, 6);
    const created = {
      code,
      name: newUserForm.name.trim() || 'Người dùng mới',
      role: roleLabel,
      roleKey: newUserForm.roleKey,
      email: newUserForm.email.trim() || `${code.toLowerCase()}@uth.edu.vn`,
      did: `did:uth:${randHex}...a91c`,
      status: 'ACTIVE'
    };
    setUsersList((prev) => [created, ...prev]);
    setShowAddUserModal(false);
    setNewUserForm({ code: '', name: '', roleKey: 'STUDENT', email: '' });
    triggerToast(`✓ Đã tạo người dùng ${created.name} (${created.code}) kèm định danh ${created.did}`);
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

  return (
    <div
      className="min-h-screen w-full bg-[#070618] text-slate-100 font-sans flex flex-col lg:flex-row antialiased"
      style={{
        background:
          'radial-gradient(circle at 78% 12%, rgba(124, 58, 237, 0.16) 0%, transparent 45%), radial-gradient(circle at 18% 88%, rgba(56, 189, 248, 0.1) 0%, transparent 48%), linear-gradient(180deg, #070618 0%, #0B0920 100%)'
      }}
    >
      {/* ==================== SIDEBAR TRÁI 10 MỤC (STICKY & CUỘN MƯỢT MỌI ĐỘ CAO MÀN HÌNH) ==================== */}
      <aside className="w-full lg:w-[264px] xl:w-[276px] shrink-0 lg:sticky lg:top-0 lg:h-screen border-b lg:border-b-0 lg:border-r border-purple-500/20 bg-[#0B0920]/95 backdrop-blur-xl flex flex-col justify-between z-20">
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo UTH-TrustID Quản trị hệ thống */}
          <div
            onClick={() => setActiveMenu('HOME')}
            className="h-[72px] px-5 border-b border-purple-500/15 flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-purple-300/35 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[19px] font-bold tracking-tight text-white leading-tight truncate">
                UTH-TrustID
              </div>
              <div className="text-xs font-medium text-purple-300 leading-tight mt-0.5 truncate">
                Quản trị hệ thống
              </div>
            </div>
          </div>

          {/* 10 Mục Sidebar có cuộn độc lập — không bao giờ bị cắt mục dưới trên Laptop 768p */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto p-3 sm:p-3.5 flex-1">
            {[
              { id: 'HOME', label: 'Trang chủ', icon: <Home className="w-[18px] h-[18px] shrink-0" /> },
              {
                id: 'USERS',
                label: 'Quản lý người dùng',
                icon: <Users className="w-[18px] h-[18px] shrink-0" />
              },
              {
                id: 'DID',
                label: 'Quản lý định danh (DID)',
                icon: <IdCard className="w-[18px] h-[18px] shrink-0" />
              },
              {
                id: 'VC',
                label: 'Chứng chỉ số (VC)',
                icon: <Award className="w-[18px] h-[18px] shrink-0" />
              },
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
              {
                id: 'BLOCKCHAIN',
                label: 'Blockchain',
                icon: <Box className="w-[18px] h-[18px] shrink-0" />
              },
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
            ].map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMenu(item.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap text-left shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-[0_6px_20px_rgba(124,58,237,0.45)]'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Ảnh thật Tòa nhà Trường Đại học Giao thông Vận tải TP.HCM (UTH) ở chân Sidebar */}
        <div className="hidden lg:block shrink-0 border-t border-purple-500/15 bg-[#0E0A26] p-3.5">
          <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-purple-400/35 shadow-[0_0_24px_rgba(124,58,237,0.28)]">
            <img
              src="/uth-campus-banner.jpg"
              alt="Trường Đại học Giao thông Vận tải TP.HCM"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0924]/95 via-[#130C33]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-center justify-between gap-2">
              <img
                src="/uth-logo.png"
                alt="UTH"
                className="h-4 w-auto object-contain drop-shadow"
              />
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Node Active
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================== CỘT PHẢI: TOPBAR + NỘI DUNG 10 MÀN HÌNH QUẢN TRỊ ==================== */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* TOPBAR TRÊN CÙNG (ĐỒNG BỘ CHIỀU CAO 72px VỚI CỔNG GIẢNG VIÊN) */}
        <header className="sticky top-0 z-30 min-h-[72px] px-4 sm:px-6 lg:px-8 py-3 border-b border-purple-500/15 bg-[#09081C]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Thanh tìm kiếm toàn cục */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
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
              placeholder="Tìm kiếm người dùng, DID, VC..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141130] border border-purple-400/20 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400/70 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveMenu('AUDIT');
                setAuditSubTab('SECURITY');
              }}
              title="Cảnh báo hệ thống"
              className="relative w-10 h-10 rounded-xl bg-[#141130] hover:bg-[#1E1945] border border-purple-400/20 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[11px] font-bold text-white flex items-center justify-center tabular-nums">
                {Math.max(1, (securityAlerts || []).length)}
              </span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A855F7] to-[#6366F1] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-white leading-tight">
                  Admin UTH
                </div>
                <div className="text-xs text-purple-300 leading-tight mt-0.5">
                  Quản trị viên
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleQuickSwitchAccount && handleQuickSwitchAccount('giangvien@uth.edu.vn')
              }
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141130] hover:bg-[#1F1A48] border border-purple-400/25 text-purple-200 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              ⇄ Cổng Giảng Viên
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* VÙNG NỘI DUNG CHÍNH (THOÁNG RỘNG, KHÔNG CẮT TRÀN) */}
        <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {(toastMsg || adminStatusMsg) && (
            <div className="px-4 py-3.5 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-sm font-medium text-purple-100 flex items-center justify-between gap-2 shrink-0 animate-[fadeIn_0.2s_ease-out]">
              <span>{toastMsg || adminStatusMsg}</span>
              <button
                type="button"
                onClick={() => {
                  setToastMsg('');
                  if (setAdminStatusMsg) setAdminStatusMsg('');
                }}
                className="text-slate-300 hover:text-white bg-transparent border-none cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
              MÀN HÌNH 1: TRANG CHỦ – TỔNG QUAN HỆ THỐNG
             ========================================================================= */}
          {activeMenu === 'HOME' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-white m-0">
                  Xin chào, Quản trị viên 👋
                </h1>
                <p className="text-sm text-slate-300 mt-1.5 mb-0">
                  Tổng quan hoạt động hệ thống định danh số &amp; xác thực hiện diện UTH-TrustID
                </p>
              </div>

              {/* 4 Thẻ KPI (12.548 Người dùng | 12.548 DID | 26.937 VC | 98,7% Tỷ lệ xác thực) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setActiveMenu('USERS')}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#2B1460] via-[#1E1145] to-[#130C2E] border border-purple-400/30 shadow-xl flex items-center gap-4 cursor-pointer hover:border-purple-300/60 hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-13 h-13 rounded-2xl bg-purple-500/25 border border-purple-300/40 flex items-center justify-center text-[#C084FC] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-[30px] font-bold text-white leading-none tabular-nums">
                      12.548
                    </div>
                    <div className="text-sm text-slate-200 mt-1.5 font-medium">
                      Tài khoản người dùng
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 tabular-nums">
                      ▲ +3,2% so với tháng trước
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('DID')}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#132962] via-[#101F4C] to-[#0D1638] border border-blue-400/30 shadow-xl flex items-center gap-4 cursor-pointer hover:border-blue-300/60 hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-13 h-13 rounded-2xl bg-blue-500/25 border border-blue-300/40 flex items-center justify-center text-sky-300 shrink-0">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-[30px] font-bold text-white leading-none tabular-nums">
                      12.548
                    </div>
                    <div className="text-sm text-slate-200 mt-1.5 font-medium">
                      Định danh số (DID)
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 tabular-nums">
                      ▲ +3,2% so với tháng trước
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('VC')}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F384C] via-[#0D2B3E] to-[#0A1F2E] border border-teal-400/30 shadow-xl flex items-center gap-4 cursor-pointer hover:border-teal-300/60 hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-13 h-13 rounded-2xl bg-teal-500/25 border border-teal-300/40 flex items-center justify-center text-teal-300 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-[30px] font-bold text-white leading-none tabular-nums">
                      26.937
                    </div>
                    <div className="text-sm text-slate-200 mt-1.5 font-medium">
                      Chứng chỉ số (VC)
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 tabular-nums">
                      ▲ +5,8% so với tháng trước
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMenu('WEBAUTHN')}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#37155E] via-[#281047] to-[#180A2E] border border-fuchsia-400/30 shadow-xl flex items-center gap-4 cursor-pointer hover:border-fuchsia-300/60 hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-13 h-13 rounded-2xl bg-fuchsia-500/25 border border-fuchsia-300/40 flex items-center justify-center text-fuchsia-300 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-[30px] font-bold text-white leading-none tabular-nums">
                      98,7%
                    </div>
                    <div className="text-sm text-slate-200 mt-1.5 font-medium">
                      Tỷ lệ xác thực thành công
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 tabular-nums">
                      ▲ +0,9% so với tháng trước
                    </div>
                  </div>
                </div>
              </section>

              {/* HÀNG GIỮA: KIẾN TRÚC HỆ THỐNG (7 CỘT) + THỐNG KÊ XÁC THỰC HIỆN DIỆN (5 CỘT) */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-xl flex flex-col justify-between gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-white m-0 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#C084FC]" />
                      <span>Kiến trúc hệ thống</span>
                    </h2>
                    <span className="text-xs text-purple-300/90 font-medium">
                      Nhấp vào từng thành phần để mở trang quản trị
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 my-auto py-1">
                    {/* Cột trái: 3 Ứng dụng đầu cuối */}
                    <div className="md:col-span-4 space-y-2.5">
                      {[
                        {
                          title: 'Ứng dụng Sinh viên',
                          sub: 'Mobile App',
                          icon: <Smartphone className="w-5 h-5 text-[#C084FC]" />,
                          target: 'USERS'
                        },
                        {
                          title: 'Web Giảng viên',
                          sub: 'Teacher Portal',
                          icon: <Laptop className="w-5 h-5 text-[#C084FC]" />,
                          target: 'USERS'
                        },
                        {
                          title: 'Web Quản trị',
                          sub: 'Admin Portal',
                          icon: <Monitor className="w-5 h-5 text-[#C084FC]" />,
                          target: 'AUDIT'
                        }
                      ].map((node) => (
                        <div
                          key={node.title}
                          onClick={() => setActiveMenu(node.target)}
                          className="p-3 rounded-2xl bg-[#18133A] hover:bg-[#221B52] border border-purple-400/30 flex items-center gap-3 cursor-pointer transition-all"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-300/30 flex items-center justify-center shrink-0">
                            {node.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white truncate">
                              {node.title}
                            </div>
                            <div className="text-xs text-slate-300/80">{node.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cụm giữa: Mũi tên + Lõi Core Services + Mũi tên */}
                    <div className="md:col-span-4 flex items-center justify-center gap-2 py-2">
                      <ArrowRight className="hidden md:block w-5 h-5 text-purple-400/80 shrink-0" />
                      <div
                        onClick={() => setActiveMenu('BLOCKCHAIN')}
                        className="w-full max-w-[180px] p-4 rounded-2xl bg-gradient-to-b from-[#2A1B6E] to-[#170F3E] border-2 border-purple-400/70 shadow-[0_0_32px_rgba(139,92,246,0.48)] flex flex-col items-center text-center cursor-pointer hover:scale-[1.03] transition-transform"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#4F46E5] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.75)] mb-2.5">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-sm font-bold text-white leading-tight">
                          UTH-TrustID
                        </div>
                        <div className="text-xs text-purple-200 mt-1">
                          Core Services
                        </div>
                      </div>
                      <ArrowRight className="hidden md:block w-5 h-5 text-purple-400/80 shrink-0" />
                    </div>

                    {/* Cột phải: 3 Công nghệ cốt lõi */}
                    <div className="md:col-span-4 space-y-2.5">
                      {[
                        {
                          title: 'W3C DID',
                          sub: 'Định danh phi tập trung',
                          icon: <IdCard className="w-5 h-5 text-[#C084FC]" />,
                          target: 'DID'
                        },
                        {
                          title: 'WebAuthn',
                          sub: 'Xác thực an toàn',
                          icon: <Fingerprint className="w-5 h-5 text-sky-300" />,
                          target: 'WEBAUTHN'
                        },
                        {
                          title: 'Merkle Tree',
                          sub: 'Bảo toàn dữ liệu',
                          icon: <GitBranch className="w-5 h-5 text-emerald-300" />,
                          target: 'MERKLE'
                        }
                      ].map((tech) => (
                        <div
                          key={tech.title}
                          onClick={() => setActiveMenu(tech.target)}
                          className="p-3 rounded-2xl bg-[#18133A] hover:bg-[#221B52] border border-purple-400/30 flex items-center gap-3 cursor-pointer transition-all"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-300/30 flex items-center justify-center shrink-0">
                            {tech.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white truncate">
                              {tech.title}
                            </div>
                            <div className="text-xs text-slate-300/80 truncate">{tech.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Biểu đồ Thống kê xác thực hiện diện (SVG đồng bộ Be Vietnam Pro & khớp số liệu thực) */}
                <div className="xl:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-xl flex flex-col justify-between gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-white m-0 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#C084FC]" />
                      <span>Thống kê xác thực hiện diện</span>
                    </h2>
                    <span className="px-3 py-1 rounded-xl bg-[#181438] border border-purple-400/25 text-xs font-medium text-slate-200">
                      7 ngày gần nhất
                    </span>
                  </div>

                  <div className="my-auto pt-2">
                    <svg className="w-full h-52 overflow-visible" viewBox="0 0 470 188">
                      <defs>
                        <linearGradient id="adminBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#C084FC" />
                          <stop offset="100%" stopColor="#5B21B6" />
                        </linearGradient>
                      </defs>
                      {[
                        { y: 18, left: '1.000', right: '100%' },
                        { y: 46, left: '800', right: '98%' },
                        { y: 74, left: '600', right: '96%' },
                        { y: 102, left: '400', right: '94%' },
                        { y: 130, left: '200', right: '92%' },
                        { y: 158, left: '0', right: '90%' }
                      ].map((r) => (
                        <g key={r.left}>
                          <text x="0" y={r.y + 4} fill="#94A3B8" fontSize="10.5" fontWeight="500">
                            {r.left}
                          </text>
                          <line
                            x1="36"
                            y1={r.y}
                            x2="424"
                            y2={r.y}
                            stroke="rgba(148,163,184,0.16)"
                            strokeDasharray={r.left === '0' ? undefined : '3 3'}
                          />
                          <text x="430" y={r.y + 4} fill="#94A3B8" fontSize="10.5" fontWeight="500">
                            {r.right}
                          </text>
                        </g>
                      ))}
                      {SEVEN_DAY_AUTH_STATS.map((item, idx) => {
                        const x = 48 + idx * 54;
                        const barH = (item.count / 1000) * 140;
                        const barY = 158 - barH;
                        return (
                          <g key={item.date}>
                            <rect x={x} y={barY} width="26" height={barH} rx="5" fill="url(#adminBarGrad)" />
                            <text x={x + 13} y="178" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="500">
                              {item.date}
                            </text>
                          </g>
                        );
                      })}
                      <path
                        d={adminRatePath}
                        fill="none"
                        stroke="#F8FAFC"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {adminRatePoints.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#100D28"
                          stroke="#FFFFFF"
                          strokeWidth="2.4"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-xs text-slate-300 pt-1">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-[3px] bg-[#A855F7]" />
                      <span>Số lượt xác thực</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-white inline-block rounded-full" />
                      <span>Tỷ lệ thành công (%)</span>
                    </span>
                  </div>
                </div>
              </section>

              {/* HÀNG DƯỚI CÙNG: TRẠNG THÁI DỊCH VỤ | HOẠT ĐỘNG GẦN ĐÂY | CẢNH BÁO HỆ THỐNG */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-xl space-y-3">
                  <h3 className="text-base font-bold text-white m-0">
                    Trạng thái dịch vụ
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Dịch vụ định danh (DID)', target: 'DID', icon: <IdCard className="w-4 h-4 text-[#C084FC]" /> },
                      { label: 'Dịch vụ WebAuthn', target: 'WEBAUTHN', icon: <Fingerprint className="w-4 h-4 text-[#C084FC]" /> },
                      { label: 'Dịch vụ Merkle Tree', target: 'MERKLE', icon: <GitBranch className="w-4 h-4 text-[#C084FC]" /> },
                      { label: 'Kết nối Blockchain', target: 'BLOCKCHAIN', icon: <Box className="w-4 h-4 text-[#C084FC]" /> }
                    ].map((svc) => (
                      <div
                        key={svc.label}
                        onClick={() => setActiveMenu(svc.target)}
                        className="p-3 rounded-xl bg-[#171336] hover:bg-[#211B4E] border border-purple-500/15 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                            {svc.icon}
                          </span>
                          <span className="text-sm font-medium text-slate-100 truncate">
                            {svc.label}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold whitespace-nowrap shrink-0">
                          ● Hoạt động
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white m-0">
                      Hoạt động gần đây
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('AUDIT')}
                      className="text-xs font-semibold text-purple-300 hover:text-white bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-purple-500/15">
                    {SYSTEM_AUDIT_ROWS.slice(0, 4).map((act) => (
                      <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {act.action}
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {act.user} • {act.target}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
                          {act.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white m-0">
                      Cảnh báo hệ thống
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu('AUDIT');
                        setAuditSubTab('SECURITY');
                      }}
                      className="text-xs font-semibold text-purple-300 hover:text-white bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">
                          3 tài khoản đăng nhập bất thường
                        </div>
                        <div className="text-xs text-slate-300/80 mt-0.5">18/11/2026, 08:41</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/25 flex items-center gap-3">
                      <Info className="w-5 h-5 text-sky-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">
                          01 phiên điểm danh chưa đồng bộ
                        </div>
                        <div className="text-xs text-slate-300/80 mt-0.5">Lớp CTDL202 – 17/11/2026</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">
                          Hệ thống hoạt động ổn định
                        </div>
                        <div className="text-xs text-slate-300/80 mt-0.5">Không phát hiện lỗi 24h qua</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

            {/* =========================================================================
                MÀN HÌNH 2: QUẢN LÝ NGƯỜI DÙNG (THEO ĐÚNG PANEL 2 TRONG ẢNH)
               ========================================================================= */}
            {activeMenu === 'USERS' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                  Quản lý người dùng
                </h2>

                {/* 4 Tab số lượng người dùng */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'ALL', label: 'Tất cả (12.548)' },
                    { id: 'STUDENT', label: 'Sinh viên (11.892)' },
                    { id: 'FACULTY', label: 'Giảng viên (573)' },
                    { id: 'ADMIN', label: 'Quản trị viên (83)' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setUserSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        userSubTab === tab.id ? 'text-[#C084FC]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {userSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Thanh công cụ tìm kiếm & bộ lọc */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative min-w-[240px] flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Tìm theo mã, họ tên, email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
                      />
                    </div>

                    <select
                      value={userSubTab}
                      onChange={(e) => setUserSubTab(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                    >
                      <option value="ALL">Vai trò</option>
                      <option value="STUDENT">Sinh viên</option>
                      <option value="FACULTY">Giảng viên</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>

                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                    >
                      <option value="ALL">Trạng thái</option>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="LOCKED">Tạm khóa</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none shadow-lg cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm người dùng</span>
                  </button>
                </div>

                {/* Bảng danh sách người dùng */}
                <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                        <th className="p-4 w-10">
                          <input type="checkbox" className="accent-[#8B5CF6]" />
                        </th>
                        <th className="p-4 font-bold">Mã người dùng</th>
                        <th className="p-4 font-bold">Họ và tên</th>
                        <th className="p-4 font-bold">Vai trò</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold text-center">Trạng thái</th>
                        <th className="p-4 font-bold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/15">
                      {usersList
                        .filter((u) => {
                          if (userSubTab !== 'ALL' && u.roleKey !== userSubTab) return false;
                          if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter)
                            return false;
                          const q = userSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            u.code.toLowerCase().includes(q) ||
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => (
                          <tr key={u.code} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <input type="checkbox" className="accent-[#8B5CF6]" />
                            </td>
                            <td className="p-4 font-mono font-bold text-white">{u.code}</td>
                            <td className="p-4 font-semibold text-white">{u.name}</td>
                            <td className="p-4 text-slate-200">{u.role}</td>
                            <td className="p-4 text-slate-300">{u.email}</td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                    : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    triggerToast(`Đang chỉnh sửa hồ sơ ${u.name} (${u.code})`)
                                  }
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-[#231D50] border border-purple-400/25 text-slate-300 hover:text-white cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUsersList((prev) =>
                                      prev.map((item) =>
                                        item.code === u.code
                                          ? {
                                              ...item,
                                              status:
                                                item.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-[#231D50] border border-purple-400/25 text-slate-300 hover:text-white cursor-pointer"
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

                {/* Phân trang */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select className="px-2.5 py-1 rounded-lg bg-[#171336] border border-purple-400/25 text-white outline-none">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, '...', 125].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`px-3 py-1 rounded-lg font-bold border-none cursor-pointer ${
                          p === 1
                            ? 'bg-[#7C3AED] text-white'
                            : 'bg-[#171336] text-slate-300 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 3: QUẢN LÝ ĐỊNH DANH SỐ (DID) (THEO ĐÚNG PANEL 3 + THU HỒI KHÓA O(1))
               ========================================================================= */}
            {activeMenu === 'DID' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                  Quản lý định danh số (DID)
                </h2>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative min-w-[240px] flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={didSearch}
                        onChange={(e) => setDidSearch(e.target.value)}
                        placeholder="Tìm theo DID, mã người dùng, họ tên..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
                      />
                    </div>

                    <select
                      value={deviceStatusFilter}
                      onChange={(e) => setDeviceStatusFilter(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                    >
                      <option value="ALL">Trạng thái</option>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="REVOKED">Đã thu hồi</option>
                    </select>

                    <select
                      value={didTypeFilter}
                      onChange={(e) => setDidTypeFilter(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                    >
                      <option value="ALL">Loại DID</option>
                      <option value="STUDENT">Sinh viên</option>
                      <option value="FACULTY">Giảng viên</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddDidModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none shadow-lg cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp DID mới</span>
                  </button>
                </div>

                {/* Bảng DID chuẩn Panel 3 */}
                <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                        <th className="p-4 font-bold">Mã người dùng</th>
                        <th className="p-4 font-bold">DID</th>
                        <th className="p-4 font-bold">Chủ sở hữu</th>
                        <th className="p-4 font-bold">Loại</th>
                        <th className="p-4 font-bold text-center">Trạng thái</th>
                        <th className="p-4 font-bold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/15">
                      {usersList
                        .filter((u) => {
                          if (didTypeFilter !== 'ALL' && u.roleKey !== didTypeFilter) return false;
                          const q = didSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            u.code.toLowerCase().includes(q) ||
                            u.name.toLowerCase().includes(q) ||
                            u.did.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => (
                          <tr key={u.code} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{u.code}</td>
                            <td className="p-4 font-mono text-sky-300">{u.did}</td>
                            <td className="p-4 font-semibold text-white">{u.name}</td>
                            <td className="p-4 text-slate-200">{u.role}</td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                    : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thu hồi'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    triggerToast(`DID Document: ${u.did} (${u.name}) — Hợp lệ trên Smart Contract`)
                                  }
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-[#231D50] border border-purple-400/25 text-slate-300 hover:text-white cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUsersList((prev) =>
                                      prev.map((item) =>
                                        item.code === u.code
                                          ? {
                                              ...item,
                                              status:
                                                item.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-rose-500/25 border border-purple-400/25 text-slate-300 hover:text-rose-300 cursor-pointer"
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
                <div className="p-4 sm:p-5 rounded-2xl bg-[#161236] border border-purple-400/25 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex-1 min-w-[260px]">
                    <div className="text-xs font-semibold text-purple-200 mb-1.5">
                      Thu hồi / Khôi phục khóa thiết bị độc lập O(1) trên chuỗi (isRevoked[address]):
                    </div>
                    <input
                      value={revokeAddressInput}
                      onChange={(e) => setRevokeAddressInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0B0920] border border-purple-400/30 text-sm font-mono text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdminRevokeWallet()}
                      className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs sm:text-sm font-semibold border-none cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Thu hồi khóa (revokeKey)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminUnrevokeWallet()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Khôi phục (unrevokeKey)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 4: QUẢN LÝ CHỨNG CHỈ SỐ (VC) (THEO ĐÚNG PANEL 4 TRONG ẢNH)
               ========================================================================= */}
            {activeMenu === 'VC' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                  Quản lý chứng chỉ số (Verifiable Credential)
                </h2>

                {/* 3 Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'ALL', label: 'Tất cả (26.937)' },
                    { id: 'ACTIVE', label: 'Đã cấp (26.125)' },
                    { id: 'REVOKED', label: 'Đã thu hồi (812)' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVcSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        vcSubTab === tab.id ? 'text-[#C084FC]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {vcSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative min-w-[240px] flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={vcSearch}
                        onChange={(e) => setVcSearch(e.target.value)}
                        placeholder="Tìm theo mã VC, người nhận..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
                      />
                    </div>

                    <select
                      value={vcTypeFilter}
                      onChange={(e) => setVcTypeFilter(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-slate-200 font-semibold outline-none"
                    >
                      <option value="ALL">Loại chứng chỉ</option>
                      <option value="Thẻ sinh viên số">Thẻ sinh viên số</option>
                      <option value="Giấy xác nhận học tập">Giấy xác nhận học tập</option>
                      <option value="Chứng nhận giảng viên">Chứng nhận giảng viên</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextId = `VC-000${Math.floor(8458 + Math.random() * 100)}`;
                      setVcList((prev) => [
                        {
                          vcId: nextId,
                          recipient: 'Nguyễn Đức Hiển',
                          studentId: '2251120000',
                          type: 'Thẻ sinh viên số',
                          date: '19/11/2026',
                          status: 'ACTIVE'
                        },
                        ...prev
                      ]);
                      triggerToast(`✓ Đã ký và phát hành chứng chỉ số ${nextId} chuẩn W3C VC`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none shadow-lg cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp chứng chỉ</span>
                  </button>
                </div>

                {/* Bảng VC */}
                <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                        <th className="p-4 font-bold">Mã VC</th>
                        <th className="p-4 font-bold">Người nhận</th>
                        <th className="p-4 font-bold">Loại chứng chỉ</th>
                        <th className="p-4 font-bold">Ngày cấp</th>
                        <th className="p-4 font-bold text-center">Trạng thái</th>
                        <th className="p-4 font-bold text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/15">
                      {vcList
                        .filter((vc) => {
                          if (vcSubTab !== 'ALL' && vc.status !== vcSubTab) return false;
                          if (vcTypeFilter !== 'ALL' && vc.type !== vcTypeFilter) return false;
                          const q = vcSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            vc.vcId.toLowerCase().includes(q) ||
                            vc.recipient.toLowerCase().includes(q)
                          );
                        })
                        .map((vc) => (
                          <tr key={vc.vcId} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{vc.vcId}</td>
                            <td className="p-4 font-semibold text-white">{vc.recipient}</td>
                            <td className="p-4 text-slate-200">{vc.type}</td>
                            <td className="p-4 font-mono text-slate-300">{vc.date}</td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  vc.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                    : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                }`}
                              >
                                {vc.status === 'ACTIVE' ? '● Hoạt động' : 'Đã thu hồi'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadVcFile(vc)}
                                  title="Tải xuống W3C VC (.json)"
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-[#231D50] border border-purple-400/25 text-slate-300 hover:text-white cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVcList((prev) =>
                                      prev.map((item) =>
                                        item.vcId === vc.vcId
                                          ? {
                                              ...item,
                                              status:
                                                item.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-[#171336] hover:bg-rose-500/25 border border-purple-400/25 text-slate-300 hover:text-rose-300 cursor-pointer"
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
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 5: QUẢN TRỊ XÁC THỰC WEBAUTHN (PASSKEY) (THEO ĐÚNG PANEL 5)
               ========================================================================= */}
            {activeMenu === 'WEBAUTHN' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                  Quản trị xác thực WebAuthn (Passkey)
                </h2>

                {/* 3 KPI Cards: 12.548 Tài khoản đã đăng ký | 18.973 Thiết bị xác thực | 98,7% Tỷ lệ xác thực */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC]">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        12.548
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        Tài khoản đã đăng ký
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-sky-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        18.973
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        Thiết bị xác thực
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-fuchsia-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        98,7%
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        Tỷ lệ xác thực
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'DEVICES', label: 'Thiết bị xác thực' },
                    { id: 'POLICY', label: 'Chính sách xác thực' },
                    { id: 'LOGS', label: 'Nhật ký xác thực' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWebAuthnSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        webAuthnSubTab === tab.id
                          ? 'text-[#C084FC]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {webAuthnSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {webAuthnSubTab === 'DEVICES' && (
                  <>
                    {/* Tìm kiếm Thiết bị */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={webAuthnSearch}
                          onChange={(e) => setWebAuthnSearch(e.target.value)}
                          placeholder="Tìm theo người dùng, thiết bị, AAGUID..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>

                    {/* Bảng Thiết bị xác thực WebAuthn */}
                    <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                            <th className="p-4 font-semibold">Người dùng</th>
                            <th className="p-4 font-semibold">Thiết bị</th>
                            <th className="p-4 font-semibold">AAGUID</th>
                            <th className="p-4 font-semibold">Ngày đăng ký</th>
                            <th className="p-4 font-semibold text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/15">
                          {WEBAUTHN_DEVICES.filter((d) => {
                            const q = webAuthnSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              d.user.toLowerCase().includes(q) ||
                              d.device.toLowerCase().includes(q) ||
                              d.aaguid.toLowerCase().includes(q)
                            );
                          }).map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.04] transition-colors">
                              <td className="p-4 font-semibold text-white whitespace-nowrap">{d.user}</td>
                              <td className="p-4 text-slate-200 font-medium whitespace-nowrap">{d.device}</td>
                              <td className="p-4 font-mono text-sky-300 whitespace-nowrap">{d.aaguid}</td>
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{d.date}</td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold">
                                  ● Hoạt động
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {webAuthnSubTab === 'POLICY' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'requireUserVerification',
                        title: 'Bắt buộc xác thực sinh trắc học (UV = Required)',
                        desc: 'Yêu cầu FaceID, TouchID hoặc Windows Hello PIN cho mọi giao dịch điểm danh.'
                      },
                      {
                        key: 'hardwareAttestation',
                        title: 'Kiểm chứng chứng thư phần cứng (Direct Attestation)',
                        desc: 'Xác minh AAGUID và chuỗi chứng chỉ từ TPM / Secure Enclave của nhà sản xuất.'
                      },
                      {
                        key: 'allowRoamingKeys',
                        title: 'Cho phép khóa bảo mật phần cứng FIDO2 (YubiKey)',
                        desc: 'Hỗ trợ giảng viên và quản trị viên đăng nhập bằng khóa USB/NFC.'
                      },
                      {
                        key: 'strictOriginBinding',
                        title: 'Ràng buộc tên miền chống Phishing (RP ID Binding)',
                        desc: 'Khóa chữ ký mật mã chỉ hợp lệ duy nhất trên tên miền cổng UTH-TrustID.'
                      }
                    ].map((pol) => {
                      const enabled = webAuthnPolicies[pol.key];
                      return (
                        <div
                          key={pol.key}
                          className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-white">{pol.title}</div>
                            <div className="text-xs text-slate-300/85 leading-relaxed">{pol.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWebAuthnPolicies((p) => ({ ...p, [pol.key]: !p[pol.key] }));
                              triggerToast(`✓ Đã cập nhật chính sách: ${pol.title}`);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
                              enabled
                                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                : 'bg-slate-800 border-slate-600 text-slate-300'
                            }`}
                          >
                            {enabled ? 'Đang bật' : 'Đang tắt'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {webAuthnSubTab === 'LOGS' && (
                  <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                          <th className="p-4 font-semibold">Thời gian</th>
                          <th className="p-4 font-semibold">Tài khoản</th>
                          <th className="p-4 font-semibold">Thiết bị Passkey</th>
                          <th className="p-4 font-semibold">Độ trễ</th>
                          <th className="p-4 font-semibold text-right">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/15">
                        {[
                          { time: '19/11/2026, 08:15:22', user: 'Nguyễn Đức Hiển (2251120000)', device: 'iPhone 15 Pro • FaceID', ms: '118 ms', ok: true },
                          { time: '19/11/2026, 08:14:09', user: 'ThS. Nguyễn Thị Hiên (GV0012)', device: 'Windows Hello TPM 2.0', ms: '94 ms', ok: true },
                          { time: '19/11/2026, 08:11:45', user: 'Admin UTH (AD0001)', device: 'YubiKey 5C NFC', ms: '132 ms', ok: true },
                          { time: '19/11/2026, 08:09:12', user: 'SV2310002 (Trần Quốc Bảo)', device: 'Unknown Emulator', ms: '21 ms', ok: false }
                        ].map((l, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                            <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{l.time}</td>
                            <td className="p-4 font-semibold text-white whitespace-nowrap">{l.user}</td>
                            <td className="p-4 text-slate-200 whitespace-nowrap">{l.device}</td>
                            <td className="p-4 font-mono text-sky-300 whitespace-nowrap">{l.ms}</td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  l.ok
                                    ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300'
                                    : 'bg-rose-500/15 border-rose-400/35 text-rose-300'
                                }`}
                              >
                                {l.ok ? 'Hợp lệ' : 'Từ chối (403)'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 6: QUẢN LÝ MERKLE TREE (THEO ĐÚNG PANEL 6 TRONG ẢNH)
               ========================================================================= */}
            {activeMenu === 'MERKLE' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                    Quản lý Merkle Tree
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdminIssueMerkleBatch();
                      const newId = `MT-20261119-0${merkleBatches.length + 1}`;
                      setMerkleBatches((prev) => [
                        {
                          batchId: newId,
                          root: rootDisplay,
                          records: String(parsedBatchAll.length || '1.250'),
                          date: '19/11/2026',
                          status: 'COMPLETED'
                        },
                        ...prev
                      ]);
                      triggerToast(`✓ Đã băm Keccak256 và tạo phiên cây Merkle ${newId}`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none shadow-lg cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo cây Merkle</span>
                  </button>
                </div>

                {/* 2 Sub-Tabs */}
                <div className="flex items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'TREE', label: 'Cây Merkle' },
                    { id: 'PROOF', label: 'Bằng chứng (Merkle Proof)' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMerkleSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        merkleSubTab === tab.id
                          ? 'text-[#C084FC]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {merkleSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {merkleSubTab === 'TREE' ? (
                  /* Bố cục 2 cột: Bảng phiên Merkle bên trái (7 cột) + Sơ đồ Cấu trúc Merkle Tree bên phải (5 cột) */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7 overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                            <th className="p-4 font-semibold">Phiên/Chuỗi</th>
                            <th className="p-4 font-semibold">Merkle Root</th>
                            <th className="p-4 font-semibold text-center">Số bản ghi</th>
                            <th className="p-4 font-semibold">Ngày tạo</th>
                            <th className="p-4 font-semibold text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/15">
                          {merkleBatches.map((b) => (
                            <tr key={b.batchId} className="hover:bg-white/[0.04] transition-colors">
                              <td className="p-4 font-mono font-semibold text-white whitespace-nowrap">{b.batchId}</td>
                              <td className="p-4 font-mono text-sky-300 whitespace-nowrap">{b.root}</td>
                              <td className="p-4 text-center font-mono font-semibold text-white tabular-nums">
                                {b.records}
                              </td>
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{b.date}</td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold">
                                  Hoàn thành
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sơ đồ Cấu trúc Merkle Tree (Root -> H1, H2 -> D1, D2, D3, D4) */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161236] border border-purple-400/25 flex flex-col justify-between space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white m-0">
                          Cấu trúc Merkle Tree
                        </h3>
                        <span className="text-xs font-mono text-purple-200">
                          Đang chọn: D{activeLeafIdx + 1}
                        </span>
                      </div>

                      <div className="flex flex-col items-center space-y-4 my-auto">
                        {/* Tầng 1: Root */}
                        <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-center shadow-[0_0_24px_rgba(124,58,237,0.45)] border border-purple-300/45">
                          <div className="text-xs font-bold">Merkle Root</div>
                          <div className="text-xs font-mono opacity-95 mt-0.5">{rootDisplay}</div>
                        </div>

                        {/* Đường nối */}
                        <div className="w-3/5 h-4 border-t-2 border-l-2 border-r-2 border-purple-400/50 rounded-t-lg" />

                        {/* Tầng 2: H1 & H2 */}
                        <div className="grid grid-cols-2 gap-5 w-full">
                          <div
                            className={`p-3 rounded-xl border text-center transition-colors ${
                              activeLeafIdx < 2
                                ? 'bg-purple-500/25 border-purple-300 text-white'
                                : 'bg-[#0B0920] border-purple-500/25 text-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold">H1 = Keccak(D1, D2)</div>
                            <div className="text-xs font-mono text-purple-200 mt-0.5">0x14e...b22</div>
                          </div>
                          <div
                            className={`p-3 rounded-xl border text-center transition-colors ${
                              activeLeafIdx >= 2
                                ? 'bg-purple-500/25 border-purple-300 text-white'
                                : 'bg-[#0B0920] border-purple-500/25 text-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold">H2 = Keccak(D3, D4)</div>
                            <div className="text-xs font-mono text-purple-200 mt-0.5">0x88f...c19</div>
                          </div>
                        </div>

                        {/* Tầng 3: D1, D2, D3, D4 */}
                        <div className="grid grid-cols-4 gap-2.5 w-full pt-1">
                          {['D1', 'D2', 'D3', 'D4'].map((leaf, idx) => (
                            <button
                              key={leaf}
                              type="button"
                              onClick={() => setSelectedMerkleLeafIdx(idx)}
                              className={`py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer border transition-all ${
                                activeLeafIdx === idx
                                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white border-purple-200 shadow-md'
                                  : 'bg-[#0B0920] text-slate-300 border-purple-500/25 hover:text-white'
                              }`}
                            >
                              {leaf}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab Bằng chứng Merkle Proof O(log N) */
                  <div className="p-6 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white m-0">
                          Xác minh bằng chứng Merkle Proof — O(log₂ N)
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 mb-0">
                          Chọn nút lá sinh viên (D1–D4) để kiểm tra nhánh băm Keccak256 đối chiếu với Root trên chuỗi
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {['D1', 'D2', 'D3', 'D4'].map((leaf, idx) => (
                          <button
                            key={leaf}
                            type="button"
                            onClick={() => setSelectedMerkleLeafIdx(idx)}
                            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold cursor-pointer border ${
                              activeLeafIdx === idx
                                ? 'bg-[#7C3AED] text-white border-purple-300'
                                : 'bg-[#0B0920] text-slate-300 border-purple-500/25 hover:text-white'
                            }`}
                          >
                            Lá {leaf}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 rounded-xl bg-[#0B0920] border border-purple-500/20 space-y-1.5">
                        <div className="text-xs text-slate-400">1. Mã băm Lá D{activeLeafIdx + 1}</div>
                        <div className="font-mono text-sky-300 text-xs break-all">
                          0x7a4f91e8c20b...d{activeLeafIdx + 1}9a
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0B0920] border border-purple-500/20 space-y-1.5">
                        <div className="text-xs text-slate-400">2. Nhánh đối xứng (Proof Siblings)</div>
                        <div className="font-mono text-purple-200 text-xs break-all">
                          [{activeLeafIdx < 2 ? '0x88f...c19 (H2)' : '0x14e...b22 (H1)'}, 0x4c2...a91]
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/35 space-y-1.5">
                        <div className="text-xs text-emerald-200">3. Đối chiếu On-Chain Root</div>
                        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Khớp {rootDisplay} (Hợp lệ)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 7: QUẢN LÝ BLOCKCHAIN (THEO ĐÚNG PANEL 7 TRONG ẢNH)
               ========================================================================= */}
            {activeMenu === 'BLOCKCHAIN' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                  Quản lý Blockchain
                </h2>

                {/* 3 Thẻ KPI: 1.245.983 Giao dịch | 100% Trạng thái mạng | 1,2s Thời gian xác nhận */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[#C084FC]">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        1.245.983
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">Giao dịch</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-emerald-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        100%
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        Trạng thái mạng
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-fuchsia-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                        1,2s
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        Thời gian xác nhận
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'TX', label: 'Giao dịch' },
                    { id: 'BLOCKS', label: 'Khối (Block)' },
                    { id: 'CONTRACTS', label: 'Hợp đồng thông minh' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBlockchainSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        blockchainSubTab === tab.id
                          ? 'text-[#C084FC]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {blockchainSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {blockchainSubTab === 'TX' && (
                  <>
                    {/* Tìm kiếm TxHash */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          placeholder="Tìm theo TxHash, khối, nội dung..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                        />
                      </div>
                      <span className="px-3.5 py-2 rounded-xl bg-[#171336] border border-purple-400/25 text-xs font-medium text-slate-200">
                        7 ngày gần nhất
                      </span>
                    </div>

                    {/* Bảng Giao dịch Blockchain */}
                    <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                            <th className="p-4 font-semibold">TxHash</th>
                            <th className="p-4 font-semibold">Loại giao dịch</th>
                            <th className="p-4 font-semibold">Khối</th>
                            <th className="p-4 font-semibold">Thời gian</th>
                            <th className="p-4 font-semibold text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/15">
                          {BLOCKCHAIN_TXS.filter((tx) => {
                            const q = txSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              tx.txHash.toLowerCase().includes(q) ||
                              tx.type.toLowerCase().includes(q) ||
                              tx.block.toLowerCase().includes(q)
                            );
                          }).map((tx) => (
                            <tr key={tx.txHash} className="hover:bg-white/[0.04] transition-colors">
                              <td className="p-4 font-mono font-semibold text-sky-300 whitespace-nowrap">{tx.txHash}</td>
                              <td className="p-4 font-medium text-white whitespace-nowrap">{tx.type}</td>
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{tx.block}</td>
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{tx.time}</td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold">
                                  Thành công
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {blockchainSubTab === 'BLOCKS' && (
                  <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                          <th className="p-4 font-semibold">Số khối</th>
                          <th className="p-4 font-semibold">Block Hash</th>
                          <th className="p-4 font-semibold text-center">Số giao dịch</th>
                          <th className="p-4 font-semibold">Node xác thực</th>
                          <th className="p-4 font-semibold text-right">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/15">
                        {[
                          { num: '#543.210', hash: '0x9a3f...41e0', txs: 18, validator: 'UTH-Validator-01', time: '18/11/2026, 10:24' },
                          { num: '#543.209', hash: '0x7c1b...88d2', txs: 12, validator: 'UTH-Validator-02', time: '18/11/2026, 10:12' },
                          { num: '#543.208', hash: '0x4e02...19f7', txs: 24, validator: 'UTH-Validator-01', time: '18/11/2026, 09:57' }
                        ].map((blk) => (
                          <tr key={blk.num} className="hover:bg-white/[0.04] transition-colors">
                            <td className="p-4 font-mono font-semibold text-white whitespace-nowrap">{blk.num}</td>
                            <td className="p-4 font-mono text-sky-300 whitespace-nowrap">{blk.hash}</td>
                            <td className="p-4 text-center font-mono text-white tabular-nums">{blk.txs}</td>
                            <td className="p-4 text-slate-200 whitespace-nowrap">{blk.validator}</td>
                            <td className="p-4 text-right font-mono text-slate-300 whitespace-nowrap">{blk.time}</td>
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
                        desc: 'Quản lý W3C DID & ánh xạ khóa công khai thiết bị sinh viên/giảng viên.',
                        calls: '842.190 lệnh gọi'
                      },
                      {
                        name: 'MerkleBatchAnchor.sol',
                        address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                        desc: 'Neo Merkle Root Keccak256 theo lô, tiết kiệm 96% chi phí lưu trữ on-chain.',
                        calls: '295.412 lệnh gọi'
                      },
                      {
                        name: 'CredentialRevocationO1.sol',
                        address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                        desc: 'Cơ chế thu hồi khóa & chứng chỉ độ phức tạp O(1) tức thời.',
                        calls: '108.381 lệnh gọi'
                      }
                    ].map((ct) => (
                      <div
                        key={ct.name}
                        className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">{ct.name}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[11px] font-semibold">
                              Verified
                            </span>
                          </div>
                          <div className="text-xs font-mono text-sky-300 break-all">{ct.address}</div>
                          <p className="text-xs text-slate-300/85 leading-relaxed m-0 pt-1">{ct.desc}</p>
                        </div>
                        <div className="text-xs font-medium text-purple-200 pt-2 border-t border-white/10">
                          {ct.calls}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 8: NHẬT KÝ & GIÁM SÁT HỆ THỐNG (THEO ĐÚNG PANEL 8 + SOC SIMULATOR)
               ========================================================================= */}
            {activeMenu === 'AUDIT' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                    Nhật ký &amp; Giám sát hệ thống
                  </h2>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportAuditLogsCSV}
                      className="px-4 py-2 rounded-xl bg-[#171336] hover:bg-[#221C4E] border border-purple-400/30 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Xuất nhật ký (.CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={fetchAdminAuditLogs}
                      className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Làm mới</span>
                    </button>
                  </div>
                </div>

                {/* 3 Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'ACTIVITY', label: 'Nhật ký hoạt động' },
                    { id: 'SERVICES', label: 'Giám sát dịch vụ' },
                    { id: 'SECURITY', label: `Cảnh báo bảo mật (${(securityAlerts || []).length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAuditSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        auditSubTab === tab.id
                          ? 'text-[#C084FC]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {auditSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {auditSubTab === 'ACTIVITY' && (
                  <>
                    {/* Toolbar Tìm kiếm & Bộ lọc mức độ */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5 flex-1">
                        <div className="relative min-w-[240px] flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={auditQuery}
                            onChange={(e) => setAuditQuery(e.target.value)}
                            placeholder="Tìm theo người dùng, hành động..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                          />
                        </div>

                        <select
                          value={auditLevelFilter}
                          onChange={(e) => setAuditLevelFilter(e.target.value)}
                          className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-sm text-slate-200 font-medium outline-none"
                        >
                          <option value="ALL">Tất cả mức độ</option>
                          <option value="INFO">Thông tin</option>
                          <option value="SUCCESS">Thành công</option>
                          <option value="WARNING">Cảnh báo</option>
                        </select>

                        <span className="px-3.5 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs font-mono text-slate-200 inline-flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#C084FC]" />
                          <span>18/11/2026</span>
                        </span>
                      </div>
                    </div>

                    {/* Bảng Nhật ký hoạt động */}
                    <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-purple-500/20 bg-[#171338] text-purple-200/90 text-[13px] whitespace-nowrap">
                            <th className="p-4 font-semibold">Thời gian</th>
                            <th className="p-4 font-semibold">Người dùng</th>
                            <th className="p-4 font-semibold">Hành động</th>
                            <th className="p-4 font-semibold">Đối tượng</th>
                            <th className="p-4 font-semibold text-right">Mức độ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/15">
                          {SYSTEM_AUDIT_ROWS.filter((row) => {
                            if (auditLevelFilter !== 'ALL' && row.level !== auditLevelFilter)
                              return false;
                            const q = auditQuery.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              row.action.toLowerCase().includes(q) ||
                              row.user.toLowerCase().includes(q) ||
                              row.target.toLowerCase().includes(q)
                            );
                          }).map((row) => (
                            <tr key={row.id} className="hover:bg-white/[0.04] transition-colors">
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{row.time}</td>
                              <td className="p-4 font-mono font-semibold text-white whitespace-nowrap">{row.user}</td>
                              <td className="p-4 font-medium text-white">{row.action}</td>
                              <td className="p-4 font-mono text-slate-300 whitespace-nowrap">{row.target}</td>
                              <td className="p-4 text-right whitespace-nowrap">
                                {row.level === 'INFO' && (
                                  <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/35 text-sky-300 text-xs font-semibold">
                                    ● Thông tin
                                  </span>
                                )}
                                {row.level === 'SUCCESS' && (
                                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold">
                                    Thành công
                                  </span>
                                )}
                                {row.level === 'WARNING' && (
                                  <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/35 text-rose-300 text-xs font-semibold">
                                    ⚠ Cảnh báo
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {auditSubTab === 'SERVICES' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'DID Resolution Service (W3C Core)', uptime: '99,98%', latency: '28 ms', cpu: '14%', mem: '412 MB' },
                      { name: 'WebAuthn FIDO2 Assertion Engine', uptime: '99,99%', latency: '42 ms', cpu: '19%', mem: '368 MB' },
                      { name: 'Merkle Tree Keccak256 Batcher', uptime: '100%', latency: '16 ms', cpu: '8%', mem: '220 MB' },
                      { name: 'Blockchain RPC & Event Listener', uptime: '99,95%', latency: '64 ms', cpu: '22%', mem: '540 MB' }
                    ].map((svc) => (
                      <div
                        key={svc.name}
                        className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white">{svc.name}</span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold shrink-0">
                            ● Hoạt động
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                          <div className="p-2.5 rounded-xl bg-[#0B0920]">
                            <div className="text-[11px] text-slate-400">Uptime</div>
                            <div className="text-xs font-mono font-semibold text-emerald-300 mt-0.5">{svc.uptime}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#0B0920]">
                            <div className="text-[11px] text-slate-400">Độ trễ</div>
                            <div className="text-xs font-mono font-semibold text-sky-300 mt-0.5">{svc.latency}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#0B0920]">
                            <div className="text-[11px] text-slate-400">CPU</div>
                            <div className="text-xs font-mono font-semibold text-purple-200 mt-0.5">{svc.cpu}</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#0B0920]">
                            <div className="text-[11px] text-slate-400">RAM</div>
                            <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{svc.mem}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {auditSubTab === 'SECURITY' && (
                  <div className="space-y-3">
                    {(securityAlerts || []).length > 0 ? (
                      (securityAlerts || []).slice(0, 8).map((al) => (
                        <div
                          key={al.id}
                          className="p-4 rounded-2xl bg-[#0B0920] border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 text-sm"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-400">[{al.time}]</span>
                              <strong className="text-rose-300 font-semibold">
                                {al.vectorLabel || al.type}
                              </strong>
                            </div>
                            <div className="text-slate-200 text-xs sm:text-sm">{al.detail}</div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 font-mono text-xs font-semibold shrink-0">
                            ĐÃ CHẶN (403)
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#161236] border border-emerald-400/25 text-center text-sm text-emerald-300 font-medium">
                        Hệ thống SOC IDS đang hoạt động — Chưa ghi nhận cảnh báo tấn công mới. Hãy nhấn nút giả lập bên dưới để kiểm thử 4 lớp phòng vệ.
                      </div>
                    )}
                  </div>
                )}

                {/* Bảng giả lập kiểm thử 4 lớp phòng vệ SOC IDS */}
                <div className="p-4 rounded-2xl bg-[#161236] border border-purple-400/30 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-[#C084FC]">
                    ⚡ Giả lập tấn công kiểm thử phòng vệ SOC (403 Auto-Block):
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
                        className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs font-bold cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 9: BÁO CÁO & THỐNG KÊ (THEO ĐÚNG PANEL 9 TRONG ẢNH)
               ========================================================================= */}
            {activeMenu === 'REPORTS' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                    Báo cáo &amp; Thống kê
                  </h2>

                  <button
                    type="button"
                    onClick={handleExportAuditLogsCSV}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] text-white text-xs sm:text-sm font-bold border-none shadow-lg cursor-pointer inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>

                {/* 4 Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-purple-500/20">
                  {[
                    { id: 'OVERVIEW', label: 'Tổng quan' },
                    { id: 'ATTENDANCE', label: 'Xác thực hiện diện' },
                    { id: 'DID_VC', label: 'DID & VC' },
                    { id: 'PERFORMANCE', label: 'Hiệu suất hệ thống' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReportSubTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold bg-transparent border-none cursor-pointer relative ${
                        reportSubTab === tab.id
                          ? 'text-[#C084FC]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {reportSubTab === tab.id && (
                        <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#6366F1]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 4 KPI Cards: 12.548 Người dùng | 26.937 Chứng chỉ số | 178 Lớp học | 98,7% Tỷ lệ xác thực */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-[#C084FC]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">12.548</div>
                      <div className="text-xs text-slate-300">Người dùng</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-teal-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">26.937</div>
                      <div className="text-xs text-slate-300">Chứng chỉ số</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-sky-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">178</div>
                      <div className="text-xs text-slate-300">Lớp học</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161236] border border-fuchsia-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">98,7%</div>
                      <div className="text-xs text-slate-300">Tỷ lệ xác thực</div>
                    </div>
                  </div>
                </div>

                {/* 2 Biểu đồ chuẩn Panel 9: Tỷ lệ xác thực theo vai trò (Donut 3 phân đoạn) & Số lượt xác thực theo thời gian (T6..T11) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Donut Chart: Tỷ lệ xác thực theo vai trò (đủ 3 màu: Sinh viên - Giảng viên - Quản trị viên) */}
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[#161236] border border-purple-400/25 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white m-0">
                        {reportSubTab === 'DID_VC'
                          ? 'Phân bổ định danh DID & VC theo vai trò'
                          : reportSubTab === 'PERFORMANCE'
                            ? 'Tỷ lệ đáp ứng SLA các dịch vụ'
                            : 'Tỷ lệ xác thực theo vai trò'}
                      </h3>
                      <span className="text-xs text-purple-300 font-medium">Học kỳ 1 (2026 – 2027)</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 py-4">
                      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="44" fill="transparent" stroke="#1E1946" strokeWidth="15" />
                          {/* Sinh viên (~62% cung = 171 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#38BDF8"
                            strokeWidth="15"
                            strokeDasharray="171 277"
                            strokeDashoffset="0"
                          />
                          {/* Giảng viên (~25% cung = 69 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#2DD4BF"
                            strokeWidth="15"
                            strokeDasharray="69 277"
                            strokeDashoffset="-171"
                          />
                          {/* Quản trị viên (~13% cung = 37 / 276.46) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="44"
                            fill="transparent"
                            stroke="#A855F7"
                            strokeWidth="15"
                            strokeDasharray="37 277"
                            strokeDashoffset="-240"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-white tabular-nums">
                            {reportSubTab === 'PERFORMANCE' ? '99,9%' : '98,7%'}
                          </span>
                          <span className="text-xs text-slate-300 mt-0.5">Trung bình</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 text-sm min-w-[180px]">
                        <div className="flex items-center justify-between gap-6">
                          <span className="inline-flex items-center gap-2.5 text-slate-200 font-medium">
                            <span className="w-3 h-3 rounded-full bg-sky-400 shrink-0" />
                            <span>Sinh viên</span>
                          </span>
                          <strong className="text-white font-mono font-semibold tabular-nums">98,6%</strong>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="inline-flex items-center gap-2.5 text-slate-200 font-medium">
                            <span className="w-3 h-3 rounded-full bg-teal-400 shrink-0" />
                            <span>Giảng viên</span>
                          </span>
                          <strong className="text-white font-mono font-semibold tabular-nums">99,1%</strong>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="inline-flex items-center gap-2.5 text-slate-200 font-medium">
                            <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
                            <span>Quản trị viên</span>
                          </span>
                          <strong className="text-white font-mono font-semibold tabular-nums">100%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart: Số lượt xác thực theo thời gian (T6..T11) — Explicit container height + horizontal grid */}
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[#161236] border border-purple-400/25 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white m-0">
                        {reportSubTab === 'ATTENDANCE'
                          ? 'Lượt điểm danh phòng học (T6 – T11)'
                          : reportSubTab === 'DID_VC'
                            ? 'Lượt cấp chứng chỉ W3C VC (T6 – T11)'
                            : 'Số lượt xác thực theo thời gian'}
                      </h3>
                      <span className="text-xs text-emerald-300 font-semibold">+178% tăng trưởng</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-stretch gap-3">
                        <div className="flex flex-col justify-between h-[196px] text-xs font-medium text-slate-400 pr-2 tabular-nums">
                          <span>10.000</span>
                          <span>8.000</span>
                          <span>6.000</span>
                          <span>4.000</span>
                          <span>2.000</span>
                          <span>0</span>
                        </div>

                        <div className="flex-1 relative">
                          <div className="absolute inset-x-0 top-0 h-[196px] flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4, 5].map((idx) => (
                              <div
                                key={idx}
                                className={`w-full border-t ${
                                  idx === 5
                                    ? 'border-purple-400/25'
                                    : 'border-slate-500/15 border-dashed'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="relative z-10 grid grid-cols-6 gap-2.5 sm:gap-4">
                            {MONTHLY_AUTH_BARS.map((m) => (
                              <div key={m.month} className="flex flex-col items-center group">
                                <div className="w-full max-w-[44px] h-[196px] flex flex-col justify-end items-center">
                                  <span className="text-[11px] font-semibold text-slate-300 mb-1.5 group-hover:text-white transition-colors tabular-nums">
                                    {(m.value / 1000).toFixed(1).replace('.', ',')}k
                                  </span>
                                  <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-[#5B21B6] via-[#7C3AED] to-[#C084FC] shadow-[0_0_16px_rgba(168,85,247,0.4)] group-hover:brightness-110 transition-all"
                                    style={{ height: `${Math.max(12, m.pct - 8)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-300 mt-2.5">
                                  {m.month}
                                </span>
                              </div>
                            ))}
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
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/20 shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0">
                    Cấu hình hệ thống UTH-TrustID
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 mb-0">
                    Quản lý tham số chuẩn W3C DID, chính sách WebAuthn FIDO2 và kết nối mạng Blockchain
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-2">
                    <div className="font-semibold text-white">Chuẩn Định danh phi tập trung (DID)</div>
                    <div className="text-slate-300 leading-relaxed">
                      W3C DID Core 1.0 • Phương thức{' '}
                      <span className="font-mono text-sky-300">did:uth:secp256k1</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-2">
                    <div className="font-semibold text-white">Cấu hình WebAuthn &amp; QR Nonce</div>
                    <div className="text-slate-300 leading-relaxed">
                      FIDO2 Hardware Passkey • Chu kỳ xoay Nonce 35 giây • Bán kính Geofence R ≤ 35m
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-2">
                    <div className="font-semibold text-white">Chính sách neo dữ liệu Merkle Tree</div>
                    <div className="text-slate-300 leading-relaxed">
                      Thuật toán băm Keccak256 • Tự động gom lô và neo Root on-chain mỗi cuối phiên
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 space-y-2">
                    <div className="font-semibold text-white">Giám sát phòng vệ SOC IDS</div>
                    <div className="text-slate-300 leading-relaxed">
                      Tự động chặn HTTP 403 đối với QR hết hạn, giả mạo chữ ký, điểm danh hộ và Fake GPS
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

      {/* ==================== MODAL THÊM NGƯỜI DÙNG MỚI (MÀN HÌNH 2 & 3) ==================== */}
      {(showAddUserModal || showAddDidModal) && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddUserModal(false);
              setShowAddDidModal(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <form
            onSubmit={(e) => {
              handleCreateUser(e);
              setShowAddDidModal(false);
            }}
            className="w-full max-w-md rounded-3xl bg-[#130F30] border border-purple-400/45 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0">
                {showAddDidModal ? 'Cấp định danh số (DID) mới' : 'Thêm tài khoản người dùng mới'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setShowAddDidModal(false);
                }}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="Mã người dùng (VD: SV2310009)"
                value={newUserForm.code}
                onChange={(e) => setNewUserForm({ ...newUserForm, code: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white font-mono outline-none"
              />
              <input
                type="text"
                required
                placeholder="Họ và tên"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
              />
              <select
                value={newUserForm.roleKey}
                onChange={(e) => setNewUserForm({ ...newUserForm, roleKey: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
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
                className="w-full p-3 rounded-xl bg-[#0B0920] border border-purple-400/35 text-sm text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setShowAddDidModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs font-bold border-none cursor-pointer"
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
