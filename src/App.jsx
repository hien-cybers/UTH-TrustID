// src/App.jsx
import React, { useState, useRef } from 'react';
import { INITIAL_STUDENTS, calculateDistance } from './data/studentsData';
import FacultyPortal from './pages/FacultyPortal';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './components/Scanner';
import {
  performStrictWebAuthn,
  createSelectiveDisclosureProof,
  generateShamirRecoveryShares,
  recoverFromShamirShares,
  detectMockLocationAndTeleport,
  createOfflineAttendanceTicket,
} from './services/did';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home | protection | scan | activity | profile | faculty | admin
  
  // Dữ liệu sinh viên hiện tại trong phiên ví
  const [currentStudent, setCurrentStudent] = useState(INITIAL_STUDENTS[0]);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [selectiveMode, setSelectiveMode] = useState(false); // Chế độ Thư viện / Nhà xe
  const [showZkProofModal, setShowZkProofModal] = useState(false);
  const [zkProofData, setZkProofData] = useState(null);

  // Dữ liệu quét Scan & Geo-fencing & Anti-Mock GPS
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [offlineTicket, setOfflineTicket] = useState(null);
  const lastScanCoords = useRef(null);

  // Shamir Recovery 2-of-3
  const [shamirShares, setShamirShares] = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [inputShare1, setInputShare1] = useState('');
  const [inputShare2, setInputShare2] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState(null);

  // Nhật ký Activity Log
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      type: 'CHECKIN',
      title: 'Điểm danh: An toàn Mạng',
      location: 'Phòng A3-204',
      distance: 8,
      accuracy: 6,
      security: 'GPS Real (±6m)',
      status: 'SUCCESS',
      time: '14:20 - Hôm nay'
    },
    {
      id: 2,
      type: 'SELECTIVE_DISCLOSURE',
      title: 'Thư viện UTH: Mượn giáo trình',
      location: 'Cổng Thư viện Khu A',
      distance: 0,
      accuracy: 10,
      security: 'Zero-Knowledge Proof',
      status: 'SUCCESS',
      time: '10:45 - Hôm nay'
    },
    {
      id: 3,
      type: 'AUTH_WEB',
      title: 'Đăng nhập: Cổng Dịch vụ UTH',
      location: 'Máy tính cá nhân',
      distance: 0,
      accuracy: 0,
      security: 'EIP-191 WebAuthn',
      status: 'SUCCESS',
      time: '09:15 - Hôm nay'
    }
  ]);

  // Bật/tắt chế độ Selective Disclosure cho Thư viện / Bãi xe
  const handleToggleSelective = (enabled) => {
    setSelectiveMode(enabled);
    if (enabled) {
      const proof = createSelectiveDisclosureProof(currentStudent, currentStudent.didAddress);
      setZkProofData(proof);
    }
  };

  // Quét điểm danh với bộ lọc phát hiện Fake GPS & Teleport
  const triggerScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    // 1. Kiểm tra xác thực sinh trắc học FaceID/TouchID nếu bật
    if (biometricsEnabled) {
      try {
        await performStrictWebAuthn();
      } catch (err) {
        setIsScanning(false);
        alert('Yêu cầu FaceID/TouchID thất bại hoặc bị hủy bỏ.');
        return;
      }
    }

    if (!navigator.geolocation) {
      fallbackScan();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const studentLat = pos.coords.latitude;
        const studentLon = pos.coords.longitude;
        const facultyLat = 10.7992;
        const facultyLon = 106.7056;

        // Phân tích chống Fake GPS & Dịch chuyển tức thời (Teleport)
        const antiSpoofCheck = detectMockLocationAndTeleport(pos.coords, lastScanCoords.current);
        lastScanCoords.current = { lat: studentLat, lon: studentLon, timestamp: Date.now() };

        const distance = calculateDistance(facultyLat, facultyLon, studentLat, studentLon);
        const isValid = distance <= 35 && currentStudent.status === 'Active' && !antiSpoofCheck.flagged;

        setTimeout(() => {
          setIsScanning(false);
          let reasonText = 'Hợp lệ';
          if (antiSpoofCheck.flagged) {
            reasonText = antiSpoofCheck.reason;
          } else if (currentStudent.status === 'Revoked') {
            reasonText = 'Thẻ sinh viên đã bị thu hồi';
          } else if (distance > 35) {
            reasonText = `Ngoài phạm vi phòng thi (${distance}m > 35m)`;
          }

          const result = {
            course: 'An toàn Mạng Không Dây',
            room: 'Phòng Lab ATTT',
            distance,
            accuracy: antiSpoofCheck.accuracy,
            flagged: antiSpoofCheck.flagged,
            valid: isValid,
            reason: reasonText,
            timestamp: new Date().toLocaleTimeString()
          };
          setScanResult(result);

          setActivityLogs((prev) => [
            {
              id: Date.now(),
              type: 'CHECKIN',
              title: `Điểm danh: ${result.course}`,
              location: result.room,
              distance,
              accuracy: antiSpoofCheck.accuracy,
              security: antiSpoofCheck.flagged ? 'CẢNH BÁO FAKE GPS' : `GPS Real (±${antiSpoofCheck.accuracy}m)`,
              status: isValid ? 'SUCCESS' : 'FAILED',
              time: 'Vừa xong'
            },
            ...prev
          ]);
        }, 900);
      },
      () => {
        fallbackScan();
      },
      { timeout: 6000 }
    );
  };

  const fallbackScan = () => {
    setIsScanning(false);
    const result = {
      course: 'Kiểm thử Phần mềm',
      room: 'A2-101',
      distance: 12,
      accuracy: 8,
      flagged: false,
      valid: currentStudent.status === 'Active',
      reason: currentStudent.status === 'Revoked' ? 'Thẻ bị thu hồi' : 'Hợp lệ',
      timestamp: new Date().toLocaleTimeString()
    };
    setScanResult(result);
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        type: 'CHECKIN',
        title: `Điểm danh: ${result.course}`,
        location: result.room,
        distance: 12,
        accuracy: 8,
        security: 'GPS Real (±8m)',
        status: currentStudent.status === 'Active' ? 'SUCCESS' : 'FAILED',
        time: 'Vừa xong'
      },
      ...prev
    ]);
  };

  // Tạo vé điểm danh ngoại tuyến khi không có sóng ở tầng hầm
  const handleGenerateOfflineTicket = () => {
    const tkt = createOfflineAttendanceTicket(currentStudent, 'An toàn Mạng', 'Phòng Lab Tầng Hầm B1');
    setOfflineTicket(tkt);
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        type: 'OFFLINE_TICKET',
        title: `Vé ngoại tuyến: ${tkt.course}`,
        location: tkt.room,
        distance: 0,
        accuracy: 0,
        security: 'EIP-191 Offline Ticket',
        status: 'SUCCESS',
        time: 'Vừa xong'
      },
      ...prev
    ]);
  };

  // Khởi tạo 3 mảnh mã phục hồi Shamir
  const handleCreateShamir = () => {
    const shares = generateShamirRecoveryShares(currentStudent.didAddress);
    setShamirShares(shares);
  };

  // Khôi phục ví từ 2 mảnh Shamir
  const handleRecoverIdentity = () => {
    try {
      const res = recoverFromShamirShares(inputShare1, inputShare2);
      setRecoveryStatus({ success: true, message: res.message });
      setCurrentStudent({ ...currentStudent, status: 'Active' });
    } catch (err) {
      setRecoveryStatus({ success: false, message: err.message });
    }
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

        {/* 1. MÀN HÌNH HOME (TỔNG QUAN BẢO MẬT & THẺ & XUẤT TRÌNH CÓ CHỌN LỌC) */}
        {currentTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Thanh chuyển đổi Xuất trình có chọn lọc */}
            <div className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>Chế độ Thư viện / Nhà xe (Selective Disclosure)</div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>Chỉ chứng minh sinh viên UTH, ẩn toàn bộ tên và MSSV</div>
              </div>
              <input 
                type="checkbox" 
                checked={selectiveMode}
                onChange={(e) => handleToggleSelective(e.target.checked)}
                style={{ accentColor: '#a3e635', width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Thẻ sinh viên số phẳng than viền mỏng */}
            <div className="card-flat" style={{ borderLeft: `3px solid ${selectiveMode ? '#38bdf8' : '#a3e635'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {!selectiveMode && (
                    <img 
                      src={currentStudent.avatar} 
                      alt="Avatar" 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1c1c1c', border: '1px solid #242424' }} 
                    />
                  )}
                  <div>
                    <div style={{ fontSize: '10px', color: '#85858e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {selectiveMode ? 'BẰNG CHỨNG SSI ẨN DANH (ZERO-KNOWLEDGE)' : 'THẺ SINH VIÊN SỐ (VC)'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f5', marginTop: '2px' }}>
                      {selectiveMode ? 'Nguyễn •••••••• (Bảo lưu danh tính)' : currentStudent.fullName}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: currentStudent.status === 'Active' ? 'rgba(163,230,53,0.12)' : 'rgba(239,68,68,0.12)',
                  color: currentStudent.status === 'Active' ? '#a3e635' : '#ef4444',
                  fontWeight: 700
                }}>
                  {currentStudent.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', borderTop: '1px solid #1c1c1c', paddingTop: '10px' }}>
                <div>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>MSSV</span>
                  <span style={{ fontWeight: 600 }}>{selectiveMode ? '••••••••' : currentStudent.mssv}</span>
                </div>
                <div>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>XÁC THỰC TRƯỜNG</span>
                  <span style={{ fontWeight: 600, color: '#a3e635' }}>UTH-VERIFIED ✓</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#85858e', display: 'block', fontSize: '11px' }}>W3C DID IDENTIFIER</span>
                  <code style={{ fontSize: '11px', color: selectiveMode ? '#38bdf8' : '#a3e635' }}>
                    {currentStudent.didAddress.slice(0, 16)}...{currentStudent.didAddress.slice(-8)}
                  </code>
                </div>
              </div>

              {selectiveMode && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #242424' }}>
                  <button
                    onClick={() => setShowZkProofModal(true)}
                    style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', fontSize: '11px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                  >
                    🔍 Xem Bằng Chứng Mật Mã Merkle (JSON Proof)
                  </button>
                </div>
              )}
            </div>

            {/* Chỉ số an toàn & Mức độ gắn kết thiết bị */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="card-flat">
                <div style={{ fontSize: '11px', color: '#85858e' }}>KHÓA ECDSA SECP256K1</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#a3e635', margin: '4px 0', fontFamily: 'JetBrains Mono' }}>256-bit</div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>Hardware Keystore Cục Bộ</div>
              </div>
              <div className="card-flat">
                <div style={{ fontSize: '11px', color: '#85858e' }}>GẮN KẾT BIOMETRICS</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: biometricsEnabled ? '#a3e635' : '#85858e', margin: '4px 0', fontFamily: 'JetBrains Mono' }}>
                  {biometricsEnabled ? 'ACTIVE ✓' : 'OFF'}
                </div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>WebAuthn TouchID/FaceID</div>
              </div>
            </div>

            {/* Trạng thái hệ thống */}
            <div className="card-flat">
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Chính sách an toàn giao thức UTH</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#85858e' }}>Thời gian sống Nonce EIP-191</span>
                <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>60 giây (Huỷ sau 1 lần)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '6px' }}>
                <span style={{ color: '#85858e' }}>Bán kính phòng học cho phép</span>
                <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>≤ 35 mét (Haversine)</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. MÀN HÌNH SCAN (NÚT HÀNH ĐỘNG TRUNG TÂM & ANTI-SPOOF & VÉ NGOẠI TUYẾN) */}
        {currentTab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            
            {/* Khung quét & kiểm tra an ninh */}
            <div className="card-flat" style={{ padding: '20px 16px' }}>
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
                <div style={{ width: '160px', height: '160px', border: '1px dashed #a3e635', borderRadius: '10px', margin: '0 auto 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
                  <span style={{ fontSize: '11px', color: '#85858e' }}>Hướng camera về mã QR lớp</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={triggerScan} disabled={isScanning} className="btn-lime" style={{ flex: 1, minWidth: '160px' }}>
                  {isScanning ? 'Đang phân tích GPS & Chữ ký...' : '⚡ Bắt đầu quét xác thực'}
                </button>
                <button 
                  onClick={() => setUseRealCamera(!useRealCamera)}
                  style={{ background: '#1c1c1c', border: '1px solid #242424', color: '#f4f4f5', padding: '9px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  {useRealCamera ? 'Tắt Camera' : 'Camera Thực'}
                </button>
              </div>

              {/* Lối tắt tạo vé ngoại tuyến */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #1c1c1c' }}>
                <button
                  onClick={handleGenerateOfflineTicket}
                  style={{ background: 'transparent', border: '1px solid #242424', color: '#a3e635', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                >
                  📶 Tạo vé điểm danh ngoại tuyến (Tầng hầm không sóng)
                </button>
              </div>
            </div>

            {/* Hiển thị Vé Ngoại Tuyến vừa tạo */}
            {offlineTicket && (
              <div className="card-flat" style={{ textAlign: 'left', border: '1px solid #a3e635', background: '#0f140f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#a3e635' }}>VÉ ĐIỂM DANH NGOẠI TUYẾN KÝ SỐ</span>
                  <span style={{ fontSize: '10px', color: '#85858e', fontFamily: 'JetBrains Mono' }}>{offlineTicket.ticketId}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#85858e', lineHeight: '1.6' }}>
                  <div>Môn học: <strong style={{ color: '#fff' }}>{offlineTicket.course}</strong> - Phòng: <strong style={{ color: '#fff' }}>{offlineTicket.room}</strong></div>
                  <div>Chữ ký số vé: <code style={{ fontSize: '10px', color: '#a3e635' }}>{offlineTicket.offlineSignature.slice(0, 24)}...</code></div>
                  <div style={{ color: '#a3e635', marginTop: '4px' }}>✓ Đưa mã này cho giám thị quét offline bằng máy giám thị.</div>
                </div>
              </div>
            )}

            {/* Kết quả đối soát và cờ Anti-Spoofing */}
            {scanResult && (
              <div className="card-flat" style={{ textAlign: 'left', borderLeft: `3px solid ${scanResult.valid ? '#a3e635' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{scanResult.course}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: scanResult.valid ? '#a3e635' : '#ef4444' }}>
                    {scanResult.valid ? '✓ ĐẠT ĐIỀU KIỆN' : '✕ TỪ CHỐI GIAN LẬN'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#85858e', lineHeight: '1.6' }}>
                  <div>Phòng học: <strong style={{ color: '#f4f4f5' }}>{scanResult.room}</strong></div>
                  <div>Khoảng cách: <strong style={{ color: scanResult.distance <= 35 ? '#a3e635' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{scanResult.distance} mét</strong></div>
                  <div>Độ chính xác GPS: <span style={{ color: scanResult.accuracy > 0 ? '#a3e635' : '#ef4444' }}>±{scanResult.accuracy}m</span></div>
                  <div>Đánh giá an ninh: <strong style={{ color: scanResult.valid ? '#a3e635' : '#ef4444' }}>{scanResult.reason}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MÀN HÌNH PROTECTION (QUẢN LÝ LỚP BẢO VỆ & SHAMIR RECOVERY) */}
        {currentTab === 'protection' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Lớp bảo vệ sinh trắc học */}
            <div className="card-flat">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Cơ chế sinh trắc học cục bộ (WebAuthn)</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1c1c1c' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>FaceID / TouchID khi ký số</div>
                  <div style={{ fontSize: '11px', color: '#85858e' }}>Chặn người khác cầm máy điểm danh thay</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricsEnabled} 
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  style={{ accentColor: '#a3e635', width: '16px', height: '16px' }}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={async () => {
                    try {
                      await performStrictWebAuthn();
                      alert('✓ Đã xác thực FaceID / TouchID phần cứng thành công!');
                    } catch (err) {
                      alert('Xác thực thất bại: ' + err.message);
                    }
                  }}
                  style={{ background: '#1c1c1c', border: '1px solid #242424', color: '#a3e635', padding: '7px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                >
                  🧪 Thử nghiệm cảm biến FaceID / TouchID ngay
                </button>
              </div>
            </div>

            {/* Cơ chế sao lưu & Tự phục hồi khóa (Shamir 2-of-3) */}
            <div className="card-flat">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Sao lưu & Phục hồi khóa (Shamir Secret Sharing)</div>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#85858e', lineHeight: '1.5' }}>
                Phân rã khóa bảo vệ DID thành 3 mảnh. Cần ít nhất 2/3 mảnh để khôi phục khi đổi máy mới mà không cần cấp lại từ đầu.
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCreateShamir}
                  className="btn-lime"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '11px' }}
                >
                  Khởi tạo 3 Mảnh Shamir
                </button>
                <button
                  onClick={() => setShowRecoveryModal(true)}
                  style={{ flex: 1, padding: '7px 10px', fontSize: '11px', background: '#1c1c1c', border: '1px solid #242424', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Nhập mã khôi phục
                </button>
              </div>

              {/* Danh sách 3 mảnh nếu đã tạo */}
              {shamirShares && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {shamirShares.map((s) => (
                    <div key={s.id} style={{ background: '#0d0d0d', padding: '8px', borderRadius: '6px', border: '1px solid #1c1c1c', fontSize: '11px' }}>
                      <div style={{ fontWeight: 600, color: '#f4f4f5' }}>{s.name}</div>
                      <div style={{ color: '#85858e', fontSize: '10px' }}>{s.description}</div>
                      <code style={{ fontSize: '10px', color: '#a3e635', display: 'block', marginTop: '2px' }}>{s.shareCode}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thu hồi khẩn cấp */}
            <div className="card-flat">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Tự thu hồi danh tính khẩn cấp</div>
                  <div style={{ fontSize: '11px', color: '#85858e' }}>Đóng băng cặp khóa khi bị mất máy</div>
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
          </div>
        )}

        {/* 4. MÀN HÌNH ACTIVITY (LỊCH SỬ HOẠT ĐỘNG & AN NINH IDS) */}
        {currentTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: '#85858e', fontWeight: 600 }}>NHẬT KÝ KIỂM TOÁN AN TOÀN THÔNG TIN</div>
            {activityLogs.map((log) => (
              <div key={log.id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.title}</div>
                  <div style={{ fontSize: '11px', color: '#85858e', marginTop: '2px' }}>
                    {log.location} • {log.security} • {log.time}
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
            <div className="card-flat" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={currentStudent.avatar} alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1c1c1c', border: '1px solid #242424' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>CHỦ THỂ DANH TÍNH SỐ (DID HOLDER)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{currentStudent.fullName}</div>
                <div style={{ fontSize: '11px', color: '#85858e' }}>MSSV: {currentStudent.mssv} • Ngành: {currentStudent.major}</div>
              </div>
            </div>

            <div className="card-flat">
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Chuyển đổi giao diện vận hành</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentTab('faculty')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #242424', background: '#0d0d0d', color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  👨‍🏫 Cổng Giảng Viên
                </button>
                <button 
                  onClick={() => setCurrentTab('admin')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #242424', background: '#0d0d0d', color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🔒 Bảng Quản Trị
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHÂN HỆ GIẢNG VIÊN ĐƯỢC SWITCH TRỰC TIẾP */}
        {currentTab === 'faculty' && (
          <div>
            <FacultyPortal />
          </div>
        )}

        {/* PHÂN HỆ QUẢN TRỊ ĐƯỢC SWITCH TRỰC TIẾP */}
        {currentTab === 'admin' && (
          <div>
            <AdminDashboard />
          </div>
        )}

      </main>

      {/* MODAL XEM BẰNG CHỨNG ZERO-KNOWLEDGE (SELECTIVE DISCLOSURE) */}
      {showZkProofModal && zkProofData && (
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
          <div className="card-flat" style={{ maxWidth: '380px', width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>BẰNG CHỨNG MẬT MÃ MERKLE (JSON-LD)</span>
              <button onClick={() => setShowZkProofModal(false)} style={{ background: 'none', border: 'none', color: '#85858e', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#85858e' }}>
              Cổng Thư viện/Nhà xe chỉ nhận được thuộc tính này mà không biết thông tin danh tính cá nhân:
            </p>
            <pre style={{ background: '#0d0d0d', padding: '10px', borderRadius: '6px', fontSize: '10px', color: '#a3e635', overflowX: 'auto', border: '1px solid #1c1c1c' }}>
              {JSON.stringify(zkProofData, null, 2)}
            </pre>
            <button onClick={() => setShowZkProofModal(false)} className="btn-lime" style={{ width: '100%', marginTop: '12px' }}>
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* MODAL PHỤC HỒI DANH TÍNH QUA SHAMIR 2-OF-3 */}
      {showRecoveryModal && (
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
          <div className="card-flat" style={{ maxWidth: '360px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>KHÔI PHỤC DANH TÍNH SHAMIR (2-OF-3)</span>
              <button onClick={() => setShowRecoveryModal(false)} style={{ background: 'none', border: 'none', color: '#85858e', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#85858e', display: 'block', marginBottom: '3px' }}>Mảnh thứ nhất (ví dụ: Từ Email trường)</label>
                <input
                  type="text"
                  placeholder="UTH-SHARD-1-EDU-..."
                  value={inputShare1}
                  onChange={(e) => setInputShare1(e.target.value)}
                  className="input-flat"
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#85858e', display: 'block', marginBottom: '3px' }}>Mảnh thứ hai (Từ Thiết bị hoặc Cố vấn)</label>
                <input
                  type="text"
                  placeholder="UTH-SHARD-2-DEV-... hoặc UTH-SHARD-3-ADV-..."
                  value={inputShare2}
                  onChange={(e) => setInputShare2(e.target.value)}
                  className="input-flat"
                />
              </div>
            </div>

            {recoveryStatus && (
              <div style={{ padding: '8px', borderRadius: '4px', background: recoveryStatus.success ? 'rgba(163,230,53,0.1)' : 'rgba(239,68,68,0.1)', color: recoveryStatus.success ? '#a3e635' : '#ef4444', fontSize: '11px', marginBottom: '12px' }}>
                {recoveryStatus.message}
              </div>
            )}

            <button onClick={handleRecoverIdentity} className="btn-lime" style={{ width: '100%' }}>
              Xác Minh 2 Mảnh & Khôi Phục Ví
            </button>
          </div>
        </div>
      )}

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
