"use client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { configureChains, WagmiConfig } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";

// select chain based on env var
let chainId;
if (
    process.env.NEXT_PUBLIC_CHAIN_ID === undefined ||
    process.env.NEXT_PUBLIC_CHAIN_ID == ""
) {
    chainId = foundry.id;
} else {
    chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);
}
const chain = [foundry, mainnet, sepolia].find((c) => c.id == chainId);

// only 1 chain is enabled, based on env var
function getChainConfiguration(chain: any) {
    if (
        process.env.NEXT_PUBLIC_PROVIDER_NAME === undefined ||
        process.env.NEXT_PUBLIC_PROVIDER_NAME == ""
    ) {
        return configureChains([chain], [publicProvider()]);
    } else if (
        process.env.NEXT_PUBLIC_PROVIDER_NAME == "ALCHEMY" &&
        process.env.NEXT_PUBLIC_PROVIDER_API_KEY !== undefined
    ) {
        return configureChains(
            [chain],
            [
                alchemyProvider({
                    apiKey: process.env.NEXT_PUBLIC_PROVIDER_API_KEY,
                }),
                publicProvider(),
            ],
        );
    } else if (
        process.env.NEXT_PUBLIC_PROVIDER_NAME == "INFURA" &&
        process.env.NEXT_PUBLIC_PROVIDER_API_KEY !== undefined
    ) {
        return configureChains(
            [chain],
            [
                infuraProvider({
                    apiKey: process.env.NEXT_PUBLIC_PROVIDER_API_KEY,
                }),
                publicProvider(),
            ],
        );
    } else {
        throw new Error("Check your provider configuration (Name and API Key)");
    }
}
const { chains } = getChainConfiguration(chain);

// webconnect projectId
if (
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === undefined ||
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID == ""
) {
    throw new Error("A WalletConnect projectId is required");
}
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata: {
        name: "BugLess",
        description: "Trustless bug bounties",
        url: "https://github.com/crypto-bug-hunters/bug-less",
    },
});

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "dark",
    themeVariables: {
        "--w3m-accent": "#00c3ca",
    },
});

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
};

export default WalletProvider;
