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

const digiathonTestnet = {
  id: 43112,
  name: 'Digiathon Testnet',
  network: 'digiathon',
  iconUrl: '../public/images/avax-token.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'AVAX',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: 'http://176.236.121.139:9650/ext/C/rpc',
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.digiathon.com/' }
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [digiathonTestnet],
  [jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) })]
);

const { connectors } = getDefaultWallets({
  appName: "Sıfır Belge",
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