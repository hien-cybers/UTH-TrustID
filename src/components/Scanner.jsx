import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function Scanner({ onScanSuccess, onClose }) {
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const container = document.getElementById('qr-reader');
    if (container) {
      container.innerHTML = '';
    }

    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    // Không dùng qrbox để tránh html5-qrcode tự vẽ thêm khung mờ thứ 2 bên trong
    const qrConfig = {
      fps: 20,
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        qrConfig,
        (decodedText) => {
          if (!isMounted) return;
          try {
            const parsed = JSON.parse(decodedText);
            stopCamera().then(() => onScanSuccess(parsed));
          } catch {
            stopCamera().then(() => onScanSuccess({ challenge: decodedText }));
          }
        },
        () => {
          // Bỏ qua log từng frame
        }
      )
      .then(() => {
        if (isMounted) {
          isStartedRef.current = true;
        } else {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Camera Error:', err);
        setErrorMessage('Không thể bật camera. Hãy kiểm tra cấp quyền Camera cho Safari trong Cài đặt iPhone.');
      });

    const stopCamera = async () => {
      if (scannerRef.current && isStartedRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          isStartedRef.current = false;
        } catch (e) {
          console.error(e);
        }
      }
    };

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [onScanSuccess]);

  const handleManualClose = async () => {
    if (scannerRef.current && isStartedRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      isStartedRef.current = false;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header modal */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Camera size={18} />
            <h3 className="font-semibold text-sm text-slate-200">Quét mã QR xác thực</h3>
          </div>
          <button
            onClick={handleManualClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Khung camera đơn duy nhất */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-slate-800">
            {/* Vùng video camera */}
            <div
              id="qr-reader"
              className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&_#qr-shaded-region]:hidden [&_#qr-reader__scan_region]:border-none"
            ></div>

            {/* Khung ngắm quét đơn duy nhất (Single Viewfinder Reticle) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-52 h-52 border border-cyan-500/40 rounded-xl">
                {/* 4 góc viền neon nổi bật */}
                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm"></span>
                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm"></span>
                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm"></span>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm"></span>

                {/* Tia quét laser chuyển động */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <p className="text-xs text-rose-400 mt-3 text-center px-2">{errorMessage}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Căn chỉnh mã QR Challenge vào giữa khung ngắm
            </p>
          )}
        </div>
      </div>
    </div>
  );
}