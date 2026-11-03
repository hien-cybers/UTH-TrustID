// src/components/ScanBoxEffect.jsx - Khung Ngắm Radar & Tia Laser Quét Thời Gian Thực
import React from 'react';
import '../styles/animations.css';

export default function ScanBoxEffect() {
  return (
    <div className="scanner-box" style={{
      width: '240px',
      height: '240px',
      margin: '0 auto',
      position: 'relative',
      border: '2px dashed rgba(56, 189, 248, 0.4)',
      background: 'rgba(0, 0, 0, 0.25)',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
      pointerEvents: 'none'
    }}>
      {/* 4 Góc định vị máy quét chuẩn ngân hàng */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTop: '3.5px solid #38BDF8', borderLeft: '3.5px solid #38BDF8', borderTopLeftRadius: '6px' }}></div>
      <div style={{ position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTop: '3.5px solid #38BDF8', borderRight: '3.5px solid #38BDF8', borderTopRightRadius: '6px' }}></div>
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottom: '3.5px solid #38BDF8', borderLeft: '3.5px solid #38BDF8', borderBottomLeftRadius: '6px' }}></div>
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottom: '3.5px solid #38BDF8', borderRight: '3.5px solid #38BDF8', borderBottomRightRadius: '6px' }}></div>

      {/* Tia laser chuyển động lên xuống */}
      <div className="laser-line"></div>
    </div>
  );
}
