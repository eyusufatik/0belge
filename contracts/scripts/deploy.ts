import { ethers, upgrades } from "hardhat";

import { Badge, Verifier } from "../typechain-types";



async function main() {
  const [ deployer, burner, periodSetter ] = await ethers.getSigners();

  const Verifier = await ethers.getContractFactory("Verifier");
  const verifierCtc = await Verifier.deploy();
  await verifierCtc.deployed()

  console.log(`Deployed verifier contract at address ${verifierCtc.address}`);


  const Badge = await ethers.getContractFactory("Badge");
  const badgeCtc = await Badge.deploy(burner.address, periodSetter.address, verifierCtc.address);
  await badgeCtc.deployed();

  console.log(`Deployed badge contract at address ${badgeCtc.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
