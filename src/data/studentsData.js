// src/data/studentsData.js

export const INITIAL_STUDENTS = [
  {
    mssv: "2251120000",
    fullName: "Nguyễn Văn An",
    major: "An toàn Thông tin",
    cohort: "2022 - 2026",
    classId: "ATTT2022.1",
    didAddress: "0x1D9b6938A3f073e3426052C7016155D85040Ed1D",
    qrCodeToken: "UTH_HASH_SEC_9921a8f01", // Code mã hoá định danh
    status: "Active",
    registeredAt: "2024-09-01"
  },
  {
    mssv: "2251120001",
    fullName: "Trần Thị Bích",
    major: "An toàn Thông tin",
    cohort: "2022 - 2026",
    classId: "ATTT2022.1",
    didAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    qrCodeToken: "UTH_HASH_SEC_1102b4c77",
    status: "Active",
    registeredAt: "2024-09-01"
  },
  {
    mssv: "2251120002",
    fullName: "Lê Hoàng Cường",
    major: "Khoa học Máy tính",
    cohort: "2022 - 2026",
    classId: "KHMT2022.2",
    didAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    qrCodeToken: "UTH_HASH_SEC_7723dd88a",
    status: "Revoked",
    registeredAt: "2024-09-02"
  }
];

// Hàm phụ trợ tính khoảng cách Haversine (mét) giữa 2 toạ độ GPS
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Bán kính Trái Đất theo mét (6,371,000 m)
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Trả về số mét nguyên
}
