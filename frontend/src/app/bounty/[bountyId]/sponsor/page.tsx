"use client";
import {
    Box,
    Button,
    Center,
    Group,
    NumberInput,
    Stack,
    TextInput,
    useMantineTheme,
    Title,
    Text,
} from "@mantine/core";
import { FC, useState } from "react";
import { parseEther } from "viem";
import { AddSponsorship } from "../../../../model/inputs";
import { usePrepareAddSponsorship } from "../../../../hooks/bug-buster";
import { useEtherPortalDepositEther } from "../../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";

import { BountyParams, InvalidBountyId } from "../utils.tsx";
import { GetBounty } from "../../../../model/reader";

const toWei = (input: string | number) => {
    if (typeof input == "number") {
        return BigInt(input * 1e18);
    } else {
        return parseEther(input);
    }
};

const AddSponsorshipPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const theme = useMantineTheme();

    const [name, setName] = useState("");
    const [imgLink, setImgLink] = useState("");
    const [value, setValue] = useState(0);

    const bountyIndex = Number(bountyId);

    const addSponsorship = {
        name,
        imgLink,
        bountyIndex,
    } as AddSponsorship;

    const config = usePrepareAddSponsorship(addSponsorship, toWei(value));

    const { data, write } = useEtherPortalDepositEther(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    if (isNaN(bountyIndex)) {
        return <InvalidBountyId />;
    }

    function wrapSetter(setter: any) {
        return (e: any) => setter(e.target.value);
    }

    const result = GetBounty(bountyIndex);

    return (
        <Center>
            <Box p={20} mt={50} bg={theme.colors.dark[7]}>
                <Stack w={600}>
                    <Title>Sponsor bounty</Title>
                    {result.kind == "success" && (
                        <Text size="lg" fw={700} c="dimmed">
                            {result.response.name}
                        </Text>
                    )}
                    <TextInput
                        withAsterisk
                        size="lg"
                        label="Name"
                        value={name}
                        placeholder="Satoshi Nakamoto"
                        onChange={wrapSetter(setName)}
                    />
                    <TextInput
                        size="lg"
                        label="Avatar URL"
                        value={imgLink}
                        placeholder="https://"
                        onChange={wrapSetter(setImgLink)}
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Value"
                        suffix=" ETH"
                        allowNegative={false}
                        decimalScale={18}
                        value={value}
                        onChange={(e: any) => setValue(e)}
                    />

                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            type="submit"
                            disabled={
                                !write || isLoading || name.trim().length === 0
                            }
                            onClick={write}
                        >
                            {isLoading
                                ? "Adding Sponsorship..."
                                : "Add Sponsorship"}
                        </Button>
                    </Group>
                    {isSuccess && (
                        <>
                            <Group justify="center">
                                <Text size="lg">
                                    Add Sponsorship transaction successful!
                                </Text>
                            </Group>
                        </>
                    )}
                </Stack>
            </Box>
        </Center>
    );
};

export default AddSponsorshipPage;
