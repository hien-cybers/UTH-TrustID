// src/utils/credentialStorage.js - Két lưu trữ Thẻ sinh viên số, Merkle Proof & Hàng đợi Điểm danh Offline 2 Lớp (Android SW Sync + iOS Visibility/Online Fallback)
import { openDB } from 'idb';

const DB_NAME = 'UTH_TrustID_DB';
const DB_VERSION = 2;
const STORE_NAME = 'credentials';
const OFFLINE_QUEUE_STORE = 'offline_attendance_queue';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'studentId'
        });
        store.createIndex('by_address', 'address', { unique: false });
        store.createIndex('by_merkleRoot', 'merkleRoot', { unique: false });
      }

      if (!db.objectStoreNames.contains(OFFLINE_QUEUE_STORE)) {
        const queueStore = db.createObjectStore(OFFLINE_QUEUE_STORE, {
          keyPath: 'id'
        });
        queueStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('by_sessionId', 'sessionId', { unique: false });
      }
    }
  });
}

export async function saveCredentialToStorage(credentialData) {
  const sId = String(credentialData.studentId || credentialData.mssv || '');
  if (!sId) {
    throw new Error('Dữ liệu chứng chỉ không hợp lệ: Thiếu studentId / MSSV!');
  }
  if (!credentialData.merkleProof && !credentialData.proof?.proof) {
    throw new Error('Dữ liệu chứng chỉ không hợp lệ: Thiếu mảng merkleProof phục vụ đối soát O(log N)!');
  }

  const db = await initDB();
  const proofArray = credentialData.merkleProof || credentialData.proof?.proof || [];
  const rootStr = credentialData.merkleRoot || credentialData.proof?.merkleRoot || '';

  const recordToSave = {
    ...credentialData,
    studentId: sId,
    fullName: credentialData.fullName || credentialData.credentialSubject?.fullName || 'Sinh viên UTH',
    major: credentialData.major || credentialData.credentialSubject?.major || 'An toàn Thông tin',
    address: credentialData.address || credentialData.credentialSubject?.address || '0x0000000000000000000000000000000000000000',
    merkleProof: proofArray,
    merkleRoot: rootStr,
    leafHash: credentialData.leafHash || credentialData.credentialSubject?.leafHash || '',
    status: credentialData.status || credentialData.credentialSubject?.status || 'Active',
    storedAt: new Date().toISOString()
  };

  await db.put(STORE_NAME, recordToSave);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: recordToSave }));
  }

  return recordToSave;
}

export async function getCredentialByStudentId(studentId) {
  if (!studentId) return null;
  const db = await initDB();
  return await db.get(STORE_NAME, String(studentId));
}

export async function getActiveCredential(preferredStudentId = null) {
  const db = await initDB();
  if (preferredStudentId) {
    const matched = await db.get(STORE_NAME, String(preferredStudentId));
    if (matched) return matched;
  }
  const allRecords = await db.getAll(STORE_NAME);
  return allRecords.length > 0 ? allRecords[0] : null;
}

export async function getAllCredentialsFromStorage() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

export async function deleteCredentialFromStorage(studentId) {
  if (!studentId) return;
  const db = await initDB();
  await db.delete(STORE_NAME, String(studentId));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: { deleted: studentId } }));
  }
}

export async function clearAllCredentialsFromStorage() {
  const db = await initDB();
  await db.clear(STORE_NAME);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: { cleared: true } }));
  }
}

// ============================================================================
// ĐIỂM NGHẼN ④: CƠ CHẾ AUTO-SYNC 2 LỚP (ANDROID BACKGROUND SYNC + iOS FALLBACK)
// ============================================================================

/**
 * Lưu gói tin điểm danh ngoại tuyến có gắn chữ ký EIP-191 vào IndexedDB
 * và tự động đăng ký Lớp 1 (ServiceWorker Background Sync cho Android/Chromium).
 */
