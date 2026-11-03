// src/components/UthTrustLogo.jsx - Biểu trưng Nhận Diện UTH-TrustID Vector Nguyên Khối (Không Tràn Viền)
import React from 'react';

export default function UthTrustLogo({ size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: Math.round(size * 0.3),
        background: 'linear-gradient(145deg, #0284C7 0%, #0369A1 55%, #0F172A 100%)',
        border: '1px solid rgba(56, 189, 248, 0.45)',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {/* Viền phản quang chéo tinh tế */}
      <div
        style={{
          position: 'absolute',
          top: -size * 0.35,
          left: -size * 0.35,
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Biểu tượng Khiên Mật Mã Học + Nút Mạng Merkle UTH */}
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', zIndex: 1 }}
      >
        <path
          d="M14 2.2L4.2 6.3V13.4C4.2 19.6 8.38 25.18 14 26.8C19.62 25.18 23.8 19.6 23.8 13.4V6.3L14 2.2Z"
          stroke="#F8FAFC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(56, 189, 248, 0.14)"
        />
        {/* Đường mạch Merkle Node & Tích xác thực */}
        <path
          d="M9.8 14.2L12.7 17.1L18.5 11.3"
          stroke="#38BDF8"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="6.8" r="1.3" fill="#10B981" />
      </svg>
    </div>
  );
}

