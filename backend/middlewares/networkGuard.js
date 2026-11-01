// middlewares/networkGuard.js
import ipRangeCheck from 'ip-range-check';

// Danh sách các dải IP Public NAT Gateway của Trường (Ví dụ minh họa cấu hình mạng trường)
export const UTH_CAMPUS_IP_RANGES = [
  '118.69.130.0/24',      // Dải IP Gateway Cơ sở 1 (Bình Thạnh)
  '14.161.22.0/24',       // Dải IP Gateway Cơ sở 2
  '171.244.10.0/24',      // Dải IP Gateway Phòng Lab An toàn Thông tin
  '127.0.0.1',            // Hỗ trợ kiểm thử Localhost IPv4
  '::1',                  // Hỗ trợ kiểm thử Localhost IPv6
  '::ffff:127.0.0.1'
];

/**
 * Lấy IP Client thực tế của thiết bị
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Trường hợp đi qua nhiều tầng proxy: "client, proxy1, proxy2" -> lấy IP đầu tiên
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Middleware bắt buộc kết nối Wi-Fi trường
 */
export function requireCampusNetwork(req, res, next) {
  const clientIp = getClientIp(req);
  const isInsideCampus = ipRangeCheck(clientIp, UTH_CAMPUS_IP_RANGES);

  if (!isInsideCampus) {
    return res.status(403).json({
      success: false,
      errorCode: 'ERR_NETWORK_POLICY_VIOLATION',
      message: 'Từ chối điểm danh: Thiết bị không kết nối Wi-Fi trường (UTH-Secure).',
      detectedIp: clientIp
    });
  }

  req.clientIp = clientIp;
  req.isCampusNetwork = true;
  next();
}

