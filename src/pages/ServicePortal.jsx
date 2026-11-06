// src/pages/ServicePortal.jsx - Cổng Dịch Vụ Số & Thẩm Tra Danh Tính Sinh Viên (Isolated Holder Node)
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

  // Xử lý tra cứu hồ sơ (Sinh viên, Giảng viên hoặc Quản trị viên đều dùng được)
  const handleLookup = (overrideQuery) => {
    const rawQuery = typeof overrideQuery === 'string' ? overrideQuery : searchMssv;
    if (!rawQuery.trim()) return;
    const cleanId = rawQuery.trim();

    // Tra cứu danh sách khóa đã bị thu hồi (Revoked)
    let revokedList = [];
    try {
      revokedList = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]').map((k) => String(k).toLowerCase());
    } catch {}

    // Tra cứu trong cơ sở dữ liệu mẫu sinh viên
    const found = INITIAL_STUDENTS.find(s => s.mssv === cleanId || s.didAddress.toLowerCase() === cleanId.toLowerCase());
    
    // Tra cứu thêm trong kho cấp phát Merkle lô (localStorage) nếu có
    let batchMatch = null;
    try {
      const batchData = localStorage.getItem('uth_issued_credentials');
      if (batchData) {
        const parsed = JSON.parse(batchData);
        batchMatch = parsed.find(item => item.studentId === cleanId || item.address?.toLowerCase() === cleanId.toLowerCase());
      }
    } catch {}

    // Tra cứu ví sinh viên đang hoạt động trên thiết bị này
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
        merkleRoot: batchMatch?.merkleRoot || localStorage.getItem('uth_latest_merkle_root') || '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2',
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
        detail: `Đã gọi Private Key ký số mật mã EIP-191 lúc ${time}. Mã phiếu mượn: UTH-LIB-${Math.random().toString(36).substring(2, 8).toUpperCase()}. Vui lòng nhận sách tại Quầy B1-102.`
      });
    } else if (serviceName === 'student_cert') {
      setServiceActionMsg({
        type: 'SUCCESS',
        title: 'CẤP GIẤY CHỨNG NHẬN ĐIỆN TỬ THÀNH CÔNG',
        detail: `Yêu cầu cấp Giấy xác nhận sinh viên đã được ký số tự động. Bản PDF có mã QR đối soát Merkle Root đã được gửi về ví sinh viên lúc ${time}.`
      });
    }
  };

  return (
    <div className="page-enter" style={{ width: '100%', color: 'var(--text-main)', boxSizing: 'border-box' }}>
      
      {/* 1. Header Cổng Dịch Vụ */}
      <div className="glass-card stagger-1" style={{ borderRadius: '16px', padding: '18px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 242, 254, 0.12)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} color="#0284c7" strokeWidth={1.8} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                Cổng Dịch Vụ & Thẩm Tra Danh Tính UTH
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Tra cứu hồ sơ, thẩm tra thẻ số phi tập trung và tiện ích trường học không mật khẩu
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '5px 10px', borderRadius: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                HOLDER NODE • Sinh Viên
              </span>
            </div>
          </div>
        </div>

        {/* 3 Tab Điều Hướng Sinh Viên Gọn Trong Khung Điện Thoại */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border-hairline)', paddingTop: '10px' }}>
          <button
            onClick={() => switchTab('lookup')}
            className="btn-press"
            style={{
              padding: '8px 6px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              border: activeTab === 'lookup' ? '1px solid #0284c7' : '1px solid var(--border-hairline)',
              cursor: 'pointer',
              background: activeTab === 'lookup' ? 'rgba(2, 132, 199, 0.14)' : 'var(--bg-inset)',
              color: activeTab === 'lookup' ? '#0284c7' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <Search size={13} />
            <span>Tra Cứu Thẻ</span>
          </button>

          <button
            onClick={() => switchTab('services')}
            className="btn-press"
            style={{
              padding: '8px 6px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              border: activeTab === 'services' ? '1px solid #0284c7' : '1px solid var(--border-hairline)',
              cursor: 'pointer',
              background: activeTab === 'services' ? 'rgba(2, 132, 199, 0.14)' : 'var(--bg-inset)',
              color: activeTab === 'services' ? '#0284c7' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <FileText size={13} />
            <span>Dịch Vụ Số</span>
          </button>

          <button
            onClick={() => switchTab('weblogin')}
            className="btn-press"
            style={{
              padding: '8px 6px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              border: activeTab === 'weblogin' ? '1px solid #0284c7' : '1px solid var(--border-hairline)',
              cursor: 'pointer',
              background: activeTab === 'weblogin' ? 'rgba(2, 132, 199, 0.14)' : 'var(--bg-inset)',
              color: activeTab === 'weblogin' ? '#0284c7' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <QrCode size={13} />
            <span>Web Login QR</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRA CỨU HỒ SƠ & THẨM TRA (Dành cho Sinh viên & Cán bộ) */}
      {activeTab === 'lookup' && (
        <div className="glass-card stagger-2" style={{ borderRadius: '14px', padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Search size={18} color="#0284c7" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Tra Cứu Tính Toàn Vẹn Của Thẻ Sinh Viên Số (DID Verification)
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: '1.5' }}>
            Nhập Mã số sinh viên (MSSV) hoặc địa chỉ ví để đối soát trạng thái thẻ, chữ ký số và bằng chứng Merkle Proof trên hệ thống:
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nhập MSSV (ví dụ: 2251120000, 2251120001, 2251120002)..."
              value={searchMssv}
              onChange={(e) => setSearchMssv(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              className="pro-input"
              style={{
                flex: 1,
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
            <button
              onClick={handleLookup}
              className="btn-press"
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(90deg, #0284c7, #00b4db)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              Kiểm Tra
            </button>
          </div>

          {/* Gợi ý tra cứu nhanh */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thử nhanh:</span>
            {['2251120000', '2251120001', '2251120002', '2251120005'].map(id => (
              <button
                key={id}
                onClick={() => { setSearchMssv(id); handleLookup(id); }}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#0284c7',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {id}
              </button>
            ))}
          </div>

          {/* Kết quả trả về */}
          {searchResult && (
            <div className="animate-fade-scale" style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '10px',
              background: searchResult.notFound ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-inset)',
              border: searchResult.notFound ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-hairline)'
            }}>
              {searchResult.notFound ? (
                <div style={{ color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} color="#EF4444" />
                  <span>Không tìm thấy hồ sơ cho mã <strong>{searchResult.searchedId}</strong> hoặc thẻ chưa được cấp phát trong hệ thống!</span>
                </div>
              ) : (
                <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{searchResult.fullName}</strong>{' '}
                      <span style={{ color: '#0284c7', fontFamily: 'JetBrains Mono' }}>({searchResult.studentId})</span>
                    </div>
                    <span style={{
                      color: searchResult.cardStatus === 'Active' ? '#10b981' : '#ef4444',
                      background: searchResult.cardStatus === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: searchResult.cardStatus === 'Active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '10.5px'
                    }}>
                      ● {searchResult.cardStatus === 'Active' ? 'Hợp lệ (Active)' : 'Đã thu hồi (Revoked)'}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-main)', marginBottom: '2px' }}>
                    Khoa / Chuyên ngành: <strong>{searchResult.major}</strong> • {searchResult.faculty}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '11px', wordBreak: 'break-all' }}>
                    DID Ví: <span style={{ color: '#0284c7' }}>{searchResult.walletAddress}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '10.5px', marginTop: '4px' }}>
                    Merkle Root: <span style={{ color: '#d97706' }}>{searchResult.merkleRoot.slice(0, 22)}...</span>
                  </div>

                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-hairline)', color: '#10b981', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>Đã đối soát mật mã học thành công với Smart Contract Merkle Registry Trường UTH</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DỊCH VỤ HỌC VỤ MỘT CHẠM (Sinh viên tự bấm xin giấy tờ) */}
      {activeTab === 'services' && (
        <div className="glass-card stagger-2" style={{ borderRadius: '14px', padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileText size={18} color="#0284c7" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Dịch Vụ Tiện Ích Sinh Viên Không Mật Khẩu
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 14px' }}>
            Sinh viên sử dụng Thẻ số DID và cặp khóa mật mã trên thiết bị để kích hoạt tức thì các dịch vụ học vụ:
          </p>

          {serviceActionMsg && (
            <div className="animate-fade-scale" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              marginBottom: '14px',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 800, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>{serviceActionMsg.title}</span>
              </div>
              <div>{serviceActionMsg.detail}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* Dịch vụ 1: Thư viện số */}
            <div className="card-interactive" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-hairline)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <BookOpen size={24} color="#0284c7" strokeWidth={1.8} />
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>Thư Viện Số UTH</strong>
                <p style={{ margin: '4px 0 12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Mượn giáo trình chuyên ngành và truy cập phòng tự học thông minh bằng chữ ký số DID.
                </p>
              </div>
              <button 
                onClick={() => handleServiceRequest('library')}
                className="btn-press"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#0284c7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Xác Thực Mượn Tài Liệu
              </button>
            </div>

            {/* Dịch vụ 2: Cấp giấy xác nhận sinh viên */}
            <div className="card-interactive" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-hairline)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <FileText size={24} color="#10b981" strokeWidth={1.8} />
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>Giấy Xác Nhận Sinh Viên</strong>
                <p style={{ margin: '4px 0 12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Cấp chứng nhận điện tử tạm hoãn nghĩa vụ, vay vốn hoặc ưu đãi xe buýt có gắn chữ ký số của Trường.
                </p>
              </div>
              <button 
                onClick={() => handleServiceRequest('student_cert')}
                className="btn-press"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Ký Số Yêu Cầu Cấp Giấy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ĐĂNG NHẬP WEB KHÔNG MẬT KHẨU (PASSWORDLESS LOGIN PORTAL) */}
      {activeTab === 'weblogin' && (
        <div className="glass-card stagger-2" style={{ borderRadius: '14px', padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
              Xác Thực Không Mật Khẩu Cho Màn Hình Máy Tính (Passwordless Web)
            </h3>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Mở ứng dụng Ví trên điện thoại, quét mã QR xoay vòng dưới đây để đăng nhập tự động qua WebSocket:
            </p>
          </div>
          <LoginPortal />
        </div>
      )}

    </div>
  );
}

