// src/utils/gpsDriftFilter.js - Bộ lọc làm mượt độ trôi dạt toạ độ GPS trong giảng đường bê tông (GPS Drift Smoothing)

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
 * Lấy trung bình cộng của tối đa 3 mẫu toạ độ liên tiếp trong 2 giây
 * hoặc chấp nhận bù sai số trôi dạt (±5m đến 10m) nếu coords.accuracy <= 25m
 * @returns {Promise<{ lat: number, lon: number, accuracy: number, samplesCount: number }>}
 */
export function getSmoothedGpsPosition(maxSamples = 3, maxWaitMs = 2000) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Trình duyệt không hỗ trợ định vị GPS'));
    }

    const samples = [];
    let watchId = null;
    let finished = false;

    const finalize = () => {
      if (finished) return;
      finished = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (samples.length === 0) {
        // Fallback gọi getCurrentPosition 1 lần nếu watchPosition chưa kịp trả về trong 2s
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 15),
              samplesCount: 1
            });
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
        return;
      }

      // Tính trung bình cộng có trọng số theo độ chính xác của các mẫu thu thập được
      const sumLat = samples.reduce((acc, s) => acc + s.lat, 0);
      const sumLon = samples.reduce((acc, s) => acc + s.lon, 0);
      const sumAcc = samples.reduce((acc, s) => acc + s.accuracy, 0);

      resolve({
        lat: sumLat / samples.length,
        lon: sumLon / samples.length,
        accuracy: Math.round(sumAcc / samples.length),
        samplesCount: samples.length
      });
    };

    const timer = setTimeout(finalize, maxWaitMs);

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          samples.push({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 20
          });

          // Đủ 3 mẫu liên tiếp trong 2 giây -> chốt trung bình cộng ngay
          if (samples.length >= maxSamples) {
            clearTimeout(timer);
            finalize();
          }
        },
        () => {
          if (samples.length > 0) {
            clearTimeout(timer);
            finalize();
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: maxWaitMs }
      );
    } catch (e) {
      clearTimeout(timer);
      finalize();
    }
  });
}

/**
 * Kiểm tra khoảng cách đã lọc nhiễu trôi dạt GPS trong phòng học bê tông
 * @param {number} sessionLat
 * @param {number} sessionLon
 * @param {{ lat: number, lon: number, accuracy: number }} userLocation
 * @param {number} allowedRadius (mặc định 35m)
 */
export function evaluateGpsDriftTolerance(sessionLat, sessionLon, userLocation, allowedRadius = 35) {
  if (isNaN(sessionLat) || isNaN(sessionLon)) {
    return {
      withinRange: true,
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
  // Nếu coords.accuracy <= 25m, chấp nhận sai số trôi dạt trong nhà từ 5m - 10m
  const driftAllowance = accuracy <= 25 ? Math.min(10, Math.max(5, Math.round(accuracy * 0.4))) : 5;
  const effectiveDistance = Math.max(0, rawDistance - driftAllowance);

  const withinRange =
    rawDistance <= allowedRadius ||
    (accuracy <= 25 && effectiveDistance <= allowedRadius);

  return {
    withinRange,
    rawDistance,
    effectiveDistance: rawDistance <= allowedRadius ? rawDistance : effectiveDistance,
    driftAllowance,
    accuracy
  };
}

