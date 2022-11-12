// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Badge.sol";

contract StudentBadge is Badge {
    struct StudentData {
        string schoolName;
        uint8 year; // e.g. 2 / 3
    }

    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    mapping(uint256 => StudentData) public idToBadgeInfo;

    constructor(
        address burner,
        uint256 _defaultValidityPeriod
    )
        Badge(
            "Ogrenci oldugunu gosteren NFT",
            "OGRENCI",
            _defaultValidityPeriod
        )
    {
        grantRole(BURNER_ROLE, burner);
    }

    function mint(
        string memory school,
        uint8 year,
        bytes memory _proof
    ) public {
        // TODO: verify proof
        // TODO: check gpa interval

        uint256 tokenId = super.mint(msg.sender);

        idToBadgeInfo[tokenId] = StudentData(school, year);
    }

    // TODO: get over OOP issues with name "burn"
    function invalidate(uint256 _tokenId) public onlyRole(BURNER_ROLE) {
        super.burn(_tokenId);
    }
}
