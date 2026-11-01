import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  GraduationCap,
  RefreshCw,
  QrCode,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Download,
  ShieldCheck,
  Radio,
  MapPin,
  Wifi,
  RotateCcw,
  Shield,
  Pause,
  Play,
  AlertTriangle
} from 'lucide-react';
import { NETWORK_CONFIG } from '../services/did';

export default function FacultyPortal() {
  const [courseName, setCourseName] = useState('An Toàn Mạng & Mật Mã Ứng Dụng (N01)');
  const [room, setRoom] = useState('Phòng Lab B302 - Cơ sở Bình Thạnh');
  const [sessionType, setSessionType] = useState('attendance'); // 'attendance' | 'exam'
  const [sessionId, setSessionId] = useState('SESSION_' + Date.now().toString(36));
  
  // Dynamic Rotating QR Code Settings (Chống chụp ảnh gửi ra ngoài)
  const ROTATION_PERIOD = 15; // 15 seconds
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROTATION_PERIOD);

  // Geo-fencing & Subnet Security Settings
  const [geoFencingEnabled, setGeoFencingEnabled] = useState(true);
  const [campusWifiOnly, setCampusWifiOnly] = useState(false);
  const [currentCoords] = useState({ lat: 10.8016, lng: 106.7118, radiusM: 200 }); // UTH Campus Bình Thạnh

  const [attendees, setAttendees] = useState([
    {
      id: 'sv_1',
      studentId: '2251120000',
      fullName: 'Sinh viên UTH',
      time: '12:45:10',
      verified: true,
      distance: '38m (Trong phòng B302)',
      network: 'UTH-EduRoam-5G',
      address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D'
    }
  ]);

  const refreshQR = () => {
    const newSession = 'SESSION_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    setSessionId(newSession);
    setTimeLeft(ROTATION_PERIOD);
  };

  // Timer cho Dynamic Rotating QR Code
  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const newSession = 'SESSION_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
          setSessionId(newSession);
          return ROTATION_PERIOD;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRotate]);

  const qrPayload = {
    action: 'faculty_checkin',
    domain: 'uth.edu.vn',
    courseName,
    room,
    type: sessionType,
    sessionId,
    chainId: NETWORK_CONFIG.chainId,
    contractAddress: NETWORK_CONFIG.contractAddress,
    geoFencing: geoFencingEnabled,
    campusTarget: currentCoords,
    campusWifiOnly,
    timestamp: Date.now()
  };

  // Mô phỏng thêm sinh viên quét thành công
  const handleSimulateScan = () => {
    const randomSV = {
      id: 'sv_' + Date.now(),
      studentId: '2251120' + Math.floor(100 + Math.random() * 900),
      fullName: 'Sinh viên ' + ['An Toàn TT', 'CNTT', 'Khoa học DL', 'Kỹ thuật PM'][Math.floor(Math.random() * 4)],
      time: new Date().toLocaleTimeString('vi-VN'),
      verified: true,
      distance: Math.floor(20 + Math.random() * 60) + 'm (Hợp lệ)',
      network: campusWifiOnly ? 'UTH-Student-Campus' : 'Mobile 5G / WiFi',
      address: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setAttendees((prev) => [randomSV, ...prev]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <GraduationCap size={22} className="sm:w-6 sm:h-6" />
            <h2 className="font-bold text-base sm:text-xl text-slate-100">
              Cổng Giảng Viên - Quản Lý Điểm Danh & Khảo Thí
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Khởi tạo phiên điểm danh số bảo mật cao: QR Động xoay 15s, Geo-fencing & Giám sát Subnet
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              autoRotate
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/50'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50'
            }`}
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoRotate ? 'Tạm dừng xoay' : 'Bật xoay QR'}</span>
          </button>

          <button
            onClick={refreshQR}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition"
          >
            <RefreshCw size={14} />
            <span>Đổi mã ngay</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Presentation + Session Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Dynamic Rotating QR Display for Projector / Classroom screen */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Header Status Bar */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
              <Radio size={12} className="animate-pulse" />
              <span>Phiên khảo thí đang mở</span>
            </div>

            {/* Visual Rotating QR Countdown Badge */}
            <div
              className={`flex items-center space-x-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-950/60 border-rose-800/60 text-rose-300 animate-pulse'
                  : 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
              }`}
            >
              <Clock size={12} />
              <span>Xoay mã sau: <strong>{timeLeft}s</strong></span>
            </div>
          </div>

          {/* Progress bar đếm lùi chu kỳ xoay QR */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 5 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${(timeLeft / ROTATION_PERIOD) * 100}%` }}
            />
          </div>

          {/* QR Box */}
          <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-2xl transition transform hover:scale-[1.01] mb-3 sm:mb-4 flex items-center justify-center relative">
            <QRCodeSVG
              value={JSON.stringify(qrPayload)}
              size={230}
              level="M"
              includeMargin={false}
              className="w-44 h-44 sm:w-56 sm:h-56"
            />
          </div>

          <p className="text-[11px] text-slate-400 mb-3 flex items-center space-x-1">
            <ShieldCheck size={13} className="text-cyan-400 inline" />
            <span>Mã QR tự động vô hiệu hóa và tạo mới mỗi 15 giây chống gian lận</span>
          </p>

          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs font-mono space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Mã phiên động:</span>
              <span className="text-cyan-400 font-bold truncate ml-2 max-w-[200px]">{sessionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Geo-fencing:</span>
              <span className={geoFencingEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {geoFencingEnabled ? 'Bật (UTH Campus < 200m)' : 'Tắt'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Campus Wi-Fi:</span>
              <span className={campusWifiOnly ? 'text-purple-400 font-semibold' : 'text-slate-500'}>
                {campusWifiOnly ? 'Bắt buộc Subnet Trường' : 'Cho phép 4G/5G'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Mạng đối soát:</span>
              <span className="text-emerald-400">Polygon Amoy (80002)</span>
            </div>
          </div>
        </div>

        {/* Right: Session Info & Security Constraints */}
        <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
          {/* Security Controls: Geo-fencing & Subnet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-2.5 sm:pb-3">
              <Shield size={16} className="text-cyan-400" />
              <span>Chính Sách An Toàn Phiên (Security Guard)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Toggle Geo-fencing */}
              <div className="flex items-start justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <MapPin size={14} className="text-cyan-400 flex-shrink-0" />
                    <span>Geo-fencing (Tọa độ GPS)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chỉ cho phép thiết bị cách UTH Bình Thạnh &le; 200m quét thẻ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeoFencingEnabled(!geoFencingEnabled)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors mt-1 ${
                    geoFencingEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      geoFencingEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle Campus Wi-Fi */}
              <div className="flex items-start justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <Wifi size={14} className="text-purple-400 flex-shrink-0" />
                    <span>Ràng buộc Campus Wi-Fi</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Giới hạn IP sinh viên thuộc dải Subnet mạng nội bộ trường.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCampusWifiOnly(!campusWifiOnly)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors mt-1 ${
                    campusWifiOnly ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      campusWifiOnly ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Session Details Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-2.5 sm:pb-3">
              <BookOpen size={16} className="text-cyan-400" />
              <span>Thông tin Lớp học & Buổi thi</span>
            </h3>

            <div className="space-y-2.5 sm:space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tên học phần / Lớp tín chỉ:</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Phòng học / Giảng đường:</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Mục đích phiên:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSessionType('attendance')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      sessionType === 'attendance'
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Điểm danh lớp
                  </button>
                  <button
                    onClick={() => setSessionType('exam')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      sessionType === 'exam'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vào phòng thi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Simulation Button */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">Sinh viên có mặt</span>
              <div className="flex items-center space-x-2">
                <Users size={15} className="text-cyan-400" />
                <span className="text-lg sm:text-xl font-bold text-slate-100">{attendees.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">Hợp lệ On-chain</span>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-lg sm:text-xl font-bold text-emerald-400">100%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulateScan}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs text-slate-300 transition flex items-center justify-center space-x-1.5"
          >
            <Radio size={14} className="text-cyan-400" />
            <span>Mô phỏng sinh viên quét thẻ thành công</span>
          </button>
        </div>
      </div>

      {/* Attendee List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Danh Sách Sinh Viên Đã Quét Thẻ Đối Soát ({attendees.length})</span>
          </h3>

          <button
            onClick={() => alert('Đã xuất báo cáo điểm danh file .xlsx thành công!')}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-300 transition"
          >
            <Download size={13} />
            <span>Xuất Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[560px] text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                <th className="pb-2 px-2">MSSV</th>
                <th className="pb-2 px-2">Họ & Tên</th>
                <th className="pb-2 px-2">Thời gian</th>
                <th className="pb-2 px-2">Vị trí / GPS</th>
                <th className="pb-2 px-2">Mạng kết nối</th>
                <th className="pb-2 px-2 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {attendees.map((sv) => (
                <tr key={sv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-2 text-cyan-300 font-bold">{sv.studentId}</td>
                  <td className="py-2.5 px-2 font-sans text-slate-200">{sv.fullName}</td>
                  <td className="py-2.5 px-2 text-slate-400">{sv.time}</td>
                  <td className="py-2.5 px-2 text-slate-300">
                    <span className="flex items-center space-x-1 text-[10px]">
                      <MapPin size={11} className="text-cyan-400" />
                      <span>{sv.distance || 'Hợp lệ'}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 font-sans text-[10px]">{sv.network || 'WiFi'}</td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-sans font-semibold">
                      Đã xác thực
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
