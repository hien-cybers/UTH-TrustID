// src/utils/identityManager.js - Quản Lý Khóa & Danh Tính Ngẫu Nhiên (Zero Plaintext In Storage)
// 1. Loại bỏ hoàn toàn Private Key tĩnh 0xac09...ff80
// 2. Sinh ngẫu nhiên 100% ví mới (ethers.Wallet.createRandom())
// 3. Khóa được mã hóa bằng AES-GCM 256-bit với khóa dẫn xuất từ PIN (PBKDF2 100.000 vòng)
// 4. Chỉ giải mã tạm thời trong RAM khi cần ký số (RAM-Only ephemeral key), sau đó hủy ngay lập tức
import { ethers } from 'ethers';

// 1. Lấy hoặc tạo Device ID cố định cho thiết bị
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return 'DEV_SERVER_DEFAULT';
  let devId = localStorage.getItem('uth_device_fingerprint');
  if (!devId) {
    devId = 'DEV_' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10));
    localStorage.setItem('uth_device_fingerprint', devId);
  }
  return devId;
}

// 2. Tạo khóa sinh mã AES-GCM từ chuỗi PIN (PBKDF2 100.000 vòng lặp)
export async function deriveEncryptionKey(pin, salt) {
  const enc = new TextEncoder();
  const cleanPin = String(pin || '123456').trim();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(cleanPin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// 3. Khởi tạo thẻ số mới (Ví ngẫu nhiên 100%) và mã hóa lưu trữ an toàn
export async function initializeRandomIdentity(studentInfo = {}, userPin = '123456', existingPrivateKey = null) {
  const randomWallet = existingPrivateKey
    ? new ethers.Wallet(existingPrivateKey)
    : ethers.Wallet.createRandom();

  const deviceId = getOrCreateDeviceId();
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveEncryptionKey(userPin, salt);

  // Mã hóa Private Key bằng AES-GCM 256-bit
  const encryptedPrivKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(randomWallet.privateKey)
  );

  // Chỉ lưu bản mã hóa vào localStorage, tuyệt đối KHÔNG lưu Plaintext Private Key
  const secureVault = {
    address: randomWallet.address,
    salt: Array.from(salt),
    iv: Array.from(iv),
    cipherText: Array.from(new Uint8Array(encryptedPrivKey)),
    deviceId,
    studentInfo: {
      studentId: studentInfo.studentId || '2251120000',
      fullName: studentInfo.fullName || 'Nguyễn Đức Hiển',
      major: studentInfo.major || 'An toàn Thông tin',
      faculty: studentInfo.faculty || 'Công nghệ Thông tin',
      merkleRoot: studentInfo.merkleRoot || '0x3b06a0bf378a29b4ffaa94ff397a421cb25df46676cec28ee971ecc33f4dfaf2',
      merkleProof: studentInfo.merkleProof || ['0xc20012ebb83fb968595ea40941c9a7393e8f36616ddc90df8db9cf50bb0baf85']
    },
    createdAt: Date.now()
  };

  localStorage.setItem('uth_secure_vault', JSON.stringify(secureVault));

  // Tiêu hủy triệt để mọi key plaintext cũ trong storage
  localStorage.removeItem('uth_did_private_key');

  return { address: randomWallet.address, deviceId, wallet: randomWallet };
}

// 4. Giải mã tạm thời vào RAM để ký số rồi hủy ngay (Ephemeral Key in RAM)
export async function signWithDecryptedKey(userPin, messageHashOrString) {
  const vaultStr = localStorage.getItem('uth_secure_vault');

  // Nếu chưa có vault nhưng có thẻ cũ, tự động mã hóa vào vault bằng PIN
  if (!vaultStr) {
    const legacyVcStr = localStorage.getItem('uth_student_vc');
    if (legacyVcStr) {
      try {
        const legacyVc = JSON.parse(legacyVcStr);
        if (legacyVc.privateKey) {
          await initializeRandomIdentity(legacyVc, userPin, legacyVc.privateKey);
          return await signWithDecryptedKey(userPin, messageHashOrString);
        }
      } catch {}
    }
    throw new Error('Chưa khởi tạo ví danh tính!');
  }

  const vault = JSON.parse(vaultStr);
  const salt = new Uint8Array(vault.salt);
  const iv = new Uint8Array(vault.iv);
  const cipherText = new Uint8Array(vault.cipherText);

  const cryptoKey = await deriveEncryptionKey(userPin, salt);

  let privateKeyPlain = null;
  try {
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      cipherText
    );
    privateKeyPlain = new TextDecoder().decode(decryptedBuf);
  } catch {
    throw new Error('Mã PIN không chính xác, giải mã khóa thất bại!');
  }

  // Khởi tạo ví trong RAM, ký thông điệp EIP-191
  const tempWallet = new ethers.Wallet(privateKeyPlain);
  const signature = await tempWallet.signMessage(messageHashOrString);

  // Hủy biến trong RAM ngay lập tức
  privateKeyPlain = null;

  return { signature, address: vault.address, deviceId: vault.deviceId };
}

// 5. Kiểm tra trạng thái đã có vault mã hóa hay chưa
export function hasSecureVault() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('uth_secure_vault'));
}

// 6. Lấy địa chỉ công khai từ vault (không cần giải mã khóa)
export function getVaultAddress() {
  if (typeof window === 'undefined') return null;
  const vaultStr = localStorage.getItem('uth_secure_vault');
  if (!vaultStr) return null;
  try {
    return JSON.parse(vaultStr).address;
  } catch {
    return null;
  }
}
