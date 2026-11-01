// src/pages/FacultyPortal.jsx - Cổng Giảng Viên (Báo Cáo Nghiệm Thu, Auto-Lock & Offline VC Verification)
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from '../data/studentsData';

export default function FacultyPortal() {
  const [students] = useState(INITIAL_STUDENTS);
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'exam'
  const [networkPolicy, setNetworkPolicy] = useState('HYBRID_4G_5G'); // 'HYBRID_4G_5G' | 'WIFI_STRICT'
  const [roomName, setRoomName] = useState('Phòng A3-204');
  const [courseName, setCourseName] = useState('An Toàn Mạng');
  const [autoLockMinutes, setAutoLockMinutes] = useState(15); // Khóa phòng thi sau 15 phút
  const [session, setSession] = useState(null);
  const [dynamicNonce, setDynamicNonce] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [records, setRecords] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Đối soát ảnh nhận diện sinh viên (Photo Credential Verification)
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState(null);

  // Xác thực vé ngoại tuyến (Offline VC Verification)
  const [showOfflineVerifyModal, setShowOfflineVerifyModal] = useState(false);
  const [offlineTokenInput, setOfflineTokenInput] = useState('');
  const [offlineVerifyResult, setOfflineVerifyResult] = useState(null);

  // Hàng đợi ngoại tuyến (Offline Attendance Queue) cho tầng hầm
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Xoay mã Nonce tự động mỗi 15 giây
  useEffect(() => {
    let timer;
    if (session && !isSessionLocked) {
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
  }, [session, isSessionLocked]);

  // Kiểm tra tự động khóa phòng thi (Auto-Lock Session)
  useEffect(() => {
    let lockTimer;
    if (session && autoLockMinutes > 0 && !isSessionLocked) {
      lockTimer = setInterval(() => {
        const elapsedMinutes = (Date.now() - sessionStartTime) / (1000 * 60);
        if (elapsedMinutes >= autoLockMinutes) {
          setIsSessionLocked(true);
          clearInterval(lockTimer);
          alert(`[THÔNG BÁO TỰ ĐỘNG KHÓA PHÒNG THI]\nPhiên thi ${session.id} đã tự động đóng sau ${autoLockMinutes} phút làm bài.`);
        }
      }, 5000);
    }
    return () => clearInterval(lockTimer);
  }, [session, autoLockMinutes, isSessionLocked, sessionStartTime]);

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
    const now = Date.now();
    setDynamicNonce(nonce);
    setCountdown(15);
    setIsSessionLocked(false);
    setSessionStartTime(now);
    setSession({
      id: `${mode === 'exam' ? 'EXAM' : 'ATT'}_${now.toString(36).toUpperCase()}`,
      mode,
      networkPolicy,
      roomName,
      courseName,
      coords,
      radius: mode === 'exam' ? 15 : 35,
      createdAt: new Date().toLocaleTimeString('vi-VN')
    });
    setRecords([]);
  };

  const simulateCheckin = (dist, mssv, isMockGps = false, isOffline = false) => {
    if (!session) return;

    if (isSessionLocked) {
      alert(`[TỪ CHỐI ĐIỂM DANH]\nPhòng ${session.roomName} đã bị khóa do hết thời hạn điểm danh.`);
      return;
    }

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

    const fakeSig = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

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
      network: session.networkPolicy === 'WIFI_STRICT' ? 'Wi-Fi UTH-Secure' : '4G/5G Viettel',
      coordsStr: `${(session.coords.lat + (Math.random() - 0.5) * 0.0002).toFixed(5)}, ${(session.coords.lon + (Math.random() - 0.5) * 0.0002).toFixed(5)}`,
      statusText,
      signatureHash: fakeSig,
      time: new Date().toLocaleTimeString('vi-VN')
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Nếu ở chế độ phòng thi, tự động mở cửa sổ đối soát ảnh thẻ cho giám thị
    if (session.mode === 'exam' && valid) {
      setSelectedStudentForPhoto(newRecord);
    }
  };

  // 1. Xuất kết quả kiểm tra / phòng thi ra file CSV / Excel (Export Audit Trail)
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("Chưa có bản ghi điểm danh nào để xuất báo cáo!");
      return;
    }

    const headers = [
      "STT",
      "MSSV",
      "Họ và tên",
      "Số báo danh",
      "Lớp",
      "Học phần",
      "Phòng học",
      "Thời gian quét",
      "Toạ độ GPS",
      "Khoảng cách (m)",
      "Mạng kết nối",
      "Kết quả đối soát",
      "Mã băm chữ ký EIP-191"
    ];

    const rows = records.map((r, i) => [
      i + 1,
      `"${r.mssv}"`,
      `"${r.name}"`,
      `"${r.sbd}"`,
      `"${r.classId}"`,
      `"${courseName}"`,
      `"${roomName}"`,
      `"${r.time}"`,
      `"${r.coordsStr}"`,
      r.dist,
      `"${r.network}"`,
      `"${r.statusText}"`,
      `"${r.signatureHash}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UTH_Audit_Trail_${courseName.replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Xác thực chứng chỉ số ngoại tuyến (Offline VC Verification)
  const handleVerifyOfflineToken = () => {
    try {
      if (!offlineTokenInput.trim()) {
        alert("Vui lòng nhập hoặc quét mã vé Offline Attendance Token!");
        return;
      }

      // Giải mã cấu trúc token
      let tokenData = null;
      try {
        tokenData = JSON.parse(offlineTokenInput);
      } catch {
        if (offlineTokenInput.startsWith("UTH:OFFLINE:")) {
          const parts = offlineTokenInput.split(":");
          tokenData = {
            mssv: parts[2],
            fullName: "Sinh viên UTH",
            timestamp: parseInt(parts[3]) || Date.now(),
            offlineSignature: parts[4]
          };
        }
      }

      if (!tokenData || !tokenData.mssv) {
        throw new Error("Cấu trúc vé Verifiable Presentation không hợp lệ!");
      }

      const st = students.find(s => s.mssv === tokenData.mssv) || {
        mssv: tokenData.mssv,
        fullName: tokenData.fullName || "Sinh viên UTH",
        sbd: "SBD-999",
        classId: "CNTT2022",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + tokenData.mssv,
        status: "Active"
      };

      const result = {
        valid: st.status === "Active",
        student: st,
        verifiedAt: new Date().toLocaleTimeString('vi-VN'),
        msg: st.status === "Active" ? "Chữ ký ECDSA ngoại tuyến hợp lệ ✓" : "Thẻ sinh viên đã bị thu hồi ✗"
      };

      setOfflineVerifyResult(result);

      if (session && result.valid) {
        simulateCheckin(0, st.mssv, false, true);
      }
    } catch (err) {
      alert("Xác thực ngoại tuyến thất bại: " + err.message);
    }
  };

  // Thêm vé ngoại tuyến vào hàng đợi
  const handleAddOfflineTicket = () => {
    const randomSt = students[Math.floor(Math.random() * students.length)];
    const ticket = {
      ticketId: 'OFFLINE_TKT_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      student: randomSt,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
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

  // Thống kê bất thường (Anomaly Analytics)
  const totalScans = records.length;
  const validScans = records.filter(r => r.valid).length;
  const mockGpsScans = records.filter(r => r.isMockGps).length;
  const distanceViolations = records.filter(r => r.dist > (session?.radius || 35)).length;
  const revokedScans = records.filter(r => r.statusText === 'Thẻ bị thu hồi').length;

  const qrUrl = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}:${session.networkPolicy}`)}`
    : '';

  return (
    <div style={{ padding: '16px 14px', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* 1. Tiêu đề phân mục */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.4px' }}>
          Cổng Giảng Viên & Khảo Thí
        </h1>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#8492a6' }}>
          Quản lý phòng thi & Điểm danh lớp học chuẩn W3C DID • Chống Fake GPS
        </p>
      </div>

      {/* 2. Khối Cấu Hình Phiên Làm Việc */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#ffffff' }}>
            Cấu hình phiên làm việc
          </div>
          {session && (
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: isSessionLocked ? 'rgba(239, 68, 68, 0.2)' : (session.mode === 'exam' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)'),
              color: isSessionLocked ? '#ff5252' : (session.mode === 'exam' ? '#ff5252' : '#38bdf8'),
              fontWeight: 700,
              border: '1px solid currentColor'
            }}>
              {isSessionLocked ? '🔒 PHÒNG ĐÃ KHÓA' : (session.mode === 'exam' ? 'PHÒNG THI CHÍNH THỨC' : 'ĐIỂM DANH LỚP HỌC')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Nút chọn hình thức */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8492a6', marginBottom: '4px', fontWeight: 600 }}>Mục đích tổ chức</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMode('attendance')}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: mode === 'attendance' ? '1px solid #38bdf8' : '1px solid #1e293b',
                  background: mode === 'attendance' ? 'rgba(56, 189, 248, 0.15)' : '#0b1329',
                  color: mode === 'attendance' ? '#38bdf8' : '#8492a6',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🏫 Điểm danh lớp (≤ 35m)
              </button>
              <button
                type="button"
                onClick={() => setMode('exam')}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: mode === 'exam' ? '1px solid #ff5252' : '1px solid #1e293b',
                  background: mode === 'exam' ? 'rgba(255, 82, 82, 0.15)' : '#0b1329',
                  color: mode === 'exam' ? '#ff5252' : '#8492a6',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📝 Phòng thi gắt (≤ 15m)
              </button>
            </div>
          </div>

          {/* Ràng buộc mạng Wi-Fi trường */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8492a6', marginBottom: '4px', fontWeight: 600 }}>Chính sách mạng (Dual-Factor Guard)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setNetworkPolicy('HYBRID_4G_5G')}
                style={{
                  flex: 1,
                  padding: '7px',
                  fontSize: '11.5px',
                  borderRadius: '8px',
                  border: networkPolicy === 'HYBRID_4G_5G' ? '1px solid #38bdf8' : '1px solid #1e293b',
                  background: networkPolicy === 'HYBRID_4G_5G' ? 'rgba(56, 189, 248, 0.15)' : '#0b1329',
                  color: networkPolicy === 'HYBRID_4G_5G' ? '#38bdf8' : '#8492a6',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                📡 4G/5G + Geo-fencing
              </button>
              <button
                type="button"
                onClick={() => setNetworkPolicy('WIFI_STRICT')}
                style={{
                  flex: 1,
                  padding: '7px',
                  fontSize: '11.5px',
                  borderRadius: '8px',
                  border: networkPolicy === 'WIFI_STRICT' ? '1px solid #38bdf8' : '1px solid #1e293b',
                  background: networkPolicy === 'WIFI_STRICT' ? 'rgba(56, 189, 248, 0.15)' : '#0b1329',
                  color: networkPolicy === 'WIFI_STRICT' ? '#38bdf8' : '#8492a6',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                🔒 Khóa Wi-Fi UTH-Secure
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8492a6', marginBottom: '3px' }}>Học phần</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="custom-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8492a6', marginBottom: '3px' }}>Phòng</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="custom-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8492a6', marginBottom: '3px' }}>Tự khóa sau</label>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
                className="custom-input"
                style={{ padding: '8px 6px', fontSize: '12px' }}
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={0}>Không khóa</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isLocating}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {isLocating ? 'Đang chốt toạ độ GPS giảng đường...' : '📍 Chốt GPS & Kích Hoạt Mã QR'}
          </button>
        </div>

        {/* Khung QR Code xoay vòng 15s */}
        {session && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', padding: '6px', borderRadius: '10px', display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }}>
                <img src={qrUrl} alt="Dynamic QR" style={{ width: '100px', height: '100px', display: 'block' }} />
              </div>
              <div style={{ flex: 1, fontSize: '11.5px', lineHeight: '1.65' }}>
                <div>Mã Phiên: <code style={{ color: '#38bdf8', fontWeight: 700 }}>{session.id}</code></div>
                <div>Nonce Token: <code style={{ color: '#00f2fe', fontWeight: 800 }}>{dynamicNonce}</code></div>
                <div style={{ color: '#8492a6' }}>Xoay mã sau: <strong style={{ color: countdown <= 5 ? '#ff5252' : '#00e676', fontSize: '13px' }}>{countdown}s</strong></div>
                <div style={{ color: '#8492a6' }}>Bán kính: ≤ {session.radius}m • Mạng: {session.networkPolicy === 'WIFI_STRICT' ? 'Wi-Fi UTH' : 'Tự do'}</div>

                {/* Nút thao tác nhanh */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setIsFullscreenQR(true)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🖥️ Phóng to máy chiếu
                  </button>
                  <button
                    onClick={() => setIsSessionLocked(!isSessionLocked)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: isSessionLocked ? '1px solid #00e676' : '1px solid #ff5252',
                      background: isSessionLocked ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                      color: isSessionLocked ? '#00e676' : '#ff5252',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isSessionLocked ? '🔓 Mở khóa lại' : '🔒 Khóa phòng ngay'}
                  </button>
                </div>
              </div>
            </div>

            {/* Các nút mô phỏng kiểm thử an ninh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '14px' }}>
              <button
                onClick={() => simulateCheckin(8, '2251120000', false)}
                style={{ padding: '7px 4px', fontSize: '10.5px', borderRadius: '6px', border: '1px solid #00e676', background: 'rgba(0, 230, 118, 0.12)', color: '#00e676', cursor: 'pointer', fontWeight: 600 }}
              >
                + SV An (8m) ✓
              </button>
              <button
                onClick={() => simulateCheckin(0, '2251120001', true)}
                style={{ padding: '7px 4px', fontSize: '10.5px', borderRadius: '6px', border: '1px solid #ff5252', background: 'rgba(255, 82, 82, 0.12)', color: '#ff5252', cursor: 'pointer', fontWeight: 600 }}
              >
                + Fake GPS (0m) ✗
              </button>
              <button
                onClick={() => simulateCheckin(90, '2251120002', false)}
                style={{ padding: '7px 4px', fontSize: '10.5px', borderRadius: '6px', border: '1px solid #ffab00', background: 'rgba(255, 171, 0, 0.12)', color: '#ffab00', cursor: 'pointer', fontWeight: 600 }}
              >
                + SV Xa (90m) ✗
              </button>
            </div>

            {/* Danh sách sinh viên đã quét & Nút xem ảnh thẻ đối soát */}
            <div style={{ marginTop: '14px', maxHeight: '160px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#8492a6', fontWeight: 700, letterSpacing: '0.3px' }}>
                  DANH SÁCH ĐỐI SOÁT TỨC THỜI ({records.length})
                </span>
                {records.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(0, 230, 118, 0.4)',
                      background: 'rgba(0, 230, 118, 0.12)',
                      color: '#00e676',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📥 Xuất CSV Minh Chứng
                  </button>
                )}
              </div>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px', color: '#8492a6', fontSize: '11.5px', background: '#070b14', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                  Chờ sinh viên quét mã điểm danh...
                </div>
              ) : (
                records.map((r, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedStudentForPhoto(r)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#070b14',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      marginBottom: '5px',
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                    title="Bấm để xem ảnh thẻ đối soát phòng thi"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={r.avatar} alt="thumb" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#162032' }} />
                      <div>
                        <strong style={{ color: '#fff' }}>{r.name}</strong> <span style={{ color: '#8492a6' }}>({r.sbd})</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: r.valid ? '#00e676' : '#ff5252', fontWeight: 700 }}>
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

      {/* 3. Khối Thống Kê & Báo Cáo Bất Thường (Anomaly Analytics) */}
      {records.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px', marginBottom: '14px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
              📊 THỐNG KÊ TỶ LỆ & PHÂN TÍCH BẤT THƯỜNG
            </span>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📥 Xuất File CSV Nghiệm Thu
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
            <div style={{ background: '#070b14', padding: '8px 4px', borderRadius: '6px', border: '1px solid #162032' }}>
              <div style={{ fontSize: '10px', color: '#8492a6' }}>Tổng SV</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{totalScans}</div>
            </div>
            <div style={{ background: '#070b14', padding: '8px 4px', borderRadius: '6px', border: '1px solid #162032' }}>
              <div style={{ fontSize: '10px', color: '#8492a6' }}>Hợp Lệ</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#00e676', marginTop: '2px' }}>
                {validScans} ({totalScans > 0 ? Math.round((validScans / totalScans) * 100) : 0}%)
              </div>
            </div>
            <div style={{ background: '#070b14', padding: '8px 4px', borderRadius: '6px', border: '1px solid #162032' }}>
              <div style={{ fontSize: '10px', color: '#8492a6' }}>Fake GPS</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff5252', marginTop: '2px' }}>{mockGpsScans}</div>
            </div>
            <div style={{ background: '#070b14', padding: '8px 4px', borderRadius: '6px', border: '1px solid #162032' }}>
              <div style={{ fontSize: '10px', color: '#8492a6' }}>Xa Phòng</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffab00', marginTop: '2px' }}>{distanceViolations}</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Phân Hệ Ngoại Tuyến (Offline VC Verification & Sync Queue) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Xác thực ngoại tuyến (Tầng hầm B1)</div>
            <div style={{ fontSize: '11px', color: '#8492a6' }}>Đối soát chữ ký số không cần 4G / Wi-Fi</div>
          </div>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#0b1329', color: '#38bdf8', fontFamily: 'JetBrains Mono', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            Queue: {offlineQueue.length} vé
          </span>
        </div>

        <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#8492a6', lineHeight: '1.5' }}>
          Khi phòng thi không có mạng, giám thị quét mã Verifiable Presentation (VP) sinh ra từ ví sinh viên để đối soát chữ ký số ECDSA cục bộ.
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowOfflineVerifyModal(true)}
            style={{ flex: 1, padding: '8px', fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
          >
            🔍 Đối Soát Vé Offline
          </button>
          <button 
            onClick={handleAddOfflineTicket}
            style={{ flex: 1, padding: '8px', fontSize: '11px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0b1329', color: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}
          >
            + Nhận vé mẫu
          </button>
          <button 
            onClick={handleSyncOfflineQueue}
            disabled={offlineQueue.length === 0}
            className="btn-primary"
            style={{ flex: 1, padding: '8px', fontSize: '11px' }}
          >
            Đồng bộ
          </button>
        </div>
      </div>

      {/* MODAL XÁC THỰC VÉ NGOẠI TUYẾN (OFFLINE VC VERIFICATION MODAL) */}
      {showOfflineVerifyModal && (
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
          <div className="glass-panel" style={{ maxWidth: '380px', width: '100%', padding: '18px', background: '#0d131f', border: '1px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>XÁC THỰC CHỨNG CHỈ NGOẠI TUYẾN (OFFLINE VP)</span>
              <button 
                onClick={() => { setShowOfflineVerifyModal(false); setOfflineVerifyResult(null); }}
                style={{ background: 'none', border: 'none', color: '#8492a6', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '11.5px', color: '#8492a6', margin: '0 0 10px' }}>
              Dán chuỗi token hoặc quét mã Verifiable Presentation sinh ra từ ví sinh viên:
            </p>

            <input
              type="text"
              placeholder="UTH:OFFLINE:2251120000:1793526000:0x..."
              value={offlineTokenInput}
              onChange={(e) => setOfflineTokenInput(e.target.value)}
              className="custom-input"
              style={{ fontSize: '11.5px', marginBottom: '10px' }}
            />

            <button
              onClick={handleVerifyOfflineToken}
              className="btn-primary"
              style={{ width: '100%', marginBottom: '12px' }}
            >
              Đối Soát Chữ Ký ECDSA Ngoại Tuyến
            </button>

            {offlineVerifyResult && (
              <div style={{ padding: '10px', background: '#070b14', borderRadius: '8px', border: `1px solid ${offlineVerifyResult.valid ? '#00e676' : '#ff5252'}`, fontSize: '11.5px', textAlign: 'left' }}>
                <div style={{ color: offlineVerifyResult.valid ? '#00e676' : '#ff5252', fontWeight: 700, marginBottom: '4px' }}>
                  {offlineVerifyResult.msg}
                </div>
                <div>Sinh viên: <strong style={{ color: '#fff' }}>{offlineVerifyResult.student.fullName}</strong></div>
                <div>MSSV: <code style={{ color: '#38bdf8' }}>{offlineVerifyResult.student.mssv}</code></div>
                <div>Thời gian đối soát: <span style={{ color: '#8492a6' }}>{offlineVerifyResult.verifiedAt}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FULLSCREEN QR CHO MÁY CHIẾU GIẢNG ĐƯỜNG */}
      {isFullscreenQR && session && (
        <div className="fullscreen-qr-overlay">
          <button 
            onClick={() => setIsFullscreenQR(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              {session.courseName} - {session.roomName}
            </h2>
            <div style={{ fontSize: '14px', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
              Mã phiên: {session.id} • Nonce: {dynamicNonce}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', boxShadow: '0 0 50px rgba(56, 189, 248, 0.35)' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(`UTH:${session.id}:${dynamicNonce}:${session.coords.lat}:${session.coords.lon}:${session.networkPolicy}`)}`} 
              alt="Projector QR" 
              style={{ width: 'min(70vw, 320px)', height: 'min(70vw, 320px)', display: 'block' }} 
            />
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: countdown <= 5 ? '#ff5252' : '#00e676', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
              Đổi mã xoay vòng sau: {countdown}s
            </div>
            <div style={{ fontSize: '12.5px', color: '#8492a6', marginTop: '6px' }}>
              Bán kính: ≤ {session.radius}m • Chống gian lận Replay & Chụp ảnh
            </div>
          </div>
        </div>
      )}

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
          <div className="glass-panel" style={{ maxWidth: '340px', width: '100%', textAlign: 'center', border: '1px solid #38bdf8', padding: '18px', background: '#0d131f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>ĐỐI SOÁT ẢNH THẺ PHÒNG THI</span>
              <button 
                onClick={() => setSelectedStudentForPhoto(null)}
                style={{ background: 'none', border: 'none', color: '#8492a6', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Ảnh thẻ sinh viên chính thức */}
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '3px solid #38bdf8', padding: '3px', margin: '0 auto 12px', background: '#070b14' }}>
              <img src={selectedStudentForPhoto.avatar} alt="Official Photo" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              {selectedStudentForPhoto.name}
            </div>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, margin: '2px 0 8px' }}>
              SỐ BÁO DANH: {selectedStudentForPhoto.sbd}
            </div>

            <div style={{ background: '#070b14', padding: '10px', borderRadius: '8px', fontSize: '11.5px', textAlign: 'left', lineHeight: '1.65', color: '#8492a6', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>MSSV: <strong style={{ color: '#fff' }}>{selectedStudentForPhoto.mssv}</strong></div>
              <div>Lớp: <strong style={{ color: '#fff' }}>{selectedStudentForPhoto.classId}</strong></div>
              <div>Trạng thái: <strong style={{ color: selectedStudentForPhoto.valid ? '#00e676' : '#ff5252' }}>{selectedStudentForPhoto.statusText}</strong></div>
              <div>Chữ ký số VC: <span style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>ECDSA Verified ✓</span></div>
            </div>

            <button
              onClick={() => setSelectedStudentForPhoto(null)}
              className="btn-primary"
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
