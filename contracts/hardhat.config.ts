import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.5.0",
      },
    ],
  },
  networks: {
    digiathon: {
      chainId: 43112,
      url: "http://176.236.121.139:9650/ext/C/rpc",
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.BURNER_KEY!,
        process.env.PERIOD_SETTER_KEY!
      ]
    },
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    }
  }
};

export default config;
