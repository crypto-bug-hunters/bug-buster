import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Divider,
    Tooltip,
    Stack,
} from "@mantine/core";
import { FC } from "react";
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
        <Stack
        align="stretch"
        justify="flex-start"
        gap="xs"
        >
            <Group bg="gray">
                <Center w="100%">
                <Anchor href="/notification" underline="never">We are in Alpha stage, read more.</Anchor>
                </Center>
            </Group>
            <Group h="100%" px={20}>
            <Center>
                <Anchor href="/" underline="never">
                    <Title>🪲 Bug Buster</Title>
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
        </Stack>
    );
};
