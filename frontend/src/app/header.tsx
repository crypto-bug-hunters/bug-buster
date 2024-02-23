import { Group, Anchor, Center, Title, ActionIcon, Divider } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { FcMoneyTransfer } from "react-icons/fc";

export default function ConnectButton() {
    return <w3m-button />;
}

const VoucherNotification: FC = () => {
    return (
        <ActionIcon variant="default" aria-label="Settings" component="a" href="/voucher">
            <FcMoneyTransfer size="24px"/>
        </ActionIcon>
    );
}

export const Header: FC = () => {
    const [ hasConnectedAccount, setHasConnectedAccount ] = useState(false);
    const {address} = useAccount();

    useEffect(() => {
        if (address) setHasConnectedAccount(true);
    },[address]);

    return (
        <Group h="100%" px={20}>
            <Center>
                <Anchor href="/" underline="never">
                    <Title>🪲 BugLess</Title>
                </Anchor>
            </Center>
            <Group justify="flex-end" style={{ flex: 1 }}>
                {hasConnectedAccount && (
                    <VoucherNotification />
                )}
                <Divider orientation="vertical" />
                <ConnectButton />
            </Group>
        </Group>
    );
}