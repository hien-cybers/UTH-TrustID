// src/components/CameraScannerPro.jsx - Component Camera Quét Mã Chuẩn iOS Safari (Chống Chớp Tắt Triệt Để)
// Giải quyết 3 nguyên nhân cốt lõi trên Safari iOS:
// 1. Khóa chống gọi đè getUserMedia (isStartingRef + streamRef) & cách ly callback qua useRef (không re-run useEffect khi cha re-render).
// 2. Thẻ <video> bắt buộc có đủ autoPlay, playsInline, muted và chờ onloadedmetadata mới gọi .play().
// 3. Dọn dẹp triệt để MediaStreamTrack (track.stop()) khi đóng modal, chuyển tab hoặc quét thành công.
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { X, AlertCircle, RefreshCw, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { triggerScanSuccessFeedback } from '../utils/hapticAudioFeedback';

function parseQrPayload(decodedText) {
  if (typeof decodedText === 'string' && (decodedText.startsWith('UTH_ID:') || decodedText.startsWith('UTH:'))) {
    const parts = decodedText.split(':');
    const isUthId = parts[0] === 'UTH_ID';
    let serverUrl = '';
    if (isUthId && parts[7]) {
      try {
        serverUrl = decodeURIComponent(parts.slice(7).join(':'));
      } catch {}
    }
    return {
      type: 'ATTENDANCE_QR',
      prefix: parts[0],
      sessionId: parts[1],
      nonce: parts[2],
      sessionLat: parseFloat(parts[3]),
      sessionLon: parseFloat(parts[4]),
      timestamp: isUthId ? parseInt(parts[5], 10) : undefined,
      policy: (isUthId ? parts[6] : parts[5]) || 'HYBRID_4G_5G',
      serverUrl,
      raw: decodedText
    };
  }

  try {
    return JSON.parse(decodedText);
  } catch {
    return { challenge: decodedText, raw: decodedText };
  }
}

const CameraScannerPro = memo(function CameraScannerPro({ onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const isStartingRef = useRef(false); // Khóa chống gọi đè getUserMedia liên tục
  const hasScannedRef = useRef(false); // Đảm bảo chỉ bắn kết quả 1 lần duy nhất
  const onScanSuccessRef = useRef(onScanSuccess);
  const onCloseRef = useRef(onClose);

  const [errorMsg, setErrorMsg] = useState(null);

  // Giữ tham chiếu callback mới nhất mà KHÔNG kích hoạt lại useEffect của Camera
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 2. Hàm dọn dẹp luồng (Clean up stream) triệt để
  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      videoRef.current.srcObject = null;
    }
    isStartingRef.current = false;
  }, []);

  // 1. Hàm khởi tạo Camera an toàn cho WebKit iOS
  const startCamera = useCallback(async () => {
    // Ngăn chặn khởi tạo lặp lại khi đang trong tiến trình bật camera
    if (isStartingRef.current || streamRef.current) return;
    isStartingRef.current = true;
    hasScannedRef.current = false;
    setErrorMsg(null);

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' }, // Ưu tiên camera sau trên iPhone / Android
        width: { ideal: 720 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 1.0 }
      }
    };

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera (Yêu cầu kết nối HTTPS).');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Nếu component đã bị unmount trong lúc chờ cấp quyền thì đóng ngay stream
      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        isStartingRef.current = false;
        return;
      }

      streamRef.current = stream;
      const videoEl = videoRef.current;
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');
      videoEl.muted = true;
      videoEl.srcObject = stream;

      // Bắt buộc trên Safari iOS: chờ nạp metadata rồi mới play()
      videoEl.onloadedmetadata = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play();
          }
        } catch (playErr) {
          console.warn('Lỗi auto-play video:', playErr);
        }
      };

      // Chuẩn bị bộ giải mã QR trên luồng video (ưu tiên BarcodeDetector phần cứng + fallback jsQR Canvas)
      let barcodeDetector = null;
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch {}
      }

      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      let isDecodingFrame = false;
      const QR_SCAN_CONFIG = {
        fps: 20, // Tăng tốc độ đọc lên 20 khung hình/giây (50ms/frame)
        qrbox: { width: 220, height: 220 }, // Gom vùng quét nhỏ gọn để chip lấy nét nhanh
        aspectRatio: 1.0
      };

      scanTimerRef.current = setInterval(async () => {
        const v = videoRef.current;
        if (!v || v.readyState < 2 || hasScannedRef.current || isDecodingFrame) return;
        isDecodingFrame = true;

        try {
          let rawQrText = null;

          // Cách 1: Giải mã bằng BarcodeDetector phần cứng (WebKit iOS 17+ / Chrome Android)
          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(v);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                rawQrText = barcodes[0].rawValue;
              }
            } catch {}
          }

          // Cách 2: Giải mã bằng jsQR tốc độ 20 FPS ưu tiên vùng trung tâm qrbox 220x220
          if (!rawQrText && canvasRef.current) {
            try {
              const canvas = canvasRef.current;
              const w = v.videoWidth || 480;
              const h = v.videoHeight || 480;
              if (w > 0 && h > 0) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                  // Bước 2A: Cắt vùng trung tâm qrbox (220x220) tỷ lệ 1:1 để giải mã siêu tốc (< 4ms)
                  const minDim = Math.min(w, h);
                  const cropSize = Math.floor(minDim * 0.68);
                  const sx = Math.floor((w - cropSize) / 2);
                  const sy = Math.floor((h - cropSize) / 2);
                  const boxW = QR_SCAN_CONFIG.qrbox.width;
                  const boxH = QR_SCAN_CONFIG.qrbox.height;

                  canvas.width = boxW;
                  canvas.height = boxH;
                  ctx.drawImage(v, sx, sy, cropSize, cropSize, 0, 0, boxW, boxH);
                  const boxData = ctx.getImageData(0, 0, boxW, boxH);
                  const boxCode = jsQR(boxData.data, boxData.width, boxData.height, {
                    inversionAttempts: 'attemptBoth'
                  });
                  if (boxCode && boxCode.data) {
                    rawQrText = boxCode.data;
                  }

                  // Bước 2B: Fallback quét toàn khung hình nếu người dùng để lệch góc qrbox
                  if (!rawQrText) {
                    const scale = Math.min(1, 360 / Math.max(w, h));
                    const cw = Math.floor(w * scale);
                    const ch = Math.floor(h * scale);
                    canvas.width = cw;
                    canvas.height = ch;
                    ctx.drawImage(v, 0, 0, cw, ch);
                    const fullData = ctx.getImageData(0, 0, cw, ch);
                    const fullCode = jsQR(fullData.data, fullData.width, fullData.height, {
                      inversionAttempts: 'dontInvert'
                    });
                    if (fullCode && fullCode.data) {
                      rawQrText = fullCode.data;
                    }
                  }
                }
              }
            } catch {}
          }

          if (rawQrText && !hasScannedRef.current) {
            hasScannedRef.current = true;
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([40, 60, 40]);
            }
            triggerScanSuccessFeedback();
            stopCamera();
            if (onScanSuccessRef.current) {
              onScanSuccessRef.current(parseQrPayload(rawQrText));
            }
          }
        } finally {
          isDecodingFrame = false;
        }
      }, Math.round(1000 / QR_SCAN_CONFIG.fps));
    } catch (err) {
      console.error('Lỗi truy cập camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Không thể bật camera. Hãy kiểm tra cấp quyền Camera cho Safari trong Cài đặt iPhone.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMsg('Camera đang bị ứng dụng khác chiếm giữ. Vui lòng đóng ứng dụng nền.');
      } else {
        setErrorMsg('Lỗi khởi động camera: ' + err.message);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [stopCamera]);

  // 3. Quản lý vòng đời (Lifecycle) - Chỉ chạy đúng 1 lần khi mở Modal
  useEffect(() => {
    startCamera();

    // Dọn dẹp ngay khi đóng modal hoặc đổi tab
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const cornerStyle = {
    position: 'absolute',
    width: '34px',
    height: '34px',
    filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.7))'
  };

  return (
    <div
      className="glass-card"
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(165deg, rgba(11, 40, 76, 0.88) 0%, rgba(5, 20, 42, 0.96) 100%)',
        borderRadius: '28px',
        border: '1px solid rgba(123, 189, 232, 0.32)',
        padding: '16px',
        boxSizing: 'border-box',
        boxShadow: '0 18px 42px rgba(1, 8, 22, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
      }}
    >
      {/* Canvas ẩn phục vụ giải mã khung hình jsQR */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header Modal Bo Tròn Mềm Mại */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.16)',
              border: '1px solid rgba(123, 189, 232, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Camera size={15} color="#38BDF8" />
          </div>
          <span>Khung Ngắm Quét Mã QR</span>
        </div>
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              if (onCloseRef.current) onCloseRef.current();
            }}
            style={{
              background: 'rgba(123, 189, 232, 0.12)',
              border: '1px solid rgba(123, 189, 232, 0.25)',
              borderRadius: '999px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Khung chứa Camera Bo Tròn 24px */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#020814',
          border: '1px solid rgba(123, 189, 232, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Thẻ Video tối ưu cho Safari iOS: BẮT BUỘC có autoPlay, playsInline, muted */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: errorMsg ? 'none' : 'block'
          }}
        />

        {/* Khung ngắm định vị Squircle 216x216 với 4 Góc Bo Tròn Mềm Mại (Không góc nhọn) */}
        {!errorMsg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '216px',
                height: '216px',
                border: '1.5px solid rgba(123, 189, 232, 0.35)',
                borderRadius: '30px',
                boxShadow: '0 0 0 9999px rgba(2, 8, 22, 0.42), inset 0 0 24px rgba(56, 189, 248, 0.12)'
              }}
            >
              {/* 4 Góc Bo Cong Mềm Mại (24px Squircle Brackets) */}
              <div
                style={{
                  ...cornerStyle,
                  top: -2,
                  left: -2,
                  borderTop: '4px solid #38BDF8',
                  borderLeft: '4px solid #38BDF8',
                  borderTopLeftRadius: '24px'
                }}
              />
              <div
                style={{
                  ...cornerStyle,
                  top: -2,
                  right: -2,
                  borderTop: '4px solid #38BDF8',
                  borderRight: '4px solid #38BDF8',
                  borderTopRightRadius: '24px'
                }}
              />
              <div
                style={{
                  ...cornerStyle,
                  bottom: -2,
                  left: -2,
                  borderBottom: '4px solid #38BDF8',
                  borderLeft: '4px solid #38BDF8',
                  borderBottomLeftRadius: '24px'
                }}
              />
              <div
                style={{
                  ...cornerStyle,
                  bottom: -2,
                  right: -2,
                  borderBottom: '4px solid #38BDF8',
                  borderRight: '4px solid #38BDF8',
                  borderBottomRightRadius: '24px'
                }}
              />

              <div
                className="laser-bar"
                style={{
                  position: 'absolute',
                  left: '8%',
                  width: '84%',
                  height: '2.5px',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, transparent, #38BDF8, #67E8F9, transparent)',
                  boxShadow: '0 0 14px #38BDF8'
                }}
              />
            </div>
          </div>
        )}

        {/* Thông báo lỗi nếu bị Safari từ chối quyền + Nút Thử Bật Lại Camera Bo Tròn */}
        {errorMsg && (
          <div style={{ padding: '22px', textAlign: 'center', color: '#FB7185', fontSize: '12.5px', lineHeight: 1.5 }}>
            <AlertCircle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ marginBottom: '10px', fontWeight: 700 }}>{errorMsg}</div>
            <div style={{ fontSize: '11px', color: '#BDD8E9', marginBottom: '14px', lineHeight: 1.45 }}>
              Mẹo iPhone: Bấm biểu tượng <b>aA</b> trên thanh địa chỉ Safari &rarr; <b>Cài đặt trang web</b> &rarr; <b>Camera: Cho phép</b>.
            </div>
            <button
              onClick={() => {
                stopCamera();
                startCamera();
              }}
              className="btn-press"
              style={{
                padding: '9px 18px',
                borderRadius: '999px',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38BDF8',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} />
              <span>Thử Bật Lại Camera</span>
            </button>
          </div>
        )}
      </div>

      {!errorMsg && (
        <div style={{ marginTop: '11px', textAlign: 'center', fontSize: '12px', color: '#BDD8E9', fontWeight: 500 }}>
          Đưa mã QR vào giữa khung bo tròn để tự động nhận diện
        </div>
      )}
    </div>
  );
});

export default CameraScannerPro;

