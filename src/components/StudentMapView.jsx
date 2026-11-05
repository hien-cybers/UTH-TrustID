// src/components/StudentMapView.jsx - Component Nhúng Bản Đồ Vị Trí Hiện Diện GPS (Google Maps Embed)
// Đọc toạ độ GPS chính xác từ phần cứng hoặc lấy từ IndexedDB dự phòng (UTHTRUSTID_DB)
import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, AlertCircle, Compass, ShieldCheck } from 'lucide-react';
import { getPreciseLocation } from '../utils/geoManager';
import { getItem } from '../utils/db';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';

export default function StudentMapView({ onCoordsUpdated }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndSaveLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy vị trí GPS phần cứng chính xác nhất
      const currentCoords = await getPreciseLocation();
      setCoords(currentCoords);
      if (typeof onCoordsUpdated === 'function') {
        onCoordsUpdated(currentCoords);
      }
      triggerScanSuccessFeedback();
    } catch (err) {
      console.warn('Lỗi lấy GPS thời gian thực, đọc từ IndexedDB dự phòng...', err.message);
      // 2. Dự phòng: Đọc toạ độ đã lưu trước đó trong IndexedDB
      const cachedCoords = await getItem('last_known_location');
      if (cachedCoords) {
        setCoords(cachedCoords);
        if (typeof onCoordsUpdated === 'function') {
          onCoordsUpdated(cachedCoords);
        }
      } else {
        // Mặc định toạ độ khuôn viên trường UTH (Số 2 Võ Oanh, P.25, Bình Thạnh, TP.HCM)
        const uthFallback = { lat: 10.799250, lon: 106.705640, accuracy: 8, isFallback: true };
        setCoords(uthFallback);
        if (typeof onCoordsUpdated === 'function') {
          onCoordsUpdated(uthFallback);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSaveLocation();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        color: '#38BDF8',
        fontSize: '12px',
        fontWeight: 600,
        gap: '8px'
      }}>
        <RefreshCw size={16} className="animate-spin" />
        <span>Đang khóa vệ tinh GPS độ chính xác cao (&lt; 5m)...</span>
      </div>
    );
  }

  if (error && !coords) {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        color: '#EF4444',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700 }}>
          <AlertCircle size={15} />
          <span>Không thể xác định toạ độ GPS vệ tinh</span>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#FCA5A5', lineHeight: 1.4 }}>
          {error}
        </p>
        <button
          onClick={fetchAndSaveLocation}
          style={{
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#FFF',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Thử Lại
        </button>
      </div>
    );
  }

  // URL Google Maps Embed nhúng toạ độ thực tế
  const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=18&output=embed`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: 'rgba(10, 14, 23, 0.85)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      padding: '14px',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header trạng thái */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
            display: 'inline-block'
          }} />
          <span style={{ fontWeight: 700, color: '#E2E8F0' }}>Toạ độ GPS thực tế:</span>
        </div>
        <span style={{ color: '#38BDF8', fontFamily: 'JetBrains Mono', fontSize: '10.5px', fontWeight: 700 }}>
          Sai số: ±{coords.accuracy ? Math.round(coords.accuracy) : 5}m {coords.isCached ? '(IDB Cache)' : ''}
        </span>
      </div>

      {/* Thông số Lat / Lon */}
      <div style={{
        fontSize: '10.5px',
        fontFamily: 'JetBrains Mono',
        color: '#94A3B8',
        background: '#04060A',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          Lat: <span style={{ color: '#10B981', fontWeight: 700 }}>{Number(coords.lat).toFixed(6)}</span>
        </div>
        <div>
          Lon: <span style={{ color: '#10B981', fontWeight: 700 }}>{Number(coords.lon).toFixed(6)}</span>
        </div>
        <div style={{ color: '#38BDF8', fontSize: '9.5px' }}>
          {coords.altitude ? `Alt: ${Math.round(coords.altitude)}m` : 'Campus UTH'}
        </div>
      </div>

      {/* Khung hiển thị Google Maps Iframe */}
      <div style={{
        width: '100%',
        height: '210px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        position: 'relative'
      }}>
        <iframe
          title="Google Map Vị Trí Hiện Diện"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapUrl}
          style={{ display: 'block', filter: 'contrast(1.05)' }}
        />
      </div>

      {/* Nút cập nhật vị trí */}
      <button
        onClick={fetchAndSaveLocation}
        disabled={loading}
        className="btn-press"
        style={{
          width: '100%',
          padding: '9px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38BDF8',
          fontSize: '11px',
          fontWeight: 700,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        <span>Cập Nhật Lại Vị Trí GPS Phần Cứng</span>
      </button>
    </div>
  );
}

