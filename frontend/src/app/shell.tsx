"use client";
import { AppShell, Group, Anchor, Center, Title } from "@mantine/core";
import { FC } from "react";

export default function ConnectButton() {
    return <w3m-button />;
}

export const Shell: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppShell header={{ height: 80 }}>
            <AppShell.Header>
                <Group h="100%" px={20}>
                    <Center>
                        <Anchor href="/" underline="never">
                            <Title>🐞 BugLess</Title>
                        </Anchor>
                    </Center>
                    <Group justify="flex-end" style={{ flex: 1 }}>
                        <ConnectButton />
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
