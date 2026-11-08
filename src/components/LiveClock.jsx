// src/components/LiveClock.jsx - Component Đồng Hồ Thời Gian Thực Độc Lập (React.memo)
// Tách biệt hoàn toàn state nhảy từng giây khỏi App.jsx / ScanPage.jsx để KHÔNG gây re-render luồng Camera trên iOS Safari
import React, { useState, useEffect, memo } from 'react';
import { Clock } from 'lucide-react';

const LiveClock = memo(function LiveClock({ showIcon = true, style = {} }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '10.5px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#E0F2FE',
        background: 'rgba(3, 13, 27, 0.85)',
        padding: '4px 10px',
        borderRadius: '999px',
        border: '1px solid rgba(123, 189, 232, 0.28)',
        fontWeight: 600,
        ...style
      }}
    >
      {showIcon && <Clock size={11} color="#38BDF8" />}
      <span>{currentTime.toLocaleTimeString('vi-VN', { hour12: false })}</span>
    </div>
  );
});

export default LiveClock;

