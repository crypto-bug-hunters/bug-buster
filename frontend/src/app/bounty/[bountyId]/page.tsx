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
import { useWaitForTransaction } from "wagmi";
import { Profile } from "../../../components/profile";

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
        <Profile
            profile={ sponsorship.Sponsor }
            badge="Sponsor"
            badgeColor="purple"
        >
            {formatEther(BigInt(sponsorship.Value))} ETH
        </Profile>
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
    const { data, write } = useInputBoxAddInput(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

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
            const bountyStatus = getBountyStatus(bounty);
            const isActive = bountyStatus == BountyStatus.ACTIVE;
            const enableWithdrawals = bountyStatus === BountyStatus.EXPIRED;
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
                                <BountyStatusBadge status={bountyStatus} />
                            </Group>
                            <Title order={3}>
                                Total Prize: {formatEther(totalPrize)} ETH
                            </Title>
                            <Group justify="left">
                                <Button
                                    component="a"
                                    href={`/bounty/${bountyId}/sponsor`}
                                    data-disabled={!isActive}
                                    onClick={(event) => event.preventDefault()}
                                >
                                    Sponsor
                                </Button>
                                <Button
                                    component="a"
                                    href={`/bounty/${bountyId}/exploit`}
                                    data-disabled={!isActive}
                                    onClick={(event) => event.preventDefault()}
                                >
                                    Submit exploit
                                </Button>
                                <Button
                                    disabled={!enableWithdrawals || !write || isLoading}
                                    onClick={write}
                                >
                                    {isLoading
                                        ? "Withdrawing..."
                                        : "Withdraw"}
                                </Button>
                                <Group justify="center">
                                        {isSuccess && (
                                            <>
                                                <Text size="lg">
                                                    Withdraw transaction
                                                    successful!
                                                </Text>
                                            </>
                                        )}
                                    </Group>
                            </Group>
                            <Title order={2} mt={50}>
                                Participants
                            </Title>
                            {bounty.Exploit && (
                                <Profile
                                    profile={bounty.Exploit.Hacker}
                                    badge="Exploiter"
                                />
                            )}
                            {bounty.Sponsorships && (<SponsorshipList
                                sponsorships={bounty.Sponsorships}
                            />)}
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;
