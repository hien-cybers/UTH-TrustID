// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { INITIAL_STUDENTS } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState('session'); // 'session' | 'search'
  
  // Thiết lập phiên
  const [mode, setMode] = useState('attendance');
  const [roomName, setRoomName] = useState('Phòng A3-204');
  const [courseName, setCourseName] = useState('An Toàn Mạng Nâng Cao');
  const [networkPolicy, setNetworkPolicy] = useState('HYBRID_4G_5G');
  const [allowedRadius, setAllowedRadius] = useState(30);

  // Trạng thái phiên
  const [session, setSession] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);

  // Tra cứu
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Bộ đếm lùi đổi mã xoay vòng
  useEffect(() => {
    let timer;
    if (session) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setDynamicNonce(Math.random().toString(36).substring(2, 9).toUpperCase());
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [session]);

  const handleCreateSession = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation!");
      useFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: Math.round(pos.coords.accuracy)
        };
        setIsLocating(false);
        setDynamicNonce(Math.random().toString(36).substring(2, 9).toUpperCase());
        setCountdown(15);
        setSession({
          id: `${mode === 'exam' ? 'EXAM' : 'ATT'}_${Date.now().toString(36).toUpperCase()}`,
          mode,
          roomName,
          courseName,
          networkPolicy,
          allowedRadius: Number(allowedRadius),
          coords,
          createdAt: new Date().toLocaleTimeString('vi-VN')
        });
        setRecords([]);
      },
      (err) => {
        console.warn("Lỗi truy cập GPS: " + err.message + ". Dùng toạ độ cơ sở UTH.");
        useFallbackLocation();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const useFallbackLocation = () => {
    setIsLocating(false);
    const fallbackCoords = { lat: 10.8016, lon: 106.7118, acc: 5 };
    setDynamicNonce(Math.random().toString(36).substring(2, 9).toUpperCase());
    setCountdown(15);
    setSession({
      id: `SES_${Date.now().toString(36).toUpperCase()}`,
      mode,
      roomName,
      courseName,
      networkPolicy,
      allowedRadius: Number(allowedRadius),
      coords: fallbackCoords,
      createdAt: new Date().toLocaleTimeString('vi-VN')
    });
    setRecords([]);
  };

  const handleSimulateCheckin = (distMeter, netType, mssv) => {
    if (!session) return;
    const student = students.find((s) => s.mssv === mssv);
    if (!student) return;

    let status = 'VALID';
    if (student.status === 'Revoked') status = 'REJECTED_REVOKED';
    else if (session.networkPolicy === 'WIFI_ONLY' && netType !== 'WiFi_UTH_SECURE') status = 'REJECTED_NETWORK';
    else if (distMeter > session.allowedRadius) status = 'REJECTED_DISTANCE';

    setRecords((prev) => [
      {
        mssv,
        name: student.fullName,
        dist: distMeter,
        net: netType,
        status,
        time: new Date().toLocaleTimeString('vi-VN')
      },
      ...prev
    ]);
  };

  const qrPayload = session 
    ? `UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}`
    : '';

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: 'clamp(12px, 3vw, 24px)', paddingBottom: 'calc(24px + var(--safe-bottom))' }}>
      
      {/* Cửa sổ Popup Toàn Màn Hình Dành Cho Máy Chiếu */}
      {isFullscreenQR && session && (
        <div className="fullscreen-qr-overlay">
          <div style={{ position: 'absolute', top: 'calc(16px + var(--safe-top))', right: '20px' }}>
            <button
              onClick={() => setIsFullscreenQR(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              ✕ Đóng Toàn Màn Hình
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '8px', background: session.mode === 'exam' ? '#f43f5e' : '#0284c7', color: '#fff', fontSize: '13px', fontWeight: 800 }}>
              {session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP HỌC'}
            </span>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 36px)', margin: '14px 0 6px', color: '#fff', fontWeight: 800 }}>
              {session.courseName} - {session.roomName}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(13px, 2vw, 16px)' }}>
              Quét bằng ứng dụng <strong>UTH-TrustID</strong> trên điện thoại để xác thực tức thì
            </p>
          </div>

          {/* Khối mã QR siêu nét offline vector SVG */}
          <div style={{ background: '#fff', padding: 'clamp(14px, 3vw, 24px)', borderRadius: '24px', boxShadow: '0 0 50px rgba(56, 189, 248, 0.35)', display: 'inline-block' }}>
            <QRCodeSVG
              value={qrPayload}
              size={Math.min(typeof window !== 'undefined' ? window.innerHeight * 0.45 : 340, 340)}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Thanh đếm lùi thời gian đổi mã */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 23, 42, 0.8)', padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>MÃ TOKEN XOAY VÒNG:</div>
              <code style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>{dynamicNonce}</code>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TỰ ĐỔI MÃ SAU:</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f43f5e', fontFamily: 'JetBrains Mono' }}>
                {countdown}s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header thanh chuyển tab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', margin: 0, fontWeight: 800, color: '#38bdf8' }}>
            👨‍🏫 Quản Trị Lớp Học & Phòng Thi
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
            Xác thực không mật khẩu qua W3C DID & Định vị Geo-fencing
          </p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '340px' }}>
          <button
            onClick={() => setActiveTab('session')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'session' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
              color: activeTab === 'session' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Tạo & Chốt Phòng
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'search' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
              color: activeTab === 'search' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Tra Cứu Hồ Sơ
          </button>
        </div>
      </div>

      {activeTab === 'session' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          
          {/* CỘT THIẾT LẬP */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
              ⚙️ Thiết Lập Phòng
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Loại phiên
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('attendance'); setAllowedRadius(30); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: mode === 'attendance' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                      background: mode === 'attendance' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-input)',
                      color: mode === 'attendance' ? '#38bdf8' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📝 Điểm Danh
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('exam'); setAllowedRadius(15); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: mode === 'exam' ? '2px solid #f43f5e' : '1px solid var(--border-color)',
                      background: mode === 'exam' ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-input)',
                      color: mode === 'exam' ? '#f43f5e' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🎯 Phòng Thi
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Học phần / Môn học
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Phòng học
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Chính sách mạng
                </label>
                <select
                  value={networkPolicy}
                  onChange={(e) => setNetworkPolicy(e.target.value)}
                  className="custom-input"
                >
                  <option value="HYBRID_4G_5G">🌐 Cho phép 4G/5G (Kèm GPS phòng)</option>
                  <option value="WIFI_ONLY">🔒 Khóa mạng: Bắt buộc Wi-Fi trường</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Bán kính hợp lệ</label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>{allowedRadius} mét</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={allowedRadius}
                  onChange={(e) => setAllowedRadius(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>

              <button
                onClick={handleCreateSession}
                disabled={isLocating}
                className="btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {isLocating ? "⏳ Đang kết nối GPS..." : "📍 Chốt Toạ Độ & Tạo Phiên"}
              </button>
            </div>
          </div>

          {/* CỘT MÃ QR VÀ NÚT FULLSCREEN */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
            {session ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{session.courseName}</h4>
                    <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>{session.roomName} • {session.id}</p>
                  </div>

                  {/* Nút bật toàn màn hình cho máy chiếu */}
                  <button
                    onClick={() => setIsFullscreenQR(true)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📺</span> Bật Toàn Màn Hình
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '14px 0', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px', flexWrap: 'wrap' }}>
                  <div 
                    onClick={() => setIsFullscreenQR(true)}
                    style={{ background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <QRCodeSVG
                      value={qrPayload}
                      size={95}
                      level="M"
                      includeMargin={false}
                    />
                    <div style={{ fontSize: '10px', color: '#000', fontWeight: 700, marginTop: '2px' }}>CHẠM ĐỂ PHÓNG TO</div>
                  </div>

                  <div style={{ flex: 1, minWidth: '150px', fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ color: '#94a3b8' }}>Mã xoay vòng ({countdown}s):</div>
                    <code style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>{dynamicNonce}</code>
                    <div style={{ color: '#94a3b8', marginTop: '4px' }}>
                      Toạ độ: {session.coords.lat.toFixed(4)}, {session.coords.lon.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Danh sách đã điểm danh */}
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '200px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Nhật ký xác thực ({records.length})
                  </div>
                  {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12px' }}>
                      Chờ sinh viên quét mã...
                    </div>
                  ) : (
                    records.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-input)', marginBottom: '6px', fontSize: '12px' }}>
                        <div>
                          <strong>{r.name}</strong> <span style={{ color: '#94a3b8' }}>({r.mssv})</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Cách {r.dist}m • {r.time}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>
                          {r.status === 'VALID' && <span style={{ color: '#34d399' }}>✓ HỢP LỆ</span>}
                          {r.status === 'REJECTED_DISTANCE' && <span style={{ color: '#f87171' }}>✕ XA PHÒNG</span>}
                          {r.status === 'REJECTED_REVOKED' && <span style={{ color: '#ef4444' }}>⛔ BỊ THU HỒI</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Các nút bấm giả lập demo */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button onClick={() => handleSimulateCheckin(8, '4G', '2251120000')} style={{ padding: '6px 8px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', cursor: 'pointer' }}>
                    + Test: SV An (8m)
                  </button>
                  <button onClick={() => handleSimulateCheckin(90, '5G', '2251120001')} style={{ padding: '6px 8px', fontSize: '11px', background: 'rgba(244, 63, 94, 0.15)', color: '#f87171', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '4px', cursor: 'pointer' }}>
                    + Test: SV Bích (90m)
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📡</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Chưa kích hoạt phiên nào</div>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Nhấn nút "Chốt Toạ Độ & Tạo Phiên" để phát mã QR.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB TRA CỨU */
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700 }}>🔍 Tra Cứu Hồ Sơ Sinh Viên</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Nhập MSSV, SBD hoặc Token..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="custom-input"
              style={{ flex: 1 }}
            />
            <button 
              onClick={() => {
                const q = searchKey.trim().toLowerCase();
                const found = students.find((s) => s.mssv.toLowerCase() === q || s.sbd.toLowerCase() === q || s.qrCodeToken.toLowerCase() === q);
                setSearchResult(found || "NOT_FOUND");
              }} 
              className="btn-primary" 
              style={{ padding: '0 16px' }}
            >
              Tìm
            </button>
          </div>

          {searchResult && searchResult !== 'NOT_FOUND' && (
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-hover)' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>{searchResult.fullName} ({searchResult.mssv})</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>SBD: {searchResult.sbd} • {searchResult.classId} - {searchResult.major}</p>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: searchResult.status === 'Active' ? '#34d399' : '#f87171' }}>
                Trạng thái: <strong>{searchResult.status}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
