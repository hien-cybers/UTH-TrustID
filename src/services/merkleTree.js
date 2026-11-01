// src/services/merkleTree.js - Merkle Tree Generation & O(log N) Proof Verification
import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Băm một phần tử sinh viên thành Leaf Hash (keccak256)
 */
export function hashStudentLeaf(student) {
  const studentId = student.studentId || student.mssv || '2251120000';
  const address = student.address || student.didAddress || '0x0000000000000000000000000000000000000000';
  const fullName = student.fullName || 'Sinh viên UTH';
  const payload = `${studentId}:${address.toLowerCase()}:${fullName}`;
  return keccak256(toUtf8Bytes(payload));
}

/**
 * Xây dựng cây Merkle Tree từ mảng sinh viên và sinh Proof cho từng sinh viên
 */
export function buildMerkleTree(students) {
  if (!students || students.length === 0) {
    return { root: '0x0000000000000000000000000000000000000000000000000000000000000000', leaves: [], proofs: {}, levels: [] };
  }

  // 1. Tạo các lá cây (Leaves)
  const leaves = students.map((s, idx) => ({
    student: s,
    leafHash: hashStudentLeaf(s),
    index: idx
  }));

  // 2. Xây dựng các tầng cây (Levels)
  let currentLevel = leaves.map(l => l.leafHash);
  const levels = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        // Sắp xếp thứ tự băm chuẩn hóa (Sorted Pair)
        const combined = left.toLowerCase() < right.toLowerCase()
          ? left + right.slice(2)
          : right + left.slice(2);
        nextLevel.push(keccak256(combined));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  const root = currentLevel[0] || '0x00';

  // 3. Sinh Merkle Proof cho từng sinh viên với độ phức tạp O(log N)
  const proofs = {};
  students.forEach((s, idx) => {
    const proof = [];
    let currentIndex = idx;

    for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex++) {
      const level = levels[levelIndex];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (pairIndex < level.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          data: level[pairIndex]
        });
      }
      currentIndex = Math.floor(currentIndex / 2);
    }

    const key = s.studentId || s.mssv || `st_${idx}`;
    proofs[key] = proof;
  });

  return { root, leaves, levels, proofs };
}

/**
 * Kiểm tra tính toàn vẹn của một Merkle Proof (O(log N))
 */
export function verifyMerkleProof(leafHash, proof, root) {
  if (!leafHash || !proof || !root) return false;
  let computedHash = leafHash;

  for (const item of proof) {
    const sibling = item.data;
    if (item.position === 'left') {
      const combined = sibling.toLowerCase() < computedHash.toLowerCase()
        ? sibling + computedHash.slice(2)
        : computedHash + sibling.slice(2);
      computedHash = keccak256(combined);
    } else {
      const combined = computedHash.toLowerCase() < sibling.toLowerCase()
        ? computedHash + sibling.slice(2)
        : sibling + computedHash.slice(2);
      computedHash = keccak256(combined);
    }
  }

  return computedHash.toLowerCase() === root.toLowerCase();
}

/**
 * Module đo lường độ trễ hiệu năng mật mã (NCKH Benchmark Tool)
 */
export async function runCryptoBenchmark() {
  const results = {};

  // 1. Đo lường sinh cặp khóa ECDSA secp256k1
  const t0 = performance.now();
  const { Wallet } = await import('ethers');
  const sampleWallet = Wallet.createRandom();
  results.keygenMs = (performance.now() - t0).toFixed(2);

  // 2. Đo lường ký EIP-191
  const nonce = `benchmark_nonce_${Date.now()}`;
  const t1 = performance.now();
  const signature = await sampleWallet.signMessage(nonce);
  results.signEip191Ms = (performance.now() - t1).toFixed(2);

  // 3. Đo lường khôi phục địa chỉ ví qua ecrecover (verifyMessage)
  const t2 = performance.now();
  const { verifyMessage } = await import('ethers');
  const recovered = verifyMessage(nonce, signature);
  results.ecrecoverMs = (performance.now() - t2).toFixed(2);

  // 4. Đo lường tính toán khoảng cách Haversine
  const t3 = performance.now();
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;
  const lat1 = 10.7992;
  const lon1 = 106.7056;
  const lat2 = 10.7995;
  const lon2 = 106.7058;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  results.haversineMs = (performance.now() - t3).toFixed(3);

  // 5. Đo lường xây dựng Merkle Tree (100 sinh viên)
  const dummyStudents = Array.from({ length: 100 }, (_, i) => ({
    studentId: `225112${1000 + i}`,
    fullName: `Sinh viên Demo ${i}`,
    address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  }));
  const t4 = performance.now();
  const tree = buildMerkleTree(dummyStudents);
  results.merkleTreeMs = (performance.now() - t4).toFixed(2);

  results.sampleAddress = sampleWallet.address;
  results.recoveredMatches = recovered.toLowerCase() === sampleWallet.address.toLowerCase();

  return results;
}

