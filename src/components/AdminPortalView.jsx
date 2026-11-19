import React, { useState } from 'react';
import {
  Home,
  Users,
  IdCard,
  Award,
  Fingerprint,
  GitBranch,
  FileText,
  BarChart3,
  Settings,
  Bell,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Laptop,
  Monitor,
  ArrowRight,
  UserPlus,
  Box,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Sparkles,
  Layers,
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

const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Tạo tài khoản giảng viên',
    sub: 'tthanh@uth.edu.vn',
    time: '18/11/2026, 10:24',
    icon: <UserPlus className="w-4 h-4 text-[#C084FC]" />
  },
  {
    id: 'act-2',
    title: 'Cấp chứng chỉ số (VC)',
    sub: 'Cho 46 sinh viên – CNTT101',
    time: '18/11/2026, 09:57',
    icon: <ShieldCheck className="w-4 h-4 text-[#C084FC]" />
  },
  {
    id: 'act-3',
    title: 'Ghi dữ liệu lên chuỗi',
    sub: 'Merkle Root: 0x9a3f...7c21',
    time: '18/11/2026, 09:12',
    icon: <Box className="w-4 h-4 text-[#C084FC]" />
  },
  {
    id: 'act-4',
    title: 'Cập nhật chính sách xác thực',
    sub: 'Bật xác thực WebAuthn bắt buộc',
    time: '17/11/2026, 22:08',
    icon: <Settings className="w-4 h-4 text-[#C084FC]" />
  }
];

const SYSTEM_WARNINGS = [
  {
    id: 'warn-1',
    title: '3 tài khoản đăng nhập bất thường',
    sub: 'Cần xác minh nguồn đăng nhập',
    time: '18/11/2026, 08:41',
    level: 'WARNING',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    iconBg: 'bg-amber-500/15 border-amber-400/35'
  },
  {
    id: 'warn-2',
    title: '01 phiên điểm danh chưa đồng bộ',
    sub: 'Lớp CTDL202 – 13/11/2026',
    time: '17/11/2026, 17:26',
    level: 'INFO',
    icon: <Info className="w-5 h-5 text-sky-400" />,
    iconBg: 'bg-sky-500/15 border-sky-400/35'
  },
  {
    id: 'warn-3',
    title: 'Hệ thống hoạt động ổn định',
    sub: 'Không phát hiện lỗi trong 24 giờ qua',
    time: '17/11/2026, 00:00',
    level: 'OK',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    iconBg: 'bg-emerald-500/15 border-emerald-400/35'
  }
];

const INITIAL_USERS_LIST = [
  {
    id: '2251120000',
    name: 'Nguyễn Đức Hiển',
    email: '2251120000@ut.edu.vn',
    role: 'STUDENT',
    dept: 'An toàn Thông tin',
    did: 'did:uth:1d9b6938...ed1d',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    status: 'ACTIVE'
  },
  {
    id: '2151050123',
    name: 'Nguyễn Văn An',
    email: '2151050123@ut.edu.vn',
    role: 'STUDENT',
    dept: 'Công nghệ Thông tin',
    did: 'did:uth:3f8a1bc9...9c2e',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    status: 'ACTIVE'
  },
  {
    id: '2151050124',
    name: 'Trần Thị Bích',
    email: '2151050124@ut.edu.vn',
    role: 'STUDENT',
    dept: 'Công nghệ Thông tin',
    did: 'did:uth:7b14c2e8...d45f',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    status: 'ACTIVE'
  },
  {
    id: 'GV001',
    name: 'ThS. Nguyễn Thị Hiên',
    email: 'giangvien@uth.edu.vn',
    role: 'FACULTY',
    dept: 'Khoa Công nghệ Thông tin',
    did: 'did:uth:faculty:nhien01',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    status: 'ACTIVE'
  },
  {
    id: 'GV002',
    name: 'TS. Trần Thế Vinh',
    email: 'ttvinh@uth.edu.vn',
    role: 'FACULTY',
    dept: 'Khoa Công nghệ Thông tin',
    did: 'did:uth:faculty:tvinh02',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    status: 'ACTIVE'
  },
  {
    id: 'ADM01',
    name: 'Admin UTH',
    email: 'admin@uth.edu.vn',
    role: 'ADMIN',
    dept: 'Trung tâm Quản trị Hệ thống',
    did: 'did:uth:root:admin01',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    status: 'ACTIVE'
  }
];

