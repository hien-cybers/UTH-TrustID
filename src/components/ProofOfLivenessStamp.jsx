// src/components/ProofOfLivenessStamp.jsx - Con Dấu Số Động & Đối Soát Trực Quan (Visual Liveness Stamp)
// Chống kịch bản Ủy quyền phần cứng vật lý (Sinh viên A cầm hộ máy của Sinh viên B):
// 1. Hiển thị Ảnh hồ sơ số (VC Avatar) + Họ tên & MSSV cỡ lớn để giảng viên đối soát trực quan tại bàn
// 2. Huy hiệu xác thực Sinh trắc học cục bộ (WebAuthn FaceID / TouchID Verified)
// 3. Vòng sóng Radar đồng tâm + Đồng hồ mili-giây thực (HH:MM:SS.mmm) + Dynamic Hash đổi mỗi 1s
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, AlertTriangle } from 'lucide-react';

export default function ProofOfLivenessStamp({
  studentName = 'NGUYỄN ĐỨC HIỂN',
  mssv = '2251120000',
  sessionId = 'SES_A2301',
  signatureHash = '0x8a4f91c2b7e0...c4e191',
  distance = '8m',
  biometricVerified = true,
  proximityWarning = null,
  onClose
}) {
  const [liveTimeMs, setLiveTimeMs] = useState('');
  const [dynamicHash1s, setDynamicHash1s] = useState('0x9f4a82c1...e01b');
  const [wavePhase, setWavePhase] = useState(0);

  // 1. Đồng hồ chạy liên tục đến cấp độ mili-giây (40ms/frame) + Sóng Radar
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).toString().padStart(3, '0');
      setLiveTimeMs(`${hh}:${mm}:${ss}.${ms}`);
      setWavePhase((p) => (p + 15) % 360);
    }, 40);

    return () => clearInterval(tick);
  }, []);

  // 2. Mã Hash động thay đổi liên tục mỗi 1 giây (1000ms)
  useEffect(() => {
    const updateOneSecondHash = () => {
      const randHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setDynamicHash1s(`0x${randHex.slice(0, 8)}...${randHex.slice(-4)}`);
    };
    updateOneSecondHash();
    const hashInterval = setInterval(updateOneSecondHash, 1000);
    return () => clearInterval(hashInterval);
  }, []);

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=0284c7,0369a1&fontWeight=700`;

  return (
    <div
      className="hero-pass"
      style={{
        width: '100%',
        padding: '15px',
        borderRadius: '20px',
        border: proximityWarning ? '1px solid rgba(245, 158, 11, 0.65)' : '1px solid rgba(16, 185, 129, 0.48)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes livenessRadarExpand {
          0% { transform: scale(0.75); opacity: 0.9; }
          100% { transform: scale(2.15); opacity: 0; }
        }
      `}</style>

      {/* Header Con Dấu Động + Vòng Sóng Radar Đồng Tâm */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              position: 'relative',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <span
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1.5px solid #10B981',
                animation: 'livenessRadarExpand 1.6s infinite ease-out'
              }}
            />
            <span
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1.5px solid #38BDF8',
                animation: 'livenessRadarExpand 1.6s infinite ease-out 0.8s'
              }}
            />
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              <ShieldCheck size={13} color="#10B981" />
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#10B981',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              VISUAL LIVENESS STAMP
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
              Chống chụp màn hình & Chống cầm máy điểm danh hộ
            </div>
          </div>
        </div>

        {/* Huy hiệu Sinh trắc học WebAuthn (Tầng 1) */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono',
            color: biometricVerified ? '#10B981' : '#38BDF8',
            background: biometricVerified ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.12)',
            border: biometricVerified ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(56, 189, 248, 0.3)',
            padding: '3px 7px',
            borderRadius: '10px',
            flexShrink: 0
          }}
        >
          <Fingerprint size={11} />
          <span>FaceID/TouchID</span>
        </span>
      </div>

      {/* TẦNG 2 NGHIỆP VỤ: HỌ TÊN + MSSV CỠ LỚN KÈM ẢNH HỒ SƠ SỐ (VC AVATAR) ĐỐI SOÁT TẠI CHỖ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '14px',
          padding: '10px 12px',
          marginBottom: '10px'
        }}
      >
        <img
          src={avatarUrl}
          alt={studentName}
          style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            border: '1.5px solid #38BDF8',
            flexShrink: 0,
            objectFit: 'cover'
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '9px', color: 'var(--tone-sky)', fontWeight: 700, letterSpacing: '0.4px' }}>
            HỒ SƠ ĐỐI SOÁT TRỰC QUAN (VC HOLDER)
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '1px'
            }}
          >
            {studentName}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#10B981' }}>
              MSSV: {mssv}
            </span>
            <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              {sessionId} ({distance})
            </span>
          </div>
        </div>
      </div>

      {/* Đồng hồ Mili-giây + Mã Hash Động Đổi Mỗi Giây (1s) */}
      <div
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid rgba(16, 185, 129, 0.32)',
          borderRadius: '14px',
          padding: '10px 12px',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>
              ĐỒNG HỒ MILI-GIÂY THỰC
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: '#10B981',
                letterSpacing: '0.4px',
                marginTop: '2px'
              }}
            >
              {liveTimeMs}
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700 }}>
              DYNAMIC HASH (ĐỔI MỖI 1S)
            </div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: '#38BDF8',
                marginTop: '3px',
                whiteSpace: 'nowrap'
              }}
            >
              {dynamicHash1s}
            </div>
          </div>
        </div>
      </div>

      {/* TẦNG 3 TELEMETRY: Cảnh báo nếu phát hiện va chạm vi thời gian (Micro-time Proximity Collision) */}
      {proximityWarning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            background: 'var(--tint-amber)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '10px',
            padding: '8px 10px',
            marginBottom: '8px',
            fontSize: '10px',
            color: 'var(--tone-amber)',
            lineHeight: 1.4
          }}
        >
          <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Cảnh báo IDS [{proximityWarning.alert}]:</strong> {proximityWarning.detail}
          </div>
        </div>
      )}

      {/* Sóng hài chuyển động liên tục theo frame */}
      <svg width="100%" height="20" viewBox="0 0 280 20" style={{ display: 'block', marginBottom: '6px' }}>
        <path
          d={`M 0 10 Q 35 ${10 + Math.sin((wavePhase * Math.PI) / 180) * 8}, 70 10 T 140 10 T 210 10 T 280 10`}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeOpacity="0.88"
        />
        <path
          d={`M 0 10 Q 35 ${10 - Math.cos((wavePhase * Math.PI) / 180) * 6}, 70 10 T 140 10 T 210 10 T 280 10`}
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.3"
          strokeOpacity="0.65"
        />
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9.5px',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono'
        }}
      >
        <span>EIP-191: {signatureHash}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38BDF8',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Thu gọn
          </button>
        )}
      </div>
    </div>
  );
}
