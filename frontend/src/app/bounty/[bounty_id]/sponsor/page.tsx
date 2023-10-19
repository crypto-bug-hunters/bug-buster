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
} from "@mantine/core";
import { FC, useState } from "react";
import { Address } from "viem";
import { AddSponsorship } from "../../../../model/inputs";
import { usePrepareAddSponsorship } from "../../../../hooks/bugless";
import { useEtherPortalDepositEther } from "../../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";

type AddSponsorhipParams = {
    params: { bounty_id : string };
};

const AddSponsorshipPage: FC<AddSponsorhipParams> = ({
    params: { bounty_id },
}) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    // App name
    const [name, setName] = useState("");

    // ImgLink
    const [imgLink, setImgLink] = useState("");

    const [value, setValue] = useState(0);

    const addSponsorship = {
        Name: name,
        ImgLink: imgLink,
        BountyIndex: parseInt(bounty_id),
    } as AddSponsorship;

    const config = usePrepareAddSponsorship(addSponsorship, BigInt(value));

    const { data, isLoading, isSuccess, write } =
        useEtherPortalDepositEther(config);
    const wait = useWaitForTransaction(data);

    function submit() {
        if (write) write();
    }

    const parseIfNeeded = (setter: (v: number) => void) => {
        return (s: string | number) => {
            if (typeof s === "number") {
                setter(s);
            } else {
                setter(parseInt(s));
            }
        };
    };

    return (
        <Center>
            <Box p={20} mt={180} bg={theme.colors.dark[7]}>
                <Stack w={600}>
                    <TextInput
                        withAsterisk
                        size="lg"
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        description="Name of the App"
                    />
                    <TextInput
                        size="lg"
                        label="Image Link"
                        value={imgLink}
                        onChange={(e) => setImgLink(e.target.value)}
                        description="App Image Link"
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Value"
                        suffix=" wei"
                        description="Sponsorship value in wei"
                        value={value}
                        onChange={parseIfNeeded(setValue)}
                    />

                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            type="submit"
                            disabled={!write || name.trim().length === 0}
                            onClick={submit}
                        >
                            {"Add Sponsorship"}
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Center>
    );
};

export default AddSponsorshipPage;
