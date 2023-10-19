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
} from "@mantine/core";

import { Address, bytesToHex, toHex, Hex } from "viem";

import { GetBounty } from "../../../model/reader";
import Link from "next/link";

const BountyInfoPage: FC<{ params: { bounty_id: number } }> = ({
    params: { bounty_id },
}) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    const result = GetBounty(bounty_id);

    switch (result.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{result.message}</Center>;
        case "success":
            const bounty = result.response;
            const profile = bounty.Developer;
            let totalPrize = 0;
            const sponsors = bounty.Sponsorships?.forEach((sponsorship)=>{
                totalPrize += parseInt(sponsorship.Value)
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
                            <Group justify="left">
                                <Link
                                    href={"/bounty/" + bounty_id + "/sponsor"}
                                >
                                    <Button>Add Sponsorship</Button>
                                </Link>
                                <Link
                                    href={"/bounty/" + bounty_id + "/exploit"}
                                >
                                    <Button>Send Exploit</Button>
                                </Link>
                            </Group>
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;
