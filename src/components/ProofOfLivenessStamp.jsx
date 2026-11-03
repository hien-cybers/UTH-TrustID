// src/components/ProofOfLivenessStamp.jsx - Con Dấu Số Động Chống Gian Lận Chụp Màn Hình (Proof of Liveness)
// Bao gồm: 1. Vòng sóng Radar đồng tâm chuyển động liên tục
//          2. Đồng hồ mili-giây nhảy thời gian thực (HH:MM:SS.mmm)
//          3. Mã Hash động đổi mỗi giây (1s Dynamic Cryptographic Hash)
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export default function ProofOfLivenessStamp({
  studentName = 'NGUYỄN ĐỨC HIỂN',
  mssv = '2251120000',
  sessionId = 'SES_A2301',
  signatureHash = '0x8a4f91c2b7e0...c4e191',
  distance = '8m',
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
      const ms = String(now.getMilliseconds()).padStart(3, '0');
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

  return (
    <div
      className="hero-pass"
      style={{
        width: '100%',
        padding: '15px',
        borderRadius: '20px',
        border: '1px solid rgba(16, 185, 129, 0.48)',
        background: 'linear-gradient(145deg, rgba(6, 78, 59, 0.42) 0%, rgba(10, 14, 23, 0.96) 65%, #04060A 100%)',
        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.22)',
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
          {/* Vòng sóng Radar đồng tâm chuyển động liên tục */}
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
              PROOF OF LIVENESS STAMP
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
              Con dấu sóng Radar chống chụp màn hình
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono',
            color: '#38BDF8',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '2px 7px',
            borderRadius: '10px',
            flexShrink: 0
          }}
        >
          LIVE 100%
        </span>
      </div>

      {/* Đồng hồ Mili-giây + Mã Hash Động Đổi Mỗi Giây (1s) */}
      <div
        style={{
          background: 'rgba(4, 6, 10, 0.82)',
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

      {/* Thông tin Sinh viên & Phiên */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          padding: '7px 10px',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Activity size={13} color="#38BDF8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {studentName} • {mssv}
          </div>
        </div>
        <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: '#10B981', flexShrink: 0 }}>
          {sessionId} ({distance})
        </span>
      </div>

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
