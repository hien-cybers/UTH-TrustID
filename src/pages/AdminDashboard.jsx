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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: 'clamp(16px, 3vw, 32px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: '800', margin: 0 }}>
              Quản Trị Hệ Thống Root Issuer
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Quản trị vòng đời danh tính số, thu hồi khẩn cấp và nạp dữ liệu sinh viên
          </p>
        </div>

        <label className="btn-primary" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          📁 Nạp Danh Sách (JSON/JS)
          <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Tìm kiếm */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Lọc nhanh danh sách theo MSSV, Họ tên hoặc Số Báo Danh..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="custom-input"
        />
      </div>

      {/* Bảng hồ sơ */}
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(2, 6, 23, 0.6)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px' }}>MSSV / SBD</th>
                <th style={{ padding: '16px' }}>Họ Và Tên</th>
                <th style={{ padding: '16px' }}>Lớp / Ngành Học</th>
                <th style={{ padding: '16px' }}>Trạng Thái Danh Tính</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Thao Tác Bảo Mật</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st) => (
                <tr key={st.mssv} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700 }}>{st.mssv}</div>
                    {st.sbd && <code style={{ fontSize: '12px', color: '#38bdf8' }}>{st.sbd}</code>}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{st.fullName}</td>
                  <td style={{ padding: '16px' }}>
                    <div>{st.classId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{st.major}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: st.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: st.status === 'Active' ? '#34d399' : '#f87171',
                        border: `1px solid ${st.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {st.status === 'Active' ? '✓ ACTIVE' : '⛔ REVOKED'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleStatus(st.mssv)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: st.status === 'Active' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: st.status === 'Active' ? '#f87171' : '#34d399',
                        border: `1px solid ${st.status === 'Active' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {st.status === 'Active' ? 'Thu Hồi (Revoke)' : 'Kích Hoạt Lại'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tích hợp Admin Gateway: Cấp phát Merkle Tree, Cảnh báo IDS, Kiểm thử tấn công */}
      <AdminGateway />
    </div>
  );
}
