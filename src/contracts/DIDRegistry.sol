// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry (UTH-TrustID Decoupled 2-Layer Revocation & Merkle Batch Registry)
 * @dev Giải quyết triệt để Điểm nghẽn ③ (Nghịch lý Cập nhật Merkle Root khi Thu hồi Khóa):
 *      - Tầng 1 (Static Batch): `currentMerkleRoot` cố định theo từng học kỳ/khóa học.
 *        Khi 1 sinh viên mất máy, KHÔNG tính lại `MerkleRoot` để bảo toàn hiệu lực
 *        `merkleProof` đang lưu trong điện thoại của 9.999 sinh viên còn lại.
 *      - Tầng 2 (Dynamic Revocation & Delegation Mapping):
 *        Sử dụng `mapping(address => bool) public isRevoked` và `keyDelegation` độc lập.
 *        Hàm xác thực kiểm tra kép:
 *        `verifyMerkleProof(proof, root, leaf) == true && isRevoked[studentAddr] == false`
 */
contract DIDRegistry {
    struct IdentityRecord {
        address owner;          // Địa chỉ ví chủ sở hữu hiện hành
        string didUri;          // Chuỗi định danh W3C (did:ethr:polygon:0x...)
        uint256 createdAt;      // Dấu thời gian khởi tạo
        bool isRevoked;         // Trạng thái thu hồi danh tính
        address replacedBy;     // Địa chỉ ví mới nếu đã thực hiện Key Recovery
    }

    address public universityAdmin;
    bytes32 public currentMerkleRoot;

    // [TẦNG 1 - STATIC MERKLE BATCH ROOTS]
    mapping(bytes32 => bool) public anchoredMerkleRoots;

    // [TẦNG 2 - DYNAMIC REVOCATION REGISTRY ĐỘC LẬP]
    // Tách biệt hoàn toàn khỏi Merkle Tree để thu hồi O(1) mà không làm hỏng Proof của SV khác
    mapping(address => bool) public isRevoked;
    mapping(address => address) public keyDelegation;
    mapping(address => IdentityRecord) public identities;

    event IdentityRegistered(address indexed owner, string didUri, uint256 timestamp);
    event IdentityRevoked(address indexed owner, uint256 timestamp);
    event KeyRevokedByAdmin(address indexed oldAddress, address indexed admin, uint256 timestamp);
    event KeyRecoveredAndReissued(
        address indexed oldAddress,
        address indexed newAddress,
        bytes32 indexed preservedOrNewMerkleRoot,
        uint256 timestamp
    );
    event MerkleRootAnchored(bytes32 indexed merkleRoot, uint256 timestamp);

    constructor() {
        universityAdmin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == universityAdmin, "Chi Root Admin UTH moi co quyen thuc thi");
        _;
    }

    modifier onlyActiveIdentity(address _owner) {
        require(!isRevoked[_owner], "Identity Revoked on Chain");
        require(identities[_owner].owner != address(0), "Danh tinh chua duoc dang ky");
        require(!identities[_owner].isRevoked, "Identity Revoked on Chain");
        _;
    }

    /**
     * @notice Neo gốc Merkle Root cố định theo từng học kỳ (Static Batch Issuance)
     */
    function anchorMerkleRoot(bytes32 _merkleRoot) external onlyAdmin {
        currentMerkleRoot = _merkleRoot;
        anchoredMerkleRoots[_merkleRoot] = true;
        emit MerkleRootAnchored(_merkleRoot, block.timestamp);
    }

    /**
     * @notice Đăng ký danh tính số mới lên Blockchain
     */
    function registerIdentity(string calldata _didUri) external {
        require(identities[msg.sender].owner == address(0), "Danh tinh da ton tai");

        identities[msg.sender] = IdentityRecord({
            owner: msg.sender,
            didUri: _didUri,
            createdAt: block.timestamp,
            isRevoked: false,
            replacedBy: address(0)
        });
        isRevoked[msg.sender] = false;

        emit IdentityRegistered(msg.sender, _didUri, block.timestamp);
    }

    /**
     * @notice Người dùng tự thu hồi danh tính khi nghi ngờ lộ khóa
     */
    function revokeIdentity() external onlyActiveIdentity(msg.sender) {
        identities[msg.sender].isRevoked = true;
        isRevoked[msg.sender] = true;
        emit IdentityRevoked(msg.sender, block.timestamp);
    }

    /**
     * @notice [ĐIỂM NGHẼN ③ - DECOUPLED ON-CHAIN REVOCATION]
     *         Quản trị viên thu hồi khóa của điện thoại bị mất bằng `isRevoked[old_address] = true`.
     *         KHÔNG thay đổi `currentMerkleRoot`, đảm bảo 9.999 sinh viên khác không bị lỗi Proof!
     * @param old_address Địa chỉ ví trên thiết bị cũ của sinh viên cần khóa vĩnh viễn
     */
    function revokeKey(address old_address) external onlyAdmin {
        require(old_address != address(0), "Dia chi vi khong hop le");
        isRevoked[old_address] = true;

        if (identities[old_address].owner == address(0)) {
            identities[old_address] = IdentityRecord({
                owner: old_address,
                didUri: "did:ethr:polygon:revoked",
                createdAt: block.timestamp,
                isRevoked: true,
                replacedBy: address(0)
            });
        } else {
            identities[old_address].isRevoked = true;
        }

        emit KeyRevokedByAdmin(old_address, msg.sender, block.timestamp);
    }

    /**
     * @notice [SOCIAL / KYC RECOVERY] Thu hồi khóa máy cũ và ủy quyền sang khóa máy mới
     *         Giữ nguyên hiệu lực các Merkle Root cũ trong `anchoredMerkleRoots` để không
     *         làm gián đoạn việc điểm danh của toàn trường.
     */
    function recoverAndReissueKey(
        address old_address,
        address new_address,
        string calldata newDidUri,
        bytes32 optionalNewMerkleRoot
    ) external onlyAdmin {
        require(new_address != address(0) && new_address != old_address, "Dia chi vi moi khong hop le");

        // 1. Vô hiệu hóa khóa cũ vĩnh viễn trong Sổ bộ Thu hồi độc lập
        isRevoked[old_address] = true;
        identities[old_address].isRevoked = true;
        identities[old_address].replacedBy = new_address;
        keyDelegation[old_address] = new_address;

        // 2. Cấp phát bản ghi danh tính cho khóa mới
        isRevoked[new_address] = false;
        identities[new_address] = IdentityRecord({
            owner: new_address,
            didUri: newDidUri,
            createdAt: block.timestamp,
            isRevoked: false,
            replacedBy: address(0)
        });

        // 3. Nếu có bổ sung Merkle Root phụ thì thêm vào mapping mà KHÔNG xóa Root cũ
        if (optionalNewMerkleRoot != bytes32(0)) {
            currentMerkleRoot = optionalNewMerkleRoot;
            anchoredMerkleRoots[optionalNewMerkleRoot] = true;
        }

        emit KeyRevokedByAdmin(old_address, msg.sender, block.timestamp);
        emit KeyRecoveredAndReissued(old_address, new_address, currentMerkleRoot, block.timestamp);
    }

    /**
     * @notice Kiểm tra tính hợp lệ của danh tính
     */
    function isValidIdentity(address _owner) external view returns (bool) {
        return (!isRevoked[_owner] && !identities[_owner].isRevoked);
    }

    /**
     * @notice Kiểm tra kép 2 tầng (Merkle Proof O(log N) + Revocation Mapping O(1))
     */
    function verifyStudentAttendanceStatus(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf,
        address studentAddress
    ) external view returns (bool) {
        if (isRevoked[studentAddress] || identities[studentAddress].isRevoked) {
            return false;
        }
        if (!anchoredMerkleRoots[root] && root != currentMerkleRoot) {
            return false;
        }
        return verifyMerkleProof(proof, root, leaf);
    }

    /**
     * @notice Đối soát Merkle Proof O(log N) trực tiếp trên Smart Contract (OpenZeppelin sorted pairs)
     */
    function verifyMerkleProof(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash == root;
    }

    /**
     * @notice Xác thực chữ ký số EIP-191 và đối soát với danh tính hợp lệ trên chuỗi
     */
    function verifyAuthentication(
        address _signer,
        bytes32 _messageHash,
        bytes memory _signature
    ) external view onlyActiveIdentity(_signer) returns (bool) {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );

        return recoverSigner(ethSignedMessageHash, _signature) == _signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig)
        internal
        pure
        returns (address)
    {
        require(_sig.length == 65, "Do dai chu ky khong hop le");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }
}
