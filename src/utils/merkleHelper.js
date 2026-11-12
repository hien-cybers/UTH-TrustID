// src/utils/merkleHelper.js - Chuẩn hóa Merkle Tree & Solidity Packed Keccak256 (100% Browser & iOS WKWebView Native với ethers v6)
import { ethers } from 'ethers';

function hashPairSorted(a, b) {
  const normA = a.toLowerCase();
  const normB = b.toLowerCase();
  const [first, second] = normA < normB ? [a, b] : [b, a];
  return ethers.keccak256(ethers.concat([first, second]));
}

/**
 * 1. Hàm băm thông tin sinh viên thành 1 Leaf Hash (Nốt lá)
 * Sử dụng ethers.solidityPackedKeccak256 để tương thích hoàn toàn với Smart Contract Solidity
 */
export function hashStudent(student) {
  const sId = String(student.studentId || student.mssv || '2251120000');
  const name = String(student.fullName || 'Sinh viên UTH');
  const major = String(student.major || 'An toàn Thông tin');
  let addr = '0x0000000000000000000000000000000000000000';
  try {
    addr = student.address ? ethers.getAddress(student.address) : addr;
  } catch {
    addr = '0x0000000000000000000000000000000000000000';
  }

  return ethers.solidityPackedKeccak256(
    ['string', 'string', 'string', 'address'],
    [sId, name, major, addr]
  );
}

/**
 * 2. Hàm dựng cây Merkle, tính Root và sinh Proof cho toàn bộ danh sách (Sorted Pairs chuẩn OpenZeppelin)
 * @param {Array} studentsList - Mảng JSON sinh viên
 * @returns {Object} { rootHash, tree, studentCredentials }
 */
export function generateMerkleCredentials(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    throw new Error('Danh sách sinh viên rỗng hoặc không đúng định dạng!');
  }

  // Bước A: Băm từng sinh viên thành mảng các nốt lá (Leaves)
  const leaves = studentsList.map((st) => hashStudent(st));

  // Bước B: Dựng các tầng của cây Merkle Tree (sortPairs: true chuẩn OpenZeppelin)
  const layers = [leaves];
  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(hashPairSorted(currentLevel[i], currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    layers.push(nextLevel);
    currentLevel = nextLevel;
  }

  // Bước C: Lấy chuỗi băm gốc (Merkle Root)
  const rootHash = layers[layers.length - 1][0] || ethers.ZeroHash;

  // Bước D: Sinh Merkle Proof riêng biệt cho từng sinh viên
  const studentCredentials = studentsList.map((st, index) => {
    const leaf = leaves[index];
    const proof = [];
    let idx = index;
    for (let level = 0; level < layers.length - 1; level++) {
      const layer = layers[level];
      const isRightNode = idx % 2 === 1;
      const siblingIdx = isRightNode ? idx - 1 : idx + 1;
      if (siblingIdx < layer.length) {
        proof.push(layer[siblingIdx]);
      }
      idx = Math.floor(idx / 2);
    }

    return {
      ...st,
      leafHash: leaf,
      merkleProof: proof,
      merkleRoot: rootHash,
      issuedAt: new Date().toISOString()
    };
  });

  return {
    rootHash,
    tree: { layers, getHexRoot: () => rootHash },
    studentCredentials
  };
}

/**
 * 3. Hàm kiểm tra tính hợp lệ của một sinh viên dựa vào Proof và Root
 */
export function verifyStudentCredential(student, proof, rootHash) {
  if (!Array.isArray(proof) || !rootHash) return false;
  let computedHash = hashStudent(student);
  for (const proofElement of proof) {
    computedHash = hashPairSorted(computedHash, proofElement);
  }
  return computedHash.toLowerCase() === String(rootHash).toLowerCase();
}


