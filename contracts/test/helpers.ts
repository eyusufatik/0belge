import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";

interface Signers {
  deployer: SignerWithAddress;
  burner: SignerWithAddress;
  periodSetter: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  other1: SignerWithAddress;
  other2: SignerWithAddress;
}

export const getAccounts = async (): Promise<Signers> => {
  const [deployer, burner, periodSetter, user1, user2, other1, other2] =
    await ethers.getSigners();
  return {
    deployer,
    burner,
    periodSetter,
    user1,
    user2,
    other1,
    other2,
  };
};
