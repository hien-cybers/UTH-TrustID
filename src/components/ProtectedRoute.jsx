import React from 'react';
import { Navigate } from 'react-router-dom';

// Địa chỉ ví Admin mặc định (khớp với admin trong Smart Contract hoặc cấu hình hệ thống)
const ADMIN_ADDRESS = "0xf18bBaE7cD".toLowerCase();

export function ProtectedAdminRoute({ children }) {
  // Lấy địa chỉ ví hoặc token admin đã kết nối từ localStorage/sessionStorage
  const currentAddress = (localStorage.getItem('connected_wallet_address') || localStorage.getItem('uth_did_address') || '').toLowerCase();
  const isAdminAuthenticated = localStorage.getItem('is_admin_logged_in') === 'true';

  // Điều kiện: Hoặc ví khớp với Admin, hoặc có session đăng nhập admin hợp lệ
  if (!isAdminAuthenticated && !currentAddress.includes(ADMIN_ADDRESS.slice(2, 8))) {
    // Cho phép nhập mã khóa Admin khi demo
    const pass = window.prompt("Xác thực quản trị viên (Nhập mật khẩu Admin hoặc gõ 'admin' để tiếp tục):");
    if (pass === 'admin' || pass === 'uth_admin_2026') {
      localStorage.setItem('is_admin_logged_in', 'true');
      return children;
    }

    alert("Cảnh báo an ninh: Bạn không có quyền truy cập trang Quản trị viên (403 Forbidden)!");
    return <Navigate to="/portal" replace />;
  }

  return children;
}
