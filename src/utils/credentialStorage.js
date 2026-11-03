// src/utils/credentialStorage.js - Két lưu trữ Thẻ sinh viên số, Merkle Proof & Hàng đợi Điểm danh Offline bằng IndexedDB (idb)
import { openDB } from 'idb';

const DB_NAME = 'UTH_TrustID_DB';
const DB_VERSION = 2;
const STORE_NAME = 'credentials';
const OFFLINE_QUEUE_STORE = 'offline_attendance_queue';

/**
 * Khởi tạo hoặc kết nối vào IndexedDB an toàn (Browser Sandbox Isolation)
 * Bao gồm 2 Object Stores:
 * 1. credentials: Lưu trữ VC và Merkle Proof O(log N)
 * 2. offline_attendance_queue: Lưu trữ gói tin điểm danh ký số ngoại tuyến (Offline Proof-of-Presence)
 */
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

/**
 * 1. Lưu hoặc Cập nhật Chứng chỉ số kèm Merkle Proof vào IndexedDB
 */
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

/**
 * 2. Lấy chứng chỉ theo MSSV
 */
export async function getCredentialByStudentId(studentId) {
  if (!studentId) return null;
  const db = await initDB();
  return await db.get(STORE_NAME, String(studentId));
}

/**
 * 3. Lấy chứng chỉ hiện hành đầu tiên trong máy (dùng cho Ví PWA cá nhân)
 */
export async function getActiveCredential(preferredStudentId = null) {
  const db = await initDB();
  if (preferredStudentId) {
    const matched = await db.get(STORE_NAME, String(preferredStudentId));
    if (matched) return matched;
  }
  const allRecords = await db.getAll(STORE_NAME);
  return allRecords.length > 0 ? allRecords[0] : null;
}

/**
 * 4. Lấy toàn bộ danh sách chứng chỉ lưu trong IndexedDB
 */
export async function getAllCredentialsFromStorage() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

/**
 * 5. Xóa chứng chỉ khi sinh viên đăng xuất hoặc tự thu hồi
 */
export async function deleteCredentialFromStorage(studentId) {
  if (!studentId) return;
  const db = await initDB();
  await db.delete(STORE_NAME, String(studentId));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: { deleted: studentId } }));
  }
}

/**
 * 6. Xóa toàn bộ két lưu trữ chứng chỉ
 */
export async function clearAllCredentialsFromStorage() {
  const db = await initDB();
  await db.clear(STORE_NAME);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: { cleared: true } }));
  }
}

// ============================================================================
// BƯỚC 3: MODULE OFFLINE SYNC LƯU GÓI TIN CHỮ KÝ SỐ TẠM THỜI VÀO INDEXEDDB
// ============================================================================

/**
 * 7. Lưu gói tin điểm danh ngoại tuyến có gắn chữ ký EIP-191 vào IndexedDB
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
  return record;
}

/**
 * 8. Đọc toàn bộ gói tin điểm danh ngoại tuyến đang chờ trong IndexedDB
 */
export async function getAllOfflineAttendanceFromIDB() {
  const db = await initDB();
  const list = await db.getAll(OFFLINE_QUEUE_STORE);
  return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * 9. Xóa toàn bộ hàng đợi điểm danh ngoại tuyến sau khi đã đồng bộ thành công
 */
export async function clearOfflineAttendanceFromIDB() {
  const db = await initDB();
  await db.clear(OFFLINE_QUEUE_STORE);
}

/**
 * 10. Tự động đồng bộ ngầm (Background Sync) từ IndexedDB lên Backend khi có mạng
 */
export async function syncOfflineAttendanceFromIDB() {
  const pendingPackets = await getAllOfflineAttendanceFromIDB();
  if (!pendingPackets || pendingPackets.length === 0) {
    return { syncedCount: 0, results: [] };
  }

  const res = await fetch('/api/attendance/sync-offline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packets: pendingPackets })
  });
  const data = await res.json();
  if (data && data.success) {
    await clearOfflineAttendanceFromIDB();
  }
  return data;
}

// Aliases tương thích ngược
export const saveCredential = saveCredentialToStorage;
export const getCredential = getCredentialByStudentId;
export const getAllCredentials = getAllCredentialsFromStorage;
