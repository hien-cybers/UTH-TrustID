// src/utils/hapticAudioFeedback.js - Phản hồi xúc giác (Haptic) & Âm thanh (Web Audio API) chuẩn Native App

/**
 * Kích hoạt rung nhẹ xác nhận [40, 60, 40] và âm báo tích cực khi quét mã UTH_ID thành công
 */
export function triggerScanSuccessFeedback() {
  // 1. Phản hồi xúc giác (Haptic Vibration)
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]); // Rung nhẹ xác nhận
    }
  } catch {}

  // 2. Âm thanh xác nhận chuẩn Apple Pay / Native Scanner (Web Audio API)
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Nốt 1: A5 (880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Nốt 2: E6 (1318.5Hz) - tạo âm hưởng thành công sắc nét
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08);
    gain2.gain.setValueAtTime(0.18, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.24);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 350);
  } catch {}
}

/**
 * Kích hoạt rung và âm báo khi phiên điểm danh bị đóng bởi giảng viên hoặc có lỗi
 */
export function triggerSessionTerminatedFeedback() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 80, 120]);
    }
  } catch {}

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.22);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 350);
  } catch {}
}
