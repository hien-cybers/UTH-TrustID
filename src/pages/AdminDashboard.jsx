import React, { useState } from 'react';
import AdminGateway from '../components/AdminGateway';
import { ShieldAlert, Key, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [targetAddress, setTargetAddress] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const handleRevoke = async () => {
    if (!targetAddress) return alert("Vui lòng nhập địa chỉ ví");
    try {
      const res = await fetch('/api/identity/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: targetAddress })
      });
      const data = await res.json();
      setActionMessage(`Đã thu hồi khẩn cấp ví: ${targetAddress}`);
      alert(data.message || `Đã gửi lệnh thu hồi khẩn cấp cho ví: ${targetAddress}`);
    } catch {
      alert(`Đã gửi lệnh thu hồi khẩn cấp cho ví: ${targetAddress}`);
    }
  };

  const handleReactivate = async () => {
    if (!targetAddress) return alert("Vui lòng nhập địa chỉ ví");
    try {
      const res = await fetch('/api/identity/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: targetAddress })
      });
      const data = await res.json();
      setActionMessage(`Đã kích hoạt lại ví: ${targetAddress}`);
      alert(data.message || `Đã gửi lệnh kích hoạt lại cho ví: ${targetAddress}`);
    } catch {
      alert(`Đã gửi lệnh kích hoạt lại cho ví: ${targetAddress}`);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    localStorage.removeItem('connected_wallet_address');
    alert("Đã đăng xuất phiên Quản trị viên.");
    window.location.href = '/portal';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Admin Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-100">
              Bảng Điều Khiển Quản Trị Hệ Thống (Root Issuer / Admin)
            </h2>
            <p className="text-xs text-slate-400">
              Khu vực bảo mật cao được bảo vệ bởi Route Guard & Khóa On-Chain
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

      {/* Quick Action: Revoke / Reactivate manual form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-semibold text-sm text-slate-200">
          Quản lý trạng thái danh tính sinh viên theo địa chỉ ví
        </h3>
        <input
          type="text"
          placeholder="Nhập địa chỉ ví sinh viên cần can thiệp (0x...)"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        />

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={handleRevoke}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-rose-900/30"
          >
            Thu hồi danh tính (Revoke)
          </button>
          <button
            onClick={handleReactivate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/30"
          >
            Kích hoạt lại (Reactivate)
          </button>
        </div>

        {actionMessage && (
          <p className="text-xs text-cyan-400 pt-1 flex items-center space-x-1">
            <CheckCircle size={14} />
            <span>{actionMessage}</span>
          </p>
        )}
      </div>

      {/* Comprehensive Admin Gateway Component (Full Registry, Audit Logs, Attack Vectors) */}
      <AdminGateway />
    </div>
  );
}

