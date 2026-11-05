// test-suite.js - Kịch bản kiểm thử tích hợp đầu-cuối (E2E Automated Test) UTH-TrustID
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { ethers } = require('ethers');
const io = require('socket.io-client');

// Đổi IP theo đúng card mạng đang chạy (192.168.137.1 hoặc 192.168.88.200 hoặc localhost)
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000'; 
const TEST_SESSION_ID = 'SES_TEST_' + Math.floor(Math.random() * 1000);

async function runAutoDiagnostic() {
  console.log("==================================================");
  console.log("   BẮT ĐẦU CHẨN ĐOÁN LỖI TỰ ĐỘNG HỆ THỐNG UTH-TRUSTID   ");
  console.log("==================================================\n");

  let socketConnected = false;
  let receivedNewAttendee = false;
  let receivedSessionClosed = false;

  // 1. KIỂM TRA WEBSOCKET
  console.log("[1/5] Kiểm tra kết nối WebSocket...");
  const socket = io(SERVER_URL, { timeout: 3000, reconnection: false });

  await new Promise((resolve) => {
    socket.on('connect', () => {
      socketConnected = true;
      console.log("  ✓ WebSocket: KẾT NỐI THÀNH CÔNG (Socket ID:", socket.id + ")");
      socket.emit('join-session', TEST_SESSION_ID);
      resolve();
    });
    socket.on('connect_error', (err) => {
      console.log("  ✗ WebSocket: THẤT BẠI -", err.message);
      resolve();
    });
  });

  socket.on('new-attendee', (data) => {
    receivedNewAttendee = true;
    console.log("  ✓ Sự kiện Socket 'new-attendee': NHẬN DỮ LIỆU TỨC THÌ:", data.name || data.fullName);
  });

  socket.on('session-closed', () => {
    receivedSessionClosed = true;
    console.log("  ✓ Sự kiện Socket 'session-closed': NHẬN LỆNH ĐÓNG PHÒNG THÀNH CÔNG");
  });

  // 2. KHỞI TẠO VÍ & KÝ SỐ EIP-191 CHUẨN
  console.log("\n[2/5] Sinh ví ngẫu nhiên & tạo chữ ký EIP-191...");
  const wallet = ethers.Wallet.createRandom();
  const nonce = "NONCE_TEST_" + Date.now();
  const timestamp = Date.now();
  const deviceId = "DEV_TEST_DIAGNOSTIC";
  const coords = { lat: 10.799200, lon: 106.705600 };

  const rawMessage = `${TEST_SESSION_ID}:${nonce}:${coords.lat.toFixed(6)}:${coords.lon.toFixed(6)}:${deviceId}:${timestamp}`;
  const signature = await wallet.signMessage(rawMessage);
  console.log("  ✓ Chữ ký EIP-191 tạo thành công bởi ví:", wallet.address);

  // 3. GỬI REQUEST POST ĐIỂM DANH
  console.log("\n[3/5] Gửi payload điểm danh lên API /api/attendance/submit...");
  const payload = {
    sessionId: TEST_SESSION_ID,
    nonce,
    timestamp,
    deviceId,
    studentCoords: coords,
    studentData: {
      studentId: "2251129999",
      name: "Sinh Viên Test Diagnostic",
      fullName: "Sinh Viên Test Diagnostic",
      major: "An toàn Thông tin",
      avatar: "https://via.placeholder.com/150",
      address: wallet.address
    },
    signature
  };

  try {
    const res = await fetch(`${SERVER_URL}/api/attendance/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      console.log("  ✓ API /api/attendance/submit: TRẢ VỀ THÀNH CÔNG 200");
    } else {
      console.log("  ✗ API Điểm danh bị từ chối:", data.error || data);
    }
  } catch (err) {
    console.log("  ✗ Gửi API thất bại (Kiểm tra lại IP/Cổng):", err.message);
  }

  // Chờ 1 giây để kiểm tra sự kiện WebSocket có nhảy tức thì không
  await new Promise(r => setTimeout(r, 1000));

  // 4. KIỂM TRA NÚT ĐÓNG PHÒNG
  console.log("\n[4/5] Kích hoạt sự kiện 'close-session' từ phía Giảng viên...");
  socket.emit('close-session', { sessionId: TEST_SESSION_ID });

  // Chờ phản hồi socket
  await new Promise(r => setTimeout(r, 1000));

  // 5. TỔNG HỢP VỊ TRÍ GÂY LỖI
  console.log("\n==================================================");
  console.log("                BẢNG KẾT LUẬN LỖI                 ");
  console.log("==================================================");
  
  if (!socketConnected) {
    console.log("🚨 LỖI NẰM Ở WEBSOCKET: Socket.io không thể bắt tay (Cần mở Firewall hoặc kiểm tra port).");
  } else if (!receivedNewAttendee) {
    console.log("🚨 LỖI NẰM Ở BROADCAST: API điểm danh đã nhận nhưng Server KHÔNG emit 'new-attendee' qua socket.");
  } else if (!receivedSessionClosed) {
    console.log("🚨 LỖI NẰM Ở NÚT ĐÓNG PHÒNG: Server chưa lắng nghe hoặc chưa emit event 'session-closed'.");
  } else {
    console.log("🎉 HỆ THỐNG BACKEND & SOCKET HOÀN TOÀN KHỎE MẠNH!");
    console.log("👉 Nếu điện thoại không nhận: Lỗi 100% nằm ở địa chỉ IP cấu hình trên app iPhone hoặc Wi-Fi.");
  }

  socket.disconnect();
  process.exit(0);
}

runAutoDiagnostic();
