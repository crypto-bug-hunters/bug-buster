"use client";
import { FC, useState, useRef, useEffect } from "react";

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
    Paper,
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
import { usePrepareCreateBounty } from "../../../hooks/bugless";

const CreateBountyPage: FC = () => {
    const theme = useMantineTheme();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imgLink, setImgLink] = useState("");
    const [dropText, setDropText] = useState("No .tar.xz file attached yet");

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
                setDropText(f.name);
            });
        }
    };

    const bounty = {
        Name: name,
        Description: description,
        ImgLink: imgLink,
        Deadline: deadline ? deadline.getTime() / 1000 : null,
        CodeZipBinary: appFile,
    } as CreateBounty;

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
                        onChange={(e) => setDeadline(e)}
                    />

                    <Paper withBorder shadow="sm" radius="sm">
                        <Dropzone
                            onDrop={(files) => readFile(files[0])}
                            onReject={(files) =>
                                console.log("rejected files", files)
                            }
                            accept={["application/x-xz"]}
                        >
                            <Group
                                justify="left"
                                gap="xl"
                                ml={20}
                                mih={120}
                                style={{ pointerEvents: "none" }}
                            >
                                <Dropzone.Accept>
                                    <TbUpload size={60} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <TbExclamationCircle size={60} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <TbUpload size={60} />
                                </Dropzone.Idle>
                                <div>
                                    <Text size="xl" inline>
                                        Drop your bounty .tar.xz bundle here
                                    </Text>
                                    <Text
                                        size="md"
                                        fw={700}
                                        c="dimmed"
                                        inline
                                        mt={7}
                                    >
                                        {dropText}
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                    </Paper>

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
