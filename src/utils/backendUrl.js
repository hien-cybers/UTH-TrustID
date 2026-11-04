// src/utils/backendUrl.js - Bộ Định Tuyến Kết Nối Backend & Socket.io Đa Môi Trường (iPhone IPA, LAN Wi-Fi, 4G Tunnel & Localhost)

// 1. Địa chỉ IPv4 mạng LAN của máy tính Windows (ipconfig) & Cổng 5000
export const DEFAULT_LAN_IP = '192.168.88.200';
export const HOTSPOT_LAN_IP = '192.168.137.1';
export const LAN_BACKEND_URL = `http://${DEFAULT_LAN_IP}:5000`;

// 2. Đường dẫn HTTPS Tunnel công khai (Hoạt động xuyên cả 4G/5G và Wi-Fi trên iPhone mà không bị iOS ATS chặn)
export const PUBLIC_TUNNEL_URL = 'https://thru-scsi-makes-podcast.trycloudflare.com';

/**
 * Xác định URL kết nối Backend chuẩn xác cho cả 3 môi trường:
 * - Trình duyệt máy tính (localhost:5173) -> dùng Vite Proxy ('') hoặc http://localhost:5000
 * - Trình duyệt điện thoại qua Cloudflare Tunnel -> dùng chính origin HTTPS đó ('')
 * - Ứng dụng Native iOS (.ipa cài qua Sideloadly, hostname: trustid.ut.edu.vn) -> dùng PUBLIC_TUNNEL_URL hoặc LAN_BACKEND_URL
 */
export function getBackendBaseUrl() {
  if (typeof window === 'undefined') return 'http://localhost:5000';

  const savedCustom = localStorage.getItem('uth_custom_backend_url');
  if (savedCustom && savedCustom.trim()) {
    return savedCustom.trim().replace(/\/+$/, '');
  }

  const host = window.location.hostname;
  const port = window.location.port;

  // Nếu đang mở trên trình duyệt qua Vite Dev Server (5173) hoặc Cloudflare Tunnel
  if (port === '5173' || host.includes('trycloudflare.com')) {
    return '';
  }

  // Nếu đang chạy trong Native App iOS (.ipa) với hostname 'trustid.ut.edu.vn' hoặc 'capacitor://'
  if (
    host === 'trustid.ut.edu.vn' ||
    window.location.protocol === 'capacitor:' ||
    window.Capacitor?.isNativePlatform?.()
  ) {
    return PUBLIC_TUNNEL_URL;
  }

  // Nếu mở trực tiếp trên trình duyệt qua IP LAN
  if (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return `http://${host}:5000`;
  }

  return 'http://localhost:5000';
}

export function getSocketUrl() {
  const base = getBackendBaseUrl();
  if (!base && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return base;
}

/**
 * Gọi API thông minh với cơ chế tự động Fallback:
 * Thử gọi qua Primary URL (Tunnel / Proxy) -> nếu lỗi mạng thì tự động gọi sang LAN IP (http://192.168.88.200:5000) -> Hotspot IP (http://192.168.137.1:5000)
 */
export async function smartFetch(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const primaryBase = getBackendBaseUrl();

  const candidates = [
    `${primaryBase}${cleanPath}`,
    `${PUBLIC_TUNNEL_URL}${cleanPath}`,
    `http://${DEFAULT_LAN_IP}:5000${cleanPath}`,
    `http://${HOTSPOT_LAN_IP}:5000${cleanPath}`,
    `http://localhost:5000${cleanPath}`
  ];

  // Loại bỏ các URL trùng lặp
  const uniqueUrls = [...new Set(candidates)];

  let lastError = null;
  for (const url of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Kiểm tra chắc chắn phản hồi là JSON chứ không phải trang index.html tĩnh của Capacitor
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối tới Backend Server');
}

