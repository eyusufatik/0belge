// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Badge.sol";

contract StudentBadge is Badge {
    struct StudentData {
        string schoolName;
        uint256 gpa; // e.g. 4.3 / 5 is 860 / 1000
    }

    mapping(uint256 => StudentData) public idToBadgeInfo;

    constructor(
        uint256 _defaultValidityPeriod
    )
        Badge(
            "Ogrenci oldugunu gosteren NFT",
            "OGRENCI",
            _defaultValidityPeriod
        )
    {}

    function mint(
        string memory school,
        uint256 gpa,
        bytes memory _proof
    ) public {
        // TODO: verify proof
        // TODO: check gpa interval

        uint256 tokenId = super.mint(msg.sender);

        idToBadgeInfo[tokenId] = StudentData(school, gpa);
    }
}
