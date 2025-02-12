import {
    Group,
    Anchor,
    Center,
    Title,
    ActionIcon,
    Tooltip,
    Stack,
    Flex,
    Divider,
} from "@mantine/core";
import { FC } from "react";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdArrowOutward } from "react-icons/md";
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
            <Flex
                direction={{ base: "column", sm: "row" }}
                px={{ base: "xs", md: "lg" }}
                pb="xs"
                justify={{ base: "center", sm: "space-between" }}
                style={{ minWidth: 360 }}
            >
                <Flex
                    justify={{ base: "center", sm: "flex-start" }}
                    style={{ flexGrow: 1 }}
                >
                    <Anchor href="/" underline="never">
                        <Title>🪲 Bug Buster</Title>
                    </Anchor>
                </Flex>

                <Flex justify={{ base: "center" }} align="center">
                    <HasConnectedAccount>
                        <Anchor
                            href="/bounty/create"
                            size="lg"
                            underline="always"
                        >
                            Create Bounty
                        </Anchor>
                        <MdArrowOutward
                            style={{
                                color: "var(--mantine-color-cartesi-cyan-8)",
                            }}
                            size="24px"
                        />
                    </HasConnectedAccount>
                </Flex>

                <Divider size="lg" orientation="vertical" mr={"sm"} ml={"sm"} />

                <Flex justify={{ base: "center" }}>
                    <HasConnectedAccount>
                        <VoucherNotification />
                    </HasConnectedAccount>
                </Flex>

                <Flex justify={{ base: "center" }}>
                    <ConnectButton />
                </Flex>
            </Flex>
        </Stack>
    );
};
