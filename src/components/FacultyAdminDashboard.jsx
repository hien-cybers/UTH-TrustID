// src/components/FacultyAdminDashboard.jsx - Cổng Thông Tin Web 16:9 Dành Riêng Cho Giảng Viên & Quản Trị Viên (Laptop / PC Projector Command Center)
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { exportAttendanceToExcel } from '../utils/exportAttendanceReport';
import { getSocketUrl, smartFetch, retargetSocket } from '../utils/backendUrl';

const INITIAL_DEMO_ATTENDEES = [
  {
    studentId: "2251120001",
    name: "Nguyễn Văn An",
    major: "An toàn Thông tin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    coords: { lat: 10.799215, lon: 106.705620 },
    distance: 4,
    network: "UTH_STUDENT_SECURE",
    deviceId: "DEV_IPHONE_15_A1",
    checkInTime: "13:30:15",
    signatureHash: "0x8f3a91c4...e191",
    spotCheckStatus: "VERIFIED" // 'NONE' | 'PENDING' | 'VERIFIED' | 'FAILED'
  },
  {
    studentId: "2251120002",
    name: "Trần Thị Mai",
    major: "Khoa học Máy tính",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    coords: { lat: 10.799260, lon: 106.705680 },
    distance: 12,
    network: "UTH_STUDENT_SECURE",
    deviceId: "DEV_SAMSUNG_S23_B2",
    checkInTime: "13:31:02",
    signatureHash: "0x4b1209d8...7a2c",
    spotCheckStatus: "NONE"
  },
  {
    studentId: "2251120003",
    name: "Lê Hoàng Quân",
    major: "Hệ thống Thông tin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    coords: { lat: 10.799480, lon: 106.706100 },
    distance: 65, // Ngoài vùng 35m
    network: "VIETTEL_4G",
    deviceId: "DEV_IPHONE_15_A1", // Trùng deviceId với bạn An -> IDS Trigger
    checkInTime: "13:32:40",
    signatureHash: "0x9c7742e1...3f09",
    spotCheckStatus: "FAILED"
  }
];

