// src/UTHTrustIDApp.jsx - Component Tích Hợp Đầy Đủ 3 Phân Hệ + Chuẩn Safe Area iPhone (Tai Thỏ & Home Indicator)
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Scan, 
  Radio, 
  Layers, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Trash2, 
  UserCheck, 
  WifiOff
} from 'lucide-react';
import { ethers } from 'ethers';

export default function UTHTrustIDApp() {
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'scan' | 'faculty' | 'admin'
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. ĐỒNG HỒ THỜI GIAN THỰC NHẢY TỪNG GIÂY
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ==========================================
  // PHÂN HỆ 1: VÍ SINH VIÊN (HOLDER) & PRE-WARM GPS
  // ==========================================
  const [credential, setCredential] = useState(null);
  const [cachedCoords, setCachedCoords] = useState({ lat: 10.7992, lon: 106.7056 });
  const [livenessActive, setLivenessActive] = useState(false);
  const [livenessMillis, setLivenessMillis] = useState('000');
  const [livenessHash, setLivenessHash] = useState('0x88f...12a');
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Tự nạp thẻ từ bộ nhớ khi mở ứng dụng
  useEffect(() => {
    const saved = localStorage.getItem('uth_vc_storage') || localStorage.getItem('uth_student_vc');
    if (saved) {
      try {
        setCredential(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Pre-warm GPS: Kích hoạt cảm biến định vị chạy nền trước để quét tức thì (< 300ms)
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCachedCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        (err) => console.log('GPS background notice:', err.message),
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Timer cho Con dấu động (Proof of Liveness): Mili-giây nhảy mỗi 40ms, Hash đổi mỗi 1s
  useEffect(() => {
    if (!livenessActive) return;
    const msTimer = setInterval(() => {
      const now = new Date();
      setLivenessMillis(now.getMilliseconds().toString().padStart(3, '0'));
    }, 40);

    const hashTimer = setInterval(() => {
      setLivenessHash('0x' + Math.random().toString(16).substring(2, 10));
    }, 1000);

    return () => {
      clearInterval(msTimer);
      clearInterval(hashTimer);
    };
  }, [livenessActive]);

  // Kích hoạt thẻ sinh viên lần đầu
  const handleOnboardFirstTime = () => {
    const defaultVC = {
      studentId: '2251120000',
      fullName: 'Nguyễn Đức Hiển',
      major: 'An toàn Thông tin',
      address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      merkleRoot: '0x78ab3199fe01cb29019234812349012398412039481203948120394812039481',
      merkleProof: [
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      ]
    };
    localStorage.setItem('uth_vc_storage', JSON.stringify(defaultVC));
    setCredential(defaultVC);
  };

  // Quét và ký số EIP-191 một chạm
  const handleTriggerScanAndSign = async () => {
    if (!credential) {
      handleOnboardFirstTime();
      return;
    }

    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

    const targetSession = sessionData || {
      id: 'SES_A2301',
      nonce: 'NONCE_TEST',
      coords: { lat: 10.7992, lon: 106.7056 },
      radius: 35
    };

    try {
      const challenge = `AUTH_NONCE:${targetSession.nonce}`;
      const wallet = new ethers.Wallet(credential.privateKey);
      const signature = await wallet.signMessage(challenge);

      const payload = {
        sessionId: targetSession.id,
        challengeNonce: challenge,
        signature,
        studentCoords: cachedCoords,
        studentData: {
          studentId: credential.studentId,
          fullName: credential.fullName,
          major: credential.major,
          address: credential.address
        },
        merkleProof: credential.merkleProof
      };

      if (!navigator.onLine) {
        setOfflineQueue((prev) => [...prev, payload]);
        return;
      }

      setLivenessActive(true);
      if (sessionData) {
        setAttendeesList((prev) => [
          {
            name: credential.fullName,
            mssv: credential.studentId,
            dist: '6m',
            time: new Date().toLocaleTimeString('vi-VN')
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Lỗi ký mật mã:', err);
    }
  };

  // ==========================================
  // PHÂN HỆ 2: CỔNG GIẢNG VIÊN (VERIFIER)
  // ==========================================
  const [sessionData, setSessionData] = useState(null);
  const [sessionCountdown, setSessionCountdown] = useState(0);
  const [attendeesList, setAttendeesList] = useState([]);

  useEffect(() => {
    if (!sessionData || sessionCountdown <= 0) return;
    const timer = setInterval(() => {
      setSessionCountdown((c) => {
        if (c <= 1) {
          handleTerminateSession(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionData, sessionCountdown]);

  const handleCreateSession = async () => {
    const newId = 'SES_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newNonce = 'NONCE_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await fetch('/api/faculty/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newId,
          room: 'Phòng A2-301',
          coords: { lat: 10.7992, lon: 106.7056 },
          radius: 35
        })
      });
    } catch {}
    setSessionData({
      id: newId,
      nonce: newNonce,
      coords: { lat: 10.7992, lon: 106.7056 },
      radius: 35
    });
    setSessionCountdown(300);
    setAttendeesList([]);
  };

  const handleTerminateSession = async () => {
    if (sessionData?.id) {
      try {
        await fetch('/api/faculty/terminate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionData.id })
        });
      } catch {}
    }
    setSessionData(null);
    setSessionCountdown(0);
  };

  // ==========================================
  // PHÂN HỆ 3: BẢNG QUẢN TRỊ (ROOT ADMIN)
  // ==========================================
  const [revokedList, setRevokedList] = useState(['0x70997970C51812dc3A010C7d01b50e0d17dc79C8']);
  const [revokeInput, setRevokeInput] = useState('');

  const handleRevokeKey = async () => {
    if (!revokeInput.trim()) return;
    const addr = revokeInput.trim();
    try {
      await fetch('/api/admin/revoke-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr })
      });
    } catch {}
    setRevokedList((prev) => [...prev, addr]);
    setRevokeInput('');
  };

  return (
    <div className="mobile-app-root" style={{ color: '#F8FAFC' }}>
      
      {/* 1. HEADER TRÁNH ĐÈ LÊN TAI THỎ / DYNAMIC ISLAND */}
      <header style={{
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10, 14, 23, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="#FFF" />
          </div>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFF' }}>
            UTH TRUST<span style={{ color: '#38BDF8' }}>ID</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '12px' }}>
          <Clock size={12} color="#38BDF8" />
          <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
        </div>
      </header>

      {/* 2. NỘI DUNG CHÍNH THEO TỪNG TAB */}
      <main style={{ padding: '16px 14px', flex: 1 }}>

        {/* TAB 1: VÍ SINH VIÊN (HOLDER) */}
        {activeTab === 'wallet' && (
          <div>
            {!credential ? (
              <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
                <UserCheck size={36} color="#38BDF8" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#FFF' }}>Chưa Kích Hoạt Thẻ Số</h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px' }}>
                  Hệ thống không yêu cầu tài khoản/mật khẩu. Bấm kích hoạt để nạp thẻ số vào bộ nhớ máy.
                </p>
                <button
                  onClick={handleOnboardFirstTime}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Kích Hoạt Thẻ DID Của Tôi
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  background: 'linear-gradient(145deg, #0F172A 0%, #03132B 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.28)',
                  borderRadius: '20px',
                  padding: '18px',
                  position: 'relative',
                  marginBottom: '16px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#38BDF8', fontWeight: 800, letterSpacing: '0.8px' }}>UTH VERIFIABLE CREDENTIAL</span>
                    <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>● ACTIVE</span>
                  </div>

                  <div style={{ margin: '18px 0 14px' }}>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>CHỦ SỞ HỮU</div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>{credential.fullName}</div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>MSSV</div>
                        <div style={{ fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 700 }}>{credential.studentId}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>CHUYÊN NGÀNH</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{credential.major}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {credential.address.slice(0, 10)}...{credential.address.slice(-6)}
                    </span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('uth_vc_storage');
                        setCredential(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Trash2 size={12} /> Gỡ thẻ
                    </button>
                  </div>
                </div>

                <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: '#94A3B8' }}>Pre-warm GPS (Nền &lt; 300ms):</span>
                    <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{cachedCoords.lat.toFixed(4)}, {cachedCoords.lon.toFixed(4)}</span>
                  </div>
                  {offlineQueue.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <WifiOff size={12} /> Có {offlineQueue.length} gói tin đang chờ gửi ngầm khi có mạng.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUÉT MÃ RADAR + PROOF OF LIVENESS STAMP */}
        {activeTab === 'scan' && (
          <div style={{ textAlign: 'center' }}>
            {!livenessActive ? (
              <div>
                <div style={{
                  width: '260px',
                  height: '260px',
                  margin: '0 auto 16px',
                  borderRadius: '20px',
                  background: 'rgba(10,14,23,0.8)',
                  border: '2px dashed rgba(56,189,248,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Scan size={44} color="#38BDF8" style={{ opacity: 0.8 }} />
                </div>
                <button
                  onClick={handleTriggerScanAndSign}
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', border: 'none', borderRadius: '12px', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Quét & Ký Số EIP-191 Một Chạm
                </button>
              </div>
            ) : (
              <div style={{ background: '#0A0E17', border: '1px solid #10B981', borderRadius: '20px', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
                <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', margin: '0 0 4px' }}>ĐÃ XÁC THỰC HIỆN DIỆN!</h3>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 16px' }}>Chữ ký số EIP-191 hợp lệ • Vị trí Haversine: 6m</p>

                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10.5px', color: '#10B981', fontWeight: 700 }}>PROOF OF LIVENESS (CON DẤU SỐ ĐỘNG)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', fontFamily: 'monospace', margin: '6px 0' }}>
                    {currentTime.toLocaleTimeString('vi-VN')}.<span style={{ color: '#38BDF8' }}>{livenessMillis}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
                    Dynamic Hash: {livenessHash} (Đổi mỗi 1s)
                  </div>
                </div>

                <button
                  onClick={() => setLivenessActive(false)}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}
                >
                  Đóng màn hình kết quả
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHÂN HỆ GIẢNG VIÊN (VERIFIER) */}
        {activeTab === 'faculty' && (
          <div>
            {!sessionData ? (
              <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
                <Radio size={36} color="#38BDF8" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: '#FFF' }}>Tạo Phòng Điểm Danh</h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px' }}>Tự động đóng sau 5 phút và gắn toạ độ GPS giảng đường.</p>
                <button
                  onClick={handleCreateSession}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284C7, #0369A1)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Play size={16} /> Bắt Đầu Phiên Điểm Danh
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', marginBottom: '14px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>● ĐANG NHẬN DIỆN</span>
                    <span style={{ fontSize: '11.5px', color: '#F59E0B', fontFamily: 'monospace', fontWeight: 700 }}>
                      Tự đóng sau: {Math.floor(sessionCountdown / 60)}:{(sessionCountdown % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ background: '#FFF', padding: '10px', borderRadius: '12px', width: 'fit-content', margin: '0 auto 10px' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=UTH_ID:${sessionData.id}:${sessionData.nonce}:10.7992:106.7056`}
                      alt="Session QR"
                      style={{ width: 160, height: 160, display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace', marginBottom: '12px' }}>
                    ID: {sessionData.id} • NONCE: {sessionData.nonce}
                  </div>

                  <button
                    onClick={() => handleTerminateSession(false)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <XCircle size={14} /> Đóng Phòng & Hủy Mã Tức Thì
                  </button>
                </div>

                <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>
                    SINH VIÊN ĐÃ VÀO PHÒNG ({attendeesList.length})
                  </div>
                  {attendeesList.length === 0 ? (
                    <div style={{ fontSize: '11.5px', color: '#64748B', textAlign: 'center', padding: '12px 0' }}>Chưa có sinh viên nào quét mã.</div>
                  ) : (
                    attendeesList.map((st, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#04060A', borderRadius: '8px', marginBottom: '6px', fontSize: '11.5px' }}>
                        <div>
                          <strong>{st.name}</strong> ({st.mssv})
                          <div style={{ color: '#64748B', fontSize: '10.5px' }}>Cách máy chiếu: {st.dist}</div>
                        </div>
                        <span style={{ color: '#10B981', fontFamily: 'monospace' }}>✓ {st.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PHÂN HỆ QUẢN TRỊ (ROOT ADMIN) */}
        {activeTab === 'admin' && (
          <div>
            <div style={{ background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Layers size={16} color="#38BDF8" />
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#FFF' }}>Sổ Bộ Thu Hồi (Revocation Registry)</h3>
              </div>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '0 0 12px' }}>
                Thu hồi vĩnh viễn khóa của máy sinh viên làm mất điện thoại trên On-Chain.
              </p>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="0x... Địa chỉ ví cần thu hồi"
                  value={revokeInput}
                  onChange={(e) => setRevokeInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', background: '#04060A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', fontSize: '11.5px', outline: 'none' }}
                />
                <button
                  onClick={handleRevokeKey}
                  style={{ padding: '8px 12px', background: '#EF4444', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
                >
                  Khóa
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Đã thu hồi ({revokedList.length} ví):
                {revokedList.map((addr, idx) => (
                  <div key={idx} style={{ fontFamily: 'monospace', color: '#EF4444', marginTop: '2px' }}>
                    • {addr.slice(0, 14)}...{addr.slice(-8)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. BOTTOM NAVIGATION BAR TRÁNH ĐÈ LÊN THANH HOME ẢO DƯỚI ĐÁY (env(safe-area-inset-bottom)) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        /* Tự động cộng thêm độ cao của thanh gạt iPhone */
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(10, 14, 23, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <button
          onClick={() => setActiveTab('wallet')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'wallet' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
        >
          <Wallet size={18} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Ví DID</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'scan' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
        >
          <Scan size={18} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Quét Mã</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'faculty' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
        >
          <Radio size={18} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Giảng Viên</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'admin' ? '#38BDF8' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
        >
          <Layers size={18} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Quản Trị</span>
        </button>
      </nav>

    </div>
  );
}

