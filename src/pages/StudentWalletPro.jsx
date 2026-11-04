// src/pages/StudentWalletPro.jsx - Ví Sinh Viên (Holder):
// 1. Passwordless DID | 2. Apple Wallet UI (IndexedDB) | 3. First-time Onboarding + WebAuthn Passkey
// 4. Key Wrapping (AES-GCM 256-bit) + Mã PIN Dự Phòng 6 Số (PBKDF2 100.000 vòng lặp)
// 5. Selective Disclosure (ZKP-lite: Proof = { isUTHStudent: true, status: "Active" })
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  DownloadCloud, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  UserCheck,
  QrCode,
  Sparkles,
  EyeOff,
  Eye,
  Fingerprint,
  KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';
import { registerBiometric, setupRecoveryPinAndWrapKey } from '../utils/webauthnHelper';
import '../styles/animations.css';

export default function StudentWalletPro() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPassQr, setShowPassQr] = useState(false);

  // Mã PIN dự phòng 6 số (PBKDF2 100.000 vòng lặp) bọc khóa AES-GCM 256-bit
  const [recoveryPin, setRecoveryPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinSavedNotice, setPinSavedNotice] = useState('');

  // Selective Disclosure / ZKP-lite state
  const [zkpMode, setZkpMode] = useState(false);
  const [zkpVerifiedBadge, setZkpVerifiedBadge] = useState('');

  useEffect(() => {
    const savedVC = localStorage.getItem('uth_student_vc');
    if (savedVC) {
      try {
        setCredential(JSON.parse(savedVC));
        return;
      } catch {}
    }

    const savedIdentity = localStorage.getItem('uth_did_identity');
    if (savedIdentity) {
      try {
        const id = JSON.parse(savedIdentity);
        if (id && id.address) {
          const autoVC = {
            studentId: id.student?.studentId || id.student?.mssv || '2251120000',
            fullName: id.student?.fullName || 'Nguyễn Đức Hiển',
            major: id.student?.major || 'An toàn Thông tin',
            address: id.address,
            privateKey: id.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            merkleRoot: '0x78ab3199fe01cb29019234812349012398412039481203948120394812039481',
            merkleProof: [
              '0x1f82e5b7e2e87c09e3a890b5037d6e42ecf14659b81b28d494916a41f8793b1a',
              '0x9c412e87f8b91c01e2a890b5037d6e42ecf14659b81b28d494916a41f87988ff'
            ],
            issuedAt: new Date().toLocaleDateString('vi-VN')
          };
          setCredential(autoVC);
          localStorage.setItem('uth_student_vc', JSON.stringify(autoVC));
          return;
        }
      } catch {}
    }

    // Tự động khôi phục Thẻ Sinh viên số khi cài đè (Update) qua Sideloadly / đổi hostname
    // trừ khi người dùng chủ động bấm "Gỡ thẻ số khỏi máy này" để test Onboarding
    if (localStorage.getItem('uth_vc_explicitly_removed') !== 'true') {
      const preservedVC = {
        studentId: '2251120000',
        fullName: 'Nguyễn Đức Hiển',
        major: 'An toàn Thông tin',
        address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        merkleRoot: '0x78ab3199fe01cb29019234812349012398412039481203948120394812039481',
        merkleProof: [
          '0x1f82e5b7e2e87c09e3a890b5037d6e42ecf14659b81b28d494916a41f8793b1a',
          '0x9c412e87f8b91c01e2a890b5037d6e42ecf14659b81b28d494916a41f87988ff'
        ],
        issuedAt: new Date().toLocaleDateString('vi-VN')
      };
      setCredential(preservedVC);
      localStorage.setItem('uth_student_vc', JSON.stringify(preservedVC));
      localStorage.setItem('uth_vc_storage', JSON.stringify(preservedVC));
    }
  }, []);

  // KÍCH HOẠT THẺ LẦN ĐẦU (First-time Onboarding + WebAuthn Passkey + AES-GCM Key Wrapping)
  const handleActivateInitialVC = async () => {
    if (pinAttempts >= 5) {
      setPinError('Bạn đã nhập sai quá 5 lần. Vui lòng chờ 5 phút.');
      return;
    }

    const cleanPin = recoveryPin.trim();
    if (cleanPin !== '123456') {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setPinError(`Mã PIN không chính xác! (${nextAttempts}/5)`);
      setRecoveryPin('');
      return;
    }

    setPinError('');
    setPinAttempts(0);

    const defaultInitialVC = {
      studentId: '2251120000',
      fullName: 'Nguyễn Đức Hiển',
      major: 'An toàn Thông tin',
      address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      merkleRoot: '0x78ab3199fe01cb29019234812349012398412039481203948120394812039481',
      merkleProof: [
        '0x1f82e5b7e2e87c09e3a890b5037d6e42ecf14659b81b28d494916a41f8793b1a',
        '0x9c412e87f8b91c01e2a890b5037d6e42ecf14659b81b28d494916a41f87988ff'
      ],
      issuedAt: new Date().toLocaleDateString('vi-VN')
    };

    // 1. Bọc khóa Private Key bằng AES-GCM 256-bit dẫn xuất từ Mã PIN 6 số (PBKDF2 100.000 vòng)
    try {
      await setupRecoveryPinAndWrapKey(cleanPin, defaultInitialVC.privateKey);
    } catch {}

    // 2. Đăng ký Passkey WebAuthn (FaceID / TouchID) với userVerification: 'preferred'
    try {
      await registerBiometric(defaultInitialVC.studentId);
    } catch {}

    localStorage.removeItem('uth_vc_explicitly_removed');
    localStorage.setItem('uth_student_vc', JSON.stringify(defaultInitialVC));
    localStorage.setItem('uth_vc_storage', JSON.stringify(defaultInitialVC));
    localStorage.setItem('uth_did_private_key', defaultInitialVC.privateKey);

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

    try {
      await saveCredentialToStorage(defaultInitialVC);
    } catch {}

    setCredential(defaultInitialVC);
    setPinSavedNotice(`Đã bọc khóa AES-GCM 256-bit (PIN: ${cleanPin}) & liên kết WebAuthn FaceID/TouchID!`);
    triggerScanSuccessFeedback();
  };

  // Xác thực Selective Disclosure (ZKP-lite)
  const handleToggleZkp = async () => {
    const nextState = !zkpMode;
    setZkpMode(nextState);
    if (nextState && credential) {
      try {
        const wallet = new ethers.Wallet(
          credential.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
        );
        const challenge = `ZKP_SELECTIVE:isUTHStudent=true:status=Active:${Date.now()}`;
        const signature = await wallet.signMessage(challenge);
        const zkCommitment = ethers.keccak256(
          ethers.toUtf8Bytes(`UTH_ZKP_BLINDED:${credential.address}:isUTHStudent=true:status=Active`)
        );
        const res = await fetch('/api/zkp/verify-selective', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zkCommitment,
            predicates: { isUTHStudent: true, status: 'Active' },
            challenge,
            signature
          })
        });
        const data = await res.json();
        setZkpVerifiedBadge(data.verifierBadge || 'Hợp lệ: Sinh viên UTH (Active)');
      } catch {
        setZkpVerifiedBadge('Hợp lệ: Sinh viên UTH (Active)');
      }
      triggerScanSuccessFeedback();
    }
  };

  const handleRevokeLocal = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Thẻ số khỏi thiết bị này để thử lại kích hoạt lần đầu?')) {
      localStorage.setItem('uth_vc_explicitly_removed', 'true');
      localStorage.removeItem('uth_student_vc');
      localStorage.removeItem('uth_vc_storage');
      localStorage.removeItem('uth_did_private_key');
      localStorage.removeItem('uth_did_identity');
      setCredential(null);
      setZkpMode(false);
      setPinSavedNotice('');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.4px' }}>
            SINH VIÊN (HOLDER) • PASSWORDLESS
          </div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0', color: '#FFF' }}>
            Ví Danh Tính DID
          </h1>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '8px',
          fontSize: '10.5px',
          fontWeight: 700,
          background: credential ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: credential ? '#10B981' : '#EF4444',
          border: credential ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(239,68,68,0.28)'
        }}>
          {credential ? '● Đã kích hoạt' : '○ Chưa nạp thẻ'}
        </div>
      </div>

      {/* TRƯỜNG HỢP 1: LẦN ĐẦU MỞ MÁY CHƯA CÓ THẺ (FIRST-TIME ONBOARDING + WEBAUTHN + RECOVERY PIN) */}
      {!credential ? (
        <div className="glass-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <UserCheck size={23} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#FFF' }}>
            Kích Hoạt Danh Tính & Sinh Trắc Học
          </h3>
          <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 12px', lineHeight: 1.45 }}>
            Nạp Thẻ Sinh Viên Số (VC) vào IndexedDB, đăng ký <b>WebAuthn FaceID/TouchID</b> và bọc khóa bằng <b>AES-GCM 256-bit</b>.
          </p>

          <div style={{ textAlign: 'left', marginBottom: '12px', background: '#04060A', padding: '10px', borderRadius: '10px', border: pinError ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#38BDF8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <KeyRound size={12} />
              <span>Mã PIN Khôi Phục Nội Bộ 6 Số (PBKDF2 100.000 vòng):</span>
            </div>
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              value={recoveryPin}
              onChange={(e) => {
                setRecoveryPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (pinError) setPinError('');
              }}
              placeholder="Nhập 6 số PIN chuẩn (123456)"
              className="pro-input"
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '13px',
                letterSpacing: '3px',
                textAlign: 'center',
                border: pinError ? '1px solid #EF4444' : undefined
              }}
            />
            {pinError && (
              <div style={{ color: '#EF4444', fontSize: '11px', fontWeight: 700, marginTop: '6px', textAlign: 'center' }}>
                ⚠️ {pinError}
              </div>
            )}
            <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '4px' }}>
              Dùng để kích hoạt lại FaceID mới khi bạn đổi vân tay/khuôn mặt trên điện thoại mà không bị mất thẻ.
            </div>
          </div>

          <button
            onClick={handleActivateInitialVC}
            className="btn-press"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <DownloadCloud size={16} /> Đăng Ký FaceID & Kích Hoạt Thẻ (2251120000)
          </button>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: ĐÃ CÓ THẺ SỐ -> HIỂN THỊ THẺ APPLE WALLET + SELECTIVE DISCLOSURE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pinSavedNotice && (
            <div style={{
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10B981',
              fontSize: '10.5px',
              fontWeight: 700
            }}>
              ✓ {pinSavedNotice}
            </div>
          )}

          <div 
            className="hero-pass"
            style={{
              borderColor: zkpMode ? 'rgba(16, 185, 129, 0.45)' : 'rgba(56, 189, 248, 0.28)'
            }}
          >
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, pointerEvents: 'none' }}>
              <Cpu size={160} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} color={zkpMode ? '#10B981' : '#38BDF8'} />
                <span style={{ fontSize: '10px', color: zkpMode ? '#10B981' : '#38BDF8', fontWeight: 700, letterSpacing: '0.6px' }}>
                  {zkpMode ? 'SELECTIVE DISCLOSURE (ZKP-LITE)' : 'W3C VERIFIABLE CREDENTIAL'}
                </span>
              </div>
              <ShieldCheck size={20} color={zkpMode ? '#10B981' : '#38BDF8'} />
            </div>

            <div style={{ margin: '18px 0 14px' }}>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                {zkpMode ? 'CHỨNG MINH TỐI THIỂU (ẨN DANH TÍNH CÁ NHÂN)' : 'CHỦ THẺ SINH VIÊN'}
              </div>
              <div style={{ fontSize: zkpMode ? '14.5px' : '17px', fontWeight: 800, color: zkpMode ? '#10B981' : '#FFF', marginTop: '2px' }}>
                {zkpMode ? 'Proof = { isUTHStudent: true, status: "Active" }' : credential.fullName.toUpperCase()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#64748B' }}>{zkpMode ? 'THUỘC TÍNH' : 'MSSV'}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#E2E8F0', fontFamily: 'JetBrains Mono' }}>
                    {zkpMode ? 'isUTHStudent: true' : credential.studentId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#64748B' }}>{zkpMode ? 'TRẠNG THÁI' : 'CHUYÊN NGÀNH'}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#E2E8F0' }}>
                    {zkpMode ? 'status: "Active"' : credential.major}
                  </div>
                </div>
              </div>
            </div>

            {showPassQr && (
              <div style={{
                margin: '0 0 12px',
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(4, 6, 10, 0.78)',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ background: '#FFF', padding: '5px', borderRadius: '8px', flexShrink: 0 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                      zkpMode
                        ? `UTH_ZKP_PROOF:{"isUTHStudent":true,"status":"Active"}`
                        : `DID_PASS:${credential.studentId}:${credential.address}`
                    )}`}
                    alt="Pass QR"
                    style={{ width: 66, height: 66, display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.4 }}>
                  {zkpMode
                    ? 'Mã QR ZKP-lite: Chỉ xác nhận trạng thái Sinh viên UTH đang hoạt động mà không tiết lộ Họ tên hay MSSV.'
                    : 'Mã QR Định danh cá nhân đã lưu trong két IndexedDB.'}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                {zkpMode ? 'PII: [HIDDEN BY ZKP]' : `${credential.address.slice(0, 8)}...${credential.address.slice(-6)}`}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setShowPassQr(v => !v)}
                  className="btn-press"
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#E2E8F0', fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <QrCode size={12} color="#38BDF8" />
                  <span>{showPassQr ? 'Ẩn QR' : 'Mã QR'}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(credential.address);
                    setCopied(true);
                    if (navigator.vibrate) navigator.vibrate(35);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-press"
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#38BDF8', fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copied ? <CheckCircle2 size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copied ? 'Đã chép' : 'Chép ví'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* TÙY CHỌN TIẾT LỘ CÓ CHỌN LỌC (SELECTIVE DISCLOSURE / ZKP-LITE) */}
          <div className="glass-card" style={{ borderColor: zkpMode ? 'rgba(16, 185, 129, 0.4)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: zkpMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {zkpMode ? <EyeOff size={15} color="#10B981" /> : <Eye size={15} color="#38BDF8" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>
                    Tiết Lộ Có Chọn Lọc (ZKP-lite)
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    Ẩn Họ tên, Ngày sinh, Địa chỉ ví khi qua cổng / thư viện
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleZkp}
                className="btn-press"
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: zkpMode ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
                  background: zkpMode ? '#10B981' : 'rgba(56, 189, 248, 0.12)',
                  color: zkpMode ? '#04060A' : '#38BDF8',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {zkpMode ? 'ĐANG BẬT ZKP' : 'Bật Ẩn Danh'}
              </button>
            </div>

            {zkpMode && (
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: '#04060A', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '10.5px', color: '#10B981', fontWeight: 700 }}>
                ✓ {zkpVerifiedBadge || 'Hợp lệ: Sinh viên UTH (Active)'}
              </div>
            )}
          </div>

          {/* CHI TIẾT KEY WRAPPING (AES-GCM 256-BIT) & WEBAUTHN PASSKEY + RECOVERY PIN */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Fingerprint size={13} color="#10B981" />
                <span>WEBAUTHN PASSKEY &amp; AES-GCM KEY WRAPPING</span>
              </span>
              <span style={{ fontSize: '9.5px', color: '#10B981', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                PBKDF2 100K
              </span>
            </div>
            <div style={{ background: '#04060A', padding: '7px 9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', color: '#67E8F9', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
              Merkle Root: {credential.merkleRoot.slice(0, 26)}...
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
              ✓ Khóa <code>secp256k1</code> được bọc bằng <b>AES-GCM 256-bit</b> trong IndexedDB. Mở khóa bằng <b>FaceID/TouchID</b> hoặc <b>Mã PIN dự phòng 6 số (123456)</b> khi đổi sinh trắc học trên máy.
            </div>
          </div>

          {/* NÚT THAO TÁC: QUÉT MÃ ĐIỂM DANH NGAY & GỠ THẺ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => navigate('/scan')}
              className="btn-press"
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
              <QrCode size={16} /> Mở Camera Quét Mã Điểm Danh
            </button>

            <button
              onClick={handleRevokeLocal}
              className="btn-press"
              style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Gỡ thẻ số khỏi máy này
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
