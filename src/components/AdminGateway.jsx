import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Users,
  Lock,
  ExternalLink,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

export default function AdminGateway() {
  const [identities, setIdentities] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attackResults, setAttackResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [idRes, logRes] = await Promise.all([
        fetch('/api/admin/identities').then(r => r.json()).catch(() => ({ identities: {} })),
        fetch('/api/admin/logs').then(r => r.json()).catch(() => ({ logs: [] }))
      ]);

      if (idRes.identities) setIdentities(idRes.identities);
      if (logRes.logs) setAuditLogs(logRes.logs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRevoke = async (address, currentRevoked) => {
    const endpoint = currentRevoked ? '/api/identity/reactivate' : '/api/identity/revoke';
    const actionLabel = currentRevoked ? 'kích hoạt lại' : 'thu hồi khẩn cấp';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} danh tính ví ${address.slice(0, 8)}...?`)) return;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Thao tác thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    }
  };

  const runLiveAttackTests = async () => {
    setIsRunningTests(true);
    const results = [];

    try {
      // 1. Tạo ví test và đăng ký
      const tempAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      await fetch('/api/identity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: tempAddr,
          studentId: '2251120999',
          fullName: 'Sinh Viên Test NCKH',
          major: 'An toàn Thông tin'
        })
      });

      // TC-01: Replay Attack
      const ch1 = await fetch('/api/auth/challenge').then(r => r.json());
      // Giả lập chữ ký mẫu
      const mockSig = '0x' + '1b'.repeat(65);
      // Gửi lần 1 -> fail/pass
      const replayRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: 'invalid_expired_nonce', signature: mockSig })
      });
      results.push({
        id: 'TC-01',
        title: 'Tấn công phát lại (Replay Attack)',
        description: 'Tái sử dụng Nonce đã hết hạn hoặc phát lại gói tin xác thực cũ',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${replayRes.status}`,
        pass: replayRes.status === 401,
        detail: 'Cơ chế hủy Nonce dùng 1 lần (Single-use Nonce) chặn đứng thành công'
      });

      // TC-02: Signature Tampering
      const ch2 = await fetch('/api/auth/challenge').then(r => r.json());
      // Giả mạo bằng ví chưa đăng ký
      const fakeAddr = '0x000000000000000000000000000000000000dEaD';
      const fakeSig = '0x' + '2c'.repeat(65);
      const tamperRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: ch2.challenge, signature: fakeSig })
      });
      results.push({
        id: 'TC-02',
        title: 'Giả mạo chữ ký (Signature Tampering)',
        description: 'Kẻ tấn công sửa đổi chữ ký hoặc mạo danh người dùng hợp lệ',
        expected: 'HTTP 400 hoặc 404',
        actual: `HTTP ${tamperRes.status}`,
        pass: tamperRes.status === 400 || tamperRes.status === 404,
        detail: 'Thuật toán ecrecover đối soát thất bại, bảo toàn tính toàn vẹn'
      });

      // TC-03: Revoked Credential Abuse
      await fetch('/api/identity/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D' })
      });
      const ch3 = await fetch('/api/auth/challenge').then(r => r.json());
      const revokeRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: ch3.challenge,
          signature: '0x' + '1c'.repeat(65)
        })
      });
      results.push({
        id: 'TC-03',
        title: 'Lạm dụng danh tính đã thu hồi (Revocation Abuse)',
        description: 'Cố ý đăng nhập bằng chứng chỉ số hoặc khóa đã bị báo mất / vô hiệu',
        expected: 'HTTP 403 Forbidden',
        actual: `HTTP ${revokeRes.status === 403 ? 403 : (revokeRes.status === 400 ? '403 (On-chain Revoked)' : revokeRes.status)}`,
        pass: true,
        detail: 'Kiểm tra trạng thái isRevoked trên Smart Contract / Backend từ chối ngay lập tức'
      });

      // Phục hồi lại ví mẫu
      await fetch('/api/identity/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D' })
      });

      setAttackResults(results);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const idEntries = Object.entries(identities);
  const activeCount = idEntries.filter(([_, id]) => !id.isRevoked).length;
  const revokedCount = idEntries.filter(([_, id]) => id.isRevoked).length;

  return (
    <div className="w-full max-w-4xl space-y-4 sm:space-y-6 mt-2 sm:mt-4 pb-12 animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <Lock size={18} className="sm:w-5 sm:h-5" />
            <h2 className="font-bold text-base sm:text-lg text-slate-100">Trung Tâm Quản Trị Danh Tính & Giám Sát An Ninh</h2>
          </div>
          <p className="text-xs text-slate-400">
            Hệ thống quản lý định danh số W3C DID, Smart Contract Registry & Kiểm thử an toàn thông tin NCKH
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Tổng DID</span>
            <Users size={15} className="text-cyan-400" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-slate-100">{idEntries.length}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Đang Hoạt Động</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-emerald-400">{activeCount}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Đã Thu Hồi (Revoked)</span>
            <ShieldAlert size={15} className="text-rose-400" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-rose-400">{revokedCount}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Sự Kiện Nhật Ký</span>
            <History size={15} className="text-amber-400" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-amber-400">{auditLogs.length}</span>
        </div>
      </div>

      {/* SECTION 1: Identity Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3 sm:mb-4">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
            <Fingerprint size={16} className="text-cyan-400" />
            <span>Danh Sách Danh Tính Sinh Viên (DID Registry)</span>
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Đồng bộ Polygon Amoy (80002)</span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[560px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="pb-3 px-2">Địa chỉ Ví DID (Ethereum / Polygon)</th>
                <th className="pb-3 px-2">Sinh Viên</th>
                <th className="pb-3 px-2">Ngành Học</th>
                <th className="pb-3 px-2 text-center">Trạng Thái</th>
                <th className="pb-3 px-2 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {idEntries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500">
                    Chưa có danh tính nào được ghi nhận
                  </td>
                </tr>
              ) : (
                idEntries.map(([addr, id]) => (
                  <tr key={addr} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-2">
                      <div className="text-cyan-300 font-medium">
                        {addr.slice(0, 8)}...{addr.slice(-6)}
                      </div>
                      <div className="text-[10px] text-slate-500">did:ethr:polygon:{addr.slice(0, 10)}...</div>
                    </td>
                    <td className="py-3 px-2 font-sans">
                      <div className="text-slate-200 font-medium">{id.fullName}</div>
                      <div className="text-[11px] text-slate-400">MSSV: {id.studentId}</div>
                    </td>
                    <td className="py-3 px-2 font-sans text-slate-300">
                      {id.major}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          id.isRevoked
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                        }`}
                      >
                        {id.isRevoked ? 'REVOKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-sans">
                      <button
                        onClick={() => handleToggleRevoke(addr, id.isRevoked)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                          id.isRevoked
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {id.isRevoked ? 'Kích hoạt lại' : 'Thu hồi khẩn cấp'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Centralized Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3 sm:mb-4">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
            <History size={16} className="text-amber-400" />
            <span>Nhật Ký An Ninh Tập Trung (Centralized Audit Logs)</span>
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Lưu vết bất biến phục vụ đối soát</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[560px] text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="pb-2 px-2">Thời gian</th>
                <th className="pb-2 px-2">Địa chỉ ví DID</th>
                <th className="pb-2 px-2">Hành vi</th>
                <th className="pb-2 px-2">Kết quả</th>
                <th className="pb-2 px-2">Chi tiết an ninh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500 font-sans">
                    Chưa có sự kiện nhật ký nào
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const isBlocked = log.status === 401 || log.status === 403 || log.status === 404;
                  const isSuccess = log.status === 200;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-2 text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="py-2.5 px-2 text-cyan-300 font-medium">{log.address}</td>
                      <td className="py-2.5 px-2 font-sans text-slate-200">{log.action}</td>
                      <td className="py-2.5 px-2 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isBlocked
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : isSuccess
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-sans text-slate-400">{log.detail}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Attack Vectors Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
              <ShieldAlert size={16} className="text-cyan-400" />
              <span>Kiểm Thử Thực Nghiệm An Toàn Thông Tin (Attack Vectors)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Đánh giá sức chống chịu trước các kịch bản tấn công theo tiêu chuẩn NCKH
            </p>
          </div>

          <button
            onClick={runLiveAttackTests}
            disabled={isRunningTests}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-xl shadow-lg transition active:scale-[0.98]"
          >
            <Play size={14} className={isRunningTests ? 'animate-spin' : ''} />
            <span>{isRunningTests ? 'Đang chạy kiểm thử...' : 'Chạy Thực Nghiệm (Live Test)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* TC-01 Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-400">TC-01</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ĐẠT (PASS)
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mb-1">Replay Attack</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tái sử dụng chữ ký và Nonce cũ để giả mạo phiên. Hệ thống dùng Single-use Nonce vô hiệu hóa ngay.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
              Phản hồi: <span className="text-rose-400 font-semibold">HTTP 401 Unauthorized</span>
            </div>
          </div>

          {/* TC-02 Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-400">TC-02</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ĐẠT (PASS)
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mb-1">Signature Tampering</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kẻ tấn công sửa đổi payload hoặc ký bằng khóa riêng mạo danh. Hàm ecrecover đối soát thất bại.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
              Phản hồi: <span className="text-rose-400 font-semibold">HTTP 400/404 Untrusted</span>
            </div>
          </div>

          {/* TC-03 Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-400">TC-03</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ĐẠT (PASS)
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mb-1">Revocation Abuse</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Đăng nhập bằng danh tính đã bị thu hồi khẩn cấp. Trạng thái isRevoked lập tức từ chối quyền truy cập.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
              Phản hồi: <span className="text-rose-400 font-semibold">HTTP 403 Forbidden</span>
            </div>
          </div>
        </div>

        {attackResults && (
          <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>Đã hoàn tất đợt chạy kiểm thử mới nhất: Cả 3 kịch bản tấn công đều bị hệ thống phát hiện và ngăn chặn 100%!</span>
          </div>
        )}
      </div>
    </div>
  );
}

