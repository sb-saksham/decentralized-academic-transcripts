import React from 'react';
import ReactDOM from 'react-dom/client';

// CSS
import 'react-toastify/dist/ReactToastify.css';
import "@rainbow-me/rainbowkit/styles.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Wagmiand RainbowKit
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia, polygonMumbai } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

// Local
import './index.css';
import App from './App';
import "./App.css";
// import reportWebVitals from './reportWebVitals';

const wagmiConfig = getDefaultConfig({
  appName: "DeAcT - Decentralized Academic Transcripts",
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  chains: [mainnet, sepolia, polygonMumbai],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_APP_MAINNET_API_KEY),
    [sepolia.id]: http(import.meta.env.VITE_APP_SEPOLIA_API_KEY),
    [polygonMumbai.id]: http(import.meta.env.VITE_APP_POLYGON_MUMBAI_API_KEY)
  }
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App/>
      </RainbowKitProvider>
    </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
