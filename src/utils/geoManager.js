// src/utils/geoManager.js - Quản Lý Định Vị GPS Phần Cứng Độ Chính Xác Cao (High-Accuracy Geolocation)
// Thu thập toạ độ thực tế từ chip GPS (enableHighAccuracy: true, maximumAge: 0)
// và lưu trữ bền vững vào IndexedDB (UTHTRUSTID_DB / identity_vault)
import { setItem, getItem } from './db';

/**
 * Lấy toạ độ GPS phần cứng với độ chính xác cao nhất
 * @returns {Promise<{lat: number, lon: number, accuracy: number, altitude: number|null, timestamp: number}>}
 */
export function getPreciseLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Thiết bị không hỗ trợ Geolocation API'));
    }

    const options = {
      enableHighAccuracy: true, // Bắt buộc dùng chip GPS vệ tinh, không dùng IP ước lượng
      timeout: 10000,           // Chờ tối đa 10s để bắt khóa vệ tinh
      maximumAge: 0             // Không dùng toạ độ lưu trong bộ nhớ đệm cũ
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy, // Bán kính sai số tính bằng mét
          altitude: position.coords.altitude,
          timestamp: position.timestamp
        };

        // Lưu toạ độ mới nhất vào IndexedDB
        try {
          await setItem('last_known_location', coords);
        } catch {}

        resolve(coords);
      },
      async (error) => {
        let msg = 'Lỗi định vị: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg += 'Người dùng từ chối cấp quyền truy cập vị trí.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg += 'Không nhận được tín hiệu vệ tinh GPS.';
            break;
          case error.TIMEOUT:
            msg += 'Hết thời gian chờ nhận toạ độ vệ tinh (10s).';
            break;
          default:
            msg += error.message || 'Không xác định.';
        }

        // Dự phòng: Thử đọc toạ độ đã lưu trước đó trong IndexedDB nếu gặp lỗi mất GPS
        try {
          const cached = await getItem('last_known_location');
          if (cached && cached.lat && cached.lon) {
            console.warn('[geoManager] Sử dụng toạ độ dự phòng từ IndexedDB:', cached);
            return resolve({ ...cached, isCached: true });
          }
        } catch {}

        reject(new Error(msg));
      },
      options
    );
  });
}

/**
 * Đọc toạ độ GPS đã lưu gần nhất trong IndexedDB
 */
export async function getLastKnownLocation() {
  try {
    return await getItem('last_known_location');
  } catch {
    return null;
  }
}

