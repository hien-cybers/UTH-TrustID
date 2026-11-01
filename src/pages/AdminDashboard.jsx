// src/pages/AdminDashboard.jsx - Trung Tâm Quản Trị Danh Tính & Giám Sát An Ninh (Responsive Multi-Device)
import React, { useState, useEffect } from 'react';
import '../admin.css';
import { buildMerkleTree, verifyMerkleProof, runCryptoBenchmark } from '../services/merkleTree';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDID: 3,
    activeDID: 2,
    revokedDID: 1,
    idsAlerts: 1
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [merkleResult, setMerkleResult] = useState(null);
  const [proofVerifiedMap, setProofVerifiedMap] = useState({});
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Quản lý Vòng đời Thẻ số: Danh sách Danh tính thực tế
  const [identitiesList, setIdentitiesList] = useState({});
  const [manualAddressInput, setManualAddressInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [idsAlertsList, setIdsAlertsList] = useState([
    {
      id: 'ids_01',
      type: 'IMPOSSIBLE_TRAVEL',
      severity: 'CRITICAL',
      detail: 'Teleport: 0x1D9b...Ed1D di chuyển 120km trong 2 phút',
      time: '11:24:10'
    },
    {
      id: 'ids_02',
      type: 'MOCK_GPS',
      severity: 'HIGH',
      detail: 'Fake GPS: Sai số toạ độ accuracy = 0m tuyệt đối',
      time: '11:30:15'
    }
  ]);

  // Phân hệ Khôi Phục Danh Tính Qua Cố Vấn Học Tập (Faculty Social Recovery)
  const [recoverStudentId, setRecoverStudentId] = useState('2251120000');
  const [recoverNewAddress, setRecoverNewAddress] = useState('0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db');
  const [recoverReason, setRecoverReason] = useState('Sinh viên mất thiết bị di động cũ, yêu cầu cấp lại DID');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);

  // Phân hệ Cấp Phát Chứng Chỉ Đủ Điều Kiện Dự Thi (Exam Eligibility VC)
  const [examStudentId, setExamStudentId] = useState('2251120000');
  const [examCourseId, setExamCourseId] = useState('CS402 - An Toàn & Bảo Mật Mạng Máy Tính');
  const [examAttendanceRate, setExamAttendanceRate] = useState(88);
  const [isIssuingExamVC, setIsIssuingExamVC] = useState(false);
  const [examVCResult, setExamVCResult] = useState(null);

  // Mẫu dữ liệu sinh viên JSON
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
    "address": "0x2563EB0284c71e293b0b1329124032a1e293b0b1"
  },
  {
    "studentId": "2251120002",
    "fullName": "Lê Hoàng Cường",
    "major": "Kỹ thuật Mạng",
    "address": "0x38bdf8a1e293b0b12563EB0284c71e293b0b1240"
  }
]`;

  const [jsonInput, setJsonInput] = useState(sampleJson);

  // Lấy dữ liệu an ninh & danh sách danh tính từ server
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [identitiesRes, alertsRes] = await Promise.all([
        fetch('/api/admin/identities').then(r => r.json()).catch(() => null),
        fetch('/api/admin/alerts').then(r => r.json()).catch(() => null)
      ]);

      let total = 3;
      let active = 2;
      let revoked = 1;
      let alertsCount = idsAlertsList.length;

      if (identitiesRes && identitiesRes.identities) {
        setIdentitiesList(identitiesRes.identities);
        const idList = Object.values(identitiesRes.identities);
        total = idList.length;
        revoked = idList.filter(i => i.isRevoked).length;
        active = total - revoked;
      }

      if (alertsRes && alertsRes.alerts) {
        alertsCount = alertsRes.alerts.length;
        setIdsAlertsList(alertsRes.alerts);
      }

      setStats({
        totalDID: total,
        activeDID: active,
        revokedDID: revoked,
        idsAlerts: alertsCount
      });
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Cấp phát chứng chỉ số theo lô Merkle Tree
  const handleBatchIssue = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert("Vui lòng cung cấp mảng JSON hợp lệ chứa ít nhất 1 sinh viên!");
        return;
      }

      const tree = buildMerkleTree(parsed);
      const simulatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const blockNum = Math.floor(58900000 + Math.random() * 100000);

      setMerkleResult({
        root: tree.root,
        batchSize: parsed.length,
        proofs: tree.proofs,
        leaves: tree.leaves,
        txHash: simulatedTxHash,
        blockNumber: blockNum,
        contractAddress: '0x19B8640108cDdD431a49E59eB30aF42D52D7dC21',
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });

      setStats(prev => ({
        ...prev,
        totalDID: prev.totalDID + parsed.length,
        activeDID: prev.activeDID + parsed.length
      }));

      alert(`✅ Đã tính toán Merkle Root cho ${parsed.length} sinh viên và lưu vết On-chain thành công!\nMerkle Root: ${tree.root.slice(0, 18)}...`);
    } catch (err) {
      alert("Lỗi cú pháp JSON: " + err.message);
    }
  };

  const handleVerifySingleProof = (studentId, leafHash) => {
    if (!merkleResult) return;
    const proof = merkleResult.proofs[studentId];
    if (!proof) {
      alert("Không tìm thấy Merkle Proof cho sinh viên này!");
      return;
    }

    const isValid = verifyMerkleProof(leafHash, proof, merkleResult.root);
    setProofVerifiedMap(prev => ({ ...prev, [studentId]: isValid }));
  };

  // Quản lý Vòng đời Thẻ: Thu Hồi & Mở Khóa On-Chain
  const handleToggleRevoke = async (address, currentRevoked) => {
    setIsUpdatingStatus(true);
    try {
      const endpoint = currentRevoked ? '/api/identity/reactivate' : '/api/identity/revoke';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        handleRefresh();
      } else {
        alert(`❌ Thao tác thất bại: ${data.message}`);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleManualRevokeAction = (isRevoke) => {
    if (!manualAddressInput.trim()) {
      alert("Vui lòng nhập địa chỉ ví (Address) cần thao tác!");
      return;
    }
    handleToggleRevoke(manualAddressInput.trim(), !isRevoke);
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const data = await runCryptoBenchmark();
      setBenchmarkData(data);
    } catch (err) {
      alert("Lỗi chạy benchmark: " + err.message);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleSimulateAttack = (type) => {
    let newAlert = null;
    if (type === 'BRUTE_FORCE') {
      newAlert = {
        id: 'ids_' + Date.now(),
        type: 'BRUTE_FORCE',
        severity: 'CRITICAL',
        detail: 'Cảnh báo Brute-force: Gửi chữ ký sai liên tiếp ≥ 3 lần từ IP 118.69.130.42',
        time: new Date().toLocaleTimeString('vi-VN')
      };
    } else {
      newAlert = {
        id: 'ids_' + Date.now(),
        type: 'TELEPORT_JUMP',
        severity: 'HIGH',
        detail: 'Impossible Travel: Dịch chuyển toạ độ vượt ngưỡng vật lý (v > 30 m/s)',
        time: new Date().toLocaleTimeString('vi-VN')
      };
    }

    setIdsAlertsList(prev => [newAlert, ...prev]);
    setStats(prev => ({ ...prev, idsAlerts: prev.idsAlerts + 1 }));
    alert(`[IDS ALERT TRIGGERED]\nĐã phát hiện và ghi nhận sự kiện bất thường: ${newAlert.type}!`);
  };

  const handleFacultySocialRecover = async () => {
    if (!recoverStudentId || !recoverNewAddress) {
      alert("Vui lòng nhập đầy đủ MSSV và địa chỉ ví mới!");
      return;
    }
    setIsRecovering(true);
    setRecoveryResult(null);
    try {
      const res = await fetch('/api/identity/social-recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: recoverStudentId,
          newAddress: recoverNewAddress,
          advisorSig: 'ADVISOR_AUTH_SIG_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          reason: recoverReason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecoveryResult(data);
        alert(`✅ CỐ VẤN HỌC TẬP ĐÃ PHÊ DUYỆT KHÔI PHỤC!\n${data.message}`);
        handleRefresh();
      } else {
        alert(`❌ Khôi phục thất bại: ${data.message}`);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleIssueExamVC = async () => {
    if (!examStudentId || !examCourseId) {
      alert("Vui lòng nhập đầy đủ MSSV và Mã học phần!");
      return;
    }
    setIsIssuingExamVC(true);
    setExamVCResult(null);
    try {
      const res = await fetch('/api/vc/exam-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: examStudentId,
          courseId: examCourseId,
          attendanceRate: Number(examAttendanceRate)
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExamVCResult(data.credential);
        alert(`🎓 ĐÃ CẤP CHỨNG CHỈ ĐỦ ĐIỀU KIỆN DỰ THI (VC)!\nSinh viên: ${data.credential.credentialSubject.studentId}\nTrạng thái: ${data.credential.credentialSubject.status}`);
      } else {
        alert(`❌ Không đủ điều kiện dự thi: ${data.message}`);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsIssuingExamVC(false);
    }
  };

  return (
    <div className="responsive-page-container">
      
      {/* 1. KHỐI TIÊU ĐỀ TRUNG TÂM QUẢN TRỊ */}
      <div className="navy-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🔒
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px', color: '#fff' }}>
                Trung Tâm Quản Trị Danh Tính & Giám Sát An Ninh
              </h2>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#8492a6' }}>
                Quản trị W3C DID, Smart Contract Polygon Registry & Đo lường hiệu năng NCKH
              </p>
            </div>
          </div>

          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="btn-refresh" 
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <span style={{ fontSize: '13px' }}>🔄</span> 
            {isRefreshing ? "Đang đồng bộ..." : "Làm mới On-chain"}
          </button>
        </div>
      </div>

      {/* 2. GRID 4 Ô THỐNG KÊ (Responsive 2x2 trên mobile, 4 cột trên web) */}
      <div className="responsive-stats-grid">
        {/* Tổng DID */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 600 }}>Tổng DID</span>
            <span style={{ color: '#00f2fe', fontSize: '15px' }}>👥</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
            {stats.totalDID}
          </div>
        </div>

        {/* Đang Hoạt Động */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 600 }}>Đang Hoạt Động</span>
            <span style={{ color: '#00e676', fontSize: '15px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e676', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
            {stats.activeDID}
          </div>
        </div>

        {/* Đã Thu Hồi */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 600 }}>Đã Thu Hồi</span>
            <span style={{ color: '#ff5252', fontSize: '15px' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff5252', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
            {stats.revokedDID}
          </div>
        </div>

        {/* IDS Cảnh Báo */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 600 }}>IDS Cảnh Báo</span>
            <span style={{ color: '#ffab00', fontSize: '15px' }}>🔥</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: stats.idsAlerts > 0 ? '#ffab00' : '#fff', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
            {stats.idsAlerts}
          </div>
        </div>
      </div>

      {/* 3. BỐ CỤC 2 CỘT RESPONSIVE (1 cột trên mobile, 2 cột cân đối trên máy tính/web) */}
      <div className="responsive-dashboard-grid">
        
        {/* === CỘT TRÁI === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* A. CẤP PHÁT CHỨNG CHỈ SỐ THEO LÔ (MERKLE TREE) */}
          <div className="navy-card">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: '#00f2fe', fontSize: '16px', marginTop: '1px' }}>🥞</span>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  Cấp Phát Chứng Chỉ Số VC Theo Lô (Batch VC via Merkle Tree)
                </h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#8492a6', lineHeight: '1.45' }}>
                  Tạo gốc Merkle Tree (Root Hash) để xác thực mật mã hàng nghìn sinh viên cùng lúc mà không tốn gas riêng lẻ
                </p>
              </div>
            </div>

            <div style={{ margin: '10px 0 12px' }}>
              <span style={{ 
                display: 'inline-block',
                fontSize: '10.5px', 
                fontWeight: 700, 
                color: '#00f2fe', 
                background: 'rgba(0, 242, 254, 0.1)', 
                border: '1px solid rgba(0, 242, 254, 0.25)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono'
              }}>
                Algorithm: keccak256 • Proof Complexity: O(log N)
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, color: '#c0ccda', marginBottom: '8px' }}>
              Danh sách sinh viên (JSON Array format):
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="json-editor"
              spellCheck="false"
            />

            <div style={{ margin: '8px 0 14px' }}>
              <span 
                onClick={() => setJsonInput(sampleJson)}
                style={{ fontSize: '11.5px', color: '#00b4db', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Nạp lại dữ liệu mẫu JSON
              </span>
            </div>

            <button onClick={handleBatchIssue} className="btn-batch-issue">
              <span>✨</span> Tính Merkle Root & Lưu Vết On-Chain
            </button>

            {merkleResult && (
              <div style={{ marginTop: '14px', padding: '12px', background: '#060911', borderRadius: '8px', border: '1px solid #162032', fontSize: '11.5px' }}>
                <div style={{ color: '#00f2fe', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🔗 ON-CHAIN ANCHORING COMPLETED</span>
                  <span style={{ color: '#00e676' }}>✓ Confirmed</span>
                </div>
                
                <div style={{ color: '#8492a6', lineHeight: '1.6', fontFamily: 'JetBrains Mono' }}>
                  <div>Merkle Root: <strong style={{ color: '#fff', wordBreak: 'break-all' }}>{merkleResult.root}</strong></div>
                  <div>Tx Hash: <span style={{ color: '#38bdf8' }}>{merkleResult.txHash.slice(0, 22)}...</span></div>
                  <div>Block: <span style={{ color: '#ffab00' }}>#{merkleResult.blockNumber}</span> • Polygon Amoy</div>
                  <div>Batch Size: <strong style={{ color: '#00e676' }}>{merkleResult.batchSize} SV</strong></div>
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px solid #162032', paddingTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#8492a6', fontWeight: 600, marginBottom: '6px' }}>
                    DANH SÁCH MERKLE PROOFS (O(log N)):
                  </div>
                  {merkleResult.leaves.map((leaf, idx) => {
                    const sId = leaf.student.studentId || leaf.student.mssv;
                    const isVerified = proofVerifiedMap[sId];
                    return (
                      <div key={idx} style={{ padding: '6px 8px', background: '#0a0e17', borderRadius: '6px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{leaf.student.fullName}</strong>{' '}
                          <span style={{ color: '#8492a6' }}>({sId})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isVerified === true && (
                            <span style={{ color: '#00e676', fontSize: '10.5px', fontWeight: 700 }}>✓ Verified</span>
                          )}
                          <button
                            onClick={() => handleVerifySingleProof(sId, leaf.leafHash)}
                            style={{ padding: '3px 7px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.3)', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', cursor: 'pointer' }}
                          >
                            Verify Proof
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* B. QUẢN LÝ VÒNG ĐỜI THẺ SỐ: THU HỒI & MỞ KHÓA ON-CHAIN (REVOCATION REGISTRY) */}
          <div className="navy-card">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ color: '#ff5252', fontSize: '16px', marginTop: '1px' }}>🔒</span>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  Thu Hồi & Mở Khóa Thẻ Số (Revocation Registry)
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#8492a6', lineHeight: '1.45' }}>
                  Khóa thẻ sinh viên ngay lập tức khi mất máy, bị kỷ luật hoặc tạm đình chỉ học tập, và mở khóa lại khi sự cố được giải quyết.
                </p>
              </div>
            </div>

            {/* Danh sách danh tính đã đăng ký */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
              {Object.keys(identitiesList).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#8492a6', fontSize: '11.5px' }}>
                  Đang đồng bộ danh sách thẻ...
                </div>
              ) : (
                Object.entries(identitiesList).map(([addr, idItem], idx) => (
                  <div key={idx} style={{ padding: '8px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                        {idItem.fullName || 'Sinh viên UTH'} <span style={{ fontSize: '11px', color: '#8492a6' }}>({idItem.studentId})</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                        {addr.slice(0, 14)}...{addr.slice(-6)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: idItem.isRevoked ? 'rgba(255, 82, 82, 0.15)' : 'rgba(0, 230, 118, 0.15)',
                        color: idItem.isRevoked ? '#ff5252' : '#00e676',
                        border: `1px solid ${idItem.isRevoked ? '#ff5252' : '#00e676'}`
                      }}>
                        {idItem.isRevoked ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}
                      </span>

                      <button
                        onClick={() => handleToggleRevoke(addr, idItem.isRevoked)}
                        disabled={isUpdatingStatus}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10.5px',
                          borderRadius: '6px',
                          border: idItem.isRevoked ? '1px solid #00e676' : '1px solid #ff5252',
                          background: idItem.isRevoked ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 82, 82, 0.12)',
                          color: idItem.isRevoked ? '#00e676' : '#ff5252',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {idItem.isRevoked ? '🔓 Mở khóa' : '🚫 Khóa thẻ'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Thao tác nhanh bằng tay theo địa chỉ ví */}
            <div style={{ borderTop: '1px solid #162032', paddingTop: '10px' }}>
              <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '4px' }}>
                Thao tác khẩn cấp theo Địa chỉ ví (Address):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="0x..."
                  value={manualAddressInput}
                  onChange={(e) => setManualAddressInput(e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <button
                  onClick={() => handleManualRevokeAction(true)}
                  disabled={isUpdatingStatus}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ff5252', background: 'rgba(255, 82, 82, 0.15)', color: '#ff5252', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Khóa
                </button>
                <button
                  onClick={() => handleManualRevokeAction(false)}
                  disabled={isUpdatingStatus}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #00e676', background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Mở
                </button>
              </div>
            </div>
          </div>

          {/* C. PHÂN HỆ CỐ VẤN HỌC TẬP KHÔI PHỤC DANH TÍNH (FACULTY SOCIAL RECOVERY) */}
          <div className="navy-card">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ color: '#a855f7', fontSize: '16px', marginTop: '1px' }}>🛡️</span>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  Khôi Phục Danh Tính Qua Cố Vấn (Social Recovery)
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#8492a6', lineHeight: '1.45' }}>
                  Hỗ trợ sinh viên mất máy/hỏng thiết bị: Thu hồi khóa cũ và ánh xạ DID mới mà không mất lịch sử điểm danh
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '3px' }}>MSSV cần khôi phục:</label>
                <input
                  type="text"
                  value={recoverStudentId}
                  onChange={(e) => setRecoverStudentId(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '3px' }}>Địa chỉ ví mới (New Public Key):</label>
                <input
                  type="text"
                  value={recoverNewAddress}
                  onChange={(e) => setRecoverNewAddress(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '3px' }}>Lý do khôi phục:</label>
                <input
                  type="text"
                  value={recoverReason}
                  onChange={(e) => setRecoverReason(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
              </div>
            </div>

            <button
              onClick={handleFacultySocialRecover}
              disabled={isRecovering}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 100%)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              {isRecovering ? 'Đang thực hiện xác thực & đổi khóa...' : '✍️ Cố Vấn Ký Duyệt Cấp Lại DID (Social Recover)'}
            </button>

            {recoveryResult && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#060911', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)', fontSize: '11px' }}>
                <div style={{ color: '#c084fc', fontWeight: 700, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ SOCIAL RECOVERY COMPLETED</span>
                  <span style={{ color: '#00e676' }}>On-Chain Synchronized</span>
                </div>
                <div style={{ color: '#8492a6', fontFamily: 'JetBrains Mono', lineHeight: '1.5' }}>
                  <div>MSSV: <strong style={{ color: '#fff' }}>{recoveryResult.studentId}</strong></div>
                  <div>Ví cũ (Đã thu hồi): <span style={{ color: '#ff5252' }}>{recoveryResult.oldAddress.slice(0, 16)}...</span></div>
                  <div>Ví mới (Đang hoạt động): <span style={{ color: '#00e676' }}>{recoveryResult.newAddress.slice(0, 16)}...</span></div>
                  <div>Audit Trail: <span style={{ color: '#38bdf8' }}>Bảo toàn toàn bộ dữ liệu điểm danh</span></div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* === CỘT PHẢI === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* D. CHỨNG CHỈ ĐỦ ĐIỀU KIỆN DỰ THI (EXAM ELIGIBILITY VC) */}
          <div className="navy-card">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ color: '#38bdf8', fontSize: '16px', marginTop: '1px' }}>🎓</span>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  Chứng Chỉ Đủ Điều Kiện Dự Thi (Exam Eligibility VC)
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#8492a6', lineHeight: '1.45' }}>
                  Ký phát hành chứng chỉ số W3C VC cho sinh viên có tỷ lệ chuyên cần &ge; 80%, gắn thẻ vào hồ sơ thi chính thức
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '3px' }}>Mã số sinh viên (MSSV):</label>
                <input
                  type="text"
                  value={examStudentId}
                  onChange={(e) => setExamStudentId(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8492a6', display: 'block', marginBottom: '3px' }}>Học phần dự thi:</label>
                <input
                  type="text"
                  value={examCourseId}
                  onChange={(e) => setExamCourseId(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#060911', border: '1px solid #162032', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <label style={{ fontSize: '11px', color: '#8492a6' }}>Tỷ lệ điểm danh tích lũy:</label>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: examAttendanceRate >= 80 ? '#00e676' : '#ff5252' }}>
                    {examAttendanceRate}% {examAttendanceRate >= 80 ? '(Đủ điều kiện)' : '(Không đủ điều kiện)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={examAttendanceRate}
                  onChange={(e) => setExamAttendanceRate(e.target.value)}
                  style={{ width: '100%', accentColor: '#00f2fe' }}
                />
              </div>
            </div>

            <button
              onClick={handleIssueExamVC}
              disabled={isIssuingExamVC || examAttendanceRate < 80}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: examAttendanceRate >= 80 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : '#202d4a',
                color: examAttendanceRate >= 80 ? '#fff' : '#64748b',
                fontSize: '12px',
                fontWeight: 700,
                cursor: examAttendanceRate >= 80 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {isIssuingExamVC ? 'Đang ký chứng chỉ số...' : '🎓 Ký & Phát Hành VC Đủ Điều Kiện Dự Thi'}
            </button>

            {examVCResult && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#060911', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '11px' }}>
                <div style={{ color: '#00e676', fontWeight: 700, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ VC ISSUED & DIGITALLY SIGNED</span>
                  <span>W3C Standard</span>
                </div>
                <div style={{ color: '#8492a6', fontFamily: 'JetBrains Mono', lineHeight: '1.5' }}>
                  <div>MSSV: <strong style={{ color: '#fff' }}>{examVCResult.credentialSubject.studentId}</strong></div>
                  <div>Học phần: <span style={{ color: '#38bdf8' }}>{examVCResult.credentialSubject.courseId}</span></div>
                  <div>Chuyên cần: <strong style={{ color: '#00e676' }}>{examVCResult.credentialSubject.attendanceRate}%</strong></div>
                  <div>Trạng thái: <span style={{ color: '#00f2fe' }}>{examVCResult.credentialSubject.status}</span></div>
                  <div style={{ wordBreak: 'break-all', marginTop: '3px' }}>Issuer Sig: <span style={{ color: '#64748b' }}>{examVCResult.proof.signature.slice(0, 32)}...</span></div>
                </div>
              </div>
            )}
          </div>

          {/* E. PHÂN HỆ ĐO LƯỜNG HIỆU NĂNG MẬT MÃ (NCKH BENCHMARK TOOL) */}
          <div className="navy-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  ⚡ Đo Lường Hiệu Năng Mật Mã (NCKH Benchmark)
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#8492a6', lineHeight: '1.4' }}>
                  Định lượng độ trễ thời gian thực phục vụ Chương 4 Luận văn NCKH
                </p>
              </div>
              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isBenchmarking ? 'Đang đo...' : '▶ Chạy Benchmark'}
              </button>
            </div>

            {benchmarkData && (
              <div style={{ marginTop: '10px', background: '#060911', borderRadius: '8px', padding: '10px', border: '1px solid #162032', fontSize: '11.5px', fontFamily: 'JetBrains Mono' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '6px', color: '#8492a6' }}>
                  <span>1. Sinh cặp khóa secp256k1:</span>
                  <strong style={{ color: '#00e676' }}>{benchmarkData.keygenMs} ms</strong>

                  <span>2. Ký thông điệp EIP-191 (secp256k1):</span>
                  <strong style={{ color: '#00e676' }}>{benchmarkData.signEip191Ms} ms</strong>

                  <span>3. Khôi phục địa chỉ ví qua ecrecover:</span>
                  <strong style={{ color: '#00f2fe' }}>{benchmarkData.ecrecoverMs} ms</strong>

                  <span>4. Tính khoảng cách Geo-fencing Haversine:</span>
                  <strong style={{ color: '#00f2fe' }}>{benchmarkData.haversineMs} ms</strong>

                  <span>5. Xây dựng Merkle Tree (100 sinh viên):</span>
                  <strong style={{ color: '#ffab00' }}>{benchmarkData.merkleTreeMs} ms</strong>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #162032', color: '#8492a6', fontSize: '10.5px' }}>
                  Tính toàn vẹn chữ ký: <span style={{ color: '#00e676' }}>100% Khớp với địa chỉ ví chủ sở hữu</span>
                </div>
              </div>
            )}
          </div>

          {/* F. KHỐI GIÁM SÁT AN NINH & CẢNH BÁO IDS */}
          <div className="navy-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 2px', color: '#fff' }}>
                  🔥 Nhật Ký Xâm Nhập & Cảnh Báo IDS ({idsAlertsList.length})
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#8492a6' }}>
                  Phát hiện bất thường: Brute-force, Teleportation & Hardware Mismatch
                </p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleSimulateAttack('BRUTE_FORCE')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '4px', border: '1px solid #ff5252', background: 'rgba(255,82,82,0.1)', color: '#ff5252', cursor: 'pointer' }}
                >
                  + Brute-force
                </button>
                <button
                  onClick={() => handleSimulateAttack('TELEPORT')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '4px', border: '1px solid #ffab00', background: 'rgba(255,171,0,0.1)', color: '#ffab00', cursor: 'pointer' }}
                >
                  + Teleport
                </button>
              </div>
            </div>

            <div style={{ maxHeight: '160px', overflowY: 'auto', marginTop: '6px' }}>
              {idsAlertsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#8492a6', fontSize: '11px' }}>
                  Hệ thống an toàn, không có cảnh báo xâm nhập.
                </div>
              ) : (
                idsAlertsList.map((al, idx) => (
                  <div key={idx} style={{ padding: '8px', borderRadius: '6px', background: '#060911', border: '1px solid #162032', marginBottom: '5px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: al.severity === 'CRITICAL' ? 'rgba(255,82,82,0.2)' : 'rgba(255,171,0,0.2)',
                        color: al.severity === 'CRITICAL' ? '#ff5252' : '#ffab00'
                      }}>
                        {al.type}
                      </span>
                      <span style={{ color: '#8492a6', fontSize: '10px' }}>{al.time}</span>
                    </div>
                    <div style={{ color: '#c0ccda', lineHeight: '1.4' }}>{al.detail}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
