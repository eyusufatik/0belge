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
        await badgingCtc.hasRole(await badgingCtc.BURNER_ROLE(), burner.address)
      ).to.be.true;

      expect(
        await badgingCtc.hasRole(
          await badgingCtc.PERIOD_SETTER_ROLE(),
          periodSetter.address
        )
      ).to.be.true;

      expect(await badgingCtc.verifier()).to.be.equal(verifierCtc.address);
    });

    it("period setter should set periods", async () => {
      const { other1, periodSetter } = await getAccounts();

      const tenDays = BigNumber.from(60 * 60 * 24 * 10);

      // set öğrenci doc type valid for 10 days
      badgingCtc
        .connect(periodSetter)
        .setValidityPeriodForDocType(ethers.utils.toUtf8Bytes("öğrenci"), tenDays);

      expect(await badgingCtc.docTypeToValidityPeriod(ethers.utils.toUtf8Bytes("öğrenci"))).to.equal(
        tenDays
      );

      await expect(
        badgingCtc
          .connect(other1)
          .setValidityPeriodForDocType(ethers.utils.toUtf8Bytes("öğrenci"), tenDays)
      ).to.be.revertedWith(`AccessControl: account ${other1.address.toLocaleLowerCase()} is missing role ${await badgingCtc.PERIOD_SETTER_ROLE()}`);
    });
  });
});
