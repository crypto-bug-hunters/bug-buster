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
    TextInput,
    Textarea,
    useMantineTheme,
    Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { TbExclamationCircle, TbUpload } from "react-icons/tb";

import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "../../../hooks/contracts";
import { Address, bytesToHex, toHex, Hex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { CreateBounty } from "../../../model/inputs";
import { GetBounty } from "../../../model/reader";
import usePrepareCreateBounty from "../../../hooks/bugless";

const BountyInfoPage: FC<{ params: {bounty_id : number} }> = ({ params: { bounty_id } }) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    const result = GetBounty(bounty_id);

    switch (result.kind) {
        case "loading":
            return (
                <Center>
                    Loading bounty info...
                </Center>
            );
        case "error":
            return (
                <Center>
                    {result.message}
                </Center>
            );
        case "success":
            const bounty = result.response;
            const profile = bounty.Developer;
            return (
                <Center>
                    <Box p={20} mt={20} bg={theme.colors.dark[7]}>
                        <Stack w={600}>
                            <Title order={2}>{profile.Name}</Title>
                            <Image w={300} src={bounty.Developer.ImgLink} />
                            {bounty.Description}
                        </Stack>
                    </Box>
                </Center>
            );
    }
};

export default BountyInfoPage;
