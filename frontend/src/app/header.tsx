import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Divider,
    Tooltip,
    Stack,
    Flex,
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
        <Stack align="stretch" justify="flex-start" gap="5px">
            <Group bg="gray">
                <Center w="100%">
                    <Anchor href="/notification" underline="never">
                        We are in Alpha stage, read more.
                    </Anchor>
                </Center>
            </Group>
            <Flex px={20}>
                <Anchor href="/" underline="never">
                    <Title>🪲 Bug Buster</Title>
                </Anchor>

                <Group
                    justify="flex-end"
                    style={{ flex: 1 }}
                    visibleFrom={"sm"}
                >
                    <HasConnectedAccount>
                        <VoucherNotification />
                    </HasConnectedAccount>
                    <Divider orientation="vertical" />
                    <ConnectButton />
                </Group>
            </Flex>
        </Stack>
    );
};
