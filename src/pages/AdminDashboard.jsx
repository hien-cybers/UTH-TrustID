// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import '../admin.css';

export default function AdminDashboard() {
  // Thống kê số liệu
  const [stats, setStats] = useState({
    totalDID: 0,
    activeDID: 0,
    revokedDID: 0,
    idsAlerts: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mẫu dữ liệu sinh viên JSON
  const sampleJson = `[
  {
    "studentId": "2251120001",
    "fullName": "Nguyễn Văn An",
    "major": "An toàn Thông tin",
    "address": "0x1D9b6938A3f073e3426052C7016155D85040Ed1D"
  }
]`;

  const [jsonInput, setJsonInput] = useState(sampleJson);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats({
        totalDID: 3,
        activeDID: 2,
        revokedDID: 1,
        idsAlerts: 0
      });
      setIsRefreshing(false);
    }, 600);
  };

  const handleBatchIssue = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      alert(`Đã tính toán Merkle Root cho ${parsed.length} sinh viên và sẵn sàng ký phát hành lô.`);
    } catch (err) {
      alert("Lỗi cú pháp JSON! Vui lòng kiểm tra lại mảng sinh viên.");
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '16px 12px', minHeight: '100vh', background: '#07090e' }}>
      
      {/* 1. KHỐI TIÊU ĐỀ TRUNG TÂM QUẢN TRỊ */}
      <div className="navy-card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ color: '#00f2fe', fontSize: '18px', marginTop: '2px' }}>🔒</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#fff', lineHeight: '1.3' }}>
              Trung Tâm Quản Trị Danh Tính & Giám Sát An Ninh
            </h2>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#8492a6', lineHeight: '1.45' }}>
              Hệ thống quản lý định danh số W3C DID, Smart Contract Registry & Kiểm thử an toàn thông tin NCKH
            </p>
          </div>
        </div>

        {/* Nút làm mới */}
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="btn-refresh" 
          style={{ marginTop: '14px' }}
        >
          <span style={{ fontSize: '14px' }}>🔄</span> 
          {isRefreshing ? "Đang đồng bộ..." : "Làm mới dữ liệu"}
        </button>
      </div>

      {/* 2. GRID 4 Ô THỐNG KÊ (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        
        {/* Tổng DID */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 500 }}>Tổng DID</span>
            <span style={{ color: '#00f2fe', fontSize: '14px' }}>👥</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
            {stats.totalDID}
          </div>
        </div>

        {/* Đang Hoạt Động */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 500 }}>Đang Hoạt Động</span>
            <span style={{ color: '#00e676', fontSize: '14px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#00e676', marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
            {stats.activeDID}
          </div>
        </div>

        {/* Đã Thu Hồi */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 500 }}>Đã Thu Hồi</span>
            <span style={{ color: '#ff5252', fontSize: '14px' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ff5252', marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
            {stats.revokedDID}
          </div>
        </div>

        {/* IDS Cảnh Báo */}
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8492a6', fontWeight: 500 }}>IDS Cảnh Báo</span>
            <span style={{ color: '#ffab00', fontSize: '14px' }}>🔥</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
            {stats.idsAlerts}
          </div>
        </div>

      </div>

      {/* 3. KHỐI CẤP PHÁT CHỨNG CHỈ THEO LÔ (MERKLE TREE) */}
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

        {/* Huy hiệu thuật toán */}
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
            Algorithm: keccak256
          </span>
        </div>

        {/* Nhãn JSON */}
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#c0ccda', marginBottom: '8px' }}>
          Danh sách sinh viên (JSON Array format):
        </div>

        {/* Vùng soạn thảo JSON code */}
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="json-editor"
          spellCheck="false"
        />

        {/* Nạp dữ liệu mẫu */}
        <div style={{ margin: '8px 0 14px' }}>
          <span 
            onClick={() => setJsonInput(sampleJson)}
            style={{ fontSize: '11.5px', color: '#00b4db', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Nạp dữ liệu mẫu khác
          </span>
        </div>

        {/* Nút Ký Phát Hành Lô */}
        <button onClick={handleBatchIssue} className="btn-batch-issue">
          <span>✨</span> Tính Merkle Root & Ký Phát Hành Lô
        </button>
      </div>

    </div>
  );
}
