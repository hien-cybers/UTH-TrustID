// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';
import AdminGateway from '../components/AdminGateway';
import {
  ShieldAlert,
  Search,
  Upload,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  LogOut,
  Flame,
  Layers,
  Lock
} from 'lucide-react';

export default function AdminDashboard() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [query, setQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState(null);

  // 1. Tra cứu theo MSSV hoặc Token mã hoá
  const handleAdminSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSearchTarget(null);
      return;
    }
    const result = students.find(s => s.mssv.toLowerCase() === q || s.qrCodeToken.toLowerCase() === q);
    setSearchTarget(result || "NOT_FOUND");
  };

  // 2. Nạp danh sách qua tệp JSON/JS
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
          alert(`Đã nạp thành công ${parsed.length} sinh viên từ file!`);
        } else {
          alert("File JSON phải chứa một mảng danh sách sinh viên.");
        }
      } catch (err) {
        alert("Định dạng file không hợp lệ! Vui lòng tải file JSON chứa mảng sinh viên.");
      }
    };
    reader.readAsText(file);
  };

  // 3. Đổi trạng thái danh tính (Revoke / Reactivate)
  const toggleStudentStatus = (mssv) => {
    setStudents(prev => prev.map(s => {
      if (s.mssv === mssv) {
        const newStatus = s.status === 'Active' ? 'Revoked' : 'Active';
        return { ...s, status: newStatus };
      }
      return s;
    }));

    // Đồng bộ nếu đang hiển thị kết quả tìm kiếm
    if (searchTarget && searchTarget.mssv === mssv) {
      setSearchTarget(prev => ({
        ...prev,
        status: prev.status === 'Active' ? 'Revoked' : 'Active'
      }));
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    localStorage.removeItem('connected_wallet_address');
    alert("Đã đăng xuất phiên Quản trị viên.");
    window.location.href = '/portal';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-xl text-slate-100">
              🔒 Bảng Quản Trị Cấp Cao (Root Issuer / Admin)
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý vòng đời danh tính, cấp phát Merkle Tree, nạp hồ sơ JSON & giám sát IDS
            </p>
          </div>
        </div>

        <button
          onClick={handleAdminLogout}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs rounded-xl border border-slate-700 hover:border-rose-800 transition self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Đăng xuất Admin</span>
        </button>
      </div>

      {/* KHỐI 1: TRA CỨU SINH VIÊN BẰNG MSSV HOẶC TOKEN MÃ HÓA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-200 flex items-center space-x-2">
            <Search size={18} className="text-cyan-400" />
            <span>Tra Cứu Sinh Viên Bằng MSSV hoặc Token Mã Hóa</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu nhanh hồ sơ sinh viên để kiểm tra hoặc can thiệp trạng thái danh tính:
          </p>
        </div>

        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Nhập MSSV hoặc chuỗi Token mã hóa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={handleAdminSearch}
            className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-cyan-900/30 flex items-center space-x-1"
          >
            <Search size={14} />
            <span>Tra Cứu</span>
          </button>
        </div>

        {searchTarget === "NOT_FOUND" && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <XCircle size={15} />
            <span>Không tìm thấy hồ sơ sinh viên phù hợp.</span>
          </div>
        )}

        {searchTarget && searchTarget !== "NOT_FOUND" && (
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-cyan-500/40 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <p className="font-bold text-sm sm:text-base text-slate-100">
                  {searchTarget.fullName} <span className="text-cyan-400 font-mono">({searchTarget.mssv})</span>
                </p>
                <p className="text-xs text-slate-400">{searchTarget.classId} - {searchTarget.major}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    searchTarget.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}
                >
                  {searchTarget.status}
                </span>

                <button
                  onClick={() => toggleStudentStatus(searchTarget.mssv)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                    searchTarget.status === 'Active'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  }`}
                >
                  {searchTarget.status === 'Active' ? "Thu hồi (Revoke)" : "Kích hoạt lại (Reactivate)"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">DID On-chain:</span>
                <span className="text-cyan-300 break-all">{searchTarget.didAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Mã Token Mã Hóa:</span>
                <span className="text-emerald-300 break-all">{searchTarget.qrCodeToken}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KHỐI 2: NẠP DANH SÁCH & BẢNG SINH VIÊN TOÀN TRƯỜNG */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-200 flex items-center space-x-2">
              <Users size={18} className="text-emerald-400" />
              <span>Danh Sách Sinh Viên Toàn Trường ({students.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ cơ sở dữ liệu đối soát danh tính on-chain và mã định danh SHA-256
            </p>
          </div>

          <label className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 self-start sm:self-auto">
            <Upload size={14} />
            <span>📁 Nạp Danh Sách (JSON/JS)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                <th className="pb-3 px-2">MSSV</th>
                <th className="pb-3 px-2">Họ & Tên</th>
                <th className="pb-3 px-2">Chuyên Ngành</th>
                <th className="pb-3 px-2">Token Mã Hóa</th>
                <th className="pb-3 px-2 text-center">Trạng Thái</th>
                <th className="pb-3 px-2 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {students.map((st) => (
                <tr key={st.mssv} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-2 text-cyan-300 font-bold">{st.mssv}</td>
                  <td className="py-3 px-2 font-sans text-slate-200 font-medium">{st.fullName}</td>
                  <td className="py-3 px-2 font-sans text-slate-300">{st.major}</td>
                  <td className="py-3 px-2 text-slate-400">
                    <code>{st.qrCodeToken.slice(0, 16)}...</code>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                        st.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-sans">
                    <button
                      onClick={() => toggleStudentStatus(st.mssv)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                        st.status === 'Active'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {st.status === 'Active' ? "Revoke" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KHỐI 3: COMPREHENSIVE ADMIN GATEWAY (MERKLE TREE BATCH, IDS ALERTS, TEST SUITE) */}
      <AdminGateway />
    </div>
  );
}
