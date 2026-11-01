// src/utils/antiSpoofGps.js
import { calculateDistance } from '../data/studentsData';

// Bộ nhớ đệm lưu vết vị trí trước đó của thiết bị
let previousLocation = null;

/**
 * Kiểm tra tính hợp lệ và chống giả mạo toạ độ GPS
 * @param {GeolocationPosition} position - Đối tượng trả về từ navigator.geolocation
 * @returns {Object} { isValid: boolean, riskScore: number, reasons: string[] }
 */
export function verifyGpsIntegrity(position) {
  const { latitude, longitude, accuracy, altitude, speed } = position.coords;
  const currentTimestamp = position.timestamp || Date.now();

  const reasons = [];
  let riskScore = 0; // Thang điểm từ 0 (Sạch) đến 100 (Gian lận cao)

  // 1. Kiểm tra độ chuẩn xác (Accuracy Anomaly)
  if (accuracy === 0) {
    riskScore += 60;
    reasons.push("Độ sai số bằng 0 tuyệt đối (Dấu hiệu phần mềm Mock Location)");
  } else if (accuracy > 100) {
    riskScore += 30;
    reasons.push(`Độ chính xác toạ độ quá thấp (${Math.round(accuracy)}m), có thể bắt sóng trạm BTS`);
  }

  // 2. Kiểm tra thông số cao độ (Altitude Check)
  if (altitude === 0 && accuracy < 5) {
    riskScore += 20;
    reasons.push("Cao độ gán cứng 0m bất thường với độ chính xác cao");
  }

  // 3. Kiểm tra vận tốc di chuyển bất thường (Impossible Travel)
  if (previousLocation) {
    const timeDiffSeconds = (currentTimestamp - previousLocation.timestamp) / 1000;
    
    if (timeDiffSeconds > 0 && timeDiffSeconds < 120) {
      const distanceMoved = calculateDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        latitude,
        longitude
      );

      const calculatedSpeed = distanceMoved / timeDiffSeconds; // m/s
      // Nếu vận tốc di chuyển > 25 m/s (~90 km/h) trong khuôn viên trường
      if (calculatedSpeed > 25) {
        riskScore += 80;
        reasons.push(
          `Phát hiện dịch chuyển tức thời (${Math.round(distanceMoved)}m trong ${Math.round(timeDiffSeconds)}s ~ ${Math.round(calculatedSpeed * 3.6)}km/h)`
        );
      }
    }
  }

  // Cập nhật vị trí hiện tại vào lịch sử
  previousLocation = {
    latitude,
    longitude,
    timestamp: currentTimestamp
  };

  return {
    isValid: riskScore < 50,
    riskScore,
    reasons,
    coords: { latitude, longitude, accuracy: Math.round(accuracy) }
  };
}

