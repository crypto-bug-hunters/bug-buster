"use client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React, { FC } from "react";
import { ColorSchemeScript } from "@mantine/core";
import Head from "next/head";

import GraphQLProvider from "../providers/graphqlProvider";
import StyleProvider from "../providers/styleProvider";
import WalletProvider from "../providers/walletProvider";
import { Shell } from "./shell";
// import { SWRConfig } from "swr";

// const fetcher = async <JSON = any,>(
//     input: RequestInfo,
//     init?: RequestInit
// ): Promise<JSON> => {
//     const res = await fetch(input, init);
//     return res.json();
// };

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <Head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="/favicon.svg" />
            </Head>
            <body>
                <GraphQLProvider>
                    <StyleProvider>
                        <WalletProvider>
                            <Shell>{children}</Shell>
                        </WalletProvider>
                    </StyleProvider>
                </GraphQLProvider>
            </body>
        </html>
    );
};

export default Layout;
