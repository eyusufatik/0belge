import { ethers, upgrades } from "hardhat";

import { Badge } from "../typechain-types";

const badgeCtcAddress = "0xF5B6a7D84BE909f89467fe8aC596EdcEd225834b"
const docType = "Öğrenci"
const period = 10 * 24 * 60 * 60; // ten days


async function main() {
  const [ _, __, periodSetter ] = await ethers.getSigners();

  const Badge = await ethers.getContractFactory("Badge");
  const badgeCtc = Badge.attach(badgeCtcAddress);

  await badgeCtc.connect(periodSetter).setValidityPeriodForDocType(ethers.utils.toUtf8Bytes(docType), period);

  console.log("Set period for doc type.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
