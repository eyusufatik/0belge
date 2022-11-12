// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Badge.sol";

contract StudentBadge is Badge {
    struct StudentData {
        string schoolName;
        uint256 gpa; // e.g. 4.3 / 5 is 860 / 1000
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
        uint256 gpa,
        bytes memory _proof
    ) public {
        // TODO: verify proof
        // TODO: check gpa interval

        uint256 tokenId = super.mint(msg.sender);

        idToBadgeInfo[tokenId] = StudentData(school, gpa);
    }

    // TODO: get over OOP issues with name "burn"
    function invalidate(uint256 _tokenId) public onlyRole(BURNER_ROLE) {
        super.burn(_tokenId);
    }
}
