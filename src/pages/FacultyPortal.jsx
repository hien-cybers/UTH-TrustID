// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Minimize2, X, Tv } from 'lucide-react';
import { INITIAL_STUDENTS, calculateDistance } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState('session'); // 'session' | 'search'
  
  // Thiết lập phiên
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'exam'
  const [roomName, setRoomName] = useState('Phòng Lab B302 - Cơ sở Bình Thạnh');
  const [courseName, setCourseName] = useState('An Toàn Mạng Nâng Cao');
  const [networkPolicy, setNetworkPolicy] = useState('HYBRID_4G_5G');
  const [allowedRadius, setAllowedRadius] = useState(30);

  // Phiên hoạt động
  const [session, setSession] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Tra cứu
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState(null);

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

  // Bật / tắt chế độ toàn màn hình (Full Screen Projector Mode)
  const handleToggleFullscreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // Giữ nguyên định vị chính xác của phần trước
  const handleCreateSession = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation! Đang dùng toạ độ cơ sở UTH Bình Thạnh.");
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
        console.warn("Lỗi truy cập GPS: " + err.message + ". Đang dùng toạ độ cơ sở UTH Bình Thạnh.");
        useFallbackLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const useFallbackLocation = () => {
    setIsLocating(false);
    const fallbackCoords = { lat: 10.8016, lon: 106.7118, acc: 10 };
    setDynamicNonce(Math.random().toString(36).substring(2, 9).toUpperCase());
    setCountdown(15);
    setSession({
      id: `${mode === 'exam' ? 'EXAM' : 'ATT'}_${Date.now().toString(36).toUpperCase()}`,
      mode,
      roomName,
      courseName,
      networkPolicy,
      allowedRadius: Number(allowedRadius),
      coords: fallbackCoords,
      createdAt: new Date().toLocaleTimeString('vi-VN')
    });
    setRecords([]);
    alert("Đã kích hoạt phiên tại toạ độ cơ sở UTH Bình Thạnh (GPS Fallback)!");
  };

  const handleSimulateCheckin = (distMeter, netType, mssv) => {
    if (!session) return;
    const student = students.find((s) => s.mssv === mssv);
    if (!student) return;

    let status = 'VALID';
    if (student.status === 'Revoked') {
      status = 'REJECTED_REVOKED';
    } else if (session.networkPolicy === 'WIFI_ONLY' && netType !== 'WiFi_UTH_SECURE') {
      status = 'REJECTED_NETWORK';
    } else if (distMeter > session.allowedRadius) {
      status = 'REJECTED_DISTANCE';
    }

    setRecords((prev) => [
      {
        mssv,
        name: student.fullName,
        sbd: student.sbd,
        dist: distMeter,
        net: netType,
        status,
        time: new Date().toLocaleTimeString('vi-VN')
      },
      ...prev
    ]);
  };

  const handleSearch = () => {
    const q = searchKey.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }
    const found = students.find(
      (s) => s.mssv.toLowerCase() === q || s.qrCodeToken.toLowerCase() === q || (s.sbd && s.sbd.toLowerCase() === q)
    );
    setSearchResult(found || "NOT_FOUND");
  };

  const qrPayloadString = session ? JSON.stringify({
    action: 'uth_checkin',
    id: session.id,
    mode: session.mode,
    nonce: dynamicNonce,
    lat: session.coords.lat,
    lon: session.coords.lon,
    netPolicy: session.networkPolicy,
    radius: session.allowedRadius,
    domain: 'uth.edu.vn',
    ts: Date.now()
  }) : '';

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: 'clamp(16px, 3vw, 32px)' }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>👨‍🏫</span>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              Cổng Quản Trị Giảng Viên
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Quản lý phòng thi & điểm danh định danh số W3C DID, Geo-fencing toạ độ lớp học
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('session')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'session' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
              color: activeTab === 'session' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🎯 Quản Lý Buổi Học / Thi
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'search' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
              color: activeTab === 'search' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔍 Tra Cứu Hồ Sơ VC
          </button>
        </div>
      </div>

      {activeTab === 'session' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          
          {/* CỘT TRÁI: THIẾT LẬP */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Thiết Lập Thông Số Phiên
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Loại phiên làm việc
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('attendance'); setAllowedRadius(30); }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: mode === 'attendance' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                      background: mode === 'attendance' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-input)',
                      color: mode === 'attendance' ? '#38bdf8' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📝 Điểm Danh Lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('exam'); setAllowedRadius(15); }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: mode === 'exam' ? '2px solid #f43f5e' : '1px solid var(--border-color)',
                      background: mode === 'exam' ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-input)',
                      color: mode === 'exam' ? '#f43f5e' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🎯 Phòng Thi Cử
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Tên học phần / Môn thi
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Phòng học / Giảng đường
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Chính sách kết nối mạng
                </label>
                <select
                  value={networkPolicy}
                  onChange={(e) => setNetworkPolicy(e.target.value)}
                  className="custom-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="HYBRID_4G_5G">🌐 Cho phép 4G / 5G (Kiểm soát bằng GPS Haversine)</option>
                  <option value="WIFI_ONLY">🔒 Khóa mạng: Bắt buộc Wi-Fi trường (UTH-Secure)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Bán kính GPS hợp lệ
                  </label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                    {allowedRadius} mét
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={allowedRadius}
                  onChange={(e) => setAllowedRadius(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              <button
                onClick={handleCreateSession}
                disabled={isLocating}
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isLocating ? "⏳ Đang kết nối GPS..." : "📍 Chốt Toạ Độ & Tạo Phiên"}
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: MÀN HÌNH QR & ĐỐI SOÁT */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            {session ? (
              <>
                {/* Header phiên */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: session.mode === 'exam' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: session.mode === 'exam' ? '#f43f5e' : '#38bdf8', fontSize: '12px', fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP HỌC'}
                    </div>
                    <h3 style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: 700 }}>{session.courseName}</h3>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>{session.roomName} • Phiên: <code style={{ color: '#38bdf8' }}>{session.id}</code></p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(56, 189, 248, 0.08)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TỰ ĐỔI MÃ</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: countdown <= 5 ? '#f43f5e' : '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                        {countdown}s
                      </div>
                    </div>

                    <button
                      onClick={handleToggleFullscreen}
                      title="Bật toàn màn hình máy chiếu giảng đường"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Maximize2 size={15} />
                      <span style={{ display: 'inline' }}>Toàn Màn Hình</span>
                    </button>
                  </div>
                </div>

                {/* Khối hiển thị QR động */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0', padding: '16px', background: 'var(--bg-input)', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                  <div 
                    onClick={handleToggleFullscreen}
                    title="Bấm để phóng to toàn màn hình máy chiếu"
                    style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  >
                    <QRCodeSVG
                      value={qrPayloadString}
                      size={100}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px', fontSize: '13px', lineHeight: '1.7' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Token xoay vòng:</div>
                    <code style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>{dynamicNonce}</code>
                    <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      📍 GPS Chốt: <strong>{session.coords.lat.toFixed(4)}, {session.coords.lon.toFixed(4)}</strong> (±{session.coords.acc}m)
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      📶 Chế độ mạng: <strong>{session.networkPolicy === 'WIFI_ONLY' ? 'Chỉ Wi-Fi trường (UTH-Secure)' : '4G/5G/Wi-Fi'}</strong>
                    </div>
                    <button
                      onClick={handleToggleFullscreen}
                      className="btn-primary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        marginTop: '10px',
                        width: '100%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                      }}
                    >
                      <Maximize2 size={14} />
                      <span>⛶ Phóng Toàn Màn Hình Máy Chiếu</span>
                    </button>
                  </div>
                </div>

                {/* Các nút bấm mô phỏng nhanh */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    MÔ PHỎNG KIỂM THỬ THỜI GIAN THỰC (DEMO TEST):
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleSimulateCheckin(8, '4G_Viettel', '2251120000')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      ✓ SV Hiển (4G, 8m - Hợp lệ)
                    </button>
                    <button
                      onClick={() => handleSimulateCheckin(95, '5G_Vinaphone', '2251120001')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(244, 63, 94, 0.15)', color: '#f87171', border: '1px solid rgba(244, 63, 94, 0.3)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      ✕ SV Bích (95m - Quá xa)
                    </button>
                    <button
                      onClick={() => handleSimulateCheckin(12, 'WiFi_UTH_SECURE', '2251120002')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      ⛔ SV Cường (Thẻ bị Revoked)
                    </button>
                  </div>
                </div>

                {/* Nhật ký điểm danh */}
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Danh sách xác thực ({records.length})</span>
                    <span>Trạng thái</span>
                  </div>

                  {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
                      Đang chờ sinh viên quét mã QR...
                    </div>
                  ) : (
                    records.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-input)',
                          marginBottom: '8px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            MSSV: {r.mssv} {r.sbd ? `• SBD: ${r.sbd}` : ''} • Cách {r.dist}m • {r.net} • {r.time}
                          </div>
                        </div>

                        <div>
                          {r.status === 'VALID' && (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              ✓ HỢP LỆ
                            </span>
                          )}
                          {r.status === 'REJECTED_DISTANCE' && (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(244, 63, 94, 0.15)', color: '#f87171', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                              ✕ NGOÀI PHÒNG
                            </span>
                          )}
                          {r.status === 'REJECTED_NETWORK' && (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                              ⚠️ SAI MẠNG
                            </span>
                          )}
                          {r.status === 'REJECTED_REVOKED' && (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                              ⛔ BỊ THU HỒI
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '340px', color: '#64748b' }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>📡</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>Chưa có phiên làm việc nào</div>
                <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Nhấn nút "Chốt Toạ Độ & Tạo Phiên" ở bảng bên trái để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB TRA CỨU HỒ SƠ SINH VIÊN */
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
            🔍 Tra Cứu Hồ Sơ Sinh Viên & Bằng Chứng Số (VC)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 20px' }}>
            Tìm kiếm bằng Mã Số Sinh Viên (MSSV), Số Báo Danh (SBD) hoặc Token mã hoá:
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nhập MSSV (ví dụ: 2251120000) hoặc SBD (SBD-042) hoặc Token mã hóa..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="custom-input"
              style={{ flex: 1, minWidth: '260px' }}
            />
            <button onClick={handleSearch} className="btn-primary">
              Tìm Kiếm Ngay
            </button>
          </div>

          {searchResult === 'NOT_FOUND' && (
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '14px' }}>
              ✕ Không tìm thấy dữ liệu sinh viên phù hợp. Vui lòng kiểm tra lại MSSV hoặc Token.
            </div>
          )}

          {searchResult && searchResult !== 'NOT_FOUND' && (
            <div style={{ background: 'var(--bg-input)', borderRadius: '14px', padding: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={searchResult.avatar}
                alt="Avatar"
                style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#1e293b', border: '3px solid #38bdf8', padding: '2px' }}
              />
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{searchResult.fullName}</h3>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: searchResult.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: searchResult.status === 'Active' ? '#34d399' : '#f87171' }}>
                    {searchResult.status === 'Active' ? '✓ ĐANG HOẠT ĐỘNG' : '⛔ ĐÃ BỊ THU HỒI'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div><strong>MSSV:</strong> {searchResult.mssv}</div>
                  <div><strong>Số Báo Danh:</strong> {searchResult.sbd}</div>
                  <div><strong>Lớp Học Phần:</strong> {searchResult.classId}</div>
                  <div><strong>Chuyên Ngành:</strong> {searchResult.major}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Mã DID W3C:</strong> <code style={{ color: '#38bdf8' }}>{searchResult.didAddress}</code>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Token Mã Hoá:</strong> <code>{searchResult.qrCodeToken}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MÀN HÌNH MÁY CHIẾU TOÀN MÀN HÌNH (FULL SCREEN PROJECTOR OVERLAY) */}
      {isFullScreen && session && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#070b14',
            backgroundImage: 'radial-gradient(at 50% 15%, rgba(56, 189, 248, 0.18) 0px, transparent 65%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'clamp(16px, 3vw, 40px)',
            color: '#fff',
            overflowY: 'auto'
          }}
        >
          {/* Top Bar Trong Chế Độ Toàn Màn Hình */}
          <div style={{ width: '100%', maxWidth: '1240px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)' }}>
                🛡️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', background: session.mode === 'exam' ? '#f43f5e' : '#0284c7', color: '#fff', fontWeight: 800 }}>
                    {session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP HỌC'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Phiên: <code style={{ color: '#38bdf8' }}>{session.id}</code></span>
                </div>
                <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 800 }}>
                  {session.courseName}
                </h1>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '15px' }}>
                  {session.roomName} • Bán kính Geo-Fencing: <strong style={{ color: '#34d399' }}>&le; {session.allowedRadius} mét</strong>
                </p>
              </div>
            </div>

            {/* Đồng hồ đếm ngược lớn & Nút thoát */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 24px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px' }}>TỰ ĐỔI MÃ SAU</div>
                <div style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, color: countdown <= 5 ? '#f43f5e' : '#38bdf8', fontFamily: 'JetBrains Mono', lineHeight: 1.1 }}>
                  {countdown}s
                </div>
              </div>

              <button
                onClick={handleToggleFullscreen}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={18} />
                <span>Thoát Toàn Màn Hình (Esc)</span>
              </button>
            </div>
          </div>

          {/* Vùng Trung Tâm: Mã QR Khổng Lồ Sắc Nét Cho Máy Chiếu */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'clamp(16px, 3.5vh, 36px) 0', textAlign: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                padding: 'clamp(16px, 2.5vw, 28px)',
                borderRadius: '28px',
                boxShadow: '0 0 70px rgba(56, 189, 248, 0.4), 0 25px 50px rgba(0,0,0,0.85)',
                display: 'inline-block'
              }}
            >
              <QRCodeSVG
                value={qrPayloadString}
                size={Math.min(typeof window !== 'undefined' ? window.innerHeight * 0.46 : 380, 380)}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Token Phiên Động */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 24px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <span style={{ color: '#94a3b8', fontSize: '15px' }}>Token phiên động:</span>
                <code style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#38bdf8', letterSpacing: '2px' }}>{dynamicNonce}</code>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
                Sinh viên mở <strong>Ví UTH-TrustID</strong> trên điện thoại và quét mã để ký số điểm danh tức thời
              </p>
            </div>
          </div>

          {/* Thanh Thông Tin Cuối Màn Hình */}
          <div style={{ width: '100%', maxWidth: '1240px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '14px 24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', fontSize: '14px' }}>
            <div>
              📍 Toạ độ chốt phòng: <strong>{session.coords.lat.toFixed(6)}, {session.coords.lon.toFixed(6)}</strong> (±{session.coords.acc}m)
            </div>
            <div>
              📶 Mạng: <strong style={{ color: '#38bdf8' }}>{session.networkPolicy === 'WIFI_ONLY' ? 'Chỉ Wi-Fi trường (UTH-Secure)' : '4G / 5G / Wi-Fi'}</strong>
            </div>
            <div>
              👥 Đã đối soát thành công: <strong style={{ color: '#34d399', fontSize: '16px' }}>{records.filter(r => r.status === 'VALID').length}</strong> / {records.length} lượt
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
