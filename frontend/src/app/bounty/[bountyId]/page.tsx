"use client";
import { FC, useState, useRef, useEffect } from "react";

import {
    Avatar as MantineAvatar,
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
import { Sponsorship, getBountyTotalPrize } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils";
import { EtherValue } from "../../../util/wei";

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

const Sponsor: FC<{
    sponsorship: Sponsorship;
}> = ({ sponsorship }) => {
    return (
        <Card>
            <Stack justify="center" align="center" w="220">
                <Card.Section>
                    <Avatar
                        src={sponsorship.Sponsor.ImgLink}
                        altseed={sponsorship.Sponsor.Address}
                    />
                </Card.Section>
                <Text fw={600} size="lg">
                    {sponsorship.Sponsor.Name}
                </Text>
                <Address address={sponsorship.Sponsor.Address} />
                <Text size="sm" c="dimmend">
                    Sponsorship : <EtherValue wei={sponsorship.Value} />
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

                            <Title order={3}>
                                Total Prize: <EtherValue wei={totalPrize} />
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
                                        {enableWithdrawals && (
                                            <Button onClick={write}>
                                                Withdraw
                                            </Button>
                                        )}
                                    </Group>
                                </>
                            )}
                            {hasExploit && (
                                <>
                                    <Title order={2}>Exploited by </Title>
                                    <Avatar
                                        src={bounty.Exploit?.Hacker.ImgLink}
                                        altseed={bounty.Exploit?.Hacker.Address}
                                    />
                                    <Title order={1}>
                                        {bounty.Exploit?.Hacker.Name}
                                    </Title>
                                    <Address address={bounty.Exploit?.Hacker.Address} />
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
