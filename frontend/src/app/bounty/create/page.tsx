"use client";
import { FC, useState, useEffect } from "react";

import {
    Box,
    Button,
    Stack,
    Title,
    TextInput,
    Textarea,
    useMantineTheme,
    Tabs,
    Text,
    Code,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { isNotEmpty, useForm } from "@mantine/form";
import { isAddress, zeroAddress } from "viem";

import { useInputBoxAddInput } from "../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";
import { CreateAppBounty } from "../../../model/inputs";
import { usePrepareCreateBounty } from "../../../hooks/bug-buster";
import { useBlockTimestamp } from "../../../hooks/block";
import { transactionStatus } from "../../../utils/transactionStatus";
import { readFile } from "fs";
import { FileDrop } from "../../../components/filedrop";
import { validate } from "graphql";

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

interface CreateBountyFormValues {
    name?: string;
    description?: string;
    imgLink?: string;
    deadline?: Date;
    codeZipBinary?: string;
    codeZipPath?: string;
    token?: string;
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

    function isBountyBundleEmpty(bundle: string | undefined) {
        return bundle === undefined || bundle.length === 0;
    }

    function validateBountyBundle(
        zipBinary: string | undefined,
        codeZipPath: string | undefined,
    ) {
        if (
            isBountyBundleEmpty(zipBinary) &&
            isBountyBundleEmpty(codeZipPath)
        ) {
            return "A bundle path or binary is required";
        } else if (
            !isBountyBundleEmpty(zipBinary) &&
            !isBountyBundleEmpty(codeZipPath)
        ) {
            return "Cannot set a bundle path and a bundle binary";
        } else {
            return null;
        }
    }

    const form = useForm({
        initialValues: {} as CreateBountyFormValues,
        transformValues: (values) => {
            const { deadline, token } = values;
            return {
                ...values,
                token:
                    token !== undefined && isAddress(token) ? token : undefined,
                deadline:
                    deadline !== undefined
                        ? deadline.getTime() / 1000
                        : undefined,
            };
        },
        validateInputOnChange: true,
        validateInputOnBlur: true,
        validate: {
            name: isNotEmpty("A name is required"),
            description: isNotEmpty("A description is required"),
            deadline: isNotEmpty("A deadline is required"),
            codeZipBinary: (value, values) => {
                return validateBountyBundle(value, values.codeZipPath);
            },
            codeZipPath: (value, values) => {
                return validateBountyBundle(values.codeZipBinary, value);
            },
            token: (token) => {
                if (token === undefined) {
                    return "A token address is required";
                } else {
                    if (isAddress(token)) {
                        return null;
                    } else {
                        return "Invalid token address";
                    }
                }
            },
        },
    });

    const { name, description, deadline, token } = form.getTransformedValues();

    const [filename, setFilename] = useState<string | undefined>();
    const readFile = (f: FileWithPath | null) => {
        if (f) {
            f.arrayBuffer().then((buf) => {
                const codeZipBinary = btoa(
                    Array.from(new Uint8Array(buf))
                        .map((b) => String.fromCharCode(b))
                        .join(""),
                );
                form.setFieldValue("codeZipBinary", codeZipBinary);
                setFilename(f.name);
            });
        }
    };

    const bounty: CreateAppBounty = {
        ...form.values,
        name: name ?? "",
        description: description ?? "",
        deadline: deadline ?? 0,
        token: token ?? zeroAddress,
    };

    const addInputPrepare = usePrepareCreateBounty(bounty);

    const addInputWrite = useInputBoxAddInput(addInputPrepare.config);

    const addInputWait = useWaitForTransaction({
        hash: addInputWrite.data?.hash,
    });

    const { disabled: addInputDisabled, loading: addInputLoading } =
        transactionStatus(addInputPrepare, addInputWrite, addInputWait);

    return (
        <form>
            <Stack
                px={{ base: "xs", md: "lg" }}
                pt="xl"
                style={{
                    maxWidth: 800,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <Title>Create bounty</Title>
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Name"
                    description="If applicable, add the version"
                    placeholder="Hello World 1.0.0"
                    {...form.getInputProps("name")}
                />
                <Textarea
                    withAsterisk
                    size="lg"
                    label="Description"
                    description="Describe the application, exploit format, assertion script, etc"
                    {...form.getInputProps("description")}
                />
                <TextInput
                    size="lg"
                    label="Image URL"
                    description="An image that visually represents your application (optional)"
                    placeholder="https://"
                    {...form.getInputProps("imgLink")}
                />
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Token address"
                    description="Your bounty will be sponsored with this ERC-20 token"
                    placeholder="0x"
                    {...form.getInputProps("token")}
                />
                <DateInput
                    withAsterisk
                    size="lg"
                    label="Deadline"
                    description="Past this date, if no exploit has been found, sponsors will be able to request a refund"
                    minDate={minDeadline}
                    {...form.getInputProps("deadline")}
                />

                <Tabs defaultValue="file">
                    <Tabs.List>
                        <Tabs.Tab value="file">Upload</Tabs.Tab>
                        <Tabs.Tab value="path">Built-in</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="file">
                        <FileDrop
                            onDrop={(files) => readFile(files[0])}
                            accept={{
                                "application/octet-stream": [".tar.xz"],
                            }}
                        >
                            <FileDropText filename={filename} />
                        </FileDrop>
                        {form.errors.codeZipBinary && (
                            <Text size="sm" c="red">
                                {form.errors.codeZipBinary}
                            </Text>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="path">
                        <TextInput
                            size="lg"
                            label="Bundle path"
                            placeholder="/path/to/bundle.tar.xz"
                            description="Path to the bounty bundle in the machine filesystem"
                            {...form.getInputProps("codeZipPath")}
                        />
                    </Tabs.Panel>
                </Tabs>
                <Button
                    size="lg"
                    disabled={
                        addInputDisabled ||
                        !form.isValid() ||
                        addInputWait.isSuccess
                    }
                    loading={addInputLoading}
                    fullWidth
                    onClick={() => addInputWrite.write && addInputWrite.write()}
                >
                    Create
                </Button>
            </Stack>
        </form>
    );
};

const CreateBountyPage: FC = () => {
    const theme = useMantineTheme();
    return <CreateBountyForm />;
};

export default CreateBountyPage;
