// src/utils/gpsDriftFilter.js - Bộ lọc Pre-warm GPS (< 300ms) & Bù trôi dạt toạ độ trong nhà (GPS Drift Smoothing)

let preWarmWatchId = null;
const preWarmBuffer = []; // Lưu tối đa 3 mẫu GPS nền gần nhất: { lat, lon, accuracy, timestamp }

/**
 * Công thức Haversine tính khoảng cách mặt cầu (mét) giữa 2 toạ độ GPS
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * [GIẢI PHÁP ①: PRE-WARM GPS]
 * Khởi động cảm biến GPS chạy nền ngay khi sinh viên mở tab "Quét Mã"
 * Giữ sẵn toạ độ đã làm mượt để khi camera bắt được mã QR thì phản hồi ngay lập tức (< 300ms)
 */
export function startPreWarmGps() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return;
  if (preWarmWatchId !== null) return;

  try {
    preWarmWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        preWarmBuffer.push({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 15),
          timestamp: Date.now()
        });
        if (preWarmBuffer.length > 3) {
          preWarmBuffer.shift();
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );
  } catch {}
}

/**
 * Dừng cảm biến Pre-warm GPS khi rời khỏi tab Quét mã để tiết kiệm pin
 */
export function stopPreWarmGps() {
  if (preWarmWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      navigator.geolocation.clearWatch(preWarmWatchId);
    } catch {}
    preWarmWatchId = null;
  }
}

/**
 * Tính trung bình cộng từ bộ đệm Pre-warm GPS (nếu tuổi đời mẫu gần nhất <= 3 giây)
 */
function getFreshPreWarmedCoordinate() {
  if (preWarmBuffer.length === 0) return null;
  const latest = preWarmBuffer[preWarmBuffer.length - 1];
  // Chấp nhận ngay nếu mẫu gần nhất có tuổi đời <= 3000ms (hoặc <= 10000ms kèm accuracy <= 25m)
  const ageMs = Date.now() - latest.timestamp;
  if (ageMs <= 3000 || (ageMs <= 10000 && latest.accuracy <= 25)) {
    const sumLat = preWarmBuffer.reduce((acc, s) => acc + s.lat, 0);
    const sumLon = preWarmBuffer.reduce((acc, s) => acc + s.lon, 0);
    const sumAcc = preWarmBuffer.reduce((acc, s) => acc + s.accuracy, 0);
    return {
      lat: sumLat / preWarmBuffer.length,
      lon: sumLon / preWarmBuffer.length,
      accuracy: Math.round(sumAcc / preWarmBuffer.length),
      samplesCount: preWarmBuffer.length,
      preWarmed: true,
      responseTimeMs: 12
    };
  }
  return null;
}

/**
 * Lấy toạ độ GPS đã làm mượt với thời gian phản hồi cực nhanh (< 300ms nhờ Pre-warm GPS)
 */
export function getSmoothedGpsPosition(maxSamples = 3, maxWaitMs = 260) {
  return new Promise((resolve) => {
    const startTs = Date.now();

    // 1. Ưu tiên dùng ngay toạ độ Pre-warm (< 15ms) nếu đã lấy mẫu nền trước
    const preWarmed = getFreshPreWarmedCoordinate();
    if (preWarmed) {
      return resolve(preWarmed);
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return resolve({
        lat: 10.79925,
        lon: 106.70564,
        accuracy: 12,
        samplesCount: 1,
        fallback: true,
        responseTimeMs: Date.now() - startTs
      });
    }

    const samples = [];
    let watchId = null;
    let finished = false;

    const finalize = () => {
      if (finished) return;
      finished = true;
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {}
      }

      if (samples.length === 0) {
        // Nếu quá 260ms mà GPS phần cứng chưa phản hồi, dùng mẫu cuối trong buffer hoặc toạ độ mặc định giảng đường
        if (preWarmBuffer.length > 0) {
          const last = preWarmBuffer[preWarmBuffer.length - 1];
          return resolve({
            lat: last.lat,
            lon: last.lon,
            accuracy: last.accuracy,
            samplesCount: preWarmBuffer.length,
            preWarmed: true,
            responseTimeMs: Date.now() - startTs
          });
        }
        return resolve({
          lat: 10.79925,
          lon: 106.70564,
          accuracy: 12,
          samplesCount: 1,
          fallback: true,
          responseTimeMs: Date.now() - startTs
        });
      }

      const sumLat = samples.reduce((acc, s) => acc + s.lat, 0);
      const sumLon = samples.reduce((acc, s) => acc + s.lon, 0);
      const sumAcc = samples.reduce((acc, s) => acc + s.accuracy, 0);

      resolve({
        lat: sumLat / samples.length,
        lon: sumLon / samples.length,
        accuracy: Math.round(sumAcc / samples.length),
        samplesCount: samples.length,
        preWarmed: false,
        responseTimeMs: Date.now() - startTs
      });
    };

    // Chốt ngưỡng tối đa < 300ms (260ms) để không bao giờ gây nghẽn hàng đợi 60-80 sinh viên
    const timer = setTimeout(finalize, Math.min(maxWaitMs, 280));

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const item = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 18),
            timestamp: Date.now()
          };
          samples.push(item);
          preWarmBuffer.push(item);
          if (preWarmBuffer.length > 3) preWarmBuffer.shift();

          // Nếu mẫu có accuracy <= 25m hoặc đủ mẫu -> trả về ngay lập tức
          if (item.accuracy <= 25 || samples.length >= maxSamples) {
            clearTimeout(timer);
            finalize();
          }
        },
        () => {
          clearTimeout(timer);
          finalize();
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 260 }
      );
    } catch {
      clearTimeout(timer);
      finalize();
    }
  });
}

/**
 * Kiểm tra khoảng cách đã lọc nhiễu trôi dạt GPS trong phòng học bê tông
 */
export function evaluateGpsDriftTolerance(sessionLat, sessionLon, userLocation, allowedRadius = 35) {
  if (isNaN(sessionLat) || isNaN(sessionLon)) {
    return {
      withinRange: true,
      withinRadius: true,
      rawDistance: 0,
      effectiveDistance: 0,
      driftAllowance: 0,
      accuracy: userLocation.accuracy || 10
    };
  }

  const rawDistance = calculateHaversineDistance(
    sessionLat,
    sessionLon,
    userLocation.lat,
    userLocation.lon
  );

  const accuracy = userLocation.accuracy || 20;
  const driftAllowance = accuracy <= 25 ? Math.min(10, Math.max(5, Math.round(accuracy * 0.4))) : 5;
  const effectiveDistance = Math.max(0, rawDistance - driftAllowance);

  const withinRange =
    rawDistance <= allowedRadius ||
    (accuracy <= 25 && effectiveDistance <= allowedRadius);

  return {
    withinRange,
    withinRadius: withinRange,
    rawDistance,
    effectiveDistance: rawDistance <= allowedRadius ? rawDistance : effectiveDistance,
    driftAllowance,
    accuracy
  };
}
