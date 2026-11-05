// src/components/SplashScreen.jsx - Màn Hình Khởi Động Động (Animated Splash Screen)
import React, { useEffect, useState, useRef } from 'react';
import '../styles/splashScreen.css';
import { ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (sessionStorage.getItem('uth_splash_shown') === 'true') {
      if (onFinishRef.current) onFinishRef.current();
      return;
    }
    sessionStorage.setItem('uth_splash_shown', 'true');

    // 1. Sau 0.45 giây thì bắt đầu hiệu ứng tan dần (Fade out & Scale up)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 450);

    // 2. Sau 0.65 giây thì hủy hoàn toàn splash screen khỏi DOM
    const removeTimer = setTimeout(() => {
      if (onFinishRef.current) onFinishRef.current();
    }, 650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className={`splash-container ${fading ? 'splash-hidden' : ''}`}>
      {/* Vòng sóng xung kích tỏa ra */}
      <div className="splash-ring"></div>
      <div className="splash-ring"></div>

      {/* Cụm biểu tượng chuyển động 3D Pop-in */}
      <div className="splash-logo-box">
        <ShieldCheck size={48} color="#FFFFFF" strokeWidth={2.2} />
      </div>

      {/* Tên thương hiệu nhận diện UTH-TrustID */}
      <div className="splash-text-group">
        <div style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.3px',
          textTransform: 'uppercase'
        }}>
          UTH TRUST<span style={{ color: '#38BDF8' }}>ID</span>
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#64748B',
          letterSpacing: '1px',
          marginTop: '4px'
        }}>
          TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM
        </div>
      </div>

      {/* Thanh tiến trình nạp hệ thống mật mã */}
      <div className="splash-loader-bar">
        <div className="splash-loader-fill"></div>
      </div>

      {/* Dòng chữ bản quyền nhỏ dưới đáy */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        fontSize: '10.5px',
        color: '#475569',
        fontFamily: 'monospace'
      }}>
        Decentralized Identity • W3C DID Standard
      </div>
    </div>
  );
}