export async function saveOfflineAttendanceToIDB(packet) {
  const db = await initDB();
  const record = {
    ...packet,
    id: packet.id || `OFF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: packet.timestamp || Date.now(),
    savedInIDB: true
  };
  await db.put(OFFLINE_QUEUE_STORE, record);

  // Lớp 1 (Chromium / Android): Đăng ký Background Sync API nếu trình duyệt hỗ trợ
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'sync' in reg) {
        await reg.sync.register('sync-attendance');
      }
    } catch {
      // iOS Safari không hỗ trợ SyncManager -> Lớp 2 (online + visibilitychange) sẽ đảm nhiệm
    }
  }

  return record;
}

export async function getAllOfflineAttendanceFromIDB() {
  const db = await initDB();
  const list = await db.getAll(OFFLINE_QUEUE_STORE);
  return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function clearOfflineAttendanceFromIDB() {
  const db = await initDB();
  await db.clear(OFFLINE_QUEUE_STORE);
}

let isSyncingInProgress = false;

/**
 * Đồng bộ hàng đợi ngoại tuyến từ IndexedDB lên Backend (Idempotent lock chống gửi trùng)
 */
export async function syncOfflineAttendanceFromIDB() {
  if (isSyncingInProgress) {
    return { syncedCount: 0, results: [], skipped: true };
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { syncedCount: 0, results: [], offline: true };
  }

  const pendingPackets = await getAllOfflineAttendanceFromIDB();
  if (!pendingPackets || pendingPackets.length === 0) {
    return { syncedCount: 0, results: [] };
  }

  isSyncingInProgress = true;
  try {
    const res = await fetch('/api/attendance/sync-offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packets: pendingPackets })
    });
    const data = await res.json();
    if (data && data.success) {
      await clearOfflineAttendanceFromIDB();
      // Đồng bộ xóa luôn bản sao dự phòng trong localStorage nếu có
      localStorage.removeItem('uth_offline_attendance_queue');
    }
    return data;
  } finally {
    isSyncingInProgress = false;
  }
}

/**
 * Đăng ký Cơ chế Đồng bộ Tự động 2 Lớp (Dual-Layer Offline Sync):
 * - Lớp 1 (Android/Chrome): Nhận thông điệp `SW_BACKGROUND_SYNC_TRIGGER` từ Service Worker.
 * - Lớp 2 (iOS Safari & Đa nền tảng): Bắt đồng thời sự kiện `window.ononline` VÀ
 *   `document.onvisibilitychange` (ngay khi sinh viên mở sáng màn hình / quay lại app).
 */
export function registerDualLayerOfflineSync(onSyncedCallback) {
  if (typeof window === 'undefined') return () => {};

  const attemptFlush = async (triggerSource) => {
    if (navigator.onLine === false) return;
    try {
      const pending = await getAllOfflineAttendanceFromIDB();
      if (!pending || pending.length === 0) return;
      const result = await syncOfflineAttendanceFromIDB();
      if (result && result.success && typeof onSyncedCallback === 'function') {
        onSyncedCallback(result, triggerSource);
      }
    } catch {
      // Giữ nguyên trong IndexedDB chờ lần kích hoạt kế tiếp
    }
  };

  const handleOnline = () => attemptFlush('WINDOW_ONLINE');
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      attemptFlush('IOS_VISIBILITY_FOREGROUND');
    }
  };
  const handleSwMessage = (event) => {
    if (event.data && event.data.type === 'SW_BACKGROUND_SYNC_TRIGGER') {
      attemptFlush('ANDROID_SW_BACKGROUND_SYNC');
    }
  };

  window.addEventListener('online', handleOnline);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleSwMessage);
  }

  // Kiểm tra ngay lúc khởi tạo nếu đang có mạng
  if (navigator.onLine) {
    attemptFlush('INITIAL_MOUNT_CHECK');
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  };
}

// Aliases tương thích ngược
export const saveCredential = saveCredentialToStorage;
export const getCredential = getCredentialByStudentId;
export const getAllCredentials = getAllCredentialsFromStorage;
