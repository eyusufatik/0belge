import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Layout from './components/Layout';

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

// pages
import Home from './pages/Home';
import Error from './pages/Error';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

const sepolia = {
  id: 11155111,
  name: 'Sepolia Testnet',
  network: 'sepolia',
  iconUrl: '../public/images/avax-token.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia ETH',
    symbol: 'SepoliaETH',
  },
  rpcUrls: {
    default: 'https://sepolia.infura.io/v3/935154d46a17467899ed732aca04dbf6',
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io/' }
  },
  testnet: true,
};

const localhost = {
  id: 1337,
  name: 'Local testnet',
  network: 'localhost',
  iconUrl: '../public/images/avax-token.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'CPAY',
    symbol: 'CPAY',
  },
  rpcUrls: {
    default: 'http://127.0.0.1:8545/',
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io/' }
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [localhost, sepolia],
  [jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) })]
);

const { connectors } = getDefaultWallets({
  appName: "Offex Demo",
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});


root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <React.StrictMode>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="*" element={<Error code="404" />}></Route>
            </Routes>
          </Layout>
        </Router>
      </React.StrictMode>
    </RainbowKitProvider>
  </WagmiConfig>
);