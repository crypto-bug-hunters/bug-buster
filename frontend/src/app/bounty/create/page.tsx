"use client";
import { FC, useState, useEffect } from "react";

import {
    Box,
    Button,
    Center,
    Code,
    Group,
    Stack,
    Title,
    TextInput,
    Textarea,
    useMantineTheme,
    Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";

import { useInputBoxAddInput } from "../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";
import { CreateAppBounty } from "../../../model/inputs";
import { usePrepareCreateBounty } from "../../../hooks/bugless";
import { FileDrop } from "../../../components/filedrop";
import { useBlockTimestamp } from "../../../hooks/block";

interface FileDropTextParams {
    filename?: string;
}

const FileDropText: FC<FileDropTextParams> = ({ filename }) => {
    if (filename) {
        return (
            <Box>
                <Text size="lg">Bundle uploaded!</Text>
                <Code>{filename}</Code>
            </Box>
        );
    } else {
        return (
            <Box>
                <Text size="lg">Drop your bounty bundle here!</Text>
                <Code>*.tar.xz</Code>
            </Box>
        );
    }
};

const CreateBountyPage: FC = () => {
    const theme = useMantineTheme();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imgLink, setImgLink] = useState("");
    const [filename, setFilename] = useState<string | undefined>();

    const [minDeadline, setMinDeadline] = useState<Date>();
    const blockTimestamp = useBlockTimestamp();
    useEffect(() => {
        if (blockTimestamp === undefined) {
            setMinDeadline(undefined);
        } else {
            const blockDate = new Date(Number(blockTimestamp) * 1000);
            blockDate.setDate(blockDate.getDate() + 1);
            setMinDeadline(blockDate);
        }
    }, [blockTimestamp]);
    const [deadline, setDeadline] = useState<Date | null>(null);

    const [appFile, setAppFile] = useState<string | null>(null);

    const readFile = (f: FileWithPath | null) => {
        if (f) {
            f.arrayBuffer().then((buf) => {
                //setAppFile(bytesToHex(new Uint8Array(buf)));
                setAppFile(
                    btoa(
                        Array.from(new Uint8Array(buf))
                            .map((b) => String.fromCharCode(b))
                            .join(""),
                    ),
                );
                setFilename(f.name);
            });
        }
    };

    const bounty = {
        name,
        description,
        imgLink,
        deadline: deadline ? deadline.getTime() / 1000 : null,
        codeZipBinary: appFile,
    } as CreateAppBounty;

    const config = usePrepareCreateBounty(bounty);

    const { data, write } = useInputBoxAddInput(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    function submit() {
        if (write) write();
    }

    return (
        <Center>
            <Box p={20} mt={50} bg={theme.colors.dark[7]}>
                <Stack w={600}>
                    <Title>Submit a bounty</Title>
                    <TextInput
                        withAsterisk
                        size="lg"
                        label="Title"
                        value={name}
                        placeholder="Hello World 1.0.0"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Textarea
                        withAsterisk
                        size="lg"
                        label="Description"
                        value={description}
                        placeholder="Describe your application in a few words"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextInput
                        size="lg"
                        label="Image URL"
                        value={imgLink}
                        placeholder="https://"
                        onChange={(e) => setImgLink(e.target.value)}
                    />

                    <DateInput
                        withAsterisk
                        size="lg"
                        label="Deadline"
                        value={deadline}
                        minDate={minDeadline}
                        onChange={(e) => setDeadline(e)}
                    />

                    <FileDrop
                        onDrop={(files) => readFile(files[0])}
                        accept={{ "application/octet-stream": [".tar.xz"] }}
                    >
                        <FileDropText filename={filename} />
                    </FileDrop>

                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            type="submit"
                            disabled={
                                !write ||
                                isLoading ||
                                !appFile ||
                                !deadline ||
                                name.trim().length === 0 ||
                                description.trim().length === 0
                            }
                            onClick={submit}
                        >
                            {isLoading ? "Creating Bounty..." : "Create Bounty"}
                        </Button>
                    </Group>

                    {isSuccess && (
                        <>
                            <Group justify="center">
                                <Text size="lg">
                                    Bounty transaction successful!
                                </Text>
                            </Group>
                        </>
                    )}
                </Stack>
            </Box>
        </Center>
    );
};

export default CreateBountyPage;
