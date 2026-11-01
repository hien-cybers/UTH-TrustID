// src/pages/FacultyPortal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { INITIAL_STUDENTS, calculateDistance } from '../data/studentsData';
import {
  GraduationCap,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  QrCode,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Users,
  Fingerprint
} from 'lucide-react';
import { NETWORK_CONFIG } from '../services/did';

export default function FacultyPortal() {
  const [studentsList, setStudentsList] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Trạng thái phiên lớp học / thi cử
  const [sessionType, setSessionType] = useState('Điểm danh lớp'); // 'Điểm danh lớp' | 'Phòng thi kết thúc học phần'
  const [courseCode, setCourseCode] = useState('ATTT01');
  const [activeSession, setActiveSession] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Dynamic Rotating QR Code Settings (Xoay mã 15s)
  const ROTATION_PERIOD = 15;
  const [timeLeft, setTimeLeft] = useState(ROTATION_PERIOD);
  const [autoRotate, setAutoRotate] = useState(true);

  // Chu kỳ xoay mã QR tự động
  useEffect(() => {
    if (!activeSession || !autoRotate) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Xoay session id mới
          const refreshedId = `SES_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6)}`;
          setActiveSession((cur) => cur ? { ...cur, sessionId: refreshedId } : null);
          return ROTATION_PERIOD;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, autoRotate]);

  // 1. Chức năng lấy định vị chính xác của Giảng viên qua navigator.geolocation
  const handleGetLocationAndCreateSession = () => {
    setIsGettingGps(true);
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation!");
      setIsGettingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        };
        setGpsLocation(coords);
        setIsGettingGps(false);
        setTimeLeft(ROTATION_PERIOD);

        // Tạo phiên phòng học mới
        const newSession = {
          sessionId: `SES_${Date.now().toString(36).toUpperCase()}`,
          courseCode,
          type: sessionType,
          lat: coords.lat,
          lon: coords.lon,
          accuracy: coords.accuracy,
          allowedRadius: 50, // Bán kính mặc định 50m trong lớp / phòng thi
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          attendees: []
        };
        setActiveSession(newSession);
      },
      (err) => {
        // Fallback to default UTH Campus coordinates if GPS denied or unavailable
        console.warn("Lỗi truy cập toạ độ GPS: " + err.message + ". Dùng toạ độ UTH cơ sở Bình Thạnh.");
        const fallbackCoords = {
          lat: 10.8016,
          lon: 106.7118,
          accuracy: 10
        };
        setGpsLocation(fallbackCoords);
        setIsGettingGps(false);
        setTimeLeft(ROTATION_PERIOD);

        const newSession = {
          sessionId: `SES_${Date.now().toString(36).toUpperCase()}`,
          courseCode,
          type: sessionType,
          lat: fallbackCoords.lat,
          lon: fallbackCoords.lon,
          accuracy: fallbackCoords.accuracy,
          allowedRadius: 50,
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          attendees: []
        };
        setActiveSession(newSession);
        alert("Đã khởi tạo phiên tại toạ độ cơ sở UTH Bình Thạnh (GPS Fallback)!");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Chức năng tra cứu thông tin sinh viên bằng MSSV hoặc Mã hóa Token
  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }
    const found = studentsList.find(
      (s) => s.mssv.toLowerCase() === q || s.qrCodeToken.toLowerCase() === q
    );
    setSearchResult(found || "NOT_FOUND");
  };

  // 3. Hàm mô phỏng sinh viên quét mã và gửi toạ độ đối soát (Haversine Formula)
  const simulateStudentCheckin = (testLatOffset, testLonOffset, studentMssv) => {
    if (!activeSession) return;
    const studentLat = activeSession.lat + testLatOffset;
    const studentLon = activeSession.lon + testLonOffset;

    // Tính khoảng cách Haversine chính xác theo mét
    const dist = calculateDistance(activeSession.lat, activeSession.lon, studentLat, studentLon);
    const isValid = dist <= activeSession.allowedRadius;

    // Tìm thông tin SV trong DB
    const studentInfo = studentsList.find(s => s.mssv === studentMssv) || {
      fullName: 'Sinh viên ' + studentMssv,
      major: 'An toàn Thông tin'
    };

    const attendeeRecord = {
      mssv: studentMssv,
      fullName: studentInfo.fullName,
      major: studentInfo.major,
      dist,
      isValid,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };

    setActiveSession((prev) => ({
      ...prev,
      attendees: [attendeeRecord, ...prev.attendees]
    }));
  };

  const qrPayload = activeSession ? {
    action: 'faculty_checkin',
    domain: 'uth.edu.vn',
    courseCode: activeSession.courseCode,
    type: activeSession.type,
    sessionId: activeSession.sessionId,
    lat: activeSession.lat,
    lon: activeSession.lon,
    allowedRadius: activeSession.allowedRadius,
    timestamp: Date.now()
  } : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-xl text-slate-100">
              Cổng Giảng Viên - Quản Lý Lớp Học, Buổi Thi & Điểm Danh
            </h2>
            <p className="text-xs text-slate-400">
              Điểm danh số bảo mật cao: Định vị Geo-Fencing (Haversine &le; 50m) & Mã QR xoay vòng 15s
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono bg-purple-950/60 border border-purple-800/40 text-purple-300 px-3 py-1 rounded-full">
            Haversine Radius: 50m
          </span>
        </div>
      </div>

      {/* KHỐI 1: TẠO PHÒNG VÀ ĐỊNH VỊ GPS */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-200 flex items-center space-x-2">
            <MapPin size={18} className="text-cyan-400" />
            <span>1. Thiết lập Phòng Điểm Danh / Buổi Thi & Định Vị Toạ Độ GPS</span>
          </h3>
          <span className="text-xs text-slate-400">GPS Geo-Fencing Module</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Điểm danh lớp">Điểm danh lớp học định kỳ</option>
            <option value="Phòng thi kết thúc học phần">Phòng thi kết thúc học phần</option>
          </select>

          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="Mã lớp / Môn học"
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 min-w-[160px]"
          />

          <button
            onClick={handleGetLocationAndCreateSession}
            disabled={isGettingGps}
            className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
          >
            <MapPin size={15} />
            <span>{isGettingGps ? "Đang dò toạ độ chính xác..." : "📍 Lấy Toạ Độ & Tạo Phiên"}</span>
          </button>
        </div>

        {/* Thông tin phiên lớp học khi đã tạo */}
        {activeSession && (
          <div className="mt-4 bg-slate-950/90 rounded-2xl p-4 sm:p-5 border-l-4 border-emerald-500 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái: Thông số toạ độ & Bán kính */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans">Mã phiên:</span>{" "}
                  <code className="text-cyan-400 font-bold text-sm">{activeSession.sessionId}</code>{" "}
                  <span className="text-slate-400 font-sans">({activeSession.type})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">Toạ độ Giảng viên (Chốt phòng):</span>{" "}
                  <span className="text-slate-200">
                    Vĩ độ: <code>{activeSession.lat.toFixed(6)}</code>, Kinh độ: <code>{activeSession.lon.toFixed(6)}</code>
                  </span>{" "}
                  <span className="text-emerald-400">(±{activeSession.accuracy}m)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">Bán kính cho phép (Haversine Radius):</span>{" "}
                  <span className="text-emerald-300 font-bold bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                    &le; {activeSession.allowedRadius} mét
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 font-sans pt-1">
                  <Clock size={13} className="text-cyan-400" />
                  <span>Xoay mã QR bảo mật sau: <strong className="text-cyan-300 font-mono">{timeLeft}s</strong></span>
                </div>
              </div>

              {/* Cột phải: Mã QR Động phục vụ chiếu máy chiếu */}
              <div className="flex flex-col items-center justify-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="p-2 bg-white rounded-xl shadow-lg mb-2">
                  <QRCodeSVG
                    value={JSON.stringify(qrPayload)}
                    size={140}
                    level="M"
                    includeMargin={false}
                    className="w-32 h-32"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-sans">
                  Sinh viên quét QR để nộp toạ độ đối soát
                </span>
              </div>
            </div>

            {/* Thanh test nhanh mô phỏng cho buổi báo cáo NCKH */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-2 font-medium">
                🧪 Thanh thử nghiệm thực nghiệm (NCKH Live Simulator):
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => simulateStudentCheckin(0.0001, 0.0001, "2251120000")}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-lg transition font-medium flex items-center space-x-1"
                >
                  <CheckCircle2 size={13} />
                  <span>Simulate: SV đứng trong lớp (~15m, Hợp lệ)</span>
                </button>
                <button
                  onClick={() => simulateStudentCheckin(0.002, 0.002, "2251120001")}
                  className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs px-3 py-1.5 rounded-lg transition font-medium flex items-center space-x-1"
                >
                  <XCircle size={13} />
                  <span>Simulate: SV ở ngoài trường (~300m, Từ chối)</span>
                </button>
              </div>
            </div>

            {/* Danh sách SV đã điểm danh đối soát toạ độ */}
            <div className="pt-3">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
                <Users size={15} className="text-cyan-400" />
                <span>Danh sách đối soát tức thời ({activeSession.attendees.length} lượt quét):</span>
              </h4>

              {activeSession.attendees.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Chưa có sinh viên nào quét mã.</p>
              ) : (
                <div className="overflow-x-auto max-h-56 overflow-y-auto">
                  <ul className="space-y-1.5 font-mono text-xs">
                    {activeSession.attendees.map((item, idx) => (
                      <li
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 transition ${
                          item.isValid
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                            : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-cyan-300">MSSV: {item.mssv}</span>
                          <span className="text-slate-400">({item.fullName})</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-300">Cách phòng: <strong>{item.dist} m</strong></span>
                        </div>
                        <div className="flex items-center space-x-2 text-right">
                          <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${
                              item.isValid
                                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                                : 'bg-rose-900/60 text-rose-300 border-rose-700'
                            }`}
                          >
                            {item.isValid ? "✓ HỢP LỆ" : "❌ TỪ CHỐI (VƯỢT KHOẢNG CÁCH)"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* KHỐI 2: TÌM KIẾM SINH VIÊN BẰNG MSSV HOẶC CODE MÃ HÓA */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-200 flex items-center space-x-2">
            <Search size={18} className="text-purple-400" />
            <span>2. Tra Cứu Hồ Sơ Sinh Viên (Bằng MSSV hoặc Token Mã Hóa)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nhập mã số sinh viên hoặc chuỗi hash QR code được in / hiển thị trên Thẻ Sinh Viên Số:
          </p>
        </div>

        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Ví dụ: 2251120000 hoặc UTH_HASH_SEC_9921a8f01"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-purple-900/30 flex items-center space-x-1"
          >
            <Search size={14} />
            <span>Tìm kiếm</span>
          </button>
        </div>

        {searchResult === "NOT_FOUND" && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <XCircle size={15} />
            <span>Không tìm thấy hồ sơ sinh viên phù hợp với từ khóa này.</span>
          </div>
        )}

        {searchResult && searchResult !== "NOT_FOUND" && (
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-cyan-500/40 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-xs sm:text-sm text-cyan-400 flex items-center space-x-2">
                <CheckCircle2 size={16} />
                <span>Kết quả xác thực thông tin sinh viên</span>
              </h4>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  searchResult.status === 'Active'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}
              >
                Trạng thái: {searchResult.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Họ và Tên:</span>
                <span className="font-semibold text-slate-100">{searchResult.fullName}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Mã số sinh viên (MSSV):</span>
                <span className="font-mono font-bold text-cyan-300">{searchResult.mssv}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Lớp & Chuyên ngành:</span>
                <span className="text-slate-200">{searchResult.classId} - {searchResult.major}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Niên khóa:</span>
                <span className="text-slate-200">{searchResult.cohort || '2022 - 2026'}</span>
              </div>
              <div className="sm:col-span-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5 font-mono text-[11px]">
                <span className="text-slate-500 font-sans block">Địa chỉ DID On-chain:</span>
                <span className="text-cyan-300 break-all">{searchResult.didAddress}</span>
              </div>
              <div className="sm:col-span-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5 font-mono text-[11px]">
                <span className="text-slate-500 font-sans block">Code Token mã hóa định danh:</span>
                <span className="text-emerald-300 break-all font-bold">{searchResult.qrCodeToken}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
