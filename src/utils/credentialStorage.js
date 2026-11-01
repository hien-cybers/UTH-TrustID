// src/utils/credentialStorage.js - Két lưu trữ Thẻ sinh viên số & Merkle Proof bằng IndexedDB (idb)
import { openDB } from 'idb';

const DB_NAME = 'UTH_TrustID_DB';
const DB_VERSION = 1;
const STORE_NAME = 'credentials';

/**
 * Khởi tạo hoặc kết nối vào IndexedDB an toàn (Browser Sandbox Isolation)
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Tạo Object Store nếu chưa tồn tại
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'studentId' // Dùng Mã số sinh viên làm Khóa chính
        });
        // Tạo các chỉ mục tra cứu nhanh
        store.createIndex('by_address', 'address', { unique: false });
        store.createIndex('by_merkleRoot', 'merkleRoot', { unique: false });
      }
    }
  });
}

/**
 * 1. Lưu hoặc Cập nhật Chứng chỉ số kèm Merkle Proof vào IndexedDB
 * @param {Object} credentialData - Đối tượng chứng chỉ đầy đủ
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

  // Phát tín hiệu sự kiện cục bộ để các tab/component tự động cập nhật
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-vc-storage-updated', { detail: recordToSave }));
  }

  return recordToSave;
}

/**
 * 2. Lấy chứng chỉ theo MSSV
 * @param {string} studentId
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
  // Trả về bản ghi đầu tiên được lưu trong ví cá nhân
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
 * @param {string} studentId
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
