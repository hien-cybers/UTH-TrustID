// src/utils/backendUrl.js - Bộ Định Tuyến Kết Nối Backend & Socket.io Đa Môi Trường (iPhone IPA, LAN Wi-Fi, 4G LocalTunnel & Localhost)

// 1. Địa chỉ IPv4 mạng LAN của máy tính Windows (ipconfig) & Cổng 5000
export const DEFAULT_LAN_IP = '192.168.88.200';
export const HOTSPOT_LAN_IP = '192.168.137.1';
export const LAN_BACKEND_URL = `http://${DEFAULT_LAN_IP}:5000`;

// 2. Đường dẫn HTTPS LocalTunnel công khai (npx localtunnel --port 5000 --subdomain uth-trustid-demo)
// Hoạt động xuyên cả mạng 4G/5G và Wi-Fi trường cho kịch bản thực nghiệm NCKH
export const SERVER_URL = 'https://uth-trustid-demo.loca.lt';
export const PUBLIC_TUNNEL_URL = SERVER_URL;

const RESOLVED_KEY = 'uth_resolved_backend_url';
let resolvedBaseUrl = null;
let resolvingPromise = null;
let activeWorkingBase = null; // Ghi nhớ Base URL đã kết nối thành công để phản hồi tức thì (< 10ms)

export function getCustomServerUrl() {
  if (typeof window === 'undefined') return SERVER_URL;
  return (localStorage.getItem('uth_custom_backend_url') || '').trim() || SERVER_URL;
}

export function setCustomServerUrl(url) {
  if (typeof window === 'undefined') return;
  const clean = (url || '').trim().replace(/\/+$/, '');
  if (clean) {
    localStorage.setItem('uth_custom_backend_url', clean);
    resolvedBaseUrl = clean;
    activeWorkingBase = clean;
  } else {
    localStorage.removeItem('uth_custom_backend_url');
    resolvedBaseUrl = null;
    activeWorkingBase = null;
  }
  window.dispatchEvent(new CustomEvent('uth-backend-url-changed', { detail: clean || SERVER_URL }));
}

function isNativeShell() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'trustid.ut.edu.vn' ||
    window.location.protocol === 'capacitor:' ||
    Boolean(window.Capacitor?.isNativePlatform?.())
  );
}

/**
 * Xác định URL kết nối Backend chuẩn xác cho cả 3 môi trường:
 * - Trình duyệt máy tính (localhost:5173) -> dùng Vite Proxy ('') hoặc http://127.0.0.1:5000
 * - Trình duyệt điện thoại qua Cloudflare Tunnel -> dùng chính origin HTTPS đó ('')
 * - Ứng dụng Native iOS (.ipa cài qua Sideloadly, hostname: trustid.ut.edu.vn) -> dùng PUBLIC_TUNNEL_URL hoặc LAN_BACKEND_URL
 */
export function getBackendBaseUrl() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:5000';

  const savedCustom = localStorage.getItem('uth_custom_backend_url');
  if (savedCustom && savedCustom.trim()) {
    return savedCustom.trim().replace(/\/+$/, '');
  }

  const host = window.location.hostname;
  const port = window.location.port;

  // Nếu đang mở trên trình duyệt qua Vite Dev Server (5173 Mobile / 5174 Web Portal) hoặc Tunnel (Cloudflare / Localtunnel)
  if (port === '5173' || port === '5174' || host.includes('trycloudflare.com') || host.includes('loca.lt')) {
    return '';
  }

  // Nếu đang chạy trong Native App iOS (.ipa) với hostname 'trustid.ut.edu.vn' hoặc 'capacitor://'
  if (isNativeShell()) {
    return resolvedBaseUrl || SERVER_URL || LAN_BACKEND_URL;
  }

  // Nếu mở trực tiếp trên trình duyệt qua IP LAN
  if (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return `http://${host}:5000`;
  }

  return 'http://127.0.0.1:5000';
}

