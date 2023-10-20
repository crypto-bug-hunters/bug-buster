"use client";
import { FC, useState, useRef, useEffect } from "react";

import {
    Avatar as MantineAvatar,
    Box,
    Button,
    Center,
    Code,
    Group,
    Stack,
    Image,
    Title,
    Tooltip,
    useMantineTheme,
    SimpleGrid,
    Card,
    Text,
    Paper,
} from "@mantine/core";

import NiceAvatar, { genConfig } from "react-nice-avatar";
import { Address, bytesToHex, toHex, Hex, formatEther } from "viem";

import { GetBounty } from "../../../model/reader";
import Link from "next/link";
import { Sponsorship, getBountyTotalPrize } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils";
import { CodeWithCopyButton } from "../../../components/copy";
import { BountyStatus, getBountyStatus } from "../../../utils/bounty";
import { BountyStatusBadge } from "../../../components/bountyStatus";

const Address: FC<{ address: string }> = ({ address }) => {
    return (
        <Tooltip label={address}>
            <Text fw={500} size="sm">
                {address.substring(0, 12)}...
            </Text>
        </Tooltip>
    );
};

const Avatar: FC<{
    src: string;
    altseed: string;
}> = ({ src, altseed }) => {
    return (
        <MantineAvatar src={src} radius="sl" size="xl">
            <NiceAvatar
                style={{ width: "6rem", height: "6rem" }}
                {...genConfig(altseed)}
            />
        </MantineAvatar>
    );
};

const Sponsorship: FC<{
    sponsorship: Sponsorship;
}> = ({ sponsorship }) => {
    return (
        <Card radius="md" shadow="sm">
            <Stack p={20}>
                <Group gap="lg">
                    <Avatar
                        src={sponsorship.Sponsor.ImgLink}
                        altseed={sponsorship.Sponsor.Address}
                    />
                    <Stack>
                        <Text fw={500} size="lg">
                            {sponsorship.Sponsor.Name}
                            <CodeWithCopyButton
                                value={sponsorship.Sponsor.Address}
                            />
                        </Text>
                        <Text fw={700} size="xl" c="dimmend">
                            {formatEther(BigInt(sponsorship.Value))} ETH
                        </Text>
                    </Stack>
                </Group>
            </Stack>
        </Card>
    );
};

const SponsorshipList: FC<{
    sponsorships: Sponsorship[];
}> = ({ sponsorships }) => {
    return (
        <Stack g={20} m={20}>
            {sponsorships.map((sponsorship) => {
                return <Sponsorship sponsorship={sponsorship} />;
            })}
        </Stack>
    );
};

const BountyInfoPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    const bountyIndex = Number(bountyId);
    const config = usePrepareWithdrawSponsorship({ BountyIndex: bountyIndex });
    const { write } = useInputBoxAddInput(config);

    if (isNaN(bountyIndex)) {
        return <InvalidBountyId />;
    }

    const result = GetBounty(bountyIndex);

    switch (result.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{result.message}</Center>;
        case "success":
            const bounty = result.response;
            const profile = bounty.Developer;
            const status = getBountyStatus(bounty);
            const enableWithdrawals = status === BountyStatus.EXPIRED;
            const totalPrize = getBountyTotalPrize(bounty);
            return (
                <Center>
                    <Box p={20} mt={20} bg={theme.colors.dark[7]}>
                        <Stack w={800} align="center" justify="center">
                            <Title order={2}>{profile.Name}</Title>
                            <Image
                                w={300}
                                src={bounty.Developer.ImgLink}
                                fallbackSrc="/static/default_app.webp"
                            />
                            {bounty.Description}
                            <Group>
                                <BountyStatusBadge bounty={bounty} />
                            </Group>
                            <Title order={3}>
                                Total Prize: {formatEther(totalPrize)} ETH
                            </Title>
                            {status === BountyStatus.ACTIVE && (
                                <>
                                    <Group justify="left">
                                        <Link
                                            href={
                                                "/bounty/" +
                                                bountyId +
                                                "/sponsor"
                                            }
                                        >
                                            <Button>Sponsor</Button>
                                        </Link>
                                        <Link
                                            href={
                                                "/bounty/" +
                                                bountyId +
                                                "/exploit"
                                            }
                                        >
                                            <Button>Submit exploit</Button>
                                        </Link>
                                        {enableWithdrawals && (
                                            <Button onClick={write}>
                                                Withdraw
                                            </Button>
                                        )}
                                    </Group>
                                </>
                            )}
                            {status === BountyStatus.EXPLOITED && (
                                <>
                                    <Title order={2}>Exploited by </Title>
                                    <Avatar
                                        src={bounty.Exploit?.Hacker.ImgLink}
                                        altseed={bounty.Exploit?.Hacker.Address}
                                    />
                                    <Title order={1}>
                                        {bounty.Exploit?.Hacker.Name}
                                    </Title>
                                    <Address
                                        address={bounty.Exploit?.Hacker.Address}
                                    />
                                </>
                            )}
                            <Title order={2} mt={50}>
                                Sponsorships
                            </Title>
                            <SponsorshipList
                                sponsorships={bounty.Sponsorships}
                            />
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;
