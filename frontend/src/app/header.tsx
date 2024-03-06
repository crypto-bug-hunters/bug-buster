import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Divider,
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { FcMoneyTransfer } from "react-icons/fc";
import { HasConnectedAccount } from "../components/hasConnectedAccount";

export default function ConnectButton() {
    return <w3m-button />;
}

const VoucherNotification: FC = () => {
    return (
        <ActionIcon
            variant="default"
            aria-label="Settings"
            component="a"
            href="/voucher"
        >
            <FcMoneyTransfer size="24px" />
        </ActionIcon>
    );
};

export const Header: FC = () => {
    return (
        <Group h="100%" px={20}>
            <Center>
                <Anchor href="/" underline="never">
                    <Title>🪲 BugLess</Title>
                </Anchor>
            </Center>
            <Group justify="flex-end" style={{ flex: 1 }}>
                <HasConnectedAccount>
                    <VoucherNotification />
                </HasConnectedAccount>
                <Divider orientation="vertical" />
                <ConnectButton />
            </Group>
        </Group>
    );
};
