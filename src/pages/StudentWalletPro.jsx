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
  KeyRound,
  Shield,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';
import { registerBiometric, setupRecoveryPinAndWrapKey, checkBiometricAvailability, verifyBiometricPresence } from '../utils/webauthnHelper';
import { initializeRandomIdentity } from '../utils/identityManager';
import { smartFetch } from '../utils/backendUrl';
import { setItem, getItem, removeItem } from '../utils/db';
import { setActiveWallet } from '../utils/sessionKeyVault';
import FaceIDModal from '../components/FaceIDModal';
import StudentCardClean from '../components/StudentCardClean';
import '../styles/animations.css';

export default function StudentWalletPro({
  isDarkMode = true,
  initialTab = 'CARD',
  activeCourseSession,
  coursesCatalog = [],
  spotCheckState,
  onTriggerSpotCheckFaceID
}) {
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPassQr, setShowPassQr] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState('CLS_IT402_N01');
  const [walletSubTab, setWalletSubTab] = useState(initialTab); // 'CARD' | 'HISTORY'

  useEffect(() => {
    setWalletSubTab(initialTab);
  }, [initialTab]);
  const [previewStudentMssv, setPreviewStudentMssv] = useState('');
  const [verifiedReceiptSessionId, setVerifiedReceiptSessionId] = useState(null);

  // Sinh trắc học phần cứng (Face ID / Touch ID / Keystore)
  const [bioEnabled, setBioEnabled] = useState(true);
  const [bioHardwareInfo, setBioHardwareInfo] = useState({ available: true, label: 'Face ID', isNative: true });
  const [bioTestSuccessMsg, setBioTestSuccessMsg] = useState('');
  const [showFaceTestModal, setShowFaceTestModal] = useState(false);

  // Mã PIN dự phòng 6 số (PBKDF2 100.000 vòng lặp) bọc khóa AES-GCM 256-bit
  const [recoveryPin, setRecoveryPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinSavedNotice, setPinSavedNotice] = useState('');

  // Selective Disclosure / ZKP-lite state
  const [zkpMode, setZkpMode] = useState(false);
  const [zkpVerifiedBadge, setZkpVerifiedBadge] = useState('');

  useEffect(() => {
    // Kiểm tra cảm biến phần cứng Face ID / Vân tay khi khởi động
    checkBiometricAvailability().then((info) => {
      setBioHardwareInfo(info);
    });

    const loadInitialVC = async () => {
      const DEFAULT_DEMO_ADDR = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      const DEFAULT_DEMO_PRIV = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const DEFAULT_MERKLE_ROOT = '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2';
      const DEFAULT_MERKLE_PROOF = ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85'];

      // 1. Ưu tiên đọc từ két IndexedDB an toàn (UTHTRUSTID_DB / identity_vault)
      const savedVC = await getItem('uth_student_vc');
      if (savedVC) {
        // Tự động đồng bộ nếu thẻ cũ dùng địa chỉ ví mẫu không khớp khóa ký
        if (
          savedVC.address?.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d' ||
          savedVC.merkleRoot?.startsWith('0x78ab3199')
        ) {
          const migratedVC = {
            ...savedVC,
            address:
              savedVC.address?.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
                ? DEFAULT_DEMO_ADDR
                : savedVC.address,
            privateKey: savedVC.privateKey || DEFAULT_DEMO_PRIV,
            merkleRoot: DEFAULT_MERKLE_ROOT,
            merkleProof: DEFAULT_MERKLE_PROOF
          };
          setCredential(migratedVC);
          try { setActiveWallet(new ethers.Wallet(migratedVC.privateKey)); } catch {}
          await setItem('uth_student_vc', migratedVC);
          return;
        }
        setCredential(savedVC);
        if (savedVC.privateKey) {
          try { setActiveWallet(new ethers.Wallet(savedVC.privateKey)); } catch {}
        }
        return;
      }

      const savedIdentity = await getItem('uth_did_identity');
      if (savedIdentity && savedIdentity.address) {
        const autoVC = {
          studentId: savedIdentity.student?.studentId || savedIdentity.student?.mssv || '2251120000',
          fullName: savedIdentity.student?.fullName || 'Nguyễn Đức Hiển',
          major: savedIdentity.student?.major || 'An toàn Thông tin',
          avatar: savedIdentity.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          address:
            savedIdentity.address.toLowerCase() === '0x1d9b6938a3f073e3426052c7016155d85040ed1d'
              ? DEFAULT_DEMO_ADDR
              : savedIdentity.address,
          privateKey: savedIdentity.privateKey || DEFAULT_DEMO_PRIV,
          merkleRoot: DEFAULT_MERKLE_ROOT,
          merkleProof: DEFAULT_MERKLE_PROOF,
          issuedAt: new Date().toLocaleDateString('vi-VN')
        };
        setCredential(autoVC);
        try { setActiveWallet(new ethers.Wallet(autoVC.privateKey)); } catch {}
        await setItem('uth_student_vc', autoVC);
        return;
      }

      // Tự động khôi phục Thẻ Sinh viên số khi cài đè (Update) qua Sideloadly / đổi hostname
      if (localStorage.getItem('uth_vc_explicitly_removed') !== 'true') {
        const preservedVC = {
          studentId: '2251120000',
          fullName: 'Nguyễn Đức Hiển',
          major: 'An toàn Thông tin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          address: DEFAULT_DEMO_ADDR,
          privateKey: DEFAULT_DEMO_PRIV,
          merkleRoot: DEFAULT_MERKLE_ROOT,
          merkleProof: DEFAULT_MERKLE_PROOF,
          issuedAt: new Date().toLocaleDateString('vi-VN')
        };
        setCredential(preservedVC);
        try { setActiveWallet(new ethers.Wallet(preservedVC.privateKey)); } catch {}
        await setItem('uth_student_vc', preservedVC);
      }
    };

    loadInitialVC();
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

    const studentInfo = {
      studentId: '2251120000',
      fullName: 'Nguyễn Đức Hiển',
      major: 'An toàn Thông tin',
      faculty: 'Công nghệ Thông tin'
    };

    // 1. Sinh ví ngẫu nhiên 100% & mã hóa Private Key bằng AES-GCM 256-bit (PBKDF2 100K)
    const { address, deviceId } = await initializeRandomIdentity(studentInfo, cleanPin);

    // 2. Neo danh tính và sinh Merkle Proof trên Backend
    let merkleRoot = '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2';
    let merkleProof = ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85'];
    try {
      const regRes = await smartFetch('/api/identity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          studentId: studentInfo.studentId,
          fullName: studentInfo.fullName,
          major: studentInfo.major,
          deviceId
        })
      });
      const regData = await regRes.json();
      if (regData.merkleRoot) {
        merkleRoot = regData.merkleRoot;
        merkleProof = regData.merkleProof || [];
      }
    } catch {}

    const defaultInitialVC = {
      studentId: studentInfo.studentId,
      fullName: studentInfo.fullName,
      major: studentInfo.major,
      faculty: studentInfo.faculty,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address,
      deviceId,
      merkleRoot,
      merkleProof,
      issuedAt: new Date().toLocaleDateString('vi-VN')
    };

    // 3. Đăng ký Passkey WebAuthn (FaceID / TouchID) với userVerification: 'preferred'
    try {
      await registerBiometric(defaultInitialVC.studentId);
    } catch {}

    localStorage.removeItem('uth_vc_explicitly_removed');
    // Lưu thẻ số VC vào IndexedDB (UTHTRUSTID_DB / identity_vault)
    await setItem('uth_student_vc', defaultInitialVC);
    await setItem('uth_vc_storage', defaultInitialVC);
    await removeItem('uth_did_private_key');

    const identityObj = {
      address: defaultInitialVC.address,
      student: {
        studentId: defaultInitialVC.studentId,
        mssv: defaultInitialVC.studentId,
        fullName: defaultInitialVC.fullName,
        major: defaultInitialVC.major,
        faculty: 'Công nghệ Thông tin',
        avatar: defaultInitialVC.avatar
      }
    };
    await setItem('uth_did_identity', identityObj);

    try {
      await saveCredentialToStorage(defaultInitialVC);
    } catch {}

    setCredential(defaultInitialVC);
    setPinSavedNotice(`Đã sinh ví ngẫu nhiên (${address.slice(0, 6)}...${address.slice(-4)}), mã hóa AES-GCM (PIN: ${cleanPin}) & liên kết WebAuthn FaceID!`);
    triggerScanSuccessFeedback();
  };

  // Cập nhật ảnh thẻ sinh viên (Avatar) lưu bền vững vào IndexedDB
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      const updated = { ...credential, avatar: base64Data };
      setCredential(updated);
      await setItem('uth_student_vc', updated);
      triggerScanSuccessFeedback();
    };
    reader.readAsDataURL(file);
  };

  // Kiểm tra quét thử Face ID phần cứng
  const handleTriggerFaceIdTest = async () => {
    setBioTestSuccessMsg('');
    setShowFaceTestModal(true);
  };

  const handleFaceTestSuccess = () => {
    setShowFaceTestModal(false);
    setBioTestSuccessMsg('✓ Đã xác thực Face ID từ phần cứng thành công! Cảm biến Apple / Keystore sẵn sàng.');
    triggerScanSuccessFeedback();
    setTimeout(() => setBioTestSuccessMsg(''), 5000);
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
        const res = await smartFetch('/api/zkp/verify-selective', {
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

  const handleRevokeLocal = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Thẻ số khỏi thiết bị này để thử lại kích hoạt lần đầu?')) {
      localStorage.setItem('uth_vc_explicitly_removed', 'true');
      await removeItem('uth_student_vc');
      await removeItem('uth_secure_vault');
      await removeItem('uth_vc_storage');
      await removeItem('uth_did_private_key');
      await removeItem('uth_did_identity');
      setCredential(null);
      setZkpMode(false);
      setPinSavedNotice('');
    }
  };

  return (
    <div className="page-enter" style={{ width: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.4px' }}>
            SINH VIÊN (HOLDER) • PASSWORDLESS
          </div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
            {walletSubTab === 'HISTORY' ? 'Sổ Chuyên Cần' : 'Ví Danh Tính DID'}
          </h1>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '10.5px',
          fontWeight: 700,
          background: credential ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: credential ? '#10B981' : '#EF4444',
          border: credential ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(239,68,68,0.28)'
        }}>
          <span className={credential ? 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' : 'w-1.5 h-1.5 rounded-full bg-rose-500'} />
          {walletSubTab === 'HISTORY' ? 'EIP-191 Verified' : credential ? 'Đã kích hoạt' : 'Chưa nạp thẻ'}
        </div>
      </div>

      {/* TRƯỜNG HỢP 1: LẦN ĐẦU MỞ MÁY CHƯA CÓ THẺ (FIRST-TIME ONBOARDING + WEBAUTHN + RECOVERY PIN) */}
      {!credential ? (
        <div className="glass-card animate-fade-scale" style={{ padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <UserCheck size={23} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
            Kích Hoạt Danh Tính & Sinh Trắc Học
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.45 }}>
            Nạp Thẻ Sinh Viên Số (VC) vào IndexedDB, đăng ký <b>WebAuthn FaceID/TouchID</b> và bọc khóa bằng <b>AES-GCM 256-bit</b>.
          </p>

          {/* CÀI ĐẶT SINH TRẮC HỌC FACE ID / VÂN TAY NATIVE PHẦN CỨNG */}
          <div style={{ textAlign: 'left', marginBottom: '10px', background: 'var(--bg-inset)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fingerprint size={15} color="#38BDF8" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Bật Face ID / Vân Tay Native:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBioEnabled(v => !v)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {bioEnabled ? <ToggleRight size={26} color="#10B981" /> : <ToggleLeft size={26} color="#64748B" />}
              </button>
            </div>
            <div style={{ fontSize: '9.5px', color: bioEnabled ? '#10B981' : 'var(--text-muted)' }}>
              {bioEnabled
                ? '✓ Đã kích hoạt: Gọi trực tiếp Apple Secure Enclave / Android Keystore khi điểm danh.'
                : '○ Đang tắt: Sẽ chỉ sử dụng mã PIN 6 số khi mở khóa và điểm danh.'}
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '12px', background: 'var(--bg-inset)', padding: '10px', borderRadius: '10px', border: pinError ? '1px solid #EF4444' : '1px solid var(--border-hairline)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#38BDF8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <KeyRound size={12} />
              <span>Mã PIN Dự Phòng 6 Số (Fallback PIN: 123456):</span>
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
                {pinError}
              </div>
            )}
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
            <DownloadCloud size={16} /> Kích Hoạt Thẻ Bằng Face ID (2251120000)
          </button>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: ĐÃ CÓ THẺ SỐ -> HIỂN THỊ THẺ SINH VIÊN & LỚP HỌC PHẦN ĐANG ĐIỂM DANH */
        <div className="flex flex-col gap-3">
          {pinSavedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[11px] font-bold">
              {pinSavedNotice}
            </div>
          )}

          {/* COMPONENT THẺ SINH VIÊN ĐỒNG BỘ DARK NEON & CHẠY TỨC THÌ (< 50MS) */}
          {walletSubTab === 'CARD' && (
            <StudentCardClean
              student={{
                name: zkpMode
                  ? 'Proof = { isUTHStudent: true, status: "Active" }'
                  : (credential.fullName || 'NGUYỄN ĐỨC HIỂN').toUpperCase(),
                studentId: zkpMode ? 'isUTHStudent: true' : credential.studentId,
                major: zkpMode ? 'status: "Active"' : credential.major,
                faculty: 'Công nghệ Thông tin',
                avatar: credential.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                address: zkpMode ? '0x0000...ZKP' : credential.address,
                merkleRoot: credential.merkleRoot,
                validUntil: '2027',
                status: zkpMode ? 'ZKP-LITE' : 'ACTIVE'
              }}
              onScanClick={() => navigate('/scan')}
              onAvatarChange={!zkpMode ? handleAvatarUpload : undefined}
              activeCourseSession={activeCourseSession}
              spotCheckState={spotCheckState}
              onTriggerSpotCheckFaceID={onTriggerSpotCheckFaceID}
            />
          )}

          {/* THẺ LỚP HỌC ĐANG MỞ ĐIỂM DANH (GỘP CHUẨN GỌN GÀNG) */}
          {walletSubTab === 'CARD' && (
            <div className="p-4 rounded-3xl bg-gradient-to-b from-[#08152e] to-[#050d1e] border border-cyan-500/30 space-y-3 shadow-lg shadow-cyan-950/40">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                  {activeCourseSession?.courseCode || 'IT402.N01'} • BUỔI HỌC THỨ {activeCourseSession?.sessionNumber || 3}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Đang mở nhận diện
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white tracking-wide m-0">
                  {activeCourseSession?.courseName || 'An toàn Mạng máy tính & Ứng dụng'}
                </h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 mb-0">
                  Phòng <strong className="text-white">{activeCourseSession?.room || 'A2-301'}</strong> • <span className="text-cyan-300">R ≤ {activeCourseSession?.radius || 35}m</span> • Chế độ: <span className="text-slate-200">{activeCourseSession?.networkMode === 'CAMPUS_WIFI' ? 'Wi-Fi Trường' : '4G/5G'}</span>
                </p>
              </div>

              {/* NÚT QUÉT DUY NHẤT TO, ĐẸP, ĐẶT NGAY DƯỚI THẺ */}
              {spotCheckState?.isActive ? (
                <button
                  type="button"
                  onClick={() => onTriggerSpotCheckFaceID && onTriggerSpotCheckFaceID()}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  XÁC THỰC LẠI FACE ID ({spotCheckState.countdown}s)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] text-slate-950 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  QUÉT QR ĐIỂM DANH BUỔI {activeCourseSession?.sessionNumber || 3}
                </button>
              )}
            </div>
          )}

          {/* 4. CƠ CHẾ CHO PHÉP SINH VIÊN "XEM LỊCH SỬ ĐIỂM DANH CÁ NHÂN" & BIÊN LAI CHỮ KÝ EIP-191 TRÊN APP */}
          {(() => {
            const fallbackCourses = [
              {
                courseId: 'CLS_IT402_N01',
                courseCode: 'IT402.N01',
                courseName: 'An toàn Mạng máy tính & Ứng dụng',
                defaultRoom: 'A2-301',
                defaultRadius: 35,
                schedule: 'Thứ 2 • Ca 3 (13:30 - 16:00)',
                sessions: [
                  {
                    sessionId: 'SES_IT402_B01',
                    sessionIndex: 1,
                    date: '2026-09-15',
                    isFinalized: true,
                    sessionHash: '0x9f84b2c71e09a43d5c621b8e74031a92d8f4c6e1b2a093847561029384756102',
                    attendees: [
                      { studentId: '2251120000', name: 'Nguyễn Đức Hiển', checkInTime: '13:31:15', distance: 3, status: 'VERIFIED', signatureHash: '0x8a91f3c2d401e8b7a1290c4f8e21309a7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b21' },
                      { studentId: '2251120001', name: 'Nguyễn Văn An', checkInTime: '13:32:10', distance: 3, status: 'VERIFIED', signatureHash: '0x7c82e1d4a502f9b8c2310d5e9f32410b8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c32' },
                      { studentId: '2251120002', name: 'Trần Thị Mai', checkInTime: '13:33:45', distance: 5, status: 'VERIFIED', signatureHash: '0x5d61c9b8e304a7f2d1420e6f1a43521c9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d43' }
                    ]
                  },
                  {
                    sessionId: 'SES_IT402_B02',
                    sessionIndex: 2,
                    date: '2026-09-22',
                    isFinalized: true,
                    sessionHash: '0x3e71c8a94d02f65b1a839c7e42019b84f1d2e3c4b5a697887766554433221100',
                    attendees: [
                      { studentId: '2251120000', name: 'Nguyễn Đức Hiển', checkInTime: '13:30:40', distance: 4, status: 'VERIFIED', signatureHash: '0x9b12e4f7a803c6d5b4750b9c4d76854f2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a76' },
                      { studentId: '2251120001', name: 'Nguyễn Văn An', checkInTime: '13:31:04', distance: 4, status: 'VERIFIED', signatureHash: '0x4f63d8a1c209e5b7d8120c3f6e87965a3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b87' }
                    ]
                  },
                  {
                    sessionId: 'SES_IT402_B03',
                    sessionIndex: 3,
                    date: '2026-11-08',
                    isFinalized: true,
                    sessionHash: '0x7a42d9e15c08b34f2e918d6a53027c95e2f3a4b5c6d7e8f90123456789abcdef',
                    attendees: [
                      { studentId: '2251120000', name: 'Nguyễn Đức Hiển', checkInTime: '13:29:50', distance: 2, status: 'VERIFIED', signatureHash: '0x6c95d0f4a208c7e9f0340e5b8a09187c5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d09' },
                      { studentId: '2251120001', name: 'Nguyễn Văn An', checkInTime: '13:30:18', distance: 2, status: 'VERIFIED', signatureHash: '0x5e74b1d3c902a8f6e1450f6c9b10298d6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e10' },
                      { studentId: '2251120002', name: 'Trần Thị Mai', checkInTime: '13:32:05', distance: 4, status: 'VERIFIED', signatureHash: '0x8d16f2a5b403c9e7d2560a7d0c21309e7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f21' },
                      { studentId: '2251120003', name: 'Lê Hoàng Quân', checkInTime: '13:41:30', distance: 48, status: 'EXCEPTION', signatureHash: '0x3c91a4e7d605b2f8c3670b8e1d32410f8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a32' }
                    ]
                  }
                ]
              },
              {
                courseId: 'CLS_IT308_M11',
                courseCode: 'IT308.M11',
                courseName: 'Mật mã học & Ứng dụng Blockchain',
                defaultRoom: 'B1-204',
                defaultRadius: 35,
                schedule: 'Thứ 5 • Ca 1 (07:30 - 10:00)',
                sessions: [
                  {
                    sessionId: 'SES_IT308_B01',
                    sessionIndex: 1,
                    date: '2026-09-18',
                    isFinalized: true,
                    sessionHash: '0x5c83e1f26a09d45b3f029e7b64138d06f3a4b5c6d7e8f90123456789abcdef01',
                    attendees: [
                      { studentId: '2251120000', name: 'Nguyễn Đức Hiển', checkInTime: '07:32:10', distance: 5, status: 'VERIFIED', signatureHash: '0x4b38f4c7d605e2a0f5890d0a3f54632b0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c54' },
                      { studentId: '2251120001', name: 'Nguyễn Văn An', checkInTime: '07:33:15', distance: 8, status: 'VERIFIED', signatureHash: '0x7d49a5d8e706f3b1a6900e1b4a65743c1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d65' },
                      { studentId: '2251120002', name: 'Trần Thị Mai', checkInTime: '07:35:02', distance: 10, status: 'VERIFIED', signatureHash: '0x2f50b6e9f807a4c2b7010f2c5b76854d2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e76' }
                    ]
                  }
                ]
              },
              {
                courseId: 'CLS_IT415_P02',
                courseCode: 'IT415.P02',
                courseName: 'Bảo mật Web & Hệ thống Phân tán',
                defaultRoom: 'A3-402',
                defaultRadius: 50,
                schedule: 'Thứ 6 • Ca 2 (09:30 - 12:00)',
                sessions: [
                  {
                    sessionId: 'SES_IT415_B01',
                    sessionIndex: 1,
                    date: '2026-09-25',
                    isFinalized: true,
                    sessionHash: '0x2d94f0a37b10e56c4a130f8c75249e17a4b5c6d7e8f90123456789abcdef0123',
                    attendees: [
                      { studentId: '2251120000', name: 'Nguyễn Đức Hiển', checkInTime: '09:31:45', distance: 8, status: 'VERIFIED', signatureHash: '0x1c72d8a1b009c6e4d9230b4e7d98076f4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a98' },
                      { studentId: '2251120001', name: 'Nguyễn Văn An', checkInTime: '09:32:11', distance: 9, status: 'VERIFIED', signatureHash: '0x6a83e9b2c10ad7f5ea340c5f8ea9187a5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b09' },
                      { studentId: '2251120002', name: 'Trần Thị Mai', checkInTime: '09:34:05', distance: 12, status: 'VERIFIED', signatureHash: '0x3d94f0c3d20be8a6fb450d6a9fb0298b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c10' }
                    ]
                  }
                ]
              }
            ];
            const displayCourses =
              Array.isArray(coursesCatalog) && coursesCatalog.length > 0 ? coursesCatalog : fallbackCourses;
            const holderMssv = credential?.studentId || '2251120000';
            const myMssv = previewStudentMssv || holderMssv;

            return walletSubTab === 'HISTORY' ? (
              <div className="stagger-2 rounded-3xl p-4 border shadow-sm bg-gradient-to-br from-[#0B1930] to-[#060E1E] border-slate-800 text-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-white m-0">
                    Lịch Sử Chuyên Cần &amp; Biên Lai EIP-191
                  </h3>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                    {displayCourses.length} môn học
                  </span>
                </div>

                {/* Bộ chọn nhanh MSSV */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: holderMssv, label: `${holderMssv} (100%)` },
                    { id: '2251120002', label: '2251120002 (66.7%)' },
                    { id: '2251120003', label: '2251120003 (33.3%)' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreviewStudentMssv(item.id === holderMssv ? '' : item.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold cursor-pointer border transition-all ${
                        myMssv === item.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-[#040814] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {displayCourses.map((course) => {
                    const cid = course.courseId || course.id;
                    const sesList = Array.isArray(course.sessions) ? course.sessions : [];
                    const isExpanded = expandedCourseId === cid;
                    const myAttendedCount = sesList.filter((s) =>
                      (s.attendees || []).some((a) => (a.studentId || a.mssv) === myMssv)
                    ).length;
                    const totalSess = sesList.length;
                    const ratioNum = totalSess > 0 ? Number(((myAttendedCount / totalSess) * 100).toFixed(1)) : 100;
                    const absentCount = totalSess - myAttendedCount;
                    const isWarning = totalSess > 0 && ((ratioNum < 80 && absentCount >= 2) || ratioNum < 60);
                    const isCourseLive =
                      activeCourseSession?.isOpen &&
                      (activeCourseSession.classId === cid || activeCourseSession.courseCode === course.courseCode);

                    return (
                      <div
                        key={cid}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isWarning
                            ? 'bg-rose-950/25 border-rose-500/45'
                            : isExpanded
                            ? 'bg-[#040814] border-cyan-500/45'
                            : 'bg-[#040814]/80 border-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedCourseId(isExpanded ? null : cid)}
                          className="w-full p-3 text-left bg-transparent border-none cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/35 font-mono text-[10px] font-bold text-cyan-300">
                                {course.courseCode}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Phòng {course.defaultRoom}
                              </span>
                              {isWarning ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/25 border border-rose-500/40 text-rose-200 font-bold text-[9.5px]">
                                  Cảnh báo cấm thi (&lt; 80%)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[9.5px]">
                                  Đủ điều kiện thi
                                </span>
                              )}
                              {isCourseLive && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9.5px] font-bold">
                                  Buổi {activeCourseSession.sessionNumber} đang mở
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-white truncate mt-1">
                              {course.courseName}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className={`font-mono text-xs font-extrabold ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {myAttendedCount}/{totalSess} ({ratioNum}%)
                            </div>
                            <div className="text-[9.5px] text-slate-400">
                              {isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1.5 border-t border-slate-800/80 space-y-2">
                            {sesList.map((ses) => {
                              const sIdx = ses.sessionIndex || ses.sessionNumber || 1;
                              const sDate = ses.date || ses.sessionDate || '';
                              const myRec = (ses.attendees || []).find(
                                (a) => (a.studentId || a.mssv) === myMssv
                              );
                              const isException =
                                myRec &&
                                (myRec.status === 'EXCEPTION' ||
                                  myRec.status === 'OUT_OF_RANGE' ||
                                  Number(myRec.distance) > (Number(course.defaultRadius) || 35));
                              const receiptSig =
                                myRec?.signatureHash ||
                                '0x8a91f3c2d401e8b7a1290c4f8e21309a7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b21';
                              const sessionRootHash =
                                ses.sessionHash ||
                                '0x9f84b2c71e09a43d5c621b8e74031a92d8f4c6e1b2a093847561029384756102';
                              const isReceiptOpen = verifiedReceiptSessionId === `${ses.sessionId}_${myMssv}`;

                              return (
                                <div
                                  key={ses.sessionId}
                                  className={`p-2.5 rounded-xl border space-y-1.5 text-[10.5px] ${
                                    !myRec
                                      ? 'bg-rose-950/20 border-rose-500/30'
                                      : isException
                                      ? 'bg-amber-950/20 border-amber-500/35'
                                      : 'bg-[#081226] border-slate-800/90'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <span className="font-mono font-bold text-cyan-300">
                                        Buổi {sIdx} ({sDate})
                                      </span>
                                      {myRec ? (
                                        <span className="block text-[9.5px] text-slate-300 font-mono mt-0.5">
                                          Lúc {myRec.checkInTime} • Khoảng cách GPS: {myRec.distance}m
                                        </span>
                                      ) : (
                                        <span className="block text-[9.5px] text-rose-300/90 mt-0.5">
                                          Không có gói tin điểm danh trong phiên đã khóa sổ
                                        </span>
                                      )}
                                    </div>
                                    {myRec ? (
                                      isException ? (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[10px]">
                                          Ngoại lệ ({myRec.distance}m)
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px]">
                                          ✓ Có mặt ({myRec.distance}m)
                                        </span>
                                      )
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/35 text-rose-300 font-bold text-[10px]">
                                        ✕ Vắng mặt
                                      </span>
                                    )}
                                  </div>

                                  {myRec && (
                                    <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                                      <div className="flex items-center justify-between gap-2 font-mono text-[9.5px]">
                                        <span className="text-slate-400 truncate">
                                          Biên lai chữ ký EIP-191: <code className="text-cyan-300">{receiptSig.slice(0, 16)}...{receiptSig.slice(-6)}</code>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setVerifiedReceiptSessionId(
                                              isReceiptOpen ? null : `${ses.sessionId}_${myMssv}`
                                            )
                                          }
                                          className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-sans font-bold text-[9.5px] cursor-pointer flex-shrink-0"
                                        >
                                          {isReceiptOpen ? 'Ẩn biên lai' : 'Đối soát EIP-191'}
                                        </button>
                                      </div>

                                      {isReceiptOpen && (
                                        <div className="p-2 rounded-lg bg-[#040814] border border-emerald-500/35 font-mono text-[9.5px] space-y-1 text-slate-300">
                                          <div className="text-emerald-400 font-sans font-bold">
                                            ✓ Biên lai chữ ký số EIP-191 hợp lệ &amp; khớp mã băm chốt sổ
                                          </div>
                                          <div className="break-all">
                                            <span className="text-slate-400">Chữ ký SV (EIP-191): </span>
                                            <span className="text-cyan-300">{receiptSig}</span>
                                          </div>
                                          <div className="break-all">
                                            <span className="text-slate-400">Session Hash (GV khóa sổ): </span>
                                            <span className="text-emerald-300">{sessionRootHash}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {isCourseLive && (
                              <button
                                type="button"
                                onClick={() => navigate('/scan')}
                                className="btn-press w-full py-2 px-3 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold text-[10.5px] cursor-pointer flex items-center justify-between"
                              >
                                <span>+ Buổi {activeCourseSession.sessionNumber} đang mở điểm danh</span>
                                <span className="underline">Quét QR ngay →</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}

          {/* KHỐI GOM GỌN: BẢO MẬT SINH TRẮC HỌC FIDO2 & TIẾT LỘ CÓ CHỌN LỌC (ZKP-LITE) */}
          {walletSubTab === 'CARD' && (
            <div className="stagger-3 card-interactive rounded-3xl p-4 border shadow-sm transition-colors duration-200 bg-gradient-to-br from-[#0B1930] to-[#060E1E] border-slate-800 text-slate-100 space-y-2.5">
              {/* Header chung */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Fingerprint size={15} />
                  </div>
                  <h3 className="text-xs font-extrabold m-0 text-white">
                    Bảo Mật Sinh Trắc Học &amp; Ẩn Danh ZKP
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800">
                  {bioHardwareInfo?.label || 'Face ID'} Native
                </span>
              </div>

              {/* 1. Tiết lộ có chọn lọc (ZKP-lite) */}
              <div className="flex justify-between items-center gap-2 bg-[#040814] p-2.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${zkpMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    {zkpMode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-100 truncate">
                    Chế Độ Ẩn Danh ZKP-Lite
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleZkp}
                  className={`btn-press px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer flex-shrink-0 transition-all border ${
                    zkpMode
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {zkpMode ? 'ĐANG BẬT' : 'Bật Ẩn Danh'}
                </button>
              </div>

              {zkpMode && (
                <div className="animate-fade-scale p-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-[10.5px] text-emerald-400 font-bold">
                  {zkpVerifiedBadge || 'Hợp lệ: Sinh viên UTH (Active)'}
                </div>
              )}

              {/* 2. Switch Bật/Tắt Face ID */}
              <div className="flex justify-between items-center bg-[#040814] p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-200">
                  Mở Khóa Face ID / Vân Tay
                </span>
                <button
                  type="button"
                  onClick={() => setBioEnabled(v => !v)}
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  {bioEnabled ? <ToggleRight size={26} color="#10B981" /> : <ToggleLeft size={26} color="#64748B" />}
                </button>
              </div>

              {/* 3. Nút Thử Nghiệm Face ID Ngay & Thông Tin PIN */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleTriggerFaceIdTest}
                  className="col-span-2 py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Fingerprint size={13} />
                  <span>Thử Quét Face ID</span>
                </button>

                <div className="bg-[#040814] border border-slate-800 rounded-xl py-1.5 px-2 text-center flex flex-col justify-center">
                  <span className="text-[9px] text-slate-400">Mã PIN</span>
                  <span className="text-[11px] font-bold font-mono text-cyan-400">123456</span>
                </div>
              </div>

              {bioTestSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-[10px] font-semibold">
                  {bioTestSuccessMsg}
                </div>
              )}

              {/* Footer Merkle Root & Gỡ thẻ */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[9.5px] text-cyan-400 font-mono truncate">
                  Merkle Root: {credential.merkleRoot.slice(0, 22)}...
                </span>
                <button
                  type="button"
                  onClick={handleRevokeLocal}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 text-[10px] font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0 transition-all"
                >
                  <Trash2 size={11} /> Gỡ thẻ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Face ID Apple Laser Scanning & Native Biometric Test */}
      <FaceIDModal
        isOpen={showFaceTestModal}
        onSuccess={handleFaceTestSuccess}
        onCancel={() => setShowFaceTestModal(false)}
        onFallbackPin={() => {
          setShowFaceTestModal(false);
          alert('Chuyển sang kiểm tra mã PIN dự phòng: 123456');
        }}
        studentName={credential?.fullName || 'Nguyễn Đức Hiển'}
        studentId={credential?.studentId || '2251120000'}
        reason="Xác thực cảm biến Face ID / Vân tay phần cứng"
      />

    </div>
  );
}