export default function AdminPortalView({
  adminStats,
  adminStatusMsg,
  setAdminStatusMsg,
  batchJson,
  setBatchJson,
  issuanceMode,
  setIssuanceMode,
  newBatchStudent,
  setNewBatchStudent,
  handleAddStudentToBatch,
  handleRemoveStudentFromBatch,
  handleLoadPresetBatch,
  handleAdminIssueMerkleBatch,
  selectedMerkleLeafIdx,
  setSelectedMerkleLeafIdx,
  revokeAddressInput,
  setRevokeAddressInput,
  revokedKeysList,
  handleAdminRevokeWallet,
  handleAdminUnrevokeWallet,
  deviceSearchQuery,
  setDeviceSearchQuery,
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
  // Điều hướng Sidebar Quản trị hệ thống
  const [activeMenu, setActiveMenu] = useState('HOME');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN'
  const [userSearch, setUserSearch] = useState('');
  const [usersList, setUsersList] = useState(INITIAL_USERS_LIST);
  const [expandedGroups, setExpandedGroups] = useState({
    users: true,
    auth: true,
    infra: true
  });
  const [authPolicy, setAuthPolicy] = useState({
    requireWebAuthn: true,
    requireGeofence: true,
    nonceTtlSeconds: 35,
    maxRadiusMeters: 35,
    autoBlockReplay: true
  });

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  let parsedBatchAll = [];
  try {
    const arr = JSON.parse(batchJson);
    if (Array.isArray(arr)) parsedBatchAll = arr;
  } catch {
    parsedBatchAll = [];
  }

  const sampleLeaves =
    parsedBatchAll.length >= 2
      ? parsedBatchAll.slice(0, 4)
      : [
          { studentId: '2251120000', fullName: 'Nguyễn Đức Hiển' },
          { studentId: '2151050123', fullName: 'Nguyễn Văn An' },
          { studentId: '2151050124', fullName: 'Trần Thị Bích' },
          { studentId: '2151050125', fullName: 'Lê Minh Quân' }
        ];
  while (sampleLeaves.length < 4) {
    sampleLeaves.push({
      studentId: `225112000${sampleLeaves.length + 1}`,
      fullName: `Sinh viên #${sampleLeaves.length + 1}`
    });
  }
  const activeLeafIdx = Math.min(3, Math.max(0, selectedMerkleLeafIdx || 0));
  const siblingLeafIdx = activeLeafIdx ^ 1;
  const isLeftBranchActive = activeLeafIdx < 2;
  const rootDisplay = adminStats?.merkleRoot || '0x9a3f8c2d1e4a7b...7c21';

  const isAddressRevoked = (address) => {
    const lower = String(address || '').toLowerCase();
    const alias =
      lower === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
        ? '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
        : '';
    return (revokedKeysList || []).some((k) => {
      const kl = String(k || '').toLowerCase();
      return kl === lower || (alias && kl === alias);
    });
  };

  // Danh bạ thiết bị DID phục vụ Thu hồi / Khôi phục O(1)
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
  parsedBatchAll.forEach((st) => {
    if (st?.studentId) {
      directoryMap.set(String(st.studentId), {
        studentId: String(st.studentId),
        fullName: st.fullName || st.name || `SV ${st.studentId}`,
        major: st.major || 'An toàn Thông tin',
        address: st.address || `0x${String(st.studentId).padEnd(40, '0').slice(0, 40)}`
      });
    }
  });

  const directoryList = Array.from(directoryMap.values()).filter((item) => {
    const q = (deviceSearchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.studentId.toLowerCase().includes(q) ||
      item.fullName.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    const revoked = isAddressRevoked(item.address);
    if (deviceStatusFilter === 'ACTIVE') return !revoked;
    if (deviceStatusFilter === 'REVOKED') return revoked;
    return true;
  });

  return (
    <div
      className="min-h-screen lg:h-screen w-full bg-[#070618] text-white font-sans select-none flex flex-col lg:overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 78% 14%, rgba(124, 58, 237, 0.18) 0%, transparent 48%), radial-gradient(circle at 22% 88%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), linear-gradient(180deg, #070618 0%, #0B0921 100%)'
      }}
    >
      {/* ==================== KHUNG CHÍNH TOÀN MÀN HÌNH: SIDEBAR TRÁI + WORKSPACE PHẢI ==================== */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0">
        
        {/* ==================== SIDEBAR TRÁI (CÓ HÌNH TÒA NHÀ UTH Ở GÓC DƯỚI TRÁI THEO ẢNH) ==================== */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-purple-500/20 bg-[#0A081E]/95 flex flex-col justify-between relative overflow-hidden">
          {/* Phần trên Sidebar: Logo + Menu điều hướng */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto z-10">
            {/* Logo UTH-TrustID Quản trị hệ thống */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
              <div
                onClick={() => setActiveMenu('HOME')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.6)] border border-purple-300/40 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-none">
                    UTH-TrustID
                  </div>
                  <div className="text-xs font-medium text-purple-300 mt-1">
                    Quản trị hệ thống
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách Menu */}
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {/* 1. Trang chủ */}
              <button
                type="button"
                onClick={() => setActiveMenu('HOME')}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap ${
                  activeMenu === 'HOME'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-[0_6px_22px_rgba(139,92,246,0.48)]'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Trang chủ</span>
              </button>

              {/* 2. Quản lý người dùng (Có menu con: Sinh viên, Giảng viên, Quản trị viên) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleGroup('users');
                    setActiveMenu('USERS');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center justify-between whitespace-nowrap ${
                    activeMenu === 'USERS'
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Quản lý người dùng</span>
                  </span>
                  {expandedGroups.users ? (
                    <ChevronDown className="w-4 h-4 opacity-75 hidden lg:block" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-75 hidden lg:block" />
                  )}
                </button>

                {expandedGroups.users && (
                  <div className="hidden lg:flex flex-col pl-9 pr-2 space-y-1">
                    {[
                      { role: 'STUDENT', label: 'Sinh viên' },
                      { role: 'FACULTY', label: 'Giảng viên' },
                      { role: 'ADMIN', label: 'Quản trị viên' }
                    ].map((sub) => (
                      <button
                        key={sub.role}
                        type="button"
                        onClick={() => {
                          setActiveMenu('USERS');
                          setUserRoleFilter(sub.role);
                        }}
                        className={`text-left py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors flex items-center gap-2 ${
                          activeMenu === 'USERS' && userRoleFilter === sub.role
                            ? 'text-[#C084FC] bg-purple-500/15 font-bold'
                            : 'text-slate-400 hover:text-white bg-transparent'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Quản lý định danh (DID) */}
              <button
                type="button"
                onClick={() => setActiveMenu('DID')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap ${
                  activeMenu === 'DID'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <IdCard className="w-4 h-4 shrink-0" />
                <span>Quản lý định danh (DID)</span>
              </button>

              {/* 4. Chứng chỉ số (VC) */}
              <button
                type="button"
                onClick={() => setActiveMenu('VC')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap ${
                  activeMenu === 'VC'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Chứng chỉ số (VC)</span>
              </button>

              {/* 5. Quản trị xác thực (WebAuthn Passkey & Chính sách xác thực) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleGroup('auth');
                    setActiveMenu('AUTH');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center justify-between whitespace-nowrap ${
                    activeMenu === 'AUTH'
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Fingerprint className="w-4 h-4 shrink-0" />
                    <span>Quản trị xác thực</span>
                  </span>
                  {expandedGroups.auth ? (
                    <ChevronDown className="w-4 h-4 opacity-75 hidden lg:block" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-75 hidden lg:block" />
                  )}
                </button>

                {expandedGroups.auth && (
                  <div className="hidden lg:flex flex-col pl-9 pr-2 space-y-1">
                    {[
                      { id: 'AUTH', label: 'WebAuthn (Passkey)' },
                      { id: 'AUTH_POLICY', label: 'Chính sách xác thực' }
                    ].map((sub) => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => setActiveMenu('AUTH')}
                        className="text-left py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-transparent cursor-pointer border-none flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Hạ tầng & Blockchain (Merkle Tree, Ghi dữ liệu lên chuỗi, Trạng thái mạng) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleGroup('infra');
                    setActiveMenu('INFRA');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center justify-between whitespace-nowrap ${
                    activeMenu === 'INFRA'
                      ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 shrink-0" />
                    <span>Hạ tầng &amp; Blockchain</span>
                  </span>
                  {expandedGroups.infra ? (
                    <ChevronDown className="w-4 h-4 opacity-75 hidden lg:block" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-75 hidden lg:block" />
                  )}
                </button>

                {expandedGroups.infra && (
                  <div className="hidden lg:flex flex-col pl-9 pr-2 space-y-1">
                    {[
                      { label: 'Merkle Tree' },
                      { label: 'Ghi dữ liệu lên chuỗi' },
                      { label: 'Trạng thái mạng' }
                    ].map((sub) => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => setActiveMenu('INFRA')}
                        className="text-left py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-transparent cursor-pointer border-none flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Nhật ký & Giám sát */}
              <button
                type="button"
                onClick={() => setActiveMenu('AUDIT')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap ${
                  activeMenu === 'AUDIT'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Nhật ký &amp; Giám sát</span>
              </button>

              {/* 8. Báo cáo & Thống kê */}
              <button
                type="button"
                onClick={() => setActiveMenu('REPORTS')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap ${
                  activeMenu === 'REPORTS'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white shadow-md'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Báo cáo &amp; Thống kê</span>
              </button>

              {/* 9. Cấu hình hệ thống */}
              <button
                type="button"
                onClick={() => setActiveMenu('AUTH')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border-none transition-all flex items-center gap-3 whitespace-nowrap bg-transparent text-slate-300 hover:text-white hover:bg-white/5"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Cấu hình hệ thống</span>
              </button>
            </nav>
          </div>

          {/* Phối cảnh Tòa nhà Đại học UTH phát sáng ở chân Sidebar theo đúng mẫu ảnh */}
          <div className="hidden lg:block relative h-36 w-full overflow-hidden border-t border-purple-500/20 bg-gradient-to-t from-[#1A1142] via-[#120C30] to-transparent p-4">
            <div
              className="w-full h-full rounded-t-2xl border border-purple-400/35 bg-gradient-to-br from-[#2B1D66]/80 to-[#0D0924]/95 p-3 flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.35)]"
              style={{ transform: 'perspective(500px) rotateY(10deg)' }}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-purple-500/30 border border-purple-300/50 text-xs font-black tracking-widest text-white shadow-[0_0_14px_rgba(168,85,247,0.85)]">
                  UTH
                </span>
                <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Node Active
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 opacity-80">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-5 rounded-xs border ${
                      idx % 3 === 0
                        ? 'bg-amber-200/35 border-amber-200/40'
                        : 'bg-purple-300/25 border-purple-300/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ==================== CỘT PHẢI: TOPBAR + NỘI DUNG DASHBOARD TOÀN KHUNG ==================== */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          
          {/* TOPBAR TRÊN CÙNG */}
          <header className="h-16 sm:h-18 px-5 sm:px-8 border-b border-purple-500/20 bg-[#0A0820]/90 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0">
            <div className="text-xs sm:text-sm lg:text-base font-medium text-slate-300 truncate">
              Hệ thống định danh số và xác thực hiện diện phòng học
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMenu('AUDIT')}
                title="Cảnh báo hệ thống"
                className="relative w-10 h-10 rounded-xl bg-[#151232] hover:bg-[#1E1945] border border-purple-400/25 flex items-center justify-center text-slate-200 cursor-pointer"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 px-1 rounded-full bg-[#A855F7] text-[10px] font-bold text-white flex items-center justify-center">
                  1
                </span>
              </button>

              <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200/90 text-[#0B0920] flex items-center justify-center font-black text-sm shadow-md">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    Admin UTH
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    Quản trị hệ thống
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount && handleQuickSwitchAccount('giangvien@uth.edu.vn')
                }
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151232] hover:bg-[#1F1A48] border border-purple-400/30 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                ⇄ Cổng Giảng Viên
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </header>

          {/* VÙNG NỘI DUNG CHÍNH (TỰ ĐỘNG GIÃN ĐẦY KHUNG MÀN HÌNH) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-5">
            {adminStatusMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-xs sm:text-sm font-semibold text-emerald-200 flex items-center justify-between gap-2 shrink-0">
                <span>{adminStatusMsg}</span>
                <button
                  type="button"
                  onClick={() => setAdminStatusMsg('')}
                  className="text-slate-300 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 1: TRANG CHỦ QUẢN TRỊ VIÊN (KHỚP 100% VỚI ẢNH MẪU & VỪA KHÍT KHUNG)
               ========================================================================= */}
            {activeMenu === 'HOME' && (
              <div className="flex-1 flex flex-col justify-between gap-5 min-h-0">
                {/* Lời chào */}
                <div className="shrink-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white m-0 tracking-tight">
                    Xin chào, Quản trị viên 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-0">
                    Tổng quan hoạt động hệ thống UTH-TrustID
                  </p>
                </div>

                {/* HÀNG 1: 4 THẺ KPI GRADIENT CỠ LỚN (12.548 | 12.548 | 26.937 | 98,7%) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 shrink-0">
                  {/* Card 1: Tài khoản người dùng */}
                  <div
                    onClick={() => setActiveMenu('USERS')}
                    className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#2B1460] via-[#1F1147] to-[#140C30] border border-purple-400/40 shadow-[0_12px_35px_rgba(8,5,26,0.75)] flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-purple-500/25 border border-purple-300/45 flex items-center justify-center text-[#C084FC] shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="z-10">
                      <div className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold text-white leading-none">
                        12.548
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 mt-1.5 font-semibold">
                        Tài khoản người dùng
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        ▲ +3,2% <span className="text-slate-300 font-normal">so với tháng trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Định danh số (DID) */}
                  <div
                    onClick={() => setActiveMenu('DID')}
                    className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#132962] via-[#101F4C] to-[#0D1638] border border-blue-400/40 shadow-[0_12px_35px_rgba(8,5,26,0.75)] flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-blue-500/25 border border-blue-300/45 flex items-center justify-center text-sky-300 shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                      <IdCard className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="z-10">
                      <div className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold text-white leading-none">
                        12.548
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 mt-1.5 font-semibold">
                        Định danh số (DID)
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        ▲ +3,2%
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Chứng chỉ số (VC) */}
                  <div
                    onClick={() => setActiveMenu('VC')}
                    className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F384C] via-[#0D2B3E] to-[#0A1F2E] border border-teal-400/40 shadow-[0_12px_35px_rgba(8,5,26,0.75)] flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-teal-500/25 border border-teal-300/45 flex items-center justify-center text-teal-300 shrink-0 shadow-[0_0_20px_rgba(45,212,191,0.35)]">
                      <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="z-10">
                      <div className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold text-white leading-none">
                        26.937
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 mt-1.5 font-semibold">
                        Chứng chỉ số (VC)
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        ▲ +5,8%
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Tỷ lệ xác thực thành công */}
                  <div
                    onClick={() => setActiveMenu('AUDIT')}
                    className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#37155E] via-[#281047] to-[#180A2E] border border-fuchsia-400/40 shadow-[0_12px_35px_rgba(8,5,26,0.75)] flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-fuchsia-500/25 border border-fuchsia-300/45 flex items-center justify-center text-fuchsia-300 shrink-0 shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                      <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="z-10">
                      <div className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold text-white leading-none">
                        98,7%
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 mt-1.5 font-semibold">
                        Tỷ lệ xác thực thành công
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        ▲ +0,9%
                      </div>
                    </div>
                  </div>
                </section>

                {/* HÀNG 2: SƠ ĐỒ KIẾN TRÚC HỆ THỐNG (7 CỘT) + BIỂU ĐỒ THỐNG KÊ XÁC THỰC HIỆN DIỆN (5 CỘT) */}
                <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0">
                  
                  {/* Khối Trái (7 Cột): Kiến trúc hệ thống tương tác */}
                  <div className="xl:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-extrabold text-white m-0 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#C084FC]" />
                        <span>Kiến trúc hệ thống</span>
                      </h2>
                      <span className="text-xs text-purple-300 font-medium">
                        Bấm vào từng thành phần để quản trị trực tiếp
                      </span>
                    </div>

                    {/* Sơ đồ 3 Cột: Ứng dụng đầu cuối -> UTH-TrustID Core Services -> 3 Công nghệ lõi */}
                    <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 my-auto py-1">
                      {/* Cột 1 (4/11): 3 Phân hệ Người dùng */}
                      <div className="md:col-span-4 space-y-2.5">
                        {[
                          {
                            title: 'Ứng dụng Sinh viên',
                            sub: '(Mobile App)',
                            icon: <Smartphone className="w-5 h-5 text-[#C084FC]" />,
                            target: 'USERS'
                          },
                          {
                            title: 'Web Giảng viên',
                            sub: '(Teacher Portal)',
                            icon: <Laptop className="w-5 h-5 text-[#C084FC]" />,
                            target: 'USERS'
                          },
                          {
                            title: 'Web Quản trị',
                            sub: '(Admin Portal)',
                            icon: <Monitor className="w-5 h-5 text-[#C084FC]" />,
                            target: 'AUDIT'
                          }
                        ].map((node) => (
                          <div
                            key={node.title}
                            onClick={() => setActiveMenu(node.target)}
                            className="p-3 rounded-2xl bg-[#18133A] hover:bg-[#221B52] border border-purple-400/35 flex items-center gap-3 cursor-pointer transition-all hover:translate-x-0.5 shadow-md"
                          >
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-300/35 flex items-center justify-center shrink-0">
                              {node.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                                {node.title}
                              </div>
                              <div className="text-[11px] text-slate-300">{node.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cột 2 (3/11): Trung tâm UTH-TrustID Core Services */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center py-2">
                        <div
                          onClick={() => setActiveMenu('INFRA')}
                          className="w-full max-w-[175px] p-4 rounded-2xl bg-gradient-to-b from-[#2A1B6E] to-[#170F3E] border-2 border-purple-400/75 shadow-[0_0_35px_rgba(139,92,246,0.55)] flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#4F46E5] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.8)] mb-2">
                            <ShieldCheck className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-sm sm:text-base font-black text-white tracking-tight">
                            UTH-TrustID
                          </div>
                          <div className="text-[11px] text-purple-200 mt-0.5">
                            Core Services
                          </div>
                        </div>
                      </div>

                      {/* Cột 3 (4/11): 3 Công nghệ cốt lõi */}
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
                            target: 'AUTH'
                          },
                          {
                            title: 'Merkle Tree',
                            sub: 'Bảo toàn dữ liệu',
                            icon: <GitBranch className="w-5 h-5 text-emerald-300" />,
                            target: 'INFRA'
                          }
                        ].map((tech) => (
                          <div
                            key={tech.title}
                            onClick={() => setActiveMenu(tech.target)}
                            className="p-3 rounded-2xl bg-[#18133A] hover:bg-[#221B52] border border-purple-400/35 flex items-center gap-3 cursor-pointer transition-all hover:-translate-x-0.5 shadow-md"
                          >
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-300/35 flex items-center justify-center shrink-0">
                              {tech.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                                {tech.title}
                              </div>
                              <div className="text-[11px] text-slate-300 truncate">{tech.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Khối Phải (5 Cột): Thống kê xác thực hiện diện (Combo Bar + Line Chart 2 trục tung) */}
                  <div className="xl:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-[0_16px_45px_rgba(5,4,18,0.7)] flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-extrabold text-white m-0 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#C084FC]" />
                        <span>Thống kê xác thực hiện diện</span>
                      </h2>
                      <span className="px-3 py-1 rounded-xl bg-[#181438] border border-purple-400/30 text-xs font-semibold text-slate-200">
                        7 ngày gần nhất ⌄
                      </span>
                    </div>

                    {/* Biểu đồ kết hợp Cột + Đường 7 ngày */}
                    <div className="my-auto pt-2">
                      <svg className="w-full h-48 sm:h-52 overflow-visible" viewBox="0 0 460 185">
                        <defs>
                          <linearGradient id="adminBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#C084FC" />
                            <stop offset="100%" stopColor="#5B21B6" />
                          </linearGradient>
                        </defs>

                        {/* Lưới ngang & Nhãn 2 trục tung */}
                        {[
                          { y: 18, left: '1.000', right: '100%' },
                          { y: 46, left: '800', right: '98%' },
                          { y: 74, left: '600', right: '96%' },
                          { y: 102, left: '400', right: '94%' },
                          { y: 130, left: '200', right: '92%' },
                          { y: 158, left: '0', right: '90%' }
                        ].map((r) => (
                          <g key={r.left}>
                            <text
                              x="0"
                              y={r.y + 4}
                              fill="#94A3B8"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {r.left}
                            </text>
                            <line
                              x1="34"
                              y1={r.y}
                              x2="418"
                              y2={r.y}
                              stroke="rgba(148, 163, 184, 0.14)"
                            />
                            <text
                              x="424"
                              y={r.y + 4}
                              fill="#94A3B8"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {r.right}
                            </text>
                          </g>
                        ))}

                        {/* 7 Cột Số lượt xác thực */}
                        {SEVEN_DAY_AUTH_STATS.map((item, idx) => {
                          const x = 48 + idx * 54;
                          const barH = (item.count / 1000) * 140;
                          const barY = 158 - barH;
                          return (
                            <g key={item.date}>
                              <rect
                                x={x}
                                y={barY}
                                width="26"
                                height={barH}
                                rx="5"
                                fill="url(#adminBarGrad)"
                                opacity="0.92"
                              />
                              <text
                                x={x + 13}
                                y="176"
                                textAnchor="middle"
                                fill="#CBD5E1"
                                fontSize="10.5"
                                fontWeight="600"
                              >
                                {item.date}
                              </text>
                            </g>
                          );
                        })}

                        {/* Đường gấp khúc Tỷ lệ thành công */}
                        <path
                          d="M 61 52 L 115 44 L 169 36 L 223 41 L 277 31 L 331 30 L 385 24"
                          fill="none"
                          stroke="#F8FAFC"
                          strokeWidth="2.4"
                        />
                        {[
                          { x: 61, y: 52 },
                          { x: 115, y: 44 },
                          { x: 169, y: 36 },
                          { x: 223, y: 41 },
                          { x: 277, y: 31 },
                          { x: 331, y: 30 },
                          { x: 385, y: 24 }
                        ].map((pt, i) => (
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

                    {/* Chú giải biểu đồ */}
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-300 pt-1">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-[#A855F7]" />
                        <span>Số lượt xác thực</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-0.5 bg-white inline-block relative">
                          <span className="w-2 h-2 rounded-full border border-white bg-[#100D28] absolute -top-[3px] left-0.5" />
                        </span>
                        <span>Tỷ lệ thành công</span>
                      </span>
                    </div>
                  </div>
                </section>

                {/* HÀNG 3: 3 KHỐI VẬN HÀNH DƯỚI CÙNG (TRẠNG THÁI DỊCH VỤ | HOẠT ĐỘNG GẦN ĐÂY | CẢNH BÁO HỆ THỐNG) */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">
                  
                  {/* Khối 1 (4 Cột): Trạng thái dịch vụ */}
                  <div className="lg:col-span-4 p-5 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-[0_14px_38px_rgba(5,4,18,0.7)] space-y-3">
                    <h3 className="text-sm sm:text-base font-extrabold text-white m-0 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C084FC]" />
                      <span>Trạng thái dịch vụ</span>
                    </h3>

                    <div className="space-y-2">
                      {[
                        {
                          label: 'Dịch vụ định danh (DID)',
                          icon: <IdCard className="w-4 h-4 text-[#C084FC]" />
                        },
                        {
                          label: 'Dịch vụ xác thực (WebAuthn)',
                          icon: <Fingerprint className="w-4 h-4 text-[#C084FC]" />
                        },
                        {
                          label: 'Dịch vụ Merkle Tree',
                          icon: <GitBranch className="w-4 h-4 text-[#C084FC]" />
                        },
                        {
                          label: 'Kết nối Blockchain',
                          icon: <Box className="w-4 h-4 text-[#C084FC]" />
                        }
                      ].map((svc) => (
                        <div
                          key={svc.label}
                          className="p-2.5 px-3 rounded-xl bg-[#171336] border border-purple-500/20 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                              {svc.icon}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                              {svc.label}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold shrink-0">
                            Hoạt động
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 2 (4 Cột): Hoạt động gần đây */}
                  <div className="lg:col-span-4 p-5 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-[0_14px_38px_rgba(5,4,18,0.7)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-extrabold text-white m-0 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#C084FC]" />
                        <span>Hoạt động gần đây</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('AUDIT')}
                        className="text-xs font-semibold text-slate-300 hover:text-white bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Xem tất cả</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-purple-500/15">
                      {RECENT_ACTIVITIES.map((act) => (
                        <div
                          key={act.id}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/35 flex items-center justify-center shrink-0">
                              {act.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-white truncate">
                                {act.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {act.sub}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {act.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 3 (4 Cột): Cảnh báo hệ thống */}
                  <div className="lg:col-span-4 p-5 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-[0_14px_38px_rgba(5,4,18,0.7)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-extrabold text-white m-0 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#C084FC]" />
                        <span>Cảnh báo hệ thống</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('AUDIT')}
                        className="text-xs font-semibold text-slate-300 hover:text-white bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Xem tất cả</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-purple-500/15">
                      {SYSTEM_WARNINGS.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => setActiveMenu('AUDIT')}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${w.iconBg}`}
                            >
                              {w.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-white truncate">
                                {w.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {w.sub}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {w.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 2: QUẢN LÝ NGƯỜI DÙNG (SINH VIÊN / GIẢNG VIÊN / QUẢN TRỊ VIÊN)
               ========================================================================= */}
            {activeMenu === 'USERS' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                      Quản lý tài khoản người dùng
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
                      Quản lý danh sách Sinh viên, Giảng viên và Quản trị viên toàn trường UTH
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: 'Tất cả' },
                      { id: 'STUDENT', label: 'Sinh viên' },
                      { id: 'FACULTY', label: 'Giảng viên' },
                      { id: 'ADMIN', label: 'Quản trị viên' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setUserRoleFilter(tab.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                          userRoleFilter === tab.id
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white border-purple-300/40'
                            : 'bg-[#171336] text-slate-300 border-purple-500/20 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo mã số, họ tên, email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-purple-400"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#0B0920]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/20 bg-[#161236] text-slate-300">
                        <th className="p-4 font-bold">Mã định danh</th>
                        <th className="p-4 font-bold">Họ và tên</th>
                        <th className="p-4 font-bold">Email UTH</th>
                        <th className="p-4 font-bold">Vai trò</th>
                        <th className="p-4 font-bold">Chuỗi W3C DID</th>
                        <th className="p-4 font-bold text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/15">
                      {usersList
                        .filter((u) => {
                          if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                          const q = userSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            u.id.toLowerCase().includes(q) ||
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{u.id}</td>
                            <td className="p-4 font-semibold text-white">
                              {u.name}
                              <span className="block text-xs text-slate-400 font-normal">
                                {u.dept}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">{u.email}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/35 text-purple-200 text-xs font-bold">
                                {u.role === 'STUDENT'
                                  ? 'Sinh viên'
                                  : u.role === 'FACULTY'
                                  ? 'Giảng viên'
                                  : 'Quản trị'}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-sky-300">{u.did}</td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setUsersList((prev) =>
                                    prev.map((item) =>
                                      item.id === u.id
                                        ? {
                                            ...item,
                                            status:
                                              item.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
                                          }
                                        : item
                                    )
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                    : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
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
                MÀN HÌNH 3: QUẢN LÝ ĐỊNH DANH (DID) & THU HỒI KHÓA THIẾT BỊ ĐỘC LẬP O(1)
               ========================================================================= */}
            {activeMenu === 'DID' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                      Quản lý định danh số (W3C DID) &amp; Thu hồi khóa O(1)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
                      Vô hiệu hóa hoặc khôi phục thiết bị sinh viên tức thì mà không làm thay đổi Merkle Root của các sinh viên khác
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-mono font-bold">
                    Đã thu hồi: {(revokedKeysList || []).length} DID
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <label className="text-xs sm:text-sm font-bold text-slate-200 block">
                      Địa chỉ Ví / Khóa công khai DID cần thu hồi hoặc khôi phục:
                    </label>
                    <input
                      value={revokeAddressInput}
                      onChange={(e) => setRevokeAddressInput(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#0B0920] border border-purple-400/35 text-xs sm:text-sm font-mono text-purple-200 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="lg:col-span-4 grid grid-cols-2 gap-3 pt-2 lg:pt-6">
                    <button
                      type="button"
                      onClick={() => handleAdminRevokeWallet()}
                      className="py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs sm:text-sm cursor-pointer border-none shadow-lg inline-flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Thu hồi khóa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminUnrevokeWallet()}
                      className="py-3.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs sm:text-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Khôi phục</span>
                    </button>
                  </div>
                </div>

                {/* Danh bạ thiết bị 1-chạm */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={deviceSearchQuery}
                        onChange={(e) => setDeviceSearchQuery(e.target.value)}
                        placeholder="Tìm MSSV, họ tên hoặc địa chỉ ví 0x..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171336] border border-purple-400/25 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#171336] p-1 rounded-xl border border-purple-500/25">
                      {[
                        { id: 'ALL', label: 'Tất cả' },
                        { id: 'ACTIVE', label: 'Đang hoạt động' },
                        { id: 'REVOKED', label: 'Đã thu hồi' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDeviceStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none ${
                            deviceStatusFilter === tab.id
                              ? 'bg-[#8B5CF6] text-white'
                              : 'bg-transparent text-slate-300 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {directoryList.map((item) => {
                      const revoked = isAddressRevoked(item.address);
                      return (
                        <div
                          key={item.studentId}
                          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                            revoked
                              ? 'bg-rose-500/10 border-rose-500/35'
                              : 'bg-[#161236] border-purple-500/20 hover:border-purple-400/45'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white">
                              {item.fullName}{' '}
                              <span className="font-mono text-[#C084FC]">({item.studentId})</span>
                            </div>
                            <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                              DID Key: {item.address}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                revoked
                                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                              }`}
                            >
                              {revoked ? 'Đã thu hồi' : 'Hợp lệ'}
                            </span>

                            {revoked ? (
                              <button
                                type="button"
                                onClick={() => handleAdminUnrevokeWallet(item.address)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer border-none"
                              >
                                Khôi phục khóa
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAdminRevokeWallet(item.address)}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 font-bold text-xs cursor-pointer"
                              >
                                Thu hồi khóa
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 4: CHỨNG CHỈ SỐ (VC) & HẠ TẦNG BLOCKCHAIN / MERKLE TREE 3 TẦNG
               ========================================================================= */}
            {(activeMenu === 'VC' || activeMenu === 'INFRA') && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                      Cấp phát lô Chứng chỉ số (W3C VC) &amp; Cây băm Merkle Tree
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
                      Băm Keccak256 danh sách sinh viên và neo Merkle Root lên Smart Contract O(log N)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center bg-[#171336] p-1 rounded-xl border border-purple-500/25 gap-1">
                      <button
                        type="button"
                        onClick={() => setIssuanceMode('VISUAL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none ${
                          issuanceMode === 'VISUAL'
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-transparent text-slate-300'
                        }`}
                      >
                        Bảng trực quan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIssuanceMode('JSON')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none ${
                          issuanceMode === 'JSON'
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-transparent text-slate-300'
                        }`}
                      >
                        JSON
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoadPresetBatch}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nạp danh sách mẫu</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 space-y-3">
                    {issuanceMode === 'VISUAL' ? (
                      <>
                        <form
                          onSubmit={handleAddStudentToBatch}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3.5 rounded-2xl bg-[#161236] border border-purple-500/20"
                        >
                          <input
                            type="text"
                            required
                            placeholder="MSSV"
                            value={newBatchStudent.studentId}
                            onChange={(e) =>
                              setNewBatchStudent((p) => ({ ...p, studentId: e.target.value }))
                            }
                            className="sm:col-span-3 p-2.5 rounded-xl bg-[#0B0920] border border-purple-400/30 text-xs text-white font-mono outline-none"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Họ và tên sinh viên"
                            value={newBatchStudent.fullName}
                            onChange={(e) =>
                              setNewBatchStudent((p) => ({ ...p, fullName: e.target.value }))
                            }
                            className="sm:col-span-4 p-2.5 rounded-xl bg-[#0B0920] border border-purple-400/30 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Chuyên ngành"
                            value={newBatchStudent.major}
                            onChange={(e) =>
                              setNewBatchStudent((p) => ({ ...p, major: e.target.value }))
                            }
                            className="sm:col-span-3 p-2.5 rounded-xl bg-[#0B0920] border border-purple-400/30 text-xs text-white outline-none"
                          />
                          <button
                            type="submit"
                            className="sm:col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white font-extrabold text-xs border-none cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm</span>
                          </button>
                        </form>

                        <div className="rounded-2xl bg-[#0B0920] border border-purple-500/20 max-h-56 overflow-y-auto divide-y divide-purple-500/15">
                          {parsedBatchAll.map((st, idx) => (
                            <div
                              key={`${st.studentId}-${idx}`}
                              className="p-3.5 flex items-center justify-between gap-2 text-xs sm:text-sm"
                            >
                              <div>
                                <strong className="text-white">{st.fullName || st.name}</strong>{' '}
                                <span className="font-mono text-[#C084FC]">({st.studentId})</span>
                                <span className="block text-xs font-mono text-slate-400">
                                  {st.address}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudentFromBatch(st.studentId)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <textarea
                        value={batchJson}
                        onChange={(e) => setBatchJson(e.target.value)}
                        rows={8}
                        className="w-full p-4 rounded-2xl bg-[#0B0920] border border-purple-400/30 text-xs font-mono text-sky-200 outline-none"
                      />
                    )}
                  </div>

                  <div className="lg:col-span-4 p-5 rounded-2xl bg-[#161236] border border-purple-400/30 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/20 border border-purple-400/35 text-purple-200 text-xs font-bold">
                        ON-CHAIN MERKLE ANCHOR
                      </span>
                      <h3 className="text-base font-extrabold text-white m-0">
                        Ghi dữ liệu lên chuỗi ({parsedBatchAll.length} SV)
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed m-0">
                        Merkle Root hiện tại:{' '}
                        <code className="text-amber-300 font-mono break-all">{rootDisplay}</code>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdminIssueMerkleBatch}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm border-none shadow-[0_10px_28px_rgba(139,92,246,0.5)] cursor-pointer"
                    >
                      Băm Keccak256 &amp; Ghi Merkle Root
                    </button>
                  </div>
                </div>

                {/* Cây Merkle Tương tác 3 Tầng */}
                <div className="p-5 rounded-2xl bg-[#161236] border border-purple-400/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-extrabold text-[#C084FC] uppercase">
                      Cây Merkle Tương Tác 3 Tầng (Bấm vào từng lá để kiểm tra đường dẫn Proof)
                    </span>
                    <span className="font-mono text-emerald-300">
                      Đang kiểm chứng: {sampleLeaves[activeLeafIdx]?.fullName} (L{activeLeafIdx + 1})
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="px-6 py-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/60 text-center max-w-md w-full">
                      <div className="text-[10px] font-bold text-purple-200 uppercase">
                        Tầng 1 • On-Chain Merkle Root
                      </div>
                      <div className="text-xs font-mono font-bold text-white truncate">
                        {rootDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-xl border text-center ${
                        isLeftBranchActive
                          ? 'bg-purple-500/20 border-purple-400'
                          : 'bg-[#0B0920] border-purple-500/20 opacity-75'
                      }`}
                    >
                      <div className="text-xs font-bold text-purple-200">
                        Nhánh Trái H₁₂ = Keccak256(L₁ ‖ L₂)
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-xl border text-center ${
                        !isLeftBranchActive
                          ? 'bg-purple-500/20 border-purple-400'
                          : 'bg-[#0B0920] border-purple-500/20 opacity-75'
                      }`}
                    >
                      <div className="text-xs font-bold text-purple-200">
                        Nhánh Phải H₃₄ = Keccak256(L₃ ‖ L₄)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sampleLeaves.slice(0, 4).map((st, idx) => {
                      const isTarget = activeLeafIdx === idx;
                      const isSibling = siblingLeafIdx === idx;
                      return (
                        <button
                          key={st.studentId || idx}
                          type="button"
                          onClick={() => setSelectedMerkleLeafIdx(idx)}
                          className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isTarget
                              ? 'bg-emerald-500/20 border-emerald-400'
                              : isSibling
                              ? 'bg-purple-500/20 border-purple-400'
                              : 'bg-[#0B0920] border-purple-500/20 opacity-80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-purple-200 font-bold">Lá L{idx + 1}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                              {isTarget ? 'TARGET' : isSibling ? 'SIBLING' : 'LEAF'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                            {st.fullName || st.name}
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                            MSSV: {st.studentId}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 5: QUẢN TRỊ XÁC THỰC & CẤU HÌNH HỆ THỐNG
               ========================================================================= */}
            {activeMenu === 'AUTH' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
                    Quản trị xác thực WebAuthn (Passkey) &amp; Chính sách an ninh
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
                    Thiết lập chính sách xác thực không mật khẩu FIDO2, chu kỳ mã QR Nonce và hàng rào địa lý Geofencing
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      key: 'requireWebAuthn',
                      title: 'Bắt buộc xác thực khóa bảo mật WebAuthn (FIDO2 Passkey)',
                      desc: 'Yêu cầu chữ ký phần cứng sinh trắc học thiết bị khi sinh viên quét mã điểm danh'
                    },
                    {
                      key: 'requireGeofence',
                      title: 'Bắt buộc kiểm tra định vị phòng học (Haversine Geofencing)',
                      desc: 'Từ chối tự động các yêu cầu điểm danh nằm ngoài bán kính phòng học hoặc dùng Mock GPS'
                    },
                    {
                      key: 'autoBlockReplay',
                      title: 'Tự động khóa giao dịch Replay Attack (QR Nonce hết hạn)',
                      desc: 'Chặn tức thì mã lỗi 403 khi phát hiện ảnh chụp màn hình mã QR cũ gửi qua mạng xã hội'
                    }
                  ].map((pol) => (
                    <div
                      key={pol.key}
                      className="p-5 rounded-2xl bg-[#161236] border border-purple-400/25 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-bold text-white">
                          {pol.title}
                        </div>
                        <p className="text-xs text-slate-400 m-0 leading-relaxed">{pol.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={authPolicy[pol.key]}
                        onChange={(e) =>
                          setAuthPolicy({ ...authPolicy, [pol.key]: e.target.checked })
                        }
                        className="w-5 h-5 rounded accent-[#8B5CF6] cursor-pointer shrink-0 mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                MÀN HÌNH 6: NHẬT KÝ & GIÁM SÁT (SOC TELEMETRY + SỔ CÁI KIỂM TOÁN)
               ========================================================================= */}
            {(activeMenu === 'AUDIT' || activeMenu === 'REPORTS') && (
              <div className="space-y-6">
                <div className="p-6 sm:p-7 rounded-3xl bg-[#100D28]/90 border border-purple-500/25 shadow-2xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-400" />
                        <span>Nhật ký &amp; Giám sát An ninh (SOC Anti-Fraud Telemetry)</span>
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportAuditLogsCSV}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xuất nhật ký (.CSV)</span>
                      </button>
                      <button
                        type="button"
                        onClick={fetchAdminAuditLogs}
                        className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Đồng bộ</span>
                      </button>
                    </div>
                  </div>

                  {/* Thanh giả lập tấn công kiểm thử */}
                  <div className="p-4 rounded-2xl bg-[#161236] border border-purple-400/30 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-extrabold text-[#C084FC]">
                      ⚡ Kiểm thử phòng vệ trực tiếp (Giả lập tấn công 4 lớp):
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

                  {/* Danh sách cảnh báo & nhật ký */}
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {(securityAlerts || []).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-2xl bg-[#161236] border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
                      >
                        <div className="space-y-1 flex-1 min-w-[240px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-slate-400">[{alert.time}]</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/40 text-rose-300 font-mono font-bold text-xs">
                              {alert.vectorLabel || alert.type}
                            </span>
                            {alert.studentName && (
                              <strong className="text-white">
                                {alert.studentName} ({alert.studentId})
                              </strong>
                            )}
                          </div>
                          <p className="text-slate-200 m-0">{alert.detail}</p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                          ✓ ĐÃ CHẶN TỰ ĐỘNG (403)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
