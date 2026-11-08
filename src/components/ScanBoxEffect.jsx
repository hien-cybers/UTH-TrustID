// src/components/ScanBoxEffect.jsx - Khung Ngắm Radar & Tia Laser Quét Thời Gian Thực (Đồng Bộ Mint-Cyan Bo Góc Mềm Mại)
import React from 'react';
import '../styles/animations.css';

export default function ScanBoxEffect() {
  return (
    <div className="scanner-box" style={{
      width: '240px',
      height: '240px',
      margin: '0 auto',
      position: 'relative',
      border: '2px dashed rgba(79, 240, 214, 0.45)',
      background: 'rgba(5, 11, 22, 0.35)',
      borderRadius: '22px',
      boxShadow: '0 0 24px rgba(79, 240, 214, 0.16)',
      pointerEvents: 'none'
    }}>
      {/* 4 Góc định vị máy quét bo tròn mềm mại */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 22, height: 22, borderTop: '3.5px solid #4FF0D6', borderLeft: '3.5px solid #4FF0D6', borderTopLeftRadius: '10px' }}></div>
      <div style={{ position: 'absolute', top: -1, right: -1, width: 22, height: 22, borderTop: '3.5px solid #4FF0D6', borderRight: '3.5px solid #4FF0D6', borderTopRightRadius: '10px' }}></div>
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 22, height: 22, borderBottom: '3.5px solid #4FF0D6', borderLeft: '3.5px solid #4FF0D6', borderBottomLeftRadius: '10px' }}></div>
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 22, height: 22, borderBottom: '3.5px solid #4FF0D6', borderRight: '3.5px solid #4FF0D6', borderBottomRightRadius: '10px' }}></div>

      {/* Tia laser chuyển động lên xuống */}
      <div className="laser-line"></div>
    </div>
  );
}
