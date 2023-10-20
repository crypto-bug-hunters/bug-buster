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
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    // App name
    const [name, setName] = useState("");

    // Description
    const [description, setDescription] = useState("");

    // ImgLink
    const [imgLink, setImgLink] = useState("");

    //Deadline
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

    const { data, isLoading, isSuccess, write } = useInputBoxAddInput(config);
    const wait = useWaitForTransaction(data);

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

                    <Group mt={20} justify="center" w="100%">
                        <Dropzone
                            onDrop={(files) => readFile(files[0])}
                            onReject={(files) =>
                                console.log("rejected files", files)
                            }
                            accept={["application/zip", "application/x-xz"]}
                        >
                            <Paper withBorder shadow="sm" radius="lg">
                                <Group
                                    justify="center"
                                    gap="xl"
                                    p="xl"
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
                                    <Stack>
                                        <Text size="xl" inline>
                                            Drop your bundle here
                                        </Text>
                                        <Text size="sm" c="dimmed" inline>
                                            Only <Code>.zip</Code> and{" "}
                                            <Code>.tar.xz</Code> files are
                                            accepted
                                        </Text>
                                    </Stack>
                                </Group>
                            </Paper>
                        </Dropzone>
                    </Group>

                    <Group justify="center" mt="md">
                        <Button
                            size="lg"
                            type="submit"
                            disabled={
                                !write ||
                                !appFile ||
                                !deadline ||
                                name.trim().length === 0 ||
                                description.trim().length === 0
                            }
                            onClick={submit}
                        >
                            {"Create Bounty"}
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Center>
    );
};

export default CreateBountyPage;
