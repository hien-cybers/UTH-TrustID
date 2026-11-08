// src/pages/ServicePortal.jsx - Cổng Dịch Vụ Số & Thẩm Tra Danh Tính Sinh Viên Phong Cách Mint Pastel & Bento 2x2
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_STUDENTS } from '../data/studentsData';
import LoginPortal from '../components/LoginPortal';
import {
  Search,
  FileText,
  QrCode,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  ShieldCheck
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
  const [activeServiceId, setActiveServiceId] = useState('library');

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

  // Xử lý tra cứu hồ sơ (Chỉ chạy khi bấm nút Kiểm Tra hoặc nhấn Enter)
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
    setActiveServiceId(serviceName);
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
    } else if (serviceName === 'exam_pass') {
      setServiceActionMsg({
        type: 'SUCCESS',
        title: 'ĐỒNG BỘ THẺ DỰ THI ĐIỆN TỬ THÀNH CÔNG',
        detail: `Thẻ dự thi học kỳ 1 (Phòng A2-301) đã được xác thực chữ ký số lúc ${time}.`
      });
    } else if (serviceName === 'parking_gate') {
      setServiceActionMsg({
        type: 'SUCCESS',
        title: 'MỞ CỔNG KIỂM SOÁT RA VÀO KHUÔN VIÊN',
        detail: `Vé gửi xe điện tử & cổng tự động Campus UTH đã kích hoạt lúc ${time}.`
      });
    }
  };

  return (
    <div className="page-enter space-y-4" style={{ width: '100%' }}>
      {/* 1. HERO CARD MINT PASTEL (ĐỒNG BỘ VỚI ẢNH MẪU) */}
      <div
        className="rounded-[28px] p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6CE5D4 0%, #9AF2E5 55%, #CCFBF4 100%)',
          boxShadow: '0 16px 36px rgba(108, 229, 212, 0.18)',
          color: '#0A1F22'
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A1F22]/10 text-[#0A1F22] text-[9.5px] font-extrabold uppercase tracking-wider">
              <ShieldCheck size={11} />
              <span>UTH Digital Campus</span>
            </span>
            <h2 className="text-[18px] font-black text-[#0A1F22] m-0 mt-1 tracking-tight">
              Dịch Vụ Số &amp; Thẩm Tra
            </h2>
            <p className="text-[11.5px] font-semibold text-[#1E4B4E] m-0 mt-0.5">
              Cổng xác thực không mật khẩu • EIP-191
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[22px] font-black text-[#0A1F22] leading-none">
              24/7
            </div>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#0A1F22] text-[#7CE8D8] text-[9.5px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7CE8D8] animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* 2. PILL FILTER TABS (Chuẩn "All Devices | Living Room | Bedroom" trong ảnh mẫu) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'lookup', label: 'Tra Cứu Thẻ' },
          { id: 'services', label: 'Tiện Ích Số (2x2)' },
          { id: 'weblogin', label: 'Web Login QR' }
        ].map((pill) => {
          const isActive = activeTab === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => switchTab(pill.id)}
              className="px-4 py-2 rounded-full text-[11.5px] whitespace-nowrap transition-all duration-200 border-none cursor-pointer flex-shrink-0"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                      color: '#0A1F22',
                      fontWeight: 800,
                      boxShadow: '0 6px 18px rgba(108, 229, 212, 0.25)'
                    }
                  : {
                      background: '#22222E',
                      color: '#8E92A4',
                      fontWeight: 600
                    }
              }
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TRA CỨU THẺ SINH VIÊN SỐ (BẤM KIỂM TRA MỚI HIỆN THÔNG TIN) */}
      {activeTab === 'lookup' && (
        <div
          className="rounded-[26px] p-4 space-y-3.5 animate-fade-scale"
          style={{
            background: '#22222E',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.28)'
          }}
        >
          <div className="flex items-center gap-2">
            <Search size={15} className="text-[#7CE8D8]" />
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
              style={{
                background: '#171721',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF'
              }}
            />
            <button
              type="button"
              onClick={() => handleLookup()}
              className="btn-press px-4 py-2.5 rounded-2xl border-none text-xs font-black cursor-pointer flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                color: '#0A1F22',
                boxShadow: '0 6px 16px rgba(108, 229, 212, 0.25)'
              }}
            >
              Kiểm Tra
            </button>
          </div>

          {/* Chọn nhanh MSSV (Chỉ điền vào ô tìm kiếm, bấm Kiểm Tra mới hiện kết quả) */}
          <div className="flex items-center gap-2 flex-wrap">
            {['2251120000', '2251120001', '2251120002', '2251120005'].map((id) => {
              const selected = searchMssv === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSearchMssv(id);
                    setSearchResult(null);
                  }}
                  className="px-3 py-1 rounded-full font-mono text-[10.5px] cursor-pointer transition-all border-none"
                  style={
                    selected
                      ? {
                          background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                          color: '#0A1F22',
                          fontWeight: 800
                        }
                      : {
                          background: '#171721',
                          color: '#94A3B8',
                          fontWeight: 600
                        }
                  }
                >
                  {id}
                </button>
              );
            })}
          </div>

          {/* Kết quả trả về sau khi bấm Kiểm Tra */}
          {searchResult && (
            <div
              className="rounded-2xl p-4 text-xs animate-fade-scale"
              style={
                searchResult.notFound
                  ? {
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      color: '#FDA4AF'
                    }
                  : {
                      background: '#171721',
                      border: '1px solid rgba(124, 232, 216, 0.25)',
                      color: '#E2E8F0'
                    }
              }
            >
              {searchResult.notFound ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-400 flex-shrink-0" />
                  <span>
                    Không tìm thấy hồ sơ cho mã <strong>{searchResult.searchedId}</strong>!
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                    <div>
                      <strong className="text-sm text-white">{searchResult.fullName}</strong>{' '}
                      <span className="text-[#7CE8D8] font-mono text-xs">({searchResult.studentId})</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        searchResult.cardStatus === 'Active'
                          ? 'bg-[#7CE8D8]/15 text-[#7CE8D8]'
                          : 'bg-rose-500/20 text-rose-300'
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
                      DID: <span className="text-[#7CE8D8]">{searchResult.walletAddress}</span>
                    </div>
                    <div className="font-mono text-[10.5px] text-slate-400">
                      Merkle Root: <span className="text-emerald-400">{searchResult.merkleRoot.slice(0, 24)}...</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-bold text-[#7CE8D8]">
                    <CheckCircle2 size={14} />
                    <span>Đã xác thực Merkle Registry UTH</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIỆN ÍCH SỐ LƯỚI BENTO 2x2 (CHUẨN 4 Ô BENTO TRONG ẢNH MẪU) */}
      {activeTab === 'services' && (
        <div className="space-y-3.5 animate-fade-scale">
          {serviceActionMsg && (
            <div
              className="rounded-2xl p-3.5 text-xs space-y-1 animate-fade-scale"
              style={{
                background: '#22222E',
                border: '1px solid rgba(124, 232, 216, 0.4)'
              }}
            >
              <div className="font-extrabold flex items-center gap-1.5 text-[#7CE8D8]">
                <CheckCircle2 size={14} />
                <span>{serviceActionMsg.title}</span>
              </div>
              <div className="text-[11px] text-slate-300">{serviceActionMsg.detail}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            {[
              {
                id: 'library',
                title: 'Thư Viện Số',
                subtitle: 'Mượn sách & Phòng học',
                icon: BookOpen
              },
              {
                id: 'student_cert',
                title: 'Giấy Xác Nhận',
                subtitle: 'Bản PDF ký số QR',
                icon: FileText
              },
              {
                id: 'exam_pass',
                title: 'Thẻ Dự Thi',
                subtitle: 'Học kỳ I • Phòng A2-301',
                icon: ShieldCheck
              },
              {
                id: 'parking_gate',
                title: 'Cổng Campus',
                subtitle: 'Ra vào & Gửi xe tự động',
                icon: QrCode
              }
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = activeServiceId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleServiceRequest(item.id)}
                  className="rounded-[26px] p-4 flex flex-col justify-between min-h-[156px] cursor-pointer active:scale-[0.98] transition-all"
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(145deg, #6CE5D4 0%, #BFF8F0 100%)',
                          color: '#0A1F22',
                          boxShadow: '0 14px 30px rgba(108, 229, 212, 0.18)'
                        }
                      : {
                          background: '#22222E',
                          border: '1px solid rgba(255,255,255,0.04)',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
                        }
                  }
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isSelected ? 'bg-[#0A1F22]/10 text-[#0A1F22]' : 'bg-white/5 text-slate-200'
                      }`}
                    >
                      <IconComp size={18} />
                    </div>
                    <Wifi size={16} className={isSelected ? 'text-[#0A1F22]/80' : 'text-slate-400'} />
                  </div>

                  <div className="my-2">
                    <div className={`text-[14px] font-bold leading-snug truncate ${isSelected ? 'text-[#0A1F22] font-black' : 'text-white'}`}>
                      {item.title}
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-[#1E4B4E] font-semibold' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#0A1F22] font-black' : 'text-slate-400'}`}>
                      {isSelected ? 'ON' : 'KÝ SỐ'}
                    </span>
                    <div
                      className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${
                        isSelected ? 'bg-[#161922] justify-end' : 'bg-[#353545] justify-start'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full block shadow ${
                          isSelected ? 'bg-[#7CE8D8]' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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
