// src/components/LiveClock.jsx - Đồng Hồ Thời Gian Thực Chuẩn Mẫu
import React, { useState, useEffect, memo } from 'react';

const LiveClock = memo(function LiveClock() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1 font-mono text-[11px]">
      <span>🕒</span>
      <span>{currentTime || '23:13:13'}</span>
    </div>
  );
});

export default LiveClock;
