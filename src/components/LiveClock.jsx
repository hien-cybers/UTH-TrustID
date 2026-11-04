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
        gap: '4px',
        fontSize: '10.5px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#94A3B8',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '3px 7px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        ...style
      }}
    >
      {showIcon && <Clock size={11} color="#38BDF8" />}
      <span>{currentTime.toLocaleTimeString('vi-VN', { hour12: false })}</span>
    </div>
  );
});

export default LiveClock;
