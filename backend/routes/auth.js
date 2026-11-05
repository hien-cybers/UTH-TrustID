// uth-trustid-backend/routes/auth.js - Xác thực Quản trị viên & Giảng viên qua Email/Mật khẩu + RBAC JWT
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
export const JWT_SECRET = 'UTH_SECRET_KEY_2026_NCKH';

// Danh sách tài khoản quản trị nội bộ mẫu (RBAC System Accounts)
export const SYSTEM_ACCOUNTS = [
  {
    id: 'GV001',
    email: 'giangvien@ut.edu.vn',
    aliases: ['giangvien@ut.edu.vn', 'giangvien@uth.edu.vn', 'gv@uth.edu.vn', 'gv@ut.edu.vn'],
    passwords: ['123456', 'password123'],
    fullName: 'TS. Trần Thế Vinh',
    role: 'FACULTY' // Quyền Giảng viên
  },
  {
    id: 'ADM001',
    email: 'admin@ut.edu.vn',
    aliases: ['admin@ut.edu.vn', 'admin@uth.edu.vn'],
    passwords: ['123456', 'admin123', 'adminpassword123'],
    fullName: 'Quản Trị Viên Hệ Thống',
    role: 'ADMIN' // Quyền Quản trị viên tối cao
  }
];

// 1. API Đăng Nhập Cán bộ / Giảng viên / Quản trị viên
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ email và mật khẩu!'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = SYSTEM_ACCOUNTS.find(
    (acc) => acc.aliases.includes(cleanEmail) && acc.passwords.includes(cleanPassword)
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác! (Gợi ý: giangvien@ut.edu.vn / 123456 hoặc admin@ut.edu.vn / 123456)'
    });
  }

  // Tạo JWT Token chứa vai trò (role) có thời hạn 8 giờ
  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// 2. Middleware xác thực và kiểm tra vai trò (RBAC Middleware)
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để truy cập tài nguyên này' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền hạn truy cập chức năng này!' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc token không hợp lệ' });
    }
  };
}

export default router;

