"use client";
import {
    Box,
    Button,
    Center,
    NumberInput,
    Stack,
    TextInput,
    useMantineTheme,
    Title,
    Text,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { FC } from "react";
import { parseEther } from "viem";
import { AddSponsorship } from "../../../../model/inputs";
import { usePrepareAddSponsorship } from "../../../../hooks/bug-buster";
import { useEtherPortalDepositEther } from "../../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";

import { BountyParams, ConcreteBountyParams } from "../utils.tsx";
import { useBounty } from "../../../../model/reader";

const toWei = (input: string | number) => {
    if (typeof input == "number") {
        return BigInt(input * 1e18);
    } else {
        return parseEther(input);
    }
};

interface AddSponsorshipFormValues {
    name: string;
    imgLink?: string;
    value: number | string;
}

const AddSponsorshipForm: FC<ConcreteBountyParams> = ({
    bountyIndex,
    bounty,
}) => {
    const form = useForm<AddSponsorshipFormValues>({
        initialValues: {
            name: "",
            value: 0,
        },
        validate: {
            name: isNotEmpty("A sponsor name is required"),
        },
    });

    const { name, imgLink, value } = form.values;

    const addSponsorship: AddSponsorship = {
        name,
        imgLink,
        bountyIndex,
    };

    const config = usePrepareAddSponsorship(addSponsorship, toWei(value));

    const { data, write } = useEtherPortalDepositEther(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <form onSubmit={form.onSubmit(() => write && write())}>
            <Stack w={600}>
                <Title>Sponsor bounty</Title>
                <Text size="lg" fw={700} c="dimmed">
                    {bounty.name}
                </Text>
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Name"
                    placeholder="Satoshi Nakamoto"
                    {...form.getInputProps("name")}
                />
                <TextInput
                    size="lg"
                    label="Avatar URL"
                    placeholder="https://"
                    {...form.getInputProps("imgLink")}
                />
                <NumberInput
                    withAsterisk
                    size="lg"
                    label="Value"
                    suffix=" ETH"
                    allowNegative={false}
                    decimalScale={18}
                    {...form.getInputProps("value")}
                />
                <Button
                    size="lg"
                    type="submit"
                    disabled={!write || isLoading || isSuccess}
                >
                    {isSuccess ? "Sent!" : isLoading ? "Sending..." : "Send"}
                </Button>
            </Stack>
        </form>
    );
};

const AddSponsorshipPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const bountyIndex = Number(bountyId);
    const bountyResult = useBounty(bountyIndex);

    const theme = useMantineTheme();

    switch (bountyResult.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{bountyResult.message}</Center>;
        case "success":
            return (
                <Center>
                    <Box p={20} mt={50} bg={theme.colors.dark[7]}>
                        <AddSponsorshipForm
                            bountyIndex={bountyIndex}
                            bounty={bountyResult.response}
                        />
                    </Box>
                </Center>
            );
    }
};

export default AddSponsorshipPage;
