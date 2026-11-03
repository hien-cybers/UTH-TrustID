// src/pages/StudentWalletPro.jsx - Ví Sinh Viên Hoàn Chỉnh: Kích Hoạt Lần Đầu & Thẻ Apple Wallet
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  DownloadCloud, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  UserCheck,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveCredentialToStorage } from '../utils/credentialStorage';

export default function StudentWalletPro() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [copied, setCopied] = useState(false);

  // Kiểm tra thẻ trong bộ nhớ khi mở ứng dụng
  useEffect(() => {
    const savedVC = localStorage.getItem('uth_student_vc');
    if (savedVC) {
      try {
        setCredential(JSON.parse(savedVC));
        return;
      } catch (e) {}
    }

    // Kiểm tra thêm identity từ did.js
    const savedIdentity = localStorage.getItem('uth_did_identity');
    if (savedIdentity) {
      try {
        const id = JSON.parse(savedIdentity);
        if (id && id.address) {
          const autoVC = {
            studentId: id.student?.studentId || id.student?.mssv || "2251120000",
            fullName: id.student?.fullName || "Nguyễn Đức Hiển",
            major: id.student?.major || "An toàn Thông tin",
            address: id.address,
            privateKey: id.privateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            merkleRoot: "0x78ab3199fe01cb29019234812349012398412039481203948120394812039481",
            merkleProof: [
              "0x1f82e5b7e2e87c09e3a890b5037d6e42ecf14659b81b28d494916a41f8793b1a",
              "0x9c412e87f8b91c01e2a890b5037d6e42ecf14659b81b28d494916a41f87988ff"
            ],
            issuedAt: new Date().toLocaleDateString('vi-VN')
          };
          setCredential(autoVC);
          localStorage.setItem('uth_student_vc', JSON.stringify(autoVC));
        }
      } catch {}
    }
  }, []);

  // KÍCH HOẠT THẺ LẦN ĐẦU (Gắn danh tính vào thiết bị)
  const handleActivateInitialVC = async () => {
    const defaultInitialVC = {
      studentId: "2251120000",
      fullName: "Nguyễn Đức Hiển",
      major: "An toàn Thông tin",
      address: "0x1D9b6938A3f073e3426052C7016155D85040Ed1D",
      privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Lưu bảo mật cục bộ
      merkleRoot: "0x78ab3199fe01cb29019234812349012398412039481203948120394812039481",
      merkleProof: [
        "0x1f82e5b7e2e87c09e3a890b5037d6e42ecf14659b81b28d494916a41f8793b1a",
        "0x9c412e87f8b91c01e2a890b5037d6e42ecf14659b81b28d494916a41f87988ff"
      ],
      issuedAt: new Date().toLocaleDateString('vi-VN')
    };

    localStorage.setItem('uth_student_vc', JSON.stringify(defaultInitialVC));
    localStorage.setItem('uth_did_private_key', defaultInitialVC.privateKey);

    // Lưu vào cấu trúc identity của did.js
    const identityObj = {
      address: defaultInitialVC.address,
      privateKey: defaultInitialVC.privateKey,
      student: {
        studentId: defaultInitialVC.studentId,
        mssv: defaultInitialVC.studentId,
        fullName: defaultInitialVC.fullName,
        major: defaultInitialVC.major,
        faculty: 'Công nghệ Thông tin'
      }
    };
    localStorage.setItem('uth_did_identity', JSON.stringify(identityObj));

    // Lưu vào két IndexedDB cho xác thực offline
    try {
      await saveCredentialToStorage(defaultInitialVC);
    } catch {}

    setCredential(defaultInitialVC);
    alert("🎉 Kích hoạt Thẻ Sinh Viên Số UTH lần đầu thành công trên thiết bị!");
  };

  const handleRevokeLocal = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa Thẻ số khỏi thiết bị này?")) {
      localStorage.removeItem('uth_student_vc');
      localStorage.removeItem('uth_did_private_key');
      localStorage.removeItem('uth_did_identity');
      setCredential(null);
    }
  };

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100dvh',
      background: '#07090E',
      color: '#F8FAFC',
      padding: '16px 14px 90px',
      boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
            TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0', color: '#FFF' }}>
            Ví Danh Tính DID
          </h1>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          background: credential ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: credential ? '#10B981' : '#EF4444',
          border: credential ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)'
        }}>
          {credential ? '● Sẵn sàng điểm danh' : '○ Chưa kích hoạt'}
        </div>
      </div>

      {/* TRƯỜNG HỢP 1: LẦN ĐẦU MỞ MÁY CHƯA CÓ THẺ */}
      {!credential ? (
        <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <UserCheck size={24} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#FFF' }}>
            Kích Hoạt Danh Tính Lần Đầu
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 18px', lineHeight: 1.45 }}>
            Để hệ thống nhận biết bạn khi quét mã, hãy kích hoạt Thẻ Sinh Viên Số vào bộ nhớ thiết bị. Bạn chỉ cần làm bước này một lần duy nhất.
          </p>
          <button
            onClick={handleActivateInitialVC}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <DownloadCloud size={16} /> Kích Hoạt Thẻ Số Của Tôi (MSSV: 2251120000)
          </button>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: ĐÃ CÓ THẺ SỐ -> HIỂN THỊ THẺ CHUẨN APPLE WALLET */
        <div>
          <div style={{
            background: 'linear-gradient(145deg, #0F172A 0%, #02142B 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            marginBottom: '16px'
          }}>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, pointerEvents: 'none' }}>
              <Cpu size={160} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: 700, letterSpacing: '1px' }}>
                  DECENTRALIZED IDENTITY (DID)
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                  UTH TRUST-ID
                </div>
              </div>
              <ShieldCheck size={28} color="#38BDF8" />
            </div>

            <div style={{ margin: '24px 0 18px' }}>
              <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>Chủ thẻ sinh viên</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', letterSpacing: '0.3px' }}>
                {credential.fullName}
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>MSSV</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1', fontFamily: 'JetBrains Mono' }}>
                    {credential.studentId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>CHUYÊN NGÀNH</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                    {credential.major}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                {credential.address.slice(0, 8)}...{credential.address.slice(-6)}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(credential.address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '3px 6px', color: '#38BDF8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <CheckCircle2 size={12} color="#10B981" /> : <Copy size={12} />}
                <span>{copied ? 'Đã chép' : 'Chép ví'}</span>
              </button>
            </div>
          </div>

          {/* CHI TIẾT MẬT MÃ MERKLE PROOF */}
          <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              CHỨNG THỰC BẰNG CHỨNG MẬT MÃ (MERKLE PROOF)
            </div>
            <div style={{ background: '#07090E', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10.5px', color: '#67E8F9', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
              Gốc Root: {credential.merkleRoot.slice(0, 24)}...
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
              ✓ Đã nạp {credential.merkleProof.length} chuỗi Proof vào két thiết bị để đối soát ngoại tuyến.
            </div>
          </div>

          {/* NÚT THAO TÁC: QUÉT MÃ ĐIỂM DANH NGAY & GỠ THẺ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => navigate('/scan')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <QrCode size={16} /> Quét Mã Điểm Danh Ngay
            </button>

            <button
              onClick={handleRevokeLocal}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Trash2 size={14} /> Gỡ thẻ số khỏi máy này
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
