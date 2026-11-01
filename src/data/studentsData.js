// src/data/studentsData.js
export const INITIAL_STUDENTS = [
  {
    mssv: "2251120000",
    fullName: "Nguyễn Đức Hiển",
    major: "An toàn Thông tin",
    cohort: "2022 - 2026",
    classId: "ATTT2022.1",
    sbd: "SBD-042",
    didAddress: "0x1D9b6938A3f073e3426052C7016155D85040Ed1D",
    qrCodeToken: "UTH_HASH_SEC_9921a8f01",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hien",
    registeredAt: "2024-09-01"
  },
  {
    mssv: "2251120001",
    fullName: "Trần Thị Bích",
    major: "An toàn Thông tin",
    cohort: "2022 - 2026",
    classId: "ATTT2022.1",
    sbd: "SBD-015",
    didAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    qrCodeToken: "UTH_HASH_SEC_1102b4c77",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Bich",
    registeredAt: "2024-09-01"
  },
  {
    mssv: "2251120002",
    fullName: "Lê Hoàng Cường",
    major: "Khoa học Máy tính",
    cohort: "2022 - 2026",
    classId: "KHMT2022.2",
    sbd: "SBD-088",
    didAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    qrCodeToken: "UTH_HASH_SEC_7723dd88a",
    status: "Revoked",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Cuong",
    registeredAt: "2024-09-02"
  },
  {
    mssv: "2251120003",
    fullName: "Phạm Minh Đức",
    major: "Mạng Máy tính & TT",
    cohort: "2022 - 2026",
    classId: "MMT2022.1",
    sbd: "SBD-102",
    didAddress: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    qrCodeToken: "UTH_HASH_SEC_3310fe99b",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Duc",
    registeredAt: "2024-09-02"
  }
];

// Tính khoảng cách giữa 2 toạ độ GPS bằng công thức Haversine (trả về mét)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
