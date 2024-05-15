"use client";
import { FC, useState, useEffect } from "react";

import {
    Box,
    Button,
    Center,
    Code,
    Group,
    Stack,
    Tabs,
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
import { usePrepareCreateBounty } from "../../../hooks/bug-buster";
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

    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [imgLink, setImgLink] = useState<string>();
    const [filename, setFilename] = useState<string>();
    const [minDeadline, setMinDeadline] = useState<Date>();
    const [deadline, setDeadline] = useState<Date>();
    const [codeZipBinary, setCodeZipBinary] = useState<string>();
    const [codeZipPath, setCodeZipPath] = useState<string>();

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

    const readFile = (fileWithPath: FileWithPath) => {
        // prettier-ignore
        fileWithPath
            .arrayBuffer()
            .then((buf) => {
                // prettier-ignore
                const str = Array.from(new Uint8Array(buf))
                    .map((b) => String.fromCharCode(b))
                    .join("");

                setCodeZipBinary(btoa(str));
                setFilename(fileWithPath.name);
            });
    };

    const bounty: CreateAppBounty = {
        name: name ?? "",
        description: description ?? "",
        imgLink,
        deadline: (deadline ?? new Date()).getTime() / 1000,
        codeZipBinary,
        codeZipPath,
    };

    const config = usePrepareCreateBounty(bounty);

    const { data, write } = useInputBoxAddInput(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

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
                        onChange={(e) => {
                            if (e !== null) {
                                setDeadline(e);
                            }
                        }}
                    />

                    <Tabs defaultValue="file">
                        <Tabs.List>
                            <Tabs.Tab value="file">Upload</Tabs.Tab>
                            <Tabs.Tab value="path">Built-in</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="file">
                            <FileDrop
                                onDrop={(files) => {
                                    const file = files.at(0);
                                    if (file !== undefined) {
                                        readFile(file);
                                    }
                                }}
                                accept={{
                                    "application/octet-stream": [".tar.xz"],
                                }}
                            >
                                <FileDropText filename={filename} />
                            </FileDrop>
                        </Tabs.Panel>

                        <Tabs.Panel value="path">
                            <TextInput
                                size="lg"
                                value={codeZipPath}
                                placeholder="/bounties/some-built-in-bounty.tar.xz"
                                onChange={(e) => setCodeZipPath(e.target.value)}
                            />
                        </Tabs.Panel>
                    </Tabs>

                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            type="submit"
                            onClick={() => write && write()}
                            disabled={
                                !write ||
                                isLoading ||
                                (!codeZipBinary && !codeZipPath) ||
                                !deadline ||
                                !name ||
                                name.trim().length === 0 ||
                                !description ||
                                description.trim().length === 0
                            }
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
