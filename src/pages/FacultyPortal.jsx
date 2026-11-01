// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [activeTimeframe, setActiveTimeframe] = useState('Week');
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
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}`)}`
    : '';

  // Dữ liệu mẫu biểu đồ 7 ngày theo ảnh mẫu Kalo
  const weekDays = [
    { day: 'M', height: 55, active: false },
    { day: 'T', height: 48, active: false },
    { day: 'W', height: 60, active: false },
    { day: 'T', height: 52, active: false },
    { day: 'F', height: 85, active: true }, // Friday highlighted gold
    { day: 'S', height: 58, active: false },
    { day: 'S', height: 45, active: false },
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* 1. Section Header: Your progress */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          Your progress
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
          Small steps, big changes.
        </p>
      </div>

      {/* 2. Filter Pills: Week, Month, 3 Months, Year */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Week', 'Month', '3 Months', 'Year'].map((pill) => (
          <button
            key={pill}
            onClick={() => setActiveTimeframe(pill)}
            className={`kalo-pill ${activeTimeframe === pill ? 'active' : ''}`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* 3. Card 1: Calories intake (Điểm danh & Xác thực) */}
      <div className="kalo-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Calories intake</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                1,420
              </span>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>kcal avg</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#d4f938', fontWeight: 700 }}>
              ↓ 8%
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>vs last week</div>
          </div>
        </div>

        {/* Bar chart area */}
        <div style={{ position: 'relative', marginTop: '16px', height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: '36px' }}>
          {/* Reference lines & Y-axis labels */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#52525b', textAlign: 'right' }}>
            <span>2,100</span>
            <span>1,400</span>
            <span>700</span>
            <span>0</span>
          </div>

          {/* Dotted horizontal guides */}
          <div style={{ position: 'absolute', left: 0, right: '36px', top: '10%', borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', left: 0, right: '36px', top: '40%', borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', left: 0, right: '36px', top: '70%', borderTop: '1px dashed rgba(255,255,255,0.06)' }} />

          {/* Vertical Bars */}
          {weekDays.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px', zIndex: 1 }}>
              <div
                style={{
                  width: '10px',
                  height: `${item.height}px`,
                  borderRadius: '9999px',
                  background: item.active
                    ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(180deg, #d4f938 0%, #65a30d 100%)',
                  boxShadow: item.active ? '0 0 12px rgba(245, 158, 11, 0.45)' : 'none',
                  transition: 'height 0.3s ease'
                }}
              />
              <span style={{ fontSize: '11px', color: '#71717a', marginTop: '8px', fontWeight: 600 }}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Card 2: Weight trend (Khoảng cách Geo-fencing) */}
      <div className="kalo-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Weight trend</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                72.4
              </span>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>kg avg</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#d4f938', fontWeight: 700 }}>
              ↓ 1.2 kg
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>vs last week</div>
          </div>
        </div>

        {/* Smooth Line Chart SVG */}
        <div style={{ position: 'relative', marginTop: '12px', height: '110px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#52525b', textAlign: 'right' }}>
            <span>74</span>
            <span>73</span>
            <span>72</span>
            <span>71</span>
          </div>

          <svg width="calc(100% - 24px)" height="90" viewBox="0 0 300 80" style={{ overflow: 'visible' }}>
            {/* Guide line */}
            <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3"/>
            {/* Polyline */}
            <path
              d="M 10 20 L 55 24 L 105 32 L 155 45 L 205 52 L 255 60 L 290 66"
              fill="none"
              stroke="#d4f938"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Circles */}
            <circle cx="10" cy="20" r="4.5" fill="#d4f938" />
            <circle cx="55" cy="24" r="4.5" fill="#d4f938" />
            <circle cx="105" cy="32" r="4.5" fill="#d4f938" />
            <circle cx="155" cy="45" r="4.5" fill="#d4f938" />
            <circle cx="205" cy="52" r="4.5" fill="#d4f938" />
            <circle cx="255" cy="60" r="4.5" fill="#d4f938" />
            <circle cx="290" cy="66" r="4.5" fill="#d4f938" />
          </svg>

          {/* Days row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '30px', marginTop: '4px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} style={{ fontSize: '11px', color: '#71717a', fontWeight: 600 }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Row: 2 Grid Cards (Streak & Daily goal) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {/* Streak card */}
        <div className="kalo-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Streak</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>12</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>days</span>
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>Keep it up!</div>
          </div>

          {/* Circular Flame Gauge */}
          <div style={{ position: 'relative', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="52" height="52" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1f241f" strokeWidth="4"/>
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="url(#flameGrad)"
                strokeWidth="4"
                strokeDasharray="113"
                strokeDashoffset="30"
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
              />
              <defs>
                <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', fontSize: '16px' }}>🔥</div>
          </div>
        </div>

        {/* Daily goal card */}
        <div className="kalo-card">
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Daily goal</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>68%</span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>of weekly avg</span>
          </div>

          {/* Rounded Horizontal Progress Bar */}
          <div style={{ width: '100%', height: '7px', background: '#1f241f', borderRadius: '9999px', overflow: 'hidden', margin: '8px 0 6px' }}>
            <div style={{ width: '68%', height: '100%', background: '#d4f938', borderRadius: '9999px' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#71717a' }}>On track!</div>
        </div>
      </div>

      {/* 6. Section: Insights */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
          Insights
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {/* Insight 1: Avg. calories */}
          <div className="kalo-card" style={{ padding: '12px 10px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Avg. calories</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
              1,420 <span style={{ fontSize: '10px', fontWeight: 400, color: '#9ca3af' }}>kcal</span>
            </div>
            <div style={{ fontSize: '10px', color: '#d4f938', fontWeight: 600 }}>
              ↓ 180 vs last week
            </div>
          </div>

          {/* Insight 2: Macro balance (Donut chart) */}
          <div className="kalo-card" style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', width: '100%', textAlign: 'left' }}>Macro balance</div>
            <div style={{ margin: '6px 0', position: 'relative', width: '38px', height: '38px' }}>
              <svg width="38" height="38" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#d4f938" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="0"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="30 70" strokeDashoffset="-35"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-65"/>
              </svg>
            </div>
            <div style={{ fontSize: '9px', color: '#71717a', lineHeight: '1.4' }}>
              <div><span style={{ color: '#d4f938' }}>●</span> 40% Protein</div>
              <div><span style={{ color: '#22c55e' }}>●</span> 35% Carbs</div>
              <div><span style={{ color: '#f59e0b' }}>●</span> 25% Fat</div>
            </div>
          </div>

          {/* Insight 3: Best day */}
          <div className="kalo-card" style={{ padding: '12px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Best day</span>
              <span style={{ color: '#facc15', fontSize: '12px' }}>★</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
              Friday
            </div>
            <div style={{ fontSize: '11px', color: '#d4f938', fontWeight: 600 }}>
              1,820 kcal
            </div>
            <div style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }}>
              Great job!
            </div>
          </div>
        </div>
      </div>

      {/* 7. Khối Cấu Hình Phiên & QR Code (Giảng Viên & Điểm Danh) */}
      <div className="kalo-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
            👨‍🏫 Quản Trị Phiên Điểm Danh
          </div>
          {session && (
            <span style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: session.mode === 'exam' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(212, 249, 56, 0.15)',
              color: session.mode === 'exam' ? '#f43f5e' : '#d4f938',
              fontWeight: 700,
              border: session.mode === 'exam' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(212, 249, 56, 0.3)'
            }}>
              {session.mode === 'exam' ? 'PHÒNG THI' : 'ĐIỂM DANH LỚP'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Hình thức</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMode('attendance')}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  borderRadius: '10px',
                  border: mode === 'attendance' ? '1px solid #d4f938' : '1px solid rgba(255,255,255,0.08)',
                  background: mode === 'attendance' ? 'rgba(212, 249, 56, 0.12)' : '#0b0e0b',
                  color: mode === 'attendance' ? '#d4f938' : '#9ca3af',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Điểm danh lớp
              </button>
              <button
                type="button"
                onClick={() => setMode('exam')}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  borderRadius: '10px',
                  border: mode === 'exam' ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
                  background: mode === 'exam' ? 'rgba(244, 63, 94, 0.12)' : '#0b0e0b',
                  color: mode === 'exam' ? '#f43f5e' : '#9ca3af',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Phòng thi cử
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Môn học</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="kalo-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Phòng</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="kalo-input"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isLocating}
            className="kalo-btn-primary"
            style={{ width: '100%', marginTop: '4px' }}
          >
            {isLocating ? "Đang chốt toạ độ GPS..." : "📍 Chốt GPS & Phát Mã QR"}
          </button>
        </div>

        {/* Khung QR Code xoay vòng */}
        {session && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                <img src={qrUrl} alt="QR" style={{ width: '100px', height: '100px', display: 'block' }} />
              </div>
              <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.7' }}>
                <div>Phiên: <code style={{ color: '#d4f938', fontWeight: 700 }}>{session.id}</code></div>
                <div>Token Nonce: <code style={{ color: '#d4f938', fontWeight: 800 }}>{dynamicNonce}</code></div>
                <div style={{ color: '#9ca3af' }}>Đổi sau: <strong style={{ color: countdown <= 5 ? '#f43f5e' : '#d4f938' }}>{countdown}s</strong></div>
                <div style={{ color: '#71717a', fontSize: '11px' }}>Bán kính hợp lệ: ≤ {session.radius}m</div>
              </div>
            </div>

            {/* Nút kiểm thử mô phỏng */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button
                onClick={() => simulateCheckin(8, '2251120000')}
                style={{ flex: 1, padding: '7px', fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(212, 249, 56, 0.3)', background: 'rgba(212, 249, 56, 0.1)', color: '#d4f938', cursor: 'pointer', fontWeight: 600 }}
              >
                + Test: SV An (8m)
              </button>
              <button
                onClick={() => simulateCheckin(85, '2251120001')}
                style={{ flex: 1, padding: '7px', fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}
              >
                + Test: SV Bích (85m)
              </button>
            </div>

            {/* Danh sách nhật ký quét */}
            <div style={{ marginTop: '12px', maxHeight: '130px', overflowY: 'auto' }}>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#71717a', fontSize: '11px' }}>
                  Chờ sinh viên quét mã...
                </div>
              ) : (
                records.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
                    <span>{r.name} ({r.dist}m)</span>
                    <span style={{ color: r.valid ? '#d4f938' : '#f87171', fontWeight: 700 }}>
                      {r.statusText}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
