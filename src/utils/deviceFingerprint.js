// src/utils/deviceFingerprint.js
import { ethers } from 'ethers';

const HW_KEY_DB_NAME = 'UTH_Hardware_Key_DB';
const HW_KEY_STORE_NAME = 'crypto_keys';
const HW_KEY_ID = 'device_master_hmac_key';

/**
 * 1. Tạo hoặc lấy Non-extractable Web Crypto API Key lưu trong IndexedDB
 * (iOS Safari & Android Chrome đều hỗ trợ lưu CryptoKey với extractable = false,
 * không thể bị copy ra ngoài và không bị đổi ngẫu nhiên như Canvas fingerprint).
 */
async function getOrCreateWebCryptoHardwareTag() {
  if (typeof window === 'undefined' || !window.crypto?.subtle || !window.indexedDB) {
    return 'FALLBACK_CRYPTO_TAG';
  }

  try {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(HW_KEY_DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(HW_KEY_STORE_NAME)) {
          database.createObjectStore(HW_KEY_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    let cryptoKey = await new Promise((resolve) => {
      const tx = db.transaction(HW_KEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(HW_KEY_STORE_NAME);
      const getReq = store.get(HW_KEY_ID);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => resolve(null);
    });

    if (!cryptoKey) {
      // Tạo khóa HMAC-SHA256 non-extractable (extractable = false)
      cryptoKey = await window.crypto.subtle.generateKey(
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false, // Non-extractable: Không thể xuất khóa thô ra ngoài
        ['sign']
      );

      await new Promise((resolve) => {
        const tx = db.transaction(HW_KEY_STORE_NAME, 'readwrite');
        const store = tx.objectStore(HW_KEY_STORE_NAME);
        store.put(cryptoKey, HW_KEY_ID);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }

    // Ký một chuỗi thách thức cố định bằng khóa phần cứng non-extractable
    const encoder = new TextEncoder();
    const data = encoder.encode('UTH_TRUSTID_HARDWARE_ANCHOR_V2');
    const signatureBuf = await window.crypto.subtle.sign('HMAC', cryptoKey, data);
    const sigHex = Array.from(new Uint8Array(signatureBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return sigHex.slice(0, 16).toUpperCase();
  } catch {
    return 'FALLBACK_CRYPTO_TAG';
  }
}

/**
 * Rút trích Canvas Hash ngắn (12 ký tự)
 */
function getCanvasShortHash() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 60;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#0B0F19';
    ctx.font = '15px Arial';
    ctx.fillText('UTH-TrustID-HW-v2', 14, 28);
    const dataUrl = canvas.toDataURL();
    return ethers.id(dataUrl).slice(2, 14).toUpperCase();
  } catch {
    return 'NOCANVAS0000';
  }
}

/**
 * Tạo Hybrid Hardware ID gồm 5 thành phần độc lập:
 * Format: HYBRID:<1.WebCryptoTag>:<2.ScreenProfile>:<3.PlatformUA>:<4.Timezone>:<5.CanvasHash>
 *
 * Nhờ cấu trúc 5 thành phần này, khi iOS Safari thêm nhiễu chống theo dõi vào Canvas
 * (làm thành phần thứ 5 thay đổi sau khi cập nhật iOS), 4/5 thành phần đầu vẫn khớp 100%
 * -> Điểm tương đồng Fuzzy Matching đạt 80% (>= ngưỡng 80%), KHÔNG từ chối nhầm sinh viên!
 */
export async function getDeviceFingerprint() {
  try {
    // 1. Non-extractable Web Crypto API Tag (IndexedDB Hardware Anchor)
    const cryptoTag = await getOrCreateWebCryptoHardwareTag();

    // 2. Screen & Pixel Ratio Profile
    const screenRaw = `${window.screen?.width || 0}x${window.screen?.height || 0}@${window.devicePixelRatio || 1}`;
    const screenHash = ethers.id(screenRaw).slice(2, 10).toUpperCase();

    // 3. Navigator UserAgentData / Platform / Cores
    const uaPlatform =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      'unknown_platform';
    const cores = navigator.hardwareConcurrency || 4;
    const platformRaw = `${uaPlatform}|cores:${cores}|touch:${navigator.maxTouchPoints || 0}`;
    const platformHash = ethers.id(platformRaw).slice(2, 10).toUpperCase();

    // 4. Timezone & Locale
    const tzRaw = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
    const tzHash = ethers.id(tzRaw).slice(2, 10).toUpperCase();

    // 5. Canvas Fingerprint (có thể dao động nhẹ trên iOS Safari Private/Updates)
    const canvasHash = getCanvasShortHash();

    return `HYBRID:${cryptoTag}:${screenHash}:${platformHash}:${tzHash}:${canvasHash}`;
  } catch (err) {
    console.warn('Fallback fingerprint used:', err);
    return ethers.id(navigator.userAgent + '_UTH_FALLBACK');
  }
}

/**
 * Tính điểm tương đồng Fuzzy Matching (0.0 -> 1.0) giữa 2 Hybrid Hardware ID.
 * - Nếu khớp chính xác 100% (hoặc cả 2 là mã hash cũ giống hệt nhau) -> 1.0 (100%)
 * - Nếu là chuỗi HYBRID 5 phần: chấm điểm theo trọng số:
 *   + Phần 1 (Non-extractable Web Crypto Key): 30%
 *   + Phần 2 (Screen Profile): 20%
 *   + Phần 3 (Platform / CPU Cores): 20%
 *   + Phần 4 (Timezone): 10%
 *   + Phần 5 (Canvas Hash): 20%
 *   => Nếu iOS Safari đổi Canvas Hash, tổng điểm vẫn đạt 80% (0.80) >= ngưỡng 0.80!
 */
export function calculateFuzzyHardwareScore(registeredId, currentId) {
  if (!registeredId || !currentId) return 1.0;
  const reg = String(registeredId).trim();
  const cur = String(currentId).trim();
  if (reg === cur) return 1.0;

  if (reg.startsWith('HYBRID:') && cur.startsWith('HYBRID:')) {
    const regParts = reg.split(':').slice(1);
    const curParts = cur.split(':').slice(1);
    if (regParts.length >= 5 && curParts.length >= 5) {
      const weights = [0.30, 0.20, 0.20, 0.10, 0.20];
      let score = 0;
      for (let i = 0; i < 5; i++) {
        if (regParts[i] === curParts[i]) {
          score += weights[i];
        }
      }
      return Number(score.toFixed(2));
    }
  }

  return 0.0;
}

/**
 * Xác thực Fuzzy Device Binding (Ngưỡng mặc định >= 80% / 0.80)
 */
export async function verifyDeviceBinding(boundFingerprintHash, threshold = 0.80) {
  if (!boundFingerprintHash) return { matched: true, currentFingerprint: null, similarity: 1.0 };
  const currentFingerprint = await getDeviceFingerprint();
  const similarity = calculateFuzzyHardwareScore(boundFingerprintHash, currentFingerprint);
  return {
    matched: similarity >= threshold,
    similarity,
    currentFingerprint,
    boundFingerprint: boundFingerprintHash
  };
}
