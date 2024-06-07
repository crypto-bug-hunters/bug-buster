"use client";
import { FC, useState, useEffect } from "react";

import {
    Anchor,
    Box,
    Button,
    Center,
    Stack,
    Tabs,
    Title,
    TextInput,
    Textarea,
    useMantineTheme,
    Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";

import { useInputBoxAddInput } from "../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";
import { CreateAppBounty } from "../../../model/inputs";
import { usePrepareCreateBounty } from "../../../hooks/bug-buster";
import { useBlockTimestamp } from "../../../hooks/block";
import { DISCORD_CHANNEL_URL, X_ACCOUNT_URL } from "../../../utils/links";

interface CreateBountyFormValues {
    name: string;
    description: string;
    imgLink?: string;
    deadline?: Date;
    codeZipBinary?: string;
    codeZipPath?: string;
}

const CreateBountyForm: FC = () => {
    const [minDeadline, setMinDeadline] = useState<Date>();
    const blockTimestamp = useBlockTimestamp();

    useEffect(() => {
        if (blockTimestamp === undefined) {
            setMinDeadline(undefined);
        } else {
            const blockDate = new Date(Number(blockTimestamp * 1000n));
            blockDate.setDate(blockDate.getDate() + 1);
            setMinDeadline(blockDate);
        }
    }, [blockTimestamp]);

    const form = useForm<CreateBountyFormValues>({
        initialValues: {
            name: "",
            description: "",
        },
        validate: {
            name: isNotEmpty("A name is required"),
            description: isNotEmpty("A description is required"),
            deadline: isNotEmpty("A deadline is required"),
            codeZipPath: isNotEmpty("A code path is required"),
        },
    });

    const bounty: CreateAppBounty = {
        ...form.values,
        deadline: (form.values.deadline ?? new Date()).getTime() / 1000,
    };

    const config = usePrepareCreateBounty(bounty);

    const { data, write } = useInputBoxAddInput(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <form onSubmit={form.onSubmit(() => write && write())}>
            <Stack w={800}>
                <Title>Create bounty</Title>
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Name"
                    placeholder="Hello World 1.0.0"
                    {...form.getInputProps("name")}
                />
                <Textarea
                    withAsterisk
                    size="lg"
                    label="Description"
                    placeholder="Describe the application, exploit format, assertion script, etc"
                    {...form.getInputProps("description")}
                />
                <TextInput
                    size="lg"
                    label="Image URL"
                    placeholder="https://"
                    {...form.getInputProps("imgLink")}
                />
                <DateInput
                    withAsterisk
                    size="lg"
                    label="Deadline"
                    minDate={minDeadline}
                    {...form.getInputProps("deadline")}
                />
                <Tabs defaultValue="path">
                    <Tabs.List>
                        <Tabs.Tab value="path">Built-in</Tabs.Tab>
                        <Tabs.Tab value="file">Upload</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="file">
                        <Text m="md">
                            Due to base layer constraints, only built-in
                            bounties are well supported.
                            <br />
                            If you would like to have your bounty available on
                            Bug Buster, please send us a message on our{" "}
                            <Anchor href={DISCORD_CHANNEL_URL}>
                                Discord channel
                            </Anchor>{" "}
                            or to our{" "}
                            <Anchor href={X_ACCOUNT_URL} underline="never">
                                X account
                            </Anchor>
                            .
                        </Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="path">
                        <TextInput
                            size="lg"
                            placeholder="/bounties/some-built-in-bounty.tar.xz"
                            {...form.getInputProps("codeZipPath")}
                        />
                    </Tabs.Panel>
                </Tabs>
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

const CreateBountyPage: FC = () => {
    const theme = useMantineTheme();
    return (
        <Center>
            <Box p={20} mt={50} bg={theme.colors.dark[7]}>
                <CreateBountyForm />
            </Box>
        </Center>
    );
};

export default CreateBountyPage;
