// src/utils/sessionKeyVault.js - Lưu giữ tạm thời ví đã mở khóa trong RAM suốt phiên học (< 50ms ký số, không chạy lại PBKDF2)
let activeDecryptedWallet = null;

export function setActiveWallet(wallet) {
  activeDecryptedWallet = wallet;
}

export function getActiveWallet() {
  return activeDecryptedWallet;
}

export function clearActiveWallet() {
  activeDecryptedWallet = null;
}

