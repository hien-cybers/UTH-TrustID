// src/components/ScanBoxEffect.jsx - Khung Ngắm QR Bo Cong Squircle Mềm Mại & Tia Laser Quét Thời Gian Thực
import React from 'react';
import '../styles/animations.css';

export default function ScanBoxEffect() {
  const cornerBase = {
    position: 'absolute',
    width: '34px',
    height: '34px',
    borderColor: '#38BDF8',
    filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.65))'
  };

  return (
    <div
      className="scanner-box"
      style={{
        width: '232px',
        height: '232px',
        margin: '0 auto',
        position: 'relative',
        border: '1.5px solid rgba(123, 189, 232, 0.28)',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, rgba(2, 10, 21, 0.22) 100%)',
        borderRadius: '30px',
        boxShadow: '0 0 28px rgba(56, 189, 248, 0.18), inset 0 0 18px rgba(56, 189, 248, 0.08)',
        pointerEvents: 'none'
      }}
    >
      {/* 4 Góc định vị Bo Cong Mềm Mại (Soft Squircle Brackets 24px - Không Góc Nhọn) */}
      <div
        style={{
          ...cornerBase,
          top: -2,
          left: -2,
          borderTop: '4px solid #38BDF8',
          borderLeft: '4px solid #38BDF8',
          borderTopLeftRadius: '24px'
        }}
      />
      <div
        style={{
          ...cornerBase,
          top: -2,
          right: -2,
          borderTop: '4px solid #38BDF8',
          borderRight: '4px solid #38BDF8',
          borderTopRightRadius: '24px'
        }}
      />
      <div
        style={{
          ...cornerBase,
          bottom: -2,
          left: -2,
          borderBottom: '4px solid #38BDF8',
          borderLeft: '4px solid #38BDF8',
          borderBottomLeftRadius: '24px'
        }}
      />
      <div
        style={{
          ...cornerBase,
          bottom: -2,
          right: -2,
          borderBottom: '4px solid #38BDF8',
          borderRight: '4px solid #38BDF8',
          borderBottomRightRadius: '24px'
        }}
      />

      {/* Tia laser chuyển động lên xuống mượt mà */}
      <div className="laser-line" style={{ borderRadius: '999px' }} />
    </div>
  );
}
