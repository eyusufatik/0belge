import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { Badge, Verifier } from "../typechain-types";

import { getAccounts } from "./helpers";

describe("Badge", function () {
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

            const tenDays = BigNumber.from(60 * 60 * 24 * 10);

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
        });

        it("should mint", async () => {
            const { user1 } = await getAccounts();

            const proof =
                "0x1e35ecc12a805178fb732ee2c8dd9d318dbe71ab3fc8a65cc0de5e73dd2592410888ac7e2930506d1694d93fabccf11ecfdfa11b9520e3e2a99aad6f2bd79ab124b691c79610cab4dbe417acbb8223c3f9dc7fe111edc317285e04be44837799223bf7f74add9df15148bb0514f469e738a26204fb6c5ee1c32cdf744a1e652813538854fcc3d846b891aaa77440f86e7870f861d21ffa29456211ce344309a32190ea70a6279414f58b4e07c4a111c21ddf098ca18924c457d9c235d1dfe8d60a23f5ee29db3b84984b3eec2855818209d86c9fdbdef58972afec4ab929eb161a6c082310329fd6d78a80fdc01d30b68a6f66d64e4741841b614aff86b7d4fa";
            const docHash =
                "0x256f5e7bbb6b7ca0837c2914f647e305e0ae5a49b8ab0dd5b96d1b6df601ed28";

            const x = ["0x01a605e52d15e62b4627ff036bead6d3b0dd20d8e8b128df3276dca0b6e7d35d0c41b17b4d9eafe25835dab78900cfccd536c4acd5aacf9f276a1b81d246d0ad09be931d47ea16c36e86f3943656d57e3465e8bb1dd80cacc7ea890b2bf3e75c0747126fe0c1058095a72f1250e7b474ec9aef2035936cdc9c99cd68783194d227a934e20859d9d145498115346b912caa457751ef4b3103ff04ec9ba41127df129aede215983e59af744f6e4359d4bdc5242c0c6de6599a4704c6343e19972925217a75e1c4af8ecb4765977eb7a156915bfa844fd274a8ca825937d900462f058c2fe8db9b1aa16219722f13a37e37e2817dd1e1ee77d7f05a79a787668210","0x12edd9a2ac653753eba2838e0a3d20072e91dcd3f82229cb9c6790cf18e30043",["0x000000000000000000000000000000000000000000000069636e65729fc496c3","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"]]
            
            await badgingCtc
                .connect(user1)
                .mint(x[0], x[1], x[2]);

            expect(
                await badgingCtc.isValid(
                    user1.address,
                    ethers.utils.toUtf8Bytes("Öğrenci")
                )
            ).to.be.true;
        });
    });

    describe("Burning", async () => {});
});
