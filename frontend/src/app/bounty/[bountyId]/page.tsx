"use client";
import { FC, useState, useRef, useEffect } from "react";

import {
    Avatar,
    Box,
    Button,
    Center,
    Group,
    Stack,
    Image,
    Title,
    Tooltip,
    useMantineTheme,
    Card,
    Text,
} from "@mantine/core";

import NiceAvatar, { genConfig } from "react-nice-avatar";
import { Address, bytesToHex, toHex, Hex } from "viem";

import { GetBounty } from "../../../model/reader";
import Link from "next/link";
import { Sponsorship } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils.tsx";

const Sponsor: FC<{
    sponsorship: Sponsorship;
}> = ({ sponsorship }) => {
    return (
        <Card>
            <Stack justify="center" align="center" w="220">
                <Card.Section>
                    <Avatar
                        src={sponsorship.Sponsor.ImgLink}
                        radius="sl"
                        size="xl"
                    >
                        <NiceAvatar
                            style={{ width: "6rem", height: "6rem" }}
                            {...genConfig(sponsorship.Sponsor.Address)}
                        />
                    </Avatar>
                </Card.Section>
                <Text fw={600} size="lg">
                    {sponsorship.Sponsor.Name}
                </Text>
                <Tooltip label={sponsorship.Sponsor.Address}>
                    <Text fw={500} size="sm">
                        {sponsorship.Sponsor.Address.substring(0, 12)}...
                    </Text>
                </Tooltip>
                <Text size="sm" c="dimmend">
                    Sponsorship: {parseInt(sponsorship.Value)} wei
                </Text>
            </Stack>
        </Card>
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
            const hasExploit = !!bounty.Exploit;
            //TODO: needs to check the Deadline as well.
            const enableWithdrawals = !hasExploit;
            let totalPrize = 0;
            bounty.Sponsorships?.forEach((sponsorship) => {
                totalPrize += parseInt(sponsorship.Value);
            });
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

                            <Title order={3}>
                                Total Prize: {totalPrize} wei
                            </Title>
                            {!hasExploit && (
                                <>
                                    <Group justify="left">
                                        <Link
                                            href={
                                                "/bounty/" +
                                                bountyId +
                                                "/sponsor"
                                            }
                                        >
                                            <Button>Add Sponsorship</Button>
                                        </Link>
                                        <Link
                                            href={
                                                "/bounty/" +
                                                bountyId +
                                                "/exploit"
                                            }
                                        >
                                            <Button>Send Exploit</Button>
                                        </Link>
                                        {enableWithdrawals &&
                                            <Button onClick={write}>
                                                Withdraw
                                            </Button>
                                        }
                                    </Group>
                                </>
                            )}
                            {hasExploit && (
                                <>
                                    <Title order={2}>Exploited by </Title>
                                    <Title order={1}>
                                        {bounty.Exploit?.Hacker.Name}
                                    </Title>
                                    <Title order={3}>
                                        {bounty.Exploit?.Hacker.Address}
                                    </Title>
                                    <Image
                                        w={300}
                                        src={bounty.Exploit?.Hacker.ImgLink}
                                    />
                                </>
                            )}
                            <Title order={2}>Sponsors</Title>
                            <Group>
                                {bounty.Sponsorships?.map((sponsorship) => {
                                    return (
                                        <Sponsor sponsorship={sponsorship} />
                                    );
                                })}
                            </Group>
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;
