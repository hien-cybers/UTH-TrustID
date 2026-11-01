// src/utils/merkleHelper.js - Chuẩn hóa Merkle Tree & Solidity Packed Keccak256
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';

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
 * 2. Hàm dựng cây Merkle, tính Root và sinh Proof cho toàn bộ danh sách
 * @param {Array} studentsList - Mảng JSON sinh viên
 * @returns {Object} { rootHash, tree, studentCredentials }
 */
export function generateMerkleCredentials(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    throw new Error('Danh sách sinh viên rỗng hoặc không đúng định dạng!');
  }

  // Bước A: Băm từng sinh viên thành mảng các nốt lá (Leaves)
  const leaves = studentsList.map((st) => hashStudent(st));

  // Bước B: Dựng cây Merkle Tree (sortPairs: true để sắp xếp thứ tự nốt, chuẩn OpenZeppelin)
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Bước C: Lấy chuỗi băm gốc (Merkle Root)
  const rootHash = tree.getHexRoot();

  // Bước D: Sinh Merkle Proof riêng biệt cho từng sinh viên
  const studentCredentials = studentsList.map((st, index) => {
    const leaf = leaves[index];
    const proof = tree.getHexProof(leaf); // Mảng các hash phụ trợ để đối soát

    return {
      ...st,
      leafHash: leaf,
      merkleProof: proof, // Sinh viên lưu mảng proof này trong Thẻ số/Ví
      merkleRoot: rootHash,
      issuedAt: new Date().toISOString()
    };
  });

  return {
    rootHash,
    tree,
    studentCredentials
  };
}

/**
 * 3. Hàm kiểm tra tính hợp lệ của một sinh viên dựa vào Proof và Root
 * (Có thể chạy trực tiếp trên Frontend hoặc Backend mà không cần duyệt toàn bộ danh sách)
 */
export function verifyStudentCredential(student, proof, rootHash) {
  const leaf = hashStudent(student);
  return MerkleTree.verify(proof, leaf, rootHash, keccak256, { sortPairs: true });
}
