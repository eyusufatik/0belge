// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Badge.sol";

contract StudentBadge is Badge {
    mapping(uint256 => string) public schoolNames;

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
        string memory _school,
        bytes calldata _proof,
        bytes32 _docHash,
        uint248[3] calldata _nums
    ) public {
        require(
            verifier.verifyProof(
                _proof,
                [uint256(_docHash), _nums[0], _nums[1], _nums[2]]
            ),
            "Invalid proof"
        );
        // TODO: check gpa interval

        uint256 tokenId = super.mint(msg.sender);

        schoolNames[tokenId] = _school;
    }

    // TODO: get over OOP issues with name "burn"
    function invalidate(uint256 _tokenId) public onlyRole(BURNER_ROLE) {
        super.burn(_tokenId);
    }
}
