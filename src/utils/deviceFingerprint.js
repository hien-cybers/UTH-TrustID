// src/utils/deviceFingerprint.js - Hardware Footprint & Canvas/WebGL Device Binding
import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Thu thập Canvas Fingerprint đặc thù phần cứng đồ họa
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'canvas_none';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(100, 5, 80, 25);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('UTH-TrustID Security 🛡️', 4, 10);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
    ctx.fillText('UTH-TrustID Security 🛡️', 6, 12);

    return canvas.toDataURL();
  } catch {
    return 'canvas_err';
  }
}

/**
 * Thu thập WebGL GPU Renderer & Vendor
 */
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'webgl_none';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'webgl_generic';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}:::${renderer}`;
  } catch {
    return 'webgl_err';
  }
}

/**
 * Sinh mã định danh phần cứng duy nhất (Hardware Footprint) của thiết bị
 */
export function getDeviceFingerprint() {
  try {
    const canvasFp = getCanvasFingerprint();
    const webglFp = getWebGLFingerprint();
    const screenFp = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}@${window.devicePixelRatio || 1}`;
    const cpuCores = navigator.hardwareConcurrency || 4;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
    const userAgent = navigator.userAgent || 'UnknownAgent';

    const rawString = `${canvasFp}##${webglFp}##${screenFp}##${cpuCores}##${timeZone}##${userAgent}`;
    const hash = keccak256(toUtf8Bytes(rawString));
    const deviceId = `DEV_FP_${hash.slice(2, 18).toUpperCase()}`;

    return {
      deviceId,
      hash,
      metrics: {
        screen: screenFp,
        cores: cpuCores,
        timeZone,
        gpu: webglFp.slice(0, 35) + '...'
      }
    };
  } catch {
    // Fallback nếu môi trường chặn canvas
    const fallbackId = `DEV_FP_FALLBACK_${Date.now().toString(16).toUpperCase()}`;
    return { deviceId: fallbackId, hash: '0x00', metrics: {} };
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

  const isMatch = currentDeviceId.trim().toUpperCase() === registeredDeviceId.trim().toUpperCase();

  return {
    isValid: isMatch,
    currentDeviceId,
    registeredDeviceId,
    reason: isMatch
      ? 'Thiết bị hợp lệ: Trùng khớp Hardware Footprint với thiết bị gốc đã gắn kết ✓'
      : 'CẢNH BÁO GIAN LẬN: Chữ ký phát sinh từ thiết bị lạ (Khác thiết bị gốc đã đăng ký danh tính)!'
  };
}
