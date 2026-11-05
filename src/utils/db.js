// src/utils/db.js - Két Lưu Trữ IndexedDB Chuẩn (UTHTRUSTID_DB / identity_vault)
// Dùng để thay thế hoàn toàn localStorage, lưu trữ an toàn thẻ sinh viên số (student_vc)
// và kho khóa đã mã hóa AES-GCM (encrypted_vault)

const DB_NAME = 'UTHTRUSTID_DB';
const DB_VERSION = 1;
const STORE_NAME = 'identity_vault';

/**
 * Khởi tạo hoặc mở kết nối tới IndexedDB
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB không được hỗ trợ trên môi trường này!'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Tạo object store với keyPath là 'key'
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error(`Lỗi mở IndexedDB: ${event.target.error?.message || event.target.error}`));
    };
  });
}

/**
 * Lưu dữ liệu vào IndexedDB
 * @param {string} key Khóa định danh (ví dụ: 'uth_secure_vault', 'uth_student_vc')
 * @param {any} value Dữ liệu cần lưu (Object, Array, chuỗi mã hóa)
 */
export async function setItem(key, value) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(new Error(`Lỗi lưu dữ liệu: ${event.target.error?.message || event.target.error}`));
    });
  } catch (err) {
    console.warn(`[IndexedDB setItem] Lỗi ghi IDB cho key "${key}", fallback localStorage:`, err);
  }

  // Luôn đồng bộ 1 bản dự phòng an toàn sang localStorage (với dữ liệu chuỗi hóa)
  if (typeof localStorage !== 'undefined') {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch {}
  }

  return true;
}

/**
 * Lấy dữ liệu từ IndexedDB theo key (kèm cơ chế tự động di trú từ localStorage nếu có)
 * @param {string} key Khóa cần lấy
 */
export async function getItem(key) {
  let result = null;

  try {
    const db = await openDB();
    result = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.value : null);
      };
      request.onerror = (event) => reject(new Error(`Lỗi đọc dữ liệu: ${event.target.error?.message || event.target.error}`));
    });
  } catch (err) {
    console.warn(`[IndexedDB getItem] Lỗi đọc IDB cho key "${key}":`, err);
  }

  // Nếu trong IndexedDB chưa có nhưng trong localStorage có -> Tự động nạp & di trú sang IndexedDB
  if (result === null && typeof localStorage !== 'undefined') {
    const localVal = localStorage.getItem(key);
    if (localVal !== null) {
      try {
        result = JSON.parse(localVal);
      } catch {
        result = localVal;
      }
      // Di trú ngầm sang IndexedDB cho các lần truy xuất sau
      setItem(key, result).catch(() => {});
    }
  }

  return result;
}

/**
 * Xóa một item theo key khỏi cả IndexedDB và localStorage
 * @param {string} key 
 */
export async function removeItem(key) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(new Error(`Lỗi xóa dữ liệu: ${event.target.error?.message || event.target.error}`));
    });
  } catch (err) {
    console.warn(`[IndexedDB removeItem] Lỗi xóa IDB cho key "${key}":`, err);
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  return true;
}
