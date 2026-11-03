// src/pages/AdminDashboardPro.jsx
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
  Copy
} from 'lucide-react';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';

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

  const handleComputeMerkle = async () => {
    setIsProcessing(true);
    setMerkleResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Dữ liệu phải là mảng JSON hợp lệ chứa ít nhất 1 sinh viên!');
      }

      // Dựng Merkle Tree và tính Root chuẩn ethers solidityPackedKeccak256
      const { rootHash, studentCredentials } = generateMerkleCredentials(parsed);

      // Lưu trữ Merkle Root & Chứng chỉ vào localStorage & IndexedDB
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
    } catch (err) {
      setMerkleResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  return (
    <div style={{ padding: '16px 14px' }}>
      
      {/* Header Quản Trị */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.4px' }}>
          SYSTEM CONSOLE • ROOT ISSUER
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '3px 0 0', color: '#FFF' }}>
          Trung Tâm Quản Trị Danh Tính
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          Giám sát Smart Contract Registry & Quản lý cấp phát theo lô
        </p>
      </div>

      {/* LƯỚI 4 Ô CHỈ SỐ THIẾT KẾ PHẲNG CAO CẤP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        
        <div className="native-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Tổng DID</span>
            <Users size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', marginTop: '6px' }} className="font-mono">
            {stats.totalDID}
          </div>
        </div>

        <div className="native-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Đang Hoạt Động</span>
            <CheckCircle size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '6px' }} className="font-mono">
            {stats.activeDID}
          </div>
        </div>

        <div className="native-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Đã Thu Hồi</span>
            <AlertTriangle size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', marginTop: '6px' }} className="font-mono">
            {stats.revokedDID}
          </div>
        </div>

        <div className="native-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>IDS Cảnh Báo</span>
            <ShieldAlert size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: stats.idsAlerts > 0 ? '#F59E0B' : '#FFF', marginTop: '6px' }} className="font-mono">
            {stats.idsAlerts}
          </div>
        </div>

      </div>

      {/* KHỐI CẤP PHÁT THEO LÔ MERKLE TREE */}
      <div className="native-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color="#38BDF8" />
          <h2 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#FFF' }}>
            Cấp Phát Chứng Chỉ Số Theo Lô (Batch VC)
          </h2>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Sinh Merkle Root nén dữ liệu xác thực danh tính hàng loạt nhằm tối ưu hóa chi phí gas trên mạng lưới Blockchain.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Terminal size={13} color="var(--text-tertiary)" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            Mảng dữ liệu JSON thí sinh:
          </span>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          spellCheck="false"
          style={{
            width: '100%',
            height: '130px',
            background: '#07090E',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: '#38BDF8',
            fontFamily: 'JetBrains Mono',
            fontSize: '11px',
            lineHeight: 1.4,
            padding: '10px',
            outline: 'none',
            resize: 'none'
          }}
        />

        <div style={{ marginTop: '12px' }}>
          <button 
            onClick={handleComputeMerkle}
            disabled={isProcessing}
            className="native-btn-primary"
          >
            <RotateCw size={15} className={isProcessing ? 'animate-spin' : ''} />
            <span>{isProcessing ? 'Đang dựng Merkle Tree...' : 'Tính Merkle Root & Ký Phát Hành Lô'}</span>
          </button>
        </div>

        {/* Kết quả phát hành */}
        {merkleResult && (
          <div style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '10px',
            background: merkleResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: merkleResult.success ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
          }}>
            {merkleResult.success ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Đã tính Merkle Root & nạp {merkleResult.count} chứng chỉ thành công
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{merkleResult.timestamp}</span>
                </div>
                <div style={{
                  background: '#07090E',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '10.5px',
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
              <div style={{ color: '#EF4444', fontSize: '11.5px' }}>
                Lỗi nạp mảng: {merkleResult.error}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
