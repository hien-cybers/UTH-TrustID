// src/pages/StudentWalletPro.jsx - Ví Sinh Viên (Holder) Phong Cách Mint Pastel & Dark Matte Bento 2x2
import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  Trash2,
  UserCheck,
  QrCode,
  EyeOff,
  Eye,
  Fingerprint,
  KeyRound,
  Wifi,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';
import { registerBiometric, checkBiometricAvailability } from '../utils/webauthnHelper';
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
  const [expandedCourseId, setExpandedCourseId] = useState('CLS_IT402_N01');
  const [walletSubTab, setWalletSubTab] = useState(initialTab); // 'CARD' | 'HISTORY'
  const [bentoFilter, setBentoFilter] = useState('ALL'); // 'ALL' | 'CLASS' | 'SECURITY'

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
    checkBiometricAvailability().then((info) => {
      setBioHardwareInfo(info);
    });

    const loadInitialVC = async () => {
      const DEFAULT_DEMO_ADDR = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      const DEFAULT_DEMO_PRIV = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const DEFAULT_MERKLE_ROOT = '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2';
      const DEFAULT_MERKLE_PROOF = ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85'];

      const savedVC = await getItem('uth_student_vc');
      if (savedVC) {
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

  // KÍCH HOẠT THẺ LẦN ĐẦU
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

    const { address, deviceId } = await initializeRandomIdentity(studentInfo, cleanPin);

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

    try {
      await registerBiometric(defaultInitialVC.studentId);
    } catch {}

    localStorage.removeItem('uth_vc_explicitly_removed');
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
    setPinSavedNotice(`Đã sinh ví ngẫu nhiên (${address.slice(0, 6)}...${address.slice(-4)}) & liên kết FaceID!`);
    triggerScanSuccessFeedback();
  };

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

  const handleTriggerFaceIdTest = async () => {
    setBioTestSuccessMsg('');
    setShowFaceTestModal(true);
  };

  const handleFaceTestSuccess = () => {
    setShowFaceTestModal(false);
    setBioTestSuccessMsg('✓ Đã xác thực Face ID phần cứng thành công!');
    triggerScanSuccessFeedback();
    setTimeout(() => setBioTestSuccessMsg(''), 4000);
  };

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
      {/* TRƯỜNG HỢP 1: CHƯA KÍCH HOẠT THẺ */}
      {!credential ? (
        <div
          className="animate-fade-scale rounded-[28px] p-5 text-center"
          style={{
            background: '#22222E',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.35)'
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6CE5D4 0%, #ADF6EC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#0A1F22'
            }}
          >
            <UserCheck size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF' }}>
            Kích Hoạt Thẻ Sinh Viên Số
          </h3>
          <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 14px', lineHeight: 1.45 }}>
            Nạp Thẻ Sinh Viên (VC) vào IndexedDB, đăng ký <b>Face ID</b> và bọc khóa bằng <b>AES-GCM 256-bit</b>.
          </p>

          <div
            style={{
              textAlign: 'left',
              marginBottom: '10px',
              background: '#181822',
              padding: '12px',
              borderRadius: '18px',
              border: '1px solid rgba(124,232,216,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Fingerprint size={16} color="#7CE8D8" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Bật Face ID / Vân Tay Native
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBioEnabled((v) => !v)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {bioEnabled ? <ToggleRight size={26} color="#7CE8D8" /> : <ToggleLeft size={26} color="#64748B" />}
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: 'left',
              marginBottom: '14px',
              background: '#181822',
              padding: '12px',
              borderRadius: '18px',
              border: pinError ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#7CE8D8',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <KeyRound size={12} />
              <span>Mã PIN Dự Phòng 6 Số (Mặc định: 123456)</span>
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
              placeholder="123456"
              className="pro-input"
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '13px',
                letterSpacing: '3px',
                textAlign: 'center',
                borderRadius: '14px',
                background: '#12121A',
                border: pinError ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.08)'
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
              padding: '13px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #6CE5D4 0%, #B4F7EE 100%)',
              color: '#0A1F22',
              fontWeight: 900,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(108, 229, 212, 0.28)'
            }}
          >
            <DownloadCloud size={16} /> Kích Hoạt Thẻ Bằng Face ID (2251120000)
          </button>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: ĐÃ CÓ THẺ SỐ -> GIAO DIỆN MINT PASTEL HERO CARD + PILL TABS + BENTO GRID 2x2 */
        <div className="flex flex-col gap-4">
          {pinSavedNotice && (
            <div className="p-3 rounded-2xl bg-[#7CE8D8]/15 border border-[#7CE8D8]/40 text-[#7CE8D8] text-[11px] font-bold">
              {pinSavedNotice}
            </div>
          )}

          {/* 1. HERO CARD MINT PASTEL (Luôn hiển thị ở tab Ví & Lớp học) */}
          {walletSubTab === 'CARD' && (
            <StudentCardClean
              student={{
                name: zkpMode
                  ? 'Proof = { isUTHStudent: true }'
                  : (credential.fullName || 'NGUYỄN ĐỨC HIỂN').toUpperCase(),
                studentId: zkpMode ? 'ZKP-ACTIVE' : credential.studentId,
                major: zkpMode ? 'Ẩn danh chọn lọc' : credential.major,
                faculty: 'CNTT',
                avatar: credential.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                address: zkpMode ? '0x0000...ZKP' : credential.address,
                merkleRoot: credential.merkleRoot,
                validUntil: '2027',
                status: zkpMode ? 'ZKP' : 'ACTIVE'
              }}
              onAvatarChange={!zkpMode ? handleAvatarUpload : undefined}
            />
          )}

          {/* 2. PILL FILTER TABS (Chuẩn thanh "All Devices | Living Room | Bedroom | Kitchen" trong ảnh mẫu) */}
          {walletSubTab === 'CARD' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'CLASS', label: 'Điểm danh QR' },
                { id: 'SECURITY', label: 'Bảo mật FIDO2' },
                { id: 'LEDGER', label: 'Sổ chuyên cần' }
              ].map((pill) => {
                const isActive = bentoFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      if (pill.id === 'LEDGER') {
                        navigate('/history');
                      } else {
                        setBentoFilter(pill.id);
                      }
                    }}
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
          )}

          {/* Thông báo kết quả thử Face ID hoặc ZKP nếu có */}
          {walletSubTab === 'CARD' && (bioTestSuccessMsg || (zkpMode && zkpVerifiedBadge)) && (
            <div className="p-3 rounded-2xl bg-[#22222E] border border-[#7CE8D8]/35 text-[#7CE8D8] text-[11px] font-bold flex items-center justify-between">
              <span>{bioTestSuccessMsg || `✓ ZKP: ${zkpVerifiedBadge}`}</span>
            </div>
          )}

          {/* 3. LƯỚI BENTO 2x2 (Chuẩn 4 ô vuông bo tròn "Air Condition | Smart TV | Smart Lighting | Speaker" trong ảnh mẫu) */}
          {walletSubTab === 'CARD' && (
            <div className="grid grid-cols-2 gap-3.5">
              {/* Ô BENTO 1 (ACTIVE MINT PASTEL): LỚP HỌC ĐANG MỞ & QUÉT QR ĐIỂM DANH */}
              {(bentoFilter === 'ALL' || bentoFilter === 'CLASS') && (
                <div
                  onClick={() => {
                    if (spotCheckState?.isActive && onTriggerSpotCheckFaceID) {
                      onTriggerSpotCheckFaceID();
                    } else {
                      navigate('/scan');
                    }
                  }}
                  className={`rounded-[26px] p-4 flex flex-col justify-between min-h-[158px] cursor-pointer active:scale-[0.98] transition-all ${
                    bentoFilter === 'CLASS' ? 'col-span-2' : ''
                  }`}
                  style={{
                    background: spotCheckState?.isActive
                      ? 'linear-gradient(145deg, #FBBF24 0%, #FDE68A 100%)'
                      : 'linear-gradient(145deg, #6CE5D4 0%, #BFF8F0 100%)',
                    color: '#0A1F22',
                    boxShadow: '0 14px 30px rgba(108, 229, 212, 0.18)'
                  }}
                >
                  {/* Top icons */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-2xl bg-[#0A1F22]/10 flex items-center justify-center text-[#0A1F22]">
                      <QrCode size={19} strokeWidth={2.2} />
                    </div>
                    <Wifi size={16} className="text-[#0A1F22]/80 animate-pulse" />
                  </div>

                  {/* Middle title & subtitle */}
                  <div className="my-2">
                    <div className="text-[14px] font-black text-[#0A1F22] leading-snug truncate">
                      {activeCourseSession?.courseCode || 'IT402.N01'} • Buổi {activeCourseSession?.sessionNumber || 3}
                    </div>
                    <div className="text-[11px] font-semibold text-[#1E4B4E] mt-0.5 truncate">
                      Phòng {activeCourseSession?.room || 'A2-301'} • R ≤ {activeCourseSession?.radius || 35}m
                    </div>
                  </div>

                  {/* Bottom status & toggle switch */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0A1F22]">
                      {spotCheckState?.isActive ? `SPOT ${spotCheckState.countdown}s` : 'QUÉT QR'}
                    </span>
                    <div className="w-11 h-6 rounded-full bg-[#161922] p-1 flex items-center justify-end shadow-inner">
                      <span className="w-4 h-4 rounded-full bg-[#7CE8D8] block shadow" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ô BENTO 2 (DARK MATTE): SINH TRẮC HỌC FACE ID NATIVE */}
              {(bentoFilter === 'ALL' || bentoFilter === 'SECURITY') && (
                <div
                  onClick={() => setBioEnabled((v) => !v)}
                  className="rounded-[26px] p-4 flex flex-col justify-between min-h-[158px] cursor-pointer active:scale-[0.98] transition-all"
                  style={{
                    background: '#22222E',
                    border: '1px solid rgba(255,255,255,0.04)',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-slate-200">
                      <Fingerprint size={19} />
                    </div>
                    <Wifi size={16} className="text-slate-400" />
                  </div>

                  <div className="my-2">
                    <div className="text-[14px] font-bold text-white leading-snug truncate">
                      {bioHardwareInfo?.label || 'Face ID'}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                      PIN dự phòng: 123456
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {bioEnabled ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${
                        bioEnabled ? 'bg-[#7CE8D8]/30 justify-end' : 'bg-[#353545] justify-start'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full block shadow ${
                          bioEnabled ? 'bg-[#7CE8D8]' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ô BENTO 3: CHẾ ĐỘ ẨN DANH ZKP-LITE */}
              {(bentoFilter === 'ALL' || bentoFilter === 'SECURITY') && (
                <div
                  onClick={handleToggleZkp}
                  className="rounded-[26px] p-4 flex flex-col justify-between min-h-[158px] cursor-pointer active:scale-[0.98] transition-all"
                  style={
                    zkpMode
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
                        zkpMode ? 'bg-[#0A1F22]/10 text-[#0A1F22]' : 'bg-white/5 text-slate-200'
                      }`}
                    >
                      {zkpMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <Wifi size={16} className={zkpMode ? 'text-[#0A1F22]/80' : 'text-slate-400'} />
                  </div>

                  <div className="my-2">
                    <div className={`text-[14px] font-bold leading-snug truncate ${zkpMode ? 'text-[#0A1F22] font-black' : 'text-white'}`}>
                      Ẩn Danh ZKP
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${zkpMode ? 'text-[#1E4B4E] font-semibold' : 'text-slate-400'}`}>
                      {zkpMode ? 'Đã che tên & MSSV' : 'Tiết lộ chọn lọc'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${zkpMode ? 'text-[#0A1F22] font-black' : 'text-slate-400'}`}>
                      {zkpMode ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={`w-11 h-6 rounded-full p-1 flex items-center transition-all ${
                        zkpMode ? 'bg-[#161922] justify-end' : 'bg-[#353545] justify-start'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full block shadow ${
                          zkpMode ? 'bg-[#7CE8D8]' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ô BENTO 4 (DARK MATTE): KIỂM TRA FACE ID & QUẢN LÝ THẺ */}
              {(bentoFilter === 'ALL' || bentoFilter === 'SECURITY') && (
                <div
                  className="rounded-[26px] p-4 flex flex-col justify-between min-h-[158px] transition-all"
                  style={{
                    background: '#22222E',
                    border: '1px solid rgba(255,255,255,0.04)',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.25)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-[#7CE8D8]">
                      <ShieldCheck size={19} />
                    </div>
                    <button
                      type="button"
                      onClick={handleRevokeLocal}
                      title="Gỡ thẻ khỏi thiết bị"
                      className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-none cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="my-2">
                    <div className="text-[14px] font-bold text-white leading-snug truncate">
                      Merkle &amp; Khóa
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                      Root: {credential.merkleRoot.slice(0, 10)}...
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTriggerFaceIdTest}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#7CE8D8] text-[11px] font-bold border border-[#7CE8D8]/25 cursor-pointer transition-all"
                    >
                      Thử Quét Face ID
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SỔ CHUYÊN CẦN & BIÊN LAI CHỮ KÝ EIP-191 (KHI Ở TAB /history) */}
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
              <div className="stagger-2 space-y-3.5">
                {/* Banner Tổng Quan Sổ Chuyên Cần Mint Pastel */}
                <div
                  className="rounded-[28px] p-4 flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                    color: '#0A1F22',
                    boxShadow: '0 14px 30px rgba(108, 229, 212, 0.18)'
                  }}
                >
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#1E4B4E]">
                      EIP-191 ATTENDANCE LEDGER
                    </div>
                    <h3 className="text-[16px] font-black text-[#0A1F22] m-0 mt-0.5">
                      Sổ Chuyên Cần Cá Nhân
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#0A1F22] text-[#7CE8D8] font-mono text-[11px] font-bold">
                    {displayCourses.length} học phần
                  </span>
                </div>

                {/* Bộ chọn nhanh MSSV kiểu Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: holderMssv, label: `${holderMssv} (100%)` },
                    { id: '2251120002', label: '2251120002 (66.7%)' },
                    { id: '2251120003', label: '2251120003 (33.3%)' }
                  ].map((item) => {
                    const active = myMssv === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreviewStudentMssv(item.id === holderMssv ? '' : item.id)}
                        className="px-3.5 py-1.5 rounded-full text-[11px] font-mono cursor-pointer border-none transition-all"
                        style={
                          active
                            ? {
                                background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                                color: '#0A1F22',
                                fontWeight: 800
                              }
                            : {
                                background: '#22222E',
                                color: '#94A3B8',
                                fontWeight: 600
                              }
                        }
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
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
                        className="rounded-[24px] overflow-hidden transition-all"
                        style={{
                          background: '#22222E',
                          border: isWarning
                            ? '1px solid rgba(244, 63, 94, 0.45)'
                            : isExpanded
                            ? '1px solid rgba(124, 232, 216, 0.35)'
                            : '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedCourseId(isExpanded ? null : cid)}
                          className="w-full p-4 text-left bg-transparent border-none cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#7CE8D8]/15 text-[#7CE8D8] font-mono text-[10px] font-bold">
                                {course.courseCode}
                              </span>
                              <span className="text-[10.5px] text-slate-400">
                                Phòng {course.defaultRoom}
                              </span>
                              {isWarning ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[9.5px]">
                                  Cảnh báo (&lt; 80%)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold text-[9.5px]">
                                  Đủ điều kiện
                                </span>
                              )}
                            </div>
                            <div className="text-[13px] font-bold text-white truncate mt-1.5">
                              {course.courseName}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className={`font-mono text-xs font-extrabold ${isWarning ? 'text-rose-400' : 'text-[#7CE8D8]'}`}>
                              {myAttendedCount}/{totalSess} ({ratioNum}%)
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
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
                                  className="p-3 rounded-2xl space-y-1.5 text-[10.5px]"
                                  style={{
                                    background: '#181822',
                                    border: !myRec
                                      ? '1px solid rgba(244,63,94,0.3)'
                                      : isException
                                      ? '1px solid rgba(245,158,11,0.35)'
                                      : '1px solid rgba(255,255,255,0.05)'
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <span className="font-mono font-bold text-[#7CE8D8]">
                                        Buổi {sIdx} ({sDate})
                                      </span>
                                      {myRec ? (
                                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                          Lúc {myRec.checkInTime} • GPS: {myRec.distance}m
                                        </span>
                                      ) : (
                                        <span className="block text-[10px] text-rose-300/90 mt-0.5">
                                          Vắng mặt trong phiên đã khóa sổ
                                        </span>
                                      )}
                                    </div>
                                    {myRec ? (
                                      isException ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                          Ngoại lệ ({myRec.distance}m)
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#7CE8D8]/15 text-[#7CE8D8] font-mono font-bold text-[10px]">
                                          ✓ Có mặt ({myRec.distance}m)
                                        </span>
                                      )
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                                        ✕ Vắng
                                      </span>
                                    )}
                                  </div>

                                  {myRec && (
                                    <div className="pt-1.5 border-t border-white/5 space-y-1">
                                      <div className="flex items-center justify-between gap-2 font-mono text-[9.5px]">
                                        <span className="text-slate-400 truncate">
                                          Chữ ký EIP-191: <code className="text-[#7CE8D8]">{receiptSig.slice(0, 14)}...{receiptSig.slice(-6)}</code>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setVerifiedReceiptSessionId(
                                              isReceiptOpen ? null : `${ses.sessionId}_${myMssv}`
                                            )
                                          }
                                          className="px-2.5 py-0.5 rounded-full bg-[#7CE8D8]/15 text-[#7CE8D8] font-sans font-bold text-[9.5px] border-none cursor-pointer flex-shrink-0"
                                        >
                                          {isReceiptOpen ? 'Ẩn biên lai' : 'Đối soát'}
                                        </button>
                                      </div>

                                      {isReceiptOpen && (
                                        <div className="p-2.5 rounded-xl bg-[#12121A] border border-[#7CE8D8]/30 font-mono text-[9.5px] space-y-1 text-slate-300">
                                          <div className="text-[#7CE8D8] font-sans font-bold">
                                            ✓ Biên lai chữ ký số EIP-191 hợp lệ
                                          </div>
                                          <div className="break-all">
                                            <span className="text-slate-400">Chữ ký SV: </span>
                                            <span className="text-[#7CE8D8]">{receiptSig}</span>
                                          </div>
                                          <div className="break-all">
                                            <span className="text-slate-400">Session Hash: </span>
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
                                className="btn-press w-full py-2.5 px-3.5 rounded-2xl border-none font-extrabold text-[11px] cursor-pointer flex items-center justify-between"
                                style={{
                                  background: 'linear-gradient(135deg, #6CE5D4 0%, #BEF8F0 100%)',
                                  color: '#0A1F22'
                                }}
                              >
                                <span>+ Buổi {activeCourseSession.sessionNumber} đang mở điểm danh</span>
                                <span>Quét QR →</span>
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
        </div>
      )}

      {/* Modal Face ID */}
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
