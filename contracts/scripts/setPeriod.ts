import { ethers, upgrades } from "hardhat";

import { Badge } from "../typechain-types";

const badgeCtcAddress = "0xdC78e8665A0925173056C664c1E4dE16148b01D7"
// const docType = ethers.utils.toUtf8Bytes("Öğrenci");
const docType = "0x77";
const period = 10 * 24 * 60 * 60; // ten days


async function main() {
  const [ _, __, periodSetter ] = await ethers.getSigners();

  const Badge = await ethers.getContractFactory("Badge");
  const badgeCtc = Badge.attach(badgeCtcAddress);

  await badgeCtc.connect(periodSetter).setValidityPeriodForDocType(docType, period);

  console.log("Set period for doc type.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
