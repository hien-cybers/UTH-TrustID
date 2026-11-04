// src/hooks/useAutoLock.js
import { useState, useEffect, useRef } from 'react';
import { App } from '@capacitor/app';

export function useAutoLock(timeoutMs = 30000) { // Mặc định 30 giây
  const [isLocked, setIsLocked] = useState(false);
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    // 1. Lắng nghe trạng thái chạy nền trên Capacitor (iOS / Android)
    let appStateHandle = null;
    try {
      appStateHandle = App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          // Vừa thoát app ra ngoài hoặc mở app khác
          backgroundTimeRef.current = Date.now();
        } else {
          // Quay trở lại app
          if (backgroundTimeRef.current) {
            const elapsed = Date.now() - backgroundTimeRef.current;
            if (elapsed >= timeoutMs) {
              setIsLocked(true); // Khóa phiên làm việc
            }
            backgroundTimeRef.current = null;
          }
        }
      });
    } catch (e) {
      console.warn('Capacitor App plugin không khả dụng, dùng Web visibility fallback.');
    }

    // 2. Fallback cho trình duyệt / WebView chuẩn
    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundTimeRef.current = Date.now();
      } else {
        if (backgroundTimeRef.current) {
          const elapsed = Date.now() - backgroundTimeRef.current;
          if (elapsed >= timeoutMs) {
            setIsLocked(true);
          }
          backgroundTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (appStateHandle && typeof appStateHandle.then === 'function') {
        appStateHandle.then((h) => h.remove()).catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeoutMs]);

  const unlock = () => setIsLocked(false);

  return { isLocked, unlock, lockNow: () => setIsLocked(true) };
}

