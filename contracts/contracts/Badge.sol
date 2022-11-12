// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract Badge is ERC721, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(address => uint256) internal validUntil;
    uint256 internal defaultValidityPeriod;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _defaultValidityPeriod
    ) ERC721(_name, _symbol) {
        defaultValidityPeriod = _defaultValidityPeriod;
    }

    function isStillValid(address addr) public view returns (bool) {
        // if address doesn't have a badge mapping will return 0, function will return false
        return block.timestamp < validUntil[addr];
    }

    function mint(address _to) internal returns (uint256) {
        require(
            balanceOf(_to) == 0 ||
                (balanceOf(_to) > 0 && block.timestamp > validUntil[_to]),
            "Address already has valid badge!"
        );

        // TODO: if second cond. burn the expired one

        validUntil[_to] = block.timestamp + defaultValidityPeriod;

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to, tokenId);
        return tokenId;
    }

    function transferChecker(address from, address to) internal pure {
        if (from != address(0) || to != address(0)) {
            revert("SBT: Only soulbound transfers allowed");
        }
    }

    function transferFrom(address from, address to, uint256 id) public override {
        transferChecker(from, to);
        super.transferFrom(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id) public override {
        transferChecker(from, to);
        super.safeTransferFrom(from, to, id);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
