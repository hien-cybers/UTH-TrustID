// src/utils/deviceFingerprint.js
import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Trích xuất dấu vân tay phần cứng không xâm lấn quyền riêng tư
 */
export async function getDeviceFingerprint() {
  const components = [];

  // 1. Thông số màn hình & phần cứng cơ bản
  components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  components.push(`cpu_cores:${navigator.hardwareConcurrency || 'unknown'}`);
  components.push(`device_memory:${navigator.deviceMemory || 'unknown'}`);
  components.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  // 2. Định danh vi kiến trúc đồ họa qua WebGL (Renderer & Vendor)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(`gpu_vendor:${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}`);
        components.push(`gpu_renderer:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
      }
    }
  } catch (e) {
    components.push('gpu:unavailable');
  }

  // 3. Canvas Fingerprinting (Sự khác biệt về font engine và khử răng cưa của chip xử lý)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('UTH-TrustID, 2026!', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('UTH-TrustID, 2026!', 4, 17);
    components.push(`canvas:${canvas.toDataURL()}`);
  } catch (e) {
    components.push('canvas:error');
  }

  // Gom các thành phần và băm bằng thuật toán keccak256
  const rawString = components.join('###');
  const deviceHash = keccak256(toUtf8Bytes(rawString));

  return deviceHash;
}

/**
 * Trích xuất đồng bộ dấu vân tay thiết bị (hỗ trợ hiển thị UI hoặc fallback)
 */
export function getDeviceFingerprintSync() {
  try {
    const components = [];
    components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
    components.push(`cpu_cores:${navigator.hardwareConcurrency || 'unknown'}`);
    components.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    const rawString = components.join('###');
    return keccak256(toUtf8Bytes(rawString));
  } catch {
    return '0x89d2f476961fe041304910cf972d3e1cfcf030b7e562ec8787f174e2d26f620f';
  }
}

/**
 * Đối soát Device Binding giữa thiết bị hiện tại và thiết bị đã đăng ký danh tính
 */
export function verifyDeviceBinding(currentDeviceId, registeredDeviceId) {
  if (!currentDeviceId || !registeredDeviceId) {
    return {
      isValid: false,
      reason: 'Thiếu thông số định danh phần cứng (Missing DeviceID)'
    };
  }

  const isMatch = currentDeviceId.trim().toLowerCase() === registeredDeviceId.trim().toLowerCase();

  return {
    isValid: isMatch,
    currentDeviceId,
    registeredDeviceId,
    reason: isMatch
      ? 'Thiết bị hợp lệ: Trùng khớp Hardware Footprint với thiết bị gốc đã gắn kết ✓'
      : 'CẢNH BÁO GIAN LẬN: Chữ ký phát sinh từ thiết bị lạ (Khác thiết bị gốc đã đăng ký danh tính)!'
  };
}
