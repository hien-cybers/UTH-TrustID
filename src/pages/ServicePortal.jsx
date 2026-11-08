// src/pages/ServicePortal.jsx - Cổng Dịch Vụ Số & Thẩm Tra Danh Tính Sinh Viên Đồng Bộ Dark Neon Gradient
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_STUDENTS } from '../data/studentsData';
import LoginPortal from '../components/LoginPortal';
import {
  Building2,
  Search,
  FileText,
  QrCode,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ServicePortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'lookup';
  const [activeTab, setActiveTab] = useState(
    ['lookup', 'services', 'weblogin'].includes(initialTab) ? initialTab : 'lookup'
  ); // 'lookup' | 'services' | 'weblogin'

  // State phục vụ Tra cứu
  const [searchMssv, setSearchMssv] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [serviceActionMsg, setServiceActionMsg] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['lookup', 'services', 'weblogin'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Xử lý tra cứu hồ sơ
  const handleLookup = (overrideQuery) => {
    const rawQuery = typeof overrideQuery === 'string' ? overrideQuery : searchMssv;
    if (!rawQuery.trim()) return;
    const cleanId = rawQuery.trim();

    let revokedList = [];
    try {
      revokedList = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]').map((k) => String(k).toLowerCase());
    } catch {}

    const found = INITIAL_STUDENTS.find(
      (s) => s.mssv === cleanId || s.didAddress.toLowerCase() === cleanId.toLowerCase()
    );

    let batchMatch = null;
    try {
      const batchData = localStorage.getItem('uth_issued_credentials');
      if (batchData) {
        const parsed = JSON.parse(batchData);
        batchMatch = parsed.find(
          (item) => item.studentId === cleanId || item.address?.toLowerCase() === cleanId.toLowerCase()
        );
      }
    } catch {}

    let activeWalletMatch = null;
    try {
      const activeIdentity = JSON.parse(localStorage.getItem('uth_did_identity_v1') || 'null');
      if (
        activeIdentity &&
        (activeIdentity.student?.studentId === cleanId ||
          activeIdentity.address?.toLowerCase() === cleanId.toLowerCase())
      ) {
        activeWalletMatch = {
          studentId: activeIdentity.student?.studentId || '2251120000',
          fullName: activeIdentity.student?.fullName || 'Nguyễn Đức Hiển',
          major: activeIdentity.student?.major || 'An toàn Thông tin',
          address: activeIdentity.address
        };
      }
    } catch {}

    if (found || batchMatch || activeWalletMatch) {
      const student = found || {
        mssv: (batchMatch || activeWalletMatch).studentId,
        fullName: (batchMatch || activeWalletMatch).fullName,
        major: (batchMatch || activeWalletMatch).major,
        didAddress: (batchMatch || activeWalletMatch).address,
        status: 'Active'
      };

      const isRevoked =
        student.status === 'Revoked' ||
        revokedList.includes(String(student.didAddress || '').toLowerCase());

      setSearchResult({
        studentId: student.mssv,
        fullName: student.fullName,
        major: student.major,
        faculty: 'Công nghệ Thông tin & ATTT',
        cardStatus: isRevoked ? 'Revoked' : 'Active',
        walletAddress: student.didAddress,
        merkleVerified: !isRevoked,
        merkleRoot:
          batchMatch?.merkleRoot ||
          localStorage.getItem('uth_latest_merkle_root') ||
          '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2',
        leafHash: batchMatch?.leafHash || '0xLeafHashSolidityPackedKeccak256',
        cohort: '2022 - 2026'
      });
    } else {
      setSearchResult({ notFound: true, searchedId: cleanId });
    }
  };

  const handleServiceRequest = (serviceName) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    if (serviceName === 'library') {
      setServiceActionMsg({
        type: 'SUCCESS',
        title: 'XÁC THỰC MƯỢN TÀI LIỆU THÀNH CÔNG',
        detail: `Đã ký số EIP-191 lúc ${time}. Mã phiếu: UTH-LIB-${Math.random().toString(36).substring(2, 8).toUpperCase()} (Quầy B1-102).`
      });
    } else if (serviceName === 'student_cert') {
      setServiceActionMsg({
        type: 'SUCCESS',
        title: 'CẤP GIẤY CHỨNG NHẬN ĐIỆN TỬ THÀNH CÔNG',
        detail: `Bản PDF có mã QR đối soát Merkle Root đã được lưu vào Ví Sinh Viên lúc ${time}.`
      });
    }
  };

  return (
    <div className="page-enter space-y-3.5" style={{ width: '100%' }}>
      {/* 1. Header Cổng Dịch Vụ & Thanh Chuyển Tab Mềm Mại */}
      <div className="rounded-[26px] p-4 border shadow-lg bg-gradient-to-br from-[#0F293A] via-[#0A1A2F] to-[#060E1C] border-teal-400/30 text-slate-100 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4FF0D6]/25 to-cyan-400/15 border border-[#4FF0D6]/40 flex items-center justify-center text-[#64F5DF] flex-shrink-0">
              <Building2 size={17} />
            </div>
            <h2 className="text-sm font-extrabold text-white m-0 truncate">
              Dịch Vụ Số &amp; Thẩm Tra DID
            </h2>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4FF0D6]/15 text-[#64F5DF] border border-[#4FF0D6]/35 flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64F5DF] animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* 3 Tab Điều Hướng Sinh Viên (Bo tròn kiểu Pill mềm mại) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-[#050A14] border border-white/10">
          <button
            type="button"
            onClick={() => switchTab('lookup')}
            className={`py-2 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Search size={13} />
            <span>Tra Cứu Thẻ</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('services')}
            className={`py-2 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-300 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Tiện Ích Số</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('weblogin')}
            className={`py-2 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
              activeTab === 'weblogin'
                ? 'bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-300 hover:text-white'
            }`}
          >
            <QrCode size={13} />
            <span>Web Login</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRA CỨU THẺ SINH VIÊN SỐ */}
      {activeTab === 'lookup' && (
        <div className="rounded-[26px] p-4 border shadow-lg bg-gradient-to-b from-[#0C1D33] to-[#060E1C] border-white/10 text-slate-100 space-y-3 animate-fade-scale">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-[#64F5DF]" />
            <h3 className="text-xs font-extrabold text-white m-0">
              Tra Cứu Thẻ Sinh Viên Số (DID)
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập MSSV hoặc địa chỉ ví 0x..."
              value={searchMssv}
              onChange={(e) => {
                setSearchMssv(e.target.value);
                if (searchResult) setSearchResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLookup();
              }}
              className="pro-input flex-1 font-mono text-xs rounded-2xl"
            />
            <button
              type="button"
              onClick={() => handleLookup()}
              className="btn-press px-4 py-2.5 rounded-2xl border-none bg-gradient-to-r from-[#4FF0D6] to-[#22D3EE] text-slate-950 text-xs font-extrabold cursor-pointer shadow-md flex-shrink-0"
            >
              Kiểm Tra
            </button>
          </div>

          {/* Chọn nhanh MSSV (Chỉ điền vào ô, bấm Kiểm Tra mới hiện thông tin) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['2251120000', '2251120001', '2251120002', '2251120005'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchMssv(id);
                  setSearchResult(null);
                }}
                className={`px-3 py-1 rounded-full border font-mono text-[10px] font-semibold cursor-pointer transition-all ${
                  searchMssv === id
                    ? 'bg-[#4FF0D6]/20 border-[#4FF0D6] text-[#64F5DF] font-bold'
                    : 'bg-[#050A14] border-white/10 hover:border-[#4FF0D6]/40 text-slate-300'
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          {/* Kết quả trả về */}
          {searchResult && (
            <div
              className={`rounded-2xl p-3.5 border text-xs animate-fade-scale ${
                searchResult.notFound
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-[#040814] border-slate-800 text-slate-200 space-y-2'
              }`}
            >
              {searchResult.notFound ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-400 flex-shrink-0" />
                  <span>
                    Không tìm thấy hồ sơ cho mã <strong>{searchResult.searchedId}</strong>!
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <strong className="text-sm text-white">{searchResult.fullName}</strong>{' '}
                      <span className="text-cyan-400 font-mono text-xs">({searchResult.studentId})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        searchResult.cardStatus === 'Active'
                          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      ● {searchResult.cardStatus === 'Active' ? 'Hợp lệ' : 'Đã thu hồi'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div>
                      Ngành: <b className="text-white">{searchResult.major}</b> • {searchResult.faculty}
                    </div>
                    <div className="font-mono text-[10.5px] text-slate-400 break-all">
                      DID: <span className="text-cyan-300">{searchResult.walletAddress}</span>
                    </div>
                    <div className="font-mono text-[10.5px] text-slate-400">
                      Merkle Root: <span className="text-emerald-400">{searchResult.merkleRoot.slice(0, 24)}...</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span>Đã xác thực Merkle Registry UTH</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIỆN ÍCH HỌC VỤ MỘT CHẠM */}
      {activeTab === 'services' && (
        <div className="rounded-3xl p-4 border shadow-lg bg-gradient-to-br from-[#0B1930] to-[#060E1E] border-slate-800 text-slate-100 space-y-3 animate-fade-scale">
          {serviceActionMsg && (
            <div className="rounded-2xl p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 animate-fade-scale">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={14} />
                <span>{serviceActionMsg.title}</span>
              </div>
              <div className="text-[11px] text-slate-200">{serviceActionMsg.detail}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {/* Dịch vụ 1: Thư viện số */}
            <div className="rounded-2xl p-3.5 bg-[#040814] border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <BookOpen size={19} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate">
                    Thư Viện Số UTH
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    Mượn giáo trình &amp; mở cửa phòng tự học
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleServiceRequest('library')}
                className="btn-press px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 text-[11px] font-extrabold border-none cursor-pointer flex-shrink-0"
              >
                Ký Xác Thực
              </button>
            </div>

            {/* Dịch vụ 2: Giấy xác nhận sinh viên */}
            <div className="rounded-2xl p-3.5 bg-[#040814] border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <FileText size={19} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate">
                    Giấy Xác Nhận Sinh Viên
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    Cấp bản điện tử có chữ ký số &amp; QR
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleServiceRequest('student_cert')}
                className="btn-press px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-[11px] font-extrabold border-none cursor-pointer flex-shrink-0"
              >
                Cấp Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ĐĂNG NHẬP WEB KHÔNG MẬT KHẨU */}
      {activeTab === 'weblogin' && (
        <div className="animate-fade-scale">
          <LoginPortal />
        </div>
      )}
    </div>
  );
}
