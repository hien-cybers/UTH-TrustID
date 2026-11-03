// src/pages/FacultyPortalPro.jsx - Cổng Giảng Viên Pro: Tạo/Hủy Mã, Ngày Giờ Thực & Tương Thích Di Động
import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  QrCode, 
  XCircle, 
  Play, 
  Users, 
  MapPin, 
  Wifi, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { io } from 'socket.io-client';
import '../styles/animations.css';

export default function FacultyPortalPro() {
  // 1. Đồng hồ thời gian thực (nhảy từng giây)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Trạng thái phiên điểm danh
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // giây đếm lùi
  const [attendees, setAttendees] = useState([]);
  const [currentNonce, setCurrentNonce] = useState('');
  const socketRef = useRef(null);

  // Kết nối WebSocket Socket.io để nhận diện sinh viên theo thời gian thực
  useEffect(() => {
    try {
      const socket = io(window.location.origin, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('attendance-update', (data) => {
        if (data && data.attendee) {
          setAttendees((prev) => {
            const exists = prev.some(a => a.mssv === data.attendee.studentId);
            if (exists) return prev;
            return [{
              mssv: data.attendee.studentId || '2251120000',
              name: data.attendee.studentName || 'Sinh viên UTH',
              time: new Date().toLocaleTimeString('vi-VN'),
              dist: data.attendee.distance ? `${data.attendee.distance}m` : '8m'
            }, ...prev];
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch {}
  }, []);

  // Đếm lùi tự động hủy/đóng phiên
  useEffect(() => {
    if (!session || timeLeft <= 0) return;
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleCloseSession(true); // Tự động đóng khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [session, timeLeft]);

  // Xoay vòng Nonce định kỳ 15 giây để chống chụp ảnh mã QR
  useEffect(() => {
    if (!session) return;
    const nonceInterval = setInterval(() => {
      const dynamicNonce = "NONCE_" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setCurrentNonce(dynamicNonce);

      // Báo nonce mới lên backend để đối soát
      fetch('/api/attendance/session/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, nonce: dynamicNonce })
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(nonceInterval);
  }, [session]);

  // Tạo phiên mới (vòng đời 5 phút = 300s)
  const handleCreateSession = async () => {
    const initialNonce = "NONCE_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSession = {
      id: "SES_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      nonce: initialNonce,
      createdAt: new Date().toLocaleTimeString('vi-VN'),
      room: "A2-301 (Lab ATTT)",
      lat: 10.7992,
      lon: 106.7056,
      radius: 35
    };

    setSession(newSession);
    setCurrentNonce(initialNonce);
    setTimeLeft(300); // 5 phút
    setAttendees([]);

    // Thông báo cho Backend Express tạo phiên an ninh
    try {
      await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSession.id,
          roomName: newSession.room,
          coords: { lat: newSession.lat, lon: newSession.lon },
          radius: newSession.radius,
          initialNonce: initialNonce,
          networkPolicy: 'HYBRID_4G_5G'
        })
      });
    } catch (e) {
      console.warn("Chạy phiên offline cục bộ:", e);
    }
  };

  // Hủy / Đóng phiên ngay lập tức
  const handleCloseSession = async (isAuto = false) => {
    if (session) {
      try {
        await fetch('/api/attendance/session/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id, locked: true })
        });
      } catch {}
    }

    setSession(null);
    setTimeLeft(0);
    setCurrentNonce('');
    alert(isAuto ? "⏱️ Phiên điểm danh đã hết hạn và tự động đóng!" : "🛑 Đã hủy và đóng phiên điểm danh thành công!");
  };

  // Định dạng chuỗi payload thô cho QR (KHÔNG mang link web)
  const qrRawValue = session 
    ? `UTH_ID:${session.id}:${currentNonce || session.nonce}:${session.lat}:${session.lon}:${Date.now()}`
    : "";

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100dvh',
      background: '#07090E',
      color: '#F8FAFC',
      padding: '16px 14px 90px',
      boxSizing: 'border-box'
    }}>
      
      {/* HEADER + NGÀY GIỜ THỜI GIAN THỰC */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.5px' }}>
            FACULTY CONSOLE • VERIFIER
          </span>
          {/* Đồng hồ nhảy từng giây */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
            <Clock size={13} color="#38BDF8" />
            <span>{currentDateTime.toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
          {currentDateTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 0', color: '#FFF' }}>
          Quản Lý Phiên Điểm Danh
        </h1>
      </div>

      {/* NẾU CHƯA CÓ PHIÊN -> NÚT MỞ PHIÊN */}
      {!session ? (
        <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <QrCode size={24} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#FFF' }}>
            Chưa có phiên quét nào mở
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 18px', lineHeight: 1.45 }}>
            Khởi tạo phiên điểm danh có gắn toạ độ GPS giảng đường và mã QR Nonce xoay vòng tự động đóng sau 5 phút.
          </p>
          <button
            onClick={handleCreateSession}
            className="btn-tactile"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Play size={16} /> Tạo & Mở Phòng Điểm Danh
          </button>
        </div>
      ) : (
        /* KHI PHIÊN ĐANG MỞ: CÓ QR VÀ NÚT HỦY PHIÊN */
        <div>
          <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
            
            {/* Thanh trạng thái thời gian đếm lùi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>Đang nhận diện...</span>
              </div>
              <div style={{ fontSize: '12px', color: '#F59E0B', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                Tự hủy sau: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* MÃ QR ĐIỂM DANH THỜI GIAN THỰC (Payload Thô) */}
            <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', width: 'fit-content', margin: '0 auto 14px' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrRawValue)}`}
                alt="Attendance QR"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', fontFamily: 'JetBrains Mono', marginBottom: '14px' }}>
              ID: {session.id} • Phạm vi: ≤ {session.radius}m • Nonce: {currentNonce.slice(-6)}
            </div>

            {/* NÚT HỦY MÃ / ĐÓNG PHÒNG CHỦ ĐỘNG */}
            <button
              onClick={() => handleCloseSession(false)}
              className="btn-tactile"
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <XCircle size={16} /> Đóng Phòng & Hủy Mã Ngay
            </button>
          </div>

          {/* DANH SÁCH SINH VIÊN ĐÃ ĐIỂM DANH THỜI GIAN THỰC */}
          <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                SINH VIÊN ĐÃ VÀO PHÒNG ({attendees.length})
              </span>
              <button 
                onClick={() => {
                  // Giả lập sinh viên quét thành công vào danh sách
                  setAttendees(prev => [{
                    mssv: "2251120000",
                    name: "Nguyễn Đức Hiển",
                    time: new Date().toLocaleTimeString('vi-VN'),
                    dist: "8m"
                  }, ...prev]);
                }}
                style={{ fontSize: '10.5px', background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: 600 }}
              >
                + Test quét sinh viên
              </button>
            </div>

            {attendees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '11.5px', color: '#64748B' }}>
                Chưa có sinh viên nào quét mã trong phiên này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attendees.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="animate-slide-in"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: '#07090E', 
                      padding: '10px 12px', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Đèn nháy xanh nhẹ */}
                      <span className="pulse-green" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFF' }}>{item.name}</div>
                        <div style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                          {item.mssv} • Cách {item.dist}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#10B981', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                      ✓ {item.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

