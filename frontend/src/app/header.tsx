import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Divider,
    Tooltip,
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { HasConnectedAccount } from "../components/hasConnectedAccount";

export default function ConnectButton() {
    return <w3m-button />;
}

const VoucherNotification: FC = () => {
    return (
        <Tooltip label="List vouchers">
            <ActionIcon
                variant="filled"
                component="a"
                href="/voucher"
                size="xl"
            >
                <RiMoneyDollarCircleLine size="24px" />
            </ActionIcon>
        </Tooltip>
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
