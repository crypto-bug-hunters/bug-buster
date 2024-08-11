import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Tooltip,
    Stack,
    Box,
} from "@mantine/core";
import { FC } from "react";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { HasConnectedAccount } from "../components/hasConnectedAccount";
import { useMediaQuery } from "@mantine/hooks";

const breakPoint = "(min-width: 700px)";

export default function ConnectButton() {
    const matches = useMediaQuery(breakPoint);
    return <w3m-button label={`${matches ? "Connect Wallet" : "Connect"}`} />;
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
    const matches = useMediaQuery(breakPoint);
    return (
        <Stack align="stretch" justify="flex-start" gap="xs">
            <Group bg="gray">
                <Center w="100%" py="0.3rem">
                    <Anchor href="/notification" underline="never">
                        We are in Alpha stage, read more.
                    </Anchor>
                </Center>
            </Group>
            <Group
                px={{ base: "xs", md: "lg" }}
                pb="xs"
                justify="space-between"
                style={{ minWidth: 360 }}
            >
                <Box style={{ flexGrow: 1 }}>
                    <Anchor href="/" underline="never">
                        <Title>🪲 Bug Buster</Title>
                    </Anchor>
                </Box>

                <HasConnectedAccount>
                    <VoucherNotification />
                </HasConnectedAccount>

                <ConnectButton />
            </Group>
        </Stack>
    );
};
