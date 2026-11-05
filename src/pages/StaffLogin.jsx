// src/pages/StaffLogin.jsx - Cổng Đăng Nhập Quản Trị & Giảng Viên (Email/Password + RBAC)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, GraduationCap, ShieldCheck, Key, AlertTriangle } from 'lucide-react';
import { smartFetch } from '../utils/backendUrl';

const FACULTY_EMAILS = ['giangvien@ut.edu.vn', 'giangvien@uth.edu.vn', 'gv@uth.edu.vn', 'gv@ut.edu.vn'];
const ADMIN_EMAILS = ['admin@ut.edu.vn', 'admin@uth.edu.vn'];
const VALID_PASSWORDS = ['123456', 'password123', 'admin123', 'adminpassword123'];

export default function StaffLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async (inputEmail, inputPassword) => {
    setIsLoading(true);
    setErrorMsg('');
    const cleanEmail = String(inputEmail || '').trim().toLowerCase();
    const cleanPass = String(inputPassword || '').trim();

    try {
      // 1. Gửi yêu cầu xác thực lên Backend Express API
      const res = await smartFetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('uth_staff_user', JSON.stringify(data.user));
        localStorage.setItem('uth_staff_token', data.token);
        if (onLoginSuccess) onLoginSuccess(data.user);
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/faculty');
        }
        return;
      }
    } catch {}

    // 2. Fallback ngoại tuyến cục bộ nếu Backend tạm ngắt
    let matchedUser = null;
    if (FACULTY_EMAILS.includes(cleanEmail) && VALID_PASSWORDS.includes(cleanPass)) {
      matchedUser = { id: 'GV001', fullName: 'TS. Trần Thế Vinh', role: 'FACULTY', email: cleanEmail };
    } else if (ADMIN_EMAILS.includes(cleanEmail) && VALID_PASSWORDS.includes(cleanPass)) {
      matchedUser = { id: 'ADM001', fullName: 'Quản Trị Viên Hệ Thống', role: 'ADMIN', email: cleanEmail };
    }

    if (matchedUser) {
      localStorage.setItem('uth_staff_user', JSON.stringify(matchedUser));
      localStorage.setItem('uth_staff_token', 'mock_jwt_token_2026');
      if (onLoginSuccess) onLoginSuccess(matchedUser);
      if (matchedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/faculty');
      }
    } else {
      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác! (Gợi ý: giangvien@ut.edu.vn / 123456)');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickFill = async (targetEmail, targetPass) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMsg('');
    await performLogin(targetEmail, targetPass);
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="glass-card" style={{ padding: '20px 16px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <Lock size={22} color="#38BDF8" strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: '16.5px', fontWeight: 800, margin: '0 0 4px', color: '#fff', letterSpacing: '-0.3px' }}>
            Cổng Đăng Nhập Quản Trị
          </h2>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#8492a6', lineHeight: '1.45' }}>
            Xác thực tài khoản công vụ (RBAC) dành cho Cán bộ Giảng viên & Ban Quản trị UTH
          </p>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '11.5px',
            marginBottom: '16px',
            lineHeight: '1.45'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', color: '#8492a6', marginBottom: '5px', fontWeight: 600 }}>
              Email công vụ (@ut.edu.vn)
            </label>
            <input
              type="email"
              required
              placeholder="giangvien@ut.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#060911',
                border: '1px solid #162032',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', color: '#8492a6', marginBottom: '5px', fontWeight: 600 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#060911',
                border: '1px solid #162032',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '11px',
              marginTop: '4px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #00b4db 0%, #0083b0 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0, 180, 219, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        {/* Nút đăng nhập mẫu nhanh (Quick Fill for Demo) */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #162032' }}>
          <div style={{ fontSize: '10.5px', color: '#8492a6', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nạp nhanh tài khoản thử nghiệm (RBAC):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('giangvien@ut.edu.vn', '123456')}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={14} color="#38bdf8" />
                <span>Giảng Viên: giangvien@ut.edu.vn</span>
              </span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>(Pass: 123456)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@ut.edu.vn', '123456')}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                background: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.25)',
                color: '#00e676',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#00e676" />
                <span>Root Admin: admin@ut.edu.vn</span>
              </span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>(Pass: 123456)</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #162032', fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: '1.45' }}>
          Sinh viên không sử dụng cổng này. Mở tab <strong>Ví Sinh Viên</strong> để xuất trình thẻ số DID.
        </div>

      </div>
    </div>
  );
}

