// src/components/LockScreenModal.jsx
import React, { useState } from 'react';
import { Lock, Fingerprint, AlertCircle } from 'lucide-react';
import { verifyBiometricPresence } from '../utils/webauthnHelper';

const CORRECT_PIN = '123456'; // Mã PIN chuẩn

export default function LockScreenModal({ onUnlockSuccess, studentName = 'Nguyễn Đức Hiển' }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Xử lý xác thực lại bằng FaceID/WebAuthn
  const handleBioUnlock = async () => {
    try {
      setErrorMsg('');
      await verifyBiometricPresence('RE_AUTH_CHALLENGE_' + Date.now());
      onUnlockSuccess();
    } catch (err) {
      setErrorMsg('Không nhận diện được khuôn mặt/vân tay. Vui lòng nhập mã PIN.');
    }
  };

  // Xử lý kiểm tra mã PIN
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (attempts >= 5) {
      setErrorMsg('Bạn đã nhập sai quá 5 lần. Vui lòng chờ 5 phút.');
      return;
    }

    // Kiểm tra chính xác giá trị 123456
    if (pin === CORRECT_PIN) {
      setErrorMsg('');
      setPin('');
      onUnlockSuccess();
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setErrorMsg(`Mã PIN không chính xác! (${nextAttempts}/5)`);
      setPin('');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        background: 'rgba(4, 6, 10, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Lock size={30} color="#38BDF8" />
      </div>

      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
        Ứng Dụng Đã Khóa
      </div>
      <div
        style={{
          fontSize: '12.5px',
          color: '#94A3B8',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        Phiên đăng nhập tạm khóa để bảo vệ thẻ số của{' '}
        <strong style={{ color: '#FFF' }}>{studentName}</strong>.
      </div>

      {/* Form nhập PIN chuẩn hóa */}
      <form
        onSubmit={handlePinSubmit}
        style={{ width: '100%', maxWidth: '280px', textAlign: 'center' }}
      >
        <input
          type="password"
          maxLength={6}
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Nhập 6 số PIN dự phòng"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: '#0F172A',
            border: errorMsg ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFF',
            fontSize: '18px',
            textAlign: 'center',
            letterSpacing: '6px',
            boxSizing: 'border-box',
            outline: 'none',
            marginBottom: '12px'
          }}
        />

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#EF4444',
              fontSize: '11.5px',
              marginBottom: '14px'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pin.length !== 6}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: pin.length === 6 ? '#0284C7' : '#1E293B',
            color: pin.length === 6 ? '#FFF' : '#64748B',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: pin.length === 6 ? 'pointer' : 'not-allowed',
            marginBottom: '12px'
          }}
        >
          Mở Khóa Bằng Mã PIN
        </button>
      </form>

      {/* Nút mở lại bằng FaceID/WebAuthn */}
      <button
        onClick={handleBioUnlock}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38BDF8',
          padding: '10px 18px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Fingerprint size={16} />
        Mở khóa bằng FaceID / Vân tay
      </button>
    </div>
  );
}

