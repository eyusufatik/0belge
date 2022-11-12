// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IVerifier {
    function verifyProof(
        bytes calldata proof,
        uint[4] calldata inputs
    ) external view returns (bool);
}

contract Badge is ERC721, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PERIOD_SETTER_ROLE =
        keccak256("PERIOD_SETTER_ROLE");

    // User to doc type to validity time.
    mapping(address => mapping(bytes32 => uint256)) private validUntil;
    mapping(uint256 => bytes32) private tokenIdToDocType;
    mapping(address => mapping(bytes32 => uint256)) private docToTokenId;
    mapping(bytes32 => uint256) private docTypeToValidityPeriod;

    IVerifier public immutable verifier;

    constructor(
        address _burner,
        address _periodSetter,
        address _verifier
    ) ERC721("Belge Sistemi", "BELGE") {
        grantRole(BURNER_ROLE, _burner);
        grantRole(PERIOD_SETTER_ROLE, _periodSetter);

        verifier = IVerifier(_verifier);
    }

    function isValid(
        address _addr,
        bytes memory _docType
    ) public view returns (bool) {
        bytes32 docTypeHash = keccak256(_docType);

        // if address doesn't have a badge mapping will return 0, function will return false
        return
            _addr == ownerOf(docToTokenId[_addr][docTypeHash]) &&
            block.timestamp < validUntil[_addr][docTypeHash];
    }

    function setValidityPeriodForDocType(
        bytes memory _docType,
        uint256 _period
    ) public onlyRole(PERIOD_SETTER_ROLE) {
        docTypeToValidityPeriod[keccak256(_docType)] = _period;
    }

    function mint(
        bytes calldata _proof,
        bytes32 _docHash,
        uint248[3] calldata _nums
    ) public {
        require(
            verifier.verifyProof(
                _proof,
                [uint256(_docHash), _nums[0], _nums[1], _nums[2]]
            ),
            "IP-01"
        );

        bytes memory docType = numbersToBytes(_nums[0], _nums[1], _nums[2]);
        bytes32 docTypeHash = keccak256(docType);

        require(
            block.timestamp > validUntil[msg.sender][docTypeHash],
            "AHB-01"
        );

        validUntil[msg.sender][docTypeHash] =
            block.timestamp +
            docTypeToValidityPeriod[docTypeHash];

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        tokenIdToDocType[tokenId] = docTypeHash;
        docToTokenId[msg.sender][docTypeHash] = tokenId;
    }

    function burn(uint256 _tokenId) public override onlyRole(BURNER_ROLE) {
        _burn(_tokenId);
    }

    function numbersToBytes(
        uint248 _num1,
        uint248 _num2,
        uint248 _num3
    ) private pure returns (bytes memory) {
        bytes memory docType = abi.encodePacked(_num1, _num2, _num3);
        return docType;
    }

    // Below stuff is to prevent NFT's from transferring

    function transferChecker(address from, address to) internal pure {
        if (from != address(0) || to != address(0)) {
            revert("SBT-01");
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 id
    ) public override {
        transferChecker(from, to);
        super.transferFrom(from, to, id);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id
    ) public override {
        transferChecker(from, to);
        super.safeTransferFrom(from, to, id);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
