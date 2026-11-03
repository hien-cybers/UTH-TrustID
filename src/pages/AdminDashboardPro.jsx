// src/pages/AdminDashboardPro.jsx - Trung Tâm Quản Trị Cấp Cao (Chỉ dành cho ROLE = ADMIN):
// 1. Security Console (#11): Giám sát Tổng DID, Active, Revoked, IDS Alerts
// 2. Batch VC Issuance (#10): Băm danh sách sinh viên bằng keccak256, tạo Merkle Root & Merkle Proof
// 3. On-Chain Revocation & Recovery (Bước 2 / Mảnh ghép #5): Gọi revokeKey(old_address) & Cấp lại Merkle Proof mới khi mất máy
import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  Layers, 
  Terminal,
  CheckCircle2,
  Copy,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { ethers } from 'ethers';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';

export default function AdminDashboardPro() {
  const [stats, setStats] = useState({
    totalDID: 1240,
    activeDID: 1238,
    revokedDID: 2,
    idsAlerts: 0
  });

  const sampleJson = `[
  {
    "studentId": "2251120000",
    "fullName": "Nguyễn Đức Hiển",
    "major": "An toàn Thông tin",
    "address": "0x1D9b6938A3f073e3426052C7016155D85040Ed1D"
  },
  {
    "studentId": "2251120001",
    "fullName": "Trần Thị Bích",
    "major": "Khoa học Dữ liệu",
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
]`;

  const [jsonInput, setJsonInput] = useState(sampleJson);
  const [merkleResult, setMerkleResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);

  // State phục vụ Bước 2: Thu hồi khóa máy cũ revokeKey(old_address) & Cấp lại Merkle Proof mới
  const [recoveryForm, setRecoveryForm] = useState({
    mssv: '2251120000',
    fullName: 'Nguyễn Đức Hiển',
    cccdNumber: '079204009981',
    oldAddress: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D'
  });
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);

  const handleComputeMerkle = async () => {
    setIsProcessing(true);
    setMerkleResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Dữ liệu phải là mảng JSON hợp lệ chứa ít nhất 1 sinh viên!');
      }

      const { rootHash, studentCredentials } = generateMerkleCredentials(parsed);

      localStorage.setItem('uth_latest_merkle_root', rootHash);
      localStorage.setItem('uth_issued_credentials', JSON.stringify(studentCredentials));

      for (const cred of studentCredentials) {
        try {
          await saveCredentialToStorage(cred);
        } catch {}
      }

      setStats(prev => ({
        ...prev,
        totalDID: prev.totalDID + studentCredentials.length,
        activeDID: prev.activeDID + studentCredentials.length
      }));

      setMerkleResult({
        success: true,
        rootHash,
        count: studentCredentials.length,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
      triggerScanSuccessFeedback();
    } catch (err) {
      setMerkleResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // BƯỚC 2: Thực thi hàm revokeKey(old_address) trên Smart Contract / Backend & Cấp lại Merkle Proof mới
  const handleExecuteRevokeAndRecover = async () => {
    setIsRecovering(true);
    setRecoveryResult(null);
    try {
      const newWallet = ethers.Wallet.createRandom();
      const newDeviceId = ethers.keccak256(
        ethers.toUtf8Bytes(`UTH_NEW_DEVICE_HW:${navigator.userAgent}:${Date.now()}`)
      );

      const res = await fetch('/api/identity/kyc-key-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: recoveryForm.mssv,
          fullName: recoveryForm.fullName,
          major: 'An toàn Thông tin',
          cccdNumber: recoveryForm.cccdNumber,
          oldAddress: recoveryForm.oldAddress,
          newAddress: newWallet.address,
          newDeviceId
        })
      });
      const data = await res.json();

      if (data.success && data.newIdentity) {
        const updatedVC = {
          studentId: data.newIdentity.studentId,
          fullName: data.newIdentity.fullName,
          major: data.newIdentity.major,
          address: data.newIdentity.address,
          privateKey: newWallet.privateKey,
          merkleRoot: data.newIdentity.merkleRoot,
          merkleProof: data.newIdentity.merkleProof,
          leafHash: data.newIdentity.leafHash,
          issuedAt: new Date().toLocaleDateString('vi-VN')
        };

        localStorage.setItem('uth_student_vc', JSON.stringify(updatedVC));
        localStorage.setItem('uth_did_private_key', newWallet.privateKey);
        localStorage.setItem('uth_bound_device_id', newDeviceId);
        await saveCredentialToStorage(updatedVC);

        setStats(prev => ({
          ...prev,
          revokedDID: prev.revokedDID + 1
        }));

        setRecoveryResult({
          revokedOldAddress: recoveryForm.oldAddress,
          newAddress: updatedVC.address,
          newMerkleRoot: updatedVC.merkleRoot,
          txHash: data.revokeKeyTxHash
        });
        setRecoveryForm(prev => ({ ...prev, oldAddress: updatedVC.address }));
        triggerScanSuccessFeedback();
      }
    } catch {} finally {
      setIsRecovering(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Header Quản Trị */}
      <div>
        <div style={{ fontSize: '10.5px', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.4px' }}>
          SYSTEM CONSOLE • ROOT ADMIN (ISSUER)
        </div>
        <h1 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0', color: '#FFF' }}>
          Trung Tâm Quản Trị Danh Tính
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
          Giám sát Smart Contract Registry, Phát hành lô Merkle & Thu hồi khóa <code>revokeKey()</code>
        </p>
      </div>

      {/* 1. BẢNG ĐIỀU KHIỂN AN NINH (SECURITY CONSOLE - #11) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Tổng DID</span>
            <Users size={15} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '21px', fontWeight: 800, color: '#FFF', marginTop: '4px' }} className="font-mono">
            {stats.totalDID}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Đang Hoạt Động</span>
            <CheckCircle size={15} color="#10B981" />
          </div>
          <div style={{ fontSize: '21px', fontWeight: 800, color: '#10B981', marginTop: '4px' }} className="font-mono">
            {stats.activeDID}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Đã Thu Hồi</span>
            <AlertTriangle size={15} color="#EF4444" />
          </div>
          <div style={{ fontSize: '21px', fontWeight: 800, color: '#EF4444', marginTop: '4px' }} className="font-mono">
            {stats.revokedDID}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>IDS Cảnh Báo</span>
            <ShieldAlert size={15} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '21px', fontWeight: 800, color: stats.idsAlerts > 0 ? '#F59E0B' : '#FFF', marginTop: '4px' }} className="font-mono">
            {stats.idsAlerts}
          </div>
        </div>
      </div>

      {/* 2. CẤP PHÁT THEO LÔ BẰNG MERKLE TREE (BATCH VC ISSUANCE - #10) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
          <Layers size={16} color="#38BDF8" />
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#FFF' }}>
            Phát Hành Lô Bằng Merkle Tree (Batch VC)
          </h2>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '10.5px', color: '#94A3B8', lineHeight: 1.4 }}>
          Băm danh sách sinh viên bằng <code>keccak256</code>, tạo Merkle Root và mảng Merkle Proof lưu vào IndexedDB.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Terminal size={12} color="#64748B" />
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
            Mảng dữ liệu JSON sinh viên:
          </span>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          spellCheck="false"
          style={{
            width: '100%',
            height: '110px',
            background: '#050811',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            color: '#38BDF8',
            fontFamily: 'JetBrains Mono',
            fontSize: '10.5px',
            lineHeight: 1.4,
            padding: '9px',
            outline: 'none',
            resize: 'none'
          }}
        />

        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={handleComputeMerkle}
            disabled={isProcessing}
            className="native-btn-primary btn-press"
            style={{ padding: '11px' }}
          >
            <RotateCw size={14} className={isProcessing ? 'animate-spin' : ''} />
            <span>{isProcessing ? 'Đang dựng Merkle Tree...' : 'Tính Merkle Root & Ký Phát Hành Lô'}</span>
          </button>
        </div>

        {merkleResult && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '10px',
            background: merkleResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: merkleResult.success ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
          }}>
            {merkleResult.success ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Đã phát hành {merkleResult.count} VC thành công
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#64748B' }}>{merkleResult.timestamp}</span>
                </div>
                <div style={{
                  background: '#04060A',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '10px',
                  color: '#67E8F9',
                  wordBreak: 'break-all',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{merkleResult.rootHash}</span>
                  <button
                    onClick={() => copyToClipboard(merkleResult.rootHash)}
                    style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: 0 }}
                  >
                    {copiedRoot ? <CheckCircle2 size={12} color="#10B981" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#EF4444', fontSize: '11px' }}>
                Lỗi nạp mảng: {merkleResult.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BƯỚC 2 / MẢNH GHÉP #5: THU HỒI THẺ & CẤP LẠI KHI MẤT MÁY (revokeKey(old_address)) */}
      <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.28)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={15} color="#F43F5E" />
            <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#FFF' }}>
              Thu Hồi & Cấp Lại Khi Mất Máy
            </h2>
          </div>
          <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono', color: '#F43F5E' }}>
            revokeKey(old_address)
          </span>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '10.5px', color: '#94A3B8', lineHeight: 1.4 }}>
          Gọi hàm <code>revokeKey(old_address)</code> trên Smart Contract để khóa vĩnh viễn ví trên điện thoại bị mất, sau đó sinh cặp khóa mới và cấp lại Merkle Proof mới cho sinh viên.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '3px', fontWeight: 600 }}>MSSV</div>
            <input
              className="pro-input"
              value={recoveryForm.mssv}
              onChange={(e) => setRecoveryForm({ ...recoveryForm, mssv: e.target.value })}
            />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '3px', fontWeight: 600 }}>Số CCCD Đối Soát</div>
            <input
              className="pro-input"
              value={recoveryForm.cccdNumber}
              onChange={(e) => setRecoveryForm({ ...recoveryForm, cccdNumber: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '3px', fontWeight: 600 }}>
            Địa chỉ ví máy cũ cần khóa (<code>old_address</code>)
          </div>
          <input
            className="pro-input"
            style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#F43F5E' }}
            value={recoveryForm.oldAddress}
            onChange={(e) => setRecoveryForm({ ...recoveryForm, oldAddress: e.target.value })}
          />
        </div>

        <button
          onClick={handleExecuteRevokeAndRecover}
          disabled={isRecovering}
          className="native-btn-primary btn-press"
          style={{
            padding: '11px',
            background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
          }}
        >
          <KeyRound size={14} />
          <span>
            {isRecovering ? 'Đang gọi revokeKey(old_address)...' : 'Thực Thi revokeKey() & Cấp Lại Merkle Proof Mới'}
          </span>
        </button>

        {recoveryResult && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontSize: '11px', fontWeight: 800 }}>
              <FileCheck2 size={14} />
              <span>Đã Khóa Ví Cũ & Cấp Lại Merkle Proof Mới!</span>
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: '#94A3B8', marginTop: '5px', lineHeight: 1.5, wordBreak: 'break-all' }}>
              <div>• Revoked: {recoveryResult.revokedOldAddress.slice(0, 12)}...{recoveryResult.revokedOldAddress.slice(-6)}</div>
              <div style={{ color: '#38BDF8' }}>• Ví máy mới: {recoveryResult.newAddress.slice(0, 12)}...{recoveryResult.newAddress.slice(-6)}</div>
              <div style={{ color: '#10B981' }}>• Merkle Root mới: {recoveryResult.newMerkleRoot.slice(0, 18)}...</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
