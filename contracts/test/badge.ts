import { expect } from "chai";
import { BigNumber, Bytes } from "ethers";
import { ethers, upgrades, network } from "hardhat";
import { Badge, Verifier } from "../typechain-types";
import { getAccounts } from "./helpers";

describe("Badge", function () {
    const tenDays = BigNumber.from(60 * 60 * 24 * 10);

    describe("Roles", async () => {
        let badgingCtc: Badge;
        let verifierCtc: Verifier;

        beforeEach(async function () {
            const { burner, periodSetter } = await getAccounts();

            const Verifier = await ethers.getContractFactory("Verifier");
            verifierCtc = await Verifier.deploy();

            const Badge = await ethers.getContractFactory("Badge");
            badgingCtc = await Badge.deploy(
                burner.address,
                periodSetter.address,
                verifierCtc.address
            );
        });

        it("should be deployed correctly", async () => {
            const { burner, periodSetter } = await getAccounts();

            expect(
                await badgingCtc.hasRole(
                    await badgingCtc.BURNER_ROLE(),
                    burner.address
                )
            ).to.be.true;

            expect(
                await badgingCtc.hasRole(
                    await badgingCtc.PERIOD_SETTER_ROLE(),
                    periodSetter.address
                )
            ).to.be.true;

            expect(await badgingCtc.verifier()).to.be.equal(
                verifierCtc.address
            );
        });

        it("period setter should set periods", async () => {
            const { other1, periodSetter } = await getAccounts();

            // set öğrenci doc type valid for 10 days
            badgingCtc
                .connect(periodSetter)
                .setValidityPeriodForDocType(
                    ethers.utils.toUtf8Bytes("öğrenci"),
                    tenDays
                );

            expect(
                await badgingCtc.docTypeToValidityPeriod(
                    ethers.utils.toUtf8Bytes("öğrenci")
                )
            ).to.equal(tenDays);

            await expect(
                badgingCtc
                    .connect(other1)
                    .setValidityPeriodForDocType(
                        ethers.utils.toUtf8Bytes("öğrenci"),
                        tenDays
                    )
            ).to.be.revertedWith(
                `AccessControl: account ${other1.address.toLocaleLowerCase()} is missing role ${await badgingCtc.PERIOD_SETTER_ROLE()}`
            );
        });
    });

    describe("Badging", async () => {
        let badgingCtc: Badge;
        let verifierCtc: Verifier;

        const proof =
            "0x05433396a101e2652adbe0698d4f172bc25444451e0674c1d95821266390fbdd29428122fa2ca3b823383927e1a883890caa6c124878286bfa9627a163f7b599238dfbc62ca68812aa8ca60c4ebf0f24d59c68c190648fb1a9e3bfd22592c0582c3974477dee40a8153556c8a4d237e595f0fdb68776980bda5c1c352265dbd6267ec4612c29025bbb9d4c4d9a07adc798a68fea6cfbea78340364a3479cf6b50e1b93c64c240ce4cdbfd4c5e68faa513db78ba39e8f93e6d24bd6711c4b0d541b8f9f2b2813c7a3f392f2acd53a02447aefbed1e80f1b3772bec990d8e7abf315245ba110792a25477db4b15a0a342cca1703de85226372bc45956be4c66834";
        const docHash =
            "0x06a737e23f2991b63c73865215a2b2e27df54aafefb9d1ce205e664fc809f118";
        const num = BigNumber.from("0x0000000000000000000000000000000000000000000000000000000000000077");

        beforeEach(async function () {
            const { burner, periodSetter } = await getAccounts();

            const Verifier = await ethers.getContractFactory("Verifier");
            verifierCtc = await Verifier.deploy();

            const Badge = await ethers.getContractFactory("Badge");
            badgingCtc = await Badge.deploy(
                burner.address,
                periodSetter.address,
                verifierCtc.address
            );

            await badgingCtc
                .connect(periodSetter)
                .setValidityPeriodForDocType(
                    "0x77",
                    tenDays
                );
        });

        it("should mint and expire", async () => {
            const { user1 } = await getAccounts();

            await expect(badgingCtc.connect(user1).mint(proof, docHash.replace("1", "9"), num)).to.be.revertedWith("IP-01");

            await badgingCtc.connect(user1).mint(proof, docHash, num);
        
            expect(
                await badgingCtc.isValid(
                    user1.address,
                    "0x77"
                )
            ).to.be.true;

            await network.provider.send("evm_increaseTime", [
                tenDays.toNumber(),
            ]);
            await network.provider.send("evm_mine");

            expect(
                await badgingCtc.isValid(
                    user1.address,
                    "0x77"
                )
            ).to.be.false;
        });

        it("should burn", async () => {
            const { user1, burner, other1 } = await getAccounts();

            await badgingCtc.connect(user1).mint(proof, docHash, num);

            const tokenId = await badgingCtc.docToTokenId(
                user1.address,
                ethers.utils.toUtf8Bytes("Öğrenci")
            );

            await expect(
                badgingCtc.connect(other1).burn(tokenId)
            ).to.be.rejectedWith(
                `AccessControl: account ${other1.address.toLocaleLowerCase()} is missing role ${await badgingCtc.BURNER_ROLE()}`
            );

            await badgingCtc.connect(burner).burn(tokenId);

            expect(await badgingCtc.balanceOf(user1.address)).to.equal(0);

            expect(
                await badgingCtc.isValid(
                    user1.address,
                    ethers.utils.toUtf8Bytes("Öğrenci")
                )
            ).to.be.false;
        });

        it("shouldn't transfer", async () => {
            const { user1, other1 } = await getAccounts();

            await badgingCtc.connect(user1).mint(proof, docHash, num);

            await expect(
                badgingCtc
                    .connect(user1)
                    .transferFrom(user1.address, other1.address, 0)
            ).to.be.revertedWith("SBT-01");
        });
    });
});
