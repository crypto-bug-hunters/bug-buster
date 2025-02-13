"use client";
import { AppShell } from "@mantine/core";
import { FC } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { useAccount } from "wagmi";

export const Shell: FC<{ children: React.ReactNode }> = ({ children }) => {
    const { address, connector, isConnected } = useAccount();

    const offset = !!address && !!connector && !!isConnected ? "10rem" : "7rem";

    return (
        <AppShell
            header={{ height: { base: 212, sm: 99 } }}
            footer={{ height: "auto" }}
            padding="md"
            withBorder={true}
        >
            <AppShell.Header>
                <Header />
            </AppShell.Header>
            <AppShell.Main>{children}</AppShell.Main>
            <AppShell.Footer>
                <Footer />
            </AppShell.Footer>
        </AppShell>
    );
};
