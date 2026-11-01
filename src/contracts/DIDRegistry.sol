// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry
 * @dev Quản lý định danh phi tập trung (W3C DID) và xác thực chữ ký mật mã
 */
contract DIDRegistry {
    struct IdentityRecord {
        address owner;          // Địa chỉ ví chủ sở hữu
        string didUri;          // Chuỗi định danh W3C (did:ethr:0x...)
        uint256 createdAt;      // Dấu thời gian khởi tạo
        bool isRevoked;         // Trạng thái thu hồi danh tính
    }

    // Ánh xạ từ địa chỉ ví sang bản ghi danh tính
    mapping(address => IdentityRecord) public identities;

    event IdentityRegistered(address indexed owner, string didUri, uint256 timestamp);
    event IdentityRevoked(address indexed owner, uint256 timestamp);

    modifier onlyActiveIdentity(address _owner) {
        require(identities[_owner].owner != address(0), "Danh tinh chua duoc dang ky");
        require(!identities[_owner].isRevoked, "Danh tinh da bi thu hoi (Revoked)");
        _;
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
            isRevoked: false
        });

        emit IdentityRegistered(msg.sender, _didUri, block.timestamp);
    }

    /**
     * @notice Thu hồi danh tính khi bị mất khóa bí mật hoặc nghi ngờ lộ lọt
     */
    function revokeIdentity() external onlyActiveIdentity(msg.sender) {
        identities[msg.sender].isRevoked = true;
        emit IdentityRevoked(msg.sender, block.timestamp);
    }

    /**
     * @notice Kiểm tra tính hợp lệ của danh tính
     */
    function isValidIdentity(address _owner) external view returns (bool) {
        return (identities[_owner].owner != address(0) && !identities[_owner].isRevoked);
    }

    /**
     * @notice Xác thực chữ ký số EIP-191 và đối soát với danh tính hợp lệ trên chuỗi
     * @param _signer Địa chỉ ví thực hiện ký
     * @param _messageHash Mã băm thông điệp Challenge ban đầu
     * @param _signature Chữ ký số từ điện thoại gửi lên
     */
    function verifyAuthentication(
        address _signer,
        bytes32 _messageHash,
        bytes memory _signature
    ) external view onlyActiveIdentity(_signer) returns (bool) {
        // Tái tạo tiền tố chuẩn EIP-191: "\x19Ethereum Signed Message:\n32"
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );

        return recoverSigner(ethSignedMessageHash, _signature) == _signer;
    }

    /**
     * @dev Khôi phục địa chỉ người ký từ chữ ký ECDSA (ecrecover)
     */
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
