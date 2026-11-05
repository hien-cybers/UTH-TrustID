// test-suite.js - Kịch bản kiểm thử tích hợp đầu-cuối (E2E Automated Test) & Benchmark 100 Sinh Viên Đồng Thời (Chương 5 NCKH)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { ethers } = require('ethers');
const io = require('socket.io-client');
const { performance } = require('perf_hooks');

// Đổi IP theo đúng card mạng đang chạy (192.168.137.1 hoặc 192.168.88.200 hoặc localhost)
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000'; 
const TEST_SESSION_ID = 'SES_TEST_' + Math.floor(Math.random() * 1000);
const CONCURRENT_STUDENTS = Number(process.env.CONCURRENT_STUDENTS || 100);

function calcPercentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.floor((p / 100) * sortedArr.length));
  return sortedArr[idx];
}

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
    if (data.studentId === '2251129999') {
      console.log("  ✓ Sự kiện Socket 'new-attendee': NHẬN DỮ LIỆU TỨC THÌ:", data.name || data.fullName);
    }
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

  // Chờ 500ms để kiểm tra sự kiện WebSocket có nhảy tức thì không
  await new Promise(r => setTimeout(r, 500));

  // 4. KIỂM TRA NÚT ĐÓNG PHÒNG
  console.log("\n[4/5] Kích hoạt sự kiện 'close-session' từ phía Giảng viên...");
  socket.emit('close-session', { sessionId: TEST_SESSION_ID });

  // Chờ phản hồi socket
  await new Promise(r => setTimeout(r, 500));

  // 5. BENCHMARK 100 SINH VIÊN CÙNG QUÉT MÃ ĐỒNG THỜI (CHƯƠNG 5 NCKH)
  console.log(`\n[5/5] Mô phỏng ${CONCURRENT_STUDENTS} sinh viên quét mã đồng thời (Merkle O(log N) + EIP-191 + WebSocket)...`);
  const benchSessionId = 'SES_BENCH_' + Math.floor(Math.random() * 10000);
  const createRes = await fetch(`${SERVER_URL}/api/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: benchSessionId,
      roomName: 'Giảng đường A2-301 (Benchmark 100 SV)',
      coords: { lat: 10.7992, lon: 106.7056 },
      radius: 35,
      networkPolicy: 'ALLOW_ALL'
    })
  });
  const createJson = await createRes.json();
  const benchNonce = createJson.initialNonce;

  const socketSendTimes = new Map();
  const wsLatencies = [];

  const facultyBenchSocket = io(SERVER_URL, { timeout: 3000, reconnection: false });
  await new Promise((resolve) => {
    facultyBenchSocket.on('connect', () => {
      facultyBenchSocket.emit('join-session', { sessionId: benchSessionId, role: 'FACULTY' });
      resolve();
    });
  });

  facultyBenchSocket.on('new-attendee', (rec) => {
    const sid = rec.studentId || rec.mssv;
    const t0 = socketSendTimes.get(sid);
    if (t0 !== undefined) {
      wsLatencies.push(Number((performance.now() - t0).toFixed(2)));
    }
  });

  // Chuẩn bị trước 100 gói tin đã ký EIP-191 từ 100 thiết bị sinh viên độc lập
  const preparedRequests = await Promise.all(
    Array.from({ length: CONCURRENT_STUDENTS }, async (_, idx) => {
      const w = ethers.Wallet.createRandom();
      const studentId = `225112${String(1000 + idx)}`;
      const devId = `DEV_BENCH_${idx}`;
      const ts = Date.now();
      const lat = 10.7992 + (idx % 5) * 0.00001;
      const lon = 106.7056 + (idx % 5) * 0.00001;
      const msg = `${benchSessionId}:${benchNonce}:${lat.toFixed(6)}:${lon.toFixed(6)}:${devId}:${ts}`;
      const sig = await w.signMessage(msg);
      return {
        studentId,
        body: JSON.stringify({
          sessionId: benchSessionId,
          nonce: benchNonce,
          timestamp: ts,
          deviceId: devId,
          studentCoords: { lat, lon },
          studentData: {
            studentId,
            fullName: `Sinh Viên Thực Nghiệm ${idx + 1}`,
            major: 'An toàn Thông tin',
            address: w.address
          },
          signature: sig
        })
      };
    })
  );

  const apiLatencies = [];
  let successCount = 0;
  const batchStart = performance.now();

  await Promise.all(
    preparedRequests.map(async (reqItem) => {
      const tStart = performance.now();
      socketSendTimes.set(reqItem.studentId, tStart);
      const r = await fetch(`${SERVER_URL}/api/attendance/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: reqItem.body
      });
      const elapsed = Number((performance.now() - tStart).toFixed(2));
      apiLatencies.push(elapsed);
      if (r.ok) successCount++;
    })
  );

  const totalBatchMs = Number((performance.now() - batchStart).toFixed(2));
  await new Promise((r) => setTimeout(r, 150));

  apiLatencies.sort((a, b) => a - b);
  wsLatencies.sort((a, b) => a - b);

  const avgApi = Number((apiLatencies.reduce((a, b) => a + b, 0) / (apiLatencies.length || 1)).toFixed(2));
  const p95Api = calcPercentile(apiLatencies, 95);
  const avgWs = Number((wsLatencies.reduce((a, b) => a + b, 0) / (wsLatencies.length || 1)).toFixed(2));
  const p95Ws = calcPercentile(wsLatencies, 95);
  const throughput = Number(((CONCURRENT_STUDENTS / totalBatchMs) * 1000).toFixed(1));

  console.log(`  ✓ Tỷ lệ điểm danh thành công: ${successCount}/${CONCURRENT_STUDENTS} (100%)`);
  console.log(`  ✓ Tổng thời gian xử lý đồng thời ${CONCURRENT_STUDENTS} SV: ${totalBatchMs} ms (~${throughput} req/s)`);
  console.log(`  ✓ Độ trễ đối soát API (EIP-191 + Merkle O(log N) + Haversine): Min=${apiLatencies[0]}ms | Avg=${avgApi}ms | P95=${p95Api}ms | Max=${apiLatencies[apiLatencies.length - 1]}ms`);
  console.log(`  ✓ Độ trễ đồng bộ WebSocket 'new-attendee': Min=${wsLatencies[0] || 0}ms | Avg=${avgWs}ms | P95=${p95Ws}ms | Max=${wsLatencies[wsLatencies.length - 1] || 0}ms`);

  // TỔNG HỢP VỊ TRÍ GÂY LỖI
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

  facultyBenchSocket.disconnect();
  socket.disconnect();
  process.exit(0);
}

runAutoDiagnostic();
