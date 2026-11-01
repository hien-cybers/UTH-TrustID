// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'exam'
  const [roomName, setRoomName] = useState('Phòng A3-204');
  const [courseName, setCourseName] = useState('An Toàn Mạng');
  const [session, setSession] = useState(null);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let timer;
    if (session) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setDynamicNonce(Math.random().toString(36).substring(2, 8).toUpperCase());
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [session]);

  const handleStart = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      createSession({ lat: 10.7992, lon: 106.7056 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        createSession({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        createSession({ lat: 10.7992, lon: 106.7056 });
      },
      { timeout: 5000 }
    );
  };

  const createSession = (coords) => {
    setIsLocating(false);
    const nonce = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDynamicNonce(nonce);
    setCountdown(15);
    setSession({
      id: `${mode === 'exam' ? 'EXAM' : 'ATT'}_${Date.now().toString(36).toUpperCase()}`,
      mode,
      roomName,
      courseName,
      coords,
      radius: mode === 'exam' ? 15 : 30
    });
    setRecords([]);
  };

  const simulateCheckin = (dist, mssv) => {
    if (!session) return;
    const st = students.find((s) => s.mssv === mssv);
    if (!st) return;

    let valid = st.status === 'Active' && dist <= session.radius;
    setRecords((prev) => [
      {
        mssv: st.mssv,
        name: st.fullName,
        dist,
        valid,
        statusText: st.status === 'Revoked' ? 'Thẻ bị khóa' : valid ? 'Hợp lệ' : 'Quá xa',
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const qrUrl = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}`)}`
    : '';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '16px' }}>
      {/* Tiêu đề nhỏ gọn */}
      <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
            Cổng Giảng Viên
          </h3>
          <p style={{ margin: '2px 0 0', color: 'var(--text-sub)', fontSize: '12px' }}>
            Điểm danh & phòng thi không mật khẩu
          </p>
        </div>
        {session && (
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: session.mode === 'exam' ? '#881337' : '#0369a1', color: '#fff', fontWeight: 600 }}>
            {session.mode === 'exam' ? 'PHÒNG THI' : 'ĐIỂM DANH'}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        
        {/* Khung cấu hình */}
        <div className="panel">
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#e5e7eb' }}>
            Cấu hình phiên
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', marginBottom: '4px' }}>Mục đích</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setMode('attendance')}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', borderRadius: '4px', border: mode === 'attendance' ? '1px solid #38bdf8' : '1px solid var(--border)', background: mode === 'attendance' ? '#075985' : '#0b0f19', color: '#fff', cursor: 'pointer' }}
                >
                  Điểm danh
                </button>
                <button
                  type="button"
                  onClick={() => setMode('exam')}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', borderRadius: '4px', border: mode === 'exam' ? '1px solid #f43f5e' : '1px solid var(--border)', background: mode === 'exam' ? '#9f1239' : '#0b0f19', color: '#fff', cursor: 'pointer' }}
                >
                  Phòng thi
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', marginBottom: '4px' }}>Môn học</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="input-sm"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', marginBottom: '4px' }}>Phòng học</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="input-sm"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={isLocating}
              className="btn-sm"
              style={{ marginTop: '4px', background: '#0284c7' }}
            >
              {isLocating ? "Đang lấy GPS..." : "Chốt GPS & Tạo mã"}
            </button>
          </div>
        </div>

        {/* Khung mã QR & Nhật ký */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {session ? (
            <>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ background: '#fff', padding: '6px', borderRadius: '6px', display: 'inline-block' }}>
                  <img src={qrUrl} alt="QR" style={{ width: '90px', height: '90px', display: 'block' }} />
                </div>
                <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.6' }}>
                  <div>Phiên: <code style={{ color: '#38bdf8' }}>{session.id}</code></div>
                  <div>Mã: <code style={{ color: '#38bdf8', fontWeight: 700 }}>{dynamicNonce}</code> ({countdown}s)</div>
                  <div style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Bán kính: ≤ {session.radius}m</div>
                </div>
              </div>

              {/* Mô phỏng nhanh */}
              <div style={{ display: 'flex', gap: '6px', margin: '10px 0' }}>
                <button
                  onClick={() => simulateCheckin(8, '2251120000')}
                  style={{ flex: 1, padding: '5px', fontSize: '11px', borderRadius: '4px', border: '1px solid #166534', background: '#052e16', color: '#4ade80', cursor: 'pointer' }}
                >
                  + SV Hợp lệ (8m)
                </button>
                <button
                  onClick={() => simulateCheckin(80, '2251120001')}
                  style={{ flex: 1, padding: '5px', fontSize: '11px', borderRadius: '4px', border: '1px solid #991b1b', background: '#450a0a', color: '#f87171', cursor: 'pointer' }}
                >
                  + SV Quá xa (80m)
                </button>
              </div>

              {/* Danh sách SV */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '140px', fontSize: '12px' }}>
                {records.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-sub)', fontSize: '11px' }}>
                    Chờ quét...
                  </div>
                ) : (
                  records.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1f2937' }}>
                      <span>{r.name} ({r.dist}m)</span>
                      <span style={{ color: r.valid ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                        {r.statusText}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: 'var(--text-sub)', fontSize: '12px' }}>
              Chưa kích hoạt phiên
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
