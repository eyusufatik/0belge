import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
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
                    ethers.utils.toUtf8Bytes("Öğrenci").reverse(),
                    tenDays
                );
        });

        it("should mint", async () => {
            const { user1 } = await getAccounts();

            const proof =
                "0x1e35ecc12a805178fb732ee2c8dd9d318dbe71ab3fc8a65cc0de5e73dd2592410888ac7e2930506d1694d93fabccf11ecfdfa11b9520e3e2a99aad6f2bd79ab124b691c79610cab4dbe417acbb8223c3f9dc7fe111edc317285e04be44837799223bf7f74add9df15148bb0514f469e738a26204fb6c5ee1c32cdf744a1e652813538854fcc3d846b891aaa77440f86e7870f861d21ffa29456211ce344309a32190ea70a6279414f58b4e07c4a111c21ddf098ca18924c457d9c235d1dfe8d60a23f5ee29db3b84984b3eec2855818209d86c9fdbdef58972afec4ab929eb161a6c082310329fd6d78a80fdc01d30b68a6f66d64e4741841b614aff86b7d4fa";
            const docHash =
                "0x256f5e7bbb6b7ca0837c2914f647e305e0ae5a49b8ab0dd5b96d1b6df601ed28";
            const nums = [
                BigNumber.from(
                    "0x000000000000000000000000000000000000000000000069636e65729fc496c3"
                ),
                BigNumber.from(
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                ),
                BigNumber.from(
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                ),
            ];
            await badgingCtc.connect(user1).mint(proof, docHash, nums);

            expect(
                await badgingCtc.isValid(
                    user1.address,
                    ethers.utils.toUtf8Bytes("Öğrenci").reverse()
                )
            ).to.be.true;
        });
    });

    describe("Burning", async () => {});
});