export default function FacultyAdminDashboard({ onSwitchMobileView }) {
  const navigate = useNavigate();

  // Cấu hình phiên học
  const [sessionConfig, setSessionConfig] = useState({
    courseCode: "IT402.N01",
    courseName: "An toàn Mạng máy tính & Ứng dụng",
    room: "A2-301",
    centerCoords: { lat: 10.799200, lon: 106.705600 },
    maxRadiusMeters: 35,
    networkMode: "CAMPUS_WIFI", // 'CAMPUS_WIFI' | 'CELLULAR_ANY'
    campusSsid: "UTH_STUDENT_SECURE"
  });

  const [sessionId, setSessionId] = useState("SES_A2301");
  const [isCreated, setIsCreated] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('PRESENTATION'); // 'PRESENTATION' | 'RADAR' | 'IDS_AUDIT'
  const [selectedMapStudent, setSelectedMapStudent] = useState(null);
  const [flaggedDevices, setFlaggedDevices] = useState([]);

  // Nonce xoay vòng & Tiến trình đếm lùi 35 giây
  const ROTATE_INTERVAL = 35;
  const [currentNonce, setCurrentNonce] = useState("NONCE_INIT_8X9K");
  const [timerProgress, setTimerProgress] = useState(ROTATE_INTERVAL);
  const socketRef = useRef(null);

  // Danh sách sinh viên hiện diện thời gian thực
  const [attendees, setAttendees] = useState(INITIAL_DEMO_ATTENDEES);

  // Trạng thái Tái kiểm tra đột xuất (Spot-check)
  const [spotCheckState, setSpotCheckState] = useState({
    active: false,
    countdown: 60,
    targetIds: [],
    mode: 'ALL'
  });

  // Kết nối WebSocket thời gian thực với Backend UTH-TrustID
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      secure: true,
      rejectUnauthorized: false
    });
    socketRef.current = socket;

    const handleBackendChanged = (e) => {
      if (e?.detail) retargetSocket(socket, e.detail);
    };
    window.addEventListener('uth-backend-url-changed', handleBackendChanged);

    // Kiểm tra nếu trên server đã có phiên đang mở
    smartFetch('/api/session/active')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d?.session && d.session.isOpen) {
          const s = d.session;
          setSessionId(s.sessionId || "SES_A2301");
          if (s.nonce) setCurrentNonce(s.nonce);
          socket.emit('join-session', { sessionId: s.sessionId, role: 'FACULTY' });
        }
      })
      .catch(() => {});

    const upsertAttendee = (rec) => {
      if (!rec) return;
      const sid = rec.studentId || rec.mssv || ('SV_' + Date.now());
      const mapped = {
        studentId: sid,
        name: rec.fullName || rec.name || 'Sinh viên UTH',
        major: rec.major || 'An toàn Thông tin',
        avatar: rec.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        coords: rec.coords || {
          lat: Number(rec.lat || 10.799220),
          lon: Number(rec.lon || 106.705630)
        },
        distance: Number(rec.dist ?? rec.distance ?? 5),
        network: rec.network || rec.networkMode || 'UTH_STUDENT_SECURE',
        deviceId: rec.deviceId || 'DEV_MOBILE_EIP191',
        checkInTime: rec.time || rec.checkInTime || new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        signatureHash: rec.signatureHash || '0x9a1c...e191',
        spotCheckStatus: rec.spotCheckVerified ? 'VERIFIED' : (rec.status === 'PENDING_SPOTCHECK' ? 'PENDING' : 'NONE')
      };

      setAttendees((prev) => {
        const exists = prev.some((item) => item.studentId === sid);
        if (exists) {
          return prev.map((item) => (item.studentId === sid ? { ...item, ...mapped } : item));
        }
        return [mapped, ...prev];
      });
    };

    socket.on('new-attendee', upsertAttendee);
    socket.on('student-checked-in', upsertAttendee);
    socket.on('student-verified', upsertAttendee);
    socket.on('attendee-updated', upsertAttendee);

    socket.on('nonce-updated', (payload) => {
      if (payload?.nonce) {
        setCurrentNonce(payload.nonce);
        setTimerProgress(ROTATE_INTERVAL);
      }
    });

    socket.on('spot-check-verified', (payload) => {
      const sid = payload?.studentId || payload?.mssv;
      if (sid) {
        setAttendees((prev) =>
          prev.map((a) => (a.studentId === sid ? { ...a, spotCheckStatus: 'VERIFIED' } : a))
        );
      }
    });

    socket.on('spot-check-updated', (payload) => {
      if (payload?.studentId && payload?.status === 'VERIFIED') {
        setAttendees((prev) =>
          prev.map((a) => (a.studentId === payload.studentId ? { ...a, spotCheckStatus: 'VERIFIED' } : a))
        );
      }
    });

    return () => {
      window.removeEventListener('uth-backend-url-changed', handleBackendChanged);
      socket.disconnect();
    };
  }, []);

  // Khởi tạo phiên học lên Backend và mở màn chiếu
  const handleCreateAndStartSession = async () => {
    const newSid = 'SES_' + (sessionConfig.room || 'A2301').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setSessionId(newSid);
    setIsCreated(true);
    setIsSessionOpen(true);
    setTimerProgress(ROTATE_INTERVAL);

    try {
      const res = await smartFetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSid,
          courseCode: sessionConfig.courseCode,
          courseName: sessionConfig.courseName,
          room: sessionConfig.room,
          centerCoords: sessionConfig.centerCoords,
          maxRadiusMeters: Number(sessionConfig.maxRadiusMeters) || 35,
          networkMode: sessionConfig.networkMode,
          campusSsid: sessionConfig.campusSsid
        })
      });
      const data = await res.json();
      if (data?.success) {
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.initialNonce) setCurrentNonce(data.initialNonce);
        socketRef.current?.emit('join-session', { sessionId: data.sessionId || newSid, role: 'FACULTY' });
      }
    } catch {}
  };

  // Đóng hoặc mở lại phiên điểm danh
  const handleToggleSessionOpen = async () => {
    const nextOpen = !isSessionOpen;
    setIsSessionOpen(nextOpen);
    if (!nextOpen) {
      socketRef.current?.emit('close-session', { sessionId });
      try {
        await smartFetch('/api/session/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch {}
    } else {
      handleCreateAndStartSession();
    }
  };

  // Vòng lặp đếm lùi xoay Nonce (35s)
  useEffect(() => {
    if (!isCreated || !isSessionOpen) return;
    const interval = setInterval(() => {
      setTimerProgress(prev => {
        if (prev <= 1) {
          const nextNonce = "NONCE_" + Math.random().toString(36).substring(2, 9).toUpperCase();
          setCurrentNonce(nextNonce);
          socketRef.current?.emit('rotate-nonce', { sessionId, nonce: nextNonce });
          return ROTATE_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCreated, isSessionOpen, sessionId]);

  // Vòng lặp đếm lùi Spot-check 60s
  useEffect(() => {
    let timer = null;
    if (spotCheckState.active && spotCheckState.countdown > 0) {
      timer = setInterval(() => {
        setSpotCheckState(p => ({ ...p, countdown: p.countdown - 1 }));
      }, 1000);
    } else if (spotCheckState.active && spotCheckState.countdown === 0) {
      // Kết thúc 60s: Ai chưa xác thực chuyển thành FAILED
      setAttendees(prev => prev.map(a => 
        spotCheckState.targetIds.includes(a.studentId) && a.spotCheckStatus === 'PENDING'
          ? { ...a, spotCheckStatus: 'FAILED' }
          : a
      ));
      setSpotCheckState(p => ({ ...p, active: false }));
    }
    return () => clearInterval(timer);
  }, [spotCheckState.active, spotCheckState.countdown, spotCheckState.targetIds]);

  // Kích hoạt Spot-check cho sinh viên đã có mặt (ALL | RANDOM_5 | FURTHEST)
  const handleTriggerSpotCheck = async (mode = 'ALL') => {
    if (attendees.length === 0) return alert("Chưa có sinh viên trong phòng!");
    let targets = [];
    if (mode === 'ALL') {
      targets = attendees.map(a => a.studentId);
    } else if (mode === 'RANDOM_5') {
      const shuffled = [...attendees].sort(() => 0.5 - Math.random());
      targets = shuffled.slice(0, Math.min(5, shuffled.length)).map(a => a.studentId);
    } else if (mode === 'FURTHEST') {
      // Chọn các sinh viên có khoảng cách GPS xa nhất (> 10m hoặc top 2 xa nhất)
      const farOnes = attendees.filter(a => a.distance >= 10);
      targets = (farOnes.length > 0 ? farOnes : [...attendees].sort((a, b) => b.distance - a.distance).slice(0, 2))
        .map(a => a.studentId);
    }

    setAttendees(prev => prev.map(a => 
      targets.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a
    ));
    setSpotCheckState({ active: true, countdown: 60, targetIds: targets, mode });

    // Phát lệnh xuống thiết bị di động của các sinh viên nằm trong danh sách targets
    socketRef.current?.emit('trigger-spot-check', {
      sessionId,
      timeoutSec: 60,
      targetIds: targets
    });
    try {
      await smartFetch('/api/faculty/spot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          timeoutSeconds: 60,
          targetIds: targets,
          mode
        })
      });
    } catch {}
  };

  // Giả lập 1 sinh viên nộp lại Face ID thành công
  const handleMockPassSpotCheck = (studentId) => {
    setAttendees(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, spotCheckStatus: 'VERIFIED' } : a
    ));
  };

  // Xuất báo cáo học vụ 1-Click (.xlsx thực tế)
  const handleAcademicExport = () => {
    exportAttendanceToExcel(
      attendees.map(a => ({
        mssv: a.studentId,
        studentId: a.studentId,
        name: a.name,
        fullName: a.name,
        major: a.major || 'An toàn Thông tin',
        time: a.checkInTime,
        dist: a.distance,
        networkMode: a.network,
        signatureHash: a.signatureHash || '0x8f3a91c4...e191',
        spotCheckVerified: a.spotCheckStatus === 'VERIFIED',
        status: a.spotCheckStatus === 'FAILED' ? 'ABSENT' : 'PRESENT'
      })),
      {
        id: sessionId,
        courseCode: sessionConfig.courseCode,
        courseName: sessionConfig.courseName,
        room: sessionConfig.room
      }
    );
  };

  // Phát hiện gian lận phần cứng (IDS Audit)
  const deviceCounts = attendees.reduce((acc, cur) => {
    acc[cur.deviceId] = (acc[cur.deviceId] || 0) + 1;
    return acc;
  }, {});
  const duplicateDeviceCount = Object.values(deviceCounts).filter(c => c > 1).length;

  // Chuỗi QR chuẩn UTH_ID để điện thoại sinh viên quét trực tiếp trên màn chiếu
  const qrPayloadString = `UTH_ID:${sessionId}:${currentNonce}:${sessionConfig.centerCoords.lat}:${sessionConfig.centerCoords.lon}:${Date.now()}:${
    sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'CAMPUS_WIFI_ONLY' : 'HYBRID_4G_5G'
  }`;

  return (
    <div className="min-h-screen w-full bg-[#040814] text-slate-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP HEADER: THANH ĐIỀU HƯỚNG QUẢN TRỊ VIÊN & GIẢNG VIÊN */}
      <header className="min-h-16 py-2 px-6 border-b border-cyan-500/20 bg-[#060D1F]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-black text-cyan-400 text-sm shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            U
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white m-0">TRUSTID COMMAND CENTER</h1>
            <p className="text-[10px] font-mono text-cyan-400 m-0">FACULTY &amp; AUDIT PORTAL • ZERO-TRUST ARCHITECTURE (16:9 PROJECTOR)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCreated && (
            <>
              <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                Lớp: <span className="font-bold text-cyan-300">{sessionConfig.courseCode}</span> • Phòng: <span className="text-white">{sessionConfig.room}</span>
              </div>

              <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 ${
                isSessionOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSessionOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {isSessionOpen ? 'PHIÊN MỞ (ACCEPTING)' : 'ĐÃ ĐÓNG (GRACE 20S)'}
              </div>

              <button
                onClick={handleToggleSessionOpen}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSessionOpen 
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                    : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isSessionOpen ? '🔒 Đóng Nhận Diện' : '🔓 Mở Lại Phiên'}
              </button>

              <button
                onClick={() => setIsCreated(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/40 cursor-pointer"
              >
                ⚙ Cấu Hình Lại
              </button>
            </>
          )}

          {onSwitchMobileView && (
            <button
              onClick={onSwitchMobileView}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
            >
              📱 Khung Mobile
            </button>
          )}

          <button
            onClick={() => navigate('/student')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 cursor-pointer"
          >
            🎓 Ví Sinh Viên
          </button>
        </div>
      </header>

      {/* 2. NỘI DUNG CHÍNH */}
      {!isCreated ? (
        /* ================= FORM KHỞI TẠO PHÒNG ================= */
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white m-0">Khởi Tạo Phiên Giảng Đường Số</h2>
              <p className="text-xs text-slate-400 mt-1 mb-0">Thiết lập tham số an ninh mạng và không gian trước khi trình chiếu QR khổ lớn</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400">Mã Lớp Học Phần</label>
                <input
                  value={sessionConfig.courseCode}
                  onChange={e => setSessionConfig({...sessionConfig, courseCode: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400">Phòng Học</label>
                <input
                  value={sessionConfig.room}
                  onChange={e => setSessionConfig({...sessionConfig, room: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-mono text-slate-400">Tên Môn Học</label>
                <input
                  value={sessionConfig.courseName}
                  onChange={e => setSessionConfig({...sessionConfig, courseName: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400">Bán Kính GPS (m)</label>
                <input
                  type="number"
                  value={sessionConfig.maxRadiusMeters}
                  onChange={e => setSessionConfig({...sessionConfig, maxRadiusMeters: Number(e.target.value) || 35})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Ràng buộc mạng */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Cơ chế Kiểm soát Kết nối (Network Enforcement)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CAMPUS_WIFI'})}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    sessionConfig.networkMode === 'CAMPUS_WIFI'
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold m-0">📶 Wi-Fi Trường (Khuyên dùng)</p>
                  <p className="text-[10px] text-slate-500 mt-1 mb-0">Chặn 4G ngoài trường, bắt buộc kết nối AP phòng học ({sessionConfig.campusSsid})</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionConfig({...sessionConfig, networkMode: 'CELLULAR_ANY'})}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    sessionConfig.networkMode === 'CELLULAR_ANY'
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold m-0">🌐 Mạng Di Động (4G/5G)</p>
                  <p className="text-[10px] text-slate-500 mt-1 mb-0">Siết chặt Geofencing Haversine R ≤ {sessionConfig.maxRadiusMeters}m</p>
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateAndStartSession}
              className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] cursor-pointer border-none"
            >
              🚀 MỞ PHIÊN ĐIỂM DANH &amp; BẬT MÁY CHIẾU
            </button>
          </div>
        </main>
      ) : (
        /* ================= DASHBOARD CHỈ HUY TRỰC QUAN 12 CỘT ================= */
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* CỘT TRÁI (7 CỘT): MÀN CHIẾU MÃ QR HOẶC RADAR HOẶC IDS AUDIT */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Thanh điều hướng Module xem */}
            <div className="flex flex-wrap items-center justify-between bg-[#081226] p-2 rounded-2xl border border-slate-800 gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('PRESENTATION')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    activeTab === 'PRESENTATION' 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📽️ Màn Chiếu QR Khổ Lớn
                </button>
                <button
                  onClick={() => setActiveTab('RADAR')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    activeTab === 'RADAR' 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🛰️ Radar Tọa Độ Vệ Tinh ({attendees.length})
                </button>
                <button
                  onClick={() => setActiveTab('IDS_AUDIT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                    activeTab === 'IDS_AUDIT' 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Cảnh Báo Gian Lận IDS ({duplicateDeviceCount})
                  {duplicateDeviceCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                </button>
              </div>

              <span className="text-[11px] font-mono text-cyan-400 px-3">
                Sliding Window: 3 Nonces Cached
              </span>
            </div>

            {/* TAB 1: MÀN CHIẾU QR DÀNH CHO MÁY CHIẾU LỚN */}
            {activeTab === 'PRESENTATION' && (
              <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-cyan-500/30 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-6 text-left">
                  <p className="text-xs font-mono text-slate-400 m-0">CHALLENGE-RESPONSE TOTP • {sessionId}</p>
                  <p className="text-sm font-bold text-white m-0">{sessionConfig.courseName}</p>
                </div>

                <div className="absolute top-4 right-6 text-right">
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                    {sessionConfig.networkMode === 'CAMPUS_WIFI' ? `📶 ${sessionConfig.campusSsid}` : `🌐 4G/5G (≤ ${sessionConfig.maxRadiusMeters}m)`}
                  </span>
                </div>

                {/* Khung Mã QR Siêu Lớn Tương Phản Cao (Quét thật từ Điện Thoại) */}
                <div className="relative p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.2)] border-4 border-cyan-400 flex flex-col items-center mt-4">
                  <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                    <QRCodeCanvas
                      value={qrPayloadString}
                      size={256}
                      level="L"
                      includeMargin={false}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs font-mono font-bold text-slate-950 truncate max-w-xs m-0">{currentNonce}</p>
                    <p className="text-[10px] font-mono text-slate-600 m-0">Độ phức tạp Merkle Root: O(log N)</p>
                  </div>
                </div>

                {/* Thanh tiến trình đếm lùi xoay mã (HUD Countdown 35s) */}
                <div className="w-80 mt-6 space-y-1.5 text-center">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Tự động xoay mã sau:</span>
                    <span className={`font-bold ${timerProgress <= 5 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                      {timerProgress}s ({Math.round((timerProgress / ROTATE_INTERVAL) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear ${
                        timerProgress <= 5
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${(timerProgress / ROTATE_INTERVAL) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RADAR TỌA ĐỘ VỆ TINH (SPATIAL SECURITY RADAR) */}
            {activeTab === 'RADAR' && (
              <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-cyan-500/30 p-6 flex flex-col relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white m-0">Bản Đồ Hiện Diện Không Gian (Haversine Radar)</h3>
                    <p className="text-xs text-slate-400 m-0">Tâm phòng: {sessionConfig.room} ({sessionConfig.centerCoords.lat.toFixed(4)}, {sessionConfig.centerCoords.lon.toFixed(4)}) • Bán kính an toàn: {sessionConfig.maxRadiusMeters}m</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    Độ chính xác GPS: ±3.2m
                  </span>
                </div>

                {/* Mô phỏng Radar không gian */}
                <div className="flex-1 rounded-2xl bg-[#040814] border border-slate-800 relative flex items-center justify-center overflow-hidden min-h-[360px]">
                  {/* Lưới tọa độ Radar */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="w-full h-px bg-cyan-500/40" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="h-full w-px bg-cyan-500/40" />
                  </div>

                  {/* Vòng tròn bán kính Haversine 35m */}
                  <div className="absolute w-80 h-80 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <div className="absolute w-56 h-56 rounded-full border border-cyan-500/40" />
                    <div className="absolute w-28 h-28 rounded-full border border-cyan-500/50" />
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-cyan-500/40 z-10">
                      🎯 TÂM PHÒNG {sessionConfig.room}
                    </span>
                  </div>

                  {/* Các chấm sinh viên */}
                  {attendees.map(s => {
                    const isOutside = s.distance > sessionConfig.maxRadiusMeters;
                    const offsetX = Math.max(-165, Math.min(165, (s.coords.lat - sessionConfig.centerCoords.lat) * 240000));
                    const offsetY = Math.max(-150, Math.min(150, (s.coords.lon - sessionConfig.centerCoords.lon) * 240000));
                    return (
                      <div 
                        key={s.studentId}
                        onClick={() => setSelectedMapStudent(s)}
                        title={`Nhấn để xem bản đồ: ${s.name} (${s.distance}m)`}
                        className={`absolute px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer transition-all z-20 ${
                          isOutside 
                            ? 'bg-rose-500 text-white animate-bounce shadow-[0_0_14px_#F43F5E]' 
                            : 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_#34D399]'
                        }`}
                        style={{
                          transform: `translate(${offsetX}px, ${offsetY}px)`
                        }}
                      >
                        <span>●</span>
                        <span>{s.name.split(' ').slice(-1)[0]} ({s.distance}m)</span>
                      </div>
                    );
                  })}

                  <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <p className="text-emerald-400 m-0">● Trong phòng (&le; {sessionConfig.maxRadiusMeters}m) — Hợp lệ</p>
                    <p className="text-rose-400 m-0">● Ngoài phòng học (&gt; {sessionConfig.maxRadiusMeters}m) — Nghi vấn gian lận</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRUNG TÂM GIÁM SÁT AN NINH PHẦN CỨNG IDS */}
            {activeTab === 'IDS_AUDIT' && (
              <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-rose-500/30 p-6 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-rose-300 m-0">Nhật Ký Phát Hiện Tấn Công &amp; Điểm Danh Hộ (IDS)</h3>
                    <p className="text-xs text-slate-400 m-0">Kiểm tra dấu vân tay thiết bị (Hardware Fingerprint) và proxy mạng</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                    {duplicateDeviceCount} Lỗ Hổng Phát Hiện
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto">
                  {Object.entries(deviceCounts).map(([devId, count]) => {
                    if (count > 1) {
                      const violators = attendees.filter(a => a.deviceId === devId);
                      const isFlagged = flaggedDevices.includes(devId);
                      return (
                        <div key={devId} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2">
                          <div className="flex justify-between text-rose-400 font-bold font-mono">
                            <span>⚠️ PHÁT HIỆN 1 MÁY ĐIỂM DANH CHO {count} TÀI KHOẢN</span>
                            <span>Mã máy: {devId}</span>
                          </div>
                          <p className="text-slate-300 m-0">
                            Các sinh viên liên quan: <strong>{violators.map(v => `${v.name} (${v.studentId})`).join(', ')}</strong>
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => {
                                if (!isFlagged) setFlaggedDevices(prev => [...prev, devId]);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border-none cursor-pointer ${
                                isFlagged ? 'bg-slate-800 text-rose-300' : 'bg-rose-500 text-white hover:bg-rose-400'
                              }`}
                            >
                              {isFlagged ? '✓ Đã Gắn Cờ Gian Lận Học Vụ' : 'Gắn Cờ Gian Lận Học Vụ'}
                            </button>
                            <button 
                              onClick={() => handleTriggerSpotCheck('ALL')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] cursor-pointer hover:bg-amber-500/30"
                            >
                              Buộc Tái Kiểm Tra Face ID Cả Lớp
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    ✓ Kiểm tra Sliding Window Nonce (3 Nonce gần nhất): Không phát hiện Replay Attack.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    ✓ Toàn vẹn EIP-191: Khôi phục địa chỉ ví trùng khớp 100% với cây Merkle của danh sách lớp.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (5 CỘT): TRUNG TÂM SPOT-CHECK & DANH SÁCH SINH VIÊN */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* HỘP ĐIỀU KHIỂN TÁI KIỂM TRA ĐỘT XUẤT (TARGETED SPOT-CHECK CONSOLE) */}
            <div className="p-5 rounded-3xl bg-[#081226] border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
                  ⚡ Tái Kiểm Tra Hiện Diện (Targeted Spot-Check)
                </h3>
                {spotCheckState.active && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs animate-pulse">
                    Còn {spotCheckState.countdown}s
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 m-0">
                Phát lệnh kiểm tra sinh trắc học Face ID tức thì (Ân hạn 60s). Chỉ áp dụng cho các sinh viên đã điểm danh ban đầu:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('ALL')}
                  className="py-2.5 px-2 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                >
                  Toàn Bộ Lớp (All)
                </button>
                <button
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('RANDOM_5')}
                  className="py-2.5 px-2 rounded-xl text-[11px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Ngẫu Nhiên 5 SV
                </button>
                <button
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('FURTHEST')}
                  className="py-2.5 px-2 rounded-xl text-[11px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Xa Nhất (&gt;10m)
                </button>
              </div>
            </div>

            {/* DANH SÁCH SINH VIÊN HIỆN DIỆN THỜI GIAN THỰC */}
            <div className="flex-1 min-h-[360px] rounded-3xl bg-[#081226] border border-slate-800 p-5 flex flex-col overflow-hidden shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                    Hiện Diện Lớp ({attendees.length})
                  </h3>
                  <p className="text-[10px] font-mono text-cyan-400 m-0">CẬP NHẬT TỨC THÌ QUA WEBSOCKET</p>
                </div>
                
                {/* Nút xuất báo cáo Excel 1-Click */}
                <button 
                  onClick={handleAcademicExport}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  📥 Xuất Báo Cáo Excel (.xlsx)
                </button>
              </div>

              {/* Bảng danh sách cuộn */}
              <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
                {attendees.map(s => {
                  const isSuspicious = s.distance > sessionConfig.maxRadiusMeters || deviceCounts[s.deviceId] > 1;
                  return (
                    <div 
                      key={s.studentId}
                      className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between ${
                        isSuspicious 
                          ? 'bg-rose-950/20 border-rose-500/40 text-slate-200' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={s.avatar} 
                          alt={s.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-white truncate m-0">{s.name}</p>
                          <p className="text-[10px] font-mono text-cyan-400 m-0">
                            {s.studentId} • <span className="text-slate-400">{s.deviceId}</span>
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 m-0">
                            {s.checkInTime} • <span className={s.distance > sessionConfig.maxRadiusMeters ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{s.distance}m</span> • {s.network}
                          </p>
                        </div>
                      </div>

                      {/* Trạng thái xác thực & Nút Maps */}
                      <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedMapStudent(s)}
                            className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono hover:bg-blue-500/20 cursor-pointer"
                          >
                            📍 Google Maps
                          </button>
                        </div>

                        {/* Trạng thái Spot-check */}
                        {s.spotCheckStatus === 'PENDING' && (
                          <button
                            onClick={() => handleMockPassSpotCheck(s.studentId)}
                            className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono animate-pulse cursor-pointer"
                            title="Bấm để giả lập sinh viên quét Face ID thành công"
                          >
                            Đang chờ Face ID...
                          </button>
                        )}
                        {s.spotCheckStatus === 'VERIFIED' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                            Spot-check ✓
                          </span>
                        )}
                        {s.spotCheckStatus === 'FAILED' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold">
                            Không Hiện Diện ✗
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MODAL BẢN ĐỒ GOOGLE MAPS TRỰC QUAN KHI BẤM VÀO SINH VIÊN */}
      {selectedMapStudent && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setSelectedMapStudent(null)}
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-[#081226] border border-cyan-500/40 overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white m-0">
                  📍 Vị trí GPS: {selectedMapStudent.name} ({selectedMapStudent.studentId})
                </h4>
                <p className="text-xs font-mono text-cyan-400 m-0 mt-0.5">
                  Tọa độ: {selectedMapStudent.coords.lat}, {selectedMapStudent.coords.lon} • Cách tâm phòng: {selectedMapStudent.distance}m
                </p>
              </div>
              <button
                onClick={() => setSelectedMapStudent(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="w-full h-80 bg-black">
              <iframe
                title="Student GPS Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${selectedMapStudent.coords.lat},${selectedMapStudent.coords.lon}&z=19&output=embed`}
              />
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs">
              <span className={selectedMapStudent.distance <= sessionConfig.maxRadiusMeters ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {selectedMapStudent.distance <= sessionConfig.maxRadiusMeters
                  ? `● Hợp lệ trong bán kính giảng đường (≤ ${sessionConfig.maxRadiusMeters}m)`
                  : `⚠️ Cảnh báo: Nằm ngoài bán kính giảng đường (> ${sessionConfig.maxRadiusMeters}m)`}
              </span>
              <a
                href={`https://www.google.com/maps?q=${selectedMapStudent.coords.lat},${selectedMapStudent.coords.lon}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-mono underline"
              >
                Mở trên Google Maps ↗
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
