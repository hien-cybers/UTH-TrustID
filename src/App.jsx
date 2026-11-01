// src/App.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS, calculateDistance } from './data/studentsData';
import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './components/Scanner';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home | protection | scan | activity | profile | faculty | admin
  
  // Dữ liệu sinh viên hiện tại trong phiên ví
  const [currentStudent, setCurrentStudent] = useState(INITIAL_STUDENTS[0]);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  
  // Dữ liệu quét Scan & Geo-fencing
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);

  // Nhật ký Activity Log
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      type: 'CHECKIN',
      title: 'Điểm danh: An toàn Mạng',
      location: 'Phòng A3-204',
      distance: 8,
      status: 'SUCCESS',
      time: '14:20 - Hôm nay'
    },
    {
      id: 2,
      type: 'AUTH_WEB',
      title: 'Đăng nhập: Cổng Dịch vụ UTH',
      location: 'Máy tính cá nhân',
      distance: 0,
      status: 'SUCCESS',
      time: '09:15 - Hôm nay'
    }
  ]);

  // Hành vi quét mã giả lập kết hợp toạ độ thật
  const triggerScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Lấy toạ độ GPS thiết bị hiện tại
    if (!navigator.geolocation) {
      fallbackScan();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const studentLat = pos.coords.latitude;
        const studentLon = pos.coords.longitude;
        // Giả lập toạ độ phòng học giảng viên chốt
        const facultyLat = 10.7992;
        const facultyLon = 106.7056;

        const distance = calculateDistance(facultyLat, facultyLon, studentLat, studentLon);
        const isValid = distance <= 35 && currentStudent.status === 'Active';

        setTimeout(() => {
          setIsScanning(false);
          const result = {
            course: 'An toàn Mạng Không Dây',
            room: 'Phòng Lab ATTT',
            distance,
            valid: isValid,
            reason: currentStudent.status === 'Revoked' ? 'Thẻ bị thu hồi' : (distance > 35 ? 'Ngoài phạm vi phòng' : 'Hợp lệ'),
            timestamp: new Date().toLocaleTimeString()
          };
          setScanResult(result);

          // Thêm vào Activity
          setActivityLogs((prev) => [
            {
              id: Date.now(),
              type: 'CHECKIN',
              title: `Điểm danh: ${result.course}`,
              location: result.room,
              distance,
              status: isValid ? 'SUCCESS' : 'FAILED',
              time: 'Vừa xong'
            },
            ...prev
          ]);
        }, 1000);
      },
      () => {
        fallbackScan();
      },
      { timeout: 6000 }
    );
  };

  const fallbackScan = () => {
    setIsScanning(false);
    const result = { course: 'Kiểm thử Phần mềm', room: 'A2-101', distance: 12, valid: currentStudent.status === 'Active', reason: currentStudent.status === 'Revoked' ? 'Thẻ bị thu hồi' : 'Hợp lệ', timestamp: new Date().toLocaleTimeString() };
    setScanResult(result);
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        type: 'CHECKIN',
        title: `Điểm danh: ${result.course}`,
        location: result.room,
        distance: 12,
        status: currentStudent.status === 'Active' ? 'SUCCESS' : 'FAILED',
        time: 'Vừa xong'
      },
      ...prev
    ]);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#0a0a0a', paddingBottom: '76px', position: 'relative' }}>
      
      {/* HEADER TỐI GIẢN */}
      <header style={{ padding: '14px 16px', borderBottom: '1px solid #1c1c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a3e635' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px', color: '#f4f4f5' }}>UTH-TRUSTID</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentTab === 'faculty' && (
            <button 
              onClick={() => setCurrentTab('profile')}
              style={{ background: '#1c1c1c', border: '1px solid #242424', color: '#a3e635', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Ví SV
            </button>
          )}
          {currentTab === 'admin' && (
            <button 
              onClick={() => setCurrentTab('profile')}
              style={{ background: '#1c1c1c', border: '1px solid #242424', color: '#a3e635', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Ví SV
            </button>
          )}
          <span style={{ fontSize: '11px', color: '#85858e', fontFamily: 'JetBrains Mono' }}>SEC-LEVEL 4</span>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH THEO TỪNG TAB */}
      <main style={{ padding: '14px 16px' }}>

        {/* 1. MÀN HÌNH HOME (TỔNG QUAN BẢO MẬT & THẺ) */}
        {currentTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Thẻ sinh viên số phẳng than viền mỏng */}
            <div className="card-flat" style={{ borderLeft: '3px solid #a3e635' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#85858e' }}>THẺ SINH VIÊN SỐ (VC)</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f5', marginTop: '2px' }}>{currentStudent.fullName}</div>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: currentStudent.status === 'Active' ? 'rgba(163,230,53,0.12)' : 'rgba(239,68,68,0.12)', color: currentStudent.status === 'Active' ? '#a3e635' : '#ef4444', fontWeight: 700 }}>
                  {currentStudent.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', borderTop: '1px solid #1c1c1c', paddingTop: '10px' }}>
                <div>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>MSSV</span>
                  <span style={{ fontWeight: 600 }}>{currentStudent.mssv}</span>
                </div>
                <div>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>KHÓA / LỚP</span>
                  <span style={{ fontWeight: 600 }}>{currentStudent.classId}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>W3C DID IDENTIFIER</span>
                  <code style={{ fontSize: '11px', color: '#a3e635' }}>{currentStudent.didAddress.slice(0, 16)}...{currentStudent.didAddress.slice(-8)}</code>
                </div>
              </div>
            </div>

            {/* Chỉ số bảo mật tối giản */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="card-flat">
                <div style={{ fontSize: '11px', color: '#85858e' }}>KHÓA ECDSA</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#a3e635', margin: '4px 0', fontFamily: 'JetBrains Mono' }}>256-bit</div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>Lưu trữ Hardware Keystore</div>
              </div>
              <div className="card-flat">
                <div style={{ fontSize: '11px', color: '#85858e' }}>GEO-FENCE RAD</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f4f4f5', margin: '4px 0', fontFamily: 'JetBrains Mono' }}>≤ 35m</div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>Chuẩn Haversine</div>
              </div>
            </div>

            {/* Trạng thái hệ thống */}
            <div className="card-flat">
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Chính sách phiên làm việc</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#85858e' }}>Xoay vòng mã Nonce</span>
                <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>15 giây/lần</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. MÀN HÌNH SCAN (NÚT HÀNH ĐỘNG TRUNG TÂM) */}
        {currentTab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <div className="card-flat" style={{ padding: '24px 16px' }}>
              {useRealCamera ? (
                <div style={{ marginBottom: '14px' }}>
                  <Scanner
                    onScanSuccess={(data) => {
                      setUseRealCamera(false);
                      triggerScan();
                    }}
                    onClose={() => setUseRealCamera(false)}
                  />
                </div>
              ) : (
                <div style={{ width: '180px', height: '180px', border: '1px dashed #a3e635', borderRadius: '10px', margin: '0 auto 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
                  <span style={{ fontSize: '11px', color: '#85858e' }}>Hướng camera về mã QR lớp</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={triggerScan} disabled={isScanning} className="btn-lime" style={{ flex: 1, minWidth: '160px' }}>
                  {isScanning ? 'Đang giải mã & đo GPS...' : 'Bắt đầu quét xác thực'}
                </button>
                <button 
                  onClick={() => setUseRealCamera(!useRealCamera)}
                  style={{ background: '#1c1c1c', border: '1px solid #242424', color: '#f4f4f5', padding: '9px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  {useRealCamera ? 'Tắt Camera' : 'Bật Camera Thực'}
                </button>
              </div>
            </div>

            {/* Kết quả đối soát */}
            {scanResult && (
              <div className="card-flat" style={{ textAlign: 'left', borderLeft: `3px solid ${scanResult.valid ? '#a3e635' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{scanResult.course}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: scanResult.valid ? '#a3e635' : '#ef4444' }}>
                    {scanResult.valid ? '✓ ĐẠT ĐIỀU KIỆN' : '✕ TỪ CHỐI'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#85858e', lineHeight: '1.6' }}>
                  <div>Phòng: <strong style={{ color: '#f4f4f5' }}>{scanResult.room}</strong></div>
                  <div>Khoảng cách thực tế: <strong style={{ color: scanResult.distance <= 35 ? '#a3e635' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{scanResult.distance} mét</strong></div>
                  <div>Lý do: {scanResult.reason}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MÀN HÌNH PROTECTION (QUẢN LÝ LỚP BẢO VỆ) */}
        {currentTab === 'protection' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card-flat">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Cơ chế bảo vệ cục bộ</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1c1c1c' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Sinh trắc học khi ký số</div>
                  <div style={{ fontSize: '11px', color: '#85858e' }}>Yêu cầu FaceID / Vân tay trước khi mở Private Key</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricsEnabled} 
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  style={{ accentColor: '#a3e635', width: '16px', height: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Tự thu hồi danh tính khẩn cấp</div>
                  <div style={{ fontSize: '11px', color: '#85858e' }}>Vô hiệu hóa cặp khóa khi mất thiết bị</div>
                </div>
                <button 
                  onClick={() => {
                    const next = currentStudent.status === 'Active' ? 'Revoked' : 'Active';
                    setCurrentStudent({ ...currentStudent, status: next });
                  }}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {currentStudent.status === 'Active' ? 'Revoke khóa' : 'Reactivate'}
                </button>
              </div>
            </div>

            <div className="card-flat">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Chống tấn công Replay (Phát lại)</div>
              <p style={{ margin: 0, fontSize: '11px', color: '#85858e', lineHeight: '1.5' }}>
                Mọi chữ ký EIP-191 đều gắn liền với Nonce ngẫu nhiên từ backend. Mỗi Nonce bị hủy ngay lập tức sau 1 lần xác thực hoặc sau 60 giây.
              </p>
            </div>
          </div>
        )}

        {/* 4. MÀN HÌNH ACTIVITY (LỊCH SỬ HOẠT ĐỘNG & CẢNH BÁO) */}
        {currentTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: '#85858e', fontWeight: 600 }}>NHẬT KÝ KIỂM TOÁN GẦN ĐÂY</div>
            {activityLogs.map((log) => (
              <div key={log.id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.title}</div>
                  <div style={{ fontSize: '11px', color: '#85858e', marginTop: '2px' }}>
                    {log.location} • Cách {log.distance}m • {log.time}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: log.status === 'SUCCESS' ? '#a3e635' : '#ef4444' }}>
                  {log.status === 'SUCCESS' ? 'HỢP LỆ' : 'TỪ CHỐI'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 5. MÀN HÌNH PROFILE (TÀI KHOẢN & ĐỔI VAI TRÒ) */}
        {currentTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card-flat">
              <div style={{ fontSize: '11px', color: '#85858e' }}>THÔNG TIN HỒ SƠ CHỦ THỂ (HOLDER)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{currentStudent.fullName}</div>
              <div style={{ fontSize: '12px', color: '#85858e' }}>MSSV: {currentStudent.mssv} • Ngành: {currentStudent.major}</div>
            </div>

            <div className="card-flat">
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Chuyển đổi giao diện vận hành</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentTab('faculty')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #242424', background: '#0d0d0d', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
                >
                  Cổng Giảng Viên
                </button>
                <button 
                  onClick={() => setCurrentTab('admin')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #242424', background: '#0d0d0d', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
                >
                  Bảng Quản Trị
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHÂN HỆ GIẢNG VIÊN ĐƯỢC SWITCH TRỰC TIẾP TỪ PROFILE */}
        {currentTab === 'faculty' && (
          <div>
            <FacultyPortal />
          </div>
        )}

        {/* PHÂN HỆ QUẢN TRỊ ĐƯỢC SWITCH TRỰC TIẾP TỪ PROFILE */}
        {currentTab === 'admin' && (
          <div>
            <AdminDashboard />
          </div>
        )}

      </main>

      {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG VỚI NÚT TRUNG TÂM NỔI BẬT */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        height: '62px',
        background: '#0d0d0d',
        borderTop: '1px solid #1c1c1c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        {/* Tab Home */}
        <button 
          onClick={() => setCurrentTab('home')} 
          style={{ background: 'none', border: 'none', color: currentTab === 'home' ? '#a3e635' : '#85858e', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >
          <span style={{ fontSize: '16px' }}>🏠</span>
          <span>Home</span>
        </button>

        {/* Tab Protection */}
        <button 
          onClick={() => setCurrentTab('protection')} 
          style={{ background: 'none', border: 'none', color: currentTab === 'protection' ? '#a3e635' : '#85858e', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >
          <span style={{ fontSize: '16px' }}>🛡️</span>
          <span>Protection</span>
        </button>

        {/* Nút Scan trung tâm (Action Button) */}
        <button 
          onClick={() => setCurrentTab('scan')} 
          style={{
            transform: 'translateY(-12px)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#a3e635',
            border: '4px solid #0a0a0a',
            color: '#000',
            fontSize: '20px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
          }}
        >
          ⚡
        </button>

        {/* Tab Activity */}
        <button 
          onClick={() => setCurrentTab('activity')} 
          style={{ background: 'none', border: 'none', color: currentTab === 'activity' ? '#a3e635' : '#85858e', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >
          <span style={{ fontSize: '16px' }}>📋</span>
          <span>Activity</span>
        </button>

        {/* Tab Profile */}
        <button 
          onClick={() => setCurrentTab('profile')} 
          style={{ background: 'none', border: 'none', color: currentTab === 'profile' ? '#a3e635' : '#85858e', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >
          <span style={{ fontSize: '16px' }}>👤</span>
          <span>Profile</span>
        </button>
      </nav>

    </div>
  );
}
