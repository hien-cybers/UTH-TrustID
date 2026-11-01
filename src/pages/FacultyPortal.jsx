// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [activeTimeframe, setActiveTimeframe] = useState('Week');
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'exam'
  const [networkPolicy, setNetworkPolicy] = useState('HYBRID_4G_5G'); // 'HYBRID_4G_5G' | 'WIFI_STRICT'
  const [roomName, setRoomName] = useState('Phòng A3-204');
  const [courseName, setCourseName] = useState('An Toàn Mạng');
  const [session, setSession] = useState(null);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  // Đối soát ảnh nhận diện sinh viên (Photo Credential Verification)
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState(null);

  // Hàng đợi ngoại tuyến (Offline Attendance Queue) cho tầng hầm
  const [offlineQueue, setOfflineQueue] = useState([]);

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
      createSession({ lat: 10.7992, lon: 106.7056, acc: 8 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        createSession({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) });
      },
      () => {
        createSession({ lat: 10.7992, lon: 106.7056, acc: 8 });
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
      networkPolicy,
      roomName,
      courseName,
      coords,
      radius: mode === 'exam' ? 15 : 35
    });
    setRecords([]);
  };

  const simulateCheckin = (dist, mssv, isMockGps = false, isOffline = false) => {
    if (!session) return;
    const st = students.find((s) => s.mssv === mssv);
    if (!st) return;

    let valid = st.status === 'Active' && dist <= session.radius && !isMockGps;
    let statusText = 'Hợp lệ';
    if (isMockGps) {
      statusText = 'GIAN LẬN: Mock GPS';
    } else if (st.status === 'Revoked') {
      statusText = 'Thẻ bị thu hồi';
    } else if (dist > session.radius) {
      statusText = 'Quá xa phòng';
    }

    const newRecord = {
      mssv: st.mssv,
      name: st.fullName,
      sbd: st.sbd || 'SBD-000',
      avatar: st.avatar,
      classId: st.classId,
      major: st.major,
      dist,
      valid,
      isMockGps,
      isOffline,
      statusText,
      photoVerified: true,
      time: new Date().toLocaleTimeString()
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Nếu ở chế độ phòng thi, tự động mở cửa sổ đối soát ảnh thẻ cho giám thị
    if (session.mode === 'exam' && valid) {
      setSelectedStudentForPhoto(newRecord);
    }
  };

  // Thêm vé ngoại tuyến vào hàng đợi
  const handleAddOfflineTicket = () => {
    const randomSt = students[Math.floor(Math.random() * students.length)];
    const ticket = {
      ticketId: 'OFFLINE_TKT_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      student: randomSt,
      timestamp: new Date().toLocaleTimeString(),
      signatureVerified: true
    };
    setOfflineQueue((prev) => [ticket, ...prev]);
  };

  // Đồng bộ vé ngoại tuyến lên máy chủ khi có mạng
  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    offlineQueue.forEach((t) => {
      simulateCheckin(0, t.student.mssv, false, true);
    });
    alert(`Đã đồng bộ thành công ${offlineQueue.length} vé điểm danh ngoại tuyến về hệ thống!`);
    setOfflineQueue([]);
  };

  const qrUrl = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}:${session.networkPolicy}`)}`
    : '';

  // Dữ liệu mẫu biểu đồ 7 ngày
  const weekDays = [
    { day: 'M', height: 55, active: false },
    { day: 'T', height: 48, active: false },
    { day: 'W', height: 60, active: false },
    { day: 'T', height: 52, active: false },
    { day: 'F', height: 85, active: true },
    { day: 'S', height: 58, active: false },
    { day: 'S', height: 45, active: false },
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* 1. Tiêu đề phân mục */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          Cổng Giảng Viên
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#85858e' }}>
          Khảo thí & Điểm danh chuẩn W3C DID • Chống Fake GPS
        </p>
      </div>

      {/* 2. Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
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

      {/* 3. Card 1: Calories intake / Thống kê điểm danh */}
      <div className="card-flat" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#85858e', fontWeight: 600 }}>TẦN SUẤT ĐIỂM DANH LỚP</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                1,420
              </span>
              <span style={{ fontSize: '12px', color: '#85858e' }}>lượt/tuần</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700 }}>
              ↓ 8%
            </div>
            <div style={{ fontSize: '10px', color: '#85858e' }}>so với tuần trước</div>
          </div>
        </div>

        {/* Biểu đồ cột */}
        <div style={{ position: 'relative', marginTop: '14px', height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: '32px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '9px', color: '#52525b', textAlign: 'right' }}>
            <span>2,100</span>
            <span>1,400</span>
            <span>700</span>
            <span>0</span>
          </div>

          <div style={{ position: 'absolute', left: 0, right: '32px', top: '10%', borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', left: 0, right: '32px', top: '50%', borderTop: '1px dashed rgba(255,255,255,0.06)' }} />

          {weekDays.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '26px', zIndex: 1 }}>
              <div
                style={{
                  width: '9px',
                  height: `${item.height}px`,
                  borderRadius: '9999px',
                  background: item.active
                    ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(180deg, #a3e635 0%, #65a30d 100%)',
                  boxShadow: item.active ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                  transition: 'height 0.3s ease'
                }}
              />
              <span style={{ fontSize: '10px', color: '#85858e', marginTop: '6px', fontWeight: 600 }}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Khối Cấu Hình Phiên Điểm Danh & Phòng Thi */}
      <div className="card-flat" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#f4f4f5' }}>
            Cấu hình phiên làm việc
          </div>
          {session && (
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: session.mode === 'exam' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(163, 230, 53, 0.12)',
              color: session.mode === 'exam' ? '#ef4444' : '#a3e635',
              fontWeight: 700
            }}>
              {session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP HỌC'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Nút chọn hình thức */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#85858e', marginBottom: '4px' }}>Mục đích</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setMode('attendance')}
                style={{
                  flex: 1,
                  padding: '7px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: mode === 'attendance' ? '1px solid #a3e635' : '1px solid #242424',
                  background: mode === 'attendance' ? 'rgba(163, 230, 53, 0.12)' : '#0d0d0d',
                  color: mode === 'attendance' ? '#a3e635' : '#85858e',
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
                  padding: '7px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: mode === 'exam' ? '1px solid #ef4444' : '1px solid #242424',
                  background: mode === 'exam' ? 'rgba(239, 68, 68, 0.12)' : '#0d0d0d',
                  color: mode === 'exam' ? '#ef4444' : '#85858e',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Phòng thi (Gắt)
              </button>
            </div>
          </div>

          {/* Ràng buộc mạng Wi-Fi trường */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#85858e', marginBottom: '4px' }}>Chính sách mạng (Anti-Relay)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setNetworkPolicy('HYBRID_4G_5G')}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: networkPolicy === 'HYBRID_4G_5G' ? '1px solid #a3e635' : '1px solid #242424',
                  background: networkPolicy === 'HYBRID_4G_5G' ? '#1c1c1c' : '#0d0d0d',
                  color: networkPolicy === 'HYBRID_4G_5G' ? '#a3e635' : '#85858e',
                  cursor: 'pointer'
                }}
              >
                4G/5G + Geo-fence
              </button>
              <button
                type="button"
                onClick={() => setNetworkPolicy('WIFI_STRICT')}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: networkPolicy === 'WIFI_STRICT' ? '1px solid #a3e635' : '1px solid #242424',
                  background: networkPolicy === 'WIFI_STRICT' ? '#1c1c1c' : '#0d0d0d',
                  color: networkPolicy === 'WIFI_STRICT' ? '#a3e635' : '#85858e',
                  cursor: 'pointer'
                }}
              >
                Khóa Wi-Fi UTH-Secure
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#85858e', marginBottom: '3px' }}>Môn học</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="input-flat"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#85858e', marginBottom: '3px' }}>Phòng</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="input-flat"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isLocating}
            className="btn-lime"
            style={{ width: '100%', marginTop: '4px' }}
          >
            {isLocating ? 'Đang chốt toạ độ GPS...' : '📍 Chốt GPS & Tạo Mã QR'}
          </button>
        </div>

        {/* Khung QR Code xoay vòng */}
        {session && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1c1c1c' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', display: 'inline-block' }}>
                <img src={qrUrl} alt="QR" style={{ width: '95px', height: '95px', display: 'block' }} />
              </div>
              <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.6' }}>
                <div>Phiên: <code style={{ color: '#a3e635', fontWeight: 700 }}>{session.id}</code></div>
                <div>Nonce Token: <code style={{ color: '#a3e635', fontWeight: 800 }}>{dynamicNonce}</code></div>
                <div style={{ color: '#85858e' }}>Đổi sau: <strong style={{ color: countdown <= 5 ? '#ef4444' : '#a3e635' }}>{countdown}s</strong></div>
                <div style={{ color: '#85858e' }}>Bán kính: ≤ {session.radius}m • Mạng: {session.networkPolicy === 'WIFI_STRICT' ? 'Wi-Fi UTH' : 'Tự do'}</div>
              </div>
            </div>

            {/* Các nút mô phỏng kiểm thử an ninh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '12px' }}>
              <button
                onClick={() => simulateCheckin(8, '2251120000', false)}
                style={{ padding: '6px', fontSize: '10px', borderRadius: '4px', border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}
              >
                + SV An (8m)
              </button>
              <button
                onClick={() => simulateCheckin(0, '2251120001', true)}
                style={{ padding: '6px', fontSize: '10px', borderRadius: '4px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
              >
                + Fake GPS (0m)
              </button>
              <button
                onClick={() => simulateCheckin(90, '2251120002', false)}
                style={{ padding: '6px', fontSize: '10px', borderRadius: '4px', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}
              >
                + SV Xa (90m)
              </button>
            </div>

            {/* Danh sách sinh viên đã quét & Nút xem ảnh thẻ đối soát */}
            <div style={{ marginTop: '12px', maxHeight: '140px', overflowY: 'auto' }}>
              <div style={{ fontSize: '11px', color: '#85858e', fontWeight: 600, marginBottom: '6px' }}>
                NHẬT KÝ ĐỐI SOÁT TỨC THỜI ({records.length})
              </div>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#85858e', fontSize: '11px' }}>
                  Chờ sinh viên quét mã...
                </div>
              ) : (
                records.map((r, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedStudentForPhoto(r)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '4px', background: '#0d0d0d', border: '1px solid #1c1c1c', marginBottom: '4px', fontSize: '11px', cursor: 'pointer' }}
                    title="Bấm để xem ảnh thẻ đối soát"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={r.avatar} alt="thumb" style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1c1c1c' }} />
                      <div>
                        <strong>{r.name}</strong> <span style={{ color: '#85858e' }}>({r.sbd})</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: r.valid ? '#a3e635' : '#ef4444', fontWeight: 700 }}>
                        {r.statusText}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Phân Hệ Ngoại Tuyến (Offline Attendance Sync Queue) */}
      <div className="card-flat" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Điểm danh ngoại tuyến (Tầng hầm B1)</div>
            <div style={{ fontSize: '11px', color: '#85858e' }}>Chế độ không có sóng 4G / Wi-Fi</div>
          </div>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#1c1c1c', color: '#a3e635', fontFamily: 'JetBrains Mono' }}>
            Queue: {offlineQueue.length} vé
          </span>
        </div>

        <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#85858e', lineHeight: '1.5' }}>
          Sinh viên đưa mã vé Offline Attendance Token đã ký số trước. Giám thị quét offline lưu vào máy, khi có mạng trở lại sẽ đẩy lên server.
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleAddOfflineTicket}
            style={{ flex: 1, padding: '7px', fontSize: '11px', borderRadius: '6px', border: '1px solid #242424', background: '#0d0d0d', color: '#f4f4f5', cursor: 'pointer' }}
          >
            + Giả lập nhận vé offline
          </button>
          <button 
            onClick={handleSyncOfflineQueue}
            disabled={offlineQueue.length === 0}
            className="btn-lime"
            style={{ flex: 1, padding: '7px', fontSize: '11px' }}
          >
            Đồng bộ lên Server
          </button>
        </div>
      </div>

      {/* MODAL ĐỐI SOÁT ẢNH THẺ SINH VIÊN (PHOTO CREDENTIAL VERIFICATION) */}
      {selectedStudentForPhoto && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 7, 5, 0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-flat" style={{ maxWidth: '340px', width: '100%', textAlign: 'center', border: '1px solid #a3e635' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#85858e', fontWeight: 700 }}>ĐỐI SOÁT ẢNH THẺ PHÒNG THI</span>
              <button 
                onClick={() => setSelectedStudentForPhoto(null)}
                style={{ background: 'none', border: 'none', color: '#85858e', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Ảnh thẻ sinh viên chính thức */}
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '3px solid #a3e635', padding: '3px', margin: '0 auto 12px', background: '#0d0d0d' }}>
              <img src={selectedStudentForPhoto.avatar} alt="Official Photo" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f4f4f5' }}>
              {selectedStudentForPhoto.name}
            </div>
            <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700, margin: '2px 0 8px' }}>
              SỐ BÁO DANH: {selectedStudentForPhoto.sbd}
            </div>

            <div style={{ background: '#0d0d0d', padding: '10px', borderRadius: '6px', fontSize: '11px', textAlign: 'left', lineHeight: '1.6', color: '#85858e', marginBottom: '14px' }}>
              <div>MSSV: <strong style={{ color: '#fff' }}>{selectedStudentForPhoto.mssv}</strong></div>
              <div>Lớp: <strong style={{ color: '#fff' }}>{selectedStudentForPhoto.classId}</strong></div>
              <div>Trạng thái: <strong style={{ color: '#a3e635' }}>{selectedStudentForPhoto.statusText}</strong></div>
              <div>Chữ ký số VC: <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono' }}>ECDSA Verified ✓</span></div>
            </div>

            <button
              onClick={() => setSelectedStudentForPhoto(null)}
              className="btn-lime"
              style={{ width: '100%' }}
            >
              ✓ Xác Nhận Đúng Thí Sinh
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
