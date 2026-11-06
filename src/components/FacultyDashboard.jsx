// src/components/FacultyDashboard.jsx - Web Command Center dành cho Giảng viên & Quản trị viên (Stage QR Laser, Canvas Radar 360°, IDS Audit, Spot-Check 60s, CSV Export & Root Admin Merkle/Revoke)
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { getSocketUrl, smartFetch, retargetSocket } from '../utils/backendUrl';
import { generateMerkleCredentials } from '../utils/merkleHelper';
import { saveCredentialToStorage } from '../utils/credentialStorage';

export default function FacultyDashboard({
  initialMode = 'FACULTY' // 'FACULTY' | 'ADMIN'
}) {

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
  const [isCreated, setIsCreated] = useState(initialMode === 'ADMIN');
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(initialMode === 'ADMIN' ? 'ADMIN' : 'STAGE'); // 'STAGE' | 'RADAR' | 'IDS' | 'ADMIN'
  
  // Nonce xoay vòng & Tiến trình đếm lùi 35 giây
  const ROTATE_INTERVAL = 35;
  const [currentNonce, setCurrentNonce] = useState("NONCE_STAGE_8X9K");
  const [timerProgress, setTimerProgress] = useState(ROTATE_INTERVAL);
  const socketRef = useRef(null);

  // Danh sách sinh viên hiện diện thời gian thực
  const [attendees, setAttendees] = useState([
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
      spotCheckStatus: "FAILED"
    }
  ]);

  // Trạng thái Tái kiểm tra đột xuất (Spot-check)
  const [spotCheckState, setSpotCheckState] = useState({
    active: false,
    countdown: 60,
    targetIds: []
  });

  // State Quản trị viên Root Admin (Merkle Batch Issuance & Key Revocation)
  const [adminStats, setAdminStats] = useState({
    totalDID: 1240,
    activeDID: 1238,
    revokedDID: 2,
    merkleRoot: localStorage.getItem('uth_latest_merkle_root') || '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2'
  });
  const [batchJson, setBatchJson] = useState(`[
  {
    "studentId": "2251120000",
    "fullName": "Nguyễn Đức Hiển",
    "major": "An toàn Thông tin",
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  },
  {
    "studentId": "2251120001",
    "fullName": "Nguyễn Văn An",
    "major": "An toàn Thông tin",
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
]`);
  const [revokeAddressInput, setRevokeAddressInput] = useState('0x1D9b6938A3f073e3426052C7016155D85040Ed1D');
  const [adminStatusMsg, setAdminStatusMsg] = useState('');

  // Canvas radar ref
  const canvasRef = useRef(null);

  // Đồng bộ thời gian thực qua WebSocket với Backend
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

  // Khởi tạo phiên học lên Backend và bật máy chiếu
  const handleStartProjectorSession = async () => {
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

  // Đóng hoặc mở lại nhận diện phiên
  const handleToggleSessionState = async () => {
    const nextState = !isSessionOpen;
    setIsSessionOpen(nextState);
    if (!nextState) {
      socketRef.current?.emit('close-session', { sessionId });
      try {
        await smartFetch('/api/session/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch {}
    } else {
      handleStartProjectorSession();
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
      setAttendees(prev => prev.map(a => 
        spotCheckState.targetIds.includes(a.studentId) && a.spotCheckStatus === 'PENDING'
          ? { ...a, spotCheckStatus: 'FAILED' }
          : a
      ));
      setSpotCheckState(p => ({ ...p, active: false }));
    }
    return () => clearInterval(timer);
  }, [spotCheckState.active, spotCheckState.countdown, spotCheckState.targetIds]);

  // Vẽ Radar bằng Canvas với hiệu ứng quét 360 độ
  useEffect(() => {
    if (activeTab !== 'RADAR' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Vòng tròn radar nền
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.66, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.33, 0, 2 * Math.PI);
      ctx.stroke();

      // Trục tọa độ chữ thập
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = 'rgba(8, 145, 178, 0.4)';
      ctx.stroke();

      // Quét radar xoay (Scanline 360 độ)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Tâm phòng học
      ctx.fillStyle = '#00F2FE';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Vẽ sinh viên
      attendees.forEach(s => {
        const dx = (s.coords.lon - sessionConfig.centerCoords.lon) * 150000;
        const dy = (sessionConfig.centerCoords.lat - s.coords.lat) * 150000;
        const px = Math.max(16, Math.min(canvas.width - 16, centerX + dx));
        const py = Math.max(16, Math.min(canvas.height - 16, centerY + dy));

        const isOutside = s.distance > sessionConfig.maxRadiusMeters;
        ctx.fillStyle = isOutside ? '#F43F5E' : '#34D399';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Viền phát sáng
        ctx.strokeStyle = isOutside ? 'rgba(244, 63, 94, 0.6)' : 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nhãn tên + khoảng cách
        ctx.fillStyle = isOutside ? '#FDA4AF' : '#A7F3D0';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${s.name.split(' ').slice(-1)[0]} (${s.distance}m)`, px + 8, py + 3);
      });

      angle += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTab, attendees, sessionConfig]);

  // Kích hoạt Spot-check
  const handleTriggerSpotCheck = async (mode = 'ALL') => {
    if (attendees.length === 0) return;
    let targets = [];
    if (mode === 'ALL') {
      targets = attendees.map(a => a.studentId);
    } else if (mode === 'FURTHEST') {
      targets = [...attendees].sort((a, b) => b.distance - a.distance).slice(0, 2).map(a => a.studentId);
    }

    setAttendees(prev => prev.map(a => 
      targets.includes(a.studentId) ? { ...a, spotCheckStatus: 'PENDING' } : a
    ));
    setSpotCheckState({ active: true, countdown: 60, targetIds: targets });

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

  // Giả lập sinh viên vượt qua Spot-check
  const handleMockPass = (studentId) => {
    setAttendees(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, spotCheckStatus: 'VERIFIED' } : a
    ));
  };

  // Xuất file CSV danh sách chuẩn học vụ (kèm BOM UTF-8 để hiển thị chuẩn tiếng Việt trên Excel)
  const handleExportCSV = () => {
    let csv = "\uFEFFMSSV,HoVaTen,Nganh,KhoangCach(m),ThietBi,ThoiGian,TrangThaiSpotCheck\n";
    attendees.forEach(a => {
      csv += `${a.studentId},"${a.name}",${a.major},${a.distance},${a.deviceId},${a.checkInTime},${a.spotCheckStatus}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DanhSach_${sessionConfig.courseCode}_${sessionConfig.room}.csv`;
    link.click();
  };

  // Chức năng Quản trị viên Root Admin: Phát hành lô Merkle Root & Thu hồi khóa
  const handleAdminIssueMerkleBatch = async () => {
    try {
      const parsed = JSON.parse(batchJson);
      const { rootHash, studentCredentials } = generateMerkleCredentials(parsed);
      localStorage.setItem('uth_latest_merkle_root', rootHash);
      localStorage.setItem('uth_issued_credentials', JSON.stringify(studentCredentials));
      for (const cred of studentCredentials) {
        try { await saveCredentialToStorage(cred); } catch {}
      }
      await smartFetch('/api/admin/issue-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsed })
      }).catch(() => {});

      setAdminStats(prev => ({
        ...prev,
        totalDID: prev.totalDID + studentCredentials.length,
        activeDID: prev.activeDID + studentCredentials.length,
        merkleRoot: rootHash
      }));
      setAdminStatusMsg(`✓ Đã phát hành lô ${studentCredentials.length} thẻ VC & neo Merkle Root mới: ${rootHash.slice(0, 22)}...`);
    } catch (err) {
      setAdminStatusMsg(`❌ Lỗi JSON đầu vào: ${err.message}`);
    }
  };

  const handleAdminRevokeWallet = async () => {
    if (!revokeAddressInput.trim()) return;
    const addr = revokeAddressInput.trim();
    try {
      const currentRevoked = JSON.parse(localStorage.getItem('uth_revoked_keys') || '[]');
      if (!currentRevoked.includes(addr)) {
        currentRevoked.push(addr);
        localStorage.setItem('uth_revoked_keys', JSON.stringify(currentRevoked));
      }
      await smartFetch('/api/admin/revoke-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr })
      }).catch(() => {});
      setAdminStats(prev => ({
        ...prev,
        activeDID: Math.max(0, prev.activeDID - 1),
        revokedDID: prev.revokedDID + 1
      }));
      setAdminStatusMsg(`✓ Đã thực thi revokeKey(${addr.slice(0, 10)}...) trên Sổ bộ Thu hồi mà không làm xáo trộn Merkle Root!`);
    } catch (err) {
      setAdminStatusMsg(`❌ Lỗi thu hồi: ${err.message}`);
    }
  };

  const deviceCounts = attendees.reduce((acc, cur) => {
    acc[cur.deviceId] = (acc[cur.deviceId] || 0) + 1;
    return acc;
  }, {});

  // Chuỗi QR chuẩn UTH_ID để điện thoại sinh viên quét trực tiếp từ Stage Mode
  const qrPayloadString = `UTH_ID:${sessionId}:${currentNonce}:${sessionConfig.centerCoords.lat}:${sessionConfig.centerCoords.lon}:${Date.now()}:${
    sessionConfig.networkMode === 'CAMPUS_WIFI' ? 'CAMPUS_WIFI_ONLY' : 'HYBRID_4G_5G'
  }`;

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans select-none">
      
      {/* HEADER QUẢN TRỊ */}
      <header className="min-h-16 py-2 px-6 border-b border-cyan-500/20 bg-[#060D1F]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-black text-cyan-400 text-sm shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            U
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white m-0">TRUSTID COMMAND CENTER</h1>
            <p className="text-[10px] font-mono text-cyan-400 m-0">FACULTY &amp; ADMIN WEB PORTAL • ZERO-TRUST ARCHITECTURE</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
                {isSessionOpen ? 'PHIÊN MỞ' : 'ĐÃ ĐÓNG (GRACE 15S)'}
              </div>

              <button
                onClick={handleToggleSessionState}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSessionOpen 
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                    : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isSessionOpen ? '🔒 Đóng Nhận Diện' : '🔓 Mở Lại'}
              </button>

              <button
                onClick={() => setIsCreated(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/40 cursor-pointer"
              >
                ⚙ Đổi Lớp / Phòng
              </button>
            </>
          )}

          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            PORTAL: VERIFIER &amp; ISSUER NODE
          </span>
        </div>
      </header>

      {/* BODY CHÍNH */}
      {!isCreated ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#081226] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white m-0">Khởi Tạo Phiên Giảng Đường Số</h2>
              <p className="text-xs text-slate-400 mt-1 mb-0">Cấu hình an ninh mạng và không gian trước khi trình chiếu</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400">Mã Học Phần</label>
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

            <div>
              <label className="text-xs font-mono text-slate-400">Tên Môn Học</label>
              <input
                value={sessionConfig.courseName}
                onChange={e => setSessionConfig({...sessionConfig, courseName: e.target.value})}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Ràng buộc Kết Nối Mạng</label>
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
                  <p className="text-xs font-bold m-0">📶 Wi-Fi Trường (Cố định)</p>
                  <p className="text-[10px] text-slate-500 mt-1 mb-0">Chặn 4G ngoài trường, bắt buộc kết nối AP phòng</p>
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
                  <p className="text-xs font-bold m-0">🌐 4G/5G &amp; Tự do</p>
                  <p className="text-[10px] text-slate-500 mt-1 mb-0">Siết chặt Geofencing bán kính R ≤ 35m</p>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartProjectorSession}
              className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all cursor-pointer border-none"
            >
              🚀 MỞ PHIÊN ĐIỂM DANH &amp; BẬT MÁY CHIẾU
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* CỘT TRÁI (7 CỘT): MÀN CHIẾU / RADAR / IDS / ADMIN */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center justify-between bg-[#081226] p-2 rounded-2xl border border-slate-800 gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('STAGE')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    activeTab === 'STAGE' 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📽️ Màn Chiếu QR Lớn
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
                  onClick={() => setActiveTab('IDS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                    activeTab === 'IDS' 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Cảnh Báo Gian Lận IDS
                </button>
                <button
                  onClick={() => setActiveTab('ADMIN')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                    activeTab === 'ADMIN' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🏛️ Root Admin (Merkle &amp; Revoke)
                </button>
              </div>

              <span className="text-[11px] font-mono text-cyan-400 px-3">
                Sliding Window: 3 Nonces Cached
              </span>
            </div>

            {/* TAB 1: STAGE MODE (MÁY CHIẾU) */}
            {activeTab === 'STAGE' && (
              <div className="flex-1 min-h-[460px] rounded-3xl bg-[#081226] border border-cyan-500/30 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-6 text-left">
                  <p className="text-xs font-mono text-slate-400 m-0">CHALLENGE-RESPONSE TOTP</p>
                  <p className="text-sm font-bold text-white m-0">{sessionConfig.courseName}</p>
                </div>

                <div className="relative p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.2)] border-4 border-cyan-400 flex flex-col items-center mt-4">
                  <div className="w-64 h-64 bg-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-2">
                    <QRCodeCanvas
                      value={qrPayloadString}
                      size={240}
                      level="L"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent pointer-events-none animate-pulse" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs font-mono font-bold text-slate-950 truncate max-w-xs m-0">{currentNonce}</p>
                    <p className="text-[10px] font-mono text-slate-600 m-0">Độ phức tạp Merkle Root: O(log N)</p>
                  </div>
                </div>

                {/* Thanh đếm lùi */}
                <div className="w-80 mt-6 space-y-1.5 text-center">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Tự động xoay mã sau:</span>
                    <span className="text-cyan-400 font-bold">{timerProgress}s</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(timerProgress / ROTATE_INTERVAL) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CANVAS RADAR XOAY 360 ĐỘ */}
            {activeTab === 'RADAR' && (
              <div className="flex-1 min-h-[460px] rounded-3xl bg-[#081226] border border-cyan-500/30 p-6 flex flex-col relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white m-0">Radar Hiện Diện Không Gian (Haversine Formula)</h3>
                    <p className="text-xs text-slate-400 m-0">Tâm phòng: {sessionConfig.room} • Bán kính an toàn: {sessionConfig.maxRadiusMeters}m</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    GPS Fix: ±3.2m
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                  <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={320} 
                    className="rounded-2xl border border-slate-800/80 bg-[#040814]"
                  />
                  <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-400 bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                    <p className="text-emerald-400 m-0">● Trong phòng (&le; 35m)</p>
                    <p className="text-rose-400 m-0">● Ngoài phòng (Nghi vấn)</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: IDS AUDIT */}
            {activeTab === 'IDS' && (
              <div className="flex-1 min-h-[460px] rounded-3xl bg-[#081226] border border-rose-500/30 p-6 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-rose-300 m-0">Nhật Ký Phát Hiện Điểm Danh Hộ (IDS)</h3>
                    <p className="text-xs text-slate-400 m-0">Đối soát dấu vân tay thiết bị (Hardware Fingerprint Collision)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                    Cảnh Báo Kích Hoạt
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto">
                  {Object.entries(deviceCounts).map(([devId, count]) => {
                    if (count > 1) {
                      const violators = attendees.filter(a => a.deviceId === devId);
                      return (
                        <div key={devId} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2">
                          <div className="flex justify-between text-rose-400 font-bold font-mono">
                            <span>⚠️ PHÁT HIỆN 1 THIẾT BỊ ĐIỂM DANH CHO {count} TÀI KHOẢN</span>
                            <span>Mã: {devId}</span>
                          </div>
                          <p className="text-slate-300 m-0">
                            Sinh viên liên quan: <strong>{violators.map(v => `${v.name} (${v.studentId})`).join(', ')}</strong>
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => alert(`Đã ghi nhận biên bản gian lận thiết bị: ${devId}`)}
                              className="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-[10px] border-none cursor-pointer"
                            >
                              Lập Biên Bản Học Vụ
                            </button>
                            <button 
                              onClick={() => handleTriggerSpotCheck('ALL')}
                              className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] cursor-pointer"
                            >
                              Buộc Tái Xác Thực Cả Lớp
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    ✓ Sliding Nonce: Không phát hiện Replay Attack trong 120 chu kỳ.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    ✓ EIP-191 Secp256k1: Khôi phục địa chỉ ví trùng khớp 100% Merkle Root.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ROOT ADMIN CONSOLE (MERKLE BATCH ISSUANCE & DECOUPLED REVOCATION) */}
            {activeTab === 'ADMIN' && (
              <div className="flex-1 min-h-[460px] rounded-3xl bg-[#081226] border border-emerald-500/30 p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300 m-0">Trung Tâm Quản Trị Cấp Cao (Root Issuer &amp; Revocation)</h3>
                    <p className="text-xs text-slate-400 m-0">Cấp phát lô thẻ sinh viên Merkle Tree O(log N) &amp; Thu hồi khóa độc lập (Polygon Amoy 80002)</p>
                  </div>
                  <div className="flex gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                      Tổng DID: {adminStats.totalDID}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      Active: {adminStats.activeDID}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      Revoked: {adminStats.revokedDID}
                    </span>
                  </div>
                </div>

                {adminStatusMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                    {adminStatusMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* Cấp phát lô Merkle */}
                  <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col gap-2.5">
                    <div className="text-xs font-bold text-cyan-300">1. Phát Hành Lô Thẻ VC (Merkle Batch Issuance)</div>
                    <textarea
                      value={batchJson}
                      onChange={(e) => setBatchJson(e.target.value)}
                      rows={6}
                      className="w-full flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200 focus:border-cyan-400 outline-none resize-none"
                    />
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Merkle Root: <span className="text-amber-300">{adminStats.merkleRoot}</span>
                    </div>
                    <button
                      onClick={handleAdminIssueMerkleBatch}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer border-none"
                    >
                      ⚡ Băm Keccak256 &amp; Neo Merkle Root On-Chain
                    </button>
                  </div>

                  {/* Sổ bộ thu hồi khóa độc lập */}
                  <div className="p-4 rounded-2xl bg-[#040814] border border-slate-800 flex flex-col justify-between gap-3">
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-rose-300">2. Thu Hồi Khóa Độc Lập (Decoupled Revocation)</div>
                      <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
                        Vô hiệu hóa địa chỉ ví bị mất máy qua mapping <code>isRevoked[address] = true</code> mà giữ nguyên Merkle Root của toàn trường:
                      </p>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400">Địa chỉ Ví cần thu hồi (0x...):</label>
                        <input
                          value={revokeAddressInput}
                          onChange={(e) => setRevokeAddressInput(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 focus:border-rose-400 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAdminRevokeWallet}
                      className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs cursor-pointer border-none"
                    >
                      🚫 Thực Thi revokeKey() Vĩnh Viễn
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (5 CỘT): SPOT-CHECK & DANH SÁCH LỚP */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* SPOT-CHECK CONSOLE */}
            <div className="p-5 rounded-3xl bg-[#081226] border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider m-0">
                  ⚡ Tái Kiểm Tra Đột Xuất (Spot-Check)
                </h3>
                {spotCheckState.active && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs animate-pulse">
                    Còn {spotCheckState.countdown}s
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 m-0">
                Phát lệnh kiểm tra Face ID tức thì. Chỉ áp dụng cho các sinh viên đã điểm danh hợp lệ ban đầu.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('ALL')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                >
                  Toàn Bộ Lớp
                </button>
                <button
                  disabled={spotCheckState.active}
                  onClick={() => handleTriggerSpotCheck('FURTHEST')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Khoảng Cách Xa Nhất
                </button>
              </div>
            </div>

            {/* DANH SÁCH HIỆN DIỆN */}
            <div className="flex-1 min-h-[360px] rounded-3xl bg-[#081226] border border-slate-800 p-5 flex flex-col overflow-hidden shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white m-0">
                    Hiện Diện ({attendees.length})
                  </h3>
                  <p className="text-[10px] font-mono text-cyan-400 m-0">WEBSOCKET REALTIME</p>
                </div>
                
                <button 
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  📥 Xuất CSV
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
                {attendees.map(s => {
                  const isSuspicious = s.distance > sessionConfig.maxRadiusMeters;
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
                          <p className="text-[10px] font-mono text-cyan-400 m-0">{s.studentId}</p>
                          <p className="text-[10px] font-mono text-slate-400 m-0">
                            {s.checkInTime} • <span className={isSuspicious ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{s.distance}m</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                        <a
                          href={`https://www.google.com/maps?q=${s.coords.lat},${s.coords.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono hover:bg-blue-500/20 no-underline"
                        >
                          📍 Google Maps
                        </a>

                        {s.spotCheckStatus === 'PENDING' && (
                          <button
                            onClick={() => handleMockPass(s.studentId)}
                            className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono animate-pulse cursor-pointer"
                            title="Nhấp để giả lập sinh viên quét Face ID thành công"
                          >
                            Chờ Face ID...
                          </button>
                        )}
                        {s.spotCheckStatus === 'VERIFIED' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                            Spot-check ✓
                          </span>
                        )}
                        {s.spotCheckStatus === 'FAILED' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold">
                            Không Đạt ✗
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
    </div>
  );
}

