"use client";
import { AppShell, Group, Anchor, Center, Title, ActionIcon } from "@mantine/core";
import { FC } from "react";
import { Header } from "./header";

export const Shell: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppShell header={{ height: 80 }}>
            <AppShell.Header>
                <Header/>
            </AppShell.Header>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
