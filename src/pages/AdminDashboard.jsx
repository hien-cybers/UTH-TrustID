// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';
import AdminGateway from '../components/AdminGateway';

export default function AdminDashboard() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [filterQuery, setFilterQuery] = useState('');

  const toggleStatus = (mssv) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.mssv === mssv) {
          return { ...s, status: s.status === 'Active' ? 'Revoked' : 'Active' };
        }
        return s;
      })
    );
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data)) {
          setStudents(data);
          alert(`Đã nạp thành công ${data.length} hồ sơ sinh viên!`);
        }
      } catch (err) {
        alert("File không đúng cấu trúc JSON mảng sinh viên!");
      }
    };
    reader.readAsText(file);
  };

  const filtered = students.filter(
    (s) =>
      s.mssv.includes(filterQuery) ||
      s.fullName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (s.sbd && s.sbd.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(12px, 3vw, 24px)', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', margin: 0, fontWeight: 700, color: '#f43f5e' }}>
            🔒 Quản Trị Cấp Cao (Root Issuer / Admin)
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Cấp phát Bằng chứng số (VC), nạp dữ liệu và kiểm soát thu hồi khóa mật mã
          </p>
        </div>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#059669', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          📂 Nạp Danh Sách (JSON/JS)
          <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Lọc nhanh theo MSSV, Họ tên hoặc Số Báo Danh..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '14px' }}
        />
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>MSSV / SBD</th>
              <th style={{ padding: '12px' }}>Họ và Tên</th>
              <th style={{ padding: '12px' }}>Lớp / Ngành</th>
              <th style={{ padding: '12px' }}>Trạng Thái DID</th>
              <th style={{ padding: '12px' }}>Thao Tác Bảo Mật</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((st) => (
              <tr key={st.mssv} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{st.mssv}</strong>
                  {st.sbd && <div style={{ fontSize: '11px', color: '#38bdf8' }}>{st.sbd}</div>}
                </td>
                <td style={{ padding: '12px' }}>{st.fullName}</td>
                <td style={{ padding: '12px' }}>
                  {st.classId}
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{st.major}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: st.status === 'Active' ? '#064e3b' : '#7f1d1d', color: st.status === 'Active' ? '#34d399' : '#f87171' }}>
                    {st.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => toggleStatus(st.mssv)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: st.status === 'Active' ? '#ef4444' : '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                  >
                    {st.status === 'Active' ? 'Thu hồi (Revoke)' : 'Kích hoạt lại'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tích hợp Admin Gateway: Cấp phát Merkle Tree, Cảnh báo IDS, Kiểm thử tấn công */}
      <AdminGateway />
    </div>
  );
}
