"use client";
import { FC, useState, useRef, useEffect } from "react";

import {
    Box,
    Button,
    Center,
    Group,
    Stack,
    Image,
    Title,
    useMantineTheme,
    Card,
    Text,
} from "@mantine/core";

import { Address, bytesToHex, toHex, Hex } from "viem";

import { GetBounty } from "../../../model/reader";
import Link from "next/link";
import { Sponsorship } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils.tsx";

const Sponsor: FC<{
    sponsorship: Sponsorship;
    bountyIndex: number;
    enableWithdraw: boolean;
}> = ({ sponsorship, bountyIndex, enableWithdraw }) => {
    const config = usePrepareWithdrawSponsorship({ BountyIndex: bountyIndex });
    const { write } = useInputBoxAddInput(config);

    return (
        <Card>
            <Stack justify="center" align="center">
                <Card.Section>
                    <Image h={300} src={sponsorship.Sponsor.ImgLink} />
                </Card.Section>

                <Text fw={500} size="lg" mt="md">
                    {sponsorship.Sponsor.Name}
                </Text>
                <Text fw={500} size="sm" mt="md">
                    {sponsorship.Sponsor.Address}
                </Text>
                <Text size="sm" c="dimmend">
                    Sponsorship : {parseInt(sponsorship.Value)} wei
                </Text>
                {enableWithdraw && (
                    <>
                        <Button onClick={write}>Withdraw</Button>
                    </>
                )}
            </Stack>
        </Card>
    );
};

const BountyInfoPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    const bountyIndex = Number(bountyId);

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
            //TODO: Should only the actual Sponsor do this? if so, also use 'useAddress()' method and compare with Sponsor.Address
            const enableWithdrawals = !hasExploit;
            let totalPrize = 0;
            const sponsors = bounty.Sponsorships?.forEach((sponsorship) => {
                totalPrize += parseInt(sponsorship.Value);
            });
            return (
                <Center>
                    <Box p={20} mt={20} bg={theme.colors.dark[7]}>
                        <Stack w={600} align="center" justify="center">
                            <Title order={2}>{profile.Name}</Title>
                            <Image w={300} src={bounty.Developer.ImgLink} />
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
                            {bounty.Sponsorships?.map((sponsorship) => {
                                return (
                                    <Sponsor
                                        bountyIndex={bountyIndex}
                                        sponsorship={sponsorship}
                                        enableWithdraw={enableWithdrawals}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;