"use client";
import { FC, useState, useRef, useEffect } from "react";

import {
    Box,
    Button,
    Center,
    Group,
    Stack,
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
import usePrepareCreateBounty from "../../../hooks/bugless";

const CreateBounty: FC = () => {
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
        <Center
        // style={{
        //     backgroundImage: 'url("/img/banner.jpg")',
        //     backgroundRepeat: "no-repeat",
        //     backgroundPosition: "center",
        //     backgroundAttachment: "fixed",
        // }}
        >
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
                    <Textarea
                        withAsterisk
                        size="lg"
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        description="Description"
                    />
                    <TextInput
                        size="lg"
                        label="Image Link"
                        value={imgLink}
                        onChange={(e) => setImgLink(e.target.value)}
                        description="App Image Link"
                    />

                    <DateInput
                        withAsterisk
                        size="lg"
                        label="Deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e)}
                        description="Deadline"
                    />

                    <Group justify="space-between" w="100%">
                        <Dropzone
                            onDrop={(files) => readFile(files[0])}
                            onReject={(files) =>
                                console.log("rejected files", files)
                            }
                            //maxSize={3 * 1024 ** 2}
                        >
                            <Group
                                justify="center"
                                gap="xl"
                                mih={220}
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
                                        Drag App compressed bundle here or click
                                        to select file
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        Attach a single .zip or tar.xz of the
                                        App
                                    </Text>
                                </div>
                            </Group>
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

export default CreateBounty;
