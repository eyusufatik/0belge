import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    digiathon: {
      chainId: 43112,
      url: "http://176.236.121.139:9650/ext/C/rpc",
      accounts: [
        process.env.PRIVATE_KEY!
      ]
    },
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    }
  }
};

export default config;
