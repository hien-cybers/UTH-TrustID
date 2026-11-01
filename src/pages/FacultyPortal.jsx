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
  Radio
} from 'lucide-react';
import { NETWORK_CONFIG } from '../services/did';

export default function FacultyPortal() {
  const [courseName, setCourseName] = useState('An Toàn Mạng & Mật Mã Ứng Dụng (N01)');
  const [room, setRoom] = useState('Phòng Lab B302');
  const [sessionType, setSessionType] = useState('attendance'); // 'attendance' | 'exam'
  const [sessionId, setSessionId] = useState('SESSION_' + Date.now().toString(36));
  const [attendees, setAttendees] = useState([
    {
      id: 'sv_1',
      studentId: '2251120000',
      fullName: 'Sinh viên UTH',
      time: '12:45:10',
      verified: true,
      address: '0x1D9b6938A3f073e3426052C7016155D85040Ed1D'
    }
  ]);

  const refreshQR = () => {
    const newSession = 'SESSION_' + Date.now().toString(36);
    setSessionId(newSession);
  };

  const qrPayload = {
    action: 'faculty_checkin',
    domain: 'nckh-auth.edu.vn',
    courseName,
    room,
    type: sessionType,
    sessionId,
    chainId: NETWORK_CONFIG.chainId,
    contractAddress: NETWORK_CONFIG.contractAddress,
    timestamp: Date.now()
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <GraduationCap size={24} />
            <h2 className="font-bold text-lg sm:text-xl text-slate-100">
              Cổng Giảng Viên - Quản Lý Điểm Danh & Khảo Thí
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Khởi tạo phiên điểm danh số và đối soát thẻ sinh viên W3C DID không mật khẩu
          </p>
        </div>

        <button
          onClick={refreshQR}
          className="flex items-center space-x-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Làm mới phiên QR</span>
        </button>
      </div>

      {/* Main Grid: QR Presentation + Session Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Display for Projector / Classroom screen */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full mb-4">
            <Radio size={14} className="animate-pulse" />
            <span>Phiên đang mở - Sinh viên mở Ví DID để quét</span>
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-2xl transition transform hover:scale-[1.01] mb-4">
            <QRCodeSVG
              value={JSON.stringify(qrPayload)}
              size={230}
              level="M"
              includeMargin={false}
              className="w-48 h-48 sm:w-56 sm:h-56"
            />
          </div>

          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Mã phiên:</span>
              <span className="text-cyan-400 font-bold">{sessionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Loại phiên:</span>
              <span className="text-slate-300 font-sans">
                {sessionType === 'attendance' ? 'Điểm danh học phần' : 'Phòng thi khảo thí'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Mạng đối soát:</span>
              <span className="text-emerald-400">Polygon Amoy (80002)</span>
            </div>
          </div>
        </div>

        {/* Right: Session Info & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <BookOpen size={16} className="text-cyan-400" />
              <span>Thông tin Lớp học & Buổi thi</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tên học phần / Lớp tín chỉ:</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Phòng học / Giảng đường:</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Sinh viên có mặt</span>
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-cyan-400" />
                <span className="text-xl font-bold text-slate-100">{attendees.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Xác thực On-chain</span>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xl font-bold text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-slate-200 flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Danh Sách Sinh Viên Đã Quét Thẻ ({attendees.length})</span>
          </h3>

          <button
            onClick={() => alert('Đã xuất báo cáo điểm danh file .xlsx thành công!')}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
          >
            <Download size={14} />
            <span>Xuất Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                <th className="pb-2 px-2">MSSV</th>
                <th className="pb-2 px-2">Họ & Tên</th>
                <th className="pb-2 px-2">Thời gian quét</th>
                <th className="pb-2 px-2">Địa chỉ Ví DID</th>
                <th className="pb-2 px-2 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {attendees.map((sv) => (
                <tr key={sv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-2 text-cyan-300 font-bold">{sv.studentId}</td>
                  <td className="py-2.5 px-2 font-sans text-slate-200">{sv.fullName}</td>
                  <td className="py-2.5 px-2 text-slate-400">{sv.time}</td>
                  <td className="py-2.5 px-2 text-slate-400 truncate max-w-[150px]">{sv.address}</td>
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