export function getSocketUrl() {
  const base = getBackendBaseUrl();
  if (!base && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return base;
}

async function probeBase(base, timeoutMs = 1500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}/api/session/active`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('not-json');
    return base;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Dò song song các địa chỉ Backend (URL tùy chỉnh -> URL đã dò lần trước -> Tunnel -> LAN -> Hotspot)
 * và ghi nhớ địa chỉ đầu tiên phản hồi JSON hợp lệ. Chỉ áp dụng cho Native App (.ipa/.apk);
 * trên trình duyệt (Vite / Tunnel) luôn dùng cùng origin nên trả về ngay.
 */
export function resolveBackendUrl() {
  if (!isNativeShell()) return Promise.resolve(getBackendBaseUrl());
  if (resolvedBaseUrl) return Promise.resolve(resolvedBaseUrl);
  if (resolvingPromise) return resolvingPromise;

  const custom = (localStorage.getItem('uth_custom_backend_url') || '').trim().replace(/\/+$/, '');
  const lastGood = (localStorage.getItem(RESOLVED_KEY) || '').trim();
  const candidates = [...new Set([
    custom,
    lastGood,
    SERVER_URL,
    LAN_BACKEND_URL,
    `http://${HOTSPOT_LAN_IP}:5000`,
    'http://127.0.0.1:5000'
  ].filter(Boolean))];

  resolvingPromise = Promise.any(candidates.map((c) => probeBase(c, 1800)))
    .then((base) => {
      resolvedBaseUrl = base;
      activeWorkingBase = base;
      try { localStorage.setItem(RESOLVED_KEY, base); } catch {}
      return base;
    })
    .catch(() => SERVER_URL)
    .finally(() => { resolvingPromise = null; });

  return resolvingPromise;
}

/**
 * Chuyển hướng một Socket.IO client đã tạo sang Backend vừa dò được (nếu khác URL ban đầu).
 * Socket.IO v4: Manager.open() dùng this.uri nên chỉ cần đổi uri rồi kết nối lại.
 */
export async function retargetSocket(socket, forcedBase) {
  if (!socket) return socket;
  const base = forcedBase || (isNativeShell() ? await resolveBackendUrl() : getBackendBaseUrl());
  const manager = socket.io;
  if (base && manager && manager.uri !== base) {
    manager.uri = base;
    socket.disconnect();
    socket.connect();
  }
  return socket;
}

async function fetchCandidate(url, options, timeoutMs = 1800) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let facultyToken = '';
    try {
      if (typeof window !== 'undefined') {
        facultyToken =
          localStorage.getItem('faculty_token') ||
          localStorage.getItem('uth_staff_token') ||
          localStorage.getItem('uth_faculty_token') ||
          localStorage.getItem('uth_jwt_token') ||
          '';
      }
    } catch {}

    const mergedHeaders = {
      'Bypass-Tunnel-Reminder': 'true',
      ...(facultyToken ? { Authorization: `Bearer ${facultyToken}` } : {}),
      ...(options?.headers || {})
    };
    const res = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Invalid content-type: ${contentType}`);
    }
    return { res, url };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Gọi API thông minh siêu tốc (< 20ms) với cơ chế tự động Fallback tức thì:
 * 1. Gọi trực tiếp Base URL đã xác thực (activeWorkingBase / primaryBase).
 * 2. Nếu rớt mạng hoặc IP thay đổi: dò song song (Promise.any) các ứng viên (LAN, 127.0.0.1, Hotspot) với timeout 1.5s
 *    thay vì duyệt tuần tự làm treo app 15 giây.
 */
export async function smartFetch(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isNativeShell() && !resolvedBaseUrl) {
    try { await resolveBackendUrl(); } catch {}
  }
  const primaryBase = getBackendBaseUrl();

  const candidates = [
    activeWorkingBase ? `${activeWorkingBase}${cleanPath}` : null,
    `${primaryBase}${cleanPath}`,
    `http://127.0.0.1:5000${cleanPath}`,
    `http://127.0.0.1:4000${cleanPath}`,
    `http://${DEFAULT_LAN_IP}:5000${cleanPath}`,
    `http://${HOTSPOT_LAN_IP}:5000${cleanPath}`,
    PUBLIC_TUNNEL_URL ? `${PUBLIC_TUNNEL_URL}${cleanPath}` : null
  ].filter(Boolean);

  const uniqueUrls = [...new Set(candidates)];

  // Thử ngay URL đầu tiên (thường là working base hoặc origin hiện tại) với timeout ngắn
  const firstUrl = uniqueUrls[0];
  try {
    const { res } = await fetchCandidate(firstUrl, options, 1500);
    return res;
  } catch {
    // Nếu URL đầu tiên lỗi, reset activeWorkingBase nếu nó trùng
    if (activeWorkingBase && firstUrl.startsWith(activeWorkingBase)) {
      activeWorkingBase = null;
    }
  }

  // Thử song song tất cả các candidate còn lại (Promise.any) với timeout 1500ms
  const remaining = uniqueUrls.slice(1);
  if (remaining.length === 0) {
    throw new Error('Không thể kết nối tới Backend Server');
  }

  try {
    const { res, url } = await Promise.any(
      remaining.map((u) => fetchCandidate(u, options, 1500))
    );
    try {
      const parsed = new URL(url);
      activeWorkingBase = `${parsed.protocol}//${parsed.host}`;
    } catch {}
    return res;
  } catch {
    throw new Error('Không thể kết nối tới Backend Server: Tất cả các địa chỉ mạng đều không phản hồi.');
  }
}

