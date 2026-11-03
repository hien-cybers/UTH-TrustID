// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry (UTH-TrustID Identity Lifecycle & Merkle Batch Registry)
 * @dev Quản lý vòng đời định danh phi tập trung (W3C DID), Merkle Root O(log N),
 *      thu hồi khóa khẩn cấp revokeKey(old_address) và cấp lại khi mất thiết bị (KYC Recovery).
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

    // Ánh xạ từ địa chỉ ví sang bản ghi danh tính
    mapping(address => IdentityRecord) public identities;
    // Lưu vết các Merkle Root đã phát hành theo lô (Batch VC Issuance)
    mapping(bytes32 => bool) public anchoredMerkleRoots;

    event IdentityRegistered(address indexed owner, string didUri, uint256 timestamp);
    event IdentityRevoked(address indexed owner, uint256 timestamp);
    event KeyRevokedByAdmin(address indexed oldAddress, address indexed admin, uint256 timestamp);
    event KeyRecoveredAndReissued(
        address indexed oldAddress,
        address indexed newAddress,
        bytes32 indexed newMerkleRoot,
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
        require(identities[_owner].owner != address(0), "Danh tinh chua duoc dang ky");
        require(!identities[_owner].isRevoked, "Danh tinh da bi thu hoi (Revoked)");
        _;
    }

    /**
     * @notice Neo gốc Merkle Root khi phát hành lô Thẻ Sinh Viên Số (Batch VC)
     */
    function anchorMerkleRoot(bytes32 _merkleRoot) external onlyAdmin {
        currentMerkleRoot = _merkleRoot;
        anchoredMerkleRoots[_merkleRoot] = true;
        emit MerkleRootAnchored(_merkleRoot, block.timestamp);
    }

    /**
     * @notice Đăng ký danh tính số mới lên Blockchain
     * @param _didUri Chuỗi định danh DID của người dùng
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

        emit IdentityRegistered(msg.sender, _didUri, block.timestamp);
    }

    /**
     * @notice Người dùng tự thu hồi danh tính khi nghi ngờ lộ khóa
     */
    function revokeIdentity() external onlyActiveIdentity(msg.sender) {
        identities[msg.sender].isRevoked = true;
        emit IdentityRevoked(msg.sender, block.timestamp);
    }

    /**
     * @notice [BƯỚC 2 - ON-CHAIN REVOCATION] Quản trị viên thu hồi khóa của điện thoại bị mất
     * @param old_address Địa chỉ ví trên thiết bị cũ của sinh viên cần khóa vĩnh viễn
     */
    function revokeKey(address old_address) external onlyAdmin {
        require(old_address != address(0), "Dia chi vi khong hop le");
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
     * @notice [BƯỚC 2 - SOCIAL / KYC RECOVERY] Thu hồi khóa máy cũ và cấp lại khóa máy mới kèm Merkle Root mới
     * @param old_address Địa chỉ ví trên máy cũ bị mất
     * @param new_address Địa chỉ ví mới sinh trên điện thoại mới của sinh viên
     * @param newDidUri Chuỗi DID mới
     * @param newMerkleRoot Gốc Merkle Root mới đã cập nhật lá của thiết bị mới
     */
    function recoverAndReissueKey(
        address old_address,
        address new_address,
        string calldata newDidUri,
        bytes32 newMerkleRoot
    ) external onlyAdmin {
        require(new_address != address(0) && new_address != old_address, "Dia chi vi moi khong hop le");

        // 1. Vô hiệu hóa khóa cũ vĩnh viễn
        identities[old_address].isRevoked = true;
        identities[old_address].replacedBy = new_address;

        // 2. Cấp phát bản ghi danh tính cho khóa mới
        identities[new_address] = IdentityRecord({
            owner: new_address,
            didUri: newDidUri,
            createdAt: block.timestamp,
            isRevoked: false,
            replacedBy: address(0)
        });

        // 3. Cập nhật Merkle Root mới trên chuỗi
        currentMerkleRoot = newMerkleRoot;
        anchoredMerkleRoots[newMerkleRoot] = true;

        emit KeyRevokedByAdmin(old_address, msg.sender, block.timestamp);
        emit KeyRecoveredAndReissued(old_address, new_address, newMerkleRoot, block.timestamp);
    }

    /**
     * @notice Kiểm tra tính hợp lệ của danh tính
     */
    function isValidIdentity(address _owner) external view returns (bool) {
        return (identities[_owner].owner != address(0) && !identities[_owner].isRevoked);
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
