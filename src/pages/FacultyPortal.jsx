// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { INITIAL_STUDENTS, calculateDistance } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState('session'); // 'session' | 'search'
  
  // Cấu hình phiên
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'exam'
  const [roomName, setRoomName] = useState('Phòng Lab B302 - Cơ sở Bình Thạnh');
  const [courseName, setCourseName] = useState('An Toàn Mạng & Mật Mã Ứng Dụng');
  const [networkPolicy, setNetworkPolicy] = useState('HYBRID_4G_5G'); // 'WIFI_ONLY' | 'HYBRID_4G_5G'
  const [allowedRadius, setAllowedRadius] = useState(35);

  // Trạng thái phiên chạy thực tế
  const [session, setSession] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);

  // Tra cứu hồ sơ
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Sinh mã xoay vòng Dynamic Token mỗi 15 giây chống chụp ảnh gửi điểm danh hộ
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

  // Giữ nguyên cơ chế lấy định vị chính xác của phần trước
  const handleCreateSession = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Thiết bị không hỗ trợ định vị GPS! Đang dùng toạ độ cơ sở UTH Bình Thạnh.");
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
        const newNonce = Math.random().toString(36).substring(2, 9).toUpperCase();
        setDynamicNonce(newNonce);
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
    // Toạ độ thực tế UTH Cơ sở chính (Bình Thạnh: 10.8016, 106.7118)
    const fallbackCoords = { lat: 10.8016, lon: 106.7118, acc: 10 };
    const newNonce = Math.random().toString(36).substring(2, 9).toUpperCase();
    setDynamicNonce(newNonce);
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

  // Giả lập luồng sinh viên quét mã kèm mạng & toạ độ
  const handleSimulateCheckin = (distMeter, netType, mssv) => {
    if (!session) return;
    const student = students.find((s) => s.mssv === mssv);
    if (!student) return;

    // 1. Kiểm tra trạng thái thẻ
    if (student.status === 'Revoked') {
      alert(`[CẢNH BÁO AN NINH] Sinh viên ${student.fullName} có thẻ bị THU HỒI (Revoked)! Từ chối truy cập!`);
      setRecords((prev) => [
        {
          mssv,
          name: student.fullName,
          sbd: student.sbd,
          dist: distMeter,
          net: netType,
          status: 'REJECTED_REVOKED',
          time: new Date().toLocaleTimeString('vi-VN')
        },
        ...prev
      ]);
      return;
    }

    // 2. Kiểm tra chính sách mạng
    if (session.networkPolicy === 'WIFI_ONLY' && netType !== 'WiFi_UTH_SECURE') {
      alert(`[TỪ CHỐI MẠNG] Phòng yêu cầu kết nối WiFi trường (UTH-Secure), phát hiện sinh viên đang dùng ${netType}!`);
      setRecords((prev) => [
        {
          mssv,
          name: student.fullName,
          sbd: student.sbd,
          dist: distMeter,
          net: netType,
          status: 'REJECTED_NETWORK',
          time: new Date().toLocaleTimeString('vi-VN')
        },
        ...prev
      ]);
      return;
    }

    // 3. Kiểm tra toạ độ Geo-fencing
    const isInside = distMeter <= session.allowedRadius;
    setRecords((prev) => [
      {
        mssv,
        name: student.fullName,
        sbd: student.sbd,
        dist: distMeter,
        net: netType,
        status: isInside ? 'VALID' : 'REJECTED_DISTANCE',
        time: new Date().toLocaleTimeString('vi-VN')
      },
      ...prev
    ]);
  };

  // Tra cứu hồ sơ sinh viên
  const handleSearch = () => {
    const q = searchKey.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }
    const found = students.find(
      (s) => s.mssv.toLowerCase() === q || s.qrCodeToken.toLowerCase() === q || s.sbd.toLowerCase() === q
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(12px, 3vw, 24px)', color: '#f8fafc' }}>
      
      {/* Header chuyển đổi tính năng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', margin: 0, fontWeight: 700, color: '#38bdf8' }}>
            👨‍🏫 Quản Trị Lớp Học & Phòng Thi
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Cơ chế điểm danh không mật khẩu, Geo-Fencing & Thẻ sinh viên số chuẩn W3C
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <button 
            onClick={() => setActiveTab('session')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'session' ? '#0284c7' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            Tạo & Chốt Phòng
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'search' ? '#0284c7' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            Tra Cứu Hồ Sơ
          </button>
        </div>
      </div>

      {activeTab === 'session' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* CỘT CẤU HÌNH TẠO PHÒNG */}
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#e2e8f0' }}>Thiết Lập Phiên Kiểm Tra</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Mục đích phiên</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => { setMode('attendance'); setAllowedRadius(35); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: mode === 'attendance' ? '#3b82f6' : '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    📝 Điểm Danh Lớp
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMode('exam'); setAllowedRadius(15); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: mode === 'exam' ? '#f43f5e' : '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    🎯 Phòng Thi Cử
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Tên môn học / Học phần</label>
                <input 
                  type="text" 
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Vị trí phòng học</label>
                <input 
                  type="text" 
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Chính sách mạng quét mã</label>
                <select 
                  value={networkPolicy}
                  onChange={(e) => setNetworkPolicy(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                >
                  <option value="HYBRID_4G_5G">🌐 Cho phép 4G / 5G + Bắt buộc GPS trong phòng</option>
                  <option value="WIFI_ONLY">🔒 Khóa mạng: Bắt buộc Wi-Fi trường (UTH-Secure)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Bán kính Geo-Fencing cho phép: <strong>{allowedRadius} mét</strong> ({mode === 'exam' ? 'Phòng thi ≤ 20m' : 'Lớp học ≤ 50m'})
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={allowedRadius}
                  onChange={(e) => setAllowedRadius(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>

              <button 
                onClick={handleCreateSession}
                disabled={isLocating}
                style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {isLocating ? "⏳ Đang lấy toạ độ GPS chính xác..." : "📍 Lấy Toạ Độ & Kích Hoạt Phiên"}
              </button>
            </div>
          </div>

          {/* CỘT MÀN HÌNH MÃ QR VÀ DANH SÁCH ĐỐI SOÁT */}
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
            {session ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: session.mode === 'exam' ? '#f43f5e' : '#0284c7', color: '#fff', fontWeight: 700 }}>
                      {session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP'}
                    </span>
                    <h4 style={{ margin: '6px 0 0', color: '#fff', fontSize: '16px' }}>{session.courseName} - {session.roomName}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Đổi mã sau:</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: countdown <= 5 ? '#f43f5e' : '#38bdf8' }}>{countdown}s</div>
                  </div>
                </div>

                {/* Khối hiển thị mã QR và Nonce */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '16px 0', padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ width: '96px', height: '96px', background: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QRCodeSVG 
                      value={qrPayloadString}
                      size={84}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}><strong>Token xoay vòng:</strong> <code style={{ color: '#38bdf8', fontWeight: 'bold' }}>{dynamicNonce}</code></p>
                    <p style={{ margin: 0, color: '#94a3b8' }}>GPS chốt: {session.coords.lat.toFixed(4)}, {session.coords.lon.toFixed(4)} (±{session.coords.acc}m)</p>
                    <p style={{ margin: 0, color: '#94a3b8' }}>Chế độ: {session.networkPolicy === 'WIFI_ONLY' ? 'Chỉ Wi-Fi trường (UTH-Secure)' : '4G/5G + Geo-Fencing'}</p>
                    <p style={{ margin: 0, color: '#34d399', fontSize: '12px' }}>Bán kính: &le; {session.allowedRadius}m</p>
                  </div>
                </div>

                {/* Các nút bấm mô phỏng test nhanh */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <button 
                    onClick={() => handleSimulateCheckin(8, '4G_Viettel', '2251120000')}
                    style={{ padding: '6px 10px', fontSize: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Simulate: SV An (4G, cách 8m - Hợp lệ)
                  </button>
                  <button 
                    onClick={() => handleSimulateCheckin(120, '5G_Vinaphone', '2251120001')}
                    style={{ padding: '6px 10px', fontSize: '12px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Simulate: SV Bích (Cách 120m - Quá xa)
                  </button>
                  <button 
                    onClick={() => handleSimulateCheckin(10, 'WiFi_UTH_SECURE', '2251120002')}
                    style={{ padding: '6px 10px', fontSize: '12px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Simulate: SV Cường (Thẻ bị Revoked)
                  </button>
                </div>

                {/* Bảng ghi nhận kết quả điểm danh */}
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '240px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Nhật ký đối soát thời gian thực ({records.length})
                  </div>
                  {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                      Chờ sinh viên quét mã...
                    </div>
                  ) : (
                    records.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', background: '#0f172a', marginBottom: '6px', fontSize: '13px' }}>
                        <div>
                          <strong>{r.name}</strong> <span style={{ color: '#94a3b8' }}>({r.mssv}{r.sbd ? ` - ${r.sbd}` : ''})</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Cách {r.dist}m | {r.net} | {r.time}</div>
                        </div>
                        <div>
                          {r.status === 'VALID' && <span style={{ color: '#34d399', fontWeight: 700 }}>✓ HỢP LỆ</span>}
                          {r.status === 'REJECTED_DISTANCE' && <span style={{ color: '#f87171', fontWeight: 700 }}>❌ XA PHÒNG</span>}
                          {r.status === 'REJECTED_NETWORK' && <span style={{ color: '#fbbf24', fontWeight: 700 }}>⚠️ SAI MẠNG</span>}
                          {r.status === 'REJECTED_REVOKED' && <span style={{ color: '#ef4444', fontWeight: 700 }}>⛔ BỊ THU HỒI</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📡</div>
                <p style={{ margin: 0, fontWeight: 600 }}>Chưa kích hoạt phiên nào.</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Bấm nút "Lấy Toạ Độ & Kích Hoạt Phiên" để mở phòng học / phòng thi.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB TRA CỨU HỒ SƠ SINH VIÊN */
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Tra Cứu Hồ Sơ & Bằng Chứng Xác Thực (VC)</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px' }}>
            Tra cứu bằng Mã Số Sinh Viên (MSSV), Số Báo Danh (SBD) hoặc Token mã hoá in trên thẻ QR:
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Nhập MSSV (2251120000) hoặc SBD (SBD-042) hoặc Token..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
            />
            <button 
              onClick={handleSearch}
              style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#38bdf8', color: '#090d16', fontWeight: 700, cursor: 'pointer' }}
            >
              Tra Cứu
            </button>
          </div>

          {searchResult === 'NOT_FOUND' && (
            <div style={{ padding: '16px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5' }}>
              Không tìm thấy hồ sơ sinh viên nào phù hợp với từ khóa này.
            </div>
          )}

          {searchResult && searchResult !== 'NOT_FOUND' && (
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', border: '1px solid #38bdf8', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <img 
                src={searchResult.avatar} 
                alt="Student Avatar" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', border: '2px solid #38bdf8' }}
              />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{searchResult.fullName}</h4>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: searchResult.status === 'Active' ? '#059669' : '#b91c1c', color: '#fff' }}>
                    {searchResult.status === 'Active' ? '✓ VERIFIED' : '⛔ REVOKED'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div><strong>MSSV:</strong> {searchResult.mssv}</div>
                  <div><strong>Số Báo Danh:</strong> {searchResult.sbd}</div>
                  <div><strong>Lớp:</strong> {searchResult.classId}</div>
                  <div><strong>Chuyên ngành:</strong> {searchResult.major}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Mã DID W3C:</strong> <code style={{ color: '#38bdf8' }}>{searchResult.didAddress}</code></div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Token Mã Hóa:</strong> <code>{searchResult.qrCodeToken}</code></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
