// src/components/ProofOfLivenessStamp.jsx - Con Dấu Số Động Chống Gian Lận Chụp Màn Hình (Proof of Liveness)
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Radio, Lock } from 'lucide-react';

export default function ProofOfLivenessStamp({
  studentName = 'NGUYỄN ĐỨC HIỂN',
  mssv = '2251120000',
  sessionId = 'SES_A2301',
  signatureHash = '0x8a4f91c2b7e0...c4e191',
  distance = '8m',
  onClose
}) {
  const [liveTimeMs, setLiveTimeMs] = useState('');
  const [rollingOtp, setRollingOtp] = useState('749-281');
  const [rollingProgress, setRollingProgress] = useState(100);
  const [wavePhase, setWavePhase] = useState(0);

  // Đồng hồ chạy liên tục đến cấp độ mili-giây (45ms/frame) chống chụp màn hình
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setLiveTimeMs(`${hh}:${mm}:${ss}.${ms}`);

      const secMod = (now.getTime() % 5000) / 5000;
      setRollingProgress(Math.round((1 - secMod) * 100));
      setWavePhase((p) => (p + 14) % 360);
    }, 45);

    return () => clearInterval(tick);
  }, []);

  // Sinh mã OTP bảo mật động mỗi 5 giây
  useEffect(() => {
    const generateToken = () => {
      const p1 = Math.floor(100 + Math.random() * 900);
      const p2 = Math.floor(100 + Math.random() * 900);
      setRollingOtp(`${p1}-${p2}`);
    };
    generateToken();
    const otpTimer = setInterval(generateToken, 5000);
    return () => clearInterval(otpTimer);
  }, []);

  return (
    <div
      className="hero-pass"
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: '20px',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        background: 'linear-gradient(145deg, rgba(6, 78, 59, 0.38) 0%, rgba(10, 14, 23, 0.96) 65%, #04060A 100%)',
        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dải Hologram Chuyển Động Chống Chụp Ảnh Tĩnh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 10px #10B981',
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#10B981',
              letterSpacing: '0.6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            LIVE PROOF-OF-LIVENESS STAMP
          </span>
        </div>

        <span
          style={{
            fontSize: '9.5px',
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
          ANTI-SCREENSHOT
        </span>
      </div>

      {/* Đồng hồ Micro-giây + Mã OTP Động */}
      <div
        style={{
          background: 'rgba(4, 6, 10, 0.78)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
          padding: '10px 12px',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 700 }}>
              ĐỒNG HỒ THỜI GIAN THỰC (MS)
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: '#10B981',
                letterSpacing: '0.5px',
                marginTop: '2px'
              }}
            >
              {liveTimeMs}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 700 }}>
              DYNAMIC TOKEN (5S)
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: '#38BDF8',
                marginTop: '2px'
              }}
            >
              {rollingOtp}
            </div>
          </div>
        </div>

        {/* Thanh tiến trình xoay vòng 5 giây */}
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '8px'
          }}
        >
          <div
            style={{
              width: `${rollingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10B981, #38BDF8)',
              transition: 'width 0.05s linear'
            }}
          />
        </div>
      </div>

      {/* Dải Sóng Radar Động (Dynamic SVG Waveform) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          padding: '7px 10px',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Activity size={14} color="#38BDF8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {studentName} • {mssv}
          </div>
        </div>
        <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: '#10B981', flexShrink: 0 }}>
          {sessionId} ({distance})
        </span>
      </div>

      {/* Sóng hài chuyển động liên tục theo frame */}
      <svg width="100%" height="22" viewBox="0 0 280 22" style={{ display: 'block', marginBottom: '6px' }}>
        <path
          d={`M 0 11 Q 35 ${11 + Math.sin((wavePhase * Math.PI) / 180) * 9}, 70 11 T 140 11 T 210 11 T 280 11`}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeOpacity="0.85"
        />
        <path
          d={`M 0 11 Q 35 ${11 - Math.cos((wavePhase * Math.PI) / 180) * 7}, 70 11 T 140 11 T 210 11 T 280 11`}
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
        <span>SIG: {signatureHash}</span>
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
