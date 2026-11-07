// src/components/GoogleMapsLiveView.jsx - Bản đồ Google Maps Vệ tinh & Đường phố Thời gian thực (Định vị đa điểm Sinh viên + Vòng bán kính Geofencing Haversine + Google Maps Iframe Embed)
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GoogleMapsLiveView({
  sessionConfig,
  attendees = [],
  focusedStudentId = null,
  onSelectStudent,
  onSyncLaptopGps
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerMapRef = useRef(new Map());

  // 'MULTI_PIN' (Bản đồ Google Maps Đa điểm có vòng bán kính R & tất cả SV) | 'GOOGLE_IFRAME' (Khung nhúng Google Maps Iframe trực tiếp)
  const [viewMode, setViewMode] = useState('MULTI_PIN');
  // 'SATELLITE' (Google Hybrid Vệ tinh + Tên đường: lyrs=y) | 'ROADMAP' (Google Đường phố: lyrs=m)
  const [mapStyle, setMapStyle] = useState('SATELLITE');

  const centerLat = Number(sessionConfig?.centerCoords?.lat || 10.7992);
  const centerLon = Number(sessionConfig?.centerCoords?.lon || 106.7056);
  const maxRadiusMeters = Number(sessionConfig?.maxRadiusMeters || 35);

  const focusedStudent = attendees.find((s) => s.studentId === focusedStudentId) || null;
  const iframeTargetLat = focusedStudent ? Number(focusedStudent.coords?.lat || centerLat) : centerLat;
  const iframeTargetLon = focusedStudent ? Number(focusedStudent.coords?.lon || centerLon) : centerLon;
  const iframeTargetLabel = focusedStudent
    ? `${focusedStudent.name} (${focusedStudent.studentId}) - Cách phòng ${focusedStudent.distance}m`
    : `Tâm phòng học ${sessionConfig?.room || 'A2-301'}`;

  // Khởi tạo bản đồ Leaflet với lớp bản đồ Google Maps chính thức
  useEffect(() => {
    if (viewMode !== 'MULTI_PIN' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 19,
        zoomControl: true,
        attributionControl: false
      });

      const lyrs = mapStyle === 'SATELLITE' ? 'y' : 'm';
      const tileLayer = L.tileLayer(`https://mt1.google.com/vt/lyrs=${lyrs}&hl=vi&x={x}&y={y}&z={z}`, {
        maxZoom: 21,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [viewMode]);

  // Đổi lớp bản đồ Vệ tinh (Hybrid) <-> Đường phố (Roadmap)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const lyrs = mapStyle === 'SATELLITE' ? 'y' : 'm';
    tileLayerRef.current.setUrl(`https://mt1.google.com/vt/lyrs=${lyrs}&hl=vi&x={x}&y={y}&z={z}`);
  }, [mapStyle]);

  // Vẽ lại Tâm phòng học, Vòng tròn Geofencing (R mét), và toàn bộ vị trí Sinh viên
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || viewMode !== 'MULTI_PIN') return;

    layer.clearLayers();
    markerMapRef.current.clear();

    // 1. Vẽ vòng tròn bán kính Geofencing cho phép (R mét)
    L.circle([centerLat, centerLon], {
      radius: maxRadiusMeters,
      color: '#00F2FE',
      weight: 2.5,
      opacity: 0.9,
      fillColor: '#00F2FE',
      fillOpacity: 0.14,
      dashArray: '6, 6'
    })
      .bindTooltip(
        `Vùng Geofencing hợp lệ: R ≤ ${maxRadiusMeters}m (${sessionConfig?.room || 'A2-301'})`,
        { direction: 'top', sticky: true }
      )
      .addTo(layer);

    // 2. Marker Tâm phòng học (Máy chiếu Giảng viên)
    const roomIcon = L.divIcon({
      className: 'uth-room-center-pin',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -50%);
        ">
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: rgba(6, 182, 212, 0.95);
            border: 3px solid #ffffff;
            box-shadow: 0 0 18px rgba(0, 242, 254, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          ">🏫</div>
          <div style="
            margin-top: 3px;
            padding: 2px 6px;
            border-radius: 6px;
            background: rgba(4, 8, 20, 0.92);
            border: 1px solid #00F2FE;
            color: #00F2FE;
            font-family: monospace;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
          ">TÂM ${sessionConfig?.room || 'A2-301'} (0m)</div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker([centerLat, centerLon], { icon: roomIcon })
      .bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 4px;">
            🏫 Tâm Phòng Học: ${sessionConfig?.room || 'A2-301'}
          </div>
          <div style="font-size: 11px; color: #334155; line-height: 1.5;">
            <div><b>Học phần:</b> ${sessionConfig?.courseName || 'An toàn Mạng'}</div>
            <div><b>Tọa độ tâm:</b> ${centerLat.toFixed(6)}, ${centerLon.toFixed(6)}</div>
            <div><b>Bán kính cho phép:</b> R ≤ ${maxRadiusMeters}m</div>
          </div>
        </div>
      `)
      .addTo(layer);

    // 3. Vẽ từng Sinh viên lên Google Maps kèm đường nối tới tâm phòng
    attendees.forEach((s) => {
      const sLat = Number(s.coords?.lat || centerLat);
      const sLon = Number(s.coords?.lon || centerLon);
      const isOutside = Number(s.distance || 0) > maxRadiusMeters;
      const isFocused = s.studentId === focusedStudentId;
      const badgeColor = isOutside ? '#F43F5E' : '#10B981';
      const borderColor = isFocused ? '#00F2FE' : badgeColor;
      const shortName = (s.name || 'SV').split(' ').slice(-2).join(' ');

      // Đường nối từ vị trí Sinh viên tới Tâm phòng học
      L.polyline(
        [
          [centerLat, centerLon],
          [sLat, sLon]
        ],
        {
          color: badgeColor,
          weight: isFocused ? 3 : 2,
          opacity: 0.8,
          dashArray: isOutside ? '4, 6' : null
        }
      ).addTo(layer);

      const studentIcon = L.divIcon({
        className: 'uth-student-map-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            cursor: pointer;
            z-index: ${isFocused ? 999 : 500};
          ">
            <div style="
              width: ${isFocused ? '42px' : '36px'};
              height: ${isFocused ? '42px' : '36px'};
              border-radius: 50%;
              border: 3px solid ${borderColor};
              box-shadow: 0 0 16px ${badgeColor};
              overflow: hidden;
              background: #0f172a;
            ">
              <img
                src="${s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}"
                style="width: 100%; height: 100%; object-fit: cover;"
                alt="${s.name}"
              />
            </div>
            <div style="
              margin-top: 2px;
              padding: 1.5px 6px;
              border-radius: 6px;
              background: ${isOutside ? 'rgba(136, 19, 55, 0.95)' : 'rgba(6, 78, 59, 0.95)'};
              border: 1px solid ${badgeColor};
              color: #ffffff;
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.45);
            ">
              ${isOutside ? '⚠️ ' : '🟢 '}${shortName} (${s.distance}m)
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([sLat, sLon], { icon: studentIcon })
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 220px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <img src="${s.avatar}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" />
              <div>
                <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${s.name}</div>
                <div style="font-family: monospace; font-size: 11px; color: #0284c7; font-weight: 700;">MSSV: ${s.studentId}</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 5px;">
              <div><b>Trạng thái:</b> <span style="color: ${isOutside ? '#e11d48' : '#059669'}; font-weight: 800;">
                ${isOutside ? `Ngoài phòng học (${s.distance}m > ${maxRadiusMeters}m)` : `Trong phòng hợp lệ (${s.distance}m ≤ ${maxRadiusMeters}m)`}
              </span></div>
              <div><b>Tọa độ GPS:</b> ${sLat.toFixed(6)}, ${sLon.toFixed(6)}</div>
              <div><b>Mạng &amp; Thiết bị:</b> ${s.network || '4G/Wi-Fi'} • ${s.deviceId || 'EIP-191'}</div>
              <div><b>Giờ điểm danh:</b> ${s.checkInTime}</div>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 6px;">
              <a
                href="https://www.google.com/maps?q=${sLat},${sLon}"
                target="_blank"
                rel="noreferrer"
                style="
                  flex: 1;
                  text-align: center;
                  padding: 5px 8px;
                  border-radius: 6px;
                  background: #0284c7;
                  color: #ffffff;
                  font-size: 11px;
                  font-weight: 700;
                  text-decoration: none;
                "
              >
                🗺️ Mở Google Maps
              </a>
            </div>
          </div>
        `)
        .on('click', () => {
          if (onSelectStudent) onSelectStudent(s.studentId);
        })
        .addTo(layer);

      markerMapRef.current.set(s.studentId, { marker, lat: sLat, lon: sLon });
    });
  }, [attendees, centerLat, centerLon, maxRadiusMeters, focusedStudentId, viewMode, sessionConfig]);

  // Khi bấm chọn 1 Sinh viên cụ thể -> Bay (flyTo) tới đúng vị trí sinh viên đó và bật Popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || viewMode !== 'MULTI_PIN') return;

    if (focusedStudentId && markerMapRef.current.has(focusedStudentId)) {
      const target = markerMapRef.current.get(focusedStudentId);
      map.flyTo([target.lat, target.lon], 19, { duration: 0.7 });
      setTimeout(() => {
        try {
          target.marker.openPopup();
        } catch {}
      }, 400);
    } else {
      map.flyTo([centerLat, centerLon], 18, { duration: 0.6 });
    }
  }, [focusedStudentId, centerLat, centerLon, viewMode]);

  // Hàm căn chỉnh khung nhìn bao quát tất cả sinh viên + tâm phòng
  const handleFitAllBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const points = [[centerLat, centerLon], ...attendees.map((s) => [Number(s.coords?.lat || centerLat), Number(s.coords?.lon || centerLon)])];
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 19 });
    } else {
      map.flyTo([centerLat, centerLon], 19);
    }
    if (onSelectStudent) onSelectStudent(null);
  };

  return (
    <div className="flex-1 min-h-[480px] rounded-3xl bg-[#081226] border border-cyan-500/30 p-5 flex flex-col gap-3 relative overflow-hidden shadow-2xl">
      {/* Thanh tiêu đề & Bộ công cụ điều khiển Google Maps */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
            <span>🌍 Bản Đồ Định Vị Google Maps Thời Gian Thực (Live Student GPS)</span>
          </h3>
          <p className="text-xs text-slate-400 m-0">
            Tâm phòng: <strong className="text-cyan-300">{sessionConfig?.room}</strong> ({centerLat.toFixed(5)}, {centerLon.toFixed(5)}) • Bán kính Geofencing: <strong className="text-emerald-400">R ≤ {maxRadiusMeters}m</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Chuyển đổi giữa Bản đồ Đa điểm (Tất cả SV + Vòng Geofence) và Google Maps Iframe Nhúng */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('MULTI_PIN')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                viewMode === 'MULTI_PIN'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🛰️ Bản Đồ Đa Điểm ({attendees.length} SV)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('GOOGLE_IFRAME')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-none ${
                viewMode === 'GOOGLE_IFRAME'
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Google Maps Embed
            </button>
          </div>

          {/* Chuyển đổi lớp Vệ tinh / Đường phố */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setMapStyle('SATELLITE')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border-none ${
                mapStyle === 'SATELLITE' ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Vệ Tinh
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('ROADMAP')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border-none ${
                mapStyle === 'ROADMAP' ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Đường Phố
            </button>
          </div>

          <button
            type="button"
            onClick={onSyncLaptopGps}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 cursor-pointer"
            title="Lấy tọa độ GPS thực tế hiện tại của Laptop làm tâm phòng học"
          >
            📍 Lấy GPS Laptop làm tâm
          </button>
        </div>
      </div>

      {/* Khung hiển thị Bản đồ chính */}
      <div className="flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-cyan-500/30 relative bg-[#040814]">
        {viewMode === 'MULTI_PIN' ? (
          <>
            <div ref={mapContainerRef} className="w-full h-full min-h-[320px]" style={{ zIndex: 1 }} />

            {/* Nút điều khiển nhanh nổi trên bản đồ */}
            <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleFitAllBounds}
                className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold shadow-lg hover:bg-slate-900 cursor-pointer"
              >
                🔍 Bao quát tất cả ({attendees.length} SV)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSelectStudent) onSelectStudent(null);
                  mapInstanceRef.current?.flyTo([centerLat, centerLon], 19, { duration: 0.6 });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-200 text-[11px] font-bold shadow-lg hover:bg-slate-900 cursor-pointer"
              >
                🏫 Về tâm phòng {sessionConfig?.room}
              </button>
            </div>

            {/* Chú giải trực quan góc dưới trái */}
            <div className="absolute bottom-3 left-3 z-[400] text-[10.5px] font-mono text-slate-200 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 shadow-lg space-y-0.5">
              <p className="text-cyan-300 font-bold m-0">🏫 Tâm phòng ({sessionConfig?.room}) • Vòng xanh R ≤ {maxRadiusMeters}m</p>
              <p className="text-emerald-400 m-0">🟢 Chấm xanh: Sinh viên trong phòng (&le; {maxRadiusMeters}m)</p>
              <p className="text-rose-400 m-0">⚠️ Chấm đỏ: Sinh viên ngoài bán kính (&gt; {maxRadiusMeters}m)</p>
            </div>
          </>
        ) : (
          <div className="w-full h-full min-h-[320px] flex flex-col relative">
            <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-300 font-bold">
                📌 Đang định vị Google Maps: <span className="text-white">{iframeTargetLabel}</span> ({iframeTargetLat.toFixed(6)}, {iframeTargetLon.toFixed(6)})
              </span>
              <a
                href={`https://www.google.com/maps?q=${iframeTargetLat},${iframeTargetLon}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold no-underline hover:bg-cyan-500/30"
              >
                ↗ Mở Google Maps Toàn Màn Hình
              </a>
            </div>
            <iframe
              title="Google Maps Student Live Locator"
              width="100%"
              height="100%"
              style={{ border: 0, flex: 1, minHeight: '285px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${iframeTargetLat},${iframeTargetLon}&hl=vi&z=19&t=${
                mapStyle === 'SATELLITE' ? 'k' : 'm'
              }&output=embed`}
            />
          </div>
        )}
      </div>

      {/* Thanh định vị nhanh từng Sinh viên trên Bản đồ (Bấm vào tên ai là bản đồ zoom thẳng tới vị trí người đó) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10.5px] font-mono text-slate-400 whitespace-nowrap font-bold">
          🎯 Định vị nhanh SV:
        </span>
        <button
          type="button"
          onClick={() => onSelectStudent && onSelectStudent(null)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
            !focusedStudentId
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          🏫 Tâm {sessionConfig?.room} (0m)
        </button>

        {attendees.map((s) => {
          const isOutside = Number(s.distance || 0) > maxRadiusMeters;
          const isSelected = focusedStudentId === s.studentId;
          return (
            <button
              key={s.studentId}
              type="button"
              onClick={() => onSelectStudent && onSelectStudent(s.studentId)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                  : isOutside
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/50 hover:bg-rose-950/60'
                  : 'bg-slate-950 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
              }`}
            >
              <span>{isOutside ? '🔴' : '🟢'}</span>
              <span>{s.name}</span>
              <span className="opacity-80">({s.distance}m)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
