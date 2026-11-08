// src/components/LockScreenModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Fingerprint, AlertCircle } from 'lucide-react';
import FaceIDModal from './FaceIDModal';

const CORRECT_PIN = '123456'; // Mã PIN chuẩn

export default function LockScreenModal({ onUnlockSuccess, studentName = 'Nguyễn Đức Hiển' }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFaceModal, setShowFaceModal] = useState(false);

  // Xử lý xác thực lại bằng FaceID/WebAuthn
  const handleBioUnlock = async () => {
    setErrorMsg('');
    setShowFaceModal(true);
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

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99998,
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '22px',
          background: 'rgba(79, 240, 214, 0.12)',
          border: '1px solid rgba(79, 240, 214, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Lock size={30} color="#64F5DF" />
      </div>

      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
        Ứng Dụng Đã Khóa
      </div>
      <div
        style={{
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        Phiên đăng nhập tạm khóa để bảo vệ thẻ số của{' '}
        <strong style={{ color: 'var(--text-main)' }}>{studentName}</strong>.
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
            background: 'var(--bg-card)',
            border: errorMsg ? '1px solid #EF4444' : '1px solid var(--border-hairline)',
            color: 'var(--text-main)',
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
            borderRadius: '16px',
            background: pin.length === 6 ? 'linear-gradient(135deg, #4FF0D6, #22D3EE)' : 'var(--bg-inset)',
            color: pin.length === 6 ? '#040A14' : 'var(--text-dim)',
            fontWeight: 800,
            fontSize: '13px',
            border: pin.length === 6 ? 'none' : '1px solid var(--border-hairline)',
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
          background: 'rgba(79, 240, 214, 0.12)',
          border: '1px solid rgba(79, 240, 214, 0.35)',
          color: '#64F5DF',
          padding: '10px 20px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <Fingerprint size={16} />
        Mở khóa bằng FaceID / Vân tay
      </button>

      {/* Modal Face ID Apple / Native Biometric */}
      <FaceIDModal
        isOpen={showFaceModal}
        onSuccess={() => {
          setShowFaceModal(false);
          onUnlockSuccess();
        }}
        onCancel={() => setShowFaceModal(false)}
        onFallbackPin={() => setShowFaceModal(false)}
        studentName={studentName}
        reason="Mở khóa bảo mật ứng dụng UTH-TrustID"
      />
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}

