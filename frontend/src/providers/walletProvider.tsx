"use client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { configureChains, WagmiConfig } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const chain =
  [foundry, mainnet, sepolia].find((c) => c.id == chainId) || foundry;

// only 1 chain is enabled, based on env var
const { chains } = configureChains([chain], [publicProvider()]);

// webconnect projectId
const projectId = "bd3725877ae8cde37b7c439efe33857d";

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: "BugLess",
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: "dark",
});

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
};

export default WalletProvider;
